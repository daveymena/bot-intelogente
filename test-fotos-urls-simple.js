/**
 * Test Simple: Verificar URLs de Fotos de Productos
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarFotosProductos() {
  console.log('🔍 Verificando URLs de fotos de productos...\n');

  try {
    // Obtener productos con fotos
    const productos = await prisma.product.findMany({
      where: {
        images: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        images: true,
        price: true
      },
      take: 10
    });

    console.log(`📦 Encontrados ${productos.length} productos con imágenes\n`);

    for (const producto of productos) {
      console.log(`\n📦 ${producto.name}`);
      console.log(`   💰 Precio: $${producto.price.toLocaleString('es-CO')}`);
      console.log(`   📸 Imágenes:`);
      
      if (Array.isArray(producto.images)) {
        producto.images.forEach((url, index) => {
          const tipo = url.startsWith('http') ? '🌐 URL completa' : 
                      url.startsWith('/') ? '📁 Ruta local' : 
                      '❓ Desconocido';
          console.log(`      ${index + 1}. ${tipo}: ${url}`);
        });
      } else {
        console.log(`      ⚠️ Formato incorrecto: ${typeof producto.images}`);
      }
    }

    // Buscar específicamente el Curso de Piano
    console.log('\n\n🎹 Buscando Curso de Piano...');
    const cursoPiano = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'Piano',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        images: true,
        price: true,
        description: true
      }
    });

    if (cursoPiano) {
      console.log(`\n✅ Encontrado: ${cursoPiano.name}`);
      console.log(`   💰 Precio: $${cursoPiano.price.toLocaleString('es-CO')}`);
      console.log(`   📝 Descripción: ${cursoPiano.description?.substring(0, 100)}...`);
      console.log(`   📸 Imágenes:`, cursoPiano.images);
    } else {
      console.log('\n❌ No se encontró el Curso de Piano');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarFotosProductos();
