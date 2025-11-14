/**
 * 🎯 ENCONTRAR Y ACTUALIZAR MEGAPACKS DE 20,000
 * Busca automáticamente la imagen más común y actualiza todos
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function encontrarYActualizarMegapacks() {
  console.log('🎯 ENCONTRAR Y ACTUALIZAR MEGAPACKS DE 20,000 COP\n')
  console.log('='.repeat(60))

  try {
    // 1. BUSCAR TODOS LOS MEGAPACKS DE 20,000
    console.log('\n🔍 Paso 1: Buscando megapacks de 20,000 COP...')
    
    const megapacks = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: 'megapack', mode: 'insensitive' } },
          { name: { contains: 'mega pack', mode: 'insensitive' } }
        ],
        price: 20000
      },
      orderBy: { name: 'asc' }
    })

    console.log(`   ✅ Encontrados ${megapacks.length} megapacks\n`)

    if (megapacks.length === 0) {
      console.log('⚠️  No se encontraron megapacks de 20,000 COP')
      return
    }

    // 2. AGRUPAR POR IMAGEN
    console.log('📊 Paso 2: Analizando imágenes...\n')
    
    const imagenesPorUrl = new Map<string, any[]>()

    megapacks.forEach(mp => {
      let imageUrl = 'SIN_IMAGEN'
      
      if (mp.images && mp.images !== '[]' && mp.images !== '') {
        try {
          const imgs = JSON.parse(mp.images as string)
          if (Array.isArray(imgs) && imgs.length > 0) {
            imageUrl = imgs[0]
          }
        } catch {
          if (typeof mp.images === 'string' && mp.images.startsWith('http')) {
            imageUrl = mp.images
          }
        }
      }

      if (!imagenesPorUrl.has(imageUrl)) {
        imagenesPorUrl.set(imageUrl, [])
      }
      imagenesPorUrl.get(imageUrl)!.push(mp)
    })

    // Mostrar análisis
    console.log('   📋 Imágenes encontradas:\n')
    imagenesPorUrl.forEach((productos, url) => {
      const preview = url === 'SIN_IMAGEN' ? 'SIN IMAGEN' : url.substring(0, 50) + '...'
      console.log(`      ${productos.length} megapacks → ${preview}`)
    })

    // 3. ENCONTRAR IMAGEN MÁS COMÚN
    console.log('\n\n🔍 Paso 3: Buscando imagen más común...\n')
    
    let imagenMasComun = ''
    let maxCount = 0

    imagenesPorUrl.forEach((productos, url) => {
      if (url !== 'SIN_IMAGEN' && productos.length > maxCount) {
        maxCount = productos.length
        imagenMasComun = url
      }
    })

    if (!imagenMasComun) {
      console.log('⚠️  No se encontró ninguna imagen común')
      console.log('\n💡 Opciones:')
      console.log('   1. Sube la imagen del cubo a: https://postimages.org/')
      console.log('   2. Edita: scripts/actualizar-megapacks-20mil.ts')
      console.log('   3. Agrega la URL manualmente')
      return
    }

    console.log(`   ✅ Imagen más común encontrada:`)
    console.log(`      ${imagenMasComun}`)
    console.log(`      Usada por ${maxCount} megapacks\n`)

    // 4. PREGUNTAR SI ACTUALIZAR
    console.log('🔄 Paso 4: Actualizando todos los megapacks...\n')
    console.log(`   Se actualizarán ${megapacks.length} megapacks con esta imagen\n`)

    // 5. ACTUALIZAR TODOS
    let actualizados = 0
    for (const megapack of megapacks) {
      await db.product.update({
        where: { id: megapack.id },
        data: {
          images: JSON.stringify([imagenMasComun])
        }
      })
      
      console.log(`   ✅ ${megapack.name}`)
      actualizados++
    }

    // 6. RESUMEN
    console.log('\n\n' + '='.repeat(60))
    console.log('✅ ACTUALIZACIÓN COMPLETADA')
    console.log('='.repeat(60))
    console.log(`\n📊 Resumen:`)
    console.log(`   • Total megapacks: ${megapacks.length}`)
    console.log(`   • Actualizados: ${actualizados}`)
    console.log(`   • Imagen usada: ${imagenMasComun}`)

    console.log('\n💡 Próximos pasos:')
    console.log('   1. Verifica la tienda: http://localhost:3000/tienda')
    console.log('   2. Busca "megapack" y verifica las imágenes')
    console.log('   3. Prueba el bot de WhatsApp')

    console.log('\n📝 NOTA:')
    console.log('   Si esta NO es la imagen correcta (la del cubo/caja):')
    console.log('   1. Sube la imagen correcta a: https://postimages.org/')
    console.log('   2. Edita: scripts/actualizar-megapacks-20mil.ts')
    console.log('   3. Cambia la URL en: IMAGEN_MEGAPACK_20MIL')
    console.log('   4. Ejecuta: actualizar-megapacks-20mil.bat')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar
encontrarYActualizarMegapacks()
