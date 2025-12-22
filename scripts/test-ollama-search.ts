/**
 * Test de búsqueda FORZANDO uso de Ollama
 */

import { SearchAgent } from '../src/agents/search-agent';
import { SharedMemory } from '../src/agents/shared-memory';

async function testOllamaSearch() {
  console.log('\n🦙 TEST: Búsqueda con Ollama FORZADO\n');
  
  const searchAgent = new SearchAgent();
  
  // Crear memoria simulada
  const memory: SharedMemory = {
    chatId: 'test-chat',
    userId: 'test-user',
    messages: [],
    interestedProducts: [],
    currentProduct: undefined,
    lastInteraction: new Date(),
    context: {}
  };
  
  // Test 1: Búsqueda específica
  console.log('📝 Test 1: "Curso de Piano"');
  console.log('─'.repeat(50));
  
  try {
    const response1 = await searchAgent.execute('Curso de Piano', memory);
    console.log('✅ Respuesta:', response1.text.substring(0, 200));
    console.log('📊 Confianza:', response1.confidence);
    console.log('🎯 Producto actual:', memory.currentProduct?.name || 'Ninguno');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n' + '─'.repeat(50) + '\n');
  
  // Test 2: Búsqueda con contexto
  console.log('📝 Test 2: "Busco laptop para diseño"');
  console.log('─'.repeat(50));
  
  try {
    const response2 = await searchAgent.execute('Busco laptop para diseño', memory);
    console.log('✅ Respuesta:', response2.text.substring(0, 200));
    console.log('📊 Confianza:', response2.confidence);
    console.log('🎯 Productos encontrados:', memory.interestedProducts?.length || 0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n' + '─'.repeat(50) + '\n');
  
  // Test 3: Verificar que NO usa lógica local
  console.log('📝 Test 3: Verificar que canHandleLocally() = false');
  console.log('─'.repeat(50));
  
  const canHandle = searchAgent.canHandleLocally('cualquier mensaje', memory);
  console.log('🔍 canHandleLocally():', canHandle);
  
  if (canHandle === false) {
    console.log('✅ CORRECTO: SearchAgent SIEMPRE usa Ollama');
  } else {
    console.log('❌ ERROR: SearchAgent todavía usa lógica local');
  }
  
  console.log('\n🎉 Tests completados!\n');
}

testOllamaSearch().catch(console.error);
