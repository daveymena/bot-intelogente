import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function limpiarLinksDescripcion() {
  console.log('🔍 Buscando productos con links en la descripción...\n')

  // Buscar productos que tengan links de MegaComputer en la descripción
  const productos = await prisma.product.findMany({
    where: {
      OR: [
        { description: { contains: 'megacomputer.com.co' } },
        { description: { contains: 'MegaComputer' } },
        { description: { contains: 'http' } },
        { description: { contains: 'https' } },
        { description: { contains: '🔗' } },
        { description: { contains: 'Más info' } },
        { description: { contains: 'Producto disponible' } }
      ]
    }
  })

  console.log(`📦 Encontrados ${productos.length} productos con links en la descripción\n`)

  if (productos.length === 0) {
    console.log('✅ No hay productos con links en la descripción')
    return
  }

  console.log('📋 Productos a limpiar:')
  productos.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} (ID: ${p.id})`)
  })
  console.log('')

  // Limpiar cada producto
  for (const producto of productos) {
    let descripcionLimpia = producto.description || ''

    // Remover sección "🔗 Más info:" y todo lo que sigue
    descripcionLimpia = descripcionLimpia.replace(/🔗\s*Más\s*info:[\s\S]*/gi, '')

    // Remover "Producto disponible en MegaComputer"
    descripcionLimpia = descripcionLimpia.replace(/Producto\s+disponible\s+en\s+MegaComputer[^\n]*/gi, '')

    // Remover URLs completas (http:// o https://)
    descripcionLimpia = descripcionLimpia.replace(/https?:\/\/[^\s]+/gi, '')

    // Remover dominios sin protocolo
    descripcionLimpia = descripcionLimpia.replace(/megacomputer\.com\.co[^\s]*/gi, '')

    // Remover "Contacto: +57..."
    descripcionLimpia = descripcionLimpia.replace(/Contacto:\s*\+\d+[^\n]*/gi, '')

    // Remover espacios múltiples y saltos de línea extras
    descripcionLimpia = descripcionLimpia.replace(/\s+/g, ' ').trim()

    // Actualizar el producto
    await prisma.product.update({
      where: { id: producto.id },
      data: {
        description: descripcionLimpia
      }
    })

    console.log(`✅ Limpiado: ${producto.name}`)
  }

  console.log(`\n✅ Proceso completado!`)
  console.log(`📊 Productos limpiados: ${productos.length}/${productos.length}`)
}

limpiarLinksDescripcion()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
