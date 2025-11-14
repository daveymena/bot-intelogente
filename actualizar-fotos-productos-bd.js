// Script para actualizar las fotos de productos en la base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function actualizarFotos() {
  console.log('📸 Actualizando fotos de productos en la base de datos...\n');

  try {
    // 1. ACTUALIZAR MEGAPACKS DE $20,000
    console.log('📦 PASO 1: Actualizando Megapacks de $20,000...');
    
    const megapacks20k = await prisma.product.findMany({
      where: {
        name: { contains: 'Mega Pack', mode: 'insensitive' },
        price: 20000
      }
    });

    let megapacks20Actualizados = 0;
    for (const megapack of megapacks20k) {
      await prisma.product.update({
        where: { id: megapack.id },
        data: { images: JSON.stringify(['/fotos/megacp unitario.png']) }
      });
      console.log(`   ✅ ${megapack.name}`);
      megapacks20Actualizados++;
    }
    
    console.log(`   📊 Total: ${megapacks20Actualizados} megapacks de $20k actualizados\n`);

    // 2. ACTUALIZAR MEGAPACK COMPLETO (40 packs)
    console.log('📦 PASO 2: Actualizando Megapack Completo...');
    
    const megapackCompleto = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'PACK COMPLETO', mode: 'insensitive' } },
          { name: { contains: '40 Mega Packs', mode: 'insensitive' } }
        ]
      }
    });

    let megapackCompletoActualizado = 0;
    for (const pack of megapackCompleto) {
      await prisma.product.update({
        where: { id: pack.id },
        data: { images: JSON.stringify(['/fotos/megapack completo.png']) }
      });
      console.log(`   ✅ ${pack.name}`);
      megapackCompletoActualizado++;
    }
    
    console.log(`   📊 Total: ${megapackCompletoActualizado} pack completo actualizado\n`);

    // 3. ACTUALIZAR MOTO BAJAJ
    console.log('🏍️  PASO 3: Actualizando Moto Bajaj...');
    
    const motos = await prisma.product.findMany({
      where: {
        name: { contains: 'Moto Bajaj', mode: 'insensitive' }
      }
    });

    let motosActualizadas = 0;
    for (const moto of motos) {
      await prisma.product.update({
        where: { id: moto.id },
        data: { 
          images: JSON.stringify([
            '/fotos/moto2.jpg',
            '/fotos/moto 3.jpg',
            '/fotos/moto4.jpg',
            '/fotos/moto5.png',
            '/fotos/moto6.png'
          ]) 
        }
      });
      console.log(`   ✅ ${moto.name}`);
      motosActualizadas++;
    }
    
    console.log(`   📊 Total: ${motosActualizadas} moto(s) actualizada(s)\n`);

    // 4. ACTUALIZAR CURSO DE PIANO
    console.log('🎹 PASO 4: Actualizando Curso de Piano...');
    
    const pianos = await prisma.product.findMany({
      where: {
        name: { contains: 'Piano', mode: 'insensitive' }
      }
    });

    let pianosActualizados = 0;
    for (const piano of pianos) {
      await prisma.product.update({
        where: { id: piano.id },
        data: { images: JSON.stringify(['/fotos/curso de piano completo .jpg']) }
      });
      console.log(`   ✅ ${piano.name}`);
      pianosActualizados++;
    }
    
    console.log(`   📊 Total: ${pianosActualizados} curso(s) de piano actualizado(s)\n`);

    // RESUMEN FINAL
    const totalActualizados = megapacks20Actualizados + megapackCompletoActualizado + motosActualizadas + pianosActualizados;
    
    console.log('✅ ACTUALIZACIÓN COMPLETADA!');
    console.log('\n📊 RESUMEN:');
    console.log(`   📦 Megapacks $20k: ${megapacks20Actualizados}`);
    console.log(`   📦 Pack Completo: ${megapackCompletoActualizado}`);
    console.log(`   🏍️  Motos: ${motosActualizadas}`);
    console.log(`   🎹 Cursos Piano: ${pianosActualizados}`);
    console.log(`   🎯 TOTAL: ${totalActualizados} productos actualizados`);
    
    console.log('\n🎨 FOTOS ASIGNADAS:');
    console.log('   📦 Megapacks $20k → /fotos/megacp unitario.png');
    console.log('   📦 Pack Completo → /fotos/megapack completo.png');
    console.log('   🏍️  Moto → 5 fotos (moto2.jpg, moto 3.jpg, etc.)');
    console.log('   🎹 Piano → /fotos/curso de piano completo .jpg');
    
    console.log('\n🚀 Próximos pasos:');
    console.log('   1. Verificar en el dashboard: http://localhost:3000/dashboard');
    console.log('   2. Probar en WhatsApp');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

actualizarFotos();
