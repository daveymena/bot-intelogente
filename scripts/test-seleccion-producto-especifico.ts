/**
 * Test: Selección de Producto Específico
 * Verifica que cuando el usuario especifica un producto, solo se muestre ese
 */

import { Orchestrator } from '../src/agents/orchestrator';
import { SharedMemoryService } from '../src/agents/shared-memory';
import { db } from '../src/lib/db';

async function testSeleccionProductoEspecifico() {
  console.log('🧪 TEST: Selección de Producto Específico\n');
  console.log('='.repeat(60));
  
  // Obtener userId real
  console.log('\n📋 Obteniendo usuario de la base de datos...');
  const user = await db.user.findFirst();
  
  if (!user) {
    console.error('❌ No se encontró ningún usuario en la base de datos');
    console.log('   Crea un usuario primero o inicia sesión en el dashboard');
    return;
  }
  
  console.log('✅ Usuario encontrado:', user.email);
  
  const orchestrator = new Orchestrator();
  const memoryService = SharedMemoryService.getInstance();
  
  const chatId = 'test-chat-' + Date.now();
  const userId = user.id;
  
  try {
    // Escenario 1: Usuario pregunta por curso de piano
    console.log('\n📝 Escenario 1: Búsqueda inicial de "curso de piano"');
    console.log('-'.repeat(60));
    
    const response1 = await orchestrator.processMessage({
      chatId,
      userId,
      message: 'Me interesa un curso de piano',
      userName: 'Test User',
    });
    
    console.log('\n🤖 Respuesta del bot:');
    console.log(response1.text);
    console.log('\n📊 Metadata:');
    console.log('- Next Agent:', response1.nextAgent);
    console.log('- Confidence:', response1.confidence);
    
    const memory1 = memoryService.get(chatId, userId);
    console.log('- Productos encontrados:', memory1.interestedProducts.length);
    if (memory1.interestedProducts.length > 0) {
      console.log('- Productos:');
      memory1.interestedProducts.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name}`);
      });
    }
    
    // Esperar un poco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Escenario 2: Usuario especifica "el curso de piano completo"
    console.log('\n\n📝 Escenario 2: Usuario especifica "el curso de piano completo"');
    console.log('-'.repeat(60));
    
    const response2 = await orchestrator.processMessage({
      chatId,
      userId,
      message: 'El curso de piano completo',
      userName: 'Test User',
    });
    
    console.log('\n🤖 Respuesta del bot:');
    console.log(response2.text);
    console.log('\n📊 Metadata:');
    console.log('- Next Agent:', response2.nextAgent);
    console.log('- Confidence:', response2.confidence);
    
    const memory2 = memoryService.get(chatId, userId);
    console.log('- Producto actual:', memory2.currentProduct?.name || 'ninguno');
    console.log('- Productos en lista:', memory2.interestedProducts.length);
    
    // Verificación
    console.log('\n\n✅ VERIFICACIÓN:');
    console.log('-'.repeat(60));
    
    if (memory2.currentProduct) {
      const productName = memory2.currentProduct.name.toLowerCase();
      if (productName.includes('piano') && productName.includes('completo')) {
        console.log('✅ CORRECTO: Se seleccionó el producto específico');
        console.log(`   Producto: ${memory2.currentProduct.name}`);
      } else {
        console.log('❌ ERROR: Se seleccionó el producto incorrecto');
        console.log(`   Producto: ${memory2.currentProduct.name}`);
      }
    } else {
      console.log('❌ ERROR: No se seleccionó ningún producto');
    }
    
    // Escenario 3: Usuario pide método de pago
    console.log('\n\n📝 Escenario 3: Usuario pide método de pago');
    console.log('-'.repeat(60));
    
    const response3 = await orchestrator.processMessage({
      chatId,
      userId,
      message: 'Me envías el método de pago por nequi?',
      userName: 'Test User',
    });
    
    console.log('\n🤖 Respuesta del bot:');
    console.log(response3.text);
    console.log('\n📊 Metadata:');
    console.log('- Next Agent:', response3.nextAgent);
    console.log('- Confidence:', response3.confidence);
    
    const memory3 = memoryService.get(chatId, userId);
    console.log('- Producto actual:', memory3.currentProduct?.name || 'ninguno');
    console.log('- Método de pago preferido:', memory3.preferredPaymentMethod || 'ninguno');
    
    // Verificación final
    console.log('\n\n🎯 RESULTADO FINAL:');
    console.log('='.repeat(60));
    
    if (memory3.currentProduct && memory3.preferredPaymentMethod === 'nequi') {
      console.log('✅ ÉXITO: El flujo funcionó correctamente');
      console.log(`   - Producto: ${memory3.currentProduct.name}`);
      console.log(`   - Método de pago: ${memory3.preferredPaymentMethod}`);
    } else {
      console.log('❌ FALLO: El flujo no funcionó como esperado');
      if (!memory3.currentProduct) {
        console.log('   - Falta: Producto actual');
      }
      if (!memory3.preferredPaymentMethod) {
        console.log('   - Falta: Método de pago');
      }
    }
    
  } catch (error) {
    console.error('\n❌ ERROR en el test:', error);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test completado\n');
}

// Ejecutar test
testSeleccionProductoEspecifico().catch(console.error);
