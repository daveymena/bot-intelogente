/**
 * 🎭 GENERADOR DE RESPUESTAS HUMANIZADAS
 * 
 * Genera respuestas naturales y profesionales según el contexto
 */

import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

interface HumanizedResponse {
  message: string
  tone: 'casual' | 'professional' | 'friendly'
  confidence: number
  shouldSendPhoto: boolean
}

export class HumanizedResponseGenerator {
  /**
   * Generar respuesta humanizada con Groq
   */
  static async generateWithGroq(
    userMessage: string,
    context: {
      productName?: string
      productPrice?: number
      productDescription?: string
      intent: string
      conversationHistory?: Array<{ role: string; content: string }>
      tone?: 'casual' | 'professional' | 'friendly'
    }
  ): Promise<HumanizedResponse> {
    try {
      const tone = context.tone || 'friendly'
      const systemPrompt = this.buildSystemPrompt(tone, context.intent)

      const messages: any[] = [
        { role: 'system', content: systemPrompt }
      ]

      // Agregar historial si existe (máximo 3 mensajes)
      if (context.conversationHistory && context.conversationHistory.length > 0) {
        const recentHistory = context.conversationHistory.slice(-3)
        messages.push(...recentHistory)
      }

      // Construir mensaje del usuario con contexto
      let userPrompt = userMessage

      if (context.productName) {
        userPrompt += `\n\nContexto del producto:\n- Nombre: ${context.productName}`
        if (context.productPrice) {
          userPrompt += `\n- Precio: $${context.productPrice.toLocaleString('es-CO')} COP`
        }
        if (context.productDescription) {
          userPrompt += `\n- Descripción: ${context.productDescription}`
        }
      }

      messages.push({ role: 'user', content: userPrompt })

      // Llamar a Groq
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages,
        temperature: 0.7,
        max_tokens: 400,
        top_p: 0.9
      })

      const response = completion.choices[0]?.message?.content || ''

      // Determinar si debe enviar foto
      const shouldSendPhoto = this.shouldIncludePhoto(context.intent, userMessage)

      return {
        message: response,
        tone,
        confidence: 0.9,
        shouldSendPhoto
      }
    } catch (error) {
      console.error('[HumanizedResponse] ❌ Error con Groq:', error)
      throw error
    }
  }

  /**
   * Construir prompt del sistema según el tono
   */
  private static buildSystemPrompt(
    tone: 'casual' | 'professional' | 'friendly',
    intent: string
  ): string {
    const basePrompt = `Eres un asistente de ventas de Tecnovariedades D&S en Colombia.

REGLAS IMPORTANTES:
1. Responde SIEMPRE en español colombiano
2. Usa emojis de forma natural (2-4 por mensaje, no exageres)
3. Sé conciso pero completo (máximo 150 palabras)
4. Menciona precios en pesos colombianos (COP) con formato: $XX.XXX COP
5. Si no sabes algo, sé honesto
6. NUNCA inventes información de productos
7. Usa formato WhatsApp:
   - Negritas con *texto*
   - Listas con • o ✅
   - Saltos de línea para separar secciones
   - Espacios entre párrafos para mejor lectura

FORMATO DE RESPUESTA:
- Saludo con emoji (si aplica)
- Información principal
- Precio destacado con 💰
- Características con ✅ o •
- Pregunta de cierre

EJEMPLO DE FORMATO:
¡Claro! 😊 Tengo el *Producto X*

Descripción breve del producto.

💰 Precio: $XX.XXX COP

Características:
✅ Característica 1
✅ Característica 2
✅ Característica 3

¿Te gustaría saber más?

`

    const tonePrompts = {
      casual: `TONO: Casual y relajado
- Usa expresiones colombianas naturales
- Sé amigable pero no invasivo
- Ejemplo: "¡Ey! ¿Qué más? 😊"`,

      professional: `TONO: Profesional pero cercano
- Mantén formalidad sin ser frío
- Enfócate en beneficios y valor
- Ejemplo: "Con gusto le ayudo con eso 😊"`,

      friendly: `TONO: Amigable y servicial
- Sé cálido y acogedor
- Muestra entusiasmo genuino
- Ejemplo: "¡Claro! Con mucho gusto 😊"`
    }

    const intentGuidance = this.getIntentGuidance(intent)

    return basePrompt + tonePrompts[tone] + '\n\n' + intentGuidance
  }

  /**
   * Obtener guía según la intención
   */
  private static getIntentGuidance(intent: string): string {
    const guidance: Record<string, string> = {
      product_search: `INTENCIÓN: Búsqueda de producto
- Presenta el producto de forma atractiva
- Menciona precio y características clave
- Pregunta si quiere más detalles`,

      product_info: `INTENCIÓN: Información de producto
- Da detalles específicos y relevantes
- Usa viñetas para características
- Ofrece ayuda adicional`,

      price_inquiry: `INTENCIÓN: Consulta de precio
- Menciona el precio claramente
- Agrega valor (características, beneficios)
- Pregunta si le interesa`,

      purchase: `INTENCIÓN: Intención de compra
- Confirma el producto y precio
- Lista métodos de pago disponibles
- Guía el siguiente paso`,

      payment_request: `INTENCIÓN: Solicitud de pago
- Proporciona información de pago clara
- Incluye pasos específicos
- Menciona tiempo de entrega`,

      photo_request: `INTENCIÓN: Solicitud de fotos
- Confirma que enviarás las fotos
- Menciona que son fotos reales
- Pregunta si necesita más información`,

      greeting: `INTENCIÓN: Saludo
- Responde con calidez
- Ofrece ayuda
- Pregunta en qué puedes ayudar`,

      general_inquiry: `INTENCIÓN: Consulta general
- Responde de forma útil
- Ofrece opciones si aplica
- Mantén la conversación fluida`
    }

    return guidance[intent] || 'Responde de forma natural y útil.'
  }

  /**
   * Determinar si debe incluir foto
   */
  private static shouldIncludePhoto(intent: string, userMessage: string): boolean {
    const photoIntents = ['photo_request', 'product_info', 'product_search']
    const photoKeywords = ['foto', 'imagen', 'ver', 'muestra', 'enseña', 'cómo se ve']

    const hasPhotoIntent = photoIntents.includes(intent)
    const hasPhotoKeyword = photoKeywords.some(keyword =>
      userMessage.toLowerCase().includes(keyword)
    )

    return hasPhotoIntent || hasPhotoKeyword
  }

  /**
   * Generar variaciones de respuesta (anti-ban)
   */
  static generateVariations(baseResponse: string): string[] {
    const variations: string[] = [baseResponse]

    // Variación 1: Cambiar emojis
    const emojiVariations = [
      { from: '😊', to: '🙂' },
      { from: '✅', to: '☑️' },
      { from: '💰', to: '💵' },
      { from: '🎯', to: '🎪' }
    ]

    let variation1 = baseResponse
    for (const { from, to } of emojiVariations) {
      variation1 = variation1.replace(new RegExp(from, 'g'), to)
    }
    variations.push(variation1)

    // Variación 2: Cambiar saludos
    const greetingVariations = [
      { from: '¡Hola!', to: '¡Qué tal!' },
      { from: '¡Claro!', to: '¡Por supuesto!' },
      { from: '¡Perfecto!', to: '¡Excelente!' }
    ]

    let variation2 = baseResponse
    for (const { from, to } of greetingVariations) {
      variation2 = variation2.replace(new RegExp(from, 'g'), to)
    }
    variations.push(variation2)

    return variations
  }

  /**
   * Seleccionar variación aleatoria
   */
  static selectRandomVariation(variations: string[]): string {
    const index = Math.floor(Math.random() * variations.length)
    return variations[index]
  }
}
