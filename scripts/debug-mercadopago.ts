import 'dotenv/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';

console.log('🔍 Diagnóstico de Mercado Pago\n');
console.log('='.repeat(60));

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY;

console.log('\n📋 Credenciales encontradas:');
console.log('Access Token:', accessToken ? `${accessToken.substring(0, 30)}...` : '❌ NO ENCONTRADO');
console.log('Public Key:', publicKey ? `${publicKey.substring(0, 30)}...` : '❌ NO ENCONTRADO');

if (!accessToken) {
  console.log('\n❌ ERROR: No se encontró MERCADO_PAGO_ACCESS_TOKEN');
  process.exit(1);
}

console.log('\n🔍 Probando conexión básica...');

// Test 1: Verificar token con API directa
fetch('https://api.mercadopago.com/v1/payment_methods', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
.then(res => res.json())
.then(data => {
  if (data.error) {
    console.log('❌ Error en API:', data.message);
  } else {
    console.log('✅ Token válido - API responde correctamente');
    console.log(`   Métodos de pago: ${data.length}`);
  }
})
.catch(err => {
  console.log('❌ Error de red:', err.message);
});

// Test 2: Intentar crear una preferencia de prueba
console.log('\n🔍 Intentando crear preferencia de prueba...');

setTimeout(async () => {
  try {
    const client = new MercadoPagoConfig({
      accessToken: accessToken,
    });

    const preference = new Preference(client);

    // Probar sin auto_return primero
    console.log('   Intento 1: Sin auto_return...');
    try {
      const response1 = await preference.create({
        body: {
          items: [
            {
              id: 'test-1',
              title: 'Producto de Prueba',
              description: 'Test',
              quantity: 1,
              unit_price: 10000,
              currency_id: 'COP',
            }
          ],
          back_urls: {
            success: 'http://localhost:3000/payment/success',
            failure: 'http://localhost:3000/payment/failure',
            pending: 'http://localhost:3000/payment/pending',
          },
          external_reference: 'test-payment',
        }
      });
      
      console.log('   ✅ Funciona sin auto_return!');
      console.log('   ID:', response1.id);
      console.log('   URL:', response1.init_point);
      return;
    } catch (err: any) {
      console.log('   ❌ Falló sin auto_return:', err.message);
    }

    // Probar con auto_return
    console.log('\n   Intento 2: Con auto_return...');
    const response = await preference.create({
      body: {
        items: [
          {
            id: 'test-1',
            title: 'Producto de Prueba',
            description: 'Test',
            quantity: 1,
            unit_price: 10000,
            currency_id: 'COP',
          }
        ],
        back_urls: {
          success: 'http://localhost:3000/payment/success',
          failure: 'http://localhost:3000/payment/failure',
          pending: 'http://localhost:3000/payment/pending',
        },
        auto_return: 'approved' as const,
        external_reference: 'test-payment',
      }
    });

    console.log('✅ Preferencia creada exitosamente!');
    console.log('   ID:', response.id);
    console.log('   URL:', response.init_point);
    console.log('\n✅ TODO FUNCIONA CORRECTAMENTE');
    
  } catch (error: any) {
    console.log('❌ Error al crear preferencia:');
    console.log('   Mensaje:', error.message);
    
    if (error.cause) {
      console.log('   Causa:', JSON.stringify(error.cause, null, 2));
    }
    
    if (error.response) {
      console.log('   Response:', JSON.stringify(error.response, null, 2));
    }

    console.log('\n💡 Posibles soluciones:');
    console.log('   1. Verifica que el Access Token sea de PRODUCCIÓN (no test)');
    console.log('   2. Verifica que tu cuenta de Mercado Pago esté activada');
    console.log('   3. Verifica que tengas permisos de "Checkout Pro"');
    console.log('   4. Intenta regenerar las credenciales en:');
    console.log('      https://www.mercadopago.com.co/developers/panel/app');
  }
}, 2000);
