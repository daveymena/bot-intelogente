import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImagesFormat() {
  console.log('🔍 Verificando formato de imágenes en la BD...\n');

  try {
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: 'piano',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        images: true,
      },
    });

    console.log(`📦 Productos encontrados: ${products.length}\n`);

    for (const product of products) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📝 ${product.name}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Tipo de images:`, typeof product.images);
      console.log(`Valor raw:`, product.images);
      
      if (product.images) {
        try {
          const parsed = JSON.parse(product.images);
          console.log(`✅ JSON válido:`, parsed);
          console.log(`   Es array:`, Array.isArray(parsed));
          console.log(`   Cantidad:`, parsed.length);
          if (parsed.length > 0) {
            console.log(`   Primera imagen:`, parsed[0]);
            console.log(`   ¿Es ruta local?:`, parsed[0].startsWith('/fotos/') || parsed[0].startsWith('fotos/'));
          }
        } catch (e) {
          console.log(`❌ Error al parsear JSON:`, e);
        }
      } else {
        console.log(`⚠️ images es null o undefined`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImagesFormat();
