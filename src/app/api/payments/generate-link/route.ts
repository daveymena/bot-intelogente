import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, productName, amount, quantity, method } = body

    if (method === 'mercadopago') {
      return await generateMercadoPagoLink(productId, productName, amount, quantity)
    } else if (method === 'paypal') {
      return await generatePayPalLink(productId, productName, amount, quantity)
    }

    return NextResponse.json({ success: false, error: 'Método no soportado' }, { status: 400 })
  } catch (error) {
    console.error('[Payment API] Error:', error)
    return NextResponse.json({ success: false, error: 'Error generando link' }, { status: 500 })
  }
}

async function generateMercadoPagoLink(productId: string, productName: string, amount: number, quantity: number) {
  try {
    const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN

    if (!MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json({ success: false, error: 'MercadoPago no configurado' }, { status: 500 })
    }

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'

    const preference = {
      items: [
        {
          title: productName,
          quantity: quantity,
          unit_price: amount / quantity,
          currency_id: 'COP'
        }
      ],
      back_urls: {
        success: `${baseUrl}/payment/success`,
        failure: `${baseUrl}/payment/failure`,
        pending: `${baseUrl}/payment/pending`
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/payments/webhook`,
      external_reference: JSON.stringify({
        productId,
        quantity,
        type: 'product_purchase'
      })
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`
      },
      body: JSON.stringify(preference)
    })

    const data = await response.json()

    if (data.init_point) {
      return NextResponse.json({
        success: true,
        paymentUrl: data.init_point,
        preferenceId: data.id
      })
    }

    return NextResponse.json({ success: false, error: 'Error creando preferencia' }, { status: 500 })
  } catch (error) {
    console.error('[MercadoPago] Error:', error)
    return NextResponse.json({ success: false, error: 'Error con MercadoPago' }, { status: 500 })
  }
}

async function generatePayPalLink(productId: string, productName: string, amount: number, quantity: number) {
  try {
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
    const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return NextResponse.json({ success: false, error: 'PayPal no configurado' }, { status: 500 })
    }

    // Obtener access token
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
    const tokenResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    })

    const { access_token } = await tokenResponse.json()

    // Convertir COP a USD
    const priceUSD = (amount / 4000).toFixed(2)
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'

    // Crear orden
    const orderResponse = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            description: productName,
            amount: {
              currency_code: 'USD',
              value: priceUSD
            },
            custom_id: JSON.stringify({
              productId,
              quantity,
              type: 'product_purchase'
            })
          }
        ],
        application_context: {
          return_url: `${baseUrl}/payment/success`,
          cancel_url: `${baseUrl}/payment/failure`,
          brand_name: 'Smart Sales Bot',
          user_action: 'PAY_NOW'
        }
      })
    })

    const orderData = await orderResponse.json()
    const approveUrl = orderData.links?.find((link: any) => link.rel === 'approve')?.href

    if (approveUrl) {
      return NextResponse.json({
        success: true,
        paymentUrl: approveUrl,
        orderId: orderData.id
      })
    }

    return NextResponse.json({ success: false, error: 'Error creando orden' }, { status: 500 })
  } catch (error) {
    console.error('[PayPal] Error:', error)
    return NextResponse.json({ success: false, error: 'Error con PayPal' }, { status: 500 })
  }
}
