
import { openClawOrchestrator } from '../src/lib/bot/openclaw-orchestrator';
import dotenv from 'dotenv';

dotenv.config();

async function runIntelligenceTests() {
    console.log('🧪 Iniciando Tests de Inteligencia de OpenClaw (David Business Bot)');
    console.log('-------------------------------------------------------------------');

    const testCases = [
        {
            name: 'Saludo y consulta general de productos',
            message: 'Hola, ¿qué productos tienes?',
            expected_behavior: 'Debe saludar (David) y ofrecer categorías.'
        },
        {
            name: 'Consulta específica de un producto real',
            message: 'Me interesa el Mega Pack 11',
            expected_behavior: 'Debe mostrar la CARD profesional del Mega Pack 11.'
        },
        {
            name: 'Pregunta por ubicación (Evitar invención)',
            message: '¿Están en Bogotá?',
            expected_behavior: 'Debe decir CC El Diamante 2 en Cali.'
        },
        {
            name: 'Consulta de métodos de pago',
            message: '¿Cuáles son los métodos de pago?',
            expected_behavior: 'Debe mostrar Nequi, BBVA y links.'
        }
    ];

    // Mock de productos para evitar dependencia total de la DB local en el test
    const mockProducts = [
        {
            id: 'prod-001',
            name: 'Mega Pack 11 Premium',
            price: 150000,
            description: 'El mejor pack de herramientas industriales para profesionales.',
            category: 'DIGITAL',
            tipo_producto: 'curso',
            images: ['https://example.com/megapack.png'],
            tags: 'megapack, herramientas, premium'
        },
        {
            id: 'prod-002',
            name: 'Laptop Asus Vivobook 15',
            price: 2500000,
            description: 'Potente portátil para trabajo y diseño.',
            category: 'TECHNOLOGY',
            tipo_producto: 'físico',
            images: ['https://example.com/laptop.png'],
            tags: 'laptop, asus, vivobook, tecnología'
        }
    ];

    const testUserId = "test-user-id";

    for (const test of testCases) {
        console.log(`\n▶️ Test: ${test.name}`);
        console.log(`💬 User: "${test.message}"`);
        
        try {
            const context = {
                userId: testUserId,
                products: mockProducts,
                currentStage: 'saludo'
            };

            const startTime = Date.now();
            const response = await openClawOrchestrator.processMessage(test.message, "573000000000", context);
            const duration = Date.now() - startTime;

            console.log(`🤖 David (${duration}ms):`);
            console.log(response.text);
            
            if (response.media) {
                console.log(`📸 Media detectable: ${response.media.length} imágenes`);
            }
            
            console.log(`📍 Siguiente Estado: ${response.nextStage}`);
            
        } catch (error: any) {
            console.error(`❌ Error en el test: ${error.message}`);
        }
    }

    console.log('\n-------------------------------------------------------------------');
    console.log('✅ Tests finalizados.');
    process.exit(0);
}

runIntelligenceTests();
