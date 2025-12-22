/**
 * ✅ VERIFICAR IMÁGENES DE MEGAPACKS
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarMegapacks() {
  console.log('✅ VERIFICANDO IMÁGENES DE MEGAPACKS\n');

  try {
    const megapacks = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'Mega Pack', mode: 'insensitive' } },
          { name: { contains: 'MegaPack', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        price: true,
        currency: true,
        images: true
      }
    });

    console.log(`📦 Total megapacks: ${megapacks.length}\n`);

    megapacks.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Precio: ${product.price} ${product.currency}`);
      console.log(`   Imagen: ${product.images}`);
      console.log('');
    });

    console.log('✅ VERIFICACIÓN COMPLETADA');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarMegapacks();
