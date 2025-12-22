/**
 * Test del SalesAgentSimple
 * Prueba la lógica del agente de ventas simplificado
 */

import { getSalesAgent } from '../src/lib/sales-agent-simple'

async function testSalesAgent() {
  console.log('🧪 Iniciando pruebas del SalesAgentSimple...\n')
  
  const agent = getSalesAgent()
  const testPhone = '573001234567'
  
  // Pruebas de diferentes intenciones
  const testCases = [
    { message: 'Hola', expected: 'greeting' },
    { message: 'Buenos días', expected: 'greeting' },
    { message: 'Tienes laptops?', expected: 'category_inquiry o product_inquiry' },
    { message: 'Quiero un curso de piano', expected: 'product_inquiry' },
    { message: 'Cuánto cuesta?', expected: 'payment_inquiry' },
    { message: 'Sí, lo quiero', expected: 'confirmation' },
    { message: 'No gracias, muy caro', expected: 'rejection' },
    { message: 'Dame más información', expected: 'more_info' },
    { message: 'Cuál es el número de contacto?', expected: 'contact_request' },
    { message: 'Gracias, hasta luego', expected: 'farewell' },
  ]
  
  for (const testCase of testCases) {
    console.log(`\n📨 Mensaje: "${testCase.message}"`)
    console.log(`   Esperado: ${testCase.expected}`)
    
    try {
      const result = await agent.processMessage(testCase.message, testPhone)
      console.log(`   ✅ Intent: ${result.intent}`)
      console.log(`   📝 Stage: ${result.salesStage}`)
      console.log(`   📸 Fotos: ${result.sendPhotos ? 'Sí' : 'No'}`)
      console.log(`   💬 Respuesta: ${result.text.substring(0, 100)}...`)
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }
  
  // Prueba de flujo completo
  console.log('\n\n🔄 Prueba de flujo completo de venta:')
  console.log('=' .repeat(50))
  
  // Limpiar contexto
  agent.clearContext(testPhone)
  
  const flowMessages = [
    'Hola, buenos días',
    'Tienes cursos de piano?',
    'Me interesa, cuéntame más',
    'Sí, lo quiero comprar',
  ]
  
  for (const msg of flowMessages) {
    console.log(`\n👤 Cliente: "${msg}"`)
    const result = await agent.processMessage(msg, testPhone)
    console.log(`🤖 Bot (${result.intent}): ${result.text.substring(0, 200)}...`)
    
    if (result.product) {
      console.log(`   📦 Producto: ${result.product.name}`)
    }
  }
  
  console.log('\n\n✅ Pruebas completadas!')
}

testSalesAgent().catch(console.error)
