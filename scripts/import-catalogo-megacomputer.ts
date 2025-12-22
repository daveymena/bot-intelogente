import { PrismaClient, ProductType, ProductStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProductImport {
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  status: string;
  images: string[];
  tags: string[];
  stock: number;
  paymentLinkMercadoPago: string;
  paymentLinkPayPal: string;
  paymentLinkCustom: string;
}

async function importCatalogoMegaComputer() {
  try {
    console.log('🔍 Buscando usuario admin...\n');

    const admin = await prisma.user.findFirst({
      where: {
        email: 'daveymena16@gmail.com'
      }
    });

    if (!admin) {
      console.error('❌ Usuario admin no encontrado');
      console.log('💡 Crea un usuario admin primero con: npx tsx scripts/crear-usuario-admin-smart-sales.js');
      return;
    }

    console.log(`✅ Usuario encontrado: ${admin.email}\n`);

    // Leer el catálogo corregido
    const catalogPath = path.join(process.cwd(), 'catalogo-completo-importar-fixed.json');
    
    if (!fs.existsSync(catalogPath)) {
      console.error('❌ Archivo no encontrado: catalogo-completo-importar-fixed.json');
      console.log('💡 Ejecuta primero: npx tsx scripts/fix-placeholder-images.ts');
      return;
    }

    const catalogData = fs.readFileSync(catalogPath, 'utf-8');
    const products: ProductImport[] = JSON.parse(catalogData);

    console.log(`📦 Total de productos a importar: ${products.length}\n`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const product of products) {
      try {
        // Verificar si el producto ya existe
        const existing = await prisma.product.findFirst({
          where: {
            userId: admin.id,
            name: product.name
          }
        });

        if (existing) {
          console.log(`⏭️  Ya existe: ${product.name}`);
          skipped++;
          continue;
        }

        // Preparar imágenes
        let images = product.images;
        if (!images || images.length === 0 || images[0] === '') {
          // Usar imagen genérica según categoría
          images = ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'];
        }

        // Crear el producto
        await prisma.product.create({
          data: {
            userId: admin.id,
            name: product.name,
            description: product.description,
            price: product.price,
            currency: product.currency,
            category: product.category as ProductType,
            status: product.status as ProductStatus,
            stock: product.stock || 5,
            images: JSON.stringify(images),
            tags: JSON.stringify(product.tags),
            paymentLinkMercadoPago: product.paymentLinkMercadoPago || '',
            paymentLinkPayPal: product.paymentLinkPayPal || '',
            paymentLinkCustom: product.paymentLinkCustom || ''
          }
        });

        console.log(`✅ Importado: ${product.name}`);
        imported++;

      } catch (error: any) {
        console.error(`❌ Error importando ${product.name}:`, error.message);
        errors++;
      }
    }

    console.log(`\n📊 Resumen de importación:`);
    console.log(`   ✅ Importados: ${imported}`);
    console.log(`   ⏭️  Omitidos (ya existían): ${skipped}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`\n🎉 Importación completada!`);
    console.log(`\n💡 Los productos están disponibles en el dashboard`);
    console.log(`🤖 El bot puede recomendar estos productos automáticamente`);

  } catch (error) {
    console.error('❌ Error en la importación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importCatalogoMegaComputer();
