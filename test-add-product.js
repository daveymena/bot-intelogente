const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestProduct() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found');
      return;
    }

    const product = await prisma.product.create({
      data: {
        name: 'Curso de Piano Completo',
        description: 'Aprende piano desde cero hasta nivel avanzado. Incluye teoría musical, técnica de dedos, lectura de partituras y ejercicios prácticos.',
        price: 150000,
        currency: 'COP',
        category: 'DIGITAL',
        tags: 'piano,musica,curso,digital,teoria,tecnica',
        userId: user.id
      }
    });

    console.log('Product added:', product.name);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestProduct();