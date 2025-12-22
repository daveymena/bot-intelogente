/**
 * Test de detección de intención mejorada
 */

// Simular el IntentDetector
function isProductSearch(msg) {
  // Patrones de interés en productos específicos
  const interestPatterns = [
    /\b(si|sí)\s+(me\s+)?interesa\s+(ver\s+)?(el|la|los|las)?\s*\w+/i,
    /\bme\s+interesa\s+(ver\s+)?(el|la)?\s*\w+/i,
    /\bquiero\s+(ver\s+)?(el|la)?\s*\w+/i,
    /\bme\s+gustaria\s+(ver\s+)?(el|la)?\s*\w+/i,
    /\bquisiera\s+(ver\s+)?(el|la)?\s*\w+/i,
    /\binformacion\s+(sobre|del|de)\s+\w+/i,
    /\bcuentame\s+(sobre|del|de)\s+\w+/i,
  ];
  
  // Si coincide con algún patrón de interés, es búsqueda
  if (interestPatterns.some(p => p.test(msg))) {
    return true;
  }
  
  // Palabras clave de búsqueda
  const searchKeywords = [
    'busco', 'necesito', 'quiero', 'me interesa', 'tienes',
    'vendes', 'hay', 'tienen', 'mostrar', 'ver', 'enseñar'
  ];
  
  // Nombres de productos/categorías
  const productKeywords = [
    'curso', 'megapack', 'portatil', 'portátil',
    'computador', 'laptop', 'moto', 'servicio',
    'piano', 'guitarra', 'diseño', 'excel', 'ingles', 'inglés',
    'programacion', 'programación', 'marketing', 'fotografia', 'fotografía'
  ];
  
  // Si tiene palabra de búsqueda + palabra de producto, es búsqueda
  const hasSearchKeyword = searchKeywords.some(k => msg.includes(k));
  const hasProductKeyword = productKeywords.some(k => msg.includes(k));
  
  if (hasSearchKeyword && hasProductKeyword) {
    return true;
  }
  
  // Si solo menciona un producto específico (sin palabra de búsqueda)
  // pero el mensaje es corto (< 50 caracteres), probablemente es búsqueda
  if (hasProductKeyword && msg.length < 50) {
    return true;
  }
  
  return false;
}

function extractProductName(msg) {
  // Limpiar palabras de relleno comunes
  let cleanMsg = msg
    .toLowerCase()
    .replace(/\b(si|sí|me|interesa|ver|el|la|los|las|un|una|quiero|quisiera|me\s+gustaria|me\s+gustaría|busco|necesito|tienes|hay|sobre|del|de)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleanMsg;
}

// Tests
console.log('🧪 Test de Detección de Intención Mejorada\n');
console.log('='.repeat(60));

const testCases = [
  'si me interesa ver el curso de piano',
  'me interesa el curso de piano',
  'quiero ver el megapack de diseño',
  'me gustaría ver el curso de inglés',
  'información sobre el curso de piano',
  'cuéntame del curso de piano',
  'busco un portátil',
  'necesito una moto',
  'tienes cursos de programación',
  'curso de piano',
  'piano',
  'hola',
  'gracias',
];

testCases.forEach(msg => {
  const isSearch = isProductSearch(msg);
  const productName = isSearch ? extractProductName(msg) : null;
  
  console.log(`\n📝 Mensaje: "${msg}"`);
  console.log(`   ¿Es búsqueda?: ${isSearch ? '✅ SÍ' : '❌ NO'}`);
  if (productName) {
    console.log(`   Producto extraído: "${productName}"`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('✅ Test completado\n');
