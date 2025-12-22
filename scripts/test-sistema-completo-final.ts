/**
 * TEST COMPLETO DEL SISTEMA
 * 1. Recuperación de contraseñas
 * 2. Notificaciones de pago
 * 3. Suscripciones
 * 4. Sistema de emails
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

async function testSistemaCompleto() {
  log('\n🧪 TEST COMPLETO DEL SISTEMA', colors.cyan);
  log('═'.repeat(80), colors.cyan);
  
  // 1. Test de recuperación de contraseñas
  await testRecuperacionPassword();
  
  // 2. Test de notificaciones
  await testNotificaciones();
  
  // 3. Test de suscripciones
  await testSuscripciones();
  
  // 4. Test de emails
  await testEmails();
  
  // 5. Test de pagos
  await testPagos();
  
  // Resumen final
  mostrarResumenFinal();
}

async function testRecuperacionPassword() {
  log('\n1️⃣ TEST: Recuperación de Contraseñas', colors.blue);
  log('─'.repeat(80));
  
  try {
    // Verificar que exista el endpoint
    const fs = require('fs');
    const path = require('path');
    
    const forgotPasswordPath = path.join(process.cwd(), 'src/app/api/auth/forgot-password/route.ts');
    const resetPasswordPath = path.join(process.cwd(), 'src/app/api/auth/reset-password/route.ts');
    
    if (!fs.existsSync(forgotPasswordPath)) {
      log('❌ Endpoint forgot-password NO existe', colors.red);
      log('   Ubicación esperada: src/app/api/auth/forgot-password/route.ts');
      return;
    }
    
    if (!fs.existsSync(resetPasswordPath)) {
      log('❌ Endpoint reset-password NO existe', colors.red);
      log('   Ubicación esperada: src/app/api/auth/reset-password/route.ts');
      return;
    }
    
    log('✅ Endpoints de recuperación existen', colors.green);
    
    // Verificar configuración de email
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass) {
      log('⚠️  Email NO configurado', colors.yellow);
      log('   Agregar a .env:');
      log('   EMAIL_USER=tu_email@gmail.com');
      log('   EMAIL_PASS=tu_app_password');
      log('   EMAIL_FROM=tu_email@gmail.com');
    } else {
      log('✅ Email configurado', colors.green);
      log(`   Email: ${emailUser}`);
    }
    
    // Verificar página de reset
    const resetPagePath = path.join(process.cwd(), 'src/app/reset-password/page.tsx');
    if (fs.existsSync(resetPagePath)) {
      log('✅ Página de reset existe', colors.green);
    } else {
      log('❌ Página de reset NO existe', colors.red);
    }
    
    log('\n📝 Flujo de recuperación:');
    log('   1. Usuario va a /forgot-password');
    log('   2. Ingresa su email');
    log('   3. Recibe email con link de reset');
    log('   4. Click en link → /reset-password?token=XXX');
    log('   5. Ingresa nueva contraseña');
    log('   6. Contraseña actualizada');
    
  } catch (error) {
    log(`❌ Error: ${error}`, colors.red);
  }
}

async function testNotificaciones() {
  log('\n2️⃣ TEST: Sistema de Notificaciones', colors.blue);
  log('─'.repeat(80));
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Verificar servicio de notificaciones
    const notificationServicePath = path.join(process.cwd(), 'src/lib/notification-service.ts');
    
    if (!fs.existsSync(notificationServicePath)) {
      log('❌ Servicio de notificaciones NO existe', colors.red);
      return;
    }
    
    log('✅ Servicio de notificaciones existe', colors.green);
    
    // Verificar endpoints de notificaciones
    const sendNotificationPath = path.join(process.cwd(), 'src/app/api/notifications/send-payment-confirmation/route.ts');
    const validateTokenPath = path.join(process.cwd(), 'src/app/api/notifications/validate-token/route.ts');
    
    if (fs.existsSync(sendNotificationPath)) {
      log('✅ Endpoint send-payment-confirmation existe', colors.green);
    } else {
      log('❌ Endpoint send-payment-confirmation NO existe', colors.red);
    }
    
    if (fs.existsSync(validateTokenPath)) {
      log('✅ Endpoint validate-token existe', colors.green);
    } else {
      log('❌ Endpoint validate-token NO existe', colors.red);
    }
    
    // Verificar configuración
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) {
      log('✅ APP_URL configurado', colors.green);
      log(`   URL: ${appUrl}`);
    } else {
      log('⚠️  APP_URL no configurado', colors.yellow);
      log('   Agregar a .env: NEXT_PUBLIC_APP_URL=https://tu-dominio.com');
    }
    
    log('\n📝 Flujo de notificaciones:');
    log('   1. Cliente realiza pago');
    log('   2. Sistema detecta pago confirmado');
    log('   3. Envía notificación por email');
    log('   4. Envía notificación por WhatsApp (opcional)');
    log('   5. Cliente recibe confirmación');
    
  } catch (error) {
    log(`❌ Error: ${error}`, colors.red);
  }
}

async function testSuscripciones() {
  log('\n3️⃣ TEST: Sistema de Suscripciones', colors.blue);
  log('─'.repeat(80));
  
  try {
    // Verificar modelo de suscripciones en BD
    const suscripciones = await prisma.membership.findMany({
      take: 5,
    });
    
    if (suscripciones.length === 0) {
      log('⚠️  No hay suscripciones en la BD', colors.yellow);
      log('   Crear planes de suscripción en el dashboard');
    } else {
      log(`✅ Encontradas ${suscripciones.length} suscripciones`, colors.green);
      suscripciones.forEach(sub => {
        log(`   - ${sub.name}: $${sub.price.toLocaleString()} (${sub.duration})`);
      });
    }
    
    // Verificar usuarios con suscripciones
    const usuariosConSub = await prisma.user.findMany({
      where: {
        membershipId: { not: null },
      },
      include: {
        membership: true,
      },
      take: 5,
    });
    
    if (usuariosConSub.length === 0) {
      log('⚠️  No hay usuarios con suscripciones activas', colors.yellow);
    } else {
      log(`✅ ${usuariosConSub.length} usuarios con suscripciones activas`, colors.green);
    }
    
    log('\n📝 Flujo de suscripciones:');
    log('   1. Usuario selecciona plan');
    log('   2. Realiza pago');
    log('   3. Sistema activa suscripción');
    log('   4. Usuario obtiene acceso a funciones premium');
    log('   5. Sistema verifica expiración automáticamente');
    
  } catch (error) {
    log(`❌ Error: ${error}`, colors.red);
  }
}

async function testEmails() {
  log('\n4️⃣ TEST: Sistema de Emails', colors.blue);
  log('─'.repeat(80));
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Verificar servicio de email
    const emailServicePath = path.join(process.cwd(), 'src/lib/email-service.ts');
    
    if (!fs.existsSync(emailServicePath)) {
      log('❌ Servicio de email NO existe', colors.red);
      return;
    }
    
    log('✅ Servicio de email existe', colors.green);
    
    // Verificar configuración de email
    const emailConfig = {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      from: process.env.EMAIL_FROM,
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || '587',
    };
    
    if (!emailConfig.user || !emailConfig.pass) {
      log('❌ Email NO configurado', colors.red);
      log('\n💡 Configurar en .env:');
      log('   EMAIL_USER=tu_email@gmail.com');
      log('   EMAIL_PASS=tu_app_password');
      log('   EMAIL_FROM=tu_email@gmail.com');
      log('   EMAIL_HOST=smtp.gmail.com');
      log('   EMAIL_PORT=587');
      log('\n📖 Obtener App Password de Gmail:');
      log('   1. Ir a: https://myaccount.google.com/apppasswords');
      log('   2. Crear contraseña de aplicación');
      log('   3. Copiar y pegar en EMAIL_PASS');
    } else {
      log('✅ Email configurado', colors.green);
      log(`   Usuario: ${emailConfig.user}`);
      log(`   Host: ${emailConfig.host}`);
      log(`   Puerto: ${emailConfig.port}`);
    }
    
    log('\n📝 Tipos de emails enviados:');
    log('   1. Recuperación de contraseña');
    log('   2. Confirmación de pago');
    log('   3. Entrega de producto digital');
    log('   4. Notificación de suscripción');
    log('   5. Recordatorio de expiración');
    
  } catch (error) {
    log(`❌ Error: ${error}`, colors.red);
  }
}

async function testPagos() {
  log('\n5️⃣ TEST: Sistema de Pagos', colors.blue);
  log('─'.repeat(80));
  
  try {
    // Verificar configuración de pagos
    const paymentConfig = {
      mercadopago: {
        token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
        publicKey: process.env.MERCADO_PAGO_PUBLIC_KEY,
        clientId: process.env.MERCADO_PAGO_CLIENT_ID,
      },
      paypal: {
        email: process.env.PAYPAL_EMAIL,
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      },
      nequi: process.env.NEQUI_NUMBER,
      daviplata: process.env.DAVIPLATA_NUMBER,
    };
    
    // MercadoPago
    if (paymentConfig.mercadopago.token && paymentConfig.mercadopago.publicKey) {
      log('✅ MercadoPago configurado', colors.green);
      log(`   Access Token: ${paymentConfig.mercadopago.token.substring(0, 30)}...`);
    } else {
      log('❌ MercadoPago NO configurado', colors.red);
    }
    
    // PayPal
    if (paymentConfig.paypal.email) {
      log('✅ PayPal configurado (email)', colors.green);
      log(`   Email: ${paymentConfig.paypal.email}`);
    } else if (paymentConfig.paypal.clientId && paymentConfig.paypal.clientSecret) {
      log('✅ PayPal configurado (API)', colors.green);
    } else {
      log('❌ PayPal NO configurado', colors.red);
    }
    
    // Nequi/Daviplata
    if (paymentConfig.nequi) {
      log('✅ Nequi/Daviplata configurado', colors.green);
      log(`   Número: ${paymentConfig.nequi}`);
    } else {
      log('⚠️  Nequi/Daviplata no configurado', colors.yellow);
    }
    
    // Verificar conversaciones con pagos
    const conversacionesConPago = await prisma.conversation.findMany({
      where: {
        paymentStatus: { not: null },
      },
      take: 5,
      orderBy: {
        updatedAt: 'desc',
      },
    });
    
    if (conversacionesConPago.length > 0) {
      log(`\n✅ ${conversacionesConPago.length} conversaciones con pagos registrados`, colors.green);
      conversacionesConPago.forEach(conv => {
        log(`   - ${conv.paymentStatus}: ${conv.paymentMethod || 'N/A'}`);
      });
    } else {
      log('\n⚠️  No hay conversaciones con pagos registrados', colors.yellow);
    }
    
    log('\n📝 Flujo de pagos:');
    log('   1. Cliente selecciona producto');
    log('   2. Elige método de pago');
    log('   3. Sistema genera link/instrucciones');
    log('   4. Cliente realiza pago');
    log('   5. Sistema detecta confirmación');
    log('   6. Envía notificación');
    log('   7. Entrega producto');
    
  } catch (error) {
    log(`❌ Error: ${error}`, colors.red);
  }
}

function mostrarResumenFinal() {
  log('\n' + '═'.repeat(80), colors.cyan);
  log('📊 RESUMEN FINAL', colors.cyan);
  log('═'.repeat(80), colors.cyan);
  
  const checks = [
    {
      nombre: 'Recuperación de contraseñas',
      archivos: [
        'src/app/api/auth/forgot-password/route.ts',
        'src/app/api/auth/reset-password/route.ts',
        'src/app/reset-password/page.tsx',
      ],
    },
    {
      nombre: 'Sistema de notificaciones',
      archivos: [
        'src/lib/notification-service.ts',
        'src/app/api/notifications/send-payment-confirmation/route.ts',
      ],
    },
    {
      nombre: 'Sistema de emails',
      archivos: [
        'src/lib/email-service.ts',
      ],
    },
    {
      nombre: 'Sistema de pagos',
      archivos: [
        'src/lib/payment-link-generator.ts',
      ],
    },
  ];
  
  log('\n📁 Archivos del sistema:');
  checks.forEach(check => {
    log(`\n${check.nombre}:`, colors.blue);
    check.archivos.forEach(archivo => {
      const fs = require('fs');
      const path = require('path');
      const fullPath = path.join(process.cwd(), archivo);
      if (fs.existsSync(fullPath)) {
        log(`   ✅ ${archivo}`, colors.green);
      } else {
        log(`   ❌ ${archivo}`, colors.red);
      }
    });
  });
  
  log('\n' + '═'.repeat(80), colors.cyan);
  log('📝 PRÓXIMOS PASOS', colors.cyan);
  log('═'.repeat(80), colors.cyan);
  
  log('\n1. Configurar Email (si no está configurado):');
  log('   - Ir a: https://myaccount.google.com/apppasswords');
  log('   - Crear contraseña de aplicación');
  log('   - Agregar a .env: EMAIL_USER, EMAIL_PASS, EMAIL_FROM');
  
  log('\n2. Probar recuperación de contraseñas:');
  log('   - Ir a: http://localhost:4000/forgot-password');
  log('   - Ingresar email de prueba');
  log('   - Verificar que llegue el email');
  
  log('\n3. Probar notificaciones de pago:');
  log('   - Realizar una compra de prueba');
  log('   - Verificar que llegue notificación por email');
  log('   - Verificar que llegue notificación por WhatsApp');
  
  log('\n4. Probar suscripciones:');
  log('   - Ir a: http://localhost:4000/membresias');
  log('   - Seleccionar un plan');
  log('   - Completar pago');
  log('   - Verificar que se active la suscripción');
  
  log('');
}

// Ejecutar test
testSistemaCompleto()
  .then(() => {
    log('\n✅ Test completado', colors.green);
    process.exit(0);
  })
  .catch((error) => {
    log(`\n❌ Error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  });
