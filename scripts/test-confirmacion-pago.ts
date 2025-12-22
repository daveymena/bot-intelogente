/**
 * Test de Confirmación de Método de Pago
 * Verifica que el bot detecte correctamente las confirmaciones
 */

import { getIntelligentEngine } from '../src/lib/intelligent-conversation-engine';

async function testConfirmacionPago() {
  console.log('🧪 Test: Confirmación de Método de Pago\n');

  const engine = getIntelligentEngine();
  const testChatId = 'test-chat-' + Date.now();
  const testUserId = 'test-user-123';

  try {
    // Paso 1: Usuario pregunta por un producto
    console.log('📝 Paso 1: Usuario pregunta por producto');
    console.log('Usuario: "Quiero el curso de piano"\n');
    
    const response1 = await engine.processMessage({
      chatId: testChatId,
      userName: 'Test User',
      message: 'Quiero el curso de piano',
      userId: testUserId
    });

    console.log('Bot:', response1.text.substring(0, 100) + '...');
    console.log('Contexto:', {
      producto: response1.context.currentProduct?.name || 'ninguno',
      intencionPago: response1.context.paymentIntent || false
    });
    console.log('Acciones:', response1.actions.length);
    console.log('\n---\n');

    // Paso 2: Usuario pregunta por métodos de pago
    console.log('📝 Paso 2: Usuario pregunta por métodos de pago');
    console.log('Usuario: "¿Métodos de pago?"\n');
    
    const response2 = await engine.processMessage({
      chatId: testChatId,
      userName: 'Test User',
      message: '¿Métodos de pago?',
      userId: testUserId
    });

    console.log('Bot:', response2.text.substring(0, 100) + '...');
    console.log('Contexto:', {
      producto: response2.context.currentProduct?.name || 'ninguno',
      intencionPago: response2.context.paymentIntent || false,
      metodoPago: response2.context.preferredPaymentMethod || 'ninguno'
    });
    console.log('Acciones:', response2.actions.length);
    console.log('\n---\n');

    // Paso 3: Usuario confirma método (CRÍTICO)
    console.log('📝 Paso 3: Usuario confirma método de pago');
    console.log('Usuario: "MercadoPago"\n');
    
    const response3 = await engine.processMessage({
      chatId: testChatId,
      userName: 'Test User',
      message: 'MercadoPago',
      userId: testUserId
    });

    console.log('Bot:', response3.text.substring(0, 150) + '...');
    console.log('Contexto:', {
      producto: response3.context.currentProduct?.name || 'ninguno',
      intencionPago: response3.context.paymentIntent || false,
      metodoPago: response3.context.preferredPaymentMethod || 'ninguno'
    });
    console.log('Acciones:', response3.actions.length);
    
    // Verificar que se generó acción de pago
    const paymentAction = response3.actions.find(a => a.type === 'generate_payment_link');
    
    if (paymentAction) {
      console.log('\n✅ ¡ÉXITO! Se detectó la confirmación y se generó acción de pago');
      console.log('Detalles:', {
        producto: paymentAction.product?.name,
        metodo: paymentAction.method,
        monto: paymentAction.amount
      });
    } else {
      console.log('\n❌ ERROR: No se generó acción de pago');
      console.log('Acciones recibidas:', response3.actions);
    }

    console.log('\n---\n');

    // Test adicional: Variaciones de confirmación
    console.log('📝 Test adicional: Variaciones de confirmación\n');

    const variaciones = [
      'Mercado pago',
      'mercadopago',
      'PayPal',
      'paypal',
      'Nequi',
      'nequi'
    ];

    for (const variacion of variaciones) {
      const testChatIdVar = 'test-var-' + Date.now() + '-' + variacion;
      
      // Simular contexto previo
      await engine.processMessage({
        chatId: testChatIdVar,
        message: 'Curso de piano',
        userId: testUserId
      });

      await engine.processMessage({
        chatId: testChatIdVar,
        message: '¿Métodos de pago?',
        userId: testUserId
      });

      // Probar variación
      const responseVar = await engine.processMessage({
        chatId: testChatIdVar,
        message: variacion,
        userId: testUserId
      });

      const hasPaymentAction = responseVar.actions.some(a => a.type === 'generate_payment_link');
      
      console.log(`"${variacion}": ${hasPaymentAction ? '✅ Detectado' : '❌ No detectado'}`);
    }

    console.log('\n✅ Test completado');

  } catch (error) {
    console.error('❌ Error en test:', error);
  }
}

// Ejecutar test
testConfirmacionPago().catch(console.error);
