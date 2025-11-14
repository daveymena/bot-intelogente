import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listarEstadoUsuarios() {
  try {
    console.log('📋 ESTADO DE TODOS LOS USUARIOS\n');
    console.log('='.repeat(80) + '\n');

    // Obtener todos los usuarios
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (usuarios.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }

    console.log(`Total de usuarios: ${usuarios.length}\n`);

    // Contar verificados y no verificados
    const verificados = usuarios.filter(u => u.isEmailVerified).length;
    const noVerificados = usuarios.filter(u => !u.isEmailVerified).length;

    console.log(`✅ Verificados: ${verificados}`);
    console.log(`❌ No verificados: ${noVerificados}\n`);
    console.log('='.repeat(80) + '\n');

    // Mostrar cada usuario
    usuarios.forEach((user, index) => {
      const emailStatus = user.isEmailVerified ? '✅' : '❌';
      const phoneStatus = user.isPhoneVerified ? '✅' : '❌';
      
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Nombre: ${user.name || 'Sin nombre'}`);
      console.log(`   Email verificado: ${emailStatus}`);
      console.log(`   Teléfono verificado: ${phoneStatus}`);
      console.log(`   Creado: ${user.createdAt.toLocaleString()}`);
      console.log(`   Actualizado: ${user.updatedAt.toLocaleString()}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('\n📊 RESUMEN:');
    console.log(`   Total: ${usuarios.length}`);
    console.log(`   ✅ Verificados: ${verificados} (${Math.round(verificados/usuarios.length*100)}%)`);
    console.log(`   ❌ No verificados: ${noVerificados} (${Math.round(noVerificados/usuarios.length*100)}%)`);

    // Buscar específicamente daveymena162@gmail.com
    const davey = usuarios.find(u => u.email === 'daveymena162@gmail.com');
    if (davey) {
      console.log('\n🎯 USUARIO ESPECÍFICO: daveymena162@gmail.com');
      console.log(`   Estado: ${davey.isEmailVerified ? '✅ VERIFICADO' : '❌ NO VERIFICADO'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listarEstadoUsuarios();
