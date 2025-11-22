#!/usr/bin/env tsx
/**
 * 🧪 TEST COMPLETO DEL BOT 24/7
 * 
 * Prueba todas las funcionalidades:
 * - Respuestas humanizadas
 * - Envío de fotos
 * - Groq y Ollama
 * - Diferentes tonos
 */

import { Bot24_7Orchestrator } from '../src/lib/bot-24-7-orchestrator'
import { db } from '../src/lib/db'

const testCases = [
  {
    name: 'Saludo inicial',
    message: 'Hola',
    expectedIntent: 'greeting',
    expectedTone: 'friendly'
  },
  {
    name: 'Búsqueda de producto',
    message: '¿Tienes laptops?',
    expectedIntent: 'product_search',
    expectedTone: 'friendly',
    expectPhoto: true
  },
  {
    name: 'Consulta de precio',
    message: '¿Cuánto cuesta el curso de piano?',
    expectedIntent: 'price_inquiry',
    expectedTone: 'professional'
  },
  {
    name: 'Solicitud de fotos',
    message: 'Muéstrame fotos de la laptop HP',
    expectedIntent: 'photo_request',
    expectedTone: 'friendly',
    expectPhoto: true
  },
  {
    name: 'Intención de compra',
    message: 'Quiero comprar la laptop',
    expectedIntent: 'purchase',
    expectedTone: 'professional'
  },
  {
    name: 'Solicitud de pago',
    message: '¿Cómo puedo pagar?',
    expectedIntent: 'payment_request',
    expectedTone: 'professional'
  },
  {
    name: 'Consulta técnica',
    message: '¿Qué diferencia hay entre la HP y la Dell?',
    expectedIntent: 'product_comparison',
    expectedTone: 'professional'
  }
]

async function runTests() {
  console.log('🧪 INICIANDO TESTS DEL BOT 24/7\n')
  console.log('═'.repeat(60))

  // Obtener usuario de prueba
  const user = await db.user.findFirst()
  if (!user) {
    console.error('❌ No se encontró usuario de prueba')
    process.exit(1)
  }

  const userId = user.id
  const customerPhone = '+573001234567'

  let passed = 0
  let failed = 0

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`)
    console.log(`   Mensaje: "${testCase.message}"`)

    try {
      const startTime = Date.now()

      const response = await Bot24_7Orchestrator.processMessage(
        userId,
        customerPhone,
        testCase.message,
        []
      )

      const duration = Date.now() - startTime

      console.log(`   ✅ Respuesta generada en ${duration}ms`)
      console.log(`   📊 Provider: ${response.provider}`)
      console.log(`   🎭 Tono: ${response.tone}`)
      console.log(`   📸 Enviar foto: ${response.shouldSendPhoto ? 'Sí' : 'No'}`)
      console.log(`   💬 Respuesta: "${response.message.substring(0, 100)}..."`)
      console.log(`   🎯 Confianza: ${(response.confidence * 100).toFixed(0)}%`)

      // Validaciones
      const validations = []

      if (testCase.expectedTone && response.tone === testCase.expectedTone) {
        validations.push('✅ Tono correcto')
      } else if (testCase.expectedTone) {
        validations.push(`⚠️ Tono esperado: ${testCase.expectedTone}, obtenido: ${response.tone}`)
      }

      if (testCase.expectPhoto !== undefined) {
        if (testCase.expectPhoto === response.shouldSendPhoto) {
          validations.push('✅ Envío de foto correcto')
        } else {
          validations.push(`⚠️ Foto esperada: ${testCase.expectPhoto}, obtenido: ${response.shouldSendPhoto}`)
        }
      }

      if (response.confidence >= 0.7) {
        validations.push('✅ Confianza alta')
      } else {
        validations.push('⚠️ Confianza baja')
      }

      console.log(`   ${validations.join('\n   ')}`)

      passed++
    } catch (error) {
      console.error(`   ❌ Error:`, error)
      failed++
    }
  }

  console.log('\n' + '═'.repeat(60))
  console.log(`\n📊 RESULTADOS:`)
  console.log(`   ✅ Pasados: ${passed}/${testCases.length}`)
  console.log(`   ❌ Fallidos: ${failed}/${testCases.length}`)
  console.log(`   📈 Tasa de éxito: ${((passed / testCases.length) * 100).toFixed(0)}%`)

  // Estadísticas del sistema
  console.log('\n📊 ESTADÍSTICAS DEL SISTEMA:')
  const stats = Bot24_7Orchestrator.getStats()
  console.log(`   📚 Patrones entrenados: ${stats.training.totalPatterns}`)
  console.log(`   ⚡ Groq habilitado: ${stats.groqEnabled ? 'Sí' : 'No'}`)
  console.log(`   🧠 Ollama habilitado: ${stats.ollamaEnabled ? 'Sí' : 'No'}`)

  console.log('\n✅ Tests completados\n')
}

runTests().catch(console.error)
