// Script para eliminar megapacks, moto y curso de piano de la BD
// Antes de importar los nuevos con fotos correctas

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function limpiarProductos() {
  console.log('🗑️  Eliminando productos sin fotos correctas...\n');

  try {
    // 1. Eliminar todos los Megapacks
    console.log('📦 Eliminando Megapacks...');
    const megapacks = await prisma.product.deleteMany({
      where: {
        name: {
          contains: 'Mega Pack',
          mode: 'insensitive'
        }
      }
    });
    console.log(`   ✅ ${megapacks.count} megapacks eliminados`);

    // 2. Eliminar Moto Bajaj
    console.log('\n🏍️  Eliminando Moto Bajaj...');
    const moto = await prisma.product.deleteMany({
      where: {
        name: {
          contains: 'Moto Bajaj',
          mode: 'insensitive'
        }
      }
    });
    console.log(`   ✅ ${moto.count} moto(s) eliminada(s)`);

    // 3. Eliminar Curso de Piano
    console.log('\n🎹 Eliminando Curso de Piano...');
    const piano = await prisma.product.deleteMany({
      where: {
        name: {
          contains: 'Piano',
          mode: 'insensitive'
        }
      }
    });
    console.log(`   ✅ ${piano.count} curso(s) de piano eliminado(s)`);

    // Resumen
    const totalEliminados = megapacks.count + moto.count + piano.count;
    console.log(`\n✅ LIMPIEZA COMPLETADA!`);
    console.log(`📊 Total eliminados: ${totalEliminados} productos`);
    console.log(`\n🚀 Próximos pasos:`);
    console.log(`   1. Importar productos con fotos: npm run import:productos`);
    console.log(`   2. O usar: npx tsx scripts/import-productos-completos.ts`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

limpiarProductos();
