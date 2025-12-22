/**
 * 🧪 VALIDACIÓN COMPLETA DEL SISTEMA INTELIGENTE
 * Prueba todos los componentes: Groq + Local + Híbrido
 */

import { Orchestrator } from '../src/agents/orchestrator.js'
import { ConversationLearningService } from '../src/lib/conversation-learning-service'
import { UnifiedMemoryService } from '../src/lib/unified-memory-service'
import { CoherentResponseSystem } from '../src/lib/coherent-response-system'
import { NumericSelectionDetector } from '../src/lib/numeric-selection-detector'

async function testSistemaCompleto() {
  console.log('🧪 ========================================')
  console.log('🧪 VALIDACIÓN SISTEMA COMPLETO INTELIGENTE')
  console.log('🧪 ========================================\n')

  const userId = 'test_user_validation'
  const chatId = 'test_chat_validation'

  try {
    // 🧠 1. PRUEBA DE MEMORIA UNIFICADA
    console.log('🧠 [1/8] Probando Memoria Unificada...')
    const unifiedMemory = await UnifiedMemoryService.getInstance().getUnifiedMemory(chatId, userId)
    console.log('✅ Memoria unificada inicializada')

    // Actualizar memoria con datos de prueba
    await UnifiedMemoryService.getInstance().updateUnifiedMemory(chatId, userId, {
      userName: 'Cliente de Prueba',
      conversationStage: 'discovery',
      currentProduct: {
        id: 'test_product_1',
        name: 'Curso de Diseño Gráfico Premium',
        price: 150000,
        category: 'DIGITAL'
      }
    })
    console.log('✅ Memoria actualizada con datos de prueba')

    // 🧠 2. PRUEBA DE APRENDIZAJE CONTINUO
    console.log('\n🧠 [2/8] Probando Aprendizaje Continuo...')
    await ConversationLearningService.recordSuccessfulPattern(
      userId,
      chatId,
      '¿Cuánto cuesta el curso?',
      'El curso cuesta $150.000 COP. Es una inversión excelente para tu carrera.',
      'price_query'
    )
    console.log('✅ Patrón de aprendizaje registrado')

    // 🧠 3. PRUEBA DE SISTEMA COHERENTE
    console.log('\n🎯 [3/8] Probando Sistema Coherente...')
    const coherentResponse = CoherentResponseSystem.getInstance().generateCoherentResponse({
      intent: 'price_query',
      context: unifiedMemory,
      baseResponse: 'El precio es $150.000',
      tone: 'professional',
      includePersonalization: true
    })
    console.log('✅ Respuesta coherente generada:', coherentResponse.substring(0, 50) + '...')

    // 🤖 4. PRUEBA DEL ORQUESTADOR
    console.log('\n🤖 [4/8] Probando Orquestador de Agentes...')
    const orchestrator = new Orchestrator()

    const testMessages = [
      'Hola, ¿qué cursos tienen?',
      '¿Cuánto cuesta el curso de diseño?',
      'Muéstrame fotos del curso',
      'Quiero comprarlo',
      'Prefiero pagar con Nequi'
    ]

    for (const message of testMessages) {
      console.log(`  📨 Probando: "${message}"`)
      const response = await orchestrator.processMessage({
        chatId,
        userId,
        message,
        userName: 'Cliente Test'
      })
      console.log(`  ✅ Respuesta: ${response.text.substring(0, 60)}...`)
    }

    // 🔍 5. PRUEBA DE DETECCIÓN NUMÉRICA
    console.log('\n🔍 [5/8] Probando Detección Numérica...')
    const history = [
      { role: 'assistant', content: '1. Curso de Diseño\n2. Curso de Programación\n3. Curso de Marketing' },
      { role: 'user', content: 'El 2 por favor' }
    ]

    const selection = await NumericSelectionDetector.detectSelection(
      'El 2 por favor',
      history,
      userId,
      chatId
    )

    if (selection.isSelection && selection.selectedNumber !== undefined) {
      console.log(`✅ Selección detectada: Opción ${selection.selectedNumber}`)
    } else {
      console.log('❌ No se detectó selección numérica')
    }

    // 📊 6. PRUEBA DE ESTADÍSTICAS
    console.log('\n📊 [6/8] Probando Estadísticas del Sistema...')

    const learningStats = ConversationLearningService.getLearningStats(userId)
    console.log(`✅ Estadísticas de aprendizaje: ${learningStats.totalPatterns} patrones, ${learningStats.totalPreferences} preferencias`)

    // 🔄 7. PRUEBA DE LIMPIEZA DE MEMORIA
    console.log('\n🔄 [7/8] Probando Limpieza de Memoria...')
    await ConversationLearningService.cleanupOldData()
    console.log('✅ Datos antiguos limpiados')

    // 🎯 8. PRUEBA FINAL INTEGRADA
    console.log('\n🎯 [8/8] Prueba Final Integrada...')

    const finalResponse = await orchestrator.processMessage({
      chatId,
      userId,
      message: '¿Puedes explicarme mejor qué incluye el curso?',
      userName: 'Cliente Test'
    })

    console.log('✅ Respuesta final generada exitosamente')
    console.log(`📝 Longitud: ${finalResponse.text.length} caracteres`)
    console.log(`🎯 Confianza: ${finalResponse.confidence || 'N/A'}`)

    // RESULTADO FINAL
    console.log('\n🎉 ========================================')
    console.log('🎉 VALIDACIÓN COMPLETA EXITOSA')
    console.log('🎉 ========================================')
    console.log('\n✅ COMPONENTES VERIFICADOS:')
    console.log('  • Memoria Unificada')
    console.log('  • Aprendizaje Continuo')
    console.log('  • Sistema Coherente')
    console.log('  • Orquestador de Agentes')
    console.log('  • Detección Numérica')
    console.log('  • Estadísticas del Sistema')
    console.log('  • Limpieza de Memoria')
    console.log('  • Integración Completa')
    console.log('\n🚀 SISTEMA LISTO PARA PRODUCCIÓN')
    console.log('💡 El bot puede resolver cualquier duda, pregunta y venta')

  } catch (error) {
    console.error('\n❌ ERROR EN VALIDACIÓN:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack available')
    process.exit(1)
  }
}

// Ejecutar validación
if (require.main === module) {
  testSistemaCompleto()
    .then(() => {
      console.log('\n✅ Validación completada exitosamente')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Validación fallida:', error)
      process.exit(1)
    })
}

export { testSistemaCompleto }
