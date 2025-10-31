import { db } from '../src/lib/db'

async function verificarMotos() {
  try {
    const motos = await db.product.findMany({
      where: {
        name: {
          contains: 'Moto'
        }
      }
    })

    console.log(`\n🏍️  Motos encontradas: ${motos.length}\n`)

    for (const moto of motos) {
      console.log(`📦 ${moto.name}`)
      console.log(`   ID: ${moto.id}`)
      console.log(`   Precio: $${moto.price.toLocaleString()}`)
      console.log(`   Status: ${moto.status}`)
      
      if (moto.tags) {
        try {
          const tags = JSON.parse(moto.tags)
          console.log(`   Tags: ${tags.join(', ')}`)
        } catch (e) {
          console.log(`   Tags (raw): ${moto.tags}`)
        }
      }
      console.log('')
    }

    // Probar búsqueda con diferentes palabras
    console.log('🔍 Probando búsquedas:\n')
    
    const palabras = ['moto', 'pulsar', 'bajaj', 'ns160', 'ns 160']
    
    for (const palabra of palabras) {
      const resultados = await db.product.findMany({
        where: {
          OR: [
            { name: { contains: palabra, mode: 'insensitive' } },
            { description: { contains: palabra, mode: 'insensitive' } }
          ]
        }
      })
      console.log(`   "${palabra}": ${resultados.length} resultados`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

verificarMotos()
