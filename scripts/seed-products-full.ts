// scripts/seed-products-full.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Iniciando sincronización de catálogo COMPLETO desde JSON...');
  
  const jsonPath = path.join(process.cwd(), 'products_catalog_full.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Error: No se encontró el archivo ${jsonPath}`);
    process.exit(1);
  }

  const productsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const user = await prisma.user.findUnique({
    where: { email: 'daveymena16@gmail.com' }
  });

  if (!user) {
    console.error('❌ Error: Usuario administrador no encontrado (daveymena16@gmail.com).');
    process.exit(1);
  }

  console.log(`📦 Procesando ${productsData.length} productos...`);

  for (const product of productsData) {
    try {
      await prisma.product.upsert({
        where: { id: product.id },
        update: {
          name: product.name,
          description: product.description,
          price: product.price,
          currency: product.currency,
          category: product.category as any,
          images: JSON.stringify(product.images),
          tags: product.tags ? product.tags.join(',') : '',
          mainCategory: product.mainCategory,
          status: product.status as any,
          stock: product.stock || 0,
          paymentLinkMercadoPago: product.paymentLinkMercadoPago || null,
          paymentLinkPayPal: product.paymentLinkPayPal || null,
          deliveryLink: product.deliveryLink || null
        },
        create: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          currency: product.currency,
          category: product.category as any,
          images: JSON.stringify(product.images),
          tags: product.tags ? product.tags.join(',') : '',
          mainCategory: product.mainCategory,
          status: product.status as any,
          stock: product.stock || 0,
          userId: user.id,
          paymentLinkMercadoPago: product.paymentLinkMercadoPago || null,
          paymentLinkPayPal: product.paymentLinkPayPal || null,
          deliveryLink: product.deliveryLink || null
        }
      });
      console.log(`  ✅ ${product.name}`);
    } catch (e: any) {
      console.error(`  ❌ Error sincronizando ${product.name}: ${e.message}`);
    }
  }

  const finalCount = await prisma.product.count();
  console.log(`\n🚀 Catálogo completo sincronizado exitosamente. Total: ${finalCount} productos.`);
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
