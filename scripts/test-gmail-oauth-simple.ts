import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function testGmailOAuth() {
    console.log('🧪 Probando Gmail OAuth2...\n');

    // Verificar variables de entorno
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const user = process.env.GMAIL_USER;

    console.log('📋 Verificando configuración:');
    console.log(`   Client ID: ${clientId ? '✅ Configurado' : '❌ Falta'}`);
    console.log(`   Client Secret: ${clientSecret ? '✅ Configurado' : '❌ Falta'}`);
    console.log(`   Refresh Token: ${refreshToken ? '✅ Configurado' : '❌ FALTA - Debes obtenerlo'}`);
    console.log(`   Gmail User: ${user || 'daveymena16@gmail.com'}\n`);

    if (!refreshToken) {
        console.log('❌ ERROR: Falta el GMAIL_REFRESH_TOKEN');
        console.log('\n📝 Para obtenerlo:');
        console.log('   1. Ve a: https://developers.google.com/oauthplayground');
        console.log('   2. Configura tus credenciales OAuth (⚙️ arriba derecha)');
        console.log('   3. Autoriza Gmail API v1 (https://mail.google.com/)');
        console.log('   4. Copia el Refresh Token');
        console.log('   5. Agrégalo al .env como GMAIL_REFRESH_TOKEN=...\n');
        return;
    }

    try {
        console.log('🔧 Creando transporter...');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: user || 'daveymena16@gmail.com',
                clientId,
                clientSecret,
                refreshToken,
            },
        });

        console.log('✅ Transporter creado');
        console.log('📧 Enviando email de prueba...\n');

        const info = await transporter.sendMail({
            from: `"Tecnovariedades D&S" <${user || 'daveymena16@gmail.com'}>`,
            to: user || 'daveymena16@gmail.com',
            subject: '✅ Gmail OAuth2 Funcionando',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">🎉 ¡Gmail OAuth2 Configurado Correctamente!</h2>
          <p>Tu sistema de emails está funcionando perfectamente.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>✅ Configuración exitosa:</strong></p>
            <ul>
              <li>Gmail OAuth2 conectado</li>
              <li>Emails de verificación listos</li>
              <li>Notificaciones de pago listas</li>
            </ul>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Enviado desde: Smart Sales Bot Pro<br>
            Fecha: ${new Date().toLocaleString('es-CO')}
          </p>
        </div>
      `,
        });

        console.log('✅ EMAIL ENVIADO EXITOSAMENTE!');
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Destinatario: ${user || 'daveymena16@gmail.com'}`);
        console.log('\n🎉 Gmail OAuth2 está funcionando correctamente!');
        console.log('   Ahora puedes usar el sistema de emails en producción.\n');

    } catch (error: any) {
        console.error('❌ ERROR al enviar email:');
        console.error(`   ${error.message}\n`);

        if (error.message.includes('invalid_grant')) {
            console.log('💡 El refresh token expiró o es inválido.');
            console.log('   Genera uno nuevo en: https://developers.google.com/oauthplayground\n');
        } else if (error.message.includes('invalid_client')) {
            console.log('💡 Las credenciales OAuth son incorrectas.');
            console.log('   Verifica GMAIL_CLIENT_ID y GMAIL_CLIENT_SECRET\n');
        }
    }
}

testGmailOAuth();
