import { db } from '../src/lib/db'

async function actualizarPrecioMoto() {
  console.log('🔧 Actualizando precio de la moto Bajaj Pulsar...\n')
  
  // Buscar todas las motos Bajaj Pulsar
  const motos = await db.product.findMany({
    where: {
      name: {
        contains: 'Bajaj'
      }
    }
  })
  
  console.log(`📦 Motos encontradas: ${motos.length}\n`)
  
  motos.forEach(moto => {
    console.log(`- ${moto.name}`)
    console.log(`  Precio actual: $${moto.price.toLocaleString('es-CO')} COP`)
    console.log(`  ID: ${moto.id}\n`)
  })
  
  // Actualizar todas las motos Bajaj Pulsar a $6.500.000
  const result = await db.product.updateMany({
    where: {
      name: {
        contains: 'Bajaj'
      }
    },
    data: {
      price: 6500000
    }
  })
  
  console.log(`✅ ${result.count} motos actualizadas a $6.500.000 COP\n`)
  
  // Verificar
  const motosActualizadas = await db.product.findMany({
    where: {
      name: {
        contains: 'Bajaj'
      }
    }
  })
  
  console.log('📋 Precios actualizados:')
  motosActualizadas.forEach(moto => {
    console.log(`- ${moto.name}: $${moto.price.toLocaleString('es-CO')} COP`)
  })
  
  await db.$disconnect()
}

actualizarPrecioMoto()
