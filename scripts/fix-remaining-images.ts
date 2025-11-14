import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixRemainingImages() {
  try {
    console.log('🔧 Arreglando imágenes restantes...\n');

    const admin = await prisma.user.findFirst({
      where: {
        email: 'daveymena16@gmail.com'
      }
    });

    if (!admin) {
      console.error('❌ Usuario admin no encontrado');
      return;
    }

    const products = await prisma.product.findMany({
      where: {
        userId: admin.id
      }
    });

    let fixed = 0;

    for (const product of products) {
      try {
        let images: string[] = [];
        let needsUpdate = false;

        // Intentar parsear las imágenes
        if (product.images) {
          try {
            images = JSON.parse(product.images);
          } catch (e) {
            images = [product.images];
          }
        }

        // Verificar si necesita actualización
        if (!images || images.length === 0 || images[0] === '' || 
            !images[0].startsWith('http')) {
          needsUpdate = true;
        }

        if (needsUpdate) {
          // Asignar imagen genérica según tipo
          let genericImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500';

          if (product.name.toLowerCase().includes('mega pack')) {
            genericImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500';
          } else if (product.name.toLowerCase().includes('combo') ||
                     product.name.toLowerCase().includes('teclado') ||
                     product.name.toLowerCase().includes('mouse')) {
            genericImage = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500';
          }

          await prisma.product.update({
            where: {
              id: product.id
            },
            data: {
              images: JSON.stringify([genericImage])
            }
          });

          console.log(`✅ Arreglado: ${product.name}`);
          fixed++;
        }
      } catch (error: any) {
        console.error(`❌ Error con ${product.name}:`, error.message);
      }
    }

    console.log(`\n📊 Total arreglados: ${fixed}`);
    console.log(`\n✅ Proceso completado!`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRemainingImages();
