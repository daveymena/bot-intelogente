/**
 * Test específico para el caso "Me interesa un teclado"
 */

import { ConversationStrategyService } from './src/lib/bot/conversation-strategy';

// Mock de productos
const mockProducts = [
    {
        id: 'teclado-mecanico-1',
        name: 'Teclado Mecánico RGB Gamer',
        category: 'Tecnología',
        tags: 'teclado, gaming, rgb, mecánico',
        price: 150000
    },
    {
        id: 'curso-piano-1',
        name: 'Mega Pack Curso de Piano Completo',
        category: 'Cursos',
        tags: 'piano, música, curso, teclado musical',
        description: 'Aprende piano desde cero. Incluye técnicas de teclado musical.',
        price: 60000
    }
];

console.log('🧪 TEST: "Me interesa un teclado"\n');

const message = 'Me interesa un teclado';
const strategy = ConversationStrategyService.determineStrategy(
    message,
    mockProducts,
    []
);

console.log('📝 Mensaje:', message);
console.log('🎯 Estrategia:', strategy);
console.log('');

// Validación
if (strategy.shouldAskQuestions) {
    console.log('✅ CORRECTO: Detectó producto variable y hará preguntas de calificación');
    console.log('   Preguntas:', strategy.suggestedQuestions);
} else if (strategy.toolToUse === 'list_products_by_category') {
    console.log('⚠️  ACEPTABLE: Mostrará lista de teclados (pero debería preguntar primero)');
} else if (strategy.toolToUse === 'get_product_with_payment') {
    console.log('❌ ERROR: Detectó producto específico cuando debería preguntar');
} else {
    console.log('❌ ERROR: Estrategia inesperada');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 ANÁLISIS DEL PROBLEMA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('El usuario dice: "Me interesa un teclado"');
console.log('');
console.log('Productos en catálogo:');
console.log('1. Teclado Mecánico RGB Gamer (dispositivo)');
console.log('2. Mega Pack Curso de Piano (tiene "teclado musical" en tags)');
console.log('');
console.log('Comportamiento esperado:');
console.log('1. Detectar "teclado" como producto VARIABLE');
console.log('2. Hacer preguntas: ¿Para qué lo necesitas? ¿Gaming, trabajo, etc?');
console.log('3. Después mostrar opciones filtradas');
console.log('');
console.log('Problema actual:');
console.log('- El fuzzy search puede coincidir "teclado" con "Curso de Piano"');
console.log('- Porque el curso tiene "teclado musical" en descripción/tags');
console.log('');
console.log('Solución:');
console.log('- La estrategia YA detecta "teclado" como variable ✅');
console.log('- El problema está en el fuzzy search de list_products_by_category');
console.log('- Necesita filtrar mejor por contexto (tecnología vs música)');
