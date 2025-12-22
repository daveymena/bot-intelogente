import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DeliveryService } from '@/lib/delivery-service'

/**
 * 📦 WEBHOOK DE PAGOS - ENTREGA AUTOMÁTICA
 * 
 * Recibe notificaciones de MercadoPago y PayPal
 * Envía automáticamente el link de Google Drive después del pago
 * 
 * MercadoPago: POST /api/payments/webhook
 * PayPal: POST /api/payments/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📥 [Webhook] Recibido:', JSON.stringify(body, null, 2))

    // Detectar proveedor de pago
    const isMercadoPago = body.type || body.action
    const isPayPal = body.event_type

    if (isMercadoPago) {
      return await handleMercadoPagoWebhook(body)
    } else if (isPayPal) {
      return await handlePayPalWebhook(body)
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Proveedor de pago no reconocido' 
    }, { status: 400 })

  } catch (error) {
    console.error('❌ [Webhook] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error procesando webhook' 
    }, { status: 500 })
  }
}

/**
 * 💳 Procesar webhook de MercadoPago
 */
async function handleMercadoPagoWebhook(body: any) {
  try {
    const eventType = body.type || body.action
    console.log('💳 [MercadoPago] Evento:', eventType)

    // Solo procesar pagos aprobados
    if (eventType === 'payment' || eventType === 'payment.updated') {
      const paymentId = body.data?.id

      if (!paymentId) {
        console.log('⚠️ [MercadoPago] Sin payment ID')
        return NextResponse.json({ success: true, message: 'Sin payment ID' })
      }

      // Obtener detalles del pago desde MercadoPago API
      const paymentDetails = await getMercadoPagoPaymentDetails(paymentId)
      
      if (!paymentDetails) {
        console.log('⚠️ [MercadoPago] No se pudieron obtener detalles del pago')
        return NextResponse.json({ success: true, message: 'Sin detalles de pago' })
      }

      // Solo procesar pagos aprobados
      if (paymentDetails.status !== 'approved') {
        console.log(`⏳ [MercadoPago] Pago no aprobado: ${paymentDetails.status}`)
        return NextResponse.json({ success: true, message: `Estado: ${paymentDetails.status}` })
      }

      console.log('✅ [MercadoPago] Pago aprobado!')
      console.log('   - ID:', paymentId)
      console.log('   - Monto:', paymentDetails.transaction_amount)
      console.log('   - Email:', paymentDetails.payer?.email)
      console.log('   - Referencia:', paymentDetails.external_reference)

      // Buscar producto por external_reference (productId)
      const productId = paymentDetails.external_reference
      
      if (productId) {
        // Enviar entrega automática
        const deliveryResult = await DeliveryService.processPaymentDelivery(
          productId,
          paymentDetails.payer?.email,
          paymentDetails.payer?.phone?.number,
          paymentDetails.payer?.first_name
        )

        console.log('📦 [MercadoPago] Resultado entrega:', deliveryResult)

        // Registrar la orden en la base de datos
        await registerOrder({
          productId,
          paymentProvider: 'MERCADOPAGO',
          paymentId: paymentId.toString(),
          amount: paymentDetails.transaction_amount,
          currency: paymentDetails.currency_id || 'COP',
          customerEmail: paymentDetails.payer?.email,
          customerPhone: paymentDetails.payer?.phone?.number,
          customerName: paymentDetails.payer?.first_name,
          deliveryStatus: deliveryResult.success ? 'DELIVERED' : 'PENDING'
        })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Pago procesado y entrega enviada' 
      })
    }

    return NextResponse.json({ success: true, message: 'Evento ignorado' })

  } catch (error) {
    console.error('❌ [MercadoPago] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error procesando MercadoPago webhook' 
    }, { status: 500 })
  }
}

/**
 * 💰 Procesar webhook de PayPal
 */
async function handlePayPalWebhook(body: any) {
  try {
    const eventType = body.event_type
    console.log('💰 [PayPal] Evento:', eventType)

    // Solo procesar pagos completados
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = body.resource?.id || body.resource?.order_id
      const purchaseUnits = body.resource?.purchase_units || []
      const payer = body.resource?.payer || {}

      if (!orderId) {
        console.log('⚠️ [PayPal] Sin order ID')
        return NextResponse.json({ success: true, message: 'Sin order ID' })
      }

      console.log('✅ [PayPal] Pago completado!')
      console.log('   - Order ID:', orderId)
      console.log('   - Email:', payer.email_address)

      // Buscar producto por reference_id
      const productId = purchaseUnits[0]?.reference_id
      const amount = purchaseUnits[0]?.amount?.value
      const currency = purchaseUnits[0]?.amount?.currency_code

      if (productId) {
        // Enviar entrega automática
        const deliveryResult = await DeliveryService.processPaymentDelivery(
          productId,
          payer.email_address,
          undefined, // PayPal no siempre envía teléfono
          payer.name?.given_name
        )

        console.log('📦 [PayPal] Resultado entrega:', deliveryResult)

        // Registrar la orden en la base de datos
        await registerOrder({
          productId,
          paymentProvider: 'PAYPAL',
          paymentId: orderId,
          amount: parseFloat(amount) || 0,
          currency: currency || 'USD',
          customerEmail: payer.email_address,
          customerName: payer.name?.given_name,
          deliveryStatus: deliveryResult.success ? 'DELIVERED' : 'PENDING'
        })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Pago procesado y entrega enviada' 
      })
    }

    return NextResponse.json({ success: true, message: 'Evento ignorado' })

  } catch (error) {
    console.error('❌ [PayPal] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error procesando PayPal webhook' 
    }, { status: 500 })
  }
}

/**
 * Obtener detalles del pago desde MercadoPago API
 */
async function getMercadoPagoPaymentDetails(paymentId: string): Promise<any> {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      console.error('[MercadoPago] ACCESS_TOKEN no configurado')
      return null
    }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      console.error('[MercadoPago] Error obteniendo pago:', response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('[MercadoPago] Error:', error)
    return null
  }
}

/**
 * Registrar orden en la base de datos
 */
async function registerOrder(data: {
  productId: string
  paymentProvider: string
  paymentId: string
  amount: number
  currency: string
  customerEmail?: string
  customerPhone?: string
  customerName?: string
  deliveryStatus: string
}) {
  try {
    // Buscar el producto
    const product = await db.product.findUnique({
      where: { id: data.productId }
    })

    if (!product) {
      console.log('⚠️ Producto no encontrado para registrar orden:', data.productId)
      return
    }

    // Crear orden en la base de datos
    const order = await db.order.create({
      data: {
        productId: data.productId,
        userId: product.userId,
        quantity: 1,
        total: data.amount,
        status: 'paid',
        paymentMethod: data.paymentProvider,
        customerName: data.customerName || 'Cliente',
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone || 'N/A',
        notes: `Pago ${data.paymentProvider}: ${data.paymentId}. Entrega: ${data.deliveryStatus}`
      }
    })

    console.log('✅ Orden registrada:', order.id)
    return order
  } catch (error) {
    console.error('❌ Error registrando orden:', error)
    // No fallar el webhook si no se puede registrar la orden
  }
}

// GET para verificar que el endpoint existe
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Webhook endpoint activo - Entrega automática habilitada',
    providers: ['MercadoPago', 'PayPal'],
    features: [
      'Entrega automática por WhatsApp',
      'Entrega automática por Email',
      'Registro de órdenes en BD'
    ]
  })
}
