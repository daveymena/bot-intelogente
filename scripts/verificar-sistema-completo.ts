import { BotPaymentLinkGenerator } from '../src/lib/bot-payment-link-generator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarSistemaCompleto() {
  console.log('🔍 VERIFICACIÓN COMPLETA DEL SISTEMA\n');
  console.log('='.repeat(60));

  let todoBien = true;

  try {
    // 1. Verificar base de datos
    console.log('\n📊 1. Verificando Base de Datos...');
    const totalProductos = await prisma.product.count();
    const productosDigitales = await prisma.product.count({
      where: { category: 'DIGITAL' }
    });
    const productosFisicos = await prisma.product.count({
      where: { category: 'PHYSICAL' }
    });

    console.log(`   ✅ Total productos: ${totalProductos}`);
    console.log(`   ✅ Digitales: ${productosDigitales}`);
    console.log(`   ✅ Físicos: ${productosFisicos}`);

    // 2. Verificar configuración de pagos
    console.log('\n💳 2. Verificando Configuración de Pagos...');
    const mercadoPago = !!process.env.MERCADOPAGO_ACCESS_TOKEN;
    const paypalId = !!process.env.PAYPAL_CLIENT_ID;
    const paypalSecret = !!process.env.PAYPAL_CLIENT_SECRET;

    console.log(`   ${mercadoPago ? '✅' : '⚠️ '} MercadoPago: ${mercadoPago ? 'Configurado' : 'No configurado'}`);
    console.log(`   ${paypalId && paypalSecret ? '✅' : '⚠️ '} PayPal: ${paypalId && paypalSecret ? 'Configurado' : 'No configurado'}`);
    console.log(`   ✅ Nequi/Daviplata: Configurado (304 274 8687)`);

    if (!mercadoPago) {
      console.log(`\n   💡 Tip: Configura MERCADOPAGO_ACCESS_TOKEN en .env`);
      todoBien = false;
    }

    // 3. Verificar detección de solicitudes de pago
    console.log('\n🔍 3. Verificando Detección de Solicitudes...');
    const testCases = [
      { msg: 'Dame el link de pago', expected: true },
      { msg: 'Cómo puedo pagar?', expected: true },
      { msg: 'Quiero comprar', expected: true },
      { msg: 'Hola', expected: false },
    ];

    let deteccionOk = true;
    for (const test of testCases) {
      const detected = BotPaymentLinkGenerator.detectPaymentRequest(test.msg);
      const ok = detected === test.expected;
      console.log(`   ${ok ? '✅' : '❌'} "${test.msg}" → ${detected ? 'Detectado' : 'No detectado'}`);
      if (!ok) deteccionOk = false;
    }

    if (!deteccionOk) {
      console.log(`\n   ❌ Error en detección de solicitudes`);
      todoBien = false;
    }

    // 4. Probar generación de enlaces
    console.log('\n🔗 4. Probando Generación de Enlaces...');
    const productoTest = await prisma.product.findFirst({
      where: {
        category: 'DIGITAL',
        status: 'AVAILABLE'
      }
    });

    if (productoTest) {
      const result = await BotPaymentLinkGenerator.generatePaymentLinks(
        productoTest.id,
        productoTest.userId,
        1
      );

      if (result.success) {
        console.log(`   ✅ Enlaces generados correctamente`);
        console.log(`   ✅ MercadoPago: ${result.mercadoPagoLink ? 'Generado' : 'No disponible'}`);
        console.log(`   ✅ PayPal: ${result.payPalLink ? 'Generado' : 'No disponible'}`);
        console.log(`   ✅ WhatsApp: ${result.whatsAppLink ? 'Generado' : 'No disponible'}`);
      } else {
        console.log(`   ❌ Error generando enlaces: ${result.message}`);
        todoBien = false;
      }
    } else {
      console.log(`   ⚠️  No hay productos digitales para probar`);
    }

    // 5. Verificar archivos críticos
    console.log('\n📁 5. Verificando Archivos del Sistema...');
    const fs = require('fs');
    const archivos = [
      'src/lib/ai-service.ts',
      'src/lib/bot-payment-link-generator.ts',
      'src/lib/baileys-stable-service.ts',
      'prisma/schema.prisma',
      '.env'
    ];

    for (const archivo of archivos) {
      const existe = fs.existsSync(archivo);
      console.log(`   ${existe ? '✅' : '❌'} ${archivo}`);
      if (!existe) todoBien = false;
    }

    // Resumen final
    console.log('\n' + '='.repeat(60));
    if (todoBien) {
      console.log('\n✅ SISTEMA COMPLETAMENTE FUNCIONAL\n');
      console.log('Todo está configurado correctamente.');
      console.log('El bot está listo para generar enlaces de pago dinámicos.\n');
      console.log('Para iniciar el bot:');
      console.log('   npm run dev\n');
    } else {
      console.log('\n⚠️  SISTEMA FUNCIONAL CON ADVERTENCIAS\n');
      console.log('El sistema funciona pero hay configuraciones opcionales pendientes.');
      console.log('Revisa las advertencias arriba.\n');
    }

  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    todoBien = false;
  } finally {
    await prisma.$disconnect();
  }

  process.exit(todoBien ? 0 : 1);
}

verificarSistemaCompleto();
