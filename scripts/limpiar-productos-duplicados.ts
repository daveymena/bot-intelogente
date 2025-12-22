import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function limpiarProductosDuplicados() {
  console.log('🔍 Verificando productos duplicados...\n')

  try {
    // Obtener todos los productos
    const productos = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' }
    })

    console.log(`📦 Total de productos: ${productos.length}\n`)

    // Agrupar por nombre (case insensitive)
    const productosPorNombre = new Map<string, typeof productos>()
    
    productos.forEach(producto => {
      const nombreNormalizado = producto.name.toLowerCase().trim()
      if (!productosPorNombre.has(nombreNormalizado)) {
        productosPorNombre.set(nombreNormalizado, [])
      }
      productosPorNombre.get(nombreNormalizado)!.push(producto)
    })

    // Encontrar duplicados
    const duplicados: string[] = []
    const productosAEliminar: string[] = []

    productosPorNombre.forEach((productos, nombre) => {
      if (productos.length > 1) {
        duplicados.push(nombre)
        console.log(`\n❌ DUPLICADO: "${productos[0].name}"`)
        console.log(`   Encontradas ${productos.length} versiones:`)
        
        // Mantener el primero (más antiguo), eliminar los demás
        productos.forEach((p, index) => {
          if (index === 0) {
            console.log(`   ✅ MANTENER: ID ${p.id} (${p.createdAt.toISOString()})`)
          } else {
            console.log(`   🗑️  ELIMINAR: ID ${p.id} (${p.createdAt.toISOString()})`)
            productosAEliminar.push(p.id)
          }
        })
      }
    })

    console.log(`\n\n📊 RESUMEN:`)
    console.log(`   Total productos: ${productos.length}`)
    console.log(`   Productos únicos: ${productosPorNombre.size}`)
    console.log(`   Productos duplicados: ${duplicados.length}`)
    console.log(`   Productos a eliminar: ${productosAEliminar.length}`)

    if (productosAEliminar.length > 0) {
      console.log(`\n🗑️  Eliminando ${productosAEliminar.length} productos duplicados...`)
      
      const resultado = await prisma.product.deleteMany({
        where: {
          id: {
            in: productosAEliminar
          }
        }
      })

      console.log(`✅ Eliminados ${resultado.count} productos duplicados`)
    } else {
      console.log(`\n✅ No se encontraron productos duplicados`)
    }

    // Limpiar imágenes de Unsplash
    console.log(`\n\n🖼️  Limpiando imágenes de Unsplash...`)
    
    const productosConUnsplash = await prisma.product.findMany({
      where: {
        images: {
          contains: 'unsplash.com'
        }
      }
    })

    console.log(`   Productos con imágenes de Unsplash: ${productosConUnsplash.length}`)

    if (productosConUnsplash.length > 0) {
      for (const producto of productosConUnsplash) {
        await prisma.product.update({
          where: { id: producto.id },
          data: { images: '[]' }
        })
      }
      console.log(`✅ Limpiadas ${productosConUnsplash.length} imágenes de Unsplash`)
    }

    // Mostrar productos sin imagen
    console.log(`\n\n📸 Productos sin imagen (listos para agregar fotos manualmente):`)
    
    const productosSinImagen = await prisma.product.findMany({
      where: {
        OR: [
          { images: '[]' },
          { images: null },
          { images: '' }
        ]
      },
      orderBy: { name: 'asc' }
    })

    console.log(`\n   Total: ${productosSinImagen.length} productos\n`)
    
    productosSinImagen.forEach((p, index) => {
      console.log(`   ${index + 1}. ${p.name}`)
      console.log(`      ID: ${p.id}`)
      console.log(`      Precio: $${p.price.toLocaleString()} ${p.currency}`)
      console.log(`      Categoría: ${p.category}`)
      console.log('')
    })

    console.log(`\n✅ Limpieza completada!`)
    console.log(`\n📝 Siguiente paso: Agrega las fotos manualmente desde el dashboard`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

limpiarProductosDuplicados()
