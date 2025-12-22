
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Actualizando imágenes de productos...\n');

  // 1. Curso de Piano
  const piano = await prisma.product.updateMany({
    where: {
      OR: [
        { name: { contains: 'Piano', mode: 'insensitive' } },
        { name: { contains: 'Curso de Piano', mode: 'insensitive' } }
      ]
    },
    data: {
      images: JSON.stringify(['/fotos/curso de piano completo .jpg'])
    }
  });
  console.log(`✅ Curso de Piano: ${piano.count} productos actualizados`);

  // 2. Mega Pack 17 (Idiomas) - usar megapack2.jpg
  const megapack17 = await prisma.product.updateMany({
    where: {
      name: { contains: 'Mega Pack 17', mode: 'insensitive' }
    },
    data: {
      images: JSON.stringify(['/fotos/megapack2.jpg'])
    }
  });
  console.log(`✅ Mega Pack 17 (Idiomas): ${megapack17.count} productos actualizados`);

  // 3. Otros Megapacks - usar megapack completo.png
  const otrosMegapacks = await prisma.product.updateMany({
    where: {
      AND: [
        { name: { contains: 'Mega Pack', mode: 'insensitive' } },
        { name: { not: { contains: 'Mega Pack 17' } } }
      ]
    },
    data: {
      images: JSON.stringify(['/fotos/megapack completo.png'])
    }
  });
  console.log(`✅ Otros Megapacks: ${otrosMegapacks.count} productos actualizados`);

  console.log('\n🎉 ¡Imágenes actualizadas correctamente!');
}

main()
  .catch(e => console.error('❌ Error:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });
