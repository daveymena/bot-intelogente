/**
 * Test de Búsqueda por Categoría
 * Verifica que el bot muestre LISTA de productos cuando se pregunta por categoría general
 */

import { OpenClawOrchestrator } from './src/lib/bot/openclaw-orchestrator';

const testCases = [
    {
        name: 'Búsqueda General: "Curso digitales ?"',
        message: 'Curso digitales ?',
        expectedTool: 'list_products_by_category',
        expectedParam: 'cursos digitales'
    },
    {
        name: 'Búsqueda General: "cursos digitales"',
        message: 'cursos digitales',
        expectedTool: 'list_products_by_category',
        expectedParam: 'cursos digitales'
    },
    {
        name: 'Búsqueda General: "qué cursos tienes?"',
        message: 'qué cursos tienes?',
        expectedTool: 'list_products_by_category',
        expectedParam: 'cursos'
    },
    {
        name: 'Búsqueda General: "laptops?"',
        message: 'laptops?',
        expectedTool: 'list_products_by_category',
        expectedParam: 'laptops'
    },
    {
        name: 'Búsqueda General: "megapacks"',
        message: 'megapacks',
        expectedTool: 'list_products_by_category',
        expectedParam: 'megapacks'
    },
    {
        name: 'Búsqueda Específica: "Mega Pack 11"',
        message: 'Mega Pack 11',
        expectedTool: 'get_product_with_payment',
        expectedParam: 'Mega Pack 11'
    },
    {
        name: 'Búsqueda Específica: "Laptop Asus Vivobook"',
        message: 'Laptop Asus Vivobook',
        expectedTool: 'get_product_with_payment',
        expectedParam: 'Laptop Asus Vivobook'
    }
];

async function runTests() {
    console.log('🧪 INICIANDO TESTS DE BÚSQUEDA POR CATEGORÍA\n');
    console.log('═'.repeat(80));
    
    const orchestrator = new OpenClawOrchestrator();
    let passed = 0;
    let failed = 0;

    for (const test of testCases) {
        console.log(`\n📝 Test: ${test.name}`);
        console.log(`   Mensaje: "${test.message}"`);
        
        try {
            // Simular contexto mínimo
            const mockContext = {
                userId: 'test-user',
                currentStage: 'consulta',
                products: [
                    { id: 'mega-pack-11', name: 'Mega Pack 11: Cursos Marketing Digital', category: 'Productos Digitales', price: 20000, tags: 'curso,marketing,digital' },
                    { id: 'curso-piano', name: 'Curso de Piano Avanzado', category: 'Productos Digitales', price: 15000, tags: 'curso,piano,musica' },
                    { id: 'laptop-asus', name: 'Laptop Asus Vivobook 15', category: 'Tecnología', price: 1500000, tags: 'laptop,computador,asus' },
                    { id: 'laptop-hp', name: 'Laptop HP Pavilion', category: 'Tecnología', price: 1800000, tags: 'laptop,computador,hp' }
                ]
            };

            // Llamar al método _think (privado, pero lo probamos directamente)
            const result = await (orchestrator as any)._think(
                test.message,
                [],
                'Tienda de tecnología y cursos digitales',
                'Categorías: Productos Digitales, Tecnología',
                'Mega Pack 11, Curso de Piano, Laptop Asus Vivobook, Laptop HP Pavilion',
                mockContext
            );

            console.log(`   Resultado: toolToUse = "${result.toolToUse}"`);
            console.log(`   Razonamiento: ${result.reasoning}`);

            // Verificar resultado
            if (result.toolToUse === test.expectedTool) {
                console.log(`   ✅ PASS: Herramienta correcta`);
                passed++;
            } else {
                console.log(`   ❌ FAIL: Esperaba "${test.expectedTool}", obtuvo "${result.toolToUse}"`);
                failed++;
            }

        } catch (error: any) {
            console.log(`   ❌ ERROR: ${error.message}`);
            failed++;
        }
    }

    console.log('\n' + '═'.repeat(80));
    console.log(`\n📊 RESULTADOS FINALES:`);
    console.log(`   ✅ Pasados: ${passed}/${testCases.length}`);
    console.log(`   ❌ Fallados: ${failed}/${testCases.length}`);
    console.log(`   📈 Tasa de éxito: ${Math.round((passed / testCases.length) * 100)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 ¡TODOS LOS TESTS PASARON! El sistema de búsqueda por categoría funciona correctamente.');
    } else {
        console.log('\n⚠️ Algunos tests fallaron. Revisa la lógica de detección en _think().');
    }
}

// Ejecutar tests
runTests().catch(console.error);
