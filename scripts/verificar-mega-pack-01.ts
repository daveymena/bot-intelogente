import { db } from '../src/lib/db';

async function verificar() {
  const megaPack01 = await db.product.findFirst({
    where: {
      name: {
        contains: 'Mega Pack 01',
        mode: 'insensitive'
      }
    }
  });

  if (megaPack01) {
    console.log('✅ MEGA PACK 01 ENCONTRADO:');
    console.log('   Nombre:', megaPack01.name);
    console.log('   Precio:', megaPack01.price);
    console.log('   Descripción:', megaPack01.description?.substring(0, 100));
    console.log('   Subcategoría:', megaPack01.subcategory);
  } else {
    console.log('❌ Mega Pack 01 NO encontrado');
  }

  // Buscar todos los megapacks de diseño
  const disenoProducts = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: 'diseño', mode: 'insensitive' } },
        { description: { contains: 'diseño', mode: 'insensitive' } },
        { subcategory: { contains: 'diseño', mode: 'insensitive' } }
      ]
    }
  });

  console.log(`\n📦 Productos con "diseño": ${disenoProducts.length}`);
  disenoProducts.forEach(p => {
    console.log(`   - ${p.name} (${p.subcategory || 'sin categoría'})`);
  });

  await db.$disconnect();
}

verificar();
