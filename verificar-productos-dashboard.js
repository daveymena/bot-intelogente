// Script para verificar que los productos están correctos en la BD
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarProductos() {
  console.log('🔍 Verificando productos en la base de datos...\n');

  try {
    // 1. Contar productos totales
    const totalProductos = await prisma.product.count();
    console.log(`📦 Total de productos: ${totalProductos}\n`);

    // 2. Verificar Megapacks de $20k
    console.log('📦 MEGAPACKS DE $20,000:');
    const megapacks20k = await prisma.product.findMany({
      where: {
        name: { contains: 'Mega Pack', mode: 'insensitive' },
        price: 20000
      },
      select: { name: true, images: true },
      take: 3
    });

    megapacks20k.forEach((p, i) => {
      const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
      const fotoCorrecta = images[0] === '/fotos/megacp unitario.png';
      console.log(`   ${i + 1}. ${p.name}`);
      console.log(`      Foto: ${images[0]}`);
      console.log(`      ${fotoCorrecta ? '✅ CORRECTA' : '❌ INCORRECTA'}`);
    });
    console.log(`   ... y ${await prisma.product.count({ where: { name: { contains: 'Mega Pack' }, price: 20000 } })} más\n`);

    // 3. Verificar Pack Completo
    console.log('📦 PACK COMPLETO:');
    const packCompleto = await prisma.product.findFirst({
      where: {
        OR: [
          { name: { contains: 'PACK COMPLETO', mode: 'insensitive' } },
          { name: { contains: '40 Mega Packs', mode: 'insensitive' } }
        ]
      },
      select: { name: true, images: true }
    });

    if (packCompleto) {
      const images = typeof packCompleto.images === 'string' ? JSON.parse(packCompleto.images) : packCompleto.images;
      const fotoCorrecta = images[0] === '/fotos/megapack completo.png';
      console.log(`   ${packCompleto.name}`);
      console.log(`   Foto: ${images[0]}`);
      console.log(`   ${fotoCorrecta ? '✅ CORRECTA' : '❌ INCORRECTA'}\n`);
    }

    // 4. Verificar Moto
    console.log('🏍️  MOTO BAJAJ:');
    const moto = await prisma.product.findFirst({
      where: { name: { contains: 'Moto Bajaj', mode: 'insensitive' } },
      select: { name: true, images: true }
    });

    if (moto) {
      const images = typeof moto.images === 'string' ? JSON.parse(moto.images) : moto.images;
      console.log(`   ${moto.name}`);
      console.log(`   Fotos: ${images.length}`);
      images.forEach((img, i) => console.log(`      ${i + 1}. ${img}`));
      const fotosCorrectas = images.length === 5;
      console.log(`   ${fotosCorrectas ? '✅ 5 FOTOS CORRECTAS' : '❌ FALTAN FOTOS'}\n`);
    }

    // 5. Verificar Piano
    console.log('🎹 CURSO DE PIANO:');
    const piano = await prisma.product.findFirst({
      where: { name: { contains: 'Piano', mode: 'insensitive' } },
      select: { name: true, images: true }
    });

    if (piano) {
      const images = typeof piano.images === 'string' ? JSON.parse(piano.images) : piano.images;
      const fotoCorrecta = images[0] === '/fotos/curso de piano completo .jpg';
      console.log(`   ${piano.name}`);
      console.log(`   Foto: ${images[0]}`);
      console.log(`   ${fotoCorrecta ? '✅ CORRECTA' : '❌ INCORRECTA'}\n`);
    }

    // RESUMEN
    console.log('✅ VERIFICACIÓN COMPLETADA!\n');
    console.log('📊 RESUMEN:');
    console.log(`   📦 Total productos: ${totalProductos}`);
    console.log(`   📦 Megapacks $20k: ${await prisma.product.count({ where: { name: { contains: 'Mega Pack' }, price: 20000 } })}`);
    console.log(`   📦 Pack Completo: ${packCompleto ? '✅' : '❌'}`);
    console.log(`   🏍️  Moto: ${moto ? '✅' : '❌'}`);
    console.log(`   🎹 Piano: ${piano ? '✅' : '❌'}`);
    
    console.log('\n🎨 PARA VER EN EL DASHBOARD:');
    console.log('   1. Abrir: http://localhost:3000/dashboard');
    console.log('   2. Ir a sección "Productos"');
    console.log('   3. Refrescar la página (F5)');
    console.log('   4. Verificar que las fotos se muestran correctamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verificarProductos();
