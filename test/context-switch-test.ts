
import { DeepReasoningAgent } from '../src/agents/deep-reasoning-agent';
import { SharedMemoryService } from '../src/agents/shared-memory';

async function testContextSwitch() {
    console.log('🧪 INICIANDO TEST DE CAMBIO DE CONTEXTO');
    
    const chatId = 'test-chat-123';
    const userId = 'test-user-123';
    const memoryService = SharedMemoryService.getInstance();
    const memory = memoryService.get(chatId, userId);

    // 1. Simular contexto inicial: Hablando de Laptops
    console.log('\n--- Paso 1: Contexto Inicial (Laptop) ---');
    memory.currentProduct = { id: 'laptop-1', name: 'Laptop Gamer HP', price: 5000000, category: 'portátiles' };
    console.log('Contexto establecido:', memory.currentProduct.name);

    // 2. Simular mensaje de usuario cambiando de tema
    const userMessage = "Oye y qué tal son las motos boxer?";
    console.log(`\nUsuario dice: "${userMessage}"`);

    // 3. Ejecutar DeepReasoning
    const result = await DeepReasoningAgent.analyzeContext(chatId, userMessage, memory);

    // 4. Verificar resultados
    console.log('\n--- Resultados del Análisis ---');
    console.log(`Producto Detectado: ${result.currentProduct?.name}`);
    console.log(`Agente Sugerido: ${result.suggestedAgent}`);
    console.log(`Intención: ${result.userIntent.primary}`);

    if (result.currentProduct?.name.includes('Boxer') && result.suggestedAgent === 'product') {
        console.log('\n✅ TEST PASSED: El sistema detectó el cambio de producto y sugirió el agente correcto.');
    } else {
        console.log('\n❌ TEST FAILED: El sistema no cambió el contexto correctamente.');
    }
}

testContextSwitch().catch(console.error);
