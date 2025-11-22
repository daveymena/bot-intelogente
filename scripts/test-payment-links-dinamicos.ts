/**
 * 🧪 TEST: Links de pago dinámicos
 * Prueba la generación de links de MercadoPago y PayPal
 */

import { PaymentLinkGenerator } from '../src/lib/payment-link-generator'
import { db } from '../src/lib/db'

async function testPaymentLinks() {
  console.log('🧪 TEST: Links de Pago Dinámicos\n')

  try {
    // 1. Obtener un producto de prueba
    const product = await db.product.findFirst({
      where: { status: 'AVAILABLE' }
    })

    if (!product) {
      console.log('❌ No hay productos disponibles')
      return
    }

    console.log(`📦 Producto de prueba: ${product.name}`)
    console.log(`💰 Precio: ${product.price.toLocaleString('es-CO')} COP\n`)

    // 2. Generar links de pago
    console.log('🔄 Generando links de pago...\n')
    const paymentLinks = await PaymentLinkGenerator.generatePaymentLinks(product.id)

    if (!paymentLinks) {
      console.log('❌ Error generando links')
      return
    }

    // 3. Mostrar resultados
    console.log('✅ Links generados exitosamente:\n')
    console.log('📱 Nequi/Daviplata:', paymentLinks.methods.nequi)
    console.log('💳 MercadoPago:', paymentLinks.methods.mercadopago || '❌ No configurado')
    console.log('🌎 PayPal:', paymentLinks.methods.paypal || '❌ No configurado')
    console.log('\n📋 Instrucciones completas:\n')
    console.log(paymentLinks.instructions)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

testPaymentLinks()
