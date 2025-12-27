
import { SalesAgentSimple } from '../src/lib/sales-agent-simple';
import { db } from '../src/lib/db';

async function main() {
  console.log('🔄 Iniciando prueba de SalesAgentSimple...');

  try {
    const agent = new SalesAgentSimple();
    await agent.loadProducts();

    const userPhone = '573001234567';
    
    // Test 1: Saludo
    console.log('\n💬 Test 1: "Hola"');
    const response1 = await agent.processMessage('Hola', userPhone);
    console.log('🤖 Bot:', response1.text);

    // Test 2: Curso de Piano (Problema reportado)
    console.log('\n💬 Test 2: "Me interesa el curso de piano"');
    const response2 = await agent.processMessage('Me interesa el curso de piano', userPhone);
    console.log('🤖 Bot:', response2.text);

    // Test 3: Realiza test
    console.log('\n💬 Test 3: "Realiza test"');
    const response3 = await agent.processMessage('Realiza test', userPhone);
    console.log('🤖 Bot:', response3.text);

  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    // Cerrar conexión DB si es necesario, aunque en script de prueba suele colgarse si no se cierra
    // await db.$disconnect(); 
    process.exit(0); 
  }
}

main();
