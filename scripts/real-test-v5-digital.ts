
import { routeMessage } from '../src/lib/bot/core/agentRouter';
import { db } from '../src/lib/db';

async function performDigitalTest() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 TEST DIGITAL DE VENTA - DAVID ULTRA MODE v11.0 🚀');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Buscar un megapack
    const megapack = await db.product.findFirst({
      where: { name: { contains: 'Mega Pack' } }
    });

    if (!megapack) {
      console.error('❌ Error: No se encontró ningún Mega Pack en la BD.');
      process.exit(1);
    }

    const user = await db.user.findFirst({
        where: { id: megapack.userId }
    });

    const userId = user?.id || '';
    const customerPhone = '573210009988@s.whatsapp.net';

    // Limpiar rastro previo
    await db.message.deleteMany({ where: { conversation: { customerPhone } } });
    await db.conversation.deleteMany({ where: { customerPhone } });

    const conversationFlow = [
      { msg: 'Hola david, ¿qué cursos tienes?', label: 'MUESTRA' },
      { msg: `Me interesa el ${megapack.name}, ¿cómo lo recibo?`, label: 'DIGITAL_INFO' },
      { msg: 'Listo, pásame los links para pagar ya mismo', label: 'PAGO' }
    ];

    for (const step of conversationFlow) {
      console.log(`👤 CLIENTE: "${step.msg}"`);
      
      const startTime = Date.now();
      const result = await routeMessage(userId, customerPhone, step.msg);
      const duration = Date.now() - startTime;

      const conv = await db.conversation.findFirst({ where: { customerPhone } });

      console.log(`🤖 DAVID [Estado: ${conv?.currentStage || 'unknown'}]:`);
      console.log(`${result.text}`);
      
      if (result.media && result.media.length > 0) {
        console.log(`📸 IMAGEN ENVIADA: [${result.media[0]}]`);
      }
      
      console.log(`\n(⏱️  Respuesta en ${duration}ms)`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      await new Promise(r => setTimeout(r, 1000));
    }

    console.log('✅ TEST DIGITAL COMPLETADO');

  } catch (error: any) {
    console.error('❌ ERROR EN EL TEST:', error.message);
  }

  process.exit(0);
}

performDigitalTest();
