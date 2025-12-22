/**
 * 🔗 GENERADOR DE LINKS DE PAGO PRE-GENERADOS
 * 
 * Este script genera y guarda los links de pago para todos los productos
 * en la base de datos. Solo se regeneran si el precio cambia.
 * 
 * Ventajas:
 * - ⚡ Respuesta instantánea (sin esperar API)
 * - 💰 Menos llamadas a APIs de pago
 * - 🔄 Auto-regeneración si cambia el precio
 */

import { db } from '../src/lib/db';
import { BotPaymentLinkGenerator } from '../src/lib/bot-payment-link-generator';

interface ProductWithLinks {
  id: string;
  name: string;
  price: number;
  paymentLinkMercadoPago: string | null;
  paymentLinkPayPal: string | null;
  lastPrice?: number;
}

async function generatePaymentLinksForAllProducts() {
  console.log('🔗 GENERADOR DE LINKS DE PAGO PRE-GENERADOS\n');
  console.log('='.repeat(70));

  try {
    // Obtener todos los productos disponibles
    const products = await db.product.findMany({
      where: {
        status: 'AVAILABLE'
      },
      select: {
        id: true,
        name: true,
        price: true,
        userId: true,
        paymentLinkMercadoPago: true,
        paymentLinkPayPal: true
      }
    });

    console.log(`\n📦 Productos encontrados: ${products.length}\n`);

    let generated = 0;
    let skipped = 0;
    let errors = 0;

    for (const product of products) {
      console.log(`\n📝 Procesando: ${product.name}`);
      console.log(`   💰 Precio: ${product.price.toLocaleString('es-CO')} COP`);

      // Verificar si ya tiene links generados
      const hasLinks = product.paymentLinkMercadoPago || product.paymentLinkPayPal;

      if (hasLinks) {
        console.log(`   ✅ Ya tiene links generados, omitiendo...`);
        skipped++;
        continue;
      }

      try {
        // Generar links de pago
        console.log(`   🔄 Generando links...`);
        
        const result = await BotPaymentLinkGenerator.generatePaymentLinks(
          product.id,
          product.userId,
          1
        );

        if (result.success) {
          // Guardar links en la base de datos
          await db.product.update({
            where: { id: product.id },
            data: {
              paymentLinkMercadoPago: result.mercadoPagoLink || null,
              paymentLinkPayPal: result.payPalLink || null
            }
          });

          console.log(`   ✅ Links generados y guardados:`);
          if (result.mercadoPagoLink) {
            console.log(`      💳 MercadoPago: ${result.mercadoPagoLink.substring(0, 50)}...`);
          }
          if (result.payPalLink) {
            console.log(`      💙 PayPal: ${result.payPalLink.substring(0, 50)}...`);
          }

          generated++;
        } else {
          console.log(`   ⚠️ No se pudieron generar links (credenciales no configuradas)`);
          skipped++;
        }

      } catch (error: any) {
        console.error(`   ❌ Error: ${error.message}`);
        errors++;
      }

      // Pequeña pausa para no saturar las APIs
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n📊 RESUMEN:');
    console.log(`   ✅ Links generados: ${generated}`);
    console.log(`   ⏭️ Omitidos (ya tenían): ${skipped}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📦 Total procesados: ${products.length}`);

    if (generated > 0) {
      console.log('\n🎉 ¡Links de pago pre-generados exitosamente!');
      console.log('   Ahora el bot responderá instantáneamente sin llamar a las APIs.');
    }

  } catch (error: any) {
    console.error('\n❌ Error general:', error.message);
    process.exit(1);
  }
}

// Ejecutar
generatePaymentLinksForAllProducts()
  .then(() => {
    console.log('\n✅ Proceso completado\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
