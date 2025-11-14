/**
 * 📸 ACTUALIZAR IMÁGENES DE MEGAPACKS
 * Busca las imágenes correctas de cada megapack individual
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// 🎯 AGREGAR AQUÍ LAS URLs DE LAS IMÁGENES DE CADA MEGAPACK
const MEGAPACK_IMAGES: Record<string, string> = {
  // Ejemplo:
  // '1': 'https://tu-url-de-imagen.com/megapack-1.jpg',
  // '2': 'https://tu-url-de-imagen.com/megapack-2.jpg',
  
  // Por ahora, usar una imagen genérica para todos
  'default': 'https://i.postimg.cc/Kz8Lh5Qy/megapack-default.jpg'
}

async function actualizarImagenesMegapacks() {
  console.log('📸 ACTUALIZAR IMÁGENES DE MEGAPACKS\n')
  console.log('='.repeat(60))

  try {
    // Buscar todos los megapacks
    const megapacks = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: 'megapack', mode: 'insensitive' } },
          { name: { contains: 'mega pack', mode: 'insensitive' } },
          { name: { contains: 'pack', mode: 'insensitive' } }
        ]
      },
      orderBy: { name: 'asc' }
    })

    console.log(`\n📦 Encontrados ${megapacks.length} megapacks\n`)

    if (megapacks.length === 0) {
      console.log('⚠️  No se encontraron megapacks')
      return
    }

    // Mostrar megapacks encontrados
    console.log('📋 Megapacks encontrados:')
    megapacks.forEach((mp, i) => {
      const hasImage = mp.images && mp.images !== '[]' && mp.images !== ''
      console.log(`   ${i + 1}. ${mp.name}`)
      console.log(`      ID: ${mp.id}`)
      console.log(`      Precio: ${mp.price.toLocaleString('es-CO')} COP`)
      console.log(`      Imagen actual: ${hasImage ? '✅ Sí' : '❌ No'}`)
      
      if (hasImage) {
        try {
          const imgs = JSON.parse(mp.images as string)
          console.log(`      URL: ${imgs[0]}`)
        } catch {
          console.log(`      URL: ${mp.images}`)
        }
      }
      console.log('')
    })

    // Actualizar imágenes
    console.log('\n🔄 Actualizando imágenes...\n')

    let actualizados = 0
    for (const megapack of megapacks) {
      // Extraer número del megapack
      const match = megapack.name.match(/megapack\s*(\d+)/i) || 
                    megapack.name.match(/mega\s*pack\s*(\d+)/i) ||
                    megapack.name.match(/pack\s*(\d+)/i)
      
      let imagenUrl: string | null = null
      
      if (match) {
        const numero = match[1]
        imagenUrl = MEGAPACK_IMAGES[numero] || MEGAPACK_IMAGES['default']
        console.log(`   📸 Megapack ${numero}: ${megapack.name}`)
      } else {
        // Si no tiene número, usar imagen por defecto
        imagenUrl = MEGAPACK_IMAGES['default']
        console.log(`   📸 ${megapack.name} (sin número específico)`)
      }

      if (imagenUrl) {
        await db.product.update({
          where: { id: megapack.id },
          data: {
            images: JSON.stringify([imagenUrl])
          }
        })
        
        console.log(`      ✅ Imagen actualizada: ${imagenUrl}`)
        actualizados++
      } else {
        console.log(`      ⚠️  No hay imagen disponible`)
      }
      
      console.log('')
    }

    console.log('='.repeat(60))
    console.log(`✅ ${actualizados} de ${megapacks.length} megapacks actualizados`)
    console.log('='.repeat(60))

    console.log('\n💡 INSTRUCCIONES PARA AGREGAR IMÁGENES PERSONALIZADAS:')
    console.log('\n1. Sube las imágenes de cada megapack a un servicio como:')
    console.log('   • PostImage: https://postimages.org/')
    console.log('   • ImgBB: https://imgbb.com/')
    console.log('   • Imgur: https://imgur.com/')
    console.log('\n2. Copia las URLs directas de las imágenes')
    console.log('\n3. Edita este archivo: scripts/actualizar-imagenes-megapacks.ts')
    console.log('\n4. Agrega las URLs en el objeto MEGAPACK_IMAGES:')
    console.log(`
   const MEGAPACK_IMAGES = {
     '1': 'https://tu-url.com/megapack-1.jpg',
     '2': 'https://tu-url.com/megapack-2.jpg',
     '3': 'https://tu-url.com/megapack-3.jpg',
     // ... etc
   }
    `)
    console.log('\n5. Ejecuta de nuevo: npx tsx scripts/actualizar-imagenes-megapacks.ts')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar
actualizarImagenesMegapacks()
