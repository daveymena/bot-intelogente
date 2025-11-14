import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================
// AGREGA AQUÍ LAS URLs DE TUS IMÁGENES REALES
// ============================================

// Formato: "código_producto": "URL_de_la_imagen"
const imagenesProductos: Record<string, string> = {
  // Ejemplo:
  // "2671": "https://i.ibb.co/abc123/asus-vivobook-2671.jpg",
  // "2486": "https://i.ibb.co/def456/asus-vivobook-2486.jpg",
  
  // LAPTOPS ASUS - Agrega las URLs reales aquí
  // "2671": "URL_AQUI",
  // "2486": "URL_AQUI",
  // "2910": "URL_AQUI",
  
  // LAPTOPS HP - Agrega las URLs reales aquí
  // "2568": "URL_AQUI",
  // "2734": "URL_AQUI",
  
  // COMPONENTES - Agrega las URLs reales aquí
  // "2700": "URL_AQUI", // RAM Attech 16GB
  // "2690": "URL_AQUI", // SSD ADATA 480GB
  
  // ACCESORIOS - Agrega las URLs reales aquí
  // "2684": "URL_AQUI", // Morral HP Gris
  // "2685": "URL_AQUI", // Morral HP Azul
}

// También puedes actualizar por nombre de producto
const imagenesPorNombre: Record<string, string> = {
  // Ejemplo:
  // "Curso Piano": "https://i.ibb.co/piano123/curso-piano.jpg",
  // "Mega Pack 01": "https://i.ibb.co/mp01/mega-pack-diseno.jpg",
}

async function actualizarImagenes() {
  try {
    console.log('📸 Actualizando imágenes de productos...\n')

    let actualizados = 0
    let noEncontrados = 0

    // Actualizar por código (busca en el nombre del producto)
    for (const [codigo, url] of Object.entries(imagenesProductos)) {
      const productos = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: codigo } },
            { description: { contains: codigo } }
          ]
        }
      })

      if (productos.length === 0) {
        console.log(`⚠️  No se encontró producto con código: ${codigo}`)
        noEncontrados++
        continue
      }

      for (const producto of productos) {
        await prisma.product.update({
          where: { id: producto.id },
          data: {
            images: JSON.stringify([url])
          }
        })
        console.log(`✅ Actualizado: ${producto.name}`)
        console.log(`   URL: ${url}\n`)
        actualizados++
      }
    }

    // Actualizar por nombre
    for (const [nombre, url] of Object.entries(imagenesPorNombre)) {
      const productos = await prisma.product.findMany({
        where: {
          name: { contains: nombre }
        }
      })

      if (productos.length === 0) {
        console.log(`⚠️  No se encontró producto: ${nombre}`)
        noEncontrados++
        continue
      }

      for (const producto of productos) {
        await prisma.product.update({
          where: { id: producto.id },
          data: {
            images: JSON.stringify([url])
          }
        })
        console.log(`✅ Actualizado: ${producto.name}`)
        console.log(`   URL: ${url}\n`)
        actualizados++
      }
    }

    console.log('\n📊 Resumen:')
    console.log(`   ✅ Productos actualizados: ${actualizados}`)
    console.log(`   ⚠️  No encontrados: ${noEncontrados}`)
    
    if (actualizados === 0) {
      console.log('\n💡 Tip: Agrega las URLs de las imágenes en el archivo scripts/actualizar-imagenes.ts')
      console.log('   Ejemplo:')
      console.log('   "2671": "https://i.ibb.co/abc123/imagen.jpg",')
    } else {
      console.log('\n🎉 ¡Imágenes actualizadas! Ve al dashboard para verlas.')
    }

  } catch (error) {
    console.error('❌ Error actualizando imágenes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Función para listar productos sin imagen
async function listarProductosSinImagen() {
  try {
    console.log('📋 Productos sin imagen real:\n')

    const productos = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        images: true
      }
    })

    let sinImagen = 0

    for (const producto of productos) {
      const images = producto.images ? JSON.parse(producto.images) : []
      const tieneImagenReal = images.length > 0 && !images[0].includes('unsplash')

      if (!tieneImagenReal) {
        console.log(`❌ ${producto.name}`)
        sinImagen++
      }
    }

    console.log(`\n📊 Total sin imagen real: ${sinImagen}`)
    console.log(`📊 Total con imagen: ${productos.length - sinImagen}`)

  } catch (error) {
    console.error('❌ Error listando productos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar según el argumento
const comando = process.argv[2]

if (comando === 'listar') {
  listarProductosSinImagen()
} else {
  actualizarImagenes()
}
