import { AIService } from '../src/lib/ai-service'
import { IntelligentResponseService } from '../src/lib/intelligent-response-service'
import { db } from '../src/lib/db'

async function testRespuesta() {
  console.log('🧪 TEST DE RESPUESTA MANUAL DEL BOT')
  console.log('=' .repeat(70))

  try {
    // 1. Verificar configuración de IA
    console.log('\n1️⃣ Verificando configuración de IA...')
    const groqKey = process.env.GROQ_API_KEY
    const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
    
    console.log(`   Groq API Key: ${groqKey ? '✅ Configurada' : '❌ NO configurada'}`)
    console.log(`   Groq Model: ${groqModel}`)

    if (!groqKey) {
      console.log('\n❌ ERROR: No hay API key de Groq configurada')
      console.log('💡 Configura GROQ_API_KEY en tu archivo .env')
      return
    }

    // 2. Obtener última conversación
    console.log('\n2️⃣ Obteniendo última conversación...')
    const ultimaConversacion = await db.conversation.findFirst({
      orderBy: { lastMessageAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!ultimaConversacion) {
      console.log('❌ No hay conversaciones en la base de datos')
      return
    }

    console.log(`   Cliente: ${ultimaConversacion.customerName}`)
    console.log(`   Teléfono: ${ultimaConversacion.customerPhone}`)
    console.log(`   Mensajes: ${ultimaConversacion.messages.length}`)

    // 3. Obtener último mensaje del cliente
    const ultimoMensajeCliente = ultimaConversacion.messages.find(m => m.direction === 'INCOMING')
    
    if (!ultimoMensajeCliente) {
      console.log('❌ No hay mensajes del cliente')
      return
    }

    console.log(`   Último mensaje: "${ultimoMensajeCliente.content}"`)

    // 4. Verificar si debe responder
    console.log('\n3️⃣ Verificando si debe responder automáticamente...')
    const debeResponder = AIService.shouldAutoRespond(ultimoMensajeCliente.content)
    console.log(`   Debe responder: ${debeResponder ? '✅ SÍ' : '❌ NO'}`)

    if (!debeResponder) {
      console.log('💡 El mensaje es muy corto o es un comando, por eso no responde')
      return
    }

    // 5. Obtener historial
    console.log('\n4️⃣ Obteniendo historial de conversación...')
    const historial = await AIService.getConversationHistory(ultimaConversacion.id)
    console.log(`   Mensajes en historial: ${historial.length}`)

    // 6. Generar respuesta
    console.log('\n5️⃣ Generando respuesta con IA...')
    console.log('   ⏳ Esto puede tomar unos segundos...\n')

    const inicio = Date.now()
    
    try {
      const respuesta = await IntelligentResponseService.generateResponseWithHumanTouch(
        ultimaConversacion.userId,
        ultimoMensajeCliente.content,
        ultimaConversacion.customerPhone,
        historial
      )

      const tiempo = Date.now() - inicio

      console.log('   ✅ RESPUESTA GENERADA EXITOSAMENTE')
      console.log(`   Tiempo: ${tiempo}ms`)
      console.log(`   Complejidad: ${respuesta.complexity}`)
      console.log(`   IA Avanzada: ${respuesta.usedAdvancedAI ? 'Sí' : 'No'}`)
      console.log(`\n   📝 Respuesta:\n`)
      console.log('   ' + '-'.repeat(60))
      console.log('   ' + respuesta.message.split('\n').join('\n   '))
      console.log('   ' + '-'.repeat(60))

      console.log('\n✅ TEST EXITOSO - El bot puede generar respuestas')
      console.log('💡 Si el bot no responde en WhatsApp, el problema está en:')
      console.log('   - La conexión de WhatsApp')
      console.log('   - El manejador de mensajes (setupMessageHandlers)')
      console.log('   - El envío de mensajes (sendMessage)')

    } catch (error) {
      console.log('   ❌ ERROR GENERANDO RESPUESTA')
      console.error('   Error:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          console.log('\n💡 Problema con la API key de Groq')
          console.log('   Verifica que sea válida en: https://console.groq.com/keys')
        } else if (error.message.includes('rate limit')) {
          console.log('\n💡 Límite de tasa alcanzado')
          console.log('   Espera unos minutos o usa otra API key')
        } else if (error.message.includes('timeout')) {
          console.log('\n💡 Timeout de la IA')
          console.log('   La IA está tardando mucho, intenta de nuevo')
        }
      }
    }

  } catch (error) {
    console.error('\n❌ ERROR EN TEST:', error)
  }
}

testRespuesta()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error fatal:', error)
    process.exit(1)
  })
