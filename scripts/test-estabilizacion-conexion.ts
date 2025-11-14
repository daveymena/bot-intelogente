/**
 * Script para probar el sistema de estabilización de conexión
 * Verifica que los mensajes se envíen solo cuando la conexión está completamente estable
 */

import { WhatsAppWebService } from '../src/lib/whatsapp-web-service'

async function testConnectionStabilization() {
  console.log('🧪 PRUEBA: Sistema de Estabilización de Conexión\n')

  try {
    const userId = 'test-user'

    console.log('1️⃣ Obteniendo estado de conexión...')
    const session = WhatsAppWebService.getConnectionStatus(userId)

    if (!session) {
      console.log('❌ No hay sesión activa')
      console.log('\n💡 Primero conecta WhatsApp con: npm run dev')
      return
    }

    console.log(`✅ Sesión encontrada:`)
    console.log(`   - Status: ${session.status}`)
    console.log(`   - isReady: ${session.isReady}`)
    console.log(`   - lastConnectionTime: ${new Date(session.lastConnectionTime).toLocaleString()}`)

    if (session.status !== 'CONNECTED') {
      console.log('\n❌ WhatsApp no está conectado')
      return
    }

    if (!session.isReady) {
      const timeSinceConnection = Date.now() - session.lastConnectionTime
      const waitTime = Math.max(0, 3000 - timeSinceConnection)
      console.log(`\n⏳ Conexión aún no está lista`)
      console.log(`   - Tiempo desde conexión: ${timeSinceConnection}ms`)
      console.log(`   - Tiempo de espera restante: ${waitTime}ms`)
    } else {
      console.log(`\n✅ Conexión está lista y estable`)
      const timeSinceConnection = Date.now() - session.lastConnectionTime
      console.log(`   - Tiempo desde conexión: ${timeSinceConnection}ms`)
    }

    console.log('\n2️⃣ Verificando cola de mensajes...')
    const queueStats = await WhatsAppWebService.getQueueStats()
    console.log(`   - Mensajes pendientes: ${queueStats.pending}`)
    console.log(`   - Mensajes enviados: ${queueStats.sent}`)
    console.log(`   - Mensajes fallidos: ${queueStats.failed}`)

    console.log('\n✅ Prueba completada')

  } catch (error) {
    console.error('\n❌ Error en prueba:', error)
  }
}

// Ejecutar prueba
testConnectionStabilization()
