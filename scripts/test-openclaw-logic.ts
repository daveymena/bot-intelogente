
import { routeMessage } from '../src/lib/bot/core/agentRouter';
import { db } from '../src/lib/db';

async function testOpenClaw() {
  console.log('🦞 TEST DE LÓGICA OPENCLAW 🦞');
  console.log('=============================\n');

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
    const customerPhone = '573000000000@s.whatsapp.net';
    
    console.log(`✅ Usando usuario real: ${realUser.email || userId}`);
    console.log(`📊 Productos encontrados: ${realUser.products.length}\n`);

    const message = 'Busco un computador potente';
    console.log(`👤 USUARIO: "${message}"`);
    console.log('----------------------------');
    
    const startTime = Date.now();
    const response = await routeMessage(userId, customerPhone, message);
    const duration = Date.now() - startTime;

    console.log(`\n🤖 DAVID: ${response.text}`);
    console.log(`\n⏱️ TIEMPO: ${duration}ms`);

  } catch (error: any) {
    console.error(`\n❌ ERROR CRÍTICO: ${error.message}`);
    if (error.stack) console.error(error.stack);
  }

  process.exit(0);
}

testOpenClaw();
