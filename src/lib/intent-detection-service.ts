/**
 * 🎯 SISTEMA OPTIMIZADO DE DETECCIÓN DE INTENCIONES
 *
 * Detecta con precisión la intención del usuario usando:
 * - Análisis de palabras clave contextuales
 * - Patrones de conversación
 * - Historial de interacciones
 * - Machine learning simple (scoring)
 */

import { ConversationLearningService } from './conversation-learning-service'

export type UserIntent =
  | 'greeting'
  | 'product_search'
  | 'product_info'
  | 'price_inquiry'
  | 'payment_method'
  | 'payment_confirmation'
  | 'shipping_inquiry'
  | 'availability_check'
  | 'comparison'
  | 'objection'
  | 'ready_to_buy'
  | 'request_photos'
  | 'request_more_info'
  | 'general_question'
  | 'complaint'
  | 'farewell'
  | 'unknown'

interface IntentScore {
  intent: UserIntent
  confidence: number
  keywords: string[]
  context?: string
}

interface IntentPattern {
  intent: UserIntent
  keywords: string[]
  phrases: string[]
  weight: number
  requiresContext?: boolean
}

export class IntentDetectionService {
  private static patterns: IntentPattern[] = [
    // Saludos
    {
      intent: 'greeting',
      keywords: ['hola', 'buenos', 'buenas', 'saludos', 'hey', 'ola', 'qué tal', 'cómo estás'],
      phrases: ['buenos días', 'buenas tardes', 'buenas noches', 'qué tal', 'cómo estás'],
      weight: 1.0
    },

    // Búsqueda de productos
    {
      intent: 'product_search',
      keywords: ['busco', 'necesito', 'quiero', 'me interesa', 'tienes', 'tienen', 'venden', 'hay', 'disponible'],
      phrases: ['estoy buscando', 'me gustaría', 'quisiera ver', 'qué tienen de', 'tienen algo de'],
      weight: 0.9
    },

    // Información de producto
    {
      intent: 'product_info',
      keywords: ['características', 'especificaciones', 'detalles', 'información', 'cuéntame', 'dime más', 'qué incluye'],
      phrases: ['más información', 'qué incluye', 'cuáles son las características', 'dime más sobre'],
      weight: 0.85,
      requiresContext: true
    },

    // Consulta de precio
    {
      intent: 'price_inquiry',
      keywords: ['precio', 'costo', 'cuánto', 'vale', 'valor', 'cuánto cuesta', 'cuánto vale'],
      phrases: ['cuánto cuesta', 'cuál es el precio', 'cuánto vale', 'qué precio tiene'],
      weight: 0.9
    },

    // Métodos de pago
    {
      intent: 'payment_method',
      keywords: ['pago', 'pagar', 'forma de pago', 'método', 'tarjeta', 'efectivo', 'transferencia', 'nequi', 'daviplata'],
      phrases: ['cómo puedo pagar', 'formas de pago', 'métodos de pago', 'aceptan tarjeta'],
      weight: 0.85
    },

    // Confirmación de pago
    {
      intent: 'payment_confirmation',
      keywords: ['pagué', 'ya pagué', 'hice el pago', 'transferí', 'envié', 'comprobante', 'confirmación'],
      phrases: ['ya hice el pago', 'ya pagué', 'ya transferí', 'envié el comprobante'],
      weight: 0.95
    },

    // Consulta de envío
    {
      intent: 'shipping_inquiry',
      keywords: ['envío', 'entrega', 'domicilio', 'envían', 'entregan', 'cuánto demora', 'tiempo de entrega'],
      phrases: ['hacen envíos', 'cuánto demora', 'tiempo de entrega', 'costo de envío'],
      weight: 0.85
    },

    // Verificación de disponibilidad
    {
      intent: 'availability_check',
      keywords: ['disponible', 'hay', 'tienen', 'stock', 'existencia', 'queda', 'quedan'],
      phrases: ['está disponible', 'tienen en stock', 'hay disponibilidad', 'tienen existencia'],
      weight: 0.8
    },

    // Comparación
    {
      intent: 'comparison',
      keywords: ['diferencia', 'comparar', 'mejor', 'versus', 'vs', 'cuál es mejor', 'cuál recomiendas'],
      phrases: ['cuál es la diferencia', 'cuál es mejor', 'qué me recomiendas', 'cuál me conviene'],
      weight: 0.8
    },

    // Objeción
    {
      intent: 'objection',
      keywords: ['caro', 'costoso', 'mucho', 'descuento', 'rebaja', 'oferta', 'más barato', 'pensarlo'],
      phrases: ['muy caro', 'demasiado costoso', 'hay descuento', 'lo voy a pensar', 'déjame pensarlo'],
      weight: 0.85
    },

    // Listo para comprar
    {
      intent: 'ready_to_buy',
      keywords: ['compro', 'lo quiero', 'me lo llevo', 'sí', 'dale', 'ok', 'perfecto', 'listo'],
      phrases: ['lo compro', 'me lo llevo', 'quiero comprarlo', 'sí lo quiero', 'dale, lo compro'],
      weight: 0.95
    },

    // Solicitud de fotos
    {
      intent: 'request_photos',
      keywords: ['foto', 'fotos', 'imagen', 'imágenes', 'ver', 'muestra', 'muéstrame'],
      phrases: ['tienes fotos', 'puedes enviar fotos', 'quiero ver fotos', 'muéstrame fotos'],
      weight: 0.9
    },

    // Solicitud de más información
    {
      intent: 'request_more_info',
      keywords: ['más', 'otra', 'otro', 'adicional', 'también', 'además', 'opciones'],
      phrases: ['qué más', 'tienes más', 'otras opciones', 'algo más', 'qué otras'],
      weight: 0.7
    },

    // Pregunta general
    {
      intent: 'general_question',
      keywords: ['cómo', 'cuándo', 'dónde', 'por qué', 'quién', 'qué'],
      phrases: ['cómo funciona', 'cuándo abren', 'dónde están', 'por qué'],
      weight: 0.6
    },

    // Queja
    {
      intent: 'complaint',
      keywords: ['problema', 'queja', 'reclamo', 'mal', 'defectuoso', 'no funciona', 'no sirve'],
      phrases: ['tengo un problema', 'quiero hacer una queja', 'no funciona', 'está defectuoso'],
      weight: 0.9
    },

    // Despedida
    {
      intent: 'farewell',
      keywords: ['adiós', 'chao', 'gracias', 'hasta luego', 'nos vemos', 'bye'],
      phrases: ['muchas gracias', 'hasta luego', 'nos vemos', 'adiós'],
      weight: 0.95
    }
  ]

  /**
   * Detectar la intención principal del mensaje
   */
  static detectIntent(
    message: string,
    userId: string,
    conversationContext?: any
  ): IntentScore {
    const normalizedMessage = message.toLowerCase().trim()
    const scores: IntentScore[] = []

    // Calcular score para cada patrón
    for (const pattern of this.patterns) {
      let score = 0
      const matchedKeywords: string[] = []

      // Verificar palabras clave
      for (const keyword of pattern.keywords) {
        if (normalizedMessage.includes(keyword)) {
          score += pattern.weight * 0.5
          matchedKeywords.push(keyword)
        }
      }

      // Verificar frases completas (mayor peso)
      for (const phrase of pattern.phrases) {
        if (normalizedMessage.includes(phrase)) {
          score += pattern.weight * 1.5
          matchedKeywords.push(phrase)
        }
      }

      // Bonus por contexto
      if (pattern.requiresContext && conversationContext) {
        if (conversationContext.lastIntent === 'product_search' ||
            conversationContext.lastIntent === 'product_info') {
          score *= 1.3
        }
      }

      if (score > 0) {
        scores.push({
          intent: pattern.intent,
          confidence: Math.min(1.0, score),
          keywords: matchedKeywords,
          context: conversationContext?.lastIntent
        })
      }
    }

    // Ordenar por confianza
    scores.sort((a, b) => b.confidence - a.confidence)

    // Si no hay coincidencias, intentar aprender de patrones previos
    if (scores.length === 0) {
      const learnedResponse = ConversationLearningService.getLearnedResponse(
        userId,
        message,
        'unknown'
      )

      if (learnedResponse) {
        return {
          intent: 'unknown',
          confidence: learnedResponse.confidence * 0.6,
          keywords: [],
          context: 'learned'
        }
      }

      return {
        intent: 'unknown',
        confidence: 0.0,
        keywords: [],
        context: undefined
      }
    }

    // Retornar la intención con mayor confianza
    const topIntent = scores[0]

    // Registrar para aprendizaje
    if (topIntent.confidence > 0.7) {
      ConversationLearningService.recordSuccessfulPattern(
        userId,
        conversationContext?.conversationId || 'unknown',
        message,
        '', // Se llenará después con la respuesta real
        topIntent.intent,
        { confidence: topIntent.confidence }
      ).catch(console.error)
    }

    return topIntent
  }

  /**
   * Detectar múltiples intenciones en un mensaje
   */
  static detectMultipleIntents(
    message: string,
    userId: string,
    conversationContext?: any
  ): IntentScore[] {
    const normalizedMessage = message.toLowerCase().trim()
    const allScores: IntentScore[] = []

    for (const pattern of this.patterns) {
      let score = 0
      const matchedKeywords: string[] = []

      for (const keyword of pattern.keywords) {
        if (normalizedMessage.includes(keyword)) {
          score += pattern.weight * 0.5
          matchedKeywords.push(keyword)
        }
      }

      for (const phrase of pattern.phrases) {
        if (normalizedMessage.includes(phrase)) {
          score += pattern.weight * 1.5
          matchedKeywords.push(phrase)
        }
      }

      if (score > 0.3) {
        allScores.push({
          intent: pattern.intent,
          confidence: Math.min(1.0, score),
          keywords: matchedKeywords,
          context: conversationContext?.lastIntent
        })
      }
    }

    return allScores.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Verificar si el mensaje contiene una intención específica
   */
  static hasIntent(message: string, intent: UserIntent): boolean {
    const detected = this.detectIntent(message, 'temp', undefined)
    return detected.intent === intent && detected.confidence > 0.5
  }

  /**
   * Obtener estadísticas de detección
   */
  static getDetectionStats(): {
    totalPatterns: number
    intents: string[]
  } {
    return {
      totalPatterns: this.patterns.length,
      intents: [...new Set(this.patterns.map(p => p.intent))]
    }
  }
}
