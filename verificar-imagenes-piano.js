const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function verificar() {
  try {
    const product = await db.product.findFirst({
      where: {
        name: { contains: 'Piano', mode: 'insensitive' }
      }
    });

    if (!product) {
      console.log('❌ Producto no encontrado');
      return;
    }

    console.log('✅ Producto:', product.name);
    console.log('📦 Images field:', product.images);
    console.log('🔍 Type:', typeof product.images);
    
    if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images);
        console.log('✅ Parsed OK');
        console.log('📊 Length:', parsed.length);
        console.log('📸 URLs:');
        parsed.forEach((img, i) => {
          console.log(`  [${i}] ${img}`);
          console.log(`      Starts with http: ${img.startsWith('http')}`);
          console.log(`      Starts with https: ${img.startsWith('https')}`);
          console.log(`      Trim: "${img.trim()}"`);
          console.log(`      Empty: ${img.trim() === ''}`);
        });
      } catch (e) {
        console.log('❌ Error parseando:', e.message);
      }
    } else if (Array.isArray(product.images)) {
      console.log('✅ Ya es array');
      console.log('📊 Length:', product.images.length);
      console.log('📸 URLs:');
      product.images.forEach((img, i) => {
        console.log(`  [${i}] ${img}`);
        console.log(`      Starts with http: ${img.startsWith('http')}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

verificar();
