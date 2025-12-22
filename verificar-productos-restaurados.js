/**
 * Script para verificar productos restaurados
 * Ejecutar: node verificar-productos-restaurados.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verificarProductos() {
  console.log('🔍 ========================================')
  console.log('🔍 VERIFICANDO PRODUCTOS RESTAURADOS')
  console.log('🔍 ========================================\n')
  
  try {
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

    console.log(`✅ Usuario: ${usuario.email}\n`)

    // Contar productos por categoría
    const totalProductos = await prisma.product.count({
      where: { userId: usuario.id }
    })

    const productosDigitales = await prisma.product.count({
      where: { 
        userId: usuario.id,
        category: 'DIGITAL'
      }
    })

    const productosFisicos = await prisma.product.count({
      where: { 
        userId: usuario.id,
        category: 'PHYSICAL'
      }
    })

    console.log('📊 RESUMEN POR CATEGORÍA:')
    console.log('─────────────────────────────────────────')
    console.log(`📦 Total de productos: ${totalProductos}`)
    console.log(`💾 Productos digitales: ${productosDigitales}`)
    console.log(`📦 Productos físicos: ${productosFisicos}`)
    console.log('')

    // Listar productos por tipo
    console.log('📋 PRODUCTOS DIGITALES:')
    console.log('─────────────────────────────────────────')
    const digitales = await prisma.product.findMany({
      where: { 
        userId: usuario.id,
        category: 'DIGITAL'
      },
      select: {
        name: true,
        price: true,
        images: true
      },
      orderBy: { price: 'desc' }
    })

    digitales.forEach((p, i) => {
      const imagenes = JSON.parse(p.images || '[]')
      console.log(`${i + 1}. ${p.name}`)
      console.log(`   💰 $${p.price.toLocaleString()} COP`)
      console.log(`   🖼️  ${imagenes.length} imagen(es)`)
      console.log('')
    })

    console.log('📋 PRODUCTOS FÍSICOS (LAPTOPS):')
    console.log('─────────────────────────────────────────')
    const laptops = await prisma.product.findMany({
      where: { 
        userId: usuario.id,
        category: 'PHYSICAL',
        OR: [
          { name: { contains: 'Portatil' } },
          { name: { contains: 'Laptop' } },
          { name: { contains: 'Macbook' } }
        ]
      },
      select: {
        name: true,
        price: true,
        stock: true,
        images: true
      },
      orderBy: { price: 'asc' }
    })

    laptops.forEach((p, i) => {
      const imagenes = JSON.parse(p.images || '[]')
      console.log(`${i + 1}. ${p.name.substring(0, 60)}...`)
      console.log(`   💰 $${p.price.toLocaleString()} COP`)
      console.log(`   📦 Stock: ${p.stock}`)
      console.log(`   🖼️  ${imagenes.length} imagen(es)`)
      console.log('')
    })

    console.log('📋 PRODUCTOS FÍSICOS (IMPRESORAS):')
    console.log('─────────────────────────────────────────')
    const impresoras = await prisma.product.findMany({
      where: { 
        userId: usuario.id,
        category: 'PHYSICAL',
        name: { contains: 'Impresora' }
      },
      select: {
        name: true,
        price: true,
        stock: true,
        images: true
      },
      orderBy: { price: 'asc' }
    })

    impresoras.forEach((p, i) => {
      const imagenes = JSON.parse(p.images || '[]')
      console.log(`${i + 1}. ${p.name.substring(0, 60)}...`)
      console.log(`   💰 $${p.price.toLocaleString()} COP`)
      console.log(`   📦 Stock: ${p.stock}`)
      console.log(`   🖼️  ${imagenes.length} imagen(es)`)
      console.log('')
    })

    console.log('📋 OTROS PRODUCTOS FÍSICOS:')
    console.log('─────────────────────────────────────────')
    const otros = await prisma.product.findMany({
      where: { 
        userId: usuario.id,
        category: 'PHYSICAL',
        AND: [
          { name: { not: { contains: 'Portatil' } } },
          { name: { not: { contains: 'Laptop' } } },
          { name: { not: { contains: 'Macbook' } } },
          { name: { not: { contains: 'Impresora' } } }
        ]
      },
      select: {
        name: true,
        price: true,
        stock: true,
        images: true
      },
      orderBy: { price: 'desc' }
    })

    otros.forEach((p, i) => {
      const imagenes = JSON.parse(p.images || '[]')
      console.log(`${i + 1}. ${p.name}`)
      console.log(`   💰 $${p.price.toLocaleString()} COP`)
      console.log(`   📦 Stock: ${p.stock}`)
      console.log(`   🖼️  ${imagenes.length} imagen(es)`)
      console.log('')
    })

    // Verificar productos con links de pago
    const conLinksPago = await prisma.product.count({
      where: { 
        userId: usuario.id,
        paymentLinkCustom: { not: null }
      }
    })

    console.log('🔗 LINKS DE PAGO:')
    console.log('─────────────────────────────────────────')
    console.log(`✅ Productos con links configurados: ${conLinksPago}`)
    console.log('')

    // Verificar productos sin imágenes
    const sinImagenes = await prisma.product.findMany({
      where: { 
        userId: usuario.id,
        OR: [
          { images: null },
          { images: '[]' },
          { images: '' }
        ]
      },
      select: {
        name: true
      }
    })

    if (sinImagenes.length > 0) {
      console.log('⚠️  PRODUCTOS SIN IMÁGENES:')
      console.log('─────────────────────────────────────────')
      sinImagenes.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`)
      })
      console.log('')
    } else {
      console.log('✅ Todos los productos tienen imágenes configuradas\n')
    }

    console.log('✅ ========================================')
    console.log('✅ VERIFICACIÓN COMPLETADA')
    console.log('✅ ========================================')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarProductos()
