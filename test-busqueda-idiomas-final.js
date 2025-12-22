const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBusquedaIdiomas() {
  console.log('\n🧪 TEST: BÚSQUEDA DE MEGAPACKS DE IDIOMAS\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Verificar que existen productos de idiomas
    console.log('\n1️⃣ Verificando productos de idiomas en BD...\n');
    
    const idiomasProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'idiomas', mode: 'insensitive' } },
          { name: { contains: 'inglés', mode: 'insensitive' } },
          { name: { contains: 'ingles', mode: 'insensitive' } },
          { description: { contains: 'idiomas', mode: 'insensitive' } },
          { tags: { contains: 'idiomas' } }
        ]
      }
    });
    
    console.log(`✅ Productos de idiomas encontrados: ${idiomasProducts.length}\n`);
    idiomasProducts.forEach((p, i) => {
      console.log(`   ${i+1}. ${p.name} - ${p.price.toLocaleString()} COP`);
    });
    
    if (idiomasProducts.length === 0) {
      console.log('\n❌ ERROR: No hay productos de idiomas en la BD');
      console.log('   Ejecuta: node agregar-megapacks-idiomas.js');
      await prisma.$disconnect();
      return;
    }
    
    // 2. Simular búsqueda con ProductIntelligenceService
    console.log('\n2️⃣ Simulando búsqueda con ProductIntelligenceService...\n');
    
    const { ProductIntelligenceService } = require('./src/lib/product-intelligence-service.ts');
    
    const usuario = await prisma.user.findFirst();
    if (!usuario) {
      console.log('❌ No hay usuarios en la BD');
      await prisma.$disconnect();
      return;
    }
    
    // Test 1: "Mega packs de idiomas"
    console.log('📝 Test 1: "Mega packs de idiomas"');
    const query1 = "Mega packs de idiomas";
    const keywords1 = query1.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const isGeneral1 = ProductIntelligenceService.isGeneralProductQuery(query1, keywords1);
    console.log(`   ¿Es búsqueda general? ${isGeneral1 ? '✅ SÍ' : '❌ NO'}`);
    
    if (isGeneral1) {
      const categoryProducts1 = await ProductIntelligenceService.findProductsByCategory(
        query1,
        usuario.id,
        5
      );
      console.log(`   Productos encontrados: ${categoryProducts1.length}`);
      categoryProducts1.forEach((p, i) => {
        console.log(`      ${i+1}. ${p.name}`);
      });
    } else {
      const product1 = await ProductIntelligenceService.findProduct(query1, usuario.id);
      if (product1) {
        console.log(`   ⚠️ Encontró UN solo producto: ${product1.name}`);
        console.log(`   ❌ DEBERÍA encontrar MÚLTIPLES productos`);
      } else {
        console.log(`   ✅ Retornó null - buscará múltiples productos`);
      }
    }
    
    // Test 2: "megapacks de idiomas"
    console.log('\n📝 Test 2: "megapacks de idiomas"');
    const query2 = "megapacks de idiomas";
    const keywords2 = query2.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const isGeneral2 = ProductIntelligenceService.isGeneralProductQuery(query2, keywords2);
    console.log(`   ¿Es búsqueda general? ${isGeneral2 ? '✅ SÍ' : '❌ NO'}`);
    
    if (isGeneral2) {
      const categoryProducts2 = await ProductIntelligenceService.findProductsByCategory(
        query2,
        usuario.id,
        5
      );
      console.log(`   Productos encontrados: ${categoryProducts2.length}`);
      categoryProducts2.forEach((p, i) => {
        console.log(`      ${i+1}. ${p.name}`);
      });
    } else {
      const product2 = await ProductIntelligenceService.findProduct(query2, usuario.id);
      if (product2) {
        console.log(`   ⚠️ Encontró UN solo producto: ${product2.name}`);
        console.log(`   ❌ DEBERÍA encontrar MÚLTIPLES productos`);
      } else {
        console.log(`   ✅ Retornó null - buscará múltiples productos`);
      }
    }
    
    // Test 3: "cursos de idiomas"
    console.log('\n📝 Test 3: "cursos de idiomas"');
    const query3 = "cursos de idiomas";
    const keywords3 = query3.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const isGeneral3 = ProductIntelligenceService.isGeneralProductQuery(query3, keywords3);
    console.log(`   ¿Es búsqueda general? ${isGeneral3 ? '✅ SÍ' : '❌ NO'}`);
    
    if (isGeneral3) {
      const categoryProducts3 = await ProductIntelligenceService.findProductsByCategory(
        query3,
        usuario.id,
        5
      );
      console.log(`   Productos encontrados: ${categoryProducts3.length}`);
      categoryProducts3.forEach((p, i) => {
        console.log(`      ${i+1}. ${p.name}`);
      });
    } else {
      const product3 = await ProductIntelligenceService.findProduct(query3, usuario.id);
      if (product3) {
        console.log(`   ⚠️ Encontró UN solo producto: ${product3.name}`);
      } else {
        console.log(`   ✅ Retornó null - buscará múltiples productos`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ TEST COMPLETADO\n');
    console.log('📝 RESULTADO ESPERADO:');
    console.log('   - Debe encontrar 2 productos de idiomas');
    console.log('   - Mega Pack 03: Cursos Inglés');
    console.log('   - Mega Pack 08: Cursos Idiomas');
    console.log('\n🚀 AHORA REINICIA EL SERVIDOR:');
    console.log('   REINICIAR_Y_PROBAR_BUSQUEDA.bat');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testBusquedaIdiomas();
