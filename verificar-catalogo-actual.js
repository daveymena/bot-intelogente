const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function verificarCatalogo() {
  try {
    console.log('📊 VERIFICANDO CATÁLOGO ACTUAL\n');
    
    // Total de productos
    const total = await db.product.count();
    console.log(`✅ Total productos: ${total}\n`);
    
    // Por categoría
    const categorias = await db.product.groupBy({
      by: ['category'],
      _count: true,
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    });
    
    console.log('📦 PRODUCTOS POR CATEGORÍA:');
    categorias.forEach(cat => {
      console.log(`   ${cat.category}: ${cat._count} productos`);
    });
    
    console.log('\n🖼️  PRODUCTOS CON/SIN IMÁGENES:');
    const conImagenes = await db.product.count({
      where: {
        images: {
          not: null
        }
      }
    });
    const sinImagenes = total - conImagenes;
    console.log(`   Con imágenes: ${conImagenes}`);
    console.log(`   Sin imágenes: ${sinImagenes}`);
    
    // Mostrar algunos productos de ejemplo
    console.log('\n📋 EJEMPLOS DE PRODUCTOS:');
    const ejemplos = await db.product.findMany({
      take: 10,
      select: {
        name: true,
        category: true,
        price: true,
        images: true
      }
    });
    
    ejemplos.forEach((p, i) => {
      const hasImages = p.images ? '🖼️' : '❌';
      console.log(`   ${i+1}. ${hasImages} ${p.name} - $${p.price.toLocaleString()} (${p.category})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.$disconnect();
  }
}

verificarCatalogo();
