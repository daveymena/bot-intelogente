/**
 * Eliminar TODOS los productos duplicados
 * Mantiene solo UNA versión de cada producto (la más completa)
 */

import { db } from '../src/lib/db';

async function eliminarTodosDuplicados() {
  console.log('🧹 ELIMINANDO TODOS LOS PRODUCTOS DUPLICADOS\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Obtener TODOS los productos
  const allProducts = await db.product.findMany({
    orderBy: {
      createdAt: 'asc'
    }
  });

  console.log(`📦 Total de productos en base de datos: ${allProducts.length}\n`);

  // Agrupar productos por nombre similar
  const productGroups = new Map<string, any[]>();

  for (const product of allProducts) {
    // Normalizar nombre para detectar duplicados
    const normalizedName = product.name
      .toLowerCase()
      .replace(/[🥇💎✨🎯📚🎓⭐]/g, '') // Quitar emojis
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();

    if (!productGroups.has(normalizedName)) {
      productGroups.set(normalizedName, []);
    }
    productGroups.get(normalizedName)!.push(product);
  }

  console.log(`📊 Grupos de productos encontrados: ${productGroups.size}\n`);

  // Identificar duplicados
  const duplicateGroups = Array.from(productGroups.entries())
    .filter(([_, products]) => products.length > 1);

  console.log(`⚠️  Grupos con duplicados: ${duplicateGroups.length}\n`);

  if (duplicateGroups.length === 0) {
    console.log('✅ No hay productos duplicados');
    return;
  }

  let totalToDelete = 0;
  const productsToKeep: string[] = [];
  const productsToDelete: any[] = [];

  // Para cada grupo de duplicados, mantener el mejor
  for (const [normalizedName, products] of duplicateGroups) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📦 Grupo: "${products[0].name}"`);
    console.log(`   Duplicados encontrados: ${products.length}\n`);

    // Ordenar por calidad (con imagen > sin imagen, más antiguo > más nuevo)
    const sortedProducts = products.sort((a, b) => {
      // Prioridad 1: Productos con imagen
      const aHasImage = a.images && (
        (typeof a.images === 'string' && a.images !== '[]' && a.images !== '') ||
        (Array.isArray(a.images) && a.images.length > 0)
      );
      const bHasImage = b.images && (
        (typeof b.images === 'string' && b.images !== '[]' && b.images !== '') ||
        (Array.isArray(b.images) && b.images.length > 0)
      );

      if (aHasImage && !bHasImage) return -1;
      if (!aHasImage && bHasImage) return 1;

      // Prioridad 2: Productos con descripción más larga
      const aDescLength = a.description?.length || 0;
      const bDescLength = b.description?.length || 0;
      if (aDescLength !== bDescLength) return bDescLength - aDescLength;

      // Prioridad 3: Más antiguo (creado primero)
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const toKeep = sortedProducts[0];
    const toDelete = sortedProducts.slice(1);

    console.log(`   ✅ MANTENER:`);
    console.log(`      📌 ${toKeep.name}`);
    console.log(`      🆔 ID: ${toKeep.id}`);
    console.log(`      🖼️  Imagen: ${toKeep.images ? 'SÍ' : 'NO'}`);
    console.log(`      📝 Descripción: ${toKeep.description ? toKeep.description.substring(0, 50) + '...' : 'NO'}`);
    console.log('');

    console.log(`   ❌ ELIMINAR (${toDelete.length}):`);
    for (const product of toDelete) {
      console.log(`      🗑️  ${product.name}`);
      console.log(`         ID: ${product.id}`);
      console.log(`         Imagen: ${product.images ? 'SÍ' : 'NO'}`);
      console.log('');
    }

    productsToKeep.push(toKeep.id);
    productsToDelete.push(...toDelete);
    totalToDelete += toDelete.length;
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`📊 RESUMEN:`);
  console.log(`   ✅ Productos a mantener: ${productsToKeep.length}`);
  console.log(`   ❌ Productos a eliminar: ${totalToDelete}`);
  console.log('');

  if (totalToDelete === 0) {
    console.log('✅ No hay productos para eliminar');
    return;
  }

  console.log(`⚠️  INICIANDO ELIMINACIÓN EN 5 SEGUNDOS...`);
  console.log(`   (Presiona Ctrl+C para cancelar)\n`);

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Eliminar productos duplicados
  let deletedCount = 0;
  let errorCount = 0;

  for (const product of productsToDelete) {
    try {
      await db.product.delete({
        where: { id: product.id }
      });
      console.log(`✅ Eliminado: ${product.name}`);
      deletedCount++;
    } catch (error: any) {
      console.error(`❌ Error eliminando ${product.name}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ LIMPIEZA COMPLETADA`);
  console.log(`   ✅ Eliminados: ${deletedCount}`);
  console.log(`   ❌ Errores: ${errorCount}`);
  console.log('');

  // Verificar productos restantes
  const remaining = await db.product.findMany();
  console.log(`📦 Productos restantes en base de datos: ${remaining.length}\n`);

  // Mostrar productos restantes agrupados por categoría
  const byCategory = remaining.reduce((acc, p) => {
    const cat = p.category || 'SIN_CATEGORIA';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, any[]>);

  console.log('📊 Productos por categoría:\n');
  for (const [category, products] of Object.entries(byCategory)) {
    console.log(`   ${category}: ${products.length} productos`);
  }
}

eliminarTodosDuplicados()
  .then(() => {
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
