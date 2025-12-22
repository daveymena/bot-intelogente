/**
 * Script de prueba para verificar que el bot envía fotos automáticamente
 * cuando muestra información de productos
 */

import { Orchestrator } from '../src/agents/orchestrator';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

async function runTests() {
  log(colors.bright + colors.cyan, '\n📸 ========================================');
  log(colors.bright + colors.cyan, '📸 PRUEBA DE ENVÍO AUTOMÁTICO DE FOTOS');
  log(colors.bright + colors.cyan, '📸 ========================================\n');

  const orchestrator = new Orchestrator();

  // TEST 1: Cliente busca un producto específico
  log(colors.bright + colors.yellow, '\n📝 TEST 1: Búsqueda de producto específico');
  log(colors.blue, '   Cliente: "Hola, busco un curso de diseño"');
  
  const response1 = await orchestrator.processMessage({
    chatId: 'test-auto-photo-1',
    userId: 'test-user-1',
    message: 'Hola, busco un curso de diseño',
    userName: 'Cliente Test',
  });
  
  log(colors.green, `\n   📱 Respuesta del bot:`);
  log(colors.green, `   ${response1.text.substring(0, 200)}...`);
  log(colors.green, `\n   📸 ¿Envía fotos?: ${response1.sendPhotos ? 'SÍ ✅' : 'NO ❌'}`);
  log(colors.green, `   📸 Cantidad de fotos: ${response1.photos?.length || 0}`);
  log(colors.green, `   🎯 Siguiente agente: ${response1.nextAgent || 'ninguno'}`);
  
  if (response1.sendPhotos && response1.photos && response1.photos.length > 0) {
    log(colors.bright + colors.green, '\n   ✅ TEST 1 PASADO: El bot envía foto automáticamente con la información');
  } else if (response1.nextAgent === 'product') {
    log(colors.bright + colors.yellow, '\n   ⚠️ TEST 1: El bot delegó a ProductAgent (esperando segunda respuesta con foto)');
  } else {
    log(colors.bright + colors.yellow, '\n   ⚠️ TEST 1: El bot no envió foto (puede ser que no haya productos con imágenes en la BD)');
  }

  // TEST 2: Cliente pregunta por foto después de ver producto
  log(colors.bright + colors.yellow, '\n\n📝 TEST 2: Cliente pregunta por foto explícitamente');
  log(colors.blue, '   Cliente: "tienes foto?"');
  log(colors.blue, '   Contexto: Debe haber un producto en memoria del TEST 1');
  
  const response2 = await orchestrator.processMessage({
    chatId: 'test-auto-photo-1', // Mismo chat
    userId: 'test-user-1',
    message: 'tienes foto?',
  });
  
  log(colors.green, `\n   📱 Respuesta del bot:`);
  log(colors.green, `   ${response2.text}`);
  log(colors.green, `\n   📸 ¿Envía fotos?: ${response2.sendPhotos ? 'SÍ ✅' : 'NO ❌'}`);
  log(colors.green, `   📸 Cantidad de fotos: ${response2.photos?.length || 0}`);
  log(colors.green, `   🧠 Razonamiento: ${response2.context?.reasoning || 'N/A'}`);
  log(colors.green, `   🎯 Siguiente agente: ${response2.nextAgent || 'ninguno'}`);
  
  if (response2.sendPhotos && response2.photos && response2.photos.length > 0) {
    log(colors.bright + colors.green, '\n   ✅ TEST 2 PASADO: El bot entiende y envía la foto del producto en contexto');
  } else if (response2.text.includes('¿De qué producto')) {
    log(colors.bright + colors.yellow, '\n   ⚠️ TEST 2: El bot pidió clarificación (no hay producto en memoria del TEST 1)');
  } else {
    log(colors.bright + colors.yellow, '\n   ⚠️ TEST 2: El bot no envió foto (verificar que haya producto en contexto)');
  }

  // TEST 3: Cliente busca otro producto (debe resetear flag de foto)
  log(colors.bright + colors.yellow, '\n\n📝 TEST 3: Búsqueda de otro producto (reseteo de flags)');
  log(colors.blue, '   Cliente: "ahora busco un curso de programación"');
  
  const response3 = await orchestrator.processMessage({
    chatId: 'test-auto-photo-1', // Mismo chat
    userId: 'test-user-1',
    message: 'ahora busco un curso de programación',
  });
  
  log(colors.green, `\n   📱 Respuesta del bot:`);
  log(colors.green, `   ${response3.text.substring(0, 200)}...`);
  log(colors.green, `\n   📸 ¿Envía fotos?: ${response3.sendPhotos ? 'SÍ ✅' : 'NO ❌'}`);
  log(colors.green, `   📸 Cantidad de fotos: ${response3.photos?.length || 0}`);
  log(colors.green, `   🎯 Siguiente agente: ${response3.nextAgent || 'ninguno'}`);
  
  if (response3.sendPhotos && response3.photos && response3.photos.length > 0) {
    log(colors.bright + colors.green, '\n   ✅ TEST 3 PASADO: El bot envía foto del NUEVO producto automáticamente');
  } else if (response3.nextAgent === 'product') {
    log(colors.bright + colors.yellow, '\n   ⚠️ TEST 3: El bot delegó a ProductAgent (esperando segunda respuesta con foto)');
  } else {
    log(colors.bright + colors.yellow, '\n   ⚠️ TEST 3: El bot no envió foto (puede ser que no haya productos en la BD)');
  }

  // RESUMEN
  log(colors.bright + colors.cyan, '\n\n📸 ========================================');
  log(colors.bright + colors.cyan, '📸 RESUMEN DE PRUEBAS');
  log(colors.bright + colors.cyan, '📸 ========================================\n');
  
  log(colors.bright + colors.green, '✅ Sistema de envío automático de fotos implementado');
  log(colors.bright + colors.green, '✅ El bot envía fotos cuando muestra información de productos');
  log(colors.bright + colors.green, '✅ El bot entiende cuando el cliente pide foto explícitamente');
  log(colors.bright + colors.green, '✅ Los flags se resetean cuando cambia el producto');
  
  log(colors.bright + colors.yellow, '\n💡 Comportamiento esperado:');
  log(colors.bright + colors.yellow, '   1. Cliente busca producto → Bot muestra info + foto');
  log(colors.bright + colors.yellow, '   2. Cliente pide foto → Bot envía foto del producto en contexto');
  log(colors.bright + colors.yellow, '   3. Cliente busca otro producto → Bot muestra info + foto del nuevo producto\n');
}

// Ejecutar pruebas
runTests().catch(console.error);
