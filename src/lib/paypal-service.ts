/**
 * 💙 SERVICIO DE PAYPAL
 * Integración real con la API de PayPal para crear links de pago dinámicos
 * Con persistencia en base de datos para reutilizar links generados
 */

import { db } from './db'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  currency: string
}

/**
 * Obtener o crear link de PayPal para un producto
 * - Si el producto ya tiene un link guardado Y es válido, lo retorna
 * - Si no, genera uno nuevo y lo guarda en la BD
 * 
 * NOTA: Los links de PayPal expiran después de ~3 horas
 * Por eso siempre generamos uno nuevo al momento de pago
 */
export async function getOrCreatePayPalLink(productId: string, forceNew: boolean = true): Promise<string | null> {
  try {
    // 1. Buscar producto en la BD
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      console.error('[PayPal] Producto no encontrado:', productId)
      return null
    }

    // 2. Verificar credenciales antes de intentar generar
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      console.log('[PayPal] ⚠️ Credenciales no configuradas, saltando generación')
      // Retornar link existente si hay (aunque esté expirado, mejor que nada)
      return product.paymentLinkPayPal || null
    }

    // 3. SIEMPRE generar nuevo link (los links de PayPal expiran rápido)
    // Solo reutilizar si forceNew es false y el link existe
    if (!forceNew && product.paymentLinkPayPal) {
      console.log('[PayPal] ✅ Usando link existente para:', product.name)
      return product.paymentLinkPayPal
    }

    // 4. Generar nuevo link
    console.log('[PayPal] 🔄 Generando nuevo link para:', product.name)
    const newLink = await createPayPalLink({
      id: product.id,
      name: product.name,
      description: product.description || undefined,
      price: product.price,
      currency: product.currency || 'COP'
    })

    // 5. Guardar link en la BD
    await db.product.update({
      where: { id: productId },
      data: { paymentLinkPayPal: newLink }
    })

    console.log('[PayPal] ✅ Link nuevo guardado en BD para:', product.name)
    return newLink
  } catch (error) {
    console.error('[PayPal] Error en getOrCreatePayPalLink:', error)
    // Intentar retornar link existente como fallback
    try {
      const product = await db.product.findUnique({
        where: { id: productId },
        select: { paymentLinkPayPal: true }
      })
      return product?.paymentLinkPayPal || null
    } catch {
      return null
    }
  }
}

/**
 * Generar links de PayPal para todos los productos sin link
 */
export async function generateMissingPayPalLinks(): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  try {
    // Buscar productos sin link de PayPal
    const products = await db.product.findMany({
      where: {
        paymentLinkPayPal: null,
        status: 'AVAILABLE'
      }
    })

    console.log(`[PayPal] 📦 ${products.length} productos sin link de PayPal`)

    for (const product of products) {
      try {
        const link = await getOrCreatePayPalLink(product.id)
        if (link) {
          success++
          console.log(`[PayPal] ✅ ${product.name}: ${link.substring(0, 50)}...`)
        } else {
          failed++
        }
        // Esperar un poco entre requests para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        failed++
        console.error(`[PayPal] ❌ Error con ${product.name}:`, error)
      }
    }

    console.log(`[PayPal] 📊 Resultado: ${success} exitosos, ${failed} fallidos`)
    return { success, failed }
  } catch (error) {
    console.error('[PayPal] Error generando links:', error)
    return { success, failed }
  }
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

