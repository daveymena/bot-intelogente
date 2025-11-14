/**
 * Eliminar uno de los cursos de piano si son duplicados
 */

import { db as prisma } from '../src/lib/db';

async function eliminarCursoDuplicado() {
  console.log('🎹 Verificando cursos de piano...\n');

  try {
    const cursosPiano = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'piano', mode: 'insensitive' } },
          { id: 'cmhpw941q0000kmp85qvjm0o5-curso-completo-de-piano-online' },
          { id: 'cmhpw941q0000kmp85qvjm0o5-curso-piano-premium' }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📚 Cursos de piano encontrados: ${cursosPiano.length}\n`);

    cursosPiano.forEach((curso, idx) => {
      console.log(`${idx + 1}. ${curso.name}`);
      console.log(`   ID: ${curso.id}`);
      console.log(`   Precio: $${curso.price.toLocaleString('es-CO')} COP`);
      console.log(`   Descripción: ${curso.description?.substring(0, 100)}...`);
      console.log(`   Creado: ${curso.createdAt.toISOString()}`);
      console.log('');
    });

    if (cursosPiano.length === 2) {
      console.log('⚠️  Hay 2 cursos de piano. ¿Son el mismo curso?\n');
      console.log('Si quieres eliminar el segundo (más antiguo), descomenta el código abajo.\n');

      // DESCOMENTA ESTAS LÍNEAS PARA ELIMINAR EL SEGUNDO CURSO:
      /*
      const cursoAEliminar = cursosPiano[1]; // El más antiguo
      await prisma.product.delete({
        where: { id: cursoAEliminar.id }
      });
      console.log(`✅ Eliminado: ${cursoAEliminar.name}`);
      */

      console.log('Para eliminar, edita este script y descomenta las líneas indicadas.');
    } else if (cursosPiano.length === 1) {
      console.log('✅ Solo hay 1 curso de piano. Todo correcto.');
    } else {
      console.log(`⚠️  Hay ${cursosPiano.length} cursos de piano.`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

eliminarCursoDuplicado();
