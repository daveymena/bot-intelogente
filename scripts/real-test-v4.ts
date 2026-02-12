
import { routeMessage } from '../src/lib/bot/core/agentRouter';
import { db } from '../src/lib/db';

async function performRealTest() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔥 TEST REAL DE VENTA - DAVID ULTRA MODE v11.0 🔥');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Obtener un usuario que tenga productos
    const user = await db.user.findFirst({
      where: { products: { some: { name: { contains: 'Asus Vivobook' } } } },
      include: { products: true }
    }) || await db.user.findFirst({ include: { products: true } });

    if (!user) {
      console.error('❌ Error: No hay usuarios con catálogo para probar.');
      process.exit(1);
    }

    const userId = user.id;
    const customerPhone = '573210001122@s.whatsapp.net';
    const customerName = 'Juan Cliente';

    // Limpiar rastro previo
    await db.message.deleteMany({ where: { conversation: { customerPhone } } });
    await db.conversation.deleteMany({ where: { customerPhone } });

    const conversationFlow = [
      { msg: 'Hola david, ¿cómo estás?', label: 'SALUDO' },
      { msg: 'Estoy buscando un computador que no sea tan caro para trabajar en casa', label: 'BÚSQUEDA' },
      { msg: 'El Asus Vivobook me gusta, ¿qué tal es de potencia?', label: 'ESPECÍFICO' },
      { msg: 'Me convence, lo quiero comprar ya mismo', label: 'INTENCIÓN' },
      { msg: '¿Cuáles son las formas de pago?', label: 'PAGO' }
    ];

    for (const step of conversationFlow) {
      console.log(`👤 CLIENTE: "${step.msg}"`);
      
      const startTime = Date.now();
      const result = await routeMessage(userId, customerPhone, step.msg);
      const duration = Date.now() - startTime;

      // Obtener estado actual de la conversación
      const conv = await db.conversation.findFirst({ where: { customerPhone } });

      console.log(`🤖 DAVID [Estado: ${conv?.currentStage || 'unknown'}]:`);
      console.log(`${result.text}`);
      
      if (result.media && result.media.length > 0) {
        console.log(`📸 IMAGEN ENVIADA: [${result.media[0]}]`);
      }
      
      console.log(`\n(⏱️  Respuesta en ${duration}ms)`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      // Pausa para realismo
      await new Promise(r => setTimeout(r, 2000));
    }

    console.log('✅ TEST REAL COMPLETADO CON ÉXITO');

  } catch (error: any) {
    console.error('❌ ERROR EN EL TEST:', error.message);
  }

  process.exit(0);
}

performRealTest();
