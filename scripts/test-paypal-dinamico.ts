/**
 * 🧪 TEST: LINKS DINÁMICOS DE PAYPAL
 * Prueba la generación de links reales usando la API de PayPal
 */

import { PaymentLinkGenerator } from '../src/lib/payment-link-generator'
import { db } from '../src/lib/db'

async function testPayPalDinamico() {
  console.log('🧪 INICIANDO TEST DE PAYPAL DINÁMICO\n')
  console.log('=' .repeat(60))

  try {
    // 1. Verificar configuración
    console.log('\n📋 VERIFICANDO CONFIGURACIÓN:')
    console.log('   PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID ? '✅ Configurado' : '❌ No configurado')
    console.log('   PAYPAL_CLIENT_SECRET:', process.env.PAYPAL_CLIENT_SECRET ? '✅ Configurado' : '❌ No configurado')
    console.log('   PAYPAL_MODE:', process.env.PAYPAL_MODE || 'live (default)')
    console.log('   PAYPAL_EMAIL:', process.env.PAYPAL_EMAIL || '❌ No configurado')
    console.log('   COP_TO_USD_RATE:', process.env.COP_TO_USD_RATE || '4000 (default)')

    // 2. Buscar un producto de prueba
    console.log('\n🔍 BUSCANDO PRODUCTO DE PRUEBA...')
    const product = await db.product.findFirst({
      where: {
        status: 'AVAILABLE'
      }
    })

    if (!product) {
      console.log('❌ No se encontró ningún producto activo')
      return
    }

    console.log(`✅ Producto encontrado: ${product.name}`)
    console.log(`   ID: ${product.id}`)
    console.log(`   Precio: ${product.price.toLocaleString('es-CO')} COP`)

    // 3. Generar link de PayPal
    console.log('\n💳 GENERANDO LINK DE PAYPAL...')
    console.log('=' .repeat(60))
    
    const paypalLink = await PaymentLinkGenerator.generatePayPalLink(
      product.name,
      product.price,
      product.id
    )

    console.log('\n📊 RESULTADO:')
    console.log('=' .repeat(60))
    
    if (paypalLink) {
      console.log('✅ Link generado exitosamente!')
      console.log(`\n🔗 Link de PayPal:\n${paypalLink}\n`)
      
      // Verificar si es un link dinámico o fallback
      if (paypalLink.includes('paypal.com/checkoutnow') || paypalLink.includes('paypal.com/checkout')) {
        console.log('✅ Es un link DINÁMICO (API REST v2)')
        console.log('   El link crea una orden real en PayPal')
      } else if (paypalLink.includes('paypal.me')) {
        console.log('⚠️ Es un link FALLBACK (PayPal.me)')
        console.log('   Requiere que el usuario ingrese el monto manualmente')
      } else if (paypalLink.includes('paypal.com/ncp/payment')) {
        console.log('⚠️ Es un link FALLBACK (Email)')
        console.log('   Requiere que el usuario ingrese el monto manualmente')
      }
    } else {
      console.log('❌ No se pudo generar el link de PayPal')
      console.log('   Verifica que tengas configurado:')
      console.log('   - PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET (para API)')
      console.log('   - O PAYPAL_EMAIL / PAYPAL_ME_USERNAME (para fallback)')
    }

    // 4. Generar todos los métodos de pago
    console.log('\n💰 GENERANDO TODOS LOS MÉTODOS DE PAGO...')
    console.log('=' .repeat(60))
    
    const paymentLinks = await PaymentLinkGenerator.generatePaymentLinks(product.id)

    if (paymentLinks) {
      console.log('\n✅ Métodos de pago generados:')
      console.log(`   Nequi: ${paymentLinks.methods.nequi}`)
      console.log(`   Daviplata: ${paymentLinks.methods.daviplata}`)
      console.log(`   MercadoPago: ${paymentLinks.methods.mercadopago ? '✅ Generado' : '❌ No disponible'}`)
      console.log(`   PayPal: ${paymentLinks.methods.paypal ? '✅ Generado' : '❌ No disponible'}`)
      
      if (paymentLinks.methods.paypal) {
        console.log(`\n🔗 Link de PayPal:\n${paymentLinks.methods.paypal}`)
      }
    }

    console.log('\n' + '=' .repeat(60))
    console.log('✅ TEST COMPLETADO')
    console.log('=' .repeat(60))

  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar test
testPayPalDinamico()
