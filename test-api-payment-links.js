/**
 * 🧪 TEST DE API DE LINKS DE PAGO
 * Prueba la generación dinámica de links llamando a la API
 */

async function testPaymentAPI() {
  console.log('🧪 INICIANDO TEST DE API DE PAGOS\n');

  // IDs de productos de prueba
  const testProducts = [
    { id: 'cmhmc56x30011km7oyi1plibc', name: 'Repuestos Moto NS-160' },
    { id: 'cmhmc56n0000zkm7ovtv73iy4', name: 'Moto NS-160 Usada' },
    { id: 'cmhmc562o000vkm7odgqajuz7', name: 'Mega Pack Completo' },
    { id: 'cmhmc55si000tkm7ox9ylj2g7', name: 'Mega Pack Individual' }
  ];

  for (const product of testProducts) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 Probando: ${product.name}`);
    console.log(`🆔 ID: ${product.id}`);

    try {
      const url = `http://localhost:3000/api/payment/generate-link?productId=${product.id}`;
      console.log(`📡 Llamando: ${url}`);

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        console.log('\n✅ RESPUESTA EXITOSA:');
        console.log(`   Producto: ${data.product.name}`);
        console.log(`   Precio: ${data.product.price}`);
        console.log('\n💳 LINKS GENERADOS:');
        console.log(`   MercadoPago: ${data.paymentLinks.mercadopago}`);
        console.log(`   PayPal: ${data.paymentLinks.paypal}`);
        if (data.paymentLinks.hotmart) {
          console.log(`   Hotmart: ${data.paymentLinks.hotmart}`);
        }

        // Verificar que no sean links de WhatsApp
        const isMercadopagoWhatsApp = data.paymentLinks.mercadopago.includes('wa.me');
        const isPaypalWhatsApp = data.paymentLinks.paypal.includes('wa.me');

        if (isMercadopagoWhatsApp || isPaypalWhatsApp) {
          console.log('\n⚠️ ADVERTENCIA: Algunos links son de WhatsApp (fallback)');
        } else {
          console.log('\n✅ Links de pago correctos (no son WhatsApp)');
        }
      } else {
        console.log('\n❌ ERROR EN RESPUESTA:');
        console.log(`   ${data.error}`);
      }

    } catch (error) {
      console.log('\n❌ ERROR EN LLAMADA:');
      console.log(`   ${error.message}`);
      console.log('\n💡 NOTA: Asegúrate de que el servidor Next.js esté corriendo:');
      console.log('   npm run dev');
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('\n✅ TEST COMPLETADO\n');
}

// Ejecutar test
testPaymentAPI();
