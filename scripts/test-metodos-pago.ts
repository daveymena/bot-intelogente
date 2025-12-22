/**
 * Test específico de métodos de pago
 */

import { OllamaProfessionalOrchestrator } from '../src/lib/ollama-orchestrator-professional'
import { db } from '../src/lib/db'

async function testMetodosPago() {
  console.log('🧪 TEST DE MÉTODOS DE PAGO\n')

  // Buscar usuario
  const user = await db.user.findFirst({
    where: { email: 'daveymena16@gmail.com' }
  })

  if (!user) {
    console.log('❌ Usuario no encontrado')
    return
  }

  console.log(`✅ Usuario: ${user.email}\n`)

  const userId = user.id
  const history: any[] = []

  // Test 1: Pregunta directa de pago
  console.log('1️⃣ Cliente: "Cómo puedo pagar?"')
  const resp1 = await OllamaProfessionalOrchestrator.processMessage(
    'Cómo puedo pagar?',
    userId,
    history
  )
  console.log(`Laura: ${resp1.message}`)
  console.log(`Fuente: ${resp1.source} | Confianza: ${resp1.confidence}%\n`)
  
  history.push({ role: 'user', content: 'Cómo puedo pagar?' })
  history.push({ role: 'assistant', content: resp1.message })

  // Test 2: Variación
  console.log('2️⃣ Cliente: "Qué métodos de pago tienen?"')
  const resp2 = await OllamaProfessionalOrchestrator.processMessage(
    'Qué métodos de pago tienen?',
    userId,
    []
  )
  console.log(`Laura: ${resp2.message}`)
  console.log(`Fuente: ${resp2.source} | Confianza: ${resp2.confidence}%\n`)

  // Test 3: Generar link
  console.log('3️⃣ Cliente: "Genérame el link de pago"')
  const resp3 = await OllamaProfessionalOrchestrator.processMessage(
    'Genérame el link de pago',
    userId,
    []
  )
  console.log(`Laura: ${resp3.message}`)
  console.log(`Fuente: ${resp3.source} | Confianza: ${resp3.confidence}%\n`)

  // Verificar
  const hasPaymentMethods = (msg: string) => {
    const lower = msg.toLowerCase()
    return lower.includes('mercadopago') && 
           lower.includes('paypal') && 
           (lower.includes('nequi') || lower.includes('daviplata'))
  }

  console.log('📊 RESULTADOS:')
  console.log(`Test 1: ${hasPaymentMethods(resp1.message) ? '✅' : '❌'} Menciona métodos`)
  console.log(`Test 2: ${hasPaymentMethods(resp2.message) ? '✅' : '❌'} Menciona métodos`)
  console.log(`Test 3: ${resp3.message.toLowerCase().includes('link') || resp3.message.toLowerCase().includes('enlace') ? '✅' : '❌'} Menciona link`)

  await db.$disconnect()
}

testMetodosPago().catch(console.error)
