const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function importarProductos() {
  console.log('🚀 Importando productos con imágenes reales...\n')
  
  try {
    // Leer el archivo JSON con TODOS los productos
    const jsonPath = path.join(__dirname, 'catalogo-completo-importar.json')
    
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ No se encontró catalogo-completo-importar.json')
      return
    }
    
    const productos = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    console.log(`📦 Encontrados ${productos.length} productos en el JSON\n`)
    
    // Obtener el primer usuario
    const usuario = await prisma.user.findFirst()
    
    if (!usuario) {
      console.error('❌ No hay usuarios en la base de datos')
      console.log('💡 Crea un usuario primero desde: http://localhost:3000/register')
      return
    }
    
    console.log(`👤 Importando para: ${usuario.email}\n`)
    
    let importados = 0
    let actualizados = 0
    let errores = 0
    
    for (const producto of productos) {
      try {
        // Preparar datos del producto
        const productData = {
          name: producto.name,
          description: producto.description || '',
          price: producto.price,
          currency: producto.currency || 'COP',
          category: producto.category || 'PHYSICAL',
          status: producto.status || 'AVAILABLE',
          images: JSON.stringify(producto.images || []),
          tags: Array.isArray(producto.tags) ? producto.tags.join(',') : (producto.tags || ''),
          userId: usuario.id
        }
        
        // Buscar si ya existe
        const existing = await prisma.product.findFirst({
          where: {
            name: producto.name,
            userId: usuario.id
          }
        })
        
        if (existing) {
          // Actualizar
          await prisma.product.update({
            where: { id: existing.id },
            data: productData
          })
          actualizados++
          console.log(`🔄 Actualizado: ${producto.name}`)
        } else {
          // Crear nuevo
          await prisma.product.create({
            data: productData
          })
          importados++
          console.log(`✅ Importado: ${producto.name}`)
        }
        
      } catch (error) {
        errores++
        console.error(`❌ Error con ${producto.name}:`, error.message)
      }
    }
    
    console.log(`\n📊 RESUMEN:`)
    console.log(`✅ Nuevos: ${importados}`)
    console.log(`🔄 Actualizados: ${actualizados}`)
    console.log(`❌ Errores: ${errores}`)
    console.log(`📦 Total: ${importados + actualizados}`)
    
    console.log(`\n🎉 ¡Importación completada!`)
    console.log(`\n🌐 Ver productos en:`)
    console.log(`   Tienda: http://localhost:3000/tienda`)
    console.log(`   Catálogo: http://localhost:3000/catalogo`)
    console.log(`   Dashboard: http://localhost:3000/dashboard`)
    
  } catch (error) {
    console.error('❌ Error fatal:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
importarProductos()
