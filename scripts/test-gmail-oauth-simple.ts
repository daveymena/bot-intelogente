import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function testGmailOAuth() {
  console.log('🧪 Probando Gmail OAuth2...\n');

  // Verificar variables de entorno
  const requiredVars = {
    'GMAIL_USER': process.env.GMAIL_USER,
    'GMAIL_CLIENT_ID': process.env.GMAIL_CLIENT_ID,
    'GMAIL_CLIENT_SECRET': process.env.GMAIL_CLIENT_SECRET,
    'GMAIL_REFRESH_TOKEN': process.env.GMAIL_REFRESH_TOKEN
  };

  console.log('📋 Variables de entorno:');
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      console.log(`❌ ${key}: NO CONFIGURADA`);
      return;
    }
    const displayValue = key === 'GMAIL_REFRESH_TOKEN' 
      ? value.substring(0, 20) + '...' 
      : value.substring(0, 30) + '...';
    console.log(`✅ ${key}: ${displayValue}`);
  }

  console.log('\n🔧 Creando transporter...');
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    });

    console.log('✅ Transporter creado\n');

    console.log('📧 Enviando email de prueba...');
    
    const info = await transporter.sendMail({
      from: `"Tecnovariedades D&S" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Enviar a ti mismo
      subject: '✅ Prueba de Gmail OAuth2 - Sistema Funcionando',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">🎉 ¡Gmail OAuth2 Configurado Correctamente!</h2>
          
          <p>Tu sistema de emails está funcionando perfectamente.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">✅ Configuración Exitosa</h3>
            <ul>
              <li>Gmail OAuth2 conectado</li>
              <li>Refresh Token válido</li>
              <li>Emails listos para enviar</li>
            </ul>
          </div>
          
          <p><strong>Ahora puedes:</strong></p>
          <ul>
            <li>Enviar códigos de verificación</li>
            <li>Emails de bienvenida</li>
            <li>Recuperación de contraseña</li>
            <li>Notificaciones del sistema</li>
          </ul>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Este email fue enviado automáticamente por tu sistema Smart Sales Bot Pro
          </p>
        </div>
      `,
    });

    console.log('\n✅ EMAIL ENVIADO EXITOSAMENTE!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 Destinatario:', process.env.GMAIL_USER);
    console.log('\n🎉 ¡Sistema de emails funcionando perfectamente!');
    console.log('💡 Revisa tu bandeja de entrada en:', process.env.GMAIL_USER);

  } catch (error: any) {
    console.error('\n❌ ERROR al enviar email:');
    console.error('Mensaje:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔧 Problema de autenticación:');
      console.error('1. Verifica que el Refresh Token sea correcto');
      console.error('2. Asegúrate de que la API de Gmail esté habilitada');
      console.error('3. Verifica que las credenciales OAuth2 sean correctas');
    }
    
    console.error('\nDetalles completos:', error);
  }
}

testGmailOAuth();
