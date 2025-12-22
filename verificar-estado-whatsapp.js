/**
 * 🔍 Verificar Estado de WhatsApp
 * 
 * Muestra el estado actual de todas las conexiones
 * Uso: node verificar-estado-whatsapp.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function verificarEstado() {
  try {
    console.log('🔍 Verificando estado de WhatsApp...\n')

    // Obtener todas las conexiones
    const conexiones = await prisma.whatsAppConnection.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    if (conexiones.length === 0) {
      console.log('⚠️  No hay conexiones registradas')
      return
    }

    console.log(`📊 Total de conexiones: ${conexiones.length}\n`)

    for (const conn of conexiones) {
      console.log('═══════════════════════════════════════')
      console.log(`👤 Usuario: ${conn.user.email}`)
      console.log(`📱 Teléfono: ${conn.phoneNumber}`)
      console.log(`📊 Estado: ${conn.status}`)
      console.log(`🔌 Conectado: ${conn.isConnected ? '✅ Sí' : '❌ No'}`)
      
      if (conn.lastConnectedAt) {
        const minutos = Math.round((Date.now() - conn.lastConnectedAt.getTime()) / 60000)
        console.log(`⏰ Última conexión: hace ${minutos} minutos`)
      }
      
      if (conn.lastError) {
        console.log(`❌ Último error: ${conn.lastError}`)
        if (conn.lastErrorAt) {
          const minutos = Math.round((Date.now() - conn.lastErrorAt.getTime()) / 60000)
          console.log(`   (hace ${minutos} minutos)`)
        }
      }
      
      // Verificar archivos de sesión
      const authDir = path.join(process.cwd(), 'auth_sessions', conn.userId)
      if (fs.existsSync(authDir)) {
        const files = fs.readdirSync(authDir)
        console.log(`📁 Archivos de sesión: ${files.length} archivos`)
      } else {
        console.log(`📁 Archivos de sesión: ❌ No existe`)
      }
      
      console.log('═══════════════════════════════════════\n')
    }

    // Resumen
    const conectados = conexiones.filter(c => c.isConnected).length
    const desconectados = conexiones.filter(c => !c.isConnected).length
    
    console.log('📊 RESUMEN')
    console.log(`✅ Conectados: ${conectados}`)
    console.log(`❌ Desconectados: ${desconectados}`)
    
    if (desconectados > 0) {
      console.log('\n💡 Sugerencias:')
      console.log('- Si acabas de reiniciar, espera 1-2 minutos para auto-reconexión')
      console.log('- Si no conecta automáticamente, ve al dashboard y reconecta manualmente')
      console.log('- Si hay errores 440, ejecuta: node limpiar-conexiones-whatsapp.js')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarEstado()
