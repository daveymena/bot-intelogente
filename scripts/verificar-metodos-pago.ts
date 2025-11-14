import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verificarMetodosPago() {
  console.log('🔍 Verificando métodos de pago en productos...\n')

  try {
    const productos = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        tags: true,
        price: true,
        currency: true
      }
    })

    if (productos.length === 0) {
      console.log('❌ No hay productos en la base de datos')
      return
    }

    console.log(`📦 Total de productos: ${productos.length}\n`)

    for (const producto of productos) {
      console.log(`\n📌 ${producto.name}`)
      console.log(`   💰 Precio: $${producto.price.toLocaleString()} ${producto.currency}`)
      
      // Parsear tags
      let tags: string[] = []
      if (producto.tags) {
        try {
          // Si es un string JSON
          tags = JSON.parse(producto.tags)
        } catch {
          // Si es un string separado por comas
          tags = producto.tags.split(',').map(t => t.trim())
        }
      }

      if (tags.length === 0) {
        console.log('   ⚠️  NO tiene métodos de pago configurados')
        continue
      }

      console.log('   💳 Métodos de pago encontrados:')
      
      // Analizar cada tag
      const metodosPago = tags.filter(tag => {
        const tieneMetodo = tag.includes(':')
        if (tieneMetodo) {
          const [tipo, valor] = tag.split(':')
          console.log(`      ✅ ${tipo}: ${valor}`)
        }
        return tieneMetodo
      })

      if (metodosPago.length === 0) {
        console.log('      ⚠️  Tags encontrados pero ninguno es método de pago')
        console.log(`      📝 Tags actuales: ${tags.join(', ')}`)
      }
    }

    console.log('\n\n📊 RESUMEN:')
    const conMetodos = productos.filter(p => {
      if (!p.tags) return false
      try {
        const tags = JSON.parse(p.tags)
        return tags.some((t: string) => t.includes(':'))
      } catch {
        const tags = p.tags.split(',').map(t => t.trim())
        return tags.some(t => t.includes(':'))
      }
    })

    console.log(`✅ Productos con métodos de pago: ${conMetodos.length}`)
    console.log(`⚠️  Productos sin métodos de pago: ${productos.length - conMetodos.length}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarMetodosPago()
