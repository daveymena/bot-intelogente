// Script para mover productos al usuario correcto
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function moverProductos() {
  console.log('🔄 Moviendo productos al usuario correcto...\n');

  try {
    // IDs de usuarios
    const usuarioOrigen = 'cmhm54i3y0000kmrciujcs3uu'; // anny.mena@example.com
    const usuarioDestino = 'cmhm5hpxg0000kmmwjvazve9d'; // daveymena16@gmail.com

    console.log('👥 USUARIOS:');
    console.log(`   Origen: anny.mena@example.com (${usuarioOrigen})`);
    console.log(`   Destino: daveymena16@gmail.com (${usuarioDestino})\n`);

    // 1. Mover Megapacks
    console.log('📦 Moviendo Megapacks...');
    const megapacks = await prisma.product.updateMany({
      where: {
        userId: usuarioOrigen,
        name: { contains: 'Mega Pack', mode: 'insensitive' }
      },
      data: { userId: usuarioDestino }
    });
    console.log(`   ✅ ${megapacks.count} megapacks movidos\n`);

    // 2. Mover Pack Completo
    console.log('📦 Moviendo Pack Completo...');
    const packCompleto = await prisma.product.updateMany({
      where: {
        userId: usuarioOrigen,
        OR: [
          { name: { contains: 'PACK COMPLETO', mode: 'insensitive' } },
          { name: { contains: '40 Mega Packs', mode: 'insensitive' } }
        ]
      },
      data: { userId: usuarioDestino }
    });
    console.log(`   ✅ ${packCompleto.count} pack completo movido\n`);

    // 3. Mover Moto
    console.log('🏍️  Moviendo Moto...');
    const moto = await prisma.product.updateMany({
      where: {
        userId: usuarioOrigen,
        name: { contains: 'Moto Bajaj', mode: 'insensitive' }
      },
      data: { userId: usuarioDestino }
    });
    console.log(`   ✅ ${moto.count} moto movida\n`);

    // 4. Mover Curso de Piano
    console.log('🎹 Moviendo Curso de Piano...');
    const piano = await prisma.product.updateMany({
      where: {
        userId: usuarioOrigen,
        name: { contains: 'Piano', mode: 'insensitive' }
      },
      data: { userId: usuarioDestino }
    });
    console.log(`   ✅ ${piano.count} curso de piano movido\n`);

    // Resumen
    const totalMovidos = megapacks.count + packCompleto.count + moto.count + piano.count;
    
    console.log('✅ PRODUCTOS MOVIDOS!');
    console.log(`\n📊 RESUMEN:`);
    console.log(`   📦 Megapacks: ${megapacks.count}`);
    console.log(`   📦 Pack Completo: ${packCompleto.count}`);
    console.log(`   🏍️  Moto: ${moto.count}`);
    console.log(`   🎹 Piano: ${piano.count}`);
    console.log(`   🎯 TOTAL: ${totalMovidos} productos`);

    // Verificar productos del usuario destino
    const productosDestino = await prisma.product.count({
      where: { userId: usuarioDestino }
    });

    console.log(`\n📦 Productos de daveymena16@gmail.com: ${productosDestino}`);
    console.log('\n🎨 AHORA PUEDES:');
    console.log('   1. Refrescar el dashboard (F5)');
    console.log('   2. Ver los productos en la sección "Productos"');
    console.log('   3. Verificar que las fotos se muestran correctamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

moverProductos();
