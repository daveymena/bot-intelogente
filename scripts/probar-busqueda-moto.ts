import { ProductIntelligenceService } from '../src/lib/product-intelligence-service'
import { db } from '../src/lib/db'

async function probarBusquedaMoto() {
  try {
    console.log('🧪 Probando búsqueda de moto...\n')

    // Obtener usuario admin
    const admin = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!admin) {
      console.log('❌ No se encontró usuario admin')
      return
    }

    console.log(`✅ Usuario: ${admin.email}\n`)

    // Probar diferentes búsquedas
    const busquedas = [
      'tienes motos?',
      'moto',
      'pulsar',
      'bajaj',
      'quiero una moto',
      'info de la moto'
    ]

    for (const busqueda of busquedas) {
      console.log(`🔍 Búsqueda: "${busqueda}"`)
      
      const producto = await ProductIntelligenceService.findProduct(busqueda, admin.id)
      
      if (producto) {
        console.log(`   ✅ Encontrado: ${producto.name}`)
        console.log(`   💰 Precio: $${producto.price.toLocaleString()}\n`)
      } else {
        console.log(`   ❌ No encontrado\n`)
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

probarBusquedaMoto()
