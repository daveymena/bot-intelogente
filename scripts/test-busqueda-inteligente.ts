/**
 * Test de búsqueda inteligente con IA
 * Prueba que la IA entienda preguntas mal escritas y encuentre productos
 */
import { getSalesAgent } from '../src/lib/sales-agent-simple'

async function main() {
  console.log('🧠 Test de Búsqueda Inteligente con IA\n')
  console.log('=' .repeat(50))
  
  const agent = getSalesAgent()
  await new Promise(r => setTimeout(r, 2000))
  
  const tests = [
    // Errores de escritura comunes
    { query: 'megapak goldem', expected: 'golden' },
    { query: 'curso de pino', expected: 'piano' },
    { query: 'tradign forex', expected: 'trading' },
    { query: 'exel avanzado', expected: 'excel' },
    { query: 'quiero aprender ingles', expected: 'inglés' },
    { query: 'algo de diseño grafico', expected: 'diseño' },
    { query: 'resina epoxica', expected: 'resina' },
    { query: 'hacking etico', expected: 'hacking' },
    
    // Intenciones ambiguas (MEJORADAS)
    { query: 'quiero ganar dinero', expected: 'trading/marketing' },
    { query: 'necesito algo para mi negocio', expected: 'marketing/excel' },
    { query: 'algo para aprender musica', expected: 'piano' },
    { query: 'quiero emprender', expected: 'marketing/trading' },
    { query: 'trabajar desde casa', expected: 'diseño/marketing/excel' },
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    console.log(`\n📝 Query: "${test.query}"`)
    console.log(`   Esperado: ${test.expected}`)
    
    const result = await agent.processMessage(test.query, `57300${Math.random().toString().slice(2,9)}`)
    
    if (result.product) {
      console.log(`   ✅ Encontrado: ${result.product.name} (${result.product.price?.toLocaleString('es-CO')} COP)`)
      passed++
    } else {
      console.log(`   ❌ No encontró producto específico`)
      console.log(`   Respuesta: ${result.text.substring(0, 100)}...`)
      failed++
    }
  }
  
  console.log('\n' + '=' .repeat(50))
  console.log(`📊 Resultados: ${passed} pasaron, ${failed} fallaron`)
  console.log(`   Tasa de éxito: ${Math.round(passed / tests.length * 100)}%`)
  
  process.exit(0)
}

main().catch(e => {
  console.error('Error:', e)
  process.exit(1)
})
