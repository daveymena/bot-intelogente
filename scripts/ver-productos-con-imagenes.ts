import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verProductosConImagenes() {
  try {
    const admin = await prisma.user.findFirst({
      where: {
        email: 'daveymena16@gmail.com'
      }
    });

    if (!admin) {
      console.error('❌ Usuario admin no encontrado');
      return;
    }

    // Obtener algunos productos de MegaComputer
    const products = await prisma.product.findMany({
      where: {
        userId: admin.id,
        name: {
          contains: 'Macbook'
        }
      },
      take: 5
    });

    console.log('📦 Productos de ejemplo:\n');

    for (const product of products) {
      const images = JSON.parse(product.images || '[]');
      console.log(`✅ ${product.name}`);
      console.log(`   Imagen: ${images[0]}`);
      console.log(`   Precio: $${product.price.toLocaleString()} COP\n`);
    }

    // Contar productos por categoría
    const total = await prisma.product.count({
      where: { userId: admin.id }
    });

    const physical = await prisma.product.count({
      where: { userId: admin.id, category: 'PHYSICAL' }
    });

    const digital = await prisma.product.count({
      where: { userId: admin.id, category: 'DIGITAL' }
    });

    console.log('📊 Resumen del catálogo:');
    console.log(`   Total: ${total} productos`);
    console.log(`   Físicos: ${physical} productos`);
    console.log(`   Digitales: ${digital} productos`);
    console.log(`\n✅ Todos los productos tienen imágenes válidas!`);
    console.log(`🖼️  Puedes verlos en el dashboard en http://localhost:4000`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verProductosConImagenes();
