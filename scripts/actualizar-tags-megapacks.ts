import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function actualizarTagsMegapacks() {
  try {
    console.log('🔍 Actualizando tags de megapacks...\n');

    // Obtener todos los megapacks
    const megapacks = await prisma.product.findMany({
      where: {
        name: {
          contains: 'Mega Pack'
        }
      }
    });

    console.log(`📦 Total de megapacks encontrados: ${megapacks.length}\n`);

    let actualizados = 0;

    for (const mp of megapacks) {
      // Verificar si ya tiene "megapack" en los tags
      const tagsActuales = mp.tags || '';
      const tagsArray = tagsActuales.split(',').map(t => t.trim()).filter(t => t);
      
      if (!tagsArray.includes('megapack')) {
        // Agregar "megapack" al inicio
        const nuevosTagsArray = ['megapack', 'cursos', 'digital', ...tagsArray];
        const nuevosTags = [...new Set(nuevosTagsArray)].join(',');

        await prisma.product.update({
          where: { id: mp.id },
          data: { tags: nuevosTags }
        });

        console.log(`✅ Actualizado: ${mp.name}`);
        actualizados++;
      } else {
        console.log(`⏭️  Ya tiene tags correctos: ${mp.name}`);
      }
    }

    console.log(`\n✅ Se actualizaron ${actualizados} megapacks`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

actualizarTagsMegapacks();
