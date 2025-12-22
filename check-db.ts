
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Bot Settings ---');
  const settings = await prisma.botSettings.findMany();
  console.log(JSON.stringify(settings, null, 2));

  console.log('\n--- Store Settings ---');
  const storeSettings = await prisma.storeSettings.findMany();
  console.log(JSON.stringify(storeSettings, null, 2));

  console.log('\n--- Products (searching for "piano") ---');
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'piano', mode: 'insensitive' } },
        { description: { contains: 'piano', mode: 'insensitive' } }
      ]
    }
  });
  console.log(JSON.stringify(products, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
