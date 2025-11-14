import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarImagenesProductos() {
  try {
    console.log('🔍 Verificando imágenes de productos...\n');

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
      },
      select: {
        id: true,
        name: true,
        images: true
      }
    });

    console.log(`📦 Total de productos: ${products.length}\n`);

    let sinImagenes = 0;
    let conImagenesValidas = 0;
    let conImagenesInvalidas = 0;

    for (const product of products) {
      try {
        let images: string[] = [];
        
        // Intentar parsear las imágenes
        if (product.images) {
          try {
            images = JSON.parse(product.images);
          } catch (e) {
            // Si no es JSON válido, puede ser una ruta simple
            images = [product.images];
          }
        }

        if (!images || images.length === 0 || images[0] === '') {
          console.log(`❌ Sin imágenes: ${product.name}`);
          sinImagenes++;
        } else if (images[0].startsWith('http://') || images[0].startsWith('https://')) {
          console.log(`✅ Imagen válida: ${product.name}`);
          conImagenesValidas++;
        } else {
          console.log(`⚠️  Imagen inválida: ${product.name}`);
          console.log(`   Ruta: ${images[0]}`);
          conImagenesInvalidas++;
        }
      } catch (error: any) {
        console.log(`❌ Error parseando: ${product.name}`);
        console.log(`   Error: ${error.message}`);
        conImagenesInvalidas++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Con imágenes válidas: ${conImagenesValidas}`);
    console.log(`   ⚠️  Con imágenes inválidas: ${conImagenesInvalidas}`);
    console.log(`   ❌ Sin imágenes: ${sinImagenes}`);
    console.log(`   📦 Total: ${products.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarImagenesProductos();
