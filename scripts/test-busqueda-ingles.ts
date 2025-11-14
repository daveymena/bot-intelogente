/**
 * Test de búsqueda mejorada para curso de inglés
 */

import { db } from '../src/lib/db';

async function testBusquedaIngles() {
  console.log('🧪 TEST: Búsqueda de curso de inglés\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const query = 'tienes el curso de ingles';
  console.log(`📝 Consulta: "${query}"\n`);

  // Simular extracción de palabras clave
  const keywords = extractKeywords(query);
  console.log('🔍 Palabras clave extraídas:', keywords);
  console.log('');

  // Buscar productos
  const allProducts = await db.product.findMany({
    where: {
      status: 'AVAILABLE'
    }
  });

  console.log(`📦 Total productos disponibles: ${allProducts.length}\n`);

  // Calcular scoring
  const scoredProducts = allProducts.map(product => {
    let score = 0;
    const productName = product.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const productDesc = (product.description || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const productText = `${productName} ${productDesc}`;
    
    keywords.forEach((keyword, index) => {
      const keywordNorm = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      if (productText.includes(keywordNorm)) {
        if (productName.includes(keywordNorm)) {
          score += 15;
        } else {
          score += 7;
        }
        
        if (index === 0 && productName.includes(keywordNorm)) {
          score += 10;
        }
      }
    });

    const containsAll = keywords.every(kw => {
      const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return productText.includes(kwNorm);
    });
    if (containsAll) {
      score += 30;
    }

    const firstKeywordNorm = keywords[0]?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (firstKeywordNorm && productName.startsWith(firstKeywordNorm)) {
      score += 20;
    }

    return { product, score };
  });

  // Filtrar y ordenar
  const relevantProducts = scoredProducts
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  console.log('📊 RESULTADOS (Top 10):\n');
  
  relevantProducts.forEach((item, index) => {
    console.log(`${index + 1}. ${item.product.name}`);
    console.log(`   💯 Score: ${item.score} puntos`);
    console.log(`   💰 Precio: $${item.product.price.toLocaleString('es-CO')}`);
    console.log('');
  });

  if (relevantProducts.length === 0) {
    console.log('❌ No se encontraron productos relevantes');
  } else {
    const topProduct = relevantProducts[0];
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ PRODUCTO MÁS RELEVANTE:\n');
    console.log(`📦 ${topProduct.product.name}`);
    console.log(`💰 Precio: $${topProduct.product.price.toLocaleString('es-CO')}`);
    console.log(`💯 Score: ${topProduct.score} puntos`);
    console.log(`🆔 ID: ${topProduct.product.id}`);
    
    // Verificar imagen
    let images: string[] = [];
    try {
      images = JSON.parse(topProduct.product.images);
    } catch {
      images = [topProduct.product.images];
    }
    
    console.log(`📸 Imagen: ${images[0]}`);
    
    // Verificar si es el correcto
    if (topProduct.product.name.toLowerCase().includes('ingles') || 
        topProduct.product.name.toLowerCase().includes('inglés')) {
      console.log('\n✅ CORRECTO: Es un producto de inglés');
    } else {
      console.log('\n❌ INCORRECTO: NO es un producto de inglés');
    }
  }
}

function extractKeywords(text: string): string[] {
  const stopWords = [
    'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'y', 'o', 
    'para', 'con', 'por', 'que', 'me', 'te', 'se', 'su', 'sus', 'al',
    'hola', 'buenos', 'días', 'tardes', 'noches', 'quiero', 'necesito',
    'busco', 'interesa', 'información', 'sobre', 'más', 'favor', 'tienes',
    'tiene', 'hay', 'muy', 'buenas', 'buena', 'estoy', 'interesado', 'interesada'
  ];
  
  const cleanText = text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:]/g, '')
    .trim();
  
  const phrases: string[] = [];
  
  const cursoMatch = cleanText.match(/curso\s+(?:de\s+)?(\w+)/);
  if (cursoMatch) {
    phrases.push('curso', cursoMatch[1]);
  } else if (cleanText.includes('curso')) {
    phrases.push('curso');
  }
  
  const temas = ['ingles', 'inglés', 'diseño', 'diseno', 'programacion', 'programación'];
  temas.forEach(tema => {
    if (cleanText.includes(tema)) {
      phrases.push(tema);
    }
  });
  
  const words = cleanText
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  const allKeywords = [...new Set([...phrases, ...words])];
  
  return allKeywords.slice(0, 10);
}

testBusquedaIngles()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
