/**
 * Test de scoring: "curso de piano"
 * Debe priorizar "Curso Completo de Piano Online" sobre los Mega Packs
 */

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

// Simular el método normalizeText
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Simular extractSpecificKeywords
function extractSpecificKeywords(query) {
  const specificWords = [];
  
  // Instrumentos musicales
  const instruments = ['piano', 'guitarra', 'violin', 'bateria', 'bajo', 'saxofon', 'flauta', 'trompeta'];
  instruments.forEach(inst => {
    if (query.includes(inst)) {
      specificWords.push(inst);
    }
  });
  
  return specificWords;
}

// Simular isCommonWord
function isCommonWord(word) {
  const commonWords = [
    'curso', 'completo', 'desde', 'cero', 'hasta', 'nivel', 'avanzado',
    'basico', 'intermedio', 'online', 'gratis', 'pack', 'mega', 'de', 'el', 'la', 'los', 'las'
  ];
  return commonWords.includes(word);
}

// Calcular score (versión simplificada)
function calculateScore(product, query) {
  const name = normalizeText(product.name);
  const normalizedQuery = normalizeText(query);
  const keywords = normalizedQuery.split(' ').filter(w => w.length > 2);
  const specificKeywords = extractSpecificKeywords(normalizedQuery);
  
  let score = 0;
  
  console.log(`\n📊 Calculando score para: ${product.name}`);
  console.log(`   Keywords: [${keywords.join(', ')}]`);
  console.log(`   Specific: [${specificKeywords.join(', ')}]`);
  
  // 1. Match exacto
  if (name === normalizedQuery) {
    score += 50;
    console.log(`   +50 Match exacto`);
  }
  
  // 2. Nombre contiene query completa
  if (name.includes(normalizedQuery)) {
    score += 30;
    console.log(`   +30 Nombre contiene query`);
  }
  
  // 3. Keywords específicas
  specificKeywords.forEach(keyword => {
    const isGenericPack = name.includes('mega pack') || name.includes('pack completo');
    
    if (name.includes(keyword)) {
      if (!isGenericPack) {
        score += 50;
        console.log(`   +50 Keyword específica "${keyword}" en producto específico`);
      } else {
        score += 30;
        console.log(`   +30 Keyword específica "${keyword}" en pack genérico`);
      }
    }
  });
  
  // 4. Todas las keywords importantes en nombre
  const importantKeywords = keywords.filter(k => !isCommonWord(k));
  const allImportantInName = importantKeywords.every(k => name.includes(k));
  if (allImportantInName && importantKeywords.length >= 2) {
    score += 25;
    console.log(`   +25 Todas las keywords importantes en nombre`);
  }
  
  // 5. Keywords individuales
  keywords.forEach(keyword => {
    if (name.includes(keyword)) {
      score += 6;
      console.log(`   +6 Keyword "${keyword}"`);
    }
  });
  
  // 6. Penalización por pack genérico
  const isPackProduct = name.includes('mega pack') || name.includes('pack completo');
  const userSearchedPack = query.includes('pack') || query.includes('megapack');
  
  if (isPackProduct && !userSearchedPack) {
    if (specificKeywords.length > 0) {
      score -= 25;
      console.log(`   -25 Pack genérico (usuario buscó algo específico)`);
    } else {
      score -= 15;
      console.log(`   -15 Pack genérico`);
    }
  }
  
  console.log(`   ✅ SCORE FINAL: ${score}`);
  
  return score;
}

async function testScoring() {
  console.log('🎯 TEST DE SCORING: "curso de piano"\n');
  console.log('='.repeat(60));
  
  try {
    const user = await db.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!user) {
      console.error('❌ No se encontró usuario admin');
      return;
    }
    
    // Obtener productos relevantes
    const productos = await db.product.findMany({
      where: {
        userId: user.id,
        status: 'AVAILABLE',
        OR: [
          { name: { contains: 'piano', mode: 'insensitive' } },
          { name: { contains: 'curso', mode: 'insensitive' } },
        ]
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
      take: 10
    });
    
    console.log(`\n📦 Productos a evaluar: ${productos.length}\n`);
    
    // Calcular scores
    const query = 'curso de piano';
    const productosConScore = productos.map(p => ({
      ...p,
      score: calculateScore(p, query)
    }));
    
    // Ordenar por score
    productosConScore.sort((a, b) => b.score - a.score);
    
    console.log('\n' + '='.repeat(60));
    console.log('\n🏆 RANKING FINAL:\n');
    
    productosConScore.forEach((p, i) => {
      const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
      console.log(`${emoji} ${i + 1}. [${p.score}] ${p.name}`);
    });
    
    console.log('\n' + '='.repeat(60));
    
    const ganador = productosConScore[0];
    if (ganador.name.toLowerCase().includes('piano') && !ganador.name.toLowerCase().includes('mega pack')) {
      console.log('\n✅ CORRECTO: El ganador es el curso específico de piano');
    } else {
      console.log('\n❌ ERROR: El ganador NO es el curso específico de piano');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

testScoring();
