/**
 * Test de búsqueda semántica con Ollama
 * Prueba que el sistema entiende contexto, no solo keywords
 */

require('dotenv').config();

async function testSemanticSearch() {
  console.log('🧪 TEST BÚSQUEDA SEMÁNTICA CON OLLAMA\n');
  console.log('='.repeat(60));

  // Importar dinámicamente con tsx
  const module = await import('./src/lib/semantic-product-search.ts');
  const semanticProductSearch = module.semanticProductSearch || module.default?.semanticProductSearch;

  // Casos de prueba
  const testCases = [
    {
      name: 'Curso específico con error ortográfico',
      message: 'curzo de piyano',
      expected: 'Debe encontrar curso de piano'
    },
    {
      name: 'Curso específico correcto',
      message: 'curso de piano',
      expected: 'Debe encontrar curso de piano'
    },
    {
      name: 'Intención implícita',
      message: 'quiero aprender inglés',
      expected: 'Debe encontrar curso/megapack de idiomas'
    },
    {
      name: 'Consulta general',
      message: 'qué laptops tienes',
      expected: 'Debe mostrar múltiples laptops'
    },
    {
      name: 'Consulta específica con contexto',
      message: 'algo para trabajar desde casa',
      expected: 'Debe recomendar laptop para oficina'
    },
    {
      name: 'Megapack',
      message: 'mega pack de cursos',
      expected: 'Debe encontrar megapacks'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 TEST: ${testCase.name}`);
    console.log(`💬 Mensaje: "${testCase.message}"`);
    console.log(`🎯 Esperado: ${testCase.expected}`);
    console.log('-'.repeat(60));

    try {
      const result = await semanticProductSearch(testCase.message);

      if (!result) {
        console.log('❌ No se encontraron productos');
        continue;
      }

      if (result.isGeneralQuery && result.products) {
        console.log(`✅ Consulta general: ${result.products.length} productos`);
        console.log(`💡 Razón: ${result.reason}`);
        console.log(`📊 Confianza: ${result.confidence}%`);
        console.log('\nProductos encontrados:');
        result.products.forEach((p, idx) => {
          console.log(`  ${idx + 1}. ${p.name} - $${p.price.toLocaleString('es-CO')}`);
        });
      } else if (result.product) {
        console.log(`✅ Producto específico encontrado`);
        console.log(`💡 Razón: ${result.reason}`);
        console.log(`📊 Confianza: ${result.confidence}%`);
        console.log(`\n📦 Producto: ${result.product.name}`);
        console.log(`💰 Precio: $${result.product.price.toLocaleString('es-CO')}`);
        console.log(`📁 Categoría: ${result.product.category}`);
      }

    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ TEST COMPLETADO');
}

// Ejecutar test
testSemanticSearch().catch(console.error);
