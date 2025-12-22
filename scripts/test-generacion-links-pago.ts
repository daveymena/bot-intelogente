/**
 * Test: Generación de Links de Pago
 * Verifica que BotPaymentLinkGenerator funcione correctamente
 */

import { BotPaymentLinkGenerator } from '../src/lib/bot-payment-link-generator';
import { db } from '../src/lib/db';

async function main() {
  console.log('🧪 TEST: Generación de Links de Pago\n');

  // 1. Buscar un producto de prueba
  const producto = await db.product.findFirst({
    where: {
      name: {
        contains: 'Piano',
        mode: 'insensitive'
      },
      status: 'AVAILABLE'
    }
  });

  if (!producto) {
    console.log('❌ No se encontró el producto de prueba');
    return;
  }

  console.log('✅ Producto encontrado:');
  console.log(`   ID: ${producto.id}`);
  console.log(`   Nombre: ${producto.name}`);
  console.log(`   Precio: ${producto.price.toLocaleString('es-CO')} COP`);
  console.log(`   Usuario: ${producto.userId}\n`);

  // 2. Verificar variables de entorno
  console.log('🔍 Verificando configuración:');
  console.log(`   MERCADOPAGO_ACCESS_TOKEN: ${process.env.MERCADOPAGO_ACCESS_TOKEN ? '✅ Configurado' : '❌ NO configurado'}`);
  console.log(`   PAYPAL_CLIENT_ID: ${process.env.PAYPAL_CLIENT_ID ? '✅ Configurado' : '❌ NO configurado'}`);
  console.log(`   PAYPAL_CLIENT_SECRET: ${process.env.PAYPAL_CLIENT_SECRET ? '✅ Configurado' : '❌ NO configurado'}\n`);

  // 3. Generar links de pago
  console.log('🔄 Generando links de pago...\n');
  
  const resultado = await BotPaymentLinkGenerator.generatePaymentLinks(
    producto.id,
    producto.userId,
    1
  );

  // 4. Mostrar resultados
  console.log('📊 RESULTADOS:\n');
  console.log(`Success: ${resultado.success ? '✅' : '❌'}`);
  
  if (resultado.mercadoPagoLink) {
    console.log(`\n💳 MercadoPago:`);
    console.log(`   ${resultado.mercadoPagoLink}`);
  } else {
    console.log(`\n💳 MercadoPago: ❌ No generado`);
  }

  if (resultado.payPalLink) {
    console.log(`\n💙 PayPal:`);
    console.log(`   ${resultado.payPalLink}`);
  } else {
    console.log(`\n💙 PayPal: ❌ No generado`);
  }

  if (resultado.nequiInfo) {
    console.log(`\n📱 Nequi: ${resultado.nequiInfo}`);
  }

  if (resultado.daviplataInfo) {
    console.log(`📱 Daviplata: ${resultado.daviplataInfo}`);
  }

  console.log(`\n📝 MENSAJE COMPLETO:\n`);
  console.log(resultado.message);
  console.log('\n' + '='.repeat(60));

  // 5. Verificar si los links son reales o placeholders
  if (resultado.mercadoPagoLink) {
    if (resultado.mercadoPagoLink.includes('00000') || resultado.mercadoPagoLink.includes('placeholder')) {
      console.log('\n⚠️  ADVERTENCIA: Link de MercadoPago parece ser un placeholder');
    } else {
      console.log('\n✅ Link de MercadoPago parece ser real');
    }
  }

  if (resultado.payPalLink) {
    if (resultado.payPalLink.includes('00000') || resultado.payPalLink.includes('placeholder')) {
      console.log('⚠️  ADVERTENCIA: Link de PayPal parece ser un placeholder');
    } else {
      console.log('✅ Link de PayPal parece ser real');
    }
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
