/**
 * 🔍 DIAGNÓSTICO DE MERCADOPAGO
 * Prueba directa de la API de MercadoPago para identificar el problema
 */

require('dotenv').config();

async function testMercadoPago() {
  console.log('🔍 DIAGNÓSTICO DE MERCADOPAGO\n');

  // Verificar credenciales
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY;

  console.log('📋 CREDENCIALES:');
  console.log(`   Access Token: ${accessToken ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`   Public Key: ${publicKey ? '✅ Configurado' : '❌ No configurado'}`);
  console.log('');

  if (!accessToken) {
    console.log('❌ ERROR: MERCADO_PAGO_ACCESS_TOKEN no está configurado');
    return;
  }

  // Producto de prueba
  const testProduct = {
    id: 'test-123',
    name: 'Producto de Prueba',
    description: 'Descripción del producto de prueba',
    price: 150000,
    currency: 'COP'
  };

  console.log('📦 PRODUCTO DE PRUEBA:');
  console.log(`   Nombre: ${testProduct.name}`);
  console.log(`   Precio: ${testProduct.price} ${testProduct.currency}`);
  console.log('');

  // Crear preferencia (sin auto_return para evitar el error)
  const preference = {
    items: [
      {
        title: testProduct.name,
        description: testProduct.description,
        quantity: 1,
        unit_price: testProduct.price,
        currency_id: testProduct.currency
      }
    ],
    back_urls: {
      success: 'http://localhost:3000/tienda/success',
      failure: 'http://localhost:3000/tienda/failure',
      pending: 'http://localhost:3000/tienda/pending'
    },
    external_reference: testProduct.id
  };

  console.log('🔄 LLAMANDO A API DE MERCADOPAGO...\n');
  console.log('📡 URL: https://api.mercadopago.com/checkout/preferences');
  console.log('🔑 Authorization: Bearer ' + accessToken.substring(0, 20) + '...');
  console.log('');

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(preference)
    });

    console.log(`📥 RESPUESTA: ${response.status} ${response.statusText}\n`);

    const responseText = await response.text();
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ ÉXITO! Preferencia creada:\n');
      console.log(`   ID: ${data.id}`);
      console.log(`   Link de pago: ${data.init_point}`);
      console.log('');
      console.log('🎉 MERCADOPAGO ESTÁ FUNCIONANDO CORRECTAMENTE');
      console.log('');
      console.log('📋 PRUEBA EL LINK:');
      console.log(`   ${data.init_point}`);
      console.log('');
    } else {
      console.log('❌ ERROR EN LA RESPUESTA:\n');
      
      try {
        const errorData = JSON.parse(responseText);
        console.log('📄 Detalles del error:');
        console.log(JSON.stringify(errorData, null, 2));
        console.log('');

        // Analizar errores comunes
        if (errorData.message) {
          console.log('💡 MENSAJE DE ERROR:');
          console.log(`   ${errorData.message}`);
          console.log('');
        }

        if (errorData.cause) {
          console.log('💡 CAUSA:');
          errorData.cause.forEach((cause, index) => {
            console.log(`   ${index + 1}. ${cause.code}: ${cause.description}`);
          });
          console.log('');
        }

        // Sugerencias según el error
        if (responseText.includes('invalid_token') || responseText.includes('unauthorized')) {
          console.log('🔧 SOLUCIÓN SUGERIDA:');
          console.log('   1. Verifica que el Access Token sea correcto');
          console.log('   2. Asegúrate de que no haya espacios al inicio/final');
          console.log('   3. Verifica que la cuenta de MercadoPago esté activa');
          console.log('   4. Genera un nuevo Access Token desde el panel de MercadoPago');
          console.log('');
        }

        if (responseText.includes('currency_id')) {
          console.log('🔧 SOLUCIÓN SUGERIDA:');
          console.log('   1. Verifica que COP sea una moneda soportada en tu cuenta');
          console.log('   2. Intenta con otra moneda (USD, ARS, BRL, etc.)');
          console.log('   3. Verifica la configuración de tu cuenta de MercadoPago');
          console.log('');
        }

      } catch (e) {
        console.log('📄 Respuesta raw:');
        console.log(responseText);
        console.log('');
      }
    }

  } catch (error) {
    console.log('❌ ERROR DE RED O CONEXIÓN:\n');
    console.log(`   ${error.message}`);
    console.log('');
    console.log('🔧 SOLUCIÓN SUGERIDA:');
    console.log('   1. Verifica tu conexión a internet');
    console.log('   2. Verifica que no haya firewall bloqueando');
    console.log('   3. Intenta de nuevo en unos minutos');
    console.log('');
  }
}

// Ejecutar diagnóstico
testMercadoPago();
