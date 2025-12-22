const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function limpiarDuplicadosYVerificarFotos() {
  console.log('🧹 Limpiando productos duplicados y verificando fotos...\n')
  
  try {
    // Buscar el usuario
    const usuario = await prisma.user.findFirst({
      where: { email: 'daveymena16@gmail.com' }
    })
    
    if (!usuario) {
      console.error('❌ Usuario no encontrado')
      return
    }
    
    console.log(`👤 Usuario: ${usuario.email}\n`)
    
    // Obtener todos los productos del usuario
    const productos = await prisma.product.findMany({
      where: { userId: usuario.id },
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`📦 Total productos encontrados: ${productos.length}\n`)
    
    // Agrupar por nombre para encontrar duplicados
    const productosPorNombre = {}
    
    productos.forEach(producto => {
      const nombre = producto.name.trim()
      if (!productosPorNombre[nombre]) {
        productosPorNombre[nombre] = []
      }
      productosPorNombre[nombre].push(producto)
    })
    
    let duplicadosEliminados = 0
    let sinFotos = 0
    let conFotos = 0
    
    console.log('🔍 Procesando productos...\n')
    
    // Procesar cada grupo de productos
    for (const [nombre, grupo] of Object.entries(productosPorNombre)) {
      if (grupo.length > 1) {
        // Hay duplicados
        console.log(`🔄 Duplicado encontrado: "${nombre}" (${grupo.length} copias)`)
        
        // Encontrar el mejor producto (el que tenga fotos)
        let mejorProducto = grupo[0]
        let mejorCantidadFotos = 0
        
        grupo.forEach(p => {
          let imagenes = []
          try {
            imagenes = JSON.parse(p.images || '[]')
          } catch (e) {
            imagenes = []
          }
          
          if (imagenes.length > mejorCantidadFotos) {
            mejorProducto = p
            mejorCantidadFotos = imagenes.length
          }
        })
        
        // Eliminar los duplicados (mantener el mejor)
        for (const producto of grupo) {
          if (producto.id !== mejorProducto.id) {
            await prisma.product.delete({
              where: { id: producto.id }
            })
            duplicadosEliminados++
            console.log(`   ❌ Eliminado duplicado (ID: ${producto.id})`)
          }
        }
        
        console.log(`   ✅ Mantenido: ID ${mejorProducto.id} con ${mejorCantidadFotos} fotos\n`)
      }
      
      // Verificar fotos del producto final
      const productoFinal = grupo.length > 1 ? 
        await prisma.product.findUnique({ where: { id: grupo.find(p => p.id)?.id } }) : 
        grupo[0]
      
      if (productoFinal) {
        let imagenes = []
        try {
          imagenes = JSON.parse(productoFinal.images || '[]')
        } catch (e) {
          imagenes = []
        }
        
        if (imagenes.length === 0) {
          sinFotos++
        } else {
          conFotos++
        }
      }
    }
    
    // Resumen final
    const productosFinales = await prisma.product.findMany({
      where: { userId: usuario.id }
    })
    
    console.log('━'.repeat(50))
    console.log('📊 RESUMEN:')
    console.log('━'.repeat(50))
    console.log(`🗑️  Duplicados eliminados: ${duplicadosEliminados}`)
    console.log(`📦 Productos únicos finales: ${productosFinales.length}`)
    console.log(`📸 Con fotos: ${conFotos}`)
    console.log(`⚠️  Sin fotos: ${sinFotos}`)
    
    // Listar productos sin fotos
    if (sinFotos > 0) {
      console.log('\n⚠️  PRODUCTOS SIN FOTOS:')
      console.log('━'.repeat(50))
      
      for (const producto of productosFinales) {
        let imagenes = []
        try {
          imagenes = JSON.parse(producto.images || '[]')
        } catch (e) {
          imagenes = []
        }
        
        if (imagenes.length === 0) {
          console.log(`   - ${producto.name}`)
        }
      }
    }
    
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

limpiarDuplicadosYVerificarFotos()
