#!/usr/bin/env tsx
/**
 * 💰 Actualizar Precios de Productos Dropshipping
 * Agrega margen de ganancia de 20,000 - 25,000 a productos de SmartJoys
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function actualizarPrecios() {
  console.log('💰 Actualizando precios de productos dropshipping...\n');

  // Obtener tu usuario
  const user = await prisma.user.findFirst({
    where: {
      email: { not: 'system@smartsalesbot.com' },
      role: 'ADMIN'
    }
  });

  if (!user) {
    console.error('❌ Usuario no encontrado');
    return;
  }

  console.log(`👤 Usuario: ${user.email}\n`);

  // Obtener productos de SmartJoys (tienen store: "SmartJoys")
  const productos = await prisma.product.findMany({
    where: {
      userId: user.id,
      store: 'SmartJoys'
    }
  });

  console.log(`📦 ${productos.length} productos de dropshipping encontrados\n`);

  if (productos.length === 0) {
    console.log('⚠️  No hay productos de SmartJoys para actualizar');
    console.log('   Ejecuta primero: npm run dropship:copiar\n');
    return;
  }

  let actualizados = 0;

  for (const producto of productos) {
    try {
      // Calcular margen aleatorio entre 20,000 y 25,000
      const margen = Math.floor(Math.random() * 5000) + 20000;
      
      // Obtener precio original del sistema
      const productoSistema = await prisma.product.findFirst({
        where: {
          name: producto.name,
          user: {
            email: 'system@smartsalesbot.com'
          }
        }
      });

      if (!productoSistema) {
        console.log(`  ⚠️  ${producto.name.substring(0, 40)}... (no se encontró original)`);
        continue;
      }

      const precioOriginal = productoSistema.price;
      const precioNuevo = precioOriginal + margen;

      // Actualizar precio
      await prisma.product.update({
        where: { id: producto.id },
        data: { price: precioNuevo }
      });

      console.log(`  ✓ ${producto.name.substring(0, 40)}...`);
      console.log(`    Original: $${precioOriginal.toLocaleString('es-CO')} → Nuevo: $${precioNuevo.toLocaleString('es-CO')} (+$${margen.toLocaleString('es-CO')})`);
      
      actualizados++;

    } catch (error) {
      console.error(`  ✗ Error: ${producto.name}`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`✅ Precios actualizados: ${actualizados}`);
  console.log(`📦 Total de productos: ${productos.length}`);
  console.log(`💰 Margen agregado: $20,000 - $25,000 por producto`);
  console.log('='.repeat(60));

  console.log('\n✅ Precios actualizados con margen de ganancia!\n');

  await prisma.$disconnect();
}

actualizarPrecios().catch(console.error);
