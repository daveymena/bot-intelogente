/**
 * Verificación Detallada del Curso de Piano
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarCursoPiano() {
  console.log('🎹 Verificación Detallada: Curso de Piano\n');

  try {
    const curso = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'Piano',
          mode: 'insensitive'
        }
      }
    });

    if (!curso) {
      console.log('❌ No se encontró el Curso de Piano');
      return;
    }

    console.log('✅ PRODUCTO ENCONTRADO\n');
    console.log('📦 Nombre:', curso.name);
    console.log('💰 Precio:', curso.price.toLocaleString('es-CO'), 'COP');
    console.log('📝 Descripción:', curso.description?.substring(0, 150) + '...');
    console.log('\n📸 ANÁLISIS DE IMÁGENES:');
    console.log('   Tipo de dato:', typeof curso.images);
    console.log('   Valor raw:', curso.images);
    
    if (curso.images) {
      try {
        const parsed = JSON.parse(curso.images);
        console.log('   ✅ JSON válido');
        console.log('   Es array:', Array.isArray(parsed));
        console.log('   Cantidad:', Array.isArray(parsed) ? parsed.length : 'N/A');
        
        if (Array.isArray(parsed)) {
          parsed.forEach((url, i) => {
            console.log(`\n   Imagen ${i + 1}:`);
            console.log(`      URL: ${url}`);
            console.log(`      Tipo: ${url.startsWith('http') ? '🌐 Completa' : url.startsWith('/') ? '📁 Local' : '❓ Desconocida'}`);
            
            // Simular conversión
            if (url.startsWith('/')) {
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';
              const fullUrl = `${baseUrl}${url}`;
              console.log(`      Convertida: ${fullUrl}`);
            }
          });
        }
      } catch (e) {
        console.log('   ❌ Error parseando JSON:', e.message);
      }
    } else {
      console.log('   ⚠️ Sin imágenes');
    }

    console.log('\n🔗 INFORMACIÓN DE ENTREGA:');
    console.log('   deliveryLink:', curso.deliveryLink || 'No configurado');
    console.log('   paymentLink:', curso.paymentLink || 'No configurado');

    console.log('\n📊 CATEGORIZACIÓN:');
    console.log('   category:', curso.category);
    console.log('   mainCategory:', curso.mainCategory || 'No asignada');
    console.log('   subCategory:', curso.subCategory || 'No asignada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarCursoPiano();
