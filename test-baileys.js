// Script de prueba rápida para Baileys
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const QRCode = require('qrcode')
const path = require('path')

async function testBaileys() {
  console.log('🚀 Iniciando prueba de Baileys...\n')

  try {
    // Crear directorio de sesión de prueba
    const authDir = path.join(__dirname, 'test_session')
    
    console.log('📁 Cargando estado de autenticación...')
    const { state, saveCreds } = await useMultiFileAuthState(authDir)

    console.log('🔌 Creando socket de WhatsApp...')
    const socket = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      browser: ['WhatsApp Bot Test', 'Chrome', '1.0.0']
    })

    // Manejar eventos de conexión
    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        console.log('\n📱 ¡QR GENERADO!')
        console.log('Escanea este código con WhatsApp:\n')
        
        // Generar QR en terminal
        const qrTerminal = await QRCode.toString(qr, { type: 'terminal', small: true })
        console.log(qrTerminal)
        
        console.log('\n✅ El QR también se guardó como imagen en test-qr.png')
        await QRCode.toFile('test-qr.png', qr, {
          width: 300,
          color: {
            dark: '#25D366',
            light: '#FFFFFF'
          }
        })
      }

      if (connection === 'open') {
        console.log('\n✅ ¡CONEXIÓN EXITOSA!')
        console.log('WhatsApp conectado correctamente')
        console.log('Usuario:', socket.user?.id)
        console.log('\n🎉 Baileys está funcionando perfectamente!')
        console.log('\nPresiona Ctrl+C para salir')
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
        console.log('\n❌ Conexión cerrada')
        console.log('Reconectar:', shouldReconnect)
        
        if (shouldReconnect) {
          console.log('Intentando reconectar en 3 segundos...')
          setTimeout(() => testBaileys(), 3000)
        } else {
          console.log('Sesión cerrada. Ejecuta el script de nuevo para generar un nuevo QR.')
          process.exit(0)
        }
      }
    })

    // Guardar credenciales cuando cambien
    socket.ev.on('creds.update', saveCreds)

    // Manejar mensajes entrantes
    socket.ev.on('messages.upsert', ({ messages }) => {
      for (const msg of messages) {
        if (!msg.key.fromMe && msg.message) {
          const from = msg.key.remoteJid
          const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
          console.log(`\n📨 Mensaje recibido de ${from}:`)
          console.log(`   "${text}"`)
        }
      }
    })

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('\nDetalles:', error)
    process.exit(1)
  }
}

console.log('═══════════════════════════════════════════')
console.log('   PRUEBA DE BAILEYS - WHATSAPP BOT')
console.log('═══════════════════════════════════════════\n')

testBaileys()
