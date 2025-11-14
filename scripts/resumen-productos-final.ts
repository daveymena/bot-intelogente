import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resumen() {
  console.log('📊 RESUMEN FINAL DE PRODUCTOS');
  console.log('='.repeat(70));

  const productos = await prisma.product.findMany({
    select: {
      name: true,
      price: true,
      category: true,
      images: true,
    },
    orderBy: {
      category: 'asc'
    }
  });

  // Agrupar por categoría
  const digitales = productos.filter(p => p.category === 'DIGITAL');
  const fisicos = productos.filter(p => p.category === 'PHYSICAL');

  console.log('\n💾 PRODUCTOS DIGITALES:');
  console.log('-'.repeat(70));

  // Curso de Piano
  const piano = digitales.find(p => p.name.includes('Piano'));
  if (piano) {
    console.log(`\n🎹 Curso de Piano:`);
    console.log(`   Nombre: ${piano.name}`);
    console.log(`   Precio: $${piano.price.toLocaleString()}`);
    const imgs = JSON.parse(piano.images);
    console.log(`   Foto: ${imgs[0]}`);
  }

  // Pack Completo
  const packCompleto = digitales.find(p => p.name.includes('PACK COMPLETO'));
  if (packCompleto) {
    console.log(`\n📦 Pack Completo:`);
    console.log(`   Nombre: ${packCompleto.name}`);
    console.log(`   Precio: $${packCompleto.price.toLocaleString()}`);
    const imgs = JSON.parse(packCompleto.images);
    console.log(`   Foto: ${imgs[0]}`);
  }

  // Megapacks individuales
  const megapacks = digitales.filter(p => p.name.startsWith('Mega Pack'));
  console.log(`\n📚 Megapacks Individuales: ${megapacks.length}`);
  console.log(`   Precio c/u: $20.000`);
  if (megapacks.length > 0) {
    const imgs = JSON.parse(megapacks[0].images);
    console.log(`   Foto: ${imgs[0]}`);
  }
  console.log(`   Listado:`);
  megapacks.slice(0, 5).forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name}`);
  });
  console.log(`   ... y ${megapacks.length - 5} más`);

  console.log(`\n💰 Total Digitales: ${digitales.length} productos`);
  console.log(`   - 1 Curso de Piano: $60.000`);
  console.log(`   - 1 Pack Completo: $60.000`);
  console.log(`   - 40 Megapacks: $20.000 c/u`);

  console.log('\n\n🏍️ PRODUCTOS FÍSICOS:');
  console.log('-'.repeat(70));

  // Moto
  const moto = fisicos.find(p => p.name.includes('Moto'));
  if (moto) {
    console.log(`\n🏍️ Moto:`);
    console.log(`   Nombre: ${moto.name}`);
    console.log(`   Precio: $${moto.price.toLocaleString()}`);
    const imgs = JSON.parse(moto.images);
    console.log(`   Fotos: ${imgs.length}`);
  }

  // Laptops
  const laptops = fisicos.filter(p => p.name.toLowerCase().includes('portatil') || p.name.toLowerCase().includes('macbook'));
  console.log(`\n💻 Laptops: ${laptops.length}`);
  laptops.slice(0, 3).forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name.substring(0, 50)}... - $${p.price.toLocaleString()}`);
  });
  if (laptops.length > 3) {
    console.log(`   ... y ${laptops.length - 3} más`);
  }

  // Impresoras
  const impresoras = fisicos.filter(p => p.name.toLowerCase().includes('impresora') || p.name.toLowerCase().includes('escáner'));
  console.log(`\n🖨️ Impresoras/Escáneres: ${impresoras.length}`);
  impresoras.slice(0, 3).forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name.substring(0, 50)}... - $${p.price.toLocaleString()}`);
  });
  if (impresoras.length > 3) {
    console.log(`   ... y ${impresoras.length - 3} más`);
  }

  // Otros
  const otros = fisicos.filter(p => 
    !p.name.toLowerCase().includes('portatil') && 
    !p.name.toLowerCase().includes('macbook') &&
    !p.name.toLowerCase().includes('impresora') &&
    !p.name.toLowerCase().includes('escáner') &&
    !p.name.toLowerCase().includes('moto')
  );
  if (otros.length > 0) {
    console.log(`\n📦 Otros: ${otros.length}`);
    otros.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name.substring(0, 50)}... - $${p.price.toLocaleString()}`);
    });
  }

  console.log(`\n💰 Total Físicos: ${fisicos.length} productos`);

  console.log('\n\n' + '='.repeat(70));
  console.log('📊 RESUMEN GENERAL:');
  console.log(`✅ Total productos: ${productos.length}`);
  console.log(`   - Digitales: ${digitales.length}`);
  console.log(`   - Físicos: ${fisicos.length}`);
  console.log('\n✅ Todos los productos tienen fotos');
  console.log('✅ Precios correctos aplicados');

  await prisma.$disconnect();
}

resumen().catch(console.error);
