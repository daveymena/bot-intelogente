import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { EmailService } from '@/lib/email-service'

/**
 * Webhook para recibir notificaciones de pagos de MercadoPago y PayPal
 * 
 * MercadoPago: POST /api/payments/webhook
 * PayPal: POST /api/payments/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📥 Webhook recibido:', JSON.stringify(body, null, 2))

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
    console.error('❌ Error en webhook:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error procesando webhook' 
    }, { status: 500 })
  }
}

/**
 * Procesar webhook de MercadoPago
 */
async function handleMercadoPagoWebhook(body: any) {
  try {
    // MercadoPago envía el evento en body.type
    const eventType = body.type || body.action

    console.log('💳 MercadoPago webhook:', eventType)

    // Solo procesar pagos aprobados
    if (eventType === 'payment' || eventType === 'payment.updated') {
      const paymentId = body.data?.id

      if (!paymentId) {
        return NextResponse.json({ success: true, message: 'Sin payment ID' })
      }

      // Buscar el pago en la base de datos
      const payment = await prisma.payment.findFirst({
        where: {
          externalId: paymentId.toString()
        },
        include: {
          user: true,
          membership: true
        }
      })

      if (!payment) {
        console.log('⚠️ Pago no encontrado:', paymentId)
        return NextResponse.json({ success: true, message: 'Pago no encontrado' })
      }

      // Si ya está procesado, no hacer nada
      if (payment.status === 'COMPLETED') {
        console.log('✅ Pago ya procesado:', paymentId)
        return NextResponse.json({ success: true, message: 'Pago ya procesado' })
      }

      // Actualizar estado del pago
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date()
        }
      })

      // Activar membresía
      if (payment.membership) {
        const expiresAt = new Date()
        
        // Calcular fecha de expiración según el plan
        switch (payment.membership.plan) {
          case 'BASIC':
            expiresAt.setMonth(expiresAt.getMonth() + 1)
            break
          case 'PROFESSIONAL':
            expiresAt.setMonth(expiresAt.getMonth() + 3)
            break
          case 'ENTERPRISE':
            expiresAt.setFullYear(expiresAt.getFullYear() + 1)
            break
        }

        await prisma.membership.update({
          where: { id: payment.membership.id },
          data: {
            status: 'ACTIVE',
            expiresAt
          }
        })

        // Enviar email de confirmación
        try {
          await EmailService.sendPaymentConfirmation(
            payment.user.email,
            payment.user.name || 'Usuario',
            {
              planName: payment.membership.plan,
              amount: payment.amount,
              currency: payment.currency,
              expiresAt: expiresAt.toISOString(),
              paymentId: payment.externalId || payment.id
            }
          )
          console.log('📧 Email de confirmación enviado')
        } catch (emailError) {
          console.error('❌ Error enviando email:', emailError)
          // No fallar el webhook si el email falla
        }

        console.log('✅ Membresía activada:', payment.membership.id)
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Pago procesado exitosamente' 
      })
    }

    return NextResponse.json({ success: true, message: 'Evento ignorado' })

  } catch (error) {
    console.error('❌ Error procesando MercadoPago webhook:', error)
    throw error
  }
}

/**
 * Procesar webhook de PayPal
 */
async function handlePayPalWebhook(body: any) {
  try {
    const eventType = body.event_type

    console.log('💰 PayPal webhook:', eventType)

    // Solo procesar pagos completados
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = body.resource?.id || body.resource?.order_id

      if (!orderId) {
        return NextResponse.json({ success: true, message: 'Sin order ID' })
      }

      // Buscar el pago en la base de datos
      const payment = await prisma.payment.findFirst({
        where: {
          externalId: orderId
        },
        include: {
          user: true,
          membership: true
        }
      })

      if (!payment) {
        console.log('⚠️ Pago no encontrado:', orderId)
        return NextResponse.json({ success: true, message: 'Pago no encontrado' })
      }

      // Si ya está procesado, no hacer nada
      if (payment.status === 'COMPLETED') {
        console.log('✅ Pago ya procesado:', orderId)
        return NextResponse.json({ success: true, message: 'Pago ya procesado' })
      }

      // Actualizar estado del pago
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date()
        }
      })

      // Activar membresía
      if (payment.membership) {
        const expiresAt = new Date()
        
        // Calcular fecha de expiración según el plan
        switch (payment.membership.plan) {
          case 'BASIC':
            expiresAt.setMonth(expiresAt.getMonth() + 1)
            break
          case 'PROFESSIONAL':
            expiresAt.setMonth(expiresAt.getMonth() + 3)
            break
          case 'ENTERPRISE':
            expiresAt.setFullYear(expiresAt.getFullYear() + 1)
            break
        }

        await prisma.membership.update({
          where: { id: payment.membership.id },
          data: {
            status: 'ACTIVE',
            expiresAt
          }
        })

        // Enviar email de confirmación
        try {
          await EmailService.sendPaymentConfirmation(
            payment.user.email,
            payment.user.name || 'Usuario',
            {
              planName: payment.membership.plan,
              amount: payment.amount,
              currency: payment.currency,
              expiresAt: expiresAt.toISOString(),
              paymentId: payment.externalId || payment.id
            }
          )
          console.log('📧 Email de confirmación enviado')
        } catch (emailError) {
          console.error('❌ Error enviando email:', emailError)
          // No fallar el webhook si el email falla
        }

        console.log('✅ Membresía activada:', payment.membership.id)
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Pago procesado exitosamente' 
      })
    }

    return NextResponse.json({ success: true, message: 'Evento ignorado' })

  } catch (error) {
    console.error('❌ Error procesando PayPal webhook:', error)
    throw error
  }
}

// Permitir GET para verificar que el endpoint existe
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Webhook endpoint activo',
    providers: ['MercadoPago', 'PayPal']
  })
}
