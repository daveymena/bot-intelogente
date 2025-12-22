const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function testFotos() {
  try {
    console.log('🧪 TEST: Verificación de fotos Curso de Piano\n');
    
    // 1. Obtener producto
    const product = await db.product.findFirst({
      where: {
        name: { contains: 'Piano', mode: 'insensitive' }
      }
    });

    if (!product) {
      console.log('❌ Producto no encontrado');
      return;
    }

    console.log('✅ Producto encontrado:', product.name);
    console.log('💰 Precio:', product.price.toLocaleString('es-CO'), 'COP');
    console.log('📦 Images field:', product.images);
    console.log('🔍 Type:', typeof product.images);
    console.log('');

    // 2. Parsear imágenes
    let images = [];
    try {
      if (typeof product.images === 'string') {
        images = JSON.parse(product.images);
      } else if (Array.isArray(product.images)) {
        images = product.images;
      }
    } catch (e) {
      console.error('❌ Error parseando imágenes:', e);
      return;
    }

    console.log('📸 Imágenes parseadas:', images.length);
    images.forEach((img, i) => {
      console.log(`  [${i}] ${img}`);
    });
    console.log('');

    // 3. Filtrar imágenes (NUEVA LÓGICA)
    const filteredImages = images.filter(img => {
      if (!img || img.trim() === '') return false;
      const trimmed = img.trim();
      return trimmed.startsWith('http') || trimmed.startsWith('/');
    });

    console.log('✅ Imágenes filtradas (válidas):', filteredImages.length);
    filteredImages.forEach((img, i) => {
      console.log(`  [${i}] ${img}`);
      console.log(`      ✓ Válida: ${img.startsWith('http') ? 'URL completa' : 'Ruta relativa'}`);
    });
    console.log('');

    // 4. Simular envío CARD
    if (filteredImages.length > 0) {
      console.log('📸 SIMULACIÓN ENVÍO CARD:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const maxPhotos = Math.min(filteredImages.length, 3);
      console.log(`✅ Se enviarían ${maxPhotos} foto(s)`);
      
      for (let i = 0; i < maxPhotos; i++) {
        console.log(`\n📤 Foto ${i + 1}/${maxPhotos}:`);
        console.log(`   URL: ${filteredImages[i]}`);
        if (i === 0) {
          console.log(`   Caption: [CARD COMPLETO]`);
          console.log(`   ┌────────────────────────────────────┐`);
          console.log(`   │ 📚 *${product.name}*`);
          console.log(`   │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          console.log(`   │`);
          console.log(`   │ 💰 *PRECIO:* ${product.price.toLocaleString('es-CO')} COP`);
          console.log(`   │`);
          console.log(`   │ ✅ *INCLUYE:*`);
          console.log(`   │    • Acceso inmediato`);
          console.log(`   │    • Entrega por WhatsApp`);
          console.log(`   │    • Soporte incluido`);
          console.log(`   │`);
          console.log(`   │ 👉 *¿Te interesa?* Escribe`);
          console.log(`   │    "comprar" o "más info"`);
          console.log(`   │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          console.log(`   └────────────────────────────────────┘`);
        } else {
          console.log(`   Caption: (sin caption)`);
        }
      }
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ TEST EXITOSO: Las fotos se enviarían correctamente');
    } else {
      console.log('❌ TEST FALLIDO: No hay imágenes válidas para enviar');
    }

  } catch (error) {
    console.error('❌ Error en test:', error);
  } finally {
    await db.$disconnect();
  }
}

testFotos();
