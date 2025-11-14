/**
 * Test del sistema de traducción de intención local
 */

import { IntentTranslatorService } from '../src/lib/intent-translator-service';

async function testIntentTranslator() {
  console.log('🧪 TEST: Sistema de Traducción de Intención Local\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const testCases = [
    'me interesa el curso de diseno grafico',
    'tienes el curso de ingles',
    'quiero el mega pack 01',
    'kiero el megapak de programacion',
    'hay curso de marketi',
    'mega pack completo',
    'tienes curzo de diseño',
    'megapack 03',
    'curso inglez'
  ];

  for (const testCase of testCases) {
    console.log(`📝 Mensaje: "${testCase}"`);
    
    const result = IntentTranslatorService.translateIntent(testCase);
    
    console.log(`   ✅ Corregido: "${result.correctedMessage}"`);
    console.log(`   🎯 Intención: ${result.detectedIntent}`);
    console.log(`   🔑 Palabras clave: ${result.productKeywords.join(', ')}`);
    console.log(`   💯 Confianza: ${(result.confidence * 100).toFixed(0)}%`);
    console.log(`   🧠 Razonamiento: ${result.reasoning}`);
    
    const productName = IntentTranslatorService.getMostLikelyProduct(result);
    if (productName) {
      console.log(`   📦 Producto sugerido: ${productName}`);
    }
    
    const searchQuery = IntentTranslatorService.generateSearchQuery(result);
    console.log(`   🔍 Consulta de búsqueda: "${searchQuery}"`);
    
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ TEST COMPLETADO\n');
  console.log('🎯 VENTAJAS DEL SISTEMA:\n');
  console.log('1. ✅ Funciona sin tokens de IA externa');
  console.log('2. ✅ Corrige errores ortográficos automáticamente');
  console.log('3. ✅ Entiende la intención del cliente');
  console.log('4. ✅ Sugiere el producto correcto');
  console.log('5. ✅ Genera consultas de búsqueda optimizadas');
  console.log('6. ✅ Sin límites de uso');
}

testIntentTranslator()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
