import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment-service'

export async function POST(request: NextRequest) {
  try {
    const { productId, productName, price, description, quantity, method } = await request.json()

    const product = {
      id: productId,
      name: productName,
      price: price,
      description: description
    }

    let paymentLink = '#'

    switch (method) {
      case 'mercadopago':
        paymentLink = await PaymentService.createMercadoPagoLink(product, quantity)
        break
      case 'paypal':
        paymentLink = await PaymentService.createPayPalLink(product, quantity)
        break
      case 'whatsapp':
        paymentLink = PaymentService.getWhatsAppLink(product, quantity)
        break
      default:
        return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

    return NextResponse.json({ paymentLink })
  } catch (error) {
    console.error('Error creating payment link:', error)
    return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 })
  }
}
