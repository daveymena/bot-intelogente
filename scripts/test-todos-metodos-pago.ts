/**
 * Test: Mostrar TODOS los Métodos de Pago
 * Prueba que el bot muestre todos los métodos disponibles cuando se le pida
 */

import { getIntelligentEngine } from '../src/lib/intelligent-conversation-engine';
import { db } from '../src/lib/db';

async function testTodosMetodosPago() {
  console.log('🧪 TEST: Mostrar TODOS los Métodos de Pago\n');

  try {
    // 1. Obtener un producto de prueba
    console.log('1️⃣ Buscando producto de prueba...');
    const product = await db.product.findFirst({
      where: { status: 'AVAILABLE' }
    });

    if (!product) {
      console.log('❌ No hay productos disponibles para probar');
      return;
    }

    console.log(`✅ Producto encontrado: ${product.name}`);
    console.log(`   Precio: ${product.price.toLocaleString('es-CO')} COP\n`);

    // 2. Simular conversación
    const engine = getIntelligentEngine();
    const chatId = 'test-metodos-' + Date.now();
    const userId = product.userId;

    // Mensaje 1: Consulta sobre el producto
    console.log('👤 Usuario: "Hola, me interesa el ' + product.name + '"');
    const response1 = await engine.processMessage({
      chatId,
      userName: 'Usuario Test',
      message: 'Hola, me interesa el ' + product.name,
      userId
    });
    console.log('🤖 Bot:', response1.text.substring(0, 150) + '...\n');

    // Probar diferentes formas de pedir métodos de pago
    const preguntasPago = [
      '¿Cómo puedo pagar?',
      '¿Qué métodos de pago tienen?',
      'Métodos de pago',
      'Formas de pago',
      'Quiero pagar',
      '¿Cómo pago?',
      '¿Puedo pagar con tarjeta?',
      'Proceder con el pago'
    ];

    console.log('2️⃣ Probando diferentes formas de pedir métodos de pago:\n');

    for (const pregunta of preguntasPago) {
      console.log(`\n--- Prueba: "${pregunta}" ---`);
      
      const response = await engine.processMessage({
        chatId: chatId + '-' + pregunta,
        userName: 'Usuario Test',
        message: pregunta,
        userId
      });

      // Verificar que se generaron acciones
      console.log('   Acciones generadas:', response.actions.length);
      
      if (response.actions.length > 0) {
        const action = response.actions[0];
        console.log('   Tipo de acción:', action.type);
        
        if (action.type === 'send_all_payment_methods') {
          console.log('   ✅ Se detectó correctamente la solicitud de métodos');
          console.log('   📊 Métodos incluidos:');
          
          if (action.paymentLinks) {
            console.log('      - Nequi:', action.paymentLinks.methods.nequi ? '✅' : '❌');
            console.log('      - Daviplata:', action.paymentLinks.methods.daviplata ? '✅' : '❌');
            console.log('      - MercadoPago:', action.paymentLinks.methods.mercadopago ? '✅' : '❌');
            console.log('      - PayPal:', action.paymentLinks.methods.paypal ? '✅' : '❌');
            console.log('      - Transferencia:', action.paymentLinks.methods.transferencia ? '✅' : '❌');
          }
          
          // Mostrar preview del texto formateado
          console.log('\n   📝 Preview de la respuesta:');
          console.log('   ' + action.formattedText.substring(0, 300) + '...\n');
        } else {
          console.log('   ⚠️ Tipo de acción inesperado:', action.type);
        }
      } else {
        console.log('   ❌ No se generaron acciones');
      }
    }

    // 3. Mostrar respuesta completa de un ejemplo
    console.log('\n3️⃣ Respuesta completa para "¿Cómo puedo pagar?":\n');
    
    const finalResponse = await engine.processMessage({
      chatId: 'test-final-' + Date.now(),
      userName: 'Usuario Test',
      message: '¿Cómo puedo pagar?',
      userId
    });

    if (finalResponse.actions.length > 0 && finalResponse.actions[0].formattedText) {
      console.log(finalResponse.actions[0].formattedText);
    }

    // Limpiar
    console.log('\n✅ Test completado exitosamente');

  } catch (error) {
    console.error('\n❌ Error en el test:', error);
    throw error;
  }
}

// Ejecutar test
testTodosMetodosPago()
  .then(() => {
    console.log('\n🎉 Todos los tests pasaron');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test falló:', error);
    process.exit(1);
  });
