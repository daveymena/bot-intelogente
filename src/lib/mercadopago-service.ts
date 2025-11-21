/**
 * 💳 SERVICIO DE MERCADOPAGO
 * Integración real con la API de MercadoPago para crear links de pago dinámicos
 */

interface Product {
  id: string
  name: string
  description?: string
  price: number
  currency: string
}

interface MercadoPagoPreference {
  items: Array<{
    title: string
    description: string
    quantity: number
    unit_price: number
    currency_id: string
  }>
  back_urls?: {
    success: string
    failure: string
    pending: string
  }
  auto_return?: string
  external_reference?: string
}

/**
 * Crear preferencia de pago en MercadoPago
 */
export async function createMercadoPagoLink(product: Product): Promise<string> {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN

  if (!accessToken) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN no configurado')
  }

  console.log('[MercadoPago] Creando preferencia para:', product.name)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'

  const preference: MercadoPagoPreference = {
    items: [
      {
        title: product.name,
        description: product.description || product.name,
        quantity: 1,
        unit_price: product.price,
        currency_id: product.currency || 'COP'
      }
    ],
    back_urls: {
      success: `${appUrl}/tienda/success`,
      failure: `${appUrl}/tienda/failure`,
      pending: `${appUrl}/tienda/pending`
    },
    external_reference: product.id
  }

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(preference)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[MercadoPago] Error response:', errorText)
      throw new Error(`MercadoPago API error: ${response.status}`)
    }

    const data = await response.json()
    
    console.log('[MercadoPago] ✅ Preferencia creada:', data.id)
    console.log('[MercadoPago] ✅ Link generado:', data.init_point)

    return data.init_point // Este es el link de pago real
  } catch (error) {
    console.error('[MercadoPago] Error creando preferencia:', error)
    throw error
  }
}

/**
 * Verificar estado de un pago
 */
export async function getMercadoPagoPaymentStatus(paymentId: string): Promise<any> {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN

  if (!accessToken) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN no configurado')
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`MercadoPago API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[MercadoPago] Error obteniendo estado:', error)
    throw error
  }
}

