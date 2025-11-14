const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function diagnosticarFotos() {
  console.log('🔍 Diagnosticando fotos de productos...\n')
  
  try {
    const products = await prisma.product.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        images: true,
        status: true
      }
    })
    
    console.log(`📦 Total de productos: ${products.length}\n`)
    
    products.forEach((product, index) => {
      console.log(`\n--- Producto ${index + 1} ---`)
      console.log(`ID: ${product.id}`)
      console.log(`Nombre: ${product.name}`)
      console.log(`Status: ${product.status}`)
      console.log(`Tipo de images: ${typeof product.images}`)
      console.log(`Valor de images:`, product.images)
      
      // Intentar parsear
      if (product.images) {
        if (Array.isArray(product.images)) {
          console.log(`✅ Es un array con ${product.images.length} imágenes`)
          console.log(`Primera imagen:`, product.images[0])
        } else if (typeof product.images === 'string') {
          try {
            const parsed = JSON.parse(product.images)
            if (Array.isArray(parsed)) {
              console.log(`✅ Es un string JSON con ${parsed.length} imágenes`)
              console.log(`Primera imagen:`, parsed[0])
            } else {
              console.log(`⚠️ Es un string JSON pero no es array:`, parsed)
            }
          } catch {
            // Intentar split por comas
            const split = product.images.split(',')
            console.log(`✅ Es un string CSV con ${split.length} imágenes`)
            console.log(`Primera imagen:`, split[0])
          }
        }
      } else {
        console.log(`❌ No tiene imágenes`)
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

diagnosticarFotos()
