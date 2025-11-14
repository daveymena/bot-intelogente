/**
 * Script para verificar y eliminar productos duplicados
 * Mantiene el producto más reciente y elimina los duplicados
 */

import { db as prisma } from '../src/lib/db';

async function eliminarDuplicados() {
  console.log('🔍 Verificando y eliminando productos duplicados...\n');
  console.log('='.repeat(70));

  try {
    // 1. Buscar todos los productos
    const productos = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' } // Más recientes primero
    });

    console.log(`\n📊 Total de productos: ${productos.length}\n`);

    // 2. Agrupar por nombre (normalizado)
    const productosPorNombre = new Map<string, any[]>();

    productos.forEach(producto => {
      const nombreNormalizado = producto.name.toLowerCase().trim();
      if (!productosPorNombre.has(nombreNormalizado)) {
        productosPorNombre.set(nombreNormalizado, []);
      }
      productosPorNombre.get(nombreNormalizado)!.push(producto);
    });

    // 3. Identificar y eliminar duplicados
    let duplicadosEncontrados = 0;
    let productosEliminados = 0;

    console.log('🔎 Buscando duplicados...\n');
    console.log('-'.repeat(70));

    for (const [nombre, productos] of productosPorNombre) {
      if (productos.length > 1) {
        duplicadosEncontrados++;
        console.log(`\n❌ DUPLICADO ENCONTRADO: "${nombre}" (${productos.length} veces)`);
        
        // Mantener el más reciente (primero en la lista)
        const mantener = productos[0];
        const eliminar = productos.slice(1);

        console.log(`   ✅ MANTENER (más reciente):`);
        console.log(`      ID: ${mantener.id}`);
        console.log(`      Precio: $${mantener.price.toLocaleString('es-CO')} COP`);
        console.log(`      Creado: ${mantener.createdAt.toISOString()}`);

        console.log(`\n   🗑️  ELIMINAR (${eliminar.length} duplicado(s)):`);
        
        for (const prod of eliminar) {
          console.log(`      ID: ${prod.id}`);
          console.log(`      Precio: $${prod.price.toLocaleString('es-CO')} COP`);
          console.log(`      Creado: ${prod.createdAt.toISOString()}`);
          
          // Eliminar el producto duplicado
          await prisma.product.delete({
            where: { id: prod.id }
          });
          
          productosEliminados++;
          console.log(`      ✅ Eliminado`);
        }
      }
    }

    console.log('\n' + '='.repeat(70));

    if (duplicadosEncontrados === 0) {
      console.log('\n✅ No se encontraron productos duplicados\n');
    } else {
      console.log(`\n✅ Proceso completado:`);
      console.log(`   - Productos duplicados encontrados: ${duplicadosEncontrados}`);
      console.log(`   - Productos eliminados: ${productosEliminados}`);
      console.log(`   - Productos únicos mantenidos: ${duplicadosEncontrados}\n`);
    }

    // 4. Mostrar productos finales
    const productosFinales = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });

    console.log('='.repeat(70));
    console.log(`\n📋 Productos finales (${productosFinales.length} total):\n`);
    
    productosFinales.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.name}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Precio: $${p.price.toLocaleString('es-CO')} COP`);
      console.log(`   Categoría: ${p.category}`);
      console.log(`   Estado: ${p.status}`);
      console.log('');
    });

    console.log('='.repeat(70));
    console.log('\n✅ Proceso completado exitosamente\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
eliminarDuplicados().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
