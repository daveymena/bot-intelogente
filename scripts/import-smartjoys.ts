// Script para importar productos de SmartJoys a la base de datos
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ScrapedProduct {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  url: string;
  sku?: string;
}

function categorizeProduct(name: string, description: string): string {
  const text = (name + ' ' + description).toLowerCase();
  
  if (text.match(/audífono|auricular|headphone|earbud/i)) return 'Audífonos';
  if (text.match(/cargador|cable|usb|type-c/i)) return 'Cargadores y Cables';
  if (text.match(/smartwatch|reloj|watch/i)) return 'Smartwatches';
  if (text.match(/parlante|speaker|bocina/i)) return 'Parlantes';
  if (text.match(/power bank|batería|powerbank/i)) return 'Power Banks';
  if (text.match(/funda|case|protector/i)) return 'Accesorios';
  if (text.match(/mouse|teclado|keyboard/i)) return 'Periféricos';
  if (text.match(/cámara|camera/i)) return 'Cámaras';
  if (text.match(/luz|led|lámpara/i)) return 'Iluminación';
  
  return 'Tecnología';
}

async function main() {
  console.log('📦 Importando productos de SmartJoys...\n');

  // Leer archivo JSON
  const jsonPath = path.join(process.cwd(), 'scripts', 'smartjoys-productos.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ No se encontró el archivo smartjoys-productos.json');
    console.log('Primero ejecuta: npx tsx scripts/scrape-smartjoys.ts');
    return;
  }

  const products: ScrapedProduct[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
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
      // Verificar si ya existe
      const existing = await prisma.product.findFirst({
        where: {
          name: product.name,
          userId: user.id,
        }
      });

      const category = categorizeProduct(product.name, product.description);

      if (existing) {
        // Actualizar si el precio cambió
        if (existing.price !== product.price) {
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              price: product.price,
              description: product.description,
              images: JSON.stringify(product.images),
            }
          });
          updated++;
          console.log(`🔄 Actualizado: ${product.name} - $${product.price.toLocaleString()}`);
        } else {
          skipped++;
        }
        continue;
      }

      // Crear nuevo producto
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          currency: 'COP',
          category: 'PHYSICAL',
          status: 'AVAILABLE',
          images: JSON.stringify(product.images),
          tags: JSON.stringify([
            category,
            'dropshipping',
            'smartjoys',
            'tecnología',
          ]),
          autoResponse: `¡Excelente elección! 🎉

${product.name}

💰 Precio: $${product.price.toLocaleString()} COP

📦 Producto de dropshipping - Envío directo desde nuestro proveedor
⏱️ Tiempo de entrega: 3-5 días hábiles
✅ Producto nuevo y original

${product.description}

¿Te gustaría hacer el pedido? 🛒`,
          userId: user.id,
        }
      });

      imported++;
      console.log(`✅ Importado: ${product.name} - $${product.price.toLocaleString()}`);

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
