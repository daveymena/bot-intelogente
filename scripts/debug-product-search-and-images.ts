
import { PrismaClient } from '@prisma/client';
import { intelligentProductSearch } from '../src/lib/intelligent-product-search';
import axios from 'axios';

const prisma = new PrismaClient();

async function test() {
  console.log('🚀 INICIANDO DEBUG DE BÚSQUEDA E IMÁGENES');

  // 1. Simular búsqueda
  const query = 'portatil';
  console.log(`\n🔍 Buscando: "${query}"`);

  const result = await intelligentProductSearch({
    userMessage: query,
    previousProducts: [],
    conversationHistory: []
  });

  if (!result) {
    console.log('❌ No se encontraron resultados (intelligentProductSearch devolvió null)');
    return;
  }

  const products = result.products || (result.product ? [result.product] : []);
  console.log(`✅ Se encontraron ${products.length} productos.`);

  if (products.length === 0) {
    console.log('⚠️ Lista de productos vacía.');
    return;
  }

  // 2. Verificar imágenes
  for (const p of products) {
    console.log(`\n📦 Producto: ${p.name}`);
    console.log(`   ID: ${p.id}`);
    console.log(`   Precio: ${p.price}`);
    
    let images: string[] = [];
    try {
      if (p.images) {
        const parsed = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
        images = Array.isArray(parsed) ? parsed : [parsed];
      }
    } catch (e) {
      console.log('   ❌ Error parseando imágenes:', e);
    }

    console.log(`   📸 Imágenes encontradas: ${images.length}`);
    if (images.length > 0) {
      console.log(`   🔗 URL 1: ${images[0]}`);
      
      // 3. Test de descarga
      try {
        console.log('   ⬇️ Intentando descargar imagen...');
        const response = await axios.get(images[0], { 
          responseType: 'arraybuffer',
          timeout: 5000 
        });
        console.log(`   ✅ Descarga exitosa! Tamaño: ${response.data.length} bytes`);
      } catch (e: any) {
        console.log(`   ❌ FALLÓ DESCARGA: ${e.message}`);
      }
    } else {
      console.log('   ⚠️ Este producto NO tiene imágenes.');
    }
  }
}

test()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
