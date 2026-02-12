
import { OpenClawOrchestrator } from './src/lib/bot/openclaw-orchestrator';
import { ProfessionalResponseFormatter } from './src/lib/professional-response-formatter';

// MOCK DE DEPENDENCIAS PARA QUE CORRA EN AISLAMIENTO
const mockContext = {
    userId: 'test-user-simulation',
    products: [
        { id: 1, name: 'Mega Pack 40: Educación', price: 20000, category: 'CURSOS', description: 'Increíble pack con cursos de inglés, francés, piano y cocina.' },
        { id: 2, name: 'Mouse Gamer G502', price: 150000, category: 'TECNOLOGIA', description: 'Mouse gamer de alta precisión.' }
    ],
    business: {
        name: 'TecnoVariedades D&S',
        phone: '123456789'
    }
};

async function simulateConversation() {
    console.log('🏁 INICIANDO SIMULACIÓN DE COMPRA (MODO CLIENTE REAL)...');
    
    // Instancia del Orquestador (Mockeada simplificada si es necesario, pero intentaremos usar la real si no hay conflictos de DB)
    // Nota: Al correr esto con ts-node, usará la lógica real de Fuse.js y Prompting.
    
    // Simulamos historial vacío
    const history = [];
    const orchestrator = new OpenClawOrchestrator(); 
    // Forzamos inyección de historial en memoria para el test
    orchestrator.conversationHistory.set('test-user-phone', history);

    const steps = [
        "Hola, buenas tardes",
        "Quiero aprender inglés, tienen algo?",
        "Me interesa, ¿cuánto vale?",
        "Listo, me lo llevo"
    ];

    for (const msg of steps) {
        console.log(`\n👤 CLIENTE: "${msg}"`);
        console.log('Thinking...');
        
        // 1. Procesar mensaje con la lógica REAL (Fuse.js + Prompt)
        // Nota: Pasamos el context mockeado para no depender de la DB real en este script
        const response = await orchestrator.processMessage(msg, 'test-user-phone', mockContext);
        
        // 2. Aplicar Formateador (lo que hace Baileys antes de enviar)
        const cleanResponse = ProfessionalResponseFormatter.cleanOldFormat(response.text);

        console.log(`🤖 BOT (OpenClaw):`);
        console.log('--------------------------------------------------');
        console.log(cleanResponse);
        console.log('--------------------------------------------------');
        
        // Simular que el usuario lee (pausa técnica en log)
        await new Promise(r => setTimeout(r, 1000));
    }
}

// Ejecutar
simulateConversation().catch(console.error);
