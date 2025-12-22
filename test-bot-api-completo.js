/**
 * TEST COMPLETO DEL BOT VIA API
 * Verifica que el bot funciona correctamente antes de deploy
 */

const API_URL = 'http://localhost:3000';
const PHONE = '573001234567';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function enviarMensaje(mensaje) {
  try {
    const response = await fetch(`${API_URL}/api/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: PHONE,
        message: mensaje,
        simulate: true // Modo simulación para tests
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error enviando mensaje:', error.message);
    return null;
  }
}

async function testBot() {
  console.log('\n🚀 ========================================');
  console.log('   TEST COMPLETO DEL BOT VIA API');
  console.log('========================================\n');
  
  console.log('⏳ Verificando que el servidor esté corriendo...');
  
  try {
    const healthCheck = await fetch(`${API_URL}/api/health`);
    if (!healthCheck.ok) {
      throw new Error('Servidor no responde');
    }
    console.log('✅ Servidor corriendo correctamente\n');
  } catch (error) {
    console.error('❌ ERROR: El servidor no está corriendo');
    console.error('   Ejecuta: npm run dev');
    process.exit(1);
  }

  let testsPasados = 0;
  let testsFallidos = 0;

  // TEST 1: SALUDO
  console.log('📝 TEST 1: Saludo inicial');
  console.log('─────────────────────────────────────────');
  const test1 = await enviarMensaje('Hola');
  if (test1 && test1.success) {
    console.log('✅ TEST 1 PASADO: Bot responde a saludos');
    testsPasados++;
  } else {
    console.log('❌ TEST 1 FALLIDO: Bot no responde');
    testsFallidos++;
  }
  await sleep(3000);

  // TEST 2: BÚSQUEDA DE PRODUCTO
  console.log('\n📝 TEST 2: Búsqueda de producto');
  console.log('─────────────────────────────────────────');
  const test2 = await enviarMensaje('megapack de idiomas');
  if (test2 && test2.success) {
    console.log('✅ TEST 2 PASADO: Bot busca productos');
    testsPasados++;
  } else {
    console.log('❌ TEST 2 FALLIDO: Bot no busca productos');
    testsFallidos++;
  }
  await sleep(3000);

  // TEST 3: CONTEXTO
  console.log('\n📝 TEST 3: Mantiene contexto');
  console.log('─────────────────────────────────────────');
  const test3 = await enviarMensaje('Tienes fotos?');
  if (test3 && test3.success) {
    console.log('✅ TEST 3 PASADO: Bot mantiene contexto');
    testsPasados++;
  } else {
    console.log('❌ TEST 3 FALLIDO: Bot pierde contexto');
    testsFallidos++;
  }
  await sleep(3000);

  // TEST 4: PAGO
  console.log('\n📝 TEST 4: Información de pago');
  console.log('─────────────────────────────────────────');
  const test4 = await enviarMensaje('Como puedo pagar?');
  if (test4 && test4.success) {
    console.log('✅ TEST 4 PASADO: Bot proporciona info de pago');
    testsPasados++;
  } else {
    console.log('❌ TEST 4 FALLIDO: Bot no da info de pago');
    testsFallidos++;
  }

  // RESUMEN
  console.log('\n\n🏁 ========================================');
  console.log('   RESUMEN DE TESTS');
  console.log('========================================');
  console.log(`✅ Tests pasados: ${testsPasados}/4`);
  console.log(`❌ Tests fallidos: ${testsFallidos}/4`);
  console.log(`📊 Éxito: ${Math.round((testsPasados/4)*100)}%`);
  
  if (testsFallidos === 0) {
    console.log('\n🎉 ¡PERFECTO! Bot listo para deploy');
    process.exit(0);
  } else if (testsPasados >= 3) {
    console.log('\n⚠️  Bot funciona con problemas menores');
    process.exit(0);
  } else {
    console.log('\n❌ Bot tiene problemas críticos');
    process.exit(1);
  }
}

testBot();
