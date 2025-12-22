import { PrismaClient } from '@prisma/client';
import { Orchestrator } from '../src/agents/orchestrator';

const prisma = new PrismaClient();

console.log('\n🧪 TEST DE FLUJO COMPLETO CON CONVERSACIONES REALES\n');
console.log('='.repeat(80));

// Escenarios de prueba reales
const scenarios = [
  {
    name: 'Cliente busca laptop para trabajo',
    messages: [
      'Hola',
      'Busco una laptop para trabajar',
      'Que tenga buena memoria',
      'Cuánto cuesta?',
      'Me interesa, cómo pago?',
      'Quiero pagar con MercadoPago'
    ]
  },
  {
    name: 'Cliente pregunta por curso específico',
    messages: [
      'Buenos días',
      'Tienen cursos de diseño gráfico?',
      'Cuál me recomiendas?',
      'Cuánto vale?',
      'Acepta PayPal?'
    ]
  },
  {
    name: 'Cliente busca moto',
    messages: [
      'Hola buenas',
      'Venden motos?',
      'Cuáles tienen disponibles?',
      'La más económica cuál es?',
      'Puedo pagar con Nequi?'
    ]
  },
  {
    name: 'Cliente indeciso con preguntas',
    messages: [
      'Hola',
      'Qué productos tienen?',
      'Me interesan las laptops',
      'Cuál es la diferencia entre HP y Lenovo?',
      'Tienen garantía?',
      'Hacen envíos?'
    ]
  },
  {
    name: 'Cliente directo al grano',
    messages: [
      'Laptop HP 15',
      'Precio?',
      'Link de pago'
    ]
  }
];

interface TestResult {
  scenario: string;
  success: boolean;
  issues: string[];
  responses: Array<{
    message: string;
    response: string;
    responseTime: number;
  }>;
}

const results: TestResult[] = [];

async function testScenario(scenario: typeof scenarios[0], userId: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📱 ESCENARIO: ${scenario.name}`);
  console.log('='.repeat(80));

  const customerPhone = `+57300${Math.floor(Math.random() * 10000000)}`;
  const issues: string[] = [];
  const responses: TestResult['responses'] = [];

  // Crear conversación
  const conversation = await prisma.conversation.create({
    data: {
      customerPhone,
      customerName: 'Cliente Test',
      userId,
      status: 'ACTIVE'
    }
  });

  for (let i = 0; i < scenario.messages.length; i++) {
    const message = scenario.messages[i];
    console.log(`\n👤 Cliente: ${message}`);

    const startTime = Date.now();

    try {
      // 1. Guardar mensaje del cliente
      await prisma.message.create({
        data: {
          content: message,
          type: 'TEXT',
          direction: 'INCOMING',
          conversationId: conversation.id
        }
      });

      // 2. Procesar mensaje con el Orchestrator (sistema completo de agentes)
      const orchestrator = new Orchestrator();
      const result = await orchestrator.processMessage({
        chatId: customerPhone,
        userId,
        message,
        userName: 'Cliente Test'
      });

      const responseTime = Date.now() - startTime;

      console.log(`   🤖 Bot (${responseTime}ms): ${result.text.substring(0, 150)}${result.text.length > 150 ? '...' : ''}`);
      
      // Mostrar contexto si hay producto
      if (result.context?.currentProduct) {
        console.log(`   📦 Producto en contexto: ${result.context.currentProduct.name} ($${result.context.currentProduct.price.toLocaleString('es-CO')})`);
      }

      // Mostrar acciones si las hay
      if (result.actions && result.actions.length > 0) {
        result.actions.forEach(action => {
          if (action.type === 'send_payment_link') {
            console.log(`   💳 Link de pago: ${action.data?.link?.substring(0, 60)}...`);
          } else if (action.type === 'send_photo') {
            console.log(`   📸 Foto enviada: ${action.data?.url}`);
          }
        });
      }

      // 3. Guardar respuesta del bot
      await prisma.message.create({
        data: {
          content: result.text,
          type: 'TEXT',
          direction: 'OUTGOING',
          aiGenerated: true,
          conversationId: conversation.id
        }
      });

      responses.push({
        message,
        response: result.text,
        responseTime
      });

      // Validaciones
      if (responseTime > 10000) {
        issues.push(`Respuesta lenta: ${responseTime}ms en mensaje "${message}"`);
      }

      if (result.text.length < 10) {
        issues.push(`Respuesta muy corta en mensaje "${message}"`);
      }

      if (result.text.toLowerCase().includes('error') || result.text.toLowerCase().includes('problema')) {
        issues.push(`Respuesta contiene error en mensaje "${message}": ${result.text.substring(0, 100)}`);
      }

      if (result.confidence < 0.5) {
        issues.push(`Baja confianza (${(result.confidence * 100).toFixed(0)}%) en mensaje "${message}"`);
      }

      // Esperar un poco entre mensajes (simular conversación real)
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
      issues.push(`Error en mensaje "${message}": ${error.message}`);
    }
  }

  // Limpiar conversación de prueba
  await prisma.message.deleteMany({ where: { conversationId: conversation.id } });
  await prisma.conversation.delete({ where: { id: conversation.id } });

  return {
    scenario: scenario.name,
    success: issues.length === 0,
    issues,
    responses
  };
}

async function runTests() {
  try {
    // Obtener primer usuario
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('❌ No hay usuarios en la base de datos');
      console.log('   Crea un usuario primero con: npx tsx scripts/create-admin-user.ts');
      return;
    }

    console.log(`\n✅ Usuario de prueba: ${user.email}`);
    console.log(`📊 Productos disponibles: ${await prisma.product.count({ where: { userId: user.id, status: 'AVAILABLE' } })}`);

    // Ejecutar todos los escenarios
    for (const scenario of scenarios) {
      const result = await testScenario(scenario, user.id);
      results.push(result);
    }

    // Resumen final
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 RESUMEN DE PRUEBAS');
    console.log('='.repeat(80));

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n✅ Exitosos: ${successful}/${results.length}`);
    console.log(`❌ Fallidos: ${failed}/${results.length}`);

    if (failed > 0) {
      console.log('\n\n❌ PROBLEMAS ENCONTRADOS:\n');
      results.forEach(result => {
        if (!result.success) {
          console.log(`\n📱 ${result.scenario}:`);
          result.issues.forEach(issue => {
            console.log(`   • ${issue}`);
          });
        }
      });
    }

    // Estadísticas de rendimiento
    console.log('\n\n⚡ ESTADÍSTICAS DE RENDIMIENTO:\n');
    
    const allResponses = results.flatMap(r => r.responses);
    const avgResponseTime = allResponses.reduce((sum, r) => sum + r.responseTime, 0) / allResponses.length;
    const maxResponseTime = Math.max(...allResponses.map(r => r.responseTime));
    const minResponseTime = Math.min(...allResponses.map(r => r.responseTime));

    console.log(`   Tiempo promedio de respuesta: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`   Tiempo máximo: ${maxResponseTime}ms`);
    console.log(`   Tiempo mínimo: ${minResponseTime}ms`);

    // Conclusión
    console.log('\n\n' + '='.repeat(80));
    if (failed === 0) {
      console.log('🎉 TODOS LOS TESTS PASARON - SISTEMA LISTO PARA PRODUCCIÓN');
      console.log('='.repeat(80));
      console.log('\n✅ Puedes subir a Git y desplegar en Easypanel\n');
    } else {
      console.log('⚠️  HAY PROBLEMAS QUE CORREGIR ANTES DE PRODUCCIÓN');
      console.log('='.repeat(80));
      console.log('\n❌ Revisa los errores arriba y corrígelos antes de desplegar\n');
    }

  } catch (error: any) {
    console.error('\n❌ Error durante las pruebas:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
