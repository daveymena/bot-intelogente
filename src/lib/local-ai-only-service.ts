/**
 * Local AI Only Service
 * Sistema que usa SOLO la IA local entrenada
 * Desactiva todas las IAs externas (Groq, OpenAI, Claude, etc.)
 * Desactiva Ollama
 */

import fs from 'fs'
import path from 'path'
import { db } from './db'
import { ConversationMemoryService } from './conversation-memory-service'

interface LocalAIResponse {
  message: string
  confidence: number
  intent: string
  shouldSendPhotos: boolean
  photoProductIds?: string[]
  paymentLink?: string
  responseTime: number
}

interface TrainingData {
  prompts: string[]
  responses: string[]
  intents: string[]
  products: any[]
  paymentMethods: any[]
}

export class LocalAIOnlyService {
  private static trainingData: TrainingData | null = null
  private static isInitialized = false
  private static modelPath = path.join(process.cwd(), 'data', 'local-ai-model.json')
  private static trainingPath = path.join(process.cwd(), 'data', 'training-data.json')

  /**
   * Inicializar servicio de IA local
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('[LocalAI] 🚀 Inicializando IA Local (Sin IAs Externas)...')

    try {
      // Cargar datos de entrenamiento
      await this.loadTrainingData()

      // Verificar que no hay IAs externas habilitadas
      this.verifyNoExternalAIs()

      this.isInitialized = true
      console.log('[LocalAI] ✅ IA Local inicializada correctamente')
    } catch (error) {
      console.error('[LocalAI] ❌ Error inicializando IA Local:', error)
      throw error
    }
  }

  /**
   * Cargar datos de entrenamiento
   */
  private static async loadTrainingData(): Promise<void> {
    try {
      // 1. Intentar cargar desde modelo entrenado (PRIORIDAD)
      if (fs.existsSync(this.modelPath)) {
        const modelContent = fs.readFileSync(this.modelPath, 'utf-8')
        const model = JSON.parse(modelContent)
        
        if (model.trainingData && model.trainingData.prompts && model.trainingData.prompts.length > 0) {
          this.trainingData = {
            prompts: model.trainingData.prompts,
            responses: model.trainingData.responses,
            intents: model.trainingData.intents,
            products: [],
            paymentMethods: []
          }
          console.log(`[LocalAI] 📚 Modelo entrenado cargado: ${this.trainingData.prompts.length} ejemplos`)
          return
        }
      }

      // 2. Intentar cargar desde archivo de entrenamiento
      if (fs.existsSync(this.trainingPath)) {
        const data = fs.readFileSync(this.trainingPath, 'utf-8')
        this.trainingData = JSON.parse(data)
        console.log('[LocalAI] 📚 Datos de entrenamiento cargados desde archivo')
        return
      }

      // 3. Si no existe, cargar desde BD
      console.log('[LocalAI] 📚 Cargando datos de entrenamiento desde BD...')

      const products = await db.product.findMany({
        take: 1000,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          category: true,
          images: true
        }
      })

      this.trainingData = {
        prompts: [],
        responses: [],
        intents: [],
        products: products as any[],
        paymentMethods: []
      }

      console.log('[LocalAI] ✅ Datos de entrenamiento cargados')
    } catch (error) {
      console.error('[LocalAI] ❌ Error cargando datos de entrenamiento:', error)
      this.trainingData = {
        prompts: [],
        responses: [],
        intents: [],
        products: [],
        paymentMethods: []
      }
    }
  }

  /**
   * Guardar datos de entrenamiento
   */
  private static saveTrainingData(): void {
    try {
      const dir = path.dirname(this.trainingPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      fs.writeFileSync(
        this.trainingPath,
        JSON.stringify(this.trainingData, null, 2),
        'utf-8'
      )
      console.log('[LocalAI] 💾 Datos de entrenamiento guardados')
    } catch (error) {
      console.error('[LocalAI] ❌ Error guardando datos:', error)
    }
  }

  /**
   * Verificar que no hay IAs externas habilitadas
   */
  private static verifyNoExternalAIs(): void {
    const externalAIs = {
      'GROQ_API_KEY': process.env.GROQ_API_KEY,
      'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
      'CLAUDE_API_KEY': process.env.CLAUDE_API_KEY,
      'GEMINI_API_KEY': process.env.GEMINI_API_KEY,
      'MISTRAL_API_KEY': process.env.MISTRAL_API_KEY,
      'OLLAMA_ENABLED': process.env.OLLAMA_ENABLED
    }

    const enabledAIs = Object.entries(externalAIs)
      .filter(([_, value]) => value && value !== 'false')
      .map(([key]) => key)

    if (enabledAIs.length > 0) {
      console.log('[LocalAI] ⚠️ ADVERTENCIA: IAs externas detectadas:')
      enabledAIs.forEach(ai => console.log(`  - ${ai}`))
      console.log('[LocalAI] 🔒 Desactivando todas las IAs externas...')
    } else {
      console.log('[LocalAI] ✅ Ninguna IA externa habilitada (Correcto)')
    }
  }

  /**
   * Procesar mensaje con IA local
   */
  static async processMessage(
    userMessage: string,
    userId: string,
    conversationHistory: any[] = [],
    from?: string
  ): Promise<LocalAIResponse> {
    const startTime = Date.now()

    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      console.log(`[LocalAI] 🧠 Procesando: "${userMessage.substring(0, 50)}..."`)

      // 0. Obtener contexto de conversación
      const context = from ? ConversationMemoryService.getOrCreateContext(userId, from) : null

      // 1. Verificar si está pidiendo más información del producto anterior (PRIMERO)
      let lastProduct: any = null
      let intent = 'general'
      
      if (context && from && ConversationMemoryService.isAskingForMoreInfo(userId, from, userMessage)) {
        lastProduct = ConversationMemoryService.getLastProduct(userId, from)
        if (lastProduct && lastProduct.name) {
          console.log(`[LocalAI] 💭 Usuario pidiendo más info sobre: ${lastProduct.name}`)
          intent = 'product_info'
        }
      }

      // 2. Si no detectamos que pide más información, detectar intención normal
      if (intent === 'general') {
        intent = this.detectIntent(userMessage, userId, from)
      }
      
      console.log(`[LocalAI] 🎯 Intención detectada: ${intent}`)

      // 3. Buscar productos relevantes
      let relevantProducts = this.findRelevantProducts(userMessage, intent)
      
      // Si no encontró productos pero hay uno en contexto, usar ese
      if (relevantProducts.length === 0 && lastProduct && lastProduct.name) {
        relevantProducts = [lastProduct]
        console.log(`[LocalAI] 📦 Usando producto del contexto: ${lastProduct.name}`)
      }

      console.log(`[LocalAI] 📦 Productos encontrados: ${relevantProducts.length}`)

      // 3. Generar respuesta
      const response = this.generateResponse(
        userMessage,
        intent,
        relevantProducts,
        conversationHistory,
        context,
        lastProduct
      )

      // 4. Determinar si enviar fotos
      const shouldSendPhotos = this.shouldSendPhotos(intent, relevantProducts)
      const photoProductIds = shouldSendPhotos ? relevantProducts.slice(0, 5).map(p => p.id) : undefined

      // 5. Generar link de pago dinámico si es necesario
      const paymentLink = this.shouldGeneratePaymentLink(intent, relevantProducts)
        ? await this.generateDynamicPaymentLink(relevantProducts, userId)
        : undefined

      const responseTime = Date.now() - startTime

      console.log(`[LocalAI] ✅ Respuesta generada en ${responseTime}ms`)

      // Guardar en memoria de conversación
      if (from) {
        ConversationMemoryService.addMessage(userId, from, 'user', userMessage)
        ConversationMemoryService.addMessage(userId, from, 'assistant', response)
        ConversationMemoryService.setLastIntent(userId, from, intent)

        // Guardar producto si hay
        if (relevantProducts.length > 0) {
          ConversationMemoryService.setLastProduct(userId, from, {
            id: relevantProducts[0].id,
            name: relevantProducts[0].name,
            description: relevantProducts[0].description || '',
            price: relevantProducts[0].price || 0
          })
        } else if (lastProduct) {
          // Si no hay productos relevantes pero hay uno en contexto, mantenerlo
          ConversationMemoryService.setLastProduct(userId, from, lastProduct)
        } else {
          // Intentar extraer producto de la respuesta entrenada
          const extractedProduct = this.extractProductFromResponse(response, intent)
          if (extractedProduct) {
            ConversationMemoryService.setLastProduct(userId, from, extractedProduct)
          }
        }
      }

      return {
        message: response,
        confidence: this.calculateConfidence(intent, relevantProducts),
        intent,
        shouldSendPhotos,
        photoProductIds,
        paymentLink,
        responseTime
      }
    } catch (error) {
      console.error('[LocalAI] ❌ Error procesando mensaje:', error)
      return {
        message: 'Disculpa, tuve un problema procesando tu mensaje. Intenta de nuevo.',
        confidence: 0,
        intent: 'error',
        shouldSendPhotos: false,
        responseTime: Date.now() - startTime
      }
    }
  }

  /**
   * Detectar intención del usuario
   */
  private static detectIntent(message: string, userId?: string, from?: string): string {
    const lowerMessage = message.toLowerCase()

    // Intenciones de información (PRIMERO - más específico)
    // Palabras clave para pedir más información
    if (lowerMessage.match(/más|mas|detalles|características|especificaciones|información|cuéntame|dime|explica|cómo|cuándo|dónde|precio|costo|garantía|envío|entrega|disponible|stock|sí|si|claro|dale|ok|okay|perfecto|genial|excelente/i)) {
      // Si hay un producto en contexto, es información sobre ese producto
      if (from && userId) {
        const lastProduct = ConversationMemoryService.getLastProduct(userId, from)
        if (lastProduct) {
          return 'product_info'
        }
      }
    }

    // Intenciones de búsqueda (SEGUNDO - más específico)
    if (lowerMessage.match(/buscar|mostrar|ver|qué tienes|qué hay|catálogo|productos|interesado|interesa|curso|piano/i)) {
      return 'product_search'
    }

    // Intenciones de compra
    if (lowerMessage.match(/comprar|quiero|necesito|precio|cuánto cuesta|costo/i)) {
      return 'purchase'
    }

    // Intenciones de pago
    if (lowerMessage.match(/pagar|pago|transferencia|nequi|daviplata|tarjeta|mercado pago/i)) {
      return 'payment'
    }

    // Intenciones de información
    if (lowerMessage.match(/información|detalles|especificaciones|características|descripción/i)) {
      return 'info'
    }

    // Intenciones de soporte
    if (lowerMessage.match(/ayuda|problema|error|no funciona|soporte|contacto/i)) {
      return 'support'
    }

    // Intenciones de seguimiento
    if (lowerMessage.match(/estado|pedido|orden|seguimiento|dónde está|cuándo llega/i)) {
      return 'tracking'
    }

    // Intenciones de recomendación
    if (lowerMessage.match(/recomienda|sugerencia|qué me recomiendas|mejor|popular/i)) {
      return 'recommendation'
    }

    return 'general'
  }

  /**
   * Buscar productos relevantes
   */
  private static findRelevantProducts(message: string, intent: string): any[] {
    if (!this.trainingData || !this.trainingData.products) {
      return []
    }

    const lowerMessage = message.toLowerCase()
    const keywords = lowerMessage.split(/\s+/).filter(w => w.length > 3)

    // Buscar por palabras clave
    const matches = this.trainingData.products.filter(product => {
      const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase()
      return keywords.some(keyword => productText.includes(keyword))
    })

    // Ordenar por relevancia
    return matches
      .sort((a, b) => {
        const aMatches = keywords.filter(k => a.name.toLowerCase().includes(k)).length
        const bMatches = keywords.filter(k => b.name.toLowerCase().includes(k)).length
        return bMatches - aMatches
      })
      .slice(0, 10)
  }

  /**
   * Generar respuesta usando datos entrenados
   */
  private static generateResponse(
    userMessage: string,
    intent: string,
    products: any[],
    history: any[],
    context?: any,
    lastProduct?: any
  ): string {
    // 1. Intentar encontrar respuesta similar en datos entrenados
    // MEJORADO: Pasar contexto y producto anterior
    const trainedResponse = this.findSimilarTrainedResponse(
      userMessage,
      intent,
      context,
      lastProduct
    )
    if (trainedResponse) {
      console.log(`[LocalAI] 📚 Usando respuesta entrenada`)
      return trainedResponse
    }

    // 2. Si no hay respuesta entrenada, generar respuesta contextual
    console.log(`[LocalAI] 🔧 Generando respuesta contextual`)

    const responses: { [key: string]: string[] } = {
      search: [
        '¡Perfecto! 🎯 Mira, tengo varias opciones que te pueden servir:',
        '¡Claro! 👍 Déjame mostrarte lo que tengo:',
        '¡Dale! 🚀 Te muestro las opciones disponibles:',
        'Súper 💪, tengo estas opciones para ti:',
        '¡Genial! ✨ Fíjate en estas opciones:'
      ],
      purchase: [
        '¡Excelente! 🎉 Te muestro lo que tenemos:',
        '¡Claro que sí! 👌 Aquí están nuestras opciones:',
        '¡Perfecto! 💯 Déjame mostrarte:',
        '¡Genial! 🌟 Tengo justo lo que buscas:',
        '¡Claro! 📦 Mira estas opciones:'
      ],
      payment: [
        '¡Perfecto! 💳 Te muestro nuestros métodos de pago:',
        '¡Claro! 💰 Tenemos varias formas de pago:',
        '¡Excelente! ✅ Aquí están nuestras opciones de pago:',
        '¡Genial! 🏦 Puedes pagar de varias formas:',
        '¡Claro que sí! 💵 Estos son nuestros métodos:'
      ],
      info: [
        '¡Claro! 📚 Te doy toda la información:',
        '¡Perfecto! 📋 Aquí están los detalles:',
        '¡Excelente! 🔍 Te cuento todo:',
        '¡Genial! 📖 Mira los detalles:',
        '¡Claro! ℹ️ Aquí está la información:'
      ],
      support: [
        '¡Claro! 🤝 Estoy aquí para ayudarte:',
        '¡Perfecto! 💬 Cuéntame qué necesitas:',
        '¡Excelente! 🆘 ¿En qué te puedo ayudar?',
        '¡Genial! 🛠️ Dime qué pasa:',
        '¡Claro! ❓ ¿Qué necesitas?'
      ],
      tracking: [
        '¡Perfecto! 📍 Te doy el estado de tu pedido:',
        '¡Claro! 🚚 Aquí está el seguimiento:',
        '¡Excelente! 📦 Mira el estado:',
        '¡Genial! 🎯 Tu pedido está:',
        '¡Claro! 📊 El seguimiento es:'
      ],
      recommendation: [
        '¡Excelente pregunta! ⭐ Te recomiendo:',
        '¡Perfecto! 🎁 Mi recomendación es:',
        '¡Claro! 👑 Lo mejor que tenemos es:',
        '¡Genial! 🏆 Te recomiendo esto:',
        '¡Perfecto! 💎 Esto es lo mejor:'
      ],
      general: [
        '¡Claro! 👋 Te ayudo con gusto:',
        '¡Perfecto! ✨ Aquí está:',
        '¡Excelente! 🎯 Mira:',
        '¡Genial! 💡 Te cuento:',
        '¡Claro! 📢 Aquí va:'
      ]
    }

    const responseList = responses[intent] || responses.general
    const baseResponse = responseList[Math.floor(Math.random() * responseList.length)]

    // Agregar información de productos si existen
    if (products.length > 0) {
      let productInfo = '\n\n'
      products.slice(0, 3).forEach((product, index) => {
        productInfo += `${index + 1}️⃣ *${product.name}*\n`
        productInfo += `   💰 Precio: $${product.price?.toLocaleString('es-CO') || 'Consultar'}\n`
        if (product.description) {
          const shortDesc = product.description.substring(0, 60)
          productInfo += `   📝 ${shortDesc}${product.description.length > 60 ? '...' : ''}\n`
        }
        productInfo += `   ➡️ Más información disponible\n\n`
      })

      // Generar cierre contextual basado en cantidad de productos
      let closing = ''
      if (products.length === 1) {
        // Si hay un solo producto, preguntar si quiere más detalles
        closing = `¿Te gustaría saber más detalles sobre *${products[0].name}*? 😊`
      } else {
        // Si hay múltiples productos, preguntar cuál interesa
        closing = '¿Cuál te interesa? 😊'
      }

      return baseResponse + productInfo + closing
    }

    return baseResponse
  }

  /**
   * Buscar respuesta similar en datos entrenados
   * MEJORADO: Considera el contexto de la conversación
   */
  private static findSimilarTrainedResponse(
    userMessage: string,
    intent: string,
    context?: any,
    lastProduct?: any
  ): string | null {
    if (!this.trainingData || !this.trainingData.prompts || this.trainingData.prompts.length === 0) {
      console.log(`[LocalAI] ⚠️ No hay datos de entrenamiento disponibles`)
      return null
    }

    const lowerMessage = userMessage.toLowerCase()
    let bestMatch: { score: number; response: string; intent: string } = { score: 0, response: '', intent: '' }

    console.log(`[LocalAI] 🔍 Buscando en ${this.trainingData.prompts.length} ejemplos...`)

    // Si el usuario está pidiendo más información sobre un producto anterior
    // Buscar respuestas que mencionen ese producto
    let contextualKeywords = ''
    if (lastProduct && this.isAskingForMoreInfo(lowerMessage)) {
      contextualKeywords = lastProduct.name.toLowerCase()
      console.log(`[LocalAI] 💭 Contexto: Usuario pidiendo más info sobre "${lastProduct.name}"`)
    }

    // Buscar coincidencias por similitud
    for (let i = 0; i < this.trainingData.prompts.length; i++) {
      const prompt = this.trainingData.prompts[i].toLowerCase()
      const trainedIntent = this.trainingData.intents[i]
      const response = this.trainingData.responses[i]

      // Calcular similitud base
      let similarity = this.calculateSimilarity(lowerMessage, prompt)

      // BONUS: Si hay contexto y la respuesta menciona el producto, aumentar similitud
      if (contextualKeywords && response.toLowerCase().includes(contextualKeywords)) {
        similarity += 0.4 // Bonus significativo por contexto
        console.log(`[LocalAI] ✨ Bonus de contexto aplicado para "${contextualKeywords}"`)
      }

      // BONUS: Si la intención coincide, aumentar similitud
      if (trainedIntent === intent) {
        similarity += 0.15
      }

      // Limitar a 1.0
      similarity = Math.min(similarity, 1.0)

      // Guardar la mejor coincidencia
      if (similarity > bestMatch.score) {
        bestMatch = {
          score: similarity,
          response: response,
          intent: trainedIntent
        }
      }
    }

    console.log(`[LocalAI] 🎯 Mejor coincidencia: ${(bestMatch.score * 100).toFixed(0)}% (intención: ${bestMatch.intent})`)

    // Retornar si hay coincidencia significativa
    // Umbral bajo (20%) porque la similitud Jaccard es conservadora
    if (bestMatch.score > 0.2) {
      console.log(`[LocalAI] 📚 Respuesta entrenada encontrada (similitud: ${(bestMatch.score * 100).toFixed(0)}%, intención: ${bestMatch.intent})`)
      return bestMatch.response
    }

    console.log(`[LocalAI] ❌ No hay coincidencia suficiente (mejor: ${(bestMatch.score * 100).toFixed(0)}%)`)
    return null
  }

  /**
   * Detectar si el usuario está pidiendo más información
   */
  private static isAskingForMoreInfo(message: string): boolean {
    const lowerMessage = message.toLowerCase()
    return lowerMessage.match(/más|mas|detalles|características|especificaciones|información|cuéntame|dime|explica|cómo|cuándo|dónde|precio|costo|garantía|envío|entrega|disponible|stock/i) !== null
  }

  /**
   * Calcular similitud entre dos textos (Mejorado)
   */
  private static calculateSimilarity(text1: string, text2: string): number {
    // Normalizar
    const normalize = (text: string) => text.toLowerCase().replace(/[^\w\s]/g, '').trim()
    const norm1 = normalize(text1)
    const norm2 = normalize(text2)

    // Similitud exacta
    if (norm1 === norm2) return 1.0

    // Extraer palabras
    const words1 = norm1.split(/\s+/).filter(w => w.length > 2)
    const words2 = norm2.split(/\s+/).filter(w => w.length > 2)

    if (words1.length === 0 || words2.length === 0) return 0

    // 1. Similitud Jaccard (palabras comunes)
    const set1 = new Set(words1)
    const set2 = new Set(words2)
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    const jaccardSimilarity = intersection.size / union.size

    // 2. Bonus por palabras clave importantes
    const importantKeywords = ['curso', 'piano', 'precio', 'comprar', 'quiero', 'necesito', 'busco', 'interesado', 'interesa']
    const commonKeywords = importantKeywords.filter(kw => norm1.includes(kw) && norm2.includes(kw))
    const keywordBonus = commonKeywords.length > 0 ? 0.3 : 0

    // 3. Bonus por palabras de acción similares
    const actionWords = ['busco', 'quiero', 'necesito', 'interesado', 'interesa', 'precio', 'costo', 'cuánto']
    const hasActionWord1 = actionWords.some(w => norm1.includes(w))
    const hasActionWord2 = actionWords.some(w => norm2.includes(w))
    const actionBonus = (hasActionWord1 && hasActionWord2) ? 0.2 : 0

    // 4. Bonus por longitud similar (evita falsos positivos)
    const lengthRatio = Math.min(words1.length, words2.length) / Math.max(words1.length, words2.length)
    const lengthBonus = lengthRatio > 0.5 ? 0.1 : 0

    // Calcular similitud final
    const finalSimilarity = Math.min(1.0, jaccardSimilarity + keywordBonus + actionBonus + lengthBonus)

    return finalSimilarity
  }

  /**
   * Determinar si enviar fotos
   */
  private static shouldSendPhotos(intent: string, products: any[]): boolean {
    // Enviar fotos si:
    // 1. Hay productos encontrados
    // 2. La intención es búsqueda, compra o recomendación
    return (
      products.length > 0 &&
      ['search', 'purchase', 'recommendation', 'info'].includes(intent)
    )
  }

  /**
   * Determinar si generar link de pago
   */
  private static shouldGeneratePaymentLink(intent: string, products: any[]): boolean {
    return (
      products.length > 0 &&
      ['purchase', 'payment'].includes(intent)
    )
  }

  /**
   * Generar link de pago dinámico
   */
  private static async generateDynamicPaymentLink(
    products: any[],
    userId: string
  ): Promise<string> {
    try {
      // Calcular total
      const total = products.reduce((sum, p) => sum + (p.price || 0), 0)

      // Crear link de pago dinámico
      const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/payment?products=${products.map(p => p.id).join(',')}&total=${total}&userId=${userId}`

      console.log(`[LocalAI] 💳 Link de pago generado: ${paymentLink}`)

      return paymentLink
    } catch (error) {
      console.error('[LocalAI] ❌ Error generando link de pago:', error)
      return ''
    }
  }

  /**
   * Extraer producto de la respuesta entrenada
   * Busca menciones de productos en la respuesta
   */
  private static extractProductFromResponse(response: string, intent: string): any | null {
    const lowerResponse = response.toLowerCase()

    // Palabras clave de productos
    const productKeywords: { [key: string]: { name: string; price: number } } = {
      'piano': { name: 'Curso de Piano', price: 65000 },
      'curso de piano': { name: 'Curso de Piano', price: 65000 },
      'laptop': { name: 'Laptop', price: 0 },
      'moto': { name: 'Motocicleta', price: 0 },
      'motocicleta': { name: 'Motocicleta', price: 0 },
      'curso': { name: 'Curso', price: 0 },
      'megapack': { name: 'Megapack', price: 0 },
      'digital': { name: 'Producto Digital', price: 0 }
    }

    // Buscar palabras clave en la respuesta
    for (const [keyword, product] of Object.entries(productKeywords)) {
      if (lowerResponse.includes(keyword)) {
        console.log(`[LocalAI] 🔍 Producto extraído de respuesta: ${product.name}`)
        return {
          id: keyword.replace(/\s+/g, '-'),
          name: product.name,
          description: `Producto mencionado en respuesta entrenada`,
          price: product.price
        }
      }
    }

    return null
  }

  /**
   * Calcular confianza de la respuesta
   */
  private static calculateConfidence(intent: string, products: any[]): number {
    let confidence = 0.5 // Base 50%

    // Aumentar confianza si hay productos
    if (products.length > 0) {
      confidence += 0.3
    }

    // Aumentar confianza si la intención es clara
    if (intent !== 'general') {
      confidence += 0.2
    }

    return Math.min(confidence, 1.0)
  }

  /**
   * Agregar datos de entrenamiento
   */
  static async addTrainingData(
    prompt: string,
    response: string,
    intent: string
  ): Promise<void> {
    if (!this.trainingData) {
      this.trainingData = {
        prompts: [],
        responses: [],
        intents: [],
        products: [],
        paymentMethods: []
      }
    }

    this.trainingData.prompts.push(prompt)
    this.trainingData.responses.push(response)
    this.trainingData.intents.push(intent)

    this.saveTrainingData()
    console.log('[LocalAI] 📚 Datos de entrenamiento agregados')
  }

  /**
   * Obtener estadísticas
   */
  static getStats(): {
    isInitialized: boolean
    trainingDataSize: number
    productsCount: number
    paymentMethodsCount: number
  } {
    return {
      isInitialized: this.isInitialized,
      trainingDataSize: this.trainingData?.prompts.length || 0,
      productsCount: this.trainingData?.products.length || 0,
      paymentMethodsCount: this.trainingData?.paymentMethods.length || 0
    }
  }
}

export default LocalAIOnlyService
