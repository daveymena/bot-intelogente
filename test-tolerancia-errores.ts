/**
 * 🧪 TEST: Tolerancia a errores de escritura y variaciones
 * 
 * Prueba que el bot entienda:
 * - Errores ortográficos
 * - Variaciones de nombres
 * - Espacios extras
 * - Sinónimos
 */

import { intelligentProductSearch } from './src/lib/intelligent-product-search';

const testCases = [
    // Errores ortográficos
    {
        name: 'Error ortográfico: "curzo de piyano"',
        message: 'curzo de piyano',
        expected: 'Curso Completo de Piano'
    },
    {
        name: 'Error ortográfico: "mega pack"',
        message: 'mega pack',
        expected: 'Megapack'
    },
    {
        name: 'Error ortográfico: "mega packs"',
        message: 'mega packs',
        expected: 'Megapack'
    },
    {
        name: 'Error ortográfico: "idiosma"',
        message: 'idiosma',
        expected: 'Megapack de Idiomas'
    },
    {
        name: 'Error ortográfico: "portatil"',
        message: 'portatil',
        expected: 'Portátil'
    },
    
    // Variaciones de nombres
    {
        name: 'Variación: "idioma" (debe encontrar megapack de idiomas)',
        message: 'idioma',
        expected: 'Megapack de Idiomas'
    },
    {
        name: 'Variación: "idiomas" (debe encontrar megapack de idiomas)',
        message: 'idiomas',
        expected: 'Megapack de Idiomas'
    },
    {
        name: 'Variación: "curso piano" (debe encontrar curso, no megapack)',
        message: 'curso piano',
        expected: 'Curso Completo de Piano'
    },
    
    // Sinónimos
    {
        name: 'Sinónimo: "laptop"',
        message: 'laptop',
        expected: 'Portátil'
    },
    {
        name: 'Sinónimo: "compu"',
        message: 'compu',
        expected: 'Computador'
    },
    {
        name: 'Sinónimo: "motico"',
        message: 'motico',
        expected: 'Moto'
    },
    
    // Consultas con contexto
    {
        name: 'Contexto: "algo para aprender idiomas"',
        message: 'algo para aprender idiomas',
        expected: 'Megapack de Idiomas'
    },
    {
        name: 'Contexto: "quiero aprender ingles"',
        message: 'quiero aprender ingles',
        expected: 'Idiomas'
    },
    {
        name: 'Contexto: "necesito un portatil para trabajar"',
        message: 'necesito un portatil para trabajar',
        expected: 'Portátil'
    }
];

async function runTests() {
    console.log('🧪 INICIANDO TESTS DE TOLERANCIA A ERRORES\n');
    console.log('='.repeat(60));
    
    let passed = 0;
    let failed = 0;
    
    for (const testCase of testCases) {
        console.log(`\n📝 Test: ${testCase.name}`);
        console.log(`   Mensaje: "${testCase.message}"`);
        console.log(`   Esperado: ${testCase.expected}`);
        
        try {
            const result = await intelligentProductSearch({
                userMessage: testCase.message,
                previousProducts: [],
                conversationHistory: []
            });
            
            if (result) {
                if (result.product) {
                    const productName = result.product.name;
                    const matches = productName.toLowerCase().includes(testCase.expected.toLowerCase());
                    
                    if (matches) {
                        console.log(`   ✅ PASÓ: Encontró "${productName}"`);
                        console.log(`   📊 Confianza: ${result.confidence}%`);
                        console.log(`   💡 Razón: ${result.reason}`);
                        passed++;
                    } else {
                        console.log(`   ❌ FALLÓ: Encontró "${productName}" (esperaba "${testCase.expected}")`);
                        failed++;
                    }
                } else if (result.products && result.products.length > 0) {
                    const productNames = result.products.map(p => p.name).join(', ');
                    const matches = result.products.some(p => 
                        p.name.toLowerCase().includes(testCase.expected.toLowerCase())
                    );
                    
                    if (matches) {
                        console.log(`   ✅ PASÓ: Encontró productos que incluyen "${testCase.expected}"`);
                        console.log(`   📦 Productos: ${productNames}`);
                        passed++;
                    } else {
                        console.log(`   ❌ FALLÓ: Encontró "${productNames}" (esperaba "${testCase.expected}")`);
                        failed++;
                    }
                } else {
                    console.log(`   ❌ FALLÓ: No se encontró producto`);
                    failed++;
                }
            } else {
                console.log(`   ❌ FALLÓ: No se encontró resultado`);
                failed++;
            }
        } catch (error: any) {
            console.log(`   ❌ ERROR: ${error.message}`);
            failed++;
        }
        
        // Esperar un poco entre tests para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 RESULTADOS FINALES:`);
    console.log(`   ✅ Pasaron: ${passed}/${testCases.length}`);
    console.log(`   ❌ Fallaron: ${failed}/${testCases.length}`);
    console.log(`   📈 Tasa de éxito: ${((passed / testCases.length) * 100).toFixed(1)}%`);
    
    if (passed === testCases.length) {
        console.log('\n🎉 ¡TODOS LOS TESTS PASARON!');
    } else if (passed >= testCases.length * 0.8) {
        console.log('\n✅ La mayoría de tests pasaron (>80%)');
    } else {
        console.log('\n⚠️ Varios tests fallaron, revisar sistema');
    }
}

// Ejecutar tests
runTests().catch(console.error);
