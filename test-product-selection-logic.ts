/**
 * Test: Lógica de Selección de Productos
 * Prueba la pre-validación para detectar búsquedas generales vs específicas
 */

// Simular catálogo de productos
const catalogHints = `
- Mega Pack 11: Cursos Marketing Digital
- Mega Pack 5: Diseño Gráfico Profesional
- Laptop Asus Vivobook 15
- Laptop HP Pavilion Gaming
- Moto Auteco Victory 110
- Curso de Piano Avanzado
- Impresora HP LaserJet Pro
`.trim();

// Función de pre-validación (copiada de la solución)
function detectGeneralQuery(message: string, catalogHints: string): boolean {
    const messageLower = message.toLowerCase().trim();
    
    const isGeneralQuery = (
        messageLower.endsWith('?') && 
        !catalogHints.toLowerCase().includes(messageLower.replace('?', '').trim())
    ) || (
        ['cursos', 'curso', 'laptops', 'laptop', 'computadores', 'computador', 
         'megapacks', 'megapack', 'motos', 'moto', 'productos', 'qué tienes', 
         'muéstrame', 'busco', 'necesito'].some(keyword => messageLower.includes(keyword)) &&
        !catalogHints.toLowerCase().split('\n').some(hint => 
            messageLower.includes(hint.toLowerCase().trim())
        )
    );
    
    return isGeneralQuery;
}

// Casos de prueba
const testCases = [
    // BÚSQUEDAS GENERALES (deben retornar true)
    { message: "Curso digitales ?", expected: true, description: "Pregunta general con signo de interrogación" },
    { message: "cursos digitales?", expected: true, description: "Pregunta general sin espacio antes de ?" },
    { message: "cursos?", expected: true, description: "Pregunta muy general" },
    { message: "qué cursos tienes?", expected: true, description: "Pregunta con 'qué tienes'" },
    { message: "laptops?", expected: true, description: "Categoría laptops" },
    { message: "computadores?", expected: true, description: "Categoría computadores" },
    { message: "megapacks?", expected: true, description: "Categoría megapacks" },
    { message: "busco laptop", expected: true, description: "Búsqueda con 'busco'" },
    { message: "necesito un curso", expected: true, description: "Búsqueda con 'necesito'" },
    { message: "tienes motos?", expected: true, description: "Pregunta con 'tienes'" },
    { message: "productos digitales?", expected: true, description: "Categoría productos digitales" },
    { message: "muéstrame opciones de laptops", expected: true, description: "Con 'muéstrame'" },
    
    // BÚSQUEDAS ESPECÍFICAS (deben retornar false)
    { message: "Mega Pack 11", expected: false, description: "Nombre exacto del catálogo" },
    { message: "Laptop Asus Vivobook 15", expected: false, description: "Nombre exacto de laptop" },
    { message: "Moto Auteco Victory 110", expected: false, description: "Nombre exacto de moto" },
    { message: "¿Qué tal es el Mega Pack 11?", expected: false, description: "Pregunta sobre producto específico" },
    { message: "Cuánto cuesta la Asus Vivobook?", expected: false, description: "Precio de producto específico" },
    { message: "el Mega Pack 11", expected: false, description: "Producto específico con artículo" },
    { message: "Curso de Piano Avanzado", expected: false, description: "Nombre exacto de curso" },
    
    // CASOS AMBIGUOS
    { message: "hola", expected: false, description: "Saludo simple" },
    { message: "gracias", expected: false, description: "Despedida" },
    { message: "cómo pago?", expected: false, description: "Pregunta sobre pago" },
];

console.log('🧪 TEST: Lógica de Selección de Productos\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
    const result = detectGeneralQuery(test.message, catalogHints);
    const isCorrect = result === test.expected;
    
    if (isCorrect) {
        passed++;
        console.log(`✅ Test ${index + 1}: PASS`);
    } else {
        failed++;
        console.log(`❌ Test ${index + 1}: FAIL`);
    }
    
    console.log(`   Mensaje: "${test.message}"`);
    console.log(`   Descripción: ${test.description}`);
    console.log(`   Esperado: ${test.expected ? 'GENERAL' : 'ESPECÍFICA'}`);
    console.log(`   Obtenido: ${result ? 'GENERAL' : 'ESPECÍFICA'}`);
    console.log(`   Herramienta: ${result ? 'list_products_by_category' : 'get_product_with_payment o null'}`);
    console.log('');
});

console.log('='.repeat(80));
console.log(`\n📊 RESULTADOS:`);
console.log(`   ✅ Pasados: ${passed}/${testCases.length}`);
console.log(`   ❌ Fallidos: ${failed}/${testCases.length}`);
console.log(`   📈 Tasa de éxito: ${Math.round((passed / testCases.length) * 100)}%`);

if (failed === 0) {
    console.log(`\n🎉 ¡TODOS LOS TESTS PASARON! La lógica funciona correctamente.`);
} else {
    console.log(`\n⚠️  Algunos tests fallaron. Revisar la lógica de detección.`);
}
