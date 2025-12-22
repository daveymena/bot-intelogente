// Script para diagnosticar por qué las métricas aparecen en cero

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnosticarMetricas() {
  console.log('🔍 DIAGNÓSTICO DE MÉTRICAS\n');
  console.log('='.repeat(50));

  try {
    // 1. Verificar usuarios
    console.log('\n📊 1. USUARIOS EN LA BASE DE DATOS:');
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });
    console.log(`Total usuarios: ${usuarios.length}`);
    usuarios.forEach(u => {
      console.log(`  - ${u.email} (${u.name || 'Sin nombre'}) - ID: ${u.id}`);
    });

    if (usuarios.length === 0) {
      console.log('\n⚠️  NO HAY USUARIOS EN LA BASE DE DATOS');
      console.log('   Necesitas crear un usuario primero');
      return;
    }

    // Usar el primer usuario para las pruebas
    const userId = usuarios[0].id;
    console.log(`\n✅ Usando usuario: ${usuarios[0].email} (ID: ${userId})`);

    // 2. Verificar conversaciones
    console.log('\n📊 2. CONVERSACIONES:');
    const conversaciones = await prisma.conversation.findMany({
      where: { userId },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });
    console.log(`Total conversaciones: ${conversaciones.length}`);
    conversaciones.forEach(c => {
      console.log(`  - ${c.customerPhone} (${c.customerName || 'Sin nombre'}) - ${c._count.messages} mensajes`);
    });

    // 3. Verificar productos
    console.log('\n📊 3. PRODUCTOS:');
    const productos = await prisma.product.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        price: true,
        category: true
      }
    });
    console.log(`Total productos: ${productos.length}`);
    productos.slice(0, 5).forEach(p => {
      console.log(`  - ${p.name} - $${p.price} (${p.category})`);
    });
    if (productos.length > 5) {
      console.log(`  ... y ${productos.length - 5} más`);
    }

    // 4. Verificar clientes únicos
    console.log('\n📊 4. CLIENTES ÚNICOS:');
    const clientesUnicos = await prisma.conversation.groupBy({
      by: ['customerPhone'],
      where: { userId }
    });
    console.log(`Total clientes únicos: ${clientesUnicos.length}`);

    // 5. Verificar mensajes
    console.log('\n📊 5. MENSAJES:');
    const totalMensajes = await prisma.message.count({
      where: {
        conversation: {
          userId
        }
      }
    });
    console.log(`Total mensajes: ${totalMensajes}`);

    // 6. Verificar conversaciones activas (últimas 24h)
    console.log('\n📊 6. CONVERSACIONES ACTIVAS (24h):');
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const conversacionesActivas = await prisma.conversation.count({
      where: {
        userId,
        status: 'ACTIVE',
        lastMessageAt: {
          gte: hace24h
        }
      }
    });
    console.log(`Conversaciones activas: ${conversacionesActivas}`);

    // 7. Verificar conexión de WhatsApp
    console.log('\n📊 7. CONEXIÓN DE WHATSAPP:');
    const whatsappConnection = await prisma.whatsAppConnection.findUnique({
      where: { userId }
    });
    if (whatsappConnection) {
      console.log(`Estado: ${whatsappConnection.status}`);
      console.log(`Conectado: ${whatsappConnection.isConnected ? 'SÍ' : 'NO'}`);
      console.log(`Teléfono: ${whatsappConnection.phoneNumber || 'No configurado'}`);
      console.log(`Última conexión: ${whatsappConnection.lastConnectedAt || 'Nunca'}`);
    } else {
      console.log('⚠️  No hay conexión de WhatsApp configurada');
    }

    // RESUMEN
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE MÉTRICAS:');
    console.log('='.repeat(50));
    console.log(`Conversaciones: ${conversaciones.length}`);
    console.log(`Productos: ${productos.length}`);
    console.log(`Clientes: ${clientesUnicos.length}`);
    console.log(`Mensajes: ${totalMensajes}`);
    console.log(`Activas (24h): ${conversacionesActivas}`);
    console.log(`Bot: ${whatsappConnection?.isConnected ? 'ACTIVO' : 'INACTIVO'}`);
    console.log('='.repeat(50));

    // Verificar si hay datos
    if (conversaciones.length === 0 && productos.length === 0) {
      console.log('\n⚠️  LA BASE DE DATOS ESTÁ VACÍA');
      console.log('   Necesitas:');
      console.log('   1. Agregar productos desde el dashboard');
      console.log('   2. Conectar WhatsApp');
      console.log('   3. Iniciar conversaciones con clientes');
    } else {
      console.log('\n✅ HAY DATOS EN LA BASE DE DATOS');
      console.log('   El problema puede ser:');
      console.log('   1. Autenticación de NextAuth no funciona');
      console.log('   2. El usuario del dashboard es diferente');
      console.log('   3. Error en el endpoint de stats');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar diagnóstico
diagnosticarMetricas();
