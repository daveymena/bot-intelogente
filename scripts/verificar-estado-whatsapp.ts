/**
 * Script para verificar el estado actual de WhatsApp en la base de datos
 */

import { db } from '../src/lib/db'

async function verificarEstado() {
  console.log('='.repeat(60))
  console.log('🔍 VERIFICACIÓN DE ESTADO WHATSAPP')
  console.log('='.repeat(60))
  console.log('')

  try {
    // Obtener todas las conexiones
    const connections = await db.whatsAppConnection.findMany({
      orderBy: { updatedAt: 'desc' }
    })

    if (connections.length === 0) {
      console.log('❌ No hay conexiones registradas en la base de datos')
      console.log('')
      console.log('💡 Esto es normal si nunca has conectado WhatsApp')
      console.log('   Intenta conectar desde el dashboard')
      console.log('')
      return
    }

    console.log(`📊 Total de conexiones: ${connections.length}`)
    console.log('')

    for (const conn of connections) {
      console.log('─'.repeat(60))
      console.log(`👤 Usuario ID: ${conn.userId}`)
      console.log(`📱 Teléfono: ${conn.phoneNumber || 'No registrado'}`)
      console.log(`📡 Estado: ${conn.status}`)
      console.log(`🔌 Conectado: ${conn.isConnected ? '✅ Sí' : '❌ No'}`)
      console.log(`🕐 Última conexión: ${conn.lastConnectedAt?.toLocaleString() || 'Nunca'}`)
      console.log(`🕐 Actualizado: ${conn.updatedAt.toLocaleString()}`)
      
      if (conn.qrCode) {
        console.log(`📱 QR Code: ✅ Presente (${conn.qrCode.length} caracteres)`)
        console.log(`   Primeros 50: ${conn.qrCode.substring(0, 50)}...`)
        
        if (conn.qrExpiresAt) {
          const now = new Date()
          const expired = conn.qrExpiresAt < now
          console.log(`⏰ QR Expira: ${conn.qrExpiresAt.toLocaleString()} ${expired ? '❌ EXPIRADO' : '✅ Válido'}`)
        }
      } else {
        console.log(`📱 QR Code: ❌ No presente`)
      }
      
      if (conn.lastError) {
        console.log(`⚠️  Último error: ${conn.lastError}`)
      }
      
      console.log(`🔄 Intentos de conexión: ${conn.connectionAttempts}`)
      console.log('')
    }

    // Mostrar recomendaciones
    console.log('='.repeat(60))
    console.log('💡 RECOMENDACIONES')
    console.log('='.repeat(60))
    console.log('')

    const latestConn = connections[0]

    if (latestConn.status === 'CONNECTED' && latestConn.isConnected) {
      console.log('✅ WhatsApp está conectado correctamente')
      console.log('   No se requiere acción')
    } else if (latestConn.status === 'QR_PENDING' && latestConn.qrCode) {
      if (latestConn.qrExpiresAt && latestConn.qrExpiresAt < new Date()) {
        console.log('⚠️  QR expirado - Genera uno nuevo')
        console.log('   Ejecuta: npx tsx scripts/resetear-whatsapp-completo.ts')
      } else {
        console.log('✅ QR disponible - Escanéalo desde el dashboard')
        console.log('   O ejecuta: npx tsx scripts/test-qr-console.ts')
      }
    } else if (latestConn.status === 'CONNECTING') {
      console.log('⏳ Conexión en progreso')
      console.log('   Espera 30 segundos y verifica de nuevo')
    } else if (latestConn.status === 'DISCONNECTED') {
      console.log('❌ WhatsApp desconectado')
      console.log('   Ejecuta: npx tsx scripts/resetear-whatsapp-completo.ts')
    } else {
      console.log('⚠️  Estado desconocido')
      console.log('   Ejecuta: npx tsx scripts/resetear-whatsapp-completo.ts')
    }

    console.log('')

  } catch (error) {
    console.error('❌ Error verificando estado:', error)
    console.error('')
    
    if (error instanceof Error && error.message.includes('connect')) {
      console.log('💡 Error de conexión a base de datos')
      console.log('   Verifica DATABASE_URL en .env')
      console.log('')
    }
  } finally {
    await db.$disconnect()
  }
}

verificarEstado()
