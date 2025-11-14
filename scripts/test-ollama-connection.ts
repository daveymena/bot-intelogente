import { AIMultiProvider } from '../src/lib/ai-multi-provider'

async function testOllamaConnection() {
  console.log('🧪 Probando conexión con Ollama...\n')

  try {
    // Probar usando el sistema completo de fallback
    console.log('🔄 Probando sistema completo de IA (Groq → Ollama)...')
    const response = await AIMultiProvider.generateCompletion([
      { role: 'system', content: 'Eres un asistente útil.' },
      { role: 'user', content: 'Di "Ollama funciona correctamente" si me entiendes.' }
    ], { max_tokens: 50 })

    if (response && response.success) {
      console.log('✅ Sistema de IA funciona correctamente!')
      console.log('📄 Respuesta:', response.content)
      console.log('🤖 Modelo usado:', response.model)
      console.log('🏷️  Provider:', response.provider)

      if (response.provider === 'ollama') {
        console.log('🎉 ¡Ollama está funcionando como provider!')
      } else {
        console.log(`📝 Usando ${response.provider} como provider principal`)
      }
    } else {
      console.log('❌ El sistema de IA no respondió correctamente')
      console.log('Detalles:', response)
    }
  } catch (error) {
    console.error('❌ Error en el sistema de IA:')
    console.error((error as Error).message)

    if ((error as Error).message.includes('fetch failed')) {
      console.log('\n💡 Posibles causas:')
      console.log('1. Ollama no está ejecutándose')
      console.log('2. La URL de Ollama es incorrecta')
      console.log('3. El modelo no está descargado')
      console.log('4. Problemas de red/conectividad')
    } else if ((error as Error).message.includes('timeout')) {
      console.log('\n💡 Posibles causas:')
      console.log('1. Ollama está tardando mucho en responder')
      console.log('2. El timeout está muy bajo')
      console.log('3. El modelo es muy grande y tarda en cargar')
    } else if ((error as Error).message.includes('Todas las APIs')) {
      console.log('\n💡 Todas las APIs de IA fallaron')
      console.log('1. Verifica que Ollama esté ejecutándose')
      console.log('2. Verifica las credenciales de Groq')
      console.log('3. Revisa la conectividad de red')
    }
  }

  console.log('\n🔍 Información de configuración:')
  console.log('AI_FALLBACK_ORDER:', process.env.AI_FALLBACK_ORDER || 'groq,ollama')
  console.log('OLLAMA_BASE_URL:', process.env.OLLAMA_BASE_URL || 'https://bot-whatsapp-ollama.sqaoeo.easypanel.host')
  console.log('OLLAMA_MODEL:', process.env.OLLAMA_MODEL || 'gemma:2b')
  console.log('OLLAMA_ENABLED:', process.env.OLLAMA_ENABLED || 'true')
  console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Configurado' : '❌ No configurado')

  // Probar Ollama directamente sin el sistema de fallback
  console.log('\n🔄 Probando Ollama directamente...')
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'https://bot-whatsapp-ollama.sqaoeo.easypanel.host'
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Ollama está ejecutándose!')
      console.log('📋 Modelos disponibles:', data.models?.map((m: any) => m.name).join(', ') || 'Ninguno')
    } else {
      console.log('❌ Ollama responde pero con error:', response.status)
    }
  } catch (directError) {
    console.log('❌ Ollama no está accesible directamente')
    console.log('Error:', (directError as Error).message)
  }

  // Probar generación de respuesta con Ollama
  console.log('\n🤖 Probando generación de respuesta con Ollama...')
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'https://bot-whatsapp-ollama.sqaoeo.easypanel.host'
    const chatResponse = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gemma:2b',
        messages: [
          { role: 'system', content: 'Eres un asistente útil para un negocio de tecnología.' },
          { role: 'user', content: 'Hola, ¿qué productos ofrecen?' }
        ],
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 100
        }
      })
    })

    if (chatResponse.ok) {
      const chatData = await chatResponse.json()
      console.log('✅ Ollama generó respuesta exitosamente!')
      console.log('📝 Respuesta:', chatData.message?.content || 'Sin contenido')
      console.log('⚡ Tiempo estimado:', chatData.total_duration ? `${(chatData.total_duration / 1e9).toFixed(2)}s` : 'N/A')
    } else {
      console.log('❌ Error en generación:', chatResponse.status)
      const errorText = await chatResponse.text()
      console.log('Detalles:', errorText)
    }
  } catch (chatError) {
    console.log('❌ Error probando chat con Ollama')
    console.log('Error:', (chatError as Error).message)
  }
}

// Ejecutar el test
testOllamaConnection().catch(console.error)