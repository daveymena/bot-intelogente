import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setDefaultPassword() {
  console.log('🔐 Estableciendo contraseña por defecto...\n');

  try {
    const email = 'admin@davey.com';
    const defaultPassword = 'admin123';

    const usuario = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true }
    });

    if (!usuario) {
      console.log(`❌ Usuario no encontrado`);
      return;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Actualizar en la BD
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ CONTRASEÑA ESTABLECIDA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email: ${email}`);
    console.log(`Contraseña: ${defaultPassword}`);
    console.log('');
    console.log('🌐 Accede al dashboard en:');
    console.log('   http://localhost:4000');
    console.log('');
    console.log('⚠️ IMPORTANTE: Cambia esta contraseña después de iniciar sesión');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setDefaultPassword();
