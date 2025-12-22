import { db } from '../src/lib/db'

/**
 * Quitar links inválidos de Mercado Pago y PayPal
 * Dejar solo Nequi y Payco que SÍ funcionan
 */

async function quitarLinksInvalidos() {
  try {
    console.log('🔧 Quitando links inválidos de Mercado Pago y PayPal...\n')

    const megapacks = await db.product.findMany({
      where: {
        name: {
          contains: 'Mega Pack'
        }
      }
    })

    console.log(`📦 Procesando ${megapacks.length} megapacks\n`)

    for (const megapack of megapacks) {
      const tags = megapack.tags ? JSON.parse(megapack.tags) : []
      
      // Quitar links de Mercado Pago y PayPal que no funcionan
      const cleanTags = tags.filter((tag: string) => 
        !tag.startsWith('mercadopago:') && 
        !tag.startsWith('paypal:')
      )

      // Verificar que tenga Nequi y Payco
      const tieneNequi = cleanTags.some((tag: string) => tag.startsWith('nequi:'))
      const tienePayco = cleanTags.some((tag: string) => tag.startsWith('payco:'))

      if (!tieneNequi) {
        cleanTags.push('nequi:3136174267')
      }
      if (!tienePayco) {
        cleanTags.push('payco:https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf')
      }

      await db.product.update({
        where: { id: megapack.id },
        data: {
          tags: JSON.stringify(cleanTags)
        }
      })

      console.log(`✅ ${megapack.name}`)
    }

    console.log(`\n✅ Links inválidos eliminados`)
    console.log('\n📝 Métodos de pago disponibles para megapacks:')
    console.log('   ✅ Nequi/Daviplata: 313 617 4267')
    console.log('   ✅ Payco (tarjeta): https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf')
    console.log('   ✅ Transferencia bancaria: Disponible')
    console.log('\n💡 Para agregar Mercado Pago y PayPal:')
    console.log('   1. Crea los links en tus cuentas de Mercado Pago y PayPal')
    console.log('   2. Edita el script agregar-links-megapacks-simple.ts con tus links reales')
    console.log('   3. Ejecuta el script nuevamente')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

quitarLinksInvalidos()
