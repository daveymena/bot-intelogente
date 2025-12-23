/**
 * Test de generación de links de PayPal
 * Verifica que las credenciales funcionen y se generen links correctamente
 */

import { config } from 'dotenv'
config()

async function testPayPalLink() {
  console.log('🔵 TEST DE PAYPAL - Verificación de Links\n')
  console.log('=' .repeat(50))
  
  // 1. Verificar credenciales
  console.log('\n📋 1. Verificando credenciales...')
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const mode = process.env.PAYPAL_MODE || 'sandbox'
  
  console.log(`   PAYPAL_CLIENT_ID: ${clientId ? clientId.substring(0, 20) + '...' : '❌ NO CONFIGURADO'}`)
  console.log(`   PAYPAL_CLIENT_SECRET: ${clientSecret ? clientSecret.substring(0, 10) + '...' : '❌ NO CONFIGURADO'}`)
  console.log(`   PAYPAL_MODE: ${mode}`)
  
  if (!clientId || !clientSecret) {
    console.log('\n❌ ERROR: Credenciales de PayPal no configuradas')
    console.log('   Configura PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET en .env')
    return
  }
  
  // 2. Obtener token de acceso
  console.log('\n📋 2. Obteniendo token de acceso...')
  
  const authUrl = mode === 'live'
    ? 'https://api-m.paypal.com/v1/oauth2/token'
    : 'https://api-m.sandbox.paypal.com/v1/oauth2/token'
  
  console.log(`   URL: ${authUrl}`)
  
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  
  try {
    const tokenResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    })
    
    console.log(`   Status: ${tokenResponse.status}`)
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.log(`\n❌ ERROR obteniendo token:`)
      console.log(`   ${errorText}`)
      return
    }
    
    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    console.log(`   ✅ Token obtenido: ${accessToken.substring(0, 30)}...`)
    
    // 3. Crear orden de prueba
    console.log('\n📋 3. Creando orden de prueba...')
    
    const orderUrl = mode === 'live'
      ? 'https://api-m.paypal.com/v2/checkout/orders'
      : 'https://api-m.sandbox.paypal.com/v2/checkout/orders'
    
    console.log(`   URL: ${orderUrl}`)
    
    // Producto de prueba
    const testProduct = {
      id: 'test-123',
      name: 'Producto de Prueba',
      description: 'Test de generación de link PayPal',
      price: 60000, // COP
      currency: 'COP'
    }
    
    // Convertir COP a USD
    const usdAmount = (testProduct.price / 4000).toFixed(2)
    console.log(`   Precio: ${testProduct.price} COP = ${usdAmount} USD`)
    
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: testProduct.id,
          description: testProduct.description,
          amount: {
            currency_code: 'USD',
            value: usdAmount
          }
        }
      ],
      application_context: {
        return_url: 'https://tecnovariedades.com/success',
        cancel_url: 'https://tecnovariedades.com/cancel',
        brand_name: 'Tecnovariedades D&S',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW'
      }
    }
    
    const orderResponse = await fetch(orderUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(orderData)
    })
    
    console.log(`   Status: ${orderResponse.status}`)
    
    if (!orderResponse.ok) {
      const errorText = await orderResponse.text()
      console.log(`\n❌ ERROR creando orden:`)
      console.log(`   ${errorText}`)
      
      // Parsear error para más detalles
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.details) {
          console.log('\n   Detalles del error:')
          errorJson.details.forEach((d: any) => {
            console.log(`   - ${d.issue}: ${d.description}`)
          })
        }
      } catch {}
      return
    }
    
    const orderResult = await orderResponse.json()
    console.log(`   ✅ Orden creada: ${orderResult.id}`)
    console.log(`   Status: ${orderResult.status}`)
    
    // Buscar link de aprobación
    const approveLink = orderResult.links?.find((link: any) => link.rel === 'approve')
    
    if (approveLink) {
      console.log(`\n✅ LINK DE PAGO GENERADO:`)
      console.log(`   ${approveLink.href}`)
      console.log(`\n   Este link se puede usar para pagar ${usdAmount} USD`)
    } else {
      console.log(`\n⚠️ No se encontró link de aprobación`)
      console.log(`   Links disponibles:`)
      orderResult.links?.forEach((link: any) => {
        console.log(`   - ${link.rel}: ${link.href}`)
      })
    }
    
  } catch (error: any) {
    console.log(`\n❌ ERROR de conexión:`)
    console.log(`   ${error.message}`)
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('Test completado')
}

testPayPalLink()
