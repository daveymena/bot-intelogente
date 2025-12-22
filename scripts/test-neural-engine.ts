/**
 * Test: Motor de Conversación Neural con Datos Reales
 * Prueba el motor con flujos conversacionales reales de Tecnovariedades D&S
 */

import { NeuralConversationEngine } from '../src/lib/neural-conversation-engine'

async function testNeuralEngine() {
  console.log('🧠 Test: Motor de Conversación Neural - DATOS REALES\n')

  try {
    // Inicializar
    await NeuralConversationEngine.initialize()
    const stats = NeuralConversationEngine.getStats()
    console.log(`✅ Motor inicializado`)
    console.log(`   - Flujos entrenados: ${stats.flujos_entrenados}`)
    console.log(`   - Patrones neuronales: ${stats.patrones_neuronales}\n`)

    // Simular conversación
    const userId = 'test-neural-real-001'
    const from = '573136174269@s.whatsapp.net'

    console.log('📝 Simulando conversación REAL con Motor Neural:\n')

    // Conversación 1: Búsqueda de Megapack
    console.log('👤 Usuario: "Hola, vi su publicación del Megapack de Piano"')
    let result = await NeuralConversationEngine.processMessage(
      'Hola, vi su publicación del Megapack de Piano',
      userId,
      from
    )
    console.log(`🤖 Bot: ${result.respuesta.substring(0, 100)}...`)
    console.log(`   Intención: ${result.intención}`)
    console.log(`   Confianza: ${(result.confianza * 100).toFixed(0)}%`)
    console.log(`   Producto: ${result.memoria_actualizada.producto_actual}\n`)

    // Conversación 2: Preguntar precio
    console.log('👤 Usuario: "¿Cuánto cuesta?"')
    result = await NeuralConversationEngine.processMessage(
      '¿Cuánto cuesta?',
      userId,
      from
    )
    console.log(`🤖 Bot: ${result.respuesta.substring(0, 100)}...`)
    console.log(`   Intención: ${result.intención}`)
    console.log(`   Confianza: ${(result.confianza * 100).toFixed(0)}%\n`)

    // Conversación 3: Compra
    console.log('👤 Usuario: "Quiero comprar el Megapack de Piano"')
    result = await NeuralConversationEngine.processMessage(
      'Quiero comprar el Megapack de Piano',
      userId,
      from
    )
    console.log(`🤖 Bot: ${result.respuesta.substring(0, 100)}...`)
    console.log(`   Intención: ${result.intención}`)
    console.log(`   Confianza: ${(result.confianza * 100).toFixed(0)}%\n`)

    // Conversación 4: Método de pago
    console.log('👤 Usuario: "Por Nequi"')
    result = await NeuralConversationEngine.processMessage(
      'Por Nequi',
      userId,
      from
    )
    console.log(`🤖 Bot: ${result.respuesta.substring(0, 100)}...`)
    console.log(`   Intención: ${result.intención}`)
    console.log(`   Confianza: ${(result.confianza * 100).toFixed(0)}%\n`)

    // Conversación 5: Búsqueda de Laptop
    console.log('👤 Usuario: "¿Tienen laptops disponibles?"')
    result = await NeuralConversationEngine.processMessage(
      '¿Tienen laptops disponibles?',
      userId,
      from
    )
    console.log(`🤖 Bot: ${result.respuesta.substring(0, 100)}...`)
    console.log(`   Intención: ${result.intención}`)
    console.log(`   Confianza: ${(result.confianza * 100).toFixed(0)}%`)
    console.log(`   Producto: ${result.memoria_actualizada.producto_actual}\n`)

    // Conversación 6: Especificaciones
    console.log('👤 Usuario: "La HP, ¿qué especificaciones tiene?"')
    result = await NeuralConversationEngine.processMessage(
      'La HP, ¿qué especificaciones tiene?',
      userId,
      from
    )
    console.log(`🤖 Bot: ${result.respuesta.substring(0, 100)}...`)
    console.log(`   Intención: ${result.intención}`)
    console.log(`   Confianza: ${(result.confianza * 100).toFixed(0)}%\n`)

    // Conversación 7: Satisfacción
    console.log('👤 Usuario: "Me encantó el Megapack de Piano"')
    result = await NeuralConversationEngine.processMessage(
      'Me encantó el Megapack de Piano',
      userId,
      from
    )
    console.log(`🤖 Bot: ${result.respuesta.substring(0, 100)}...`)
    console.log(`   Intención: ${result.intención}`)
    console.log(`   Confianza: ${(result.confianza * 100).toFixed(0)}%`)
    console.log(`   Sentimiento: ${result.memoria_actualizada.sentimiento_usuario}\n`)

    // Conversación 8: Recomendación
    console.log('👤 Usuario: "¿Qué otro Megapack me recomiendas?"')
    result = await NeuralConversationEngine.processMessage(
      '¿Qué otro Megapack me recomiendas?',
      userId,
      from
    )
    console.log(`🤖 Bot: ${result.respuesta.substring(0, 100)}...`)
    console.log(`   Intención: ${result.intención}`)
    console.log(`   Confianza: ${(result.confianza * 100).toFixed(0)}%\n`)

    console.log('✅ Test completado')
    console.log(`\n📊 Estadísticas finales:`)
    const statsFinales = NeuralConversationEngine.getStats()
    console.log(`   - Usuarios activos: ${statsFinales.usuarios_activos}`)
    console.log(`   - Patrones neuronales: ${statsFinales.patrones_neuronales}`)
    console.log(`   - Flujos entrenados: ${statsFinales.flujos_entrenados}`)
  } catch (error) {
    console.error('❌ Error en test:', error)
  }
}

testNeuralEngine()
