import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function arreglarConexion() {
  console.log('🔧 ARREGLANDO CONEXIÓN DE WHATSAPP');
  console.log('='.repeat(70));

  // 1. Buscar usuario con conversaciones activas
  const usuarioConMensajes = await prisma.user.findFirst({
    where: {
      conversations: {
        some: {
          messages: {
            some: {}
          }
        }
      }
    },
    include: {
      whatsappConnection: true,
      _count: {
        select: {
          conversations: true
        }
      }
    }
  });

  if (!usuarioConMensajes) {
    console.log('❌ No se encontró usuario con mensajes');
    return;
  }

  console.log(`\n✅ Usuario encontrado: ${usuarioConMensajes.email}`);
  console.log(`   Conversaciones: ${usuarioConMensajes._count.conversations}`);
  
  // 2. Verificar si tiene WhatsAppConnection
  if (!usuarioConMensajes.whatsappConnection) {
    console.log('\n⚠️  No tiene WhatsAppConnection, creando...');
    
    await prisma.whatsAppConnection.create({
      data: {
        userId: usuarioConMensajes.id,
        phoneNumber: usuarioConMensajes.whatsappNumber || '573042748687',
        status: 'CONNECTED',
        isConnected: true,
        lastConnectedAt: new Date(),
        lastMessageAt: new Date(),
      }
    });
    
    console.log('✅ WhatsAppConnection creada');
  } else {
    console.log('\n🔄 Actualizando WhatsAppConnection...');
    console.log(`   Estado actual: ${usuarioConMensajes.whatsappConnection.status}`);
    console.log(`   isConnected: ${usuarioConMensajes.whatsappConnection.isConnected}`);
    
    // 3. Actualizar a CONNECTED
    await prisma.whatsAppConnection.update({
      where: {
        userId: usuarioConMensajes.id
      },
      data: {
        status: 'CONNECTED',
        isConnected: true,
        lastConnectedAt: new Date(),
        lastMessageAt: new Date(),
        lastError: null,
        lastErrorAt: null,
      }
    });
    
    console.log('✅ WhatsAppConnection actualizada a CONNECTED');
  }

  // 4. Verificar el resultado
  const verificacion = await prisma.whatsAppConnection.findUnique({
    where: {
      userId: usuarioConMensajes.id
    }
  });

  console.log('\n' + '='.repeat(70));
  console.log('📊 RESULTADO:');
  console.log('='.repeat(70));
  console.log(`\n✅ Usuario: ${usuarioConMensajes.email}`);
  console.log(`✅ Estado: ${verificacion?.status}`);
  console.log(`✅ Conectado: ${verificacion?.isConnected ? 'SÍ' : 'NO'}`);
  console.log(`✅ Número: ${verificacion?.phoneNumber}`);
  console.log(`✅ Última conexión: ${verificacion?.lastConnectedAt?.toLocaleString()}`);

  console.log('\n💡 PRÓXIMOS PASOS:');
  console.log('1. Reinicia el servidor: npm run dev');
  console.log('2. Verifica el dashboard: http://localhost:3000');
  console.log('3. Envía un mensaje de prueba al bot');

  await prisma.$disconnect();
}

arreglarConexion().catch(console.error);
