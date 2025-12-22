/**
 * Test directo de conversión de URLs
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testURLs() {
  console.log('🔍 Verificando conversión de URLs...\n');

  try {
    // Buscar curso de piano
    const product = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'piano',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true
      }
    });

    if (!product) {
      console.log('❌ Producto no encontrado');
      await prisma.$disconnect();
      return;
    }

    console.log('✅ Producto encontrado:');
    console.log(`   ID: ${product.id}`);
    console.log(`   Nombre: ${product.name}`);
    console.log(`   Precio: ${product.price.toLocaleString('es-CO')} COP\n`);

    // Parsear imágenes
    let images = [];
    try {
      if (product.images) {
        images = typeof product.images === 'string' 
          ? JSON.parse(product.images) 
          : product.images;
      }
    } catch (e) {
      console.error('❌ Error parseando imágenes:', e.message);
    }

    console.log(`📸 Imágenes en BD: ${images.length}\n`);

    if (images.length === 0) {
      console.log('⚠️ No hay imágenes');
      await prisma.$disconnect();
      return;
    }

    // Simular conversión
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log(`🌐 Base URL: ${baseUrl}\n`);

    console.log('📋 CONVERSIÓN DE URLs:\n');
    images.forEach((img, index) => {
      const trimmed = img.trim();
      console.log(`${index + 1}. ORIGINAL:`);
      console.log(`   "${trimmed}"`);
      
      // Aplicar conversión
      let converted = trimmed;
      if (trimmed.startsWith('/') && !trimmed.startsWith('http')) {
        converted = `${baseUrl}${trimmed}`;
        console.log(`   ✅ CONVERTIDA A:`);
        console.log(`   "${converted}"`);
      } else if (trimmed.startsWith('http')) {
        console.log(`   ✅ YA ES URL ABSOLUTA`);
      } else {
        console.log(`   ⚠️ FORMATO DESCONOCIDO`);
      }
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ VERIFICACIÓN COMPLETADA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testURLs();
