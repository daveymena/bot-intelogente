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
    console.log(`🤖 Bot: ${respuesta}`);
    
    if (response.data.hasPhotos) {
      console.log(`📸 Fotos: ${response.data.photos.length} imagen(es)`);
    }
    
    console.log('─'.repeat(80));
    
    return respuesta;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
    return null;
  }
}

async function testSuperSalesAI() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 TEST: SUPER SALES AI - IA Conversacional con Ventas');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // ESCENARIO 1: Conversación casual → Producto → Casual → Retorno a venta
  console.log('━━━ ESCENARIO 1: Conversación Natural con Retorno a Venta ━━━\n');
  
  await enviarMensaje('Hola! Cómo estás?');
  await sleep(3000);
  
  await enviarMensaje('Me interesa un curso de piano');
  await sleep(3000);
  
  await enviarMensaje('Qué tal el clima hoy?');
  await sleep(3000);
  
  await enviarMensaje('Cuéntame un chiste');
  await sleep(3000);
  
  // El bot debería retornar a la venta aquí
  
  console.log('\n━━━ ESCENARIO 2: Preguntas sobre el producto sin mencionar nombre ━━━\n');
  
  await enviarMensaje('cuánto cuesta?');
  await sleep(3000);
  
  await enviarMensaje('me gustaría saber más');
  await sleep(3000);
  
  console.log('\n━━━ ESCENARIO 3: Conversación libre sobre cualquier tema ━━━\n');
  
  await enviarMensaje('Qué opinas sobre la inteligencia artificial?');
  await sleep(3000);
  
  await enviarMensaje('Gracias por la info');
  await sleep(3000);
  
  console.log('\n━━━ ESCENARIO 4: Retorno a compra ━━━\n');
  
  await enviarMensaje('Bueno, quiero comprar el curso');
  await sleep(3000);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ TEST COMPLETADO');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\nRESULTADOS ESPERADOS:');
  console.log('✓ Bot responde a saludos naturalmente');
  console.log('✓ Bot muestra producto con fotos automáticamente');
  console.log('✓ Bot conversa sobre temas casuales libremente');
  console.log('✓ Bot retorna a la venta después de 2-3 mensajes casuales');
  console.log('✓ Bot mantiene contexto del producto durante toda la conversación');
  console.log('✓ Bot genera links de pago cuando el cliente quiere comprar');
}

testSuperSalesAI();
