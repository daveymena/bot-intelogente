/**
 * Fix: Remover "teclado" de los tags del Curso de Piano
 * Razón: "teclado" causa confusión con teclados de computadora
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Corrigiendo tags del Curso de Piano...\n');

  // Buscar el curso de piano
  const cursoPiano = await prisma.product.findFirst({
    where: {
      name: {
        contains: 'Piano',
        mode: 'insensitive'
      },
      tipo_producto: 'DIGITAL'
    }
  });

  if (!cursoPiano) {
    console.log('❌ No se encontró el Curso de Piano');
    return;
  }

  console.log(`📦 Producto encontrado: ${cursoPiano.name}`);
  console.log(`🏷️  Tags actuales: ${cursoPiano.tags}\n`);

  // Tags corregidos (sin "teclado")
  const tagsCorregidos = [
    'piano', 'música', 'curso', 'instrumento',
    'clásico', 'jazz', 'blues', 'pop', 'balada', 'dance',
    'aprender piano', 'tocar piano', 'improvisación',
    'partituras', 'acordes', 'escalas', 'acompañamiento',
    'principiantes', 'desde cero', 'nivel avanzado',
    'música moderna', 'teoría musical', 'piano digital',
    'piano acústico', 'teclas', 'melodía'
  ];

  // Actualizar producto
  await prisma.product.update({
    where: { id: cursoPiano.id },
    data: {
      tags: tagsCorregidos.join(', ')
    }
  });

  console.log('✅ Tags actualizados correctamente');
  console.log(`🏷️  Nuevos tags: ${tagsCorregidos.join(', ')}\n`);
  console.log('📝 Cambio principal: Removido "teclado" para evitar confusión con teclados de computadora');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
