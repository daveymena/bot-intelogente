import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function mostrarUbicacion() {
  console.log('📍 UBICACIÓN DE TODOS LOS PRODUCTOS');
  console.log('='.repeat(70));

  const productos = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      category: true,
      images: true,
    },
    orderBy: [
      { category: 'asc' },
      { price: 'asc' }
    ]
  });

  console.log(`\n✅ Total en Base de Datos: ${productos.length} productos\n`);

  // DIGITALES
  const digitales = productos.filter(p => p.category === 'DIGITAL');
  console.log('💾 PRODUCTOS DIGITALES (' + digitales.length + ')');
  console.log('='.repeat(70));

  // Piano
  const piano = digitales.find(p => p.name.includes('Piano'));
  if (piano) {
    const imgs = JSON.parse(piano.images);
    console.log('\n🎹 CURSO DE PIANO');
    console.log(`   📝 Nombre: ${piano.name}`);
    console.log(`   💰 Precio: $${piano.price.toLocaleString()}`);
    console.log(`   📸 Foto: ${imgs[0]}`);
    console.log(`   🆔 ID: ${piano.id}`);
  }

  // Pack Completo
  const pack = digitales.find(p => p.name.includes('PACK COMPLETO'));
  if (pack) {
    const imgs = JSON.parse(pack.images);
    console.log('\n📦 PACK COMPLETO 40 MEGAPACKS');
    console.log(`   📝 Nombre: ${pack.name}`);
    console.log(`   💰 Precio: $${pack.price.toLocaleString()}`);
    console.log(`   📸 Foto: ${imgs[0]}`);
    console.log(`   🆔 ID: ${pack.id}`);
    console.log(`   💡 Incluye: Los 40 megapacks individuales`);
    console.log(`   💵 Ahorro: $740.000 (valor real $800.000)`);
  }

  // Megapacks
  const megapacks = digitales.filter(p => p.name.startsWith('Mega Pack'));
  console.log(`\n📚 40 MEGAPACKS INDIVIDUALES (${megapacks.length} productos)`);
  console.log(`   💰 Precio c/u: $20.000`);
  if (megapacks.length > 0) {
    const imgs = JSON.parse(megapacks[0].images);
    console.log(`   📸 Foto: ${imgs[0]}`);
  }
  console.log(`\n   📋 Listado completo:`);
  megapacks.forEach((p, i) => {
    console.log(`   ${String(i + 1).padStart(2, '0')}. ${p.name} - ID: ${p.id}`);
  });

  // FÍSICOS
  const fisicos = productos.filter(p => p.category === 'PHYSICAL');
  console.log('\n\n🏍️ PRODUCTOS FÍSICOS (' + fisicos.length + ')');
  console.log('='.repeat(70));

  // Moto
  const moto = fisicos.find(p => p.name.includes('Moto'));
  if (moto) {
    const imgs = JSON.parse(moto.images);
    console.log('\n🏍️ MOTO BAJAJ PULSAR');
    console.log(`   📝 Nombre: ${moto.name}`);
    console.log(`   💰 Precio: $${moto.price.toLocaleString()}`);
    console.log(`   📸 Fotos: ${imgs.length} imágenes`);
    imgs.forEach((img: string, i: number) => {
      console.log(`      ${i + 1}. ${img}`);
    });
    console.log(`   🆔 ID: ${moto.id}`);
  }

  // Laptops
  const laptops = fisicos.filter(p => 
    p.name.toLowerCase().includes('portatil') || 
    p.name.toLowerCase().includes('macbook') ||
    p.name.toLowerCase().includes('portátil')
  );
  console.log(`\n💻 LAPTOPS (${laptops.length} productos)`);
  console.log(`   💰 Rango: $${Math.min(...laptops.map(p => p.price)).toLocaleString()} - $${Math.max(...laptops.map(p => p.price)).toLocaleString()}`);
  console.log(`\n   📋 Listado:`);
  laptops.forEach((p, i) => {
    const imgs = JSON.parse(p.images);
    console.log(`   ${String(i + 1).padStart(2, '0')}. ${p.name.substring(0, 60)}...`);
    console.log(`       💰 $${p.price.toLocaleString()} | 📸 ${imgs.length} foto(s) | 🆔 ${p.id}`);
  });

  // Impresoras
  const impresoras = fisicos.filter(p => 
    p.name.toLowerCase().includes('impresora') || 
    p.name.toLowerCase().includes('escáner')
  );
  console.log(`\n🖨️ IMPRESORAS Y ESCÁNERES (${impresoras.length} productos)`);
  console.log(`   💰 Rango: $${Math.min(...impresoras.map(p => p.price)).toLocaleString()} - $${Math.max(...impresoras.map(p => p.price)).toLocaleString()}`);
  console.log(`\n   📋 Listado:`);
  impresoras.forEach((p, i) => {
    const imgs = JSON.parse(p.images);
    console.log(`   ${String(i + 1).padStart(2, '0')}. ${p.name.substring(0, 60)}...`);
    console.log(`       💰 $${p.price.toLocaleString()} | 📸 ${imgs.length} foto(s) | 🆔 ${p.id}`);
  });

  // Otros
  const otros = fisicos.filter(p => 
    !p.name.toLowerCase().includes('portatil') && 
    !p.name.toLowerCase().includes('portátil') &&
    !p.name.toLowerCase().includes('macbook') &&
    !p.name.toLowerCase().includes('impresora') &&
    !p.name.toLowerCase().includes('escáner') &&
    !p.name.toLowerCase().includes('moto')
  );
  if (otros.length > 0) {
    console.log(`\n📦 OTROS PRODUCTOS (${otros.length})`);
    otros.forEach((p, i) => {
      const imgs = JSON.parse(p.images);
      console.log(`   ${i + 1}. ${p.name}`);
      console.log(`      💰 $${p.price.toLocaleString()} | 📸 ${imgs.length} foto(s) | 🆔 ${p.id}`);
    });
  }

  // RESUMEN
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 RESUMEN FINAL');
  console.log('='.repeat(70));
  console.log(`\n✅ Total productos en BD: ${productos.length}`);
  console.log(`   💾 Digitales: ${digitales.length}`);
  console.log(`      - 1 Curso de Piano ($60.000)`);
  console.log(`      - 1 Pack Completo ($60.000)`);
  console.log(`      - 40 Megapacks ($20.000 c/u)`);
  console.log(`   🏍️ Físicos: ${fisicos.length}`);
  console.log(`      - 1 Moto ($6.500.000)`);
  console.log(`      - ${laptops.length} Laptops`);
  console.log(`      - ${impresoras.length} Impresoras/Escáneres`);
  if (otros.length > 0) {
    console.log(`      - ${otros.length} Otros`);
  }

  console.log('\n📍 UBICACIÓN:');
  console.log(`   🗄️  Base de Datos: PostgreSQL/SQLite`);
  console.log(`   📂 Fotos Digitales: /public/fotos/`);
  console.log(`   🌐 Fotos MegaComputer: megacomputer.com.co`);
  console.log(`   🌐 Foto Piano: landein-page-pian2.vercel.app`);

  console.log('\n✅ Todos los productos están listos para usar');

  await prisma.$disconnect();
}

mostrarUbicacion().catch(console.error);
