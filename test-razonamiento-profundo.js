/**
 * Test del sistema de razonamiento profundo local
 */

async function testRazonamiento() {
  const module = await import('./src/lib/intent-translator.js');
  const IntentTranslator = module.IntentTranslator;
  
  console.log('🧪 TEST: Sistema de Razonamiento Profundo Local\n');
  console.log('═'.repeat(60));
  
  const testCases = [
    // Diseño gráfico
    'diseño gráfico',
    'curso de diseño gráfico',
    'megapack de diseño',
    'quiero aprender diseño',
    
    // Reparación
    'reparación de teléfonos',
    'curso de reparación de celulares',
    'arreglo de tablets',
    
    // Programación
    'programación web',
    'curso de programación',
    'aprender a programar',
    
    // Productos físicos
    'laptop para gaming',
    'portátil para trabajar',
    'computador para diseño',
    
    // Ambiguos
    'diseño',
    'curso',
    'megapack'
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📝 Cliente dice: "${testCase}"`);
    console.log('─'.repeat(60));
    
    const result = IntentTranslator.translate(testCase);
    
    console.log(`🎯 Tipo: ${result.productType}`);
    console.log(`🔍 Términos: ${result.translatedTerms.join(', ')}`);
    console.log(`📊 Confianza: ${(result.confidence * 100).toFixed(0)}%`);
    console.log(`🧠 Razonamiento:`);
    console.log(result.reasoning.split('\n').map(line => '   ' + line).join('\n'));
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('✅ Test completado');
}

testRazonamiento().catch(console.error);
