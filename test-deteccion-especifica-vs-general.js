/**
 * 🧪 TEST: Detección de búsqueda ESPECÍFICA vs GENERAL
 */

const { ProductIntelligenceService } = require('./src/lib/product-intelligence-service')

const tests = [
    // ESPECÍFICAS (deben devolver false)
    { query: 'curso de piano', esperado: false, tipo: 'ESPECÍFICA' },
    { query: 'Estoy interesado en el curso de piano', esperado: false, tipo: 'ESPECÍFICA' },
    { query: 'quiero el curso de piano', esperado: false, tipo: 'ESPECÍFICA' },
    { query: 'laptop asus', esperado: false, tipo: 'ESPECÍFICA' },
    { query: 'moto pulsar', esperado: false, tipo: 'ESPECÍFICA' },
    { query: 'megapack 17', esperado: false, tipo: 'ESPECÍFICA' },
    { query: 'megapack de diseño', esperado: false, tipo: 'ESPECÍFICA' },
    { query: 'curso de inglés', esperado: false, tipo: 'ESPECÍFICA' },
    
    // GENERALES (deben devolver true)
    { query: 'qué cursos tienes', esperado: true, tipo: 'GENERAL' },
    { query: 'muéstrame laptops', esperado: true, tipo: 'GENERAL' },
    { query: 'tienes motos', esperado: true, tipo: 'GENERAL' },
    { query: 'cursos disponibles', esperado: true, tipo: 'GENERAL' },
    { query: 'megapacks', esperado: true, tipo: 'GENERAL' }
]

console.log('🧪 TEST: Detección ESPECÍFICA vs GENERAL\n')
console.log('='.repeat(80))

let correctos = 0
let incorrectos = 0

tests.forEach((test, i) => {
    const keywords = test.query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    const resultado = ProductIntelligenceService.isGeneralProductQuery(test.query, keywords)
    const esGeneral = resultado
    const correcto = esGeneral === test.esperado
    
    if (correcto) correctos++
    else incorrectos++
    
    const emoji = correcto ? '✅' : '❌'
    const resultadoTexto = esGeneral ? 'GENERAL' : 'ESPECÍFICA'
    
    console.log(`\n${emoji} Test ${i + 1}: "${test.query}"`)
    console.log(`   Esperado: ${test.tipo}`)
    console.log(`   Resultado: ${resultadoTexto}`)
    if (!correcto) {
        console.log(`   ⚠️ ERROR: Debería ser ${test.tipo}`)
    }
})

console.log('\n' + '='.repeat(80))
console.log(`\n📊 RESULTADOS:`)
console.log(`   ✅ Correctos: ${correctos}/${tests.length}`)
console.log(`   ❌ Incorrectos: ${incorrectos}/${tests.length}`)
console.log(`   📈 Precisión: ${((correctos / tests.length) * 100).toFixed(1)}%`)

if (incorrectos === 0) {
    console.log(`\n🎉 ¡PERFECTO! Todos los tests pasaron`)
} else {
    console.log(`\n⚠️ Hay ${incorrectos} tests fallando`)
}
