/**
 * API Route: Enviar confirmación de pago
 * POST /api/notifications/send-payment-confirmation
 */

import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notification-service';

export async function POST(req: NextRequest) {
  try {
    const { paymentId, customerEmail, customerName } = await req.json();

    if (!paymentId || !customerEmail) {
      return NextResponse.json(
        { error: 'paymentId y customerEmail son requeridos' },
        { status: 400 }
      );
    }

    const result = await NotificationService.sendPaymentConfirmation({
      paymentId,
      customerEmail,
      customerName,
      type: 'confirmation'
    });

    return NextResponse.json({
      success: true,
      message: 'Confirmación de pago enviada',
      url: result.url
    });

  } catch (error: any) {
    console.error('[SendPaymentConfirmation] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al enviar confirmación' },
      { status: 500 }
    );
  }
}
