import { IntelligentPaymentDetector } from '../src/lib/intelligent-payment-detector';

async function testDeteccionInteligente() {
  console.log('🧠 PRUEBA: Detección Inteligente de Solicitudes de Pago\n');
  console.log('='.repeat(60));

  const testCases = [
    {
      message: 'Envíame el link',
      context: 'Cliente: Quiero el curso de piano\nBot: Excelente elección! El curso cuesta $60,000',
      expected: true
    },
    {
      message: 'enviame el link',
      context: '',
      expected: true
    },
    {
      message: 'Método de pago?',
      context: '',
      expected: true
    },
    {
      message: 'Metodo de pago',
      context: '',
      expected: true
    },
    {
      message: 'Como pago',
      context: '',
      expected: true
    },
    {
      message: 'Lo quiero',
      context: 'Cliente: Cuánto cuesta el megapack?\nBot: Cuesta $20,000 COP',
      expected: true
    },
    {
      message: 'Hola',
      context: '',
      expected: false
    },
    {
      message: 'Está disponible?',
      context: '',
      expected: false
    },
    {
      message: 'Cuánto cuesta?',
      context: '',
      expected: false
    },
    {
      message: 'Tienes fotos?',
      context: '',
      expected: false
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`\n📝 Mensaje: "${testCase.message}"`);
    if (testCase.context) {
      console.log(`📚 Contexto: ${testCase.context.substring(0, 50)}...`);
    }
    console.log('-'.repeat(60));

    try {
      const result = await IntelligentPaymentDetector.detectPaymentIntent(
        testCase.message,
        testCase.context
      );

      const isCorrect = result.isPaymentRequest === testCase.expected;
      
      if (isCorrect) {
        console.log(`✅ CORRECTO`);
        passed++;
      } else {
        console.log(`❌ INCORRECTO (esperado: ${testCase.expected})`);
        failed++;
      }

      console.log(`   Detectado: ${result.isPaymentRequest ? 'SÍ' : 'NO'}`);
      console.log(`   Confianza: ${(result.confidence * 100).toFixed(0)}%`);
      console.log(`   Razonamiento: ${result.reasoning}`);
      console.log(`   Acción: ${result.suggestedAction}`);

    } catch (error: any) {
      console.log(`❌ ERROR: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Resultados:`);
  console.log(`   ✅ Correctos: ${passed}/${testCases.length}`);
  console.log(`   ❌ Incorrectos: ${failed}/${testCases.length}`);
  console.log(`   📈 Precisión: ${((passed / testCases.length) * 100).toFixed(1)}%`);

  if (passed === testCases.length) {
    console.log(`\n🎉 ¡Perfecto! Todas las pruebas pasaron`);
  } else {
    console.log(`\n⚠️  Algunas pruebas fallaron, revisar configuración`);
  }
}

testDeteccionInteligente();
