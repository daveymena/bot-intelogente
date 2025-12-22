/**
 * Script para importar productos del archivo productos-completos.json
 * Ejecutar: node importar-productos-completos-json.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function importarProductosCompletos() {
  console.log('🔄 ========================================')
  console.log('🔄 IMPORTANDO PRODUCTOS COMPLETOS JSON')
  console.log('🔄 ========================================\n')
  
  try {
    // Leer archivo JSON
    const jsonPath = path.join(__dirname, 'scripts', 'productos-completos.json')
    const productosCompletos = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

    const usuario = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'daveymena16@gmail.com' },
          { email: 'deinermena25@gmail.com' }
        ]
      }
    })

    if (!usuario) {
      console.error('❌ No se encontró usuario admin')
      return
    }

    console.log(`✅ Usuario: ${usuario.email}`)
    console.log(`📦 Productos a importar: ${productosCompletos.length}\n`)

    let creados = 0
    let actualizados = 0
    let errores = 0

    for (const producto of productosCompletos) {
      try {
        // Parsear imágenes si es string
        let images = producto.images
        if (typeof images === 'string') {
          try {
            images = JSON.parse(images)
          } catch {
            images = [images]
          }
        }
        if (!Array.isArray(images)) {
          images = [images]
        }

        // Parsear tags si es string
        let tags = producto.tags
        if (typeof tags === 'string') {
          try {
            tags = JSON.parse(tags)
          } catch {
            tags = [tags]
          }
        }
        if (!Array.isArray(tags)) {
          tags = []
        }

        const existente = await prisma.product.findFirst({
          where: {
            name: producto.name,
            userId: usuario.id
          }
        })

        const datosProducto = {
          name: producto.name,
          description: producto.description || `Producto: ${producto.name}`,
          price: parseFloat(producto.price) || 0,
          currency: producto.currency || "COP",
          category: producto.category || "PHYSICAL",
          status: producto.status || "AVAILABLE",
          images: JSON.stringify(images),
          tags: JSON.stringify(tags),
          stock: producto.stock || (producto.category === 'DIGITAL' ? 999 : 50),
          paymentLinkCustom: producto.paymentLinkCustom || producto.paymentLink || ""
        }

        if (existente) {
          await prisma.product.update({
            where: { id: existente.id },
            data: datosProducto
          })
          console.log(`🔄 Actualizado: ${producto.name}`)
          actualizados++
        } else {
          await prisma.product.create({
            data: {
              ...datosProducto,
              userId: usuario.id
            }
          })
          console.log(`✅ Creado: ${producto.name}`)
          creados++
        }
      } catch (error) {
        console.error(`❌ Error con ${producto.name}:`, error.message)
        errores++
      }
    }

    console.log('\n📊 ========================================')
    console.log('📊 RESUMEN FINAL')
    console.log('📊 ========================================')
    console.log(`✅ Productos creados: ${creados}`)
    console.log(`🔄 Productos actualizados: ${actualizados}`)
    console.log(`❌ Errores: ${errores}`)
    console.log(`📦 Total procesados: ${productosCompletos.length}`)
    console.log('\n✅ ¡Productos completos importados!')

  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importarProductosCompletos()
