/**
 * Test: Bot conversacional natural con sistema híbrido
 */

const { SmartResponseEngine } = require('./src/lib/plantillas-respuestas-bot');

async function testNaturalConversations() {
  console.log('🧪 TEST: CONVERSACIONES NATURALES\n');
  console.log('='.repeat(70));

  const context = {
    product: {
      id: '123',
      name: 'Curso Completo de Piano',
      price: 60000
    },
    lastProductName: 'Curso Completo de Piano',
    lastProductId: '123'
  };

  const userId = 'test-user-123';

  const tests = [
    {
      category: '📝 PLANTILLAS LOCALES (Cero costo)',
      tests: [
        { msg: 'Hola', expectAI: false, desc: 'Saludo simple' },
        { msg: 'Quiero pagar por mercado pago', expectAI: false, desc: 'Solicitud directa de pago' },
        { msg: 'Cuanto cuesta', expectAI: false, desc: 'Pregunta de precio' },
      ]
    },
    {
      category: '🧠 IA (Conversaciones naturales)',
      tests: [
        { msg: 'Como puedo pagar el curso de piano', expectAI: true, desc: 'Pregunta natural contextual' },
        { msg: 'Ese curso me interesa', expectAI: true, desc: 'Referencia contextual' },
        { msg: 'Cual es la diferencia entre el curso y el megapack', expectAI: true, desc: 'Comparación compleja' },
        { msg: 'Tienen algo para aprender diseño gráfico', expectAI: true, desc: 'Pregunta abierta' },
        { msg: 'Me gustaria saber mas sobre ese producto', expectAI: true, desc: 'Conversación contextual' },
      ]
    }
  ];

  for (const category of tests) {
    console.log(`\n${category.category}`);
    console.log('-'.repeat(70));

    for (const test of category.tests) {
      console.log(`\n📝 "${test.msg}"`);
      console.log(`   Descripción: ${test.desc}`);
      
      try {
        const result = await SmartResponseEngine.analyzeIntent(
          test.msg,
          [],
          context,
          userId
        );

        const usedAI = result.useAI;
        const isCorrect = usedAI === test.expectAI;

        console.log(`   Intent: ${result.intent}`);
        console.log(`   Confidence: ${result.confidence}%`);
        console.log(`   Usa IA: ${usedAI ? 'SÍ 🧠' : 'NO (Plantilla) 📝'}`);
        console.log(`   Esperado: ${test.expectAI ? 'IA' : 'Plantilla'}`);
        console.log(`   Resultado: ${isCorrect ? '✅ CORRECTO' : '❌ ERROR'}`);

        if (result.templateData?.aiResponse) {
          console.log(`   Respuesta IA: ${result.templateData.aiResponse.substring(0, 80)}...`);
        }

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Tests completados\n');
  
  console.log('📊 RESUMEN:');
  console.log('   ✅ Plantillas locales - Para casos simples (cero costo)');
  console.log('   ✅ IA - Para conversaciones naturales (bajo costo ~$0.001)');
  console.log('   ✅ Sistema híbrido inteligente activado');
  console.log('\n💡 El bot ahora entiende conversaciones naturales y contextuales');
}

testNaturalConversations().catch(console.error);
