/**
 * Script para actualizar los links de pago del curso de piano
 * Ejecutar: npx tsx scripts/actualizar-links-piano.ts
 */

import { db } from '../src/lib/db'

async function main() {
  console.log('🎹 Actualizando links de pago del Curso de Piano\n')
  console.log('='.repeat(60))

  // Buscar el producto
  const products = await db.product.findMany()
  const product = products.find(p => 
    p.name.toLowerCase().includes('piano')
  )

  if (!product) {
    console.log('❌ No se encontró el producto "Curso de Piano"')
    return
  }

  console.log(`\n✅ Producto encontrado: ${product.name}`)
  console.log(`💰 Precio actual: ${product.price} COP\n`)

  // Links de pago (REEMPLAZA ESTOS CON TUS LINKS REALES)
  const paymentLinks = {
    hotmartLink: 'https://pay.hotmart.com/TU_LINK_HOTMART_AQUI',
    mercadoPagoLink: 'https://mpago.la/TU_LINK_MERCADOPAGO_AQUI',
    paypalLink: 'https://paypal.me/TU_LINK_PAYPAL_AQUI',
    paymentMethods: 'Hotmart, MercadoPago, PayPal, Nequi, Daviplata'
  }

  console.log('📝 Links a configurar:\n')
  console.log(`🔗 Hotmart: ${paymentLinks.hotmartLink}`)
  console.log(`🔗 MercadoPago: ${paymentLinks.mercadoPagoLink}`)
  console.log(`🔗 PayPal: ${paymentLinks.paypalLink}`)
  console.log(`💳 Métodos: ${paymentLinks.paymentMethods}`)

  console.log('\n⚠️  IMPORTANTE: Reemplaza los links arriba con tus links reales')
  console.log('   Edita este archivo (scripts/actualizar-links-piano.ts)')
  console.log('   y vuelve a ejecutarlo.\n')

  // Verificar si los links son reales o placeholders
  const hasRealLinks = !paymentLinks.hotmartLink.includes('TU_LINK')

  if (!hasRealLinks) {
    console.log('❌ Los links aún son placeholders.')
    console.log('   Por favor, actualiza el script con tus links reales.')
    console.log('\n💡 Ejemplo de links reales:')
    console.log('   hotmartLink: "https://pay.hotmart.com/A12345678"')
    console.log('   mercadoPagoLink: "https://mpago.la/1234567"')
    console.log('   paypalLink: "https://paypal.me/tuusuario/60"')
    return
  }

  // Actualizar el producto
  const updated = await db.product.update({
    where: { id: product.id },
    data: paymentLinks
  })

  console.log('\n' + '='.repeat(60))
  console.log('\n✅ ¡Links actualizados exitosamente!')
  console.log('\n📝 El bot ahora responderá con:\n')

  let response = `¡Perfecto! Aquí están los métodos de pago para ${updated.name} 🎹\n\n`
  response += `💰 Precio: ${updated.price.toLocaleString('es-CO')} COP\n\n`

  if (updated.hotmartLink) {
    response += `1️⃣ **HOTMART** (Recomendado)\n`
    response += `   🔗 ${updated.hotmartLink}\n\n`
  }

  if (updated.mercadoPagoLink) {
    response += `2️⃣ **MERCADO PAGO**\n`
    response += `   🔗 ${updated.mercadoPagoLink}\n\n`
  }

  if (updated.paypalLink) {
    response += `3️⃣ **PAYPAL**\n`
    response += `   🔗 ${updated.paypalLink}\n\n`
  }

  response += `✨ Elige el método que prefieras y completa tu compra de forma segura.`

  console.log(response)
  console.log('\n' + '='.repeat(60))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
