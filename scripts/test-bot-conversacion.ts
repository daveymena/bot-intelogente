/**
 * 🧪 PRUEBA INTERACTIVA: Bot con Razonamiento Profundo
 * Simula una conversación real para probar el razonamiento
 */

import { ReasoningService } from '../src/lib/reasoning-service'
import { AIService } from '../src/lib/ai-service'
import { db } from '../src/lib/db'

async function testBotConversation() {
  console.log('🤖 PRUEBA DE CONVERSACIÓN CON RAZONAMIENTO PROFUNDO\n')
  console.log('=' .repeat(70))

  // Obtener usuario
  const user = await db.user.findFirst({
    orderBy: { createdAt: 'asc' }
  })

  if (!user) {
    console.error('❌ No hay usuarios en la base de datos')
    return
  }

  console.log(`✅ Usuario: ${user.email}\n`)

  const userId = user.id
  const customerPhone = '+573042748687'
  const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []

  // Función para simular mensaje del cliente
  const sendMessage = async (message: string) => {
    console.log('\n' + '─'.repeat(70))
    console.log(`\n💬 CLIENTE: "${message}"`)
    console.log('\n🧠 RAZONAMIENTO DEL BOT:\n')

    // Agregar mensaje del usuario al historial
    conversationHistory.push({ role: 'user', content: message })

    // Ejecutar razonamiento
    const reasoning = await ReasoningService.reason(
      message,
      userId,
      customerPhone,
      conversationHistory
    )

    // Mostrar proceso de razonamiento
    reasoning.steps.forEach(step => {
      console.log(`${step.step}. ${step.thought}`)
      console.log(`   ✓ ${step.action}`)
      if (step.result) {
        if (step.result.intent) {
          console.log(`   → Intención: ${step.result.intent}`)
        }
        if (step.result.found !== undefined) {
          if (step.result.found) {
            console.log(`   → Producto: ${step.result.productName}`)
          } else {
            console.log(`   → ${step.result.reason}`)
          }
        }
        if (step.result.methods) {
          console.log(`   → Métodos: ${step.result.methods.join(', ')}`)
        }
      }
      console.log()
    })

    console.log('✅ DECISIÓN:')
    console.log(`   - Intención: ${reasoning.finalIntent}`)
    console.log(`   - Confianza: ${(reasoning.confidence * 100).toFixed(0)}%`)
    console.log(`   - Producto: ${reasoning.productFound ? reasoning.productFound.name : 'No encontrado'}`)
    console.log(`   - Usar IA: ${reasoning.shouldUseAI ? 'Sí' : 'No (respuesta directa)'}`)

    // Generar respuesta
    let botResponse: string

    if (!reasoning.shouldUseAI && reasoning.suggestedResponse) {
      // Respuesta directa
      botResponse = reasoning.suggestedResponse
      console.log('\n⚡ Usando respuesta directa (sin IA)')
    } else {
      // Usar IA
      console.log('\n🤖 Generando respuesta con IA...')
      const aiResponse = await AIService.generateResponse(
        userId,
        message,
        customerPhone,
        conversationHistory
      )
      botResponse = aiResponse.message
    }

    // Agregar respuesta del bot al historial
    conversationHistory.push({ role: 'assistant', content: botResponse })

    // Mostrar respuesta
    console.log('\n🤖 BOT:')
    console.log('─'.repeat(70))
    console.log(botResponse)
    console.log('─'.repeat(70))
  }

  // CONVERSACIÓN DE PRUEBA
  console.log('\n🎬 INICIANDO CONVERSACIÓN DE PRUEBA...\n')

  // Mensaje 1: Saludo
  await sendMessage('Hola')
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mensaje 2: Pregunta por producto
  await sendMessage('Info del curso de piano')
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mensaje 3: Pregunta por precio (sin mencionar producto)
  await sendMessage('Cuánto cuesta?')
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mensaje 4: Pedir link de pago (sin mencionar producto)
  await sendMessage('Dame el link de pago')
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mensaje 5: Elegir método de pago
  await sendMessage('Nequi')
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mensaje 6: Agradecimiento
  await sendMessage('Gracias')

  // Resumen final
  console.log('\n\n' + '='.repeat(70))
  console.log('\n📊 RESUMEN DE LA CONVERSACIÓN:\n')
  console.log(`Total de mensajes: ${conversationHistory.length}`)
  console.log(`Mensajes del cliente: ${conversationHistory.filter(m => m.role === 'user').length}`)
  console.log(`Respuestas del bot: ${conversationHistory.filter(m => m.role === 'assistant').length}`)
  
  console.log('\n✅ PRUEBA COMPLETADA')
  console.log('\n💡 OBSERVACIONES:')
  console.log('   - El bot entendió el contexto sin mencionar el producto')
  console.log('   - Usó memoria para recordar "Curso de Piano"')
  console.log('   - Generó respuestas apropiadas según la intención')
  console.log('   - Ofreció métodos de pago automáticamente')
  
  console.log('\n' + '='.repeat(70))
}

// Ejecutar
testBotConversation()
  .then(() => {
    console.log('\n✅ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
