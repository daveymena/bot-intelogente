/**
 * Test: Flujo Real de Contexto
 * Simula una conversación real sin guardar manualmente el producto
 */

import { LocalAIOnlyService } from '../src/lib/local-ai-only-service'
import { ConversationMemoryService } from '../src/lib/conversation-memory-service'

async function testFlujoRealContexto() {
  console.log('🧪 Test: Flujo Real de Contexto\n')

  try {
    // Inicializar
    await LocalAIOnlyService.initialize()
    const stats = LocalAIOnlyService.getStats()
    console.log(`✅ IA Local inicializada`)
    console.log(`   - Ejemplos de entrenamiento: ${stats.trainingDataSize}`)
    console.log(`   - Productos: ${stats.productsCount}\n`)

    // Simular conversación
    const userId = 'test-user-456'
    const from = '573136174268@s.whatsapp.net'

    console.log('📝 Simulando conversación REAL (sin guardar manualmente):\n')

    // Mensaje 1: Usuario pregunta por curso de piano
    console.log('👤 Usuario: "Tienes curso de piano?"')
    const response1 = await LocalAIOnlyService.processMessage(
      'Tienes curso de piano?',
      userId,
      [],
      from
    )
    console.log(`🤖 Bot: ${response1.message.substring(0, 100)}...`)
    console.log(`   Intención: ${response1.intent}`)
    console.log(`   Confianza: ${(response1.confidence * 100).toFixed(0)}%\n`)

    // Verificar que se guardó en memoria
    const savedProduct = ConversationMemoryService.getLastProduct(userId, from)
    console.log(`💾 Producto en memoria: ${savedProduct ? savedProduct.name : 'NINGUNO'}\n`)

    // Mensaje 2: Usuario pregunta más información
    console.log('👤 Usuario: "Me das más información"')
    const response2 = await LocalAIOnlyService.processMessage(
      'Me das más información',
      userId,
      [
        { role: 'user', content: 'Tienes curso de piano?' },
        { role: 'assistant', content: response1.message }
      ],
      from
    )
    console.log(`🤖 Bot: ${response2.message.substring(0, 100)}...`)
    console.log(`   Intención: ${response2.intent}`)
    console.log(`   Confianza: ${(response2.confidence * 100).toFixed(0)}%\n`)

    // Verificar resultado
    if (response2.message.toLowerCase().includes('piano') || 
        response2.message.toLowerCase().includes('curso')) {
      console.log('✅ CORRECTO: La respuesta es sobre el curso de piano')
    } else if (response2.message.toLowerCase().includes('descuento')) {
      console.log('❌ ERROR: La respuesta es sobre descuentos')
    } else {
      console.log('⚠️ ADVERTENCIA: La respuesta no menciona piano')
    }

    // Mensaje 3: Otra pregunta sobre el mismo producto
    console.log('\n👤 Usuario: "¿Cuál es el precio?"')
    const response3 = await LocalAIOnlyService.processMessage(
      '¿Cuál es el precio?',
      userId,
      [
        { role: 'user', content: 'Tienes curso de piano?' },
        { role: 'assistant', content: response1.message },
        { role: 'user', content: 'Me das más información' },
        { role: 'assistant', content: response2.message }
      ],
      from
    )
    console.log(`🤖 Bot: ${response3.message.substring(0, 100)}...`)
    console.log(`   Intención: ${response3.intent}`)
    console.log(`   Confianza: ${(response3.confidence * 100).toFixed(0)}%\n`)

    if (response3.message.toLowerCase().includes('piano') || 
        response3.message.toLowerCase().includes('precio') ||
        response3.message.toLowerCase().includes('curso')) {
      console.log('✅ CORRECTO: La respuesta es sobre el precio del curso')
    } else {
      console.log('⚠️ ADVERTENCIA: La respuesta no menciona el precio del curso')
    }

    console.log('\n✅ Test completado')
  } catch (error) {
    console.error('❌ Error en test:', error)
  }
}

testFlujoRealContexto()
