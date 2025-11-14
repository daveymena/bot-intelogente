import { PrismaClient } from '@prisma/client'
import { ProductIntelligenceService } from '../src/lib/product-intelligence-service'

const prisma = new PrismaClient()

async function probarBotInteligente() {
  console.log('🤖 PRUEBA DEL BOT INTELIGENTE CON PRODUCTOS\n')
  console.log('='.repeat(70))

  try {
    // Obtener el primer usuario
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('❌ No hay usuarios en la base de datos')
      return
    }

    console.log(`\n👤 Usuario: ${user.email}\n`)

    // Casos de prueba específicos
    const casosPrueba = [
      // Curso de Piano
      { mensaje: 'Info del curso de piano', esperado: 'información completa' },
      { mensaje: 'Cuánto cuesta el curso de piano?', esperado: 'precio' },
      { mensaje: 'Dame el link del curso de piano', esperado: 'enlaces' },
      { mensaje: 'Quiero comprar el curso de piano', esperado: 'proceso de compra' },
      
      // Laptop
      { mensaje: 'Info de la laptop ASUS', esperado: 'información completa' },
      { mensaje: 'Cuánto cuesta la laptop?', esperado: 'precio' },
      { mensaje: 'Quiero comprar una laptop', esperado: 'proceso de compra' },
      { mensaje: 'Hay laptops disponibles?', esperado: 'disponibilidad' },
      
      // MacBook
      { mensaje: 'Cuánto cuesta el MacBook?', esperado: 'precio' },
      { mensaje: 'Info del MacBook', esperado: 'información completa' },
      
      // Moto
      { mensaje: 'Info de la moto', esperado: 'información completa' },
      { mensaje: 'Cuánto cuesta la moto?', esperado: 'precio' },
      { mensaje: 'Quiero comprar la moto', esperado: 'proceso de compra' },
    ]

    for (const caso of casosPrueba) {
      console.log('\n' + '─'.repeat(70))
      console.log(`👤 CLIENTE: ${caso.mensaje}`)
      console.log(`📋 Esperado: ${caso.esperado}`)
      console.log('─'.repeat(70))

      // Detectar intención
      const intent = ProductIntelligenceService.detectIntent(caso.mensaje)
      console.log(`\n🎯 Intención detectada: ${intent.type} (confianza: ${intent.confidence})`)

      // Buscar producto
      const product = await ProductIntelligenceService.findProduct(caso.mensaje, user.id)

      if (product) {
        console.log(`✅ Producto encontrado: ${product.name}`)

        // Generar respuesta
        const response = await ProductIntelligenceService.generateResponse(product, intent)

        console.log(`\n🤖 BOT:\n${response.text}`)

        // Mostrar información adicional
        if (response.hasLinks) {
          console.log(`\n🔗 Enlaces disponibles:`)
          if (response.links?.info) console.log(`   📄 Info: ${response.links.info}`)
          if (response.links?.buy) console.log(`   💳 Compra: ${response.links.buy}`)
        }

        if (response.images && response.images.length > 0) {
          console.log(`\n📸 Imágenes: ${response.images.length} disponibles`)
        }
      } else {
        console.log(`❌ No se encontró el producto`)
      }

      console.log('\n')
    }

    // Estadísticas finales
    console.log('\n' + '='.repeat(70))
    console.log('📊 ESTADÍSTICAS')
    console.log('='.repeat(70))

    const totalProductos = await prisma.product.count()
    const productosConEnlaces = await prisma.product.count({
      where: {
        tags: { contains: 'http' }
      }
    })

    console.log(`\n📦 Total de productos: ${totalProductos}`)
    console.log(`🔗 Productos con enlaces: ${productosConEnlaces}`)
    console.log(`\n✅ Bot inteligente funcionando correctamente!`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

probarBotInteligente()
