import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function restaurarImagenes() {
  console.log('🔄 Restaurando imágenes reales de MegaComputer...\n')

  // Leer el archivo JSON con los productos originales
  const productosOriginales = JSON.parse(
    fs.readFileSync('scripts/productos-megacomputer-completo.json', 'utf-8')
  )

  console.log(`📦 Productos originales encontrados: ${productosOriginales.length}\n`)

  let restaurados = 0
  let noEncontrados = 0

  for (const productoOriginal of productosOriginales) {
    try {
      // Buscar el producto en la base de datos por nombre
      const producto = await prisma.product.findFirst({
        where: {
          name: {
            contains: productoOriginal.nombre.substring(0, 30) // Buscar por los primeros 30 caracteres
          }
        }
      })

      if (producto) {
        // Actualizar con la imagen real de MegaComputer
        await prisma.product.update({
          where: { id: producto.id },
          data: {
            images: JSON.stringify([productoOriginal.imagen])
          }
        })

        console.log(`✅ Restaurado: ${producto.name}`)
        console.log(`   Imagen: ${productoOriginal.imagen}`)
        restaurados++
      } else {
        console.log(`⚠️  No encontrado: ${productoOriginal.nombre}`)
        noEncontrados++
      }
    } catch (error) {
      console.error(`❌ Error con ${productoOriginal.nombre}:`, error)
    }
  }

  console.log(`\n✅ Proceso completado!`)
  console.log(`📊 Imágenes restauradas: ${restaurados}`)
  console.log(`⚠️  Productos no encontrados: ${noEncontrados}`)
}

restaurarImagenes()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
