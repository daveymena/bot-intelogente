import { ResponseFormatter } from '../src/lib/response-formatter';

console.log('🧪 Probando Formato Visual (Sin Puntos)\n');
console.log('='.repeat(60));

// Prueba 1: Respuesta con puntos tradicionales
console.log('\n📝 PRUEBA 1: Respuesta con puntos tradicionales\n');

const response1 = `El Mega Pack 01 incluye cursos de diseño gráfico. Aprenderás Photoshop, Illustrator y más. El precio es de 20.000 COP. Incluye acceso de por vida. También tiene soporte personalizado.`;

console.log('ANTES:');
console.log(response1);
console.log('\nDESPUÉS:');
console.log(ResponseFormatter.format(response1));

// Prueba 2: Respuesta con lista
console.log('\n' + '='.repeat(60));
console.log('\n📝 PRUEBA 2: Respuesta con lista numerada\n');

const response2 = `El curso de piano incluye:
1. 76+ lecciones en video HD
2. 157 recursos descargables
3. Acceso de por vida
4. Soporte personalizado
5. Certificado de finalización

El precio es de 60.000 COP.`;

console.log('ANTES:');
console.log(response2);
console.log('\nDESPUÉS:');
console.log(ResponseFormatter.format(response2));

// Prueba 3: Respuesta de producto
console.log('\n' + '='.repeat(60));
console.log('\n📝 PRUEBA 3: Formato de producto específico\n');

const formatted3 = ResponseFormatter.formatProductResponse(
  'Mega Pack 01: Cursos Diseño Gráfico',
  20000,
  'Colección completa de cursos sobre diseño gráfico. Incluye Photoshop, Illustrator, InDesign y más. Aprende desde cero hasta nivel avanzado.'
);

console.log(formatted3);

// Prueba 4: Lista de productos
console.log('\n' + '='.repeat(60));
console.log('\n📝 PRUEBA 4: Lista de productos\n');

const formatted4 = ResponseFormatter.formatProductList([
  { name: 'Mega Pack 01: Diseño Gráfico', price: 20000 },
  { name: 'Mega Pack 02: Programación Web', price: 20000 },
  { name: 'Curso Completo de Piano', price: 60000 }
]);

console.log(formatted4);

// Prueba 5: Objeción de precio
console.log('\n' + '='.repeat(60));
console.log('\n📝 PRUEBA 5: Respuesta a objeción de precio\n');

const formatted5 = ResponseFormatter.formatPriceObjectionResponse(
  'Mega Pack 01',
  [
    'Acceso de por vida sin límite de tiempo',
    'Múltiples cursos incluidos',
    'Actualizaciones gratuitas',
    'Soporte personalizado por WhatsApp'
  ]
);

console.log(formatted5);

console.log('\n' + '='.repeat(60));
console.log('\n✅ Pruebas completadas\n');

console.log('📋 Características del formato visual:');
console.log('   ✅ Sin puntos al final de frases');
console.log('   ✅ Emojis como separadores');
console.log('   ✅ Una idea por línea');
console.log('   ✅ Saltos de línea entre secciones');
console.log('   ✅ Viñetas • para listas');
console.log('   ✅ Emojis 🟢 💰 ✨ para destacar\n');
