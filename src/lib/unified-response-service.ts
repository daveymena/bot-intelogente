/**
 * 🎯 UnifiedResponseService
 * 
 * Servicio principal que orquesta todos los componentes del sistema
 * multi-servicio para generar respuestas inteligentes.
 */

import { prisma } from '@/lib/db'
import { BusinessContextDetector, BusinessContext } from './business-context-detector'
import { FlowEngine, FlowType, ConversationState, FlowStage } from './flow-engine'
import { TemplateGenerator, TemplateConfig, Item } from './template-generator'
import { CategoryAutoGenerator } from './category-auto-generator'

// Resultado de respuesta
export interface ResponseResult {
  text: string
  flow: FlowType
  stage: FlowStage
  sendMedia: boolean
  mediaUrls?: string[]
  quickReplies?: string[]
  requiresInput: boolean
  inputType?: 'text' | 'location' | 'date' | 'time' | 'options'
  currentProduct?: Item
  escalateToHuman?: boolean
}

// Cache de contextos de negocio
const businessContextCache = new Map<string, { context: BusinessContext; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// Cache de estados de conversación
const conversationStates = new Map<string, ConversationState>()

export class UnifiedResponseService {
  
  /**
   * Procesa un mensaje y genera respuesta inteligente
   */
  static async processMessage(
    message: string,
    userId: string,
    chatId: string,
    products: Item[]
  ): Promise<ResponseResult> {
    try {
      // 1. Obtener contexto del negocio
      const businessContext = await this.getBusinessContext(userId)
      
      // 2. Obtener o crear estado de conversación
      const stateKey = `${userId}:${chatId}`
      let state = conversationStates.get(stateKey)
      
      // 3. Detectar flujo apropiado
      const flowType = FlowEngine.detectFlow(message, businessContext, state)
      
      // 4. Si no hay estado o cambió el flujo, crear nuevo
      if (!state || state.flowType !== flowType) {
        state = FlowEngine.createState(flowType)
        conversationStates.set(stateKey, state)
      }
      
      // 5. Obtener configuración de plantillas
      const templateConfig = await this.getTemplateConfig(userId)
      const templateGenerator = new TemplateGenerator(businessContext, templateConfig)
      
      // 6. Procesar según el flujo
      const result = await this.processFlow(
        message,
        flowType,
        state,
        businessContext,
        templateGenerator,
        products,
        userId
      )
      
      // 7. Actualizar estado
      state.stage = result.stage
      state.history.push(result.stage)
      conversationStates.set(stateKey, state)
      
      return result
      
    } catch (error) {
      console.error('Error en UnifiedResponseService:', error)
      return this.getErrorResponse()
    }
  }
  
  /**
   * Procesa el flujo específico
   */
  private static async processFlow(
    message: string,
    flowType: FlowType,
    state: ConversationState,
    businessContext: BusinessContext,
    templateGenerator: TemplateGenerator,
    products: Item[],
    userId: string
  ): Promise<ResponseResult> {
    
    switch (flowType) {
      case 'greeting':
        return this.handleGreeting(templateGenerator, businessContext)
      
      case 'product_inquiry':
        return this.handleProductInquiry(message, products, templateGenerator, state)
      
      case 'product_purchase':
        return this.handleProductPurchase(message, state, templateGenerator, userId)
      
      case 'more_options':
        return this.handleMoreOptions(state, products, templateGenerator)
      
      case 'service_inquiry':
        return this.handleServiceInquiry(message, products, templateGenerator, state)
      
      case 'service_booking':
        return this.handleServiceBooking(message, state, templateGenerator)
      
      case 'menu_display':
        return this.handleMenuDisplay(products, templateGenerator)
      
      case 'food_order':
        return this.handleFoodOrder(message, state, templateGenerator)
      
      case 'payment':
        return this.handlePayment(state, templateGenerator, userId)
      
      case 'support':
        return this.handleSupport(message)
      
      default:
        return this.handleGeneralInquiry(message, products, templateGenerator)
    }
  }
  
  /**
   * Maneja saludos
   */
  private static handleGreeting(
    templateGenerator: TemplateGenerator,
    businessContext: BusinessContext
  ): ResponseResult {
    const greeting = templateGenerator.generateGreeting()
    
    let followUp = ''
    switch (businessContext.type) {
      case 'STORE':
        followUp = '\n\n¿Qué producto te interesa? Puedo mostrarte nuestro catálogo 📦'
        break
      case 'SERVICE':
        followUp = '\n\n¿En qué servicio puedo ayudarte? 💼'
        break
      case 'RESTAURANT':
        followUp = '\n\n¿Te gustaría ver nuestro menú? 🍽️'
        break
      default:
        followUp = '\n\n¿En qué puedo ayudarte hoy? 😊'
    }
    
    return {
      text: greeting + followUp,
      flow: 'greeting',
      stage: 'initial',
      sendMedia: false,
      requiresInput: true
    }
  }
  
  /**
   * Maneja consultas de productos
   */
  private static handleProductInquiry(
    message: string,
    products: Item[],
    templateGenerator: TemplateGenerator,
    state: ConversationState
  ): ResponseResult {
    // Buscar producto que coincida
    const product = this.findProduct(message, products)
    
    if (product) {
      state.currentItemId = product.id
      state.currentItemName = product.name
      
      const card = templateGenerator.generateItemCard(product)
      const images = product.images ? JSON.parse(product.images) : []
      
      return {
        text: card,
        flow: 'product_inquiry',
        stage: 'show_item',
        sendMedia: images.length > 0,
        mediaUrls: images,
        requiresInput: true,
        currentProduct: product
      }
    }
    
    // Si no encuentra, mostrar categorías o lista
    if (products.length > 0) {
      const categories = [...new Set(products.map(p => p.category).filter(Boolean))]
      
      if (categories.length > 1) {
        let text = '📂 *Tenemos estas categorías:*\n\n'
        categories.forEach((cat, i) => {
          text += `${i + 1}️⃣ ${cat}\n`
        })
        text += '\n💬 *¿Cuál te interesa?*'
        
        return {
          text,
          flow: 'product_inquiry',
          stage: 'show_options',
          sendMedia: false,
          requiresInput: true,
          quickReplies: categories as string[]
        }
      }
      
      // Mostrar primeros productos
      const topProducts = products.slice(0, 5)
      const list = templateGenerator.generateCategoryList(topProducts, 'Nuestros productos')
      
      return {
        text: list,
        flow: 'product_inquiry',
        stage: 'show_options',
        sendMedia: false,
        requiresInput: true
      }
    }
    
    return {
      text: 'Por el momento no tenemos productos disponibles. ¿Puedo ayudarte con algo más?',
      flow: 'product_inquiry',
      stage: 'initial',
      sendMedia: false,
      requiresInput: true
    }
  }
  
  /**
   * Maneja compra de producto
   */
  private static async handleProductPurchase(
    message: string,
    state: ConversationState,
    templateGenerator: TemplateGenerator,
    userId: string
  ): Promise<ResponseResult> {
    // Si no hay producto en contexto
    if (!state.currentItemId) {
      return {
        text: '¿Qué producto te gustaría comprar? 🛒',
        flow: 'product_purchase',
        stage: 'initial',
        sendMedia: false,
        requiresInput: true
      }
    }
    
    // Obtener métodos de pago
    const paymentConfig = await prisma.paymentConfig.findUnique({
      where: { userId }
    })
    
    const product = await prisma.product.findUnique({
      where: { id: state.currentItemId }
    })
    
    if (!product) {
      return {
        text: 'No encontré el producto. ¿Puedes decirme cuál te interesa?',
        flow: 'product_purchase',
        stage: 'initial',
        sendMedia: false,
        requiresInput: true
      }
    }
    
    const paymentInfo = templateGenerator.generatePaymentInfo(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description
      },
      {
        mercadopago: product.paymentLinkMercadoPago || undefined,
        paypal: product.paymentLinkPayPal || undefined,
        nequi: paymentConfig?.nequiPhone || undefined,
        daviplata: paymentConfig?.daviplataPhone || undefined
      }
    )
    
    return {
      text: paymentInfo,
      flow: 'product_purchase',
      stage: 'show_payment',
      sendMedia: false,
      requiresInput: true
    }
  }
  
  /**
   * Maneja "más opciones"
   */
  private static handleMoreOptions(
    state: ConversationState,
    products: Item[],
    templateGenerator: TemplateGenerator
  ): ResponseResult {
    // Buscar productos de la misma categoría
    let relatedProducts = products
    
    if (state.currentCategory) {
      relatedProducts = products.filter(p => p.category === state.currentCategory)
    } else if (state.currentItemId) {
      const currentProduct = products.find(p => p.id === state.currentItemId)
      if (currentProduct?.category) {
        relatedProducts = products.filter(p => 
          p.category === currentProduct.category && p.id !== state.currentItemId
        )
        state.currentCategory = currentProduct.category
      }
    }
    
    if (relatedProducts.length === 0) {
      return {
        text: 'No tenemos más productos en esta categoría por el momento. ¿Te interesa ver otra categoría?',
        flow: 'more_options',
        stage: 'initial',
        sendMedia: false,
        requiresInput: true
      }
    }
    
    const categoryName = state.currentCategory || 'Más opciones'
    const list = templateGenerator.generateCategoryList(relatedProducts.slice(0, 10), categoryName)
    
    return {
      text: list,
      flow: 'more_options',
      stage: 'show_options',
      sendMedia: false,
      requiresInput: true
    }
  }
  
  /**
   * Maneja consultas de servicios
   */
  private static handleServiceInquiry(
    message: string,
    products: Item[],
    templateGenerator: TemplateGenerator,
    state: ConversationState
  ): ResponseResult {
    const services = products.filter(p => p.category === 'SERVICE' || p.requiresBooking)
    
    if (services.length === 0) {
      return {
        text: 'Por el momento no tenemos servicios disponibles. ¿Puedo ayudarte con algo más?',
        flow: 'service_inquiry',
        stage: 'initial',
        sendMedia: false,
        requiresInput: true
      }
    }
    
    const service = this.findProduct(message, services)
    
    if (service) {
      state.currentItemId = service.id
      state.currentItemName = service.name
      
      const card = templateGenerator.generateItemCard(service)
      
      return {
        text: card,
        flow: 'service_inquiry',
        stage: 'show_item',
        sendMedia: false,
        requiresInput: true,
        currentProduct: service
      }
    }
    
    const list = templateGenerator.generateCategoryList(services, 'Nuestros servicios')
    
    return {
      text: list,
      flow: 'service_inquiry',
      stage: 'show_options',
      sendMedia: false,
      requiresInput: true
    }
  }
  
  /**
   * Maneja reserva de servicios
   */
  private static handleServiceBooking(
    message: string,
    state: ConversationState,
    templateGenerator: TemplateGenerator
  ): ResponseResult {
    // Flujo simplificado de reserva
    switch (state.stage) {
      case 'initial':
      case 'show_item':
        return {
          text: '📅 *¿Qué día te gustaría agendar tu cita?*\n\nPuedes decirme por ejemplo: "mañana", "el lunes", "15 de enero"',
          flow: 'service_booking',
          stage: 'collect_date',
          sendMedia: false,
          requiresInput: true,
          inputType: 'date'
        }
      
      case 'collect_date':
        state.collectedData.date = message
        return {
          text: '⏰ *¿A qué hora prefieres?*\n\nPor ejemplo: "10am", "3 de la tarde", "14:00"',
          flow: 'service_booking',
          stage: 'collect_time',
          sendMedia: false,
          requiresInput: true,
          inputType: 'time'
        }
      
      case 'collect_time':
        state.collectedData.time = message
        return {
          text: '👤 *¿A qué nombre agendamos la cita?*',
          flow: 'service_booking',
          stage: 'collect_contact',
          sendMedia: false,
          requiresInput: true,
          inputType: 'text'
        }
      
      case 'collect_contact':
        state.collectedData.name = message
        const confirmation = templateGenerator.generateBookingConfirmation({
          serviceName: state.currentItemName || 'Servicio',
          date: state.collectedData.date || '',
          time: state.collectedData.time || '',
          customerName: state.collectedData.name || ''
        })
        
        return {
          text: confirmation,
          flow: 'service_booking',
          stage: 'complete',
          sendMedia: false,
          requiresInput: false
        }
      
      default:
        return {
          text: '¿En qué más puedo ayudarte?',
          flow: 'service_booking',
          stage: 'complete',
          sendMedia: false,
          requiresInput: true
        }
    }
  }
  
  /**
   * Maneja mostrar menú
   */
  private static handleMenuDisplay(
    products: Item[],
    templateGenerator: TemplateGenerator
  ): ResponseResult {
    const foodItems = products.filter(p => p.category === 'FOOD' || p.ingredients)
    
    if (foodItems.length === 0) {
      return {
        text: 'Por el momento no tenemos menú disponible. ¿Puedo ayudarte con algo más?',
        flow: 'menu_display',
        stage: 'initial',
        sendMedia: false,
        requiresInput: true
      }
    }
    
    const list = templateGenerator.generateCategoryList(foodItems, '🍽️ Nuestro Menú')
    
    return {
      text: list,
      flow: 'menu_display',
      stage: 'show_options',
      sendMedia: false,
      requiresInput: true
    }
  }
  
  /**
   * Maneja pedido de comida
   */
  private static handleFoodOrder(
    message: string,
    state: ConversationState,
    templateGenerator: TemplateGenerator
  ): ResponseResult {
    // Flujo simplificado
    return {
      text: '🍽️ *¿Qué te gustaría ordenar?*\n\nDime el nombre del plato o el número del menú.',
      flow: 'food_order',
      stage: 'collect_order' as FlowStage,
      sendMedia: false,
      requiresInput: true
    }
  }
  
  /**
   * Maneja pago
   */
  private static async handlePayment(
    state: ConversationState,
    templateGenerator: TemplateGenerator,
    userId: string
  ): Promise<ResponseResult> {
    const paymentConfig = await prisma.paymentConfig.findUnique({
      where: { userId }
    })
    
    let text = '💳 *MÉTODOS DE PAGO DISPONIBLES:*\n━━━━━━━━━━━━━━━━━━━━\n\n'
    
    if (paymentConfig?.nequiEnabled && paymentConfig.nequiPhone) {
      text += `📱 *Nequi:* ${paymentConfig.nequiPhone}\n`
    }
    if (paymentConfig?.daviplataEnabled && paymentConfig.daviplataPhone) {
      text += `📱 *Daviplata:* ${paymentConfig.daviplataPhone}\n`
    }
    if (paymentConfig?.mercadoPagoEnabled) {
      text += `🔵 *MercadoPago:* Disponible\n`
    }
    if (paymentConfig?.paypalEnabled) {
      text += `🟡 *PayPal:* Disponible\n`
    }
    
    text += '\n📸 *Envía el comprobante de pago cuando realices la transferencia*'
    
    return {
      text,
      flow: 'payment',
      stage: 'show_payment',
      sendMedia: false,
      requiresInput: true
    }
  }
  
  /**
   * Maneja soporte
   */
  private static handleSupport(message: string): ResponseResult {
    return {
      text: '🆘 *Entiendo que necesitas ayuda.*\n\nVoy a conectarte con un asesor humano que podrá ayudarte mejor.\n\n⏳ Por favor espera un momento...',
      flow: 'support',
      stage: 'complete',
      sendMedia: false,
      requiresInput: false,
      escalateToHuman: true
    }
  }
  
  /**
   * Maneja consultas generales
   */
  private static handleGeneralInquiry(
    message: string,
    products: Item[],
    templateGenerator: TemplateGenerator
  ): ResponseResult {
    return {
      text: '¿En qué puedo ayudarte? 😊\n\nPuedo mostrarte:\n• Nuestros productos 📦\n• Información de precios 💰\n• Métodos de pago 💳\n• Información de envíos 🚚',
      flow: 'general_inquiry',
      stage: 'initial',
      sendMedia: false,
      requiresInput: true,
      quickReplies: ['Ver productos', 'Métodos de pago', 'Información de envíos']
    }
  }
  
  /**
   * Busca un producto por mensaje
   */
  private static findProduct(message: string, products: Item[]): Item | null {
    const normalizedMessage = message.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    
    // Búsqueda exacta primero
    for (const product of products) {
      const normalizedName = product.name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      
      if (normalizedMessage.includes(normalizedName) || normalizedName.includes(normalizedMessage)) {
        return product
      }
    }
    
    // Búsqueda por palabras clave
    const messageWords = normalizedMessage.split(/\s+/).filter(w => w.length > 3)
    
    let bestMatch: { product: Item; score: number } | null = null
    
    for (const product of products) {
      const productText = `${product.name} ${product.description || ''}`.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      
      let score = 0
      for (const word of messageWords) {
        if (productText.includes(word)) {
          score++
        }
      }
      
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { product, score }
      }
    }
    
    return bestMatch?.product || null
  }
  
  /**
   * Obtiene contexto del negocio (con cache)
   */
  static async getBusinessContext(userId: string): Promise<BusinessContext> {
    const cached = businessContextCache.get(userId)
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.context
    }
    
    // Intentar obtener de BD
    let context = await BusinessContextDetector.getContext(userId)
    
    if (!context) {
      // Detectar y guardar
      context = await BusinessContextDetector.detectAndSave(userId)
    }
    
    businessContextCache.set(userId, { context, timestamp: Date.now() })
    
    return context
  }
  
  /**
   * Actualiza contexto del negocio
   */
  static async updateBusinessContext(userId: string): Promise<void> {
    await BusinessContextDetector.detectAndSave(userId)
    businessContextCache.delete(userId)
  }
  
  /**
   * Obtiene configuración de plantillas
   */
  private static async getTemplateConfig(userId: string): Promise<Partial<TemplateConfig>> {
    const settings = await prisma.businessSettings.findUnique({
      where: { userId }
    })
    
    const botSettings = await prisma.botSettings.findUnique({
      where: { userId }
    })
    
    return {
      tone: (settings?.tone as any) || 'friendly',
      businessName: botSettings?.businessName || settings?.businessName || undefined,
      useEmojis: true,
      currency: 'COP',
      language: 'es'
    }
  }
  
  /**
   * Respuesta de error
   */
  private static getErrorResponse(): ResponseResult {
    return {
      text: 'Disculpa, tuve un problema procesando tu mensaje. ¿Puedes intentar de nuevo? 🙏',
      flow: 'general_inquiry',
      stage: 'initial',
      sendMedia: false,
      requiresInput: true
    }
  }
  
  /**
   * Limpia estado de conversación
   */
  static clearConversationState(userId: string, chatId: string): void {
    conversationStates.delete(`${userId}:${chatId}`)
  }
}

export default UnifiedResponseService
