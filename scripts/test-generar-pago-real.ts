/**
 * 🧪 TEST: Generar Link de Pago REAL
 * 
 * Genera un link de pago real usando PayPal
 */

import { db } from '../src/lib/db'

async function testGenerarPagoReal() {
  console.log('🧪 GENERANDO LINK DE PAGO REAL\n')
  console.log('='.repeat(70))

  try {
    // 1. Obtener un producto de prueba de la base de datos
    console.log('\n📦 Buscando producto de prueba...')
    
    const producto = await db.product.findFirst({
      where: {
        status: 'AVAILABLE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!producto) {
      console.log('❌ No hay productos disponibles en la base de datos')
      console.log('💡 Agrega un producto desde el dashboard primero')
      return
    }

    console.log(`✅ Producto encontrado: ${producto.name}`)
    console.log(`   Precio: $${producto.price.toLocaleString('es-CO')} COP`)
    console.log(`   ID: ${producto.id}`)

    // 2. Generar link de PayPal
    console.log('\n💙 Generando link de PayPal...')
    
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
    const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      console.log('❌ PayPal no está configurado')
      console.log('💡 Configura PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET en .env')
      return
    }

    // Obtener token de acceso
    console.log('   🔑 Obteniendo token de acceso...')
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')

    const tokenResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    })

    if (!tokenResponse.ok) {
      console.log('❌ Error obteniendo token de PayPal')
      console.log('   Status:', tokenResponse.status)
      console.log('   Response:', await tokenResponse.text())
      return
    }

    const { access_token } = await tokenResponse.json()
    console.log('   ✅ Token obtenido')

    // Convertir COP a USD
    const priceUSD = (producto.price / 4000).toFixed(2)
    console.log(`   💱 Conversión: $${producto.price.toLocaleString('es-CO')} COP = $${priceUSD} USD`)

    // Crear orden de pago
    console.log('   📝 Creando orden de pago...')
    
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'

    const orderResponse = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            description: producto.name,
            amount: {
              currency_code: 'USD',
              value: priceUSD,
            },
            custom_id: JSON.stringify({
              productId: producto.id,
              productName: producto.name,
              type: 'test_purchase',
            }),
          },
        ],
        application_context: {
          return_url: `${baseUrl}/payment/success`,
          cancel_url: `${baseUrl}/payment/failure`,
          brand_name: 'Tecnovariedades D&S',
          user_action: 'PAY_NOW',
        },
      }),
    })

    if (!orderResponse.ok) {
      console.log('❌ Error creando orden de PayPal')
      console.log('   Status:', orderResponse.status)
      const errorText = await orderResponse.text()
      console.log('   Response:', errorText)
      return
    }

    const orderData = await orderResponse.json()
    const approveUrl = orderData.links?.find((link: any) => link.rel === 'approve')?.href

    if (!approveUrl) {
      console.log('❌ No se pudo obtener el link de aprobación')
      console.log('   Order Data:', JSON.stringify(orderData, null, 2))
      return
    }

    console.log('   ✅ Orden creada exitosamente')

    // 3. Mostrar resultado
    console.log('\n' + '='.repeat(70))
    console.log('✅ LINK DE PAGO REAL GENERADO')
    console.log('='.repeat(70))

    console.log('\n📦 Producto:')
    console.log(`   Nombre: ${producto.name}`)
    console.log(`   Precio: $${producto.price.toLocaleString('es-CO')} COP ($${priceUSD} USD)`)

    console.log('\n💙 Link de PayPal:')
    console.log(`   ${approveUrl}`)

    console.log('\n📋 Información de la Orden:')
    console.log(`   Order ID: ${orderData.id}`)
    console.log(`   Status: ${orderData.status}`)

    console.log('\n🧪 Para Probar:')
    console.log('   1. Copia el link de arriba')
    console.log('   2. Ábrelo en tu navegador')
    console.log('   3. Inicia sesión en PayPal (o usa tarjeta de prueba)')
    console.log('   4. Completa el pago')

    console.log('\n💳 Tarjetas de Prueba de PayPal:')
    console.log('   Visa: 4032039974960680')
    console.log('   Mastercard: 5425233430109903')
    console.log('   Fecha: Cualquier fecha futura')
    console.log('   CVV: 123')

    console.log('\n⚠️ NOTA: Este es un pago REAL en modo sandbox/producción')
    console.log('   Si estás en producción, se cobrará dinero real')
    console.log('   Si estás en sandbox, es solo una prueba')

    console.log('\n' + '='.repeat(70))

  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar
testGenerarPagoReal()
