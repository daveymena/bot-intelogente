/**
 * 🧪 PRUEBA ESPECÍFICA: Links de Pago
 * Prueba el caso específico que mencionaste
 */

import { ReasoningService } from '../src/lib/reasoning-service'
import { AIService } from '../src/lib/ai-service'
import { db } from '../src/lib/db'

async function testLinkPago() {
  console.log('🧪 PRUEBA: "Envíame el link de pago"\n')
  console.log('=' .repeat(70))

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

  // ESCENARIO 1: Cliente pregunta por producto y luego pide link
  console.log('\n📝 ESCENARIO 1: Conversación con contexto')
  console.log('-'.repeat(70))

  const history1 = [
    { role: 'user' as const, content: 'Info del curso de piano' },
    { role: 'assistant' as const, content: 'El Curso de Piano Profesional incluye +80 lecciones...' }
  ]

  console.log('\n💬 Cliente: "Info del curso de piano"')
  console.log('🤖 Bot: [Responde con info del curso]')
  console.log('\n💬 Cliente: "Envíame el link de pago"')

  const result1 = await ReasoningService.reason(
    'Envíame el link de pago',
    userId,
    customerPhone,
    history1
  )

  console.log('\n🧠 RAZONAMIENTO:')
  result1.steps.forEach(step => {
    console.log(`\n${step.step}. ${step.thought}`)
    console.log(`   ✓ ${step.action}`)
    if (step.result) {
      if (step.result.found !== undefined) {
        console.log(`   → ${step.result.found ? `Producto: ${step.result.productName}` : step.result.reason}`)
      } else if (step.result.intent) {
        console.log(`   → Intención: ${step.result.intent}`)
      } else if (step.result.methods) {
        console.log(`   → Métodos: ${step.result.methods.join(', ')}`)
      }
    }
  })

  console.log('\n✅ DECISIÓN:')
  console.log(`   - Intención: ${result1.finalIntent}`)
  console.log(`   - Producto: ${result1.productFound?.name || 'No encontrado'}`)
  console.log(`   - Usar IA: ${result1.shouldUseAI ? 'Sí' : 'No'}`)
  console.log(`   - Confianza: ${(result1.confidence * 100).toFixed(0)}%`)

  if (result1.suggestedResponse) {
    console.log('\n💬 RESPUESTA DEL BOT:')
    console.log('─'.repeat(70))
    console.log(result1.suggestedResponse)
    console.log('─'.repeat(70))
  }

  // ESCENARIO 2: Cliente pide link sin contexto previo
  console.log('\n\n📝 ESCENARIO 2: Sin contexto previo')
  console.log('-'.repeat(70))

  console.log('\n💬 Cliente: "Envíame el link de pago"')

  const result2 = await ReasoningService.reason(
    'Envíame el link de pago',
    userId,
    customerPhone,
    []
  )

  console.log('\n🧠 RAZONAMIENTO:')
  result2.steps.forEach(step => {
    console.log(`\n${step.step}. ${step.thought}`)
    console.log(`   ✓ ${step.action}`)
    if (step.result) {
      if (step.result.found !== undefined) {
        console.log(`   → ${step.result.found ? `Producto: ${step.result.productName}` : step.result.reason}`)
      } else if (step.result.intent) {
        console.log(`   → Intención: ${step.result.intent}`)
      }
    }
  })

  console.log('\n✅ DECISIÓN:')
  console.log(`   - Intención: ${result2.finalIntent}`)
  console.log(`   - Producto: ${result2.productFound?.name || 'No encontrado'}`)
  console.log(`   - Usar IA: ${result2.shouldUseAI ? 'Sí' : 'No'}`)

  if (result2.suggestedResponse) {
    console.log('\n💬 RESPUESTA DEL BOT:')
    console.log('─'.repeat(70))
    console.log(result2.suggestedResponse)
    console.log('─'.repeat(70))
  } else {
    console.log('\n💬 RESPUESTA DEL BOT:')
    console.log('─'.repeat(70))
    console.log('(Usará IA para preguntar de qué producto)')
    console.log('─'.repeat(70))
  }

  // ESCENARIO 3: Variaciones de la pregunta
  console.log('\n\n📝 ESCENARIO 3: Variaciones de la pregunta')
  console.log('-'.repeat(70))

  const variations = [
    'Dame el link',
    'Cuál es el link de pago',
    'Link de pago del producto',
    'Envía el enlace',
    'Cómo pago?',
    'Métodos de pago'
  ]

  const history3 = [
    { role: 'user' as const, content: 'Tienes el curso de piano?' },
    { role: 'assistant' as const, content: 'Sí, el Curso de Piano cuesta $60.000 COP' }
  ]

  for (const variation of variations) {
    console.log(`\n💬 Cliente: "${variation}"`)
    
    const result = await ReasoningService.reason(
      variation,
      userId,
      customerPhone,
      history3
    )

    console.log(`   → Intención: ${result.finalIntent}`)
    console.log(`   → Producto: ${result.productFound?.name || 'No encontrado'}`)
    console.log(`   → Respuesta: ${result.shouldUseAI ? 'Usar IA' : 'Directa'}`)
  }

  console.log('\n\n✅ PRUEBAS COMPLETADAS')
  console.log('=' .repeat(70))
}

// Ejecutar
testLinkPago()
  .then(() => {
    console.log('\n✅ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
