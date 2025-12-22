import { PrismaClient } from '@prisma/client'
import { AIService } from '../src/lib/ai-service'
import { ConversationContextService } from '../src/lib/conversation-context-service'

const prisma = new PrismaClient()

async function testContexto() {
  console.log('🧪 PRUEBA DE CONTEXTO DE CONVERSACIÓN\n')
  console.log('=' .repeat(60))

  try {
    // Obtener usuario de prueba
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('❌ No hay usuarios en la base de datos')
      return
    }

    console.log(`✅ Usuario: ${user.email}\n`)

    // ESCENARIO 1: Cliente pregunta por una moto
    console.log('📝 ESCENARIO 1: Pregunta inicial sobre moto')
    console.log('-'.repeat(60))
    
    const mensaje1 = 'Si estoy interesado en la moto'
    console.log(`Cliente: "${mensaje1}"`)
    
    const respuesta1 = await AIService.generateResponse(
      user.id,
      mensaje1,
      '6988129931330@lid',
      []
    )
    
    console.log(`\n🤖 Bot: ${respuesta1.message.substring(0, 150)}...`)
    console.log(`📊 Intención: ${respuesta1.intent}`)
    console.log(`📊 Confianza: ${respuesta1.confidence}`)

    // Simular historial de conversación
    const historial = [
      { role: 'user' as const, content: mensaje1 },
      { role: 'assistant' as const, content: respuesta1.message }
    ]

    console.log('\n' + '='.repeat(60))
    console.log('📝 ESCENARIO 2: Pregunta de seguimiento sobre precio')
    console.log('-'.repeat(60))
    
    const mensaje2 = 'Que precio tiene'
    console.log(`Cliente: "${mensaje2}"`)
    console.log(`📚 Historial: ${historial.length} mensajes`)
    
    const respuesta2 = await AIService.generateResponse(
      user.id,
      mensaje2,
      '6988129931330@lid',
      historial
    )
    
    console.log(`\n🤖 Bot: ${respuesta2.message.substring(0, 150)}...`)
    console.log(`📊 Intención: ${respuesta2.intent}`)
    console.log(`📊 Confianza: ${respuesta2.confidence}`)

    // Agregar al historial
    historial.push(
      { role: 'user', content: mensaje2 },
      { role: 'assistant', content: respuesta2.message }
    )

    console.log('\n' + '='.repeat(60))
    console.log('📝 ESCENARIO 3: Pregunta sobre documentos (contexto moto)')
    console.log('-'.repeat(60))
    
    const mensaje3 = 'Tienes sus papeles al día?'
    console.log(`Cliente: "${mensaje3}"`)
    console.log(`📚 Historial: ${historial.length} mensajes`)
    
    const respuesta3 = await AIService.generateResponse(
      user.id,
      mensaje3,
      '6988129931330@lid',
      historial
    )
    
    console.log(`\n🤖 Bot: ${respuesta3.message.substring(0, 200)}...`)
    console.log(`📊 Intención: ${respuesta3.intent}`)
    console.log(`📊 Confianza: ${respuesta3.confidence}`)

    // Verificar que NO menciona ASUS
    if (respuesta3.message.toLowerCase().includes('asus') || 
        respuesta3.message.toLowerCase().includes('vivobook')) {
      console.log('\n❌ ERROR: El bot mencionó ASUS cuando debería hablar de la moto')
    } else if (respuesta3.message.toLowerCase().includes('moto') || 
               respuesta3.message.toLowerCase().includes('bajaj') ||
               respuesta3.message.toLowerCase().includes('pulsar')) {
      console.log('\n✅ CORRECTO: El bot mantiene el contexto de la moto')
    } else {
      console.log('\n⚠️ ADVERTENCIA: El bot no mencionó ningún producto específico')
    }

    console.log('\n' + '='.repeat(60))
    console.log('📝 ESCENARIO 4: Nueva pregunta sin contexto claro')
    console.log('-'.repeat(60))
    
    const mensaje4 = 'Cuánto cuesta'
    console.log(`Cliente: "${mensaje4}"`)
    console.log(`📚 Historial: ${historial.length} mensajes`)
    
    historial.push(
      { role: 'user', content: mensaje3 },
      { role: 'assistant', content: respuesta3.message }
    )
    
    const respuesta4 = await AIService.generateResponse(
      user.id,
      mensaje4,
      '6988129931330@lid',
      historial
    )
    
    console.log(`\n🤖 Bot: ${respuesta4.message.substring(0, 150)}...`)
    console.log(`📊 Intención: ${respuesta4.intent}`)

    console.log('\n' + '='.repeat(60))
    console.log('📊 ESTADÍSTICAS DE MEMORIA')
    console.log('-'.repeat(60))
    
    const stats = ConversationContextService.getStats()
    console.log(`Total de contextos activos: ${stats.total}`)
    stats.contexts.forEach(ctx => {
      console.log(`  - ${ctx.key}: ${ctx.product} (${ctx.messages} mensajes)`)
    })

    console.log('\n' + '='.repeat(60))
    console.log('✅ PRUEBA COMPLETADA')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Error en prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testContexto()
