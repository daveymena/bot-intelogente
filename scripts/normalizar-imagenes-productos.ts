/**
 * Script: Normalizar Imágenes de Productos
 * 
 * Convierte todas las imágenes de productos a formato array JSON consistente
 * y asegura que las URLs sean válidas
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function normalizarImagenes() {
  console.log('🔧 Normalizando imágenes de productos...\n');

  try {
    // Obtener todos los productos
    const productos = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        images: true
      }
    });

    console.log(`📦 Encontrados ${productos.length} productos\n`);

    let actualizados = 0;
    let errores = 0;

    for (const producto of productos) {
      try {
        let imagenesNormalizadas: string[] = [];

        if (producto.images) {
          // Si es string, intentar parsearlo
          if (typeof producto.images === 'string') {
            try {
              // Intentar parsear como JSON
              const parsed = JSON.parse(producto.images);
              if (Array.isArray(parsed)) {
                imagenesNormalizadas = parsed.filter(url => url && typeof url === 'string');
              } else if (typeof parsed === 'string') {
                imagenesNormalizadas = [parsed];
              }
            } catch {
              // Si no es JSON válido, tratarlo como URL simple
              if (producto.images.startsWith('http') || producto.images.startsWith('/')) {
                imagenesNormalizadas = [producto.images];
              }
            }
          } else if (Array.isArray(producto.images)) {
            imagenesNormalizadas = producto.images.filter(url => url && typeof url === 'string');
          }
        }

        // Actualizar solo si hay cambios
        const imagenesJSON = JSON.stringify(imagenesNormalizadas);
        if (imagenesJSON !== producto.images) {
          await prisma.product.update({
            where: { id: producto.id },
            data: { images: imagenesJSON }
          });

          console.log(`✅ ${producto.name}`);
          console.log(`   Antes: ${producto.images}`);
          console.log(`   Después: ${imagenesJSON}\n`);
          actualizados++;
        }

      } catch (error) {
        console.error(`❌ Error en ${producto.name}:`, error);
        errores++;
      }
    }

    console.log('\n📊 RESUMEN:');
    console.log(`   ✅ Actualizados: ${actualizados}`);
    console.log(`   ⏭️  Sin cambios: ${productos.length - actualizados - errores}`);
    console.log(`   ❌ Errores: ${errores}`);

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

normalizarImagenes();
