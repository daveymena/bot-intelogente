const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function arreglarImagenes() {
  console.log('🔧 Arreglando imágenes de productos...\n')
  
  try {
    // Obtener todos los productos
    const products = await prisma.product.findMany()
    
    console.log(`📦 Total de productos: ${products.length}\n`)
    
    let actualizados = 0
    
    for (const product of products) {
      let needsUpdate = false
      let newImages = product.images
      
      // Si tiene imágenes
      if (product.images) {
        try {
          // Si es string, parsearlo
          if (typeof product.images === 'string') {
            const parsed = JSON.parse(product.images)
            
            // Si es array vacío o tiene URLs de ejemplo, limpiar
            if (Array.isArray(parsed)) {
              if (parsed.length === 0) {
                newImages = null
                needsUpdate = true
                console.log(`🧹 ${product.name}: Array vacío → null`)
              } else {
                // Filtrar URLs de ejemplo
                const validImages = parsed.filter(img => 
                  img && 
                  !img.includes('example.com') && 
                  img.trim() !== ''
                )
                
                if (validImages.length === 0) {
                  newImages = null
                  needsUpdate = true
                  console.log(`🧹 ${product.name}: URLs de ejemplo → null`)
                } else if (validImages.length !== parsed.length) {
                  newImages = JSON.stringify(validImages)
                  needsUpdate = true
                  console.log(`✂️ ${product.name}: Filtradas ${parsed.length - validImages.length} URLs inválidas`)
                }
              }
            }
          }
        } catch (error) {
          console.log(`⚠️ ${product.name}: Error parseando images, limpiando...`)
          newImages = null
          needsUpdate = true
        }
      }
      
      // Actualizar si es necesario
      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: { images: newImages }
        })
        actualizados++
      }
    }
    
    console.log(`\n✅ Productos actualizados: ${actualizados}`)
    console.log(`\n💡 Ahora los productos sin imágenes mostrarán el placeholder SVG`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

arreglarImagenes()
