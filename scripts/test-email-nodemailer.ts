/**
 * TEST DE EMAIL CON NODEMAILER
 * Prueba el sistema de emails con Gmail SMTP
 */

import nodemailer from 'nodemailer';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(mensaje: string, color: string = colors.reset) {
  console.log(`${color}${mensaje}${colors.reset}`);
}

async function testEmailNodemailer() {
  log('\n📧 TEST DE EMAIL CON NODEMAILER', colors.cyan);
  log('═'.repeat(80), colors.cyan);
  
  // 1. Verificar configuración
  log('\n1️⃣ Verificando configuración...', colors.blue);
  log('─'.repeat(80));
  
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailFrom = process.env.EMAIL_FROM;
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = parseInt(process.env.EMAIL_PORT || '587');
  
  if (!emailUser || !emailPass) {
    log('❌ EMAIL NO CONFIGURADO', colors.red);
    log('\n💡 SOLUCIÓN:', colors.yellow);
    log('   1. Ir a: https://myaccount.google.com/apppasswords');
    log('   2. Crear contraseña de aplicación');
    log('   3. Agregar a .env:');
    log('');
    log('   EMAIL_USER=tu_email@gmail.com');
    log('   EMAIL_PASS=xxxx xxxx xxxx xxxx');
    log('   EMAIL_FROM=tu_email@gmail.com');
    log('   EMAIL_HOST=smtp.gmail.com');
    log('   EMAIL_PORT=587');
    log('');
    return;
  }
  
  log('✅ Configuración encontrada:', colors.green);
  log(`   Usuario: ${emailUser}`);
  log(`   Host: ${emailHost}`);
  log(`   Puerto: ${emailPort}`);
  log(`   From: ${emailFrom || emailUser}`);
  
  // 2. Crear transporter
  log('\n2️⃣ Creando transporter...', colors.blue);
  log('─'.repeat(80));
  
  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
  
  // 3. Verificar conexión
  log('\n3️⃣ Verificando conexión con servidor SMTP...', colors.blue);
  log('─'.repeat(80));
  
  try {
    await transporter.verify();
    log('✅ Conexión exitosa con servidor SMTP', colors.green);
  } catch (error: any) {
    log('❌ Error de conexión:', colors.red);
    console.error(error.message);
    log('\n💡 Posibles causas:', colors.yellow);
    log('   1. App Password incorrecto');
    log('   2. Verificación en 2 pasos no activada');
    log('   3. Configuración SMTP incorrecta');
    return;
  }
  
  // 4. Enviar email de prueba
  log('\n4️⃣ Enviando email de prueba...', colors.blue);
  log('─'.repeat(80));
  
  const testEmail = process.argv[2] || emailUser;
  
  log(`📧 Destinatario: ${testEmail}`);
  
  try {
    const info = await transporter.sendMail({
      from: `"Smart Sales Bot Pro" <${emailFrom || emailUser}>`,
      to: testEmail,
      subject: '✅ Test de Email - Smart Sales Bot Pro',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🤖 Smart Sales Bot Pro</h1>
                <p>Sistema de Notificaciones</p>
              </div>
              <div class="content">
                <h2>¡Email de Prueba Exitoso! ✅</h2>
                
                <div class="success">
                  <strong>✅ El sistema de emails está funcionando correctamente</strong>
                  <p>Si estás viendo este mensaje, significa que Nodemailer está configurado y funcionando perfectamente.</p>
                </div>
                
                <h3>📊 Detalles del envío:</h3>
                <ul>
                  <li><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</li>
                  <li><strong>Servidor:</strong> ${emailHost}</li>
                  <li><strong>Puerto:</strong> ${emailPort}</li>
                  <li><strong>Remitente:</strong> ${emailFrom || emailUser}</li>
                </ul>
                
                <h3>📧 Tipos de emails que se enviarán:</h3>
                <ul>
                  <li>🔐 Recuperación de contraseñas</li>
                  <li>💰 Confirmaciones de pago</li>
                  <li>📦 Notificaciones de pedidos</li>
                  <li>🔔 Recordatorios automáticos</li>
                  <li>✅ Verificación de cuenta</li>
                </ul>
                
                <p><strong>Sistema:</strong> Node.js + Nodemailer + PostgreSQL</p>
              </div>
              <div class="footer">
                <p>Smart Sales Bot Pro - Automatización Inteligente de Ventas</p>
                <p>Este es un correo automático de prueba</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        SMART SALES BOT PRO - Email de Prueba
        
        ¡Email de prueba exitoso!
        
        El sistema de emails está funcionando correctamente.
        
        Detalles:
        - Fecha: ${new Date().toLocaleString('es-ES')}
        - Servidor: ${emailHost}
        - Puerto: ${emailPort}
        
        Sistema: Node.js + Nodemailer + PostgreSQL
      `,
    });
    
    log('✅ Email enviado exitosamente!', colors.green);
    log(`   Message ID: ${info.messageId}`);
    log('');
    log('📬 Verifica tu bandeja de entrada', colors.cyan);
    log('   (También revisa spam/correo no deseado)');
    
  } catch (error: any) {
    log('❌ Error enviando email:', colors.red);
    console.error(error.message);
  }
}

// Ejecutar
testEmailNodemailer()
  .then(() => {
    log('\n✅ Test completado', colors.green);
    log('\n📝 Próximos pasos:');
    log('   1. Verificar que llegó el email');
    log('   2. Probar recuperación de contraseña');
    log('   3. Probar notificaciones de pago');
    process.exit(0);
  })
  .catch((error) => {
    log(`\n❌ Error: ${error.message}`, colors.red);
    process.exit(1);
  });
