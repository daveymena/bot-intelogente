/**
 * Script de Migración: Categoriza todos los productos existentes
 * 
 * Uso: npx tsx scripts/categorize-all-products.ts
 */

import { PrismaClient } from '@prisma/client';
import { ProductCategorizer } from '../src/lib/product-categorizer';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando categorización automática de productos...\n');

  try {
    // Obtener todos los productos
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        mainCategory: true,
        subCategory: true
      }
    });

    console.log(`📦 Encontrados ${products.length} productos para categorizar\n`);

    if (products.length === 0) {
      console.log('✅ No hay productos para categorizar');
      return;
    }

    // Filtrar productos que ya tienen categoría (opcional: re-categorizar todos)
    const uncategorized = products.filter(p => !p.mainCategory || !p.subCategory);
    const toProcess = uncategorized.length > 0 ? uncategorized : products;

    console.log(`🔄 Procesando ${toProcess.length} productos...\n`);

    let successCount = 0;
    let errorCount = 0;

    // Categorizar en lotes pequeños
    const batchSize = 10;
    for (let i = 0; i < toProcess.length; i += batchSize) {
      const batch = toProcess.slice(i, i + batchSize);
      
      console.log(`\n📊 Lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(toProcess.length / batchSize)}`);
      console.log('─'.repeat(60));

      for (const product of batch) {
        try {
          // Categorizar producto
          const categorization = await ProductCategorizer.categorizeProduct(
            product.name,
            product.description || undefined
          );

          // Validar resultado
          if (!ProductCategorizer.validateCategorization(categorization)) {
            console.log(`⚠️  Categorización inválida para: ${product.name}`);
            errorCount++;
            continue;
          }

          // Actualizar en base de datos
          await prisma.product.update({
            where: { id: product.id },
            data: {
              mainCategory: categorization.mainCategory,
              subCategory: categorization.subCategory,
              productTags: categorization.tags,
              isAccessory: categorization.isAccessory,
              parentCategory: categorization.parentCategory,
              categorizationConfidence: categorization.confidence * 100, // Convertir a porcentaje
              categorizedAt: new Date(),
              categorizedBy: categorization.confidence >= 0.8 ? 'AI' : 'AI-Fallback'
            }
          });

          console.log(`✅ ${product.name}`);
          console.log(`   → ${categorization.mainCategory} / ${categorization.subCategory}`);
          console.log(`   → Tags: ${categorization.tags.join(', ')}`);
          console.log(`   → Accesorio: ${categorization.isAccessory ? 'Sí' : 'No'}`);
          console.log(`   → Confianza: ${(categorization.confidence * 100).toFixed(0)}%`);

          successCount++;

          // Delay para no saturar la API
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`❌ Error procesando "${product.name}":`, error);
          errorCount++;
        }
      }
    }

    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE CATEGORIZACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📦 Total procesados: ${successCount + errorCount}`);
    console.log('='.repeat(60));

    // Mostrar estadísticas por categoría
    const stats = await prisma.product.groupBy({
      by: ['mainCategory', 'subCategory'],
      _count: true
    });

    console.log('\n📈 DISTRIBUCIÓN POR CATEGORÍAS:');
    console.log('─'.repeat(60));
    
    const grouped = stats.reduce((acc, stat) => {
      const main = stat.mainCategory || 'Sin categoría';
      if (!acc[main]) acc[main] = [];
      acc[main].push({
        sub: stat.subCategory || 'Sin subcategoría',
        count: stat._count
      });
      return acc;
    }, {} as Record<string, Array<{ sub: string; count: number }>>);

    for (const [mainCat, subs] of Object.entries(grouped)) {
      const total = subs.reduce((sum, s) => sum + s.count, 0);
      console.log(`\n${mainCat} (${total} productos):`);
      for (const sub of subs) {
        console.log(`  • ${sub.sub}: ${sub.count}`);
      }
    }

    console.log('\n✅ Categorización completada exitosamente!\n');

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
