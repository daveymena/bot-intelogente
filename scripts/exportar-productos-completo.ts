import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportar() {
  console.log('📤 EXPORTANDO PRODUCTOS DE LA BASE DE DATOS');
  console.log('='.repeat(70));

  const productos = await prisma.product.findMany({
    select: {
      name: true,
      description: true,
      price: true,
      currency: true,
      category: true,
      status: true,
      images: true,
      tags: true,
      stock: true,
      paymentLinkMercadoPago: true,
      paymentLinkPayPal: true,
      paymentLinkCustom: true,
    },
    orderBy: [
      { category: 'asc' },
      { price: 'asc' }
    ]
  });

  console.log(`\n✅ Productos encontrados: ${productos.length}\n`);

  // 1. EXPORTAR A JSON
  const jsonData = productos.map(p => ({
    name: p.name,
    description: p.description,
    price: p.price,
    currency: p.currency,
    category: p.category,
    status: p.status,
    images: JSON.parse(p.images || '[]'),
    tags: JSON.parse(p.tags || '[]'),
    stock: p.stock,
    paymentLinkMercadoPago: p.paymentLinkMercadoPago || '',
    paymentLinkPayPal: p.paymentLinkPayPal || '',
    paymentLinkCustom: p.paymentLinkCustom || ''
  }));

  const jsonPath = path.join(process.cwd(), 'catalogo-completo-68-productos.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
  console.log(`✅ JSON creado: catalogo-completo-68-productos.json`);
  console.log(`   📍 Ubicación: ${jsonPath}`);
  console.log(`   📦 Productos: ${jsonData.length}`);

  // 2. EXPORTAR A CSV (Excel)
  const csvLines = ['name,description,price,currency,category,status,images,tags,stock,paymentLinkMercadoPago,paymentLinkPayPal,paymentLinkCustom'];
  
  productos.forEach(p => {
    const images = JSON.parse(p.images || '[]');
    const tags = JSON.parse(p.tags || '[]');
    
    // Escapar comillas y comas en los campos
    const name = `"${p.name.replace(/"/g, '""')}"`;
    const description = `"${(p.description || '').replace(/"/g, '""')}"`;
    const imagesStr = `"${images.join('|')}"`;
    const tagsStr = `"${tags.join('|')}"`;
    const paymentLinkMP = p.paymentLinkMercadoPago ? `"${p.paymentLinkMercadoPago}"` : '';
    const paymentLinkPP = p.paymentLinkPayPal ? `"${p.paymentLinkPayPal}"` : '';
    const paymentLinkCustom = p.paymentLinkCustom ? `"${p.paymentLinkCustom}"` : '';
    
    csvLines.push([
      name,
      description,
      p.price,
      p.currency,
      p.category,
      p.status,
      imagesStr,
      tagsStr,
      p.stock || '',
      paymentLinkMP,
      paymentLinkPP,
      paymentLinkCustom
    ].join(','));
  });

  const csvPath = path.join(process.cwd(), 'catalogo-completo-68-productos.csv');
  fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf-8');
  console.log(`\n✅ CSV creado: catalogo-completo-68-productos.csv`);
  console.log(`   📍 Ubicación: ${csvPath}`);
  console.log(`   📦 Productos: ${productos.length}`);
  console.log(`   💡 Puedes abrir este archivo en Excel`);

  // 3. RESUMEN POR CATEGORÍA
  const digitales = productos.filter(p => p.category === 'DIGITAL');
  const fisicos = productos.filter(p => p.category === 'PHYSICAL');

  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN DE EXPORTACIÓN');
  console.log('='.repeat(70));
  console.log(`\n✅ Total exportado: ${productos.length} productos`);
  console.log(`   💾 Digitales: ${digitales.length}`);
  console.log(`   🏍️ Físicos: ${fisicos.length}`);

  console.log('\n📂 ARCHIVOS CREADOS:');
  console.log(`   1. catalogo-completo-68-productos.json`);
  console.log(`   2. catalogo-completo-68-productos.csv`);

  console.log('\n💡 USO:');
  console.log(`   - JSON: Para importar programáticamente`);
  console.log(`   - CSV: Para editar en Excel y reimportar`);

  await prisma.$disconnect();
}

exportar().catch(console.error);
