#!/usr/bin/env tsx
/**
 * 📦 Importar Catálogo Compartido de Dropshipping
 * Los usuarios pueden activar estos productos en su tienda
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const SMARTJOYS_FILE = path.join(process.cwd(), 'data', 'smartjoys-dropshipping.json');

// Usuario sistema para productos compartidos
const SYSTEM_USER_EMAIL = 'system@smartsalesbot.com';

async function importSharedProducts() {
  console.log('📦 Importando catálogo compartido de dropshipping...\n');

  // 1. Verificar archivo
  if (!fs.existsSync(SMARTJOYS_FILE)) {
    console.error('❌ Archivo no encontrado:', SMARTJOYS_FILE);
    console.log('\nEjecuta primero:');
    console.log('  npm run scrape:smartjoys\n');
    return;
  }

  // 2. Leer productos
  const products = JSON.parse(fs.readFileSync(SMARTJOYS_FILE, 'utf-8'));
  console.log(`📊 ${products.length} productos encontrados\n`);

  // 3. Crear/obtener usuario sistema
  let systemUser = await prisma.user.findUnique({
    where: { email: SYSTEM_USER_EMAIL }
  });

  if (!systemUser) {
    console.log('👤 Creando usuario sistema...');
    systemUser = await prisma.user.create({
      data: {
        email: SYSTEM_USER_EMAIL,
        name: 'Sistema - Catálogo Compartido',
        password: 'SYSTEM_USER_NO_LOGIN',
        role: 'ADMIN',
        isActive: true,
        businessName: 'Catálogo Dropshipping Compartido'
      }
    });
    console.log('✅ Usuario sistema creado\n');
  }

  // 4. Importar productos
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    try {
      // Verificar si ya existe (por nombre)
      const existing = await prisma.product.findFirst({
        where: {
          userId: systemUser.id,
          name: product.name
        }
      });

      const productData = {
        name: product.name,
        description: product.description,
        price: product.price,
        currency: 'COP',
        category: 'PHYSICAL',
        subcategory: product.category,
        store: 'SmartJoys',
        status: product.inStock ? 'AVAILABLE' : 'OUT_OF_STOCK',
        images: JSON.stringify(product.images),
        tags: JSON.stringify(product.tags),
        userId: systemUser.id,
        // Agregar metadata de dropshipping
        autoResponse: `Este es un producto de dropshipping de SmartJoys. 
Tiempo de entrega: 4-5 días hábiles.
Contraentrega disponible.
Precio: $${product.price.toLocaleString('es-CO')} COP`,
        smartTags: JSON.stringify({
          dropshipping: true,
          supplier: 'SmartJoys',
          supplierUrl: product.url,
          sku: product.sku,
          originalPrice: product.originalPrice
        })
      };

      if (existing) {
        // Actualizar
        await prisma.product.update({
          where: { id: existing.id },
          data: productData
        });
        updated++;
        console.log(`  ↻ ${product.name.substring(0, 50)}...`);
      } else {
        // Crear nuevo
        await prisma.product.create({
          data: productData
        });
        imported++;
        console.log(`  ✓ ${product.name.substring(0, 50)}...`);
      }

    } catch (error) {
      console.error(`  ✗ Error: ${product.name}`, error);
      skipped++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE IMPORTACIÓN');
  console.log('='.repeat(60));
  console.log(`✅ Importados: ${imported}`);
  console.log(`↻  Actualizados: ${updated}`);
  console.log(`⏭️  Omitidos: ${skipped}`);
  console.log(`📦 Total: ${products.length}`);
  console.log('='.repeat(60));

  console.log('\n💡 Estos productos están disponibles como catálogo compartido.');
  console.log('   Los usuarios pueden activarlos en su tienda desde el dashboard.\n');

  await prisma.$disconnect();
}

importSharedProducts().catch(console.error);
