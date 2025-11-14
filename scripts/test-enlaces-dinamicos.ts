import { BotPaymentLinkGenerator } from '../src/lib/bot-payment-link-generator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testEnlacesDinamicos() {
  console.log('🧪 PRUEBA: Generación de Enlaces Dinámicos\n');
  console.log('='.repeat(60));

  try {
    // 1. Buscar un producto digital
    const productoDigital = await prisma.product.findFirst({
      where: {
        category: 'DIGITAL',
        status: 'AVAILABLE'
      }
    });

    if (!productoDigital) {
      console.log('❌ No se encontró ningún producto digital');
      return;
    }

    console.log(`\n📦 Producto de prueba:`);
    console.log(`   Nombre: ${productoDigital.name}`);
    console.log(`   Precio: $${productoDigital.price.toLocaleString()} COP`);
    console.log(`   Categoría: ${productoDigital.category}`);

    // 2. Probar detección de solicitud de pago
    console.log(`\n\n🔍 Probando detección de solicitud de pago:\n`);
    
    const testMessages = [
      'Dame el link de pago',
      'Cómo puedo pagar?',
      'Quiero comprar',
      'Métodos de pago',
      'Envíame el enlace',
      'Hola' // No debería detectarse
    ];

    for (const msg of testMessages) {
      const isPaymentRequest = BotPaymentLinkGenerator.detectPaymentRequest(msg);
      console.log(`   "${msg}" → ${isPaymentRequest ? '✅ DETECTADO' : '❌ No detectado'}`);
    }

    // 3. Generar enlaces de pago
    console.log(`\n\n💳 Generando enlaces de pago dinámicos...\n`);
    
    const result = await BotPaymentLinkGenerator.generatePaymentLinks(
      productoDigital.id,
      productoDigital.userId,
      1
    );

    if (result.success) {
      console.log('✅ Enlaces generados exitosamente!\n');
      console.log('📋 Resultado:\n');
      
      if (result.mercadoPagoLink) {
        console.log(`💳 MercadoPago: ${result.mercadoPagoLink.substring(0, 50)}...`);
      } else {
        console.log(`⚠️  MercadoPago: No configurado`);
      }
      
      if (result.payPalLink) {
        console.log(`💙 PayPal: ${result.payPalLink.substring(0, 50)}...`);
      } else {
        console.log(`⚠️  PayPal: No configurado`);
      }
      
      if (result.whatsAppLink) {
        console.log(`📱 WhatsApp: ${result.whatsAppLink.substring(0, 50)}...`);
      }
      
      console.log(`\n📝 Mensaje para el cliente:\n`);
      console.log(result.message);
      
    } else {
      console.log(`❌ Error: ${result.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Prueba completada');
    
    // Verificar configuración
    console.log('\n📋 Configuración actual:');
    console.log(`   MERCADOPAGO_ACCESS_TOKEN: ${process.env.MERCADOPAGO_ACCESS_TOKEN ? '✅ Configurado' : '❌ No configurado'}`);
    console.log(`   PAYPAL_CLIENT_ID: ${process.env.PAYPAL_CLIENT_ID ? '✅ Configurado' : '❌ No configurado'}`);
    console.log(`   PAYPAL_CLIENT_SECRET: ${process.env.PAYPAL_CLIENT_SECRET ? '✅ Configurado' : '❌ No configurado'}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testEnlacesDinamicos();
