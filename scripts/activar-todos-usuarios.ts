/**
 * Script para activar todos los usuarios no verificados
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔓 Activando todos los usuarios...\n');

  const usuariosInactivos = await prisma.user.findMany({
    where: {
      isEmailVerified: false,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    }
  });

  console.log(`📋 Usuarios a activar: ${usuariosInactivos.length}\n`);

  if (usuariosInactivos.length === 0) {
    console.log('✅ Todos los usuarios ya están activos!');
    return;
  }

  let activados = 0;

  for (const usuario of usuariosInactivos) {
    try {
      await prisma.user.update({
        where: { id: usuario.id },
        data: {
          isEmailVerified: true,
        }
      });

      console.log(`✅ Activado: ${usuario.email} (${usuario.role})`);
      activados++;
    } catch (error: any) {
      console.log(`❌ Error activando ${usuario.email}: ${error.message}`);
    }
  }

  console.log(`\n✨ Proceso completado!`);
  console.log(`   Activados: ${activados}/${usuariosInactivos.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
