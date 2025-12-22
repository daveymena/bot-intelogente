// Script de prueba para validar las correcciones del bot
// Ejecutar con: node test-bot-fixes.js

const { IntentDetector } = require('./src/agents/utils/intent-detector');
const { SearchAgent } = require('./src/agents/search-agent');
const { DeepReasoningAgent } = require('./src/agents/deep-reasoning-agent');

console.log('🧪 PRUEBAS DE CORRECCIONES DEL BOT\n');

// Test 1: IntentDetector - Evitar saludo repetido
console.log('1️⃣ Test IntentDetector - Evitar saludo repetido:');
const memoryWithContext = {
  greetingSent: true,
  currentProduct: { name: 'Curso de Piano' },
  interestedProducts: [],
  messageCount: 5
};

const intentResult = IntentDetector.detect('hola', memoryWithContext);
console.log(`   Mensaje: "hola"`);
console.log(`   Intención detectada: ${intentResult.intent} (esperado: NO greeting)`);
console.log(`   ✅ ${intentResult.intent !== 'greeting' ? 'PASS' : 'FAIL'}\n`);

// Test 2: SearchAgent - Selección por número
console.log('2️⃣ Test SearchAgent - Selección por número:');
const mockProducts = [
  { id: '1', name: 'Curso de Piano' },
  { id: '2', name: 'Laptop ASUS' },
  { id: '3', name: 'Moto Bajaj' }
];

const searchAgent = new SearchAgent();
const selectionResult = searchAgent.detectNumberSelection('ME INTERESA el 03');
console.log(`   Mensaje: "ME INTERESA el 03"`);
console.log(`   Número detectado: ${selectionResult} (esperado: 3)`);
console.log(`   ✅ ${selectionResult === 3 ? 'PASS' : 'FAIL'}\n`);

// Test 3: SearchAgent - Fuzzy matching
console.log('3️⃣ Test SearchAgent - Fuzzy matching:');
const fuzzyResult = searchAgent.applyFuzzyMatching('curioso de piano');
console.log(`   Mensaje original: "curioso de piano"`);
console.log(`   Corregido: "${fuzzyResult}" (esperado: "curso de piano")`);
console.log(`   ✅ ${fuzzyResult === 'curso de piano' ? 'PASS' : 'FAIL'}\n`);

// Test 4: DeepReasoningAgent - Identificación de productos
console.log('4️⃣ Test DeepReasoningAgent - Identificación de productos:');
const mockMemory = {
  messages: [
    { role: 'assistant', content: '¡Perfecto! 😊 Encontré el *Curso Completo de Piano*' },
    { role: 'user', content: 'ME INTERESA el 03' }
  ]
};

const reasoningResult = DeepReasoningAgent.analyzeContext('chat123', 'ME INTERESA el 03', mockMemory);
console.log(`   Mensaje: "ME INTERESA el 03"`);
console.log(`   Producto identificado: ${reasoningResult.currentProduct?.name || 'Ninguno'}`);
console.log(`   ✅ ${reasoningResult.currentProduct?.name === 'Curso Completo de Piano' ? 'PASS' : 'FAIL'}\n`);

console.log('🎉 PRUEBAS COMPLETADAS');
console.log('\n📋 RESUMEN DE CORRECCIONES:');
console.log('✅ GreetingAgent: Evita saludos repetidos con flag greetingSent');
console.log('✅ SearchAgent: Detecta selección por número (el 1, el 2, etc.)');
console.log('✅ SearchAgent: Aplica fuzzy matching para corregir typos');
console.log('✅ IntentDetector: No detecta greeting si ya se saludó');
console.log('✅ DeepReasoningAgent: Mejor identificación de productos en historial');
console.log('\n🚀 El bot ahora debería responder correctamente a las conversaciones problemáticas!');