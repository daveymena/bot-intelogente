/**
 * Script para importar productos de Disyvar a la base de datos
 * Lee el JSON generado por scrape-disyvar.ts e importa los productos
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface DisyvarProduct {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  url: string;
  sku?: string;
  brand?: string;
  stock?: string;
  specifications?: Record<string, string>;
}

async function main() {
  console.log('🚀 Iniciando importación de productos Disyvar...\n');

  // Leer archivo JSON
  const jsonPath = path.join(process.cwd(), 'scripts', 'disyvar-productos.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ No se encontró el archivo disyvar-productos.json');
    console.error('   Ejecuta primero: npx tsx scripts/scrape-disyvar.ts');
    return;
  }

  const products: DisyvarProduct[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`📦 Productos a importar: ${products.length}\n`);

  // Obtener usuario admin
  const user = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!user) {
    console.error('❌ No se encontró un usuario admin');
    console.error('   Crea uno primero con: npx tsx scripts/create-admin.ts');
    return;
  }

  console.log(`👤 Importando como: ${user.email}\n`);

  let imported = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    try {
      // Verificar si ya existe por nombre
      const existing = await prisma.product.findFirst({
        where: {
          name: product.name,
          userId: user.id,
        }
      });

      // Preparar tags
      const tags = [
        product.category,
        'dropshipping',
        'disyvar',
        product.brand,
        product.subcategory,
      ].filter(Boolean);

      // Preparar datos del producto
      const productData = {
        name: product.name,
        description: product.description,
        price: product.price,
        currency: 'COP',
        category: 'PHYSICAL',
        status: 'AVAILABLE',
        images: JSON.stringify(product.images),
        tags: JSON.stringify(tags),
        userId: user.id,
      };

      if (existing) {
        // Actualizar producto existente
        await prisma.product.update({
          where: { id: existing.id },
          data: productData,
        });
        updated++;
        console.log(`✏️  [${i + 1}/${products.length}] Actualizado: ${product.name.slice(0, 50)}`);
      } else {
        // Crear nuevo producto
        await prisma.product.create({
          data: productData,
        });
        imported++;
        console.log(`✅ [${i + 1}/${products.length}] Importado: ${product.name.slice(0, 50)}`);
      }

    } catch (error: any) {
      errors++;
      console.error(`❌ [${i + 1}/${products.length}] Error: ${product.name.slice(0, 50)}`);
      console.error(`   ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Resumen de Importación:');
  console.log(`   ✅ Nuevos productos: ${imported}`);
  console.log(`   ✏️  Productos actualizados: ${updated}`);
  console.log(`   ⏭️  Omitidos: ${skipped}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📦 Total procesados: ${products.length}`);

  // Estadísticas por categoría
  const categoryCounts: Record<string, number> = {};
  products.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  console.log('\n📈 Productos por categoría:');
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });

  console.log('\n✨ Importación completada!');
  console.log('\n📝 Los productos están disponibles en:');
  console.log('   - Dashboard: http://localhost:3000');
  console.log('   - Catálogo: http://localhost:3000/catalogo');
  console.log('   - Tienda: http://localhost:3000/tienda\n');
}

main()
  .catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
