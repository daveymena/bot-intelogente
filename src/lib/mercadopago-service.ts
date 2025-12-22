/**
 * 💳 SERVICIO DE MERCADOPAGO
 * Integración real con la API de MercadoPago para crear links de pago dinámicos
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
 * Obtener o crear link de MercadoPago para un producto
 * - Si el producto ya tiene un link guardado, lo retorna
 * - Si no, genera uno nuevo y lo guarda en la BD
 */
export async function getOrCreateMercadoPagoLink(productId: string): Promise<string | null> {
  try {
    // 1. Buscar producto en la BD
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      console.error('[MercadoPago] Producto no encontrado:', productId)
      return null
    }

    // 2. Si ya tiene link guardado, retornarlo
    if (product.paymentLinkMercadoPago) {
      console.log('[MercadoPago] ✅ Link existente encontrado para:', product.name)
      return product.paymentLinkMercadoPago
    }

    // 3. Generar nuevo link
    console.log('[MercadoPago] 🔄 Generando nuevo link para:', product.name)
    const newLink = await createMercadoPagoLink({
      id: product.id,
      name: product.name,
      description: product.description || undefined,
      price: product.price,
      currency: product.currency || 'COP'
    })

    // 4. Guardar link en la BD
    await db.product.update({
      where: { id: productId },
      data: { paymentLinkMercadoPago: newLink }
    })

    console.log('[MercadoPago] ✅ Link guardado en BD para:', product.name)
    return newLink
  } catch (error) {
    console.error('[MercadoPago] Error en getOrCreateMercadoPagoLink:', error)
    return null
  }
}

/**
 * Generar links de MercadoPago para todos los productos sin link
 */
export async function generateMissingMercadoPagoLinks(): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  try {
    // Buscar productos sin link de MercadoPago
    const products = await db.product.findMany({
      where: {
        paymentLinkMercadoPago: null,
        status: 'AVAILABLE'
      }
    })

    console.log(`[MercadoPago] 📦 ${products.length} productos sin link de MercadoPago`)

    for (const product of products) {
      try {
        const link = await getOrCreateMercadoPagoLink(product.id)
        if (link) {
          success++
          console.log(`[MercadoPago] ✅ ${product.name}: ${link.substring(0, 50)}...`)
        } else {
          failed++
        }
        // Esperar un poco entre requests para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        failed++
        console.error(`[MercadoPago] ❌ Error con ${product.name}:`, error)
      }
    }

    console.log(`[MercadoPago] 📊 Resultado: ${success} exitosos, ${failed} fallidos`)
    return { success, failed }
  } catch (error) {
    console.error('[MercadoPago] Error generando links:', error)
    return { success, failed }
  }
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

