/**
 * TEST DEL BOT SIMPLE
 * 
 * Este script prueba el nuevo sistema simplificado
 */

const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

// Simular el servicio simple (versión JS para testing)
class SimpleAIServiceTest {
  static async test() {
    console.log('\n🧪 ========================================')
    console.log('🧪 PROBANDO BOT SIMPLE')
    console.log('🧪 ========================================\n')

    // Obtener usuario de prueba
    const user = await db.user.findFirst()
    if (!user) {
      console.log('❌ No hay usuarios en la base de datos')
      return
    }

    console.log(`✅ Usuario encontrado: ${user.email}`)

    // Conversaciones de prueba
    const conversaciones = [
      {
        titulo: 'Saludo inicial',
        mensaje: 'Hola'
      },
      {
        titulo: 'Pregunta por curso de piano',
        mensaje: 'Tienes curso de piano?'
      },
      {
        titulo: 'Pregunta por precio',
        mensaje: 'Cuánto cuesta?'
      },
      {
        titulo: 'Solicita link de pago',
        mensaje: 'Dame el link para comprar'
      },
      {
        titulo: 'Pregunta por laptop',
        mensaje: 'Info de la laptop más barata'
      },
      {
        titulo: 'Pregunta por moto',
        mensaje: 'Tienes motos?'
      }
    ]

    for (const conv of conversaciones) {
      console.log(`\n📝 ${conv.titulo}`)
      console.log(`👤 Cliente: "${conv.mensaje}"`)
      console.log(`⏱️  Procesando...`)
      
      const inicio = Date.now()
      
      try {
        // Aquí iría la llamada al servicio real
        // const respuesta = await SimpleAIService.generateResponse(...)
        
        // Por ahora simulamos la búsqueda
        const producto = await this.buscarProductoSimple(conv.mensaje, user.id)
        
        const tiempo = Date.now() - inicio
        
        if (producto) {
          console.log(`✅ Producto encontrado: ${producto.name}`)
          console.log(`💰 Precio: ${producto.price.toLocaleString('es-CO')} COP`)
          console.log(`⏱️  Tiempo: ${tiempo}ms`)
        } else {
          console.log(`❌ No se encontró producto`)
          console.log(`⏱️  Tiempo: ${tiempo}ms`)
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`)
      }
      
      console.log(`${'─'.repeat(50)}`)
    }

    console.log('\n✅ Test completado\n')
  }

  static async buscarProductoSimple(message, userId) {
    const msg = message.toLowerCase()
    
    // Extraer keywords
    const keywords = []
    if (msg.includes('piano')) keywords.push('piano')
    if (msg.includes('laptop') || msg.includes('computador')) keywords.push('laptop', 'vivobook', 'asus')
    if (msg.includes('moto')) keywords.push('moto', 'pulsar', 'bajaj')
    if (msg.includes('curso')) keywords.push('curso')
    if (msg.includes('megapack') || msg.includes('pack')) keywords.push('mega', 'pack')

    // Buscar por keywords
    for (const keyword of keywords) {
      const producto = await db.product.findFirst({
        where: {
          userId,
          status: 'AVAILABLE',
          name: {
            contains: keyword,
            mode: 'insensitive'
          }
        }
      })
      
      if (producto) return producto
    }

    return null
  }
}

// Ejecutar test
SimpleAIServiceTest.test()
  .then(() => {
    console.log('✅ Test finalizado')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Error en test:', error)
    process.exit(1)
  })
