import { db } from '../src/lib/db'

/**
 * Script SIMPLE para agregar links de pago a megapacks
 * Usa el mismo link de Mercado Pago y PayPal para todos los de $20.000
 */

async function agregarLinksMegapacksSimple() {
  try {
    console.log('💳 Agregando links de Mercado Pago y PayPal a megapacks...\n')

    // LINKS REALES EXISTENTES
    const LINKS = {
      // Para megapacks de $20.000 (individuales)
      individual: {
        mercadopago: 'https://mpago.li/2Ld7Yx8', // Link para $20.000
        paypal: 'https://www.paypal.com/ncp/payment/FWLWBJWBFBWHN' // Link para $20.000
      },
      // Para megapack completo de $60.000
      completo: {
        mercadopago: 'https://mpago.li/32cJgK3', // Link existente
        paypal: 'https://www.paypal.com/invoice/p/#INV2-U2K8-6UU6-HMTD-NETG' // Link existente
      }
    }

    console.log('📋 Links configurados:')
    console.log(`\n   💰 Para megapacks de $20.000:`)
    console.log(`      Mercado Pago: ${LINKS.individual.mercadopago}`)
    console.log(`      PayPal: ${LINKS.individual.paypal}`)
    console.log(`\n   💰 Para megapack completo de $60.000:`)
    console.log(`      Mercado Pago: ${LINKS.completo.mercadopago}`)
    console.log(`      PayPal: ${LINKS.completo.paypal}\n`)

    // Obtener todos los megapacks
    const megapacks = await db.product.findMany({
      where: {
        name: {
          contains: 'Mega Pack'
        }
      }
    })

    console.log(`📦 Encontrados ${megapacks.length} megapacks\n`)

    let actualizados = 0

    for (const megapack of megapacks) {
      const tags = megapack.tags ? JSON.parse(megapack.tags) : []
      
      // Limpiar links antiguos de Mercado Pago y PayPal
      const cleanTags = tags.filter((tag: string) => 
        !tag.startsWith('mercadopago:') && 
        !tag.startsWith('paypal:')
      )

      // Determinar qué links usar según el precio
      const esCompleto = megapack.price >= 60000
      const linksAUsar = esCompleto ? LINKS.completo : LINKS.individual

      // Agregar links
      const newTags = [
        ...cleanTags,
        `mercadopago:${linksAUsar.mercadopago}`,
        `paypal:${linksAUsar.paypal}`
      ]

      await db.product.update({
        where: { id: megapack.id },
        data: {
          tags: JSON.stringify(newTags)
        }
      })

      console.log(`✅ ${megapack.name}`)
      console.log(`   💰 $${megapack.price.toLocaleString()} COP`)
      console.log(`   📱 Mercado Pago: ${linksAUsar.mercadopago}`)
      console.log(`   💳 PayPal: ${linksAUsar.paypal}\n`)

      actualizados++
    }

    console.log(`\n✅ ${actualizados} megapacks actualizados`)
    console.log('\n📝 Ahora todos los megapacks tienen:')
    console.log('   ✅ Nequi: 313 617 4267')
    console.log('   ✅ Payco: https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf')
    console.log('   ✅ Mercado Pago: Link real')
    console.log('   ✅ PayPal: Link real')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

agregarLinksMegapacksSimple()
