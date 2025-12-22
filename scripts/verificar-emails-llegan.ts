import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const EMAIL_DESTINO = 'daveymena16@gmail.com';

async function verificarEmails() {
  console.log('📧 Verificando envío de emails...\n');
  console.log(`Destinatario: ${EMAIL_DESTINO}\n`);

  // Verificar variables de entorno
  console.log('🔍 Verificando configuración...\n');

  const config = {
    resendKey: process.env.RESEND_API_KEY,
    gmailUser: process.env.GMAIL_USER,
    gmailPass: process.env.GMAIL_APP_PASSWORD,
    emailFrom: process.env.EMAIL_FROM,
  };

  console.log('Variables de entorno:');
  console.log(`  RESEND_API_KEY: ${config.resendKey ? '✅ Configurada' : '❌ No configurada'}`);
  console.log(`  GMAIL_USER: ${config.gmailUser ? '✅ Configurada' : '❌ No configurada'}`);
  console.log(`  GMAIL_APP_PASSWORD: ${config.gmailPass ? '✅ Configurada' : '❌ No configurada'}`);
  console.log(`  EMAIL_FROM: ${config.emailFrom || '❌ No configurada'}\n`);

  // Intentar con Resend
  if (config.resendKey) {
    console.log('📨 Probando con Resend...\n');
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(config.resendKey);

      const result = await resend.emails.send({
        from: config.emailFrom || 'onboarding@resend.dev',
        to: EMAIL_DESTINO,
        subject: '✅ Prueba de Email - Sistema Funcionando',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">✅ Sistema de Emails Funcionando</h2>
            <p>Este es un email de prueba para verificar que los mensajes llegan correctamente.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Detalles de la Prueba:</h3>
              <ul>
                <li><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</li>
                <li><strong>Método:</strong> Resend API</li>
                <li><strong>Destinatario:</strong> ${EMAIL_DESTINO}</li>
                <li><strong>Estado:</strong> Enviado exitosamente</li>
              </ul>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Si recibes este email, significa que el sistema de notificaciones está funcionando correctamente.
            </p>
          </div>
        `,
      });

      console.log('✅ Email enviado con Resend!');
      console.log(`   ID: ${result.data?.id}`);
      console.log(`   Revisa tu bandeja de entrada: ${EMAIL_DESTINO}\n`);
      return true;
    } catch (error) {
      console.error('❌ Error con Resend:', error);
      console.log('');
    }
  }

  // Intentar con Gmail
  if (config.gmailUser && config.gmailPass) {
    console.log('📨 Probando con Gmail SMTP...\n');
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.gmailUser,
          pass: config.gmailPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"Smart Sales Bot" <${config.gmailUser}>`,
        to: EMAIL_DESTINO,
        subject: '✅ Prueba de Email - Sistema Funcionando (Gmail)',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">✅ Sistema de Emails Funcionando</h2>
            <p>Este es un email de prueba para verificar que los mensajes llegan correctamente.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Detalles de la Prueba:</h3>
              <ul>
                <li><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</li>
                <li><strong>Método:</strong> Gmail SMTP</li>
                <li><strong>Destinatario:</strong> ${EMAIL_DESTINO}</li>
                <li><strong>Estado:</strong> Enviado exitosamente</li>
              </ul>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Si recibes este email, significa que el sistema de notificaciones está funcionando correctamente.
            </p>
          </div>
        `,
      });

      console.log('✅ Email enviado con Gmail!');
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Revisa tu bandeja de entrada: ${EMAIL_DESTINO}\n`);
      return true;
    } catch (error) {
      console.error('❌ Error con Gmail:', error);
      console.log('');
    }
  }

  // Si llegamos aquí, ningún método funcionó
  console.log('❌ No se pudo enviar el email con ningún método\n');
  console.log('📋 Pasos para solucionar:\n');
  console.log('1. Configura RESEND_API_KEY en tu .env');
  console.log('   - Obtén tu API key en: https://resend.com/api-keys\n');
  console.log('2. O configura Gmail:');
  console.log('   - GMAIL_USER=tu-email@gmail.com');
  console.log('   - GMAIL_APP_PASSWORD=tu-app-password');
  console.log('   - Genera app password en: https://myaccount.google.com/apppasswords\n');

  return false;
}

// Ejecutar
verificarEmails()
  .then((success) => {
    if (success) {
      console.log('✅ Verificación completada exitosamente!');
      console.log(`\n📬 Revisa tu email: ${EMAIL_DESTINO}`);
      console.log('   - Bandeja de entrada');
      console.log('   - Spam/Correo no deseado');
      console.log('   - Promociones\n');
    } else {
      console.log('⚠️  Configura las credenciales de email para continuar\n');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
