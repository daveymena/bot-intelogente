import { ProductIntelligenceService } from '../src/lib/product-intelligence-service'
import { db } from '../src/lib/db'

async function debugBusqueda() {
  const user = await db.user.findFirst()
  if (!user) {
    console.log('No user found')
    return
  }

  console.log(`User ID: ${user.id}`)
  
  // Primero verificar el producto
  const piano = await db.product.findFirst({
    where: { name: { contains: 'Piano' } }
  })
  
  if (piano) {
    console.log(`Producto en BD: "${piano.name}"`)
    console.log(`Product User ID: ${piano.userId}`)
    console.log(`Status: ${piano.status}`)
    console.log(`Match: ${piano.userId === user.id}`)
  }
  
  // Verificar cuántos productos AVAILABLE hay
  const available = await db.product.count({
    where: { userId: user.id, status: 'AVAILABLE' }
  })
  console.log(`Productos AVAILABLE del user: ${available}`)
  
  console.log('\n---\n')

  const mensaje = "Dame el link del curso de piano"
  console.log(`Mensaje: "${mensaje}"`)
  
  const producto = await ProductIntelligenceService.findProduct(mensaje, user.id)
  
  if (producto) {
    console.log(`✅ Producto encontrado: ${producto.name}`)
  } else {
    console.log(`❌ No se encontró producto`)
  }
  
  await db.$disconnect()
}

debugBusqueda()
