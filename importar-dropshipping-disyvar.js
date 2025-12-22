/**
 * Script para importar productos reales de Disyvar (dropshipping)
 * Ejecutar: node importar-dropshipping-disyvar.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function importarDisyvar() {
  console.log('🔄 ========================================')
  console.log('🔄 IMPORTANDO PRODUCTOS DISYVAR')
  console.log('🔄 ========================================\n')
  
  try {
    // Leer archivo JSON
    const jsonPath = path.join(__dirname, 'scripts', 'disyvar-productos.json')
    const productosDisyvar = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

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
    console.log(`📦 Productos Disyvar a importar: ${productosDisyvar.length}\n`)

    let creados = 0
    let actualizados = 0
    let errores = 0
    let sinImagen = 0

    // Tomar solo los primeros 30 productos con imágenes
    const productosConImagen = productosDisyvar
      .filter(p => p.images && p.images.length > 0)
      .slice(0, 30)

    for (const producto of productosConImagen) {
      try {
        // Agregar margen de ganancia del 30%
        const precioConMargen = Math.round(producto.price * 1.3)

        // Crear descripción mejorada
        const descripcion = `${producto.description}\n\n💰 Precio: $${precioConMargen.toLocaleString()} COP\n📦 Producto de dropshipping\n🚚 Envío a toda Colombia\n⏱️ Tiempo de entrega: 3-5 días hábiles`

        const existente = await prisma.product.findFirst({
          where: {
            name: producto.name,
            userId: usuario.id
          }
        })

        const datosProducto = {
          name: producto.name,
          description: descripcion,
          price: precioConMargen,
          currency: "COP",
          category: "PHYSICAL",
          status: "AVAILABLE",
          images: JSON.stringify(producto.images),
          tags: JSON.stringify(["dropshipping", "disyvar", producto.category.toLowerCase()]),
          stock: 50,
          paymentLinkCustom: producto.url
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
          console.log(`✅ Creado: ${producto.name} - $${precioConMargen.toLocaleString()}`)
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
    console.log(`📦 Total procesados: ${productosConImagen.length}`)
    console.log(`💰 Margen aplicado: 30%`)
    console.log('\n✅ ¡Productos Disyvar importados!')

  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importarDisyvar()
