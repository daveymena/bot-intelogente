/**
 * Script para probar generación de QR por consola
 * Ejecutar en Easypanel para diagnosticar problemas de conexión
 */

import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  Browsers
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import QRCode from 'qrcode'
import path from 'path'
import fs from 'fs'

async function testQRGeneration() {
  console.log('='.repeat(60))
  console.log('🧪 TEST DE GENERACIÓN DE QR POR CONSOLA')
  console.log('='.repeat(60))
  console.log('')

  try {
    // 1. Verificar directorio de sesiones
    const authDir = path.join(process.cwd(), 'auth_sessions', 'test-console')
    console.log(`📁 Directorio de sesión: ${authDir}`)
    
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true })
      console.log('✅ Directorio creado')
    } else {
      console.log('✅ Directorio existe')
    }
    console.log('')

    // 2. Cargar estado de autenticación
    console.log('🔐 Cargando estado de autenticación...')
    const { state, saveCreds } = await useMultiFileAuthState(authDir)
    console.log('✅ Estado cargado')
    console.log('')

    // 3. Crear logger visible
    const logger = {
      level: 'info' as const,
      fatal: (msg: any) => console.log('💀 FATAL:', msg),
      error: (msg: any) => console.log('❌ ERROR:', msg),
      warn: (msg: any) => console.log('⚠️  WARN:', msg),
      info: (msg: any) => console.log('ℹ️  INFO:', msg),
      debug: (msg: any) => console.log('🐛 DEBUG:', msg),
      trace: (msg: any) => console.log('🔍 TRACE:', msg),
      child: () => logger
    }

    // 4. Crear socket
    console.log('🔌 Creando socket de WhatsApp...')
    const socket = makeWASocket({
      auth: state,
      browser: Browsers.ubuntu('Chrome'),
      logger: logger,
      printQRInTerminal: true, // ✅ ACTIVAR IMPRESIÓN EN TERMINAL
      syncFullHistory: false,
      markOnlineOnConnect: false
    })
    console.log('✅ Socket creado')
    console.log('')

    // 5. Escuchar eventos
    console.log('👂 Escuchando eventos de conexión...')
    console.log('')

    let qrGenerated = false
    let connected = false

    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update

      console.log('📡 UPDATE:', {
        connection,
        hasQr: !!qr,
        hasDisconnect: !!lastDisconnect
      })

      // QR generado
      if (qr && !qrGenerated) {
        qrGenerated = true
        console.log('')
        console.log('='.repeat(60))
        console.log('✅ QR GENERADO EXITOSAMENTE')
        console.log('='.repeat(60))
        console.log('')
        
        try {
          // Generar QR en terminal (ASCII)
          const qrTerminal = await QRCode.toString(qr, { 
            type: 'terminal', 
            small: true 
          })
          console.log('📱 ESCANEA ESTE QR CON WHATSAPP:')
          console.log('')
          console.log(qrTerminal)
          console.log('')
          
          // Generar QR como data URL
          const qrDataURL = await QRCode.toDataURL(qr, {
            width: 300,
            margin: 2
          })
          console.log('🔗 QR Data URL generado (primeros 100 caracteres):')
          console.log(qrDataURL.substring(0, 100) + '...')
          console.log('')
          
          console.log('✅ QR listo para escanear')
          console.log('⏳ Esperando escaneo (60 segundos)...')
          console.log('')
        } catch (error) {
          console.error('❌ Error generando QR:', error)
        }
      }

      // Conexión establecida
      if (connection === 'open' && !connected) {
        connected = true
        console.log('')
        console.log('='.repeat(60))
        console.log('✅ CONEXIÓN ESTABLECIDA')
        console.log('='.repeat(60))
        console.log('')
        
        const phoneNumber = socket.user?.id.split(':')[0] || 'unknown'
        console.log(`📱 Número conectado: ${phoneNumber}`)
        console.log('')
        
        console.log('✅ TEST EXITOSO - WhatsApp conectado correctamente')
        console.log('')
        
        // Desconectar después de 5 segundos
        setTimeout(async () => {
          console.log('🔌 Desconectando...')
          await socket.logout()
          process.exit(0)
        }, 5000)
      }

      // Conexión cerrada
      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
        const reason = lastDisconnect?.error?.message || 'unknown'
        
        console.log('')
        console.log('='.repeat(60))
        console.log('❌ CONEXIÓN CERRADA')
        console.log('='.repeat(60))
        console.log(`Código: ${statusCode}`)
        console.log(`Razón: ${reason}`)
        console.log('')
        
        if (statusCode === DisconnectReason.loggedOut) {
          console.log('🔓 Sesión cerrada (logout)')
        } else if (statusCode === DisconnectReason.timedOut) {
          console.log('⏱️  Timeout - QR no escaneado a tiempo')
        } else {
          console.log('🔄 Desconexión inesperada')
        }
        
        process.exit(statusCode === DisconnectReason.loggedOut ? 0 : 1)
      }
    })

    // Guardar credenciales
    socket.ev.on('creds.update', saveCreds)

    // Timeout de 90 segundos
    setTimeout(() => {
      if (!connected) {
        console.log('')
        console.log('⏱️  TIMEOUT - No se conectó en 90 segundos')
        console.log('')
        
        if (qrGenerated) {
          console.log('✅ QR fue generado correctamente')
          console.log('❌ Pero no fue escaneado a tiempo')
        } else {
          console.log('❌ QR nunca fue generado')
          console.log('⚠️  Posible problema con Baileys o red')
        }
        
        process.exit(1)
      }
    }, 90000)

  } catch (error) {
    console.error('')
    console.error('='.repeat(60))
    console.error('❌ ERROR CRÍTICO')
    console.error('='.repeat(60))
    console.error(error)
    console.error('')
    process.exit(1)
  }
}

// Ejecutar test
console.log('')
testQRGeneration().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
