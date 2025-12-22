import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function corregirDescripcionCursoPiano() {
  console.log('🎹 Corrigiendo descripción del Curso de Piano...\n');

  try {
    const cursoPiano = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'Piano',
          mode: 'insensitive'
        }
      }
    });

    if (!cursoPiano) {
      console.log('❌ No se encontró el Curso de Piano');
      return;
    }

    console.log('📦 Producto encontrado:');
    console.log(`   Nombre: ${cursoPiano.name}`);
    console.log(`   Descripción actual:\n${cursoPiano.description}\n`);

    // Descripción corregida SIN información inventada
    const descripcionCorrecta = `🎵 Curso Completo de Piano Online 🎹

✅ Aprende piano desde cero hasta nivel avanzado
✅ Lecciones en video de alta calidad
✅ Método progresivo y fácil de seguir
✅ Acceso inmediato al contenido

🎼 Contenido del curso:
• Técnica y postura correcta
• Lectura de partituras
• Teoría musical básica
• Ejercicios prácticos
• Diferentes estilos musicales

🎯 Ideal para:
• Principiantes sin experiencia previa
• Personas que quieren aprender a su propio ritmo
• Quienes buscan dominar el piano desde casa

💡 Aprende a tocar tus canciones favoritas
🎹 Desarrolla tu talento musical`;

    // Actualizar la descripción
    const actualizado = await prisma.product.update({
      where: { id: cursoPiano.id },
      data: {
        description: descripcionCorrecta
      }
    });

    console.log('✅ Descripción corregida exitosamente!\n');
    console.log('📝 Nueva descripción:');
    console.log(actualizado.description);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corregirDescripcionCursoPiano();
