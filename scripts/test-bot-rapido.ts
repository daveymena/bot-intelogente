import { SalesAgentSimple } from '@/lib/sales-agent-simple'

async function test() {
  console.log('Iniciando test...')
  try {
    const agent = new SalesAgentSimple()
    console.log('Agent creado')
    
    await new Promise(r => setTimeout(r, 1000))
    console.log('Esperando productos...')
    
    const result = await agent.processMessage('hola', 'test_' + Date.now())
    console.log('✅ Respuesta:', result.text.substring(0, 150))
    console.log('Intent:', result.intent)
  } catch(e: any) {
    console.log('❌ ERROR:', e.message)
    console.log('Stack:', e.stack?.split('\n').slice(0, 5).join('\n'))
  }
  process.exit(0)
}

test()
