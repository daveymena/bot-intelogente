/**
 * 📸 ACTUALIZAR IMÁGENES DE MEGAPACKS
 * Asigna las imágenes correctas a los productos megapack
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function actualizarImagenesMegapacks() {
  console.log('📸 ACTUALIZANDO IMÁGENES DE MEGAPACKS\n');

  try {
    // Buscar todos los productos megapack
    const megapacks = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'Mega Pack', mode: 'insensitive' } },
          { name: { contains: 'MegaPack', mode: 'insensitive' } }
        ]
      }
    });

    console.log(`📦 Productos megapack encontrados: ${megapacks.length}\n`);

    for (const product of megapacks) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 Producto: ${product.name}`);
      console.log(`💰 Precio: ${product.price} ${product.currency}`);
      console.log(`🆔 ID: ${product.id}`);

      let imagenAsignar = '';

      // Megapack Completo (40 productos) - Precio 60,000
      if (product.price === 60000 || 
          product.name.toLowerCase().includes('completo') ||
          product.name.toLowerCase().includes('40')) {
        imagenAsignar = '/fotos/megapack completo.png';
        console.log('🎯 Tipo: Megapack Completo (40 productos)');
      }
      // Megapacks Individuales - Precio 20,000
      else if (product.price === 20000) {
        imagenAsignar = 'https://drive.google.com/file/d/1-i-Vm144gHiWZ8Bnxssv9i_lwehXAa1h/view?usp=sharing';
        console.log('🎯 Tipo: Megapack Individual (Unitario)');
      }
      else {
        console.log('⚠️  Precio no reconocido, usando imagen por defecto');
        imagenAsignar = 'https://drive.google.com/file/d/1-i-Vm144gHiWZ8Bnxssv9i_lwehXAa1h/view?usp=sharing';
      }

      console.log(`📸 Imagen asignada: ${imagenAsignar}`);

      // Actualizar producto
      await prisma.product.update({
        where: { id: product.id },
        data: {
          images: JSON.stringify([imagenAsignar])
        }
      });

      console.log('✅ Producto actualizado');
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('\n🎉 ACTUALIZACIÓN COMPLETADA\n');

    // Mostrar resumen
    console.log('📊 RESUMEN:');
    console.log(`   Total de megapacks actualizados: ${megapacks.length}`);
    console.log('');
    console.log('📸 IMÁGENES ASIGNADAS:');
    console.log('   Megapack Completo (60,000 COP): /fotos/megapack completo.png');
    console.log('   Megapack Individual (20,000 COP): https://drive.google.com/file/d/1-i-Vm144gHiWZ8Bnxssv9i_lwehXAa1h/view?usp=sharing');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
actualizarImagenesMegapacks();
