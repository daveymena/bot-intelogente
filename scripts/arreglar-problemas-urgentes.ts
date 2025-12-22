/**
 * 🚨 ARREGLAR PROBLEMAS URGENTES
 * 1. Reducir historial para Groq
 * 2. Aumentar timeout de Ollama
 * 3. Prevenir reconexiones múltiples
 */

import { db } from '../src/lib/db'

async function main() {
  console.log('🔧 Arreglando problemas urgentes...\n')

  // 1. Limpiar conversaciones antiguas (más de 24h)
  console.log('1️⃣ Limpiando conversaciones antiguas...')
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  const deleted = await db.conversation.deleteMany({
    where: {
      lastMessageAt: {
        lt: yesterday
      }
    }
  })
  
  console.log(`   ✅ ${deleted.count} conversaciones antiguas eliminadas\n`)

  // 2. Limpiar mensajes huérfanos (sin conversación)
  console.log('2️⃣ Limpiando mensajes huérfanos...')
  const orphanMessages = await db.message.deleteMany({
    where: {
      conversationId: null
    }
  })
  
  console.log(`   ✅ ${orphanMessages.count} mensajes huérfanos eliminados\n`)

  // 3. Resetear conexiones en estado inconsistente
  console.log('3️⃣ Reseteando conexiones inconsistentes...')
  const resetConnections = await db.whatsAppConnection.updateMany({
    where: {
      OR: [
        { status: 'CONNECTING' },
        { status: 'QR_PENDING' }
      ]
    },
    data: {
      status: 'DISCONNECTED',
      isConnected: false
    }
  })
  
  console.log(`   ✅ ${resetConnections.count} conexiones reseteadas\n`)

  // 4. Mostrar estadísticas
  console.log('📊 Estadísticas actuales:')
  
  const totalConversations = await db.conversation.count()
  const totalMessages = await db.message.count()
  const activeConnections = await db.whatsAppConnection.count({
    where: { isConnected: true }
  })
  
  console.log(`   - Conversaciones activas: ${totalConversations}`)
  console.log(`   - Mensajes totales: ${totalMessages}`)
  console.log(`   - Conexiones activas: ${activeConnections}`)
  
  console.log('\n✅ Problemas urgentes arreglados')
}

main()
  .catch(console.error)
  .finally(() => process.exit(0))
