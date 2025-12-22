const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function verificar() {
  console.log('\n🔍 VERIFICANDO PRODUCTOS DE IDIOMAS\n');
  
  // Buscar productos con "idiomas" o "inglés" en el nombre
  const productos = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: 'idiomas', mode: 'insensitive' } },
        { name: { contains: 'inglés', mode: 'insensitive' } },
        { name: { contains: 'ingles', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      name: true,
      price: true,
      description: true,
      tags: true,
      images: true
    }
  });

  console.log(`✅ Encontrados ${productos.length} productos:\n`);
  
  productos.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`);
    console.log(`   ID: ${p.id}`);
    console.log(`   Precio: ${p.price.toLocaleString('es-CO')} COP`);
    console.log(`   Tags: ${p.tags ? p.tags.join(', ') : 'Sin tags'}`);
    console.log(`   Descripción: ${p.description?.substring(0, 100)}...`);
    console.log(`   Imágenes: ${p.images ? p.images.length : 0} foto(s)`);
    console.log('');
  });

  await db.$disconnect();
}

verificar().catch(console.error);
