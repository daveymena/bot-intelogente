/**
 * TEST: Verificar que el bot detecta preguntas sobre métodos de pago
 * 
 * PROBLEMA: Usuario pregunta "Metodo de pago cual es?" y el bot responde
 * con información genérica del producto en lugar de usar get_payment_info
 * 
 * SOLUCIÓN: Mejorar la detección de palabras clave relacionadas con pagos
 * en el prompt de análisis de intención
 */

import { OpenClawOrchestrator } from './src/lib/bot/openclaw-orchestrator';

async function testMetodosPago() {
    console.log('🧪 TEST: Detección de preguntas sobre métodos de pago\n');
    
    const orchestrator = new (OpenClawOrchestrator as any)();
    
    const testCases = [
        {
            name: 'Pregunta directa sobre método de pago',
            message: 'Metodo de pago cual es?',
            expectedTool: 'get_payment_info'
        },
        {
            name: 'Pregunta sobre formas de pago',
            message: 'formas de pago?',
            expectedTool: 'get_payment_info'
        },
        {
            name: 'Pregunta sobre cómo pagar',
            message: 'cómo puedo pagar?',
            expectedTool: 'get_payment_info'
        },
        {
            name: 'Pregunta sobre cuenta bancaria',
            message: 'cuál es la cuenta?',
            expectedTool: 'get_payment_info'
        },
        {
            name: 'Pregunta sobre Nequi',
            message: 'dame el nequi',
            expectedTool: 'get_payment_info'
        },
        {
            name: 'Pregunta sobre cómo comprar',
            message: 'cómo compro?',
            expectedTool: 'get_payment_info'
        },
        {
            name: 'Pregunta con contexto de producto',
            message: 'me interesa, cómo pago?',
            expectedTool: 'get_payment_info'
        }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const testCase of testCases) {
        try {
            console.log(`\n📝 Test: ${testCase.name}`);
            console.log(`   Mensaje: "${testCase.message}"`);
            
            // Simular análisis de intención
            const history: any[] = [];
            const context = {
                userId: 'test-user',
                activeProduct: {
                    name: 'Mega Pack Curso de Piano Completo',
                    price: 60000
                }
            };
            
            const analysis = await orchestrator._think(
                testCase.message,
                history,
                'Contexto de negocio',
                'Mapa de categorías',
                'Hints del catálogo',
                context
            );
            
            console.log(`   Herramienta detectada: ${analysis.toolToUse}`);
            console.log(`   Razonamiento: ${analysis.reasoning}`);
            
            if (analysis.toolToUse === testCase.expectedTool) {
                console.log(`   ✅ CORRECTO - Detectó ${testCase.expectedTool}`);
                passed++;
            } else {
                console.log(`   ❌ ERROR - Esperaba ${testCase.expectedTool}, obtuvo ${analysis.toolToUse}`);
                failed++;
            }
            
        } catch (error: any) {
            console.log(`   ❌ ERROR: ${error.message}`);
            failed++;
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 RESULTADOS: ${passed}/${testCases.length} tests pasados`);
    console.log(`   ✅ Exitosos: ${passed}`);
    console.log(`   ❌ Fallidos: ${failed}`);
    console.log('='.repeat(60));
    
    if (failed === 0) {
        console.log('\n🎉 ¡TODOS LOS TESTS PASARON! El bot ahora detecta correctamente preguntas sobre pagos.');
    } else {
        console.log('\n⚠️ Algunos tests fallaron. Revisar la lógica de detección.');
    }
}

// Ejecutar tests
testMetodosPago().catch(console.error);
