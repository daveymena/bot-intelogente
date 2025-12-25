import { getSalesAgent } from './sales-agent-simple';
import dotenv from 'dotenv';
dotenv.config();

async function testSaaS() {
  console.log('🧪 Iniciando test de aislamiento SaaS...');

  // 1. Obtener dos agentes para diferentes usuarios
  const agent1 = getSalesAgent('user_a');
  const agent2 = getSalesAgent('user_b');

  if (agent1 === agent2) {
    console.error('❌ ERROR: Los agentes son la misma instancia');
    return;
  }
  console.log('✅ Agentes instanciados correctamente como diferentes objetos');

  // 2. Simular carga de productos (esto es asíncrono en la vida real)
  await agent1.loadProducts();
  await agent2.loadProducts();

  console.log(`📦 Agente A tiene ${agent1['products'].length} productos`);
  console.log(`📦 Agente B tiene ${agent2['products'].length} productos`);

  // 3. Simular mensajes concurrentes
  const phone1 = '573001112233';
  const phone2 = '573004445566';

  console.log('💬 Enviando mensajes iniciales...');
  const res1 = await agent1.processMessage('Hola', phone1);
  const res2 = await agent2.processMessage('Hola', phone2);

  const ctx1 = agent1.getContext(phone1);
  const ctx2 = agent2.getContext(phone2);

  if (ctx1 && ctx2 && ctx1 !== ctx2) {
    console.log('✅ Contextos de conversación aislados correctamente');
  } else {
    console.error('❌ ERROR: Los contextos de conversación podrían estar filtrándose');
  }

  console.log('🚀 Test completado');
}

testSaaS().catch(console.error);
