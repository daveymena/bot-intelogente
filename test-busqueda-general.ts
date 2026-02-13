/**
 * Test para verificar que el bot detecta correctamente búsquedas generales
 * y muestra LISTA de productos en lugar de un solo producto
 */

import { OpenClawOrchestrator } from './src/lib/bot/openclaw-orchestrator';

const testCases = [
    {
        message: "Curso digitales ?",
        expected: "list_products_by_category",
        description: "Pregunta por cursos digitales (categoría general)"
    },
    {
        message: "cursos digitales?",
        expected: "list_products_by_category",
        description: "Pregunta por cursos digitales sin espacio"
    },
    {
        message: "cursos?",
        expected: "list_products_by_category",
        description: "Pregunta simple por cursos"
    },
    {
        message: "qué cursos tienes?",
        expected: "list_products_by_category",
        description: "Pregunta qué cursos hay disponibles"
    },
    {
        message: "megapacks?",
        expected: "list_products_by_category",
        description: "Pregunta por megapacks"
    },
    {
        message: "laptops?",
        expected: "list_products_by_category",
        description: "Pregunta por laptops"
    },
    {
        message: "Mega Pack 11",
        expected: "get_product_with_payment",
        description: "Pregunta por producto específico (si existe en catálogo)"
    }
];

async function runTests() {
    console.log('🧪 INICIANDO TESTS DE BÚSQUEDA GENERAL\n');
    console.log('=' .repeat(60));
    
    const orchestrator = new OpenClawOrchestrator();
    
    // Mock context con productos de ejemplo
    const mockContext = {
        userId: 'test-user',
        currentStage: 'saludo',
        products: [
            {
                id: 'mega-pack-11',
                name: 'Mega Pack 11: Cursos Marketing Digital',
                price: 20000,
                category: 'DIGITAL',
                tipo_producto: 'digital',
                tags: 'cursos, marketing, digital, megapack',
                description: 'SEO, SEM, Google Ads y estrategias de redes sociales'
            },
            {
                id: 'mega-pack-12',
                name: 'Mega Pack 12: Cursos Programación',
                price: 25000,
                category: 'DIGITAL',
                tipo_producto: 'digital',
                tags: 'cursos, programacion, desarrollo, megapack',
                description: 'Python, JavaScript, React y más'
            },
            {
                id: 'curso-piano',
                name: 'Curso de Piano Avanzado',
                price: 30000,
                category: 'DIGITAL',
                tipo_producto: 'digital',
                tags: 'curso, musica, piano',
                description: 'Aprende piano desde cero hasta nivel avanzado'
            },
            {
                id: 'laptop-asus',
                name: 'Laptop Asus Vivobook 15',
                price: 1500000,
                category: 'TECNOLOGIA',
                tipo_producto: 'fisico',
                tags: 'laptop, computador, asus',
                description: 'Intel Core i5, 8GB RAM, 256GB SSD'
            }
        ]
    };

    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
        try {
            console.log(`\n📝 Test: ${testCase.description}`);
            console.log(`   Mensaje: "${testCase.message}"`);
            console.log(`   Esperado: ${testCase.expected}`);
            
            const result = await orchestrator.processMessage(
                testCase.message,
                'test-user-phone',
                mockContext
            );

            // Verificar el resultado
            let actualTool = 'unknown';
            if (result.toolData && result.toolData.products && Array.isArray(result.toolData.products)) {
                actualTool = 'list_products_by_category';
                console.log(`   ✅ Resultado: LISTA con ${result.toolData.products.length} productos`);
                console.log(`   Productos: ${result.toolData.products.map((p: any) => p.name).join(', ')}`);
            } else if (result.toolData && result.toolData.id) {
                actualTool = 'get_product_with_payment';
                console.log(`   ❌ Resultado: UN SOLO producto (${result.toolData.name})`);
            } else {
                actualTool = 'none';
                console.log(`   ⚠️  Resultado: Sin tool ejecutado`);
            }

            if (actualTool === testCase.expected) {
                console.log(`   ✅ PASS`);
                passed++;
            } else {
                console.log(`   ❌ FAIL - Se esperaba ${testCase.expected} pero se obtuvo ${actualTool}`);
                failed++;
            }

            // Mostrar respuesta del bot
            console.log(`   Respuesta: ${result.text.substring(0, 150)}...`);

        } catch (error: any) {
            console.log(`   ❌ ERROR: ${error.message}`);
            failed++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 RESULTADOS FINALES:`);
    console.log(`   ✅ Pasados: ${passed}/${testCases.length}`);
    console.log(`   ❌ Fallidos: ${failed}/${testCases.length}`);
    console.log(`   📈 Tasa de éxito: ${Math.round((passed / testCases.length) * 100)}%`);
    
    if (failed === 0) {
        console.log(`\n🎉 ¡TODOS LOS TESTS PASARON! El bot ahora detecta correctamente búsquedas generales.`);
    } else {
        console.log(`\n⚠️  Algunos tests fallaron. Revisar la lógica de detección.`);
    }
}

// Ejecutar tests
runTests().catch(console.error);
