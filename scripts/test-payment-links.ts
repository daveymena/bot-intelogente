/**
 * Test de Generación de Links de Pago
 * Verifica que MercadoPago y PayPal generen links correctamente
 */

import { PaymentLinkGenerator } from '../src/lib/payment-link-generator';
import { db } from '../src/lib/db';

async function testPaymentLinks() {
  console.log('🧪 TEST: Generación de Links de Pago\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Buscar un producto de prueba
    console.log('\n📦 Buscando producto de prueba...');
    const product = await db.product.findFirst({
      where: {
        status: 'AVAILABLE'
      }
    });
    
    if (!product) {
      console.log('❌ No hay productos disponibles para probar');
      return;
    }
    
    console.log(`✅ Producto encontrado: ${product.name}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Precio: ${product.price.toLocaleString('es-CO')} COP`);
    
    // 2. Generar links de pago
    console.log('\n💳 Generando links de pago...');
    const paymentLinks = await PaymentLinkGenerator.generatePaymentLinks(product.id);
    
    if (!paymentLinks) {
      console.log('❌ Error generando links de pago');
      return;
    }
    
    console.log('\n✅ Links generados exitosamente:');
    console.log('='.repeat(60));
    
    // 3. Verificar cada método
    console.log('\n📱 NEQUI/DAVIPLATA:');
    console.log(`   Número: ${paymentLinks.methods.nequi}`);
    console.log(`   Estado: ${paymentLinks.methods.nequi ? '✅ Configurado' : '❌ No configurado'}`);
    
    console.log('\n💳 MERCADOPAGO:');
    if (paymentLinks.methods.mercadopago) {
      console.log(`   Link: ${paymentLinks.methods.mercadopago}`);
      console.log(`   Estado: ✅ Generado correctamente`);
      console.log(`   Válido: ${paymentLinks.methods.mercadopago.startsWith('https://') ? '✅ Sí' : '❌ No'}`);
    } else {
      console.log(`   Estado: ❌ No generado`);
      console.log(`   Razón: Verifica MERCADO_PAGO_ACCESS_TOKEN en .env`);
    }
    
    console.log('\n🌎 PAYPAL:');
    if (paymentLinks.methods.paypal) {
      console.log(`   Link: ${paymentLinks.methods.paypal}`);
      console.log(`   Estado: ✅ Generado correctamente`);
      console.log(`   Válido: ${paymentLinks.methods.paypal.startsWith('https://') ? '✅ Sí' : '❌ No'}`);
    } else {
      console.log(`   Estado: ❌ No generado`);
      console.log(`   Razón: Verifica PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET en .env`);
    }
    
    console.log('\n🏦 TRANSFERENCIA:');
    console.log(`   Banco: ${paymentLinks.methods.transferencia?.banco}`);
    console.log(`   Cuenta: ${paymentLinks.methods.transferencia?.cuenta}`);
    console.log(`   Titular: ${paymentLinks.methods.transferencia?.titular}`);
    console.log(`   Estado: ${paymentLinks.methods.transferencia ? '✅ Configurado' : '❌ No configurado'}`);
    
    // 4. Mostrar mensaje formateado
    console.log('\n📝 MENSAJE FORMATEADO PARA WHATSAPP:');
    console.log('='.repeat(60));
    const message = PaymentLinkGenerator.formatForWhatsApp(paymentLinks);
    console.log(message);
    console.log('='.repeat(60));
    
    // 5. Verificar que los links estén en el mensaje
    console.log('\n🔍 VERIFICACIÓN DE LINKS EN MENSAJE:');
    if (paymentLinks.methods.mercadopago) {
      const mercadopagoInMessage = message.includes(paymentLinks.methods.mercadopago);
      console.log(`   MercadoPago en mensaje: ${mercadopagoInMessage ? '✅ Sí' : '❌ No'}`);
    }
    if (paymentLinks.methods.paypal) {
      const paypalInMessage = message.includes(paymentLinks.methods.paypal);
      console.log(`   PayPal en mensaje: ${paypalInMessage ? '✅ Sí' : '❌ No'}`);
    }
    
    // 6. Test de respuesta por método
    console.log('\n💬 TEST DE RESPUESTAS POR MÉTODO:');
    console.log('='.repeat(60));
    
    console.log('\n1️⃣ Respuesta para NEQUI:');
    const nequiResponse = PaymentLinkGenerator.generateMethodResponse('nequi', paymentLinks);
    console.log(nequiResponse.substring(0, 200) + '...');
    
    if (paymentLinks.methods.mercadopago) {
      console.log('\n2️⃣ Respuesta para MERCADOPAGO:');
      const mercadopagoResponse = PaymentLinkGenerator.generateMethodResponse('mercadopago', paymentLinks);
      console.log(mercadopagoResponse.substring(0, 200) + '...');
      console.log(`   Link incluido: ${mercadopagoResponse.includes(paymentLinks.methods.mercadopago) ? '✅ Sí' : '❌ No'}`);
    }
    
    if (paymentLinks.methods.paypal) {
      console.log('\n3️⃣ Respuesta para PAYPAL:');
      const paypalResponse = PaymentLinkGenerator.generateMethodResponse('paypal', paymentLinks);
      console.log(paypalResponse.substring(0, 200) + '...');
      console.log(`   Link incluido: ${paypalResponse.includes(paymentLinks.methods.paypal) ? '✅ Sí' : '❌ No'}`);
    }
    
    // 7. Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN:');
    console.log('='.repeat(60));
    
    const methodsCount = [
      paymentLinks.methods.nequi ? 1 : 0,
      paymentLinks.methods.mercadopago ? 1 : 0,
      paymentLinks.methods.paypal ? 1 : 0,
      paymentLinks.methods.transferencia ? 1 : 0
    ].reduce((a, b) => a + b, 0);
    
    console.log(`✅ Métodos configurados: ${methodsCount}/4`);
    console.log(`   - Nequi/Daviplata: ${paymentLinks.methods.nequi ? '✅' : '❌'}`);
    console.log(`   - MercadoPago: ${paymentLinks.methods.mercadopago ? '✅' : '❌'}`);
    console.log(`   - PayPal: ${paymentLinks.methods.paypal ? '✅' : '❌'}`);
    console.log(`   - Transferencia: ${paymentLinks.methods.transferencia ? '✅' : '❌'}`);
    
    if (methodsCount < 4) {
      console.log('\n⚠️ CONFIGURACIÓN PENDIENTE:');
      if (!paymentLinks.methods.mercadopago) {
        console.log('   - Agregar MERCADO_PAGO_ACCESS_TOKEN en .env');
      }
      if (!paymentLinks.methods.paypal) {
        console.log('   - Agregar PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET en .env');
        console.log('   - O agregar PAYPAL_EMAIL o PAYPAL_ME_USERNAME para fallback');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error en test:', error);
  }
}

// Ejecutar test
testPaymentLinks()
  .then(() => {
    console.log('\n✅ Test completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
