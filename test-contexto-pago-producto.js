/**
 * Test para verificar que el contexto del producto se mantiene al solicitar pago
 */

const { procesarMensaje } = require('./src/conversational-module/ai/conversacionController');

async function testContextoPago() {
  const customerPhone = '573001234567';
  const botUserId = 'cmi6xj8q30000kme42q5fjk41';

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 TEST: Contexto de Producto en Solicitud de Pago');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // PASO 1: Cliente pregunta por un portátil
  console.log('📱 PASO 1: Cliente pregunta por portátil');
  console.log('Cliente: "Hola, tienes portátiles?"');
  const respuesta1 = await procesarMensaje(
    customerPhone,
    'Hola, tienes portátiles?',
    { botUserId }
  );
  console.log('🤖 Bot:', respuesta1.texto.substring(0, 300) + '...\n');

  // Verificar que mencionó un producto
  const mencionaProducto = /portátil|laptop|computador/i.test(respuesta1.texto);
  console.log(mencionaProducto ? '✅ Bot mencionó un producto' : '❌ Bot NO mencionó producto');

  // Esperar un poco
  console.log('\n⏳ Esperando 2 segundos...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // PASO 2: Cliente solicita el pago
  console.log('📱 PASO 2: Cliente solicita pago');
  console.log('Cliente: "Quiero pagar"');
  const respuesta2 = await procesarMensaje(
    customerPhone,
    'Quiero pagar',
    { botUserId }
  );
  console.log('🤖 Bot:', respuesta2.texto.substring(0, 600));
  
  // Verificar que el bot envió links de pago
  const tieneLinks = /mercado\s*pago|paypal|nequi|daviplata|link|pago/i.test(respuesta2.texto);
  console.log('\n' + (tieneLinks ? '✅ Bot envió información de pago' : '❌ Bot NO envió información de pago'));

  // Verificar que NO mencionó cursos (error común)
  const mencionaCursos = /curso|megapack|piano|idiomas/i.test(respuesta2.texto);
  console.log(mencionaCursos ? '❌ ERROR: Bot mencionó cursos (producto incorrecto)' : '✅ Bot NO mencionó cursos');

  // Verificar que mencionó el producto correcto
  const mencionaProductoCorrecto = /portátil|laptop|computador/i.test(respuesta2.texto);
  console.log(mencionaProductoCorrecto ? '✅ Bot mencionó el producto correcto' : '⚠️ Bot no mencionó el producto específico');
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESULTADO DEL TEST:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const exito = mencionaProducto && tieneLinks && !mencionaCursos;
  
  if (exito) {
    console.log('✅ TEST EXITOSO: El contexto se mantuvo correctamente');
  } else {
    console.log('❌ TEST FALLIDO: Revisar logs para identificar el problema');
    console.log('\nProblemas detectados:');
    if (!mencionaProducto) console.log('  - No se mostró producto en paso 1');
    if (!tieneLinks) console.log('  - No se enviaron links de pago en paso 2');
    if (mencionaCursos) console.log('  - Se enviaron productos incorrectos (cursos)');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

testContextoPago().catch(console.error);
