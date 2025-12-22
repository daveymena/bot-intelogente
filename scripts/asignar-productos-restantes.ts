import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function asignarProductosRestantes() {
  console.log('🏷️  Asignando productos restantes...\n');

  try {
    // Monitores
    await prisma.product.updateMany({
      where: {
        subcategory: null,
        name: { contains: 'Monitor', mode: 'insensitive' }
      },
      data: { subcategory: 'MONITORES' }
    });
    console.log('✅ Monitores asignados');

    // Parlantes y Audio
    await prisma.product.updateMany({
      where: {
        subcategory: null,
        OR: [
          { name: { contains: 'Parlante', mode: 'insensitive' } },
          { name: { contains: 'Torre De Sonido', mode: 'insensitive' } },
          { name: { contains: 'Speaker', mode: 'insensitive' } }
        ]
      },
      data: { subcategory: 'AUDIO' }
    });
    console.log('✅ Audio asignado');

    // Diademas
    await prisma.product.updateMany({
      where: {
        subcategory: null,
        name: { contains: 'Diadema', mode: 'insensitive' }
      },
      data: { subcategory: 'DIADEMAS' }
    });
    console.log('✅ Diademas asignadas');

    // Impresoras
    await prisma.product.updateMany({
      where: {
        subcategory: null,
        OR: [
          { name: { contains: 'Impresora', mode: 'insensitive' } },
          { name: { contains: 'Escáner', mode: 'insensitive' } },
          { name: { contains: 'Scanner', mode: 'insensitive' } }
        ]
      },
      data: { subcategory: 'IMPRESORAS' }
    });
    console.log('✅ Impresoras asignadas');

    // Accesorios varios
    await prisma.product.updateMany({
      where: {
        subcategory: null,
        OR: [
          { name: { contains: 'Receptor', mode: 'insensitive' } },
          { name: { contains: 'Smartwatch', mode: 'insensitive' } },
          { name: { contains: 'Reloj', mode: 'insensitive' } },
          { name: { contains: 'Lámpara', mode: 'insensitive' } },
          { name: { contains: 'Hub', mode: 'insensitive' } },
          { name: { contains: 'Micrófono', mode: 'insensitive' } },
          { name: { contains: 'Cámara', mode: 'insensitive' } }
        ]
      },
      data: { subcategory: 'ACCESORIOS' }
    });
    console.log('✅ Accesorios varios asignados');

    // Verificar cuántos quedan sin asignar
    const sinAsignar = await prisma.product.count({
      where: { subcategory: null }
    });

    console.log('\n═══════════════════════════════════════════════');
    console.log(`✨ Proceso completado`);
    console.log(`⚠️  Productos sin subcategoría: ${sinAsignar}`);

    if (sinAsignar > 0) {
      const productos = await prisma.product.findMany({
        where: { subcategory: null },
        select: { name: true, category: true }
      });

      console.log('\nProductos restantes:');
      productos.forEach(p => {
        console.log(`   - ${p.name} (${p.category})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

asignarProductosRestantes();
