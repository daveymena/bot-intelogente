import { NextRequest, NextResponse } from 'next/server'
import { PaymentLinkGenerator } from '@/lib/payment-link-generator'

/**
 * 💳 API: Generar links de pago dinámicos
 * POST /api/payments/generate-link
 */
export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID requerido' },
        { status: 400 }
      )
    }

    console.log(`[API] Generando links de pago para producto: ${productId}`)

    // Generar todos los links de pago
    const paymentLinks = await PaymentLinkGenerator.generatePaymentLinks(productId)

    if (!paymentLinks) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: paymentLinks
    })

  } catch (error) {
    console.error('[API] Error generando links de pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * 💳 API: Generar link específico de un método
 * GET /api/payments/generate-link?productId=xxx&method=mercadopago
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get('productId')
    const method = searchParams.get('method')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID requerido' },
        { status: 400 }
      )
    }

    console.log(`[API] Generando link ${method} para producto: ${productId}`)

    const paymentLinks = await PaymentLinkGenerator.generatePaymentLinks(productId)

    if (!paymentLinks) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Si se especifica un método, devolver solo ese
    if (method) {
      const response = PaymentLinkGenerator.generateMethodResponse(method, paymentLinks)
      return NextResponse.json({
        success: true,
        method,
        response,
        link: paymentLinks.methods[method as keyof typeof paymentLinks.methods]
      })
    }

    // Si no, devolver todos
    return NextResponse.json({
      success: true,
      data: paymentLinks
    })

  } catch (error) {
    console.error('[API] Error generando link de pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
