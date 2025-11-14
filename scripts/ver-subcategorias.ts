import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verSubcategorias() {
  console.log('📊 Analizando subcategorías de productos...\n');

  try {
    const products = await prisma.product.findMany({
      select: {
        category: true,
        subcategory: true,
        name: true
      }
    });

    // Agrupar por categoría y subcategoría
    const categorias = new Map<string, Map<string, number>>();

    products.forEach(p => {
      if (!categorias.has(p.category)) {
        categorias.set(p.category, new Map());
      }
      
      const subcats = categorias.get(p.category)!;
      const subcat = p.subcategory || 'Sin subcategoría';
      subcats.set(subcat, (subcats.get(subcat) || 0) + 1);
    });

    // Mostrar resultados
    console.log('═══════════════════════════════════════════════\n');
    
    categorias.forEach((subcats, cat) => {
      console.log(`📁 ${cat}`);
      console.log('─'.repeat(45));
      
      const sortedSubcats = Array.from(subcats.entries()).sort((a, b) => b[1] - a[1]);
      sortedSubcats.forEach(([subcat, count]) => {
        console.log(`   ├─ ${subcat}: ${count} productos`);
      });
      console.log('');
    });

    console.log('═══════════════════════════════════════════════');
    console.log(`\n📦 Total de productos: ${products.length}`);

    // Productos sin subcategoría
    const sinSubcat = products.filter(p => !p.subcategory);
    if (sinSubcat.length > 0) {
      console.log(`\n⚠️  ${sinSubcat.length} productos sin subcategoría:`);
      sinSubcat.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name} (${p.category})`);
      });
      if (sinSubcat.length > 10) {
        console.log(`   ... y ${sinSubcat.length - 10} más`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verSubcategorias();
