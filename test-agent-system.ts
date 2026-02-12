// test-agent-system.ts
require('dotenv').config();
import { routeMessage } from './src/lib/bot/core/agentRouter';

async function testAgentSystem() {
  // Reemplaza con tu userId real de la BD
  const userId = 'cmlhbizk20000kmrcoxxha1bt';
  const customerPhone = '573001234567';
  
  const tests = [
    {
      message: 'Hola, buenos días',
      expected: 'Saludo'
    },
    {
      message: '¿Cuánto cuesta el MegaPack Golden?',
      expected: 'Consulta de precio'
    },
    {
      message: 'Quiero comprar cursos de programación',
      expected: 'Intención de compra'
    },
    {
      message: '¿Tienen laptops disponibles?',
      expected: 'Consulta de disponibilidad'
    },
    {
      message: 'Necesito una impresora',
      expected: 'Búsqueda de producto'
    }
  ];
  
  console.log('🤖 Probando Sistema Multi-Agente\n');
  console.log('='.repeat(60));
  
  for (const test of tests) {
    console.log(`\n📱 Cliente: "${test.message}"`);
    console.log(`🎯 Esperado: ${test.expected}`);
    console.log('-'.repeat(60));
    
    try {
      const response = await routeMessage(userId, customerPhone, test.message);
      console.log(`🤖 Bot: ${response}`);
    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    console.log('='.repeat(60));
    
    // Esperar 2 segundos entre mensajes
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n✅ Pruebas completadas!');
}

testAgentSystem().catch(console.error);
