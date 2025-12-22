
import { PerfectBotSystem } from '../src/lib/perfect-bot-system';

// Mock DB for isolated testing if needed, or use real DB connection
// For this script, we'll try to run against the real logic to see actual outputs.

async function runTestScenario(name: string, userId: string, phone: string, messages: string[]) {
  console.log(`\n\n🔹 TEST SCENARIO: ${name}`);
  console.log(`   User: ${phone} (${userId})`);
  console.log('---------------------------------------------------');

  // Clear memory for this user to start fresh
  // Accessing private map via any for testing purposes, or we just rely on new phones
  (PerfectBotSystem as any).customerMemory.delete(phone);

  for (const msg of messages) {
    console.log(`\n👤 User: "${msg}"`);
    const start = Date.now();
    try {
      const result = await PerfectBotSystem.processMessage(userId, phone, msg);
      const duration = Date.now() - start;
      console.log(`🤖 Bot (${duration}ms): \n${result.message}`);
      console.log(`   Confidence: ${result.confidence}`);
    } catch (e: any) {
      console.error(`❌ Error: ${e.message}`);
    }
  }
}

async function main() {
  console.log('🚀 STARTING DEEP BOT LOGIC VERIFICATION 🚀');
  
  // SCENARIO 1: Simple Product Search & Payment
  await runTestScenario('Venta de Curso de Piano', 'user1', '573001234567', [
    'Hola buena tarde',
    'Me interesa el curso de piano',
    'Cuanto vale?',
    'Como pago?'
  ]);

  // SCENARIO 2: Specific "Mega Pack" Search (The one that was failing)
  await runTestScenario('Búsqueda Específica: Mega Pack Idiomas', 'user2', '573009876543', [
    'buenas',
    'busco el mega pack de idiomas',
    'tienes fotos?', // The bot should handle this contextually
    'ok me interesa',
    'pago con nequi'
  ]);

  // SCENARIO 3: General Question -> Sales Pivot
  await runTestScenario('Pregunta General (Venta Cruzada)', 'user3', '573005555555', [
    'tienes local fisico?',
    'ah ok, y que vendes?',
    'me gustan las motos'
  ]);

  // SCENARIO 4: Typos and Direct Payment
  await runTestScenario('Errores de Dedo y Pago Directo', 'user4', '573001112222', [
    'vomo puedo pagar', // Typo intended
    'necestio un laptop barato'
  ]);

  console.log('\n\n✅ VERIFICATION COMPLETE');
  process.exit(0);
}

main().catch(console.error);
