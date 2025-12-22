/**
 * 🧪 TEST: Verificar que la búsqueda semántica devuelve UN SOLO producto
 */

const { semanticProductSearch } = require('./src/lib/semantic-product-search');

async function testBusquedaUnProducto() {
  console.log('🧪 TEST: Búsqueda Semántica - Un Solo Producto\n');
  
  const testCases = [
    {
      query: 'curso de piano',
      esperado: 'UN curso de piano'
    },
    {
      query: 'portátil para trabajar',
      esperado: 'UN portátil'
    },
    {
      query: 'megapack',
      esperado: 'UN megapack'
    },
    {
      query: 'moto',
      esperado: 'UNA moto'
    },
    {
      query: 'laptop gamer',
      esperado: 'UN laptop gamer'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📝 Query: "${testCase.query}"`);
    console.log(`🎯 Esperado: ${testCase.esperado}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    try {
      const resultado = await semanticProductSearch(testCase.query);
      
      if (!resultado) {
        console.log('❌ No se encontraron productos\n');
        continue;
      }
      
      console.log(`✅ Resultado:`);
      console.log(`   - isGeneralQuery: ${resultado.isGeneralQuery}`);
      console.log(`   - Confianza: ${resultado.confidence}%`);
      console.log(`   - Razón: ${resultado.reason}`);
      
      if (resultado.isGeneralQuery) {
        console.log(`\n❌ ERROR: isGeneralQuery es true (debería ser false)`);
        console.log(`   Productos devueltos: ${resultado.products?.length || 0}`);
        if (resultado.products) {
          resultado.products.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.name} - $${p.price.toLocaleString('es-CO')}`);
          });
        }
      } else {
        console.log(`\n✅ CORRECTO: isGeneralQuery es false`);
        if (resultado.product) {
          console.log(`   Producto: ${resultado.product.name}`);
          console.log(`   Precio: $${resultado.product.price.toLocaleString('es-CO')}`);
          console.log(`   Categoría: ${resultado.product.category}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏁 TEST COMPLETADO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

testBusquedaUnProducto()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
