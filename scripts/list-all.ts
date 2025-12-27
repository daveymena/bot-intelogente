
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
const prisma = new PrismaClient();

async function listAll() {
  try {
    const products = await prisma.product.findMany({
      select: { name: true, id: true }
    });
    fs.writeFileSync('all_products.txt', products.map(p => p.name).join('\n'));
    console.log('Listed ' + products.length + ' products in all_products.txt');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

listAll();
