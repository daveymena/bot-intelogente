import { Client, LocalAuth } from 'whatsapp-web.js'
import QRCode from 'qrcode'
import path from 'path'
import fs from 'fs'

async function testWhatsApp() {
  console.log('🧪 TEST DIRECTO DE WHATSAPP WEB.JS')
  console.log('=' .repeat(70))

  try {
    const userId = 'test-' + Date.now()
    const authDir = path.join(process.cwd(), 'whatsapp-sessions', userId)

    console.log('\n1️⃣ Creando directorio de sesión...')
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true })
    }
    console.log(`   ✅ Directorio: ${authDir}`)

    console.log('\n2️⃣ Inicializando cliente de WhatsApp...')
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: userId,
        dataPath: authDir
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    })

    console.log('   ✅ Cliente creado')

    let qrReceived = false
    let readyReceived = false

    // Manejar QR
    client.on('qr', async (qr) => {
      console.log('\n3️⃣ ✅ QR RECIBIDO!')
      qrReceived = true

      try {
        const qrDataURL = await QRCode.toDataURL(qr, {
          width: 300,
          margin: 2
        })

        console.log('   ✅ QR generado como Data URL')
        console.log('   📏 Longitud:', qrDataURL.length)
        console.log('   🔗 Primeros 50 caracteres:', qrDataURL.substring(0, 50))

        // Guardar QR como imagen
        const qrPath = path.join(process.cwd(), 'test-qr.png')
        await QRCode.toFile(qrPath, qr)
        console.log(`   💾 QR guardado en: ${qrPath}`)
        console.log('\n   📱 Escanea el QR con tu teléfono para probar')

      } catch (error) {
        console.error('   ❌ Error generando QR:', error)
      }
    })

    // Manejar conexión exitosa
    client.on('ready', () => {
      console.log('\n4️⃣ ✅ CONEXIÓN EXITOSA!')
      readyReceived = true
      const info = client.info
      console.log(`   📱 Número: ${info.wid.user}`)
      console.log(`   👤 Nombre: ${info.pushname}`)
      
      console.log('\n✅ TEST EXITOSO - WhatsApp Web.js funciona correctamente')
      console.log('💡 El problema NO es la librería, es la configuración del servidor')
      
      setTimeout(() => {
        client.destroy()
        process.exit(0)
      }, 2000)
    })

    // Manejar errores
    client.on('auth_failure', (msg) => {
      console.error('\n❌ Error de autenticación:', msg)
      process.exit(1)
    })

    client.on('disconnected', (reason) => {
      console.log('\n⚠️ Desconectado:', reason)
      if (!readyReceived) {
        process.exit(1)
      }
    })

    console.log('\n⏳ Inicializando cliente...')
    console.log('   (Esto puede tomar 10-30 segundos)')
    
    await client.initialize()

    // Timeout de 60 segundos
    setTimeout(() => {
      if (!qrReceived) {
        console.log('\n❌ TIMEOUT - No se recibió QR en 60 segundos')
        console.log('\n💡 Posibles causas:')
        console.log('   1. Puppeteer no puede iniciar Chrome')
        console.log('   2. Problemas de red/firewall')
        console.log('   3. WhatsApp Web está bloqueado')
        console.log('   4. Falta alguna dependencia del sistema')
        
        client.destroy()
        process.exit(1)
      }
    }, 60000)

  } catch (error) {
    console.error('\n❌ ERROR EN TEST:', error)
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message)
      console.error('   Stack:', error.stack)
    }
    process.exit(1)
  }
}

console.log('🚀 Iniciando test de WhatsApp Web.js...\n')
testWhatsApp()
