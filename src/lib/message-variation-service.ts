/**
 * 🎭 SERVICIO DE VARIACIONES DE MENSAJES
 * Genera variaciones inteligentes de mensajes para evitar detección de spam
 */

export class MessageVariationService {
  
  /**
   * Generar variación completa de un mensaje
   */
  static generateCompleteVariation(originalMessage: string, variationIndex: number = 0): string {
    let variation = originalMessage

    // Aplicar diferentes tipos de variaciones según el índice
    switch (variationIndex % 6) {
      case 0:
        variation = this.addGreetingVariation(variation)
        break
      case 1:
        variation = this.addEmphasisVariation(variation)
        break
      case 2:
        variation = this.addPolitenessVariation(variation)
        break
      case 3:
        variation = this.addCasualVariation(variation)
        break
      case 4:
        variation = this.addFormalVariation(variation)
        break
      case 5:
        variation = this.addEmojiVariation(variation)
        break
    }

    return variation
  }

  /**
   * Agregar variación de saludo
   */
  private static addGreetingVariation(message: string): string {
    const greetings = [
      'Hola! ',
      'Hey! ',
      'Buenas! ',
      'Qué tal! ',
      'Saludos! ',
      'Hola, espero estés bien! ',
      'Hey, ¿cómo estás? ',
      'Buenas tardes! ',
      'Hola, ¿qué tal todo? ',
      'Hey, espero tengas un buen día! '
    ]

    // Solo agregar saludo si no empieza con uno
    if (!message.toLowerCase().startsWith('hola') && 
        !message.toLowerCase().startsWith('hey') && 
        !message.toLowerCase().startsWith('buenas')) {
      const greeting = greetings[Math.floor(Math.random() * greetings.length)]
      return greeting + message
    }

    return message
  }

  /**
   * Agregar variación de énfasis
   */
  private static addEmphasisVariation(message: string): string {
    const emphasisWords = [
      'definitivamente',
      'absolutamente',
      'sin duda',
      'por supuesto',
      'claramente',
      'obviamente',
      'realmente',
      'verdaderamente'
    ]

    const word = emphasisWords[Math.floor(Math.random() * emphasisWords.length)]
    
    // Insertar palabra de énfasis al inicio o después de la primera coma
    if (message.includes(',')) {
      return message.replace(',', `, ${word},`)
    } else {
      return `${word.charAt(0).toUpperCase() + word.slice(1)}, ${message.toLowerCase()}`
    }
  }

  /**
   * Agregar variación de cortesía
   */
  private static addPolitenessVariation(message: string): string {
    const politeEndings = [
      ' Por favor, déjame saber si necesitas algo más.',
      ' Espero haberte ayudado.',
      ' Cualquier duda, no dudes en preguntar.',
      ' Estoy aquí para ayudarte.',
      ' Gracias por tu paciencia.',
      ' Que tengas un excelente día.',
      ' Espero que esta información te sea útil.',
      ' Si tienes más preguntas, estaré encantado de ayudarte.',
      ' Muchas gracias por tu interés.',
      ' Espero poder ayudarte pronto.'
    ]

    const ending = politeEndings[Math.floor(Math.random() * politeEndings.length)]
    return message + ending
  }

  /**
   * Agregar variación casual
   */
  private static addCasualVariation(message: string): string {
    const casualPhrases = [
      'Oye, ',
      'Mira, ',
      'Fíjate que ',
      'Te cuento que ',
      'La cosa es que ',
      'Resulta que ',
      'Lo que pasa es que ',
      'Te comento que ',
      'Déjame decirte que ',
      'La verdad es que '
    ]

    const phrase = casualPhrases[Math.floor(Math.random() * casualPhrases.length)]
    return phrase + message.toLowerCase()
  }

  /**
   * Agregar variación formal
   */
  private static addFormalVariation(message: string): string {
    const formalPhrases = [
      'Me complace informarle que ',
      'Tengo el gusto de comunicarle que ',
      'Es un placer poder decirle que ',
      'Me es grato informarle que ',
      'Permítame comunicarle que ',
      'Tengo el honor de informarle que ',
      'Es mi deber informarle que ',
      'Me dirijo a usted para comunicarle que ',
      'Aprovecho la oportunidad para informarle que ',
      'Me es muy satisfactorio comunicarle que '
    ]

    const phrase = formalPhrases[Math.floor(Math.random() * formalPhrases.length)]
    return phrase + message.toLowerCase()
  }

  /**
   * Agregar variación con emojis
   */
  private static addEmojiVariation(message: string): string {
    const startEmojis = ['😊', '👋', '🙌', '✨', '💫', '🎉', '👍', '😄', '🤝', '💪']
    const endEmojis = ['😊', '👍', '✅', '🙌', '💪', '🎉', '✨', '👌', '😄', '🤝', '💯', '🔥', '⭐']

    const startEmoji = startEmojis[Math.floor(Math.random() * startEmojis.length)]
    const endEmoji = endEmojis[Math.floor(Math.random() * endEmojis.length)]

    return `${startEmoji} ${message} ${endEmoji}`
  }

  /**
   * Generar variación de palabra específica
   */
  static generateWordVariation(word: string): string {
    const wordVariations: Record<string, string[]> = {
      'hola': ['hola', 'hey', 'qué tal', 'buenas', 'saludos', 'holi'],
      'gracias': ['gracias', 'muchas gracias', 'te agradezco', 'mil gracias', 'thanks', 'genial'],
      'sí': ['sí', 'claro', 'por supuesto', 'exacto', 'correcto', 'así es', 'efectivamente'],
      'no': ['no', 'nop', 'negativo', 'no exactamente', 'para nada', 'ni modo'],
      'bien': ['bien', 'genial', 'perfecto', 'excelente', 'muy bien', 'súper', 'increíble'],
      'ok': ['ok', 'vale', 'entendido', 'perfecto', 'listo', 'de acuerdo', 'okey'],
      'bueno': ['bueno', 'bien', 'vale', 'está bien', 'perfecto', 'genial'],
      'precio': ['precio', 'costo', 'valor', 'tarifa', 'monto', 'cantidad'],
      'producto': ['producto', 'artículo', 'item', 'mercancía', 'elemento'],
      'disponible': ['disponible', 'en stock', 'hay', 'tenemos', 'contamos con'],
      'envío': ['envío', 'entrega', 'despacho', 'delivery', 'domicilio'],
      'pago': ['pago', 'abono', 'cancelación', 'transacción', 'compra']
    }

    const variations = wordVariations[word.toLowerCase()]
    if (variations) {
      return variations[Math.floor(Math.random() * variations.length)]
    }

    return word
  }

  /**
   * Aplicar variaciones sutiles a un texto
   */
  static applySubtleVariations(text: string): string {
    let result = text

    // 1. Variaciones de puntuación (20% probabilidad)
    if (Math.random() < 0.2) {
      result = result.replace(/\./g, '...')
    }

    // 2. Variaciones de mayúsculas (15% probabilidad)
    if (Math.random() < 0.15) {
      result = result.replace(/\b\w/g, (match) => 
        Math.random() < 0.5 ? match.toUpperCase() : match.toLowerCase()
      )
    }

    // 3. Agregar espacios extra (10% probabilidad)
    if (Math.random() < 0.1) {
      result = result.replace(/([.!?])/g, '$1 ')
    }

    // 4. Reemplazar palabras comunes (25% probabilidad)
    if (Math.random() < 0.25) {
      const words = result.split(' ')
      const randomIndex = Math.floor(Math.random() * words.length)
      const originalWord = words[randomIndex]
      const variation = this.generateWordVariation(originalWord)
      words[randomIndex] = variation
      result = words.join(' ')
    }

    return result.trim()
  }

  /**
   * Generar múltiples variaciones de un mensaje
   */
  static generateMultipleVariations(message: string, count: number = 5): string[] {
    const variations: string[] = []
    
    for (let i = 0; i < count; i++) {
      let variation = this.generateCompleteVariation(message, i)
      variation = this.applySubtleVariations(variation)
      variations.push(variation)
    }

    return variations
  }

  /**
   * Seleccionar variación aleatoria de una lista
   */
  static selectRandomVariation(variations: string[]): string {
    return variations[Math.floor(Math.random() * variations.length)]
  }
}