
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import * as fs from 'fs';

async function main() {
  console.log('Checking products in database...');
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      subcategory: true,
      userId: true,
      status: true
    }
  });

  let output = `Found ${products.length} products:\n`;
  products.forEach(p => {
    output += `- [${p.status}] ${p.name} (Cat: ${p.category}, Sub: ${p.subcategory}) - User: ${p.userId}\n`;
  });
  
  fs.writeFileSync('products_dump.txt', output);
  console.log('Dump written to products_dump.txt');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
