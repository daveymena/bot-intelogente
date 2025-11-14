import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

async function enviarCodigoPrueba() {
  console.log('📧 Enviando código de verificación de prueba...\n');

  const resendApiKey = process.env.RESEND_API_KEY;
  const emailDestino = process.env.GMAIL_USER || 'daveymena16@gmail.com';

  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY no configurado en .env');
    return;
  }

  console.log('📋 Configuración:');
  console.log('API Key:', resendApiKey.substring(0, 15) + '...');
  console.log('Destinatario:', emailDestino);
  console.log('');

  try {
    const resend = new Resend(resendApiKey);
    
    // Generar código aleatorio de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('🔢 Código generado:', codigo);
    console.log('📤 Enviando email...\n');

    const { data, error } = await resend.emails.send({
      from: 'Tecnovariedades D&S <onboarding@resend.dev>',
      to: [emailDestino],
      subject: '🔐 Tu Código de Verificación',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <!-- Header -->
            <div style="text-align: center; padding: 30px 0;">
              <h1 style="color: #10b981; margin: 0; font-size: 28px;">🔐 Código de Verificación</h1>
            </div>

            <!-- Main Content -->
            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 40px; text-align: center;">
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Tu código de verificación es:
              </p>

              <!-- Código -->
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 30px; margin: 30px 0;">
                <div style="font-size: 48px; font-weight: bold; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${codigo}
                </div>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Este código expira en <strong>10 minutos</strong>
              </p>

              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 30px 0; text-align: left;">
                <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>⚠️ Importante:</strong> Si no solicitaste este código, ignora este mensaje.
                </p>
              </div>

            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 30px 0;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                Tecnovariedades D&S - Sistema de Ventas Inteligente
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                Este es un email automático, por favor no respondas.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Error al enviar email:');
      console.error(error);
      return;
    }

    console.log('✅ EMAIL ENVIADO EXITOSAMENTE!\n');
    console.log('📊 Detalles:');
    console.log('ID del mensaje:', data?.id);
    console.log('Destinatario:', emailDestino);
    console.log('Código enviado:', codigo);
    console.log('\n🎉 ¡Revisa tu bandeja de entrada!');
    console.log('📧 Email:', emailDestino);
    console.log('\n💡 Si no lo ves, revisa la carpeta de SPAM');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

enviarCodigoPrueba();
