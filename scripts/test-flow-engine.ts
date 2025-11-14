/**
 * Script de prueba para el FlowEngine
 * Simula conversaciones completas incluyendo intenciones de pago
 */

import { createFlowEngine } from '../src/lib/plantillas-respuestas-bot';
import { PaymentIntentDetector } from '../src/lib/plantillas-respuestas-bot';

const engine = createFlowEngine();

async function testConversation() {
  console.log('🧪 Iniciando prueba del FlowEngine\n');
  console.log('='.repeat(60));

  const chatId = 'test-user@whatsapp.net';
  const userName = 'Juan Pérez';

  // Escenario 1: Saludo inicial
  console.log('\n📝 Escenario 1: Saludo inicial');
  console.log('-'.repeat(60));
  await simulateMessage(chatId, userName, 'Hola');

  // Escenario 2: Consulta de producto
  console.log('\n📝 Escenario 2: Consulta de producto');
  console.log('-'.repeat(60));
  await simulateMessage(chatId, userName, 'Quiero ver laptops disponibles');

  // Escenario 3: Solicitar fotos
  console.log('\n📝 Escenario 3: Solicitar fotos');
  console.log('-'.repeat(60));
  await simulateMessage(chatId, userName, 'Muéstrame fotos');

  // Escenario 4: Intención de pago - Frase directa
  console.log('\n📝 Escenario 4: Intención de pago directa');
  console.log('-'.repeat(60));
  await simulateMessage(chatId, userName, 'Quiero pagar ahora');

  // Escenario 5: Intención de pago - Solicitar link
  console.log('\n📝 Escenario 5: Solicitar link de pago');
  console.log('-'.repeat(60));
  await simulateMessage(chatId, userName, 'Envíame el link de pago');

  // Escenario 6: Consulta de métodos de pago
  console.log('\n📝 Escenario 6: Consulta de métodos de pago');
  console.log('-'.repeat(60));
  await simulateMessage(chatId, userName, '¿Qué métodos de pago aceptan?');

  // Escenario 7: Especificar método de pago
  console.log('\n📝 Escenario 7: Especificar método de pago');
  console.log('-'.repeat(60));
  await simulateMessage(chatId, userName, 'Quiero pagar con PayPal');

  // Escenario 8: Confirmar pago
  console.log('\n📝 Escenario 8: Confirmar pago realizado');
  console.log('-'.repeat(60));
  await simulateMessage(chatId, userName, 'Ya pagué');

  // Mostrar resumen de la sesión
  console.log('\n📊 Resumen de la sesión');
  console.log('='.repeat(60));
  const session = engine.getSession(chatId);
  console.log('Estado actual:', session.state);
  console.log('Producto en contexto:', session.context.product?.name || 'Ninguno');
  console.log('Orden creada:', session.context.order?.id || 'Ninguna');
  console.log('Método de pago:', session.context.paymentMethod || 'No seleccionado');
  console.log('Mensajes en historial:', session.history.length);

  console.log('\n✅ Prueba completada\n');
}

async function simulateMessage(chatId: string, userName: string, text: string) {
  console.log(`\n👤 Usuario: "${text}"`);
  
  // Detectar intención de pago
  const paymentIntent = PaymentIntentDetector.detectIntent(text);
  if (paymentIntent) {
    console.log(`💡 Intención detectada: ${paymentIntent}`);
  }

  const paymentMethod = PaymentIntentDetector.detectPaymentMethod(text);
  if (paymentMethod) {
    console.log(`💳 Método de pago detectado: ${paymentMethod}`);
  }

  // Procesar mensaje
  const responses = await engine.handleIncoming({
    chatId,
    userName,
    text
  });

  // Mostrar respuestas
  console.log(`\n🤖 Bot (${responses.length} respuesta${responses.length > 1 ? 's' : ''}):`);
  responses.forEach((response, index) => {
    console.log(`\n[Respuesta ${index + 1}]`);
    console.log(`Tipo: ${response.type}`);
    
    if (response.text) {
      console.log(`Texto: ${response.text.substring(0, 200)}${response.text.length > 200 ? '...' : ''}`);
    }
    
    if (response.buttons && response.buttons.length > 0) {
      console.log('Botones:', response.buttons.map((b: any) => b.text).join(', '));
    }
  });
}

// Test de detección de intenciones
async function testIntentDetection() {
  console.log('\n🧪 Prueba de detección de intenciones de pago\n');
  console.log('='.repeat(60));

  const testPhrases = [
    'Quiero pagar',
    'Envíame el link de pago',
    '¿Cómo puedo pagar?',
    'Dame el enlace para pagar',
    'Link de MercadoPago',
    'Quiero pagar con PayPal',
    '¿Qué métodos de pago tienen?',
    'Formas de pago disponibles',
    'Hola, buenos días',
    'Cuánto cuesta',
    'Muéstrame productos'
  ];

  testPhrases.forEach(phrase => {
    const intent = PaymentIntentDetector.detectIntent(phrase);
    const method = PaymentIntentDetector.detectPaymentMethod(phrase);
    
    console.log(`\n"${phrase}"`);
    console.log(`  → Intención: ${intent || 'ninguna'}`);
    if (method) {
      console.log(`  → Método: ${method}`);
    }
  });

  console.log('\n✅ Prueba de detección completada\n');
}

// Ejecutar pruebas
async function runTests() {
  try {
    await testIntentDetection();
    await testConversation();
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    process.exit(1);
  }
}

runTests();
