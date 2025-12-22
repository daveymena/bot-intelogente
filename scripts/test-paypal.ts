import 'dotenv/config';

console.log('🔍 Prueba de PayPal\n');
console.log('='.repeat(60));

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const mode = process.env.PAYPAL_MODE || 'sandbox';

const apiUrl = process.env.PAYPAL_API_URL || 
  (mode === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com');

console.log('\n📋 Configuración:');
console.log('Modo:', mode);
console.log('API URL:', apiUrl);
console.log('Client ID:', clientId ? `${clientId.substring(0, 20)}...` : '❌ NO ENCONTRADO');

if (!clientId || !clientSecret) {
  console.log('\n❌ ERROR: Credenciales de PayPal no configuradas');
  process.exit(1);
}

console.log('\n🔍 Obteniendo token de acceso...');

const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

fetch(`${apiUrl}/v1/oauth2/token`, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'grant_type=client_credentials'
})
.then(res => res.json())
.then(data => {
  if (data.error) {
    console.log('❌ Error:', data.error_description);
    return;
  }
  
  console.log('✅ Token obtenido exitosamente!');
  console.log('   Token:', data.access_token.substring(0, 30) + '...');
  console.log('   Expira en:', data.expires_in, 'segundos');
  
  // Crear orden de prueba
  console.log('\n🔍 Creando orden de prueba...');
  
  return fetch(`${apiUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${data.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '10.00',
          },
        },
      ],
      application_context: {
        return_url: 'http://localhost:3000/payment/success',
        cancel_url: 'http://localhost:3000/payment/failure',
      },
    }),
  });
})
.then(res => res?.json())
.then(order => {
  if (!order) return;
  
  if (order.error) {
    console.log('❌ Error creando orden:', order.message);
    return;
  }
  
  console.log('✅ Orden creada exitosamente!');
  console.log('   ID:', order.id);
  console.log('   Status:', order.status);
  
  const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;
  if (approvalUrl) {
    console.log('   URL de pago:', approvalUrl);
  }
  
  console.log('\n✅ TODO FUNCIONA CORRECTAMENTE CON PAYPAL!');
})
.catch(err => {
  console.log('❌ Error:', err.message);
});
