/**
 * Test simple para verificar integración
 */

import { DeepReasoningAgent } from '../src/agents/deep-reasoning-agent';
import { SharedMemoryService } from '../src/agents/shared-memory';

async function testIntegration() {
  console.log('🧪 Test de Integración Simple\n');
  
  const chatId = `test-${Date.now()}`;
  const userId = 'test-user';
  const memoryService = SharedMemoryService.getInstance();
  const memory = memoryService.get(chatId, userId);
  
  // Test 1: Búsqueda product
  console.log('1️⃣ Test: Búsqueda de producto');
  try {
    const result1 = await DeepReasoningAgent.analyzeContext(
      chatId,
      'busco un portátil',
      memory
    );
    console.log(`   Agente: ${result1.suggestedAgent}, Intención: ${result1.userIntent.primary}`);
    console.log(`   ${result1.suggestedAgent === 'search' ? '✅ PASS' : '❌ FAIL'}\n`);
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}\n`);
  }
  
  // Test 2: Precio con producto
  console.log('2️⃣ Test: Consulta de precio (con producto)');
  memory.currentProduct = {
    id: 'test-1',
    name: 'Laptop HP',
    price: 2000000,
    category: 'laptop'
  };
  
  try {
    const result2 = await DeepReasoningAgent.analyzeContext(
      chatId,
      'cuánto cuesta?',
      memory
    );
    console.log(`   Agente: ${result2.suggestedAgent}, Intención: ${result2.userIntent.primary}`);
    console.log(`   ${result2.suggestedAgent === 'product' ? '✅ PASS' : '❌ FAIL'}\n`);
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}\n`);
  }
  
  // Test 3: Pago
  console.log('3️⃣ Test: Intención de pago');
  try {
    const result3 = await DeepReasoningAgent.analyzeContext(
      chatId,
      'quiero comprarlo',
      memory
    );
    console.log(`   Agente: ${result3.suggestedAgent}, Intención: ${result3.userIntent.primary}`);
    console.log(`   ${result3.suggestedAgent === 'payment' ? '✅ PASS' : '❌ FAIL'}\n`);
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}\n`);
  }
  
  // Test 4: Fotos
  console.log('4️⃣ Test: Solicitud de fotos');
  try {
    const result4 = await DeepReasoningAgent.analyzeContext(
      chatId,
      'tienes fotos?',
      memory
    );
    console.log(`   Agente: ${result4.suggestedAgent}, Intención: ${result4.userIntent.primary}`);
    console.log(`   ${result4.suggestedAgent === 'photo' ? '✅ PASS' : '❌ FAIL'}\n`);
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}\n`);
  }
  
  console.log('✅ Test completado');
}

testIntegration().catch(console.error);
