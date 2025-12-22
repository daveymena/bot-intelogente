import { BotPaymentLinkGenerator } from '../src/lib/bot-payment-link-generator';

const testCases = [
  'Envíame el link',
  'enviame el link',
  'Dame el link',
  'Pasa el link',
  'Manda el enlace',
  'Quiero pagar',
  'Método de pago?',
  'Metodo de pago',
  'Como pago',
  'Cómo puedo pagar',
  'Hola' // No debería detectarse
];

console.log('🧪 PRUEBA: Detección de Solicitud de Pago\n');
console.log('='.repeat(60));

for (const msg of testCases) {
  const detected = BotPaymentLinkGenerator.detectPaymentRequest(msg);
  console.log(`${detected ? '✅' : '❌'} "${msg}" → ${detected ? 'DETECTADO' : 'No detectado'}`);
}

console.log('\n' + '='.repeat(60));
