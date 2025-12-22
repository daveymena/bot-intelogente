import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verMiUsuario() {
  console.log('🔍 Buscando tu usuario...\n');

  try {
    // Buscar todos los usuarios
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        businessName: true,
        whatsappNumber: true,
        membershipType: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`📊 Total usuarios: ${usuarios.length}\n`);

    if (usuarios.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }

    usuarios.forEach((user, index) => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`👤 Usuario ${index + 1}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Nombre: ${user.name || 'Sin nombre'}`);
      console.log(`Rol: ${user.role}`);
      console.log(`Negocio: ${user.businessName || 'Sin nombre de negocio'}`);
      console.log(`WhatsApp: ${user.whatsappNumber || 'Sin número'}`);
      console.log(`Membresía: ${user.membershipType}`);
      console.log(`Activo: ${user.isActive ? '✅' : '❌'}`);
      console.log(`Creado: ${user.createdAt.toLocaleDateString('es-CO')}`);
      console.log('');
    });

    // Mostrar el usuario principal (primero creado)
    const usuarioPrincipal = usuarios[0];
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 USUARIO PRINCIPAL (para usar en el bot):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`ID: ${usuarioPrincipal.id}`);
    console.log(`Email: ${usuarioPrincipal.email}`);
    console.log(`Negocio: ${usuarioPrincipal.businessName || 'Tecnovariedades D&S'}`);
    console.log('');
    console.log('💡 Usa este ID en tu .env:');
    console.log(`DEFAULT_USER_ID=${usuarioPrincipal.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verMiUsuario();
