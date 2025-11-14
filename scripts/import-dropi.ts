// Script para importar productos de Dropi a la base de datos
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface DropiProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  supplier: string;
  sku: string;
  inStock: boolean;
  shippingTime?: string;
}

async function main() {
  console.log('📦 Importando productos de Dropi...\n');

  // Leer archivo JSON
  const jsonPath = path.join(process.cwd(), 'scripts', 'dropi-productos.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ No se encontró el archivo dropi-productos.json');
    console.log('Primero ejecuta: npx tsx scripts/scrape-dropi.ts');
    return;
  }

  const products: DropiProduct[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`📄 Productos encontrados en JSON: ${products.length}\n`);

  // Obtener usuario admin
  const user = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!user) {
    console.error('❌ No se encontró un usuario admin.');
    console.log('Crea uno con: npx tsx scripts/create-admin.ts');
    return;
  }

  console.log(`👤 Importando para usuario: ${user.email}\n`);

  let imported = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of products) {
    try {
      // Verificar si ya existe (por SKU o nombre)
      const existing = await prisma.product.findFirst({
        where: {
          OR: [
            { name: product.name },
            { description: { contains: product.sku } }
          ],
          userId: user.id,
        }
      });

      const discount = product.comparePrice 
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;

      if (existing) {
        // Actualizar si el precio cambió
        if (existing.price !== product.price) {
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              price: product.price,
              description: product.description,
              images: JSON.stringify(product.images),
              status: product.inStock ? 'AVAILABLE' : 'OUT_OF_STOCK',
            }
          });
          updated++;
          console.log(`🔄 Actualizado: ${product.name} - $${product.price.toLocaleString()}`);
        } else {
          skipped++;
        }
        continue;
      }

      // Crear respuesta automática personalizada
      const autoResponse = `¡Excelente elección! 🎉

${product.name}

💰 Precio: $${product.price.toLocaleString()} COP
${product.comparePrice ? `🏷️ Antes: $${product.comparePrice.toLocaleString()} (${discount}% OFF)` : ''}

📦 Producto de dropshipping con ${product.supplier}
⏱️ Tiempo de entrega: ${product.shippingTime || '3-5 días hábiles'}
✅ Producto nuevo y original
${product.inStock ? '✅ En stock' : '⚠️ Consultar disponibilidad'}

${product.description}

¿Te gustaría hacer el pedido? 🛒`;

      // Crear nuevo producto
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          currency: 'COP',
          category: 'PHYSICAL',
          status: product.inStock ? 'AVAILABLE' : 'OUT_OF_STOCK',
          images: JSON.stringify(product.images),
          tags: JSON.stringify([
            product.category,
            'dropshipping',
            'dropi',
            product.supplier,
            product.sku,
          ]),
          autoResponse,
          userId: user.id,
        }
      });

      imported++;
      console.log(`✅ Importado: ${product.name} - $${product.price.toLocaleString()}`);
      if (discount > 0) {
        console.log(`   🏷️ Descuento: ${discount}%`);
      }

    } catch (error) {
      errors++;
      console.error(`❌ Error con ${product.name}:`, error);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE IMPORTACIÓN');
  console.log('='.repeat(50));
  console.log(`✅ Nuevos productos: ${imported}`);
  console.log(`🔄 Actualizados: ${updated}`);
  console.log(`⏭️  Omitidos: ${skipped}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📦 Total procesados: ${products.length}`);
  console.log('='.repeat(50) + '\n');

  console.log('🎉 Importación completada!');
  console.log('\nPuedes ver los productos en:');
  console.log('http://localhost:3000/dashboard');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
