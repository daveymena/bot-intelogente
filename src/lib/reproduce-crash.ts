import { getSalesAgent } from './sales-agent-simple';
import { db } from './db';

async function reproduceCrash() {
  console.log('🧪 Iniciando prueba de reproducción de crash...');

  try {
    const user = await db.user.findFirst();
    if (!user) {
      console.error('❌ No hay usuario en BD');
      return;
    }
    const userId = user.id; // Corrected: user.id
    console.log(`👤 Usando userId: ${userId}`);

    const count = await db.product.count({ where: { userId } });
    console.log(`📦 Productos en BD: ${count}`);

    const agent = getSalesAgent(userId);
    
    // CASO REPORTADO: "Hola muy buenas"
    console.log('📨 Enviando mensaje "Hola muy buenas"...');
    try {
        // Enforce Ollama failure by setting invalid URL temporarily if possible, 
        // or just rely on the fact that if it fails it falls back to Groq.
        // We want to see if Groq fails or something else crashes.
        
        const response = await agent.processMessage('Hola muy buenas', '573001234567');
        console.log('✅ Respuesta:', response);
    } catch (error: any) {
        console.error('❌ CRASH CAPTURADO en processMessage:', error);
        if (error.stack) console.error(error.stack);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await db.$disconnect();
  }
}

reproduceCrash();
