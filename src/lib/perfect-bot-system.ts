/**
 * SISTEMA PERFECTO DE BOT
 * 
 * 1. RAG para búsqueda de productos (rápido, preciso)
 * 2. Ollama para conversaciones racionales (natural, gratis)
 * 3. Groq para razonamiento profundo (casos complejos)
 * 
 * SIN ERRORES BÁSICOS - SISTEMA PROFESIONAL
 */

import { db } from './db'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

// ============================================
// 1. RAG - BÚSQUEDA PERFECTA DE PRODUCTOS
// ============================================
interface ProductMatch {
  id: string
  name: string
  price: number
  description: string
  category: string
  images: string | null
  score: number
}

class ProductRAG {
  /**
   * Búsqueda perfecta de productos con scoring inteligente
   */
  static async search(query: string, userId: string): Promise<ProductMatch | null> {
    const queryLower = query.toLowerCase()
    
    console.log(`[RAG] 🔍 Búsqueda: "${query}"`)

    // Obtener todos los productos disponibles
    const productos = await db.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE'
      }
    })

    if (productos.length === 0) {
      console.log('[RAG] ❌ No hay productos disponibles')
      return null
    }

    // Categorías específicas con palabras clave
    const categorias = {
      'idiomas': ['idiomas', 'idioma', 'ingles', 'frances', 'aleman', 'portugues', 'italiano', 'chino', 'japones', 'language', 'languages'],
      'piano': ['piano'],
      'guitarra': ['guitarra', 'guitar'],
      'diseño': ['diseño', 'design', 'grafico', 'photoshop', 'illustrator', 'corel'],
      'laptop': ['laptop', 'computador', 'portatil', 'notebook', 'asus', 'hp', 'lenovo', 'dell'],
      'moto': ['moto', 'motocicleta', 'pulsar', 'bajaj', 'yamaha', 'honda'],
      'album': ['album', 'albumes', 'coleccion', 'collection']
    }

    // Detectar categoría del usuario
    let categoriaDetectada: string | null = null
    for (const [categoria, palabras] of Object.entries(categorias)) {
      if (palabras.some(p => queryLower.includes(p))) {
        categoriaDetectada = categoria
        console.log(`[RAG] 🏷️  Categoría detectada: ${categoria}`)
        break
      }
    }

    // Scoring de productos
    const scored = productos.map(p => {
      let score = 0
      const nombreLower = p.name.toLowerCase()
      const descLower = (p.description || '').toLowerCase()

      // 1. CATEGORÍA (máxima prioridad)
      // 1. CATEGORÍA (máxima prioridad)
      if (categoriaDetectada) {
        const palabrasCategoria = categorias[categoriaDetectada]
        const perteneceCategoria = palabrasCategoria.some(palabra => 
          nombreLower.includes(palabra) || descLower.includes(palabra)
        )

        // Detectar si estamos hablando de megapacks
        const esMegapack = nombreLower.includes('mega') || nombreLower.includes('pack')
        const buscaMegapack = queryLower.includes('mega') || queryLower.includes('pack')

        if (perteneceCategoria) {
          score += 100 // ✅ Categoría correcta
          console.log(`[RAG]    ✅ ${p.name}: +100 (categoría correcta)`)
        } else {
          // FIX: Si busca megapack y es megapack, no penalizar tan fuerte
          if (esMegapack && buscaMegapack) {
            score -= 10 // ⚠️ Penalización leve
            console.log(`[RAG]    ⚠️ ${p.name}: -10 (mismatch categoría pero es megapack)`)
          } else {
            score -= 100 // ❌ Categoría incorrecta
            console.log(`[RAG]    ❌ ${p.name}: -100 (categoría incorrecta)`)
          }
        }
      }

      // 2. PALABRAS CLAVE en nombre (alta prioridad)
      const keywords = this.extractKeywords(queryLower)
      keywords.forEach(kw => {
        if (nombreLower.includes(kw)) {
          score += 15
        }
        if (descLower.includes(kw)) {
          score += 5
        }
      })

      // 3. TIPO DE PRODUCTO (megapack, curso, etc.)
      const esMegapack = nombreLower.includes('mega') || nombreLower.includes('pack')
      const buscaMegapack = queryLower.includes('mega') || queryLower.includes('pack')
      
      if (esMegapack && buscaMegapack) {
        score += 20
      } else if (!esMegapack && buscaMegapack) {
        score -= 20
      }

      return {
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description || '',
        category: p.category,
        images: p.images,
        score
      }
    })

    // Ordenar por score
    scored.sort((a, b) => b.score - a.score)

    // Mostrar top 3
    console.log('[RAG] 📊 Top 3 productos:')
    scored.slice(0, 3).forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.name} - Score: ${item.score}`)
    })

    // Retornar el mejor si tiene score positivo
    if (scored[0].score > 0) {
      console.log(`[RAG] ✅ Producto encontrado: ${scored[0].name} (score: ${scored[0].score})`)
      return scored[0]
    }

    console.log('[RAG] ❌ No se encontró producto relevante')
    return null
  }

  private static extractKeywords(query: string): string[] {
    const important = [
      'piano', 'guitarra', 'bateria', 'violin',
      'laptop', 'computador', 'portatil', 'asus', 'hp', 'lenovo',
      'moto', 'pulsar', 'bajaj', 'yamaha',
      'curso', 'megapack', 'pack', 'mega', 'completo',
      'diseño', 'photoshop', 'illustrator', 'grafico',
      'idiomas', 'idioma', 'ingles', 'frances', 'aleman',
      'album', 'coleccion'
    ]

    const found = important.filter(w => query.includes(w))
    
    if (found.length === 0) {
      // FIX: Mejorar extracción para frases compuestas
      const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      
      return normalizedQuery
        .split(/\s+/)
        .filter(w => w.length > 2) // Aceptar palabras de 3 letras (ej: php, sql)
        .filter(w => !['para', 'como', 'cual', 'donde', 'tiene', 'tienes', 'interesa', 'quiero', 'vomo'].includes(w))
        .slice(0, 5) // Aumentar límite de keywords
    }

    return found
  }
}

// ============================================
// 2. OLLAMA - CONVERSACIONES RACIONALES
// ============================================
class OllamaConversation {
  /**
   * Genera respuesta conversacional usando Ollama (gratis, local)
   */
  static async generateResponse(
    userMessage: string,
    producto: ProductMatch | null,
    context: string[]
  ): Promise<string> {
    try {
      // Verificar si Ollama está habilitado
      const ollamaEnabled = process.env.USE_OLLAMA === 'true' || process.env.OLLAMA_ENABLED === 'true'
      const ollamaUrl = process.env.OLLAMA_BASE_URL

      if (!ollamaEnabled || !ollamaUrl) {
        console.log('[Ollama] ⚠️ No configurado, usando respuesta directa')
        return this.directResponse(userMessage, producto)
      }

      console.log('[Ollama] 🤖 Generando respuesta conversacional...')
      console.log(`[Ollama] URL: ${ollamaUrl}`)

      const prompt = this.buildPrompt(userMessage, producto, context)
      const model = process.env.OLLAMA_MODEL || 'gemma2:2b'

      console.log(`[Ollama] Modelo: ${model}`)

      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 300
          }
        })
      })

      if (!response.ok) {
        console.log(`[Ollama] ⚠️ Error HTTP ${response.status}, usando respuesta directa`)
        return this.directResponse(userMessage, producto)
      }

      const data = await response.json()
      const respuesta = data.response?.trim() || ''

      if (!respuesta) {
        console.log('[Ollama] ⚠️ Respuesta vacía, usando respuesta directa')
        return this.directResponse(userMessage, producto)
      }

      console.log('[Ollama] ✅ Respuesta generada')
      return respuesta

    } catch (error: any) {
      console.error('[Ollama] ❌ Error:', error.message)
      return this.directResponse(userMessage, producto)
    }
  }

  private static buildPrompt(
    userMessage: string,
    producto: ProductMatch | null,
    context: string[]
  ): string {
    let prompt = `Eres el VENDEDOR ESTRELLA de "Tecnovariedades D&S".
NO eres un asistente aburrido, eres un experto en cerrar ventas.

TUS OBJETIVOS:
1. 💰 VENDER. Todo lo que digas debe acercar al cliente a la compra.
2. ⚡ SER RÁPIDO. Respuestas cortas, directas y al grano.
3. 😍 ENAMORAR. Usa emojis, sé amable pero con autoridad de experto.
4. 🚫 NO PREGUNTAR DUDAS. No preguntes "¿en qué te ayudo?". OFRECE.

REGLAS DE ORO:
- Si el cliente saluda -> Vende lo que tenemos (Laptops, Cursos, Motos).
- Si pregunta precio -> Dale el precio y dile "¿Lo quieres? Es tuyo".
- Si pregunta detalles -> Dale el detalle más importante y cierra la venta.
- NUNCA inventes información.
- USA EMOJIS: 🚀 💰 ✅ 🔥 😉 💎

`

    if (producto) {
      prompt += `🔥 PRODUCTO ESTRELLA DETECTADO:
Nombre: ${producto.name}
Precio: ${producto.price.toLocaleString('es-CO')} COP
Categoría: ${producto.category}
Descripción Clave: ${producto.description}

`
    }

    if (context.length > 0) {
      prompt += `HISTORIAL RECIENTE:\n${context.slice(-2).join('\n')}\n\n`
    }

    prompt += `CLIENTE DICE: "${userMessage}"

TU RESPUESTA DE VENDEDOR (Corta, con emojis y cierre de venta):`

    return prompt
  }

  private static directResponse(userMessage: string, producto: ProductMatch | null): string {
    const msgLower = userMessage.toLowerCase()

    // Si no hay producto
    if (!producto) {
      // 1. DETECCIÓN DE PAGO (Prioridad Alta)
      if (
        msgLower.includes('pagar') || 
        msgLower.includes('pago') || 
        msgLower.includes('nequi') || 
        msgLower.includes('daviplata') || 
        msgLower.includes('bancolombia') ||
        msgLower.includes('cuenta') ||
        msgLower.includes('precio')
      ) {
        return `💳 *Métodos de Pago Seguros* 🔒\n\n💸 *Nequi / Daviplata:* 3042748687\n🏦 *Bancolombia Ahorros:* 07800002345\n🌐 *PayPal / MercadoPago*\n\n✅ *Tu compra es 100% segura.*\n¿Qué producto deseas pagar hoy? 😊`
      }

      // Si pregunta por algo específico que no tenemos
      if (msgLower.includes('tienes') || msgLower.includes('hay') || msgLower.includes('vende')) {
        return `Por el momento no tengo ese producto específico 🧐\n\nPero mira lo que *SÍ* tengo para ti: 🔥\n\n💻 *Laptops Potentes*\n🎹 *Cursos (Piano, Idiomas, Diseño)*\n📚 *Megapacks de Conocimiento*\n🏍️ *Motos Increíbles*\n\n¿Cuál de estos te gustaría explorar? 👇`
      }
      
      // Saludo general VENDEDOR
      return `¡Hola! 👋 Bienvenido a *Tecnovariedades D&S* 🚀\n\nSoy tu asesor virtual y estoy aquí para ayudarte a encontrar lo mejor en:\n\n💻 *Tecnología* (Laptops, Accesorios)\n🎓 *Educación* (Cursos, Megapacks)\n🏍️ *Movilidad* (Motos)\n\n¿Qué estás buscando hoy? ¡Dime y te lo muestro de una! 😉`
    }

    // Si pregunta por precio
    if (msgLower.includes('precio') || msgLower.includes('cuesta') || msgLower.includes('vale') || msgLower.includes('cuanto')) {
      return `💰 *${producto.name}*\n\n🔥 *Precio Especial:* ${producto.price.toLocaleString('es-CO')} COP\n\n¿Te lo empaco de una vez? 😉`
    }

    // Si pregunta por link/pago
    if (msgLower.includes('link') || msgLower.includes('comprar') || msgLower.includes('pagar') || msgLower.includes('pago')) {
      return `¡Excelente elección! 🤩\n\n💳 *${producto.name}*\n💎 *Inversión:* ${producto.price.toLocaleString('es-CO')} COP\n\nTe envío el link de pago seguro por aquí 👇\n¿Prefieres Nequi, Daviplata o Bancolombia?`
    }

    // Respuesta completa del producto (VENTA)
    let response = `🔥 *${producto.name}* 🔥\n\n`
    response += `💰 *Precio:* ${producto.price.toLocaleString('es-CO')} COP\n\n`
    
    // Descripción (máximo 250 caracteres para no aburrir)
    if (producto.description) {
      const desc = producto.description.length > 250 
        ? producto.description.substring(0, 250) + '...'
        : producto.description
      response += `📝 ${desc}\n\n`
    }
    
    response += `✅ *Disponible para entrega inmediata* 🚀\n`
    
    // Si es digital
    if (producto.category === 'DIGITAL') {
      response += `📧 *Envío Digital al Instante*\n`
    }

    response += `\n¿Te interesa? Dime "Sí" y es tuyo. 😉`

    return response
  }
}

// ============================================
// 3. GROQ - RAZONAMIENTO PROFUNDO
// ============================================
class GroqDeepReasoning {
  /**
   * Razonamiento profundo para casos complejos
   */
  static async analyze(
    userMessage: string,
    productos: ProductMatch[],
    context: string[]
  ): Promise<{ needsDeepReasoning: boolean; response?: string }> {
    try {
      // Detectar si necesita razonamiento profundo
      const needsReasoning = this.detectComplexQuery(userMessage)

      if (!needsReasoning) {
        return { needsDeepReasoning: false }
      }

      console.log('[Groq] 🧠 Razonamiento profundo activado...')

      const prompt = `Eres un experto en ventas analizando una consulta compleja.

PRODUCTOS DISPONIBLES:
${productos.slice(0, 5).map(p => `- ${p.name}: ${p.price.toLocaleString('es-CO')} COP`).join('\n')}

CONSULTA DEL CLIENTE: ${userMessage}

CONTEXTO: ${context.slice(-3).join(' | ')}

ANALIZA y recomienda el mejor producto explicando por qué. Sé breve y directo.`

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-70b-versatile',
        temperature: 0.3,
        max_tokens: 400
      })

      const response = completion.choices[0]?.message?.content || ''
      console.log('[Groq] ✅ Análisis completado')

      return {
        needsDeepReasoning: true,
        response
      }

    } catch (error) {
      console.error('[Groq] ❌ Error:', error)
      return { needsDeepReasoning: false }
    }
  }

  private static detectComplexQuery(message: string): boolean {
    const complexPatterns = [
      /cual.*mejor/i,
      /diferencia.*entre/i,
      /comparar/i,
      /recomienda/i,
      /cual.*conviene/i,
      /presupuesto.*de/i,
      /necesito.*pero/i
    ]

    return complexPatterns.some(pattern => pattern.test(message))
  }
}

// ============================================
// 4. SISTEMA PERFECTO - ORQUESTADOR
// ============================================

interface CustomerMemory {
  context: string[]
  lastProduct: ProductMatch | null
  lastProductTime: number
}

export class PerfectBotSystem {
  private static customerMemory = new Map<string, CustomerMemory>()

  static async processMessage(
    userId: string,
    customerPhone: string,
    message: string
  ): Promise<{ message: string; confidence: number }> {
    try {
      console.log(`\n[PERFECT BOT] ========================================`)
      console.log(`[PERFECT BOT] Cliente: ${customerPhone}`)
      console.log(`[PERFECT BOT] Mensaje: "${message}"`)

      // Obtener memoria del cliente
      let memory = this.customerMemory.get(customerPhone)
      if (!memory) {
        memory = {
          context: [],
          lastProduct: null,
          lastProductTime: 0
        }
        this.customerMemory.set(customerPhone, memory)
      }

      const msgLower = message.toLowerCase()

      // PASO 1: Detectar si es continuación de conversación
      const isContinuation = 
        msgLower.includes('me interesa') ||
        (msgLower.includes('si') || msgLower.includes('sí')) && (msgLower.includes('mas') || msgLower.includes('más') || msgLower.includes('detalles')) ||
        (msgLower.includes('dame') || msgLower.includes('vomo') || msgLower.includes('como')) && (msgLower.includes('link') || msgLower.includes('pago')) ||
        msgLower.includes('comprar') ||
        (msgLower.includes('precio') || msgLower.includes('cuesta')) && memory.lastProduct

      // Si es continuación y tenemos producto reciente (últimos 5 minutos)
      const timeSinceLastProduct = Date.now() - memory.lastProductTime
      if (isContinuation && memory.lastProduct && timeSinceLastProduct < 5 * 60 * 1000) {
        console.log(`[PERFECT BOT] 🔄 Continuación detectada, usando producto: ${memory.lastProduct.name}`)
        
        // Usar el producto que ya teníamos
        const producto = memory.lastProduct

        // Detectar qué quiere el cliente
        if (msgLower.includes('link') || msgLower.includes('comprar') || msgLower.includes('pagar')) {
          const response = `💳 *${producto.name}*\n\n*Precio:* ${producto.price.toLocaleString('es-CO')} COP\n\nTe envío el link de pago por WhatsApp 📱`
          this.updateMemory(customerPhone, message, response, producto)
          return { message: response, confidence: 0.95 }
        }

        if (msgLower.includes('precio') || msgLower.includes('cuesta')) {
          const response = `💰 *${producto.name}*\n\n*Precio:* ${producto.price.toLocaleString('es-CO')} COP`
          this.updateMemory(customerPhone, message, response, producto)
          return { message: response, confidence: 0.95 }
        }

        // Si dice "me interesa" o "sí más detalles", dar información completa
        let response = `✅ *${producto.name}*\n\n`
        response += `💰 *Precio:* ${producto.price.toLocaleString('es-CO')} COP\n\n`
        
        if (producto.description) {
          const desc = producto.description.length > 300 
            ? producto.description.substring(0, 300) + '...'
            : producto.description
          response += `📝 ${desc}\n\n`
        }
        
        response += `📦 ${producto.category}`
        if (producto.category === 'DIGITAL') {
          response += ` - Entrega inmediata ⚡`
        }

        this.updateMemory(customerPhone, message, response, producto)
        return { message: response, confidence: 0.95 }
      }

      // PASO 2: RAG - Buscar producto nuevo
      const producto = await ProductRAG.search(message, userId)

      // PASO 3: Detectar si es consulta compleja (necesita razonamiento)
      const isComplexQuery = 
        (msgLower.includes('cual') && (msgLower.includes('mejor') || msgLower.includes('conviene'))) ||
        msgLower.includes('diferencia') ||
        msgLower.includes('comparar') ||
        msgLower.includes('recomienda')

      // Si es consulta compleja Y tenemos producto, usar Groq
      if (isComplexQuery && producto) {
        console.log('[PERFECT BOT] 🧠 Consulta compleja detectada')
        const deepReasoning = await GroqDeepReasoning.analyze(
          message,
          [producto],
          memory.context
        )

        if (deepReasoning.needsDeepReasoning && deepReasoning.response) {
          this.updateMemory(customerPhone, message, deepReasoning.response, producto)
          return {
            message: deepReasoning.response,
            confidence: 0.95
          }
        }
      }

      // PASO 4: Respuesta directa o con Ollama
      let response: string

      // Si es pregunta simple (precio, link, etc.), respuesta directa
      const isSimpleQuery = 
        msgLower.includes('precio') ||
        msgLower.includes('cuesta') ||
        msgLower.includes('link') ||
        msgLower.includes('comprar') ||
        msgLower.includes('pagar')

      if (isSimpleQuery || !producto) {
        console.log('[PERFECT BOT] 📝 Respuesta directa')
        response = OllamaConversation['directResponse'](message, producto)
      } else {
        // Usar Ollama para respuesta conversacional
        console.log('[PERFECT BOT] 🤖 Respuesta con Ollama')
        response = await OllamaConversation.generateResponse(
          message,
          producto,
          memory.context
        )
      }

      // Actualizar memoria con el nuevo producto
      this.updateMemory(customerPhone, message, response, producto)

      console.log('[PERFECT BOT] ✅ Respuesta generada')
      console.log(`[PERFECT BOT] ========================================\n`)

      return {
        message: response,
        confidence: 0.90
      }

    } catch (error) {
      console.error('[PERFECT BOT] ❌ Error:', error)
      return {
        message: 'Disculpa, tuve un problema. ¿Puedes repetir? 🙏',
        confidence: 0.5
      }
    }
  }

  /**
   * Actualizar memoria del cliente
   */
  private static updateMemory(
    phone: string,
    userMsg: string,
    botMsg: string,
    producto: ProductMatch | null
  ) {
    let memory = this.customerMemory.get(phone)
    if (!memory) {
      memory = {
        context: [],
        lastProduct: null,
        lastProductTime: 0
      }
    }

    // Actualizar contexto
    memory.context.push(`Usuario: ${userMsg}`)
    memory.context.push(`Bot: ${botMsg}`)

    // Mantener solo últimos 10 mensajes
    if (memory.context.length > 10) {
      memory.context.splice(0, memory.context.length - 10)
    }

    // Actualizar producto si hay uno nuevo
    if (producto) {
      memory.lastProduct = producto
      memory.lastProductTime = Date.now()
      console.log(`[PERFECT BOT] 💾 Producto guardado en memoria: ${producto.name}`)
    }

    this.customerMemory.set(phone, memory)
  }

  /**
   * Limpiar contextos antiguos (llamar periódicamente)
   */
  static cleanOldContexts() {
    const now = Date.now()
    const maxAge = 30 * 60 * 1000 // 30 minutos

    for (const [phone, memory] of this.customerMemory.entries()) {
      if (now - memory.lastProductTime > maxAge) {
        console.log(`[PERFECT BOT] 🧹 Limpiando memoria antigua de ${phone}`)
        this.customerMemory.delete(phone)
      }
    }
  }
}
