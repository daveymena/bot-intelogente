import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pregunta(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetPassword() {
  console.log('🔐 RESET DE CONTRASEÑA\n');

  try {
    const email = await pregunta('Email del usuario (admin@davey.com): ');
    const emailFinal = email.trim() || 'admin@davey.com';

    const usuario = await prisma.user.findUnique({
      where: { email: emailFinal },
      select: { id: true, email: true, name: true }
    });

    if (!usuario) {
      console.log(`\n❌ Usuario con email "${emailFinal}" no encontrado`);
      rl.close();
      return;
    }

    console.log(`\n✅ Usuario encontrado: ${usuario.name} (${usuario.email})`);
    console.log('');

    const nuevaContraseña = await pregunta('Nueva contraseña: ');

    if (!nuevaContraseña || nuevaContraseña.length < 6) {
      console.log('\n❌ La contraseña debe tener al menos 6 caracteres');
      rl.close();
      return;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);

    // Actualizar en la BD
    await prisma.user.update({
      where: { email: emailFinal },
      data: { password: hashedPassword }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ CONTRASEÑA ACTUALIZADA EXITOSAMENTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email: ${emailFinal}`);
    console.log(`Nueva contraseña: ${nuevaContraseña}`);
    console.log('');
    console.log('🌐 Accede al dashboard en:');
    console.log('   http://localhost:4000');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

resetPassword();
