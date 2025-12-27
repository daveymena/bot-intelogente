import { db } from '../src/lib/db';

async function main() {
  console.log('🔍 Verificando productos en la base de datos...\n');

  // Contar todos los productos
  const totalProducts = await db.product.count();
  console.log(`📊 Total de productos: ${totalProducts}`);

  // Contar productos AVAILABLE
  const availableProducts = await db.product.count({
    where: { status: 'AVAILABLE' }
  });
  console.log(`✅ Productos AVAILABLE: ${availableProducts}`);

  // Contar productos por status
  const allProducts = await db.product.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      userId: true
    }
  });

  console.log('\n📋 Lista de productos:');
  allProducts.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} - Status: ${p.status} - UserId: ${p.userId || 'NULL'}`);
  });

  // Buscar productos con "piano"
  const pianoProducts = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: 'piano', mode: 'insensitive' } },
        { name: { contains: 'Piano', mode: 'insensitive' } }
      ]
    }
  });

  console.log(`\n🎹 Productos con "piano": ${pianoProducts.length}`);
  pianoProducts.forEach(p => {
    console.log(`  - ${p.name} (Status: ${p.status})`);
  });

  await db.$disconnect();
}

main().catch(console.error);
