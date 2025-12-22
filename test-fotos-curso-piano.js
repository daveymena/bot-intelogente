/**
 * 🧪 TEST: Verificar envío de fotos del curso de piano
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFotosCursoPiano() {
  console.log('🧪 TEST: Fotos del Curso de Piano\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // 1. Buscar el curso de piano
  const curso = await prisma.product.findFirst({
    where: {
      name: { contains: 'Piano', mode: 'insensitive' },
      status: 'AVAILABLE'
    },
    select: {
      id: true,
      name: true,
      price: true,
      images: true
    }
  });
  
  if (!curso) {
    console.log('❌ No se encontró el curso de piano');
    return;
  }
  
  console.log('✅ Curso encontrado:');
  console.log(`   Nombre: ${curso.name}`);
  console.log(`   ID: ${curso.id}`);
  console.log(`   Precio: $${curso.price.toLocaleString('es-CO')}\n`);
  
  // 2. Verificar imágenes
  console.log('📸 IMÁGENES RAW:');
  console.log(`   Tipo: ${typeof curso.images}`);
  console.log(`   Valor: ${curso.images}\n`);
  
  let imagenes = [];
  try {
    if (typeof curso.images === 'string') {
      imagenes = JSON.parse(curso.images);
    } else if (Array.isArray(curso.images)) {
      imagenes = curso.images;
    }
    console.log('✅ Imágenes parseadas correctamente');
    console.log(`   Cantidad: ${imagenes.length}`);
    console.log(`   Array: ${JSON.stringify(imagenes, null, 2)}\n`);
  } catch (error) {
    console.log(`❌ Error parseando imágenes: ${error.message}\n`);
    return;
  }
  
  if (imagenes.length === 0) {
    console.log('❌ El producto NO tiene imágenes\n');
    return;
  }
  
  // 3. Simular conversión de rutas locales a URLs
  console.log('🔄 CONVERSIÓN DE RUTAS:\n');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:4000';
  console.log(`   Base URL: ${baseUrl}\n`);
  
  imagenes.forEach((url, index) => {
    console.log(`   Imagen ${index + 1}:`);
    console.log(`   - Original: ${url}`);
    
    if (!url) {
      console.log(`   - ❌ URL vacía\n`);
      return;
    }
    
    if (url.startsWith('http')) {
      console.log(`   - ✅ Ya es URL completa`);
      console.log(`   - Final: ${url}\n`);
    } else if (url.startsWith('/')) {
      const fullUrl = `${baseUrl}${url}`;
      console.log(`   - 🔄 Ruta local detectada`);
      console.log(`   - ✅ Convertida a: ${fullUrl}\n`);
    } else {
      console.log(`   - ⚠️ Formato desconocido\n`);
    }
  });
  
  // 4. Simular obtenerFotosProducto
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SIMULACIÓN DE obtenerFotosProducto():\n');
  
  const fotosValidas = imagenes
    .filter(url => url && (url.startsWith('http') || url.startsWith('/')))
    .map(url => {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      return url;
    });
  
  console.log(`   Fotos válidas: ${fotosValidas.length}`);
  
  if (fotosValidas.length > 0) {
    console.log('   ✅ SE ENVIARÍAN FOTOS:\n');
    fotosValidas.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url}`);
    });
  } else {
    console.log('   ❌ NO SE ENVIARÍAN FOTOS');
    console.log('   Razón: No hay URLs válidas\n');
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 CONCLUSIÓN:\n');
  
  if (fotosValidas.length > 0) {
    console.log('✅ El curso de piano TIENE fotos');
    console.log('✅ Las fotos DEBERÍAN enviarse automáticamente');
    console.log('\n⚠️  Si NO se están enviando, verificar:');
    console.log('   1. Servidor reiniciado');
    console.log('   2. Logs del servidor en tiempo real');
    console.log('   3. Función obtenerFotosProducto() se está llamando');
    console.log('   4. El return incluye { fotos: [...] }\n');
  } else {
    console.log('❌ El curso de piano NO tiene fotos válidas');
    console.log('   Solución: Agregar URL completa o ruta local válida\n');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  await prisma.$disconnect();
}

testFotosCursoPiano()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
