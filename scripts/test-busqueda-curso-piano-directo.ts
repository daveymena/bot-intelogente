import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testBusquedaCursoPiano() {
  console.log('🔍 Probando búsqueda de Curso de Piano\n');

  const userId = 'cmi6xj8q30000kme42q5fjk41'; // Tu userId
  const mensaje = 'me interesa el curso de piano';
  
  console.log(`📝 Mensaje: "${mensaje}"`);
  console.log(`👤 UserId: ${userId}\n`);

  // Extraer keywords
  const keywords = mensaje.toLowerCase()
    .split(/\s+/)
    .filter(k => k.length > 2);
  
  console.log(`🔑 Keywords extraídas: ${keywords.join(', ')}\n`);

  // Simular búsqueda como lo hace el search-agent
  const orConditions = keywords.map(k => ({
    OR: [
      { name: { contains: k, mode: 'insensitive' as const } },
      { description: { contains: k, mode: 'insensitive' as const } },
      { tags: { contains: k, mode: 'insensitive' as const } }
    ]
  }));

  console.log('🔍 Buscando en base de datos...\n');

  const productos = await prisma.product.findMany({
    where: {
      userId: userId,
      status: 'AVAILABLE',
      OR: orConditions.flatMap(c => c.OR)
    },
    take: 10
  });

  console.log(`📦 Productos encontrados: ${productos.length}\n`);

  if (productos.length > 0) {
    productos.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name}`);
      console.log(`   Precio: $${p.price.toLocaleString()} ${p.currency}`);
      console.log(`   Categoría: ${p.category}`);
      console.log(`   Tags: ${p.tags || 'Sin tags'}`);
      console.log('');
    });
  } else {
    console.log('❌ No se encontraron productos');
    console.log('\n🔍 Probando búsqueda más específica...\n');
    
    // Buscar solo por "piano"
    const productosPiano = await prisma.product.findMany({
      where: {
        userId: userId,
        status: 'AVAILABLE',
        OR: [
          { name: { contains: 'piano', mode: 'insensitive' } },
          { tags: { contains: 'piano', mode: 'insensitive' } }
        ]
      }
    });
    
    console.log(`📦 Productos con "piano": ${productosPiano.length}`);
    productosPiano.forEach(p => {
      console.log(`   • ${p.name}`);
    });
  }

  await prisma.$disconnect();
}

testBusquedaCursoPiano();
