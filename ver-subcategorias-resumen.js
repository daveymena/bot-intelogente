// Ver resumen de subcategorías y tiendas
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verResumen() {
  console.log('📊 Resumen de Subcategorías y Tiendas\n');

  try {
    // Resumen por subcategoría
    console.log('📦 POR SUBCATEGORÍA:');
    const subcategorias = await prisma.product.groupBy({
      by: ['subcategory'],
      _count: true,
      orderBy: { _count: { subcategory: 'desc' } }
    });
    
    subcategorias.forEach(s => {
      console.log(`   ${s.subcategory || 'Sin subcategoría'}: ${s._count} productos`);
    });

    // Resumen por tienda
    console.log('\n🏪 POR TIENDA:');
    const tiendas = await prisma.product.groupBy({
      by: ['store'],
      _count: true,
      orderBy: { _count: { store: 'desc' } }
    });
    
    tiendas.forEach(t => {
      console.log(`   ${t.store || 'Sin tienda'}: ${t._count} productos`);
    });

    // Total
    const total = await prisma.product.count();
    console.log(`\n📦 TOTAL: ${total} productos`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verResumen();
