const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function contar() {
  const total = await prisma.product.count();
  console.log('📦 Total de productos en BD:', total);
  
  const idiomas = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'idiomas', mode: 'insensitive' } },
        { name: { contains: 'inglés', mode: 'insensitive' } },
        { name: { contains: 'ingles', mode: 'insensitive' } },
        { description: { contains: 'idiomas', mode: 'insensitive' } },
        { tags: { contains: 'idiomas' } }
      ]
    },
    select: { id: true, name: true, price: true, tags: true }
  });
  
  console.log('\n🌍 Productos de idiomas encontrados:', idiomas.length);
  idiomas.forEach((p, i) => {
    console.log(`${i+1}. ${p.name} - ${p.price} COP`);
    console.log(`   Tags: ${p.tags}`);
  });
  
  await prisma.$disconnect();
}

contar();
