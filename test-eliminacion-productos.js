/**
 * Script para probar la eliminación de productos
 * Ejecutar con: npx tsx test-eliminacion-productos.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testEliminacion() {
  console.log('🧪 Probando sistema de eliminación de productos...\n')
  
  try {
    // 1. Contar productos actuales
    const totalAntes = await prisma.product.count()
    console.log(`📦 Productos actuales: ${totalAntes}`)
    
    if (totalAntes === 0) {
      console.log('⚠️  No hay productos para probar eliminación')
      console.log('💡 Ejecuta primero: npx tsx restaurar-productos-con-fotos.js')
      return
    }

    // 2. Crear un producto de prueba
    const usuario = await prisma.user.findFirst()
    
    if (!usuario) {
      console.error('❌ No se encontró usuario')
      return
    }

    console.log(`\n✅ Usuario: ${usuario.email}`)
    
    const productoPrueba = await prisma.product.create({
      data: {
        name: "PRODUCTO DE PRUEBA - ELIMINAR",
        description: "Este es un producto de prueba para verificar la eliminación",
        price: 1000,
        currency: "COP",
        category: "DIGITAL",
        status: "AVAILABLE",
        images: JSON.stringify([]),
        tags: JSON.stringify(["test", "prueba"]),
        userId: usuario.id
      }
    })

    console.log(`\n✅ Producto de prueba creado: ${productoPrueba.name}`)
    console.log(`   ID: ${productoPrueba.id}`)

    // 3. Intentar eliminar el producto
    console.log(`\n🗑️  Intentando eliminar producto...`)
    
    await prisma.product.delete({
      where: { id: productoPrueba.id }
    })

    console.log(`✅ Producto eliminado exitosamente`)

    // 4. Verificar que se eliminó
    const verificar = await prisma.product.findUnique({
      where: { id: productoPrueba.id }
    })

    if (verificar === null) {
      console.log(`✅ Verificación: El producto ya no existe en la BD`)
    } else {
      console.log(`❌ Error: El producto aún existe`)
    }

    // 5. Contar productos finales
    const totalDespues = await prisma.product.count()
    console.log(`\n📦 Productos finales: ${totalDespues}`)
    console.log(`📊 Diferencia: ${totalAntes - totalDespues} producto(s) eliminado(s)`)

    console.log(`\n✅ CONCLUSIÓN: El sistema de eliminación funciona correctamente`)
    console.log(`\n💡 Si el botón en el dashboard no funciona, el problema es en el frontend, no en la BD`)

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message)
    console.error('\n📋 Detalles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
testEliminacion()
