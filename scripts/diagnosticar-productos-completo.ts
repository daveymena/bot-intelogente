import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnosticar() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE PRODUCTOS\n');
  
  // Total de productos
  const total = await prisma.product.count();
  console.log(`📦 Total de productos: ${total}\n`);
  
  // Por categoría
  const porCategoria = await prisma.product.groupBy({
    by: ['category'],
    _count: true
  });
  
  console.log('📊 Por categoría:');
  porCategoria.forEach(cat => {
    console.log(`  - ${cat.category}: ${cat._count} productos`);
  });
  
  // Productos sin fotos
  const sinFotos = await prisma.product.findMany({
    where: {
      OR: [
        { images: { equals: null } },
        { images: { equals: '[]' } },
        { images: { equals: '' } }
      ]
    },
    select: {
      id: true,
      name: true,
      category: true,
      images: true
    }
  });
  
  console.log(`\n❌ Productos SIN fotos: ${sinFotos.length}`);
  if (sinFotos.length > 0) {
    sinFotos.slice(0, 10).forEach(p => {
      console.log(`  - [${p.category}] ${p.name} (ID: ${p.id})`);
    });
    if (sinFotos.length > 10) {
      console.log(`  ... y ${sinFotos.length - 10} más`);
    }
  }
  
  // Productos con fotos
  const conFotos = await prisma.product.count({
    where: {
      AND: [
        { images: { not: null } },
        { images: { not: '[]' } },
        { images: { not: '' } }
      ]
    }
  });
  
  console.log(`\n✅ Productos CON fotos: ${conFotos}`);
  
  // Verificar categorías específicas
  const megapacks = await prisma.product.count({
    where: { category: 'MEGAPACK' }
  });
  
  const cursos = await prisma.product.count({
    where: { category: 'CURSO' }
  });
  
  console.log(`\n📚 Categorías específicas:`);
  console.log(`  - MEGAPACK: ${megapacks}`);
  console.log(`  - CURSO: ${cursos}`);
  
  // Productos con links de pago
  const conLinks = await prisma.product.count({
    where: {
      paymentLinks: { not: null }
    }
  });
  
  console.log(`\n💳 Productos con links de pago: ${conLinks}`);
  
  await prisma.$disconnect();
}

diagnosticar().catch(console.error);
