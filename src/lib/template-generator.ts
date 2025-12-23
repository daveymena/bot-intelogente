/**
 * 📝 TemplateGenerator
 * 
 * Genera plantillas de respuesta dinámicas según el tipo de negocio,
 * item y contexto de la conversación.
 */

import { BusinessContext, BusinessType, BusinessSubType } from './business-context-detector'

// Configuración de plantilla
export interface TemplateConfig {
  tone: 'formal' | 'casual' | 'friendly' | 'professional'
  useEmojis: boolean
  maxLength: number
  includeImages: boolean
  currency: string
  language: string
  businessName?: string
}

// Item genérico (producto, servicio, comida)
export interface Item {
  id: string
  name: string
  description?: string | null
  price: number
  images?: string | null  // JSON array
  category?: string
  // Campos de servicio
  duration?: number
  requiresBooking?: boolean
  // Campos de comida
  ingredients?: string[]
  customizations?: string[]
  // Campos de producto
  stock?: number
  variants?: string[]
}

// Configuración por defecto
const DEFAULT_CONFIG: TemplateConfig = {
  tone: 'friendly',
  useEmojis: true,
  maxLength: 500,
  includeImages: true,
  currency: 'COP',
  language: 'es'
}

// Emojis por tipo de negocio
const EMOJIS = {
  STORE: {
    header: '🛒',
    price: '💰',
    stock: '📦',
    shipping: '🚚',
    warranty: '🛡️',
    support: '🔧'
  },
  SERVICE: {
    header: '💼',
    price: '💰',
    duration: '⏱️',
    booking: '📅',
    location: '📍',
    contact: '📞'
  },
  RESTAURANT: {
    header: '🍽️',
    price: '💰',
    time: '⏱️',
    delivery: '🛵',
    ingredients: '🥬',
    hot: '🔥'
  },
  DIGITAL: {
    header: '💻',
    price: '💰',
    instant: '⚡',
    download: '📥',
    access: '🔑',
    bonus: '🎁'
  }
}

// Saludos por tono
const GREETINGS = {
  formal: {
    hello: 'Buen día, bienvenido a {businessName}.',
    thanks: 'Gracias por su interés.',
    goodbye: 'Fue un placer atenderle. ¡Hasta pronto!'
  },
  casual: {
    hello: '¡Hola! 👋 Bienvenido a {businessName}',
    thanks: '¡Gracias por escribirnos!',
    goodbye: '¡Nos vemos! 😊'
  },
  friendly: {
    hello: '¡Hola! 😊 ¿Cómo estás? Soy el asistente de {businessName}',
    thanks: '¡Genial! Gracias por tu interés 🙌',
    goodbye: '¡Fue un gusto ayudarte! Escríbenos cuando quieras 💬'
  },
  professional: {
    hello: 'Bienvenido a {businessName}. ¿En qué podemos asistirle hoy?',
    thanks: 'Agradecemos su preferencia.',
    goodbye: 'Quedamos atentos a cualquier consulta adicional.'
  }
}

export class TemplateGenerator {
  private config: TemplateConfig
  private businessContext: BusinessContext
  
  constructor(businessContext: BusinessContext, config?: Partial<TemplateConfig>) {
    this.businessContext = businessContext
    this.config = { ...DEFAULT_CONFIG, ...config }
  }
  
  /**
   * Genera tarjeta de item (producto/servicio/comida)
   */
  generateItemCard(item: Item): string {
    const type = this.businessContext.type
    const emojis = this.getEmojis()
    
    switch (type) {
      case 'STORE':
        return this.generateProductCard(item, emojis)
      case 'SERVICE':
        return this.generateServiceCard(item, emojis)
      case 'RESTAURANT':
        return this.generateFoodCard(item, emojis)
      default:
        return this.generateGenericCard(item, emojis)
    }
  }
  
  /**
   * Tarjeta de producto físico/digital
   */
  private generateProductCard(item: Item, emojis: typeof EMOJIS.STORE): string {
    const e = this.config.useEmojis ? emojis : { header: '', price: '', stock: '', shipping: '', warranty: '', support: '' }
    
    let card = `╔══════════════════════════╗\n`
    card += `${e.header} *${item.name}*\n`
    card += `╚══════════════════════════╝\n\n`
    
    card += `${e.price} *PRECIO: ${this.formatPrice(item.price)}*\n\n`
    
    if (item.description) {
      card += `📝 *DESCRIPCIÓN:*\n${item.description}\n\n`
    }
    
    card += `━━━━━━━━━━━━━━━━━━━━\n`
    card += `✨ *INCLUYE:*\n`
    card += `✅ Producto original\n`
    card += `${e.warranty} Garantía\n`
    card += `${e.shipping} Envío a toda Colombia\n`
    card += `${e.support} Soporte técnico\n`
    card += `━━━━━━━━━━━━━━━━━━━━\n\n`
    
    if (item.stock !== undefined && item.stock !== null) {
      card += `${e.stock} *Stock:* ${item.stock > 0 ? `${item.stock} disponibles` : '⚠️ Agotado'}\n\n`
    }
    
    card += `💬 *¿Te interesa? Dime "sí" y te paso los datos de pago* 😊`
    
    return card
  }
  
  /**
   * Tarjeta de servicio
   */
  private generateServiceCard(item: Item, emojis: typeof EMOJIS.SERVICE): string {
    const e = this.config.useEmojis ? emojis : { header: '', price: '', duration: '', booking: '', location: '', contact: '' }
    
    let card = `╔══════════════════════════╗\n`
    card += `${e.header} *${item.name}*\n`
    card += `╚══════════════════════════╝\n\n`
    
    card += `${e.price} *PRECIO: ${this.formatPrice(item.price)}*\n`
    
    if (item.duration) {
      card += `${e.duration} *Duración:* ${item.duration} minutos\n`
    }
    
    card += `\n`
    
    if (item.description) {
      card += `📋 *DESCRIPCIÓN:*\n${item.description}\n\n`
    }
    
    card += `━━━━━━━━━━━━━━━━━━━━\n`
    
    if (item.requiresBooking) {
      card += `${e.booking} *Requiere cita previa*\n`
      card += `\n💬 *¿Quieres agendar? Dime qué día y hora te queda bien* 📅`
    } else {
      card += `💬 *¿Te interesa? Escríbeme para más información* 😊`
    }
    
    return card
  }
  
  /**
   * Tarjeta de comida
   */
  private generateFoodCard(item: Item, emojis: typeof EMOJIS.RESTAURANT): string {
    const e = this.config.useEmojis ? emojis : { header: '', price: '', time: '', delivery: '', ingredients: '', hot: '' }
    
    let card = `${e.header} *${item.name}*\n`
    card += `━━━━━━━━━━━━━━━━━━━━\n`
    
    card += `${e.price} *${this.formatPrice(item.price)}*\n`
    
    if (item.ingredients && item.ingredients.length > 0) {
      card += `${e.ingredients} ${item.ingredients.join(', ')}\n`
    }
    
    if (item.duration) {
      card += `${e.time} Tiempo: ${item.duration} min\n`
    }
    
    if (item.customizations && item.customizations.length > 0) {
      card += `\n✏️ *Personaliza:* ${item.customizations.join(', ')}\n`
    }
    
    card += `\n${e.delivery} *Domicilio disponible*`
    
    return card
  }
  
  /**
   * Tarjeta genérica
   */
  private generateGenericCard(item: Item, emojis: typeof EMOJIS.STORE): string {
    let card = `*${item.name}*\n`
    card += `━━━━━━━━━━━━━━━━━━━━\n`
    card += `💰 *Precio: ${this.formatPrice(item.price)}*\n`
    
    if (item.description) {
      card += `\n${item.description}\n`
    }
    
    card += `\n💬 *¿Te interesa? Escríbeme para más información*`
    
    return card
  }
  
  /**
   * Genera lista de categoría
   */
  generateCategoryList(items: Item[], categoryName: string): string {
    const type = this.businessContext.type
    const emojis = this.getEmojis()
    
    let list = `📂 *${categoryName.toUpperCase()}*\n`
    list += `━━━━━━━━━━━━━━━━━━━━\n\n`
    
    items.forEach((item, index) => {
      const num = index + 1
      list += `${num}️⃣ *${item.name}*\n`
      list += `   💰 ${this.formatPrice(item.price)}\n`
      if (item.description) {
        const shortDesc = item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '')
        list += `   📝 ${shortDesc}\n`
      }
      list += `\n`
    })
    
    list += `━━━━━━━━━━━━━━━━━━━━\n`
    list += `💬 *Escribe el número o nombre del que te interesa*`
    
    return list
  }
  
  /**
   * Genera saludo
   */
  generateGreeting(customGreeting?: string): string {
    if (customGreeting) {
      return customGreeting.replace('{businessName}', this.config.businessName || 'nuestra tienda')
    }
    
    const greetings = GREETINGS[this.config.tone]
    return greetings.hello.replace('{businessName}', this.config.businessName || 'nuestra tienda')
  }
  
  /**
   * Genera despedida
   */
  generateFarewell(customFarewell?: string): string {
    if (customFarewell) {
      return customFarewell.replace('{businessName}', this.config.businessName || 'nuestra tienda')
    }
    
    const greetings = GREETINGS[this.config.tone]
    return greetings.goodbye.replace('{businessName}', this.config.businessName || 'nuestra tienda')
  }
  
  /**
   * Genera información de pago
   */
  generatePaymentInfo(item: Item, paymentMethods: {
    mercadopago?: string
    paypal?: string
    nequi?: string
    daviplata?: string
    bank?: { name: string; account: string; holder: string }
  }): string {
    let info = `╔══════════════════════════╗\n`
    info += `📦 *${item.name}*\n`
    info += `💰 *Total: ${this.formatPrice(item.price)}*\n`
    info += `╚══════════════════════════╝\n\n`
    
    info += `💳 *MÉTODOS DE PAGO:*\n`
    info += `━━━━━━━━━━━━━━━━━━━━\n`
    
    if (paymentMethods.mercadopago) {
      info += `🔵 *MercadoPago (Tarjeta/PSE):*\n${paymentMethods.mercadopago}\n\n`
    }
    
    if (paymentMethods.paypal) {
      info += `🟡 *PayPal:*\n${paymentMethods.paypal}\n\n`
    }
    
    if (paymentMethods.nequi || paymentMethods.daviplata) {
      info += `📱 *Transferencia directa:*\n`
      if (paymentMethods.nequi) {
        info += `▸ *Nequi:* ${paymentMethods.nequi}\n`
      }
      if (paymentMethods.daviplata) {
        info += `▸ *Daviplata:* ${paymentMethods.daviplata}\n`
      }
      info += `\n`
    }
    
    if (paymentMethods.bank) {
      info += `🏦 *Transferencia bancaria:*\n`
      info += `▸ Banco: ${paymentMethods.bank.name}\n`
      info += `▸ Cuenta: ${paymentMethods.bank.account}\n`
      info += `▸ Titular: ${paymentMethods.bank.holder}\n\n`
    }
    
    info += `━━━━━━━━━━━━━━━━━━━━\n`
    info += `📝 *SIGUIENTE PASO:*\n`
    info += `Envía el comprobante de pago 📸`
    
    return info
  }
  
  /**
   * Genera confirmación de reserva/cita
   */
  generateBookingConfirmation(booking: {
    serviceName: string
    date: string
    time: string
    customerName: string
    customerPhone?: string
    location?: string
    notes?: string
  }): string {
    let confirmation = `✅ *CITA CONFIRMADA*\n`
    confirmation += `━━━━━━━━━━━━━━━━━━━━\n\n`
    
    confirmation += `📋 *Servicio:* ${booking.serviceName}\n`
    confirmation += `📅 *Fecha:* ${booking.date}\n`
    confirmation += `⏰ *Hora:* ${booking.time}\n`
    confirmation += `👤 *Cliente:* ${booking.customerName}\n`
    
    if (booking.customerPhone) {
      confirmation += `📞 *Teléfono:* ${booking.customerPhone}\n`
    }
    
    if (booking.location) {
      confirmation += `📍 *Dirección:* ${booking.location}\n`
    }
    
    if (booking.notes) {
      confirmation += `📝 *Notas:* ${booking.notes}\n`
    }
    
    confirmation += `\n━━━━━━━━━━━━━━━━━━━━\n`
    confirmation += `💬 *Te enviaremos un recordatorio antes de la cita*`
    
    return confirmation
  }
  
  /**
   * Genera resumen de pedido
   */
  generateOrderSummary(order: {
    items: Array<{ name: string; quantity: number; price: number }>
    subtotal: number
    shipping?: number
    total: number
    customerName: string
    customerPhone: string
    deliveryAddress?: string
    deliveryType: 'delivery' | 'pickup' | 'dine-in'
    notes?: string
  }): string {
    let summary = `📋 *RESUMEN DE PEDIDO*\n`
    summary += `━━━━━━━━━━━━━━━━━━━━\n\n`
    
    // Items
    order.items.forEach(item => {
      summary += `▸ ${item.quantity}x ${item.name} - ${this.formatPrice(item.price * item.quantity)}\n`
    })
    
    summary += `\n`
    summary += `━━━━━━━━━━━━━━━━━━━━\n`
    summary += `Subtotal: ${this.formatPrice(order.subtotal)}\n`
    
    if (order.shipping) {
      summary += `Envío: ${this.formatPrice(order.shipping)}\n`
    }
    
    summary += `*TOTAL: ${this.formatPrice(order.total)}*\n`
    summary += `━━━━━━━━━━━━━━━━━━━━\n\n`
    
    // Datos del cliente
    summary += `👤 *Cliente:* ${order.customerName}\n`
    summary += `📞 *Teléfono:* ${order.customerPhone}\n`
    
    if (order.deliveryType === 'delivery' && order.deliveryAddress) {
      summary += `📍 *Dirección:* ${order.deliveryAddress}\n`
    } else if (order.deliveryType === 'pickup') {
      summary += `🏪 *Recoger en tienda*\n`
    }
    
    if (order.notes) {
      summary += `📝 *Notas:* ${order.notes}\n`
    }
    
    return summary
  }
  
  /**
   * Obtiene emojis según tipo de negocio
   */
  private getEmojis(): typeof EMOJIS.STORE {
    if (!this.config.useEmojis) {
      return { header: '', price: '', stock: '', shipping: '', warranty: '', support: '' }
    }
    
    switch (this.businessContext.type) {
      case 'SERVICE':
        return EMOJIS.SERVICE as any
      case 'RESTAURANT':
        return EMOJIS.RESTAURANT as any
      default:
        return EMOJIS.STORE
    }
  }
  
  /**
   * Formatea precio
   */
  private formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: this.config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }
  
  /**
   * Método estático para uso rápido
   */
  static generate(
    item: Item, 
    businessContext: BusinessContext, 
    config?: Partial<TemplateConfig>
  ): string {
    const generator = new TemplateGenerator(businessContext, config)
    return generator.generateItemCard(item)
  }
}

export default TemplateGenerator
