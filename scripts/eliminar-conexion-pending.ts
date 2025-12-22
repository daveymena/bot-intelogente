import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function eliminarPending() {
  console.log('🧹 ELIMINANDO CONEXIÓN PENDING\n');

  try {
    // Eliminar conexiones con phoneNumber = 'pending'
    const result = await prisma.whatsAppConnection.deleteMany({
      where: {
        phoneNumber: 'pending'
      }
    });

    console.log(`✅ ${result.count} conexión(es) "pending" eliminadas\n`);

    // Verificar estado
    const remaining = await prisma.whatsAppConnection.count();
    console.log(`📊 Conexiones restantes: ${remaining}\n`);

    if (remaining === 0) {
      console.log('✅ SISTEMA COMPLETAMENTE LIMPIO');
      console.log('Ahora puedes conectar WhatsApp desde el dashboard.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

eliminarPending();
