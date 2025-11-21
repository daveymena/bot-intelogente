/**
 * 💙 SERVICIO DE PAYPAL
 * Integración real con la API de PayPal para crear links de pago dinámicos
 */

interface Product {
  id: string
  name: string
  description?: string
  price: number
  currency: string
}

/**
 * Obtener token de acceso de PayPal
 */
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const mode = process.env.PAYPAL_MODE || 'sandbox'

  if (!clientId || !clientSecret) {
    throw new Error('Credenciales de PayPal no configuradas')
  }

  const authUrl = mode === 'live'
    ? 'https://api-m.paypal.com/v1/oauth2/token'
    : 'https://api-m.sandbox.paypal.com/v1/oauth2/token'

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  try {
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
  } catch (error) {
    console.error('[PayPal] Error obteniendo token:', error)
    throw error
  }
}

/**
 * Convertir COP a USD (aproximado)
 */
function convertCOPtoUSD(copAmount: number): string {
  // Tasa aproximada: 1 USD = 4000 COP
  const usdAmount = copAmount / 4000
  return usdAmount.toFixed(2)
}

/**
 * Crear orden de pago en PayPal
 */
export async function createPayPalLink(product: Product): Promise<string> {
  console.log('[PayPal] Creando orden para:', product.name)

  const accessToken = await getPayPalAccessToken()
  const mode = process.env.PAYPAL_MODE || 'sandbox'

  const orderUrl = mode === 'live'
    ? 'https://api-m.paypal.com/v2/checkout/orders'
    : 'https://api-m.sandbox.paypal.com/v2/checkout/orders'

  // Convertir precio si es COP
  const amount = product.currency === 'COP'
    ? convertCOPtoUSD(product.price)
    : product.price.toFixed(2)

  const currencyCode = product.currency === 'COP' ? 'USD' : product.currency

  const orderData = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: product.id,
        description: product.description || product.name,
        amount: {
          currency_code: currencyCode,
          value: amount
        }
      }
    ],
    application_context: {
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'}/tienda/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'}/tienda/failure`,
      brand_name: 'Tecnovariedades D&S',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW'
    }
  }

  try {
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
      console.error('[PayPal] Error response:', errorText)
      throw new Error(`PayPal API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Buscar el link de aprobación
    const approveLink = data.links.find((link: any) => link.rel === 'approve')

    if (!approveLink) {
      throw new Error('No se encontró link de aprobación en la respuesta de PayPal')
    }

    console.log('[PayPal] ✅ Orden creada:', data.id)
    console.log('[PayPal] ✅ Link generado:', approveLink.href)

    return approveLink.href // Este es el link de pago real
  } catch (error) {
    console.error('[PayPal] Error creando orden:', error)
    throw error
  }
}

/**
 * Capturar pago de PayPal
 */
export async function capturePayPalPayment(orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken()
  const mode = process.env.PAYPAL_MODE || 'sandbox'

  const captureUrl = mode === 'live'
    ? `https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`
    : `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`

  try {
    const response = await fetch(captureUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`PayPal Capture error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[PayPal] Error capturando pago:', error)
    throw error
  }
}

