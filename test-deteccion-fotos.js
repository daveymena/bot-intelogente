/**
 * 🧪 TEST: Detección de solicitudes de fotos
 */

// Simular la función de detección
function detectPhotoRequest(message) {
  const normalized = message.toLowerCase().trim()

  const photoPatterns = [
    // Solicitudes directas
    /\b(foto|fotos|imagen|imagenes|imágenes|pic|pics|picture|pictures)\b/i,
    /\b(me\s+(envía|envia|manda|pasa|muestra|enseña))\s+(foto|fotos|imagen)/i,
    /\b(tiene|tienes|hay)\s+(foto|fotos|imagen)/i,
    /\b(ver|mirar|revisar|mostrar)\s+(foto|fotos|imagen)/i,
    /\b(foto|fotos|imagen)\s+(del|de|para|sobre)/i,
    /\b(cómo|como)\s+(se\s+ve|luce|es)/i,
    
    // Variaciones colombianas
    /\b(mándame|mandame|pasame|pásame)\s+(foto|fotos|imagen)/i,
    /\b(quiero\s+ver)/i,
    /\b(déjame|dejame)\s+ver/i,
    /\b(a\s+ver)/i,
    
    // Preguntas sobre apariencia
    /\b(qué\s+tal\s+se\s+ve|que\s+tal\s+se\s+ve)/i,
    /\b(cómo\s+es|como\s+es)/i,
    /\b(de\s+qué\s+color|de\s+que\s+color)/i,
  ]

  return photoPatterns.some(pattern => pattern.test(normalized))
}

console.log('🧪 TEST: Detección de Solicitudes de Fotos\n');
console.log('='.repeat(60));

// Casos de prueba
const testCases = [
  // DEBE DETECTAR (true)
  { mensaje: 'Tienes fotos?', esperado: true },
  { mensaje: 'Me envías fotos', esperado: true },
  { mensaje: 'Mándame fotos', esperado: true },
  { mensaje: 'Quiero ver fotos', esperado: true },
  { mensaje: 'Déjame ver', esperado: true },
  { mensaje: 'A ver', esperado: true },
  { mensaje: 'Cómo se ve?', esperado: true },
  { mensaje: 'Cómo es?', esperado: true },
  { mensaje: 'Tiene foto?', esperado: true },
  { mensaje: 'Muéstrame fotos', esperado: true },
  { mensaje: 'Pasame la foto', esperado: true },
  { mensaje: 'De qué color es?', esperado: true },
  { mensaje: 'Qué tal se ve?', esperado: true },
  { mensaje: 'Ver imagen', esperado: true },
  { mensaje: 'Foto del producto', esperado: true },
  
  // NO DEBE DETECTAR (false)
  { mensaje: 'Cuánto cuesta?', esperado: false },
  { mensaje: 'Qué laptops tienes?', esperado: false },
  { mensaje: 'Hola', esperado: false },
  { mensaje: 'Gracias', esperado: false },
  { mensaje: 'Me interesa', esperado: false },
  { mensaje: 'Cuáles son las especificaciones?', esperado: false },
];

let correctos = 0;
let incorrectos = 0;

console.log('\n✅ CASOS QUE DEBEN DETECTAR FOTOS:\n');

testCases.filter(t => t.esperado === true).forEach(test => {
  const resultado = detectPhotoRequest(test.mensaje);
  const correcto = resultado === test.esperado;
  
  if (correcto) correctos++;
  else incorrectos++;
  
  console.log(`${correcto ? '✅' : '❌'} "${test.mensaje}" → ${resultado ? 'DETECTADO' : 'NO DETECTADO'}`);
});

console.log('\n❌ CASOS QUE NO DEBEN DETECTAR FOTOS:\n');

testCases.filter(t => t.esperado === false).forEach(test => {
  const resultado = detectPhotoRequest(test.mensaje);
  const correcto = resultado === test.esperado;
  
  if (correcto) correctos++;
  else incorrectos++;
  
  console.log(`${correcto ? '✅' : '❌'} "${test.mensaje}" → ${resultado ? 'DETECTADO' : 'NO DETECTADO'}`);
});

console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN');
console.log('='.repeat(60));
console.log(`\n✅ Correctos: ${correctos}/${testCases.length}`);
console.log(`❌ Incorrectos: ${incorrectos}/${testCases.length}`);
console.log(`📊 Precisión: ${((correctos / testCases.length) * 100).toFixed(1)}%\n`);

if (incorrectos === 0) {
  console.log('🎉 ¡Perfecto! Todos los casos pasaron\n');
} else {
  console.log('⚠️  Algunos casos fallaron, revisar patrones\n');
}
