import { BaileysStableService } from '../src/lib/baileys-stable-service'
import { db } from '../src/lib/db'

async function probarBaileys() {
  console.log('🧪 PROBANDO BAILEYS STABLE SERVICE')
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

    console.log(`✅ Usuario encontrado: ${usuario.email}`)
    console.log(`   ID: ${usuario.id}`)

    // Inicializar conexión
    console.log('\n🚀 Inicializando conexión con Baileys...')
    const result = await BaileysStableService.initializeConnection(usuario.id)

    if (result.success) {
      console.log('\n✅ CONEXIÓN INICIADA EXITOSAMENTE')
      console.log('\n📱 Ahora deberías ver un QR en la base de datos')
      console.log('   Escanéalo con tu teléfono para conectar')
      console.log('\n💡 El bot responderá automáticamente a los mensajes')
      console.log('\n⏳ Esperando conexión... (presiona Ctrl+C para salir)')
      
      // Mantener el proceso vivo
      setInterval(() => {
        const status = BaileysStableService.getConnectionStatus(usuario.id)
        if (status) {
          console.log(`[${new Date().toLocaleTimeString()}] Estado: ${status.status}`)
        }
      }, 5000)
    } else {
      console.log('\n❌ ERROR INICIANDO CONEXIÓN')
      console.log(`   Error: ${result.error}`)
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error)
  }
}

probarBaileys()
