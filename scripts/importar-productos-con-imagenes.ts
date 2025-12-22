/**
 * Script para importar productos desde JSON
 * - Solo productos con imágenes
 * - Omite duplicados
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface ProductoJSON {
  id?: string
  name: string
  description: string
  price: number
  currency: string
  category: string
  status: string
  images: string[]
  tags?: string[]
  autoResponse?: string | null
  stock?: number | null
  paymentLinkMercadoPago?: string | null
  paymentLinkPayPal?: string | null
  paymentLinkCustom?: string | null
}

async function importarProductos() {
  console.log('📦 Importando Productos con Imágenes\n')
  console.log('='.repeat(50))

  // Leer archivo JSON
  const jsonPath = path.join(process.cwd(), 'productos-2025-11-04.json')
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Archivo no encontrado:', jsonPath)
    process.exit(1)
  }

  const productos: ProductoJSON[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  console.log(`\n📄 Productos en archivo: ${productos.length}`)

  // Filtrar productos con imágenes
  const productosConImagenes = productos.filter(p => p.images && p.images.length > 0)
  console.log(`📸 Productos con imágenes: ${productosConImagenes.length}`)
  console.log(`🚫 Productos sin imágenes (omitidos): ${productos.length - productosConImagenes.length}`)

  // Obtener productos existentes en BD
  const productosExistentes = await prisma.product.findMany({
    select: { name: true }
  })
  
  const nombresExistentes = new Set(productosExistentes.map(p => p.name.toLowerCase().trim()))
  console.log(`\n💾 Productos en base de datos: ${productosExistentes.length}`)

  // Filtrar duplicados
  const productosNuevos = productosConImagenes.filter(p => {
    const nombreNormalizado = p.name.toLowerCase().trim()
    return !nombresExistentes.has(nombreNormalizado)
  })

  const duplicados = productosConImagenes.length - productosNuevos.length
  console.log(`✅ Productos nuevos a importar: ${productosNuevos.length}`)
  console.log(`🔄 Productos duplicados (omitidos): ${duplicados}`)

  if (productosNuevos.length === 0) {
    console.log('\n⚠️  No hay productos nuevos para importar')
    return
  }

  // Confirmar importación
  console.log('\n' + '='.repeat(50))
  console.log('📊 Resumen:')
  console.log(`   Total en archivo: ${productos.length}`)
  console.log(`   Con imágenes: ${productosConImagenes.length}`)
  console.log(`   Duplicados: ${duplicados}`)
  console.log(`   A importar: ${productosNuevos.length}`)
  console.log('='.repeat(50))

  // Obtener userId (primer usuario admin)
  const usuario = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!usuario) {
    console.error('\n❌ No se encontró usuario admin')
    console.log('💡 Ejecuta: npx tsx scripts/create-admin.ts')
    process.exit(1)
  }

  console.log(`\n👤 Usuario: ${usuario.email}`)
  console.log('\n🚀 Iniciando importación...\n')

  // Importar productos
  let importados = 0
  let errores = 0

  for (const producto of productosNuevos) {
    try {
      // Validar que tenga imágenes
      if (!producto.images || producto.images.length === 0) {
        console.log(`⚠️  Omitido (sin imágenes): ${producto.name}`)
        continue
      }

      // Crear producto
      await prisma.product.create({
        data: {
          name: producto.name,
          description: producto.description || `${producto.name} - Producto disponible`,
          price: producto.price,
          currency: producto.currency || 'COP',
          category: producto.category as any,
          status: producto.status as any,
          images: JSON.stringify(producto.images), // Convertir array a JSON string
          tags: JSON.stringify(producto.tags || []), // Convertir array a JSON string
          autoResponse: producto.autoResponse,
          stock: producto.stock,
          paymentLinkMercadoPago: producto.paymentLinkMercadoPago,
          paymentLinkPayPal: producto.paymentLinkPayPal,
          paymentLinkCustom: producto.paymentLinkCustom,
          userId: usuario.id
        }
      })

      importados++
      console.log(`✅ ${importados}/${productosNuevos.length} - ${producto.name}`)
      
      // Mostrar imágenes
      console.log(`   📸 ${producto.images.length} imagen(es)`)
      console.log(`   💰 $${producto.price.toLocaleString('es-CO')} COP`)

    } catch (error: any) {
      errores++
      console.error(`❌ Error: ${producto.name}`)
      console.error(`   ${error.message}`)
    }
  }

  // Resumen final
  console.log('\n' + '='.repeat(50))
  console.log('📊 Resultado Final:')
  console.log('='.repeat(50))
  console.log(`✅ Importados: ${importados}`)
  console.log(`❌ Errores: ${errores}`)
  console.log(`🚫 Omitidos (sin imágenes): ${productos.length - productosConImagenes.length}`)
  console.log(`🔄 Omitidos (duplicados): ${duplicados}`)
  console.log(`📦 Total en BD ahora: ${productosExistentes.length + importados}`)
  console.log('='.repeat(50))

  if (importados > 0) {
    console.log('\n✅ Importación completada exitosamente!')
    console.log('\n💡 Próximos pasos:')
    console.log('   1. Verificar productos: npx tsx scripts/ver-productos.ts')
    console.log('   2. Probar bot con nuevos productos')
  }
}

// Ejecutar
importarProductos()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
