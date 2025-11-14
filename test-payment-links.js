/**
 * 🧪 TEST DE LINKS DE PAGO
 * Verifica que los links de pago se generen correctamente
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Links configurados (igual que en la API)
const PAYMENT_LINKS = {
  piano: {
    info: 'https://landein-page-pian2.vercel.app/',
    payment: 'https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205',
    platform: 'Hotmart'
  },
  megapack_complete: {
    info: 'https://mpago.li/32cJgK3',
    payment: 'https://www.paypal.com/invoice/p/#INV2-U2K8-6UU6-HMTD-NETG',
    platform: 'PayPal'
  },
  megapack_individual: {
    mobile: '3136174267', // Nequi/Daviplata/Davivienda
    card: 'https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf',
    platform: 'Payco'
  }
};

async function testPaymentLinks() {
  console.log('🧪 INICIANDO TEST DE LINKS DE PAGO\n');

  try {
    // Obtener algunos productos de prueba
    const products = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📦 Productos encontrados: ${products.length}\n`);

    for (const product of products) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 Producto: ${product.name}`);
      console.log(`💰 Precio: ${product.price} ${product.currency}`);
      console.log(`🆔 ID: ${product.id}`);
      
      // Detectar tipo de producto (misma lógica que la API)
      const productName = product.name.toLowerCase();
      
      if (productName.includes('piano')) {
        console.log('\n🎹 TIPO: Curso de Piano');
        console.log(`📄 Link Info: ${PAYMENT_LINKS.piano.info}`);
        console.log(`💳 Link Pago: ${PAYMENT_LINKS.piano.payment}`);
        console.log(`🏢 Plataforma: ${PAYMENT_LINKS.piano.platform}`);
      } 
      else if ((productName.includes('mega pack completo') || 
                productName.includes('megapack completo') ||
                (productName.includes('40') && productName.includes('producto')))) {
        console.log('\n🎓 TIPO: Megapack Completo (40 productos)');
        console.log(`📄 Link Info: ${PAYMENT_LINKS.megapack_complete.info}`);
        console.log(`💳 Link Pago: ${PAYMENT_LINKS.megapack_complete.payment}`);
        console.log(`🏢 Plataforma: ${PAYMENT_LINKS.megapack_complete.platform}`);
      }
      else if (productName.includes('mega pack') || productName.includes('megapack')) {
        console.log('\n🎓 TIPO: Megapack Individual');
        console.log(`📱 Transferencia: ${PAYMENT_LINKS.megapack_individual.mobile}`);
        console.log(`💳 Link Tarjeta: ${PAYMENT_LINKS.megapack_individual.card}`);
        console.log(`🏢 Plataforma: ${PAYMENT_LINKS.megapack_individual.platform}`);
      }
      else {
        console.log('\n🛍️ TIPO: Producto General');
        
        // Verificar si tiene links manuales
        if (product.paymentLinkMercadoPago) {
          console.log(`💳 MercadoPago: ${product.paymentLinkMercadoPago}`);
        }
        if (product.paymentLinkPayPal) {
          console.log(`💙 PayPal: ${product.paymentLinkPayPal}`);
        }
        if (product.paymentLinkCustom) {
          console.log(`🔗 Custom: ${product.paymentLinkCustom}`);
        }
        
        if (!product.paymentLinkMercadoPago && !product.paymentLinkPayPal && !product.paymentLinkCustom) {
          console.log('⚠️ Sin links de pago configurados');
          console.log('📱 Fallback: WhatsApp +57 304 274 8687');
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('\n✅ TEST COMPLETADO\n');

    // Resumen de configuración
    console.log('📊 RESUMEN DE CONFIGURACIÓN:\n');
    console.log('🎹 Piano:');
    console.log(`   Info: ${PAYMENT_LINKS.piano.info}`);
    console.log(`   Pago: ${PAYMENT_LINKS.piano.payment}`);
    console.log('');
    console.log('🎓 Megapack Completo:');
    console.log(`   Info: ${PAYMENT_LINKS.megapack_complete.info}`);
    console.log(`   Pago: ${PAYMENT_LINKS.megapack_complete.payment}`);
    console.log('');
    console.log('🎓 Megapack Individual:');
    console.log(`   Móvil: ${PAYMENT_LINKS.megapack_individual.mobile}`);
    console.log(`   Tarjeta: ${PAYMENT_LINKS.megapack_individual.card}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error en test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar test
testPaymentLinks();
