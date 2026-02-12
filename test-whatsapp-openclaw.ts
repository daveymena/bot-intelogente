/**
 * Test para verificar que OpenClaw está siendo usado en producción
 */

import dotenv from 'dotenv';
dotenv.config();

import { routeMessage } from './src/lib/bot/core/agentRouter';

async function testWhatsAppOpenClaw() {
  console.log('\n🦞 TEST: Verificando OpenClaw en producción\n');
  console.log('═══════════════════════════════════════════\n');

  const userId = 'cmlhe8bup0000kmxg7en0g4ow';
  const testPhone = '573042748709@s.whatsapp.net';

  // Simular conversación
  const messages = [
    'Hola',
    'Me interesa el curso de piano',
    'Cuánto cuesta?'
  ];

  for (const msg of messages) {
    console.log(`\n📱 CLIENTE: "${msg}"`);
    console.log('─────────────────────────────────────────');
    
    try {
      const response = await routeMessage(userId, testPhone, msg);
      
      console.log(`\n🤖 BOT: ${response.text.substring(0, 200)}...`);
      console.log('─────────────────────────────────────────\n');
      
      // Pausa entre mensajes
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n✅ Test completado\n');
  process.exit(0);
}

testWhatsAppOpenClaw();
