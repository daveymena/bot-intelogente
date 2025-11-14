/**
 * 🎯 HANDLERS PARA SISTEMA INTELIGENTE LOCAL
 * Maneja diferentes tipos de consultas sin IA
 */

import { db } from './db'

export class LocalIntelligentHandlers {
  /**
   * Manejar pregunta de características
   */
  static async handleFeatures(context: any, userId: string): Promise<any> {
    if (context.currentProduct) {
      const product = context.currentProduct
      const emoji = this.getProductEmoji(product)

      let message = `${emoji} **${product.name}**\n\n`
      
      if (product.description) {
        message += `📝 **Descripción:**\n${product.description}\n\n`
      }

      // Extraer características de tags
      try {
        const tags = product.tags ? JSON.parse(product.tags) : []
        if (tags.length > 0) {
          message += '✅ **Características:**\n'
          tags.filter((t: string) => !t.includes(':')).forEach((tag: string) => {
            message += `• ${tag}\n`
          })
          message += '\n'
        }
      } catch (e) {}

      message += `💰 Precio: $${product.price.toLocaleString('es-CO')}\n\n`
      message += '¿Deseas ver fotos, precio o información de pago?'

      return {
        message,
        intent: 'features',
        confidence: 1.0
      }
    }

    return {
      message: '📝 ¿Sobre cuál producto quieres saber las características?\n\nPuedes preguntarme por cualquiera de nuestros productos.',
      intent: 'features',
      confidence: 0.7
    }
  }

  /**
   * Manejar pregunta de métodos de pago
   */
  static async handlePayment(context: any): Promise<any> {
    const product = context.currentProduct

    let message = '💳 **Métodos de pago disponibles:**\n\n'

    if (product) {
      // Extraer métodos de pago del producto
      try {
        const tags = product.tags ? JSON.parse(product.tags) : []
        const payments: string[] = []

        tags.forEach((tag: string) => {
          if (tag.startsWith('hotmart:')) payments.push('✅ Hotmart (pago directo)')
          else if (tag.startsWith('mercadopago:')) payments.push('✅ MercadoPago')
          else if (tag.startsWith('paypal:')) payments.push('✅ PayPal')
          else if (tag.startsWith('nequi:')) payments.push('✅ Nequi/Daviplata')
          else if (tag.startsWith('payco:')) payments.push('✅ Tarjeta de crédito (ePayco)')
        })

        if (payments.length > 0) {
          payments.forEach(p => message += `${p}\n`)
        } else if (product.category === 'PHYSICAL') {
          message += '✅ Efectivo\n'
          message += '✅ Transferencia bancaria\n'
          message += '✅ Nequi/Daviplata\n'
          message += '✅ Tarjeta de crédito\n'
        } else {
          message += '✅ Transferencia bancaria\n'
          message += '✅ Nequi/Daviplata\n'
        }
      } catch (e) {
        message += '✅ Transferencia bancaria\n'
        message += '✅ Nequi/Daviplata\n'
      }
    } else {
      message += '✅ Transferencia bancaria\n'
      message += '✅ Nequi/Daviplata\n'
      message += '✅ Tarjeta de crédito\n'
      message += '✅ Efectivo (productos físicos)\n'
    }

    message += '\n📞 **Contacto:** +57 304 274 8687\n\n'
    message += '¿Deseas proceder con la compra?'

    return {
      message,
      intent: 'payment',
      confidence: 1.0
    }
  }

  /**
   * Manejar pregunta de envíos
   */
  static async handleShipping(context: any): Promise<any> {
    const product = context.currentProduct

    if (product && product.category === 'DIGITAL') {
      return {
        message: '💾 **Producto Digital**\n\n✅ Acceso inmediato después del pago\n✅ No requiere envío físico\n✅ Recibes el enlace de acceso por WhatsApp\n\n¿Deseas comprarlo?',
        intent: 'shipping',
        confidence: 1.0
      }
    }

    let message = '🚚 **Información de envíos:**\n\n'
    message += '📍 Cobertura nacional\n'
    message += '⏱️ Tiempo: 1-3 días hábiles\n'
    message += '📦 Entrega segura\n'
    message += '💰 Costo según ciudad\n\n'
    message += '¿En qué ciudad te encuentras?'

    return {
      message,
      intent: 'shipping',
      confidence: 1.0
    }
  }

  /**
   * Obtener emoji según tipo de producto
   */
  private static getProductEmoji(product: any): string {
    const name = product.name.toLowerCase()
    const desc = (product.description || '').toLowerCase()

    if (name.includes('piano') || desc.includes('piano')) return '🎹'
    if (name.includes('laptop') || name.includes('portátil')) return '💻'
    if (name.includes('moto') || name.includes('pulsar')) return '🏍️'
    if (name.includes('curso') || name.includes('mega pack')) return '📚'
    if (name.includes('mochila') || name.includes('bolso')) return '🎒'
    if (name.includes('phone') || name.includes('celular')) return '📱'
    if (product.category === 'DIGITAL') return '💾'
    if (product.category === 'PHYSICAL') return '📦'

    return '🎯'
  }
}
