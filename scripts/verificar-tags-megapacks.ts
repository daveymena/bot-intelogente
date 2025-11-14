import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarTags() {
  try {
    const mp11 = await prisma.product.findFirst({
      where: { name: { contains: 'Mega Pack 11' } }
    });

    console.log('Mega Pack 11:');
    console.log('Tags:', mp11?.tags);
    console.log('Tipo:', typeof mp11?.tags);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarTags();
