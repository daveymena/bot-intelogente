const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function buscar() {
  try {
    console.log('🔍 Buscando productos de Piano y Música...\n');
    
    const productos = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'piano', mode: 'insensitive' } },
          { name: { contains: 'música', mode: 'insensitive' } },
          { name: { contains: 'musica', mode: 'insensitive' } }
        ],
        status: 'AVAILABLE'
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        tags: true
      }
    });
    
    console.log(`✅ Encontrados ${productos.length} productos:\n`);
    
    productos.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Precio: $${p.price.toLocaleString('es-CO')}`);
      console.log(`   Descripción: ${p.description?.substring(0, 80)}...`);
      console.log(`   Tags: ${p.tags || 'Sin tags'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

buscar();
