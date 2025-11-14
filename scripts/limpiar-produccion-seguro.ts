import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Detectar si estamos en producción
const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.DATABASE_URL?.includes('easypanel') ||
                     process.env.DATABASE_URL?.includes('railway') ||
                     process.env.DATABASE_URL?.includes('render');

// Crear interfaz para input del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pregunta(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function limpiarProduccionSeguro() {
  console.log('🧹 LIMPIEZA DE WHATSAPP Y USUARIOS\n');
  console.log('='.repeat(60));
  
  // Detectar ambiente
  if (isProduction) {
    console.log('\n⚠️  ADVERTENCIA: DETECTADO AMBIENTE DE PRODUCCIÓN');
    console.log('🌐 Base de datos: PRODUCCIÓN (Easypanel/Railway/Render)');
  } else {
    console.log('\n💻 Ambiente: DESARROLLO (Local)');
  }
  
  console.log('\n📊 Esta operación eliminará:');
  console.log('   ❌ Todas las conexiones de WhatsApp');
  console.log('   ❌ Todos los usuarios (excepto admin)');
  console.log('   ❌ Todas las conversaciones');
  console.log('   ❌ Todos los mensajes');
  console.log('   ❌ Todas las sesiones');
  console.log('   ❌ Archivos de sesión (solo en local)');
  
  console.log('\n✅ Se preservará:');
  console.log('   ✅ Usuario admin (daveymena16@gmail.com)');
  console.log('   ✅ Todos los productos');
  console.log('   ✅ Configuración del bot');
  
  console.log('\n' + '='.repeat(60));

  try {
    // Mostrar estado actual
    const users = await prisma.user.count();
    const connections = await prisma.whatsAppConnection.count();
    const conversations = await prisma.conversation.count();
    const messages = await prisma.message.count();
    
    console.log('\n📊 Estado actual de la base de datos:');
    console.log(`   👥 Usuarios: ${users}`);
    console.log(`   📱 Conexiones WhatsApp: ${connections}`);
    console.log(`   💬 Conversaciones: ${conversations}`);
    console.log(`   📨 Mensajes: ${messages}`);
    
    // Pedir confirmación
    console.log('\n' + '='.repeat(60));
    const respuesta1 = await pregunta('\n¿Estás seguro de que quieres continuar? (escribe "SI" para confirmar): ');
    
    if (respuesta1.toUpperCase() !== 'SI') {
      console.log('\n❌ Operación cancelada por el usuario');
      rl.close();
      await prisma.$disconnect();
      process.exit(0);
    }
    
    // Segunda confirmación para producción
    if (isProduction) {
      console.log('\n⚠️  ÚLTIMA ADVERTENCIA: Estás en PRODUCCIÓN');
      const respuesta2 = await pregunta('Escribe "CONFIRMAR PRODUCCION" para continuar: ');
      
      if (respuesta2 !== 'CONFIRMAR PRODUCCION') {
        console.log('\n❌ Operación cancelada - confirmación incorrecta');
        rl.close();
        await prisma.$disconnect();
        process.exit(0);
      }
    }
    
    rl.close();
    
    console.log('\n' + '='.repeat(60));
    console.log('🚀 Iniciando limpieza...\n');
    
    // 1. Eliminar conexiones de WhatsApp
    console.log('📱 Eliminando conexiones de WhatsApp...');
    const deletedConnections = await prisma.whatsAppConnection.deleteMany({});
    console.log(`✅ ${deletedConnections.count} conexiones eliminadas`);
    
    // 2. Eliminar mensajes en cola
    console.log('\n📨 Eliminando mensajes en cola...');
    const deletedQueue = await prisma.messageQueue.deleteMany({});
    console.log(`✅ ${deletedQueue.count} mensajes en cola eliminados`);
    
    // 3. Eliminar mensajes
    console.log('\n💬 Eliminando mensajes...');
    const deletedMessages = await prisma.message.deleteMany({});
    console.log(`✅ ${deletedMessages.count} mensajes eliminados`);
    
    // 4. Eliminar conversaciones
    console.log('\n💬 Eliminando conversaciones...');
    const deletedConversations = await prisma.conversation.deleteMany({});
    console.log(`✅ ${deletedConversations.count} conversaciones eliminadas`);
    
    // 5. Eliminar sesiones
    console.log('\n🔐 Eliminando sesiones...');
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`✅ ${deletedSessions.count} sesiones eliminadas`);
    
    // 6. Eliminar usuarios (excepto admin)
    console.log('\n👥 Eliminando usuarios...');
    const adminEmail = 'daveymena16@gmail.com';
    
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (admin) {
      const deletedUsers = await prisma.user.deleteMany({
        where: {
          email: { not: adminEmail }
        }
      });
      console.log(`✅ ${deletedUsers.count} usuarios eliminados (admin preservado)`);
    } else {
      const deletedUsers = await prisma.user.deleteMany({});
      console.log(`✅ ${deletedUsers.count} usuarios eliminados`);
      console.log('⚠️  ADVERTENCIA: No se encontró el usuario admin');
    }
    
    // 7. Limpiar archivos (solo en local)
    if (!isProduction) {
      console.log('\n📁 Limpiando archivos de sesión locales...');
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
        
        console.log(`✅ ${deletedFiles} archivos/carpetas eliminados`);
      }
      
      const testSessionDir = path.join(process.cwd(), 'test_session');
      if (fs.existsSync(testSessionDir)) {
        fs.rmSync(testSessionDir, { recursive: true, force: true });
        console.log('✅ Carpeta test_session eliminada');
      }
    } else {
      console.log('\n📁 Archivos de sesión (solo se limpian en local)');
      console.log('ℹ️  En producción, los archivos de sesión se manejan automáticamente');
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('✅ LIMPIEZA COMPLETADA EXITOSAMENTE\n');
    
    console.log('📊 Resumen:');
    console.log(`   - Conexiones eliminadas: ${deletedConnections.count}`);
    console.log(`   - Mensajes eliminados: ${deletedMessages.count}`);
    console.log(`   - Conversaciones eliminadas: ${deletedConversations.count}`);
    console.log(`   - Sesiones eliminadas: ${deletedSessions.count}`);
    
    console.log('\n💡 Próximos pasos:');
    if (isProduction) {
      console.log('   1. Reinicia la aplicación en Easypanel');
      console.log('   2. Accede a tu dashboard de producción');
      console.log('   3. Conecta WhatsApp y escanea el QR');
    } else {
      console.log('   1. Reinicia el servidor: npm run dev');
      console.log('   2. Accede al dashboard: http://localhost:3000');
      console.log('   3. Conecta WhatsApp y escanea el QR');
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
limpiarProduccionSeguro()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
