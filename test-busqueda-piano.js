/**
 * Test de búsqueda del curso de piano
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBusqueda() {
  console.log('🧪 Test de búsqueda: "si me interesa ver el curso de piano"\n');
  
  const query = "si me interesa ver el curso de piano";
  
  // Limpiar query (simular lo que hace el bot)
  const cleanQuery = query
    .toLowerCase()
    .replace(/si\s+me\s+interesa/gi, '')
    .replace(/ver\s+el/gi, '')
    .replace(/quiero\s+ver/gi, '')
    .replace(/me\s+gustaria/gi, '')
    .trim();
  
  console.log(`Query original: "${query}"`);
  console.log(`Query limpia: "${cleanQuery}"\n`);
  
  // Buscar productos
  const productos = await prisma.product.findMany({
    where: {
      status: 'AVAILABLE',
      OR: [
        { name: { contains: 'piano', mode: 'insensitive' } },
        { name: { contains: 'curso', mode: 'insensitive' } },
        { tags: { contains: 'piano', mode: 'insensitive' } },
        { description: { contains: 'piano', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      name: true,
      category: true,
      tags: true
    }
  });
  
  console.log(`📦 Productos encontrados: ${productos.length}\n`);
  
  productos.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`);
    console.log(`   Categoría: ${p.category}`);
    console.log(`   Tags: ${p.tags}`);
    console.log('');
  });
  
  // Calcular scores
  console.log('📊 Calculando scores de relevancia:\n');
  
  const keywords = cleanQuery.split(' ').filter(w => w.length > 2);
  console.log(`Keywords: ${keywords.join(', ')}\n`);
  
  productos.forEach(p => {
    let score = 0;
    const name = p.name.toLowerCase();
    
    // Match en nombre
    keywords.forEach(k => {
      if (name.includes(k)) {
        score += 10;
      }
    });
    
    // Bonus si tiene "piano" en el nombre
    if (name.includes('piano')) {
      score += 20;
    }
    
    // Bonus si tiene "curso" en el nombre
    if (name.includes('curso')) {
      score += 15;
    }
    
    console.log(`${p.name}: ${score} puntos`);
  });
  
  await prisma.$disconnect();
}

testBusqueda();
