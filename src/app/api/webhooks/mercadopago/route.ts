import { NextRequest, NextResponse } from 'next/server';
import { UserLicenseService } from '@/lib/user-license-service';
import { db } from '@/lib/db';

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

/**
 * Webhook de MercadoPago para confirmar pagos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[MercadoPago Webhook] Received:', body);

    // MercadoPago envía notificaciones de tipo "payment"
    if (body.type === 'payment') {
      const paymentId = body.data?.id;

      if (!paymentId) {
        return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
      }

      // Obtener detalles del pago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      );

      const payment = await paymentResponse.json();

      console.log('[MercadoPago Webhook] Payment details:', payment);

      // Verificar que el pago fue aprobado
      if (payment.status === 'approved') {
        // Obtener datos de la referencia externa
        const externalReference = payment.external_reference;
        
        if (!externalReference) {
          console.error('[MercadoPago Webhook] No external reference');
          return NextResponse.json({ received: true });
        }

        const { userId, plan } = JSON.parse(externalReference);

        // Activar suscripción
        const result = await UserLicenseService.upgradeSubscription(
          userId,
          plan,
          30 // 30 días
        );

        console.log('[MercadoPago Webhook] Subscription activated:', result);

        // Guardar registro del pago
        await db.payment.create({
          data: {
            userId,
            amount: payment.transaction_amount,
            currency: payment.currency_id,
            status: 'completed',
            paymentMethod: 'mercadopago',
            transactionId: payment.id.toString(),
            metadata: JSON.stringify({
              plan,
              paymentDetails: payment,
            }),
          },
        });

        // TODO: Enviar email de confirmación al usuario
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[MercadoPago Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// MercadoPago también puede enviar GET para verificar el endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
