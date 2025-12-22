/**
 * Test simple de Ollama con contexto
 */

import { OllamaProfessionalOrchestrator } from '../src/lib/ollama-orchestrator-professional'

async function testSimple() {
  console.log('🧪 TEST SIMPLE DE CONTEXTO CON OLLAMA\n')

  // Buscar usuario real con productos
  const { db } = await import('../src/lib/db')
  const user = await db.user.findFirst({
    where: { email: 'daveymena16@gmail.com' }
  })

  if (!user) {
    console.log('❌ Usuario no encontrado')
    return
  }

  console.log(`✅ Usuario: ${user.email}`)
  console.log(`📦 ID: ${user.id}\n`)

  const userId = user.id
  const history: any[] = []

  // Test 1: Saludo
  console.log('1️⃣ Cliente: "Hola"')
  const resp1 = await OllamaProfessionalOrchestrator.processMessage(
    'Hola',
    userId,
    history
  )
  console.log(`Laura: ${resp1.message}\n`)
  
  history.push({ role: 'user', content: 'Hola' })
  history.push({ role: 'assistant', content: resp1.message })

  // Test 2: Buscar laptop
  console.log('2️⃣ Cliente: "Busco una laptop para diseño"')
  const resp2 = await OllamaProfessionalOrchestrator.processMessage(
    'Busco una laptop para diseño',
    userId,
    history
  )
  console.log(`Laura: ${resp2.message}\n`)
  
  history.push({ role: 'user', content: 'Busco una laptop para diseño' })
  history.push({ role: 'assistant', content: resp2.message })

  // Test 3: Preguntar por opción 2
  console.log('3️⃣ Cliente: "Cuéntame de la opción 2"')
  console.log('📜 Historial que ve Ollama:')
  history.forEach(msg => {
    console.log(`   ${msg.role === 'user' ? '👤' : '🤖'} ${msg.content.substring(0, 60)}...`)
  })
  console.log()
  
  const resp3 = await OllamaProfessionalOrchestrator.processMessage(
    'Cuéntame de la opción 2',
    userId,
    history
  )
  console.log(`Laura: ${resp3.message}\n`)

  // Verificar si mantiene contexto
  if (resp3.message.toLowerCase().includes('no tengo') || 
      resp3.message.toLowerCase().includes('error') ||
      resp3.message.toLowerCase().includes('no registro')) {
    console.log('❌ FALLO: Perdió el contexto')
  } else {
    console.log('✅ ÉXITO: Mantuvo el contexto')
  }
}

testSimple().catch(console.error)
