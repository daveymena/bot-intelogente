/**
 * Script para eliminar usuarios no verificados (excepto admin)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Limpiando usuarios inactivos...\n');

  const usuariosInactivos = await prisma.user.findMany({
    where: {
      AND: [
        { isEmailVerified: false },
        { role: { not: 'ADMIN' } }
      ]
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    }
  });

  console.log(`📋 Usuarios a eliminar: ${usuariosInactivos.length}\n`);

  if (usuariosInactivos.length === 0) {
    console.log('✅ No hay usuarios inactivos para eliminar!');
    return;
  }

  console.log('Usuarios que serán eliminados:');
  usuariosInactivos.forEach(u => {
    console.log(`   - ${u.email} (${u.role}) - Creado: ${u.createdAt.toLocaleDateString()}`);
  });

  console.log('\n⚠️  ADVERTENCIA: Esta acción no se puede deshacer!');
  console.log('   Presiona Ctrl+C para cancelar o espera 5 segundos...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  let eliminados = 0;

  for (const usuario of usuariosInactivos) {
    try {
      await prisma.user.delete({
        where: { id: usuario.id }
      });

      console.log(`✅ Eliminado: ${usuario.email}`);
      eliminados++;
    } catch (error: any) {
      console.log(`❌ Error eliminando ${usuario.email}: ${error.message}`);
    }
  }

  console.log(`\n✨ Proceso completado!`);
  console.log(`   Eliminados: ${eliminados}/${usuariosInactivos.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
