import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function eliminarProductosSinFotos() {
  console.log('🗑️  Eliminando productos sin fotos...\n');

  try {
    // Obtener usuario
    const usuario = await prisma.user.findUnique({
      where: { email: 'daveymena16@gmail.com' },
      include: {
        products: true
      }
    });

    if (!usuario) {
      console.error('❌ Usuario no encontrado');
      return;
    }

    console.log(`✅ Usuario: ${usuario.email}`);
    console.log(`📦 Total de productos: ${usuario.products.length}\n`);

    // Filtrar productos sin imágenes
    const productosSinFotos = usuario.products.filter(p => {
      if (!p.images) return true;
      
      try {
        // Si es string JSON, parsearlo
        const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
        return !Array.isArray(images) || images.length === 0;
      } catch {
        return true; // Si no se puede parsear, considerarlo sin fotos
      }
    });

    const productosConFotos = usuario.products.filter(p => {
      if (!p.images) return false;
      
      try {
        const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
        return Array.isArray(images) && images.length > 0;
      } catch {
        return false;
      }
    });

    console.log('📊 RESUMEN:');
    console.log('='.repeat(60));
    console.log(`📦 Total de productos: ${usuario.products.length}`);
    console.log(`❌ Sin fotos: ${productosSinFotos.length}`);
    console.log(`✅ Con fotos: ${productosConFotos.length}`);
    console.log('='.repeat(60) + '\n');

    if (productosSinFotos.length === 0) {
      console.log('✅ No hay productos sin fotos para eliminar');
      return;
    }

    console.log('🗑️  PRODUCTOS A ELIMINAR:');
    console.log('-'.repeat(60));
    productosSinFotos.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (${p.price.toLocaleString()} COP)`);
    });

    console.log('\n⚠️  ADVERTENCIA: Esta acción eliminará permanentemente estos productos');
    console.log('⚠️  Presiona Ctrl+C para cancelar en los próximos 5 segundos...\n');

    // Esperar 5 segundos
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('🗑️  Eliminando productos...\n');

    // Eliminar productos sin fotos
    const resultado = await prisma.product.deleteMany({
      where: {
        id: {
          in: productosSinFotos.map(p => p.id)
        }
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ ELIMINACIÓN COMPLETADA');
    console.log('='.repeat(60));
    console.log(`🗑️  Productos eliminados: ${resultado.count}`);
    console.log(`✅ Productos restantes: ${productosConFotos.length}`);
    console.log('='.repeat(60) + '\n');

    if (productosConFotos.length > 0) {
      console.log('📦 PRODUCTOS QUE QUEDARON (con fotos):');
      console.log('-'.repeat(60));
      productosConFotos.slice(0, 10).forEach((p, i) => {
        const numImagenes = Array.isArray(p.images) ? p.images.length : 0;
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   💰 ${p.price.toLocaleString()} COP`);
        console.log(`   🖼️  ${numImagenes} imágenes`);
      });
      
      if (productosConFotos.length > 10) {
        console.log(`\n... y ${productosConFotos.length - 10} productos más`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

eliminarProductosSinFotos();
