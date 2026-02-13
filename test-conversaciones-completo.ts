/**
 * Test Profundo de Conversaciones
 * Cubre TODOS los casos edge y variaciones de mensajes del cliente
 */

import { openClawOrchestrator } from './src/lib/bot/openclaw-orchestrator';

// Casos de prueba exhaustivos
const testCases = [
    // ═══════════════════════════════════════════════════════════
    // CATEGORÍA 1: BÚSQUEDAS GENERALES (debe mostrar LISTA)
    // ═══════════════════════════════════════════════════════════
    {
        category: 'Búsqueda General - Cursos',
        cases: [
            { msg: 'Curso digitales ?', expected: 'list_products_by_category' },
            { msg: 'cursos digitales', expected: 'list_products_by_category' },
            { msg: 'cursos', expected: 'list_products_by_category' },
            { msg: 'qué cursos tienes?', expected: 'list_products_by_category' },
            { msg: 'muéstrame cursos', expected: 'list_products_by_category' },
            { msg: 'tienes cursos?', expected: 'list_products_by_category' },
            { msg: 'cursos disponibles', expected: 'list_products_by_category' },
            { msg: 'opciones de cursos', expected: 'list_products_by_category' },
        ]
    },
    {
        category: 'Búsqueda General - Laptops',
        cases: [
            { msg: 'laptops?', expected: 'qualification_questions' }, // Variable: debe preguntar
            { msg: 'computadores?', expected: 'qualification_questions' },
            { msg: 'busco laptop', expected: 'qualification_questions' },
            { msg: 'necesito un computador', expected: 'qualification_questions' },
            { msg: 'qué laptops tienes?', expected: 'qualification_questions' },
        ]
    },
    {
        category: 'Búsqueda General - Megapacks',
        cases: [
            { msg: 'megapacks?', expected: 'list_products_by_category' },
            { msg: 'mega packs', expected: 'list_products_by_category' },
            { msg: 'qué megapacks tienes?', expected: 'list_products_by_category' },
            { msg: 'productos digitales?', expected: 'list_products_by_category' },
        ]
    },

    // ═══════════════════════════════════════════════════════════
    // CATEGORÍA 2: RECHAZO Y ALTERNATIVAS (debe mostrar LISTA)
    // ═══════════════════════════════════════════════════════════
    {
        category: 'Rechazo y Alternativas',
        cases: [
            { msg: 'Pero me interesan otros cursos', expected: 'list_products_by_category' },
            { msg: 'otros cursos', expected: 'list_products_by_category' },
            { msg: 'otro curso', expected: 'list_products_by_category' },
            { msg: 'no me interesa ese, otros?', expected: 'list_products_by_category' },
            { msg: 'qué más tienes?', expected: 'list_products_by_category' },
            { msg: 'más opciones', expected: 'list_products_by_category' },
            { msg: 'algo diferente', expected: 'list_products_by_category' },
            { msg: 'prefiero otro', expected: 'list_products_by_category' },
            { msg: 'no me gusta, otros?', expected: 'list_products_by_category' },
            { msg: 'pero otros laptops', expected: 'qualification_questions' },
            { msg: 'otras laptops', expected: 'qualification_questions' },
        ]
    },

    // ═══════════════════════════════════════════════════════════
    // CATEGORÍA 3: BÚSQUEDAS ESPECÍFICAS (debe mostrar PRODUCTO)
    // ═══════════════════════════════════════════════════════════
    {
        category: 'Búsqueda Específica - Nombres Completos',
        cases: [
            { msg: 'Mega Pack 11', expected: 'get_product_with_payment' },
            { msg: 'el Mega Pack 11', expected: 'get_product_with_payment' },
            { msg: 'megapack 11', expected: 'get_product_with_payment' },
            { msg: 'Laptop Asus Vivobook', expected: 'get_product_with_payment' },
            { msg: 'la Asus Vivobook', expected: 'get_product_with_payment' },
            { msg: 'Curso de Piano', expected: 'get_product_with_payment' },
        ]
    },
    {
        category: 'Búsqueda Específica - Preguntas sobre Producto',
        cases: [
            { msg: '¿Qué tal es el Mega Pack 11?', expected: 'get_product_with_payment' },
            { msg: 'Cuánto cuesta el Mega Pack 11?', expected: 'get_product_with_payment' },
            { msg: 'Info del Mega Pack 11', expected: 'get_product_with_payment' },
            { msg: 'Detalles de la Asus Vivobook', expected: 'get_product_with_payment' },
        ]
    },

    // ═══════════════════════════════════════════════════════════
    // CATEGORÍA 4: RESPUESTAS A PREGUNTAS DEL BOT
    // ═══════════════════════════════════════════════════════════
    {
        category: 'Respuestas a Calificación',
        cases: [
            { msg: 'para trabajo', expected: 'list_products_by_category' },
            { msg: 'gaming', expected: 'list_products_by_category' },
            { msg: 'diseño gráfico', expected: 'list_products_by_category' },
            { msg: 'presupuesto 2 millones', expected: 'list_products_by_category' },
            { msg: 'entre 1 y 2 millones', expected: 'list_products_by_category' },
        ]
    },

    // ═══════════════════════════════════════════════════════════
    // CATEGORÍA 5: INTENCIÓN DE COMPRA
    // ═══════════════════════════════════════════════════════════
    {
        category: 'Intención de Compra',
        cases: [
            { msg: 'lo quiero', expected: 'get_payment_info' },
            { msg: 'me interesa', expected: 'get_payment_info' },
            { msg: 'cómo pago?', expected: 'get_payment_info' },
            { msg: 'métodos de pago', expected: 'get_payment_info' },
            { msg: 'dale', expected: 'get_payment_info' },
            { msg: 'sí', expected: 'get_payment_info' },
            { msg: 'comprar', expected: 'get_payment_info' },
        ]
    },

    // ═══════════════════════════════════════════════════════════
    // CATEGORÍA 6: SALUDOS Y DESPEDIDAS
    // ═══════════════════════════════════════════════════════════
    {
        category: 'Saludos y Despedidas',
        cases: [
            { msg: 'hola', expected: 'no_tool' },
            { msg: 'buenos días', expected: 'no_tool' },
            { msg: 'buenas tardes', expected: 'no_tool' },
            { msg: 'gracias', expected: 'no_tool' },
            { msg: 'adiós', expected: 'no_tool' },
            { msg: 'hasta luego', expected: 'no_tool' },
        ]
    },

    // ═══════════════════════════════════════════════════════════
    // CATEGORÍA 7: CASOS AMBIGUOS (edge cases)
    // ═══════════════════════════════════════════════════════════
    {
        category: 'Casos Ambiguos',
        cases: [
            { msg: 'curso', expected: 'list_products_by_category' }, // Singular
            { msg: 'laptop', expected: 'qualification_questions' }, // Singular variable
            { msg: 'pack', expected: 'list_products_by_category' },
            { msg: 'digital', expected: 'list_products_by_category' },
            { msg: 'qué vendes?', expected: 'list_products_by_category' },
            { msg: 'qué tienes?', expected: 'list_products_by_category' },
            { msg: 'opciones', expected: 'list_products_by_category' },
        ]
    },

    // ═══════════════════════════════════════════════════════════
    // CATEGORÍA 8: TYPOS Y VARIACIONES
    // ═══════════════════════════════════════════════════════════
    {
        category: 'Typos y Variaciones',
        cases: [
            { msg: 'cursos digitales?', expected: 'list_products_by_category' },
            { msg: 'CURSOS DIGITALES', expected: 'list_products_by_category' },
            { msg: 'CuRsOs DiGiTaLeS', expected: 'list_products_by_category' },
            { msg: 'cursos digitales ???', expected: 'list_products_by_category' },
            { msg: '  cursos digitales  ', expected: 'list_products_by_category' },
        ]
    },
];

async function runComprehensiveTest() {
    console.log('🧪 TEST PROFUNDO DE CONVERSACIONES');
    console.log('═'.repeat(80));
    console.log('Probando TODOS los casos edge y variaciones de mensajes\n');

    const orchestrator = openClawOrchestrator;
    let totalTests = 0;
    let passed = 0;
    let failed = 0;
    const failures: any[] = [];

    // Mock context
    const mockContext = {
        userId: 'test-user',
        currentStage: 'consulta',
        products: [
            { id: 'mega-pack-11', name: 'Mega Pack 11: Cursos Marketing Digital', category: 'Productos Digitales', price: 20000, tags: 'curso,marketing,digital', tipo_producto: 'digital' },
            { id: 'curso-piano', name: 'Curso de Piano Avanzado', category: 'Productos Digitales', price: 15000, tags: 'curso,piano,musica', tipo_producto: 'digital' },
            { id: 'laptop-asus', name: 'Laptop Asus Vivobook 15', category: 'Tecnología', price: 1500000, tags: 'laptop,computador,asus', tipo_producto: 'variable' },
            { id: 'laptop-hp', name: 'Laptop HP Pavilion', category: 'Tecnología', price: 1800000, tags: 'laptop,computador,hp', tipo_producto: 'variable' }
        ]
    };

    for (const testGroup of testCases) {
        console.log(`\n📂 ${testGroup.category}`);
        console.log('─'.repeat(80));

        for (const test of testGroup.cases) {
            totalTests++;
            const testNum = totalTests.toString().padStart(3, '0');
            
            try {
                const result = await (orchestrator as any)._think(
                    test.msg,
                    [],
                    'Tienda de tecnología y cursos digitales',
                    'Categorías: Productos Digitales, Tecnología',
                    'Mega Pack 11, Curso de Piano, Laptop Asus Vivobook, Laptop HP Pavilion',
                    mockContext
                );

                let actualBehavior = 'unknown';
                
                if (result.suggestedResponse) {
                    actualBehavior = 'qualification_questions';
                } else if (result.toolToUse === 'list_products_by_category') {
                    actualBehavior = 'list_products_by_category';
                } else if (result.toolToUse === 'get_product_with_payment') {
                    actualBehavior = 'get_product_with_payment';
                } else if (result.toolToUse === 'get_payment_info') {
                    actualBehavior = 'get_payment_info';
                } else if (result.toolToUse === null) {
                    actualBehavior = 'no_tool';
                }

                const success = actualBehavior === test.expected;

                if (success) {
                    console.log(`   ${testNum}. ✅ "${test.msg}" → ${actualBehavior}`);
                    passed++;
                } else {
                    console.log(`   ${testNum}. ❌ "${test.msg}"`);
                    console.log(`        Esperado: ${test.expected}`);
                    console.log(`        Obtenido: ${actualBehavior}`);
                    console.log(`        Razonamiento: ${result.reasoning}`);
                    failed++;
                    failures.push({
                        category: testGroup.category,
                        message: test.msg,
                        expected: test.expected,
                        actual: actualBehavior,
                        reasoning: result.reasoning
                    });
                }

            } catch (error: any) {
                console.log(`   ${testNum}. ❌ ERROR: "${test.msg}" - ${error.message}`);
                failed++;
                failures.push({
                    category: testGroup.category,
                    message: test.msg,
                    expected: test.expected,
                    actual: 'ERROR',
                    error: error.message
                });
            }
        }
    }

    // Resumen final
    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 RESUMEN FINAL');
    console.log('─'.repeat(80));
    console.log(`Total de tests: ${totalTests}`);
    console.log(`✅ Pasados: ${passed} (${Math.round((passed / totalTests) * 100)}%)`);
    console.log(`❌ Fallados: ${failed} (${Math.round((failed / totalTests) * 100)}%)`);

    if (failures.length > 0) {
        console.log('\n⚠️ CASOS FALLIDOS:');
        console.log('─'.repeat(80));
        failures.forEach((f, i) => {
            console.log(`\n${i + 1}. [${f.category}] "${f.message}"`);
            console.log(`   Esperado: ${f.expected}`);
            console.log(`   Obtenido: ${f.actual}`);
            if (f.reasoning) console.log(`   Razón: ${f.reasoning}`);
            if (f.error) console.log(`   Error: ${f.error}`);
        });
    }

    console.log('\n' + '═'.repeat(80));
    
    if (failed === 0) {
        console.log('\n🎉 ¡PERFECTO! Todos los tests pasaron.');
        console.log('El bot maneja correctamente TODAS las variaciones de mensajes.');
    } else {
        console.log('\n⚠️ Hay casos que necesitan ajustes.');
        console.log('Revisa los casos fallidos arriba para mejorar la lógica.');
    }

    return {
        total: totalTests,
        passed,
        failed,
        successRate: Math.round((passed / totalTests) * 100),
        failures
    };
}

// Ejecutar tests
runComprehensiveTest()
    .then(results => {
        console.log('\n✅ Test completado');
        process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
        console.error('\n❌ Error en test:', error);
        process.exit(1);
    });
