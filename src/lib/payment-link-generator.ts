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
  
  /**
   * Obtener configuración de pagos del usuario
   */
  private static async getUserConfig(userId: string) {
    const config = await db.paymentConfig.findUnique({
      where: { userId }
    });
    
    // Si no tiene configuración, retornar falsos para evitar crashes, 
    // pero idealmente debería tenerla si se ejecutó la migración.
    return config || {
      nequiPhone: '3136174267', // Fallback seguro por si acaso
      daviplataPhone: '3136174267',
      mercadopagoAccessToken: null,
      mercadopagoPublicKey: null,
      paypalClientId: null,
      paypalClientSecret: null,
      paypalEmail: null,
      bankName: 'Bancolombia',
      bankAccountNumber: '',
      bankAccountHolder: '',
      paypalEnabled: false,
      nequiEnabled: true,
      daviplataEnabled: true,
      mercadoPagoEnabled: false,
      bankTransferEnabled: true
    };
  }

  /**
   * Generar link de MercadoPago con credenciales dinámicas
   */
  static async generateMercadoPagoLink(
    productName: string,
    price: number,
    productId: string,
    retry = false,
    config: any
  ): Promise<string | null> {
    try {
      if (!config.mercadoPagoAccessToken) {
        // console.log('[PaymentLink] MercadoPago no configurado para usuario')
        return null
      }

      // Llamar a API de MercadoPago para crear preferencia
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.mercadoPagoAccessToken}`
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
   * Generar link de PayPal DINÁMICO con credenciales dinámicas
   */
  static async generatePayPalLink(
    productName: string,
    price: number,
    productId: string,
    config: any
  ): Promise<string | null> {
    try {
      const clientId = config.paypalClientId
      const clientSecret = config.paypalClientSecret
      
      // Si no hay credenciales de API, intentar fallback a email
      if (!clientId || !clientSecret) {
        // console.log('[PaymentLink] ⚠️ PayPal API no configurado, usando fallback...')
        return this.generatePayPalFallbackLink(productName, price, config)
      }

      // console.log('[PaymentLink] 💰 Generando link PayPal dinámico con API')

      // 1. Obtener token de acceso
      const accessToken = await this.getPayPalAccessToken(clientId, clientSecret)
      
      // 2. Convertir COP a USD (Tasa fija por ahora, configurable después)
      const COP_TO_USD = 4000;
      const priceUSD = (price / COP_TO_USD).toFixed(2)

      // 3. Crear orden en PayPal
      // Detectar modo sandbox/live (idealmente debería venir de config, asumimos live si no se especifica)
      const isSandbox = config.paypalMode === 'sandbox'; 
      const orderUrl = isSandbox 
        ? 'https://api-m.sandbox.paypal.com/v2/checkout/orders'
        : 'https://api-m.paypal.com/v2/checkout/orders'

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';

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
          return_url: `${appUrl}/payment/success`,
          cancel_url: `${appUrl}/payment/cancel`,
          brand_name: config.businessName || 'Tienda',
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
        // const errorText = await response.text()
        // console.error('[PaymentLink] ❌ Error PayPal API:', errorText)
        return this.generatePayPalFallbackLink(productName, price, config)
      }

      const data = await response.json()
      
      // 4. Buscar el link de aprobación
      const approveLink = data.links?.find((link: any) => link.rel === 'approve')?.href

      if (!approveLink) {
        return this.generatePayPalFallbackLink(productName, price, config)
      }

      return approveLink

    } catch (error) {
      console.error('[PaymentLink] ❌ Error generando link PayPal:', error)
      return this.generatePayPalFallbackLink(productName, price, config)
    }
  }

  /**
   * Obtener token de acceso de PayPal
   */
  private static async getPayPalAccessToken(clientId: string, clientSecret: string): Promise<string> {
    // Asumimos live por defecto si no es sandbox
    const authUrl = 'https://api-m.paypal.com/v1/oauth2/token' 
    // Nota: Para soportar sandbox real, necesitaríamos guardar 'paypalMode' en DB. 
    // Por simplicidad en esta migración asumimos producción predeterminada o URL de sandbox si falla auth (todo: mejorar esto).
    // En realidad, la URL de token también cambia. Usaremos la de live como principal.

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
      // Reintentar con sandbox si falla live? No, mejor fallar y usar fallback email.
      throw new Error(`PayPal Auth error: ${response.status}`)
    }

    const data = await response.json()
    return data.access_token
  }

  /**
   * Fallback: Generar link de PayPal con email
   */
  private static generatePayPalFallbackLink(productName: string, price: number, config: any): string | null {
    const COP_TO_USD = 4000;
    const priceUSD = (price / COP_TO_USD).toFixed(2)
    
    // OPCIÓN 1: Email de PayPal
    if (config.paypalEmail) {
      return `https://www.paypal.com/ncp/payment/${encodeURIComponent(config.paypalEmail)}`
    }
    
    return null
  }

  /**
   * Generar todos los métodos de pago para un producto (SaaS Aware)
   */
  static async generatePaymentLinks(productId: string): Promise<PaymentLinks | null> {
    try {
      // 1. Obtener producto y su userId
      const product = await db.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        console.error('[PaymentLink] ❌ Producto no encontrado:', productId)
        return null
      }

      // 2. Obtener configuración del DUEÑO del producto
      const config = await this.getUserConfig(product.userId);

      // 3. Generar links usando esa configuración
      const mercadopagoLink = config.mercadoPagoEnabled ? await this.generateMercadoPagoLink(
        product.name,
        product.price,
        product.id,
        false,
        config
      ) : null

      const paypalLink = config.paypalEnabled ? await this.generatePayPalLink(
        product.name,
        product.price,
        product.id,
        config
      ) : null

      // 4. Construir respuesta
      const paymentLinks: PaymentLinks = {
        product,
        methods: {
          nequi: config.nequiEnabled ? (config.nequiPhone || '3136174267') : '',
          daviplata: config.daviplataEnabled ? (config.daviplataPhone || '3136174267') : '',
          mercadopago: mercadopagoLink || undefined,
          paypal: paypalLink || undefined,
          tarjeta: mercadopagoLink || undefined,
          transferencia: config.bankTransferEnabled ? {
            banco: config.bankName || 'Bancolombia',
            cuenta: config.bankAccountNumber || '',
            titular: config.bankAccountHolder || ''
          } : undefined
        },
        instructions: '' // Se llenará abajo
      }
      
      paymentLinks.instructions = this.generateInstructions(product, mercadopagoLink, paypalLink, config);

      return paymentLinks

    } catch (error) {
      console.error('[PaymentLink] Error generando links:', error)
      return null
    }
  }

  /**
   * Generar instrucciones de pago (SaaS)
   */
  private static generateInstructions(
    product: any,
    mercadopagoLink: string | null,
    paypalLink: string | null,
    config: any
  ): string {
    const emoji = this.getProductEmoji(product)
    let instructions = `💳 **MÉTODOS DE PAGO PARA ${product.name}** ${emoji}\n\n`
    instructions += `💰 Precio: ${product.price.toLocaleString('es-CO')} COP\n\n`
    instructions += `Elige tu método de pago preferido:\n\n`

    // 1. Nequi/Daviplata
    if (config.nequiEnabled || config.daviplataEnabled) {
        instructions += `1️⃣ **NEQUI / DAVIPLATA**\n`
        if(config.nequiEnabled) instructions += `   📱 Nequi: ${config.nequiPhone || '3136174267'}\n`
        if(config.daviplataEnabled) instructions += `   📱 Daviplata: ${config.daviplataPhone || '3136174267'}\n`
        instructions += `   ✅ Transferencia instantánea\n`
        instructions += `   💡 Envía comprobante por WhatsApp\n\n`
    }

    // 2. Tarjeta (MercadoPago)
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

    // 4. Transferencia
    if (config.bankTransferEnabled) {
      instructions += `4️⃣ **TRANSFERENCIA BANCARIA**\n`
      instructions += `   🏦 Banco: ${config.bankName || 'Bancolombia'}\n`
      instructions += `   📋 Cuenta: ${config.bankAccountNumber}\n`
      instructions += `   👤 Titular: ${config.bankAccountHolder}\n`
      instructions += `   💡 Envía comprobante por WhatsApp\n\n`
    }

    const phone = config.contactPhone || process.env.BUSINESS_PHONE || '+57 300 556 0186';
    const email = config.contactEmail || process.env.BUSINESS_EMAIL || 'deinermen25@gmail.com';

    instructions += `📞 **Soporte:** ${phone}\n`
    instructions += `📧 **Email:** ${email}\n\n`
    instructions += `Escribe el nombre del método que prefieres y te envío los datos inmediatamente 👇`

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
   * Generar respuesta según método elegido (SaaS Aware)
   */
  static generateMethodResponse(method: string, paymentLinks: PaymentLinks): string {
    const emoji = this.getProductEmoji(paymentLinks.product)
    const price = paymentLinks.product.price.toLocaleString('es-CO')
    const productName = paymentLinks.product.name
    const methods = paymentLinks.methods;

    switch (method.toLowerCase()) {
      case 'nequi':
      case 'daviplata':
      case '1':
        return `¡Perfecto! 💳 Aquí está la información de pago:\n\n` +
               `📦 *Producto:* ${productName}\n` +
               `💰 *Monto:* ${price} COP\n\n` +
               (methods.nequi ? `📱 *Nequi:* ${methods.nequi}\n` : '') +
               (methods.daviplata ? `📱 *Daviplata:* ${methods.daviplata}\n` : '') +
               `\n*Pasos:*\n` +
               `1️⃣ Abre tu app\n` +
               `2️⃣ Envía ${price} COP al número indicado\n` +
               `3️⃣ Toma captura del comprobante\n` +
               `4️⃣ Envíalo por este chat\n\n` +
               `👀 *Estaremos pendientes de tu comprobante para enviarte el producto inmediatamente* ✅`

      case 'mercadopago':
      case 'mercado':
      case 'tarjeta':
      case 'credito':
      case 'debito':
      case '2':
        if (methods.mercadopago) {
          return `¡Perfecto! 💳 Aquí está tu link de pago:\n\n` +
                 `📦 *Producto:* ${productName}\n` +
                 `💰 *Monto:* ${price} COP\n\n` +
                 `🔗 *Link de MercadoPago:*\n` +
                 `${methods.mercadopago}\n\n` +
                 `*Pasos:*\n` +
                 `1️⃣ Haz clic en el link\n` +
                 `2️⃣ Ingresa los datos de tu tarjeta\n` +
                 `3️⃣ Confirma el pago\n\n` +
                 `👀 *Estaremos pendientes de la confirmación del pago para enviarte el producto inmediatamente* ✅`
        }
        return `⚠️ Método no disponible para este producto.`

      case 'paypal':
      case '3':
        const COP_TO_USD = 4000;
        const priceUSD = (paymentLinks.product.price / COP_TO_USD).toFixed(2)
        
        if (methods.paypal) {
          return `¡Perfecto! 💳 Aquí está tu link de pago:\n\n` +
                 `📦 *Producto:* ${productName}\n` +
                 `💰 *Monto:* ${price} COP (~${priceUSD} USD)\n\n` +
                 `🔗 *Link de PayPal:*\n` +
                 `${methods.paypal}\n\n` +
                 `*Pasos:*\n` +
                 `1️⃣ Haz clic en el link\n` +
                 `2️⃣ Inicia sesión en PayPal\n` +
                 `3️⃣ Confirma el pago de ${priceUSD} USD\n\n` +
                 `👀 *Estaremos pendientes de la confirmación del pago para enviarte el producto inmediatamente* ✅`
        }
        return `⚠️ PayPal no disponible en este momento.`

      case 'transferencia':
      case 'bancaria':
      case '4':
        if (methods.transferencia) {
            return `¡Perfecto! 💳 Aquí están los datos bancarios:\n\n` +
                   `📦 *Producto:* ${productName}\n` +
                   `💰 *Monto:* ${price} COP\n\n` +
                   `🏦 *Datos bancarios:*\n` +
                   `Banco: ${methods.transferencia.banco}\n` +
                   `Cuenta: ${methods.transferencia.cuenta}\n` +
                   `Titular: ${methods.transferencia.titular}\n\n` +
                   `*Pasos:*\n` +
                   `1️⃣ Realiza la transferencia desde tu banco\n` +
                   `2️⃣ Toma captura del comprobante\n` +
                   `3️⃣ Envíalo por este chat\n\n` +
                   `👀 *Estaremos pendientes de tu comprobante para enviarte el producto inmediatamente* ✅`
        }
        return `⚠️ Transferencia bancaria no disponible.`

      default:
        return paymentLinks.instructions
    }
  }
}

