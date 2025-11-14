/**
 * 🧪 PRUEBA: Generación de Links de Pago
 */

import { PaymentLinkGenerator } from '../src/lib/payment-link-generator'
import { db } from '../src/lib/db'

async function testPaymentLinks() {
  console.log('💳 PRUEBA DE GENERACIÓN DE LINKS DE PAGO\n')
  console.log('=' .repeat(70))

  // Obtener algunos productos
  const products = await db.product.findMany({
    where: { status: 'AVAILABLE' },
    take: 3
  })

  if (products.length === 0) {
    console.log('❌ No hay productos disponibles')
    return
  }

  console.log(`\n✅ Encontrados ${products.length} productos para probar\n`)

  for (const product of products) {
    console.log('\n' + '─'.repeat(70))
    console.log(`\n📦 PRODUCTO: ${product.name}`)
    console.log(`💰 Precio: ${product.price.toLocaleString('es-CO')} COP`)
    console.log(`📁 Categoría: ${product.category}`)
    
    console.log('\n🔄 Generando links de pago...')

    try {
      const paymentLinks = await PaymentLinkGenerator.generatePaymentLinks(product.id)

      if (!paymentLinks) {
        console.log('❌ No se pudieron generar los links')
        continue
      }

      console.log('\n✅ LINKS GENERADOS:')
      console.log('\n1️⃣ Nequi/Daviplata:')
      console.log(`   📱 ${paymentLinks.methods.nequi}`)

      if (paymentLinks.methods.mercadopago) {
        console.log('\n2️⃣ MercadoPago:')
        console.log(`   💳 ${paymentLinks.methods.mercadopago}`)
      } else {
        console.log('\n2️⃣ MercadoPago:')
        console.log(`   ⚠️  No configurado (falta MERCADOPAGO_ACCESS_TOKEN en .env)`)
      }

      if (paymentLinks.methods.paypal) {
        console.log('\n3️⃣ PayPal:')
        console.log(`   🌎 ${paymentLinks.methods.paypal}`)
      } else {
        console.log('\n3️⃣ PayPal:')
        console.log(`   ⚠️  No configurado (falta PAYPAL_CLIENT_ID en .env)`)
      }

      console.log('\n4️⃣ Transferencia:')
      console.log(`   🏦 ${paymentLinks.methods.transferencia?.banco}`)
      console.log(`   📋 ${paymentLinks.methods.transferencia?.cuenta}`)

      console.log('\n📝 INSTRUCCIONES PARA WHATSAPP:')
      console.log('─'.repeat(70))
      console.log(paymentLinks.instructions)
      console.log('─'.repeat(70))

      // Probar respuesta según método
      console.log('\n🧪 PROBANDO RESPUESTAS POR MÉTODO:')
      
      const methods = ['nequi', 'tarjeta', 'paypal', 'transferencia']
      for (const method of methods) {
        console.log(`\n📱 Cliente elige: "${method}"`)
        const response = PaymentLinkGenerator.generateMethodResponse(method, paymentLinks)
        console.log('─'.repeat(70))
        console.log(response)
        console.log('─'.repeat(70))
      }

    } catch (error) {
      console.error('❌ Error:', error)
    }
  }

  console.log('\n\n' + '='.repeat(70))
  console.log('\n✅ PRUEBAS COMPLETADAS')
  console.log('\n💡 NOTAS:')
  console.log('   - Si MercadoPago/PayPal no están configurados, solo verás Nequi y Transferencia')
  console.log('   - Configura las credenciales en .env para habilitar todos los métodos')
  console.log('   - Los links de MercadoPago/PayPal son dinámicos y se generan en tiempo real')
  console.log('\n' + '='.repeat(70))
}

// Ejecutar
testPaymentLinks()
  .then(() => {
    console.log('\n✅ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
