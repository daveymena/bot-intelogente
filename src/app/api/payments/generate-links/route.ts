import { NextRequest, NextResponse } from 'next/server'
import { PaymentLinkGenerator } from '@/lib/payment-link-generator'

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID requerido' },
        { status: 400 }
      )
    }

    // Generar links de pago
    const paymentLinks = await PaymentLinkGenerator.generatePaymentLinks(productId)

    if (!paymentLinks) {
      return NextResponse.json(
        { error: 'No se pudieron generar los links de pago' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentLinks
    })

  } catch (error) {
    console.error('[API] Error generando links:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
