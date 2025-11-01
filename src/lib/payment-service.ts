// Servicio para generar links de pago reales

interface Product {
  id: string
  name: string
  price: number
  description?: string
}

export class PaymentService {
  // MercadoPago - Crear preferencia de pago
  static async createMercadoPagoLink(product: Product, quantity: number = 1): Promise<string> {
    try {
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          items: [{
            title: product.name,
            description: product.description || product.name,
            quantity: quantity,
            unit_price: product.price,
            currency_id: 'COP'
          }],
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
            failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
            pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`
          },
          auto_return: 'approved',
          notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`
        })
      })

      const data = await response.json()
      return data.init_point // URL de pago de MercadoPago
    } catch (error) {
      console.error('Error creating MercadoPago link:', error)
      return '#'
    }
  }

  // PayPal - Crear orden de pago
  static async createPayPalLink(product: Product, quantity: number = 1): Promise<string> {
    try {
      const totalUSD = (product.price * quantity / 4000).toFixed(2) // Conversión COP a USD

      const response = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getPayPalAccessToken()}`
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'USD',
              value: totalUSD
            },
            description: product.name
          }],
          application_context: {
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`
          }
        })
      })

      const data = await response.json()
      const approveLink = data.links?.find((link: any) => link.rel === 'approve')
      return approveLink?.href || '#'
    } catch (error) {
      console.error('Error creating PayPal link:', error)
      return '#'
    }
  }

  // Obtener token de acceso de PayPal
  private static async getPayPalAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64')

    const response = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })

    const data = await response.json()
    return data.access_token
  }

  // WhatsApp - Generar mensaje
  static getWhatsAppLink(product: Product, quantity: number = 1): string {
    const phone = '573005560186' // Tecnovariedades D&S
    const total = product.price * quantity
    const message = `Hola Tecnovariedades D&S! Me interesa este producto:\n\n` +
      `📦 ${product.name}\n` +
      `💰 Precio: $${total.toLocaleString('es-CO')}\n` +
      `📊 Cantidad: ${quantity}\n\n` +
      `¿Está disponible?`

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }
}
