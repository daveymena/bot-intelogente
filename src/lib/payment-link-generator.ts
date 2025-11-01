/**
 * 💳 GENERADOR DE LINKS DE PAGO
 * Genera links dinámicos de MercadoPago y PayPal según el producto
 */

import { db } from './db'

export interface PaymentOptions {
  nequi: string
  daviplata: string
  mercadopago?: string
  paypal?: string
  transferencia: {
    banco: string
    cuenta: string
    titular: string
  }
}

export interface PaymentLinks {
  product: any
  methods: {
    nequi: string
    daviplata: string
    mercadopago?: string
    paypal?: string
    tarjeta?: string
    transferencia?: {
      banco: string
      cuenta: string
      titular: string
    }
  }
  instructions: string
}

export class PaymentLinkGenerator {
  // Configuración de pagos
  private static readonly NEQUI_NUMBER = '3136174267'
  private static readonly DAVIPLATA_NUMBER = '3136174267'
  
  // Credenciales de MercadoPago (desde .env)
  private static readonly MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
  private static readonly MERCADOPAGO_PUBLIC_KEY = process.env.MERCADOPAGO_PUBLIC_KEY || ''
  
  // Credenciales de PayPal (desde .env)
  private static readonly PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || ''
  private static readonly PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || ''

  /**
   * Generar link de MercadoPago
   */
  static async generateMercadoPagoLink(
    productName: string,
    price: number,
    productId: string
  ): Promise<string | null> {
    try {
      if (!this.MERCADOPAGO_ACCESS_TOKEN) {
        console.log('[PaymentLink] MercadoPago no configurado')
        return null
      }

      // Llamar a API de MercadoPago para crear preferencia
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.MERCADOPAGO_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          items: [
            {
              title: productName,
              quantity: 1,
              unit_price: price,
              currency_id: 'COP'
            }
          ],
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?product=${productId}`,
            failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure?product=${productId}`,
            pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending?product=${productId}`
          },
          auto_return: 'approved',
          external_reference: productId,
          notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook/mercadopago`
        })
      })

      if (!response.ok) {
        console.error('[PaymentLink] Error MercadoPago:', await response.text())
        return null
      }

      const data = await response.json()
      return data.init_point // Link de pago

    } catch (error) {
      console.error('[PaymentLink] Error generando link MercadoPago:', error)
      return null
    }
  }

  /**
   * Generar link de PayPal
   */
  static async generatePayPalLink(
    productName: string,
    price: number,
    productId: string
  ): Promise<string | null> {
    try {
      if (!this.PAYPAL_CLIENT_ID || !this.PAYPAL_CLIENT_SECRET) {
        console.log('[PaymentLink] PayPal no configurado')
        return null
      }

      // 1. Obtener token de acceso
      const authResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.PAYPAL_CLIENT_ID}:${this.PAYPAL_CLIENT_SECRET}`).toString('base64')}`
        },
        body: 'grant_type=client_credentials'
      })

      if (!authResponse.ok) {
        console.error('[PaymentLink] Error auth PayPal')
        return null
      }

      const authData = await authResponse.json()
      const accessToken = authData.access_token

      // 2. Crear orden de pago
      const priceUSD = (price / 4000).toFixed(2) // Convertir COP a USD (aproximado)

      const orderResponse = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: productId,
              description: productName,
              amount: {
                currency_code: 'USD',
                value: priceUSD
              }
            }
          ],
          application_context: {
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?product=${productId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure?product=${productId}`
          }
        })
      })

      if (!orderResponse.ok) {
        console.error('[PaymentLink] Error orden PayPal')
        return null
      }

      const orderData = await orderResponse.json()
      
      // Obtener link de aprobación
      const approveLink = orderData.links.find((link: any) => link.rel === 'approve')
      return approveLink?.href || null

    } catch (error) {
      console.error('[PaymentLink] Error generando link PayPal:', error)
      return null
    }
  }

  /**
   * Generar todos los métodos de pago para un producto
   */
  static async generatePaymentLinks(productId: string): Promise<PaymentLinks | null> {
    try {
      // Obtener producto
      const product = await db.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        console.error('[PaymentLink] Producto no encontrado')
        return null
      }

      console.log(`[PaymentLink] Generando links para: ${product.name}`)

      // Generar links dinámicos
      const mercadopagoLink = await this.generateMercadoPagoLink(
        product.name,
        product.price,
        product.id
      )

      const paypalLink = await this.generatePayPalLink(
        product.name,
        product.price,
        product.id
      )

      // Construir respuesta
      const paymentLinks: PaymentLinks = {
        product,
        methods: {
          nequi: this.NEQUI_NUMBER,
          daviplata: this.DAVIPLATA_NUMBER,
          mercadopago: mercadopagoLink || undefined,
          paypal: paypalLink || undefined,
          tarjeta: mercadopagoLink || undefined, // MercadoPago acepta tarjetas
          transferencia: {
            banco: 'Bancolombia',
            cuenta: '12345678901',
            titular: 'Tecnovariedades D&S'
          }
        },
        instructions: this.generateInstructions(product, mercadopagoLink, paypalLink)
      }

      return paymentLinks

    } catch (error) {
      console.error('[PaymentLink] Error generando links:', error)
      return null
    }
  }

  /**
   * Generar instrucciones de pago
   */
  private static generateInstructions(
    product: any,
    mercadopagoLink: string | null,
    paypalLink: string | null
  ): string {
    const emoji = this.getProductEmoji(product)
    let instructions = `💳 **MÉTODOS DE PAGO PARA ${product.name}** ${emoji}\n\n`
    instructions += `💰 Precio: ${product.price.toLocaleString('es-CO')} COP\n\n`
    instructions += `Elige tu método de pago preferido:\n\n`

    // 1. Nequi/Daviplata
    instructions += `1️⃣ **NEQUI / DAVIPLATA**\n`
    instructions += `   📱 Número: ${this.NEQUI_NUMBER}\n`
    instructions += `   ✅ Transferencia instantánea\n`
    instructions += `   💡 Envía comprobante por WhatsApp\n\n`

    // 2. Tarjeta de crédito (MercadoPago)
    if (mercadopagoLink) {
      instructions += `2️⃣ **TARJETA DE CRÉDITO/DÉBITO**\n`
      instructions += `   💳 Pago seguro con MercadoPago\n`
      instructions += `   👉 ${mercadopagoLink}\n`
      instructions += `   ✅ Acceso inmediato\n\n`
    }

    // 3. PayPal
    if (paypalLink) {
      instructions += `3️⃣ **PAYPAL**\n`
      instructions += `   🌎 Pago internacional\n`
      instructions += `   👉 ${paypalLink}\n`
      instructions += `   ✅ Seguro y confiable\n\n`
    }

    // 4. Transferencia bancaria
    instructions += `4️⃣ **TRANSFERENCIA BANCARIA**\n`
    instructions += `   🏦 Banco: Bancolombia\n`
    instructions += `   📋 Cuenta: 12345678901\n`
    instructions += `   👤 Titular: Tecnovariedades D&S\n`
    instructions += `   💡 Envía comprobante por WhatsApp\n\n`

    instructions += `📞 **Soporte:** +57 304 274 8687\n`
    instructions += `📧 **Email:** deinermen25@gmail.com\n\n`
    instructions += `¿Con cuál método deseas pagar?`

    return instructions
  }

  /**
   * Obtener emoji según producto
   */
  private static getProductEmoji(product: any): string {
    const name = product.name.toLowerCase()
    if (name.includes('piano') || name.includes('música')) return '🎹'
    if (name.includes('laptop') || name.includes('computador')) return '💻'
    if (name.includes('macbook')) return '🍎'
    if (name.includes('moto')) return '🏍️'
    if (name.includes('curso') || name.includes('mega')) return '📚'
    return '✨'
  }

  /**
   * Formatear respuesta para WhatsApp
   */
  static formatForWhatsApp(paymentLinks: PaymentLinks): string {
    return paymentLinks.instructions
  }

  /**
   * Generar respuesta según método elegido
   */
  static generateMethodResponse(method: string, paymentLinks: PaymentLinks): string {
    const emoji = this.getProductEmoji(paymentLinks.product)
    const price = paymentLinks.product.price.toLocaleString('es-CO')

    switch (method.toLowerCase()) {
      case 'nequi':
      case 'daviplata':
      case '1':
        return `✅ **PAGO POR NEQUI/DAVIPLATA** ${emoji}\n\n` +
               `📱 Número: ${paymentLinks.methods.nequi}\n` +
               `💰 Monto: ${price} COP\n\n` +
               `**Pasos:**\n` +
               `1. Abre tu app Nequi o Daviplata\n` +
               `2. Envía ${price} COP al número ${paymentLinks.methods.nequi}\n` +
               `3. Toma captura del comprobante\n` +
               `4. Envíalo por este chat\n\n` +
               `✅ Recibirás tu producto inmediatamente después de verificar el pago`

      case 'tarjeta':
      case 'credito':
      case 'debito':
      case '2':
        if (paymentLinks.methods.mercadopago) {
          return `✅ **PAGO CON TARJETA** ${emoji}\n\n` +
                 `💳 Pago seguro con MercadoPago\n` +
                 `💰 Monto: ${price} COP\n\n` +
                 `👉 Link de pago:\n${paymentLinks.methods.mercadopago}\n\n` +
                 `**Pasos:**\n` +
                 `1. Haz clic en el link\n` +
                 `2. Ingresa los datos de tu tarjeta\n` +
                 `3. Confirma el pago\n\n` +
                 `✅ Acceso inmediato después del pago`
        }
        return `⚠️ Pago con tarjeta no disponible. Elige otro método.`

      case 'paypal':
      case '3':
        if (paymentLinks.methods.paypal) {
          return `✅ **PAGO CON PAYPAL** ${emoji}\n\n` +
                 `🌎 Pago internacional seguro\n` +
                 `💰 Monto: ${price} COP\n\n` +
                 `👉 Link de pago:\n${paymentLinks.methods.paypal}\n\n` +
                 `**Pasos:**\n` +
                 `1. Haz clic en el link\n` +
                 `2. Inicia sesión en PayPal\n` +
                 `3. Confirma el pago\n\n` +
                 `✅ Acceso inmediato después del pago`
        }
        return `⚠️ PayPal no disponible. Elige otro método.`

      case 'transferencia':
      case 'bancaria':
      case '4':
        return `✅ **TRANSFERENCIA BANCARIA** ${emoji}\n\n` +
               `🏦 Banco: ${paymentLinks.methods.transferencia?.banco}\n` +
               `📋 Cuenta: ${paymentLinks.methods.transferencia?.cuenta}\n` +
               `👤 Titular: ${paymentLinks.methods.transferencia?.titular}\n` +
               `💰 Monto: ${price} COP\n\n` +
               `**Pasos:**\n` +
               `1. Realiza la transferencia desde tu banco\n` +
               `2. Toma captura del comprobante\n` +
               `3. Envíalo por este chat\n\n` +
               `✅ Recibirás tu producto después de verificar el pago`

      default:
        return paymentLinks.instructions
    }
  }
}
