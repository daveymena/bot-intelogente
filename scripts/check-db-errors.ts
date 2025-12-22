import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseErrors() {
  console.log('🔍 Verificando integridad de la base de datos...\n');

  try {
    // 1. Verificar total de productos
    console.log('1️⃣ Total de productos en la base de datos:');
    const totalProducts = await prisma.product.count();
    console.log(`   ${totalProducts} productos registrados`);
    console.log('');

    // 2. Verificar imágenes con rutas locales (CORRECTO: son válidas)
    console.log('2️⃣ Productos con rutas de imagen locales:');
    const allProducts = await prisma.product.findMany({
      select: { id: true, name: true, images: true, price: true },
    });
    const productsWithLocalImages = allProducts.filter(p => {
      if (!p.images) return false;
      try {
        const images = JSON.parse(p.images);
        if (!Array.isArray(images)) return false;
        return images.some((img: string) => 
          img.startsWith('/fotos/') || img.startsWith('fotos/')
        );
      } catch {
        return false;
      }
    });
    console.log(`   ${productsWithLocalImages.length} productos con rutas locales`);
    if (productsWithLocalImages.length > 0) {
      console.log('   ✅ Las rutas locales son válidas y se convierten automáticamente');
      productsWithLocalImages.slice(0, 3).forEach(p => {
        try {
          const images = JSON.parse(p.images!);
          console.log(`      - ${p.name}: ${images[0]}`);
        } catch {}
      });
    }
    console.log('');

    // 3. Verificar productos sin imágenes
    console.log('3️⃣ Productos sin imágenes:');
    const productsWithoutImages = allProducts.filter(p => {
      if (!p.images) return true;
      try {
        const images = JSON.parse(p.images);
        return !Array.isArray(images) || images.length === 0;
      } catch {
        return true;
      }
    });
    console.log(`   ${productsWithoutImages.length} productos sin imágenes`);
    if (productsWithoutImages.length > 0) {
      console.log('   ℹ️ Estos productos usarán imagen placeholder');
      productsWithoutImages.slice(0, 5).forEach(p => {
        console.log(`      - ${p.name}`);
      });
    }
    console.log('');

    // 4. Verificar productos con precios inválidos
    console.log('4️⃣ Productos con precios inválidos:');
    const productsWithInvalidPrice = allProducts.filter(p => {
      return !p.price || p.price <= 0;
    });
    console.log(`   ${productsWithInvalidPrice.length} productos con precio inválido`);
    if (productsWithInvalidPrice.length > 0) {
      console.log('   ⚠️ Estos productos necesitan precio válido');
      productsWithInvalidPrice.slice(0, 3).forEach(p => {
        console.log(`      - ${p.name}: ${p.price || 'sin precio'}`);
      });
    }
    console.log('');

    // 5. Verificar total de conversaciones
    console.log('5️⃣ Total de conversaciones:');
    const totalConversations = await prisma.conversation.count();
    console.log(`   ${totalConversations} conversaciones registradas`);
    console.log('');

    // 6. Verificar total de mensajes
    console.log('6️⃣ Total de mensajes:');
    const totalMessages = await prisma.message.count();
    console.log(`   ${totalMessages} mensajes registrados`);
    console.log('');

    // Resumen
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMEN DE ERRORES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const totalErrors = 
      productsWithInvalidPrice.length +
      productsWithoutImages.length;

    if (totalErrors === 0) {
      console.log('✅ No se encontraron errores críticos');
      console.log('✅ Base de datos en perfecto estado');
      if (productsWithLocalImages.length > 0) {
        console.log(`✅ ${productsWithLocalImages.length} productos con fotos locales (funcionando correctamente)`);
      }
    } else {
      console.log(`⚠️ Total de problemas encontrados: ${totalErrors}`);
      console.log('\n🔧 Soluciones recomendadas:');
      if (productsWithInvalidPrice.length > 0) {
        console.log('   - Corregir precios en el dashboard');
      }
      if (productsWithoutImages.length > 0) {
        console.log('   - Agregar imágenes a los productos sin fotos');
      }
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseErrors();
