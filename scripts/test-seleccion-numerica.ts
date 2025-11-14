import { createGroqHybridSystem } from '../src/lib/hybrid-intelligent-response-system'

async function testSeleccionNumerica() {
  console.log('🧪 Probando selección numérica...\n')
  
  const groqApiKey = process.env.GROQ_API_KEY
  if (!groqApiKey) {
    console.error('❌ GROQ_API_KEY no encontrada')
    return
  }
  
  const system = await createGroqHybridSystem(groqApiKey)
  const userId = 'cmhpw941q0000kmp85qvjm0o5'
  const from = 'test@test.com'
  
  // Simular conversación
  const history: any[] = []
  
  // Mensaje 1: Cliente pregunta por computadores
  console.log('👤 Cliente: "Hola, tienes computadores?"')
  const response1 = await system.processMessage(
    'Hola, tienes computadores?',
    userId,
    history,
    from
  )
  console.log('🤖 Bot:', response1)
  console.log('\n' + '='.repeat(60) + '\n')
  
  history.push(
    { role: 'user', content: 'Hola, tienes computadores?' },
    { role: 'assistant', content: response1 }
  )
  
  // Esperar un poco
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mensaje 2: Cliente selecciona opción 3
  console.log('👤 Cliente: "un pc básico con el número 3"')
  const response2 = await system.processMessage(
    'un pc básico con el número 3',
    userId,
    history,
    from
  )
  console.log('🤖 Bot:', response2)
  console.log('\n' + '='.repeat(60) + '\n')
}

testSeleccionNumerica().catch(console.error)
