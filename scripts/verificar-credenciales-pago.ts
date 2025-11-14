/**
 * Verificar Credenciales de Pago
 * Comprueba que las APIs de MercadoPago y PayPal estén configuradas correctamente
 */

import dotenv from 'dotenv';
dotenv.config();

async function verificarCredenciales() {
  console.log('🔍 VERIFICANDO CREDENCIALES DE PAGO\n');

  let errores = 0;

  // 1. Verificar variables de entorno
  console.log('1️⃣ Variables de Entorno:');
  console.log('   MERCADO_PAGO_ACCESS_TOKEN:', process.env.MERCADO_PAGO_ACCESS_TOKEN ? '✅ Configurado' : '❌ No configurado');
  console.log('   MERCADO_PAGO_PUBLIC_KEY:', process.env.MERCADO_PAGO_PUBLIC_KEY ? '✅ Configurado' : '❌ No configurado');
  console.log('   PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID ? '✅ Configurado' : '❌ No configurado');
  console.log('   PAYPAL_CLIENT_SECRET:', process.env.PAYPAL_CLIENT_SECRET ? '✅ Configurado' : '❌ No configurado');
  console.log('   PAYPAL_MODE:', process.env.PAYPAL_MODE || 'sandbox');
  console.log('   NEQUI_NUMBER:', process.env.NEQUI_NUMBER || '3136174267');
  console.log('   DAVIPLATA_NUMBER:', process.env.DAVIPLATA_NUMBER || '3136174267');
  console.log();

  // 2. Probar MercadoPago
  if (process.env.MERCADO_PAGO_ACCESS_TOKEN) {
    console.log('2️⃣ Probando MercadoPago...');
    try {
      const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ MercadoPago: Credenciales válidas');
        console.log(`   📊 Métodos disponibles: ${data.length}`);
      } else {
        console.log('   ❌ MercadoPago: Credenciales inválidas');
        console.log('   Error:', response.status, response.statusText);
        errores++;
      }
    } catch (error) {
      console.log('   ❌ MercadoPago: Error de conexión');
      console.log('   Error:', error);
      errores++;
    }
  } else {
    console.log('2️⃣ MercadoPago: ⚠️ No configurado');
  }
  console.log();

  // 3. Probar PayPal
  if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
    console.log('3️⃣ Probando PayPal...');
    try {
      const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.paypal.com';
      const authString = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
      ).toString('base64');

      const response = await fetch(`${apiUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authString}`
        },
        body: 'grant_type=client_credentials'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ PayPal: Credenciales válidas');
        console.log('   🔑 Token obtenido exitosamente');
        console.log('   🌍 Modo:', process.env.PAYPAL_MODE || 'sandbox');
      } else {
        const errorText = await response.text();
        console.log('   ❌ PayPal: Credenciales inválidas');
        console.log('   Error:', response.status, response.statusText);
        console.log('   Detalle:', errorText);
        errores++;
      }
    } catch (error) {
      console.log('   ❌ PayPal: Error de conexión');
      console.log('   Error:', error);
      errores++;
    }
  } else {
    console.log('3️⃣ PayPal: ⚠️ No configurado');
  }
  console.log();

  // 4. Resumen
  console.log('📊 RESUMEN:');
  if (errores === 0) {
    console.log('   ✅ Todas las credenciales configuradas son válidas');
    console.log('   🚀 El sistema está listo para generar links de pago');
  } else {
    console.log(`   ⚠️ Se encontraron ${errores} error(es)`);
    console.log('   🔧 Revisa las credenciales en el archivo .env');
  }
  console.log();

  // 5. Información adicional
  console.log('💡 INFORMACIÓN:');
  console.log('   - MercadoPago: Genera links para tarjetas, PSE, efectivo');
  console.log('   - PayPal: Genera links para pagos internacionales');
  console.log('   - Nequi/Daviplata: Transferencias manuales (no requieren API)');
  console.log();

  return errores === 0;
}

// Ejecutar verificación
verificarCredenciales()
  .then((success) => {
    if (success) {
      console.log('✅ Verificación completada exitosamente');
      process.exit(0);
    } else {
      console.log('❌ Verificación falló - Revisa las credenciales');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Error en la verificación:', error);
    process.exit(1);
  });
