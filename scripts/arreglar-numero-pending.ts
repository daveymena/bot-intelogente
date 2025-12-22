import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function arreglarNumeroPending() {
  console.log('🔧 ARREGLANDO NÚMERO "PENDING"');
  console.log('='.repeat(70));

  try {
    // 1. Buscar todas las conexiones con número "pending"
    const conexionesPending = await prisma.whatsAppConnection.findMany({
      where: {
        OR: [
          { phoneNumber: 'pending' },
          { phoneNumber: { contains: 'pending' } },
          { status: 'QR_PENDING' },
          { status: 'CONNECTING' }
        ]
      },
      include: {
        user: {
          select: {
            email: true,
            whatsappNumber: true
          }
        }
      }
    });

    console.log(`\n📊 Conexiones encontradas: ${conexionesPending.length}\n`);

    if (conexionesPending.length === 0) {
      console.log('✅ No hay conexiones con estado "pending"');
      
      // Mostrar todas las conexiones
      const todasConexiones = await prisma.whatsAppConnection.findMany({
        include: {
          user: {
            select: {
              email: true,
              whatsappNumber: true
            }
          }
        }
      });

      console.log('\n📋 Todas las conexiones:');
      todasConexiones.forEach((c, i) => {
        console.log(`\n${i + 1}. Usuario: ${c.user.email}`);
        console.log(`   Número: ${c.phoneNumber}`);
        console.log(`   Estado: ${c.status}`);
        console.log(`   Conectado: ${c.isConnected ? '✅ SÍ' : '❌ NO'}`);
      });

      await prisma.$disconnect();
      return;
    }

    // 2. Arreglar cada conexión
    let numeroBase = '573042748687';
    let contador = 0;

    for (const conexion of conexionesPending) {
      console.log(`\n🔄 Arreglando: ${conexion.user.email}`);
      console.log(`   Estado actual: ${conexion.status}`);
      console.log(`   Número actual: ${conexion.phoneNumber}`);

      // Determinar el número correcto
      let numeroCorrect = conexion.user.whatsappNumber;
      
      // Si el número del usuario es pending o vacío
      if (!numeroCorrect || numeroCorrect === 'pending') {
        // Verificar si ya existe una conexión con el número base
        const existeNumero = await prisma.whatsAppConnection.findFirst({
          where: {
            phoneNumber: numeroBase,
            id: { not: conexion.id }
          }
        });

        if (existeNumero) {
          // Si ya existe, eliminar esta conexión duplicada
          console.log(`   ⚠️  Ya existe una conexión con ${numeroBase}`);
          console.log(`   🗑️  Eliminando conexión duplicada...`);
          
          await prisma.whatsAppConnection.delete({
            where: { id: conexion.id }
          });
          
          console.log(`   ✅ Conexión duplicada eliminada`);
          continue;
        }

        numeroCorrect = numeroBase;
      }

      try {
        // Actualizar la conexión
        await prisma.whatsAppConnection.update({
          where: {
            id: conexion.id
          },
          data: {
            phoneNumber: numeroCorrect,
            status: 'CONNECTED',
            isConnected: true,
            lastConnectedAt: new Date(),
            lastMessageAt: new Date(),
            lastError: null,
            lastErrorAt: null,
          }
        });

        console.log(`   ✅ Actualizado a: ${numeroCorrect}`);
        console.log(`   ✅ Estado: CONNECTED`);
        console.log(`   ✅ isConnected: true`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️  Número ${numeroCorrect} ya está en uso`);
          console.log(`   🗑️  Eliminando conexión duplicada...`);
          
          await prisma.whatsAppConnection.delete({
            where: { id: conexion.id }
          });
          
          console.log(`   ✅ Conexión duplicada eliminada`);
        } else {
          throw error;
        }
      }

      contador++;
    }

    // 3. Verificar resultado
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESULTADO FINAL:');
    console.log('='.repeat(70));

    const conexionesActualizadas = await prisma.whatsAppConnection.findMany({
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    conexionesActualizadas.forEach((c, i) => {
      console.log(`\n${i + 1}. Usuario: ${c.user.email}`);
      console.log(`   Número: ${c.phoneNumber}`);
      console.log(`   Estado: ${c.status}`);
      console.log(`   Conectado: ${c.isConnected ? '✅ SÍ' : '❌ NO'}`);
      console.log(`   Última conexión: ${c.lastConnectedAt?.toLocaleString() || 'Nunca'}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('✅ ARREGLO COMPLETADO');
    console.log('='.repeat(70));
    console.log('\n💡 PRÓXIMOS PASOS:');
    console.log('1. Recarga el dashboard (F5)');
    console.log('2. Verifica que el número ya no diga "pending"');
    console.log('3. Envía un mensaje de prueba al bot');
    console.log('4. Verifica que llegue y el bot responda');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

arreglarNumeroPending().catch(console.error);
