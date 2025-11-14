import { BaileysStableService } from '../src/lib/baileys-stable-service'
import { db } from '../src/lib/db'

async function verificar() {
  console.log('🔍 VERIFICANDO CONEXIÓN ACTUAL')
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

    // Verificar sesión en memoria
    const session = BaileysStableService.getConnectionStatus(usuario.id)
    
    console.log('📊 Estado en Memoria:')
    if (session) {
      console.log(`   Status: ${session.status}`)
      console.log(`   Ready: ${session.isReady}`)
      console.log(`   Intentos reconexión: ${session.reconnectAttempts}`)
    } else {
      console.log('   ❌ No hay sesión en memoria')
    }

    // Verificar en DB
    const conexion = await db.whatsAppConnection.findUnique({
      where: { userId: usuario.id }
    })

    console.log('\n📊 Estado en Base de Datos:')
    if (conexion) {
      console.log(`   Status: ${conexion.status}`)
      console.log(`   Conectado: ${conexion.isConnected}`)
      console.log(`   Teléfono: ${conexion.phoneNumber}`)
      console.log(`   Última conexión: ${conexion.lastConnectedAt}`)
    } else {
      console.log('   ❌ No hay registro en DB')
    }

    console.log('\n' + '='.repeat(70))
    
    if (session?.status === 'CONNECTED' && session.isReady) {
      console.log('✅ BAILEYS ESTÁ CONECTADO Y FUNCIONANDO')
      console.log('💡 El bot responderá a mensajes automáticamente')
      console.log('\n📱 Envía un mensaje de prueba a:', conexion?.phoneNumber)
    } else {
      console.log('❌ BAILEYS NO ESTÁ CONECTADO')
      console.log('💡 Ejecuta: npx tsx scripts/conectar-baileys-y-mostrar-qr.ts')
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error)
  }
}

verificar()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error fatal:', error)
    process.exit(1)
  })
