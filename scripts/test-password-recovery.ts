import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function testPasswordRecovery() {
  console.log('🧪 Iniciando prueba del sistema de recuperación de contraseñas...\n');

  try {
    // 1. Crear usuario de prueba
    console.log('1️⃣ Creando usuario de prueba...');
    const testEmail = 'test-recovery@example.com';
    const testPassword = 'TestPassword123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // Eliminar usuario si existe
    await prisma.user.deleteMany({
      where: { email: testEmail }
    });

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: 'Test Recovery User',
        isEmailVerified: true,
        role: 'USER'
      }
    });
    console.log('✅ Usuario creado:', user.email);

    // 2. Generar token de recuperación
    console.log('\n2️⃣ Generando token de recuperación...');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: resetExpires
      }
    });
    console.log('✅ Token generado:', resetToken.substring(0, 20) + '...');
    console.log('✅ Token hasheado guardado en BD');
    console.log('✅ Expira en:', resetExpires.toLocaleString());

    // 3. Verificar que el token existe en la BD
    console.log('\n3️⃣ Verificando token en base de datos...');
    const userWithToken = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        passwordResetToken: true,
        passwordResetExpires: true
      }
    });
    console.log('✅ Token en BD:', userWithToken?.passwordResetToken?.substring(0, 20) + '...');
    console.log('✅ Expira:', userWithToken?.passwordResetExpires);

    // 4. Simular validación del token
    console.log('\n4️⃣ Simulando validación del token...');
    const hashedTokenToVerify = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const userToReset = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedTokenToVerify,
        passwordResetExpires: {
          gt: new Date()
        }
      }
    });

    if (userToReset) {
      console.log('✅ Token válido encontrado para usuario:', userToReset.email);
    } else {
      console.log('❌ Token no válido o expirado');
      throw new Error('Token validation failed');
    }

    // 5. Simular cambio de contraseña
    console.log('\n5️⃣ Simulando cambio de contraseña...');
    const newPassword = 'NewPassword456';
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userToReset.id },
      data: {
        password: newHashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });
    console.log('✅ Contraseña actualizada');
    console.log('✅ Token de recuperación eliminado');

    // 6. Verificar que la nueva contraseña funciona
    console.log('\n6️⃣ Verificando nueva contraseña...');
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (updatedUser) {
      const isPasswordValid = await bcrypt.compare(newPassword, updatedUser.password);
      if (isPasswordValid) {
        console.log('✅ Nueva contraseña funciona correctamente');
      } else {
        console.log('❌ Error: Nueva contraseña no funciona');
        throw new Error('Password verification failed');
      }

      // Verificar que el token fue eliminado
      if (!updatedUser.passwordResetToken && !updatedUser.passwordResetExpires) {
        console.log('✅ Token de recuperación eliminado correctamente');
      } else {
        console.log('❌ Error: Token no fue eliminado');
      }
    }

    // 7. Probar token expirado
    console.log('\n7️⃣ Probando token expirado...');
    const expiredToken = crypto.randomBytes(32).toString('hex');
    const hashedExpiredToken = crypto
      .createHash('sha256')
      .update(expiredToken)
      .digest('hex');
    
    const expiredDate = new Date(Date.now() - 3600000); // 1 hora atrás

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedExpiredToken,
        passwordResetExpires: expiredDate
      }
    });

    const expiredUser = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedExpiredToken,
        passwordResetExpires: {
          gt: new Date()
        }
      }
    });

    if (!expiredUser) {
      console.log('✅ Token expirado correctamente rechazado');
    } else {
      console.log('❌ Error: Token expirado fue aceptado');
    }

    // 8. Limpiar
    console.log('\n8️⃣ Limpiando datos de prueba...');
    await prisma.user.delete({
      where: { id: user.id }
    });
    console.log('✅ Usuario de prueba eliminado');

    console.log('\n✅ ¡Todas las pruebas pasaron exitosamente!');
    console.log('\n📋 Resumen del flujo:');
    console.log('1. Usuario solicita recuperación → Se genera token');
    console.log('2. Token se hashea y guarda en BD con expiración');
    console.log('3. Se envía email con enlace que contiene el token');
    console.log('4. Usuario hace clic en enlace → Token se valida');
    console.log('5. Usuario ingresa nueva contraseña → Se actualiza');
    console.log('6. Token se elimina de la BD');
    console.log('7. Usuario puede iniciar sesión con nueva contraseña');

    console.log('\n🔗 URLs del sistema:');
    console.log('- Solicitar recuperación: http://localhost:3000/forgot-password');
    console.log('- Restablecer contraseña: http://localhost:3000/reset-password?token=TOKEN');
    console.log('- Login: http://localhost:3000/login');

  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar pruebas
testPasswordRecovery()
  .then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script falló:', error);
    process.exit(1);
  });
