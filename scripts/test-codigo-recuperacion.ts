import dotenv from 'dotenv';

dotenv.config();

async function testCodigoRecuperacion() {
  const email = 'daveymena16@gmail.com';
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  
  console.log('🔐 Probando envío de código de recuperación...\n');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Código: ${codigo}\n`);

  try {
    // Verificar configuración
    console.log('1️⃣ Verificando configuración de Resend...');
    const resendKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const emailFrom = process.env.EMAIL_FROM || 'Tecnovariedades D&S <onboarding@resend.dev>';

    console.log(`   RESEND_API_KEY: ${resendKey ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`   RESEND_FROM_EMAIL: ${resendFrom}`);
    console.log(`   EMAIL_FROM: ${emailFrom}\n`);

    if (!resendKey) {
      console.log('❌ RESEND_API_KEY no está configurada!');
      console.log('   Agrega en tu .env:');
      console.log('   RESEND_API_KEY=re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya\n');
      return;
    }

    // Enviar email
    console.log('2️⃣ Enviando email con código...');
    
    const { EmailVerificationService } = await import('../src/lib/email-verification-service');
    
    const emailSent = await EmailVerificationService.sendVerificationCode(
      email,
      codigo,
      'David Mena',
      'password-reset'
    );

    if (emailSent) {
      console.log('✅ Email enviado exitosamente!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 REVISA TU EMAIL AHORA');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log(`Email: ${email}`);
      console.log(`Código: ${codigo}`);
      console.log(`Expira en: 10 minutos\n`);
      console.log('💡 Busca en:');
      console.log('   ✓ Bandeja de entrada');
      console.log('   ✓ Spam / Correo no deseado');
      console.log('   ✓ Promociones');
      console.log('   ✓ Actualizaciones\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('❌ Error al enviar email\n');
      console.log('Posibles causas:');
      console.log('   1. API Key inválida');
      console.log('   2. Límite de envíos alcanzado');
      console.log('   3. Email bloqueado por Resend\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.log('\nDetalles del error:');
      console.log(error.message);
    }
  }
}

testCodigoRecuperacion();
