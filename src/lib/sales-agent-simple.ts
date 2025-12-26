/**
 * SalesAgentSimple - Agente de ventas inteligente h├¡brido
 * 
 * ­ƒºá NUEVO: Usa AI Interpreter para entender el contexto COMPLETO
 * del mensaje antes de actuar. Ya no depende de regex r├¡gidos.
 * 
 * FLUJO:
 * 1. Cliente env├¡a mensaje
 * 2. AI Interpreter analiza: intenci├│n, producto, acci├│n
 * 3. Bot ejecuta la acci├│n con datos precisos
 * 
 * NO rebota al men├║ - siempre intenta resolver
 * NO INVENTA - usa solo informaci├│n real de la BD
 */

import { db } from './db'
import Groq from 'groq-sdk'
import { interpretMessage, InterpretedMessage, IntentType } from './ai-interpreter'
import { analyzeWithAI, AIDecision } from './ai-intent-analyzer'
// Importar sistema multi-servicio (opcional)
import { UnifiedResponseService, ResponseResult } from './unified-response-service'
import { BusinessContextDetector } from './business-context-detector'

// Cliente Groq para an├ílisis profundo
let groqClient: Groq | null = null
function getGroqClient(): Groq | null {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return groqClient
}

// ============================================
// ÔÅ│ SIMULACI├ôN DE ESCRITURA (TYPING)
// ============================================

/**
 * Calcula el tiempo de "escribiendo" basado en la longitud del mensaje
 * M├¡nimo 1 segundo, m├íximo 3 segundos
 */
export function calculateTypingDelay(responseLength: number): number {
  const baseDelay = 1000 // 1 segundo m├¡nimo
  const charDelay = 10 // 10ms por caracter
  const calculated = baseDelay + Math.min(responseLength * charDelay, 2000)
  return Math.min(calculated, 3000) // M├íximo 3 segundos
}

/**
 * Espera simulando que el bot est├í escribiendo
 */
export async function simulateTyping(delayMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, delayMs))
}

// ============================================
// ­ƒñû SISTEMA H├ìBRIDO: OLLAMA + GROQ
// ============================================

/**
 * Consulta a Ollama (local, r├ípido) - Primera opci├│n
 * @param prompt - Mensaje del usuario
 * @param context - Contexto de la conversaci├│n
 * @returns Respuesta de Ollama o null si falla
 */
async function askOllama(prompt: string, context: string = ''): Promise<string | null> {
  try {
    // Usar OLLAMA_BASE_URL (Easypanel) o OLLAMA_URL (local) como fallback
    const ollamaUrl = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_URL || 'http://localhost:11434'
    const model = process.env.OLLAMA_MODEL || 'gemma2:2b'
    
    console.log(`­ƒªÖ Consultando Ollama (${model})...`)
    
    const systemPrompt = `Eres un agente de ventas profesional de Tecnovariedades D&S en Colombia.

REGLAS CR├ìTICAS - OBLIGATORIAS:
1. ÔØî NUNCA inventes informaci├│n, precios o caracter├¡sticas
2. Ô£à USA SOLO la informaci├│n proporcionada en el contexto
3. Ô£à Si no tienes la informaci├│n, di "d├®jame verificar"
4. Ô£à Responde en espa├▒ol, natural y amigable
5. Ô£à Gu├¡a sutilmente hacia la venta sin ser agresivo

ENTREGA:
- DIGITALES: Env├¡o por Google Drive despu├®s del pago
- F├ìSICOS: Recoger en tienda (Cali) o Contraentrega
${context ? `\nINFORMACI├ôN DISPONIBLE:\n${context}` : ''}`

    // Timeout de 10 segundos para Ollama
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `${systemPrompt}\n\nCliente: ${prompt}\n\nAsistente:`,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 300
        }
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.log(`ÔÜá´©Å Ollama no disponible: ${response.status}`)
      return null
    }

    const data = await response.json()
    const answer = data.response?.trim()
    
    if (answer && answer.length > 10) {
      console.log(`Ô£à Ollama respondi├│: ${answer.substring(0, 50)}...`)
      return answer
    }
    
    return null
  } catch (error: any) {
    console.log(`ÔÜá´©Å Error Ollama: ${error.message}`)
    return null
  }
}

/**
 * Consulta a Groq (an├ílisis profundo) - Segunda opci├│n
 * @param prompt - Mensaje del usuario
 * @param context - Contexto de la conversaci├│n
 * @param products - Lista de productos disponibles
 * @returns Respuesta de Groq o null si falla
 */
async function askGroq(prompt: string, context: string = '', products: any[] = []): Promise<string | null> {
  try {
    const client = getGroqClient()
    if (!client) {
      console.log('ÔÜá´©Å Groq no configurado')
      return null
    }

    console.log('­ƒºá Consultando Groq (Agente de Ventas Profesional)...')

    // Crear cat├ílogo organizado por categor├¡as
    const digitales = products.filter(p => p.category === 'DIGITAL' || p.name.toLowerCase().includes('mega') || p.name.toLowerCase().includes('curso'))
    const fisicos = products.filter(p => p.category !== 'DIGITAL' && !p.name.toLowerCase().includes('mega') && !p.name.toLowerCase().includes('curso'))
    
    const formatProduct = (p: any) => {
      let info = `ÔÇó ${p.name} - ${p.price?.toLocaleString('es-CO') || '?'} COP`
      if (p.paymentLinkMercadoPago) info += `\n  - MercadoPago: ${p.paymentLinkMercadoPago}`
      if (p.paymentLinkPayPal) info += `\n  - PayPal: ${p.paymentLinkPayPal}`
      if (p.paymentLinkCustom) info += `\n  - Link: ${p.paymentLinkCustom}`
      return info
    }
    
    const catalogoDigital = digitales.map(formatProduct).join('\n')
    const catalogoFisico = fisicos.map(formatProduct).join('\n')

    const systemPrompt = `Eres un AGENTE DE VENTAS PROFESIONAL de Tecnovariedades D&S (Colombia).

­ƒÄ» TU PERSONALIDAD:
- Amigable, cercano y natural (como hablar con un amigo que sabe de tecnolog├¡a)
- Paciente y comprensivo (el cliente puede escribir mal o no saber qu├® busca)
- Persuasivo pero NO agresivo (gu├¡as hacia la venta sin presionar)
- Resolutivo (siempre das una respuesta ├║til, nunca dejas al cliente sin ayuda)

­ƒºá TUS CAPACIDADES:
1. ENTENDER: Comprende lo que el cliente quiere aunque escriba mal, use jerga o sea ambiguo
2. RAZONAR: Analiza qu├® producto le conviene seg├║n lo que dice
3. DIALOGAR: Mant├®n conversaciones naturales, haz preguntas para entender mejor
4. RESOLVER: Responde dudas sobre productos, pagos, entregas, garant├¡as
5. VENDER: Gu├¡a sutilmente hacia la compra destacando beneficios

­ƒôª CAT├üLOGO COMPLETO - PRODUCTOS DIGITALES (${digitales.length}):
${catalogoDigital || 'Sin productos digitales'}

­ƒôª CAT├üLOGO COMPLETO - PRODUCTOS F├ìSICOS (${fisicos.length}):
${catalogoFisico || 'Sin productos f├¡sicos'}

­ƒÆ│ M├ëTODOS DE PAGO:
- Nequi: 3136174267
- Daviplata: 3136174267  
- MercadoPago (tarjeta/PSE)
- PayPal (internacional)

­ƒô¼ ENTREGA:
- DIGITALES: Inmediata por Google Drive despu├®s del pago
- F├ìSICOS: Contraentrega a toda Colombia o recoger en Cali

­ƒÜ¿­ƒÜ¿­ƒÜ¿ REGLAS CR├ìTICAS - OBLIGATORIAS ­ƒÜ¿­ƒÜ¿­ƒÜ¿:
1. ÔØî PROHIBIDO INVENTAR: NO menciones productos que NO est├®n en el cat├ílogo de arriba
2. ÔØî NO INVENTES MARCAS: Si no ves "Dell XPS", "Acer Aspire", "HP Pavilion" en el cat├ílogo, NO los menciones
3. ÔØî NO INVENTES PRECIOS: Solo usa precios que aparezcan en el cat├ílogo
4. Ô£à SOLO CAT├üLOGO: Cuando el cliente pida "m├ís referencias" o "otros modelos", lista SOLO productos del cat├ílogo
5. Ô£à USA NOMBRES EXACTOS: Copia el nombre del producto tal cual aparece en el cat├ílogo
6. Ô£à Si el cliente pide algo que no existe, di "actualmente tenemos estos modelos:" y lista los del cat├ílogo
7. Ô£à Responde en espa├▒ol colombiano natural
8. Ô£à Usa emojis con moderaci├│n (1-3 por mensaje)
9. Ô£à Mant├®n respuestas concisas (m├íximo 5 l├¡neas)

­ƒÄ» ESTRATEGIA DE VENTA (AIDA):
- Atenci├│n: Capta el inter├®s con el beneficio principal
- Inter├®s: Explica qu├® incluye y por qu├® es valioso
- Deseo: Destaca el ahorro o la oportunidad ├║nica
- Acci├│n: Invita a comprar de forma natural ("┬┐Te lo aparto?", "┬┐Quieres los datos de pago?")

${context ? `\n­ƒÆ¼ CONVERSACI├ôN PREVIA:\n${context}` : ''}`

    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3, // M├ís bajo para evitar que invente
      max_tokens: 400
    })

    const answer = completion.choices[0]?.message?.content?.trim()
    
    if (answer && answer.length > 10) {
      console.log(`Ô£à Groq respondi├│: ${answer.substring(0, 50)}...`)
      return answer
    }

    return null
  } catch (error: any) {
    console.log(`ÔÜá´©Å Error Groq: ${error.message}`)
    return null
  }
}

/**
 * ­ƒºá B├ÜSQUEDA INTELIGENTE CON IA
 * Cuando la b├║squeda local falla, usa IA para:
 * 1. Entender la intenci├│n del usuario (aunque escriba mal)
 * 2. Buscar el producto m├ís relevante en el cat├ílogo
 * 3. Responder con informaci├│n REAL de la BD
 */
async function searchProductWithAI(
  query: string,
  products: any[]
): Promise<{ product: any | null; response: string | null }> {
  try {
    const client = getGroqClient()
    if (!client || products.length === 0) {
      return { product: null, response: null }
    }

    console.log(`­ƒºá B├║squeda inteligente IA para: "${query}"`)

    // Crear lista de productos para que la IA busque
    const productList = products.map((p, i) => {
      const precio = p.price?.toLocaleString('es-CO') || '?'
      return `${i + 1}. ${p.name} - ${precio} COP`
    }).join('\n')

    const systemPrompt = `Eres un buscador de productos inteligente para una tienda colombiana.

TAREA: Analiza lo que el cliente busca y encuentra el producto m├ís relevante del cat├ílogo.

CAT├üLOGO (${products.length} productos):
${productList}

INSTRUCCIONES CR├ìTICAS:
1. Entiende la INTENCI├ôN del cliente aunque escriba mal (typos, errores ortogr├íficos)
2. Busca coincidencias por: nombre, tema, categor├¡a, palabras clave
3. Si encuentras un producto relevante, responde SOLO con el n├║mero
4. Si no hay coincidencia clara, responde "0"

CORRECCIONES DE TYPOS COMUNES:
- "megapak", "megapack", "mega pak" ÔåÆ buscar "Mega Pack"
- "goldem", "golder", "goldenn" ÔåÆ buscar "Golden"
- "pino", "pian" ÔåÆ buscar "Piano"
- "exel", "exsel", "ecxel" ÔåÆ buscar "Excel"
- "ingles", "ingl├®s", "englis" ÔåÆ buscar "Ingl├®s"
- "tradign", "tradin", "traiding" ÔåÆ buscar "Trading"
- "dise├▒o", "diseno", "disenio" ÔåÆ buscar "Dise├▒o"
- "programasion", "programacion" ÔåÆ buscar "Programaci├│n" o "Hacking"

EJEMPLOS DE B├ÜSQUEDA:
- "megapak goldem" ÔåÆ buscar producto con "Golden" en el nombre
- "curso de pino" ÔåÆ buscar producto con "Piano" en el nombre
- "quiero aprender ingles" ÔåÆ buscar producto con "Ingl├®s" en el nombre
- "algo de dise├▒o grafico" ÔåÆ buscar producto con "Dise├▒o" en el nombre
- "tradign forex" ÔåÆ buscar producto con "Trading" en el nombre
- "exel avanzado" ÔåÆ buscar producto con "Excel" en el nombre
- "resina epoxica" ÔåÆ buscar producto con "Resina" en el nombre

INTENCIONES AMBIGUAS - Sugiere el producto m├ís relevante:
- "quiero ganar dinero" ÔåÆ Trading o Marketing
- "necesito para mi negocio" ÔåÆ Marketing, Excel o Dise├▒o
- "algo para aprender m├║sica" ÔåÆ Piano
- "mejorar mi trabajo" ÔåÆ Excel o Office
- "emprender" ÔåÆ Marketing o Trading
- "trabajar desde casa" ÔåÆ Dise├▒o, Marketing o Excel

Responde SOLO con el n├║mero del producto (1, 2, 3...) o "0" si no hay coincidencia.`

    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Cliente busca: "${query}"` }
      ],
      temperature: 0.1, // M├ís determin├¡stico para b├║squedas
      max_tokens: 10
    })

    const answer = completion.choices[0]?.message?.content?.trim() || '0'
    const productIndex = parseInt(answer) - 1

    if (productIndex >= 0 && productIndex < products.length) {
      const foundProduct = products[productIndex]
      console.log(`Ô£à IA encontr├│: ${foundProduct.name}`)
      return { product: foundProduct, response: null }
    }

    console.log(`ÔØî IA no encontr├│ producto espec├¡fico`)
    return { product: null, response: null }
  } catch (error: any) {
    console.log(`ÔÜá´©Å Error en b├║squeda IA: ${error.message}`)
    return { product: null, response: null }
  }
}

/**
 * Sistema h├¡brido: Ollama primero, Groq si falla
 * NUNCA rebota al men├║ - siempre intenta resolver
 */
async function getHybridResponse(
  message: string, 
  context: string = '', 
  products: any[] = []
): Promise<string> {
  // 1. Intentar con Ollama (local, r├ípido)
  const ollamaResponse = await askOllama(message, context)
  if (ollamaResponse) {
    return ollamaResponse
  }

  // 2. Si Ollama falla, usar Groq (an├ílisis profundo)
  const groqResponse = await askGroq(message, context, products)
  if (groqResponse) {
    return groqResponse
  }

  // 3. Fallback inteligente (nunca men├║ gen├®rico)
  return `┬íClaro! ­ƒÿè Cu├®ntame m├ís sobre lo que buscas y te ayudo a encontrar la mejor opci├│n.

┬┐Es para uso personal, trabajo o estudio? As├¡ te puedo recomendar algo que se ajuste a tus necesidades ­ƒÄ»`
}

interface ConversationContext {
  lastProduct: any | null
  lastOptions: any[]
  stage: string
  history: { role: string; content: string }[]
}

interface ProcessedResponse {
  text: string
  intent: string
  salesStage: string
  sendPhotos: boolean
  photos: string[] | null
  photoCaption?: string
  product?: any
}

export class SalesAgentSimple {
  private conversations: Map<string, ConversationContext> = new Map()
  private products: any[] = []
  private userId: string | null = null
  private groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

  constructor(userId?: string) {
    if (userId) {
      this.userId = userId
      this.loadProducts()
    }
  }

  // Carga productos del usuario actual (multi-tenant)
  // Si no hay userId, carga todos los productos disponibles
  async loadProducts() {
    try {
      if (this.userId) {
        console.log(`­ƒôª Cargando productos para usuario: ${this.userId}`)
        this.products = await db.product.findMany({
          where: { userId: this.userId, status: 'AVAILABLE' }
        })
      } else {
        console.log('­ƒôª Cargando todos los productos disponibles (sin filtro de usuario)')
        this.products = await db.product.findMany({
          where: { status: 'AVAILABLE' }
        })
      }
      console.log(`Ô£à ${this.products.length} productos cargados`)
    } catch (error) {
      console.error('ÔØî Error cargando productos:', error)
    }
  }

  async reloadProducts() {
    await this.loadProducts()
  }

  /**
   // ELIMINADO: setUserId ya no es necesario con el constructor multi-tenant

  /**
   * ­ƒÄ¡ HUMANIZACI\u00d3N: Tono emocional basado en etapa de conversaci\u00f3n
   */
  private getEmotionalTone(stage: string): {
    greeting: string
    enthusiasm: string
    closing: string
  } {
    const tones = {
      greeting: {
        awareness: ['┬íHey!', '\u00a1Qu\u00e9 tal!', '\u00a1Hola!', '\u00a1Buenas!'],
        interest: ['Me encanta que preguntes', 'Qu\u00e9 bueno que te interesa', 'Excelente pregunta', 'Me alegra que preguntes'],
        consideration: ['Perfecto', 'Genial', 'S\u00faper', 'Buen├¡simo'],
        action: ['\u00a1Vamos a ello!', '\u00a1Hag\u00e1moslo!', '\u00a1Dale!', '\u00a1Listo!']
      },
      enthusiasm: {
        high: ['\u00a1Me encanta! \ud83e\udd29', '\u00a1Buen\u00edsimo! \u2728', '\u00a1Qu\u00e9 emoci\u00f3n! \ud83c\udf89'],
        medium: ['Me parece genial \ud83d\ude0a', 'Excelente elecci\u00f3n \ud83d\udc4c', 'Muy bien \ud83d\udc4d'],
        low: ['Entiendo perfectamente', 'Claro', 'Por supuesto']
      },
      empathy: {
        objection: ['Te entiendo completamente', 'S\u00e9 exactamente c\u00f3mo te sientes', 'Es totalmente v\u00e1lido'],
        doubt: ['Es normal tener dudas', 'Muchos clientes se preguntan lo mismo', 'Te comprendo'],
        price: ['Entiendo tu preocupaci\u00f3n', 'Lo s\u00e9, es una inversi\u00f3n', 'Te entiendo perfectamente']
      }
    }
    
    // Selecci\u00f3n aleatoria para evitar repetici\u00f3n
    const greetingOptions = tones.greeting[stage as keyof typeof tones.greeting] || tones.greeting.awareness
    const randomGreeting = greetingOptions[Math.floor(Math.random() * greetingOptions.length)]
    const randomEnthusiasm = tones.enthusiasm.medium[Math.floor(Math.random() * tones.enthusiasm.medium.length)]
    
    return {
      greeting: randomGreeting,
      enthusiasm: randomEnthusiasm,
      closing: '\ud83d\ude0a'
    }
  }

  /**
   * \ud83d\udcac HUMANIZACI\u00d3N: Frases conversacionales para flujo natural
   */
  private getConversationalFiller(type: 'transition' | 'thinking' | 'confirmation'): string {
    const fillers = {
      transition: ['Mira', 'F\u00edjate', 'D\u00e9jame contarte', 'Ok, te cuento', 'Ojo con esto'],
      thinking: ['Hmm', 'Veamos', 'A ver', 'D\u00e9jame ver', 'Espera'],
      confirmation: ['\u00a1Listo!', '\u00a1Perfecto!', '\u00a1Dale!', 'Ok', '\u00a1Genial!']
    }
    
    const options = fillers[type]
    return options[Math.floor(Math.random() * options.length)]
  }

  async processMessage(message: string, userPhone: string, context?: any): Promise<ProcessedResponse> {
    try {
      console.log(`­ƒô¿ Procesando: "${message}"`)

      // Multi-tenant: Si hay contexto con userId, establecerlo
      if (context?.userId && context.userId !== this.userId) {
        this.userId = context.userId
        await this.loadProducts() // Recargar productos del usuario
      }

      // Recargar productos si est├ín vac├¡os
      if (this.products.length === 0) {
        await this.loadProducts()
      }

      if (!this.conversations.has(userPhone)) {
        this.conversations.set(userPhone, {
          lastProduct: null,
          lastOptions: [],
          stage: 'greeting',
          history: []
        })
      }

      const userCtx = this.conversations.get(userPhone)!
      userCtx.history.push({ role: 'user', content: message })

      // ­ƒºá IA RAZONAMIENTO: Analizar intenci├│n y producto con Ollama/Groq
      let aiDecision: AIDecision
      try {
        const productsSafe = this.products || []
        aiDecision = await analyzeWithAI(message, userCtx.history, productsSafe)
        console.log(`­ƒºá IA Decide: ${aiDecision.action} | Raz├│n: ${aiDecision.reasoning}`)
      } catch (aiError) {
        console.error('ÔØî Error cr├¡tico en analyzeWithAI:', aiError)
        // Fallback seguro
        aiDecision = {
          action: 'general_inquiry',
          selectedProductIndex: null,
          reasoning: 'Error interno de IA, fallback a general',
          emotionalTone: 'neutral',
          additionalContext: ''
        }
      }
      
      // Asignar producto si la IA lo identific├│
      if (aiDecision.selectedProductIndex !== null && this.products[aiDecision.selectedProductIndex]) {
        userCtx.lastProduct = this.products[aiDecision.selectedProductIndex]
        console.log(`­ƒÄ» IA identific├│ producto: ${userCtx.lastProduct.name}`)
      }

      // Prioridad absoluta a la intenci├│n detectada por regex/reglas locales
      // Esto evita que la IA divague cuando hay un comando o palabra clave clara
      const regexIntent = this.detectIntent(message)
      let intent = aiDecision.action as any
      
      if (regexIntent !== 'general_inquiry') {
        console.log(`­ƒÄ» Override de intenci├│n: ${aiDecision.action} -> ${regexIntent}`)
        intent = regexIntent
      }

      console.log(`­ƒÄ» Intenci├│n final: ${intent}`)
      console.log(`­ƒôª Producto en contexto: ${userCtx.lastProduct?.name || 'ninguno'}`)

      // Guardar contexto adicional para personalizar templates
      // REMOVIDO: aiPrefix filtrado del output para evitar fugas de razonamiento
      // const aiPrefix = aiDecision.additionalContext ? aiDecision.additionalContext + '\n\n' : ''

      // ­ƒåò RESPUESTA A PREGUNTAS LIBRES/IA (Preguntas espec├¡ficas que no son flujo directo)
      // Si hay producto, ya fue manejado por el bloque contextual arriba
      if (intent === 'answer_question' && !userCtx.lastProduct) {
        const response = await this.generateAIAnswer(message, userCtx.lastProduct, userCtx.history)
        userCtx.history.push({ role: 'assistant', content: response })
        return {
          text: response,
          intent: 'answer_question',
          salesStage: userCtx.stage,
          sendPhotos: false,
          photos: null,
          product: userCtx.lastProduct
        }
      }

      // Si pide m├ís info y NO tiene producto (fallo de contexto o consulta general)
      if (intent === 'more_info' && !userCtx.lastProduct) {
        console.log('Ôä╣´©Å Cliente pide info pero no hay producto en contexto')
        const response = await this.getGenericResponseWithAI(message, userCtx.history)
        userCtx.history.push({ role: 'assistant', content: response })
        return {
          text: response,
          intent: 'more_info',
          salesStage: 'awareness',
          sendPhotos: false,
          photos: null,
          product: null
        }
      }

      // Si selecciona m├®todo de pago y tiene producto
      if (intent === 'payment_method_selected' && userCtx.lastProduct) {
        userCtx.stage = 'closing'
        const response = await this.generatePaymentResponse(userCtx.lastProduct)
        userCtx.history.push({ role: 'assistant', content: response })
        return {
          text: response,
          intent: 'payment_method_selected',
          salesStage: 'closing',
          sendPhotos: false,
          photos: null,
          product: userCtx.lastProduct
        }
      }

      // Si confirma y tiene producto
      if (intent === 'confirmation' && userCtx.lastProduct) {
        userCtx.stage = 'closing'
        const response = await this.generatePaymentResponse(userCtx.lastProduct)
        userCtx.history.push({ role: 'assistant', content: response })
        return {
          text: response,
          intent: 'confirmation',
          salesStage: 'closing',
          sendPhotos: false,
          photos: null,
          product: userCtx.lastProduct
        }
      }

      // ­ƒåò Si pide m├ís opciones/referencias y tiene producto en contexto
      if (intent === 'more_options' && userCtx.lastProduct) {
        console.log(`­ƒôï Cliente pide m├ís opciones de: ${userCtx.lastProduct.name}`)
        // Detectar categor├¡a del producto actual
        const currentProduct = userCtx.lastProduct
        const currentName = currentProduct.name.toLowerCase()
        
        let categoria = ''
        let productosRelacionados: any[] = []
        
        // Detectar tipo de producto y buscar similares
        if (currentName.includes('port├ítil') || currentName.includes('portatil') || currentName.includes('laptop') || currentName.includes('notebook') || currentName.includes('vivobook') || currentName.includes('macbook')) {
          categoria = 'port├ítiles'
          productosRelacionados = this.products.filter(p => {
            const name = p.name.toLowerCase()
            return (name.includes('port├ítil') || name.includes('portatil') || name.includes('laptop') || name.includes('vivobook') || name.includes('macbook')) && p.id !== currentProduct.id
          })
        } else if (currentName.includes('impresora')) {
          categoria = 'impresoras'
          productosRelacionados = this.products.filter(p => p.name.toLowerCase().includes('impresora') && p.id !== currentProduct.id)
        } else if (currentName.includes('mega pack') || currentName.includes('curso')) {
          categoria = 'cursos digitales'
          productosRelacionados = this.products.filter(p => {
            const name = p.name.toLowerCase()
            return (name.includes('mega pack') || name.includes('curso')) && p.id !== currentProduct.id
          })
        } else if (currentName.includes('tablet') || currentName.includes('ipad')) {
          categoria = 'tablets'
          productosRelacionados = this.products.filter(p => {
            const name = p.name.toLowerCase()
            return (name.includes('tablet') || name.includes('ipad')) && p.id !== currentProduct.id
          })
        }
        
        if (productosRelacionados.length > 0) {
          // Ordenar por precio y mostrar
          const productosOrdenados = productosRelacionados.sort((a, b) => a.price - b.price)
          userCtx.lastOptions = productosOrdenados.slice(0, 6) // Guardar hasta 6 opciones
          userCtx.lastProduct = null // Limpiar producto actual para que pueda elegir
          userCtx.stage = 'discovery'
          
          const response = this.generateCategoryResponse(productosOrdenados, categoria, `m├ís ${categoria}`)
          userCtx.history.push({ role: 'assistant', content: response })
          return {
            text: response,
            intent: 'more_options',
            salesStage: 'discovery',
            sendPhotos: false,
            photos: null
          }
        }
      }

      // Verificar selecci├│n por n├║mero
      const selectedByNumber = this.detectNumberSelection(message, userCtx.lastOptions)
      if (selectedByNumber) {
        console.log(`Ô£à Seleccionado por n├║mero: ${selectedByNumber.name}`)
        userCtx.lastProduct = selectedByNumber
        userCtx.lastOptions = []
        userCtx.stage = 'presentation'
        const baseResponse = this.generateProductResponse(selectedByNumber)
        const response = aiPrefix + baseResponse
        const imageUrl = this.getProductImage(selectedByNumber)
        userCtx.history.push({ role: 'assistant', content: response })
        return {
          text: response,
          intent: 'product_selection',
          salesStage: 'presentation',
          sendPhotos: !!imageUrl,
          photos: imageUrl ? [imageUrl] : null,
          photoCaption: imageUrl ? this.generatePhotoCaption(selectedByNumber) : undefined,
          product: selectedByNumber
        }
      }

      // Buscar producto espec├¡fico
      let product = this.buscarProducto(message)
      
      // ­ƒºá Si b├║squeda local falla, usar IA para buscar (entiende typos y errores)
      if (!product && this.products.length > 0) {
        console.log(`­ƒºá B├║squeda local fall├│, intentando con IA...`)
        const aiSearch = await searchProductWithAI(message, this.products)
        if (aiSearch.product) {
          product = aiSearch.product
          console.log(`Ô£à IA encontr├│ producto: ${product.name}`)
        }
      }
      
      if (product) {
        console.log(`Ô£à Producto espec├¡fico encontrado: ${product.name}`)
        userCtx.lastProduct = product
        userCtx.lastOptions = []
        userCtx.stage = 'presentation'
        const baseResponse = this.generateProductResponse(product)
        const response = aiPrefix + baseResponse
        const imageUrl = this.getProductImage(product)
        userCtx.history.push({ role: 'assistant', content: response })
        return {
          text: response,
          intent: 'product_inquiry',
          salesStage: 'presentation',
          sendPhotos: !!imageUrl,
          photos: imageUrl ? [imageUrl] : null,
          photoCaption: imageUrl ? this.generatePhotoCaption(product) : undefined,
          product
        }
      }

      // Buscar por categor├¡a - SOLO si NO hay producto en contexto
      if ((intent === 'general_inquiry' || intent === 'greeting') && !userCtx.lastProduct) {
        const { productos, categoria } = this.buscarProductosPorCategoria(message)
        if (productos.length > 1) {
          console.log(`­ƒôé Categor├¡a: ${categoria}, Productos: ${productos.length}`)
          const productosOrdenados = productos.sort((a, b) => a.price - b.price)
          userCtx.lastOptions = productosOrdenados.slice(0, 4)
          userCtx.stage = 'discovery'
          const baseResponse = this.generateCategoryResponse(productos, categoria || 'productos', message)
          const response = aiPrefix + baseResponse
          userCtx.history.push({ role: 'assistant', content: response })
          return {
            text: response,
            intent: 'category_inquiry',
            salesStage: 'discovery',
            sendPhotos: false,
            photos: null
          }
        } else if (productos.length === 1) {
          userCtx.lastProduct = productos[0]
          userCtx.lastOptions = []
          userCtx.stage = 'presentation'
          const baseResponse = this.generateProductResponse(productos[0])
          const response = aiPrefix + baseResponse
          userCtx.history.push({ role: 'assistant', content: response })
          return {
            text: response,
            intent: 'product_inquiry',
            salesStage: 'presentation',
            sendPhotos: !!this.getProductImage(productos[0]),
            photos: this.getProductImage(productos[0]) ? [this.getProductImage(productos[0])!] : null,
            product: productos[0]
          }
        }
      }

      // ­ƒºá Si hay producto en contexto y es pregunta general o t├®cnica, usar IA con contexto del producto
      // Esto evita que la IA divague con respuestas gen├®ricas cuando ya estamos hablando de un producto
      if ((intent === 'general_inquiry' || intent === 'answer_question' || intent === 'more_info') && userCtx.lastProduct) {
        console.log(`­ƒºá Respuesta contextual sobre producto: ${userCtx.lastProduct.name}`)
        const contextualResponse = await this.getProductContextResponse(message, userCtx.lastProduct, userCtx.history)
        userCtx.history.push({ role: 'assistant', content: contextualResponse })
        return {
          text: contextualResponse,
          intent: 'product_followup',
          salesStage: userCtx.stage,
          sendPhotos: false,
          photos: null,
          product: userCtx.lastProduct
        }
      }

      // Respuestas seg├║n intenci├│n
      let response: string

      // ­ƒåò INTER├ëS FUTURO (te aviso, luego te digo)
      if (intent === 'future_interest') {
        response = `┬íDale, perfecto! ­ƒÿë Quedo pendiente.\n\nCualquier duda que tengas cuando lo pienses, por aqu├¡ estar├®. ┬íFeliz d├¡a! ­ƒæï`
        userCtx.history.push({ role: 'assistant', content: response })
        return {
          text: response,
          intent: 'future_interest',
          salesStage: 'nurturing',
          sendPhotos: false,
          photos: null,
          product: userCtx.lastProduct
        }
      }

      // ­ƒåò OBJECI├ôN DE DESCONFIANZA - Cliente duda de la legitimidad
      if (intent === 'distrust_objection' && userCtx.lastProduct) {
        response = this.handleDistrustObjection(message, userCtx.lastProduct)
        userCtx.history.push({ role: 'assistant', content: response })
        return {
          text: response,
          intent: 'distrust_objection',
          salesStage: userCtx.stage,
          sendPhotos: false,
          photos: null,
          product: userCtx.lastProduct
        }
      }

      // ­ƒåò FAQ de productos digitales (cursos, megapacks)
      if (intent === 'digital_product_faq' && userCtx.lastProduct) {
        response = this.handleDigitalProductFAQ(message, userCtx.lastProduct)
        userCtx.history.push({ role: 'assistant', content: response })
        return {
          text: response,
          intent: 'digital_product_faq',
          salesStage: userCtx.stage,
          sendPhotos: false,
          photos: null,
          product: userCtx.lastProduct
        }
      }

      // ­ƒåò OBJECI├ôN DE PRECIO - Cliente dice que est├í caro, no tiene plata, pide descuento
      if (intent === 'price_objection' && userCtx.lastProduct) {
        response = this.handlePriceObjection(message, userCtx.lastProduct)
        userCtx.history.push({ role: 'assistant', content: response })
        return {
          text: response,
          intent: 'price_objection',
          salesStage: userCtx.stage,
          sendPhotos: false,
          photos: null,
          product: userCtx.lastProduct
        }
      }

      if (intent === 'rejection' && userCtx.lastProduct) {
        response = this.generateFollowUpResponse(userCtx.lastProduct)
      } else if (intent === 'payment_inquiry' && userCtx.lastProduct) {
        response = await this.generatePaymentResponse(userCtx.lastProduct)
      } else if (intent === 'will_send_receipt') {
        // Cliente dice que enviar├í el comprobante - usar IA para responder naturalmente
        response = await this.handleWillSendReceipt(userCtx.lastProduct, message, userCtx.history)
      } else if (intent === 'payment_receipt') {
        // Cliente env├¡a comprobante de pago - entregar link de Google Drive
        response = await this.handlePaymentReceipt(userCtx.lastProduct, userPhone)
      } else if (intent === 'confirmation' && !userCtx.lastProduct) {
        // Cliente quiere comprar pero no hay producto en contexto
        response = `┬íGenial que quieras comprar! ­ƒÄë\n\n┬┐Cu├íl producto te interesa? Dime el nombre o n├║mero y te paso los datos de pago ­ƒÆ│`
      } else if (intent === 'greeting') {
        response = await this.getGreetingResponse()
      } else if (intent === 'contact_request') {
        response = await this.getContactResponse()
      } else if (intent === 'future_interest') {
        response = this.generateFutureInterestResponse(userCtx.lastProduct)
      } else if (intent === 'delivery_method_response' && userCtx.lastProduct) {
        // Cliente respondi├│ m├®todo de entrega - proceder con pago
        userCtx.stage = 'action'
        response = await this.generatePaymentResponse(userCtx.lastProduct)
      } else if (intent === 'farewell') {
        response = this.getFarewellResponse(userCtx.lastProduct)
        this.conversations.set(userPhone, {
          lastProduct: null,
          lastOptions: [],
          stage: 'greeting',
          history: []
        })
      } else {
        // ­ƒñû SISTEMA H├ìBRIDO: Usar IA para resolver cualquier consulta
        // NUNCA rebota al men├║ - siempre intenta resolver con Ollama/Groq
        console.log('­ƒñû Usando sistema h├¡brido para resolver consulta...')
        response = await this.getGenericResponseWithAI(message, userCtx.history)
      }

      userCtx.history.push({ role: 'assistant', content: response })

      return {
        text: response,
        intent,
        salesStage: userCtx.stage,
        sendPhotos: false,
        photos: null
      }
    } catch (error) {
      console.error('ÔØî Error procesando mensaje:', error)
      return {
        text: '­ƒñû Disculpa, tuve un problema. ┬┐Podr├¡as repetir? ­ƒÖÅ',
        intent: 'error',
        salesStage: 'awareness',
        sendPhotos: false,
        photos: null
      }
    }
  }

  private detectIntent(message: string): string {
    const msg = message.toLowerCase().trim()

    // ­ƒåò OBJECI├ôN DE DESCONFIANZA - Cliente expresa dudas sobre legitimidad
    // Detecta: "es estafa", "piden m├ís plata", "no mandan nada", "tomada de pelo", etc.
    if (/(estafa|enga[├▒n]o|fraude|mentira|falso|fake|robo|timo|tomad[ao]\s*de\s*pelo|piden\s*(m├ís|mas)\s*plata|cobran\s*(m├ís|mas)|no\s*(mandan|env├¡an|envian|entregan)|no\s*(llega|lleg├│)|nunca\s*(llega|mandan|env├¡an)|despu[e├®]s\s*piden|luego\s*piden|y\s*despu[e├®]s|no\s*conf├¡o|no\s*confio|no\s*creo|ser[a├í]\s*(verdad|cierto|real)|es\s*verdad|es\s*cierto|es\s*real|seguro\s*que|de\s*verdad|en\s*serio|no\s*ser[a├í]\s*que|c[o├│]mo\s*s[e├®]\s*que)/i.test(msg)) {
      return 'distrust_objection'
    }

    // ­ƒåò PREGUNTAS FAQ SOBRE PRODUCTOS DIGITALES (cursos, megapacks)
    // Detecta preguntas comunes sobre acceso, descarga, pagos adicionales, etc.
    if (/(es\s*(un\s*)?(curso|pack|megapack)\s*(completo|full)|curso\s*completo|todo\s*incluido|hay\s*(que\s*)?pagar\s*(algo\s*)?(m├ís|mas|extra|adicional)|pago\s*(├║nico|unico|una\s*vez)|sin\s*(pagos?\s*)?(adicionales?|extras?)|puedo\s*(descargarlo|bajarlo|guardarlo)|se\s*(puede\s*)?(descargar|bajar|guardar)|verlo\s*(en\s*)?(l├¡nea|linea|online)|acceso\s*(de\s*por\s*vida|permanente|ilimitado)|cu├ínto\s*tiempo\s*(tengo|dura)\s*(acceso)?|expira|caduca|vence|es\s*para\s*siempre|acceso\s*inmediato|entrega\s*inmediata|c├│mo\s*(lo\s*)?(recibo|obtengo|accedo)|por\s*d├│nde\s*(lo\s*)?(env├¡an|mandan|recibo)|google\s*drive|link\s*de\s*(descarga|acceso))/i.test(msg)) {
      return 'digital_product_faq'
    }

    // PREGUNTA DE SEGUIMIENTO SOBRE PRODUCTO ACTUAL
    // Detecta: "y c├│mo viene", "c├│mo es", "qu├® trae", "en qu├® viene", "c├│mo lo entregan", etc.
    if (/(^y\s|^entonces\s|^pero\s|^en\s|^con\s|^que\s)?(c[o├│]mo\s*(viene|es|funciona|se\s*entrega|lo\s*entregan)|qu[e├®]\s*(trae|incluye|tiene|contiene|viene)|cu[a├í]nto\s*(dura|pesa|mide)|de qu[e├®]\s*(trata|va))/i.test(msg)) {
      return 'more_info'
    }

    // M├üS INFORMACI├ôN
    if (/(m├ís info|mas info|m├ís informaci├│n|mas informacion|cu├®ntame m├ís|cuentame mas|qu├® incluye|que incluye|qu├® trae|que trae|para qu├® sirve|para que sirve|qu├® aprendo|que aprendo|beneficios|ventajas|detalles|expl├¡came|explicame|dime m├ís|dime mas|m├ís detalles|mas detalles|quiero saber m├ís|quiero saber mas|caracter├¡sticas|caracteristicas|especificaciones|specs)/i.test(msg)) {
      return 'more_info'
    }

    // ­ƒåò M├üS OPCIONES / OTRAS REFERENCIAS (cuando ya mostr├│ un producto)
    if (/(m├ís referencias|mas referencias|otras referencias|otros modelos|otras opciones|m├ís opciones|mas opciones|qu├® m├ís tienes|que mas tienes|tienes m├ís|tienes mas|hay m├ís|hay mas|otros productos|otras marcas|ver m├ís|ver mas|mostrar m├ís|mostrar mas|dame m├ís|dame mas|informaci├│n sobre los dem├ís|informacion sobre los demas|los dem├ís|los demas|cu├íles m├ís|cuales mas|qu├® otros|que otros)/i.test(msg)) {
      return 'more_options'
    }

    // SELECCI├ôN DE M├ëTODO DE PAGO
    // Detecta cuando el cliente elige un m├®todo espec├¡fico: Nequi, Daviplata, Transferencia, Tarjeta, PayPal, etc.
    if (/(nequi|daviplata|transferencia|bancaria|banco|tarjeta|credito|cr├®dito|debito|d├®bito|mercadopago|mercado\s*pago|paypal|pay\s*pal|efectivo|pse|pago|pagar|forma\s*de\s*pago|datos\s*de\s*pago|c[o├│]mo\s*pago)/i.test(msg)) {
      return 'payment_method_selected'
    }

    // CONFIRMACI├ôN DE COMPRA
    const confirmationPatterns = [
      /^(si|s├¡|ok|dale|va|listo|claro|por supuesto|perfecto|bueno|est├í bien|esta bien|de una|hag├ímoslo|hagamoslo)(\s*$|!|\.|\,)/i,
      /^(si|s├¡)\s*(me\s*)?(gustar├¡a|gustaria|interesa|encanta|parece bien)$/i,
      /^me interesa$/i,
      /^(lo quiero|lo compro|quiero comprarlo|me lo llevo|si lo quiero|s├¡ lo quiero|lo necesito|lo tomo)$/i,
      /(manda|m├índame|mandame|env├¡a|env├¡ame|enviame|dame|p├ísame|pasame|dime)\s*(los\s*)?(datos|info|informaci├│n|informacion|link|enlace)/i,
      /quiero\s*(los\s*)?(datos|comprarlo|pagarlo|adquirirlo)/i,
      /(como|c├│mo)\s*(lo\s*)?(compro|pago|adquiero|obtengo|consigo)/i,
      /(claro que si|claro que s├¡|por supuesto|obvio|seguro|definitivamente|sin duda|de acuerdo|acepto)/i,
      /(si|s├¡),?\s*(lo quiero|lo compro|dale|va|me interesa)$/i,
      /^si,?\s*(quiero|me interesa|lo quiero|lo compro|dale)/i,
      // Patrones m├ís flexibles para capturar variaciones y typos comunes
      /(qu[ie]+[ea]?r?o|kiero|quieto)\s*(comprarlo|comprar|llevarlo|llevar|adquirirlo|pagarlo)/i,
      /lo\s*(qu[ie]+[ea]?r?o|kiero|quieto|compro|llevo|necesito)/i,
      /^(comprarlo|comprar|llevarmelo|llevarlo)$/i,
      /(dame|deme|pasame|p├ísame)\s*(el\s*)?(link|enlace|datos)/i,
      /^(listo|dale|va|ok|perfecto|bueno)\s*(lo\s*)?(quiero|compro)?/i,
      // Typos comunes: quieto=quiero, conprarlo=comprarlo
      /(quieto|qiero|kero)\s*(comprarlo|comprar|conprarlo|conprar)/i,
      /(quiero|quieto)\s*(conprarlo|conprar)/i
    ]

    for (const pattern of confirmationPatterns) {
      if (pattern.test(msg)) {
        return 'confirmation'
      }
    }

    // ­ƒåò OBJECI├ôN DE PRECIO - Cliente dice que est├í caro, no tiene plata, pide descuento
    // IMPORTANTE: Detectar ANTES de rejection para dar respuesta emp├ítica espec├¡fica
    if (/(muy caro|est├í caro|esta caro|es caro|es mucho|no tengo|no cuento|no dispongo|sin plata|sin dinero|no hay plata|no me alcanza|no alcanza|fuera de mi presupuesto|presupuesto|costoso|elevado|descuento|rebaja|menos|promo|oferta|m├ís barato|mas barato|algo m├ís econ├│mico|algo mas economico|no puedo pagarlo|no puedo pagar|mucho dinero|mucha plata)/i.test(msg)) {
      return 'price_objection'
    }

    // CLIENTE VA A ENVIAR COMPROBANTE (futuro) - "cuando tenga el recibo lo env├¡o"
    // IMPORTANT: Check BEFORE future_interest to avoid "ma├▒ana te envio" matching future_interest
    if (/(cuando (tenga|tengo)|ya (te|le) (env├¡o|envio|mando)|te (env├¡o|envio|mando) (el|cuando)|lo (env├¡o|envio|mando)|vale.*(env├¡o|envio|mando)|ok.*(env├¡o|envio|mando)|listo.*(env├¡o|envio|mando)|bueno.*(env├¡o|envio|mando)|perfecto.*(env├¡o|envio|mando)|apenas (tenga|pague)|en un momento (te|le)|ya casi (te|le))/i.test(msg)) {
      return 'will_send_receipt'
    }

    // M├ëTODO DE ENTREGA - Cliente responde con preferencia de entrega
    // CRITICAL: Detectar ANTES de general_inquiry para mantener contexto del producto
    if (/(^digital$|^google\s*drive$|^drive$|^recoger|^tienda$|^en\s*tienda|^contraentrega$|^domicilio$|^env[i├¡]o|^a\s*domicilio|^entrega\s*a\s*domicilio)/i.test(msg)) {
      return 'delivery_method_response'
    }

    // INTER├ëS FUTURO (te aviso, luego te digo)
    // IMPORTANT: Check BEFORE rejection
    if (/(te aviso|te confirmo|te digo|te escribo|te cuento|lo pienso y|lo consulto y|estamos hablando|hablamos|pendientes|qdo atento|quedo atento|cualquier cosa|si algo|mas tarde|m├ís tarde|luego te|despues te|despu├®s te|ma├▒ana|semana que viene|fin de mes|cuando cobre|cuando me paguen|pago (despues|despu├®s|luego)|proxima semana|pr├│xima semana|el (lunes|martes|mi├®rcoles|miercoles|jueves|viernes|s├íbado|sabado|domingo))/i.test(msg)) {
      return 'future_interest'
    }

    // RECHAZO/DUDA (sin objeciones de precio - esas se manejan arriba)
    if (/(no gracias|no por ahora|despu├®s|despues|lo pienso|tal vez|quiz├ís|quizas|no estoy seguro|no me interesa|no necesito)/i.test(msg)) {
      return 'rejection'
    }

    // COMPROBANTE DE PAGO YA ENVIADO (pasado) - "ya pagu├®", "aqu├¡ est├í el comprobante"
    if (/(ya pagu[e├®]|ya transfer[i├¡]|ya hice (el|la) (pago|transferencia)|listo (el )?pago|pago (hecho|realizado|listo)|te env[i├¡][e├®] (el )?(comprobante|recibo|captura|pantallazo)|aqu[i├¡] (est[a├í]|va) (el )?(comprobante|recibo)|mira (el )?(comprobante|pago)|comprobante (de )?(pago|transferencia)|recibo (de )?(pago|transferencia)|captura (del? )?(pago|nequi|daviplata)|pantallazo (del? )?(pago|nequi|daviplata)|ya le (mand[e├®]|envi[e├®]))/i.test(msg)) {
      return 'payment_receipt'
    }

    // PAGO
    if (/(pago|pagar|tarjeta|efectivo|transferencia|nequi|daviplata|bancolombia|mercadopago|paypal|como pago|c├│mo pago|m├®todos de pago|metodos de pago|formas de pago)/i.test(msg)) {
      return 'payment_inquiry'
    }

    // SALUDO PURO
    if (/^(hola|buenos|buenas|hey|hi|hello|saludos|qu├® tal|que tal|buenas noches|buenos d├¡as|buenos dias|buenas tardes)(\s|$|!|\?|\.)*$/i.test(msg)) {
      return 'greeting'
    }

    // CONTACTO
    if (/(contacto|n├║mero|numero|tel├®fono|telefono|whatsapp|llamar|ubicaci├│n|ubicacion|direcci├│n|direccion|donde est├ín|donde estan)/i.test(msg)) {
      return 'contact_request'
    }

    // DESPEDIDA
    if (/^(gracias|bye|adi├│s|adios|chao|hasta luego|nos vemos|muchas gracias|te agradezco|genial gracias)(\s|$|!|\?|\.)*$/i.test(msg)) {
      return 'farewell'
    }

    return 'general_inquiry'
  }

  private detectNumberSelection(message: string, options: any[]): any | null {
    if (!options || options.length === 0) return null

    const msg = message.toLowerCase().trim()

    const patterns = [
      /^(el|la|opci[o├│]n|n[u├║]mero|numero)?\s*(\d+)$/i,
      /^(\d+)$/,
      /me interesa (el|la)?\s*(\d+)/i,
      /quiero (el|la)?\s*(\d+)/i,
      /(el|la)\s*(\d+)/i,
      /^(primero|primer|primera)$/i,
      /^(segundo|segunda)$/i,
      /^(tercero|tercera)$/i,
      /^(cuarto|cuarta)$/i
    ]

    for (const pattern of patterns) {
      const match = msg.match(pattern)
      if (match) {
        let num: number
        if (/primero|primer|primera/i.test(msg)) num = 1
        else if (/segundo|segunda/i.test(msg)) num = 2
        else if (/tercero|tercera/i.test(msg)) num = 3
        else if (/cuarto|cuarta/i.test(msg)) num = 4
        else {
          const numStr = match[2] || match[1] || match[0]
          num = parseInt(numStr)
        }

        if (num >= 1 && num <= options.length) {
          return options[num - 1]
        }
      }
    }

    return null
  }

  private buscarProducto(query: string): any | null {
    if (!this.products || this.products.length === 0) {
      console.log('ÔÜá´©Å No hay productos cargados')
      return null
    }

    const queryLower = query.toLowerCase()
    console.log(`­ƒöì Buscando producto en: "${queryLower}"`)

    // ­ƒöÑ B├ÜSQUEDA DIRECTA PRIMERO - Si el nombre del producto est├í en la consulta
    // Esto captura casos como "mega pack golden", "megapack golden", etc.
    for (const product of this.products) {
      const productNameLower = product.name.toLowerCase()
      // Buscar coincidencia directa del nombre completo o parcial significativo
      const productWords = productNameLower.split(/\s+/)
      
      // Si todas las palabras del producto est├ín en la consulta
      const allWordsMatch = productWords.every(word => 
        word.length > 2 && queryLower.includes(word)
      )
      if (allWordsMatch && productWords.length >= 2) {
        console.log(`Ô£à Encontrado por coincidencia directa: ${product.name}`)
        return product
      }
      
      // Buscar palabras distintivas (no gen├®ricas) del nombre del producto
      const distinctiveWords = productWords.filter((w: string) => 
        w.length > 4 && !['mega', 'pack', 'curso', 'cursos', 'de', 'para', 'desde', 'con', 'sin', 'usb', 'wifi', 'ram', 'ssd', 'ddr4', 'ddr5', 'fhd', 'intel', 'core', 'amd', 'ryzen', 'pantalla', 'completo', 'completa', 'premium', 'profesional', 'avanzado', 'basico', 'b├ísico', 'master', 'full', 'total', 'pack'].includes(w)
      )
      for (const word of distinctiveWords) {
        if (queryLower.includes(word)) {
          console.log(`Ô£à Encontrado por palabra distintiva "${word}": ${product.name}`)
          return product
        }
      }
    }

    // Palabras gen├®ricas a ignorar
    const stopWords = ['hola', 'buenos', 'buenas', 'dias', 'tardes', 'noches', 'quiero', 'necesito', 'tienes', 'tienen', 'hay', 'disponible', 'interesa', 'precio', 'costo', 'cuanto', 'cu├ínto', 'que', 'qu├®', 'cual', 'cu├íl', 'como', 'c├│mo', 'para', 'por', 'con', 'sin', 'una', 'uno', 'los', 'las', 'del', 'the', 'sobre', 'info', 'informaci├│n', 'curso', 'cursos', 'mega', 'pack', 'me', 'un', 'estudiar', 'trabajar', 'usar', 'de', 'algo', 'desde', 'casa', 'aprender']

    // ­ƒöº CORRECCI├ôN DE TYPOS COMUNES (b├║squeda local r├ípida)
    const typoCorrections: { [key: string]: string } = {
      // Golden
      'goldem': 'golden', 'golder': 'golden', 'goldenn': 'golden',
      // Piano
      'pino': 'piano', 'pianos': 'piano',
      // Excel
      'exel': 'excel', 'exsel': 'excel', 'ecxel': 'excel', 'excell': 'excel',
      // Ingl├®s
      'ingles': 'ingl├®s', 'englis': 'ingl├®s', 'english': 'ingl├®s', 'inlges': 'ingl├®s',
      // Trading
      'tradign': 'trading', 'traiding': 'trading', 'tradng': 'trading',
      // Dise├▒o
      'diseno': 'dise├▒o', 'disenio': 'dise├▒o',
      // Programaci├│n
      'programasion': 'programaci├│n', 'programacion': 'programaci├│n', 'programing': 'programaci├│n',
      // MegaPack
      'megapak': 'megapack', 'megapck': 'megapack',
      // Resina
      'recina': 'resina',
      // Marketing
      'marketin': 'marketing', 'markting': 'marketing',
      // Office
      'ofice': 'office', 'offic': 'office'
    }

    // Aplicar correcciones de typos a la consulta (palabra por palabra)
    let correctedQuery = queryLower
    const words = queryLower.split(/\s+/)
    const correctedWords: string[] = []
    let wasTypoCorrected = false
    
    for (const word of words) {
      if (typoCorrections[word]) {
        correctedWords.push(typoCorrections[word])
        console.log(`­ƒöº Typo corregido: "${word}" ÔåÆ "${typoCorrections[word]}"`)
        wasTypoCorrected = true
      } else {
        correctedWords.push(word)
      }
    }
    
    if (wasTypoCorrected) {
      correctedQuery = correctedWords.join(' ')
      console.log(`­ƒöì Buscando con consulta corregida: "${correctedQuery}"`)
      for (const product of this.products) {
        const productNameLower = product.name.toLowerCase()
        // Buscar palabras distintivas en la consulta corregida
        const searchWords = correctedWords.filter(w => w.length > 3 && !stopWords.includes(w))
        for (const word of searchWords) {
          if (productNameLower.includes(word)) {
            console.log(`Ô£à Encontrado por typo corregido "${word}": ${product.name}`)
            return product
          }
        }
      }
    }

    // ­ƒÄ» DETECCI├ôN DE INTENCIONES AMBIGUAS
    // Mapea intenciones a productos relevantes
    // IMPORTANTE: Usar frases completas para evitar falsos positivos
    const intentionMap: { [key: string]: string[] } = {
      'ganar dinero': ['trading', 'marketing'],
      'dinero extra': ['trading', 'marketing'],
      'ingresos pasivos': ['trading', 'marketing'],
      'negocio propio': ['marketing', 'excel', 'dise├▒o'],
      'emprender': ['marketing', 'trading'],
      'aprender m├║sica': ['piano'],
      'tocar instrumento': ['piano'],
      'mejorar trabajo': ['excel', 'office'],
      'trabajo oficina': ['excel', 'office'],
      'crear contenido': ['dise├▒o', 'marketing'],
      'redes sociales': ['marketing', 'redes'],
      'freelance': ['dise├▒o', 'programaci├│n'],
      'trabajar desde casa': ['dise├▒o', 'marketing', 'excel'],
      'trabajo remoto': ['dise├▒o', 'programaci├│n'],
      'aprender ingles': ['ingl├®s'],
      'aprender ingl├®s': ['ingl├®s'],
      'hablar ingles': ['ingl├®s'],
      'hablar ingl├®s': ['ingl├®s'],
      'idioma ingles': ['ingl├®s'],
      'idioma ingl├®s': ['ingl├®s'],
      'curso ingles': ['ingl├®s'],
      'curso ingl├®s': ['ingl├®s']
    }

    // Buscar intenciones completas (frases exactas primero)
    for (const [intention, keywords] of Object.entries(intentionMap)) {
      // Verificar que la frase completa est├® en la consulta
      if (queryLower.includes(intention)) {
        for (const keyword of keywords) {
          const producto = this.products.find(p => 
            p.name.toLowerCase().includes(keyword)
          )
          if (producto) {
            console.log(`Ô£à Encontrado por intenci├│n "${intention}": ${producto.name}`)
            return producto
          }
        }
      }
    }

    const keywords = queryLower
      .replace(/[┬┐?!.,]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))

    console.log(`­ƒöæ Palabras clave: ${keywords.join(', ')}`)

    // Buscar en nombre del producto
    for (const keyword of keywords) {
      const producto = this.products.find(p =>
        p.name.toLowerCase().includes(keyword)
      )
      if (producto) {
        console.log(`Ô£à Encontrado por nombre: ${producto.name}`)
        return producto
      }
    }

    // Buscar en tags
    for (const keyword of keywords) {
      const producto = this.products.find(p => {
        const tags = this.getProductTags(p)
        return tags.some((tag: string) => tag.toLowerCase().includes(keyword))
      })
      if (producto) {
        console.log(`Ô£à Encontrado por tag: ${producto.name}`)
        return producto
      }
    }

    console.log(`ÔØî No se encontr├│ producto`)
    return null
  }

  private buscarProductosPorCategoria(query: string): { productos: any[], categoria: string | null } {
    if (!this.products || this.products.length === 0) {
      return { productos: [], categoria: null }
    }

    const queryLower = query.toLowerCase()
    let categoria: string | null = null
    let productos: any[] = []

    if (queryLower.includes('port├ítil') || queryLower.includes('portatil') || queryLower.includes('laptop') || queryLower.includes('notebook')) {
      categoria = 'port├ítiles'
      productos = this.products.filter(p => {
        const name = p.name.toLowerCase()
        return name.includes('port├ítil') || name.includes('portatil') || name.includes('laptop') || name.includes('notebook') || name.includes('macbook')
      })
    } else if (queryLower.includes('impresora') || queryLower.includes('imprimir')) {
      categoria = 'impresoras'
      productos = this.products.filter(p => p.name.toLowerCase().includes('impresora'))
    } else if (queryLower.includes('tablet') || queryLower.includes('ipad')) {
      categoria = 'tablets'
      productos = this.products.filter(p => {
        const name = p.name.toLowerCase()
        return name.includes('tablet') || name.includes('ipad')
      })
    } else if (queryLower.includes('monitor') || queryLower.includes('pantalla')) {
      categoria = 'monitores'
      productos = this.products.filter(p => p.name.toLowerCase().includes('monitor'))
    } else if (queryLower.includes('curso') || queryLower.includes('cursos') || queryLower.includes('aprender') || queryLower.includes('mega pack')) {
      categoria = 'cursos digitales'
      productos = this.products.filter(p => {
        const name = p.name.toLowerCase()
        return name.includes('mega pack') || name.includes('curso') || p.category === 'DIGITAL'
      })
    } else if (queryLower.includes('dise├▒o') || queryLower.includes('photoshop')) {
      categoria = 'cursos de dise├▒o'
      productos = this.products.filter(p => {
        const name = p.name.toLowerCase()
        return name.includes('dise├▒o') || name.includes('photoshop') || name.includes('gr├ífico')
      })
    } else if (queryLower.includes('programaci├│n') || queryLower.includes('programacion') || queryLower.includes('desarrollo')) {
      categoria = 'cursos de programaci├│n'
      productos = this.products.filter(p => {
        const name = p.name.toLowerCase()
        return name.includes('programaci├│n') || name.includes('programacion') || name.includes('desarrollo')
      })
    }

    console.log(`­ƒôé Categor├¡a: ${categoria}, Productos: ${productos.length}`)
    return { productos, categoria }
  }

  private getProductTags(product: any): string[] {
    if (product.tags) {
      if (typeof product.tags === 'string') {
        try {
          return JSON.parse(product.tags)
        } catch {
          return product.tags.split(',').map((t: string) => t.trim())
        }
      }
      return product.tags
    }
    return []
  }

  private getProductImage(product: any): string | null {
    try {
      let imageUrl: string | null = null
      
      if (product.images) {
        if (typeof product.images === 'string') {
          try {
            const images = JSON.parse(product.images)
            if (Array.isArray(images) && images.length > 0) {
              imageUrl = images[0]
            }
          } catch {
            imageUrl = product.images.trim()
          }
        } else if (Array.isArray(product.images) && product.images.length > 0) {
          imageUrl = product.images[0]
        }
      }
      
      if (!imageUrl && product.image) {
        imageUrl = product.image
      }
      
      if (!imageUrl && product.imageUrl) {
        imageUrl = product.imageUrl
      }
      
      if (imageUrl) {
        imageUrl = imageUrl.trim()
        
        // 1. Si es URL p├║blica (http/https), retornar directamente
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          console.log(`­ƒô© Imagen URL para ${product.name}: ${imageUrl.substring(0, 50)}...`)
          return imageUrl
        }
        
        // 2. Si es ruta local (/fotos/...), retornar para que Baileys la maneje
        if (imageUrl.startsWith('/fotos/') || imageUrl.startsWith('fotos/')) {
          console.log(`­ƒô© Imagen local para ${product.name}: ${imageUrl}`)
          return imageUrl
        }
        
        // 3. Otra ruta relativa
        if (imageUrl.startsWith('/')) {
          console.log(`­ƒô© Imagen relativa para ${product.name}: ${imageUrl}`)
          return imageUrl
        }
      }
      
      console.log(`ÔÜá´©Å No se encontr├│ imagen para: ${product.name}`)
      return null
    } catch (error) {
      console.error(`ÔØî Error obteniendo imagen:`, error)
      return null
    }
  }

  private generatePhotoCaption(product: any): string {
    const price = this.formatPrice(product.price)
    const isPhysical = this.isPhysicalProduct(product)
    
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    // ­ƒô© FORMATO CARD PROFESIONAL
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    
    let caption = `ÔòöÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòù\n`
    caption += `   ­ƒÄ» *${product.name}*\n`
    caption += `ÔòÜÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòØ\n\n`
    
    // Precio destacado
    caption += `­ƒÆ░ *PRECIO: ${price} COP*\n\n`
    
    // Descripci├│n corta
    if (product.description) {
      const shortDesc = product.description.length > 150 
        ? product.description.substring(0, 150) + '...'
        : product.description
      caption += `­ƒôØ ${shortDesc}\n\n`
    }
    
    // Beneficios seg├║n tipo
    caption += `ÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöü\n`
    if (isPhysical) {
      caption += `Ô£à Producto nuevo con garant├¡a\n`
      caption += `­ƒÜÜ Env├¡o a toda Colombia\n`
      caption += `­ƒöº Soporte t├®cnico incluido\n`
    } else {
      caption += `Ô£à Acceso de por vida\n`
      caption += `­ƒôª Entrega inmediata (Google Drive)\n`
      caption += `­ƒöä Actualizaciones incluidas\n`
    }
    caption += `ÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöü\n\n`
    
    // Call to action
    caption += `­ƒÆ¼ *┬┐Te interesa? Escr├¡beme y te cuento m├ís* ­ƒÿè`
    
    return caption
  }

  getAllProductImages(product: any): string[] {
    const images: string[] = []
    
    try {
      if (product.images) {
        if (typeof product.images === 'string') {
          try {
            const parsed = JSON.parse(product.images)
            if (Array.isArray(parsed)) {
              images.push(...parsed.filter((url: string) => 
                url && (url.startsWith('http://') || url.startsWith('https://'))
              ))
            }
          } catch {
            if (product.images.startsWith('http')) {
              images.push(product.images.trim())
            }
          }
        } else if (Array.isArray(product.images)) {
          images.push(...product.images.filter((url: string) => 
            url && (url.startsWith('http://') || url.startsWith('https://'))
          ))
        }
      }
      
      if (product.image && !images.includes(product.image)) {
        if (product.image.startsWith('http')) {
          images.push(product.image)
        }
      }
      
      if (product.imageUrl && !images.includes(product.imageUrl)) {
        if (product.imageUrl.startsWith('http')) {
          images.push(product.imageUrl)
        }
      }
    } catch (error) {
      console.error('Error obteniendo im├ígenes:', error)
    }
    
    return images
  }

  private isPhysicalProduct(product: any): boolean {
    if (product.category === 'PHYSICAL') return true
    if (product.category === 'DIGITAL') return false
    
    const name = product.name.toLowerCase()
    const physicalKeywords = [
      'port├ítil', 'portatil', 'laptop', 'notebook',
      'computador', 'pc', 'desktop',
      'impresora', 'multifuncional', 'scanner',
      'tablet', 'ipad', 'monitor', 'pantalla',
      'teclado', 'mouse', 'rat├│n',
      'disco', 'ssd', 'memoria ram',
      'cargador', 'bater├¡a', 'bateria',
      'aud├¡fonos', 'audifonos', 'auriculares',
      'c├ímara', 'camara', 'webcam',
      'router', 'modem', 'moto',
      'asus', 'hp', 'dell', 'lenovo', 'acer', 'apple', 'samsung', 'huawei', 'epson', 'canon', 'brother'
    ]

    return physicalKeywords.some(keyword => name.includes(keyword))
  }

  private formatPrice(price: number): string {
    return price.toLocaleString('es-CO')
  }

  private generateProductResponse(product: any): string {
    const price = this.formatPrice(product.price)
    const isPhysical = this.isPhysicalProduct(product)

    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    // ­ƒôª FORMATO CARD PROFESIONAL PARA TEXTO
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    
    let response = `ÔòöÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòù\n`
    response += `   ­ƒÄ» *${product.name}*\n`
    response += `ÔòÜÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòØ\n\n`
    
    response += `­ƒÆ░ *PRECIO: ${price} COP*\n\n`

    // Mostrar descripci├│n REAL del producto
    if (product.description) {
      const desc = this.getProductDescription(product.description)
      response += `­ƒôØ *DESCRIPCI├ôN:*\n${desc}\n\n`
    }

    // Beneficios seg├║n tipo
    response += `ÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöü\n`
    response += `Ô£¿ *INCLUYE:*\n`
    if (isPhysical) {
      response += `   Ô£à Producto nuevo\n`
      response += `   ­ƒøí´©Å Garant├¡a del fabricante\n`
      response += `   ­ƒÜÜ Env├¡o a toda Colombia\n`
      response += `   ­ƒöº Soporte t├®cnico\n`
    } else {
      response += `   Ô£à Acceso de por vida\n`
      response += `   ­ƒôª Entrega inmediata (Google Drive)\n`
      response += `   ­ƒöä Actualizaciones incluidas\n`
      response += `   ­ƒÆ¼ Soporte por WhatsApp\n`
    }
    response += `ÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöü\n\n`

    response += `­ƒÆ¼ *┬┐Te interesa? Dime "s├¡" y te paso los datos de pago* ­ƒÿè`
    
    return response
  }

  private getProductDescription(description: string): string {
    if (!description) return ''
    
    // Limpiar y formatear la descripci├│n
    const lines = description.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
    
    // Mostrar hasta 300 caracteres o 5 l├¡neas
    let result = ''
    let charCount = 0
    let lineCount = 0
    
    for (const line of lines) {
      if (charCount < 300 && lineCount < 5) {
        result += line + '\n'
        charCount += line.length
        lineCount++
      }
    }
    
    return result.trim()
  }

  private getShortDescription(description: string): string {
    if (!description) return ''
    
    const lines = description.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .slice(0, 3)
    
    let result = ''
    for (const line of lines) {
      if (result.length < 150) {
        result += line + '\n'
      }
    }
    
    return result.trim()
  }

  private generateCategoryResponse(productos: any[], categoria: string, originalQuery: string): string {
    const queryLower = originalQuery.toLowerCase()
    let uso = ''
    if (queryLower.includes('estudiar') || queryLower.includes('universidad')) {
      uso = 'para estudiar'
    } else if (queryLower.includes('trabajar') || queryLower.includes('trabajo')) {
      uso = 'para trabajar'
    } else if (queryLower.includes('jugar') || queryLower.includes('gaming')) {
      uso = 'para gaming'
    }

    let response = `┬íClaro! ­ƒÿè Tenemos varias opciones de *${categoria}*${uso ? ' ' + uso : ''}:\n\n`

    const productosOrdenados = productos.sort((a, b) => a.price - b.price)
    const maxProductos = Math.min(productosOrdenados.length, 4)

    for (let i = 0; i < maxProductos; i++) {
      const p = productosOrdenados[i]
      const price = this.formatPrice(p.price)
      const num = i + 1

      const specs = this.extractSpecs(p)

      response += `*${num}.* ${p.name}\n`
      if (specs) {
        response += `   ­ƒôï ${specs}\n`
      }
      response += `   ­ƒÆ░ *${price} COP*\n\n`
    }

    if (productos.length > maxProductos) {
      response += `_...y ${productos.length - maxProductos} opciones m├ís_\n\n`
    }

    response += `­ƒÆí Dime cu├íl te llama la atenci├│n o el n├║mero, y te cuento m├ís ­ƒÿè`

    return response
  }

  private extractSpecs(product: any): string | null {
    const name = product.name.toLowerCase()
    const desc = (product.description || '').toLowerCase()
    const specs: string[] = []

    const ramMatch = (name + ' ' + desc).match(/(\d+)\s*gb\s*(ram|ddr)/i)
    if (ramMatch) specs.push(`${ramMatch[1]}GB RAM`)

    const storageMatch = (name + ' ' + desc).match(/(\d+)\s*(gb|tb)\s*(ssd|hdd|nvme|almacenamiento)/i)
    if (storageMatch) specs.push(`${storageMatch[1]}${storageMatch[2].toUpperCase()} ${storageMatch[3].toUpperCase()}`)

    if (name.includes('ryzen')) {
      const ryzenMatch = name.match(/ryzen\s*(\d+)/i)
      if (ryzenMatch) specs.push(`Ryzen ${ryzenMatch[1]}`)
    } else if (name.includes('intel') || name.includes('core i')) {
      const intelMatch = name.match(/core\s*i(\d+)/i) || name.match(/i(\d+)/i)
      if (intelMatch) specs.push(`Core i${intelMatch[1]}`)
    }

    return specs.length > 0 ? specs.join(' | ') : null
  }

  private async generatePaymentResponse(product: any): Promise<string> {
    const price = this.formatPrice(product.price)
    const isPhysical = this.isPhysicalProduct(product)

    let response = `┬íMe encanta! ­ƒñ® Sab├¡a que te iba a gustar.\n\nMira, te voy a pasar toda la info para que puedas completar tu compra:\n\n`
    response += `ÔòöÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòù\n`
    response += `   ­ƒôª *${product.name}*\n`
    response += `   ­ƒÆ░ *Total: ${price} COP*\n`
    response += `ÔòÜÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòØ\n\n`

    // Para productos F├ìSICOS: Preguntar m├®todo de entrega primero
    if (isPhysical) {
      response += `­ƒÜÜ *┬┐C├ôMO PREFIERES RECIBIRLO?*\n\n`
      response += `1´©ÅÔâú *Recoger en tienda* (Cali)\n`
      response += `   ­ƒôì Sin costo adicional\n\n`
      response += `2´©ÅÔâú *Contraentrega* (Env├¡o a domicilio)\n`
      response += `   ­ƒÜø Pagas cuando lo recibas\n\n`
      response += `ÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöü\n\n`
    }

    response += `­ƒÆ│ *M├ëTODOS DE PAGO:*\n\n`

    // MercadoPago din├ímico
    let mercadoPagoLink = product.paymentLinkMercadoPago
    if (!mercadoPagoLink && product.id) {
      try {
        const { getOrCreateMercadoPagoLink } = await import('./mercadopago-service')
        mercadoPagoLink = await getOrCreateMercadoPagoLink(product.id)
        if (mercadoPagoLink) {
          console.log(`Ô£à Link MercadoPago generado para ${product.name}`)
        }
      } catch (error) {
        console.error('Error generando link MercadoPago:', error)
      }
    }

    if (mercadoPagoLink) {
      response += `­ƒöÁ *MercadoPago (Tarjeta/PSE):*\n${mercadoPagoLink}\n\n`
    }
    
    // PayPal din├ímico - SIEMPRE forzar generaci├│n nueva para evitar links vencidos
    let paypalLink = null
    if (product.id) {
      try {
        const { getOrCreatePayPalLink } = await import('./paypal-service')
        // forceNew = true por defecto en getOrCreatePayPalLink
        paypalLink = await getOrCreatePayPalLink(product.id, true)
        if (paypalLink) {
          console.log(`Ô£à Link PayPal renovado para ${product.name}`)
        }
      } catch (error) {
        console.error('Error generando link PayPal:', error)
        // Fallback al link est├ítico de la BD si la generaci├│n falla
        paypalLink = product.paymentLinkPayPal
      }
    }
    
    if (paypalLink) {
      response += `­ƒƒí *PayPal:*\n${paypalLink}\n\n`
    }
    
    // Link personalizado (Hotmart, etc.)
    if (product.paymentLinkCustom) {
      response += `­ƒƒó *Link de pago:*\n${product.paymentLinkCustom}\n\n`
    }

    // Nequi/Daviplata - N├║mero fijo: 3136174267
    response += `­ƒô▒ *Transferencia directa:*\n`
    response += `Ôû© *Nequi:* 3136174267\n`
    response += `Ôû© *Daviplata:* 3136174267\n\n`

    response += `ÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöü\n\n`

    if (isPhysical) {
      response += `­ƒôØ *SIGUIENTE PASO:*\n`
      response += `Dime si prefieres recoger o contraentrega, y env├¡a el comprobante de pago ­ƒô©`
    } else {
      response += `­ƒôØ *SIGUIENTE PASO:*\n`
      response += `Env├¡a el comprobante y te entrego el acceso por *Google Drive* inmediatamente ­ƒÜÇ`
    }

    return response
  }

  private generateValueResponse(product: any): string {
    if (this.isPhysicalProduct(product)) {
      return this.generatePhysicalValueResponse(product)
    }
    return this.generateDigitalValueResponse(product)
  }

  private generatePhysicalValueResponse(product: any): string {
    const price = this.formatPrice(product.price)

    let response = `­ƒîƒ *M├ís detalles de ${product.name}*\n\n`
    response += `ÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöü\n\n`
    response += `­ƒôï *ESPECIFICACIONES*\n\n`
    response += this.getPhysicalSpecs(product)
    response += `\nÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöü\n\n`
    response += `Ô£¿ *BENEFICIOS*\n\n`
    response += this.getPhysicalBenefits(product)
    response += `\nÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöü\n\n`
    response += `­ƒøí´©Å *GARANT├ìA*\n\n`
    response += `   Ôû½´©Å Producto 100% nuevo\n\n`
    response += `   Ôû½´©Å Garant├¡a del fabricante\n\n`
    response += `   Ôû½´©Å Soporte t├®cnico incluido\n\n`
    response += `ÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöü\n\n`
    response += `­ƒÜÜ *ENTREGA*\n\n`
    response += `   Ôû½´©Å Env├¡o a toda Colombia\n\n`
    response += `   Ôû½´©Å Retiro en Cali disponible\n\n`
    response += `ÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöü\n\n`
    response += `­ƒÆ░ *Precio: ${price} COP*\n\n`
    response += `Si te gusta, solo dime y te lo aparto ­ƒÿè`

    return response
  }

  private getPhysicalSpecs(product: any): string {
    const name = product.name.toLowerCase()
    const desc = (product.description || '').toLowerCase()
    let specs = ''

    if (name.includes('port├ítil') || name.includes('portatil') || name.includes('laptop')) {
      const ramMatch = (name + ' ' + desc).match(/(\d+)\s*gb\s*(ram|ddr)/i)
      const storageMatch = (name + ' ' + desc).match(/(\d+)\s*(gb|tb)\s*(ssd|hdd)/i)

      if (name.includes('ryzen')) {
        const ryzenMatch = name.match(/ryzen\s*(\d+)/i)
        if (ryzenMatch) specs += `   ­ƒö╣ Procesador: AMD Ryzen ${ryzenMatch[1]}\n\n`
      } else if (name.includes('i5')) {
        specs += `   ­ƒö╣ Procesador: Intel Core i5\n\n`
      } else if (name.includes('i7')) {
        specs += `   ­ƒö╣ Procesador: Intel Core i7\n\n`
      } else if (name.includes('i3')) {
        specs += `   ­ƒö╣ Procesador: Intel Core i3\n\n`
      }

      if (ramMatch) specs += `   ­ƒö╣ Memoria RAM: ${ramMatch[1]}GB\n\n`
      if (storageMatch) specs += `   ­ƒö╣ Almacenamiento: ${storageMatch[1]}${storageMatch[2].toUpperCase()} ${storageMatch[3].toUpperCase()}\n\n`

      if (name.includes('15') || name.includes('15.6')) {
        specs += `   ­ƒö╣ Pantalla: 15.6 pulgadas\n\n`
      } else if (name.includes('14')) {
        specs += `   ­ƒö╣ Pantalla: 14 pulgadas\n\n`
      }

      specs += `   ­ƒö╣ Sistema: Windows 11\n`
    } else if (name.includes('impresora')) {
      if (name.includes('multifuncional')) {
        specs += `   ­ƒö╣ Tipo: Multifuncional\n\n`
        specs += `   ­ƒö╣ Funciones: Imprime, Escanea, Copia\n\n`
      } else {
        specs += `   ­ƒö╣ Tipo: Impresora\n\n`
      }
      if (name.includes('wifi') || name.includes('inal├ímbrica')) {
        specs += `   ­ƒö╣ Conectividad: WiFi + USB\n\n`
      }
      if (name.includes('tinta continua') || name.includes('ecotank')) {
        specs += `   ­ƒö╣ Sistema de tinta continua\n`
      }
    } else {
      specs += `   ­ƒö╣ ${product.description || 'Producto de alta calidad'}\n`
    }

    return specs || `   ­ƒö╣ Consultar especificaciones\n`
  }

  private getPhysicalBenefits(product: any): string {
    const name = product.name.toLowerCase()
    let benefits = ''

    if (name.includes('port├ítil') || name.includes('portatil') || name.includes('laptop')) {
      if (name.includes('ryzen 7') || name.includes('i7') || name.includes('16gb')) {
        benefits = `   Ô¡É Alto rendimiento\n\n`
        benefits += `   Ô¡É Multitarea sin problemas\n\n`
        benefits += `   Ô¡É Ideal para dise├▒o y programaci├│n\n\n`
        benefits += `   Ô¡É Bater├¡a de larga duraci├│n\n`
      } else if (name.includes('ryzen 5') || name.includes('i5')) {
        benefits = `   Ô¡É Excelente calidad-precio\n\n`
        benefits += `   Ô¡É Perfecto para estudio y trabajo\n\n`
        benefits += `   Ô¡É R├ípido y eficiente\n\n`
        benefits += `   Ô¡É Port├ítil y liviano\n`
      } else {
        benefits = `   Ô¡É Ideal para tareas cotidianas\n\n`
        benefits += `   Ô¡É Navegaci├│n y Office\n\n`
        benefits += `   Ô¡É Econ├│mico y funcional\n`
      }
    } else if (name.includes('impresora')) {
      benefits = `   Ô¡É Impresiones de alta calidad\n\n`
      benefits += `   Ô¡É Bajo costo por p├ígina\n\n`
      benefits += `   Ô¡É F├ícil instalaci├│n\n`
    } else {
      benefits = `Ôû© Producto de calidad garantizada\nÔû© Marca reconocida\nÔû© Durabilidad comprobada\n`
    }

    return benefits
  }

  private generateDigitalValueResponse(product: any): string {
    const price = this.formatPrice(product.price)
    const marketPrice = Math.round(product.price * 7.5) // Precio de mercado estimado
    const savings = marketPrice - product.price

    let response = `­ƒîƒ *┬┐Por qu├® ${product.name}?*\n\n`
    
    // Valor real vs nuestro precio
    response += `­ƒÆÄ *VALOR REAL:*\n`
    response += `Ôû© En el mercado: ${this.formatPrice(marketPrice)} COP\n`
    response += `Ôû© *Nuestro precio: ${price} COP*\n`
    response += `Ôû© ­ƒÆ░ *Ahorras: ${this.formatPrice(savings)} COP*\n\n`
    
    // Lo que incluye
    response += `Ô£¿ *LO QUE OBTIENES:*\n`
    response += this.getDigitalIncludes(product)
    response += `\n`
    
    // Beneficios
    response += `­ƒÜÇ *C├ôMO TE BENEFICIA:*\n`
    response += this.getDigitalBenefits(product)
    response += `\n`
    
    // Aplicaciones
    response += `­ƒÆ╝ *PUEDES APLICARLO EN:*\n`
    response += this.getDigitalApplications(product)
    response += `\n`
    
    // Oferta
    response += `ÔÅ░ *OFERTA ESPECIAL:*\n`
    response += `Este precio es por tiempo limitado.\n`
    response += `Acceso de por vida + actualizaciones incluidas.\n\n`
    
    response += `­ƒÄ» *┬┐Te gustar├¡a aprovechar esta oportunidad hoy?*\n`
    response += `Solo dime "dale" y te paso los datos de pago ­ƒÆ│`

    return response
  }

  private getDigitalIncludes(product: any): string {
    const name = product.name.toLowerCase()
    let includes = ''

    if (name.includes('piano')) {
      includes = `Ôû© 19 horas de video HD\n`
      includes += `Ôû© 34 art├¡culos de teor├¡a\n`
      includes += `Ôû© 157 recursos descargables\n`
      includes += `Ôû© 5 estilos: Cl├ísico, Jazz, Blues, Pop, Balada\n`
    } else if (name.includes('dise├▒o') || name.includes('photoshop')) {
      includes = `Ôû© Domina Photoshop, Illustrator, InDesign\n`
      includes += `Ôû© +50 cursos completos\n`
      includes += `Ôû© Proyectos pr├ícticos\n`
      // includes += `Ôû© Certificado de finalizaci├│n\n`
    } else if (name.includes('excel') || name.includes('office')) {
      includes = `Ôû© Excel b├ísico a avanzado\n`
      includes += `Ôû© F├│rmulas y funciones\n`
      includes += `Ôû© Tablas din├ímicas y macros\n`
      includes += `Ôû© Plantillas profesionales\n`
    } else if (name.includes('programaci├│n') || name.includes('programacion')) {
      includes = `Ôû© Python, JavaScript, Java y m├ís\n`
      includes += `Ôû© +100 cursos completos\n`
      includes += `Ôû© Proyectos reales\n`
      includes += `Ôû© Desarrollo web y m├│vil\n`
    } else if (name.includes('marketing')) {
      includes = `Ôû© SEO y posicionamiento\n`
      includes += `Ôû© Google Ads y Facebook Ads\n`
      includes += `Ôû© Email marketing\n`
      includes += `Ôû© Estrategias de ventas\n`
    } else if (name.includes('ingl├®s') || name.includes('ingles') || name.includes('idioma')) {
      includes = `Ôû© B├ísico a avanzado\n`
      includes += `Ôû© Conversaci├│n fluida\n`
      includes += `Ôû© Ingl├®s de negocios\n`
      includes += `Ôû© Pronunciaci├│n perfecta\n`
    } else if (name.includes('trading')) {
      includes = `Ôû© An├ílisis t├®cnico completo\n`
      includes += `Ôû© Forex y criptomonedas\n`
      includes += `Ôû© Gesti├│n de riesgo\n`
      includes += `Ôû© Estrategias probadas\n`
    } else {
      // Usar descripci├│n del producto
      if (product.description) {
        const lines = product.description.split('\n').slice(0, 4)
        includes = lines.map((l: string) => `Ôû© ${l.trim()}`).join('\n') + '\n'
      } else {
        includes = `Ôû© Contenido profesional completo\n`
        includes += `Ôû© Material de alta calidad\n`
        includes += `Ôû© Acceso inmediato\n`
      }
    }

    return includes
  }

  private getDigitalBenefits(product: any): string {
    const name = product.name.toLowerCase()
    let benefits = ''

    if (name.includes('piano')) {
      benefits = `Ôû© Toca tus canciones favoritas\n`
      benefits += `Ôû© Impresiona a familia y amigos\n`
      benefits += `Ôû© Habilidad para toda la vida\n`
    } else if (name.includes('dise├▒o')) {
      benefits = `Ôû© Crea dise├▒os profesionales\n`
      benefits += `Ôû© Trabaja como freelancer\n`
      benefits += `Ôû© Aumenta tus ingresos\n`
    } else if (name.includes('excel') || name.includes('office')) {
      benefits = `Ôû© Destaca en tu trabajo\n`
      benefits += `Ôû© Automatiza tareas\n`
      benefits += `Ôû© Mejora tu productividad\n`
    } else if (name.includes('programaci├│n') || name.includes('programacion')) {
      benefits = `Ôû© Trabaja en tecnolog├¡a\n`
      benefits += `Ôû© Buenos salarios\n`
      benefits += `Ôû© Trabaja remoto\n`
    } else if (name.includes('marketing')) {
      benefits = `Ôû© Vende m├ís en tu negocio\n`
      benefits += `Ôû© Consigue clientes online\n`
      benefits += `Ôû© Genera ingresos pasivos\n`
    } else if (name.includes('ingl├®s') || name.includes('ingles') || name.includes('idioma')) {
      benefits = `Ôû© Mejores oportunidades\n`
      benefits += `Ôû© Viaja sin barreras\n`
      benefits += `Ôû© Accede a contenido global\n`
    } else if (name.includes('trading')) {
      benefits = `Ôû© Ingresos desde casa\n`
      benefits += `Ôû© Libertad financiera\n`
      benefits += `Ôû© Trabaja cuando quieras\n`
    } else {
      benefits = `Ôû© Nuevas habilidades\n`
      benefits += `Ôû© Mejor perfil profesional\n`
      benefits += `Ôû© M├ís oportunidades\n`
    }

    return benefits
  }

  private getDigitalApplications(product: any): string {
    const name = product.name.toLowerCase()
    let apps = ''

    if (name.includes('piano')) {
      apps = `Ôû© Eventos familiares\n`
      apps += `Ôû© Presentaciones\n`
      apps += `Ôû© Composici├│n propia\n`
      apps += `Ôû© Relajaci├│n personal\n`
    } else if (name.includes('dise├▒o')) {
      apps = `Ôû© Redes sociales\n`
      apps += `Ôû© Publicidad\n`
      apps += `Ôû© Branding empresarial\n`
      apps += `Ôû© Freelance\n`
    } else if (name.includes('excel') || name.includes('office')) {
      apps = `Ôû© Reportes empresariales\n`
      apps += `Ôû© Control de inventarios\n`
      apps += `Ôû© An├ílisis de datos\n`
      apps += `Ôû© Presupuestos\n`
    } else if (name.includes('programaci├│n') || name.includes('programacion')) {
      apps = `Ôû© Desarrollo web\n`
      apps += `Ôû© Apps m├│viles\n`
      apps += `Ôû© Automatizaci├│n\n`
      apps += `Ôû© Startups\n`
    } else if (name.includes('marketing')) {
      apps = `Ôû© Tu propio negocio\n`
      apps += `Ôû© Agencia digital\n`
      apps += `Ôû© E-commerce\n`
      apps += `Ôû© Consultor├¡a\n`
    } else if (name.includes('ingl├®s') || name.includes('ingles') || name.includes('idioma')) {
      apps = `Ôû© Trabajo internacional\n`
      apps += `Ôû© Viajes\n`
      apps += `Ôû© Estudios en el exterior\n`
      apps += `Ôû© Negocios globales\n`
    } else if (name.includes('trading')) {
      apps = `Ôû© Inversiones personales\n`
      apps += `Ôû© Ingresos extra\n`
      apps += `Ôû© Independencia financiera\n`
      apps += `Ôû© Gesti├│n de portafolio\n`
    } else {
      apps = `Ôû© Trabajo\n`
      apps += `Ôû© Emprendimiento\n`
      apps += `Ôû© Desarrollo personal\n`
      apps += `Ôû© Freelance\n`
    }

    return apps
  }

  /**
   * ­ƒåò Maneja preguntas frecuentes sobre productos digitales
   * Responde preguntas como:
   * - ┬┐Es un curso completo?
   * - ┬┐Tengo que pagar algo m├ís?
   * - ┬┐Puedo descargarlo?
   * - ┬┐C├│mo lo recibo?
   * - ┬┐Acceso de por vida?
   */
  private handleDigitalProductFAQ(message: string, product: any): string {
    const msg = message.toLowerCase()
    const productName = product.name
    const price = this.formatPrice(product.price)
    
    // Detectar tipo de pregunta y responder apropiadamente
    
    // ┬┐Es curso completo? / ┬┐Todo incluido?
    if (/(curso|pack|megapack)\s*(completo|full)|todo\s*incluido|completo/i.test(msg)) {
      return `┬íS├¡! ­ƒÿè El *${productName}* es un curso/pack COMPLETO.\n\n` +
        `Ô£à *Incluye TODO el contenido*\n` +
        `Ô£à Sin m├│dulos ocultos\n` +
        `Ô£à Sin pagos adicionales\n` +
        `Ô£à Acceso de por vida\n\n` +
        `Es un pago ├║nico de *${price} COP* y ya tienes acceso a todo el material ­ƒÄ»\n\n` +
        `┬┐Te lo aparto? ­ƒÆ│`
    }
    
    // ┬┐Hay que pagar algo m├ís? / ┬┐Pagos adicionales?
    if (/(pagar\s*(algo\s*)?(m├ís|mas|extra|adicional)|pago\s*(├║nico|unico|una\s*vez)|sin\s*(pagos?\s*)?(adicionales?|extras?))/i.test(msg)) {
      return `┬íNo! ­ƒÖî Es un *pago ├║nico* de *${price} COP*\n\n` +
        `Ô£à Sin suscripciones mensuales\n` +
        `Ô£à Sin pagos ocultos\n` +
        `Ô£à Sin renovaciones\n` +
        `Ô£à Acceso permanente\n\n` +
        `Pagas una vez y el contenido es tuyo para siempre ­ƒÆ¬\n\n` +
        `┬┐Quieres los datos de pago? ­ƒÆ│`
    }
    
    // ┬┐Puedo descargarlo? / ┬┐Se puede descargar?
    if (/(puedo\s*(descargarlo|bajarlo|guardarlo)|se\s*(puede\s*)?(descargar|bajar|guardar))/i.test(msg)) {
      return `┬íClaro que s├¡! ­ƒôÑ\n\n` +
        `El *${productName}* lo puedes:\n\n` +
        `Ô£à *Descargar* a tu computador o celular\n` +
        `Ô£à *Ver online* cuando quieras\n` +
        `Ô£à *Guardar* en tu Google Drive personal\n\n` +
        `Te env├¡o el acceso por Google Drive apenas confirmes el pago ­ƒÜÇ\n\n` +
        `┬┐Te paso los datos? ­ƒÆ│`
    }
    
    // ┬┐Puedo verlo online?
    if (/(verlo\s*(en\s*)?(l├¡nea|linea|online)|ver\s*online)/i.test(msg)) {
      return `┬íS├¡! ­ƒÆ╗ Puedes verlo online o descargarlo.\n\n` +
        `El *${productName}* te lo comparto por Google Drive:\n\n` +
        `Ô£à Ver online desde cualquier dispositivo\n` +
        `Ô£à Descargar para ver sin internet\n` +
        `Ô£à Acceso 24/7 sin l├¡mites\n\n` +
        `┬┐Listo para obtenerlo? ­ƒÄ»`
    }
    
    // ┬┐Acceso de por vida? / ┬┐Expira?
    if (/(acceso\s*(de\s*por\s*vida|permanente|ilimitado)|cu├ínto\s*tiempo\s*(tengo|dura)|expira|caduca|vence|es\s*para\s*siempre)/i.test(msg)) {
      return `┬íAcceso DE POR VIDA! ÔÖ¥´©Å\n\n` +
        `El *${productName}*:\n\n` +
        `Ô£à *No expira nunca*\n` +
        `Ô£à Acceso permanente\n` +
        `Ô£à Puedes verlo las veces que quieras\n` +
        `Ô£à Incluye actualizaciones futuras\n\n` +
        `Una vez que pagas, es tuyo para siempre ­ƒÄü\n\n` +
        `┬┐Te interesa? ­ƒÆ│`
    }
    
    // ┬┐C├│mo lo recibo? / ┬┐Por d├│nde lo env├¡an?
    if (/(c├│mo\s*(lo\s*)?(recibo|obtengo|accedo)|por\s*d├│nde\s*(lo\s*)?(env├¡an|mandan|recibo)|google\s*drive|link\s*de\s*(descarga|acceso)|entrega\s*inmediata|acceso\s*inmediato)/i.test(msg)) {
      return `┬íEntrega INMEDIATA! ÔÜí\n\n` +
        `As├¡ funciona:\n\n` +
        `1´©ÅÔâú Realizas el pago (Nequi, Daviplata, etc.)\n` +
        `2´©ÅÔâú Me env├¡as el comprobante ­ƒô©\n` +
        `3´©ÅÔâú Te env├¡o el link de Google Drive al instante\n\n` +
        `Ô£à Acceso en menos de 5 minutos\n` +
        `Ô£à Disponible 24/7\n\n` +
        `┬┐Procedemos? ­ƒÜÇ`
    }
    
    // Respuesta gen├®rica para otras preguntas FAQ
    return `┬íBuena pregunta! ­ƒÿè\n\n` +
      `Sobre el *${productName}*:\n\n` +
      `Ô£à Es un curso/pack COMPLETO\n` +
      `Ô£à Pago ├║nico de *${price} COP*\n` +
      `Ô£à Sin pagos adicionales\n` +
      `Ô£à Acceso de por vida\n` +
      `Ô£à Puedes descargarlo o verlo online\n` +
      `Ô£à Entrega inmediata por Google Drive\n\n` +
      `┬┐Alguna otra duda o te paso los datos de pago? ­ƒÆ│`
  }

  /**
   * ­ƒåò Maneja objeciones de desconfianza
   * Cuando el cliente expresa dudas sobre legitimidad:
   * - "Es estafa", "piden m├ís plata", "no mandan nada", etc.
   */
  private handleDistrustObjection(message: string, product: any): string {
    const productName = product.name
    const price = this.formatPrice(product.price)
    
    // Respuesta emp├ítica que aborda la desconfianza
    return `Entiendo tu preocupaci├│n, es normal tener dudas ­ƒñØ\n\n` +
      `Te cuento c├│mo trabajamos con el *${productName}*:\n\n` +
      `Ô£à *Pago ├║nico de ${price} COP* - No pedimos m├ís despu├®s\n` +
      `Ô£à *Entrega inmediata* - Apenas pagas, te env├¡o el link\n` +
      `Ô£à *Todo el material completo* - Sin m├│dulos ocultos\n` +
      `Ô£à *Por Google Drive* - Puedes verificar que est├í todo\n\n` +
      `­ƒöÆ *Garant├¡a:* Si no recibes el material, te devuelvo el dinero.\n\n` +
      `Llevamos a├▒os vendiendo cursos digitales y tenemos clientes satisfechos que pueden dar referencias.\n\n` +
      `┬┐Tienes alguna otra duda? Estoy aqu├¡ para ayudarte ­ƒÿè`
  }

  /**
   * ­ƒåò Maneja objeciones de precio
   * Cuando el cliente dice que est├í caro, no tiene plata, etc.
   */
  private handlePriceObjection(message: string, product: any): string {
    const productName = product.name
    const price = this.formatPrice(product.price)
    const msg = message.toLowerCase()
    
    // Detectar tipo de objeci├│n de precio
    const noTienePlata = /(no tengo|no cuento|no dispongo|sin plata|sin dinero|no hay plata)/i.test(msg)
    const pideDscto = /(descuento|rebaja|menos|promo|oferta)/i.test(msg)
    const estaCaro = /(caro|costoso|mucho|elevado)/i.test(msg)
    
    if (noTienePlata) {
      // Cliente no tiene dinero ahora
      return `Entiendo perfectamente, a veces el presupuesto est├í ajustado ­ƒÆ¬\n\n` +
        `El *${productName}* estar├í disponible cuando puedas:\n\n` +
        `­ƒÆ░ Precio: ${price} COP\n` +
        `­ƒôª Entrega inmediata por Google Drive\n\n` +
        `Si quieres, te puedo guardar la info y me escribes cuando est├®s listo ­ƒÿè\n\n` +
        `┬┐O prefieres que te muestre opciones m├ís econ├│micas?`
    }
    
    if (pideDscto) {
      // Cliente pide descuento
      return `┬íClaro que te entiendo! Todos buscamos el mejor precio ­ƒÿè\n\n` +
        `Te cuento: el *${productName}* ya tiene un precio especial de *${price} COP*\n\n` +
        `Ô£à Incluye TODO el material completo\n` +
        `Ô£à Acceso de por vida\n` +
        `Ô£à Entrega inmediata\n\n` +
        `Es una inversi├│n que vale cada peso ­ƒÆ¬\n\n` +
        `┬┐Te lo aparto? ­ƒÄ»`
    }
    
    // Objeci├│n general de precio (est├í caro)
    return `Entiendo que el precio es importante ­ƒñØ\n\n` +
      `Mira lo que incluye el *${productName}* por ${price} COP:\n\n` +
      `Ô£à Material completo y actualizado\n` +
      `Ô£à Acceso permanente (de por vida)\n` +
      `Ô£à Sin pagos adicionales\n` +
      `Ô£à Entrega inmediata por Google Drive\n\n` +
      `Comparado con cursos presenciales o plataformas de suscripci├│n, es una inversi├│n ├║nica que te queda para siempre ­ƒÆ¬\n\n` +
      `┬┐Qu├® te parece? ┬┐Te lo aparto?`
  }

  private generateFollowUpResponse(product: any): string {
    const price = this.formatPrice(product.price)
    const productName = product.name
    
    // Respuesta emp├ítica y no presionante
    let response = `┬íHey, sin problema! ­ƒÿè Entiendo que quieras pensarlo.\n\n`
    response += `El *${productName}* aqu├¡ sigue disponible. Cuando est├®s listo, solo me escribes y lo retomamos. Sin presi├│n, ┬┐va? ­ƒñØ\n\n`
    response += `­ƒÆ░ Precio: ${price} COP\n`
    response += `­ƒôª Entrega inmediata\n\n`
    response += `ÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöü\n\n`
    response += `┬┐Hay algo m├ís en lo que pueda ayudarte? ­ƒñØ`
    
    return response
  }

  private generateFutureInterestResponse(product: any | null = null): string {
    let response = `┬íClaro que s├¡! Quedo muy pendiente. ­ƒÿè\n\n`
    if (product) {
       response += `Aqu├¡ guardar├® la info del *${product.name}* para cuando est├®s listo.\n\n`
    }
    response += `Escr├¡beme cuando quieras retomar. ┬íUn saludo! ­ƒæï`
    return response
  }

  /**
   * Saludo din├ímico - muestra categor├¡as reales de productos cargados, SIN PRECIOS
   */
  private async getGreetingResponse(): Promise<string> {
    // Obtener categor├¡as din├ímicas de los productos cargados
    const categories = this.getAvailableCategories()
    
    // Intentar obtener configuraci├│n del negocio
    let businessName = 'Tecnovariedades D&S'
    try {
      if (this.userId) {
        const settings = await db.botSettings.findFirst({
          where: { userId: this.userId }
        })
        if (settings?.businessName) {
          businessName = settings.businessName
        }
      }
    } catch (error) {
      console.error('Error obteniendo configuraci├│n:', error)
    }

    // Construir lista de categor├¡as din├ímicamente
    let categoriesText = ''
    for (const cat of categories) {
      categoriesText += `   ${cat.emoji} ${cat.name}\n\n`
    }

    // Si no hay categor├¡as, mostrar mensaje gen├®rico
    if (!categoriesText) {
      categoriesText = `   ­ƒôª Productos disponibles\n\n`
    }

    return `┬íHola! ­ƒæï 

Bienvenido a *${businessName}*

ÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöü

Tenemos de todo para ti:

${categoriesText}ÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöü

Cu├®ntame qu├® andas buscando ­ƒÿè`
  }

  /**
   * Obtiene las categor├¡as disponibles bas├índose en los productos cargados
   */
  private getAvailableCategories(): { name: string; emoji: string }[] {
    if (!this.products || this.products.length === 0) {
      return []
    }

    const categoryMap = new Map<string, { name: string; emoji: string; count: number }>()

    for (const product of this.products) {
      const name = product.name.toLowerCase()
      
      if (name.includes('port├ítil') || name.includes('portatil') || name.includes('laptop') || name.includes('notebook')) {
        const key = 'laptops'
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: 'Laptops y Computadores', emoji: '­ƒÆ╗', count: 0 })
        }
        categoryMap.get(key)!.count++
      } else if (name.includes('impresora') || name.includes('multifuncional')) {
        const key = 'impresoras'
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: 'Impresoras', emoji: '­ƒû¿´©Å', count: 0 })
        }
        categoryMap.get(key)!.count++
      } else if (name.includes('tablet') || name.includes('ipad')) {
        const key = 'tablets'
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: 'Tablets', emoji: '­ƒô▒', count: 0 })
        }
        categoryMap.get(key)!.count++
      } else if (name.includes('monitor') || name.includes('pantalla')) {
        const key = 'monitores'
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: 'Monitores', emoji: '­ƒûÑ´©Å', count: 0 })
        }
        categoryMap.get(key)!.count++
      } else if (name.includes('moto') || name.includes('motocicleta')) {
        const key = 'motos'
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: 'Motos', emoji: '­ƒÅì´©Å', count: 0 })
        }
        categoryMap.get(key)!.count++
      } else if (name.includes('mega pack') || name.includes('megapack') || name.includes('curso') || product.category === 'DIGITAL') {
        const key = 'cursos'
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: 'Cursos Digitales', emoji: '­ƒôÜ', count: 0 })
        }
        categoryMap.get(key)!.count++
      } else if (name.includes('aud├¡fono') || name.includes('audifono') || name.includes('auricular')) {
        const key = 'audifonos'
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: 'Aud├¡fonos', emoji: '­ƒÄº', count: 0 })
        }
        categoryMap.get(key)!.count++
      } else if (name.includes('teclado') || name.includes('mouse') || name.includes('rat├│n')) {
        const key = 'accesorios'
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: 'Accesorios', emoji: 'Ôî¿´©Å', count: 0 })
        }
        categoryMap.get(key)!.count++
      }
    }

    // Ordenar por cantidad de productos y limitar a 6
    const sortedCategories = Array.from(categoryMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map(({ name, emoji }) => ({ name, emoji }))

    return sortedCategories
  }

  private async getContactResponse(): Promise<string> {
    try {
      if (this.userId) {
        const settings = await db.botSettings.findFirst({
          where: { userId: this.userId }
        })

        if (settings) {
          const businessName = settings.businessName || 'Tecnovariedades D&S'
          const whatsappNumber = settings.whatsappNumber || '+57 3136174267'
          const businessAddress = settings.businessAddress || 'Cali, Valle del Cauca'
          
          return `­ƒô× *CONTACTO ${businessName.toUpperCase()}*

Ô£à WhatsApp: ${whatsappNumber}
­ƒôì ${businessAddress}

┬┐Algo m├ís en lo que te pueda colaborar? ­ƒÿè`
        }
      }
    } catch (error) {
      console.error('Error obteniendo configuraci├│n:', error)
    }

    return `­ƒô× *CONTACTO TECNOVARIEDADES D&S*

Ô£à WhatsApp: +57 3136174267
­ƒôì Cali, Valle del Cauca

┬┐Algo m├ís en lo que te pueda colaborar? ­ƒÿè`
  }

  private getFarewellResponse(lastProduct: any): string {
    let response = `┬íGracias por escribirnos! ­ƒÖÅ\n\n`
    if (lastProduct) {
      response += `Recuerda que el *${lastProduct.name}* est├í disponible cuando lo necesites.\n\n`
    }
    response += `­ƒô× WhatsApp: +57 3136174267\n`
    response += `┬íQue tengas un excelente d├¡a! ­ƒÿè`
    return response
  }

  /**
   * ­ƒôØ CLIENTE VA A ENVIAR COMPROBANTE
   * Usa IA para responder de forma natural y no repetitiva
   */
  private async handleWillSendReceipt(lastProduct: any, message: string, history: { role: string; content: string }[]): Promise<string> {
    console.log('­ƒôØ [WillSendReceipt] Cliente indica que enviar├í comprobante - usando IA')
    
    // Construir contexto para la IA
    let productContext = ''
    if (lastProduct) {
      productContext = `
PRODUCTO EN CONTEXTO:
- Nombre: ${lastProduct.name}
- Precio: ${this.formatPrice(lastProduct.price)} COP
- Tipo: ${this.isPhysicalProduct(lastProduct) ? 'F├¡sico' : 'Digital'}
`
    }
    
    const systemPrompt = `Eres un asistente de ventas amable de Tecnovariedades D&S.

El cliente acaba de indicar que va a enviar el comprobante de pago.
${productContext}

INSTRUCCIONES:
- Responde de forma breve, amable y natural (1-2 oraciones m├íximo)
- Confirma que estar├ís pendiente del comprobante
- NO repitas los m├®todos de pago
- NO des instrucciones largas
- Conserva un tono conversacional y c├ílido
- Puedes usar 1-2 emojis m├íximo
- Si hay producto en contexto, puedes mencionarlo brevemente

EJEMPLOS DE RESPUESTAS BUENAS:
- "┬íPerfecto! Aqu├¡ estar├® pendiente ­ƒÿè"
- "┬íGenial! Cuando lo tengas me avisas y te paso el acceso"
- "┬íListo! Te espero con el comprobante"
- "Ok, aqu├¡ estoy cuando lo env├¡es ­ƒæì"

Responde SOLO con el mensaje, sin explicaciones adicionales.`

    try {
      // Usar IA h├¡brida para responder
      const aiResponse = await askGroq(message, systemPrompt)
      
      if (aiResponse && aiResponse.length > 0 && aiResponse.length < 300) {
        return aiResponse
      }
    } catch (error) {
      console.error('Error usando IA para will_send_receipt:', error)
    }
    
    // Fallback simple si la IA falla
    if (lastProduct) {
      return `┬íPerfecto! ­ƒæì Aqu├¡ estar├® pendiente de tu comprobante para *${lastProduct.name}*.`
    }
    return `┬íPerfecto! ­ƒæì Aqu├¡ estar├® pendiente.`
  }

  /**
   * ­ƒôª MANEJO DE COMPROBANTE DE PAGO
   * Cuando el cliente env├¡a comprobante, entrega el link de Google Drive
   */
  private async handlePaymentReceipt(lastProduct: any, userPhone: string): Promise<string> {
    console.log('­ƒôª [PaymentReceipt] Cliente env├¡a comprobante de pago')
    
    // Si hay producto en contexto, entregar ese
    if (lastProduct && lastProduct.deliveryLink) {
      console.log(`­ƒôª [PaymentReceipt] Entregando: ${lastProduct.name}`)
      
      return `­ƒÄë *┬íPAGO RECIBIDO!*

┬íGracias por tu compra! ­ƒÖÅ

­ƒôª *Producto:* ${lastProduct.name}
­ƒÆ░ *Valor:* ${this.formatPrice(lastProduct.price)} COP

­ƒöù *Tu acceso est├í listo:*
${lastProduct.deliveryLink}

­ƒôØ *Instrucciones:*
1. Haz clic en el enlace
2. Inicia sesi├│n con tu cuenta de Google
3. ┬íDisfruta tu contenido!

­ƒÆí *Importante:*
- El acceso es de por vida
- Puedes descargar el contenido
- Guarda este mensaje

ÔØô ┬┐Tienes alguna duda? Escr├¡beme ­ƒÿè

_Tecnovariedades D&S_ Ô£¿`
    }
    
    // Si hay producto pero sin link de entrega (producto f├¡sico)
    if (lastProduct && !lastProduct.deliveryLink) {
      const isPhysical = this.isPhysicalProduct(lastProduct)
      
      if (isPhysical) {
        return `Ô£à *┬íComprobante recibido!*

Gracias por tu pago de *${lastProduct.name}* ­ƒÖÅ

­ƒôª *Siguiente paso:*
Nuestro equipo verificar├í el pago y te contactar├í para coordinar la entrega.

­ƒôì *Opciones de entrega:*
Ôû© Recoger en tienda (Cali)
Ôû© Contraentrega

­ƒô× Te confirmaremos en breve.

_Tecnovariedades D&S_ Ô£¿`
      }
    }
    
    // Si no hay producto en contexto
    return `Ô£à *┬íComprobante recibido!*

Gracias por enviarlo ­ƒÖÅ

Para entregarte tu acceso, por favor confirma:
­ƒôª *┬┐Cu├íl producto compraste?*

Dime el nombre y te env├¡o el link de acceso inmediatamente ­ƒÜÇ`
  }

  /**
   * Respuesta gen├®rica - USA IA H├ìBRIDA, nunca men├║ est├ítico
   * Ollama primero, Groq si falla
   */
  private async getGenericResponseWithAI(message: string, history: { role: string; content: string }[]): Promise<string> {
    // Construir contexto de la conversaci├│n
    const context = history.slice(-6).map(h => `${h.role}: ${h.content}`).join('\n')
    
    // Usar sistema h├¡brido
    const aiResponse = await getHybridResponse(message, context, this.products)
    return aiResponse
  }

  /**
   * Respuesta con contexto de producto espec├¡fico
   * Usa IA para responder preguntas sobre el producto actual
   */
  private async getProductContextResponse(
    message: string, 
    product: any, 
    history: { role: string; content: string }[]
  ): Promise<string> {
    const price = this.formatPrice(product.price)
    const isPhysical = this.isPhysicalProduct(product)
    
    // Construir contexto rico del producto
    const productInfo = `
PRODUCTO ACTUAL: ${product.name}
PRECIO: ${price} COP
TIPO: ${isPhysical ? 'Producto f├¡sico' : 'Producto digital'}
DESCRIPCI├ôN: ${product.description || 'Sin descripci├│n'}
ENTREGA: ${isPhysical ? 'Env├¡o a toda Colombia' : 'Entrega inmediata por Google Drive'}
LINKS DE PAGO:
${product.paymentLinkMercadoPago ? `- MercadoPago: ${product.paymentLinkMercadoPago}` : ''}
${product.paymentLinkPayPal ? `- PayPal: ${product.paymentLinkPayPal}` : ''}
${product.paymentLinkCustom ? `- Otro: ${product.paymentLinkCustom}` : ''}
`
    
    // Historial reciente
    const recentHistory = history.slice(-4).map(h => `${h.role}: ${h.content}`).join('\n')
    
    const fullContext = `${productInfo}\n\nHISTORIAL:\n${recentHistory}`
    
    // Intentar con Ollama primero
    const ollamaResponse = await askOllama(message, fullContext)
    if (ollamaResponse) {
      return ollamaResponse
    }
    
    // Si Ollama falla, usar Groq
    const groqResponse = await askGroq(message, fullContext, [product])
    if (groqResponse) {
      return groqResponse
    }
    
    // Fallback: Respuesta basada en el producto
    return this.generateValueResponse(product)
  }

  /**
   * Respuesta gen├®rica simple (fallback sin IA)
   */
  private getGenericResponse(): string {
    const categories = this.getAvailableCategories()
    
    let categoriesText = ''
    for (const cat of categories.slice(0, 4)) {
      categoriesText += `${cat.emoji} ${cat.name}\n`
    }

    if (!categoriesText) {
      categoriesText = `­ƒôª Productos disponibles\n`
    }

    return `┬íClaro! ­ƒÿè 

Cu├®ntame m├ís sobre lo que buscas:

${categoriesText}
┬┐Para qu├® lo necesitas? As├¡ te recomiendo la mejor opci├│n ­ƒÄ»`
  }

  clearContext(userPhone: string) {
    this.conversations.delete(userPhone)
  }

  getContext(userPhone: string): ConversationContext | null {
    return this.conversations.get(userPhone) || null
  }

  /**
   * ­ƒåò Procesa mensaje usando el nuevo sistema multi-servicio
   * Este m├®todo es OPCIONAL - usa UnifiedResponseService para negocios
   * que no son solo tiendas (servicios, restaurantes, h├¡bridos)
   */
  async processMessageMultiService(
    message: string, 
    userPhone: string, 
    context?: any
  ): Promise<ProcessedResponse> {
    try {
      // Verificar si hay userId
      const userId = context?.userId || this.userId
      if (!userId) {
        console.log('ÔÜá´©Å No userId, usando sistema tradicional')
        return this.processMessage(message, userPhone, context)
      }

      // Obtener contexto del negocio
      const businessContext = await UnifiedResponseService.getBusinessContext(userId)
      
      // Si es tienda tradicional (STORE) o no detectado, usar sistema actual
      if (businessContext.type === 'STORE' || businessContext.type === 'UNKNOWN') {
        console.log(`­ƒÅ¬ Negocio tipo ${businessContext.type}, usando sistema tradicional`)
        return this.processMessage(message, userPhone, context)
      }

      // Para SERVICE, RESTAURANT o HYBRID, usar nuevo sistema
      console.log(`­ƒÄ» Negocio tipo ${businessContext.type}, usando sistema multi-servicio`)
      
      // Convertir productos al formato Item
      const items = this.products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        images: p.images,
        stock: p.stock,
        duration: (p as any).duration,
        requiresBooking: (p as any).requiresBooking,
        ingredients: (p as any).ingredients
      }))

      // Procesar con UnifiedResponseService
      const result = await UnifiedResponseService.processMessage(
        message,
        userId,
        userPhone,
        items
      )

      // Convertir ResponseResult a ProcessedResponse
      return {
        text: result.text,
        intent: result.flow,
        salesStage: result.stage,
        sendPhotos: result.sendMedia,
        photos: result.mediaUrls || null,
        product: result.currentProduct
      }

    } catch (error) {
      console.error('ÔØî Error en multi-service, fallback a tradicional:', error)
      return this.processMessage(message, userPhone, context)
    }
  }

  /**
   * ­ƒåò Detecta y actualiza el tipo de negocio basado en los productos
   */
  async detectBusinessType(): Promise<string> {
    if (!this.userId) return 'UNKNOWN'
    
    try {
      const context = await BusinessContextDetector.detectAndSave(this.userId)
      console.log(`­ƒÅó Tipo de negocio detectado: ${context.type} (${(context.confidence * 100).toFixed(0)}%)`)
      return context.type
    } catch (error) {
      console.error('Error detectando tipo de negocio:', error)
      return 'UNKNOWN'
    }
  }

  /**
   * Genera una respuesta inteligente para preguntas que no tienen un template espec├¡fico
   */
  private async generateAIAnswer(
    question: string,
    currentProduct: any | null,
    history: any[]
  ): Promise<string> {
    const prompt = `Eres un asesor de ventas experto de "Tecnovariedades D&S". Tu objetivo es responder la pregunta del cliente de forma profesional, c├ílida y orientada a la venta.

CONTEXTO DEL PRODUCTO:
${currentProduct ? `${currentProduct.name} ($${currentProduct.price} COP): ${currentProduct.description}
${currentProduct.paymentLinkMercadoPago ? `- Link MercadoPago (Tarjeta/PSE): ${currentProduct.paymentLinkMercadoPago}` : ''}
${currentProduct.paymentLinkPayPal ? `- Link PayPal: ${currentProduct.paymentLinkPayPal}` : ''}
${currentProduct.paymentLinkCustom ? `- Otro Link de Pago: ${currentProduct.paymentLinkCustom}` : ''}` : 'No hay un producto espec├¡fico en este momento.'}

HISTORIAL DE CONVERSACI├ôN:
${history.slice(-4).map(h => `${h.role === 'user' ? 'Cliente' : 'Asistente'}: ${h.content}`).join('\n')}

PREGUNTA DEL CLIENTE:
"${question}"

INSTRUCCIONES CR├ìTICAS:
- ÔØî NUNCA inventes informaci├│n que no est├® en el contexto de arriba
- ÔØî NO menciones productos, precios o caracter├¡sticas que no aparezcan arriba
- Ô£à USA SOLO la informaci├│n del producto y links de pago proporcionados
- Ô£à Si no tienes la informaci├│n exacta, di "d├®jame verificar eso" o "un momento, te confirmo"
- Ô£à Responde directamente, sin rodeos, m├íximo 3-4 l├¡neas
- Ô£à Usa un tono humano, profesional y c├ílido
- Ô£à Incluye 1-2 emojis naturales
- Ô£à Si preguntan por contacto: WhatsApp +57 3136174267, Ubicaci├│n: Cali, Valle del Cauca
- Ô£à Si piden datos de pago: Nequi/Daviplata 3136174267 (Tecnovariedades D&S)

RESPUESTA (en espa├▒ol):`;

    try {
      const url = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
      
      // Timeout para Ollama
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || 'gemma2:2b',
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.3,
            num_predict: 300
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId)

      if (response.ok) {
        const data: any = await response.json();
        return data.response.trim();
      }
    } catch (e) {
      console.log('ÔÜá´©Å Ollama fall├│ en generateAIAnswer, usando Groq...');
    }

    const completion = await this.groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    });

    return completion.choices[0]?.message?.content?.trim() || 'Entiendo tu duda. D├®jame consultar la informaci├│n exacta para ayudarte mejor. ­ƒÿè';
  }
}

// ­ƒåò Multi-tenant Instance Cache
const salesAgentInstances = new Map<string, SalesAgentSimple>()

/**
 * Obtiene o crea una instancia de SalesAgentSimple para un usuario espec├¡fico
 * @param userId ID del due├▒o de la tienda (tenant)
 */
export function getSalesAgent(userId?: string): SalesAgentSimple {
  const key = userId || 'default'
  
  if (!salesAgentInstances.has(key)) {
    console.log(`­ƒåò Creando nueva instancia de SalesAgent para: ${key}`)
    salesAgentInstances.set(key, new SalesAgentSimple(userId))
  }
  
  return salesAgentInstances.get(key)!
}

