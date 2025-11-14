/**
 * 🧪 TEST: Verificar formato de respuestas y envío de fotos
 */

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function testFormatoYFotos() {
  console.log('🧪 Iniciando prueba de formato y fotos...\n');

  try {
    // 1. Verificar productos con fotos
    console.log('📸 1. Verificando productos con fotos...');
    const productosConFotos = await db.product.findMany({
      where: {
        images: {
          not: null
        }
      },
      take: 5
    });

    console.log(`✅ Encontrados ${productosConFotos.length} productos con fotos\n`);

    productosConFotos.forEach((producto, index) => {
      console.log(`${index + 1}. ${producto.name}`);
      
      try {
        const images = JSON.parse(producto.images);
        console.log(`   📸 Fotos: ${images.length}`);
        console.log(`   🔗 Primera URL: ${images[0]?.substring(0, 80)}...`);
      } catch (e) {
        console.log(`   ⚠️  Error parseando imágenes`);
      }
      console.log('');
    });

    // 2. Test de formato de respuestas
    console.log('\n📝 2. Probando formato de respuestas...\n');

    const respuestaLarga = `Claro que sí, tenemos varios portátiles disponibles. Te puedo recomendar el HP Pavilion que tiene procesador Intel Core i5, 8GB de RAM y 256GB SSD. También tenemos el Lenovo IdeaPad con Ryzen 5, 16GB RAM y 512GB SSD. Ambos son excelentes opciones para trabajo y estudio. El HP cuesta $2,500,000 y el Lenovo $2,800,000. ¿Cuál te interesa más?`;

    console.log('Respuesta ANTES del formato:');
    console.log(respuestaLarga);
    console.log(`\nLongitud: ${respuestaLarga.length} caracteres\n`);

    // Simular formato
    const respuestaFormateada = formatearParaWhatsApp(respuestaLarga);
    const respuestaAcortada = acortarRespuesta(respuestaFormateada, 400);

    console.log('Respuesta DESPUÉS del formato:');
    console.log(respuestaFormateada);
    console.log(`\nLongitud: ${respuestaFormateada.length} caracteres\n`);

    console.log('Respuesta ACORTADA (máx 400):');
    console.log(respuestaAcortada);
    console.log(`\nLongitud: ${respuestaAcortada.length} caracteres\n`);

    // 3. Verificar configuración de fotos
    console.log('\n⚙️  3. Verificando configuración...\n');
    console.log(`PHOTOS_ENABLED: ${process.env.PHOTOS_ENABLED || 'no configurado'}`);
    console.log(`AUDIO_ENABLED: ${process.env.AUDIO_ENABLED || 'no configurado'}`);
    console.log(`HOT_RELOAD_ENABLED: ${process.env.HOT_RELOAD_ENABLED || 'no configurado'}`);

    console.log('\n✅ Prueba completada\n');

  } catch (error) {
    console.error('❌ Error en prueba:', error);
  } finally {
    await db.$disconnect();
  }
}

// Funciones auxiliares de formato
function formatearParaWhatsApp(text) {
  if (text.includes('•') || text.includes('✓') || text.includes('🔹')) {
    return text;
  }

  const paragraphs = text.split('\n\n');
  let formatted = '';

  for (const para of paragraphs) {
    if (para.includes('\n-') || para.includes('\n•') || /\n\d+\./.test(para)) {
      const lines = para.split('\n');
      formatted += lines[0] + '\n\n';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const cleaned = line.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '');
          formatted += `🔹 ${cleaned}\n`;
        }
      }
      formatted += '\n';
    } else {
      formatted += para + '\n\n';
    }
  }

  return formatted.trim();
}

function acortarRespuesta(text, maxLength = 400) {
  if (text.length <= maxLength) return text;

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let shortened = '';
  let currentLength = 0;

  for (const sentence of sentences) {
    if (currentLength + sentence.length > maxLength) {
      break;
    }
    shortened += sentence;
    currentLength += sentence.length;
  }

  if (shortened.length < text.length) {
    shortened += '\n\n¿Quieres que te cuente más detalles? 😊';
  }

  return shortened.trim();
}

// Ejecutar
testFormatoYFotos();
