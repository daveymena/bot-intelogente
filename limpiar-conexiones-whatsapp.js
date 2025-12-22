/**
 * 🧹 Limpiar todas las conexiones de WhatsApp y reiniciar limpiamente
 * 
 * Uso: node limpiar-conexiones-whatsapp.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function limpiarConexiones() {
  try {
    console.log('🧹 Limpiando conexiones de WhatsApp...\n')

    // 1. Actualizar todas las conexiones en DB a DISCONNECTED
    const result = await prisma.whatsAppConnection.updateMany({
      data: {
        status: 'DISCONNECTED',
        isConnected: false,
        qrCode: null,
        qrExpiresAt: null,
        lastError: 'Limpieza manual - reiniciar conexión',
        lastErrorAt: new Date()
      }
    })

    console.log(`✅ ${result.count} conexiones actualizadas en base de datos`)

    // 2. Limpiar archivos de sesión (opcional - comentado por seguridad)
    // const authDir = path.join(process.cwd(), 'auth_sessions')
    // if (fs.existsSync(authDir)) {
    //   const users = fs.readdirSync(authDir)
    //   for (const userId of users) {
    //     const userDir = path.join(authDir, userId)
    //     if (fs.statSync(userDir).isDirectory()) {
    //       fs.rmSync(userDir, { recursive: true, force: true })
    //       console.log(`🗑️  Sesión eliminada: ${userId}`)
    //     }
    //   }
    // }

    console.log('\n✅ Limpieza completada')
    console.log('\n📝 Próximos pasos:')
    console.log('1. Reinicia el servidor: npm run dev')
    console.log('2. Ve al dashboard y reconecta WhatsApp')
    console.log('3. Escanea el QR code si es necesario')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

limpiarConexiones()
