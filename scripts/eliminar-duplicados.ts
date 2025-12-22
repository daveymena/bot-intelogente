import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function eliminarDuplicados() {
  console.log('🧹 Eliminando productos duplicados...\n');

  try {
    // Obtener todos los productos
    const productos = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' }
    });

    console.log(`📦 Total de productos: ${productos.length}\n`);

    // Agrupar por nombre
    const grupos: { [key: string]: any[] } = {};
    productos.forEach(p => {
      if (!grupos[p.name]) {
        grupos[p.name] = [];
      }
      grupos[p.name].push(p);
    });

    let eliminados = 0;
    let conservados = 0;

    // Procesar cada grupo
    for (const [nombre, items] of Object.entries(grupos)) {
      if (items.length > 1) {
        console.log(`\n🔍 Duplicados encontrados: "${nombre}" (${items.length} copias)`);
        
        // Conservar el que tenga más imágenes o el más reciente
        const mejor = items.reduce((prev, current) => {
          let prevImagenes = 0;
          let currentImagenes = 0;
          
          try {
            prevImagenes = prev.images ? JSON.parse(prev.images).length : 0;
          } catch (e) {
            prevImagenes = 0;
          }
          
          try {
            currentImagenes = current.images ? JSON.parse(current.images).length : 0;
          } catch (e) {
            currentImagenes = 0;
          }
          
          if (currentImagenes > prevImagenes) return current;
          if (currentImagenes === prevImagenes && current.createdAt > prev.createdAt) return current;
          return prev;
        });

        // Eliminar los demás
        for (const item of items) {
          if (item.id !== mejor.id) {
            await prisma.product.delete({ where: { id: item.id } });
            eliminados++;
            console.log(`  ❌ Eliminado: ${item.id}`);
          } else {
            conservados++;
            console.log(`  ✅ Conservado: ${item.id}`);
          }
        }
      } else {
        conservados++;
      }
    }

    console.log(`\n📊 RESUMEN:`);
    console.log(`✅ Productos conservados: ${conservados}`);
    console.log(`❌ Productos eliminados: ${eliminados}`);
    console.log(`\n✨ Base de datos limpia!`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

eliminarDuplicados();
