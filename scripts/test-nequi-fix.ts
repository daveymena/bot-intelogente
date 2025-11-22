/**
 * Test para verificar que el número de Nequi se envía correctamente
 */

import { Orchestrator } from '../src/agents/orchestrator';

async function testNequiPayment() {
  console.log('🧪 Iniciando test de pago con Nequi...\n');

  try {
    const orchestrator = new Orchestrator();

    const chatId = 'test-nequi-' + Date.now();
    const userId = 'user-test-123';

    // Paso 1: Buscar un producto
    console.log('1️⃣ Buscando producto...');
    let response = await orchestrator.processMessage({
      chatId,
      userId,
      message: 'Quiero el curso de piano',
      userName: 'Test User'
    });
    console.log('Respuesta:', response.text.substring(0, 200));
    console.log('Producto en contexto:', response.context?.currentProduct?.name || 'ninguno');
    console.log('');

    // Paso 2: Preguntar por métodos de pago
    console.log('2️⃣ Preguntando por métodos de pago...');
    response = await orchestrator.processMessage({
      chatId,
      userId,
      message: 'Cómo puedo pagar?',
      userName: 'Test User'
    });
    console.log('Respuesta:', response.text.substring(0, 300));
    console.log('Acciones:', response.actions?.length || 0);
    console.log('');

    // Paso 3: Seleccionar Nequi
    console.log('3️⃣ Seleccionando Nequi...');
    response = await orchestrator.processMessage({
      chatId,
      userId,
      message: 'nequi',
      userName: 'Test User'
    });
    
    console.log('\n📝 RESPUESTA FINAL:');
    console.log('Texto:', response.text);
    console.log('\n🔍 VERIFICACIÓN:');
    console.log('Contiene número 3136174267:', response.text.includes('3136174267'));
    console.log('Acciones:', response.actions?.length || 0);
    
    if (response.actions && response.actions.length > 0) {
      console.log('\n⚡ ACCIONES:');
      response.actions.forEach((action, i) => {
        console.log(`${i + 1}. Tipo: ${action.type}`);
        if (action.formattedText) {
          console.log(`   Texto formateado (primeros 200 chars): ${action.formattedText.substring(0, 200)}`);
          console.log(`   Contiene número: ${action.formattedText.includes('3136174267')}`);
        }
      });
    }

    console.log('\n✅ Test completado');

  } catch (error) {
    console.error('❌ Error en test:', error);
  }
}

testNequiPayment();
