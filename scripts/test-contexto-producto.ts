/**
 * Test de Contexto de Producto
 * Verifica que el sistema mantenga el producto correcto en contexto
 */

import { getIntelligentEngine } from '../src/lib/intelligent-conversation-engine';

async function testContexto() {
  console.log('🧪 TEST: Contexto de Producto\n');

  const engine = getIntelligentEngine();
  const testChatId = 'test-contexto-' + Date.now();
  const testUserId = 'test-user';

  try {
    // Simular conversación sobre Mega Pack de Diseño Gráfico
    console.log('1️⃣ Usuario pregunta por curso de diseño gráfico...');
    const response1 = await engine.processMessage({
      chatId: testChatId,
      userName: 'Test User',
      message: 'Hola, tienes el curso de diseño gráfico?',
      userId: testUserId
    });

    console.log('📝 Respuesta:', response1.text.substring(0, 200));
    console.log('🧠 Producto en contexto:', response1.context.currentProduct?.name || 'NINGUNO');
    console.log('💰 Precio:', response1.context.currentProduct?.price || 'N/A');
    console.log('');

    // Simular solicitud de métodos de pago
    console.log('2️⃣ Usuario pregunta por métodos de pago...');
    const response2 = await engine.processMessage({
      chatId: testChatId,
      userName: 'Test User',
      message: '¿Cómo puedo pagar?',
      userId: testUserId
    });

    console.log('📝 Respuesta:', response2.text.substring(0, 300));
    console.log('🧠 Producto en contexto:', response2.context.currentProduct?.name || 'NINGUNO');
    console.log('💰 Precio:', response2.context.currentProduct?.price || 'N/A');
    console.log('💳 Intención de pago:', response2.context.paymentIntent);
    console.log('');

    // Verificar que el producto NO cambió
    if (response1.context.currentProduct?.id === response2.context.currentProduct?.id) {
      console.log('✅ CORRECTO: El producto se mantuvo en contexto');
    } else {
      console.log('❌ ERROR: El producto cambió entre mensajes');
      console.log('   Producto inicial:', response1.context.currentProduct?.name);
      console.log('   Producto final:', response2.context.currentProduct?.name);
    }

    // Verificar que los métodos de pago son del producto correcto
    if (response2.text.includes(response2.context.currentProduct?.name || '')) {
      console.log('✅ CORRECTO: Los métodos de pago son del producto correcto');
    } else {
      console.log('⚠️ ADVERTENCIA: Los métodos de pago podrían no coincidir con el producto');
    }

    console.log('\n📊 Estadísticas de la conversación:');
    const stats = engine.getStats(testChatId);
    console.log(stats);

  } catch (error) {
    console.error('❌ Error en el test:', error);
  }
}

testContexto();
