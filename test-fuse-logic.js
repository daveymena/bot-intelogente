
const Fuse = require('fuse.js');

// 1. MOCK DE TUS PRODUCTOS (Simulación de DB)
const products = [
    { id: 1, name: 'Mouse Logitech G502', category: 'GAMING', description: 'El mejor mouse para shooters.' },
    { id: 2, name: 'Teclado Mecánico Kumara', category: 'GAMING', description: 'Teclado redragon calidad precio.' },
    { id: 3, name: 'Mega Pack 40: Educación', category: 'CURSOS', description: 'Incluye cursos de inglés, piano, cocina y excel.' },
    { id: 4, name: 'Silla Ergonómica', category: 'OFICINA', description: 'Para cuidar tu espalda.' },
    { id: 5, name: 'Curso de Memoria', category: 'CURSOS', description: 'Aprende a recordar todo.' }
];

// 2. CONFIGURACIÓN EXACTA DEL BOT
const fuseOptions = {
    includeScore: true,
    threshold: 0.4, // Estricto pero justo
    keys: [
        { name: 'name', weight: 0.5 },
        { name: 'category', weight: 0.2 },
        { name: 'description', weight: 0.2 },
    ]
};

const fuse = new Fuse(products, fuseOptions);

// 3. CASOS DE PRUEBA INTENSOS
const queries = [
    { q: "quiero un teclado", expected: "Teclado Mecánico Kumara" },
    { q: "curso de ingles", expected: "Mega Pack 40: Educación" }, // Debe encontrarlo en descripción
    { q: "pino", expected: "Mega Pack 40: Educación" }, // Typo de Piano -> Debe encontrarlo
    { q: "silla", expected: "Silla Ergonómica" },
    { q: "mouse g502", expected: "Mouse Logitech G502" },
    { q: "algo de cocina", expected: "Mega Pack 40: Educación" }, // En descripción
    { q: "ingeniería", expected: null } // NO existe -> Debe ser NULL
];

console.log('🔥 INICIANDO TEST DE INTELIGENCIA DE BÚSQUEDA (Fuse.js) 🔥\n');

queries.forEach(test => {
    // Simular limpieza de stopwords
    const stopWords = ['curso', 'gran', 'mega', 'pack', 'aprender', 'completo', 'precio', 'costo', 'valor', 'quiero', 'comprar', 'necesito', 'info', 'información', 'detalles', 'hola', 'buenas', 'tarde'];
    const searchTerms = test.q.toLowerCase().split(' ').filter(w => !stopWords.includes(w) && w.length > 3).join(' ');
    
    console.log(`🔎 Query Usuario: "${test.q}" -> Término limpio: "${searchTerms}"`);
    
    if (!searchTerms) {
         console.log(`   ⚠️ Skipped (Término muy corto/stopword)\n`);
         return;
    }

    const results = fuse.search(searchTerms);
    
    if (results.length > 0) {
        const topMatch = results[0].item.name;
        const score = results[0].score;
        const isCorrect = test.expected === topMatch;
        const icon = isCorrect ? '✅' : '❌';
        
        console.log(`   🎯 Resultado: ${topMatch} (Score: ${score.toFixed(4)}) ${icon}`);
        if (!isCorrect && test.expected) console.log(`      ⚠️ Esperaba: ${test.expected}`);
    } else {
        if (test.expected === null) {
            console.log(`   ✅ Correcto: No encontró nada (como se esperaba).`);
        } else {
            console.log(`   ❌ ERROR: No encontró "${test.expected}".`);
        }
    }
    console.log('---------------------------------------------------');
});
