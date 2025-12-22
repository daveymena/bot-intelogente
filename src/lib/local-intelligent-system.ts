/**
 * 🧠 SISTEMA INTELIGENTE LOCAL (SIN IA)
 * Responde preguntas usando base de conocimiento + contexto conversacional
 * Adaptable a diferentes nichos: productos físicos, digitales, servicios
 */

import { db } from './db'

interface ConversationContext {
  userId: string
  customerPhone: string
  currentProduct?: any
  lastIntent?: string
  conversationHistory: Array<{ role: 'user' | 'bot'; message: string; timestamp: Date }>
  awaitingData?: 'name' | 'city' | 'address' | 'payment' | 'color'
  purchaseData?: {
    name?: string
    city?: string
    address?: string
    payment?: string
    color?: string
  }
}

interface LocalResponse {
  message: string
  intent: string
  confidence: number
  shouldSendMedia?: boolean
  mediaUrls?: string[]
  nextStep?: string
}

export class LocalIntelligentSystem {
  private static contexts = new Map<string, ConversationContext>()

  /**
   * Generar respuesta inteligente sin IA
   */
  static async generateResponse(
    userId: string,
    customerMessage: string,
    customerPhone: string
  ): Promise<LocalResponse> {
    // 1. Obtener o crear contexto
    const context = this.getOrCreateContext(userId, customerPhone)
    
    // 2. Agregar mensaje al historial
    context.conversationHistory.push({
      role: 'user',
      message: customerMessage,
      timestamp: new Date()
    })

    // 3. Detectar intención
    const intent = this.detectIntent(customerMessage, context)

    // 4. Generar respuesta según intención
    const response = await this.generateResponseByIntent(intent, context, customerMessage)

    // 5. Guardar respuesta en historial
    context.conversationHistory.push({
      role: 'bot',
      message: response.message,
      timestamp: new Date()
    })

    // 6. Actualizar contexto
    context.lastIntent = intent
    this.contexts.set(customerPhone, context)

    return response
  }

  /**
   * Obtener o crear contexto de conversación
   */
  private static getOrCreateContext(userId: string, customerPhone: string): ConversationContext {
    if (!this.contexts.has(customerPhone)) {
      this.contexts.set(customerPhone, {
        userId,
        customerPhone,
        conversationHistory: [],
        purchaseData: {}
      })
    }
    return this.contexts.get(customerPhone)!
  }

  /**
   * Detectar intención del mensaje
   */
  private static detectIntent(message: string, context: ConversationContext): string {
    const msg = message.toLowerCase().trim()

    // Si está esperando datos de compra
    if (context.awaitingData) {
      return 'provide_purchase_data'
    }

    // Patrones de intención
    const patterns = {
      greeting: /^(hola|buenos|buenas|hey|hi|hello|saludos)/i,
      price: /(precio|cuanto|costo|valor|vale)/i,
      features: /(características|detalles|especificaciones|qué trae|que trae|info|información)/i,
      payment: /(pago|pagar|forma|método|transferencia|nequi|daviplata|tarjeta)/i,
      shipping: /(envío|envio|entrega|domicilio|tiempo|cuánto tarda)/i,
      photos: /(foto|imagen|video|ver|mostrar)/i,
      stock: /(stock|disponible|hay|tienen)/i,
      warranty: /(garantía|garantia|devolución|devolucion|reembolso)/i,
      colors: /(color|colores|tonos)/i,
      buy: /(comprar|quiero|listo|pedido|ordenar)/i,
      yes: /^(si|sí|ok|dale|claro|perfecto|1)$/i,
      no: /^(no|nop|nope|2)$/i,
      more_info: /(más|mas|otro|adicional|también|tambien)/i
    }

    // Detectar intención
    for (const [intent, pattern] of Object.entries(patterns)) {
      if (pattern.test(msg)) {
        return intent
      }
    }

    // Si menciona un producto específico
    if (context.currentProduct) {
      return 'product_question'
    }

    return 'fallback'
  }

  /**
   * Generar respuesta según intención detectada
   */
  private static async generateResponseByIntent(
    intent: string,
    context: ConversationContext,
    message: string
  ): Promise<LocalResponse> {
    switch (intent) {
      case 'greeting':
        return this.handleGreeting(context)
      
      case 'price':
        return this.handlePrice(context)
      
      case 'features':
        return this.handleFeatures(context)
      
      case 'payment':
        return this.handlePayment(context)
      
      case 'shipping':
        return this.handleShipping(context)
      
      case 'photos':
        return this.handlePhotos(context)
      
      case 'stock':
        return this.handleStock(context)
      
      case 'warranty':
        return this.handleWarranty(context)
      
      case 'colors':
        return this.handleColors(context)
      
      case 'buy':
        return this.handleBuy(context)
      
      case 'provide_purchase_data':
        return this.handlePurchaseData(context, message)
      
      case 'product_question':
        return this.handleProductQuestion(context, message)
      
      default:
        return this.handleFallback(context)
    }
  }

  /**
   * Manejar saludo
   */
  private static async handleGreeting(context: ConversationContext): Promise<LocalResponse> {
    // Buscar productos disponibles
    const products = await db.product.findMany({
      where: { userId: context.userId, status: 'AVAILABLE' },
      take: 5
    })

    if (products.length === 0) {
      return {
        message: '¡Hola! 👋 Bienvenido. Actualmente estamos actualizando nuestro catálogo. ¿En qué puedo ayudarte?',
        intent: 'greeting',
        confidence: 1.0
      }
    }

    // Detectar tipo de negocio
    const hasDigital = products.some(p => p.category === 'DIGITAL')
    const hasPhysical = products.some(p => p.category === 'PHYSICAL')

    let message = '¡Hola! 👋 Bienvenido.\n\n'

    if (hasDigital && hasPhysical) {
      message += '📦 Tenemos productos físicos y digitales disponibles.\n\n'
    } else if (hasDigital) {
      message += '💾 Tenemos productos digitales con acceso inmediato.\n\n'
    } else {
      message += '📦 Tenemos productos disponibles para ti.\n\n'
    }

    message += '**Productos destacados:**\n'
    products.slice(0, 3).forEach((p, i) => {
      const emoji = this.getProductEmoji(p)
      message += `${i + 1}. ${emoji} ${p.name} - $${p.price.toLocaleString('es-CO')}\n`
    })

    message += '\n¿Cuál te interesa? O pregúntame sobre:\n'
    message += '💰 Precios | 📝 Características | 💳 Pagos | 🚚 Envíos'

    return {
      message,
      intent: 'greeting',
      confidence: 1.0
    }
  }

  /**
   * Manejar pregunta de precio
   */
  private static async handlePrice(context: ConversationContext): Promise<LocalResponse> {
    // Si ya hay un producto en contexto
    if (context.currentProduct) {
      const product = context.currentProduct
      const emoji = this.getProductEmoji(product)

      let message = `${emoji} **${product.name}**\n\n`
      message += `💰 Precio: **$${product.price.toLocaleString('es-CO')} COP**\n\n`

      // Agregar características principales
      if (product.description) {
        const shortDesc = product.description.substring(0, 150)
        message += `📝 ${shortDesc}${product.description.length > 150 ? '...' : ''}\n\n`
      }

      // Tipo de producto
      if (product.category === 'DIGITAL') {
        message += '✅ Acceso inmediato después del pago\n'
      } else {
        message += '✅ Envío disponible\n'
      }

      message += '\n¿Deseas comprarlo? Responde "comprar" o pregunta sobre pagos/envíos.'

      return {
        message,
        intent: 'price',
        confidence: 1.0
      }
    }

    // Buscar producto mencionado en el mensaje
    const lastMessage = context.conversationHistory[context.conversationHistory.length - 1]?.message || ''
    const product = await this.findProductInMessage(lastMessage, context.userId)

    if (product) {
      context.currentProduct = product
      return this.handlePrice(context)
    }

    // No hay producto en contexto
    return {
      message: '💰 Para darte el precio exacto, ¿cuál producto te interesa?\n\nPuedes preguntarme por cualquiera de nuestros productos.',
      intent: 'price',
      confidence: 0.7
    }
  }

  /**
   * Manejar pregunta de características
   */
  private static async handleFeatures(context: ConversationContext): Promise<LocalResponse> {
    if (context.currentProduct) {
      const product = context.currentProduct
      const emoji = this.getProductEmoji(product)

      let message = `${emoji} **${product.name}**\n\n`
      
      if (product.description) {
        message += `📝 ${product.description}\n\n`
      }

      message += `💰 $${product.price.toLocaleString('es-CO')}\n\n`
      message += '¿Quieres ver fotos o saber sobre pagos/envíos?'

      return { message, intent: 'features', confidence: 1.0 }
    }

    return {
      message: '📝 ¿Sobre cuál producto quieres información?\n\nPregúntame por cualquiera de nuestros productos.',
      intent: 'features',
      confidence: 0.7
    }
  }

  /**
   * Manejar pregunta de métodos de pago
   */
  private static async handlePayment(context: ConversationContext): Promise<LocalResponse> {
    let message = '💳 **Métodos de pago:**\n\n'
    message += '✅ Transferencia bancaria\n'
    message += '✅ Nequi/Daviplata\n'
    message += '✅ Tarjeta de crédito\n'
    message += '✅ MercadoPago\n'
    message += '✅ PayPal\n\n'
    message += '📞 Contacto: +57 304 274 8687\n\n'
    message += '¿Deseas proceder con la compra?'

    return { message, intent: 'payment', confidence: 1.0 }
  }

  /**
   * Manejar pregunta de envíos
   */
  private static async handleShipping(context: ConversationContext): Promise<LocalResponse> {
    if (context.currentProduct?.category === 'DIGITAL') {
      return {
        message: '💾 **Producto Digital**\n\n✅ Acceso inmediato\n✅ Sin envío físico\n✅ Recibes enlace por WhatsApp',
        intent: 'shipping',
        confidence: 1.0
      }
    }

    return {
      message: '🚚 **Envíos:**\n\n📍 Cobertura nacional\n⏱️ 1-3 días hábiles\n💰 Costo según ciudad\n\n¿En qué ciudad estás?',
      intent: 'shipping',
      confidence: 1.0
    }
  }

  /**
   * Manejar solicitud de fotos
   */
  private static async handlePhotos(context: ConversationContext): Promise<LocalResponse> {
    if (context.currentProduct) {
      try {
        const images = context.currentProduct.images ? JSON.parse(context.currentProduct.images) : []
        
        if (images.length > 0) {
          return {
            message: `📸 Aquí están las fotos de ${context.currentProduct.name}:`,
            intent: 'photos',
            confidence: 1.0,
            shouldSendMedia: true,
            mediaUrls: images
          }
        }
      } catch (e) {}
    }

    return {
      message: '📸 ¿De cuál producto quieres ver fotos?\n\nDime el nombre del producto.',
      intent: 'photos',
      confidence: 0.7
    }
  }

  /**
   * Manejar pregunta de stock
   */
  private static async handleStock(context: ConversationContext): Promise<LocalResponse> {
    if (context.currentProduct) {
      const stock = context.currentProduct.stock || 0
      const available = stock > 0

      return {
        message: available 
          ? `✅ ${context.currentProduct.name} está disponible.\n\n📦 Stock: ${stock} unidades\n\n¿Deseas comprarlo?`
          : `⚠️ ${context.currentProduct.name} está agotado temporalmente.\n\n¿Te interesa otro producto?`,
        intent: 'stock',
        confidence: 1.0
      }
    }

    return {
      message: '📦 ¿De cuál producto quieres saber la disponibilidad?',
      intent: 'stock',
      confidence: 0.7
    }
  }

  /**
   * Manejar pregunta de garantía
   */
  private static async handleWarranty(context: ConversationContext): Promise<LocalResponse> {
    return {
      message: '🛡️ **Garantía:**\n\n✅ 6 meses contra defectos\n✅ Soporte técnico incluido\n✅ Devoluciones: 7 días\n\n¿Tienes otra pregunta?',
      intent: 'warranty',
      confidence: 1.0
    }
  }

  /**
   * Manejar pregunta de colores
   */
  private static async handleColors(context: ConversationContext): Promise<LocalResponse> {
    return {
      message: '🎨 **Colores disponibles:**\n\n🖤 Negro\n🔵 Azul\n⚪ Gris\n\n¿Cuál prefieres?',
      intent: 'colors',
      confidence: 1.0
    }
  }

  /**
   * Manejar intención de compra
   */
  private static async handleBuy(context: ConversationContext): Promise<LocalResponse> {
    if (!context.currentProduct) {
      return {
        message: '¿Cuál producto deseas comprar?\n\nDime el nombre y te ayudo con el proceso.',
        intent: 'buy',
        confidence: 0.7
      }
    }

    context.awaitingData = 'name'
    
    return {
      message: `✅ Perfecto! Vamos a procesar tu pedido de **${context.currentProduct.name}**\n\n` +
               `💰 Precio: $${context.currentProduct.price.toLocaleString('es-CO')}\n\n` +
               `Para continuar, envíame tus datos así:\n\n` +
               `Nombre - Ciudad - Dirección - Método de pago - Color`,
      intent: 'buy',
      confidence: 1.0
    }
  }

  /**
   * Manejar datos de compra
   */
  private static async handlePurchaseData(context: ConversationContext, message: string): Promise<LocalResponse> {
    const parts = message.split('-').map(p => p.trim())

    if (parts.length >= 4) {
      context.purchaseData = {
        name: parts[0],
        city: parts[1],
        address: parts[2],
        payment: parts[3],
        color: parts[4] || 'Negro'
      }

      context.awaitingData = undefined

      return {
        message: `✅ **Pedido confirmado!**\n\n` +
                 `📦 Producto: ${context.currentProduct?.name}\n` +
                 `👤 Nombre: ${context.purchaseData.name}\n` +
                 `📍 Ciudad: ${context.purchaseData.city}\n` +
                 `🏠 Dirección: ${context.purchaseData.address}\n` +
                 `💳 Pago: ${context.purchaseData.payment}\n` +
                 `🎨 Color: ${context.purchaseData.color}\n\n` +
                 `Te contactaremos pronto para confirmar el pago. ¡Gracias! 🎉`,
        intent: 'purchase_confirmed',
        confidence: 1.0
      }
    }

    return {
      message: 'Por favor envía los datos en este formato:\n\nNombre - Ciudad - Dirección - Método de pago - Color',
      intent: 'purchase_data_error',
      confidence: 1.0
    }
  }

  /**
   * Manejar pregunta sobre producto
   */
  private static async handleProductQuestion(context: ConversationContext, message: string): Promise<LocalResponse> {
    return {
      message: `Sobre ${context.currentProduct?.name}, puedo ayudarte con:\n\n` +
               `💰 Precio\n📝 Características\n💳 Pagos\n🚚 Envíos\n📸 Fotos\n\n` +
               `¿Qué te gustaría saber?`,
      intent: 'product_question',
      confidence: 0.8
    }
  }

  /**
   * Manejar fallback
   */
  private static async handleFallback(context: ConversationContext): Promise<LocalResponse> {
    if (context.currentProduct) {
      return {
        message: `Sobre ${context.currentProduct.name}, puedo ayudarte con:\n\n` +
                 `💰 Precio | 📝 Info | 💳 Pagos | 🚚 Envíos | 📸 Fotos\n\n` +
                 `¿Qué necesitas?`,
        intent: 'fallback',
        confidence: 0.5
      }
    }

    return {
      message: 'Puedo ayudarte con información de productos, precios, pagos y envíos.\n\n¿Qué te gustaría saber?',
      intent: 'fallback',
      confidence: 0.5
    }
  }

  /**
   * Buscar producto en mensaje
   */
  private static async findProductInMessage(message: string, userId: string): Promise<any> {
    const products = await db.product.findMany({
      where: { userId, status: 'AVAILABLE' }
    })

    const msg = message.toLowerCase()
    
    for (const product of products) {
      const name = product.name.toLowerCase()
      if (msg.includes(name) || name.includes(msg)) {
        return product
      }
    }

    return null
  }

  /**
   * Obtener emoji según tipo de producto
   */
  private static getProductEmoji(product: any): string {
    const name = product.name.toLowerCase()
    if (name.includes('piano')) return '🎹'
    if (name.includes('laptop')) return '💻'
    if (name.includes('moto')) return '🏍️'
    if (name.includes('curso')) return '📚'
    if (name.includes('mochila')) return '🎒'
    if (product.category === 'DIGITAL') return '💾'
    return '📦'
  }

  /**
   * Limpiar contexto antiguo (llamar periódicamente)
   */
  static cleanOldContexts(maxAgeMinutes: number = 30): void {
    const now = new Date()
    
    for (const [phone, context] of this.contexts.entries()) {
      const lastMessage = context.conversationHistory[context.conversationHistory.length - 1]
      if (lastMessage) {
        const ageMinutes = (now.getTime() - lastMessage.timestamp.getTime()) / 60000
        if (ageMinutes > maxAgeMinutes) {
          this.contexts.delete(phone)
        }
      }
    }
  }
}
