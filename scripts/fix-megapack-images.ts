/**
 * 🔧 ARREGLAR IMÁGENES DE MEGAPACKS
 * Actualiza las URLs rotas de postimg.cc a URLs válidas
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// 🎨 Imagen genérica de megapack (placeholder.com - muy confiable)
const DEFAULT_MEGAPACK_IMAGE = 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+Digital'

// 📸 URLs específicas por megapack (agregar aquí las imágenes reales)
const MEGAPACK_IMAGES: Record<string, string> = {
  '1': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+01',
  '2': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+02',
  '3': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+03',
  '4': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+04',
  '5': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+05',
  '6': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+06',
  '7': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+07',
  '8': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+08',
  '9': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+09',
  '10': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+10',
  '11': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+11',
  '12': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+12',
  '13': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+13',
  '14': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+14',
  '15': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+15',
  '16': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+16',
  '17': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+17',
  '18': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+18',
  '19': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+19',
  '20': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+20',
  '21': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+21',
  '22': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+22',
  '23': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+23',
  '24': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+24',
  '25': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+25',
  '26': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+26',
  '27': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+27',
  '28': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+28',
  '29': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+29',
  '30': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+30',
  '31': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+31',
  '32': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+32',
  '33': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+33',
  '34': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+34',
  '35': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+35',
  '36': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+36',
  '37': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+37',
  '38': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+38',
  '39': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+39',
  '40': 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Mega+Pack+40',
}

async function fixMegapackImages() {
  console.log('🔧 ARREGLANDO IMÁGENES DE MEGAPACKS')
  console.log('='.repeat(60))

  try {
    // Buscar todos los productos con imágenes de postimg.cc o imgur
    const products = await db.product.findMany({
      where: {
        OR: [
          { images: { contains: 'postimg.cc' } },
          { images: { contains: 'imgur.com' } }
        ]
      }
    })

    console.log(`\n📦 Encontrados ${products.length} productos con URLs problemáticas\n`)

    if (products.length === 0) {
      console.log('✅ No hay productos con URLs rotas')
      return
    }

    let actualizados = 0

    for (const product of products) {
      try {
        // Extraer número del megapack si existe
        const match = product.name.match(/megapack\s*(\d+)/i) || 
                      product.name.match(/mega\s*pack\s*(\d+)/i) ||
                      product.name.match(/pack\s*(\d+)/i)
        
        let newImageUrl: string
        
        if (match) {
          const numero = match[1]
          newImageUrl = MEGAPACK_IMAGES[numero] || DEFAULT_MEGAPACK_IMAGE
          console.log(`📸 ${product.name}`)
          console.log(`   Número: ${numero}`)
        } else {
          newImageUrl = DEFAULT_MEGAPACK_IMAGE
          console.log(`📸 ${product.name}`)
          console.log(`   (sin número específico)`)
        }

        // Actualizar imagen
        await db.product.update({
          where: { id: product.id },
          data: {
            images: JSON.stringify([newImageUrl])
          }
        })

        console.log(`   ✅ Actualizado: ${newImageUrl}`)
        console.log('')
        actualizados++

      } catch (error) {
        console.error(`   ❌ Error actualizando ${product.name}:`, error)
      }
    }

    console.log('='.repeat(60))
    console.log(`✅ ${actualizados} de ${products.length} productos actualizados`)
    console.log('='.repeat(60))

    // Verificar que las nuevas URLs funcionen
    console.log('\n🧪 Verificando nuevas URLs...\n')
    
    const axios = (await import('axios')).default
    
    const uniqueUrls = [...new Set(Object.values(MEGAPACK_IMAGES))]
    
    for (const url of uniqueUrls) {
      try {
        const response = await axios.head(url, { timeout: 5000 })
        console.log(`✅ ${url}`)
        console.log(`   Status: ${response.status}`)
        console.log(`   Content-Type: ${response.headers['content-type']}`)
      } catch (error: any) {
        console.log(`❌ ${url}`)
        console.log(`   Error: ${error.message}`)
      }
      console.log('')
    }

    console.log('\n💡 NOTA: Si la imagen por defecto no funciona, sube tus propias imágenes a:')
    console.log('   • Imgur: https://imgur.com/ (recomendado)')
    console.log('   • ImgBB: https://imgbb.com/')
    console.log('   • Cloudinary: https://cloudinary.com/')
    console.log('\nY actualiza las URLs en este script.')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar
fixMegapackImages()
