#!/usr/bin/env tsx
/**
 * 📦 Copiar Productos de Dropshipping a Usuario
 * Copia productos del catálogo compartido a un usuario específico
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function copiarProductos() {
  console.log('📦 Copiando productos de dropshipping...\n');

  // 1. Obtener usuario sistema
  const systemUser = await prisma.user.findUnique({
    where: { email: 'system@smartsalesbot.com' }
  });

  if (!systemUser) {
    console.error('❌ Usuario sistema no encontrado');
    return;
  }

  // 2. Obtener tu usuario (el primero que no sea sistema)
  const targetUser = await prisma.user.findFirst({
    where: {
      email: { not: 'system@smartsalesbot.com' },
      role: 'ADMIN'
    }
  });

  if (!targetUser) {
    console.error('❌ No se encontró usuario destino');
    return;
  }

  console.log(`👤 Usuario destino: ${targetUser.email}\n`);

  // 3. Obtener productos del sistema
  const sharedProducts = await prisma.product.findMany({
    where: { userId: systemUser.id }
  });

  console.log(`📊 ${sharedProducts.length} productos encontrados en catálogo compartido\n`);

  // 4. Copiar productos
  let copied = 0;
  let skipped = 0;

  for (const product of sharedProducts) {
    try {
      // Verificar si ya existe
      const existing = await prisma.product.findFirst({
        where: {
          userId: targetUser.id,
          name: product.name
        }
      });

      if (existing) {
        console.log(`  ⏭️  ${product.name.substring(0, 50)}... (ya existe)`);
        skipped++;
        continue;
      }

      // Calcular precio con margen de ganancia (20,000 - 25,000)
      const margen = Math.floor(Math.random() * 5000) + 20000; // Entre 20,000 y 25,000
      const precioConMargen = product.price + margen;

      // Copiar producto
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: precioConMargen,
          currency: product.currency,
          category: product.category,
          subcategory: product.subcategory,
          store: product.store,
          status: product.status,
          images: product.images,
          tags: product.tags,
          autoResponse: product.autoResponse,
          smartTags: product.smartTags,
          userId: targetUser.id
        }
      });

      console.log(`  ✓ ${product.name.substring(0, 50)}...`);
      copied++;

    } catch (error) {
      console.error(`  ✗ Error: ${product.name}`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`✅ Copiados: ${copied}`);
  console.log(`⏭️  Omitidos: ${skipped}`);
  console.log(`📦 Total: ${sharedProducts.length}`);
  console.log('='.repeat(60));

  console.log(`\n✅ Los productos ahora están disponibles en el dashboard de ${targetUser.email}\n`);

  await prisma.$disconnect();
}

copiarProductos().catch(console.error);
