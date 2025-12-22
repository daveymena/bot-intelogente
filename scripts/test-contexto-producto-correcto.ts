/**
 * Test: Verificar que el bot mantiene el producto correcto
 * durante todo el proceso de pago
 */

import { getIntelligentEngine } from '../src/lib/intelligent-conversation-engine';

async function testContextoProducto() {
  console.log('🧪 TEST: Mantener producto correcto durante pago\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const engine = getIntelligentEngine();
  const chatId = 'test-contexto-correcto';
  const userId = 'test-user';

  try {
    // Paso 1: Usuario pregunta por Mega Pack 01
    console.log('👤 Usuario: "Me interesa el mega pack 01 de diseño grafico"');
    const response1 = await engine.processMessage({
      chatId,
      userId,
      userName: 'Test User',
      message: 'Me interesa el mega pack 01 de diseño grafico'
    });
    
    const context1 = engine.getContext(chatId);
    console.log('🤖 Bot:', response1.text.substring(0, 150) + '...');
    console.log('📦 Producto en contexto:', context1.currentProduct?.name || 'NINGUNO');
    console.log('💰 Precio:', context1.currentProduct?.price || 'N/A');
    console.log('');

    if (!context1.currentProduct || !context1.currentProduct.name.includes('Diseño Gráfico')) {
      console.log('❌ ERROR: Producto incorrecto en paso 1');
      return;
    }

    // Paso 2: Usuario pregunta por métodos de pago
    console.log('👤 Usuario: "Que métodos de pago tienen?"');
    const response2 = await engine.processMessage({
      chatId,
      userId,
      userName: 'Test User',
      message: 'Que métodos de pago tienen?'
    });
    
    const context2 = engine.getContext(chatId);
    console.log('🤖 Bot:', response2.text.substring(0, 150) + '...');
    console.log('📦 Producto en contexto:', context2.currentProduct?.name || 'NINGUNO');
    console.log('💰 Precio:', context2.currentProduct?.price || 'N/A');
    console.log('');

    if (!context2.currentProduct || !context2.currentProduct.name.includes('Diseño Gráfico')) {
      console.log('❌ ERROR: Producto cambió en paso 2');
      console.log('   Esperado: Mega Pack 01: Cursos Diseño Gráfico');
      console.log('   Recibido:', context2.currentProduct?.name || 'NINGUNO');
      return;
    }

    // Paso 3: Usuario elige MercadoPago
    console.log('👤 Usuario: "MercadoPago"');
    const response3 = await engine.processMessage({
      chatId,
      userId,
      userName: 'Test User',
      message: 'MercadoPago'
    });
    
    const context3 = engine.getContext(chatId);
    console.log('🤖 Bot:', response3.text.substring(0, 150) + '...');
    console.log('📦 Producto en contexto:', context3.currentProduct?.name || 'NINGUNO');
    console.log('💰 Precio:', context3.currentProduct?.price || 'N/A');
    console.log('💳 Método de pago:', context3.preferredPaymentMethod || 'NINGUNO');
    console.log('');

    if (!context3.currentProduct || !context3.currentProduct.name.includes('Diseño Gráfico')) {
      console.log('❌ ERROR: Producto cambió en paso 3');
      console.log('   Esperado: Mega Pack 01: Cursos Diseño Gráfico');
      console.log('   Recibido:', context3.currentProduct?.name || 'NINGUNO');
      return;
    }

    // Paso 4: Usuario pide el link
    console.log('👤 Usuario: "Envíame el link de pago"');
    const response4 = await engine.processMessage({
      chatId,
      userId,
      userName: 'Test User',
      message: 'Envíame el link de pago'
    });
    
    const context4 = engine.getContext(chatId);
    console.log('🤖 Bot:', response4.text.substring(0, 200) + '...');
    console.log('📦 Producto en contexto:', context4.currentProduct?.name || 'NINGUNO');
    console.log('💰 Precio:', context4.currentProduct?.price || 'N/A');
    console.log('📊 Acciones:', response4.actions.map(a => a.type).join(', '));
    console.log('');

    if (!context4.currentProduct || !context4.currentProduct.name.includes('Diseño Gráfico')) {
      console.log('❌ ERROR: Producto cambió en paso 4');
      console.log('   Esperado: Mega Pack 01: Cursos Diseño Gráfico');
      console.log('   Recibido:', context4.currentProduct?.name || 'NINGUNO');
      return;
    }

    // Verificar que el precio es correcto ($20,000)
    if (context4.currentProduct.price !== 20000) {
      console.log('❌ ERROR: Precio incorrecto');
      console.log('   Esperado: 20000');
      console.log('   Recibido:', context4.currentProduct.price);
      return;
    }

    // Verificar que se generaron los links de pago
    const hasPaymentLinks = response4.actions.some(a => 
      a.type === 'send_all_payment_methods' || 
      a.type === 'send_payment_links'
    );

    if (!hasPaymentLinks) {
      console.log('❌ ERROR: No se generaron los links de pago');
      return;
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ TEST EXITOSO');
    console.log('   ✅ Producto correcto en todos los pasos');
    console.log('   ✅ Precio correcto ($20,000)');
    console.log('   ✅ Links de pago generados');
    console.log('   ✅ Contexto mantenido correctamente');

  } catch (error) {
    console.error('❌ Error en test:', error);
  }
}

testContextoProducto()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
