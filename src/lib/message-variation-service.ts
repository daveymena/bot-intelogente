/**
 * 🎭 MESSAGE VARIATION SERVICE
 * Servicio para generar variaciones inteligentes de mensajes
 */

export class MessageVariationService {
  /**
   * Plantillas de variación por contexto
   */
  private static readonly TEMPLATES = {
    // Saludos
    greeting: {
      patterns: [/^(hola|hey|buenos|buenas|qué tal)/i],
      variations: [
        (msg: string) => msg,
        (msg: string) => `¡${msg}!`,
        (msg: string) => `${msg} 😊`,
        (msg: string) => `${msg} ¿Cómo estás?`,
        (msg: string) => `${msg} ¿Qué tal todo?`,
        (msg: string) => `Hey! ${msg.replace(/^(hola|hey)/i, '')}`,
        (msg: string) => `Buenas! ${msg.replace(/^(hola|hey|buenos|buenas)/i, '')}`,
      ]
    },

    // Confirmaciones
    confirmation: {
      patterns: [/(sí|claro|perfecto|ok|listo|entendido|correcto)/i],
      variations: [
        (msg: string) => msg,
        (msg: string) => `${msg} ✅`,
        (msg: string) => `${msg} 👍`,
        (msg: string) => `Perfecto! ${msg}`,
        (msg: string) => `Claro! ${msg}`,
        (msg: string) => `Por supuesto! ${msg}`,
        (msg: string) => `Exacto! ${msg}`,
        (msg: string) => `${msg} Genial!`,
      ]
    },

    // Agradecimientos
    thanks: {
      patterns: [/(gracias|te agradezco|muchas gracias)/i],
      variations: [
        (msg: string) => msg,
        (msg: string) => `${msg} 😊`,
        (msg: string) => `${msg} ¡Un placer ayudarte!`,
        (msg: string) => `${msg} Estamos para servirte`,
        (msg: string) => `De nada! ${msg.replace(/gracias/i, '')}`,
        (msg: string) => `Con gusto! ${msg.replace(/gracias/i, '')}`,
        (msg: string) => `${msg} 🙌`,
      ]
    },

    // Preguntas
    question: {
      patterns: [/\?$/],
      variations: [
        (msg: string) => msg,
        (msg: string) => `${msg} 🤔`,
        (msg: string) => `Déjame preguntarte: ${msg}`,
        (msg: string) => `Una pregunta: ${msg}`,
        (msg: string) => `${msg} ¿Qué opinas?`,
        (msg: string) => `Cuéntame: ${msg}`,
        (msg: string) => `Me gustaría saber: ${msg}`,
      ]
    },

    // Información de productos
    productInfo: {
      patterns: [/(producto|precio|disponible|stock|características)/i],
      variations: [
        (msg: string) => msg,
        (msg: string) => `${msg} 📦`,
        (msg: string) => `Te cuento: ${msg}`,
        (msg: string) => `Mira: ${msg}`,
        (msg: string) => `Aquí está la info: ${msg}`,
        (msg: string) => `${msg} ¿Te interesa?`,
        (msg: string) => `Déjame mostrarte: ${msg}`,
      ]
    },

    // Despedidas
    farewell: {
      patterns: [/(adiós|hasta luego|nos vemos|chao|bye)/i],
      variations: [
        (msg: string) => msg,
        (msg: string) => `${msg} 👋`,
        (msg: string) => `${msg} ¡Que tengas un excelente día!`,
        (msg: string) => `${msg} Estamos para servirte`,
        (msg: string) => `${msg} ¡Vuelve pronto!`,
        (msg: string) => `${msg} 😊`,
        (msg: string) => `${msg} ¡Hasta pronto!`,
      ]
    },

    // Ofertas/Promociones
    offer: {
      patterns: [/(oferta|descuento|promoción|rebaja|precio especial)/i],
      variations: [
        (msg: string) => msg,
        (msg: string) => `${msg} 🎉`,
        (msg: string) => `${msg} ¡No te lo pierdas!`,
        (msg: string) => `¡Atención! ${msg}`,
        (msg: string) => `${msg} 🔥`,
        (msg: string) => `Mira esta oferta: ${msg}`,
        (msg: string) => `${msg} ¡Aprovecha!`,
      ]
    },

    // Ayuda/Soporte
    help: {
      patterns: [/(ayuda|problema|error|no funciona|ayúdame)/i],
      variations: [
        (msg: string) => msg,
        (msg: string) => `${msg} 🤝`,
        (msg: string) => `Claro! ${msg}`,
        (msg: string) => `Con gusto te ayudo: ${msg}`,
        (msg: string) => `${msg} Estoy aquí para ayudarte`,
        (msg: string) => `Déjame ayudarte: ${msg}`,
        (msg: string) => `${msg} ¿En qué más puedo ayudarte?`,
      ]
    },
  }

  /**
   * Generar variación de mensaje según contexto
   */
  static generateVariation(message: string, variationIndex: number = 0): string {
    // Detectar contexto del mensaje
    const context = this.detectContext(message)

    // Obtener plantilla de variaciones
    const template = this.TEMPLATES[context]
    if (!template) {
      // Si no hay plantilla, usar variación genérica
      return this.genericVariation(message, variationIndex)
    }

    // Seleccionar variación según el índice
    const variations = template.variations
    const selectedVariation = variations[variationIndex % variations.length]

    // Aplicar variación
    return selectedVariation(message)
  }

  /**
   * Detectar contexto del mensaje
   */
  private static detectContext(message: string): keyof typeof MessageVariationService.TEMPLATES {
    for (const [context, template] of Object.entries(this.TEMPLATES)) {
      for (const pattern of template.patterns) {
        if (pattern.test(message)) {
          return context as keyof typeof MessageVariationService.TEMPLATES
        }
      }
    }
    return 'productInfo' // Contexto por defecto
  }

  /**
   * Variación genérica (cuando no hay contexto específico)
   */
  private static genericVariation(message: string, variationIndex: number): string {
    const variations = [
      (msg: string) => msg,
      (msg: string) => `${msg} 😊`,
      (msg: string) => `${msg} 👍`,
      (msg: string) => `${msg} ✅`,
      (msg: string) => `Claro! ${msg}`,
      (msg: string) => `${msg} ¿Te ayudo en algo más?`,
      (msg: string) => `${msg} 🙌`,
    ]

    const selectedVariation = variations[variationIndex % variations.length]
    return selectedVariation(message)
  }

  /**
   * Agregar variaciones de palabras comunes
   */
  static replaceCommonWords(message: string): string {
    const replacements: Record<string, string[]> = {
      'hola': ['hola', 'hey', 'qué tal', 'buenas', 'saludos'],
      'gracias': ['gracias', 'muchas gracias', 'te agradezco', 'mil gracias', 'super agradecido'],
      'sí': ['sí', 'claro', 'por supuesto', 'exacto', 'correcto', 'afirmativo'],
      'no': ['no', 'nop', 'negativo', 'no exactamente', 'no es así'],
      'bien': ['bien', 'genial', 'perfecto', 'excelente', 'muy bien', 'súper'],
      'ok': ['ok', 'vale', 'entendido', 'perfecto', 'listo', 'de acuerdo'],
      'producto': ['producto', 'artículo', 'item', 'mercancía'],
      'precio': ['precio', 'costo', 'valor', 'tarifa'],
      'comprar': ['comprar', 'adquirir', 'llevar', 'obtener'],
      'envío': ['envío', 'entrega', 'despacho', 'delivery'],
    }

    let result = message

    // Seleccionar aleatoriamente una palabra para reemplazar
    const words = Object.keys(replacements)
    const shuffled = words.sort(() => Math.random() - 0.5)

    for (const word of shuffled) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      if (regex.test(result)) {
        const variations = replacements[word]
        const replacement = variations[Math.floor(Math.random() * variations.length)]
        result = result.replace(regex, replacement)
        break // Solo reemplazar una palabra
      }
    }

    return result
  }

  /**
   * Agregar emojis contextuales
   */
  static addContextualEmoji(message: string): string {
    const emojiMap: Record<string, string[]> = {
      'producto': ['📦', '🛍️', '🎁'],
      'precio': ['💰', '💵', '💳'],
      'oferta': ['🎉', '🔥', '⚡', '✨'],
      'gracias': ['😊', '🙏', '❤️', '🤗'],
      'hola': ['👋', '😊', '🙂'],
      'pregunta': ['🤔', '❓', '💭'],
      'ayuda': ['🤝', '💪', '🆘'],
      'envío': ['🚚', '📦', '🚀'],
      'disponible': ['✅', '👍', '🟢'],
    }

    for (const [keyword, emojis] of Object.entries(emojiMap)) {
      if (new RegExp(keyword, 'i').test(message)) {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)]
        // 50% al inicio, 50% al final
        return Math.random() > 0.5 ? `${emoji} ${message}` : `${message} ${emoji}`
      }
    }

    return message
  }

  /**
   * Generar variación completa (combina todas las técnicas)
   */
  static generateCompleteVariation(message: string, variationIndex: number = 0): string {
    let result = message

    // 1. Aplicar variación de contexto
    result = this.generateVariation(result, variationIndex)

    // 2. Reemplazar palabras comunes (30% de probabilidad)
    if (Math.random() > 0.7) {
      result = this.replaceCommonWords(result)
    }

    // 3. Agregar emoji contextual (40% de probabilidad)
    if (Math.random() > 0.6) {
      result = this.addContextualEmoji(result)
    }

    return result
  }
}
