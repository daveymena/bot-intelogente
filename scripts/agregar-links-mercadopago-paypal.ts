import { db } from '../src/lib/db'

/**
 * Script para agregar links de Mercado Pago y PayPal a los megapacks
 * 
 * LINKS REALES:
 * - Megapacks individuales ($20.000): Necesitas crear links en Mercado Pago y PayPal
 * - Megapack completo ($60.000): Ya existen
 */

async function agregarLinksMercadoPagoPayPal() {
  try {
    console.log('💳 Agregando links de Mercado Pago y PayPal a megapacks...\n')

    // OPCIÓN 1: Usar los links existentes del megapack completo para todos
    const MERCADOPAGO_LINK_COMPLETO = 'https://mpago.li/32cJgK3'
    const PAYPAL_LINK_COMPLETO = 'https://www.paypal.com/invoice/p/#INV2-U2K8-6UU6-HMTD-NETG'

    // OPCIÓN 2: Crear links específicos para megapacks individuales
    // Necesitarías crear estos links en tu cuenta de Mercado Pago y PayPal
    const MERCADOPAGO_LINK_INDIVIDUAL = 'https://mpago.li/2Ld7Yx8' // Ejemplo - reemplazar con tu link real
    const PAYPAL_LINK_INDIVIDUAL = 'https://www.paypal.com/invoice/p/#INV2-MEGA-INDIVIDUAL' // Ejemplo - reemplazar

    console.log('📋 Links disponibles:')
    console.log(`   Mercado Pago (completo): ${MERCADOPAGO_LINK_COMPLETO}`)
    console.log(`   PayPal (completo): ${PAYPAL_LINK_COMPLETO}`)
    console.log(`   Mercado Pago (individual): ${MERCADOPAGO_LINK_INDIVIDUAL}`)
    console.log(`   PayPal (individual): ${PAYPAL_LINK_INDIVIDUAL}\n`)

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

      // Determinar si es megapack completo o individual
      const esMegapackCompleto = megapack.name.toLowerCase().includes('completo') || 
                                 megapack.price >= 60000

      // Agregar links según el tipo
      const newTags = [
        ...cleanTags,
        esMegapackCompleto 
          ? `mercadopago:${MERCADOPAGO_LINK_COMPLETO}`
          : `mercadopago:${MERCADOPAGO_LINK_INDIVIDUAL}`,
        esMegapackCompleto
          ? `paypal:${PAYPAL_LINK_COMPLETO}`
          : `paypal:${PAYPAL_LINK_INDIVIDUAL}`
      ]

      await db.product.update({
        where: { id: megapack.id },
        data: {
          tags: JSON.stringify(newTags)
        }
      })

      console.log(`✅ ${megapack.name}`)
      console.log(`   Precio: $${megapack.price.toLocaleString()}`)
      console.log(`   Tipo: ${esMegapackCompleto ? 'Completo' : 'Individual'}`)
      console.log(`   Mercado Pago: ${esMegapackCompleto ? MERCADOPAGO_LINK_COMPLETO : MERCADOPAGO_LINK_INDIVIDUAL}`)
      console.log(`   PayPal: ${esMegapackCompleto ? PAYPAL_LINK_COMPLETO : PAYPAL_LINK_INDIVIDUAL}\n`)

      actualizados++
    }

    console.log(`\n✅ ${actualizados} megapacks actualizados con links de Mercado Pago y PayPal`)
    
    console.log('\n📝 IMPORTANTE:')
    console.log('   Los links de ejemplo para megapacks individuales deben ser reemplazados')
    console.log('   con tus links reales de Mercado Pago y PayPal.')
    console.log('\n   Para crear links reales:')
    console.log('   1. Mercado Pago: https://www.mercadopago.com.co/tools/create')
    console.log('   2. PayPal: https://www.paypal.com/invoice/create')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

agregarLinksMercadoPagoPayPal()
