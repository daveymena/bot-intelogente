import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verCursoPiano() {
  try {
    const producto = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'Piano',
          mode: 'insensitive'
        }
      }
    });

    if (producto) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('PRODUCTO ENCONTRADO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('ID:', producto.id);
      console.log('Nombre:', producto.name);
      console.log('Precio:', producto.price);
      console.log('Categoría:', producto.category);
      console.log('Subcategoría:', producto.subcategory);
      console.log('\nDescripción:');
      console.log(producto.description || '(Sin descripción)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.log('❌ No se encontró el curso de piano');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verCursoPiano();
