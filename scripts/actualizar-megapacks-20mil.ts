/**
 * 📸 ACTUALIZAR MEGAPACKS DE 20,000 COP
 * Todos los megapacks de 20,000 llevan la misma imagen
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// 🎯 IMAGEN PARA TODOS LOS MEGAPACKS DE 20,000 COP
// Esta es la imagen con el cubo/caja
const IMAGEN_MEGAPACK_20MIL = 'https://i.postimg.cc/Kz8Lh5Qy/megapack-20mil.jpg'

// 🎯 SI TIENES LA URL CORRECTA, REEMPLÁZALA AQUÍ:
// const IMAGEN_MEGAPACK_20MIL = 'https://tu-url-correcta.com/imagen-cubo.jpg'

async function actualizarMegapacks20Mil() {
  console.log('📸 ACTUALIZAR MEGAPACKS DE 20,000 COP\n')
  console.log('='.repeat(60))

  try {
    // 1. BUSCAR TODOS LOS MEGAPACKS DE 20,000
    console.log('\n🔍 Buscando megapacks de 20,000 COP...')
    
    const megapacks20mil = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: 'megapack', mode: 'insensitive' } },
          { name: { contains: 'mega pack', mode: 'insensitive' } },
          { name: { contains: 'pack', mode: 'insensitive' } }
        ],
        price: 20000
      },
      orderBy: { name: 'asc' }
    })

    console.log(`\n✅ Encontrados ${megapacks20mil.length} megapacks de 20,000 COP\n`)

    if (megapacks20mil.length === 0) {
      console.log('⚠️  No se encontraron megapacks de 20,000 COP')
      console.log('\n💡 Verifica que:')
      console.log('   1. Los productos tengan "megapack" en el nombre')
      console.log('   2. El precio sea exactamente 20000')
      return
    }

    // 2. MOSTRAR MEGAPACKS ENCONTRADOS
    console.log('📋 Megapacks que se actualizarán:\n')
    megapacks20mil.forEach((mp, i) => {
      const hasImage = mp.images && mp.images !== '[]' && mp.images !== ''
      console.log(`${i + 1}. ${mp.name}`)
      console.log(`   ID: ${mp.id}`)
      console.log(`   Precio: ${mp.price.toLocaleString('es-CO')} COP`)
      console.log(`   Imagen actual: ${hasImage ? '✅ Sí' : '❌ No'}`)
      console.log('')
    })

    // 3. ACTUALIZAR TODOS CON LA MISMA IMAGEN
    console.log('🔄 Actualizando imágenes...\n')
    console.log(`📸 Imagen a usar: ${IMAGEN_MEGAPACK_20MIL}\n`)

    let actualizados = 0
    for (const megapack of megapacks20mil) {
      await db.product.update({
        where: { id: megapack.id },
        data: {
          images: JSON.stringify([IMAGEN_MEGAPACK_20MIL])
        }
      })
      
      console.log(`✅ ${megapack.name}`)
      actualizados++
    }

    // 4. RESUMEN
    console.log('\n' + '='.repeat(60))
    console.log('✅ ACTUALIZACIÓN COMPLETADA')
    console.log('='.repeat(60))
    console.log(`\n📊 Resumen:`)
    console.log(`   • Megapacks encontrados: ${megapacks20mil.length}`)
    console.log(`   • Megapacks actualizados: ${actualizados}`)
    console.log(`   • Imagen usada: ${IMAGEN_MEGAPACK_20MIL}`)

    console.log('\n💡 Próximos pasos:')
    console.log('   1. Verifica la tienda: http://localhost:3000/tienda')
    console.log('   2. Busca "megapack" y verifica que todos tengan la misma imagen')
    console.log('   3. Prueba el bot: "Muéstrame los megapacks"')

    console.log('\n📝 NOTA IMPORTANTE:')
    console.log('   Si la imagen no es la correcta (la del cubo/caja),')
    console.log('   edita este archivo y cambia la URL en:')
    console.log('   const IMAGEN_MEGAPACK_20MIL = "tu-url-correcta"')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar
actualizarMegapacks20Mil()
