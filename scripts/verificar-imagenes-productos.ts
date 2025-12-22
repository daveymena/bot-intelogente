/**
 * Script para verificar las URLs de imágenes de los productos
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verificando imágenes de productos...\n')
  
  const products = await prisma.product.findMany({
    where: { status: 'AVAILABLE' },
    select: {
      id: true,
      name: true,
      images: true,
    },
    take: 20
  })
  
  console.log(`📦 Total productos: ${products.length}\n`)
  
  let conImagen = 0
  let sinImagen = 0
  
  for (const product of products) {
    let imageUrl: string | null = null
    
    // Intentar obtener imagen
    if (product.images) {
      if (typeof product.images === 'string') {
        try {
          const images = JSON.parse(product.images)
          if (Array.isArray(images) && images.length > 0) {
            imageUrl = images[0]
          }
        } catch {
          imageUrl = (product.images as string).trim()
        }
      }
    }
    
    // Note: 'image' field doesn't exist in schema, only 'images'
    
    if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      conImagen++
      console.log(`✅ ${product.name}`)
      console.log(`   📸 ${imageUrl.substring(0, 80)}...`)
      console.log('')
    } else {
      sinImagen++
      console.log(`❌ ${product.name}`)
      console.log(`   ⚠️ Sin imagen válida`)
      console.log(`   images: ${product.images}`)
      console.log('')
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Con imagen: ${conImagen}`)
  console.log(`❌ Sin imagen: ${sinImagen}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
