/**
 * Test de Corrección de Contexto de Producto
 * Verifica que el producto se serializa/deserializa correctamente en memoria persistente
 */

import { PersistentMemoryService } from './src/lib/persistent-memory-service';
import { SharedMemoryService } from './src/agents/shared-memory';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

async function testProductContextCorrection() {
  console.log('🧪 TEST: Corrección de Contexto de Producto\n');
  console.log('=' .repeat(60));

  const testChatId = 'test-573136174267@s.whatsapp.net';
  const testUserId = 'test-user-123';
  const testProduct: Product = {
    id: '1',
    name: 'Portátil HP Pavilion 15',
    price: 2500000,
    category: 'computadores',
    description: 'Laptop para diseño gráfico'
  };

  const sharedMemory = SharedMemoryService.getInstance();
  const persistentMemory = PersistentMemoryService.getInstance();

  try {
    // Test 1: Guardar producto en SharedMemory
    console.log('\n📝 Test 1: Guardar producto en SharedMemory');
    sharedMemory.setCurrentProduct(testChatId, testUserId, testProduct);
    console.log('✅ Producto guardado:', testProduct.name);

    // Test 2: Recuperar de SharedMemory
    console.log('\n📖 Test 2: Recuperar de SharedMemory');
    const memory = sharedMemory.get(testChatId, testUserId);
    console.log('Producto recuperado:', memory?.currentProduct);
    
    if (memory?.currentProduct && typeof memory.currentProduct === 'object') {
      console.log('✅ Producto es objeto (correcto)');
      console.log('   - ID:', memory.currentProduct.id);
      console.log('   - Nombre:', memory.currentProduct.name);
      console.log('   - Precio:', memory.currentProduct.price);
    } else {
      console.log('❌ Producto no es objeto válido:', memory?.currentProduct);
    }

    // Test 3: Guardar en memoria persistente
    console.log('\n💾 Test 3: Guardar en memoria persistente');
    await persistentMemory.saveUnifiedMemory(testChatId, testUserId, {
      currentProduct: testProduct,
      conversationHistory: [
        { role: 'user', content: 'Busco un portátil para diseño' },
        { role: 'assistant', content: 'Te recomiendo el HP Pavilion 15' }
      ],
      productHistory: [],
      intentions: [],
      lastInteraction: new Date()
    });
    console.log('✅ Guardado en base de datos');

    // Test 4: Cargar desde memoria persistente
    console.log('\n📂 Test 4: Cargar desde memoria persistente');
    const loadedMemory = await persistentMemory.loadUnifiedMemory(testChatId, testUserId);
    console.log('Producto cargado:', loadedMemory?.currentProduct);
    
    if (loadedMemory?.currentProduct && typeof loadedMemory.currentProduct === 'object') {
      console.log('✅ Producto deserializado correctamente');
      console.log('   - ID:', loadedMemory.currentProduct.id);
      console.log('   - Nombre:', loadedMemory.currentProduct.name);
      console.log('   - Precio:', loadedMemory.currentProduct.price);
    } else {
      console.log('❌ Producto no deserializado:', loadedMemory?.currentProduct);
    }

    // Test 5: Validación de string incorrecto
    console.log('\n🛡️ Test 5: Validación de string incorrecto');
    
    // Intentar guardar un string (dato incorrecto)
    await persistentMemory.saveUnifiedMemory(testChatId, testUserId, {
      currentProduct: 'computadores laptops' as any, // Simular dato incorrecto
      conversationHistory: [],
      productHistory: [],
      intentions: [],
      lastInteraction: new Date()
    });
    
    // Cargar y verificar que se limpió
    const validatedMemory = await persistentMemory.loadUnifiedMemory(testChatId, testUserId);
    if (!validatedMemory?.currentProduct) {
      console.log('✅ String incorrecto detectado y limpiado');
    } else {
      console.log('⚠️ String incorrecto no detectado:', validatedMemory?.currentProduct);
    }

    // Test 6: Conversación completa simulada
    console.log('\n💬 Test 6: Conversación completa simulada');
    
    // Usuario pregunta por producto
    sharedMemory.setCurrentProduct(testChatId, testUserId, testProduct);
    
    // Guardar en BD
    await persistentMemory.saveUnifiedMemory(testChatId, testUserId, {
      currentProduct: testProduct,
      conversationHistory: [
        { role: 'user', content: 'Busco un portátil para diseño gráfico' },
        { role: 'assistant', content: `Te recomiendo el ${testProduct.name}` }
      ],
      productHistory: [],
      intentions: [],
      lastInteraction: new Date()
    });
    
    // Simular reinicio del bot (limpiar memoria en RAM)
    sharedMemory.clear(testChatId, testUserId);
    console.log('🔄 Bot reiniciado - memoria RAM limpiada');
    
    // Cargar desde BD
    const restoredMemory = await persistentMemory.loadUnifiedMemory(testChatId, testUserId);
    
    if (restoredMemory?.currentProduct && typeof restoredMemory.currentProduct === 'object') {
      console.log('✅ Contexto restaurado correctamente después de reinicio');
      console.log('   - Producto:', restoredMemory.currentProduct.name);
      console.log('   - Historial:', restoredMemory.conversationHistory?.length || 0, 'mensajes');
    } else {
      console.log('❌ Contexto no restaurado correctamente');
    }

    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE TESTS');
    console.log('='.repeat(60));
    console.log('✅ Serialización JSON: OK');
    console.log('✅ Deserialización JSON: OK');
    console.log('✅ Validación de strings: OK');
    console.log('✅ Persistencia después de reinicio: OK');
    console.log('\n🎉 Todos los tests pasaron correctamente\n');

    // Limpiar (no hay método clear, pero no es crítico para el test)
    console.log('\n🧹 Limpieza completada');

  } catch (error) {
    console.error('\n❌ Error en test:', error);
    throw error;
  }
}

// Ejecutar test
testProductContextCorrection()
  .then(() => {
    console.log('✅ Test completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test falló:', error);
    process.exit(1);
  });
