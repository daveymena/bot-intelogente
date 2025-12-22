import { AIService } from '../src/lib/ai-service'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function probarIADinamica() {
  console.log('🤖 PRUEBA DE IA DINÁMICA - Respuestas Naturales\n')
  console.log('='.repeat(70))

  try {
    // Obtener usuario con productos
    const user = await prisma.user.findFirst({
      where: {
        products: {
          some: {
            name: { contains: 'Piano' }
          }
        }
      }
    })

    if (!user) {
      console.log('❌ No se encontró usuario con productos')
      return
    }

    console.log(`\n👤 Usuario: ${user.email}\n`)

    // Casos de prueba con conversaciones naturales
    const conversaciones = [
      {
        titulo: 'Consulta sobre Curso de Piano',
        mensajes: [
          'Hola, me interesa el curso de piano',
          'Cuánto cuesta?',
          'Dame el link para comprarlo'
        ]
      },
      {
        titulo: 'Consulta sobre Laptop',
        mensajes: [
          'Busco una laptop ASUS',
          'Qué características tiene?',
          'Está disponible?'
        ]
      },
      {
        titulo: 'Consulta sobre MacBook',
        mensajes: [
          'Info del MacBook',
          'Es muy caro, tienes algo más económico?',
          'Ok, quiero el MacBook'
        ]
      }
    ]

    for (const conv of conversaciones) {
      console.log('\n' + '='.repeat(70))
      console.log(`📱 ${conv.titulo}`)
      console.log('='.repeat(70))

      const historial: Array<{ role: 'user' | 'assistant'; content: string }> = []

      for (const mensaje of conv.mensajes) {
        console.log(`\n👤 CLIENTE: ${mensaje}`)
        console.log('─'.repeat(70))

        try {
          const respuesta = await AIService.generateResponse(
            user.id,
            mensaje,
            '+573001234567',
            historial
          )

          console.log(`\n🤖 BOT (IA Dinámica):\n${respuesta.message}`)
          console.log(`\n📊 Confianza: ${respuesta.confidence} | Intención: ${respuesta.intent || 'general'}`)

          // Agregar al historial para mantener contexto
          historial.push({ role: 'user', content: mensaje })
          historial.push({ role: 'assistant', content: respuesta.message })

        } catch (error) {
          console.error(`\n❌ Error: ${error}`)
        }

        // Pausa entre mensajes
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log('\n' + '='.repeat(70))
    console.log('✅ Prueba completada')
    console.log('='.repeat(70))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

probarIADinamica()
