/**
 * Test de generación de links de pago
 */

import { OllamaProfessionalOrchestrator } from '../src/lib/ollama-orchestrator-professional'
import { db } from '../src/lib/db'

async function testGeneracionLinks() {
  console.log('🧪 TEST DE GENERACIÓN DE LINKS\n')

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

  // Simular conversación completa
  console.log('1️⃣ Cliente: "Hola"')
  const resp1 = await OllamaProfessionalOrchestrator.processMessage('Hola', userId, history)
  console.log(`Laura: ${resp1.message}\n`)
  history.push({ role: 'user', content: 'Hola' })
  history.push({ role: 'assistant', content: resp1.message })

  console.log('2️⃣ Cliente: "Busco una laptop"')
  const resp2 = await OllamaProfessionalOrchestrator.processMessage('Busco una laptop', userId, history)
  console.log(`Laura: ${resp2.message.substring(0, 200)}...\n`)
  history.push({ role: 'user', content: 'Busco una laptop' })
  history.push({ role: 'assistant', content: resp2.message })

  console.log('3️⃣ Cliente: "Me interesa la opción 1"')
  const resp3 = await OllamaProfessionalOrchestrator.processMessage('Me interesa la opción 1', userId, history)
  console.log(`Laura: ${resp3.message}\n`)
  history.push({ role: 'user', content: 'Me interesa la opción 1' })
  history.push({ role: 'assistant', content: resp3.message })

  console.log('4️⃣ Cliente: "Genérame el link de pago"')
  const resp4 = await OllamaProfessionalOrchestrator.processMessage('Genérame el link de pago', userId, history)
  console.log(`Laura: ${resp4.message}\n`)

  // Verificar
  const mentionsGeneration = resp4.message.toLowerCase().includes('genero') || 
                             resp4.message.toLowerCase().includes('enlace') ||
                             resp4.message.toLowerCase().includes('link')

  console.log('📊 RESULTADO:')
  if (mentionsGeneration) {
    console.log('✅ Menciona que generará el link')
    console.log('✅ El sistema debe llamar a la API de MercadoPago/PayPal')
  } else {
    console.log('❌ No menciona generación de link')
  }

  await db.$disconnect()
}

testGeneracionLinks().catch(console.error)
