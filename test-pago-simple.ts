/**
 * 🧪 TEST SIMPLE: Generación de Link de Pago
 */

import { db } from './src/lib/db';
import { SmartResponseEngine } from './src/lib/plantillas-respuestas-bot';

async function testPagoSimple() {
  console.log('🧪 TEST: Cliente dice "mercadopago" con producto en contexto\n');

  // Obtener un producto real
  const product = await db.product.findFirst({
    where: { status: 'AVAILABLE' }
  });

  if (!product) {
    console.log('❌ No hay productos en la BD');
    return;
  }

  console.log(`📦 Producto: ${product.name} (${product.price} COP)\n`);

  const context = {
    product: {
      id: product.id,
      name: product.name,
      price: product.price
    }
  };

  const userId = await db.user.findFirst().then(u => u?.id || 'test-user');

  console.log('👤 Cliente: "Por mercadopago"\n');

  const analysis = await SmartResponseEngine.analyzeIntent(
    'Por mercadopago',
    [],
    context,
    userId
  );

  console.log('\n📊 RESULTADO:');
  console.log(`   Intención: ${analysis.intent}`);
  console.log(`   Confianza: ${analysis.confidence}%`);
  console.log(`   Usa IA: ${analysis.useAI ? 'SÍ' : 'NO'}`);
  console.log(`   Template: ${analysis.responseTemplate}`);

  const response = SmartResponseEngine.generateResponse(analysis, context);

  console.log('\n🤖 RESPUESTA DEL BOT:');
  console.log(response.substring(0, 200));
  console.log(response.length > 200 ? '...' : '');

  // Verificar si es correcto
  if (response.includes('MercadoPago') && (response.includes('LINK DE PAGO') || response.includes('Nequi'))) {
    console.log('\n✅ TEST PASADO: Bot generó respuesta de pago correcta');
  } else if (response.includes('Métodos de pago disponibles')) {
    console.log('\n❌ TEST FALLIDO: Bot mostró métodos de pago en lugar de generar link');
  } else {
    console.log('\n⚠️  TEST INCIERTO: Respuesta inesperada');
  }
}

testPagoSimple()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
