import { db } from './src/lib/db';

async function checkProductImages() {
  const productos = await db.product.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      images: true
    }
  });

  console.log('=== PRODUCTOS CON FOTOS ===');
  productos
    .filter(p => p.images && p.images !== '[]' && p.images !== 'null')
    .forEach(p => console.log(`✅ ${p.name} (${p.category})`));

  console.log('\n=== PRODUCTOS SIN FOTOS ===');
  productos
    .filter(p => !p.images || p.images === '[]' || p.images === 'null')
    .forEach(p => console.log(`❌ ${p.name} (${p.category})`));

  await db.$disconnect();
}

checkProductImages();
