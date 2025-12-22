import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarTodosUsuarios() {
  try {
    console.log('🔍 Buscando usuarios no verificados...\n');

    // Buscar todos los usuarios no verificados
    const usuariosNoVerificados = await prisma.user.findMany({
      where: {
        isEmailVerified: false
      },
      select: {
        id: true,
        email: true,
        name: true,
        isEmailVerified: true,
        createdAt: true
      }
    });

    if (usuariosNoVerificados.length === 0) {
      console.log('✅ No hay usuarios sin verificar');
      return;
    }

    console.log(`📋 Encontrados ${usuariosNoVerificados.length} usuarios sin verificar:\n`);
    
    usuariosNoVerificados.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Nombre: ${user.name || 'Sin nombre'}`);
      console.log(`   Creado: ${user.createdAt.toLocaleDateString()}`);
      console.log(`   Verificado: ${user.isEmailVerified ? '✅' : '❌'}\n`);
    });

    console.log('🔄 Verificando todos los usuarios...\n');

    // Actualizar todos los usuarios a verificados
    const resultado = await prisma.user.updateMany({
      where: {
        isEmailVerified: false
      },
      data: {
        isEmailVerified: true,
        isPhoneVerified: true
      }
    });

    console.log(`✅ ${resultado.count} usuarios verificados exitosamente\n`);

    // Mostrar usuarios actualizados
    console.log('📋 Usuarios ahora verificados:\n');
    
    for (const user of usuariosNoVerificados) {
      const userActualizado = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          email: true,
          isEmailVerified: true
        }
      });
      
      console.log(`✅ ${userActualizado?.email} - Verificado: ${userActualizado?.isEmailVerified ? '✅' : '❌'}`);
    }

    console.log('\n🎉 Proceso completado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarTodosUsuarios();
