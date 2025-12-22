/**
 * 🧪 TEST: Verificar detección ESPECÍFICA vs GENERAL
 * 
 * Este test simula cómo el sistema detecta si una búsqueda es específica o general
 */

const testCases = [
    {
        query: 'curso de piano',
        esperado: 'ESPECÍFICA',
        razon: 'Frase "curso de X" indica producto específico'
    },
    {
        query: 'Estoy interesado en el curso de piano',
        esperado: 'ESPECÍFICA',
        razon: 'Frase "interesado en" + producto específico'
    },
    {
        query: 'quiero el curso de piano',
        esperado: 'ESPECÍFICA',
        razon: 'Frase "quiero el/la" + producto específico'
    },
    {
        query: 'laptop asus',
        esperado: 'ESPECÍFICA',
        razon: 'Marca específica (asus)'
    },
    {
        query: 'megapack 17',
        esperado: 'ESPECÍFICA',
        razon: 'Número específico de megapack'
    },
    {
        query: 'moto pulsar',
        esperado: 'ESPECÍFICA',
        razon: 'Marca específica (pulsar)'
    },
    {
        query: 'qué cursos tienes',
        esperado: 'GENERAL',
        razon: 'Pregunta general sobre categoría'
    },
    {
        query: 'tienes laptops',
        esperado: 'GENERAL',
        razon: 'Pregunta general sobre categoría'
    },
    {
        query: 'cursos',
        esperado: 'GENERAL',
        razon: 'Solo categoría, sin especificar'
    }
];

console.log('🧪 TEST: Detección ESPECÍFICA vs GENERAL\n');
console.log('='.repeat(80));

// Patrones de frases específicas (copiados del código real)
const specificPhrases = [
    /curso\s+de\s+\w+/i,           // "curso de piano", "curso de inglés"
    /megapack\s+de\s+\w+/i,        // "megapack de diseño"
    /megapack\s+\d+/i,             // "megapack 17"
    /pack\s+\d+/i,                 // "pack 21"
    /laptop\s+\w+/i,               // "laptop asus"
    /moto\s+\w+/i,                 // "moto pulsar"
    /interesado\s+en/i,            // "interesado en el curso"
    /quiero\s+(el|la|un|una)\s+\w+/i  // "quiero el curso de piano"
];

// Términos específicos (copiados del código real)
const specificTerms = [
    'asus', 'hp', 'lenovo', 'dell', 'acer', 'macbook',
    'bajaj', 'pulsar', 'yamaha', 'honda',
    'i3', 'i5', 'i7', 'ryzen', 'core',
    'piano', 'guitarra', 'bateria', 'violin',
    'ingles', 'frances', 'aleman',
    'diseño', 'photoshop', 'illustrator'
];

testCases.forEach((test, index) => {
    console.log(`\n${index + 1}. Test: "${test.query}"`);
    console.log(`   Esperado: ${test.esperado}`);
    console.log(`   Razón: ${test.razon}`);
    
    const queryLower = test.query.toLowerCase();
    
    // Verificar frases específicas
    const hasSpecificPhrase = specificPhrases.some(pattern => pattern.test(queryLower));
    
    // Verificar términos específicos
    const hasSpecificTerms = specificTerms.some(term => queryLower.includes(term));
    
    // Determinar resultado
    let resultado = 'GENERAL';
    let motivo = 'No tiene frases ni términos específicos';
    
    if (hasSpecificPhrase) {
        resultado = 'ESPECÍFICA';
        motivo = 'Tiene frase específica detectada';
    } else if (hasSpecificTerms) {
        resultado = 'ESPECÍFICA';
        motivo = 'Tiene término específico detectado';
    }
    
    // Comparar con esperado
    const correcto = resultado === test.esperado;
    const emoji = correcto ? '✅' : '❌';
    
    console.log(`   ${emoji} Resultado: ${resultado}`);
    console.log(`   Motivo: ${motivo}`);
    
    if (!correcto) {
        console.log(`   ⚠️ ERROR: Se esperaba ${test.esperado} pero se obtuvo ${resultado}`);
    }
});

console.log('\n' + '='.repeat(80));
console.log('\n📊 RESUMEN:');
console.log('Si todos los tests pasan ✅, la detección funciona correctamente');
console.log('Si hay errores ❌, necesitamos ajustar los patrones de detección');
