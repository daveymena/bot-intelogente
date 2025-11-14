/**
 * Eliminar productos duplicados de Diseño Gráfico
 */

import { db } from '../src/lib/db';

async function limpiarDuplicados() {
  console.log('🧹 Limpiando productos duplicados de Diseño Gráfico\n');

  // Buscar todos los productos de Diseño Gráfico
  const products = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: 'Diseño Gráfico' } },
        { name: { contains: 'Piano' } }
      ]
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  console.log(`📦 Encontrados ${products.length} productos:\n`);

  // Productos a mantener (los que tienen imagen o son más completos)
  const productosAMantener = [
    'cmhpw941q0000kmp85qvjm0o5-mp01', // Mega Pack 01: Cursos Diseño Gráfico (tiene imagen)
    'cmhpw941q0000kmp85qvjm0o5-curso-completo-de-piano-online' // Curso Piano (tiene imagen)
  ];

  // Productos a eliminar
  const productosAEliminar = products.filter(p => !productosAMantener.includes(p.id));

  console.log('✅ PRODUCTOS A MANTENER:');
  for (const id of productosAMantener) {
    const product = products.find(p => p.id === id);
    if (product) {
      console.log(`   📌 ${product.name}`);
      console.log(`      ID: ${product.id}`);
      console.log(`      Imagen: ${product.images ? 'SÍ' : 'NO'}`);
      console.log('');
    }
  }

  console.log('❌ PRODUCTOS A ELIMINAR:');
  for (const product of productosAEliminar) {
    console.log(`   🗑️  ${product.name}`);
    console.log(`      ID: ${product.id}`);
    console.log(`      Imagen: ${product.images ? 'SÍ' : 'NO'}`);
    console.log('');
  }

  if (productosAEliminar.length === 0) {
    console.log('✅ No hay productos duplicados para eliminar');
    return;
  }

  console.log(`\n⚠️  Se eliminarán ${productosAEliminar.length} productos duplicados`);
  console.log('Ejecutando en 3 segundos...\n');

  await new Promise(resolve => setTimeout(resolve, 3000));

  // Eliminar productos duplicados
  for (const product of productosAEliminar) {
    try {
      await db.product.delete({
        where: { id: product.id }
      });
      console.log(`✅ Eliminado: ${product.name}`);
    } catch (error) {
      console.error(`❌ Error eliminando ${product.name}:`, error);
    }
  }

  console.log('\n✅ Limpieza completada');

  // Verificar productos restantes
  const remaining = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: 'Diseño Gráfico' } },
        { name: { contains: 'Piano' } }
      ]
    }
  });

  console.log(`\n📦 Productos restantes: ${remaining.length}`);
  for (const product of remaining) {
    console.log(`   ✅ ${product.name}`);
  }
}

limpiarDuplicados()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
