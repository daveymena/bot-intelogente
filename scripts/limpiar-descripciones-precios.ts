import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando textos de precios en descripciones...\n');

  // Buscar productos con texto de precios en la descripción
  const productos = await prisma.product.findMany({
    where: {
      OR: [
        { description: { contains: 'El precio original era' } },
        { description: { contains: 'El precio actual es' } },
        { description: { contains: 'Precio:' } },
        { description: { contains: 'Categoría:' } },
      ],
    },
  });

  console.log(`📦 Encontrados ${productos.length} productos con texto de precios\n`);

  let limpiados = 0;

  for (const producto of productos) {
    if (!producto.description) continue;

    let descripcionLimpia = producto.description;

    // Eliminar líneas con información de precio
    descripcionLimpia = descripcionLimpia
      // Eliminar "El precio original era: $X.XXX.XXX."
      .replace(/El precio original era:?\s*\$[\d.,]+\./gi, '')
      // Eliminar "El precio actual es: $X.XXX.XXX."
      .replace(/El precio actual es:?\s*\$[\d.,]+\./gi, '')
      // Eliminar "$X.XXX.XXX El precio original era..."
      .replace(/\$[\d.,]+\s*El precio original era:?\s*\$[\d.,]+\./gi, '')
      // Eliminar "💰 Precio: $X.XXX.XXX"
      .replace(/💰\s*Precio:?\s*\$[\d.,]+/gi, '')
      // Eliminar "📦 Categoría: XXX"
      .replace(/📦\s*Categoría:?\s*[^\n]+/gi, '')
      // Eliminar líneas que solo tienen precio
      .replace(/^\s*\$[\d.,]+\s*$/gm, '')
      // Limpiar múltiples saltos de línea
      .replace(/\n{3,}/g, '\n\n')
      // Limpiar espacios al inicio y final
      .trim();

    // Solo actualizar si cambió algo
    if (descripcionLimpia !== producto.description) {
      await prisma.product.update({
        where: { id: producto.id },
        data: { description: descripcionLimpia },
      });

      console.log(`✅ ${producto.name.substring(0, 60)}...`);
      console.log(`   ANTES: ${producto.description.substring(0, 100)}...`);
      console.log(`   DESPUÉS: ${descripcionLimpia.substring(0, 100)}...\n`);
      limpiados++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n✨ Proceso completado:`);
  console.log(`   ✅ Limpiados: ${limpiados}`);
  console.log(`   📦 Total revisados: ${productos.length}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
