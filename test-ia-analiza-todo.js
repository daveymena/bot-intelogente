/**
 * TEST: IA ANALIZA TODOS LOS PRODUCTOS SIN INTERMEDIARIOS
 * Verifica que la IA recibe TODOS los productos y selecciona los correctos
 */

import { SimpleConversationHandler } from './src/lib/simple-conversation-handler.js';

async function testIAAnalizaTodo() {
  console.log('\n🤖 TEST: IA ANALIZA TODOS LOS PRODUCTOS\n');
  console.log('═'.repeat(70));

  const handler = SimpleConversationHandler.getInstance();
  const userId = 'default-user';
  const chatId = 'test-chat-' + Date.now();

  const queries = [
    {
      message: 'Tienes mega packs de idiomas?',
      expectedProducts: ['Mega Pack 03', 'Mega Pack 08'],
      description: 'Búsqueda de megapacks de idiomas'
    },
    {
      message: 'quiero aprender piano',
      expectedProducts: ['Curso de Piano'],
      description: 'Búsqueda de curso de piano'
    },
    {
      message: 'tienes laptops?',
      expectedProducts: ['laptop', 'asus', 'hp', 'lenovo'],
      description: 'Búsqueda de laptops (múltiples)'
    },
    {
      message: 'cursos de diseño gráfico',
      expectedProducts: ['diseño', 'photoshop', 'illustrator'],
      description: 'Búsqueda de cursos de diseño'
    }
  ];

  for (const query of queries) {
    console.log(`\n📝 TEST: ${query.description}`);
    console.log(`   Query: "${query.message}"`);
    console.log('─'.repeat(70));

    try {
      const response = await handler.handleMessage({
        chatId,
        userId,
        message: query.message,
        userName: 'Test User'
      });

      console.log(`\n✅ Respuesta recibida:`);
      console.log(`   Texto: ${response.text.substring(0, 200)}...`);
      
      if (response.actions && response.actions.length > 0) {
        console.log(`   Acciones: ${response.actions.length}`);
        response.actions.forEach((action, i) => {
          console.log(`   ${i + 1}. ${action.type} - ${action.data.product?.name || 'N/A'}`);
        });
      }

      // Verificar que menciona productos esperados
      const responseLower = response.text.toLowerCase();
      let foundCount = 0;
      
      for (const expected of query.expectedProducts) {
        if (responseLower.includes(expected.toLowerCase())) {
          foundCount++;
          console.log(`   ✅ Menciona: "${expected}"`);
        }
      }

      if (foundCount > 0) {
        console.log(`\n✅ TEST PASADO: Encontró ${foundCount}/${query.expectedProducts.length} productos esperados`);
      } else {
        console.log(`\n⚠️ TEST FALLIDO: No encontró productos esperados`);
        console.log(`   Esperaba: ${query.expectedProducts.join(', ')}`);
      }

    } catch (error) {
      console.error(`\n❌ ERROR: ${error.message}`);
      console.error(error.stack);
    }

    console.log('\n' + '─'.repeat(70));
  }

  console.log('\n' + '═'.repeat(70));
  console.log('✅ TESTS COMPLETADOS\n');
}

// Ejecutar tests
testIAAnalizaTodo().catch(console.error);
