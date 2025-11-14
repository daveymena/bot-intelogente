import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function testRecuperacion() {
  const email = 'daveymena16@gmail.com';
  
  console.log('🔐 Probando recuperación de contraseña...\n');
  console.log(`Email: ${email}\n`);

  try {
    // 1. Verificar que el usuario existe
    console.log('1️⃣ Verificando usuario...');
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log(`✅ Usuario encontrado: ${user.name || user.email}\n`);

    // 2. Generar código
    console.log('2️⃣ Generando código de recuperación...');
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date(Date.now() + 600000); // 10 minutos

    console.log(`✅ Código generado: ${resetCode}`);
    console.log(`⏰ Expira: ${resetCodeExpiry.toLocaleString('es-CO')}\n`);

    // 3. Guardar en base de datos
    console.log('3️⃣ Guardando código en base de datos...');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetCode,
        passwordResetExpires: resetCodeExpiry
      }
    });
    console.log('✅ Código guardado\n');

    // 4. Enviar email
    console.log('4️⃣ Enviando email con código...');
    
    const { EmailVerificationService } = await import('../src/lib/email-verification-service');
    
    const emailSent = await EmailVerificationService.sendVerificationCode(
      user.email,
      resetCode,
      user.name || undefined,
      'password-reset'
    );

    if (emailSent) {
      console.log('✅ Email enviado exitosamente!\n');
      console.log('📧 Revisa tu bandeja de entrada:');
      console.log(`   Email: ${email}`);
      console.log(`   Código: ${resetCode}`);
      console.log(`   Expira en: 10 minutos\n`);
      console.log('💡 Busca en:');
      console.log('   - Bandeja de entrada');
      console.log('   - Spam / Correo no deseado');
      console.log('   - Promociones\n');
    } else {
      console.log('❌ Error al enviar email\n');
      console.log('🔑 Usa este código manualmente:');
      console.log(`   ${resetCode}\n`);
    }

    // 5. Verificar configuración de Resend
    console.log('5️⃣ Verificando configuración de Resend...');
    const resendKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM_EMAIL;
    const emailFrom = process.env.EMAIL_FROM;

    console.log(`   RESEND_API_KEY: ${resendKey ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`   RESEND_FROM_EMAIL: ${resendFrom || '❌ No configurada'}`);
    console.log(`   EMAIL_FROM: ${emailFrom || '❌ No configurada'}\n`);

    if (!resendKey) {
      console.log('⚠️  RESEND_API_KEY no está configurada!');
      console.log('   Agrega en tu .env:');
      console.log('   RESEND_API_KEY=re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRecuperacion();
