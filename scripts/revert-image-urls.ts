import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function revertImageUrls() {
  console.log('🔄 Revirtiendo URLs de imágenes a rutas locales...\n');

  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        images: true,
      },
    });

    let reverted = 0;
    let errors = 0;

    for (const product of products) {
      try {
        if (!product.images) {
          continue;
        }

        // Parsear el JSON string
        let imagesArray: string[] = [];
        try {
          imagesArray = JSON.parse(product.images);
        } catch {
          continue;
        }

        if (!Array.isArray(imagesArray) || imagesArray.length === 0) {
          continue;
        }

        // Verificar si hay URLs de tecnovariedades.com
        const hasTecnovariedadesUrls = imagesArray.some((img: string) => 
          img.includes('tecnovariedades.com/fotos/')
        );

        if (hasTecnovariedadesUrls) {
          // Convertir URLs completas de vuelta a rutas locales
          const revertedImages = imagesArray.map((img: string) => {
            if (img.includes('tecnovariedades.com/fotos/')) {
              return img.replace('https://tecnovariedades.com/fotos/', '/fotos/');
            }
            return img;
          });

          // Actualizar en la base de datos
          await prisma.product.update({
            where: { id: product.id },
            data: { images: JSON.stringify(revertedImages) },
          });

          console.log(`✅ ${product.name}`);
          console.log(`   Antes: ${imagesArray[0]}`);
          console.log(`   Después: ${revertedImages[0]}\n`);
          reverted++;
        }
      } catch (error) {
        console.error(`❌ Error con ${product.name}:`, error);
        errors++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Productos revertidos: ${reverted}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📊 Total productos: ${products.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

revertImageUrls();
