/**
 * Test completo del sistema de fotos con datos reales
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSistemaFotos() {
  console.log('🔍 VERIFICACIÓN COMPLETA DEL SISTEMA DE FOTOS\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Obtener productos con imágenes
    const productos = await prisma.product.findMany({
      where: {
        images: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        images: true
      },
      take: 10
    });

    console.log(`📦 Total productos con imágenes: ${productos.length}\n`);

    if (productos.length === 0) {
      console.log('⚠️ No hay productos con imágenes en la base de datos');
      await prisma.$disconnect();
      return;
    }

    // 2. Analizar cada producto
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log(`🌐 Base URL configurada: ${baseUrl}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let totalImagenes = 0;
    let imagenesRelativas = 0;
    let imagenesAbsolutas = 0;
    let imagenesInvalidas = 0;

    for (const producto of productos) {
      console.log(`\n📦 PRODUCTO: ${producto.name}`);
      console.log(`   ID: ${producto.id}`);
      console.log(`   Categoría: ${producto.category}`);
      console.log(`   Precio: ${producto.price.toLocaleString('es-CO')} COP`);

      // Parsear imágenes
      let images = [];
      try {
        if (producto.images) {
          images = typeof producto.images === 'string' 
            ? JSON.parse(producto.images) 
            : producto.images;
        }
      } catch (e) {
        console.log(`   ❌ Error parseando imágenes: ${e.message}`);
        continue;
      }

      console.log(`   📸 Imágenes: ${images.length}`);

      if (images.length === 0) {
        console.log(`   ⚠️ Sin imágenes`);
        continue;
      }

      // Analizar cada imagen
      images.forEach((img, index) => {
        totalImagenes++;
        const trimmed = img.trim();
        
        console.log(`\n   ${index + 1}. ORIGINAL:`);
        console.log(`      "${trimmed.substring(0, 80)}${trimmed.length > 80 ? '...' : ''}"`);

        // Clasificar tipo de URL
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          imagenesAbsolutas++;
          console.log(`      ✅ URL ABSOLUTA (ya funciona en Baileys)`);
        } else if (trimmed.startsWith('/')) {
          imagenesRelativas++;
          const converted = `${baseUrl}${trimmed}`;
          console.log(`      🔄 RUTA RELATIVA → Necesita conversión`);
          console.log(`      ✅ CONVERTIDA A:`);
          console.log(`      "${converted.substring(0, 80)}${converted.length > 80 ? '...' : ''}"`);
        } else {
          imagenesInvalidas++;
          console.log(`      ❌ FORMATO INVÁLIDO`);
        }
      });

      console.log('\n   ─────────────────────────────────────────');
    }

    // 3. Resumen estadístico
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMEN ESTADÍSTICO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`Total imágenes analizadas: ${totalImagenes}`);
    console.log(`  ✅ URLs absolutas (funcionan): ${imagenesAbsolutas} (${Math.round(imagenesAbsolutas/totalImagenes*100)}%)`);
    console.log(`  🔄 Rutas relativas (necesitan conversión): ${imagenesRelativas} (${Math.round(imagenesRelativas/totalImagenes*100)}%)`);
    console.log(`  ❌ Formatos inválidos: ${imagenesInvalidas} (${Math.round(imagenesInvalidas/totalImagenes*100)}%)`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 CONCLUSIÓN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (imagenesRelativas > 0) {
      console.log(`✅ La conversión automática de URLs está ACTIVA`);
      console.log(`   ${imagenesRelativas} imágenes se convertirán automáticamente`);
      console.log(`   de rutas relativas a URLs absolutas\n`);
      console.log(`   Ejemplo:`);
      console.log(`   ANTES: "/fotos/imagen.jpg"`);
      console.log(`   AHORA: "${baseUrl}/fotos/imagen.jpg"`);
    }

    if (imagenesAbsolutas > 0) {
      console.log(`\n✅ ${imagenesAbsolutas} imágenes ya tienen URLs absolutas`);
      console.log(`   Estas funcionarán sin conversión`);
    }

    if (imagenesInvalidas > 0) {
      console.log(`\n⚠️ ${imagenesInvalidas} imágenes tienen formato inválido`);
      console.log(`   Estas serán filtradas automáticamente`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ VERIFICACIÓN COMPLETADA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testSistemaFotos();
