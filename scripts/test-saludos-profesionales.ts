/**
 * 🧪 TEST: Saludos Profesionales
 * Prueba las nuevas variaciones de saludos y despedidas
 */

import { GreetingDetector } from '../src/lib/greeting-detector';

console.log('🧪 TEST: Saludos Profesionales y Variaciones\n');
console.log('='.repeat(60));

// Test 1: Saludos Profesionales
console.log('\n📝 TEST 1: Detección de Saludos Profesionales\n');

const professionalGreetings = [
  'Muy buenos días',
  'Cordial saludo',
  'Buen día',
  'Estimado señor',
  'Buenas tardes señora',
  'Permiso',
  'Disculpe',
  'Un cordial saludo'
];

professionalGreetings.forEach(greeting => {
  const isGreeting = GreetingDetector.isGreeting(greeting);
  console.log(`"${greeting}"`);
  console.log(`  ✓ Detectado: ${isGreeting ? '✅ SÍ' : '❌ NO'}`);
  
  if (isGreeting) {
    const response = GreetingDetector.generateGreetingResponse();
    console.log(`  📤 Respuesta: ${response.split('\n')[0]}...`);
  }
  console.log('');
});

// Test 2: Saludos Casuales Colombianos
console.log('\n📝 TEST 2: Saludos Casuales Colombianos\n');

const casualGreetings = [
  'Quiubo',
  'Qué hubo',
  'Holi',
  'Wenas',
  'Holitas'
];

casualGreetings.forEach(greeting => {
  const isGreeting = GreetingDetector.isGreeting(greeting);
  console.log(`"${greeting}"`);
  console.log(`  ✓ Detectado: ${isGreeting ? '✅ SÍ' : '❌ NO'}`);
  
  if (isGreeting) {
    const response = GreetingDetector.generateGreetingResponse('Juan');
    console.log(`  📤 Respuesta: ${response.split('\n')[0]}...`);
  }
  console.log('');
});

// Test 3: Despedidas Profesionales
console.log('\n📝 TEST 3: Detección de Despedidas Profesionales\n');

const professionalFarewells = [
  'Mil gracias',
  'Muy amable',
  'Le agradezco',
  'Que tenga buen día',
  'Feliz día',
  'Hasta la próxima',
  'Bendiciones'
];

professionalFarewells.forEach(farewell => {
  const isFarewell = GreetingDetector.isFarewell(farewell);
  console.log(`"${farewell}"`);
  console.log(`  ✓ Detectado: ${isFarewell ? '✅ SÍ' : '❌ NO'}`);
  
  if (isFarewell) {
    const response = GreetingDetector.generateFarewellResponse();
    console.log(`  📤 Respuesta: ${response.split('\n')[0]}...`);
  }
  console.log('');
});

// Test 4: Variedad de Respuestas
console.log('\n📝 TEST 4: Variedad de Respuestas de Saludo\n');
console.log('Generando 10 respuestas aleatorias:\n');

for (let i = 1; i <= 10; i++) {
  const response = GreetingDetector.generateGreetingResponse();
  const firstLine = response.split('\n')[0];
  console.log(`${i}. ${firstLine}`);
}

// Test 5: Variedad de Respuestas de Despedida
console.log('\n📝 TEST 5: Variedad de Respuestas de Despedida\n');
console.log('Generando 10 respuestas aleatorias:\n');

for (let i = 1; i <= 10; i++) {
  const response = GreetingDetector.generateFarewellResponse();
  const firstLine = response.split('\n')[0];
  console.log(`${i}. ${firstLine}`);
}

// Test 6: Casos que NO deben ser saludos
console.log('\n📝 TEST 6: Casos que NO deben ser Saludos\n');

const notGreetings = [
  'me interesa un laptop',
  'quisiera saber sobre curso piano',
  'busco megapacks',
  'cuánto cuesta',
  'tienes disponible'
];

notGreetings.forEach(text => {
  const isGreeting = GreetingDetector.isGreeting(text);
  console.log(`"${text}"`);
  console.log(`  ✓ Detectado como saludo: ${isGreeting ? '❌ ERROR' : '✅ CORRECTO'}`);
  console.log('');
});

console.log('='.repeat(60));
console.log('\n✅ Test completado!\n');
