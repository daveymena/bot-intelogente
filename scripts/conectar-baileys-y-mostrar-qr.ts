import { BaileysStableService } from '../src/lib/baileys-stable-service'
import { db } from '../src/lib/db'

async function conectarYMostrarQR() {
  console.log('🚀 CONECTANDO WHATSAPP CON BAILEYS')
  console.log('=' .repeat(70))

  try {
    // Obtener usuario
    const usuario = await db.user.findFirst({
      where: { email: 'daveymena16@gmail.com' }
    })

    if (!usuario) {
      console.log('❌ Usuario no encontrado')
      return
    }

    console.log(`✅ Usuario: ${usuario.email}`)
    console.log(`   ID: ${usuario.id}\n`)

    // Inicializar conexión
    console.log('📱 Inicializando Baileys...')
    const result = await BaileysStableService.initializeConnection(usuario.id)

    if (!result.success) {
      console.log(`❌ Error: ${result.error}`)
      return
    }

    console.log('✅ Baileys inicializado\n')
    console.log('⏳ Esperando QR...\n')
    console.log('💡 El QR se generará en unos segundos')
    console.log('   Abre http://localhost:3000 para verlo\n')

    // Monitorear estado y mostrar QR cuando esté disponible
    let qrMostrado = false
    const intervalo = setInterval(async () => {
      const conexion = await db.whatsAppConnection.findUnique({
        where: { userId: usuario.id }
      })

      if (conexion) {
        const status = BaileysStableService.getConnectionStatus(usuario.id)
        
        if (status?.status === 'CONNECTED') {
          console.log('\n✅ ¡CONECTADO EXITOSAMENTE!')
          console.log(`📱 Número: ${conexion.phoneNumber}`)
          console.log('\n🤖 El bot ahora responderá automáticamente a mensajes')
          clearInterval(intervalo)
          process.exit(0)
        } else if (conexion.qrCode && !qrMostrado) {
          qrMostrado = true
          console.log('📱 QR GENERADO')
          console.log('=' .repeat(70))
          console.log('\n🌐 Abre el dashboard para ver el QR:')
          console.log('   http://localhost:3000\n')
          console.log('📱 O escanea directamente desde la base de datos\n')
          console.log(`Estado: ${status?.status || conexion.status}`)
          console.log('⏳ Esperando que escanees el QR...\n')
        } else {
          process.stdout.write(`\r[${new Date().toLocaleTimeString()}] Estado: ${status?.status || 'CONNECTING'}...`)
        }
      }
    }, 2000)

    // Timeout de 5 minutos
    setTimeout(() => {
      console.log('\n\n⏰ Timeout - El QR expiró')
      console.log('💡 Ejecuta el script de nuevo para generar un nuevo QR')
      clearInterval(intervalo)
      process.exit(1)
    }, 300000)

  } catch (error) {
    console.error('\n❌ ERROR:', error)
    process.exit(1)
  }
}

console.log('\n🎯 Este script:')
console.log('   1. Conecta Baileys')
console.log('   2. Genera el QR')
console.log('   3. Te dice dónde verlo')
console.log('   4. Espera a que lo escanees')
console.log('   5. Confirma cuando estés conectado\n')

conectarYMostrarQR()
