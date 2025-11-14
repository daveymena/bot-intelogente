import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Uso: npx tsx scripts/asignar-subcategoria-manual.ts "nombre del producto" "SUBCATEGORIA"

async function asignarSubcategoriaManual() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('❌ Uso: npx tsx scripts/asignar-subcategoria-manual.ts "nombre del producto" "SUBCATEGORIA"\n');
    console.log('Subcategorías disponibles:');
    console.log('  PHYSICAL: PORTATILES, MOTOS, ACCESORIOS, COMPONENTES');
    console.log('  DIGITAL: MEGAPACKS, CURSOS_DISENO, CURSOS_PROGRAMACION, CURSOS_MARKETING,');
    console.log('           CURSOS_OFFICE, CURSOS_IDIOMAS, CURSOS_PROFESIONALES, LIBROS, PLANTILLAS');
    return;
  }

  const nombreBuscar = args[0];
  const subcategoria = args[1];

  try {
    // Buscar productos que coincidan
    const productos = await prisma.product.findMany({
      where: {
        name: {
          contains: nombreBuscar,
          mode: 'insensitive'
        }
      }
    });

    if (productos.length === 0) {
      console.log(`❌ No se encontraron productos con "${nombreBuscar}"`);
      return;
    }

    console.log(`\n📦 Encontrados ${productos.length} productos:\n`);
    
    for (const producto of productos) {
      await prisma.product.update({
        where: { id: producto.id },
        data: { subcategory: subcategoria }
      });
      
      console.log(`✅ ${producto.name}`);
      console.log(`   Subcategoría: ${subcategoria}\n`);
    }

    console.log(`✨ ${productos.length} productos actualizados`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

asignarSubcategoriaManual();
