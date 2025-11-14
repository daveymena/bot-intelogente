/**
 * Script para verificar los links de pago del curso de piano
 * Ejecutar: npx tsx scripts/verificar-piano-links.ts
 */

import { db } from '../src/lib/db'

async function main() {
  console.log('🔍 Verificando producto: Curso de Piano\n')
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

  console.log('\n✅ Producto encontrado:\n')
  console.log(`📦 Nombre: ${product.name}`)
  console.log(`💰 Precio: ${product.price} COP`)
  console.log(`📁 Categoría: ${product.category}`)
  console.log(`🏷️  Tags: ${product.tags || 'Sin tags'}`)
  console.log(`📝 Descripción: ${product.description?.substring(0, 100)}...`)

  console.log('\n' + '='.repeat(60))
  console.log('\n💳 MÉTODOS DE PAGO CONFIGURADOS:\n')

  // Verificar campos de pago
  const paymentFields = {
    'Hotmart Link': product.hotmartLink,
    'PayPal Link': product.paypalLink,
    'MercadoPago Link': product.mercadoPagoLink,
    'Payment Methods': product.paymentMethods
  }

  let hasAnyLink = false

  for (const [field, value] of Object.entries(paymentFields)) {
    if (value) {
      console.log(`✅ ${field}: ${value}`)
      hasAnyLink = true
    } else {
      console.log(`❌ ${field}: No configurado`)
    }
  }

  console.log('\n' + '='.repeat(60))

  if (hasAnyLink) {
    console.log('\n✅ El producto tiene links de pago configurados')
    console.log('\n📝 RESPUESTA QUE DEBERÍA GENERAR EL BOT:\n')
    
    let response = `¡Perfecto! Aquí están los métodos de pago para ${product.name} 🎹\n\n`
    response += `💰 Precio: ${product.price.toLocaleString('es-CO')} COP\n\n`

    if (product.hotmartLink) {
      response += `1️⃣ **HOTMART** (Recomendado)\n`
      response += `   🔗 ${product.hotmartLink}\n\n`
    }

    if (product.mercadoPagoLink) {
      response += `2️⃣ **MERCADO PAGO**\n`
      response += `   🔗 ${product.mercadoPagoLink}\n\n`
    }

    if (product.paypalLink) {
      response += `3️⃣ **PAYPAL**\n`
      response += `   🔗 ${product.paypalLink}\n\n`
    }

    response += `✨ Elige el método que prefieras y completa tu compra de forma segura.`

    console.log(response)
  } else {
    console.log('\n❌ El producto NO tiene links de pago configurados')
    console.log('\n💡 SOLUCIÓN:')
    console.log('   1. Ve al dashboard')
    console.log('   2. Edita el producto "Curso de Piano"')
    console.log('   3. Agrega los links en los campos:')
    console.log('      - hotmartLink')
    console.log('      - mercadoPagoLink')
    console.log('      - paypalLink')
  }

  console.log('\n' + '='.repeat(60))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
