/**
 * Script para probar el sistema de auto-conexión de WhatsApp
 */

import { WhatsAppAutoConnect } from '../src/lib/whatsapp-auto-connect'
import { db } from '../src/lib/db'

async function testAutoConnect() {
  console.log('🧪 PRUEBA: Sistema de Auto-Conexión de WhatsApp\n')

  try {
    // 1. Verificar estado actual
    console.log('1️⃣ Verificando estado del sistema...')
    const status = WhatsAppAutoConnect.getStatus()
    console.log('   Estado:', status)

    // 2. Buscar usuarios con sesiones previas
    console.log('\n2️⃣ Buscando usuarios con sesiones previas...')
    const connections = await db.whatsAppConnection.findMany({
      where: {
        OR: [
          { status: 'CONNECTED' },
          { isConnected: true },
          { lastConnectedAt: { not: null } }
        ]
      },
      include: {
        user: true
      }
    })

    if (connections.length === 0) {
      console.log('   ℹ️ No hay usuarios con sesiones previas')
    } else {
      console.log(`   📱 Encontrados ${connections.length} usuario(s):`)
      for (const conn of connections) {
        console.log(`      - ${conn.user.email}`)
        console.log(`        Status: ${conn.status}`)
        console.log(`        Última conexión: ${conn.lastConnectedAt?.toLocaleString() || 'Nunca'}`)
      }
    }

    // 3. Verificar si el sistema está inicializado
    console.log('\n3️⃣ Estado del sistema:')
    console.log(`   Inicializado: ${status.isInitialized ? '✅' : '❌'}`)
    console.log(`   Ejecutándose: ${status.isRunning ? '✅' : '❌'}`)
    console.log(`   Intervalo de verificación: ${status.checkInterval / 1000}s`)

    console.log('\n✅ Prueba completada')
    console.log('\n💡 Notas:')
    console.log('   - El sistema se inicializa automáticamente al arrancar el servidor')
    console.log('   - Reconecta usuarios que tenían sesión activa')
    console.log('   - Verifica cada 30 segundos si hay conexiones caídas')

  } catch (error) {
    console.error('\n❌ Error en prueba:', error)
  } finally {
    process.exit(0)
  }
}

// Ejecutar prueba
testAutoConnect()
