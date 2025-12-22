const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function verCursoPiano() {
  try {
    const cursos = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: 'piano', mode: 'insensitive' } },
          { name: { contains: 'Piano', mode: 'insensitive' } },
          { description: { contains: 'piano', mode: 'insensitive' } }
        ]
      },
      take: 3
    });

    console.log(`📚 Cursos de piano encontrados: ${cursos.length}\n`);

    cursos.forEach((curso, i) => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`${i + 1}. ${curso.name}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`ID: ${curso.id}`);
      console.log(`Precio: ${curso.price.toLocaleString('es-CO')} COP`);
      console.log(`Categoría: ${curso.category}`);
      console.log(`\nDescripción:`);
      console.log(curso.description || 'Sin descripción');
      console.log(`\nImágenes:`, curso.images || 'Sin imágenes');
      console.log(`\nTags:`, curso.tags || 'Sin tags');
      console.log(`\nAutoResponse:`, curso.autoResponse || 'Sin autoResponse');
      console.log();
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.$disconnect();
  }
}

verCursoPiano();
