/**
 * TEST DE CONVERSACIÓN REAL DEL BOT
 * Simula una conversación completa y muestra las respuestas para evaluar coherencia
 */

const { SuperSalesAI } = require('./dist/src/lib/super-sales-ai-fixed');
const { db } = require('./dist/src/lib/db');

const PHONE = '573001234567';
const BOT_USER_ID = process.env.DEFAULT_USER_ID || 'default-user-id';

// Contexto simulado inicial
let contextoSimulado = {
  userId: PHONE,
  historialMensajes: [],
  ultimoProductoId: null,
  ultimoProductoNombre: null,
  ultimaCategoria: null,
  metadata: {}
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function mostrarMensaje(tipo, mensaje, extra = {}) {
  const timestamp = new Date().toLocaleTimeString('es-CO');
  console.log('\n' + '═'.repeat(70));
  
  if (tipo === 'usuario') {
    console.log(`👤 USUARIO [${timestamp}]`);
    console.log(`   "${mensaje}"`);
  } else {
    console.log(`🤖 BOT [${timestamp}]`);
    console.log(`\n${mensaje}\n`);
    
    if (extra.fotos && extra.fotos.length > 0) {
      console.log(`📸 FOTOS ENVIADAS: ${extra.fotos.length}`);
      extra.fotos.forEach((foto, i) => {
        console.log(`   ${i + 1}. ${foto.url}`);
      });
    }
    
    if (extra.linksPago) {
      console.log(`💳 LINKS DE PAGO: Disponibles`);
    }
  }
  
  console.log('═'.repeat(70));
}

function evaluarRespuesta(pregunta, respuesta, criterios) {
  console.log('\n📊 EVALUACIÓN DE RESPUESTA:');
  console.log('─'.repeat(70));
  
  let puntaje = 0;
  let maxPuntaje = criterios.length;
  
  criterios.forEach(criterio => {
    const cumple = criterio.check(respuesta);
    if (cumple) {
      console.log(`✅ ${criterio.nombre}`);
      puntaje++;
    } else {
      console.log(`❌ ${criterio.nombre}`);
    }
  });
  
  const porcentaje = Math.round((puntaje / maxPuntaje) * 100);
  console.log('─'.repeat(70));
  console.log(`📈 PUNTAJE: ${puntaje}/${maxPuntaje} (${porcentaje}%)`);
  
  if (porcentaje >= 80) {
    console.log('✅ EXCELENTE - Respuesta coherente y completa');
  } else if (porcentaje >= 60) {
    console.log('⚠️  ACEPTABLE - Respuesta funcional pero mejorable');
  } else {
    console.log('❌ DEFICIENTE - Necesita mejoras urgentes');
  }
  
  return { puntaje, maxPuntaje, porcentaje };
}

async function testConversacionReal() {
  console.log('\n🎭 ========================================');
  console.log('   TEST DE CONVERSACIÓN REAL');
  console.log('   Evaluación de Coherencia y Calidad');
  console.log('========================================\n');
  
  const resultados = [];
  
  try {
    // Verificar conexión a BD
    console.log('🔌 Verificando conexión a base de datos...');
    await db.$connect();
    console.log('✅ Conectado a la base de datos\n');
    
    await sleep(1000);


    // ==========================================
    // ESCENARIO 1: SALUDO INICIAL
    // ==========================================
    console.log('\n🎬 ESCENARIO 1: Saludo Inicial');
    console.log('━'.repeat(70));
    
    const msg1 = 'Hola, buenos días';
    mostrarMensaje('usuario', msg1);
    
    const resp1 = await SuperSalesAI.processMessage(BOT_USER_ID, PHONE, msg1, contextoSimulado);
    mostrarMensaje('bot', resp1.response, { fotos: resp1.photos });
    
    const eval1 = evaluarRespuesta(msg1, resp1.response, [
      { nombre: 'Responde al saludo', check: (r) => /hola|buenos|bienvenido/i.test(r) },
      { nombre: 'Es amigable (usa emojis)', check: (r) => /[😊👋🙂😄]/.test(r) },
      { nombre: 'Ofrece ayuda', check: (r) => /ayud|interesa|busca|ofrec/i.test(r) },
      { nombre: 'No es muy largo (< 200 chars)', check: (r) => r.length < 200 },
      { nombre: 'No inventa información', check: (r) => !r.includes('$') }
    ]);
    resultados.push({ escenario: 'Saludo', ...eval1 });
    
    await sleep(2000);

    // ==========================================
    // ESCENARIO 2: BÚSQUEDA DE PRODUCTO
    // ==========================================
    console.log('\n\n🎬 ESCENARIO 2: Búsqueda de Producto');
    console.log('━'.repeat(70));
    
    const msg2 = 'Busco un megapack de idiomas';
    mostrarMensaje('usuario', msg2);
    
    const resp2 = await SuperSalesAI.processMessage(BOT_USER_ID, PHONE, msg2, contextoSimulado);
    mostrarMensaje('bot', resp2.response, { fotos: resp2.photos });
    
    const eval2 = evaluarRespuesta(msg2, resp2.response, [
      { nombre: 'Menciona el producto', check: (r) => /idioma|megapack/i.test(r) },
      { nombre: 'Incluye precio', check: (r) => /\$|COP|precio/i.test(r) },
      { nombre: 'Tiene descripción', check: (r) => r.length > 100 },
      { nombre: 'Envía fotos', check: (r) => resp2.photos && resp2.photos.length > 0 },
      { nombre: 'Formato profesional', check: (r) => /━|─|✨|📦/.test(r) }
    ]);
    resultados.push({ escenario: 'Búsqueda Producto', ...eval2 });
    
    // Actualizar contexto
    if (resp2.response.includes('idioma')) {
      contextoSimulado.ultimoProductoNombre = 'Megapack de Idiomas';
      contextoSimulado.ultimaCategoria = 'DIGITAL';
    }
    
    await sleep(2000);

    // ==========================================
    // ESCENARIO 3: PREGUNTA SOBRE EL MISMO PRODUCTO
    // ==========================================
    console.log('\n\n🎬 ESCENARIO 3: Mantener Contexto');
    console.log('━'.repeat(70));
    
    const msg3 = 'Cuéntame más sobre ese';
    mostrarMensaje('usuario', msg3);
    
    const resp3 = await SuperSalesAI.processMessage(BOT_USER_ID, PHONE, msg3, contextoSimulado);
    mostrarMensaje('bot', resp3.response, { fotos: resp3.photos });
    
    const eval3 = evaluarRespuesta(msg3, resp3.response, [
      { nombre: 'Mantiene contexto del producto', check: (r) => /idioma|megapack/i.test(r) },
      { nombre: 'Da información adicional', check: (r) => r.length > 80 },
      { nombre: 'No repite exactamente lo anterior', check: (r) => r !== resp2.response },
      { nombre: 'Sigue siendo relevante', check: (r) => !r.includes('laptop') && !r.includes('moto') }
    ]);
    resultados.push({ escenario: 'Contexto', ...eval3 });
    
    await sleep(2000);

    // ==========================================
    // ESCENARIO 4: SOLICITUD DE FOTOS
    // ==========================================
    console.log('\n\n🎬 ESCENARIO 4: Solicitud de Fotos');
    console.log('━'.repeat(70));
    
    const msg4 = 'Tienes fotos?';
    mostrarMensaje('usuario', msg4);
    
    const resp4 = await SuperSalesAI.processMessage(BOT_USER_ID, PHONE, msg4, contextoSimulado);
    mostrarMensaje('bot', resp4.response, { fotos: resp4.photos });
    
    const eval4 = evaluarRespuesta(msg4, resp4.response, [
      { nombre: 'Responde sobre fotos', check: (r) => /foto|imagen|ver|envío/i.test(r) },
      { nombre: 'Envía fotos si tiene', check: (r) => resp4.shouldSendPhotos || r.includes('no tengo') },
      { nombre: 'Mantiene contexto', check: (r) => /idioma|megapack/i.test(r) || resp4.photos }
    ]);
    resultados.push({ escenario: 'Fotos', ...eval4 });
    
    await sleep(2000);

    // ==========================================
    // ESCENARIO 5: INFORMACIÓN DE PAGO
    // ==========================================
    console.log('\n\n🎬 ESCENARIO 5: Información de Pago');
    console.log('━'.repeat(70));
    
    const msg5 = 'Cómo puedo pagar?';
    mostrarMensaje('usuario', msg5);
    
    const resp5 = await SuperSalesAI.processMessage(BOT_USER_ID, PHONE, msg5, contextoSimulado);
    mostrarMensaje('bot', resp5.response, { fotos: resp5.photos });
    
    const eval5 = evaluarRespuesta(msg5, resp5.response, [
      { nombre: 'Menciona métodos de pago', check: (r) => /mercadopago|nequi|pago|transferencia/i.test(r) },
      { nombre: 'Mantiene contexto del producto', check: (r) => /idioma|megapack|\$/i.test(r) },
      { nombre: 'Da instrucciones claras', check: (r) => r.length > 50 },
      { nombre: 'Es profesional', check: (r) => !r.includes('no sé') && !r.includes('no tengo') }
    ]);
    resultados.push({ escenario: 'Pago', ...eval5 });
    
    await sleep(2000);

    // ==========================================
    // ESCENARIO 6: CAMBIO DE PRODUCTO
    // ==========================================
    console.log('\n\n🎬 ESCENARIO 6: Cambio de Producto');
    console.log('━'.repeat(70));
    
    const msg6 = 'Y laptops tienes?';
    mostrarMensaje('usuario', msg6);
    
    const resp6 = await SuperSalesAI.processMessage(BOT_USER_ID, PHONE, msg6, contextoSimulado);
    mostrarMensaje('bot', resp6.response, { fotos: resp6.photos });
    
    const eval6 = evaluarRespuesta(msg6, resp6.response, [
      { nombre: 'Cambia de tema correctamente', check: (r) => /laptop|portátil|computador/i.test(r) },
      { nombre: 'No mezcla con producto anterior', check: (r) => !r.includes('idioma') || r.includes('también') },
      { nombre: 'Muestra opciones', check: (r) => r.length > 100 },
      { nombre: 'Mantiene profesionalismo', check: (r) => /\$|COP|precio/i.test(r) || r.includes('disponible') }
    ]);
    resultados.push({ escenario: 'Cambio Producto', ...eval6 });
    
    await sleep(2000);

    // ==========================================
    // ESCENARIO 7: PREGUNTA CASUAL
    // ==========================================
    console.log('\n\n🎬 ESCENARIO 7: Conversación Casual');
    console.log('━'.repeat(70));
    
    const msg7 = 'Gracias por la información';
    mostrarMensaje('usuario', msg7);
    
    const resp7 = await SuperSalesAI.processMessage(BOT_USER_ID, PHONE, msg7, contextoSimulado);
    mostrarMensaje('bot', resp7.response, { fotos: resp7.photos });
    
    const eval7 = evaluarRespuesta(msg7, resp7.response, [
      { nombre: 'Responde amablemente', check: (r) => /gracias|gusto|orden|ayud/i.test(r) },
      { nombre: 'Es breve', check: (r) => r.length < 150 },
      { nombre: 'Ofrece seguir ayudando', check: (r) => /más|otra|ayud|pregunta/i.test(r) },
      { nombre: 'Usa emojis apropiados', check: (r) => /[😊🙂👍✨]/.test(r) }
    ]);
    resultados.push({ escenario: 'Casual', ...eval7 });


    // ==========================================
    // RESUMEN FINAL
    // ==========================================
    console.log('\n\n');
    console.log('🏁 '.repeat(35));
    console.log('\n   RESUMEN FINAL DE EVALUACIÓN\n');
    console.log('🏁 '.repeat(35));
    
    let totalPuntaje = 0;
    let totalMaximo = 0;
    
    console.log('\n📊 RESULTADOS POR ESCENARIO:\n');
    resultados.forEach((r, i) => {
      totalPuntaje += r.puntaje;
      totalMaximo += r.maxPuntaje;
      
      const emoji = r.porcentaje >= 80 ? '✅' : r.porcentaje >= 60 ? '⚠️' : '❌';
      console.log(`${emoji} ${i + 1}. ${r.escenario.padEnd(20)} ${r.puntaje}/${r.maxPuntaje} (${r.porcentaje}%)`);
    });
    
    const promedioFinal = Math.round((totalPuntaje / totalMaximo) * 100);
    
    console.log('\n' + '═'.repeat(70));
    console.log(`\n📈 PUNTAJE TOTAL: ${totalPuntaje}/${totalMaximo} (${promedioFinal}%)\n`);
    console.log('═'.repeat(70));
    
    // Evaluación final
    console.log('\n🎯 EVALUACIÓN FINAL:\n');
    
    if (promedioFinal >= 85) {
      console.log('✅ EXCELENTE - Bot listo para producción');
      console.log('   • Respuestas coherentes y profesionales');
      console.log('   • Mantiene contexto correctamente');
      console.log('   • Calidad de respuestas alta');
      console.log('\n🚀 RECOMENDACIÓN: SUBIR A PRODUCCIÓN');
    } else if (promedioFinal >= 70) {
      console.log('⚠️  BUENO - Bot funcional con mejoras menores');
      console.log('   • Respuestas generalmente coherentes');
      console.log('   • Algunos detalles por pulir');
      console.log('   • Funcionalidad básica correcta');
      console.log('\n✅ RECOMENDACIÓN: PUEDE SUBIRSE (con monitoreo)');
    } else if (promedioFinal >= 50) {
      console.log('⚠️  REGULAR - Bot necesita mejoras');
      console.log('   • Funcionalidad básica presente');
      console.log('   • Problemas de coherencia o contexto');
      console.log('   • Requiere optimización');
      console.log('\n⚠️  RECOMENDACIÓN: MEJORAR ANTES DE SUBIR');
    } else {
      console.log('❌ DEFICIENTE - Bot no está listo');
      console.log('   • Problemas críticos de funcionalidad');
      console.log('   • Respuestas incoherentes');
      console.log('   • Requiere trabajo significativo');
      console.log('\n❌ RECOMENDACIÓN: NO SUBIR - CORREGIR ERRORES');
    }
    
    // Áreas de mejora
    console.log('\n\n📝 ÁREAS DE MEJORA DETECTADAS:\n');
    
    const areasMejora = [];
    resultados.forEach(r => {
      if (r.porcentaje < 80) {
        areasMejora.push(`   • ${r.escenario}: ${r.porcentaje}% - Necesita atención`);
      }
    });
    
    if (areasMejora.length === 0) {
      console.log('   ✅ No se detectaron áreas críticas de mejora');
    } else {
      areasMejora.forEach(area => console.log(area));
    }
    
    // Fortalezas
    console.log('\n\n💪 FORTALEZAS DETECTADAS:\n');
    
    const fortalezas = [];
    resultados.forEach(r => {
      if (r.porcentaje >= 80) {
        fortalezas.push(`   ✅ ${r.escenario}: ${r.porcentaje}%`);
      }
    });
    
    if (fortalezas.length === 0) {
      console.log('   ⚠️  No se detectaron fortalezas claras');
    } else {
      fortalezas.forEach(f => console.log(f));
    }
    
    console.log('\n' + '═'.repeat(70));
    console.log('\n✅ Test completado exitosamente\n');
    
    // Cerrar conexión
    await db.$disconnect();
    
    // Exit code basado en resultado
    if (promedioFinal >= 70) {
      process.exit(0);
    } else {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR DURANTE EL TEST:', error);
    console.error('\nStack:', error.stack);
    
    try {
      await db.$disconnect();
    } catch (e) {}
    
    process.exit(1);
  }
}

// Ejecutar test
console.log('Iniciando test de conversación real...');
console.log('Esto tomará aproximadamente 20 segundos\n');

testConversacionReal();
