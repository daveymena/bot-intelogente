import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function limpiarConversaciones() {
  try {
    console.log('🧹 Limpiando conversaciones y mensajes...')

    // Eliminar todos los mensajes
    const deletedMessages = await prisma.message.deleteMany({})
    console.log(`✅ Eliminados ${deletedMessages.count} mensajes`)

    // Eliminar todas las conversaciones
    const deletedConversations = await prisma.conversation.deleteMany({})
    console.log(`✅ Eliminadas ${deletedConversations.count} conversaciones`)

    console.log('\n✨ Base de datos limpia!')
    console.log('📝 Las conversaciones se llenarán automáticamente cuando lleguen mensajes reales de WhatsApp')

  } catch (error) {
    console.error('❌ Error limpiando conversaciones:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

limpiarConversaciones()
