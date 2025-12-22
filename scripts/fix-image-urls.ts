import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixImageUrls() {
  console.log('🔍 Buscando productos con rutas de imagen locales...\n');

  try {
    // Obtener todos los productos
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        images: true,
      },
    });

    let fixed = 0;
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
          // Si no es JSON válido, saltar
          continue;
        }

        if (!Array.isArray(imagesArray) || imagesArray.length === 0) {
          continue;
        }

        // Verificar si hay imágenes con rutas locales
        const hasLocalPaths = imagesArray.some((img: string) => 
          img.startsWith('/fotos/') || img.startsWith('fotos/')
        );

        if (hasLocalPaths) {
          // Convertir rutas locales a URLs completas
          const fixedImages = imagesArray.map((img: string) => {
            if (img.startsWith('/fotos/')) {
              return `https://tecnovariedades.com${img}`;
            } else if (img.startsWith('fotos/')) {
              return `https://tecnovariedades.com/${img}`;
            }
            return img;
          });

          // Actualizar en la base de datos (guardar como JSON string)
          await prisma.product.update({
            where: { id: product.id },
            data: { images: JSON.stringify(fixedImages) },
          });

          console.log(`✅ ${product.name}`);
          console.log(`   Antes: ${imagesArray[0]}`);
          console.log(`   Después: ${fixedImages[0]}\n`);
          fixed++;
        }
      } catch (error) {
        console.error(`❌ Error con ${product.name}:`, error);
        errors++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Productos corregidos: ${fixed}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📊 Total productos: ${products.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImageUrls();
