/**
 * Test para verificar que el bot muestra LISTA de productos
 * cuando el usuario pregunta por categorías generales
 */

import dotenv from 'dotenv';
dotenv.config();

// Mock de productos de prueba
const mockProducts = [
    {
        id: 'curso-piano-1',
        name: 'Mega Pack 11: Cursos Marketing Digital',
        price: 50000,
        description: 'Pack completo de cursos de marketing digital',
        tipo_producto: 'digital',
        category: 'DIGITAL',
        tags: 'cursos,digital,marketing',
        images: []
    },
    {
        id: 'curso-guitarra-1',
        name: 'Mega Pack 15: Cursos de Música',
        price: 45000,
        description: 'Aprende guitarra, piano y más',
        tipo_producto: 'digital',
        category: 'DIGITAL',
        tags: 'cursos,digital,musica',
        images: []
    },
    {
        id: 'curso-ingles-1',
        name: 'Mega Pack 20: Cursos de Idiomas',
        price: 60000,
        description: 'Inglés, francés, alemán y más',
        tipo_producto: 'digital',
        category: 'DIGITAL',
        tags: 'cursos,digital,idiomas',
        images: []
    }
];

async function testListProducts() {
    console.log('🧪 TEST: Bot debe mostrar LISTA cuando usuario pregunta por categoría general\n');
    
    const testCases = [
        {
            message: 'Cursos digitales?',
            expected: 'list_products_by_category',
            description: 'Pregunta general por cursos digitales'
        },
        {
            message: 'cursos?',
            expected: 'list_products_by_category',
            description: 'Pregunta muy general por cursos'
        },
        {
            message: 'qué cursos tienes',
            expected: 'list_products_by_category',
            description: 'Pregunta sobre opciones de cursos'
        },
        {
            message: 'muéstrame laptops',
            expected: 'list_products_by_category',
            description: 'Solicitud de ver laptops'
        },
        {
            message: 'Mega Pack 11',
            expected: 'get_product_with_payment',
            description: 'Nombre específico de producto'
        }
    ];

    try {
        const { OpenClawOrchestrator } = await import('./src/lib/bot/openclaw-orchestrator');
        const orchestrator = new OpenClawOrchestrator();

        let passed = 0;
        let failed = 0;

        for (const testCase of testCases) {
            console.log(`\n📝 Test: ${testCase.description}`);
            console.log(`   Mensaje: "${testCase.message}"`);
            console.log(`   Esperado: ${testCase.expected}`);

            const context = {
                userId: 'test-user',
                products: mockProducts,
                currentStage: 'saludo'
            };

            try {
                // Simular el método _think
                const history: any[] = [];
                const brainContext = 'Tienda de productos digitales y tecnología';
                const categoryMap = 'Categorías: Digital, Tecnología';
                
                // Generar catalogHints como lo hace el código real
                const generalKeywords = ['cursos', 'digitales', 'laptops', 'computadores', 'megapacks', 'motos', 'productos', 'opciones', 'tienes', 'muéstrame', 'qué', 'cuáles', 'busco', 'necesito'];
                const specificIndicators = ['mega pack', 'megapack', 'laptop asus', 'moto auteco', 'curso de', 'pack de'];
                const msgLower = testCase.message.toLowerCase();
                
                const hasGeneralKeyword = generalKeywords.some(kw => msgLower.includes(kw));
                const hasSpecificIndicator = specificIndicators.some(ind => msgLower.includes(ind));
                const isShortQuery = msgLower.split(' ').length <= 5;
                
                const isGeneralSearch = hasGeneralKeyword && !hasSpecificIndicator && isShortQuery;
                
                console.log(`   Análisis:`);
                console.log(`   - Tiene palabra clave general: ${hasGeneralKeyword}`);
                console.log(`   - Tiene indicador específico: ${hasSpecificIndicator}`);
                console.log(`   - Es consulta corta (≤5 palabras): ${isShortQuery}`);
                console.log(`   - Es búsqueda general: ${isGeneralSearch}`);

                const Fuse = (await import('fuse.js')).default;
                const fuse = new Fuse(mockProducts, { threshold: 0.6, keys: ['name', 'tags', 'description', 'category'] });
                const hints = fuse.search(testCase.message).slice(0, 8);
                
                let catalogHints = 'No hay coincidencias.';
                if (hints.length > 0) {
                    if (isGeneralSearch) {
                        const categoryCount: any = {};
                        hints.forEach(h => {
                            const cat = h.item.tipo_producto || h.item.category || 'Sin categoría';
                            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
                        });
                        const categoryInfo = Object.entries(categoryCount)
                            .map(([cat, count]) => `${cat} (${count} productos)`)
                            .join(', ');
                        catalogHints = `🔍 BÚSQUEDA GENERAL DETECTADA\n📦 Categorías disponibles: ${categoryInfo}\n⚠️ IMPORTANTE: Usar 'list_products_by_category' para mostrar LISTA de opciones`;
                    } else {
                        catalogHints = `🎯 PRODUCTOS ESPECÍFICOS ENCONTRADOS:\n` + 
                            hints.map(h => `• ID: ${h.item.id} | NOMBRE: ${h.item.name} | TIPO: ${h.item.tipo_producto || 'N/A'}`).join('\n');
                    }
                }

                console.log(`   Catalog Hints generados:`);
                console.log(`   ${catalogHints.split('\n').join('\n   ')}`);

                // Llamar al método _think real
                const analysis = await (orchestrator as any)._think(
                    testCase.message,
                    history,
                    brainContext,
                    categoryMap,
                    catalogHints,
                    context
                );

                console.log(`   Resultado: ${analysis.toolToUse || 'null'}`);
                console.log(`   Razonamiento: ${analysis.reasoning}`);

                if (analysis.toolToUse === testCase.expected) {
                    console.log(`   ✅ PASÓ`);
                    passed++;
                } else {
                    console.log(`   ❌ FALLÓ - Esperaba ${testCase.expected}, obtuvo ${analysis.toolToUse}`);
                    failed++;
                }

            } catch (error: any) {
                console.log(`   ❌ ERROR: ${error.message}`);
                failed++;
            }
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`📊 RESULTADOS:`);
        console.log(`   ✅ Pasados: ${passed}/${testCases.length}`);
        console.log(`   ❌ Fallados: ${failed}/${testCases.length}`);
        console.log(`   📈 Tasa de éxito: ${((passed / testCases.length) * 100).toFixed(1)}%`);
        console.log(`${'='.repeat(60)}\n`);

        if (failed === 0) {
            console.log('🎉 ¡TODOS LOS TESTS PASARON! El bot ahora muestra listas correctamente.');
        } else {
            console.log('⚠️  Algunos tests fallaron. Revisar la lógica de selección de herramientas.');
        }

    } catch (error: any) {
        console.error('❌ Error ejecutando tests:', error.message);
        console.error(error.stack);
    }
}

// Ejecutar tests
testListProducts().catch(console.error);
