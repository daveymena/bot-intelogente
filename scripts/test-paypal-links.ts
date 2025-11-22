/**
 * 🧪 TEST DE LINKS DE PAYPAL
 * Verifica que los links de PayPal se generen correctamente con el monto
 */

import { PaymentLinkGenerator } from '../src/lib/payment-link-generator';
import { db } from '../src/lib/db';

console.log('🧪 INICIANDO TEST DE LINKS DE PAYPAL\n');
console.log('='.repeat(60));

async function testPayPalLinks() {
  try {
    // 1. Obtener algunos productos de prueba
    console.log('\n📦 Obteniendo productos de prueba...\n');
    
    const products = await db.product.findMany({
      take: 3,
      where: {
        status: 'AVAILABLE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (products.length === 0) {
      console.log('⚠️ No hay productos disponibles para probar');
      return;
    }

    console.log(`✅ Encontrados ${products.length} productos\n`);

    // 2. Probar generación de links para cada producto
    for (const product of products) {
      console.log('─'.repeat(60));
      console.log(`\n📦 Producto: ${product.name}`);
      console.log(`💰 Precio: ${product.price.toLocaleString('es-CO')} COP`);
      console.log(`🆔 ID: ${product.id}\n`);

      // Generar links de pago
      console.log('🔗 Generando links de pago...\n');
      
      const paymentLinks = await PaymentLinkGenerator.generatePaymentLinks(product.id);

      if (!paymentLinks) {
        console.log('❌ Error generando links de pago\n');
        continue;
      }

      // Verificar link de PayPal
      if (paymentLinks.methods.paypal) {
        console.log('✅ Link de PayPal generado:');
        console.log(`   ${paymentLinks.methods.paypal}\n`);

        // Verificar que el link contiene el monto
        const hasAmount = paymentLinks.methods.paypal.includes('USD');
        if (hasAmount) {
          console.log('✅ El link incluye el monto en USD');
          
          // Extraer el monto del link
          const match = paymentLinks.methods.paypal.match(/\/(\d+\.?\d*)USD/);
          if (match) {
            const amountUSD = match[1];
            console.log(`   Monto: $${amountUSD} USD`);
            
            // Calcular equivalente en COP
            const rate = parseFloat(process.env.COP_TO_USD_RATE || '4000');
            const expectedCOP = parseFloat(amountUSD) * rate;
            console.log(`   Equivalente: ${expectedCOP.toLocaleString('es-CO')} COP (aprox.)`);
            
            // Verificar que el monto es correcto
            const difference = Math.abs(expectedCOP - product.price);
            const percentDiff = (difference / product.price) * 100;
            
            if (percentDiff < 5) {
              console.log(`   ✅ Monto correcto (diferencia: ${percentDiff.toFixed(2)}%)`);
            } else {
              console.log(`   ⚠️ Monto con diferencia significativa (${percentDiff.toFixed(2)}%)`);
            }
          }
        } else {
          console.log('⚠️ El link NO incluye el monto (el usuario deberá ingresarlo manualmente)');
        }
      } else {
        console.log('❌ No se generó link de PayPal');
        console.log('   Verifica que PAYPAL_ME_USERNAME esté configurado en .env');
      }

      // Verificar link de MercadoPago
      if (paymentLinks.methods.mercadopago) {
        console.log('\n✅ Link de MercadoPago generado:');
        console.log(`   ${paymentLinks.methods.mercadopago}`);
      } else {
        console.log('\n⚠️ No se generó link de MercadoPago');
        console.log('   Verifica que MERCADO_PAGO_ACCESS_TOKEN esté configurado en .env');
      }

      console.log('\n');
    }

    console.log('='.repeat(60));
    console.log('\n✅ TEST COMPLETADO\n');

    // 3. Mostrar configuración actual
    console.log('📋 CONFIGURACIÓN ACTUAL:\n');
    console.log(`   PAYPAL_ME_USERNAME: ${process.env.PAYPAL_ME_USERNAME || process.env.PAYPAL_USERNAME || 'tecnovariedades'}`);
    console.log(`   COP_TO_USD_RATE: ${process.env.COP_TO_USD_RATE || '4000'}`);
    console.log(`   NEQUI_NUMBER: ${process.env.NEQUI_NUMBER || '3136174267'}`);
    console.log(`   DAVIPLATA_NUMBER: ${process.env.DAVIPLATA_NUMBER || '3136174267'}`);
    console.log(`   MERCADO_PAGO configurado: ${process.env.MERCADO_PAGO_ACCESS_TOKEN ? 'Sí' : 'No'}`);

    console.log('\n📝 NOTAS:');
    console.log('   - Los links de PayPal.me muestran el monto automáticamente');
    console.log('   - El usuario verá el monto en USD al abrir el link');
    console.log('   - La tasa de cambio se puede ajustar en .env (COP_TO_USD_RATE)');
    console.log('   - Para actualizar tu username de PayPal, edita PAYPAL_ME_USERNAME en .env');

  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:', error);
  } finally {
    await db.$disconnect();
  }
}

// Ejecutar test
testPayPalLinks();
