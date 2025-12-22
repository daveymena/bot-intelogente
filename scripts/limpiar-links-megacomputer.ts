import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function limpiarLinksMegaComputer() {
  console.log('🔍 Buscando productos con links de MegaComputer...')

  try {
    // Buscar productos que tengan megacomputer.com.co en algún campo
    const productos = await prisma.product.findMany({
      where: {
        OR: [
          { description: { contains: 'megacomputer.com.co' } },
          { tags: { contains: 'megacomputer.com.co' } },
          { images: { contains: 'megacomputer.com.co' } }
        ]
      }
    })

    console.log(`📦 Encontrados ${productos.length} productos con referencias a MegaComputer`)

    if (productos.length === 0) {
      console.log('✅ No hay productos con links de MegaComputer')
      return
    }

    // Mostrar productos encontrados
    console.log('\n📋 Productos a limpiar:')
    productos.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (ID: ${p.id})`)
    })

    // Limpiar cada producto
    let limpiados = 0
    for (const producto of productos) {
      try {
        const updates: any = {}

        // Limpiar description
        if (producto.description && producto.description.includes('megacomputer.com.co')) {
          updates.description = producto.description.replace(/https?:\/\/megacomputer\.com\.co[^\s"]*/g, '')
        }

        // Limpiar tags
        if (producto.tags && producto.tags.includes('megacomputer.com.co')) {
          updates.tags = producto.tags.replace(/https?:\/\/megacomputer\.com\.co[^\s"]*/g, '')
        }

        // Limpiar images (si es un array JSON)
        if (producto.images && producto.images.includes('megacomputer.com.co')) {
          try {
            const imagesArray = JSON.parse(producto.images)
            const cleanedImages = imagesArray.filter((img: string) => !img.includes('megacomputer.com.co'))
            updates.images = JSON.stringify(cleanedImages)
          } catch {
            // Si no es JSON, limpiar como string
            updates.images = producto.images.replace(/https?:\/\/megacomputer\.com\.co[^\s"]*/g, '')
          }
        }

        // Actualizar si hay cambios
        if (Object.keys(updates).length > 0) {
          await prisma.product.update({
            where: { id: producto.id },
            data: updates
          })
          limpiados++
          console.log(`✅ Limpiado: ${producto.name}`)
        }
      } catch (error) {
        console.error(`❌ Error limpiando ${producto.name}:`, error)
      }
    }

    console.log(`\n✅ Proceso completado!`)
    console.log(`📊 Productos limpiados: ${limpiados}/${productos.length}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

limpiarLinksMegaComputer()
