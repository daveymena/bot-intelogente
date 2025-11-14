import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function verificarLimpieza() {
  console.log('🔍 VERIFICANDO LIMPIEZA DEL SISTEMA\n');
  console.log('='.repeat(50));

  try {
    // Verificar usuarios
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        whatsappNumber: true,
        role: true
      }
    });
    console.log(`\n👥 Usuarios en el sistema: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) ${user.whatsappNumber ? `- WhatsApp: ${user.whatsappNumber}` : ''}`);
    });

    // Verificar conexiones de WhatsApp
    const connections = await prisma.whatsAppConnection.findMany({
      select: {
        id: true,
        phoneNumber: true,
        status: true,
        userId: true
      }
    });
    console.log(`\n📱 Conexiones de WhatsApp: ${connections.length}`);
    if (connections.length > 0) {
      connections.forEach(conn => {
        console.log(`   - ${conn.phoneNumber} (${conn.status})`);
      });
    }

    // Verificar conversaciones
    const conversations = await prisma.conversation.count();
    console.log(`\n💬 Conversaciones: ${conversations}`);

    // Verificar mensajes
    const messages = await prisma.message.count();
    console.log(`📨 Mensajes: ${messages}`);

    // Verificar cola de mensajes
    const queuedMessages = await prisma.messageQueue.count();
    console.log(`📬 Mensajes en cola: ${queuedMessages}`);

    // Verificar sesiones
    const sessions = await prisma.session.count();
    console.log(`🔐 Sesiones activas: ${sessions}`);

    // Verificar archivos de sesión
    const authSessionsDir = path.join(process.cwd(), 'auth_sessions');
    let sessionFiles = 0;
    
    if (fs.existsSync(authSessionsDir)) {
      const files = fs.readdirSync(authSessionsDir);
      sessionFiles = files.filter(f => f !== '.gitkeep').length;
    }
    console.log(`📁 Archivos de sesión: ${sessionFiles}`);

    // Verificar carpeta test_session
    const testSessionDir = path.join(process.cwd(), 'test_session');
    const testSessionExists = fs.existsSync(testSessionDir);
    console.log(`📁 Carpeta test_session: ${testSessionExists ? 'Existe' : 'No existe'}`);

    console.log('\n' + '='.repeat(50));
    
    if (connections.length === 0 && conversations === 0 && messages === 0 && sessionFiles === 0) {
      console.log('✅ SISTEMA COMPLETAMENTE LIMPIO');
      console.log('\n💡 El sistema está listo para empezar desde cero');
    } else {
      console.log('⚠️  ADVERTENCIA: Aún hay datos en el sistema');
      console.log('\n💡 Considera ejecutar la limpieza nuevamente');
    }

  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
verificarLimpieza()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
