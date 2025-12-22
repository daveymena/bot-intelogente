/**
 * Test: Búsqueda Mejorada de Productos
 * Verifica que el sistema encuentre los productos correctos
 */

import { db } from '../src/lib/db';

// Simular la función de extracción de palabras clave
function extractKeywords(text: string): string[] {
  const stopWords = [
    'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'y', 'o', 
    'para', 'con', 'por', 'que', 'me', 'te', 'se', 'su', 'sus', 'al',
    'hola', 'buenos', 'días', 'tardes', 'noches', 'quiero', 'necesito',
    'busco', 'interesa', 'información', 'sobre', 'más', 'favor'
  ];
  
  const cleanText = text
    .toLowerCase()
    .replace(/[¿?¡!.,;:]/g, '')
    .trim();
  
  const words = cleanText
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  const phrases: string[] = [];
  
  if (cleanText.includes('megapack') || cleanText.includes('mega pack')) {
    phrases.push('mega', 'pack');
  }
  
  if (cleanText.includes('curso de') || cleanText.includes('curso')) {
    phrases.push('curso');
  }
  
  const allKeywords = [...new Set([...phrases, ...words])];
  return allKeywords.slice(0, 10);
}

// Simular la búsqueda de productos
async function searchProducts(query: string, userId: string) {
  const keywords = extractKeywords(query);
  console.log('🔍 Palabras clave:', keywords);

  const allProducts = await db.product.findMany({
    where: {
      userId,
      status: 'AVAILABLE'
    }
  });

  const scoredProducts = allProducts.map(product => {
    let score = 0;
    const productText = `${product.name} ${product.description || ''} ${product.subcategory || ''}`.toLowerCase();
    
    keywords.forEach(keyword => {
      if (productText.includes(keyword)) {
        if (product.name.toLowerCase().includes(keyword)) {
          score += 10;
        } else {
          score += 5;
        }
      }
    });

    const containsAll = keywords.every(kw => productText.includes(kw));
    if (containsAll) {
      score += 20;
    }

    if (product.name.toLowerCase().startsWith(keywords[0])) {
      score += 15;
    }

    return { product, score };
  });

  return scoredProducts
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

async function testBusqueda() {
  console.log('🧪 TEST: Búsqueda Mejorada de Productos\n');

  try {
    // Obtener un usuario
    const user = await db.user.findFirst();
    if (!user) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }

    // Casos de prueba
    const testCases = [
      'megapack de inglés',
      'mega pack inglés',
      'curso de inglés',
      'megapack programación',
      'mega pack diseño web',
      'curso de piano',
      'laptop',
      'moto'
    ];

    for (const testCase of testCases) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📝 Búsqueda: "${testCase}"`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      const results = await searchProducts(testCase, user.id);

      if (results.length === 0) {
        console.log('❌ No se encontraron productos');
      } else {
        console.log(`✅ Encontrados ${results.length} productos:\n`);
        results.forEach((item, idx) => {
          console.log(`${idx + 1}. ${item.product.name}`);
          console.log(`   📊 Score: ${item.score} puntos`);
          console.log(`   💰 Precio: ${item.product.price.toLocaleString('es-CO')} COP`);
          if (item.product.subcategory) {
            console.log(`   📁 Categoría: ${item.product.subcategory}`);
          }
          console.log();
        });
      }
    }

    console.log('\n✅ Test completado');

  } catch (error) {
    console.error('\n❌ Error en el test:', error);
    throw error;
  }
}

// Ejecutar test
testBusqueda()
  .then(() => {
    console.log('\n🎉 Test finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test falló:', error);
    process.exit(1);
  });
