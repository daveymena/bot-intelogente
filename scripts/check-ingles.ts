
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
const prisma = new PrismaClient();

async function checkIngles() {
  try {
    const product = await prisma.product.findFirst({
      where: {
        name: { contains: 'Inglés' }
      }
    });
    if (product) {
       fs.writeFileSync('ingles_details.txt', JSON.stringify(product, null, 2));
       console.log('Details written to ingles_details.txt');
    } else {
       console.log('Product Cursos Inglés not found');
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkIngles();
