
import { routeMessage } from '../src/lib/bot/core/agentRouter';
import { db } from '../src/lib/db';

async function testSalesFunnel() {
  console.log('🚀 TEST DE EMBUDO DE VENTAS (DAVID AUTO-STAGE) 🚀');
  console.log('==============================================\n');

  try {
    const realUser = await db.user.findFirst({
      where: { products: { some: {} } },
      include: { products: true }
    });

    if (!realUser) {
      console.error('❌ No se encontró ningún usuario con productos para probar.');
      process.exit(1);
    }

    const userId = realUser.id;
    const customerPhone = '57999888777@s.whatsapp.net'; // Un número nuevo para la prueba

    // Limpiar conversación previa si existe
    await db.message.deleteMany({ where: { conversation: { customerPhone } } });
    await db.conversation.deleteMany({ where: { customerPhone } });

    const steps = [
      'Hola, buenos días',
      'Busco un computador portátil para diseño',
      '¿Esa Asus Vivobook qué tal es?',
      'Me interesa comprarla, está genial',
      '¿Cómo puedo pagar?',
      'Listo, ya te mando los datos'
    ];

    for (const msg of steps) {
        console.log(`\n👤 USUARIO: "${msg}"`);
        const startTime = Date.now();
        const response = await routeMessage(userId, customerPhone, msg);
        const duration = Date.now() - startTime;
        
        // Consultar el estado actual en DB
        const conv = await db.conversation.findFirst({ where: { customerPhone } });
        
        console.log(`📍 ESTADO DB: ${conv?.currentStage}`);
        console.log(`🤖 DAVID: ${response.text.substring(0, 150)}${response.text.length > 150 ? '...' : ''}`);
        if (response.media) console.log(`📸 MEDIA ENVIADA: Sí`);
        console.log(`⏱️ ${duration}ms`);
        console.log('----------------------------------------------');
        
        // Pequeña pausa para no saturar
        await new Promise(r => setTimeout(r, 1000));
    }

  } catch (error: any) {
    console.error(`\n❌ ERROR: ${error.message}`);
  }

  process.exit(0);
}

testSalesFunnel();
