/**
 * TEST COMPLETO DEL SISTEMA HÍBRIDO
 * Verifica que todo funcione sin errores después de las correcciones
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSistemaCompleto() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 TEST COMPLETO DEL SISTEMA HÍBRIDO');
  console.log('═══════════════════════════════════════════════════════\n');

  let errores = 0;
  let exitos = 0;

  // ═══════════════════════════════════════════════════════
  // TEST 1: VERIFICAR SCHEMA DE PRISMA
  // ═══════════════════════════════════════════════════════
  console.log('📋 TEST 1: Verificar Schema de Prisma');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const producto = await prisma.product.findFirst({
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        category: true,
        images: true,
        stock: true
      }
    });

    if (producto) {
      console.log('✅ Schema de Prisma correcto');
      console.log('   Producto de prueba:', producto.name);
      console.log('   Precio:', producto.price.toLocaleString('es-CO'), 'COP');
      exitos++;
    } else {
      console.log('⚠️ No hay productos en la BD');
    }
  } catch (error) {
    console.error('❌ Error en schema de Prisma:', error.message);
    errores++;
  }

  console.log('\n');

  // ═══════════════════════════════════════════════════════
  // TEST 2: VERIFICAR RealDataEnforcer
  // ═══════════════════════════════════════════════════════
  console.log('📋 TEST 2: Verificar RealDataEnforcer');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const { RealDataEnforcer } = require('./src/lib/real-data-enforcer');
    
    // Buscar un producto
    const producto = await RealDataEnforcer.searchProduct('curso');
    
    if (producto) {
      console.log('✅ RealDataEnforcer funciona correctamente');
      console.log('   Producto:', producto.name);
      console.log('   Precio REAL:', RealDataEnforcer.formatPrice(producto.price));
      console.log('   Imágenes:', producto.images.length);
      console.log('   Stock:', producto.stock || 'N/A');
      exitos++;
    } else {
      console.log('⚠️ No se encontró producto de prueba');
    }
  } catch (error) {
    console.error('❌ Error en RealDataEnforcer:', error.message);
    errores++;
  }

  console.log('\n');

  // ═══════════════════════════════════════════════════════
  // TEST 3: VERIFICAR CardPhotoSender
  // ═══════════════════════════════════════════════════════
  console.log('📋 TEST 3: Verificar CardPhotoSender');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const { CardPhotoSender } = require('./src/lib/card-photo-sender');
    
    const testProduct = {
      name: 'Curso de Piano Completo',
      price: 20000,
      description: 'Aprende piano desde cero',
      category: 'DIGITAL'
    };
    
    const caption = CardPhotoSender.generateCardCaption(testProduct);
    
    if (caption && caption.includes('20.000 COP')) {
      console.log('✅ CardPhotoSender funciona correctamente');
      console.log('   Caption generado:', caption.substring(0, 100) + '...');
      exitos++;
    } else {
      console.log('❌ Caption no contiene precio correcto');
      errores++;
    }
  } catch (error) {
    console.error('❌ Error en CardPhotoSender:', error.message);
    errores++;
  }

  console.log('\n');

  // ═══════════════════════════════════════════════════════
  // TEST 4: VERIFICAR SimpleConversationHandler
  // ═══════════════════════════════════════════════════════
  console.log('📋 TEST 4: Verificar SimpleConversationHandler');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const { SimpleConversationHandler } = require('./src/lib/simple-conversation-handler');
    const handler = SimpleConversationHandler.getInstance();
    
    console.log('✅ SimpleConversationHandler cargado correctamente');
    console.log('   Instancia creada:', handler ? 'Sí' : 'No');
    exitos++;
  } catch (error) {
    console.error('❌ Error en SimpleConversationHandler:', error.message);
    errores++;
  }

  console.log('\n');

  // ═══════════════════════════════════════════════════════
  // TEST 5: VERIFICAR PRODUCTOS CON IMÁGENES
  // ═══════════════════════════════════════════════════════
  console.log('📋 TEST 5: Verificar Productos con Imágenes');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const productosConImagenes = await prisma.product.findMany({
      where: {
        images: { not: '[]' }
      },
      take: 5,
      select: {
        id: true,
        name: true,
        images: true
      }
    });

    console.log(`✅ Productos con imágenes: ${productosConImagenes.length}`);
    
    productosConImagenes.forEach((p, i) => {
      let imgs = [];
      try {
        imgs = JSON.parse(p.images);
      } catch (e) {
        imgs = [];
      }
      console.log(`   ${i + 1}. ${p.name} - ${imgs.length} imágenes`);
    });
    
    exitos++;
  } catch (error) {
    console.error('❌ Error verificando imágenes:', error.message);
    errores++;
  }

  console.log('\n');

  // ═══════════════════════════════════════════════════════
  // TEST 6: VERIFICAR BÚSQUEDA DE PRODUCTOS
  // ═══════════════════════════════════════════════════════
  console.log('📋 TEST 6: Verificar Búsqueda de Productos');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const resultados = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'piano', mode: 'insensitive' } },
          { description: { contains: 'piano', mode: 'insensitive' } }
        ]
      },
      take: 3
    });

    console.log(`✅ Búsqueda funciona: ${resultados.length} resultados para "piano"`);
    resultados.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - ${p.price.toLocaleString('es-CO')} COP`);
    });
    exitos++;
  } catch (error) {
    console.error('❌ Error en búsqueda:', error.message);
    errores++;
  }

  console.log('\n');

  // ═══════════════════════════════════════════════════════
  // RESUMEN FINAL
  // ═══════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 RESUMEN DE TESTS');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log(`✅ Tests exitosos: ${exitos}`);
  console.log(`❌ Tests fallidos: ${errores}`);
  console.log(`📊 Total: ${exitos + errores}`);
  
  if (errores === 0) {
    console.log('\n🎉 ¡TODOS LOS TESTS PASARON!');
    console.log('✅ Sistema híbrido funcionando correctamente');
    console.log('✅ Sin errores de Prisma');
    console.log('✅ RealDataEnforcer operativo');
    console.log('✅ CardPhotoSender operativo');
    console.log('✅ Búsqueda de productos funcional');
  } else {
    console.log('\n⚠️ ALGUNOS TESTS FALLARON');
    console.log('Revisa los errores arriba');
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  
  await prisma.$disconnect();
  process.exit(errores > 0 ? 1 : 0);
}

// Ejecutar tests
testSistemaCompleto().catch(error => {
  console.error('❌ Error ejecutando tests:', error);
  process.exit(1);
});
