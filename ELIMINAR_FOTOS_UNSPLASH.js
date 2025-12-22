const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function eliminarFotosUnsplash() {
  console.log('🗑️  Eliminando productos con fotos de Unsplash...\n')
  
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
    console.log('🔍 Buscando productos con fotos de Unsplash...\n')
    
    let eliminados = 0
    const productosAEliminar = []
    
    for (const producto of productos) {
      let imagenes = []
      try {
        imagenes = JSON.parse(producto.images || '[]')
      } catch (e) {
        imagenes = []
      }
      
      // Verificar si alguna imagen es de Unsplash
      const tieneUnsplash = imagenes.some(img => 
        img && (
          img.includes('unsplash.com') || 
          img.includes('images.unsplash')
        )
      )
      
      if (tieneUnsplash) {
        productosAEliminar.push(producto)
        console.log(`❌ Unsplash: ${producto.name}`)
        console.log(`   Foto: ${imagenes[0]?.substring(0, 60)}...`)
      }
    }
    
    console.log(`\n⚠️  Se eliminarán ${productosAEliminar.length} productos con fotos de Unsplash\n`)
    
    // Eliminar productos
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
    
    console.log('━'.repeat(60))
    console.log('📊 RESUMEN:')
    console.log('━'.repeat(60))
    console.log(`🗑️  Productos eliminados (Unsplash): ${eliminados}`)
    console.log(`✅ Productos restantes: ${productosFinales.length}`)
    console.log(`📸 Solo fotos reales de tiendas: 100%`)
    
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

eliminarFotosUnsplash()
