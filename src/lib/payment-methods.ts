/**
 * 💳 Servicio de Métodos de Pago
 * Lee la configuración desde variables de entorno y genera respuestas automáticas
 */

export interface PaymentMethod {
  name: string
  emoji: string
  details: string
  enabled: boolean
}

export class PaymentMethodsService {
  /**
   * Obtener todos los métodos de pago configurados
   */
  static getAvailableMethods(): PaymentMethod[] {
    const methods: PaymentMethod[] = []

    // Nequi
    if (process.env.NEQUI_NUMBER) {
      methods.push({
        name: 'Nequi',
        emoji: '💚',
        details: process.env.NEQUI_NUMBER,
        enabled: true
      })
    }

    // Daviplata
    if (process.env.DAVIPLATA_NUMBER) {
      methods.push({
        name: 'Daviplata',
        emoji: '💙',
        details: process.env.DAVIPLATA_NUMBER,
        enabled: true
      })
    }

    // Transferencia Bancaria
    if (process.env.BANK_ACCOUNT_NUMBER) {
      const bankDetails = [
        process.env.BANK_NAME || 'Banco',
        `Tipo: ${process.env.BANK_ACCOUNT_TYPE || 'Ahorros'}`,
        `Cuenta: ${process.env.BANK_ACCOUNT_NUMBER}`,
        process.env.BANK_ACCOUNT_HOLDER ? `Titular: ${process.env.BANK_ACCOUNT_HOLDER}` : ''
      ].filter(Boolean).join('\n   ')

      methods.push({
        name: 'Transferencia Bancaria',
        emoji: '🏦',
        details: bankDetails,
        enabled: true
      })
    }

    // Efectivo
    if (process.env.CASH_ON_DELIVERY_ENABLED === 'true') {
      const zones = process.env.DELIVERY_ZONES || 'Consultar disponibilidad'
      methods.push({
        name: 'Efectivo (Contra Entrega)',
        emoji: '💵',
        details: `Disponible en: ${zones}`,
        enabled: true
      })
    }

    // Stripe
    if (process.env.STRIPE_SECRET_KEY) {
      methods.push({
        name: 'Tarjeta de Crédito/Débito',
        emoji: '💳',
        details: 'Pago seguro con Stripe',
        enabled: true
      })
    }

    // Mercado Pago
    if (process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      methods.push({
        name: 'Mercado Pago',
        emoji: '💰',
        details: 'Tarjetas, PSE, efectivo',
        enabled: true
      })
    }

    // PayPal
    if (process.env.PAYPAL_CLIENT_ID) {
      methods.push({
        name: 'PayPal',
        emoji: '🌐',
        details: 'Pago internacional',
        enabled: true
      })
    }

    return methods
  }

  /**
   * Generar texto formateado para WhatsApp
   */
  static getFormattedText(): string {
    const methods = this.getAvailableMethods()

    if (methods.length === 0) {
      return '💳 Métodos de pago: Contacta para más información'
    }

    let text = '💳 *Métodos de Pago Disponibles:*\n\n'

    methods.forEach((method, index) => {
      text += `${method.emoji} *${method.name}*\n`
      text += `   ${method.details}\n\n`
    })

    return text.trim()
  }

  /**
   * Generar texto corto para incluir en respuestas de productos
   */
  static getShortText(): string {
    const methods = this.getAvailableMethods()

    if (methods.length === 0) {
      return '💳 Consulta métodos de pago disponibles'
    }

    const names = methods.map(m => m.name).join(', ')
    return `💳 Aceptamos: ${names}`
  }

  /**
   * Verificar si hay al menos un método configurado
   */
  static hasPaymentMethods(): boolean {
    return this.getAvailableMethods().length > 0
  }

  /**
   * Obtener información de contacto desde env
   */
  static getContactInfo(): string {
    const phone = process.env.BOT_PHONE || process.env.BUSINESS_PHONE
    const address = process.env.BUSINESS_ADDRESS
    const businessName = process.env.BUSINESS_NAME || process.env.BOT_NAME

    let contact = ''

    if (businessName) {
      contact += `📍 *${businessName}*\n`
    }

    if (phone) {
      contact += `📱 WhatsApp: ${phone}\n`
    }

    if (address) {
      contact += `📍 ${address}\n`
    }

    return contact
  }
}
