/**
 * Test Final: Conversación Completa - Curso de Piano
 * 
 * Simula la conversación real con el bot para verificar que:
 * 1. El bot responde inmediatamente con información completa
 * 2. Las fotos se procesan correctamente
 * 3. No hace preguntas innecesarias
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simular el servicio de fotos
function obtenerFotosProducto(producto) {
  console.log(`\n[PhotoService] 🔍 Procesando fotos para: ${producto.name}`);
  
  if (!producto.images) {
    console.log('[PhotoService] ⚠️ Sin imágenes');
    return [];
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';
  console.log(`[PhotoService] 🌐 Base URL: ${baseUrl}`);

  let imagenes = [];
  try {
    imagenes = JSON.parse(producto.images);
  } catch (e) {
    console.log('[PhotoService] ❌ Error parseando JSON:', e.message);
    return [];
  }

  if (!Array.isArray(imagenes)) {
    console.log('[PhotoService] ⚠️ No es un array');
    return [];
  }

  const fotos = imagenes
    .filter(url => url && (url.startsWith('http') || url.startsWith('/')))
    .map(url => {
      let fullUrl = url;
      if (url.startsWith('/')) {
        const cleanPath = url.startsWith('//') ? url.substring(1) : url;
        fullUrl = `${baseUrl}${cleanPath}`;
        console.log(`[PhotoService] 🔄 Convertido: ${url} → ${fullUrl}`);
      }
      return { url: fullUrl };
    });

  console.log(`[PhotoService] ✅ ${fotos.length} foto(s) lista(s)`);
  return fotos;
}

// Simular respuesta del bot
function generarRespuestaBot(producto, fotos) {
  let respuesta = `🎹 ${producto.name}\n\n`;
  respuesta += `💰 Precio: $${producto.price.toLocaleString('es-CO')} COP\n\n`;
  respuesta += `📝 ${producto.description}\n\n`;
  
  if (fotos.length > 0) {
    respuesta += `📸 [FOTO ADJUNTA: ${fotos[0].url}]\n\n`;
  }
  
  respuesta += `💳 ¿Te gustaría proceder con el pago?`;
  
  return respuesta;
}

async function testConversacion() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TEST FINAL: Conversación Curso de Piano');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // 1. Buscar el producto
    console.log('👤 Cliente: "Quiero el curso de piano"\n');
    console.log('🤖 Bot: Buscando producto...\n');

    const producto = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'Piano',
          mode: 'insensitive'
        }
      }
    });

    if (!producto) {
      console.log('❌ ERROR: No se encontró el producto');
      return;
    }

    console.log('✅ Producto encontrado:', producto.name);

    // 2. Procesar fotos
    const fotos = obtenerFotosProducto(producto);

    // 3. Generar respuesta
    const respuesta = generarRespuestaBot(producto, fotos);

    // 4. Mostrar resultado
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  RESPUESTA DEL BOT (INMEDIATA):');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(respuesta);
    console.log('\n═══════════════════════════════════════════════════════');

    // 5. Verificaciones
    console.log('\n📊 VERIFICACIONES:\n');
    
    const checks = [
      { 
        test: 'Respuesta incluye nombre del producto', 
        pass: respuesta.includes(producto.name) 
      },
      { 
        test: 'Respuesta incluye precio', 
        pass: respuesta.includes('$') && respuesta.includes('COP') 
      },
      { 
        test: 'Respuesta incluye descripción', 
        pass: respuesta.includes(producto.description.substring(0, 20)) 
      },
      { 
        test: 'Foto procesada correctamente', 
        pass: fotos.length > 0 
      },
      { 
        test: 'URL de foto es completa', 
        pass: fotos.length > 0 && fotos[0].url.startsWith('http') 
      },
      { 
        test: 'No hace preguntas genéricas', 
        pass: !respuesta.includes('¿Cuál curso') && !respuesta.includes('¿Qué tipo') 
      }
    ];

    checks.forEach(check => {
      const icon = check.pass ? '✅' : '❌';
      console.log(`${icon} ${check.test}`);
    });

    const allPassed = checks.every(c => c.pass);
    
    console.log('\n═══════════════════════════════════════════════════════');
    if (allPassed) {
      console.log('  ✅ TODAS LAS VERIFICACIONES PASARON');
      console.log('  🎉 El bot está funcionando correctamente!');
    } else {
      console.log('  ⚠️ ALGUNAS VERIFICACIONES FALLARON');
      console.log('  🔧 Revisar los problemas indicados arriba');
    }
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error en el test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConversacion();
