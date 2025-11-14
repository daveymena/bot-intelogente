// Script para verificar que las fotos se importaron correctamente
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarFotos() {
  console.log('🔍 Verificando fotos importadas...\n');

  try {
    // 1. Verificar Megapacks de $20k
    console.log('📦 Megapacks de $20,000:');
    const megapacks20 = await prisma.product.findMany({
      where: {
        name: { contains: 'Mega Pack', mode: 'insensitive' },
        price: 20000
      },
      select: { name: true, images: true, price: true },
      take: 5
    });
    
    megapacks20.forEach((p, i) => {
      const fotoCorrecta = p.images.includes('/fotos/megacp unitario.png');
      console.log(`   ${i + 1}. ${p.name}`);
      console.log(`      Foto: ${p.images[0]}`);
      console.log(`      ${fotoCorrecta ? '✅ Correcta' : '❌ Incorrecta'}`);
    });
    console.log(`   Total: ${megapacks20.length} megapacks verificados`);

    // 2. Verificar Moto
    console.log('\n🏍️  Moto Bajaj:');
    const moto = await prisma.product.findFirst({
      where: { name: { contains: 'Moto Bajaj', mode: 'insensitive' } },
      select: { name: true, images: true }
    });
    
    if (moto) {
      console.log(`   ${moto.name}`);
      console.log(`   Fotos: ${moto.images.length}`);
      moto.images.forEach((img, i) => {
        console.log(`      ${i + 1}. ${img}`);
      });
      const fotosCorrectas = moto.images.length === 5;
      console.log(`   ${fotosCorrectas ? '✅ 5 fotos correctas' : '❌ Faltan fotos'}`);
    } else {
      console.log('   ❌ No encontrada');
    }

    // 3. Verificar Curso de Piano
    console.log('\n🎹 Curso de Piano:');
    const piano = await prisma.product.findFirst({
      where: { name: { contains: 'Piano', mode: 'insensitive' } },
      select: { name: true, images: true }
    });
    
    if (piano) {
      console.log(`   ${piano.name}`);
      console.log(`   Foto: ${piano.images[0]}`);
      const fotoCorrecta = piano.images.includes('/fotos/curso de piano completo .jpg');
      console.log(`   ${fotoCorrecta ? '✅ Correcta' : '❌ Incorrecta'}`);
    } else {
      console.log('   ❌ No encontrado');
    }

    // Resumen
    console.log('\n📊 RESUMEN:');
    const totalMegapacks = await prisma.product.count({
      where: { name: { contains: 'Mega Pack', mode: 'insensitive' } }
    });
    console.log(`   📦 Megapacks totales: ${totalMegapacks}`);
    console.log(`   🏍️  Moto: ${moto ? '✅' : '❌'}`);
    console.log(`   🎹 Piano: ${piano ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verificarFotos();
