#!/usr/bin/env npx tsx
/**
 * ACTUALIZAR PRODUCTOS DROPSHIPPING
 * - Contraentrega para todos
 * - Envío gratis
 */

import { db } from '@/lib/db'

async function actualizarDropshipping() {
  console.log('🚀 Actualizando productos dropshipping...\n')

  try {
    // Obtener todos los productos dropshipping
    const productos = await db.product.findMany({
      where: {
        source: 'DROPSHIPPING'
      }
    })

    console.log(`📦 Encontrados ${productos.length} productos dropshipping\n`)

    let actualizados = 0

    for (const producto of productos) {
      try {
        // Actualizar producto
        await db.product.update({
          where: { id: producto.id },
          data: {
            shippingMethod: 'CONTRAENTREGA',
            shippingCost: 0,
            freeShipping: true,
            paymentOnDelivery: true,
            description: (producto.description || '') + '\n\n✅ Envío gratis\n✅ Pago contraentrega'
          }
        })

        actualizados++
        console.log(`✅ ${producto.name}`)
        console.log(`   - Método: Contraentrega`)
        console.log(`   - Envío: Gratis`)
      } catch (error) {
        console.error(`❌ Error actualizando ${producto.name}:`, error)
      }
    }

    console.log(`\n✨ Actualizados ${actualizados}/${productos.length} productos`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

actualizarDropshipping()
