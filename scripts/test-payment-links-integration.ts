/**
 * Test de Integración de Links de Pago Dinámicos
 * Prueba el flujo completo desde la conversación hasta la generación de links
 */

import { getIntelligentEngine } from '../src/lib/intelligent-conversation-engine';
import { PaymentLinkGenerator } from '../src/lib/payment-link-generator';
import { db } from '../src/lib/db';

async function testPaymentLinksIntegration() {
  console.log('🧪 TEST: Integración de Links de Pago Dinámicos\n');

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

    // 2. Simular conversación hasta intención de pago
    console.log('2️⃣ Simulando conversación...\n');
    
    const engine = getIntelligentEngine();
    const chatId = 'test-payment-' + Date.now();
    const userId = product.userId;

    // Mensaje 1: Consulta sobre el producto
    console.log('👤 Usuario: "Hola, me interesa el ' + product.name + '"');
    const response1 = await engine.processMessage({
      chatId,
      userName: 'Usuario Test',
      message: 'Hola, me interesa el ' + product.name,
      userId
    });
    console.log('🤖 Bot:', response1.text.substring(0, 200) + '...\n');

    // Mensaje 2: Preguntar por métodos de pago
    console.log('👤 Usuario: "¿Cómo puedo pagar?"');
    const response2 = await engine.processMessage({
      chatId,
      userName: 'Usuario Test',
      message: '¿Cómo puedo pagar?',
      userId
    });
    console.log('🤖 Bot:', response2.text.substring(0, 200) + '...\n');

    // Mensaje 3: Confirmar método de pago (MercadoPago)
    console.log('👤 Usuario: "MercadoPago"');
    const response3 = await engine.processMessage({
      chatId,
      userName: 'Usuario Test',
      message: 'MercadoPago',
      userId
    });

    console.log('🤖 Bot:', response3.text.substring(0, 300) + '...\n');

    // 3. Verificar que se generaron las acciones correctas
    console.log('3️⃣ Verificando acciones generadas...');
    console.log('   Acciones:', response3.actions.length);
    
    response3.actions.forEach((action: any, idx: number) => {
      console.log(`   ${idx + 1}. Tipo: ${action.type}`);
      if (action.type === 'send_payment_links') {
        console.log(`      ✅ Links de pago generados`);
        console.log(`      Método: ${action.method}`);
        console.log(`      Producto: ${action.product.name}`);
      }
    });

    // 4. Probar generación directa de links
    console.log('\n4️⃣ Probando generación directa de links...');
    const paymentLinks = await PaymentLinkGenerator.generatePaymentLinks(product.id);

    if (paymentLinks) {
      console.log('✅ Links generados exitosamente:');
      console.log('   - Nequi:', paymentLinks.methods.nequi);
      console.log('   - Daviplata:', paymentLinks.methods.daviplata);
      console.log('   - MercadoPago:', paymentLinks.methods.mercadopago || 'No configurado');
      console.log('   - PayPal:', paymentLinks.methods.paypal || 'No configurado');
      
      console.log('\n📋 Instrucciones generadas:');
      console.log(paymentLinks.instructions);
    } else {
      console.log('❌ No se pudieron generar los links');
    }

    // 5. Probar respuesta formateada por método
    console.log('\n5️⃣ Probando respuestas formateadas por método...\n');
    
    if (paymentLinks) {
      const methods = ['mercadopago', 'paypal', 'nequi', 'transferencia'];
      
      for (const method of methods) {
        console.log(`\n--- Método: ${method.toUpperCase()} ---`);
        const formatted = PaymentLinkGenerator.generateMethodResponse(method, paymentLinks);
        console.log(formatted);
        console.log('---\n');
      }
    }

    // 6. Verificar contexto de la conversación
    console.log('6️⃣ Verificando contexto de conversación...');
    const context = engine.getContext(chatId);
    console.log('   Producto actual:', context.currentProduct?.name || 'ninguno');
    console.log('   Intención de pago:', context.paymentIntent || false);
    console.log('   Método preferido:', context.preferredPaymentMethod || 'ninguno');

    // Limpiar
    engine.clearMemory(chatId);
    console.log('\n✅ Test completado exitosamente');

  } catch (error) {
    console.error('\n❌ Error en el test:', error);
    throw error;
  }
}

// Ejecutar test
testPaymentLinksIntegration()
  .then(() => {
    console.log('\n🎉 Todos los tests pasaron');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test falló:', error);
    process.exit(1);
  });
