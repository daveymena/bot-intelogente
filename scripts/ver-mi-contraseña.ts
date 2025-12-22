import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verMiContraseña() {
  console.log('🔐 Información de acceso...\n');

  try {
    const usuario = await prisma.user.findFirst({
      where: {
        email: 'admin@davey.com'
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
      },
    });

    if (!usuario) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 INFORMACIÓN DE ACCESO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email: ${usuario.email}`);
    console.log(`Nombre: ${usuario.name}`);
    console.log(`Rol: ${usuario.role}`);
    console.log('');
    console.log('🔐 Contraseña (hash):');
    console.log(usuario.password);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 NOTA:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('La contraseña está hasheada por seguridad.');
    console.log('');
    console.log('Si no recuerdas tu contraseña, puedes:');
    console.log('1. Resetearla desde el dashboard (Forgot Password)');
    console.log('2. O crear una nueva con este comando:');
    console.log('');
    console.log('   npx tsx scripts/reset-password.ts');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verificar si es una contraseña común
    const contraseñasComunes = ['admin123', 'password', '123456', 'admin', 'davey123'];
    
    console.log('🔍 Verificando contraseñas comunes...\n');
    
    for (const pwd of contraseñasComunes) {
      const match = await bcrypt.compare(pwd, usuario.password);
      if (match) {
        console.log(`✅ ¡Encontrada! Tu contraseña es: "${pwd}"`);
        console.log('');
        console.log('🌐 Accede al dashboard en:');
        console.log('   http://localhost:4000');
        console.log('');
        return;
      }
    }

    console.log('❌ No coincide con contraseñas comunes.');
    console.log('');
    console.log('💡 Usa el script de reset para crear una nueva:');
    console.log('   npx tsx scripts/reset-password.ts');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verMiContraseña();
