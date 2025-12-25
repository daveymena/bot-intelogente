import { SimpleConversationHandler } from './simple-conversation-handler';
import dotenv from 'dotenv';
dotenv.config();

async function testSimpleHandlerIsolation() {
  console.log('🧪 Iniciando test de aislamiento para SimpleConversationHandler...');

  const handler = SimpleConversationHandler.getInstance();
  const userIdA = 'store_alpha';
  const userIdB = 'store_beta';
  const customerPhone = '573009998877'; // MISMO CLIENTE escribiendo a dos tiendas

  // 1. Simular mensaje a Tienda A
  console.log('💬 Cliente escribe a Tienda A...');
  await handler.handleMessage({
    chatId: customerPhone,
    userId: userIdA,
    message: 'Hola, me interesa el curso de Excel'
  });

  // 2. Simular mensaje a Tienda B
  console.log('💬 Mismo cliente escribe a Tienda B...');
  await handler.handleMessage({
    chatId: customerPhone,
    userId: userIdB,
    message: 'Hola, busco una laptop gamer'
  });

  // 3. Verificar historiales (Acceso privado a través de 'as any')
  const historyA = (SimpleConversationHandler as any).conversationHistory.get(`${userIdA}:${customerPhone}`);
  const historyB = (SimpleConversationHandler as any).conversationHistory.get(`${userIdB}:${customerPhone}`);

  console.log(`📜 Historial Tienda A: ${historyA?.length} mensajes`);
  console.log(`📜 Historial Tienda B: ${historyB?.length} mensajes`);

  if (historyA?.length === 2 && historyB?.length === 2 && historyA !== historyB) {
    console.log('✅ EXITO: Los historiales están perfectamente aislados por Tienda+Cliente');
    
    const contextProductA = (SimpleConversationHandler as any).currentProduct.get(`${userIdA}:${customerPhone}`);
    const contextProductB = (SimpleConversationHandler as any).currentProduct.get(`${userIdB}:${customerPhone}`);
    
    console.log(`📦 Producto A: ${contextProductA?.name || 'NINGUNO'}`);
    console.log(`📦 Producto B: ${contextProductB?.name || 'NINGUNO'}`);
    
    if (contextProductA?.id !== contextProductB?.id) {
       console.log('✅ EXITO: El producto en contexto también está aislado');
    } else if (contextProductA === undefined && contextProductB === undefined) {
       console.log('⚠️ NOTA: Ambos productos son undefined (pero aislados por clave)');
    } else {
       console.error('❌ ERROR: Productos en contexto compartidos');
    }
  } else {
    console.error('❌ ERROR: Los historiales se mezclaron o no se guardaron');
  }

  console.log('🚀 Test completado');
}

testSimpleHandlerIsolation().catch(console.error);
