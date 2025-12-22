import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📦 Datos recibidos:', JSON.stringify(body, null, 2));
    
    const { items, paymentMethod, metadata, customerInfo, total } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('❌ Items inválidos:', { items, hasItems: !!items, isArray: Array.isArray(items) });
      return NextResponse.json(
        { error: 'Items requeridos', received: body },
        { status: 400 }
      );
    }

    // Normalizar items del carrito al formato esperado
    const normalizedItems = items.map(item => ({
      id: item.id,
      title: item.name || item.title,
      description: item.description || '',
      quantity: item.quantity || 1,
      unit_price: item.price || item.unit_price,
      currency_id: item.currency || item.currency_id || 'COP'
    }));

    // Redirigir todos los métodos de pago locales a MercadoPago
    if (paymentMethod === 'mercadopago' || 
        paymentMethod === 'nequi' || 
        paymentMethod === 'daviplata' || 
        paymentMethod === 'bank' || 
        paymentMethod === 'cash' ||
        paymentMethod === 'transferencia') {
      const result = await createMercadoPagoPayment(normalizedItems, { ...metadata, customerInfo, total });
      const resultData = await result.json();
      return NextResponse.json({
        paymentUrl: resultData.init_point || resultData.sandbox_init_point,
        ...resultData
      });
    } else if (paymentMethod === 'paypal') {
      const result = await createPayPalPayment(normalizedItems, { ...metadata, customerInfo, total });
      const resultData = await result.json();
      return NextResponse.json({
        paymentUrl: resultData.approvalUrl,
        ...resultData
      });
    } else {
      return NextResponse.json(
        { error: 'Método de pago no válido' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear el pago' },
      { status: 500 }
    );
  }
}

async function createMercadoPagoPayment(items: any[], metadata?: any) {
  try {
    const preference = new Preference(mercadopago);

    const response = await preference.create({
      body: {
        items: items.map((item, index) => ({
          id: `item-${index}`,
          title: item.title,
          description: item.description || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: item.currency_id || 'COP',
        })),
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'}/payment/success?plan=${metadata?.planId || 'monthly'}`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'}/payment/failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'}/payment/pending`,
        },
        external_reference: metadata?.planId || 'membership',
        statement_descriptor: 'MEMBRESIA',
      }
    });

    return NextResponse.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    });
  } catch (error: any) {
    console.error('MercadoPago error:', error);
    throw new Error(`Error de Mercado Pago: ${error.message}`);
  }
}

async function createPayPalPayment(items: any[], metadata?: any) {
  try {
    // Determinar URL base según el modo
    const paypalMode = process.env.PAYPAL_MODE || 'sandbox';
    const paypalApiUrl = process.env.PAYPAL_API_URL || 
      (paypalMode === 'live' 
        ? 'https://api-m.paypal.com' 
        : 'https://api-m.sandbox.paypal.com');

    // Obtener token de acceso
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const tokenResponse = await fetch(
      `${paypalApiUrl}/v1/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      }
    );

    if (!tokenResponse.ok) {
      throw new Error('Error obteniendo token de PayPal');
    }

    const { access_token } = await tokenResponse.json();

    // Crear orden
    const orderResponse = await fetch(
      `${paypalApiUrl}/v2/checkout/orders`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: (items[0].unit_price / 4000).toFixed(2), // Conversión aproximada COP a USD
                breakdown: {
                  item_total: {
                    currency_code: 'USD',
                    value: (items[0].unit_price / 4000).toFixed(2),
                  },
                },
              },
              items: items.map(item => ({
                name: item.title,
                description: item.description || '',
                quantity: item.quantity.toString(),
                unit_amount: {
                  currency_code: 'USD',
                  value: (item.unit_price / 4000).toFixed(2),
                },
              })),
            },
          ],
          application_context: {
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'}/payment/success?plan=${metadata?.planId || 'monthly'}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'}/payment/failure`,
            brand_name: 'Tu Tienda',
            user_action: 'PAY_NOW',
          },
        }),
      }
    );

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      throw new Error(`Error de PayPal: ${JSON.stringify(errorData)}`);
    }

    const order = await orderResponse.json();
    const approvalUrl = order.links.find((link: any) => link.rel === 'approve')?.href;

    return NextResponse.json({
      id: order.id,
      approvalUrl,
    });
  } catch (error: any) {
    console.error('PayPal error:', error);
    throw new Error(`Error de PayPal: ${error.message}`);
  }
}

