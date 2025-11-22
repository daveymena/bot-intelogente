/**
 * Test: Contexto Mejorado en Búsqueda de Respuestas Entrenadas
 * Verifica que el bot responda correctamente cuando el usuario pide más información
 */

import { LocalAIOnlyService } from '../src/lib/local-ai-only-service'
import { ConversationMemoryService } from '../src/lib/conversation-memory-service'

// Importar para que esté disponible
import '../src/lib/conversation-memory-service'

async function testContextoMejorado() {
  console.log('🧪 Test: Contexto Mejorado en Búsqueda de Respuestas\n')

  try {
    // Inicializar
    await LocalAIOnlyService.initialize()
    const stats = LocalAIOnlyService.getStats()
    console.log(`✅ IA Local inicializada`)
    console.log(`   - Ejemplos de entrenamiento: ${stats.trainingDataSize}`)
    console.log(`   - Productos: ${stats.productsCount}\n`)

    // Simular conversación
    const userId = 'test-user-123'
    const from = '573136174267@s.whatsapp.net'
    const conversationId = 'conv-123'

    console.log('📝 Simulando conversación:\n')

    // Mensaje 1: Usuario pregunta por curso de piano
    console.log('👤 Usuario: "Tienes curso de piano?"')
    const response1 = await LocalAIOnlyService.processMessage(
      'Tienes curso de piano?',
      userId,
      [],
      from
    )
    console.log(`🤖 Bot: ${response1.message}`)
    console.log(`   Intención: ${response1.intent}`)
    console.log(`   Confianza: ${(response1.confidence * 100).toFixed(0)}%\n`)

    // Guardar el producto en memoria (simulando que el bot lo hizo)
    ConversationMemoryService.setLastProduct(userId, from, {
      id: 'piano-001',
      name: 'Curso de Piano',
      description: 'Curso completo de piano para principiantes',
      price: 65000
    })
    console.log('💾 Producto guardado en memoria\n')

    // Simular que el usuario pregunta más información
    console.log('👤 Usuario: "Me das más información"')
    
    // Aquí es donde debería usar el contexto
    const response2 = await LocalAIOnlyService.processMessage(
      'Me das más información',
      userId,
      [
        { role: 'user', content: 'Tienes curso de piano?' },
        { role: 'assistant', content: response1.message }
      ],
      from
    )
    console.log(`🤖 Bot: ${response2.message}`)
    console.log(`   Intención: ${response2.intent}`)
    console.log(`   Confianza: ${(response2.confidence * 100).toFixed(0)}%\n`)

    // Verificar que la respuesta es sobre piano, no sobre descuentos
    if (response2.message.toLowerCase().includes('piano') || 
        response2.message.toLowerCase().includes('curso')) {
      console.log('✅ CORRECTO: La respuesta es sobre el curso de piano')
    } else if (response2.message.toLowerCase().includes('descuento')) {
      console.log('❌ ERROR: La respuesta es sobre descuentos, no sobre piano')
    } else {
      console.log('⚠️ ADVERTENCIA: La respuesta no menciona piano ni descuentos')
    }

    console.log('\n✅ Test completado')
  } catch (error) {
    console.error('❌ Error en test:', error)
  }
}

testContextoMejorado()
