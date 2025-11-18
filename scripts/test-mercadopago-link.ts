/**
 * 🧪 TEST: Generación de Links de MercadoPago
 * Verifica que los links dinámicos se estén creando correctamente
 */

import { PaymentLinkGenerator } from '../src/lib/payment-link-generator'
import { BotPaymentLinkGenerator } from '../src/lib/bot-payment-link-generator'
import { db } from '../src/lib/db'

async function testMercadoPagoLinks() {
  console.log('🧪 INICIANDO TEST DE LINKS DE MERCADOPAGO\n')
  console.log('═'.repeat(80))

  try {
    // ═══════════════════════════════════════════════════════════════════════════════
    // 1. VERIFICAR CONFIGURACIÓN
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log('\n📋 1. VERIFICANDO CONFIGURACIÓN')
    console.log('─'.repeat(80))
    
    const config = {
      MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN ? '✅ Configurado' : '❌ NO configurado',
      MERCADO_PAGO_PUBLIC_KEY: process.env.MERCADO_PAGO_PUBLIC_KEY ? '✅ Configurado' : '❌ NO configurado',
      MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN ? '✅ Configurado' : '❌ NO configurado',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '❌ NO configurado',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ NO configurado'
    }
    
    console.table(config)
    
    // Determinar qué variable usar
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      console.log('\n❌ ERROR: No hay Access Token de MercadoPago configurado')
      console.log('\n📝 SOLUCIÓN:')
      console.log('   Agregar en .env o Easypanel:')
      console.log('   MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...')
      return
    }
    
    console.log('\n✅ Access Token encontrado')
    console.log(`   Variable usada: ${process.env.MERCADO_PAGO_ACCESS_TOKEN ? 'MERCADO_PAGO_ACCESS_TOKEN' : 'MERCADOPAGO_ACCESS_TOKEN'}`)
    console.log(`   Longitud: ${accessToken.length} caracteres`)
    console.log(`   Prefijo: ${accessToken.substring(0, 15)}...`)

    // ═══════════════════════════════════════════════════════════════════════════════
    // 2. OBTENER PRODUCTO DE PRUEBA
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log('\n📦 2. OBTENIENDO PRODUCTO DE PRUEBA')
    console.log('─'.repeat(80))
    
    const producto = await db.product.findFirst({
      where: {
        status: 'AVAILABLE',
        category: 'DIGITAL' // Preferir productos digitales
      },
      orderBy: {
        price: 'asc' // El más barato para pruebas
      }
    })
    
    if (!producto) {
      console.log('❌ No hay productos disponibles para probar')
      return
    }
    
    console.log('✅ Producto encontrado:')
    console.log(`   ID: ${producto.id}`)
    console.log(`   Nombre: ${producto.name}`)
    console.log(`   Precio: ${producto.price.toLocaleString('es-CO')} COP`)
    console.log(`   Categoría: ${producto.category}`)

    // ═══════════════════════════════════════════════════════════════════════════════
    // 3. PROBAR PaymentLinkGenerator
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log('\n🔧 3. PROBANDO PaymentLinkGenerator.generateMercadoPagoLink()')
    console.log('─'.repeat(80))
    
    console.log('Llamando a la API de MercadoPago...')
    const startTime1 = Date.now()
    
    const mercadoPagoLink1 = await PaymentLinkGenerator.generateMercadoPagoLink(
      producto.name,
      producto.price,
      producto.id
    )
    
    const duration1 = Date.now() - startTime1
    
    if (mercadoPagoLink1) {
      console.log(`✅ Link generado exitosamente (${duration1}ms)`)
      console.log(`   ${mercadoPagoLink1}`)
      
      // Verificar formato del link
      if (mercadoPagoLink1.includes('mercadopago.com')) {
        console.log('   ✅ Formato correcto (contiene mercadopago.com)')
      } else {
        console.log('   ⚠️ Formato inesperado')
      }
      
      if (mercadoPagoLink1.includes('init_point') || mercadoPagoLink1.includes('checkout')) {
        console.log('   ✅ Es un link de checkout válido')
      }
    } else {
      console.log('❌ No se pudo generar el link')
      console.log('   Revisar logs anteriores para ver el error')
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 4. PROBAR BotPaymentLinkGenerator
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log('\n🤖 4. PROBANDO BotPaymentLinkGenerator.generatePaymentLinks()')
    console.log('─'.repeat(80))
    
    console.log('Generando todos los métodos de pago...')
    const startTime2 = Date.now()
    
    const paymentLinks = await BotPaymentLinkGenerator.generatePaymentLinks(
      producto.id,
      producto.userId,
      1
    )
    
    const duration2 = Date.now() - startTime2
    
    if (paymentLinks.success) {
      console.log(`✅ Links generados exitosamente (${duration2}ms)`)
      console.log('\n📋 Métodos disponibles:')
      
      if (paymentLinks.mercadoPagoLink) {
        console.log(`   ✅ MercadoPago: ${paymentLinks.mercadoPagoLink}`)
      } else {
        console.log('   ❌ MercadoPago: No generado')
      }
      
      if (paymentLinks.payPalLink) {
        console.log(`   ✅ PayPal: ${paymentLinks.payPalLink}`)
      } else {
        console.log('   ⚠️ PayPal: No configurado')
      }
      
      if (paymentLinks.nequiInfo) {
        console.log(`   ✅ Nequi: ${paymentLinks.nequiInfo}`)
      }
      
      if (paymentLinks.daviplataInfo) {
        console.log(`   ✅ Daviplata: ${paymentLinks.daviplataInfo}`)
      }
      
      console.log('\n📝 Mensaje generado:')
      console.log('─'.repeat(80))
      console.log(paymentLinks.message)
      console.log('─'.repeat(80))
    } else {
      console.log('❌ Error generando links')
      console.log(`   Mensaje: ${paymentLinks.message}`)
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 5. PROBAR LLAMADA DIRECTA A API DE MERCADOPAGO
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log('\n🌐 5. PROBANDO LLAMADA DIRECTA A API DE MERCADOPAGO')
    console.log('─'.repeat(80))
    
    console.log('Creando preferencia de pago...')
    
    const preference = {
      items: [
        {
          title: producto.name,
          quantity: 1,
          unit_price: producto.price,
          currency_id: 'COP'
        }
      ],
      external_reference: producto.id,
      statement_descriptor: 'Tecnovariedades',
      payment_methods: {
        installments: 12
      }
    }
    
    console.log('Preferencia:')
    console.log(JSON.stringify(preference, null, 2))
    
    const startTime3 = Date.now()
    
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(preference)
    })
    
    const duration3 = Date.now() - startTime3
    
    console.log(`\nRespuesta de MercadoPago (${duration3}ms):`)
    console.log(`   Status: ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('   ✅ Preferencia creada exitosamente')
      console.log(`   ID: ${data.id}`)
      console.log(`   Init Point: ${data.init_point}`)
      console.log(`   Sandbox Init Point: ${data.sandbox_init_point || 'N/A'}`)
      
      console.log('\n📊 Detalles de la preferencia:')
      console.log(`   Collector ID: ${data.collector_id}`)
      console.log(`   Client ID: ${data.client_id}`)
      console.log(`   Date Created: ${data.date_created}`)
      console.log(`   Expires: ${data.expires ? 'Sí' : 'No'}`)
      
    } else {
      const errorText = await response.text()
      console.log('   ❌ Error en la API')
      console.log(`   Respuesta: ${errorText}`)
      
      try {
        const errorJson = JSON.parse(errorText)
        console.log('\n📋 Detalles del error:')
        console.log(JSON.stringify(errorJson, null, 2))
      } catch (e) {
        // No es JSON
      }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // RESUMEN FINAL
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log('\n' + '═'.repeat(80))
    console.log('📊 RESUMEN DEL TEST')
    console.log('═'.repeat(80))
    
    console.log('\n✅ Tests completados:')
    console.log(`   1. Configuración: ${accessToken ? '✅' : '❌'}`)
    console.log(`   2. Producto de prueba: ${producto ? '✅' : '❌'}`)
    console.log(`   3. PaymentLinkGenerator: ${mercadoPagoLink1 ? '✅' : '❌'}`)
    console.log(`   4. BotPaymentLinkGenerator: ${paymentLinks.success ? '✅' : '❌'}`)
    console.log(`   5. API directa: ${response.ok ? '✅' : '❌'}`)
    
    if (mercadoPagoLink1 && paymentLinks.success && response.ok) {
      console.log('\n🎉 TODOS LOS TESTS PASARON')
      console.log('   El sistema de links dinámicos está funcionando correctamente')
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
testMercadoPagoLinks()
  .then(() => {
    console.log('\n✅ Test completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error ejecutando test:', error)
    process.exit(1)
  })
