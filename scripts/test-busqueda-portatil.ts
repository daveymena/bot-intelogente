import { db } from '../src/lib/db';

async function testBusqueda() {
  console.log('🔍 Buscando portátiles...\n');
  
  const products = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: 'portatil', mode: 'insensitive' } },
        { name: { contains: 'portátil', mode: 'insensitive' } },
        { name: { contains: 'laptop', mode: 'insensitive' } },
      ]
    },
    take: 10
  });
  
  console.log(`✅ Encontrados: ${products.length} productos\n`);
  
  products.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`);
    console.log(`   💰 $${p.price.toLocaleString('es-CO')} ${p.currency}`);
    console.log(`   📂 Categoría: ${p.category}`);
    console.log('');
  });
  
  // Buscar el mouse que apareció
  console.log('\n🔍 Buscando el mouse que apareció...\n');
  
  const mouse = await db.product.findFirst({
    where: {
      name: { contains: 'Mouse Trust Fyda', mode: 'insensitive' }
    }
  });
  
  if (mouse) {
    console.log('❌ PROBLEMA: Este mouse apareció cuando no debería:');
    console.log(`   Nombre: ${mouse.name}`);
    console.log(`   Categoría: ${mouse.category}`);
    console.log(`   ID: ${mouse.id}`);
  }
}

testBusqueda()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
