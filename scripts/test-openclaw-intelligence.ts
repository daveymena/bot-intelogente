
import { openClawOrchestrator } from '../src/lib/bot/openclaw-orchestrator';
import dotenv from 'dotenv';

dotenv.config();

async function runIntelligenceTests() {
    console.log('🧪 Iniciando Tests de Inteligencia de OpenClaw (David Business Bot)');
    console.log('-------------------------------------------------------------------');

    const testCases = [
        {
            name: 'Saludo amistoso (Cómo estás)',
            message: 'Hola David, ¿cómo estás hoy?',
            expected_behavior: 'Debe responder amablemente como David, sin ser silente.'
        },
        {
            name: 'Consulta de métodos de pago directo',
            message: '¿Cuál es la forma de pago?',
            expected_behavior: 'Debe mostrar Nequi, BBVA y links.'
        },
        {
            name: 'Consulta ambigua (Busco algo para trabajar)',
            message: 'Busco algo para trabajar',
            expected_behavior: 'Debe usar analyze_intent y preguntar qué tipo de trabajo.'
        },
        {
            name: 'Producto específico',
            message: 'Me interesa el Mega Pack 11',
            expected_behavior: 'Debe mostrar la CARD del Mega Pack 11.'
        }
    ];

    // Mock de productos
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
            console.log(response.text || '!!! RESPUESTA VACÍA !!!');
            
            if (response.media) {
                console.log(`📸 Media detectable: ${response.media.length} imágenes`);
            }
            
            console.log(`📍 Siguiente Estado: ${response.nextStage}`);
            
            if (!response.text) {
                console.error('❌ ERROR: La respuesta es nula o vacía.');
            }
            
        } catch (error: any) {
            console.error(`❌ Error en el test: ${error.message}`);
        }
    }

    console.log('\n-------------------------------------------------------------------');
    console.log('✅ Tests finalizados.');
    process.exit(0);
}

runIntelligenceTests();
