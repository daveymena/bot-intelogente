/**
 * Test de búsqueda del MegaPack Golden y sistema híbrido IA
 */
import { getSalesAgent } from '../src/lib/sales-agent-simple'

async function main() {
  console.log('🔍 Iniciando test de búsqueda inteligente...\n')
  
  const agent = getSalesAgent()
  
  // Esperar carga de productos
  await new Promise(r => setTimeout(r, 2000))
  
  // Test 1: Búsqueda directa Golden
  console.log('=== TEST 1: "Me interesa el mega pack Golden" ===')
  const result1 = await agent.processMessage('Me interesa el mega pack Golden', '573001234567')
  console.log('Producto:', result1.product?.name || 'NO ENCONTRADO')
  console.log('Precio:', result1.product?.price || 'N/A')
  console.log('')
  
  // Test 2: Búsqueda que NO existe - la IA debe buscar en catálogo
  console.log('=== TEST 2: "tienes algo de cocina?" (no existe - IA debe responder) ===')
  const result2 = await agent.processMessage('tienes algo de cocina?', '573001234568')
  console.log('Respuesta:', result2.text.substring(0, 300))
  console.log('')
  
  // Test 3: Búsqueda ambigua - la IA debe sugerir del catálogo
  console.log('=== TEST 3: "quiero aprender algo nuevo" (ambiguo - IA sugiere) ===')
  const result3 = await agent.processMessage('quiero aprender algo nuevo', '573001234569')
  console.log('Respuesta:', result3.text.substring(0, 400))
  console.log('')

  // Test 4: Pregunta sobre precio específico
  console.log('=== TEST 4: "cuánto cuesta el de trading?" ===')
  const result4 = await agent.processMessage('cuánto cuesta el de trading?', '573001234570')
  console.log('Producto:', result4.product?.name || 'Buscado por IA')
  console.log('Respuesta:', result4.text.substring(0, 300))
  
  process.exit(0)
}

main().catch(e => {
  console.error('Error:', e)
  process.exit(1)
})
