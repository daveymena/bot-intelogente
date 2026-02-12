/**
 * Test: Productos Variables - Cuando el cliente no especifica exactamente
 */

import dotenv from 'dotenv';
dotenv.config();

import { routeMessage } from './src/lib/bot/core/agentRouter';

async function testProductosVariables() {
  console.log('\n🔍 TEST: Productos Variables (Múltiples Opciones)\n');
  console.log('═══════════════════════════════════════════════════\n');

  const userId = 'cmlhe8bup0000kmxg7en0g4ow';
  const testPhone = 'test-' + Date.now() + '@s.whatsapp.net';

  // Casos de prueba con productos variables
  const testCases = [
    {
      msg: 'Quiero un computador',
      expected: 'Debe mostrar varias opciones de computadores'
    },
    {
      msg: 'Busco un curso',
      expected: 'Debe mostrar varios cursos disponibles'
    },
    {
      msg: 'Tienes laptops?',
      expected: 'Debe mostrar opciones de laptops'
    },
    {
      msg: 'Me interesan los megapacks',
      expected: 'Debe listar varios megapacks'
    }
  ];

  for (const test of testCases) {
    console.log(`\n📱 CLIENTE: "${test.msg}"`);
    console.log(`📋 Esperado: ${test.expected}`);
    console.log('─────────────────────────────────────────────────');
    
    try {
      const response = await routeMessage(userId, testPhone, test.msg);
      
      console.log(`\n🤖 BOT:\n${response.text}\n`);
      
      // Verificar si muestra múltiples opciones
      const hasNumbers = /[1-5][\.\)]/g.test(response.text);
      const hasMultipleProducts = (response.text.match(/\$/g) || []).length > 1;
      
      if (hasNumbers || hasMultipleProducts) {
        console.log('✅ Bot muestra múltiples opciones');
      } else {
        console.log('⚠️  Bot podría no estar mostrando suficientes opciones');
      }
      
      console.log('─────────────────────────────────────────────────\n');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n✅ Test completado\n');
  process.exit(0);
}

testProductosVariables();
