import { db } from '../src/lib/db'
import qrcode from 'qrcode-terminal'

async function verQR() {
  console.log('📱 OBTENIENDO QR DE WHATSAPP')
  console.log('=' .repeat(70))

  try {
    const conexion = await db.whatsAppConnection.findFirst({
      where: {
        status: 'QR_PENDING'
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (!conexion || !conexion.qrCode) {
      console.log('❌ No hay QR disponible')
      console.log('💡 Asegúrate de que el script probar-baileys.ts esté corriendo')
      return
    }

    console.log('✅ QR encontrado')
    console.log('\n📱 Escanea este QR con WhatsApp en tu teléfono:\n')
    
    // Extraer el código QR del data URL
    const qrData = conexion.qrCode.replace('data:image/png;base64,', '')
    
    // Mostrar en terminal
    console.log('QR Code guardado en la base de datos')
    console.log('Abre el dashboard en http://localhost:3000 para verlo')
    console.log('\nO guarda este código en un archivo .png y escanéalo')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

verQR()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error fatal:', error)
    process.exit(1)
  })
