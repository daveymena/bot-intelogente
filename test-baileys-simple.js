/**
 * 🧪 TEST SIMPLE DE BAILEYS
 * Prueba rápida de conexión con Baileys
 */

const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando test de Baileys...\n');

async function testBaileys() {
  try {
    // Crear directorio para sesiones
    const authDir = path.join(__dirname, 'auth_sessions', 'test');
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    console.log('📁 Directorio de sesión:', authDir);
    console.log('');

    // Cargar estado de autenticación
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    console.log('✅ Estado de autenticación cargado');
    console.log('');

    // Crear socket de WhatsApp
    const socket = makeWASocket({
      auth: state,
      printQRInTerminal: true, // Mostrar QR en terminal
    });

    console.log('✅ Socket creado');
    console.log('');

    // Guardar credenciales cuando cambien
    socket.ev.on('creds.update', saveCreds);

    // Manejar actualización de conexión
    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('📱 QR GENERADO - Escanea con tu WhatsApp');
        console.log('');
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error instanceof Boom)
          ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
          : true;

        console.log('🔌 Conexión cerrada');
        console.log('¿Reconectar?', shouldReconnect);
        console.log('');

        if (shouldReconnect) {
          console.log('🔄 Reconectando...');
          testBaileys();
        }
      } else if (connection === 'open') {
        console.log('✅ CONEXIÓN ESTABLECIDA');
        console.log('📱 Número:', socket.user?.id);
        console.log('');
        console.log('🎉 ¡Baileys funciona correctamente!');
        console.log('');
        console.log('Presiona Ctrl+C para salir');
      }
    });

    // Manejar mensajes entrantes
    socket.ev.on('messages.upsert', async ({ messages }) => {
      const message = messages[0];
      if (!message.message || message.key.fromMe) return;

      const from = message.key.remoteJid;
      const text = message.message.conversation || 
                   message.message.extendedTextMessage?.text || '';

      console.log('📨 Mensaje recibido:');
      console.log('   De:', from);
      console.log('   Texto:', text);
      console.log('');

      // Responder automáticamente
      if (text.toLowerCase().includes('hola')) {
        await socket.sendMessage(from, { 
          text: '¡Hola! 👋 Soy un bot de prueba con Baileys. ¿En qué puedo ayudarte?' 
        });
        console.log('✅ Respuesta enviada');
        console.log('');
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Iniciar test
testBaileys();
