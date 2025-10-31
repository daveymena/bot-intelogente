import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function reconectar() {
  try {
    console.log('🔄 Forzando reconexión de WhatsApp...\n')

    const userId = 'cmhc22zw20000kmhgvx5ubazy'

    // Actualizar estado a DISCONNECTED para forzar reconexión
    await prisma.whatsAppConnection.update({
      where: { userId },
      data: {
        status: 'DISCONNECTED',
        isConnected: false,
        qrCode: null,
        qrExpiresAt: null
      }
    })

    console.log('✅ Estado actualizado a DISCONNECTED')
    console.log('\n📱 PASOS SIGUIENTES:')
    console.log('1. Ve al dashboard (http://localhost:3000)')
    console.log('2. Ve a la sección "WhatsApp"')
    console.log('3. Haz clic en "Conectar WhatsApp"')
    console.log('4. Escanea el QR con tu teléfono')
    console.log('5. ¡Listo! El bot volverá a recibir mensajes')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

reconectar()
