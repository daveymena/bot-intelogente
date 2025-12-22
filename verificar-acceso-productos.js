const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarAcceso() {
  try {
    console.log('🔍 Verificando acceso del bot a TODOS los productos...\n');
    
    // 1. Total de productos en BD
    const totalProductos = await prisma.product.count();
    const productosDisponibles = await prisma.product.count({
      where: { status: 'AVAILABLE' }
    });
    
    console.log('📊 ESTADÍSTICAS:');
    console.log(`   Total en BD: ${totalProductos}`);
    console.log(`   Disponibles: ${productosDisponibles}`);
    console.log(`   No disponibles: ${totalProductos - productosDisponibles}\n`);
    
    // 2. Verificar que el bot puede acceder a todos
    const todosLosProductos = await prisma.product.findMany({
      where: { status: 'AVAILABLE' },
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        tags: true,
        userId: true
      }
    });
    
    console.log('✅ El bot puede acceder a:', todosLosProductos.length, 'productos\n');
    
    // 3. Verificar productos por categoría
    const categorias = {};
    todosLosProductos.forEach(p => {
      if (!categorias[p.category]) {
        categorias[p.category] = 0;
      }
      categorias[p.category]++;
    });
    
    console.log('📦 PRODUCTOS POR CATEGORÍA:');
    Object.entries(categorias).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} productos`);
    });
    
    // 4. Verificar productos sin tags (difíciles de encontrar)
    console.log('\n⚠️  PRODUCTOS SIN TAGS (difíciles de buscar):');
    const sinTags = todosLosProductos.filter(p => !p.tags || p.tags === '[]' || p.tags === 'null');
    console.log(`   Total: ${sinTags.length}`);
    
    if (sinTags.length > 0) {
      console.log('\n   Productos sin tags:');
      sinTags.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name}`);
      });
      if (sinTags.length > 10) {
        console.log(`   ... y ${sinTags.length - 10} más`);
      }
    }
    
    // 5. Verificar megapacks
    console.log('\n📚 MEGAPACKS:');
    const megapacks = todosLosProductos.filter(p => 
      p.name.toLowerCase().includes('mega pack') || 
      p.name.toLowerCase().includes('megapack')
    );
    console.log(`   Total: ${megapacks.length}`);
    
    // 6. Verificar cursos
    console.log('\n🎓 CURSOS:');
    const cursos = todosLosProductos.filter(p => 
      p.name.toLowerCase().includes('curso') ||
      p.description?.toLowerCase().includes('curso')
    );
    console.log(`   Total: ${cursos.length}`);
    
    // 7. Probar búsqueda de "diseño gráfico"
    console.log('\n🧪 PRUEBA: Búsqueda de "diseño gráfico"');
    const diseño = todosLosProductos.filter(p => {
      const texto = `${p.name} ${p.tags || ''}`.toLowerCase();
      return texto.includes('diseño') || texto.includes('diseno');
    });
    console.log(`   Encontrados: ${diseño.length}`);
    diseño.forEach(p => {
      console.log(`   ✅ ${p.name}`);
    });
    
    // 8. Probar búsqueda de "reparación"
    console.log('\n🧪 PRUEBA: Búsqueda de "reparación"');
    const reparacion = todosLosProductos.filter(p => {
      const texto = `${p.name} ${p.tags || ''}`.toLowerCase();
      return texto.includes('reparacion') || texto.includes('reparación');
    });
    console.log(`   Encontrados: ${reparacion.length}`);
    reparacion.forEach(p => {
      console.log(`   ✅ ${p.name}`);
    });
    
    // 9. Resumen
    console.log('\n' + '═'.repeat(60));
    console.log('📋 RESUMEN');
    console.log('═'.repeat(60));
    
    if (sinTags.length > 0) {
      console.log(`⚠️  ${sinTags.length} productos sin tags - NECESITAN TAGS`);
    } else {
      console.log('✅ Todos los productos tienen tags');
    }
    
    console.log(`✅ Bot tiene acceso a ${productosDisponibles} productos`);
    console.log(`✅ ${megapacks.length} megapacks disponibles`);
    console.log(`✅ ${cursos.length} cursos disponibles`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verificarAcceso();
