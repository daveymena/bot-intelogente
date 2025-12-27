
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const conn = await prisma.whatsAppConnection.findFirst();
    console.log('--- CONNECTION STATUS ---');
    console.log('Is Connected:', conn?.isConnected);
    console.log('Status:', conn?.status);
    console.log('Last Connected:', conn?.lastConnectedAt);
    console.log('Last Message:', conn?.lastMessageAt);
    
    const messages = await prisma.message.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        conversation: true
      }
    });
    console.log('--- RECENT ACTIVITY ---');
    messages.forEach(m => {
      console.log(`[${m.createdAt}] ${m.direction}: ${m.content.substring(0, 50)}... (Conv: ${m.conversation.customerPhone})`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
