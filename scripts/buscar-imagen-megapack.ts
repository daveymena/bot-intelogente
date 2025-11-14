/**
 * 🔍 BUSCAR IMAGEN ACTUAL DE MEGAPACKS
 * Para encontrar la URL de la imagen del cubo/caja
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function buscarImagenMegapack() {
  console.log('🔍 BUSCAR IMAGEN DE MEGAPACKS\n')
  console.log('='.repeat(60))

  try {
    // Buscar megapacks de 20,000 que tengan imagen
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

    console.log(`\n📦 Encontrados ${megapacks.length} megapacks de 20,000 COP\n`)

    // Agrupar por imagen
    const imagenesPorUrl = new Map<string, any[]>()

    megapacks.forEach(mp => {
      let imageUrl = 'SIN IMAGEN'
      
      if (mp.images && mp.images !== '[]' && mp.images !== '') {
        try {
          const imgs = JSON.parse(mp.images as string)
          if (Array.isArray(imgs) && imgs.length > 0) {
            imageUrl = imgs[0]
          }
        } catch {
          imageUrl = mp.images as string
        }
      }

      if (!imagenesPorUrl.has(imageUrl)) {
        imagenesPorUrl.set(imageUrl, [])
      }
      imagenesPorUrl.get(imageUrl)!.push(mp)
    })

    // Mostrar agrupados por imagen
    console.log('📊 MEGAPACKS AGRUPADOS POR IMAGEN:\n')

    imagenesPorUrl.forEach((productos, url) => {
      console.log(`\n📸 Imagen: ${url}`)
      console.log(`   Cantidad: ${productos.length} megapacks`)
      console.log(`   Productos:`)
      productos.forEach(p => {
        console.log(`      • ${p.name}`)
      })
    })

    // Buscar la imagen más común
    let imagenMasComun = ''
    let maxCount = 0

    imagenesPorUrl.forEach((productos, url) => {
      if (url !== 'SIN IMAGEN' && productos.length > maxCount) {
        maxCount = productos.length
        imagenMasComun = url
      }
    })

    if (imagenMasComun) {
      console.log('\n\n' + '='.repeat(60))
      console.log('💡 IMAGEN MÁS COMÚN:')
      console.log('='.repeat(60))
      console.log(`\n${imagenMasComun}`)
      console.log(`\nUsada por ${maxCount} megapacks`)
      console.log('\n📝 Copia esta URL y úsala en:')
      console.log('   scripts/actualizar-megapacks-20mil.ts')
      console.log('   const IMAGEN_MEGAPACK_20MIL = "URL_AQUI"')
    }

    // Mostrar megapacks sin imagen
    const sinImagen = imagenesPorUrl.get('SIN IMAGEN')
    if (sinImagen && sinImagen.length > 0) {
      console.log('\n\n⚠️  MEGAPACKS SIN IMAGEN:')
      sinImagen.forEach(p => {
        console.log(`   • ${p.name}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar
buscarImagenMegapack()
