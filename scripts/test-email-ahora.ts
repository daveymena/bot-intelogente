/**
 * TEST DE EMAIL - Diagnóstico completo
 */

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

async function testEmail() {
  log('\n📧 DIAGNÓSTICO DE EMAIL', colors.cyan);
  log('═'.repeat(80), colors.cyan);
  
  // Verificar configuración
  log('\n1️⃣ Verificando configuración...', colors.blue);
  log('─'.repeat(80));
  
  const resendKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM_EMAIL;
  
  if (!resendKey) {
    log('❌ RESEND_API_KEY no configurado', colors.red);
    log('\n💡 SOLUCIÓN:', colors.yellow);
    log('   El sistema usa Resend (no Gmail SMTP)');
    log('');
    log('   Opción 1: Usar Resend (Recomendado)');
    log('   ────────────────────────────────────');
    log('   1. Ir a: https://resend.com/signup');
    log('   2. Crear cuenta gratis');
    log('   3. Obtener API Key');
    log('   4. Agregar a .env:');
    log('      RESEND_API_KEY=re_xxxxxxxxxxxxx');
    log('      RESEND_FROM_EMAIL=onboarding@resend.dev');
    log('');
    log('   Opción 2: Cambiar a Gmail SMTP');
    log('   ────────────────────────────────────');
    log('   Necesitas modificar src/lib/email-service.ts');
    log('   para usar nodemailer con Gmail');
    log('');
    return;
  }
  
  log('✅ RESEND_API_KEY configurado', colors.green);
  log(`   Key: ${resendKey.substring(0, 10)}...`);
  
  if (!resendFrom) {
    log('⚠️  RESEND_FROM_EMAIL no configurado', colors.yellow);
    log('   Usando default: onboarding@resend.dev');
  } else {
    log(`✅ RESEND_FROM_EMAIL: ${resendFrom}`, colors.green);
  }
  
  // Test de envío
  log('\n2️⃣ Probando envío de email...', colors.blue);
  log('─'.repeat(80));
  
  const testEmail = process.argv[2] || 'test@example.com';
  
  if (testEmail === 'test@example.com') {
    log('⚠️  No se proporcionó email de prueba', colors.yellow);
    log('   Uso: npx tsx scripts/test-email-ahora.ts tu_email@gmail.com');
    return;
  }
  
  log(`📧 Enviando email de prueba a: ${testEmail}`);
  
  try {
    const { Resend } = require('resend');
    const resend = new Resend(resendKey);
    
    const { data, error } = await resend.emails.send({
      from: resendFrom || 'onboarding@resend.dev',
      to: testEmail,
      subject: '✅ Test de Email - Smart Sales Bot Pro',
      html: `
        <h1>¡Email de prueba exitoso!</h1>
        <p>Si estás viendo este mensaje, el sistema de emails está funcionando correctamente.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        <p><strong>Sistema:</strong> Smart Sales Bot Pro</p>
      `,
    });
    
    if (error) {
      log('❌ Error enviando email:', colors.red);
      console.error(error);
      return;
    }
    
    log('✅ Email enviado exitosamente!', colors.green);
    log(`   ID: ${data?.id}`);
    log('');
    log('📬 Verifica tu bandeja de entrada');
    log('   (También revisa spam/correo no deseado)');
    
  } catch (error: any) {
    log('❌ Error:', colors.red);
    console.error(error.message);
  }
}

// Ejecutar
testEmail()
  .then(() => {
    log('\n✅ Test completado', colors.green);
    process.exit(0);
  })
  .catch((error) => {
    log(`\n❌ Error: ${error.message}`, colors.red);
    process.exit(1);
  });
