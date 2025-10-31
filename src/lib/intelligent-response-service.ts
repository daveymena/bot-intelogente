/**
 * 🧠 SERVICIO DE RESPUESTAS INTELIGENTES
 * Sistema de razonamiento que decide cuándo usar bot local vs IA avanzada
 * Incluye demoras humanas y burbujas de "escribiendo..."
 */

import { AIService } from './ai-service'
import { BaileysService } from './baileys-service'

interface ResponseDecision {
  useAdvancedAI: boolean
  reason: string
  complexity: 'simple' | 'medium' | 'complex'
  estimatedDelay: number // en milisegundos
}

export class IntelligentResponseService {
  /**
   * Analizar complejidad del mensaje y decidir qué tipo de respuesta usar
   */
  static analyzeMessageComplexity(message: string): ResponseDecision {
    const lowerMessage = message.toLowerCase()

    // 🟢 CASOS SIMPLES - Bot local puede manejar (SIN GROQ)
    const simplePatterns = [
      /^(hola|hi|hey|buenos días|buenas tardes|buenas noches)$/i,
      /^(gracias|muchas gracias|ok|vale|perfecto|entendido)$/i,
      /^(sí|si|no|nop|nope)$/i,
      /^(info|información|dame info|quiero info)/i, // Info básica de producto
      /^(precio|cuánto|cuanto|cuesta|vale|valor)\??$/i, // Solo pregunta precio
      /^(disponible|hay|tienes|tienen|stock)\??$/i, // Solo disponibilidad
      /^(link|enlace|url|página|pagina)\??$/i, // Solo pide link
      /^(comprar|quiero|deseo|me interesa)\s+(el|la|un|una)?\s*\w+$/i, // Compra simple
    ]

    for (const pattern of simplePatterns) {
      if (pattern.test(message)) {
        return {
          useAdvancedAI: false,
          reason: 'Pregunta simple - Bot local (sin Groq)',
          complexity: 'simple',
          estimatedDelay: this.getHumanDelay('simple')
        }
      }
    }
    
    // 🟢 PREGUNTAS DIRECTAS SOBRE PRODUCTOS - Bot local
    if (message.length < 50 && (
      lowerMessage.includes('precio') ||
      lowerMessage.includes('cuesta') ||
      lowerMessage.includes('vale') ||
      lowerMessage.includes('disponible') ||
      lowerMessage.includes('link') ||
      lowerMessage.includes('enlace') ||
      lowerMessage.includes('info')
    )) {
      return {
        useAdvancedAI: false,
        reason: 'Pregunta directa sobre producto - Bot local',
        complexity: 'simple',
        estimatedDelay: this.getHumanDelay('simple')
      }
    }

    // 🔴 CASOS COMPLEJOS - Requieren Groq (contexto, memoria, razonamiento)
    const complexPatterns = [
      /agendar|cita|reunión|appointment/i,
      /negociar|descuento|rebaja|oferta especial/i,
      /comparar|diferencia|mejor opción|cuál es mejor/i,
      /recomendar|sugerir|aconsejar|qué me recomiendas/i,
      /cuánto.*quedar|precio final|total a pagar/i,
      /garantía|devolución|cambio|reembolso/i,
      /especificaciones técnicas|características detalladas/i,
      /compatible con|funciona con|sirve para/i,
      /problema|error|falla|no funciona|ayuda/i,
      /explicar|cómo funciona|cómo se usa/i,
      /diferencia entre|ventajas|desventajas/i,
    ]

    for (const pattern of complexPatterns) {
      if (pattern.test(lowerMessage)) {
        return {
          useAdvancedAI: true,
          reason: 'Requiere Groq - Razonamiento complejo: ' + pattern.source.substring(0, 30),
          complexity: 'complex',
          estimatedDelay: this.getHumanDelay('complex')
        }
      }
    }
    
    // 🔴 PREGUNTAS QUE REQUIEREN CONTEXTO - Usar Groq
    // Preguntas vagas que necesitan memoria de conversación
    const needsContextPatterns = [
      /^(y|pero|entonces|además|también)\s/i, // Empieza con conjunción (necesita contexto)
      /^(eso|ese|esa|esto|esta|aquello)\s/i, // Referencias (necesita contexto)
      /^(me|te|le)\s+(das|envías|pasas|mandas)/i, // "me das el link" (necesita saber QUÉ)
      /^(cuál|cual|qué)\s+(es|sería|me)/i, // Preguntas abiertas
    ]
    
    for (const pattern of needsContextPatterns) {
      if (pattern.test(message)) {
        return {
          useAdvancedAI: true,
          reason: 'Requiere Groq - Necesita contexto de conversación',
          complexity: 'complex',
          estimatedDelay: this.getHumanDelay('complex')
        }
      }
    }

    // 🟠 CASOS MEDIOS - Depende de la longitud y contexto
    if (message.length > 150) {
      return {
        useAdvancedAI: true,
        reason: 'Requiere Groq - Mensaje muy largo',
        complexity: 'complex',
        estimatedDelay: this.getHumanDelay('complex')
      }
    }

    if (message.split(' ').length > 20) {
      return {
        useAdvancedAI: true,
        reason: 'Requiere Groq - Múltiples preguntas',
        complexity: 'medium',
        estimatedDelay: this.getHumanDelay('medium')
      }
    }
    
    // 🟢 MENCIONA PRODUCTO ESPECÍFICO - Bot local puede manejar
    const productKeywords = ['laptop', 'moto', 'curso', 'piano', 'macbook', 'asus', 'bajaj', 'mega pack']
    const hasProductKeyword = productKeywords.some(keyword => lowerMessage.includes(keyword))
    
    if (hasProductKeyword && message.length < 80) {
      return {
        useAdvancedAI: false,
        reason: 'Pregunta sobre producto específico - Bot local',
        complexity: 'simple',
        estimatedDelay: this.getHumanDelay('simple')
      }
    }

    // Por defecto, usar bot local para preguntas simples
    return {
      useAdvancedAI: false,
      reason: 'Pregunta estándar - Bot local (ahorro de tokens)',
      complexity: 'simple',
      estimatedDelay: this.getHumanDelay('simple')
    }
  }

  /**
   * Calcular demora humana realista según complejidad
   * REDUCIDO para evitar pérdida de conexión
   */
  private static getHumanDelay(complexity: 'simple' | 'medium' | 'complex'): number {
    const delays = {
      simple: { min: 800, max: 1500 },     // 0.8-1.5 segundos (antes 1.5-3)
      medium: { min: 1500, max: 2500 },    // 1.5-2.5 segundos (antes 3-5)
      complex: { min: 2500, max: 4000 },   // 2.5-4 segundos (antes 5-8)
    }

    const range = delays[complexity]
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
  }

  /**
   * Simular escritura humana (burbujas de "escribiendo...")
   */
  static async simulateTyping(
    phoneNumber: string,
    duration: number
  ): Promise<void> {
    try {
      console.log(`[Typing] Simulando escritura por ${duration}ms para ${phoneNumber}`)
      
      // Enviar estado de "escribiendo" a WhatsApp
      // await BaileysService.sendPresenceUpdate(phoneNumber, 'composing')
      
      // Esperar la duración
      await new Promise(resolve => setTimeout(resolve, duration))
      
      // Detener estado de "escribiendo"
      // await BaileysService.sendPresenceUpdate(phoneNumber, 'paused')
      
      console.log(`[Typing] Escritura completada para ${phoneNumber}`)
    } catch (error) {
      console.error('[Typing] Error simulando escritura:', error)
    }
  }

  /**
   * Generar respuesta con demora humana y burbujas
   */
  static async generateResponseWithHumanTouch(
    userId: string,
    customerMessage: string,
    customerPhone: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<{
    message: string
    confidence: number
    usedAdvancedAI: boolean
    complexity: string
    responseTime: number
  }> {
    const startTime = Date.now()

    try {
      // 1. Analizar complejidad del mensaje
      const decision = this.analyzeMessageComplexity(customerMessage)
      
      console.log(`[Intelligence] Decisión de respuesta:`, {
        complexity: decision.complexity,
        useAdvancedAI: decision.useAdvancedAI,
        reason: decision.reason,
        delay: decision.estimatedDelay
      })

      // 2. Simular burbujas de "escribiendo..." antes de responder
      await this.simulateTyping(customerPhone, decision.estimatedDelay)

      // 3. Generar respuesta según la decisión
      let response

      if (decision.useAdvancedAI) {
        // Usar IA avanzada (Groq con modelo potente)
        console.log(`[Intelligence] 🧠 Usando IA AVANZADA para razonamiento complejo`)
        response = await AIService.generateResponse(
          userId,
          customerMessage,
          customerPhone,
          conversationHistory
        )
      } else {
        // Usar bot local (respuestas rápidas y simples)
        console.log(`[Intelligence] ⚡ Usando BOT LOCAL para respuesta simple`)
        response = await this.generateSimpleResponse(
          userId,
          customerMessage,
          customerPhone,
          conversationHistory
        )
      }

      const responseTime = Date.now() - startTime

      return {
        message: response.message,
        confidence: response.confidence,
        usedAdvancedAI: decision.useAdvancedAI,
        complexity: decision.complexity,
        responseTime
      }
    } catch (error) {
      console.error('[Intelligence] Error generando respuesta:', error)
      
      // Fallback con demora humana
      await this.simulateTyping(customerPhone, 2000)
      
      return {
        message: '¡Hola! Gracias por contactarnos. Un momento por favor, te atenderé enseguida. 😊',
        confidence: 0.5,
        usedAdvancedAI: false,
        complexity: 'simple',
        responseTime: Date.now() - startTime
      }
    }
  }

  /**
   * Generar respuesta simple sin IA avanzada
   */
  private static async generateSimpleResponse(
    userId: string,
    message: string,
    _customerPhone: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<{ message: string; confidence: number }> {
    const lowerMessage = message.toLowerCase()

    // Saludos
    if (/^(hola|hi|hey|buenos días|buenas tardes|buenas noches)$/i.test(message)) {
      return {
        message: '👋 Hola ¡Bienvenido a Tecnovariedades D&S! 😄💻\n\nAquí encontrarás tecnología, soporte, cursos y herramientas digitales para potenciar tu día a día.\n\n📦 ¿Buscas algún producto, servicio o información en especial?',
        confidence: 0.95
      }
    }

    // Agradecimientos
    if (/^(gracias|muchas gracias)$/i.test(message)) {
      return {
        message: '¡De nada! 😊 Estoy aquí para ayudarte. ¿Necesitas algo más?',
        confidence: 0.95
      }
    }

    // Confirmaciones
    if (/^(ok|vale|perfecto|entendido)$/i.test(message)) {
      return {
        message: '¡Perfecto! 👍 ¿Hay algo más en lo que pueda ayudarte?',
        confidence: 0.95
      }
    }

    // Para todo lo demás, usar IA pero con respuesta rápida
    return await AIService.generateResponse(userId, message, _customerPhone, conversationHistory)
  }

  /**
   * Calcular tiempo de lectura humano (para mensajes largos)
   */
  static calculateReadingTime(message: string): number {
    // Promedio de lectura: 200 palabras por minuto
    const words = message.split(' ').length
    const readingTimeMs = (words / 200) * 60 * 1000
    
    // Mínimo 1 segundo, máximo 5 segundos
    return Math.min(Math.max(readingTimeMs, 1000), 5000)
  }

  /**
   * Agregar variación humana al tiempo de respuesta
   */
  static addHumanVariation(baseDelay: number): number {
    // Agregar ±20% de variación aleatoria
    const variation = baseDelay * 0.2
    const randomVariation = (Math.random() * variation * 2) - variation
    return Math.floor(baseDelay + randomVariation)
  }
}
