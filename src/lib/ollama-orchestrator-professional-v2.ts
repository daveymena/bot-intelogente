/**
 * 🎯 OLLAMA ORCHESTRATOR PROFESSIONAL V2
 * Sistema simple y directo - SIN mensajes de "buscando"
 */

import { db } from './db'
import { PaymentAgent } from '../agents/payment-agent'
import { SharedMemoryService } from '../agents/shared-memory'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OrchestratorResponse {
  message: string
  source: 'ollama' | 'groq' | 'local' | 'payment_agent'
  confidence: number
  products?: any[]
}

export class OllamaProfessionalOrchestrator {
  private static config = {
    url: process.env.OLLAMA_BASE_URL || process.env.OLLAMA_URL || 'https://davey-ollama2.mapf5v.easypanel.host',
    model: process.env.OLLAMA_MODEL || 'gemma2:2b',
    timeout: parseInt(process.env.OLLAMA_TIMEOUT || '60000') // ✅ Aumentado a 60s
  }

  // Caché de respuestas rápidas (solo para casos MUY simples)
  private static quickResponses: Record<string, string> = {
    'gracias': '¡Con gusto! 😊 Estoy aquí para ayudarte. ¿Necesitas algo más?',
    'ok': '¡Perfecto! 😊 ¿Hay algo más en lo que pueda ayudarte?',
    'vale': '¡Entendido! 😊 Cualquier duda, aquí estoy.',
    'sí': '¡Excelente! 😊',
    'si': '¡Excelente! 😊',
    'no': 'Entendido. Si cambias de opinión o necesitas algo, avísame. 😊'
  }

  /**
   * Procesar mensaje
   */
  static async processMessage(
    userMessage: string,
    userId: string,
    conversationHistory: Message[] = [],
    chatId?: string // Opcional por compatibilidad, pero necesario para pagos
  ): Promise<OrchestratorResponse> {
    // Verificar caché
    const lowerMsg = userMessage.toLowerCase().trim()
    if (this.quickResponses[lowerMsg]) {
      console.log('[Orchestrator] ⚡ Respuesta desde caché')
      return {
        message: this.quickResponses[lowerMsg],
        source: 'ollama',
        confidence: 100
      }
    }

    // 🎯 DETECCIÓN DE INTENCIÓN DE PAGO
    if (chatId && this.detectPaymentIntent(userMessage)) {
      console.log('[Orchestrator] 💳 Intención de pago detectada - Delegando a PaymentAgent')
      try {
        const memoryService = SharedMemoryService.getInstance()
        const memory = memoryService.get(chatId, userId)
        const paymentAgent = new PaymentAgent()
        
        const response = await paymentAgent.execute(userMessage, memory)
        
        return {
          message: response.text,
          source: 'payment_agent',
          confidence: response.confidence || 100
        }
      } catch (error) {
        console.error('[Orchestrator] ❌ Error en PaymentAgent:', error)
        // Fallback a flujo normal
      }
    }

    // Buscar productos
    const products = await this.searchProducts(userMessage, userId)
    console.log(`[Orchestrator] 🔍 Productos encontrados: ${products.length}`)

    // 🧠 DECISIÓN INTELIGENTE: ¿Necesitamos razonamiento de IA?
    const needsAI = this.needsAIReasoning(userMessage, conversationHistory, products)
    
    if (!needsAI && products.length > 0) {
      // ⚡ Respuesta rápida para casos simples
      console.log('[Orchestrator] ⚡ Caso simple - Respuesta directa')
      return this.localResponse(userMessage, products)
    }

    // 🤖 Usar Ollama para razonamiento inteligente
    console.log('[Orchestrator] 🧠 Usando Ollama para razonamiento inteligente')
    
    // Construir prompt con contexto
    const systemPrompt = this.buildIntelligentPrompt(products, conversationHistory)
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.slice(-6), // Últimos 6 mensajes para contexto
      { role: 'user' as const, content: userMessage }
    ]

    // Llamar Ollama con timeout generoso
    try {
      const response = await this.callOllama(messages)
      return {
        message: response,
        source: 'ollama',
        confidence: 90,
        products: products.length > 0 ? products : undefined
      }
    } catch (error) {
      console.log('[Orchestrator] ❌ Ollama falló, usando bot local')
      return this.localResponse(userMessage, products)
    }
  }

  /**
   * Detecta si el mensaje es una intención de pago
   */
  private static detectPaymentIntent(message: string): boolean {
    const lower = message.toLowerCase().trim();
    const paymentPatterns = [
      // Intención directa
      /\b(quiero|deseo|me interesa)\s+(pagar|comprar|adquirir)/i,
      /\b(c[oó]mo)\s+(pago|compro|puedo pagar)/i,
      /\b(link|enlace)\s+(de\s+)?(pago|compra)/i,
      /\b(m[eé]todos?|formas?|opci[oó]nes?|medios?)\s+(de\s+)?pago/i,
      
      // Métodos específicos
      /\b(mercadopago|mercado pago|paypal|nequi|daviplata|transferencia|consignaci[oó]n)/i,
      /\b(tarjeta|cr[eé]dito|d[eé]bito|pse|efectivo|bancolombia)/i,
      
      // Proceder con compra
      /\b(proceder|continuar|seguir)\s+(con\s+)?(el\s+|la\s+)?(pago|compra)/i,
      /\b(me\s+lo\s+llevo|lo\s+compro|lo\s+quiero|estoy\s+listo)/i,
      
      // Selección numérica o corta
      /^(1|2|3|4|5|mercadopago|paypal|nequi|daviplata)$/i,
    ];
    return paymentPatterns.some(p => p.test(lower));
  }

  /**
   * Buscar productos usando el sistema inteligente
   */
  private static async searchProducts(query: string, userId: string): Promise<any[]> {
    try {
      const { intelligentProductSearch } = await import('./intelligent-product-search')
      
      const result = await intelligentProductSearch({
        userMessage: query,
        previousProducts: [],
        conversationHistory: []
      })

      if (!result) return []

      if (result.isGeneralQuery && result.products) {
        return result.products.slice(0, 3)
      }

      if (result.product) {
        return [result.product]
      }

      return []
    } catch (error) {
      console.error('[Orchestrator] Error en búsqueda inteligente:', error)
      return []
    }
  }

  /**
   * Detecta si necesitamos razonamiento de IA
   */
  private static needsAIReasoning(
    message: string,
    history: Message[],
    products: any[]
  ): boolean {
    const lowerMsg = message.toLowerCase()

    // ✅ Siempre usar IA para:
    
    // 1. Saludos iniciales (primera impresión)
    if (history.length === 0 && (
      lowerMsg.includes('hola') || 
      lowerMsg.includes('buenos') ||
      lowerMsg.includes('buenas')
    )) {
      return true
    }

    // 2. Preguntas complejas
    if (
      lowerMsg.includes('diferencia') ||
      lowerMsg.includes('comparar') ||
      lowerMsg.includes('mejor') ||
      lowerMsg.includes('recomienda') ||
      lowerMsg.includes('cuál') ||
      lowerMsg.includes('por qué') ||
      lowerMsg.includes('cómo')
    ) {
      return true
    }

    // 3. Preguntas sobre características
    if (
      lowerMsg.includes('características') ||
      lowerMsg.includes('especificaciones') ||
      lowerMsg.includes('incluye') ||
      lowerMsg.includes('viene con')
    ) {
      return true
    }

    // 4. Dudas o consultas
    if (
      lowerMsg.includes('duda') ||
      lowerMsg.includes('pregunta') ||
      lowerMsg.includes('consulta') ||
      lowerMsg.includes('saber')
    ) {
      return true
    }

    // 5. Conversación con contexto (más de 3 mensajes)
    if (history.length > 3) {
      return true
    }

    // ⚡ Casos simples (respuesta directa):
    // - "Me interesa X" con producto encontrado
    // - "Cuánto cuesta" con producto en contexto
    // - "Ok", "Gracias", etc.
    
    return false
  }

  /**
   * Construir prompt inteligente con memoria
   */
  private static buildIntelligentPrompt(
    products: any[],
    history: Message[]
  ): string {
    let prompt = `Eres Alex, asesor de ventas de Tecnovariedades D&S.

🎯 TU PERSONALIDAD:
- Profesional pero cercana
- Experta en tecnología y productos digitales
- Ayudas a los clientes a tomar la mejor decisión
- Respondes con empatía y claridad

📋 INFORMACIÓN DE LA EMPRESA:
- Nombre: Tecnovariedades D&S
- Ubicación: Centro Comercial El Diamante 2, San Nicolás, Cali
- WhatsApp: +57 304 274 8687
- Email: deinermen25@gmail.com
- Especialidad: Tecnología (laptops, accesorios) y Cursos Digitales

💡 TU TRABAJO:
1. Entender qué necesita el cliente (uso, presupuesto, preferencias)
2. Recomendar el producto más adecuado
3. Explicar beneficios (no solo características)
4. Resolver dudas con claridad
5. Guiar hacia la compra de forma natural

🎨 ESTILO DE COMUNICACIÓN:
- Natural y conversacional (no robótico)
- Emojis sutiles (1-2 por mensaje)
- Respuestas concisas pero completas
- Preguntas inteligentes para entender mejor

🚫 NUNCA:
- Digas "Un momento", "buscando", "déjame buscar"
- Repitas el saludo si ya saludaste
- Uses "Opción 1", "Opción 2" (habla natural)
- Inventes información que no tienes

`

    // Agregar contexto de productos
    if (products.length === 1) {
      const p = products[0]
      prompt += `\n📦 PRODUCTO DISPONIBLE:\n`
      prompt += `- Nombre: ${p.name}\n`
      prompt += `- Precio: ${p.price.toLocaleString('es-CO')} COP\n`
      if (p.description) {
        prompt += `- Descripción: ${p.description.substring(0, 200)}...\n`
      }
      prompt += `\n💬 Presenta este producto de forma natural, destacando sus beneficios.\n`
    } else if (products.length > 1) {
      prompt += `\n📦 PRODUCTOS DISPONIBLES (${products.length}):\n`
      products.slice(0, 3).forEach((p, i) => {
        prompt += `${i + 1}. ${p.name} - ${p.price.toLocaleString('es-CO')} COP\n`
      })
      prompt += `\n💬 Ayuda al cliente a elegir el mejor según sus necesidades.\n`
    }

    // Agregar contexto de conversación
    if (history.length > 0) {
      prompt += `\n📝 CONTEXTO DE LA CONVERSACIÓN:\n`
      const recentHistory = history.slice(-4)
      recentHistory.forEach(msg => {
        if (msg.role === 'user') {
          prompt += `Cliente: ${msg.content}\n`
        } else if (msg.role === 'assistant') {
          prompt += `Tú: ${msg.content}\n`
        }
      })
      prompt += `\n💡 Continúa la conversación de forma natural, recordando el contexto.\n`
    }

    return prompt
  }

  /**
   * Construir prompt - VERSIÓN DIRECTA SIN MENSAJES DE "BUSCANDO"
   */
  private static buildPrompt(products: any[]): string {
    const basePrompt = 'Eres Alex, vendedor de Tecnovariedades D&S por WhatsApp.\n\n' +
      'REGLAS CRÍTICAS:\n' +
      '- NUNCA digas "Un momento", "buscando", "déjame buscar"\n' +
      '- NUNCA menciones "Opción 1", "Opción 2", etc.\n' +
      '- NO repitas el saludo\n' +
      '- Responde DIRECTO y NATURAL\n' +
      '- Máximo 2 líneas\n' +
      '- Emojis sutiles\n\n' +
      'AGENTES (YA trabajaron):\n' +
      '- Búsqueda: YA encontró productos\n' +
      '- Fotos: YA envió imágenes\n' +
      '- TÚ solo hablas natural\n\n'

    if (products.length === 1) {
      const p = products[0]
      return basePrompt +
        `PRODUCTO: ${p.name} - ${p.price.toLocaleString('es-CO')} COP\n` +
        `RESPONDE: "¡Perfecto! Te envié la info del ${p.name}. ¿Te interesa?"\n`
    } else if (products.length > 1) {
      let productList = 'PRODUCTOS:\n'
      products.forEach((p, i) => {
        productList += `${i + 1}. ${p.name} - ${p.price.toLocaleString('es-CO')} COP\n`
      })
      return basePrompt + productList +
        `RESPONDE: "¡Claro que sí! 🤩 Aquí te comparto nuestras mejores opciones disponibles. Te enviaré las fotos para que las veas con detalle.\n\n` +
        `💡 Además, tenemos MÁS variedad según el uso que le quieras dar (estudio, trabajo pesado, diseño, gaming, etc.). Cuéntame y te recomiendo la opción perfecta para ti 😊"\n`
    } else {
      // Caso: 0 productos encontrados
      return basePrompt +
        `SITUACIÓN: El cliente busca algo pero NO se encontraron productos exactos en la base de datos.\n` +
        `RESPONDE: "Lo siento 😔, en este momento no encontré productos exactos con esa descripción. ¿Podrías darme más detalles o buscas algo diferente?"\n`
    }

    return basePrompt
  }

  /**
   * Llamar Ollama
   */
  private static async callOllama(messages: Message[]): Promise<string> {
    const prompt = messages.map(m => {
      if (m.role === 'system') return m.content
      if (m.role === 'user') return `Cliente: ${m.content}`
      return `Alex: ${m.content}`
    }).join('\n\n') + '\n\nAlex: '

    console.log(`[Ollama] 🌐 Conectando a: ${this.config.url}`)
    console.log(`[Ollama] 🤖 Modelo: ${this.config.model}`)
    console.log(`[Ollama] ⏱️ Timeout: ${this.config.timeout}ms`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log(`[Ollama] ⏰ Timeout alcanzado (${this.config.timeout}ms)`)
      controller.abort()
    }, this.config.timeout)

    try {
      const startTime = Date.now()
      const response = await fetch(`${this.config.url}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.6,
            num_predict: 150,
            repeat_penalty: 1.2
          }
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const elapsed = Date.now() - startTime

      if (!response.ok) {
        console.log(`[Ollama] ❌ HTTP ${response.status}`)
        throw new Error(`Ollama HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log(`[Ollama] ✅ Respuesta recibida (${elapsed}ms)`)
      return data.response || ''
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.log(`[Ollama] ❌ Error: ${error.message}`)
      if (error.name === 'AbortError') {
        console.log(`[Ollama] ⏰ Operación abortada por timeout`)
      }
      throw error
    }
  }

  /**
   * Respuesta local (fallback)
   */
  private static localResponse(message: string, products: any[]): OrchestratorResponse {
    const lowerMsg = message.toLowerCase()

    if (products.length === 1) {
      const p = products[0]
      return {
        message: `¡Perfecto! 😊 Te envié la info del ${p.name}. ¿Te interesa?`,
        source: 'local',
        confidence: 80,
        products
      }
    }

    if (products.length > 1) {
      return {
        message: `¡Claro! 😊 Te envié ${products.length} opciones. ¿Cuál te gusta más?`,
        source: 'local',
        confidence: 75,
        products
      }
    }

    if (lowerMsg.includes('pago') || lowerMsg.includes('pagar')) {
      return {
        message: 'Puedes pagar con MercadoPago, PayPal, Nequi o Daviplata. ¿Cuál prefieres? 😊',
        source: 'local',
        confidence: 90
      }
    }

    return {
      message: '😊 ¿En qué puedo ayudarte? Tenemos laptops, cursos y megapacks.',
      source: 'local',
      confidence: 60
    }
  }

  /**
   * Verificar disponibilidad
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.url}/api/tags`, {
        signal: AbortSignal.timeout(3000)
      })
      return response.ok
    } catch {
      return false
    }
  }
}
