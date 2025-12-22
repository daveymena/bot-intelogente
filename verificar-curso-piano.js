const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificar() {
  console.log('🔍 Buscando "Curso de Piano"...\n');
  
  // Buscar por nombre exacto
  const exacto = await prisma.product.findMany({
    where: {
      name: {
        contains: 'Piano',
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      name: true,
      status: true,
      tags: true,
      category: true
    }
  });
  
  console.log(`📦 Encontrados ${exacto.length} productos con "Piano":\n`);
  exacto.forEach(p => {
    console.log(`  ✅ ${p.name}`);
    console.log(`     ID: ${p.id}`);
    console.log(`     Estado: ${p.status}`);
    console.log(`     Categoría: ${p.category}`);
    console.log(`     Tags: ${p.tags}`);
    console.log('');
  });
  
  // Buscar por tags
  const porTags = await prisma.product.findMany({
    where: {
      OR: [
        { tags: { contains: 'piano', mode: 'insensitive' } },
        { tags: { contains: 'música', mode: 'insensitive' } },
        { tags: { contains: 'musica', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      name: true,
      tags: true
    }
  });
  
  console.log(`\n🏷️  Encontrados ${porTags.length} productos con tags relacionados\n`);
  
  await prisma.$disconnect();
}

verificar();
