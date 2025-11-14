import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verProductosSinFotos() {
  console.log('📊 Analizando productos sin fotos...\n');

  try {
    // Productos sin fotos
    const sinFotos = await prisma.product.findMany({
      where: {
        OR: [
          { images: { equals: '[]' } },
          { images: { equals: '' } },
          { images: null },
        ]
      },
      select: {
        id: true,
        name: true,
        category: true,
        subcategory: true,
        images: true
      }
    });

    console.log(`❌ Total sin fotos: ${sinFotos.length}\n`);

    // Agrupar por categoría
    const porCategoria = new Map<string, any[]>();
    sinFotos.forEach(p => {
      const cat = p.category;
      if (!porCategoria.has(cat)) {
        porCategoria.set(cat, []);
      }
      porCategoria.get(cat)!.push(p);
    });

    console.log('═══════════════════════════════════════════════\n');

    porCategoria.forEach((productos, categoria) => {
      console.log(`📁 ${categoria} (${productos.length} productos)`);
      console.log('─'.repeat(45));

      // Agrupar por subcategoría
      const porSubcat = new Map<string, any[]>();
      productos.forEach(p => {
        const subcat = p.subcategory || 'Sin subcategoría';
        if (!porSubcat.has(subcat)) {
          porSubcat.set(subcat, []);
        }
        porSubcat.get(subcat)!.push(p);
      });

      porSubcat.forEach((prods, subcat) => {
        console.log(`\n   ${subcat} (${prods.length}):`);
        prods.slice(0, 5).forEach(p => {
          console.log(`      - ${p.name}`);
        });
        if (prods.length > 5) {
          console.log(`      ... y ${prods.length - 5} más`);
        }
      });

      console.log('\n');
    });

    // Productos de tecnología sin fotos (candidatos para MegaComputer)
    const tecnologia = sinFotos.filter(p => 
      p.category === 'PHYSICAL' && 
      ['PORTATILES', 'MONITORES', 'ACCESORIOS', 'COMPONENTES', 'DIADEMAS', 'IMPRESORAS', 'AUDIO'].includes(p.subcategory || '')
    );

    console.log('═══════════════════════════════════════════════');
    console.log(`\n🖥️  Productos de TECNOLOGÍA sin fotos: ${tecnologia.length}`);
    console.log('   (Candidatos para extraer de MegaComputer)\n');

    if (tecnologia.length > 0) {
      console.log('   Ejecuta:');
      console.log('   npx tsx scripts/extraer-fotos-megacomputer.ts\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verProductosSinFotos();
