/**
 * Test: Detección de solicitud de envío de link
 */

import { getIntelligentEngine } from '../src/lib/intelligent-conversation-engine';

async function testEnviarLink() {
  console.log('🧪 Test: Detección de "Envíame el link de pago"\n');

  const engine = getIntelligentEngine();
  const chatId = 'test-enviar-link';
  const userId = 'test-user';

  try {
    // Paso 1: Usuario pregunta por un producto
    console.log('👤 Usuario: "Me interesa el mega pack 01"');
    const response1 = await engine.processMessage({
      chatId,
      userId,
      userName: 'Test User',
      message: 'Me interesa el mega pack 01'
    });
    console.log('🤖 Bot:', response1.text.substring(0, 200) + '...\n');

    // Paso 2: Usuario pregunta por métodos de pago
    console.log('👤 Usuario: "Si me gustaría comprarlo que método de pago tienen ?"');
    const response2 = await engine.processMessage({
      chatId,
      userId,
      userName: 'Test User',
      message: 'Si me gustaría comprarlo que método de pago tienen ?'
    });
    console.log('🤖 Bot:', response2.text.substring(0, 300) + '...\n');
    console.log('📊 Acciones:', response2.actions.map(a => a.type).join(', '));
    console.log('');

    // Paso 3: Usuario elige MercadoPago
    console.log('👤 Usuario: "Si ppt takets en mercado pago"');
    const response3 = await engine.processMessage({
      chatId,
      userId,
      userName: 'Test User',
      message: 'Si ppt takets en mercado pago'
    });
    console.log('🤖 Bot:', response3.text.substring(0, 300) + '...\n');
    console.log('📊 Acciones:', response3.actions.map(a => a.type).join(', '));
    console.log('');

    // Paso 4: Usuario pide el link explícitamente
    console.log('👤 Usuario: "Envíame el link de pago"');
    const response4 = await engine.processMessage({
      chatId,
      userId,
      userName: 'Test User',
      message: 'Envíame el link de pago'
    });
    console.log('🤖 Bot:', response4.text.substring(0, 500) + '...\n');
    console.log('📊 Acciones:', response4.actions.map(a => a.type).join(', '));
    console.log('');

    // Verificar que se generaron los links
    const hasPaymentLinks = response4.actions.some(a => 
      a.type === 'send_all_payment_methods' || 
      a.type === 'send_payment_links'
    );

    if (hasPaymentLinks) {
      console.log('✅ TEST EXITOSO: El bot detectó la solicitud de link y generó los métodos de pago');
    } else {
      console.log('❌ TEST FALLIDO: El bot NO generó los links de pago');
      console.log('Contexto actual:', response4.context);
    }

  } catch (error) {
    console.error('❌ Error en test:', error);
  }
}

testEnviarLink();
