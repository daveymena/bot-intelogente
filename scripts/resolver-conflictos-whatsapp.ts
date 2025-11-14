import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resolverConflictos() {
  console.log('🔧 RESOLVIENDO CONFLICTOS DE WHATSAPP\n');
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

    // Detectar y resolver duplicados
    let conflictosResueltos = 0;
    let conexionesDesconectadas = 0;

    for (const [phoneNumber, conns] of phoneGroups.entries()) {
      if (conns.length <= 1) continue;

      console.log(`\n📱 Resolviendo conflicto para número: ${phoneNumber}`);
      console.log(`   Conexiones duplicadas: ${conns.length}`);

      // Ordenar por última conexión (más reciente primero)
      conns.sort((a, b) => {
        const dateA = a.lastConnectedAt?.getTime() || 0;
        const dateB = b.lastConnectedAt?.getTime() || 0;
        return dateB - dateA;
      });

      // Mantener solo la más reciente
      const [keepConnection, ...removeConnections] = conns;

      console.log(`   ✅ Manteniendo: ${keepConnection.user.email}`);
      console.log(`      - Última conexión: ${keepConnection.lastConnectedAt?.toLocaleString('es-CO') || 'Nunca'}`);

      // Desconectar las demás
      for (const conn of removeConnections) {
        console.log(`   ❌ Desconectando: ${conn.user.email}`);
        
        await prisma.whatsAppConnection.update({
          where: { id: conn.id },
          data: {
            status: 'DISCONNECTED',
            isConnected: false,
            lastError: 'Desconectado automáticamente por conflicto de número duplicado',
            lastErrorAt: new Date()
          }
        });

        conexionesDesconectadas++;
      }

      conflictosResueltos++;
      console.log(`   ✅ Conflicto resuelto\n`);
    }

    console.log('='.repeat(60));
    console.log('\n✅ RESOLUCIÓN COMPLETADA\n');
    console.log(`📊 Resumen:`);
    console.log(`   - Conflictos resueltos: ${conflictosResueltos}`);
    console.log(`   - Conexiones desconectadas: ${conexionesDesconectadas}`);
    console.log(`   - Conexiones mantenidas: ${conflictosResueltos}\n`);

    if (conflictosResueltos === 0) {
      console.log('✅ No se encontraron conflictos para resolver\n');
    } else {
      console.log('💡 Próximos pasos:');
      console.log('   1. Los usuarios desconectados deberán escanear el QR nuevamente');
      console.log('   2. Asegúrate de que cada usuario use un número diferente');
      console.log('   3. Verifica el estado con: npx tsx scripts/detectar-conflictos-whatsapp.ts\n');
    }

  } catch (error) {
    console.error('\n❌ Error resolviendo conflictos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
resolverConflictos()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
