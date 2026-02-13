/**
 * Test: Fix Lista de Productos vs Producto Específico
 * 
 * Valida que el bot muestre LISTA cuando la búsqueda es GENERAL
 * y muestre PRODUCTO ESPECÍFICO solo cuando se menciona nombre completo
 */

import { ConversationStrategyService } from './src/lib/bot/conversation-strategy';

// Mock de productos
const mockProducts = [
    { id: '1', name: 'Laptop Asus Vivobook 15', price: 1500000, category: 'TECNOLOGIA' },
    { id: '2', name: 'Laptop HP Pavilion 14', price: 1800000, category: 'TECNOLOGIA' },
    { id: '3', name: 'Laptop Lenovo IdeaPad 3', price: 1200000, category: 'TECNOLOGIA' },
    { id: '4', name: 'Mouse Logitech M185', price: 35000, category: 'TECNOLOGIA' },
    { id: '5', name: 'Mouse Genius DX-110', price: 25000, category: 'TECNOLOGIA' },
    { id: '6', name: 'Moto Auteco Victory 125', price: 5500000, category: 'MOTOS' },
    { id: '7', name: 'Moto Yamaha FZ 150', price: 8900000, category: 'MOTOS' },
];

console.log('🧪 TEST: Fix Lista de Productos vs Producto Específico\n');
console.log('═'.repeat(60));

// Test 1: Búsqueda GENERAL de laptop → Debe mostrar LISTA
console.log('\n📋 Test 1: "busco un laptop" → Debe mostrar LISTA');
const test1 = ConversationStrategyService.determineStrategy(
    'busco un laptop',
    mockProducts,
    []
);
console.log(`Herramienta: ${test1.toolToUse}`);
console.log(`Hacer preguntas: ${test1.shouldAskQuestions}`);
console.log(`Razonamiento: ${test1.reasoning}`);
const test1Pass = test1.toolToUse === 'list_products_by_category' && !test1.shouldAskQuestions;
console.log(test1Pass ? '✅ PASS' : '❌ FAIL');

// Test 2: Búsqueda GENERAL de mouse → Debe mostrar LISTA
console.log('\n📋 Test 2: "necesito un mouse" → Debe mostrar LISTA');
const test2 = ConversationStrategyService.determineStrategy(
    'necesito un mouse',
    mockProducts,
    []
);
console.log(`Herramienta: ${test2.toolToUse}`);
console.log(`Hacer preguntas: ${test2.shouldAskQuestions}`);
console.log(`Razonamiento: ${test2.reasoning}`);
const test2Pass = test2.toolToUse === 'list_products_by_category' && !test2.shouldAskQuestions;
console.log(test2Pass ? '✅ PASS' : '❌ FAIL');

// Test 3: Búsqueda GENERAL de moto → Debe mostrar LISTA
console.log('\n📋 Test 3: "quiero una moto" → Debe mostrar LISTA');
const test3 = ConversationStrategyService.determineStrategy(
    'quiero una moto',
    mockProducts,
    []
);
console.log(`Herramienta: ${test3.toolToUse}`);
console.log(`Hacer preguntas: ${test3.shouldAskQuestions}`);
console.log(`Razonamiento: ${test3.reasoning}`);
const test3Pass = test3.toolToUse === 'list_products_by_category' && !test3.shouldAskQuestions;
console.log(test3Pass ? '✅ PASS' : '❌ FAIL');

// Test 4: Búsqueda ESPECÍFICA → Debe mostrar PRODUCTO ESPECÍFICO
console.log('\n🎯 Test 4: "Laptop Asus Vivobook 15" → Debe mostrar PRODUCTO ESPECÍFICO');
const test4 = ConversationStrategyService.determineStrategy(
    'Laptop Asus Vivobook 15',
    mockProducts,
    []
);
console.log(`Herramienta: ${test4.toolToUse}`);
console.log(`Hacer preguntas: ${test4.shouldAskQuestions}`);
console.log(`Razonamiento: ${test4.reasoning}`);
const test4Pass = test4.toolToUse === 'get_product_with_payment' && !test4.shouldAskQuestions;
console.log(test4Pass ? '✅ PASS' : '❌ FAIL');

// Test 5: Búsqueda ESPECÍFICA con nombre parcial → Debe mostrar PRODUCTO ESPECÍFICO
console.log('\n🎯 Test 5: "Mouse Logitech M185" → Debe mostrar PRODUCTO ESPECÍFICO');
const test5 = ConversationStrategyService.determineStrategy(
    'Mouse Logitech M185',
    mockProducts,
    []
);
console.log(`Herramienta: ${test5.toolToUse}`);
console.log(`Hacer preguntas: ${test5.shouldAskQuestions}`);
console.log(`Razonamiento: ${test5.reasoning}`);
const test5Pass = test5.toolToUse === 'get_product_with_payment' && !test5.shouldAskQuestions;
console.log(test5Pass ? '✅ PASS' : '❌ FAIL');

// Test 6: Búsqueda GENERAL con "opciones" → Debe mostrar LISTA (sin preguntas)
console.log('\n📋 Test 6: "qué opciones de laptop tienes" → Debe mostrar LISTA');
const test6 = ConversationStrategyService.determineStrategy(
    'qué opciones de laptop tienes',
    mockProducts,
    []
);
console.log(`Herramienta: ${test6.toolToUse}`);
console.log(`Hacer preguntas: ${test6.shouldAskQuestions}`);
console.log(`Razonamiento: ${test6.reasoning}`);
const test6Pass = test6.toolToUse === 'list_products_by_category' && !test6.shouldAskQuestions;
console.log(test6Pass ? '✅ PASS' : '❌ FAIL');

// Test 7: Búsqueda GENERAL de computador → Debe mostrar LISTA
console.log('\n📋 Test 7: "necesito un computador" → Debe mostrar LISTA');
const test7 = ConversationStrategyService.determineStrategy(
    'necesito un computador',
    mockProducts,
    []
);
console.log(`Herramienta: ${test7.toolToUse}`);
console.log(`Hacer preguntas: ${test7.shouldAskQuestions}`);
console.log(`Razonamiento: ${test7.reasoning}`);
const test7Pass = test7.toolToUse === 'list_products_by_category' && !test7.shouldAskQuestions;
console.log(test7Pass ? '✅ PASS' : '❌ FAIL');

// Test 8: Búsqueda GENERAL de teclado → Debe mostrar LISTA
console.log('\n📋 Test 8: "busco un teclado" → Debe mostrar LISTA');
const test8 = ConversationStrategyService.determineStrategy(
    'busco un teclado',
    mockProducts,
    []
);
console.log(`Herramienta: ${test8.toolToUse}`);
console.log(`Hacer preguntas: ${test8.shouldAskQuestions}`);
console.log(`Razonamiento: ${test8.reasoning}`);
const test8Pass = test8.toolToUse === 'list_products_by_category' && !test8.shouldAskQuestions;
console.log(test8Pass ? '✅ PASS' : '❌ FAIL');

// Resumen
console.log('\n' + '═'.repeat(60));
const allTests = [test1Pass, test2Pass, test3Pass, test4Pass, test5Pass, test6Pass, test7Pass, test8Pass];
const passedTests = allTests.filter(t => t).length;
const totalTests = allTests.length;

console.log(`\n📊 RESUMEN: ${passedTests}/${totalTests} tests pasados`);

if (passedTests === totalTests) {
    console.log('✅ TODOS LOS TESTS PASARON');
    console.log('\n🎯 El bot ahora:');
    console.log('  • Muestra LISTA cuando la búsqueda es GENERAL');
    console.log('  • Muestra PRODUCTO ESPECÍFICO solo cuando se menciona nombre completo');
    console.log('  • NO hace preguntas innecesarias');
    console.log('  • Cliente puede ver todas las opciones y elegir');
} else {
    console.log('❌ ALGUNOS TESTS FALLARON');
    console.log('Revisar la lógica de ConversationStrategyService');
}

console.log('\n' + '═'.repeat(60));
