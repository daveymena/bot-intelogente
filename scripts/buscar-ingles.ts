import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function buscarIngles() {
  const productos = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'inglés', mode: 'insensitive' } },
        { name: { contains: 'ingles', mode: 'insensitive' } },
        { name: { contains: 'english', mode: 'insensitive' } },
        { description: { contains: 'inglés', mode: 'insensitive' } },
        { description: { contains: 'ingles', mode: 'insensitive' } }
      ]
    },
    select: {
      name: true,
      price: true,
      category: true,
      description: true
    }
  });

  console.log(`\n📚 Productos relacionados con inglés: ${productos.length}\n`);
  
  for (const p of productos) {
    console.log(`✅ ${p.name}`);
    console.log(`   💰 $${p.price.toLocaleString()} COP`);
    console.log(`   📦 ${p.category}`);
    if (p.description) {
      console.log(`   📝 ${p.description.substring(0, 100)}...`);
    }
    console.log('');
  }

  await prisma.$disconnect();
}

buscarIngles();
