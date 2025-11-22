/**
 * Test de Corrección de Contexto de Productos
 * Verifica que el bot mantenga el contexto cuando el cliente pide "más información"
 */

import { Orchestrator } from '../src/agents/orchestrator';
import { SharedMemoryService } from '../src/agents/shared-memory';

const orchestrator = new Orchestrator();
const memoryService = SharedMemoryService.getInstance();

async function testContextoProducto() {
  console.log('🧪 TEST: Corrección de Contexto de Productos\n');
  console.log('=' .repeat(60));
  
  const chatId = 'test-contexto-' + Date.now();
  // Usar el userId real de la base de datos
  const userId = 'cmhpw941q0000kmp85qvjm0o5';
  
  // Limpiar memoria
  memoryService.clear(chatId);
  
  console.log('\n📝 ESCENARIO: Cliente busca curso de diseño y luego pide más información\n');
  
  // Paso 1: Cliente busca curso de diseño
  console.log('👤 Cliente: "Hola, busco un curso de diseño gráfico"');
  const response1 = await orchestrator.processMessage({
    chatId,
    userId,
    message: 'Hola, busco un curso de diseño gráfico',
    userName: 'Test User'
  });
  
  console.log('\n🤖 Bot:', response1.text.substring(0, 200) + '...');
  
  // Verificar memoria después de la búsqueda
  const memory1 = memoryService.get(chatId, userId);
  console.log('\n🧠 Memoria después de búsqueda:');
  console.log('  - currentProduct:', memory1.currentProduct?.name || 'ninguno');
  console.log('  - interestedProducts:', memory1.interestedProducts.length);
  if (memory1.interestedProducts.length > 0) {
    memory1.interestedProducts.forEach((p, i) => {
      console.log(`    ${i + 1}. ${p.name}`);
    });
  }
  
  // Esperar un poco
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Paso 2: Cliente pide más información
  console.log('\n👤 Cliente: "Dame más información"');
  const response2 = await orchestrator.processMessage({
    chatId,
    userId,
    message: 'Dame más información',
    userName: 'Test User'
  });
  
  console.log('\n🤖 Bot:', response2.text.substring(0, 300) + '...');
  
  // Verificar memoria después de pedir más información
  const memory2 = memoryService.get(chatId, userId);
  console.log('\n🧠 Memoria después de "más información":');
  console.log('  - currentProduct:', memory2.currentProduct?.name || 'ninguno');
  console.log('  - interestedProducts:', memory2.interestedProducts.length);
  
  // Verificación
  console.log('\n' + '='.repeat(60));
  console.log('✅ VERIFICACIÓN:');
  
  if (memory2.currentProduct) {
    console.log('✅ currentProduct está establecido:', memory2.currentProduct.name);
    
    // Verificar que el producto es relevante
    const productName = memory2.currentProduct.name.toLowerCase();
    if (productName.includes('diseño') || productName.includes('grafico')) {
      console.log('✅ El producto es relevante a la búsqueda original');
    } else {
      console.log('❌ El producto NO es relevante:', memory2.currentProduct.name);
    }
  } else {
    console.log('❌ currentProduct NO está establecido');
  }
  
  // Verificar que no hizo una nueva búsqueda incorrecta
  if (response2.text.toLowerCase().includes('auricular') || 
      response2.text.toLowerCase().includes('piano')) {
    console.log('❌ ERROR: El bot buscó productos incorrectos (auriculares/piano)');
  } else {
    console.log('✅ El bot NO buscó productos incorrectos');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 RESULTADO FINAL:');
  
  if (memory2.currentProduct && 
      (memory2.currentProduct.name.toLowerCase().includes('diseño') ||
       memory2.currentProduct.name.toLowerCase().includes('grafico'))) {
    console.log('✅ TEST PASADO: El contexto se mantuvo correctamente');
  } else {
    console.log('❌ TEST FALLIDO: El contexto se perdió');
  }
}

// Ejecutar test
testContextoProducto()
  .then(() => {
    console.log('\n✅ Test completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error en test:', error);
    process.exit(1);
  });
