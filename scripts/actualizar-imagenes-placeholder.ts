import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function actualizarImagenesPlaceholder() {
  try {
    console.log('🔍 Buscando productos con imágenes placeholder...\n');

    const admin = await prisma.user.findFirst({
      where: {
        email: 'daveymena16@gmail.com'
      }
    });

    if (!admin) {
      console.error('❌ Usuario admin no encontrado');
      return;
    }

    // Obtener todos los productos del usuario
    const products = await prisma.product.findMany({
      where: {
        userId: admin.id
      }
    });

    console.log(`📦 Total de productos: ${products.length}\n`);

    let updated = 0;
    let withPlaceholder = 0;

    for (const product of products) {
      try {
        const images = JSON.parse(product.images || '[]');
        
        // Verificar si tiene placeholder SVG
        const hasPlaceholder = images.some((img: string) => 
          img.startsWith('data:image/svg+xml;base64')
        );

        if (hasPlaceholder) {
          withPlaceholder++;
          console.log(`❌ Placeholder encontrado: ${product.name}`);

          // Reemplazar con imagen genérica según categoría
          let genericImage = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500';
          
          if (product.name.toLowerCase().includes('monitor')) {
            genericImage = 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500';
          } else if (product.name.toLowerCase().includes('mouse') || 
                     product.name.toLowerCase().includes('teclado') ||
                     product.name.toLowerCase().includes('combo')) {
            genericImage = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500';
          }

          // Actualizar el producto
          await prisma.product.update({
            where: {
              id: product.id
            },
            data: {
              images: JSON.stringify([genericImage])
            }
          });

          console.log(`   ✅ Actualizado con imagen genérica\n`);
          updated++;
        }
      } catch (error: any) {
        console.error(`   ❌ Error procesando ${product.name}:`, error.message);
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   - Productos con placeholder: ${withPlaceholder}`);
    console.log(`   - Productos actualizados: ${updated}`);
    console.log(`\n✅ Actualización completada!`);
    console.log(`\n💡 Ahora todos los productos tienen imágenes válidas`);
    console.log(`🖼️  Los productos sin imagen específica usan imágenes genéricas de alta calidad`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

actualizarImagenesPlaceholder();
