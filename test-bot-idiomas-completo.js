/**
 * TEST COMPLETO: Bot responde a consultas de idiomas
 */

import { ProductIntelligenceService } from './src/lib/product-intelligence-service.js';

async function testBotIdiomas() {
  console.log('\n🤖 TEST: BOT RESPONDE A CONSULTAS DE IDIOMAS\n');
  console.log('═'.repeat(60));

  const userId = 'default-user';
  const queries = [
    'tienes cursos de idiomas?',
    'quiero aprender inglés',
    'cursos de idiomas',
    'mega pack idiomas'
  ];

  for (const query of queries) {
    console.log(`\n📝 Query: "${query}"`);
    console.log('─'.repeat(60));

    try {
      const producto = await ProductIntelligenceService.findProduct(query, userId);

      if (producto) {
        console.log(`✅ Producto encontrado:`);
        console.log(`   Nombre: ${producto.name}`);
        console.log(`   Precio: ${producto.price.toLocaleString('es-CO')} COP`);
        console.log(`   Categoría: ${producto.category}`);
        console.log(`   Descripción: ${producto.description?.substring(0, 100)}...`);
      } else {
        console.log('❌ No se encontró producto');
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✅ TEST COMPLETADO\n');
}

testBotIdiomas().catch(console.error);
