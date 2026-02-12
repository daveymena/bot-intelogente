// test-flow-maestro.ts
require('dotenv').config();
import { routeMessage } from './src/lib/bot/core/agentRouter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runFlowTest() {
  console.log('🚀 PROBANDO FLUJO MAESTRO - BOT VENDEDOR\n');
  
  const userId = 'cmlhbizk20000kmrcoxxha1bt'; // ID de tu usuario de prueba
  const customerPhone = '573112223344';

  // 1. Limpiar conversación previa para empezar de cero
  await prisma.conversation.deleteMany({ where: { customerPhone } });

  const scenario = [
    { msg: "Hola", note: "ETAPA 1: Saludo inicial" },
    { msg: "impresora brother", note: "ETAPA 2/3: Detección y Card" },
    { msg: "¿cuanto tarda el envio?", note: "ETAPA 5: Dudas con Prompt Maestro" },
    { msg: "me interesa comprarla", note: "ETAPA 6: Intención de compra" },
    { msg: "si, enviame los pagos", note: "ETAPA 7: Métodos de pago" },
    { msg: "transferencia", note: "ETAPA 8: Entrega" },
    { msg: "Cali, Barrio El Refugio", note: "ETAPA 9: Confirmación" },
    { msg: "si", note: "ETAPA 10: Cierre" }
  ];

  for (const step of scenario) {
    console.log(`\n📱 CLIENTE: "${step.msg}" (${step.note})`);
    try {
      const response = await routeMessage(userId, customerPhone, step.msg);
      console.log(`🤖 BOT:\n${response}`);
    } catch (error: any) {
      console.log(`❌ ERROR: ${error.message}`);
    }
    console.log('-'.repeat(70));
    // Pausa para realismo y evitar rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  process.exit(0);
}

runFlowTest().catch(console.error);
