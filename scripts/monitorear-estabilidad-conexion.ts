/**
 * Monitor en tiempo real del estado de estabilidad de la conexión
 * Útil para diagnosticar problemas de timing
 */

import { WhatsAppWebService } from '../src/lib/whatsapp-web-service'

function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'CONNECTED': return '🟢'
    case 'CONNECTING': return '🟡'
    case 'QR_PENDING': return '📱'
    case 'DISCONNECTED': return '🔴'
    default: return '⚪'
  }
}

async function monitorConnection() {
  const userId = 'test-user'
  let lastStatus = ''
  let lastReady = false
  let iteration = 0

  console.log('🔍 MONITOR DE ESTABILIDAD DE CONEXIÓN')
  console.log('=====================================\n')
  console.log('Monitoreando cada 500ms...')
  console.log('Presiona Ctrl+C para detener\n')

  setInterval(async () => {
    iteration++
    const session = WhatsAppWebService.getConnectionStatus(userId)

    if (!session) {
      if (lastStatus !== 'NO_SESSION') {
        console.log(`\n[${new Date().toLocaleTimeString()}] ❌ No hay sesión activa`)
        lastStatus = 'NO_SESSION'
      }
      return
    }

    const statusChanged = session.status !== lastStatus
    const readyChanged = session.isReady !== lastReady

    if (statusChanged || readyChanged || iteration % 10 === 0) {
      const timeSinceConnection = session.lastConnectionTime > 0 
        ? Date.now() - session.lastConnectionTime 
        : 0

      const statusEmoji = getStatusEmoji(session.status)
      const readyEmoji = session.isReady ? '✅' : '⏳'

      console.log(`\n[${new Date().toLocaleTimeString()}] ${statusEmoji} Status: ${session.status}`)
      console.log(`   ${readyEmoji} Ready: ${session.isReady}`)
      
      if (session.lastConnectionTime > 0) {
        console.log(`   ⏱️  Tiempo desde conexión: ${formatTime(timeSinceConnection)}`)
        
        if (!session.isReady && timeSinceConnection < 3000) {
          const remaining = 3000 - timeSinceConnection
          console.log(`   ⏳ Tiempo restante para estabilizar: ${formatTime(remaining)}`)
        }
      }

      // Mostrar estadísticas de cola
      try {
        const queueStats = await WhatsAppWebService.getQueueStats()
        if (queueStats.pending > 0 || queueStats.failed > 0) {
          console.log(`   📬 Cola: ${queueStats.pending} pendientes, ${queueStats.failed} fallidos`)
        }
      } catch (error) {
        // Ignorar errores de cola
      }

      lastStatus = session.status
      lastReady = session.isReady
    }
  }, 500)
}

// Manejar Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Monitor detenido')
  process.exit(0)
})

// Ejecutar monitor
monitorConnection()
