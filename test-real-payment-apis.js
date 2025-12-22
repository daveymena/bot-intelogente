/**
 * 🧪 TEST DE APIS REALES DE PAGO
 * Prueba la generación de links dinámicos con las APIs reales de MercadoPago y PayPal
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRealPaymentAPIs() {
  console.log('🧪 INICIANDO TEST DE APIS REALES DE PAGO\n');
  console.log('⚠️  IMPORTANTE: El servidor Next.js debe estar corriendo\n');

  try {
    // Obtener un producto de prueba
    const product = await prisma.product.findFirst({
      where: {
        status: 'AVAILABLE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!product) {
      console.log('❌ No se encontraron productos en la base de datos');
      return;
    }

    console.log('📦 PRODUCTO DE PRUEBA:');
    console.log(`   Nombre: ${product.name}`);
    console.log(`   Precio: ${product.price} ${product.currency}`);
    console.log(`   ID: ${product.id}`);
    console.log('');

    // Probar API de generación de links
    console.log('🔄 Llamando a la API de generación de links...\n');

    const url = `http://localhost:3000/api/payment/generate-link?productId=${product.id}`;
    console.log(`📡 URL: ${url}\n`);

    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      console.log('✅ RESPUESTA EXITOSA:\n');
      console.log(`📦 Producto: ${data.product.name}`);
      console.log(`💰 Precio: ${data.product.price}\n`);

      console.log('💳 LINKS GENERADOS:\n');
      
      // MercadoPago
      console.log('🟦 MERCADOPAGO:');
      console.log(`   ${data.paymentLinks.mercadopago}`);
      if (data.paymentLinks.mercadopago.includes('mercadopago.com')) {
        console.log('   ✅ Link real de MercadoPago API');
      } else if (data.paymentLinks.mercadopago.includes('wa.me')) {
        console.log('   ⚠️  Fallback a WhatsApp (API no disponible)');
      } else {
        console.log('   ⚠️  Link estático o configurado');
      }
      console.log('');

      // PayPal
      console.log('🟦 PAYPAL:');
      console.log(`   ${data.paymentLinks.paypal}`);
      if (data.paymentLinks.paypal.includes('paypal.com/checkoutnow')) {
        console.log('   ✅ Link real de PayPal API');
      } else if (data.paymentLinks.paypal.includes('wa.me')) {
        console.log('   ⚠️  Fallback a WhatsApp (API no disponible)');
      } else {
        console.log('   ⚠️  Link estático o configurado');
      }
      console.log('');

      // Hotmart (si aplica)
      if (data.paymentLinks.hotmart) {
        console.log('🟧 HOTMART:');
        console.log(`   ${data.paymentLinks.hotmart}`);
        console.log('   ✅ Link configurado para curso de piano');
        console.log('');
      }

      console.log('═'.repeat(60));
      console.log('\n🎉 TEST COMPLETADO EXITOSAMENTE\n');

      // Instrucciones
      console.log('📋 PRÓXIMOS PASOS:\n');
      console.log('1. Copia uno de los links generados');
      console.log('2. Ábrelo en tu navegador');
      console.log('3. Verifica que te lleve a la página de pago correcta');
      console.log('4. Si funciona para este producto, funcionará para todos\n');

    } else {
      console.log('❌ ERROR EN RESPUESTA:');
      console.log(`   ${data.error}\n`);
    }

  } catch (error) {
    console.log('❌ ERROR EN TEST:');
    console.log(`   ${error.message}\n`);
    
    if (error.message.includes('fetch')) {
      console.log('💡 SOLUCIÓN:');
      console.log('   Asegúrate de que el servidor Next.js esté corriendo:');
      console.log('   npm run dev\n');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar test
testRealPaymentAPIs();
