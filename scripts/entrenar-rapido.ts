/**
 * ENTRENAMIENTO RAPIDO
 * Entrena con 10 productos de diferentes tipos
 */

import { PrismaClient } from '@prisma/client';
import { getIntelligentEngine } from '../src/lib/intelligent-conversation-engine';
import { LocalKnowledgeBase } from '../src/lib/local-knowledge-base';

const prisma = new PrismaClient();

const ESSENTIAL_FLOWS = [
  {
    name: 'Flujo Basico',
    steps: ['{PRODUCT_NAME}', 'Como puedo pagar?', '{PAYMENT_METHOD}']
  },
  {
    name: 'Flujo Directo',
    steps: ['{PRODUCT_NAME}', 'Quiero pagar con {PAYMENT_METHOD}']
  }
];

const PAYMENT_METHODS = ['MercadoPago', 'Nequi'];

async function trainQuick() {
  console.log('ENTRENAMIENTO RAPIDO\n');

  const engine = getIntelligentEngine();
  let saved = 0;

  try {
    // Obtener 10 productos de cualquier tipo
    const products = await prisma.product.findMany({
      where: { status: 'AVAILABLE' },
      take: 10
    });

    console.log(`Entrenando con ${products.length} productos\n`);

    for (const product of products) {
      console.log(`\nProducto: ${product.name}`);

      for (const flow of ESSENTIAL_FLOWS) {
        for (const method of PAYMENT_METHODS) {
          const chatId = `quick-${Date.now()}-${Math.random()}`;

          for (const step of flow.steps) {
            const message = step
              .replace('{PRODUCT_NAME}', product.name)
              .replace('{PAYMENT_METHOD}', method);

            console.log(`  Usuario: ${message.substring(0, 40)}...`);

            const response = await engine.processMessage({
              chatId,
              userName: 'Quick Training',
              message,
              userId: product.userId
            });

            if (response.confidence > 0.7) {
              await LocalKnowledgeBase.saveSuccessfulResponse({
                userQuery: message,
                botResponse: response.text,
                productId: product.id,
                confidence: response.confidence
              });
              saved++;
            }

            await new Promise(resolve => setTimeout(resolve, 300));
          }

          engine.clearMemory(chatId);
        }
      }
    }

    console.log(`\nEntrenamiento completado`);
    console.log(`${saved} respuestas guardadas\n`);

  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

trainQuick();
