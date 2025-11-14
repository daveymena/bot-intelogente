import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function corregirEstado() {
  console.log('🔧 CORRIGIENDO ESTADO DE WHATSAPP\n');
  console.log('='.repeat(50));

  try {
    // Actualizar todas las conexiones a DISCONNECTED
    const result = await prisma.whatsAppConnection.updateMany({
      data: {
        status: 'DISCONNECTED',
        isConnected: false,
        qrCode: null,
        qrExpiresAt: null,
        lastError: 'Estado corregido - desconectado manualmente'
      }
    });

    console.log(`\n✅ ${result.count} conexiones actualizadas a DISCONNECTED`);
    console.log('\n📊 Estado actual:');
    
    const connections = await prisma.whatsAppConnection.findMany({
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    for (const conn of connections) {
      console.log(`   - ${conn.user.email}: ${conn.status} (${conn.isConnected ? 'Conectado' : 'Desconectado'})`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ ESTADO CORREGIDO\n');
    console.log('Ahora puedes conectar WhatsApp limpiamente desde el dashboard.\n');

  } catch (error) {
    console.error('\n❌ Error corrigiendo estado:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

corregirEstado()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
