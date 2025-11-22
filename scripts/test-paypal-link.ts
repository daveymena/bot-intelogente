/**
 * 🧪 TEST: Generación de Links de PayPal
 * Verifica que los links dinámicos de PayPal se estén creando correctamente
 */

import { PaymentLinkGenerator } from '../src/lib/payment-link-generator'
import { BotPaymentLinkGenerator } from '../src/lib/bot-payment-link-generator'
import { db } from '../src/lib/db'

async function testPayPalLinks() {
  console.log('🧪 INICIANDO TEST DE LINKS DE PAYPAL\n')
  console.log('═'.repeat(80))

  try {
    // ═══════════════════════════════════════════════════════════════════════════════
    // 1. VERIFICAR CONFIGURACIÓN
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log('\n📋 1. VERIFICANDO CONFIGURACIÓN DE PAYPAL')
    console.log('─'.repeat(80))
    
    const config = {
      PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID ? '✅ Configurado' : '❌ NO configurado',
      PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET ? '✅ Configurado' : '❌ NO configurado',
      PAYPAL_MODE: process.env.PAYPAL_MODE || 'live',
      PAYPAL_API_URL: process.env.PAYPAL_API_URL || 'https://api-m.paypal.com',
      COP_TO_USD_RATE: process.env.COP_TO_USD_RATE || '4000'
    }
    
    console.table(config)
    
    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET
    
    if (!clientId || !clientSecret) {
      console.log('\n❌ ERROR: PayPal no está configurado')
      console.log('\n📝 SOLUCIÓN:')
      console.log('   Agregar en .env o Easypanel:')
      console.log('   PAYPAL_CLIENT_ID=BAAtdQwVN8LvIoRstmHZWlo2ndcJBP8dFZdXLc8HJGdYUXstriO6mO0GJMZimkBCdZHotBkulELqeFm_R4')
      console.log('   PAYPAL_CLIENT_SECRET=EP5jZdzbUuHva4I8ERnbNYSHQ_BNe0niXQe91Bvf33Kl88nRKY-ivRx0_PGERS72JbjQSiMr63y9lEEL')
      console.log('   PAYPAL_MODE=live')
      return
    }
    
    console.log('\n✅ Credenciales de PayPal encontradas')
    console.log(`   Client ID: ${clientId.substring(0, 20)}...`)
    console.log(`   Client Secret: ${clientSecret.substring(0, 20)}...`)
    console.log(`   Mode: ${config.PAYPAL_MODE}`)

    // ═══════════════════════════════════════════════════════════════════════════════
    // 2. PROBAR AUTENTICACIÓN CON PAYPAL
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log('\n🔐 2. PROBANDO AUTENTICACIÓN CON PAYPAL')
    console.log('─'.repeat(80))
    
    const authUrl = config.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com/v1/oauth2/token'
      : 'https://api-m.sandbox.paypal.com/v1/oauth2/token'
    
    console.log(`URL de autenticación: ${authUrl}`)
    
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    
    const startTime1 = Date.now()
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    })
    const duration1 = Date.now() - startTime1
    
    console.log(`\nRespuesta de autenticación (${duration1}ms):`)
    console.log(`   Status: ${authResponse.status} ${authResponse.statusText}`)
    
    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      console.log('   ❌ Error de autenticación')
      console.log(`   Respuesta: ${errorText}`)
      
      console.log('\n⚠️ POSIBLES CAUSAS:')
      console.log('   1. Client ID o Client Secret incorrectos')
      console.log('   2. Credenciales de sandbox en modo live (o viceversa)')
      console.log('   3. Credenciales expiradas o revocadas')
      return
    }
    
    const authData = await authResponse.json()
    console.log('   ✅ Autenticación exitosa')
    console.log(`   Access Token: ${authData.access_token.substring(0, 30)}...`)
    console.log(`   Token Type: ${authData.token_type}`)
    console.log(`   Expires In: ${authData.expires_in} segundos`)
    console.log(`   Scope: ${authData.scope}`)

    // ═══════════════════════════════════════════════════════════════════════════════
    // 3. OBTENER PRODUCTO DE PRUEBA
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log('\n📦 3. OBTENIENDO PRODUCTO DE PRUEBA')
    console.log('─'.repeat(80))
    
    const producto = await db.product.findFirst({
      where: {
        status: 'AVAILABLE',
        category: 'DIGITAL'
      },
      orderBy: {
        price: 'asc'
      }
    })
    
    if (!producto) {
      console.log('❌ No hay productos disponibles para probar')
      return
    }
    
    console.log('✅ Producto encontrado:')
    console.log(`   ID: ${producto.id}`)
    console.log(`   Nombre: ${producto.name}`)
    console.log(`   Precio COP: ${producto.price.toLocaleString('es-CO')}`)
    
    const exchangeRate = parseFloat(process.env.COP_TO_USD_RATE || '4000')
    const priceUSD = (producto.price / exchangeRate).toFixed(2)
    console.log(`   Precio USD: $${priceUSD} (tasa: ${exchangeRate})`)

    // ═══════════════════════════════════════════════════════════════════════════════
    // 4. CREAR ORDEN EN PAYPAL
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log('\n💳 4. CREANDO ORDEN EN PAYPAL')
    console.log('─'.repeat(80))
    
    const orderUrl = config.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com/v2/checkout/orders'
      : 'https://api-m.sandbox.paypal.com/v2/checkout/orders'
    
    console.log(`URL de órdenes: ${orderUrl}`)
    
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: producto.id,
          description: producto.name,
          amount: {
            currency_code: 'USD',
            value: priceUSD
          }
        }
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/cancel`,
        brand_name: 'Tecnovariedades D&S',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW'
      }
    }
    
    console.log('\nDatos de la orden:')
    console.log(JSON.stringify(orderData, null, 2))
    
    const startTime2 = Date.now()
    const orderResponse = await fetch(orderUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`
      },
      body: JSON.stringify(orderData)
    })
    const duration2 = Date.now() - startTime2
    
    console.log(`\nRespuesta de PayPal (${duration2}ms):`)
    console.log(`   Status: ${orderResponse.status} ${orderResponse.statusText}`)
    
    if (!orderResponse.ok) {
      const errorText = await orderResponse.text()
      console.log('   ❌ Error creando orden')
      console.log(`   Respuesta: ${errorText}`)
      
      try {
        const errorJson = JSON.parse(errorText)
        console.log('\n📋 Detalles del error:')
        console.log(JSON.stringify(errorJson, null, 2))
      } catch (e) {
        // No es JSON
      }
      return
    }
    
    const orderResult = await orderResponse.json()
    console.log('   ✅ Orden creada exitosamente')
    console.log(`   Order ID: ${orderResult.id}`)
    console.log(`   Status: ${orderResult.status}`)
    
    // Buscar link de aprobación
    const approveLink = orderResult.links?.find((link: any) => link.rel === 'approve')?.href
    
    if (approveLink) {
      console.log(`   ✅ Link de pago generado:`)
      console.log(`   ${approveLink}`)
    } else {
      console.log('   ❌ No se encontró link de aprobación')
    }
    
    console.log('\n📊 Detalles de la orden:')
    console.log(`   Create Time: ${orderResult.create_time}`)
    console.log(`   Intent: ${orderResult.intent}`)
    console.log(`   Payer: ${orderResult.payer ? 'Configurado' : 'Pendiente'}`)

    // ═══════════════════════════════════════════════════════════════════════════════
    // 5. PROBAR PaymentLinkGenerator
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log('\n🔧 5. PROBANDO PaymentLinkGenerator.generatePayPalLink()')
    console.log('─'.repeat(80))
    
    const startTime3 = Date.now()
    const paypalLink = await PaymentLinkGenerator.generatePayPalLink(
      producto.name,
      producto.price,
      producto.id
    )
    const duration3 = Date.now() - startTime3
    
    if (paypalLink) {
      console.log(`✅ Link generado exitosamente (${duration3}ms)`)
      console.log(`   ${paypalLink}`)
      
      if (paypalLink.includes('paypal.com')) {
        console.log('   ✅ Formato correcto (contiene paypal.com)')
      }
      
      if (paypalLink.includes('checkoutnow') || paypalLink.includes('checkout')) {
        console.log('   ✅ Es un link de checkout válido')
      }
    } else {
      console.log('❌ No se pudo generar el link')
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 6. PROBAR BotPaymentLinkGenerator
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log('\n🤖 6. PROBANDO BotPaymentLinkGenerator.generatePaymentLinks()')
    console.log('─'.repeat(80))
    
    const startTime4 = Date.now()
    const paymentLinks = await BotPaymentLinkGenerator.generatePaymentLinks(
      producto.id,
      producto.userId,
      1
    )
    const duration4 = Date.now() - startTime4
    
    if (paymentLinks.success) {
      console.log(`✅ Links generados exitosamente (${duration4}ms)`)
      console.log('\n📋 Métodos disponibles:')
      
      if (paymentLinks.mercadoPagoLink) {
        console.log(`   ✅ MercadoPago: ${paymentLinks.mercadoPagoLink}`)
      }
      
      if (paymentLinks.payPalLink) {
        console.log(`   ✅ PayPal: ${paymentLinks.payPalLink}`)
      } else {
        console.log('   ❌ PayPal: No generado')
      }
      
      if (paymentLinks.nequiInfo) {
        console.log(`   ✅ Nequi: ${paymentLinks.nequiInfo}`)
      }
      
      if (paymentLinks.daviplataInfo) {
        console.log(`   ✅ Daviplata: ${paymentLinks.daviplataInfo}`)
      }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // RESUMEN FINAL
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log('\n' + '═'.repeat(80))
    console.log('📊 RESUMEN DEL TEST')
    console.log('═'.repeat(80))
    
    console.log('\n✅ Tests completados:')
    console.log(`   1. Configuración: ${clientId && clientSecret ? '✅' : '❌'}`)
    console.log(`   2. Autenticación: ${authResponse.ok ? '✅' : '❌'}`)
    console.log(`   3. Producto de prueba: ${producto ? '✅' : '❌'}`)
    console.log(`   4. Crear orden: ${orderResponse.ok ? '✅' : '❌'}`)
    console.log(`   5. PaymentLinkGenerator: ${paypalLink ? '✅' : '❌'}`)
    console.log(`   6. BotPaymentLinkGenerator: ${paymentLinks.success && paymentLinks.payPalLink ? '✅' : '❌'}`)
    
    if (authResponse.ok && orderResponse.ok && paypalLink && paymentLinks.payPalLink) {
      console.log('\n🎉 TODOS LOS TESTS PASARON')
      console.log('   El sistema de links dinámicos de PayPal está funcionando correctamente')
      console.log('\n📝 LINK DE PRUEBA:')
      console.log(`   ${approveLink}`)
      console.log('\n⚠️ NOTA: Este es un link real de PayPal')
      console.log('   Puedes hacer click para probar el flujo de pago')
      console.log('   (No es necesario completar el pago)')
    } else {
      console.log('\n⚠️ ALGUNOS TESTS FALLARON')
      console.log('   Revisar los logs anteriores para identificar el problema')
    }
    
  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:', error)
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message)
      console.error('   Stack:', error.stack)
    }
  }
}

// Ejecutar
testPayPalLinks()
  .then(() => {
    console.log('\n✅ Test completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error ejecutando test:', error)
    process.exit(1)
  })
