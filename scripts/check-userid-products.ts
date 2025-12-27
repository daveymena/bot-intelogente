import { db } from '../src/lib/db';

async function main() {
  console.log('🔍 Verificando userId de productos...\n');

  // Agrupar productos por userId
  const products = await db.product.findMany({
    where: { status: 'AVAILABLE' },
    select: {
      id: true,
      name: true,
      userId: true
    }
  });

  const byUserId = new Map<string, number>();
  
  products.forEach(p => {
    const key = p.userId || 'NULL';
    byUserId.set(key, (byUserId.get(key) || 0) + 1);
  });

  console.log('📊 Productos AVAILABLE por userId:');
  byUserId.forEach((count, userId) => {
    console.log(`  ${userId}: ${count} productos`);
  });

  // Buscar piano específicamente
  const pianoProducts = await db.product.findMany({
    where: {
      name: { contains: 'piano', mode: 'insensitive' },
      status: 'AVAILABLE'
    },
    select: {
      name: true,
      userId: true
    }
  });

  console.log(`\n🎹 Productos de piano (${pianoProducts.length}):`);
  pianoProducts.forEach(p => {
    console.log(`  - ${p.name} (userId: ${p.userId || 'NULL'})`);
  });

  await db.$disconnect();
}

main().catch(console.error);
