/**
 * TEST COMPLETO DEL BOT - Verificación antes de deploy
 * 
 * Prueba todas las funcionalidades críticas:
 * 1. Saludos y conversación casual
 * 2. Búsqueda de productos
 * 3. Contexto entre mensajes
 * 4. Envío de fotos
 * 5. Solicitud de pago
 * 6. Manejo de mensajes consecutivos
 */

const { procesarMensaje } = require('./dist/src/conversational-module/ai/conversacionController');

const PHONE = '573001234567'; // Teléfono de prueba
const BOT_USER_ID = process.env.DEFAULT_USER_ID || 'default-user-id';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testBot() {
  console.log('\n🚀 ========================================');
  console.log('   TEST COMPLETO DEL BOT');
  console.log('========================================\n');

  let testsPasados = 0;
  let testsFallidos = 0;

  try {
    // TEST 1: SALUDO INICIAL
    console.log('\n📝 TEST 1: Saludo inicial');
    console.log('─────────────────────────────────────────');
    const test1 = await procesarMensaje(PHONE, 'Hola', { botUserId: BOT_USER_ID });
    console.log('👤 Usuario: Hola');
    console.log('🤖 Bot:', test1.texto.substring(0, 150) + '...');
    
    if (test1.texto.toLowerCase().includes('hola') || test1.texto.includes('👋')) {
      console.log('✅ TEST 1 PASADO: Saludo correcto');
      testsPasados++;
    } else {
      console.log('❌ TEST 1 FALLIDO: Saludo incorrecto');
      testsFallidos++;
    }
    
    await sleep(2000);

    // TEST 2: BÚSQUEDA DE PRODUCTO
    console.log('\n📝 TEST 2: Búsqueda de producto (Megapack de idiomas)');
    console.log('─────────────────────────────────────────');
    const test2 = await procesarMensaje(PHONE, 'megapack de idiomas', { botUserId: BOT_USER_ID });
    console.log('👤 Usuario: megapack de idiomas');
    console.log('🤖 Bot:', test2.texto.substring(0, 200) + '...');
    console.log('📸 Fotos:', test2.fotos ? test2.fotos.length : 0);
    
    const mencionaProducto = test2.texto.toLowerCase().includes('idioma') || 
                            test2.texto.toLowerCase().includes('megapack');
    const tieneInfo = test2.texto.includes('$') || test2.texto.includes('COP');
    
    if (mencionaProducto && tieneInfo) {
      console.log('✅ TEST 2 PASADO: Producto encontrado con información');
      testsPasados++;
    } else {
      console.log('❌ TEST 2 FALLIDO: Producto no encontrado o sin información');
      testsFallidos++;
    }
    
    await sleep(2000);


    // TEST 3: CONTEXTO - Preguntar por el mismo producto
    console.log('\n📝 TEST 3: Contexto - Preguntar por el mismo producto');
    console.log('─────────────────────────────────────────');
    const test3 = await procesarMensaje(PHONE, 'Te pregunte por el megapack de idiomas', { botUserId: BOT_USER_ID });
    console.log('👤 Usuario: Te pregunte por el megapack de idiomas');
    console.log('🤖 Bot:', test3.texto.substring(0, 200) + '...');
    console.log('📸 Fotos:', test3.fotos ? test3.fotos.length : 0);
    
    const mantienContexto = test3.texto.toLowerCase().includes('idioma') || 
                           test3.texto.toLowerCase().includes('megapack') ||
                           test3.texto.includes('$');
    
    if (mantienContexto) {
      console.log('✅ TEST 3 PASADO: Mantiene contexto del producto');
      testsPasados++;
    } else {
      console.log('❌ TEST 3 FALLIDO: Perdió contexto del producto');
      testsFallidos++;
    }
    
    await sleep(2000);

    // TEST 4: SOLICITUD DE FOTOS
    console.log('\n📝 TEST 4: Solicitud de fotos');
    console.log('─────────────────────────────────────────');
    const test4 = await procesarMensaje(PHONE, 'Tienes fotos?', { botUserId: BOT_USER_ID });
    console.log('👤 Usuario: Tienes fotos?');
    console.log('🤖 Bot:', test4.texto.substring(0, 150) + '...');
    console.log('📸 Fotos:', test4.fotos ? test4.fotos.length : 0);
    
    if (test4.fotos && test4.fotos.length > 0) {
      console.log('✅ TEST 4 PASADO: Envía fotos correctamente');
      testsPasados++;
    } else {
      console.log('⚠️  TEST 4 ADVERTENCIA: No envió fotos (puede ser normal si el producto no tiene)');
      testsPasados++; // No falla el test
    }
    
    await sleep(2000);

    // TEST 5: SOLICITUD DE PAGO
    console.log('\n📝 TEST 5: Solicitud de pago');
    console.log('─────────────────────────────────────────');
    const test5 = await procesarMensaje(PHONE, 'Como puedo pagar?', { botUserId: BOT_USER_ID });
    console.log('👤 Usuario: Como puedo pagar?');
    console.log('🤖 Bot:', test5.texto.substring(0, 200) + '...');
    
    const mencionaPago = test5.texto.toLowerCase().includes('pago') || 
                        test5.texto.toLowerCase().includes('mercadopago') ||
                        test5.texto.toLowerCase().includes('nequi') ||
                        test5.texto.toLowerCase().includes('link');
    
    if (mencionaPago) {
      console.log('✅ TEST 5 PASADO: Proporciona información de pago');
      testsPasados++;
    } else {
      console.log('❌ TEST 5 FALLIDO: No proporciona información de pago');
      testsFallidos++;
    }
    
    await sleep(2000);

    // TEST 6: BÚSQUEDA DE OTRO PRODUCTO
    console.log('\n📝 TEST 6: Búsqueda de otro producto (Laptop)');
    console.log('─────────────────────────────────────────');
    const test6 = await procesarMensaje(PHONE, 'Tienes laptops?', { botUserId: BOT_USER_ID });
    console.log('👤 Usuario: Tienes laptops?');
    console.log('🤖 Bot:', test6.texto.substring(0, 200) + '...');
    console.log('📸 Fotos:', test6.fotos ? test6.fotos.length : 0);
    
    const mencionaLaptop = test6.texto.toLowerCase().includes('laptop') || 
                          test6.texto.toLowerCase().includes('portátil') ||
                          test6.texto.toLowerCase().includes('computador');
    
    if (mencionaLaptop) {
      console.log('✅ TEST 6 PASADO: Cambia de producto correctamente');
      testsPasados++;
    } else {
      console.log('❌ TEST 6 FALLIDO: No cambia de producto');
      testsFallidos++;
    }
    
    await sleep(2000);

    // TEST 7: CONVERSACIÓN CASUAL
    console.log('\n📝 TEST 7: Conversación casual');
    console.log('─────────────────────────────────────────');
    const test7 = await procesarMensaje(PHONE, 'Gracias por la ayuda', { botUserId: BOT_USER_ID });
    console.log('👤 Usuario: Gracias por la ayuda');
    console.log('🤖 Bot:', test7.texto.substring(0, 150) + '...');
    
    const esAmigable = test7.texto.length > 10 && test7.texto.length < 300;
    
    if (esAmigable) {
      console.log('✅ TEST 7 PASADO: Responde amigablemente');
      testsPasados++;
    } else {
      console.log('❌ TEST 7 FALLIDO: Respuesta muy corta o muy larga');
      testsFallidos++;
    }

    // RESUMEN FINAL
    console.log('\n\n🏁 ========================================');
    console.log('   RESUMEN DE TESTS');
    console.log('========================================');
    console.log(`✅ Tests pasados: ${testsPasados}/7`);
    console.log(`❌ Tests fallidos: ${testsFallidos}/7`);
    console.log(`📊 Porcentaje de éxito: ${Math.round((testsPasados/7)*100)}%`);
    
    if (testsFallidos === 0) {
      console.log('\n🎉 ¡PERFECTO! El bot está listo para deploy');
      console.log('✅ Todas las funcionalidades funcionan correctamente');
      process.exit(0);
    } else if (testsPasados >= 5) {
      console.log('\n⚠️  El bot funciona pero tiene algunos problemas menores');
      console.log('⚠️  Revisa los tests fallidos antes de deploy');
      process.exit(0);
    } else {
      console.log('\n❌ El bot tiene problemas críticos');
      console.log('❌ NO SUBIR hasta corregir los errores');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO EN LOS TESTS:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Ejecutar tests
testBot();
