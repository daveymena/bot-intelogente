import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restaurarSistemaDinamico() {
  console.log('🔄 RESTAURANDO SISTEMA DE LINKS DINÁMICOS...\\n');
  
  console.log('📋 El sistema correcto funciona así:');
  console.log('   1. Los productos NO tienen links estáticos en la BD');
  console.log('   2. El bot usa PaymentLinkGenerator para crear links únicos');
  console.log('   3. Cada transacción genera un link nuevo con PayPal/MercadoPago API');
  console.log('   4. Los links son temporales y específicos para cada cliente\\n');
  
  // Contar productos con links estáticos
  const productosConLinks = await prisma.product.count({
    where: {
      OR: [
        { paymentLinkPayPal: { not: null } },
        { paymentLinkMercadoPago: { not: null } }
      ]
    }
  });
  
  console.log('🔍 Estado actual:');
  console.log('   Productos con links estáticos: ' + productosConLinks + '\\n');
  
  if (productosConLinks === 0) {
    console.log('✅ Sistema ya está configurado correctamente');
    console.log('   Los productos usan generación dinámica de links\\n');
    await mostrarInstrucciones();
    await prisma.$disconnect();
    return;
  }
  
  console.log('⚠️  Limpiando links estáticos para usar sistema dinámico...\\n');
  
  // Limpiar links estáticos
  const resultado = await prisma.product.updateMany({
    data: {
      paymentLinkPayPal: null,
      paymentLinkMercadoPago: null
    }
  });
  
  console.log('✅ ' + resultado.count + ' productos actualizados\\n');
  console.log('🎉 Sistema de links dinámicos restaurado\\n');
  
  await mostrarInstrucciones();
  await prisma.$disconnect();
}

async function mostrarInstrucciones() {
  console.log('='.repeat(80));
  console.log('📚 CÓMO FUNCIONA EL SISTEMA DE LINKS DINÁMICOS');
  console.log('='.repeat(80) + '\\n');
  
  console.log('1️⃣ CONFIGURAR CREDENCIALES DE PAYPAL');
  console.log('   Ir a: https://developer.paypal.com/dashboard/applications');
  console.log('   Crear una app y obtener:');
  console.log('   - Client ID');
  console.log('   - Client Secret');
  console.log('   ');
  console.log('   Agregar a .env:');
  console.log('   PAYPAL_CLIENT_ID=tu_client_id');
  console.log('   PAYPAL_CLIENT_SECRET=tu_secret');
  console.log('   PAYPAL_MODE=live\\n');
  
  console.log('2️⃣ CONFIGURAR CREDENCIALES DE MERCADOPAGO');
  console.log('   Ir a: https://www.mercadopago.com.co/developers/panel/app');
  console.log('   Crear una aplicación y obtener:');
  console.log('   - Access Token');
  console.log('   - Public Key');
  console.log('   ');
  console.log('   Agregar a .env:');
  console.log('   MERCADO_PAGO_ACCESS_TOKEN=tu_token');
  console.log('   MERCADO_PAGO_PUBLIC_KEY=tu_key\\n');
  
  console.log('3️⃣ CÓMO FUNCIONA EN EL BOT');
  console.log('   Cuando un cliente pregunta por un producto:');
  console.log('   ');
  console.log('   Cliente: "Quiero el MegaPack de idiomas"');
  console.log('   Bot: "¿Cómo deseas pagar?"');
  console.log('   Cliente: "PayPal"');
  console.log('   ');
  console.log('   El bot llama a:');
  console.log('   PaymentLinkGenerator.generatePayPalLink()');
  console.log('   ');
  console.log('   Esto crea una orden en PayPal API y devuelve:');
  console.log('   https://www.paypal.com/checkoutnow?token=ABC123...');
  console.log('   ');
  console.log('   ✅ Link único y temporal para esa transacción\\n');
  
  console.log('4️⃣ VENTAJAS DEL SISTEMA DINÁMICO');
  console.log('   ✅ Links únicos por transacción');
  console.log('   ✅ Mayor seguridad');
  console.log('   ✅ Tracking automático de pagos');
  console.log('   ✅ Conversión de moneda automática (COP → USD)');
  console.log('   ✅ No necesitas actualizar links en productos\\n');
  
  console.log('5️⃣ FALLBACK SI NO HAY CREDENCIALES');
  console.log('   Si no configuras las APIs, el sistema usa:');
  console.log('   - Email de PayPal: ' + (process.env.PAYPAL_EMAIL || 'No configurado'));
  console.log('   - Nequi/Daviplata como alternativa');
  console.log('   - Transferencia bancaria\\n');
  
  console.log('='.repeat(80));
  console.log('📝 PRÓXIMOS PASOS');
  console.log('='.repeat(80) + '\\n');
  
  const paypalConfigured = !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
  const mercadopagoConfigured = !!(process.env.MERCADO_PAGO_ACCESS_TOKEN);
  
  if (!paypalConfigured) {
    console.log('⚠️  PayPal API no configurado');
    console.log('   1. Obtener credenciales en: https://developer.paypal.com');
    console.log('   2. Agregar a .env');
    console.log('   3. Reiniciar el bot\\n');
  } else {
    console.log('✅ PayPal API configurado\\n');
  }
  
  if (!mercadopagoConfigured) {
    console.log('⚠️  MercadoPago API no configurado');
    console.log('   1. Obtener credenciales en: https://www.mercadopago.com.co/developers');
    console.log('   2. Agregar a .env');
    console.log('   3. Reiniciar el bot\\n');
  } else {
    console.log('✅ MercadoPago API configurado\\n');
  }
  
  console.log('🚀 Para probar el sistema:');
  console.log('   npm run dev');
  console.log('   ');
  console.log('   Luego en WhatsApp:');
  console.log('   "Quiero el MegaPack de idiomas"');
  console.log('   "PayPal"');
  console.log('   ');
  console.log('   El bot generará un link dinámico real\\n');
  
  console.log('📖 Documentación del código:');
  console.log('   src/lib/payment-link-generator.ts\\n');
}

restaurarSistemaDinamico().catch(console.error);
