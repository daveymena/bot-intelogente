import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarUsuarioEspecifico() {
  try {
    const email = 'daveymena162@gmail.com';
    
    console.log(`🔍 Buscando usuario: ${email}\n`);

    // Buscar el usuario
    const usuario = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true
      }
    });

    if (!usuario) {
      console.log(`❌ Usuario ${email} no encontrado`);
      return;
    }

    console.log('📋 Información del usuario:\n');
    console.log(`Email: ${usuario.email}`);
    console.log(`Nombre: ${usuario.name || 'Sin nombre'}`);
    console.log(`Email verificado: ${usuario.isEmailVerified ? '✅' : '❌'}`);
    console.log(`Teléfono verificado: ${usuario.isPhoneVerified ? '✅' : '❌'}`);
    console.log(`Creado: ${usuario.createdAt.toLocaleDateString()}\n`);

    if (usuario.isEmailVerified) {
      console.log('✅ El usuario ya está verificado');
      return;
    }

    console.log('🔄 Verificando usuario...\n');

    // Actualizar usuario
    const usuarioActualizado = await prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
        isPhoneVerified: true // También verificamos el teléfono
      }
    });

    console.log('✅ Usuario verificado exitosamente\n');
    console.log('📋 Estado actualizado:\n');
    console.log(`Email: ${usuarioActualizado.email}`);
    console.log(`Email verificado: ${usuarioActualizado.isEmailVerified ? '✅' : '❌'}`);
    console.log(`Teléfono verificado: ${usuarioActualizado.isPhoneVerified ? '✅' : '❌'}`);
    console.log('\n🎉 Proceso completado');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarUsuarioEspecifico();
