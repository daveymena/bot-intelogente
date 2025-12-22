/**
 * Prueba del Motor Inteligente con Razonamiento Real
 * Simula conversaciones naturales con contexto y memoria
 */

import { IntelligentConversationEngine } from '../src/lib/intelligent-conversation-engine';

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error('❌ GROQ_API_KEY no está configurada en .env');
  process.exit(1);
}

const engine = new IntelligentConversationEngine(apiKey);
const testUserId = 'test-user-123';
const testChatId = 'test-chat@whatsapp.net';

async function simulateConversation() {
  console.log('🧠 Prueba del Motor Inteligente con Razonamiento Real\n');
  console.log('='.repeat(70));
  console.log('\n💡 Este motor entiende CONTEXTO y mantiene MEMORIA\n');
  console.log('='.repeat(70));

  // Escenario 1: Conversación natural sobre laptops
  console.log('\n📝 ESCENARIO 1: Consulta natural de producto');
  console.log('-'.repeat(70));
  
  await testMessage('Hola, buenos días');
  await delay(1000);
  
  await testMessage('Estoy buscando una laptop para diseño gráfico');
  await delay(1000);
  
  await testMessage('¿Cuánto cuesta?'); // Debe entender que habla de la laptop mencionada
  await delay(1000);
  
  await testMessage('Me interesa, ¿cómo puedo pagar?'); // Debe recordar el producto
  await delay(1000);
  
  await testMessage('Prefiero MercadoPago'); // Debe generar link automáticamente
  await delay(1000);

  // Escenario 2: Cambio de tema con memoria
  console.log('\n📝 ESCENARIO 2: Cambio de tema manteniendo contexto');
  console.log('-'.repeat(70));
  
  await testMessage('Espera, mejor quiero ver motos');
  await delay(1000);
  
  await testMessage('¿Tienen motos eléctricas?');
  await delay(1000);
  
  await testMessage('Precio de la moto'); // Debe entender que habla de motos
  await delay(1000);

  // Escenario 3: Intención de pago sin mencionar producto explícitamente
  console.log('\n📝 ESCENARIO 3: Intención de pago con contexto implícito');
  console.log('-'.repeat(70));
  
  await testMessage('Ok, me convence');
  await delay(1000);
  
  await testMessage('Envíame el link de pago'); // Debe saber de qué producto habla
  await delay(1000);

  // Escenario 4: Preguntas sobre el mismo producto
  console.log('\n📝 ESCENARIO 4: Múltiples preguntas sobre el mismo producto');
  console.log('-'.repeat(70));
  
  await testMessage('Quiero ver cursos de programación');
  await delay(1000);
  
  await testMessage('¿Cuánto cuesta?'); // Debe referirse al curso
  await delay(1000);
  
  await testMessage('¿Tiene certificado?'); // Debe seguir hablando del curso
  await delay(1000);
  
  await testMessage('¿Cuánto dura?'); // Debe seguir en contexto
  await delay(1000);
  
  await testMessage('Ok, lo quiero'); // Debe ofrecer pago del curso
  await delay(1000);

  // Mostrar estadísticas finales
  console.log('\n📊 ESTADÍSTICAS DE LA CONVERSACIÓN');
  console.log('='.repeat(70));
  const stats = engine.getStats(testChatId);
  if (stats) {
    console.log(`📨 Mensajes intercambiados: ${stats.messageCount}`);
    console.log(`📦 Producto en contexto: ${stats.hasProduct ? 'Sí' : 'No'}`);
    console.log(`💳 Intención de pago: ${stats.paymentIntent ? 'Sí' : 'No'}`);
    console.log(`💰 Método preferido: ${stats.preferredMethod || 'No especificado'}`);
    console.log(`⏱️  Duración: ${Math.round(stats.duration / 1000)}s`);
  }

  const context = engine.getContext(testChatId);
  console.log('\n🧠 CONTEXTO FINAL:');
  console.log(JSON.stringify(context, null, 2));

  console.log('\n✅ Prueba completada\n');
}

async function testMessage(message: string) {
  console.log(`\n👤 Usuario: "${message}"`);
  
  try {
    const response = await engine.processMessage({
      chatId: testChatId,
      userName: 'Juan Pérez',
      message,
      userId: testUserId
    });

    console.log(`\n🤖 Bot (confianza: ${(response.confidence * 100).toFixed(0)}%):`);
    console.log(response.text);

    if (response.actions.length > 0) {
      console.log(`\n⚡ Acciones generadas: ${response.actions.length}`);
      response.actions.forEach((action, idx) => {
        console.log(`   ${idx + 1}. ${action.type}`);
        if (action.product) {
          console.log(`      Producto: ${action.product.name}`);
        }
        if (action.method) {
          console.log(`      Método: ${action.method}`);
        }
      });
    }

    if (Object.keys(response.context).length > 0) {
      console.log(`\n📋 Contexto actualizado:`);
      if (response.context.currentProduct) {
        console.log(`   - Producto actual: ${response.context.currentProduct.name}`);
      }
      if (response.context.paymentIntent) {
        console.log(`   - Intención de pago: Sí`);
      }
      if (response.context.preferredPaymentMethod) {
        console.log(`   - Método preferido: ${response.context.preferredPaymentMethod}`);
      }
    }

  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Ejecutar pruebas
console.log('🚀 Iniciando pruebas del Motor Inteligente...\n');
simulateConversation().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
