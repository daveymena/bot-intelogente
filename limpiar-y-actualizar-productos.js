// Script para limpiar productos sin fotos y actualizar megapacks de $20k
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function limpiarYActualizar() {
  console.log('🔧 Limpiando y actualizando productos...\n');

  try {
    // 1. ELIMINAR productos sin fotos o con fotos de Unsplash
    console.log('🗑️  PASO 1: Eliminando productos sin fotos correctas...');
    
    const todosProductos = await prisma.product.findMany({
      select: { id: true, name: true, images: true, price: true }
    });

    let eliminados = 0;
    for (const producto of todosProductos) {
      try {
        // Parsear images si es string
        let images = producto.images;
        if (typeof images === 'string') {
          try {
            images = JSON.parse(images);
          } catch {
            images = [];
          }
        }
        
        // Asegurar que images es un array
        if (!Array.isArray(images)) {
          images = [];
        }
        
        const sinFoto = images.length === 0;
        const fotoUnsplash = images.some(img => img && img.includes('unsplash.com'));
        const fotoPlaceholder = images.some(img => img && img.includes('placeholder.com'));
        
        if (sinFoto || fotoUnsplash || fotoPlaceholder) {
          await prisma.product.delete({ where: { id: producto.id } });
          console.log(`   ❌ Eliminado: ${producto.name}`);
          eliminados++;
        }
      } catch (error) {
        console.log(`   ⚠️  Error procesando ${producto.name}: ${error.message}`);
      }
    }
    
    console.log(`   ✅ ${eliminados} productos eliminados\n`);

    // 2. ACTUALIZAR megapacks de $20k con la foto correcta
    console.log('📦 PASO 2: Actualizando megapacks de $20,000...');
    
    const megapacks20k = await prisma.product.findMany({
      where: {
        name: { contains: 'Mega Pack', mode: 'insensitive' },
        price: 20000
      }
    });

    let actualizados = 0;
    for (const megapack of megapacks20k) {
      await prisma.product.update({
        where: { id: megapack.id },
        data: { images: JSON.stringify(['/fotos/megacp unitario.png']) }
      });
      console.log(`   ✅ Actualizado: ${megapack.name}`);
      actualizados++;
    }
    
    console.log(`   ✅ ${actualizados} megapacks actualizados\n`);

    // 3. RESUMEN FINAL
    const productosRestantes = await prisma.product.count();
    
    console.log('📊 RESUMEN FINAL:');
    console.log(`   🗑️  Productos eliminados: ${eliminados}`);
    console.log(`   📦 Megapacks actualizados: ${actualizados}`);
    console.log(`   📦 Productos restantes: ${productosRestantes}`);
    
    console.log('\n✅ PROCESO COMPLETADO!');
    console.log('\n🚀 Próximos pasos:');
    console.log('   1. Importar productos con fotos: npx tsx scripts/importar-desde-json.ts');
    console.log('   2. Verificar en el dashboard');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

limpiarYActualizar();
