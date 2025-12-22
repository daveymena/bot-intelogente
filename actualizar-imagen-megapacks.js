/**
 * Actualizar imagen de todos los megapacks
 * Nueva imagen: https://hotmart.s3.amazonaws.com/product_pictures/18fa3aaf-7111-40f3-bccf-48bebd8455a2/Frayers1080.png
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const NUEVA_IMAGEN = 'https://hotmart.s3.amazonaws.com/product_pictures/18fa3aaf-7111-40f3-bccf-48bebd8455a2/Frayers1080.png';

async function actualizarImagenMegapacks() {
  console.log('🖼️  Actualizando imagen de megapacks...\n');

  try {
    // Buscar todos los productos que contengan "megapack" en el nombre
    const megapacks = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'megapack', mode: 'insensitive' } },
          { name: { contains: 'mega pack', mode: 'insensitive' } },
          { name: { contains: 'mega-pack', mode: 'insensitive' } },
          { category: 'DIGITAL' },
        ]
      }
    });

    console.log(`📦 Encontrados ${megapacks.length} productos\n`);

    if (megapacks.length === 0) {
      console.log('❌ No se encontraron megapacks en la base de datos');
      return;
    }

    // Mostrar productos encontrados
    console.log('Productos a actualizar:');
    megapacks.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name}`);
      console.log(`     Imagen actual: ${p.images || 'Sin imagen'}`);
    });

    console.log('\n🔄 Actualizando imágenes...\n');

    // Actualizar cada megapack
    let actualizados = 0;
    for (const megapack of megapacks) {
      try {
        await prisma.product.update({
          where: { id: megapack.id },
          data: { images: NUEVA_IMAGEN }
        });

        console.log(`✅ ${megapack.name}`);
        actualizados++;
      } catch (error) {
        console.log(`❌ Error actualizando ${megapack.name}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Actualización completada`);
    console.log(`📊 ${actualizados} de ${megapacks.length} productos actualizados`);
    console.log('='.repeat(60));

    // Verificar actualización
    console.log('\n🔍 Verificando actualización...\n');
    
    const verificacion = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'megapack', mode: 'insensitive' } },
          { name: { contains: 'mega pack', mode: 'insensitive' } },
          { category: 'DIGITAL' },
        ]
      },
      select: {
        name: true,
        images: true
      }
    });

    verificacion.forEach((p, i) => {
      const esNuevaImagen = p.images === NUEVA_IMAGEN;
      const icono = esNuevaImagen ? '✅' : '⚠️';
      console.log(`${icono} ${p.name}`);
      if (!esNuevaImagen) {
        console.log(`   Imagen: ${p.images}`);
      }
    });

    console.log('\n✅ Proceso completado exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
actualizarImagenMegapacks();
