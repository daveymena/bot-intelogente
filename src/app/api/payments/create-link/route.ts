import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { productId, productName, price, description, quantity, method } = await request.json()

    console.log('Creating payment link:', { method, productName, price, quantity })

    let paymentLink = '#'

    switch (method) {
      case 'mercadopago':
        paymentLink = await createMercadoPagoLink(productName, price, description, quantity)
        break
      case 'paypal':
        paymentLink = await createPayPalLink(productName, price, description, quantity)
        break
      case 'whatsapp':
        paymentLink = createWhatsAppLink(productName, price, quantity)
        break
      default:
        return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

    console.log('Payment link created:', paymentLink)
    return NextResponse.json({ paymentLink })
  } catch (error) {
    console.error('Error creating payment link:', error)
    return NextResponse.json({ 
      error: 'Failed to create payment link',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// MercadoPago
async function createMercadoPagoLink(
  name: string, 
  price: number, 
  description: string, 
  quantity: number
): Promise<string> {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      console.error('MercadoPago access token not configured')
      return '#'
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'
    
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        items: [{
          title: name,
          description: description || name,
          quantity: quantity,
          unit_price: price,
          currency_id: 'COP'
        }],
        back_urls: {
          success: `${appUrl}/payment/success`,
          failure: `${appUrl}/payment/failure`,
          pending: `${appUrl}/payment/pending`
        },
        notification_url: `${appUrl}/api/payments/webhook`
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('MercadoPago API error:', error)
      return '#'
    }

    const data = await response.json()
    console.log('MercadoPago response:', data)
    return data.init_point || '#'
  } catch (error) {
    console.error('Error creating MercadoPago link:', error)
    return '#'
  }
}

// PayPal
async function createPayPalLink(
  name: string, 
  price: number, 
  description: string, 
  quantity: number
): Promise<string> {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET
    
    if (!clientId || !clientSecret) {
      console.error('PayPal credentials not configured')
      return '#'
    }

    // Get access token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const tokenResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })

    if (!tokenResponse.ok) {
      console.error('PayPal token error')
      return '#'
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Create order
    const totalUSD = (price * quantity / 4000).toFixed(2)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'
    
    const orderResponse = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: 'TECNOVARIEDADES',
          description: `${name} x${quantity}`,
          custom_id: `PROD-${Date.now()}`,
          soft_descriptor: 'TECNOVARIEDADES',
          amount: {
            currency_code: 'USD',
            value: totalUSD,
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: totalUSD
              }
            }
          },
          items: [{
            name: name.substring(0, 127), // PayPal limit
            description: (description || name).substring(0, 127),
            unit_amount: {
              currency_code: 'USD',
              value: (price / 4000).toFixed(2)
            },
            quantity: quantity.toString()
          }]
        }],
        application_context: {
          brand_name: 'Tecnovariedades D&S',
          locale: 'es-CO',
          landing_page: 'BILLING',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${appUrl}/payment/success`,
          cancel_url: `${appUrl}/payment/failure`
        }
      })
    })

    if (!orderResponse.ok) {
      const error = await orderResponse.json()
      console.error('PayPal order error:', error)
      return '#'
    }

    const orderData = await orderResponse.json()
    console.log('PayPal response:', orderData)
    const approveLink = orderData.links?.find((link: any) => link.rel === 'approve')
    return approveLink?.href || '#'
  } catch (error) {
    console.error('Error creating PayPal link:', error)
    return '#'
  }
}

// WhatsApp
function createWhatsAppLink(name: string, price: number, quantity: number): string {
  const phone = '573005560186'
  const total = price * quantity
  const message = `Hola Tecnovariedades D&S! Me interesa este producto:\n\n` +
    `📦 ${name}\n` +
    `💰 Precio: $${total.toLocaleString('es-CO')}\n` +
    `📊 Cantidad: ${quantity}\n\n` +
    `¿Está disponible?`

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

