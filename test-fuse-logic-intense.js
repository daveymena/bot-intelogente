
const Fuse = require('fuse.js');

// 1. EL BASE DE DATOS MOCK DE TU NEGOCIO (Realista)
const products = [
    { id: 1, name: 'Mouse Logitech G502 Hero', category: 'GAMING', description: 'El mejor mouse para shooters, sensor hero 25k.' },
    { id: 2, name: 'Teclado Mecánico Redragon Kumara', category: 'GAMING', description: 'Teclado mecánico TKL switch blue.' },
    { id: 3, name: 'Mega Pack 40: Educación', category: 'CURSOS', description: 'Incluye cursos de inglés, francés, piano, excel y cocina.' },
    { id: 4, name: 'Silla Ergonómica Ejecutiva', category: 'OFICINA', description: 'Silla premium para cuidar tu espalda en la oficina. Color negro.' },
    { id: 5, name: 'Curso de Memoria Poderosa', category: 'CURSOS', description: 'Aprende a recordar todo y estudiar mejor.' }
];

// 2. CONFIGURACIÓN DE FUSE.JS (Idéntica al bot v2)
const fuseOptions = {
    includeScore: true,
    threshold: 0.5, 
    ignoreLocation: true,
    minMatchCharLength: 3,
    keys: [
        { name: 'name', weight: 0.7 },
        { name: 'category', weight: 0.1 },
        { name: 'description', weight: 0.2 },
    ]
};

const fuse = new Fuse(products, fuseOptions);

// 3. CONSULTAS DE PRUEBA REALES
const testCases = [
    { query: "hola buenas", expected: null }, 
    { query: "quiero aprender ingles", expected: "Mega Pack 40: Educación" }, 
    { query: "busco algo para cocina", expected: "Mega Pack 40: Educación" }, 
    { query: "tienes teclado?", expected: "Teclado Mecánico Redragon Kumara" }, 
    { query: "me interesa el curso de memoria", expected: "Curso de Memoria Poderosa" }, 
    { query: "busco pino", expected: "Mega Pack 40: Educación" }, 
    { query: "mouse g502 precio", expected: "Mouse Logitech G502 Hero" }, 
    { query: "silla negra", expected: "Silla Ergonómica Ejecutiva" }, 
    { query: "curso de ingenieria civil", expected: null } 
];

console.log('🔥 TEST INTENSIVO v2 (MOTOR REFINADO) 🔥');
console.log('--------------------------------------------------');

const stopWords = [
    'curso', 'gran', 'mega', 'pack', 'aprender', 'completo', 'precio', 'costo', 'valor', 
    'quiero', 'comprar', 'necesito', 'info', 'información', 'detalles', 'hola', 'buenas', 
    'tarde', 'dias', 'noches', 'tienes', 'tiene', 'vendes', 'vende', 'busco', 'buscar', 
    'algo', 'para', 'estos', 'este', 'esta', 'estos', 'un', 'una', 'el', 'la', 'los', 'las',
    'que', 'donde', 'como', 'cual', 'cuales'
];

testCases.forEach((test, index) => {
    // Limpieza de Stopwords y normalización
    const cleanMessage = test.query.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        .replace(/[?¿!¡,.]/g, '');

    const searchTerms = cleanMessage.split(' ')
        .filter(w => !stopWords.includes(w) && w.length >= 3)
        .join(' ');
    
    console.log(`\nTEST #${index + 1}: "${test.query}"`);
    console.log(`   > Términos de búsqueda: "${searchTerms}"`);

    if (!searchTerms) {
        console.log(`   > Resultado: NADA (Salto esperado) ✅`);
        return;
    }

    const results = fuse.search(searchTerms);

    if (results.length > 0) {
        const topMatch = results[0].item.name;
        const score = results[0].score;
        const confidence = (1 - score) * 100;
        
        const isCorrect = test.expected === topMatch;
        const status = isCorrect ? '✅ CORRECTO' : '❌ ERROR';
        
        console.log(`   > Match: "${topMatch}" (${confidence.toFixed(1)}% Confianza)`);
        console.log(`   > Estado: ${status}`);
        
        if (!isCorrect && test.expected) {
            console.log(`   ⚠️  Esperaba: "${test.expected}"`);
        }
    } else {
        if (test.expected === null) {
            console.log(`   > Resultado: NADA (Correcto, no existe) ✅`);
        } else {
            console.log(`   ❌ ERROR: No encontró nada para "${test.expected}"`);
        }
    }
});
console.log('\n--------------------------------------------------');
