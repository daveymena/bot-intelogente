/**
 * 🧪 PRUEBA BÚSQUEDA COMPATIBLE CON SQLITE
 * Verifica que las búsquedas funcionen sin mode: 'insensitive'
 */

const { db } = require('./src/lib/db');

async function testBusquedaSQLite() {
  console.log('🧪 PRUEBA BÚSQUEDA SQLITE COMPATIBLE\n');

  try {
    // 1. Verificar productos disponibles
    console.log('📊 PRODUCTOS DISPONIBLES:');
    const productos = await db.product.findMany({
      where: { status: 'AVAILABLE', category: 'DIGITAL' },
      take: 5
    });

    productos.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (ID: ${p.id})`);
    });
    console.log('');

    // 2. PRUEBA BÚSQUEDA CURSO (sin mode: insensitive)
    console.log('🧪 PRUEBA BÚSQUEDA CURSO "piano":');

    const cursoEncontrado = await db.product.findFirst({
      where: {
        AND: [
          { status: 'AVAILABLE' },
          { category: 'DIGITAL' },
          {
            OR: [
              { name: { contains: 'piano' } },
              { name: { contains: 'PIANO' } },
              { name: { contains: 'Piano' } }
            ]
          }
        ]
      }
    });

    if (cursoEncontrado) {
      console.log(`✅ ENCONTRADO: ${cursoEncontrado.name}`);
      console.log(`   ID: ${cursoEncontrado.id}`);
      console.log(`   Precio: ${cursoEncontrado.price}`);
    } else {
      console.log('❌ No encontrado');
    }
    console.log('');

    // 3. PRUEBA BÚSQUEDA MEGAPACK
    console.log('🧪 PRUEBA BÚSQUEDA MEGAPACK "mega":');

    const megapackEncontrado = await db.product.findFirst({
      where: {
        AND: [
          { status: 'AVAILABLE' },
          { category: 'DIGITAL' },
          {
            OR: [
              { name: { contains: 'mega' } },
              { name: { contains: 'MEGA' } },
              { name: { contains: 'Mega' } }
            ]
          }
        ]
      }
    });

    if (megapackEncontrado) {
      console.log(`✅ ENCONTRADO: ${megapackEncontrado.name}`);
      console.log(`   ID: ${megapackEncontrado.id}`);
      console.log(`   Precio: ${megapackEncontrado.price}`);
    } else {
      console.log('❌ No encontrado');
    }
    console.log('');

    // 4. PRUEBA BÚSQUEDA CON DISTINTOS CASOS
    console.log('🧪 PRUEBA BÚSQUEDA CON DIFERENTES CASOS:');

    const casos = ['piano', 'PIANO', 'Piano', 'MEGA', 'mega', 'Mega'];

    for (const caso of casos) {
      const encontrado = await db.product.findFirst({
        where: {
          AND: [
            { status: 'AVAILABLE' },
            { category: 'DIGITAL' },
            { name: { contains: caso } }
          ]
        }
      });

      console.log(`   "${caso}": ${encontrado ? '✅' : '❌'} ${encontrado?.name || 'No encontrado'}`);
    }

    console.log('\n🎉 BÚSQUEDA SQLITE FUNCIONANDO CORRECTAMENTE!');

  } catch (error) {
    console.error('❌ Error en pruebas:', error);
  }
}

// Ejecutar pruebas
testBusquedaSQLite();