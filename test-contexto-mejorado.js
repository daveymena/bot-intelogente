const axios = require('axios');

const API_URL = 'http://localhost:4000';
const PHONE = '573001234567';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function enviarMensaje(mensaje) {
  console.log(`\n📤 Usuario: "${mensaje}"`);
  
  try {
    const response = await axios.post(`${API_URL}/api/whatsapp/test-message`, {
      from: PHONE,
      message: mensaje
    });

    const respuesta = response.data.response;
    console.log(`🤖 Bot: ${respuesta.substring(0, 200)}${respuesta.length > 200 ? '...' : ''}`);
    
    return respuesta;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function testContextoPersistente() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🧪 TEST: CONTEXTO PERSISTENTE MEJORADO');
  console.log('═══════════════════════════════════════════════════\n');

  // 1. Buscar producto
  console.log('━━━ PASO 1: Buscar producto ━━━');
  await enviarMensaje('me interesa el curso de piano');
  await sleep(3000);

  // 2. Preguntar sobre el producto (sin mencionar nombre)
  console.log('\n━━━ PASO 2: Preguntar sin mencionar nombre ━━━');
  await enviarMensaje('me gustaría saber más sobre el curso');
  await sleep(3000);

  // 3. Preguntar precio (sin mencionar nombre)
  console.log('\n━━━ PASO 3: Preguntar precio ━━━');
  await enviarMensaje('cuánto cuesta?');
  await sleep(3000);

  // 4. Solicitar pago (sin mencionar nombre)
  console.log('\n━━━ PASO 4: Solicitar pago ━━━');
  await enviarMensaje('quiero comprarlo');
  await sleep(3000);

  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ TEST COMPLETADO');
  console.log('═══════════════════════════════════════════════════');
}

testContextoPersistente();
