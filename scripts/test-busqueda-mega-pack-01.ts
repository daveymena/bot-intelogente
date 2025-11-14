/**
 * Test: Búsqueda de Mega Pack 01
 */

import { ProductIntelligenceService } from '../src/lib/product-intelligence-service';

async function testBusqueda() {
  console.log('🔍 Test: Búsqueda de "Mega Pack 01"\n');

  const queries = [
    'mega pack 01',
    'mega pack 01 diseño grafico',
    'cursos diseño grafico',
    'mega pack diseño'
  ];

  for (const query of queries) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔎 Búsqueda: "${query}"`);
    
    const results = await ProductIntelligenceService.searchProducts(query);
    
    if (results.length > 0) {
      console.log(`✅ Encontrados ${results.length} productos:\n`);
      
      for (const result of results.slice(0, 3)) {
        console.log(`   📦 ${result.name}`);
        console.log(`   🆔 ID: ${result.id}`);
        console.log(`   💰 Precio: ${result.price}`);
        console.log(`   🖼️  Tiene imagen: ${result.images ? 'SÍ' : 'NO'}`);
        if (result.images) {
          const images = typeof result.images === 'string' 
            ? JSON.parse(result.images) 
            : result.images;
          console.log(`   📸 URL: ${images[0]?.substring(0, 60)}...`);
        }
        console.log('');
      }
    } else {
      console.log('❌ No se encontraron productos\n');
    }
  }
}

testBusqueda()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
