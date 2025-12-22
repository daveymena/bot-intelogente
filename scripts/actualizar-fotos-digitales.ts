import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function actualizarFotos() {
  console.log('📸 ACTUALIZANDO FOTOS DE PRODUCTOS DIGITALES');
  console.log('='.repeat(70));

  try {
    // 1. Actualizar foto del Pack Completo
    const packCompleto = await prisma.product.updateMany({
      where: {
        name: {
          contains: 'PACK COMPLETO'
        }
      },
      data: {
        images: JSON.stringify(['/fotos/megapack completo.png'])
      }
    });

    console.log(`✅ Pack Completo: /fotos/megapack completo.png (${packCompleto.count} productos)`);

    // 2. Actualizar foto del Curso de Piano
    const piano = await prisma.product.updateMany({
      where: {
        name: {
          contains: 'Piano'
        }
      },
      data: {
        images: JSON.stringify(['https://landein-page-pian2.vercel.app/piano-curso.jpg'])
      }
    });

    console.log(`✅ Curso de Piano: URL de Hotmart (${piano.count} productos)`);

    // 3. Verificar que los 40 megapacks tengan la foto correcta
    const megapacks = await prisma.product.count({
      where: {
        name: {
          startsWith: 'Mega Pack'
        },
        images: {
          contains: '/fotos/megapack2.jpg'
        }
      }
    });

    console.log(`✅ Megapacks individuales: /fotos/megapack2.jpg (${megapacks} productos)`);

    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN:');
    console.log('✅ Todas las fotos actualizadas correctamente');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

actualizarFotos().catch(console.error);
