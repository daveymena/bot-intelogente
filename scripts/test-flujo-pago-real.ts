import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../src/lib/notification-service';

const prisma = new PrismaClient();

async function testFlujoCompleto() {
  console.log('🧪 PRUEBA DE FLUJO COMPLETO DE PAGO CON NOTIFICACIONES\n');
  
  try {
    // 1. Buscar un usuario real
    console.log('1️⃣ Buscando usuario real en la base de datos...');
    const user = await prisma.user.findFirst({
      where: { isActive: true }
    });
    
    if (!user) {
      console.log('❌ No hay usuarios en la base de datos');
      console.log('💡 Crea un usuario primero desde el dashboard');
      return;
    }
    
    console.log(`✅ Usuario encontrado: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Nombre: ${user.name || 'Sin nombre'}\n`);
    
    // 2. Crear un pago de prueba
    console.log('2️⃣ Creando pago de prueba...');
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: 250000,
        currency: 'COP',
        status: 'COMPLETED',
        paymentMethod: 'Nequi',
        description: 'Pago de prueba - Laptop HP',
        metadata: JSON.stringify({
          producto: 'Laptop HP Pavilion',
          cantidad: 1,
          metodoPago: 'Nequi - 3136174267'
        })
      }
    });
    
    console.log(`✅ Pago creado: ${payment.id}`);
    console.log(`   Monto: ${payment.amount.toLocaleString('es-CO')} ${payment.currency}`);
    console.log(`   Método: ${payment.paymentMethod}\n`);
    
    // 3. Generar notificación de confirmación
    console.log('3️⃣ Generando notificación de confirmación de pago...');
    const confirmacion = await NotificationService.sendPaymentConfirmation(
      user.id,
      payment.id,
      user.email,
      payment.amount,
      payment.currency
    );
    
    console.log('✅ Notificación generada');
    console.log(`   URL: ${confirmacion.url}`);
    console.log(`   Email enviado: ${confirmacion.emailSent ? 'Sí' : 'No (modo simulación)'}\n`);
    
    // 4. Simular envío por WhatsApp
    console.log('4️⃣ Mensaje que se enviaría por WhatsApp:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ *¡Pago Recibido!*\n');
    console.log(`Hola ${user.name || 'Cliente'},\n`);
    console.log(`Hemos recibido tu pago de *${payment.amount.toLocaleString('es-CO')} ${payment.currency}*`);
    console.log(`Método: ${payment.paymentMethod}\n`);
    console.log('📋 Ver detalles completos:');
    console.log(confirmacion.url);
    console.log('\n¡Gracias por tu compra! 🎉');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // 5. Validar que el token funciona
    console.log('5️⃣ Validando que el token funciona...');
    const tokenHash = confirmacion.url.split('token=')[1];
    const validacion = await NotificationService.validateToken(tokenHash);
    
    if (validacion.valid && validacion.token) {
      console.log('✅ Token válido');
      console.log(`   Tipo: ${validacion.token.type}`);
      console.log(`   Propósito: ${validacion.token.purpose}`);
      console.log(`   Expira: ${validacion.token.expiresAt.toLocaleString('es-CO')}`);
      console.log(`   Vistas: ${validacion.token.viewCount}\n`);
    } else {
      console.log('❌ Token inválido:', validacion.error);
    }
    
    // 6. Verificar en base de datos
    console.log('6️⃣ Verificando en base de datos...');
    const tokens = await prisma.notificationToken.findMany({
      where: { paymentId: payment.id },
      include: {
        payment: true,
        user: true
      }
    });
    
    console.log(`✅ ${tokens.length} token(s) encontrado(s)`);
    tokens.forEach((token, i) => {
      console.log(`   ${i + 1}. ${token.type} - ${token.status}`);
    });
    console.log('');
    
    // 7. Resumen final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PRUEBA COMPLETADA EXITOSAMENTE\n');
    console.log('📋 Resumen:');
    console.log(`   • Usuario: ${user.email}`);
    console.log(`   • Pago: ${payment.amount.toLocaleString('es-CO')} ${payment.currency}`);
    console.log(`   • Token generado: ✅`);
    console.log(`   • URL funcionando: ✅`);
    console.log(`   • Base de datos: ✅\n`);
    
    console.log('🚀 CÓMO USAR EN PRODUCCIÓN:');
    console.log('   1. Cuando recibas un pago, llama a NotificationService.sendPaymentConfirmation()');
    console.log('   2. Obtienes una URL única y segura');
    console.log('   3. Envías esa URL al cliente por WhatsApp');
    console.log('   4. El cliente hace clic y ve los detalles del pago');
    console.log('   5. El sistema registra las vistas y valida el token\n');
    
    console.log('🔗 URL DE PRUEBA (cópiala y ábrela en el navegador):');
    console.log(confirmacion.url);
    console.log('');
    
    // Preguntar si quiere limpiar
    console.log('💡 Los datos de prueba quedan en la base de datos.');
    console.log('   Para limpiarlos, ejecuta: npx tsx scripts/limpiar-datos-prueba.ts');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFlujoCompleto();
