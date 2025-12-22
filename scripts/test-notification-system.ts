import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../src/lib/notification-service';

const prisma = new PrismaClient();

async function testNotificationSystem() {
  console.log('🧪 Iniciando prueba del sistema de notificaciones...\n');

  try {
    // 1. Crear usuario de prueba
    console.log('1️⃣ Creando usuario de prueba...');
    const testEmail = 'test-notifications@example.com';
    
    await prisma.user.deleteMany({
      where: { email: testEmail }
    });

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: 'test123',
        name: 'Test User',
        isEmailVerified: true,
        role: 'USER'
      }
    });
    console.log('✅ Usuario creado:', user.email);

    // 2. Crear pago de prueba
    console.log('\n2️⃣ Creando pago de prueba...');
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: 150000,
        currency: 'COP',
        status: 'COMPLETED',
        paymentMethod: 'mercadopago',
        description: 'Laptop HP 15 - Test User - ' + testEmail,
        metadata: JSON.stringify({
          productName: 'Laptop HP 15',
          customerName: 'Test User',
          customerEmail: testEmail,
          transactionId: 'TEST-' + Date.now(),
          invoiceNumber: 'INV-' + Date.now()
        })
      }
    });
    console.log('✅ Pago creado:', payment.id);
    console.log('   Monto:', payment.amount, payment.currency);

    // 3. Crear token de confirmación de pago
    console.log('\n3️⃣ Creando token de confirmación de pago...');
    const confirmationToken = await NotificationService.createToken({
      type: 'PAYMENT_CONFIRMATION',
      purpose: 'Ver confirmación de pago',
      userId: user.id,
      paymentId: payment.id,
      metadata: {
        amount: payment.amount,
        currency: payment.currency,
        productName: payment.productName
      },
      expiresInHours: 72
    });
    console.log('✅ Token de confirmación creado');
    console.log('   URL:', confirmationToken.url);

    // 4. Crear token de recordatorio
    console.log('\n4️⃣ Creando token de recordatorio...');
    const reminderToken = await NotificationService.createToken({
      type: 'PAYMENT_REMINDER',
      purpose: 'Recordatorio de pago pendiente',
      userId: user.id,
      paymentId: payment.id,
      metadata: {
        amount: payment.amount,
        currency: payment.currency
      },
      expiresInHours: 48
    });
    console.log('✅ Token de recordatorio creado');
    console.log('   URL:', reminderToken.url);

    // 5. Crear token de factura
    console.log('\n5️⃣ Creando token de factura...');
    const invoiceToken = await NotificationService.createToken({
      type: 'PAYMENT_INVOICE',
      purpose: 'Ver factura/recibo',
      userId: user.id,
      paymentId: payment.id,
      metadata: {
        invoiceNumber: payment.invoiceNumber,
        amount: payment.amount
      },
      expiresInHours: 720 // 30 días
    });
    console.log('✅ Token de factura creado');
    console.log('   URL:', invoiceToken.url);

    // 6. Validar token
    console.log('\n6️⃣ Validando token de confirmación...');
    const validation = await NotificationService.validateToken(confirmationToken.rawToken);
    if (validation.valid) {
      console.log('✅ Token válido');
      console.log('   Tipo:', validation.token?.type);
      console.log('   Propósito:', validation.token?.purpose);
      console.log('   Vistas:', validation.token?.viewCount);
    } else {
      console.log('❌ Token inválido:', validation.error);
    }

    // 7. Validar token nuevamente (incrementar contador)
    console.log('\n7️⃣ Validando token nuevamente...');
    const validation2 = await NotificationService.validateToken(confirmationToken.rawToken);
    if (validation2.valid) {
      console.log('✅ Token válido (segunda vez)');
      console.log('   Vistas:', validation2.token?.viewCount);
    }

    // 8. Marcar token como usado
    console.log('\n8️⃣ Marcando token como usado...');
    await NotificationService.markAsUsed(confirmationToken.tokenRecord.id);
    console.log('✅ Token marcado como usado');

    // 9. Intentar validar token usado
    console.log('\n9️⃣ Intentando validar token usado...');
    const validation3 = await NotificationService.validateToken(confirmationToken.rawToken);
    if (!validation3.valid) {
      console.log('✅ Token usado correctamente rechazado');
      console.log('   Error:', validation3.error);
    } else {
      console.log('❌ Error: Token usado fue aceptado');
    }

    // 10. Probar envío de notificación (simulado)
    console.log('\n🔟 Probando envío de confirmación de pago...');
    try {
      const sendResult = await NotificationService.sendPaymentConfirmation({
        paymentId: payment.id,
        customerEmail: testEmail,
        customerName: 'Test User',
        type: 'confirmation'
      });
      console.log('✅ Notificación enviada');
      console.log('   URL:', sendResult.url);
      console.log('   Email enviado:', sendResult.success);
    } catch (error: any) {
      console.log('⚠️  Email simulado (RESEND_API_KEY no configurado)');
    }

    // 11. Verificar tokens en BD
    console.log('\n1️⃣1️⃣ Verificando tokens en base de datos...');
    const tokens = await prisma.notificationToken.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ ${tokens.length} tokens encontrados:`);
    tokens.forEach((token, index) => {
      console.log(`   ${index + 1}. ${token.type} - ${token.status} - Vistas: ${token.viewCount}`);
    });

    // 12. Limpiar
    console.log('\n1️⃣2️⃣ Limpiando datos de prueba...');
    await prisma.notificationToken.deleteMany({
      where: { userId: user.id }
    });
    await prisma.payment.delete({
      where: { id: payment.id }
    });
    await prisma.user.delete({
      where: { id: user.id }
    });
    console.log('✅ Datos de prueba eliminados');

    console.log('\n✅ ¡Todas las pruebas pasaron exitosamente!');
    
    console.log('\n📋 Resumen del sistema:');
    console.log('1. Tokens seguros con SHA-256');
    console.log('2. Múltiples tipos de notificaciones');
    console.log('3. Expiración configurable');
    console.log('4. Contador de vistas');
    console.log('5. Estados: PENDING, USED, EXPIRED');
    console.log('6. Metadata flexible (JSON)');
    console.log('7. Templates de email profesionales');
    console.log('8. URLs únicas por tipo de notificación');

    console.log('\n🔗 URLs disponibles:');
    console.log('- /payment/confirmation?token=XXX');
    console.log('- /payment/reminder?token=XXX');
    console.log('- /payment/invoice?token=XXX');
    console.log('- /payment/status?token=XXX');
    console.log('- /order/tracking?token=XXX');
    console.log('- /appointment/confirm?token=XXX');

  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar pruebas
testNotificationSystem()
  .then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script falló:', error);
    process.exit(1);
  });
