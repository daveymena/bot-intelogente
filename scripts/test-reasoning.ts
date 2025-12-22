/**
 * 🧪 SCRIPT DE PRUEBA: Sistema de Razonamiento Profundo
 * Prueba el análisis paso a paso del bot
 */

import { ReasoningService } from '../src/lib/reasoning-service'
import { db } from '../src/lib/db'

async function testReasoning() {
  console.log('🧠 PRUEBA DE RAZONAMIENTO PROFUNDO\n')
  console.log('=' .repeat(60))

  // Obtener cualquier usuario disponible
  const user = await db.user.findFirst({
    orderBy: { createdAt: 'asc' }
  })

  if (!user) {
    console.error('❌ No hay usuarios en la base de datos')
    console.log('\n💡 Crea un usuario primero:')
    console.log('   npx tsx scripts/create-admin.ts')
    return
  }

  console.log(`✅ Usuario encontrado: ${user.email}\n`)

  const userId = user.id
  const customerPhone = '+573042748687'

  // Casos de prueba
  const testCases = [
    {
      name: 'Saludo simple',
      message: 'Hola',
      history: []
    },
    {
      name: 'Pregunta por precio (sin contexto)',
      message: 'Cuánto cuesta?',
      history: []
    },
    {
      name: 'Pregunta por precio (con contexto)',
      message: 'Cuánto cuesta?',
      history: [
        { role: 'user' as const, content: 'Info del curso de piano' },
        { role: 'assistant' as const, content: 'El curso de piano incluye...' }
      ]
    },
    {
      name: 'Pedir link de pago (sin contexto)',
      message: 'Dame el link de pago',
      history: []
    },
    {
      name: 'Pedir link de pago (con contexto)',
      message: 'Envíame el link',
      history: [
        { role: 'user' as const, content: 'Info del curso de piano' },
        { role: 'assistant' as const, content: 'El curso de piano cuesta $60.000...' }
      ]
    },
    {
      name: 'Pregunta directa sobre producto',
      message: 'Info del curso de piano',
      history: []
    },
    {
      name: 'Pregunta sobre métodos de pago',
      message: 'Cómo puedo pagar el curso de piano?',
      history: []
    },
    {
      name: 'Pregunta compleja que requiere IA',
      message: 'Cuál es la diferencia entre la laptop ASUS y la MacBook?',
      history: []
    },
    {
      name: 'Pregunta con pronombre (necesita contexto)',
      message: 'Cuál es el link de ese?',
      history: [
        { role: 'user' as const, content: 'Tienes laptops?' },
        { role: 'assistant' as const, content: 'Sí, tenemos ASUS VivoBook...' }
      ]
    }
  ]

  for (const testCase of testCases) {
    console.log(`\n\n📝 CASO: ${testCase.name}`)
    console.log(`💬 Mensaje: "${testCase.message}"`)
    console.log(`📚 Historial: ${testCase.history.length} mensajes`)
    console.log('-'.repeat(60))

    try {
      const result = await ReasoningService.reason(
        testCase.message,
        userId,
        customerPhone,
        testCase.history
      )

      // Mostrar proceso de razonamiento
      console.log('\n🧠 PROCESO DE RAZONAMIENTO:')
      result.steps.forEach(step => {
        console.log(`\n${step.step}. ${step.thought}`)
        console.log(`   Acción: ${step.action}`)
        if (step.result) {
          console.log(`   Resultado:`, JSON.stringify(step.result, null, 2))
        }
      })

      console.log('\n✅ DECISIÓN FINAL:')
      console.log(`   - Intención: ${result.finalIntent}`)
      console.log(`   - Confianza: ${(result.confidence * 100).toFixed(0)}%`)
      console.log(`   - Producto: ${result.productFound ? result.productFound.name : 'No encontrado'}`)
      console.log(`   - Usar IA: ${result.shouldUseAI ? 'Sí' : 'No (respuesta directa)'}`)
      
      if (result.suggestedResponse) {
        console.log('\n💬 RESPUESTA SUGERIDA:')
        console.log(result.suggestedResponse)
      }

    } catch (error) {
      console.error('❌ Error:', error)
    }

    console.log('\n' + '='.repeat(60))
  }

  console.log('\n\n✅ Pruebas completadas')
}

// Ejecutar
testReasoning()
  .then(() => {
    console.log('\n✅ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
