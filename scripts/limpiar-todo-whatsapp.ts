import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function limpiarTodoWhatsApp() {
  console.log('🧹 LIMPIEZA COMPLETA DE WHATSAPP Y USUARIOS\n');
  console.log('='.repeat(50));

  try {
    // 1. Eliminar todas las conexiones de WhatsApp
    console.log('\n📱 Eliminando conexiones de WhatsApp...');
    const deletedConnections = await prisma.whatsAppConnection.deleteMany({});
    console.log(`✅ ${deletedConnections.count} conexiones eliminadas`);

    // 2. Eliminar todos los mensajes en cola
    console.log('\n📨 Eliminando mensajes en cola...');
    const deletedQueue = await prisma.messageQueue.deleteMany({});
    console.log(`✅ ${deletedQueue.count} mensajes en cola eliminados`);

    // 3. Eliminar todas las conversaciones y mensajes
    console.log('\n💬 Eliminando conversaciones y mensajes...');
    const deletedMessages = await prisma.message.deleteMany({});
    console.log(`✅ ${deletedMessages.count} mensajes eliminados`);
    
    const deletedConversations = await prisma.conversation.deleteMany({});
    console.log(`✅ ${deletedConversations.count} conversaciones eliminadas`);

    // 4. Eliminar todas las sesiones
    console.log('\n🔐 Eliminando sesiones...');
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`✅ ${deletedSessions.count} sesiones eliminadas`);

    // 5. Eliminar todos los usuarios (excepto admin si existe)
    console.log('\n👥 Eliminando usuarios...');
    const adminEmail = 'daveymena16@gmail.com';
    
    // Primero obtener el admin
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (admin) {
      // Eliminar todos excepto admin
      const deletedUsers = await prisma.user.deleteMany({
        where: {
          email: {
            not: adminEmail
          }
        }
      });
      console.log(`✅ ${deletedUsers.count} usuarios eliminados (admin preservado)`);
    } else {
      // Eliminar todos
      const deletedUsers = await prisma.user.deleteMany({});
      console.log(`✅ ${deletedUsers.count} usuarios eliminados`);
    }

    // 6. Limpiar archivos de sesión de WhatsApp
    console.log('\n📁 Limpiando archivos de sesión...');
    const authSessionsDir = path.join(process.cwd(), 'auth_sessions');
    
    if (fs.existsSync(authSessionsDir)) {
      const files = fs.readdirSync(authSessionsDir);
      let deletedFiles = 0;
      
      for (const file of files) {
        const filePath = path.join(authSessionsDir, file);
        if (fs.statSync(filePath).isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
          deletedFiles++;
        } else if (file !== '.gitkeep') {
          fs.unlinkSync(filePath);
          deletedFiles++;
        }
      }
      
      console.log(`✅ ${deletedFiles} archivos/carpetas de sesión eliminados`);
    } else {
      console.log('⚠️  Carpeta auth_sessions no existe');
    }

    // 7. Limpiar carpeta test_session si existe
    console.log('\n📁 Limpiando carpeta test_session...');
    const testSessionDir = path.join(process.cwd(), 'test_session');
    
    if (fs.existsSync(testSessionDir)) {
      fs.rmSync(testSessionDir, { recursive: true, force: true });
      console.log('✅ Carpeta test_session eliminada');
    } else {
      console.log('⚠️  Carpeta test_session no existe');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ LIMPIEZA COMPLETA EXITOSA\n');
    console.log('📋 Resumen:');
    console.log('   - Base de datos limpia');
    console.log('   - Archivos de sesión eliminados');
    console.log('   - Sistema listo para empezar desde cero');
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Reinicia el servidor: npm run dev');
    console.log('   2. Escanea el código QR nuevamente');
    console.log('   3. Registra tu número de WhatsApp\n');

  } catch (error) {
    console.error('\n❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
limpiarTodoWhatsApp()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
