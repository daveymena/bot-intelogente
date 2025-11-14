/**
 * Test Rápido de Generación de Links de Pago
 */

import { PaymentLinkGenerator } from '../src/lib/payment-link-generator';
import { db } from '../src/lib/db';

async function testRapido() {
  console.log('🧪 TEST RÁPIDO: Generación de Links de Pago\n');

  try {
    // Obtener primer producto disponible
    const product = await db.product.findFirst({
      where: { status: 'AVAILABLE' }
    });

    if (!product) {
      console.log('❌ No hay productos disponibles');
      return;
    }

    console.log(`📦 Producto: ${product.name}`);
    console.log(`💰 Precio: ${product.price.toLocaleString('es-CO')} COP\n`);

    // Generar links
    console.log('⏳ Generando links...\n');
    const paymentLinks = await PaymentLinkGenerator.generatePaymentLinks(product.id);

    if (!paymentLinks) {
      console.log('❌ Error generando links');
      return;
    }

    console.log('✅ LINKS GENERADOS:\n');
    console.log('📱 Nequi:', paymentLinks.methods.nequi);
    console.log('💳 Daviplata:', paymentLinks.methods.daviplata);
    console.log('🟦 MercadoPago:', paymentLinks.methods.mercadopago || '⚠️ No configurado');
    console.log('🟨 PayPal:', paymentLinks.methods.paypal || '⚠️ No configurado');
    console.log('🏦 Transferencia:', paymentLinks.methods.transferencia?.banco);

    console.log('\n📋 INSTRUCCIONES COMPLETAS:\n');
    console.log(paymentLinks.instructions);

    console.log('\n✅ Test completado');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testRapido()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
