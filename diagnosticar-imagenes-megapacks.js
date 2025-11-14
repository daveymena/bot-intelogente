const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnosticarImagenes() {
  console.log('🔍 DIAGNÓSTICO DE IMÁGENES DE MEGAPACKS\n');

  try {
    // Obtener todos los megapacks
    const megapacks = await prisma.product.findMany({
      where: {
        name: {
          contains: 'Mega Pack'
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true
      },
      orderBy: {
        price: 'asc'
      }
    });

    console.log(`📦 Total megapacks encontrados: ${megapacks.length}\n`);

    // Agrupar por precio
    const por20mil = megapacks.filter(p => p.price === 20000);
    const por60mil = megapacks.filter(p => p.price === 60000);
    const otros = megapacks.filter(p => p.price !== 20000 && p.price !== 60000);

    console.log('📊 DISTRIBUCIÓN POR PRECIO:');
    console.log(`   20,000 COP: ${por20mil.length} productos`);
    console.log(`   60,000 COP: ${por60mil.length} productos`);
    console.log(`   Otros precios: ${otros.length} productos\n`);

    // Verificar imágenes de 20mil
    console.log('🔍 VERIFICANDO MEGAPACKS DE 20,000 COP:\n');
    const imagenesDe20mil = {};
    por20mil.forEach(p => {
      const img = Array.isArray(p.images) ? p.images[0] : p.images;
      if (!imagenesDe20mil[img]) {
        imagenesDe20mil[img] = 0;
      }
      imagenesDe20mil[img]++;
    });

    console.log('Imágenes usadas:');
    Object.entries(imagenesDe20mil).forEach(([img, count]) => {
      console.log(`   ${img}: ${count} productos`);
    });

    // Verificar imágenes de 60mil
    console.log('\n🔍 VERIFICANDO MEGAPACKS DE 60,000 COP:\n');
    const imagenesDe60mil = {};
    por60mil.forEach(p => {
      const img = Array.isArray(p.images) ? p.images[0] : p.images;
      if (!imagenesDe60mil[img]) {
        imagenesDe60mil[img] = 0;
      }
      imagenesDe60mil[img]++;
    });

    console.log('Imágenes usadas:');
    Object.entries(imagenesDe60mil).forEach(([img, count]) => {
      console.log(`   ${img}: ${count} productos`);
    });

    // Mostrar algunos ejemplos
    console.log('\n📋 EJEMPLOS DE PRODUCTOS DE 20,000 COP:');
    por20mil.slice(0, 3).forEach(p => {
      console.log(`\n   ${p.name}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Precio: ${p.price} COP`);
      console.log(`   Imagen: ${JSON.stringify(p.images)}`);
    });

    // Verificar si las imágenes existen físicamente
    console.log('\n\n📁 VERIFICANDO ARCHIVOS FÍSICOS:\n');
    const fs = require('fs');
    const path = require('path');
    
    const imagenesToCheck = [
      '/fotos/megapack de curso disponible.png',
      '/fotos/megapack completo.png'
    ];

    imagenesToCheck.forEach(img => {
      const fullPath = path.join(__dirname, 'public', img);
      const exists = fs.existsSync(fullPath);
      console.log(`   ${img}: ${exists ? '✅ Existe' : '❌ NO EXISTE'}`);
      if (exists) {
        const stats = fs.statSync(fullPath);
        console.log(`      Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnosticarImagenes();
