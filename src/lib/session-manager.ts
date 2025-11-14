import { BaileysStableService } from './baileys-stable-service'
import { db } from './db'

export class SessionManager {
  private static initialized = false

  static async initialize() {
    if (this.initialized) {
      console.log('[SessionManager] Ya inicializado')
      return
    }

    console.log('[SessionManager] 🚀 Inicializando sistema de WhatsApp con Baileys...')

    try {
      // Obtener todas las conexiones activas de la DB
      const conexiones = await db.whatsAppConnection.findMany({
        where: {
          OR: [
            { status: 'CONNECTED' },
            { isConnected: true }
          ]
        },
        include: {
          user: true
        }
      })

      if (conexiones.length === 0) {
        console.log('[SessionManager] ℹ️  No hay conexiones activas para restaurar')
        console.log('[SessionManager] 💡 Conecta WhatsApp desde el dashboard o ejecuta:')
        console.log('[SessionManager]    npx tsx scripts/conectar-baileys-y-mostrar-qr.ts')
        this.initialized = true
        return
      }

      console.log(`[SessionManager] 📱 Encontradas ${conexiones.length} conexión(es) activa(s)`)

      // Restaurar cada conexión
      for (const conexion of conexiones) {
        try {
          console.log(`[SessionManager] 🔄 Restaurando conexión para: ${conexion.user.email}`)
          
          // Intentar restaurar la sesión de Baileys
          const result = await BaileysStableService.initializeConnection(conexion.userId)
          
          if (result.success) {
            console.log(`[SessionManager] ✅ Conexión restaurada: ${conexion.phoneNumber}`)
          } else {
            console.log(`[SessionManager] ⚠️  No se pudo restaurar: ${result.error}`)
            console.log(`[SessionManager] 💡 Reconecta desde el dashboard`)
          }
        } catch (error) {
          console.error(`[SessionManager] ❌ Error restaurando ${conexion.user.email}:`, error)
        }
      }

      this.initialized = true
      console.log('[SessionManager] ✅ Inicialización completada')

    } catch (error) {
      console.error('[SessionManager] ❌ Error en inicialización:', error)
      this.initialized = true // Marcar como inicializado para no reintentar
    }
  }
}
