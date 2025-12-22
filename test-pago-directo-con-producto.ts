/**
 * 🧪 TEST: Cliente dice "quiero pagar el curso de piano" de la nada
 * El bot debería:
 * 1. Buscar el curso de piano
 * 2. Guardarlo en contexto
 * 3. Mostrar métodos de pago para ese curso
 */

import { db } from './src/lib/db';
import { SmartResponseEngine } from './src/lib/plantillas-respuestas-bot';

async function testPagoDirectoConProducto() {
  console.log('🧪 TEST: Cliente dice "quiero pagar el curso de piano" SIN contexto previo\n');

  const userId = await db.user.findFirst().then(u => u?.id || 'test-user');

  console.log('👤 Cliente: "Quiero pagar el curso de piano"\n');

  // SIN contexto previo (como si fuera el primer mensaje)
  const analysis = await SmartResponseEngine.analyzeIntent(
    'Quiero pagar el curso de piano',
    [],
    undefined, // SIN contexto
    userId
  );

  console.log('📊 ANÁLISIS:');
  console.log(`   Intención: ${analysis.intent}`);
  console.log(`   Confianza: ${analysis.confidence}%`);
  console.log(`   Usa IA: ${analysis.useAI ? 'SÍ' : 'NO'}`);
  console.log(`   Template: ${analysis.responseTemplate}`);
  
  if (analysis.entities?.product) {
    console.log(`   Producto detectado: ${analysis.entities.product}`);
  }

  const response = SmartResponseEngine.generateResponse(analysis, undefined);

  console.log('\n🤖 RESPUESTA DEL BOT:');
  console.log(response);

  console.log('\n📋 EVALUACIÓN:');
  
  // ¿Qué DEBERÍA hacer?
  console.log('\n✅ COMPORTAMIENTO ESPERADO:');
  console.log('   1. Buscar "curso de piano" en la BD');
  console.log('   2. Encontrar el producto');
  console.log('   3. Mostrar el producto con precio');
  console.log('   4. Preguntar con qué método quiere pagar');
  console.log('   O mostrar directamente los métodos de pago');

  // ¿Qué está haciendo?
  console.log('\n📊 COMPORTAMIENTO ACTUAL:');
  if (response.includes('curso') && response.includes('piano')) {
    console.log('   ✅ Menciona el curso de piano');
  } else {
    console.log('   ❌ NO menciona el curso de piano');
  }

  if (response.includes('pago') || response.includes('MercadoPago') || response.includes('Nequi')) {
    console.log('   ✅ Menciona métodos de pago');
  } else {
    console.log('   ❌ NO menciona métodos de pago');
  }

  if (response.includes('$') || response.includes('COP') || /\d{1,3}[.,]\d{3}/.test(response)) {
    console.log('   ✅ Menciona el precio');
  } else {
    console.log('   ⚠️  NO menciona el precio');
  }

  // Verificar si encontró el producto
  const cursoPiano = await db.product.findFirst({
    where: {
      name: { contains: 'piano' },
      status: 'AVAILABLE'
    }
  });

  if (cursoPiano) {
    console.log(`\n📦 PRODUCTO EN BD: ${cursoPiano.name} (${cursoPiano.price} COP)`);
    
    if (response.includes(cursoPiano.name) || response.toLowerCase().includes('piano')) {
      console.log('   ✅ El bot encontró el producto');
    } else {
      console.log('   ❌ El bot NO encontró el producto');
    }
  } else {
    console.log('\n⚠️  NO hay curso de piano en la BD');
  }

  console.log('\n🎯 CONCLUSIÓN:');
  if (response.includes('piano') && (response.includes('pago') || response.includes('MercadoPago'))) {
    console.log('   ✅ El bot está manejando correctamente la solicitud');
  } else {
    console.log('   ❌ El bot NO está manejando correctamente la solicitud');
    console.log('   💡 Debería buscar el producto y mostrar opciones de pago');
  }
}

testPagoDirectoConProducto()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
