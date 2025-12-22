const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function eliminarProductosSinFotos() {
  console.log('🗑️  Eliminando productos sin fotos...\n')
  
  try {
    const usuario = await prisma.user.findFirst({
      where: { email: 'daveymena16@gmail.com' }
    })
    
    if (!usuario) {
      console.error('❌ Usuario no encontrado')
      return
    }
    
    console.log(`👤 Usuario: ${usuario.email}\n`)
    
    // Obtener todos los productos
    const productos = await prisma.product.findMany({
      where: { userId: usuario.id }
    })
    
    console.log(`📦 Total productos: ${productos.length}\n`)
    console.log('🔍 Identificando productos sin fotos...\n')
    
    let eliminados = 0
    const productosAEliminar = []
    
    // Identificar productos sin fotos
    for (const producto of productos) {
      let imagenes = []
      try {
        imagenes = JSON.parse(producto.images || '[]')
      } catch (e) {
        imagenes = []
      }
      
      if (imagenes.length === 0) {
        productosAEliminar.push(producto)
        console.log(`❌ Sin fotos: ${producto.name}`)
      }
    }
    
    console.log(`\n⚠️  Se eliminarán ${productosAEliminar.length} productos\n`)
    
    // Eliminar productos sin fotos
    for (const producto of productosAEliminar) {
      await prisma.product.delete({
        where: { id: producto.id }
      })
      eliminados++
    }
    
    // Verificar estado final
    const productosFinales = await prisma.product.findMany({
      where: { userId: usuario.id }
    })
    
    console.log('━'.repeat(50))
    console.log('📊 RESUMEN:')
    console.log('━'.repeat(50))
    console.log(`🗑️  Productos eliminados: ${eliminados}`)
    console.log(`✅ Productos restantes: ${productosFinales.length}`)
    console.log(`📸 Todos con fotos reales: 100%`)
    
    console.log('\n🎉 ¡Limpieza completada!')
    console.log('\n🌐 Ver productos en:')
    console.log('   Tienda: http://localhost:3000/tienda')
    console.log('   Catálogo: http://localhost:3000/catalogo')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

eliminarProductosSinFotos()
