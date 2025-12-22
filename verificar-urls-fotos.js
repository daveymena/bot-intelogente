/**
 * Script para verificar que las URLs de fotos se generan correctamente
 */

const { RealDataEnforcer } = require('./dist/lib/real-data-enforcer');

async function verificarURLs() {
  console.log('🔍 Verificando URLs de fotos...\n');

  try {
    // Buscar el curso de piano
    const product = await RealDataEnforcer.searchProduct('piano');

    if (!product) {
      console.log('❌ Producto no encontrado');
      return;
    }

    console.log('✅ Producto encontrado:');
    console.log(`   Nombre: ${product.name}`);
    console.log(`   Precio: ${product.price.toLocaleString('es-CO')} COP`);
    console.log(`   Imágenes: ${product.images.length}\n`);

    if (product.images.length === 0) {
      console.log('⚠️ No hay imágenes');
      return;
    }

    console.log('📸 URLs de imágenes:');
    product.images.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url}`);
      
      // Verificar formato
      if (url.startsWith('http://') || url.startsWith('https://')) {
        console.log('      ✅ URL absoluta válida');
      } else if (url.startsWith('/')) {
        console.log('      ❌ Ruta relativa (NO funcionará en Baileys)');
      } else {
        console.log('      ⚠️ Formato desconocido');
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verificarURLs();
