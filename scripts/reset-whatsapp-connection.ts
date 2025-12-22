import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetWhatsAppConnection() {
  try {
    console.log('🔄 Reseteando conexiones de WhatsApp...')

    // Actualizar todas las conexiones a DISCONNECTED
    const result = await prisma.whatsAppConnection.updateMany({
      data: {
        status: 'DISCONNECTED',
        isConnected: false,
        qrCode: null,
        qrExpiresAt: null,
        lastError: null,
        lastErrorAt: null
      }
    })

    console.log(`✅ ${result.count} conexiones reseteadas`)
    console.log('✅ Todas las conexiones están ahora en estado DISCONNECTED')
    console.log('\n🚀 Ahora puedes intentar conectar de nuevo desde el dashboard')

  } catch (error) {
    console.error('❌ Error reseteando conexiones:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetWhatsAppConnection()
