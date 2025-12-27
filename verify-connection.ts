import { db } from './src/lib/db'

async function checkConnection() {
  try {
    const connections = await db.whatsAppConnection.findMany({
      include: {
        user: true
      }
    })

    console.log('=== ESTADO DE CONEXIÓN WHATSAPP ===')
    console.log(`Total de conexiones: ${connections.length}\n`)
    
    connections.forEach(conn => {
      console.log(`Usuario: ${conn.user.email}`)
      console.log(`Teléfono: ${conn.phoneNumber}`)
      console.log(`Estado: ${conn.status}`)
      console.log(`Conectado: ${conn.isConnected ? '✅ SÍ' : '❌ NO'}`)
      console.log(`Última conexión: ${conn.lastConnectedAt}`)
      console.log(`Última actividad: ${conn.lastMessageAt || 'N/A'}`)
      console.log('=====================================\n')
    })
  } catch (error) {
    console.error('Error verificando conexión:', error)
  } finally {
    process.exit(0)
  }
}

checkConnection()
