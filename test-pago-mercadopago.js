/**
 * Test: Generación automática de link de pago cuando el cliente dice "Quiero pagar por mercado pago"
 */

const { SmartResponseEngine } = require('./src/lib/plantillas-respuestas-bot');

async function testPaymentDetection() {
  console.log('🧪 TEST: Detección de intención de pago\n');

  // Simular contexto con producto
  const context = {
    product: {
      id: '123',
      name: 'Curso Completo de Piano',
      price: 50000
    },
    lastProductName: 'Curso Completo de Piano',
    lastProductId: '123'
  };

  const userId = 'test-user-123';

  // Test 1: "Quiero pagar por mercado pago"
  console.log('📝 Test 1: "Quiero pagar por mercado pago"');
  try {
    const result1 = await SmartResponseEngine.analyzeIntent(
      'Quiero pagar por mercado pago',
      [],
      context,
      userId
    );
    
    console.log('✅ Intent:', result1.intent);
    console.log('✅ Confidence:', result1.confidence);
    console.log('✅ Selected Method:', result1.entities?.selectedMethod);
    console.log('✅ Use AI:', result1.useAI);
    console.log('✅ Response:', result1.templateData?.paymentMessage?.substring(0, 200) + '...');
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 2: "Dame el link de paypal"
  console.log('📝 Test 2: "Dame el link de paypal"');
  try {
    const result2 = await SmartResponseEngine.analyzeIntent(
      'Dame el link de paypal',
      [],
      context,
      userId
    );
    
    console.log('✅ Intent:', result2.intent);
    console.log('✅ Confidence:', result2.confidence);
    console.log('✅ Selected Method:', result2.entities?.selectedMethod);
    console.log('✅ Use AI:', result2.useAI);
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 3: "Quiero pagar" (sin método específico)
  console.log('📝 Test 3: "Quiero pagar" (sin método específico)');
  try {
    const result3 = await SmartResponseEngine.analyzeIntent(
      'Quiero pagar',
      [],
      context,
      userId
    );
    
    console.log('✅ Intent:', result3.intent);
    console.log('✅ Confidence:', result3.confidence);
    console.log('✅ Selected Method:', result3.entities?.selectedMethod || 'ninguno (muestra todos)');
    console.log('✅ Use AI:', result3.useAI);
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 4: "Link de nequi"
  console.log('📝 Test 4: "Link de nequi"');
  try {
    const result4 = await SmartResponseEngine.analyzeIntent(
      'Link de nequi',
      [],
      context,
      userId
    );
    
    console.log('✅ Intent:', result4.intent);
    console.log('✅ Confidence:', result4.confidence);
    console.log('✅ Selected Method:', result4.entities?.selectedMethod);
    console.log('✅ Use AI:', result4.useAI);
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('✅ Tests completados');
}

testPaymentDetection().catch(console.error);
