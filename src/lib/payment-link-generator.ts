/**
 * 💳 GENERADOR DE LINKS DE PAGO
 * Genera links dinámicos de MercadoPago y PayPal según el producto
 * PayPal ahora usa API REST v2 para crear órdenes reales
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
  // Configuración de pagos (actualizado)
  private static readonly NEQUI_NUMBER = process.env.NEQUI_NUMBER || '3136174267'
  private static readonly DAVIPLATA_NUMBER = process.env.DAVIPLATA_NUMBER || '3136174267'
  
  // Credenciales de MercadoPago (desde .env)
  private static readonly MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || ''
  private static readonly MERCADOPAGO_PUBLIC_KEY = process.env.MERCADO_PAGO_PUBLIC_KEY || ''
  
  // Configuración de PayPal
  private static readonly PAYPAL_EMAIL = process.env.PAYPAL_EMAIL
  private static readonly PAYPAL_ME_USERNAME = process.env.PAYPAL_ME_USERNAME || process.env.PAYPAL_USERNAME
  private static readonly COP_TO_USD_RATE = parseFloat(process.env.COP_TO_USD_RATE || '4000')

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
          external_reference: productId
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
   * Generar link de PayPal DINÁMICO usando API REST v2
   * Crea una orden real en PayPal y devuelve el link de aprobación
   */
  static async generatePayPalLink(
    productName: string,
    price: number,
    productId: string
  ): Promise<string | null> {
    try {
      const clientId = process.env.PAYPAL_CLIENT_ID
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET
      
      // Si no hay credenciales de API, intentar fallback a email/username
      if (!clientId || !clientSecret) {
        console.log('[PaymentLink] ⚠️ PayPal API no configurado, usando fallback...')
        return this.generatePayPalFallbackLink(productName, price)
      }

      console.log('[PaymentLink] 💰 Generando link PayPal dinámico con API:')
      console.log(`   Producto: ${productName}`)
      console.log(`   Precio COP: ${price.toLocaleString('es-CO')}`)

      // 1. Obtener token de acceso
      const accessToken = await this.getPayPalAccessToken(clientId, clientSecret)
      
      // 2. Convertir COP a USD
      const exchangeRate = parseFloat(process.env.COP_TO_USD_RATE || '4000')
      const priceUSD = (price / exchangeRate).toFixed(2)
      
      console.log(`   Precio USD: ${priceUSD}`)
      console.log(`   Tasa: 1 USD = ${exchangeRate} COP`)

      // 3. Crear orden en PayPal
      const mode = process.env.PAYPAL_MODE || 'live'
      const orderUrl = mode === 'live'
        ? 'https://api-m.paypal.com/v2/checkout/orders'
        : 'https://api-m.sandbox.paypal.com/v2/checkout/orders'

      const orderData = {
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
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'}/payment/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'}/payment/cancel`,
          brand_name: 'Tecnovariedades D&S',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW'
        }
      }

      const response = await fetch(orderUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[PaymentLink] ❌ Error PayPal API:', errorText)
        return this.generatePayPalFallbackLink(productName, price)
      }

      const data = await response.json()
      
      // 4. Buscar el link de aprobación
      const approveLink = data.links?.find((link: any) => link.rel === 'approve')?.href

      if (!approveLink) {
        console.error('[PaymentLink] ❌ No se encontró link de aprobación')
        return this.generatePayPalFallbackLink(productName, price)
      }

      console.log(`[PaymentLink] ✅ Link PayPal dinámico generado: ${approveLink}`)
      console.log(`[PaymentLink] 📦 Order ID: ${data.id}`)
      
      return approveLink

    } catch (error) {
      console.error('[PaymentLink] ❌ Error generando link PayPal:', error)
      return this.generatePayPalFallbackLink(productName, price)
    }
  }

  /**
   * Obtener token de acceso de PayPal
   */
  private static async getPayPalAccessToken(clientId: string, clientSecret: string): Promise<string> {
    const mode = process.env.PAYPAL_MODE || 'live'
    const authUrl = mode === 'live'
      ? 'https://api-m.paypal.com/v1/oauth2/token'
      : 'https://api-m.sandbox.paypal.com/v1/oauth2/token'

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      throw new Error(`PayPal Auth error: ${response.status}`)
    }

    const data = await response.json()
    return data.access_token
  }

  /**
   * Fallback: Generar link de PayPal con email o username
   */
  private static generatePayPalFallbackLink(productName: string, price: number): string | null {
    const exchangeRate = parseFloat(process.env.COP_TO_USD_RATE || '4000')
    const priceUSD = (price / exchangeRate).toFixed(2)
    
    // OPCIÓN 1: Email de PayPal
    const paypalEmail = process.env.PAYPAL_EMAIL
    if (paypalEmail) {
      const paypalLink = `https://www.paypal.com/ncp/payment/${encodeURIComponent(paypalEmail)}`
      console.log(`[PaymentLink] ✅ Link PayPal fallback (email): ${paypalLink}`)
      return paypalLink
    }
    
    // OPCIÓN 2: PayPal.me
    const paypalUsername = process.env.PAYPAL_ME_USERNAME || process.env.PAYPAL_USERNAME
    if (paypalUsername) {
      const paypalLink = `https://www.paypal.me/${paypalUsername}/${priceUSD}`
      console.log(`[PaymentLink] ✅ Link PayPal.me fallback: ${paypalLink}`)
      return paypalLink
    }
    
    console.log('[PaymentLink] ⚠️ PayPal no configurado')
    return null
  }

  /**
   * Generar todos los métodos de pago para un producto
   */
  static async generatePaymentLinks(productId: string): Promise<PaymentLinks | null> {
    try {
      console.log(`[PaymentLink] 🔍 Buscando producto con ID: ${productId}`)

      // Obtener producto
      const product = await db.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        console.error('[PaymentLink] ❌ Producto no encontrado con ID:', productId)
        return null
      }

      console.log(`[PaymentLink] ✅ Producto encontrado: ${product.name} (ID: ${product.id})`)
      console.log(`[PaymentLink] 💰 Precio: ${product.price.toLocaleString('es-CO')} COP`)
      console.log(`[PaymentLink] 📦 Categoría: ${product.category || 'N/A'}`)

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
            banco: process.env.BANK_NAME || 'Bancolombia',
            cuenta: process.env.BANK_ACCOUNT_NUMBER || '12345678901',
            titular: process.env.BANK_ACCOUNT_HOLDER || 'Tecnovariedades D&S'
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
    instructions += `   🏦 Banco: ${process.env.BANK_NAME || 'Bancolombia'}\n`
    instructions += `   📋 Cuenta: ${process.env.BANK_ACCOUNT_NUMBER || '12345678901'}\n`
    instructions += `   👤 Titular: ${process.env.BANK_ACCOUNT_HOLDER || 'Tecnovariedades D&S'}\n`
    instructions += `   💡 Envía comprobante por WhatsApp\n\n`

    instructions += `📞 **Soporte:** ${process.env.BUSINESS_PHONE || '+57 300 556 0186'}\n`
    instructions += `📧 **Email:** ${process.env.BUSINESS_EMAIL || 'deinermena25@gmail.com'}\n\n`
    instructions += `Escribe el nombre del método que prefieres (Nequi, MercadoPago, PayPal, Transferencia) y te envío los datos inmediatamente 👇`

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
    const productName = paymentLinks.product.name

    switch (method.toLowerCase()) {
      case 'nequi':
      case 'daviplata':
      case '1':
        return `¡Perfecto! 💳 Aquí está la información de pago:\n\n` +
               `📦 *Producto:* ${productName}\n` +
               `💰 *Monto:* ${price} COP\n\n` +
               `📱 *Número Nequi/Daviplata:*\n` +
               `${paymentLinks.methods.nequi}\n\n` +
               `*Pasos:*\n` +
               `1️⃣ Abre tu app Nequi o Daviplata\n` +
               `2️⃣ Envía ${price} COP al número ${paymentLinks.methods.nequi}\n` +
               `3️⃣ Toma captura del comprobante\n` +
               `4️⃣ Envíalo por este chat\n\n` +
               `👀 *Estaremos pendientes de tu comprobante para enviarte el producto inmediatamente* ✅`

      case 'mercadopago':
      case 'mercado':
      case 'tarjeta':
      case 'credito':
      case 'debito':
      case '2':
        if (paymentLinks.methods.mercadopago) {
          return `¡Perfecto! 💳 Aquí está tu link de pago:\n\n` +
                 `📦 *Producto:* ${productName}\n` +
                 `💰 *Monto:* ${price} COP\n\n` +
                 `🔗 *Link de MercadoPago:*\n` +
                 `${paymentLinks.methods.mercadopago}\n\n` +
                 `*Pasos:*\n` +
                 `1️⃣ Haz clic en el link\n` +
                 `2️⃣ Ingresa los datos de tu tarjeta\n` +
                 `3️⃣ Confirma el pago\n\n` +
                 `👀 *Estaremos pendientes de la confirmación del pago para enviarte el producto inmediatamente* ✅`
        }
        return `⚠️ Pago con tarjeta no disponible en este momento. Por favor elige otro método.`

      case 'paypal':
      case '3':
        // Calcular monto en USD
        const exchangeRate = parseFloat(process.env.COP_TO_USD_RATE || '4000')
        const priceUSD = (paymentLinks.product.price / exchangeRate).toFixed(2)
        
        if (paymentLinks.methods.paypal) {
          // Si hay link de PayPal dinámico
          return `¡Perfecto! 💳 Aquí está tu link de pago:\n\n` +
                 `📦 *Producto:* ${productName}\n` +
                 `💰 *Monto:* ${price} COP (~${priceUSD} USD)\n\n` +
                 `🔗 *Link de PayPal:*\n` +
                 `${paymentLinks.methods.paypal}\n\n` +
                 `*Pasos:*\n` +
                 `1️⃣ Haz clic en el link\n` +
                 `2️⃣ Inicia sesión en PayPal\n` +
                 `3️⃣ Confirma el pago de ${priceUSD} USD\n\n` +
                 `👀 *Estaremos pendientes de la confirmación del pago para enviarte el producto inmediatamente* ✅`
        }
        return `⚠️ PayPal no disponible en este momento. Por favor elige otro método.`

      case 'transferencia':
      case 'bancaria':
      case '4':
        return `¡Perfecto! 💳 Aquí están los datos bancarios:\n\n` +
               `📦 *Producto:* ${productName}\n` +
               `💰 *Monto:* ${price} COP\n\n` +
               `🏦 *Datos bancarios:*\n` +
               `Banco: ${paymentLinks.methods.transferencia?.banco}\n` +
               `Cuenta: ${paymentLinks.methods.transferencia?.cuenta}\n` +
               `Titular: ${paymentLinks.methods.transferencia?.titular}\n\n` +
               `*Pasos:*\n` +
               `1️⃣ Realiza la transferencia desde tu banco\n` +
               `2️⃣ Toma captura del comprobante\n` +
               `3️⃣ Envíalo por este chat\n\n` +
               `👀 *Estaremos pendientes de tu comprobante para enviarte el producto inmediatamente* ✅`

      default:
        return paymentLinks.instructions
    }
  }
}

