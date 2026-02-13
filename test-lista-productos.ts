/**
 * Script de prueba para verificar que el bot muestra LISTA de productos
 * cuando el cliente pregunta por categoría general (ej: "Curso digitales?")
 */

import { OpenClawOrchestrator } from './src/lib/bot/openclaw-orchestrator';

async function testListaProductos() {
    console.log('🧪 TEST: Bot mostrando lista de productos\n');
    console.log('═'.repeat(60));

    const orchestrator = new OpenClawOrchestrator();

    // Contexto de prueba simulado
    const mockContext = {
        userId: 'test-user-123',
        currentStage: 'saludo',
        products: [
            {
                id: 'mega-pack-11',
                name: 'Mega Pack 11: Cursos Marketing Digital',
                price: '20.000 COP',
                category: 'DIGITAL',
                description: 'SEO, SEM, Google Ads y estrategias de redes sociales',
                tags: 'cursos,digital,marketing',
                images: []
            },
            {
                id: 'curso-piano',
                name: 'Curso de Piano Avanzado',
                price: '35.000 COP',
                category: 'DIGITAL',
                description: 'Aprende piano desde cero hasta nivel avanzado',
                tags: 'cursos,digital,musica,piano',
                images: []
            },
            {
                id: 'curso-programacion',
                name: 'Curso de Programación Web',
                price: '45.000 COP',
                category: 'DIGITAL',
                description: 'HTML, CSS, JavaScript y React desde cero',
                tags: 'cursos,digital,programacion,web',
                images: []
            },
            {
                id: 'laptop-asus',
                name: 'Laptop Asus Vivobook 15',
                price: '1.500.000 COP',
                category: 'TECNOLOGIA',
                description: 'Intel Core i5, 8GB RAM, 256GB SSD',
                tags: 'laptop,computador,tecnologia',
                images: []
            }
        ]
    };

    // Casos de prueba
    const testCases = [
        {
            name: 'Búsqueda general: "Curso digitales ?"',
            message: 'Curso digitales ?',
            expectedTool: 'list_products_by_category',
            expectedSearchTerm: 'cursos digitales'
        },
        {
            name: 'Búsqueda general: "cursos digitales?"',
            message: 'cursos digitales?',
            expectedTool: 'list_products_by_category',
            expectedSearchTerm: 'cursos digitales'
        },
        {
            name: 'Búsqueda general: "cursos?"',
            message: 'cursos?',
            expectedTool: 'list_products_by_category',
            expectedSearchTerm: 'cursos'
        },
        {
            name: 'Búsqueda general: "qué cursos tienes?"',
            message: 'qué cursos tienes?',
            expectedTool: 'list_products_by_category',
            expectedSearchTerm: 'cursos'
        },
        {
            name: 'Búsqueda general: "laptops?"',
            message: 'laptops?',
            expectedTool: 'list_products_by_category',
            expectedSearchTerm: 'laptops'
        },
        {
            name: 'Búsqueda específica: "Mega Pack 11"',
            message: 'Mega Pack 11',
            expectedTool: 'get_product_with_payment',
            expectedProductId: 'Mega Pack 11'
        },
        {
            name: 'Búsqueda específica: "Laptop Asus Vivobook"',
            message: 'Laptop Asus Vivobook',
            expectedTool: 'get_product_with_payment',
            expectedProductId: 'Laptop Asus Vivobook'
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
        console.log(`\n📝 ${testCase.name}`);
        console.log(`   Mensaje: "${testCase.message}"`);

        try {
            const result = await orchestrator.processMessage(
                testCase.message,
                '573042748709',
                mockContext
            );

            console.log(`   ✅ Respuesta generada exitosamente`);
            console.log(`   📊 Tool usado: ${result.toolUsed || 'ninguno'}`);

            // Verificar herramienta correcta
            if (testCase.expectedTool) {
                if (result.toolUsed === testCase.expectedTool) {
                    console.log(`   ✅ Tool correcto: ${testCase.expectedTool}`);
                    passed++;
                } else {
                    console.log(`   ❌ Tool incorrecto. Esperado: ${testCase.expectedTool}, Obtenido: ${result.toolUsed}`);
                    failed++;
                }
            }

            // Mostrar preview de respuesta
            if (result.text) {
                const preview = result.text.substring(0, 150);
                console.log(`   💬 Preview: ${preview}...`);
            }

        } catch (error: any) {
            console.log(`   ❌ Error: ${error.message}`);
            failed++;
        }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`\n📊 RESULTADOS:`);
    console.log(`   ✅ Pasados: ${passed}`);
    console.log(`   ❌ Fallidos: ${failed}`);
    console.log(`   📈 Total: ${testCases.length}`);
    console.log(`   🎯 Tasa de éxito: ${Math.round((passed / testCases.length) * 100)}%`);

    if (failed === 0) {
        console.log('\n🎉 ¡TODOS LOS TESTS PASARON! El bot ahora muestra listas correctamente.');
    } else {
        console.log('\n⚠️ Algunos tests fallaron. Revisar la lógica de decisión en _think()');
    }
}

// Ejecutar tests
testListaProductos().catch(console.error);
