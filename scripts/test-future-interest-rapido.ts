/**
 * Test rápido de detección future_interest vs confirmation
 * Verifica que el bot NO envíe métodos de pago cuando el cliente dice "te aviso"
 */

import { SalesAgentSimple } from '@/lib/sales-agent-simple'

async function testRapido() {
  console.log('🧪 TEST RÁPIDO: future_interest vs confirmation')
  console.log('='.repeat(60))
  
  const agent = new SalesAgentSimple()
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const testCases = [
    // DEBE ser future_interest (NO enviar métodos de pago)
    { msg: 'Vale gracias te aviso', expected: 'future_interest' },
    { msg: 'Ok luego te confirmo', expected: 'future_interest' },
    { msg: 'Perfecto, más tarde te digo', expected: 'future_interest' },
    { msg: 'Bueno, después te escribo', expected: 'future_interest' },
    { msg: 'Lo voy a pensar y te aviso', expected: 'future_interest' },
    
    // DEBE ser confirmation o payment_method_selected (SÍ enviar métodos de pago)
    { msg: 'Sí lo quiero', expected: 'confirmation' },
    { msg: 'Dale lo compro', expected: 'confirmation' },
    { msg: 'Listo lo quiero', expected: 'confirmation' },
    { msg: 'Pásame los datos de pago', expected: 'payment_method_selected' },
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of testCases) {
    const phone = `test_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    
    try {
      const result = await agent.processMessage(test.msg, phone)
      const success = result.intent === test.expected
      
      if (success) {
        console.log(`✅ "${test.msg}" → ${result.intent}`)
        passed++
      } else {
        console.log(`❌ "${test.msg}"`)
        console.log(`   Esperado: ${test.expected}, Obtenido: ${result.intent}`)
        failed++
      }
    } catch (error: any) {
      console.log(`❌ ERROR: "${test.msg}" - ${error.message}`)
      failed++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log(`📊 RESULTADOS: ${passed}/${passed + failed} pasaron`)
  
  if (failed === 0) {
    console.log('🎉 ¡TODOS LOS TESTS PASARON!')
  } else {
    console.log(`⚠️ ${failed} tests fallaron`)
  }
  
  process.exit(failed > 0 ? 1 : 0)
}

testRapido().catch(console.error)
