#!/usr/bin/env tsx
/**
 * 🎭 TEST DE RESPUESTAS HUMANIZADAS
 * 
 * Prueba la generación de respuestas con diferentes tonos
 */

import { HumanizedResponseGenerator } from '../src/lib/humanized-response-generator'

const testCases = [
  {
    name: 'Saludo casual',
    message: 'Hola',
    tone: 'casual' as const,
    intent: 'greeting'
  },
  {
    name: 'Consulta profesional',
    message: '¿Cuánto cuesta la laptop HP?',
    tone: 'professional' as const,
    intent: 'price_inquiry',
    product: {
      name: 'Laptop HP 15-dy2795wm',
      price: 2500000,
      description: 'Laptop potente con Intel Core i5'
    }
  },
  {
    name: 'Solicitud amigable',
    message: '¿Tienes fotos del curso de piano?',
    tone: 'friendly' as const,
    intent: 'photo_request',
    product: {
      name: 'Curso Piano Profesional Completo',
      price: 60000,
      description: 'Curso 100% en línea con +80 lecciones'
    }
  }
]

async function runTests() {
  console.log('🎭 TESTING RESPUESTAS HUMANIZADAS\n')
  console.log('═'.repeat(60))

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`)
    console.log(`   Mensaje: "${testCase.message}"`)
    console.log(`   Tono: ${testCase.tone}`)
    console.log(`   Intención: ${testCase.intent}`)

    try {
      const startTime = Date.now()

      const response = await HumanizedResponseGenerator.generateWithGroq(
        testCase.message,
        {
          productName: testCase.product?.name,
          productPrice: testCase.product?.price,
          productDescription: testCase.product?.description,
          intent: testCase.intent,
          tone: testCase.tone
        }
      )

      const duration = Date.now() - startTime

      console.log(`   ✅ Generado en ${duration}ms`)
      console.log(`   🎭 Tono aplicado: ${response.tone}`)
      console.log(`   📸 Enviar foto: ${response.shouldSendPhoto ? 'Sí' : 'No'}`)
      console.log(`   🎯 Confianza: ${(response.confidence * 100).toFixed(0)}%`)
      console.log(`\n   💬 Respuesta:\n   ${response.message.split('\n').join('\n   ')}`)

      // Generar variaciones
      console.log(`\n   🔄 Generando variaciones...`)
      const variations = HumanizedResponseGenerator.generateVariations(response.message)
      console.log(`   ✅ ${variations.length} variaciones generadas`)

      for (let i = 0; i < Math.min(2, variations.length); i++) {
        console.log(`\n   Variación ${i + 1}:\n   ${variations[i].split('\n').join('\n   ')}`)
      }

    } catch (error) {
      console.error(`   ❌ Error:`, error)
    }
  }

  console.log('\n' + '═'.repeat(60))
  console.log('\n✅ Tests de respuestas humanizadas completados\n')
}

runTests().catch(console.error)
