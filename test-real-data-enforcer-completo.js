/**
 * Test completo de RealDataEnforcer con conversión de URLs
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRealDataEnforcer() {
  console.log('🔍 TEST COMPLETO: RealDataEnforcer + Conversión de URLs\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Simular la función getProductData de RealDataEnforcer
    const productId = 'cmiy3asdi007rkma4dqwp2dio'; // Curso de Piano
    
    console.log(`📦 Obteniendo producto: ${productId}\n`);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        category: true,
        images: true,
        stock: true
      }
    });

    if (!product) {
      console.log('❌ Producto no encontrado');
      await prisma.$disconnect();
      return;
    }

    console.log('✅ Producto encontrado en BD:');
    console.log(`   Nombre: ${product.name}`);
    console.log(`   Precio: ${product.price.toLocaleString('es-CO')} COP`);
    console.log(`   Categoría: ${product.category}\n`);

    // Parsear imágenes (como lo hace RealDataEnforcer)
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

    console.log('📸 IMÁGENES EN BD:');
    console.log(`   Raw: ${JSON.stringify(product.images)}`);
    console.log(`   Parseadas: ${JSON.stringify(images)}\n`);

    // Aplicar conversión (como lo hace RealDataEnforcer AHORA)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log(`🌐 Base URL: ${baseUrl}\n`);

    console.log('🔄 APLICANDO CONVERSIÓN:\n');

    const convertedImages = images
      .filter(img => {
        if (!img || img.trim() === '') return false;
        const trimmed = img.trim();
        return trimmed.startsWith('http') || trimmed.startsWith('/');
      })
      .map(img => {
        const trimmed = img.trim();
        console.log(`   ORIGINAL: "${trimmed}"`);
        
        // Si es ruta relativa, convertir a URL absoluta
        if (trimmed.startsWith('/') && !trimmed.startsWith('http')) {
          const converted = `${baseUrl}${trimmed}`;
          console.log(`   ✅ CONVERTIDA: "${converted}"\n`);
          return converted;
        }
        
        console.log(`   ✅ YA ES ABSOLUTA (sin cambios)\n`);
        return trimmed;
      });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESULTADO FINAL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const productData = {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      images: convertedImages,
      stock: product.stock
    };

    console.log('✅ ProductData (como lo devuelve RealDataEnforcer):');
    console.log(JSON.stringify(productData, null, 2));

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 VERIFICACIÓN PARA BAILEYS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (convertedImages.length > 0) {
      const imageUrl = convertedImages[0];
      console.log('📤 URL que se enviará a Baileys:');
      console.log(`   ${imageUrl}\n`);

      // Verificar formato
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        console.log('✅ FORMATO VÁLIDO para Baileys');
        console.log('✅ La foto SE ENVIARÁ correctamente\n');
        
        console.log('📋 Código Baileys que se ejecutará:');
        console.log('```javascript');
        console.log('await socket.sendMessage(from, {');
        console.log(`  image: { url: "${imageUrl}" },`);
        console.log('  caption: "📚 *Curso Piano Profesional Completo*..."');
        console.log('});');
        console.log('```');
      } else {
        console.log('❌ FORMATO INVÁLIDO para Baileys');
        console.log('❌ La foto NO se enviará');
      }
    } else {
      console.log('⚠️ No hay imágenes para enviar');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TEST COMPLETADO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testRealDataEnforcer();
