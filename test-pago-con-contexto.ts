/**
 * 🧪 TEST: Verificar que el bot genera links de pago cuando hay producto en contexto
 */

import { SmartResponseEngine } from './src/lib/plantillas-respuestas-bot';

async function testPaymentWithContext() {
  console.log('🧪 TEST: GENERACIÓN DE LINKS DE PAGO CON CONTEXTO\n');
  console.log('='.repeat(70));

  const userId = 'cmicicjgv0000km38san5o2xb'; // Usuario real de BD

  // ESCENARIO 1: Cliente pregunta por producto y luego pide pagar
  console.log('\n📝 ESCENARIO 1: Producto en contexto → Solicitud de pago');
  console.log('-'.repeat(70));

  // Paso 1: Cliente pregunta por el curso de piano
  console.log('\n👤 Cliente: "Quiero el curso de piano"');
  const step1 = await SmartResponseEngine.analyzeIntent(
    'Quiero el curso de piano',
    [],
    undefined,
    userId
  );
  console.log(`🤖 Bot detectó: ${step1.intent} (confianza: ${step1.confidence}%)`);
  console.log(`📦 Producto: ${step1.entities?.product || 'NO DETECTADO'}`);
  console.log(`🆔 ProductID: ${step1.entities?.productId || 'NO DETECTADO'}`);

  // Simular contexto (como lo haría el sistema real)
  const context = step1.entities?.productId ? {
    product: {
      id: step1.entities.productId,
      name: step1.entities.product,
      price: step1.entities.price
    },
    lastProduct: step1.entities.product
  } : undefined;

  console.log(`\n🧠 Contexto guardado:`, context ? 'SÍ ✅' : 'NO ❌');

  // Paso 2: Cliente pide el link de pago
  console.log('\n👤 Cliente: "Dame el link de pago"');
  const step2 = await SmartResponseEngine.analyzeIntent(
    'Dame el link de pago',
    [],
    context,
    userId
  );
  console.log(`🤖 Bot detectó: ${step2.intent} (confianza: ${step2.confidence}%)`);
  console.log(`💳 Generó links: ${step2.templateData?.paymentMessage ? 'SÍ ✅' : 'NO ❌'}`);
  
  if (step2.templateData?.paymentMessage) {
    console.log(`\n📄 Mensaje generado:`);
    console.log(step2.templateData.paymentMessage.substring(0, 300) + '...');
  } else {
    console.log(`\n❌ ERROR: No se generaron links de pago`);
    console.log(`📊 Respuesta completa:`, JSON.stringify(step2, null, 2));
  }

  // ESCENARIO 2: Cliente pide pagar SIN producto en contexto
  console.log('\n\n📝 ESCENARIO 2: SIN producto en contexto → Solicitud de pago');
  console.log('-'.repeat(70));

  console.log('\n👤 Cliente: "Quiero pagar"');
  const step3 = await SmartResponseEngine.analyzeIntent(
    'Quiero pagar',
    [],
    undefined, // SIN contexto
    userId
  );
  console.log(`🤖 Bot detectó: ${step3.intent} (confianza: ${step3.confidence}%)`);
  console.log(`💳 Generó links: ${step3.templateData?.paymentMessage ? 'SÍ' : 'NO'}`);
  console.log(`📋 Respuesta: ${step3.responseTemplate}`);

  // ESCENARIO 3: Cliente especifica método de pago
  console.log('\n\n📝 ESCENARIO 3: Producto en contexto + Método específico');
  console.log('-'.repeat(70));

  console.log('\n👤 Cliente: "Quiero pagar por mercado pago"');
  const step4 = await SmartResponseEngine.analyzeIntent(
    'Quiero pagar por mercado pago',
    [],
    context,
    userId
  );
  console.log(`🤖 Bot detectó: ${step4.intent} (confianza: ${step4.confidence}%)`);
  console.log(`💳 Método detectado: ${step4.entities?.selectedMethod || 'NO DETECTADO'}`);
  console.log(`💳 Generó links: ${step4.templateData?.paymentMessage ? 'SÍ ✅' : 'NO ❌'}`);

  if (step4.templateData?.paymentMessage) {
    console.log(`\n📄 Mensaje generado:`);
    console.log(step4.templateData.paymentMessage.substring(0, 300) + '...');
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ TEST COMPLETADO\n');
}

testPaymentWithContext().catch(console.error);
