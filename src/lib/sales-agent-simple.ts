/**
 * SalesAgentSimple - Agente de ventas inteligente híbrido
 * Usa Ollama (local) primero, Groq para análisis profundo
 * NO rebota al menú - siempre intenta resolver
 * NO INVENTA - usa solo información real de la BD
 */

import { db } from './db'
import Groq from 'groq-sdk'

// Cliente Groq para análisis profundo
let groqClient: Groq | null = null
function getGroqClient(): Groq | null {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return groqClient
}

// ============================================
// ⏳ SIMULACIÓN DE ESCRITURA (TYPING)
// ============================================

/**
 * Calcula el tiempo de "escribiendo" basado en la longitud del mensaje
 * Mínimo 1 segundo, máximo 3 segundos
 */
export function calculateTypingDelay(responseLength: number): number {
  const baseDelay = 1000 // 1 segundo mínimo
  const charDelay = 10 // 10ms por caracter
  const calculated = baseDelay + Math.min(responseLength * charDelay, 2000)
  return Math.min(calculated, 3000) // Máximo 3 segundos
}

/**
 * Espera simulando que el bot está escribiendo
 */
export async function simulateTyping(delayMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, delayMs))
}

// ============================================
// 🤖 SISTEMA HÍBRIDO: OLLAMA + GROQ
// ============================================

/**
 * Consulta a Ollama (local, rápido) - Primera opción
 * @param prompt - Mensaje del usuario
 * @param context - Contexto de la conversación
 * @returns Respuesta de Ollama o null si falla
 */
async function askOllama(prompt: string, context: string = ''): Promise<string | null> {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'
    const model = process.env.OLLAMA_MODEL || 'llama3.1:8b'
    
    console.log(`🦙 Consultando Ollama (${model})...`)
    
    const systemPrompt = `Eres un agente de ventas profesional de Tecnovariedades D&S en Colombia.

REGLAS CRÍTICAS - OBLIGATORIAS:
1. ❌ NUNCA inventes información, precios o características
2. ✅ USA SOLO la información proporcionada en el contexto
3. ✅ Si no tienes la información, di "déjame verificar"
4. ✅ Responde en español, natural y amigable
5. ✅ Guía sutilmente hacia la venta sin ser agresivo

ENTREGA:
- DIGITALES: Envío por Google Drive después del pago
- FÍSICOS: Recoger en tienda (Cali) o Contraentrega
${context ? `\nINFORMACIÓN DISPONIBLE:\n${context}` : ''}`

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
      })
    })

    if (!response.ok) {
      console.log(`⚠️ Ollama no disponible: ${response.status}`)
      return null
    }

    const data = await response.json()
    const answer = data.response?.trim()
    
    if (answer && answer.length > 10) {
      console.log(`✅ Ollama respondió: ${answer.substring(0, 50)}...`)
      return answer
    }
    
    return null
  } catch (error: any) {
    console.log(`⚠️ Error Ollama: ${error.message}`)
    return null
  }
}

/**
 * Consulta a Groq (análisis profundo) - Segunda opción
 * @param prompt - Mensaje del usuario
 * @param context - Contexto de la conversación
 * @param products - Lista de productos disponibles
 * @returns Respuesta de Groq o null si falla
 */
async function askGroq(prompt: string, context: string = '', products: any[] = []): Promise<string | null> {
  try {
    const client = getGroqClient()
    if (!client) {
      console.log('⚠️ Groq no configurado')
      return null
    }

    console.log('🧠 Consultando Groq (Agente de Ventas Profesional)...')

    // Crear catálogo organizado por categorías
    const digitales = products.filter(p => p.category === 'DIGITAL' || p.name.toLowerCase().includes('mega') || p.name.toLowerCase().includes('curso'))
    const fisicos = products.filter(p => p.category !== 'DIGITAL' && !p.name.toLowerCase().includes('mega') && !p.name.toLowerCase().includes('curso'))
    
    const formatProduct = (p: any) => `• ${p.name} - ${p.price?.toLocaleString('es-CO') || '?'} COP`
    
    const catalogoDigital = digitales.map(formatProduct).join('\n')
    const catalogoFisico = fisicos.map(formatProduct).join('\n')

    const systemPrompt = `Eres un AGENTE DE VENTAS PROFESIONAL de Tecnovariedades D&S (Colombia).

🎯 TU PERSONALIDAD:
- Amigable, cercano y natural (como hablar con un amigo que sabe de tecnología)
- Paciente y comprensivo (el cliente puede escribir mal o no saber qué busca)
- Persuasivo pero NO agresivo (guías hacia la venta sin presionar)
- Resolutivo (siempre das una respuesta útil, nunca dejas al cliente sin ayuda)

🧠 TUS CAPACIDADES:
1. ENTENDER: Comprende lo que el cliente quiere aunque escriba mal, use jerga o sea ambiguo
2. RAZONAR: Analiza qué producto le conviene según lo que dice
3. DIALOGAR: Mantén conversaciones naturales, haz preguntas para entender mejor
4. RESOLVER: Responde dudas sobre productos, pagos, entregas, garantías
5. VENDER: Guía sutilmente hacia la compra destacando beneficios

📦 CATÁLOGO - PRODUCTOS DIGITALES (${digitales.length}):
${catalogoDigital || 'Sin productos digitales'}

📦 CATÁLOGO - PRODUCTOS FÍSICOS (${fisicos.length}):
${catalogoFisico || 'Sin productos físicos'}

💳 MÉTODOS DE PAGO:
- Nequi: 3136174267
- Daviplata: 3136174267  
- MercadoPago (tarjeta/PSE)
- PayPal (internacional)

📬 ENTREGA:
- DIGITALES: Inmediata por Google Drive después del pago
- FÍSICOS: Contraentrega a toda Colombia o recoger en Cali

⚠️ REGLAS CRÍTICAS:
1. ❌ NUNCA inventes productos, precios o información que no esté en el catálogo
2. ❌ NUNCA digas "no tenemos" sin antes buscar bien en el catálogo
3. ✅ Si el cliente pide algo que no existe, sugiere alternativas del catálogo
4. ✅ Usa el nombre EXACTO y precio del catálogo cuando menciones un producto
5. ✅ Responde en español colombiano natural (puedes usar "parcero", "listo", "dale")
6. ✅ Usa emojis con moderación (1-3 por mensaje)
7. ✅ Mantén respuestas concisas pero completas (no más de 4-5 líneas)

🎯 ESTRATEGIA DE VENTA (AIDA):
- Atención: Capta el interés con el beneficio principal
- Interés: Explica qué incluye y por qué es valioso
- Deseo: Destaca el ahorro o la oportunidad única
- Acción: Invita a comprar de forma natural ("¿Te lo aparto?", "¿Quieres los datos de pago?")

${context ? `\n💬 CONVERSACIÓN PREVIA:\n${context}` : ''}`

    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 400
    })

    const answer = completion.choices[0]?.message?.content?.trim()
    
    if (answer && answer.length > 10) {
      console.log(`✅ Groq respondió: ${answer.substring(0, 50)}...`)
      return answer
    }

    return null
  } catch (error: any) {
    console.log(`⚠️ Error Groq: ${error.message}`)
    return null
  }
}

/**
 * 🧠 BÚSQUEDA INTELIGENTE CON IA
 * Cuando la búsqueda local falla, usa IA para:
 * 1. Entender la intención del usuario (aunque escriba mal)
 * 2. Buscar el producto más relevante en el catálogo
 * 3. Responder con información REAL de la BD
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

    console.log(`🧠 Búsqueda inteligente IA para: "${query}"`)

    // Crear lista de productos para que la IA busque
    const productList = products.map((p, i) => {
      const precio = p.price?.toLocaleString('es-CO') || '?'
      return `${i + 1}. ${p.name} - ${precio} COP`
    }).join('\n')

    const systemPrompt = `Eres un buscador de productos inteligente para una tienda colombiana.

TAREA: Analiza lo que el cliente busca y encuentra el producto más relevante del catálogo.

CATÁLOGO (${products.length} productos):
${productList}

INSTRUCCIONES CRÍTICAS:
1. Entiende la INTENCIÓN del cliente aunque escriba mal (typos, errores ortográficos)
2. Busca coincidencias por: nombre, tema, categoría, palabras clave
3. Si encuentras un producto relevante, responde SOLO con el número
4. Si no hay coincidencia clara, responde "0"

CORRECCIONES DE TYPOS COMUNES:
- "megapak", "megapack", "mega pak" → buscar "Mega Pack"
- "goldem", "golder", "goldenn" → buscar "Golden"
- "pino", "pian" → buscar "Piano"
- "exel", "exsel", "ecxel" → buscar "Excel"
- "ingles", "inglés", "englis" → buscar "Inglés"
- "tradign", "tradin", "traiding" → buscar "Trading"
- "diseño", "diseno", "disenio" → buscar "Diseño"
- "programasion", "programacion" → buscar "Programación" o "Hacking"

EJEMPLOS DE BÚSQUEDA:
- "megapak goldem" → buscar producto con "Golden" en el nombre
- "curso de pino" → buscar producto con "Piano" en el nombre
- "quiero aprender ingles" → buscar producto con "Inglés" en el nombre
- "algo de diseño grafico" → buscar producto con "Diseño" en el nombre
- "tradign forex" → buscar producto con "Trading" en el nombre
- "exel avanzado" → buscar producto con "Excel" en el nombre
- "resina epoxica" → buscar producto con "Resina" en el nombre

INTENCIONES AMBIGUAS - Sugiere el producto más relevante:
- "quiero ganar dinero" → Trading o Marketing
- "necesito para mi negocio" → Marketing, Excel o Diseño
- "algo para aprender música" → Piano
- "mejorar mi trabajo" → Excel o Office
- "emprender" → Marketing o Trading
- "trabajar desde casa" → Diseño, Marketing o Excel

Responde SOLO con el número del producto (1, 2, 3...) o "0" si no hay coincidencia.`

    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Cliente busca: "${query}"` }
      ],
      temperature: 0.1, // Más determinístico para búsquedas
      max_tokens: 10
    })

    const answer = completion.choices[0]?.message?.content?.trim() || '0'
    const productIndex = parseInt(answer) - 1

    if (productIndex >= 0 && productIndex < products.length) {
      const foundProduct = products[productIndex]
      console.log(`✅ IA encontró: ${foundProduct.name}`)
      return { product: foundProduct, response: null }
    }

    console.log(`❌ IA no encontró producto específico`)
    return { product: null, response: null }
  } catch (error: any) {
    console.log(`⚠️ Error en búsqueda IA: ${error.message}`)
    return { product: null, response: null }
  }
}

/**
 * Sistema híbrido: Ollama primero, Groq si falla
 * NUNCA rebota al menú - siempre intenta resolver
 */
async function getHybridResponse(
  message: string, 
  context: string = '', 
  products: any[] = []
): Promise<string> {
  // 1. Intentar con Ollama (local, rápido)
  const ollamaResponse = await askOllama(message, context)
  if (ollamaResponse) {
    return ollamaResponse
  }

  // 2. Si Ollama falla, usar Groq (análisis profundo)
  const groqResponse = await askGroq(message, context, products)
  if (groqResponse) {
    return groqResponse
  }

  // 3. Fallback inteligente (nunca menú genérico)
  return `¡Claro! 😊 Cuéntame más sobre lo que buscas y te ayudo a encontrar la mejor opción.

¿Es para uso personal, trabajo o estudio? Así te puedo recomendar algo que se ajuste a tus necesidades 🎯`
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

  constructor() {
    this.loadProducts()
  }

  /**
   * Carga productos del usuario actual (multi-tenant)
   * Si no hay userId, carga todos los productos disponibles
   */
  private async loadProducts() {
    try {
      const whereClause: any = { status: 'AVAILABLE' }
      
      // Multi-tenant: filtrar por userId si está definido
      if (this.userId) {
        whereClause.userId = this.userId
      }
      
      const products = await db.product.findMany({
        where: whereClause,
        orderBy: { price: 'asc' }
      })
      this.products = products
      console.log(`✅ SalesAgent: ${products.length} productos cargados${this.userId ? ` para usuario ${this.userId}` : ''}`)
    } catch (error) {
      console.error('❌ Error cargando productos:', error)
      this.products = []
    }
  }

  async reloadProducts() {
    await this.loadProducts()
  }

  /**
   * Establece el userId y recarga los productos de ese usuario
   * Esto es CLAVE para el funcionamiento multi-tenant
   */
  setUserId(userId: string) {
    if (this.userId !== userId) {
      this.userId = userId
      // Recargar productos del nuevo usuario
      this.loadProducts()
    }
  }

  async processMessage(message: string, userPhone: string, context?: any): Promise<ProcessedResponse> {
    try {
      console.log(`📨 Procesando: "${message}"`)

      // Multi-tenant: Si hay contexto con userId, establecerlo
      if (context?.userId && context.userId !== this.userId) {
        this.userId = context.userId
        await this.loadProducts() // Recargar productos del usuario
      }

      // Recargar productos si están vacíos
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

      const intent = this.detectIntent(message)
      console.log(`🎯 Intención detectada: ${intent}`)
      console.log(`📦 Producto en contexto: ${userCtx.lastProduct?.name || 'ninguno'}`)

      // Si pide más info y ya tiene producto
      if (intent === 'more_info' && userCtx.lastProduct) {
        userCtx.stage = 'value_proposition'
        const response = this.generateValueResponse(userCtx.lastProduct)
        userCtx.history.push({ role: 'assistant', content: response })
        return {
          text: response,
          intent: 'more_info',
          salesStage: 'value_proposition',
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

      // Verificar selección por número
      const selectedByNumber = this.detectNumberSelection(message, userCtx.lastOptions)
      if (selectedByNumber) {
        console.log(`✅ Seleccionado por número: ${selectedByNumber.name}`)
        userCtx.lastProduct = selectedByNumber
        userCtx.lastOptions = []
        userCtx.stage = 'presentation'
        const response = this.generateProductResponse(selectedByNumber)
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

      // Buscar producto específico
      let product = this.buscarProducto(message)
      
      // 🧠 Si búsqueda local falla, usar IA para buscar (entiende typos y errores)
      if (!product && this.products.length > 0) {
        console.log(`🧠 Búsqueda local falló, intentando con IA...`)
        const aiSearch = await searchProductWithAI(message, this.products)
        if (aiSearch.product) {
          product = aiSearch.product
          console.log(`✅ IA encontró producto: ${product.name}`)
        }
      }
      
      if (product) {
        console.log(`✅ Producto específico encontrado: ${product.name}`)
        userCtx.lastProduct = product
        userCtx.lastOptions = []
        userCtx.stage = 'presentation'
        const response = this.generateProductResponse(product)
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

      // Buscar por categoría - SOLO si NO hay producto en contexto
      if ((intent === 'general_inquiry' || intent === 'greeting') && !userCtx.lastProduct) {
        const { productos, categoria } = this.buscarProductosPorCategoria(message)
        if (productos.length > 1) {
          console.log(`📂 Categoría: ${categoria}, Productos: ${productos.length}`)
          const productosOrdenados = productos.sort((a, b) => a.price - b.price)
          userCtx.lastOptions = productosOrdenados.slice(0, 4)
          userCtx.stage = 'discovery'
          const response = this.generateCategoryResponse(productos, categoria || 'productos', message)
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
          const response = this.generateProductResponse(productos[0])
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

      // 🧠 Si hay producto en contexto y es pregunta general, usar IA con contexto del producto
      if (intent === 'general_inquiry' && userCtx.lastProduct) {
        console.log(`🧠 Pregunta sobre producto en contexto: ${userCtx.lastProduct.name}`)
        const productContext = `El cliente está preguntando sobre: ${userCtx.lastProduct.name} (${this.formatPrice(userCtx.lastProduct.price)} COP). ${userCtx.lastProduct.description || ''}`
        const response = await this.getProductContextResponse(message, userCtx.lastProduct, userCtx.history)
        userCtx.history.push({ role: 'assistant', content: response })
        return {
          text: response,
          intent: 'product_followup',
          salesStage: userCtx.stage,
          sendPhotos: false,
          photos: null,
          product: userCtx.lastProduct
        }
      }

      // Respuestas según intención
      let response: string

      if (intent === 'rejection' && userCtx.lastProduct) {
        response = this.generateFollowUpResponse(userCtx.lastProduct)
      } else if (intent === 'payment_inquiry' && userCtx.lastProduct) {
        response = await this.generatePaymentResponse(userCtx.lastProduct)
      } else if (intent === 'will_send_receipt') {
        // Cliente dice que enviará el comprobante - usar IA para responder naturalmente
        response = await this.handleWillSendReceipt(userCtx.lastProduct, message, userCtx.history)
      } else if (intent === 'payment_receipt') {
        // Cliente envía comprobante de pago - entregar link de Google Drive
        response = await this.handlePaymentReceipt(userCtx.lastProduct, userPhone)
      } else if (intent === 'confirmation' && !userCtx.lastProduct) {
        // Cliente quiere comprar pero no hay producto en contexto
        response = `¡Genial que quieras comprar! 🎉\n\n¿Cuál producto te interesa? Dime el nombre o número y te paso los datos de pago 💳`
      } else if (intent === 'greeting') {
        response = await this.getGreetingResponse()
      } else if (intent === 'contact_request') {
        response = await this.getContactResponse()
      } else if (intent === 'farewell') {
        response = this.getFarewellResponse(userCtx.lastProduct)
        this.conversations.set(userPhone, {
          lastProduct: null,
          lastOptions: [],
          stage: 'greeting',
          history: []
        })
      } else {
        // 🤖 SISTEMA HÍBRIDO: Usar IA para resolver cualquier consulta
        // NUNCA rebota al menú - siempre intenta resolver con Ollama/Groq
        console.log('🤖 Usando sistema híbrido para resolver consulta...')
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
      console.error('❌ Error procesando mensaje:', error)
      return {
        text: '🤖 Disculpa, tuve un problema. ¿Podrías repetir? 🙏',
        intent: 'error',
        salesStage: 'awareness',
        sendPhotos: false,
        photos: null
      }
    }
  }

  private detectIntent(message: string): string {
    const msg = message.toLowerCase().trim()

    // PREGUNTA DE SEGUIMIENTO SOBRE PRODUCTO ACTUAL
    // Detecta: "y cómo viene", "cómo es", "qué trae", "y qué incluye", etc.
    if (/(^y\s|^entonces\s|^pero\s)?(c[oó]mo\s*(viene|es|funciona|se entrega)|qu[eé]\s*(trae|incluye|tiene|contiene)|cu[aá]nto\s*(dura|pesa|mide)|de qu[eé]\s*(trata|va))/i.test(msg)) {
      return 'more_info'
    }

    // MÁS INFORMACIÓN
    if (/(más info|mas info|más información|mas informacion|cuéntame más|cuentame mas|qué incluye|que incluye|qué trae|que trae|para qué sirve|para que sirve|qué aprendo|que aprendo|beneficios|ventajas|detalles|explícame|explicame|dime más|dime mas|más detalles|mas detalles|quiero saber más|quiero saber mas|características|caracteristicas|especificaciones|specs)/i.test(msg)) {
      return 'more_info'
    }

    // CONFIRMACIÓN DE COMPRA
    const confirmationPatterns = [
      /^(si|sí|ok|dale|va|listo|claro|por supuesto|perfecto|bueno|está bien|esta bien|de una|hagámoslo|hagamoslo)(\s*$|!|\.|\,)/i,
      /^(si|sí)\s*(me\s*)?(gustaría|gustaria|interesa|encanta|parece bien)$/i,
      /^me interesa$/i,
      /^(lo quiero|lo compro|quiero comprarlo|me lo llevo|si lo quiero|sí lo quiero|lo necesito|lo tomo)$/i,
      /(manda|mándame|mandame|envía|envíame|enviame|dame|pásame|pasame|dime)\s*(los\s*)?(datos|info|información|informacion|link|enlace)/i,
      /quiero\s*(los\s*)?(datos|comprarlo|pagarlo|adquirirlo)/i,
      /(como|cómo)\s*(lo\s*)?(compro|pago|adquiero|obtengo|consigo)/i,
      /(claro que si|claro que sí|por supuesto|obvio|seguro|definitivamente|sin duda|de acuerdo|acepto)/i,
      /(si|sí),?\s*(lo quiero|lo compro|dale|va|me interesa)$/i,
      /^si,?\s*(quiero|me interesa|lo quiero|lo compro|dale)/i,
      // Patrones más flexibles para capturar variaciones y typos comunes
      /(qu[ie]+[ea]?r?o|kiero|quieto)\s*(comprarlo|comprar|llevarlo|llevar|adquirirlo|pagarlo)/i,
      /lo\s*(qu[ie]+[ea]?r?o|kiero|quieto|compro|llevo|necesito)/i,
      /^(comprarlo|comprar|llevarmelo|llevarlo)$/i,
      /(dame|deme|pasame|pásame)\s*(el\s*)?(link|enlace|datos)/i,
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

    // RECHAZO/DUDA
    if (/(no gracias|no por ahora|después|despues|lo pienso|muy caro|no tengo|no puedo|tal vez|quizás|quizas|no estoy seguro|no me interesa|no necesito|está caro|esta caro|es mucho|no alcanza)/i.test(msg)) {
      return 'rejection'
    }

    // CLIENTE VA A ENVIAR COMPROBANTE (futuro) - "cuando tenga el recibo lo envío"
    if (/(cuando (tenga|tengo)|ya (te|le) (envío|envio|mando)|te (envío|envio|mando) (el|cuando)|lo (envío|envio|mando)|vale.*(envío|envio|mando)|ok.*(envío|envio|mando)|listo.*(envío|envio|mando)|bueno.*(envío|envio|mando)|perfecto.*(envío|envio|mando))/i.test(msg)) {
      return 'will_send_receipt'
    }

    // COMPROBANTE DE PAGO YA ENVIADO (pasado) - "ya pagué", "aquí está el comprobante"
    if (/(ya pagu[eé]|ya transfer[ií]|ya hice (el|la) (pago|transferencia)|listo (el )?pago|pago (hecho|realizado|listo)|te env[ií][eé] (el )?(comprobante|recibo|captura|pantallazo)|aqu[ií] (est[aá]|va) (el )?(comprobante|recibo)|mira (el )?(comprobante|pago)|comprobante (de )?(pago|transferencia)|recibo (de )?(pago|transferencia)|captura (del? )?(pago|nequi|daviplata)|pantallazo (del? )?(pago|nequi|daviplata)|ya le (mand[eé]|envi[eé]))/i.test(msg)) {
      return 'payment_receipt'
    }

    // PAGO
    if (/(pago|pagar|tarjeta|efectivo|transferencia|nequi|daviplata|bancolombia|mercadopago|paypal|como pago|cómo pago|métodos de pago|metodos de pago|formas de pago)/i.test(msg)) {
      return 'payment_inquiry'
    }

    // SALUDO PURO
    if (/^(hola|buenos|buenas|hey|hi|hello|saludos|qué tal|que tal|buenas noches|buenos días|buenos dias|buenas tardes)(\s|$|!|\?|\.)*$/i.test(msg)) {
      return 'greeting'
    }

    // CONTACTO
    if (/(contacto|número|numero|teléfono|telefono|whatsapp|llamar|ubicación|ubicacion|dirección|direccion|donde están|donde estan)/i.test(msg)) {
      return 'contact_request'
    }

    // DESPEDIDA
    if (/^(gracias|bye|adiós|adios|chao|hasta luego|nos vemos|muchas gracias|te agradezco|genial gracias)(\s|$|!|\?|\.)*$/i.test(msg)) {
      return 'farewell'
    }

    return 'general_inquiry'
  }

  private detectNumberSelection(message: string, options: any[]): any | null {
    if (!options || options.length === 0) return null

    const msg = message.toLowerCase().trim()

    const patterns = [
      /^(el|la|opci[oó]n|n[uú]mero|numero)?\s*(\d+)$/i,
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
      console.log('⚠️ No hay productos cargados')
      return null
    }

    const queryLower = query.toLowerCase()
    console.log(`🔍 Buscando producto en: "${queryLower}"`)

    // 🔥 BÚSQUEDA DIRECTA PRIMERO - Si el nombre del producto está en la consulta
    // Esto captura casos como "mega pack golden", "megapack golden", etc.
    for (const product of this.products) {
      const productNameLower = product.name.toLowerCase()
      // Buscar coincidencia directa del nombre completo o parcial significativo
      const productWords = productNameLower.split(/\s+/)
      
      // Si todas las palabras del producto están en la consulta
      const allWordsMatch = productWords.every(word => 
        word.length > 2 && queryLower.includes(word)
      )
      if (allWordsMatch && productWords.length >= 2) {
        console.log(`✅ Encontrado por coincidencia directa: ${product.name}`)
        return product
      }
      
      // Buscar palabras distintivas (no genéricas) del nombre del producto
      const distinctiveWords = productWords.filter((w: string) => 
        w.length > 4 && !['mega', 'pack', 'curso', 'cursos', 'de', 'para', 'desde', 'con', 'sin', 'usb', 'wifi', 'ram', 'ssd', 'ddr4', 'ddr5', 'fhd', 'intel', 'core', 'amd', 'ryzen', 'pantalla'].includes(w)
      )
      for (const word of distinctiveWords) {
        if (queryLower.includes(word)) {
          console.log(`✅ Encontrado por palabra distintiva "${word}": ${product.name}`)
          return product
        }
      }
    }

    // Palabras genéricas a ignorar
    const stopWords = ['hola', 'buenos', 'buenas', 'dias', 'tardes', 'noches', 'quiero', 'necesito', 'tienes', 'tienen', 'hay', 'disponible', 'interesa', 'precio', 'costo', 'cuanto', 'cuánto', 'que', 'qué', 'cual', 'cuál', 'como', 'cómo', 'para', 'por', 'con', 'sin', 'una', 'uno', 'los', 'las', 'del', 'the', 'sobre', 'info', 'información', 'curso', 'cursos', 'mega', 'pack', 'me', 'un', 'estudiar', 'trabajar', 'usar', 'de', 'algo', 'desde', 'casa', 'aprender']

    // 🔧 CORRECCIÓN DE TYPOS COMUNES (búsqueda local rápida)
    const typoCorrections: { [key: string]: string } = {
      // Golden
      'goldem': 'golden', 'golder': 'golden', 'goldenn': 'golden',
      // Piano
      'pino': 'piano', 'pianos': 'piano',
      // Excel
      'exel': 'excel', 'exsel': 'excel', 'ecxel': 'excel', 'excell': 'excel',
      // Inglés
      'ingles': 'inglés', 'englis': 'inglés', 'english': 'inglés', 'inlges': 'inglés',
      // Trading
      'tradign': 'trading', 'traiding': 'trading', 'tradng': 'trading',
      // Diseño
      'diseno': 'diseño', 'disenio': 'diseño',
      // Programación
      'programasion': 'programación', 'programacion': 'programación', 'programing': 'programación',
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
        console.log(`🔧 Typo corregido: "${word}" → "${typoCorrections[word]}"`)
        wasTypoCorrected = true
      } else {
        correctedWords.push(word)
      }
    }
    
    if (wasTypoCorrected) {
      correctedQuery = correctedWords.join(' ')
      console.log(`🔍 Buscando con consulta corregida: "${correctedQuery}"`)
      for (const product of this.products) {
        const productNameLower = product.name.toLowerCase()
        // Buscar palabras distintivas en la consulta corregida
        const searchWords = correctedWords.filter(w => w.length > 3 && !stopWords.includes(w))
        for (const word of searchWords) {
          if (productNameLower.includes(word)) {
            console.log(`✅ Encontrado por typo corregido "${word}": ${product.name}`)
            return product
          }
        }
      }
    }

    // 🎯 DETECCIÓN DE INTENCIONES AMBIGUAS
    // Mapea intenciones a productos relevantes
    // IMPORTANTE: Usar frases completas para evitar falsos positivos
    const intentionMap: { [key: string]: string[] } = {
      'ganar dinero': ['trading', 'marketing'],
      'dinero extra': ['trading', 'marketing'],
      'ingresos pasivos': ['trading', 'marketing'],
      'negocio propio': ['marketing', 'excel', 'diseño'],
      'emprender': ['marketing', 'trading'],
      'aprender música': ['piano'],
      'tocar instrumento': ['piano'],
      'mejorar trabajo': ['excel', 'office'],
      'trabajo oficina': ['excel', 'office'],
      'crear contenido': ['diseño', 'marketing'],
      'redes sociales': ['marketing', 'redes'],
      'freelance': ['diseño', 'programación'],
      'trabajar desde casa': ['diseño', 'marketing', 'excel'],
      'trabajo remoto': ['diseño', 'programación'],
      'aprender ingles': ['inglés'],
      'aprender inglés': ['inglés'],
      'hablar ingles': ['inglés'],
      'hablar inglés': ['inglés'],
      'idioma ingles': ['inglés'],
      'idioma inglés': ['inglés'],
      'curso ingles': ['inglés'],
      'curso inglés': ['inglés']
    }

    // Buscar intenciones completas (frases exactas primero)
    for (const [intention, keywords] of Object.entries(intentionMap)) {
      // Verificar que la frase completa esté en la consulta
      if (queryLower.includes(intention)) {
        for (const keyword of keywords) {
          const producto = this.products.find(p => 
            p.name.toLowerCase().includes(keyword)
          )
          if (producto) {
            console.log(`✅ Encontrado por intención "${intention}": ${producto.name}`)
            return producto
          }
        }
      }
    }

    const keywords = queryLower
      .replace(/[¿?!.,]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))

    console.log(`🔑 Palabras clave: ${keywords.join(', ')}`)

    // Buscar en nombre del producto
    for (const keyword of keywords) {
      const producto = this.products.find(p =>
        p.name.toLowerCase().includes(keyword)
      )
      if (producto) {
        console.log(`✅ Encontrado por nombre: ${producto.name}`)
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
        console.log(`✅ Encontrado por tag: ${producto.name}`)
        return producto
      }
    }

    console.log(`❌ No se encontró producto`)
    return null
  }

  private buscarProductosPorCategoria(query: string): { productos: any[], categoria: string | null } {
    if (!this.products || this.products.length === 0) {
      return { productos: [], categoria: null }
    }

    const queryLower = query.toLowerCase()
    let categoria: string | null = null
    let productos: any[] = []

    if (queryLower.includes('portátil') || queryLower.includes('portatil') || queryLower.includes('laptop') || queryLower.includes('notebook')) {
      categoria = 'portátiles'
      productos = this.products.filter(p => {
        const name = p.name.toLowerCase()
        return name.includes('portátil') || name.includes('portatil') || name.includes('laptop') || name.includes('notebook') || name.includes('macbook')
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
    } else if (queryLower.includes('diseño') || queryLower.includes('photoshop')) {
      categoria = 'cursos de diseño'
      productos = this.products.filter(p => {
        const name = p.name.toLowerCase()
        return name.includes('diseño') || name.includes('photoshop') || name.includes('gráfico')
      })
    } else if (queryLower.includes('programación') || queryLower.includes('programacion') || queryLower.includes('desarrollo')) {
      categoria = 'cursos de programación'
      productos = this.products.filter(p => {
        const name = p.name.toLowerCase()
        return name.includes('programación') || name.includes('programacion') || name.includes('desarrollo')
      })
    }

    console.log(`📂 Categoría: ${categoria}, Productos: ${productos.length}`)
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
        
        // 1. Si es URL pública (http/https), retornar directamente
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          console.log(`📸 Imagen URL para ${product.name}: ${imageUrl.substring(0, 50)}...`)
          return imageUrl
        }
        
        // 2. Si es ruta local (/fotos/...), retornar para que Baileys la maneje
        if (imageUrl.startsWith('/fotos/') || imageUrl.startsWith('fotos/')) {
          console.log(`📸 Imagen local para ${product.name}: ${imageUrl}`)
          return imageUrl
        }
        
        // 3. Otra ruta relativa
        if (imageUrl.startsWith('/')) {
          console.log(`📸 Imagen relativa para ${product.name}: ${imageUrl}`)
          return imageUrl
        }
      }
      
      console.log(`⚠️ No se encontró imagen para: ${product.name}`)
      return null
    } catch (error) {
      console.error(`❌ Error obteniendo imagen:`, error)
      return null
    }
  }

  private generatePhotoCaption(product: any): string {
    const price = this.formatPrice(product.price)
    const isPhysical = this.isPhysicalProduct(product)
    
    // ═══════════════════════════════════════
    // 📸 FORMATO CARD PROFESIONAL
    // ═══════════════════════════════════════
    
    let caption = `╔══════════════════════════╗\n`
    caption += `   🎯 *${product.name}*\n`
    caption += `╚══════════════════════════╝\n\n`
    
    // Precio destacado
    caption += `💰 *PRECIO: ${price} COP*\n\n`
    
    // Descripción corta
    if (product.description) {
      const shortDesc = product.description.length > 150 
        ? product.description.substring(0, 150) + '...'
        : product.description
      caption += `📝 ${shortDesc}\n\n`
    }
    
    // Beneficios según tipo
    caption += `━━━━━━━━━━━━━━━━━━━━\n`
    if (isPhysical) {
      caption += `✅ Producto nuevo con garantía\n`
      caption += `🚚 Envío a toda Colombia\n`
      caption += `🔧 Soporte técnico incluido\n`
    } else {
      caption += `✅ Acceso de por vida\n`
      caption += `📦 Entrega inmediata (Google Drive)\n`
      caption += `🔄 Actualizaciones incluidas\n`
    }
    caption += `━━━━━━━━━━━━━━━━━━━━\n\n`
    
    // Call to action
    caption += `💬 *¿Te interesa? Escríbeme y te cuento más* 😊`
    
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
      console.error('Error obteniendo imágenes:', error)
    }
    
    return images
  }

  private isPhysicalProduct(product: any): boolean {
    if (product.category === 'PHYSICAL') return true
    if (product.category === 'DIGITAL') return false
    
    const name = product.name.toLowerCase()
    const physicalKeywords = [
      'portátil', 'portatil', 'laptop', 'notebook',
      'computador', 'pc', 'desktop',
      'impresora', 'multifuncional', 'scanner',
      'tablet', 'ipad', 'monitor', 'pantalla',
      'teclado', 'mouse', 'ratón',
      'disco', 'ssd', 'memoria ram',
      'cargador', 'batería', 'bateria',
      'audífonos', 'audifonos', 'auriculares',
      'cámara', 'camara', 'webcam',
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

    // ═══════════════════════════════════════
    // 📦 FORMATO CARD PROFESIONAL PARA TEXTO
    // ═══════════════════════════════════════
    
    let response = `╔══════════════════════════╗\n`
    response += `   🎯 *${product.name}*\n`
    response += `╚══════════════════════════╝\n\n`
    
    response += `💰 *PRECIO: ${price} COP*\n\n`

    // Mostrar descripción REAL del producto
    if (product.description) {
      const desc = this.getProductDescription(product.description)
      response += `📝 *DESCRIPCIÓN:*\n${desc}\n\n`
    }

    // Beneficios según tipo
    response += `━━━━━━━━━━━━━━━━━━━━\n`
    response += `✨ *INCLUYE:*\n`
    if (isPhysical) {
      response += `   ✅ Producto nuevo\n`
      response += `   🛡️ Garantía del fabricante\n`
      response += `   🚚 Envío a toda Colombia\n`
      response += `   🔧 Soporte técnico\n`
    } else {
      response += `   ✅ Acceso de por vida\n`
      response += `   📦 Entrega inmediata (Google Drive)\n`
      response += `   🔄 Actualizaciones incluidas\n`
      response += `   💬 Soporte por WhatsApp\n`
    }
    response += `━━━━━━━━━━━━━━━━━━━━\n\n`

    response += `💬 *¿Te interesa? Dime "sí" y te paso los datos de pago* 😊`
    
    return response
  }

  private getProductDescription(description: string): string {
    if (!description) return ''
    
    // Limpiar y formatear la descripción
    const lines = description.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
    
    // Mostrar hasta 300 caracteres o 5 líneas
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

    let response = `¡Claro! 😊 Tenemos varias opciones de *${categoria}*${uso ? ' ' + uso : ''}:\n\n`

    const productosOrdenados = productos.sort((a, b) => a.price - b.price)
    const maxProductos = Math.min(productosOrdenados.length, 4)

    for (let i = 0; i < maxProductos; i++) {
      const p = productosOrdenados[i]
      const price = this.formatPrice(p.price)
      const num = i + 1

      const specs = this.extractSpecs(p)

      response += `*${num}.* ${p.name}\n`
      if (specs) {
        response += `   📋 ${specs}\n`
      }
      response += `   💰 *${price} COP*\n\n`
    }

    if (productos.length > maxProductos) {
      response += `_...y ${productos.length - maxProductos} opciones más_\n\n`
    }

    response += `💡 Dime cuál te llama la atención o el número, y te cuento más 😊`

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

    let response = `¡Excelente elección! 🎉\n\n`
    response += `╔══════════════════════════╗\n`
    response += `   📦 *${product.name}*\n`
    response += `   💰 *Total: ${price} COP*\n`
    response += `╚══════════════════════════╝\n\n`

    // Para productos FÍSICOS: Preguntar método de entrega primero
    if (isPhysical) {
      response += `🚚 *¿CÓMO PREFIERES RECIBIRLO?*\n\n`
      response += `1️⃣ *Recoger en tienda* (Cali)\n`
      response += `   📍 Sin costo adicional\n\n`
      response += `2️⃣ *Contraentrega* (Envío a domicilio)\n`
      response += `   🚛 Pagas cuando lo recibas\n\n`
      response += `━━━━━━━━━━━━━━━━━━━━\n\n`
    }

    response += `💳 *MÉTODOS DE PAGO:*\n\n`

    // MercadoPago dinámico
    let mercadoPagoLink = product.paymentLinkMercadoPago
    if (!mercadoPagoLink && product.id) {
      try {
        const { getOrCreateMercadoPagoLink } = await import('./mercadopago-service')
        mercadoPagoLink = await getOrCreateMercadoPagoLink(product.id)
        if (mercadoPagoLink) {
          console.log(`✅ Link MercadoPago generado para ${product.name}`)
        }
      } catch (error) {
        console.error('Error generando link MercadoPago:', error)
      }
    }

    if (mercadoPagoLink) {
      response += `🔵 *MercadoPago (Tarjeta/PSE):*\n${mercadoPagoLink}\n\n`
    }
    
    // PayPal dinámico
    let paypalLink = product.paymentLinkPayPal
    if (!paypalLink && product.id) {
      try {
        const { getOrCreatePayPalLink } = await import('./paypal-service')
        paypalLink = await getOrCreatePayPalLink(product.id)
        if (paypalLink) {
          console.log(`✅ Link PayPal generado para ${product.name}`)
        }
      } catch (error) {
        console.error('Error generando link PayPal:', error)
      }
    }
    
    if (paypalLink) {
      response += `🟡 *PayPal:*\n${paypalLink}\n\n`
    }
    
    // Link personalizado (Hotmart, etc.)
    if (product.paymentLinkCustom) {
      response += `🟢 *Link de pago:*\n${product.paymentLinkCustom}\n\n`
    }

    // Nequi/Daviplata - Número fijo: 3136174267
    response += `📱 *Transferencia directa:*\n`
    response += `▸ *Nequi:* 3136174267\n`
    response += `▸ *Daviplata:* 3136174267\n\n`

    response += `━━━━━━━━━━━━━━━━━━━━\n\n`

    if (isPhysical) {
      response += `📝 *SIGUIENTE PASO:*\n`
      response += `Dime si prefieres recoger o contraentrega, y envía el comprobante de pago 📸`
    } else {
      response += `📝 *SIGUIENTE PASO:*\n`
      response += `Envía el comprobante y te entrego el acceso por *Google Drive* inmediatamente 🚀`
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

    let response = `🌟 *Más detalles de ${product.name}*\n\n`
    response += `━━━━━━━━━━━━━━━━━━━━\n\n`
    response += `📋 *ESPECIFICACIONES*\n\n`
    response += this.getPhysicalSpecs(product)
    response += `\n━━━━━━━━━━━━━━━━━━━━\n\n`
    response += `✨ *BENEFICIOS*\n\n`
    response += this.getPhysicalBenefits(product)
    response += `\n━━━━━━━━━━━━━━━━━━━━\n\n`
    response += `🛡️ *GARANTÍA*\n\n`
    response += `   ▫️ Producto 100% nuevo\n\n`
    response += `   ▫️ Garantía del fabricante\n\n`
    response += `   ▫️ Soporte técnico incluido\n\n`
    response += `━━━━━━━━━━━━━━━━━━━━\n\n`
    response += `🚚 *ENTREGA*\n\n`
    response += `   ▫️ Envío a toda Colombia\n\n`
    response += `   ▫️ Retiro en Cali disponible\n\n`
    response += `━━━━━━━━━━━━━━━━━━━━\n\n`
    response += `💰 *Precio: ${price} COP*\n\n`
    response += `Si te gusta, solo dime y te lo aparto 😊`

    return response
  }

  private getPhysicalSpecs(product: any): string {
    const name = product.name.toLowerCase()
    const desc = (product.description || '').toLowerCase()
    let specs = ''

    if (name.includes('portátil') || name.includes('portatil') || name.includes('laptop')) {
      const ramMatch = (name + ' ' + desc).match(/(\d+)\s*gb\s*(ram|ddr)/i)
      const storageMatch = (name + ' ' + desc).match(/(\d+)\s*(gb|tb)\s*(ssd|hdd)/i)

      if (name.includes('ryzen')) {
        const ryzenMatch = name.match(/ryzen\s*(\d+)/i)
        if (ryzenMatch) specs += `   🔹 Procesador: AMD Ryzen ${ryzenMatch[1]}\n\n`
      } else if (name.includes('i5')) {
        specs += `   🔹 Procesador: Intel Core i5\n\n`
      } else if (name.includes('i7')) {
        specs += `   🔹 Procesador: Intel Core i7\n\n`
      } else if (name.includes('i3')) {
        specs += `   🔹 Procesador: Intel Core i3\n\n`
      }

      if (ramMatch) specs += `   🔹 Memoria RAM: ${ramMatch[1]}GB\n\n`
      if (storageMatch) specs += `   🔹 Almacenamiento: ${storageMatch[1]}${storageMatch[2].toUpperCase()} ${storageMatch[3].toUpperCase()}\n\n`

      if (name.includes('15') || name.includes('15.6')) {
        specs += `   🔹 Pantalla: 15.6 pulgadas\n\n`
      } else if (name.includes('14')) {
        specs += `   🔹 Pantalla: 14 pulgadas\n\n`
      }

      specs += `   🔹 Sistema: Windows 11\n`
    } else if (name.includes('impresora')) {
      if (name.includes('multifuncional')) {
        specs += `   🔹 Tipo: Multifuncional\n\n`
        specs += `   🔹 Funciones: Imprime, Escanea, Copia\n\n`
      } else {
        specs += `   🔹 Tipo: Impresora\n\n`
      }
      if (name.includes('wifi') || name.includes('inalámbrica')) {
        specs += `   🔹 Conectividad: WiFi + USB\n\n`
      }
      if (name.includes('tinta continua') || name.includes('ecotank')) {
        specs += `   🔹 Sistema de tinta continua\n`
      }
    } else {
      specs += `   🔹 ${product.description || 'Producto de alta calidad'}\n`
    }

    return specs || `   🔹 Consultar especificaciones\n`
  }

  private getPhysicalBenefits(product: any): string {
    const name = product.name.toLowerCase()
    let benefits = ''

    if (name.includes('portátil') || name.includes('portatil') || name.includes('laptop')) {
      if (name.includes('ryzen 7') || name.includes('i7') || name.includes('16gb')) {
        benefits = `   ⭐ Alto rendimiento\n\n`
        benefits += `   ⭐ Multitarea sin problemas\n\n`
        benefits += `   ⭐ Ideal para diseño y programación\n\n`
        benefits += `   ⭐ Batería de larga duración\n`
      } else if (name.includes('ryzen 5') || name.includes('i5')) {
        benefits = `   ⭐ Excelente calidad-precio\n\n`
        benefits += `   ⭐ Perfecto para estudio y trabajo\n\n`
        benefits += `   ⭐ Rápido y eficiente\n\n`
        benefits += `   ⭐ Portátil y liviano\n`
      } else {
        benefits = `   ⭐ Ideal para tareas cotidianas\n\n`
        benefits += `   ⭐ Navegación y Office\n\n`
        benefits += `   ⭐ Económico y funcional\n`
      }
    } else if (name.includes('impresora')) {
      benefits = `   ⭐ Impresiones de alta calidad\n\n`
      benefits += `   ⭐ Bajo costo por página\n\n`
      benefits += `   ⭐ Fácil instalación\n`
    } else {
      benefits = `▸ Producto de calidad garantizada\n▸ Marca reconocida\n▸ Durabilidad comprobada\n`
    }

    return benefits
  }

  private generateDigitalValueResponse(product: any): string {
    const price = this.formatPrice(product.price)
    const marketPrice = Math.round(product.price * 7.5) // Precio de mercado estimado
    const savings = marketPrice - product.price

    let response = `🌟 *¿Por qué ${product.name}?*\n\n`
    
    // Valor real vs nuestro precio
    response += `💎 *VALOR REAL:*\n`
    response += `▸ En el mercado: ${this.formatPrice(marketPrice)} COP\n`
    response += `▸ *Nuestro precio: ${price} COP*\n`
    response += `▸ 💰 *Ahorras: ${this.formatPrice(savings)} COP*\n\n`
    
    // Lo que incluye
    response += `✨ *LO QUE OBTIENES:*\n`
    response += this.getDigitalIncludes(product)
    response += `\n`
    
    // Beneficios
    response += `🚀 *CÓMO TE BENEFICIA:*\n`
    response += this.getDigitalBenefits(product)
    response += `\n`
    
    // Aplicaciones
    response += `💼 *PUEDES APLICARLO EN:*\n`
    response += this.getDigitalApplications(product)
    response += `\n`
    
    // Oferta
    response += `⏰ *OFERTA ESPECIAL:*\n`
    response += `Este precio es por tiempo limitado.\n`
    response += `Acceso de por vida + actualizaciones incluidas.\n\n`
    
    response += `🎯 *¿Te gustaría aprovechar esta oportunidad hoy?*\n`
    response += `Solo dime "dale" y te paso los datos de pago 💳`

    return response
  }

  private getDigitalIncludes(product: any): string {
    const name = product.name.toLowerCase()
    let includes = ''

    if (name.includes('piano')) {
      includes = `▸ 19 horas de video HD\n`
      includes += `▸ 34 artículos de teoría\n`
      includes += `▸ 157 recursos descargables\n`
      includes += `▸ 5 estilos: Clásico, Jazz, Blues, Pop, Balada\n`
    } else if (name.includes('diseño') || name.includes('photoshop')) {
      includes = `▸ Domina Photoshop, Illustrator, InDesign\n`
      includes += `▸ +50 cursos completos\n`
      includes += `▸ Proyectos prácticos\n`
      includes += `▸ Certificado de finalización\n`
    } else if (name.includes('excel') || name.includes('office')) {
      includes = `▸ Excel básico a avanzado\n`
      includes += `▸ Fórmulas y funciones\n`
      includes += `▸ Tablas dinámicas y macros\n`
      includes += `▸ Plantillas profesionales\n`
    } else if (name.includes('programación') || name.includes('programacion')) {
      includes = `▸ Python, JavaScript, Java y más\n`
      includes += `▸ +100 cursos completos\n`
      includes += `▸ Proyectos reales\n`
      includes += `▸ Desarrollo web y móvil\n`
    } else if (name.includes('marketing')) {
      includes = `▸ SEO y posicionamiento\n`
      includes += `▸ Google Ads y Facebook Ads\n`
      includes += `▸ Email marketing\n`
      includes += `▸ Estrategias de ventas\n`
    } else if (name.includes('inglés') || name.includes('ingles') || name.includes('idioma')) {
      includes = `▸ Básico a avanzado\n`
      includes += `▸ Conversación fluida\n`
      includes += `▸ Inglés de negocios\n`
      includes += `▸ Pronunciación perfecta\n`
    } else if (name.includes('trading')) {
      includes = `▸ Análisis técnico completo\n`
      includes += `▸ Forex y criptomonedas\n`
      includes += `▸ Gestión de riesgo\n`
      includes += `▸ Estrategias probadas\n`
    } else {
      // Usar descripción del producto
      if (product.description) {
        const lines = product.description.split('\n').slice(0, 4)
        includes = lines.map((l: string) => `▸ ${l.trim()}`).join('\n') + '\n'
      } else {
        includes = `▸ Contenido profesional completo\n`
        includes += `▸ Material de alta calidad\n`
        includes += `▸ Acceso inmediato\n`
      }
    }

    return includes
  }

  private getDigitalBenefits(product: any): string {
    const name = product.name.toLowerCase()
    let benefits = ''

    if (name.includes('piano')) {
      benefits = `▸ Toca tus canciones favoritas\n`
      benefits += `▸ Impresiona a familia y amigos\n`
      benefits += `▸ Habilidad para toda la vida\n`
    } else if (name.includes('diseño')) {
      benefits = `▸ Crea diseños profesionales\n`
      benefits += `▸ Trabaja como freelancer\n`
      benefits += `▸ Aumenta tus ingresos\n`
    } else if (name.includes('excel') || name.includes('office')) {
      benefits = `▸ Destaca en tu trabajo\n`
      benefits += `▸ Automatiza tareas\n`
      benefits += `▸ Mejora tu productividad\n`
    } else if (name.includes('programación') || name.includes('programacion')) {
      benefits = `▸ Trabaja en tecnología\n`
      benefits += `▸ Buenos salarios\n`
      benefits += `▸ Trabaja remoto\n`
    } else if (name.includes('marketing')) {
      benefits = `▸ Vende más en tu negocio\n`
      benefits += `▸ Consigue clientes online\n`
      benefits += `▸ Genera ingresos pasivos\n`
    } else if (name.includes('inglés') || name.includes('ingles') || name.includes('idioma')) {
      benefits = `▸ Mejores oportunidades\n`
      benefits += `▸ Viaja sin barreras\n`
      benefits += `▸ Accede a contenido global\n`
    } else if (name.includes('trading')) {
      benefits = `▸ Ingresos desde casa\n`
      benefits += `▸ Libertad financiera\n`
      benefits += `▸ Trabaja cuando quieras\n`
    } else {
      benefits = `▸ Nuevas habilidades\n`
      benefits += `▸ Mejor perfil profesional\n`
      benefits += `▸ Más oportunidades\n`
    }

    return benefits
  }

  private getDigitalApplications(product: any): string {
    const name = product.name.toLowerCase()
    let apps = ''

    if (name.includes('piano')) {
      apps = `▸ Eventos familiares\n`
      apps += `▸ Presentaciones\n`
      apps += `▸ Composición propia\n`
      apps += `▸ Relajación personal\n`
    } else if (name.includes('diseño')) {
      apps = `▸ Redes sociales\n`
      apps += `▸ Publicidad\n`
      apps += `▸ Branding empresarial\n`
      apps += `▸ Freelance\n`
    } else if (name.includes('excel') || name.includes('office')) {
      apps = `▸ Reportes empresariales\n`
      apps += `▸ Control de inventarios\n`
      apps += `▸ Análisis de datos\n`
      apps += `▸ Presupuestos\n`
    } else if (name.includes('programación') || name.includes('programacion')) {
      apps = `▸ Desarrollo web\n`
      apps += `▸ Apps móviles\n`
      apps += `▸ Automatización\n`
      apps += `▸ Startups\n`
    } else if (name.includes('marketing')) {
      apps = `▸ Tu propio negocio\n`
      apps += `▸ Agencia digital\n`
      apps += `▸ E-commerce\n`
      apps += `▸ Consultoría\n`
    } else if (name.includes('inglés') || name.includes('ingles') || name.includes('idioma')) {
      apps = `▸ Trabajo internacional\n`
      apps += `▸ Viajes\n`
      apps += `▸ Estudios en el exterior\n`
      apps += `▸ Negocios globales\n`
    } else if (name.includes('trading')) {
      apps = `▸ Inversiones personales\n`
      apps += `▸ Ingresos extra\n`
      apps += `▸ Independencia financiera\n`
      apps += `▸ Gestión de portafolio\n`
    } else {
      apps = `▸ Trabajo\n`
      apps += `▸ Emprendimiento\n`
      apps += `▸ Desarrollo personal\n`
      apps += `▸ Freelance\n`
    }

    return apps
  }

  private generateFollowUpResponse(product: any): string {
    const price = this.formatPrice(product.price)
    
    let response = `Dale, tranqui 😊\n\n`
    response += `El *${product.name}* queda ahí por si cambias de opinión.\n\n`
    response += `💰 Precio: ${price} COP\n\n`
    response += `━━━━━━━━━━━━━━━━━━━━\n\n`
    response += `¿Te muestro algo más? 🤝`
    
    return response
  }

  /**
   * Saludo dinámico - muestra categorías reales de productos cargados, SIN PRECIOS
   */
  private async getGreetingResponse(): Promise<string> {
    // Obtener categorías dinámicas de los productos cargados
    const categories = this.getAvailableCategories()
    
    // Intentar obtener configuración del negocio
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
      console.error('Error obteniendo configuración:', error)
    }

    // Construir lista de categorías dinámicamente
    let categoriesText = ''
    for (const cat of categories) {
      categoriesText += `   ${cat.emoji} ${cat.name}\n\n`
    }

    // Si no hay categorías, mostrar mensaje genérico
    if (!categoriesText) {
      categoriesText = `   📦 Productos disponibles\n\n`
    }

    return `¡Hola! 👋 

Bienvenido a *${businessName}*

━━━━━━━━━━━━━━━━━━━━

Tenemos de todo para ti:

${categoriesText}━━━━━━━━━━━━━━━━━━━━

Cuéntame qué andas buscando 😊`
  }

  /**
   * Obtiene las categorías disponibles basándose en los productos cargados
   */
  private getAvailableCategories(): { name: string; emoji: string }[] {
    if (!this.products || this.products.length === 0) {
      return []
    }

    const categoryMap = new Map<string, { name: string; emoji: string; count: number }>()

    for (const product of this.products) {
      const name = product.name.toLowerCase()
      
      if (name.includes('portátil') || name.includes('portatil') || name.includes('laptop') || name.includes('notebook')) {
        const key = 'laptops'
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: 'Laptops y Computadores', emoji: '💻', count: 0 })
        }
        categoryMap.get(key)!.count++
      } else if (name.includes('impresora') || name.includes('multifuncional')) {
        const key = 'impresoras'
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: 'Impresoras', emoji: '🖨️', count: 0 })
        }
        categoryMap.get(key)!.count++
      } else if (name.includes('tablet') || name.includes('ipad')) {
        const key = 'tablets'
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: 'Tablets', emoji: '📱', count: 0 })
        }
        categoryMap.get(key)!.count++
      } else if (name.includes('monitor') || name.includes('pantalla')) {
        const key = 'monitores'
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: 'Monitores', emoji: '🖥️', count: 0 })
        }
        categoryMap.get(key)!.count++
      } else if (name.includes('moto') || name.includes('motocicleta')) {
        const key = 'motos'
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: 'Motos', emoji: '🏍️', count: 0 })
        }
        categoryMap.get(key)!.count++
      } else if (name.includes('mega pack') || name.includes('megapack') || name.includes('curso') || product.category === 'DIGITAL') {
        const key = 'cursos'
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: 'Cursos Digitales', emoji: '📚', count: 0 })
        }
        categoryMap.get(key)!.count++
      } else if (name.includes('audífono') || name.includes('audifono') || name.includes('auricular')) {
        const key = 'audifonos'
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: 'Audífonos', emoji: '🎧', count: 0 })
        }
        categoryMap.get(key)!.count++
      } else if (name.includes('teclado') || name.includes('mouse') || name.includes('ratón')) {
        const key = 'accesorios'
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: 'Accesorios', emoji: '⌨️', count: 0 })
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
          
          return `📞 *CONTACTO ${businessName.toUpperCase()}*

✅ WhatsApp: ${whatsappNumber}
📍 ${businessAddress}

¿Algo más en lo que te pueda colaborar? 😊`
        }
      }
    } catch (error) {
      console.error('Error obteniendo configuración:', error)
    }

    return `📞 *CONTACTO TECNOVARIEDADES D&S*

✅ WhatsApp: +57 3136174267
📍 Cali, Valle del Cauca

¿Algo más en lo que te pueda colaborar? 😊`
  }

  private getFarewellResponse(lastProduct: any): string {
    let response = `¡Gracias por escribirnos! 🙏\n\n`
    if (lastProduct) {
      response += `Recuerda que el *${lastProduct.name}* está disponible cuando lo necesites.\n\n`
    }
    response += `📞 WhatsApp: +57 3136174267\n`
    response += `¡Que tengas un excelente día! 😊`
    return response
  }

  /**
   * 📝 CLIENTE VA A ENVIAR COMPROBANTE
   * Usa IA para responder de forma natural y no repetitiva
   */
  private async handleWillSendReceipt(lastProduct: any, message: string, history: { role: string; content: string }[]): Promise<string> {
    console.log('📝 [WillSendReceipt] Cliente indica que enviará comprobante - usando IA')
    
    // Construir contexto para la IA
    let productContext = ''
    if (lastProduct) {
      productContext = `
PRODUCTO EN CONTEXTO:
- Nombre: ${lastProduct.name}
- Precio: ${this.formatPrice(lastProduct.price)} COP
- Tipo: ${this.isPhysicalProduct(lastProduct) ? 'Físico' : 'Digital'}
`
    }
    
    const systemPrompt = `Eres un asistente de ventas amable de Tecnovariedades D&S.

El cliente acaba de indicar que va a enviar el comprobante de pago.
${productContext}

INSTRUCCIONES:
- Responde de forma breve, amable y natural (1-2 oraciones máximo)
- Confirma que estarás pendiente del comprobante
- NO repitas los métodos de pago
- NO des instrucciones largas
- Conserva un tono conversacional y cálido
- Puedes usar 1-2 emojis máximo
- Si hay producto en contexto, puedes mencionarlo brevemente

EJEMPLOS DE RESPUESTAS BUENAS:
- "¡Perfecto! Aquí estaré pendiente 😊"
- "¡Genial! Cuando lo tengas me avisas y te paso el acceso"
- "¡Listo! Te espero con el comprobante"
- "Ok, aquí estoy cuando lo envíes 👍"

Responde SOLO con el mensaje, sin explicaciones adicionales.`

    try {
      // Usar IA híbrida para responder
      const aiResponse = await askGroq(message, systemPrompt)
      
      if (aiResponse && aiResponse.length > 0 && aiResponse.length < 300) {
        return aiResponse
      }
    } catch (error) {
      console.error('Error usando IA para will_send_receipt:', error)
    }
    
    // Fallback simple si la IA falla
    if (lastProduct) {
      return `¡Perfecto! 👍 Aquí estaré pendiente de tu comprobante para *${lastProduct.name}*.`
    }
    return `¡Perfecto! 👍 Aquí estaré pendiente.`
  }

  /**
   * 📦 MANEJO DE COMPROBANTE DE PAGO
   * Cuando el cliente envía comprobante, entrega el link de Google Drive
   */
  private async handlePaymentReceipt(lastProduct: any, userPhone: string): Promise<string> {
    console.log('📦 [PaymentReceipt] Cliente envía comprobante de pago')
    
    // Si hay producto en contexto, entregar ese
    if (lastProduct && lastProduct.deliveryLink) {
      console.log(`📦 [PaymentReceipt] Entregando: ${lastProduct.name}`)
      
      return `🎉 *¡PAGO RECIBIDO!*

¡Gracias por tu compra! 🙏

📦 *Producto:* ${lastProduct.name}
💰 *Valor:* ${this.formatPrice(lastProduct.price)} COP

🔗 *Tu acceso está listo:*
${lastProduct.deliveryLink}

📝 *Instrucciones:*
1. Haz clic en el enlace
2. Inicia sesión con tu cuenta de Google
3. ¡Disfruta tu contenido!

💡 *Importante:*
- El acceso es de por vida
- Puedes descargar el contenido
- Guarda este mensaje

❓ ¿Tienes alguna duda? Escríbeme 😊

_Tecnovariedades D&S_ ✨`
    }
    
    // Si hay producto pero sin link de entrega (producto físico)
    if (lastProduct && !lastProduct.deliveryLink) {
      const isPhysical = this.isPhysicalProduct(lastProduct)
      
      if (isPhysical) {
        return `✅ *¡Comprobante recibido!*

Gracias por tu pago de *${lastProduct.name}* 🙏

📦 *Siguiente paso:*
Nuestro equipo verificará el pago y te contactará para coordinar la entrega.

📍 *Opciones de entrega:*
▸ Recoger en tienda (Cali)
▸ Contraentrega

📞 Te confirmaremos en breve.

_Tecnovariedades D&S_ ✨`
      }
    }
    
    // Si no hay producto en contexto
    return `✅ *¡Comprobante recibido!*

Gracias por enviarlo 🙏

Para entregarte tu acceso, por favor confirma:
📦 *¿Cuál producto compraste?*

Dime el nombre y te envío el link de acceso inmediatamente 🚀`
  }

  /**
   * Respuesta genérica - USA IA HÍBRIDA, nunca menú estático
   * Ollama primero, Groq si falla
   */
  private async getGenericResponseWithAI(message: string, history: { role: string; content: string }[]): Promise<string> {
    // Construir contexto de la conversación
    const context = history.slice(-6).map(h => `${h.role}: ${h.content}`).join('\n')
    
    // Usar sistema híbrido
    const aiResponse = await getHybridResponse(message, context, this.products)
    return aiResponse
  }

  /**
   * Respuesta con contexto de producto específico
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
TIPO: ${isPhysical ? 'Producto físico' : 'Producto digital'}
DESCRIPCIÓN: ${product.description || 'Sin descripción'}
ENTREGA: ${isPhysical ? 'Envío a toda Colombia' : 'Entrega inmediata por Google Drive'}
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
   * Respuesta genérica simple (fallback sin IA)
   */
  private getGenericResponse(): string {
    const categories = this.getAvailableCategories()
    
    let categoriesText = ''
    for (const cat of categories.slice(0, 4)) {
      categoriesText += `${cat.emoji} ${cat.name}\n`
    }

    if (!categoriesText) {
      categoriesText = `📦 Productos disponibles\n`
    }

    return `¡Claro! 😊 

Cuéntame más sobre lo que buscas:

${categoriesText}
¿Para qué lo necesitas? Así te recomiendo la mejor opción 🎯`
  }

  clearContext(userPhone: string) {
    this.conversations.delete(userPhone)
  }

  getContext(userPhone: string): ConversationContext | null {
    return this.conversations.get(userPhone) || null
  }
}

// Singleton
let salesAgentInstance: SalesAgentSimple | null = null

export function getSalesAgent(): SalesAgentSimple {
  if (!salesAgentInstance) {
    salesAgentInstance = new SalesAgentSimple()
  }
  return salesAgentInstance
}

