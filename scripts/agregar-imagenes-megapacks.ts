import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function agregarImagenesMegapacks() {
  console.log('🖼️  Agregando imágenes a productos digitales...\n');

  try {
    const usuario = await prisma.user.findUnique({
      where: { email: 'daveymena16@gmail.com' },
      include: {
        products: {
          where: {
            category: 'DIGITAL'
          }
        }
      }
    });

    if (!usuario) {
      console.error('❌ Usuario no encontrado');
      return;
    }

    console.log(`✅ Usuario: ${usuario.email}`);
    console.log(`📦 Productos digitales: ${usuario.products.length}\n`);

    // Imágenes locales de megapacks
    const imagenesMegapack = [
      '/fotos/megapack2.jpg'
    ];

    const imagenCursoPiano = [
      '/fotos/megapack2.jpg'
    ];

    const imagenPackCompleto = [
      '/fotos/megapack completo.png'
    ];

    let actualizados = 0;

    for (const producto of usuario.products) {
      try {
        let imagenes: string[];

        // Seleccionar imágenes según el tipo de producto
        if (producto.name.includes('Piano')) {
          imagenes = imagenCursoPiano;
        } else if (producto.name.includes('PACK COMPLETO')) {
          imagenes = imagenPackCompleto;
        } else {
          imagenes = imagenesMegapack;
        }

        await prisma.product.update({
          where: { id: producto.id },
          data: {
            images: JSON.stringify(imagenes)
          }
        });

        console.log(`✅ ${producto.name}`);
        actualizados++;

      } catch (error: any) {
        console.error(`❌ Error con ${producto.name}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN');
    console.log('='.repeat(60));
    console.log(`✅ Productos actualizados: ${actualizados}`);
    console.log(`📦 Total procesados: ${usuario.products.length}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

agregarImagenesMegapacks();
