/**
 * 🧪 TEST: Reasoning Service con Multi-Provider
 * Verificar que el sistema de razonamiento profundo usa AIMultiProvider con Ollama
 */

import { ReasoningService } from '../src/lib/reasoning-service'
import { db } from '../src/lib/db'

async function testReasoningWithMultiProvider() {
  console.log('🧠 PROBANDO REASONING SERVICE CON MULTI-PROVIDER\n')
  console.log('=' .repeat(60))

  try {
    // Obtener usuario de prueba
    const user = await db.user.findFirst()
    if (!user) {
      console.error('❌ No hay usuarios en la base de datos')
      return
    }

    const userId = user.id
    const customerPhone = '+573001234567'

    // Casos de prueba
    const testCases = [
      {
        name: 'Saludo simple',
        message: 'Hola',
        expectDirectResponse: true
      },
      {
        name: 'Pregunta por precio (necesita contexto)',
        message: 'Cuánto cuesta?',
        expectDirectResponse: false,
        previousMessage: 'Me interesa el curso de piano'
      },
      {
        name: 'Solicitud de link de pago',
        message: 'Dame el link de pago',
        expectDirectResponse: true,
        previousMessage: 'Quiero el curso de piano'
      },
      {
        name: 'Pregunta compleja sobre producto',
        message: 'Qué incluye el curso y cómo puedo acceder después de pagar?',
        expectDirectResponse: false,
        previousMessage: 'Me interesa el curso de piano'
      }
    ]

    for (const testCase of testCases) {
      console.log(`\n📝 TEST: ${testCase.name}`)
      console.log('-'.repeat(60))

      // Construir historial si hay mensaje previo
      const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
      if (testCase.previousMessage) {
        conversationHistory.push({
          role: 'user',
          content: testCase.previousMessage
        })
        conversationHistory.push({
          role: 'assistant',
          content: 'Claro, el Curso de Piano Profesional es excelente...'
        })
      }

      // PASO 1: Razonamiento
      console.log(`\n🧠 Analizando: "${testCase.message}"`)
      const reasoning = await ReasoningService.reason(
        testCase.message,
        userId,
        customerPhone,
        conversationHistory
      )

      console.log(`\n📊 RESULTADO DEL RAZONAMIENTO:`)
      console.log(`   Intención: ${reasoning.finalIntent}`)
      console.log(`   Confianza: ${(reasoning.confidence * 100).toFixed(0)}%`)
      console.log(`   Producto encontrado: ${reasoning.productFound ? reasoning.productFound.name : 'No'}`)
      console.log(`   Usar IA: ${reasoning.shouldUseAI ? 'Sí' : 'No'}`)
      console.log(`   Tiene respuesta directa: ${reasoning.suggestedResponse ? 'Sí' : 'No'}`)

      // Mostrar pasos de razonamiento
      console.log(`\n🔍 PASOS:`)
      reasoning.steps.forEach(step => {
        console.log(`   ${step.step}. ${step.thought}`)
        if (step.result) {
          console.log(`      → ${JSON.stringify(step.result)}`)
        }
      })

      // PASO 2: Generar respuesta
      console.log(`\n💬 GENERANDO RESPUESTA...`)
      const response = await ReasoningService.generateAIResponse(
        testCase.message,
        userId,
        customerPhone,
        reasoning,
        conversationHistory
      )

      console.log(`\n✅ RESPUESTA FINAL:`)
      console.log(`   ${response.substring(0, 200)}${response.length > 200 ? '...' : ''}`)

      // Verificar expectativas
      if (testCase.expectDirectResponse && reasoning.shouldUseAI) {
        console.log(`\n⚠️  ADVERTENCIA: Se esperaba respuesta directa pero usó IA`)
      } else if (!testCase.expectDirectResponse && !reasoning.shouldUseAI) {
        console.log(`\n⚠️  ADVERTENCIA: Se esperaba usar IA pero dio respuesta directa`)
      } else {
        console.log(`\n✅ Comportamiento esperado`)
      }

      console.log('\n' + '='.repeat(60))
    }

    console.log(`\n\n🎉 PRUEBAS COMPLETADAS`)
    console.log(`\n📝 RESUMEN:`)
    console.log(`   - El ReasoningService analiza la intención del mensaje`)
    console.log(`   - Busca productos en mensaje, memoria o historial`)
    console.log(`   - Decide si usar respuesta directa o AIMultiProvider`)
    console.log(`   - Cuando usa IA, pasa por el sistema multi-provider con Ollama`)

  } catch (error) {
    console.error('❌ Error en prueba:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar prueba
testReasoningWithMultiProvider()
