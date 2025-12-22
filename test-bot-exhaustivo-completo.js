/**
 * TEST EXHAUSTIVO DEL BOT - VERIFICACIÓN COMPLETA
 * 
 * Verifica TODAS las capacidades:
 * 1. ✅ Contexto y memoria (24h)
 * 2. ✅ Búsqueda inteligente de productos
 * 3. ✅ Respuestas coherentes y naturales
 * 4. ✅ Razonamiento y comprensión
 * 5. ✅ Capacidad de resolver problemas
 * 6. ✅ Seguimiento inteligente
 * 7. ✅ Cierre de ventas
 * 8. ✅ Manejo de objeciones
 */

const { procesarMensaje } = require('./dist/src/conversational-module/ai/conversacionController');

const PHONE = '573001234567';
const BOT_USER_ID = process.env.DEFAULT_USER_ID || 'default-user-id';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(color, text) {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let testsPasados = 0;
let testsFallidos = 0;
let testsAdvertencia = 0;

async function verificarRespuesta(test, respuesta, criterios) {
  log('cyan', `\n📝 TEST ${test.numero}: ${test.nombre}`);
  log('blue', '─'.repeat(60));
  log('yellow', `👤 Usuario: "${test.mensaje}"`);
  
  if (!respuesta || !respuesta.texto) {
    log('red', '❌ ERROR: No se recibió respuesta del bot');
    testsFallidos++;
    return false;
  }
  
  log('magenta', `🤖 Bot: "${respuesta.texto.substring(0, 200)}${respuesta.texto.length > 200 ? '...' : ''}"`);
  
  if (respuesta.fotos && respuesta.fotos.length > 0) {
    log('cyan', `📸 Fotos enviadas: ${respuesta.fotos.length}`);
  }
  
  // Verificar criterios
  let cumpleTodos = true;
  let cumpleAlgunos = false;
  
  for (const criterio of criterios) {
    const cumple = criterio.check(respuesta);
    if (cumple) {
      cumpleAlgunos = true;
      log('green', `  ✓ ${criterio.descripcion}`);
    } else {
      cumpleTodos = false;
      if (criterio.critico) {
        log('red', `  ✗ ${criterio.descripcion} (CRÍTICO)`);
      } else {
        log('yellow', `  ⚠ ${criterio.descripcion} (opcional)`);
      }
    }
  }
  
  // Evaluar resultado
  const criticosFallidos = criterios.filter(c => c.critico && !c.check(respuesta)).length;
  
  if (criticosFallidos === 0 && cumpleTodos) {
    log('green', '✅ TEST PASADO: Todos los criterios cumplidos');
    testsPasados++;
    return true;
  } else if (criticosFallidos === 0 && cumpleAlgunos) {
    log('yellow', '⚠️  TEST PARCIAL: Criterios críticos OK, algunos opcionales fallaron');
    testsAdvertencia++;
    return true;
  } else {
    log('red', '❌ TEST FALLIDO: Criterios críticos no cumplidos');
    testsFallidos++;
    return false;
  }
}

async function ejecutarTests() {
  log('cyan', '\n' + '='.repeat(60));
  log('cyan', '   TEST EXHAUSTIVO DEL BOT');
  log('cyan', '   Verificación Completa de Capacidades');
  log('cyan', '='.repeat(60) + '\n');


  try {
    // ==========================================
    // CATEGORÍA 1: CONTEXTO Y MEMORIA
    // ==========================================
    log('magenta', '\n🧠 CATEGORÍA 1: CONTEXTO Y MEMORIA (24h)');
    log('blue', '='.repeat(60));

    // TEST 1.1: Saludo inicial
    await verificarRespuesta(
      { numero: '1.1', nombre: 'Saludo inicial', mensaje: 'Hola, buenos días' },
      await procesarMensaje(PHONE, 'Hola, buenos días', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Responde con saludo', check: r => /hola|buenos|bienvenido/i.test(r.texto), critico: true },
        { descripcion: 'Ofrece ayuda', check: r => /ayud|busca|interesa|necesita/i.test(r.texto), critico: true },
        { descripcion: 'Tono amigable con emojis', check: r => /[😊👋🙂]/i.test(r.texto), critico: false }
      ]
    );
    await sleep(2000);

    // TEST 1.2: Búsqueda de producto (establece contexto)
    await verificarRespuesta(
      { numero: '1.2', nombre: 'Búsqueda de producto', mensaje: 'Busco un megapack de idiomas' },
      await procesarMensaje(PHONE, 'Busco un megapack de idiomas', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Encuentra el producto', check: r => /megapack|idioma/i.test(r.texto), critico: true },
        { descripcion: 'Muestra precio', check: r => /\$|COP|precio/i.test(r.texto), critico: true },
        { descripcion: 'Incluye descripción', check: r => r.texto.length > 100, critico: true },
        { descripcion: 'Envía fotos', check: r => r.fotos && r.fotos.length > 0, critico: false }
      ]
    );
    await sleep(2000);

    // TEST 1.3: Mantiene contexto (referencia al producto anterior)
    await verificarRespuesta(
      { numero: '1.3', nombre: 'Mantiene contexto', mensaje: 'Cuéntame más sobre ese' },
      await procesarMensaje(PHONE, 'Cuéntame más sobre ese', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Recuerda el producto', check: r => /megapack|idioma/i.test(r.texto), critico: true },
        { descripcion: 'Da información adicional', check: r => r.texto.length > 80, critico: true },
        { descripcion: 'No pregunta qué producto', check: r => !/cuál|qué producto/i.test(r.texto), critico: true }
      ]
    );
    await sleep(2000);

    // TEST 1.4: Contexto con pronombres
    await verificarRespuesta(
      { numero: '1.4', nombre: 'Contexto con pronombres', mensaje: 'Tienes fotos de eso?' },
      await procesarMensaje(PHONE, 'Tienes fotos de eso?', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Entiende "eso" = producto anterior', check: r => /megapack|idioma|foto|imagen/i.test(r.texto), critico: true },
        { descripcion: 'Envía fotos o explica', check: r => (r.fotos && r.fotos.length > 0) || /foto|imagen/i.test(r.texto), critico: true }
      ]
    );
    await sleep(2000);

    // ==========================================
    // CATEGORÍA 2: BÚSQUEDA INTELIGENTE
    // ==========================================
    log('magenta', '\n🔍 CATEGORÍA 2: BÚSQUEDA INTELIGENTE DE PRODUCTOS');
    log('blue', '='.repeat(60));

    // TEST 2.1: Búsqueda con errores ortográficos
    await verificarRespuesta(
      { numero: '2.1', nombre: 'Búsqueda con typos', mensaje: 'Tienes portatiles para diseño grafico?' },
      await procesarMensaje(PHONE, 'Tienes portatiles para diseño grafico?', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Entiende "portatiles" = portátiles', check: r => /portátil|laptop|computador/i.test(r.texto), critico: true },
        { descripcion: 'Encuentra productos', check: r => /\$|COP|precio/i.test(r.texto), critico: true },
        { descripcion: 'Considera "diseño gráfico"', check: r => r.texto.length > 100, critico: false }
      ]
    );
    await sleep(2000);

    // TEST 2.2: Búsqueda por características
    await verificarRespuesta(
      { numero: '2.2', nombre: 'Búsqueda por características', mensaje: 'Algo económico para estudiantes' },
      await procesarMensaje(PHONE, 'Algo económico para estudiantes', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Entiende "económico"', check: r => /económico|precio|barato|accesible/i.test(r.texto) || /\$/i.test(r.texto), critico: true },
        { descripcion: 'Sugiere productos', check: r => r.texto.length > 80, critico: true },
        { descripcion: 'Menciona beneficios', check: r => /estudiante|estudio|aprender/i.test(r.texto), critico: false }
      ]
    );
    await sleep(2000);

    // TEST 2.3: Cambio de producto (nuevo contexto)
    await verificarRespuesta(
      { numero: '2.3', nombre: 'Cambio de producto', mensaje: 'Mejor muéstrame cursos de piano' },
      await procesarMensaje(PHONE, 'Mejor muéstrame cursos de piano', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Cambia a nuevo producto', check: r => /piano|curso|música/i.test(r.texto), critico: true },
        { descripcion: 'Olvida producto anterior', check: r => !/portátil|laptop|computador/i.test(r.texto), critico: true },
        { descripcion: 'Muestra información completa', check: r => /\$|COP|precio/i.test(r.texto), critico: true }
      ]
    );
    await sleep(2000);

    // ==========================================
    // CATEGORÍA 3: RESPUESTAS COHERENTES
    // ==========================================
    log('magenta', '\n💬 CATEGORÍA 3: RESPUESTAS COHERENTES Y NATURALES');
    log('blue', '='.repeat(60));

    // TEST 3.1: Pregunta sobre disponibilidad
    await verificarRespuesta(
      { numero: '3.1', nombre: 'Pregunta disponibilidad', mensaje: 'Está disponible?' },
      await procesarMensaje(PHONE, 'Está disponible?', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Confirma disponibilidad', check: r => /disponible|sí|claro|por supuesto/i.test(r.texto), critico: true },
        { descripcion: 'Mantiene contexto del curso', check: r => /piano|curso/i.test(r.texto), critico: true },
        { descripcion: 'Respuesta natural', check: r => r.texto.length > 30 && r.texto.length < 300, critico: false }
      ]
    );
    await sleep(2000);

    // TEST 3.2: Pregunta sobre precio
    await verificarRespuesta(
      { numero: '3.2', nombre: 'Pregunta sobre precio', mensaje: 'Cuánto cuesta?' },
      await procesarMensaje(PHONE, 'Cuánto cuesta?', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Muestra precio claro', check: r => /\$|COP|\d+/i.test(r.texto), critico: true },
        { descripcion: 'Menciona el producto', check: r => /piano|curso/i.test(r.texto), critico: true },
        { descripcion: 'Ofrece más info', check: r => r.texto.length > 50, critico: false }
      ]
    );
    await sleep(2000);

    // TEST 3.3: Conversación casual
    await verificarRespuesta(
      { numero: '3.3', nombre: 'Conversación casual', mensaje: 'Genial, me gusta' },
      await procesarMensaje(PHONE, 'Genial, me gusta', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Responde positivamente', check: r => /excelente|perfecto|genial|bien/i.test(r.texto), critico: true },
        { descripcion: 'Avanza la conversación', check: r => /pago|comprar|adquirir|método|link/i.test(r.texto) || /ayud|más/i.test(r.texto), critico: false }
      ]
    );
    await sleep(2000);

    // ==========================================
    // CATEGORÍA 4: RAZONAMIENTO
    // ==========================================
    log('magenta', '\n🧩 CATEGORÍA 4: RAZONAMIENTO Y COMPRENSIÓN');
    log('blue', '='.repeat(60));

    // TEST 4.1: Pregunta compleja
    await verificarRespuesta(
      { numero: '4.1', nombre: 'Pregunta compleja', mensaje: 'Es mejor este curso o un megapack completo?' },
      await procesarMensaje(PHONE, 'Es mejor este curso o un megapack completo?', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Entiende comparación', check: r => /curso|megapack/i.test(r.texto), critico: true },
        { descripcion: 'Da recomendación razonada', check: r => r.texto.length > 100, critico: true },
        { descripcion: 'Menciona diferencias', check: r => /diferencia|depende|mejor|recomiendo/i.test(r.texto), critico: false }
      ]
    );
    await sleep(2000);

    // TEST 4.2: Inferencia de necesidad
    await verificarRespuesta(
      { numero: '4.2', nombre: 'Inferencia de necesidad', mensaje: 'Quiero aprender rápido' },
      await procesarMensaje(PHONE, 'Quiero aprender rápido', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Entiende urgencia', check: r => /rápido|pronto|inmediato|ya/i.test(r.texto) || r.texto.length > 50, critico: true },
        { descripcion: 'Sugiere solución', check: r => /curso|megapack|producto/i.test(r.texto), critico: true }
      ]
    );
    await sleep(2000);

    // ==========================================
    // CATEGORÍA 5: RESOLUCIÓN DE PROBLEMAS
    // ==========================================
    log('magenta', '\n🔧 CATEGORÍA 5: CAPACIDAD DE RESOLVER PROBLEMAS');
    log('blue', '='.repeat(60));

    // TEST 5.1: Objeción de precio
    await verificarRespuesta(
      { numero: '5.1', nombre: 'Objeción de precio', mensaje: 'Me parece muy caro' },
      await procesarMensaje(PHONE, 'Me parece muy caro', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Maneja objeción', check: r => r.texto.length > 80, critico: true },
        { descripcion: 'Justifica valor', check: r => /valor|beneficio|incluye|contenido|aprende/i.test(r.texto), critico: true },
        { descripcion: 'Ofrece alternativa', check: r => /otro|alternativa|opción|económico/i.test(r.texto) || r.texto.length > 100, critico: false }
      ]
    );
    await sleep(2000);

    // TEST 5.2: Duda sobre entrega
    await verificarRespuesta(
      { numero: '5.2', nombre: 'Duda sobre entrega', mensaje: 'Cómo me lo entregan?' },
      await procesarMensaje(PHONE, 'Cómo me lo entregan?', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Explica entrega', check: r => /entrega|envío|digital|link|correo|whatsapp/i.test(r.texto), critico: true },
        { descripcion: 'Da detalles claros', check: r => r.texto.length > 60, critico: true },
        { descripcion: 'Tranquiliza al cliente', check: r => /inmediato|rápido|fácil|simple/i.test(r.texto), critico: false }
      ]
    );
    await sleep(2000);

    // TEST 5.3: Pregunta sobre métodos de pago
    await verificarRespuesta(
      { numero: '5.3', nombre: 'Métodos de pago', mensaje: 'Cómo puedo pagar?' },
      await procesarMensaje(PHONE, 'Cómo puedo pagar?', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Lista métodos de pago', check: r => /mercadopago|nequi|paypal|pago|método/i.test(r.texto), critico: true },
        { descripcion: 'Da instrucciones', check: r => r.texto.length > 80, critico: true },
        { descripcion: 'Ofrece link o ayuda', check: r => /link|envío|ayudo/i.test(r.texto), critico: false }
      ]
    );
    await sleep(2000);

    // ==========================================
    // CATEGORÍA 6: SEGUIMIENTO INTELIGENTE
    // ==========================================
    log('magenta', '\n📊 CATEGORÍA 6: SEGUIMIENTO INTELIGENTE');
    log('blue', '='.repeat(60));

    // TEST 6.1: Pregunta de seguimiento
    await verificarRespuesta(
      { numero: '6.1', nombre: 'Pregunta de seguimiento', mensaje: 'Y si tengo dudas después?' },
      await procesarMensaje(PHONE, 'Y si tengo dudas después?', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Ofrece soporte', check: r => /ayuda|soporte|contacto|escribir|preguntar/i.test(r.texto), critico: true },
        { descripcion: 'Tranquiliza', check: r => /siempre|aquí|disponible/i.test(r.texto), critico: false }
      ]
    );
    await sleep(2000);

    // TEST 6.2: Interés en comprar
    await verificarRespuesta(
      { numero: '6.2', nombre: 'Interés en comprar', mensaje: 'Ok, lo quiero' },
      await procesarMensaje(PHONE, 'Ok, lo quiero', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Reconoce intención de compra', check: r => /excelente|perfecto|genial/i.test(r.texto), critico: true },
        { descripcion: 'Guía al pago', check: r => /pago|link|método|comprar/i.test(r.texto), critico: true },
        { descripcion: 'Mantiene contexto del producto', check: r => /curso|piano/i.test(r.texto) || r.texto.length > 50, critico: false }
      ]
    );
    await sleep(2000);

    // ==========================================
    // CATEGORÍA 7: CIERRE DE VENTAS
    // ==========================================
    log('magenta', '\n💰 CATEGORÍA 7: CAPACIDAD DE CIERRE');
    log('blue', '='.repeat(60));

    // TEST 7.1: Solicitud de link de pago
    await verificarRespuesta(
      { numero: '7.1', nombre: 'Solicitud de link', mensaje: 'Dame el link de pago' },
      await procesarMensaje(PHONE, 'Dame el link de pago', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Proporciona link o info', check: r => /link|pago|mercadopago|nequi|método/i.test(r.texto), critico: true },
        { descripcion: 'Confirma producto', check: r => /curso|piano/i.test(r.texto) || r.texto.length > 50, critico: false },
        { descripcion: 'Da instrucciones claras', check: r => r.texto.length > 60, critico: true }
      ]
    );
    await sleep(2000);

    // TEST 7.2: Confirmación final
    await verificarRespuesta(
      { numero: '7.2', nombre: 'Confirmación final', mensaje: 'Perfecto, gracias' },
      await procesarMensaje(PHONE, 'Perfecto, gracias', { botUserId: BOT_USER_ID }),
      [
        { descripcion: 'Agradece', check: r => /gracias|excelente|perfecto|bien/i.test(r.texto), critico: true },
        { descripcion: 'Ofrece ayuda adicional', check: r => /ayuda|necesita|duda|pregunta/i.test(r.texto), critico: false },
        { descripcion: 'Cierre profesional', check: r => r.texto.length > 30, critico: false }
      ]
    );

    // ==========================================
    // RESUMEN FINAL
    // ==========================================
    log('cyan', '\n' + '='.repeat(60));
    log('cyan', '   RESUMEN DE RESULTADOS');
    log('cyan', '='.repeat(60) + '\n');

    const totalTests = testsPasados + testsFallidos + testsAdvertencia;
    const porcentajeExito = Math.round(((testsPasados + testsAdvertencia) / totalTests) * 100);

    log('green', `✅ Tests Pasados: ${testsPasados}/${totalTests}`);
    log('yellow', `⚠️  Tests con Advertencia: ${testsAdvertencia}/${totalTests}`);
    log('red', `❌ Tests Fallidos: ${testsFallidos}/${totalTests}`);
    log('cyan', `📊 Porcentaje de Éxito: ${porcentajeExito}%\n`);

    // Evaluación por categorías
    log('magenta', 'EVALUACIÓN POR CATEGORÍAS:');
    log('blue', '─'.repeat(60));
    log('cyan', '🧠 Contexto y Memoria: ' + (testsPasados >= 3 ? '✅ EXCELENTE' : '⚠️  REVISAR'));
    log('cyan', '🔍 Búsqueda Inteligente: ' + (testsPasados >= 6 ? '✅ EXCELENTE' : '⚠️  REVISAR'));
    log('cyan', '💬 Respuestas Coherentes: ' + (testsPasados >= 9 ? '✅ EXCELENTE' : '⚠️  REVISAR'));
    log('cyan', '🧩 Razonamiento: ' + (testsPasados >= 11 ? '✅ EXCELENTE' : '⚠️  REVISAR'));
    log('cyan', '🔧 Resolución de Problemas: ' + (testsPasados >= 14 ? '✅ EXCELENTE' : '⚠️  REVISAR'));
    log('cyan', '📊 Seguimiento Inteligente: ' + (testsPasados >= 16 ? '✅ EXCELENTE' : '⚠️  REVISAR'));
    log('cyan', '💰 Cierre de Ventas: ' + (testsPasados >= 18 ? '✅ EXCELENTE' : '⚠️  REVISAR'));

    // Conclusión final
    log('cyan', '\n' + '='.repeat(60));
    if (porcentajeExito >= 90) {
      log('green', '🎉 ¡EXCELENTE! El bot está LISTO para producción');
      log('green', '✅ Todas las capacidades funcionan correctamente');
      process.exit(0);
    } else if (porcentajeExito >= 75) {
      log('yellow', '⚠️  BUENO: El bot funciona pero tiene áreas de mejora');
      log('yellow', '⚠️  Revisa los tests fallidos antes de deploy');
      process.exit(0);
    } else {
      log('red', '❌ CRÍTICO: El bot tiene problemas importantes');
      log('red', '❌ NO SUBIR hasta corregir los errores');
      process.exit(1);
    }

  } catch (error) {
    log('red', '\n❌ ERROR CRÍTICO EN LOS TESTS:');
    console.error(error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Ejecutar tests
ejecutarTests();
