import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function detectarConflictos() {
  console.log('🔍 DETECTANDO CONFLICTOS DE WHATSAPP\n');
  console.log('='.repeat(60));

  try {
    // Obtener todas las conexiones
    const connections = await prisma.whatsAppConnection.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        lastConnectedAt: 'desc'
      }
    });

    console.log(`\n📊 Total de conexiones: ${connections.length}\n`);

    // Agrupar por número de teléfono
    const phoneGroups = new Map<string, typeof connections>();

    for (const conn of connections) {
      if (conn.phoneNumber === 'pending') continue;

      if (!phoneGroups.has(conn.phoneNumber)) {
        phoneGroups.set(conn.phoneNumber, []);
      }
      phoneGroups.get(conn.phoneNumber)!.push(conn);
    }

    // Detectar duplicados
    const duplicates: Array<{
      phoneNumber: string;
      connections: typeof connections;
    }> = [];

    for (const [phoneNumber, conns] of phoneGroups.entries()) {
      if (conns.length > 1) {
        duplicates.push({ phoneNumber, connections: conns });
      }
    }

    if (duplicates.length === 0) {
      console.log('✅ NO SE ENCONTRARON CONFLICTOS\n');
      console.log('Todas las conexiones tienen números únicos.');
      return;
    }

    console.log(`⚠️  SE ENCONTRARON ${duplicates.length} CONFLICTOS:\n`);

    for (const dup of duplicates) {
      console.log(`📱 Número: ${dup.phoneNumber}`);
      console.log(`   Conexiones duplicadas: ${dup.connections.length}\n`);

      for (let i = 0; i < dup.connections.length; i++) {
        const conn = dup.connections[i];
        const isActive = conn.isConnected && conn.status === 'CONNECTED';
        const statusIcon = isActive ? '🟢' : '🔴';
        const lastConnected = conn.lastConnectedAt 
          ? new Date(conn.lastConnectedAt).toLocaleString('es-CO')
          : 'Nunca';

        console.log(`   ${i + 1}. ${statusIcon} Usuario: ${conn.user.email}`);
        console.log(`      - ID: ${conn.userId}`);
        console.log(`      - Estado: ${conn.status}`);
        console.log(`      - Conectado: ${isActive ? 'Sí' : 'No'}`);
        console.log(`      - Última conexión: ${lastConnected}`);
        console.log('');
      }

      console.log('   ' + '-'.repeat(50) + '\n');
    }

    console.log('='.repeat(60));
    console.log('\n💡 RECOMENDACIONES:\n');
    console.log('1. Ejecuta el script de resolución automática:');
    console.log('   npx tsx scripts/resolver-conflictos-whatsapp.ts\n');
    console.log('2. O limpia manualmente las conexiones duplicadas:');
    console.log('   npx tsx scripts/limpiar-todo-whatsapp.ts\n');
    console.log('3. Asegúrate de que solo un usuario use cada número de WhatsApp\n');

    // Mostrar resumen
    console.log('📊 RESUMEN:\n');
    const activeConnections = connections.filter(c => c.isConnected && c.status === 'CONNECTED');
    const pendingQR = connections.filter(c => c.status === 'QR_PENDING');
    const disconnected = connections.filter(c => c.status === 'DISCONNECTED');

    console.log(`   Total de conexiones: ${connections.length}`);
    console.log(`   Activas: ${activeConnections.length}`);
    console.log(`   QR Pendiente: ${pendingQR.length}`);
    console.log(`   Desconectadas: ${disconnected.length}`);
    console.log(`   Conflictos: ${duplicates.length}\n`);

  } catch (error) {
    console.error('\n❌ Error detectando conflictos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
detectarConflictos()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
