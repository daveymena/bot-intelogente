/**
 * 🔄 GESTOR DE SESIONES PERSISTENTES
 * Mantiene la conexión de WhatsApp activa en segundo plano
 * Reconecta automáticamente si se pierde la conexión
 */

import { BaileysService } from './baileys-service'
import { db } from './db'

export class SessionManager {
  private static reconnectIntervals: Map<string, NodeJS.Timeout> = new Map()
  private static isInitialized = false

  /**
   * Inicializar el gestor de sesiones al arrancar el servidor
   */
  static async initialize() {
    if (this.isInitialized) {
      console.log('[SessionManager] Ya está inicializado')
      return
    }

    console.log('[SessionManager] 🚀 Inicializando gestor de sesiones...')

    try {
      // Buscar todas las conexiones que deberían estar activas
      const activeConnections = await db.whatsAppConnection.findMany({
        where: {
          OR: [
            { status: 'CONNECTED' },
            { isConnected: true }
          ]
        }
      })

      console.log(`[SessionManager] Encontradas ${activeConnections.length} conexiones activas`)

      // Reconectar cada una
      for (const connection of activeConnections) {
        await this.restoreSession(connection.userId)
      }

      // Configurar verificación periódica cada 5 minutos
      setInterval(() => {
        this.checkAllSessions()
      }, 5 * 60 * 1000)

      this.isInitialized = true
      console.log('[SessionManager] ✅ Gestor de sesiones inicializado')

    } catch (error) {
      console.error('[SessionManager] ❌ Error inicializando:', error)
    }
  }

  /**
   * Restaurar sesión de un usuario
   */
  static async restoreSession(userId: string) {
    try {
      console.log(`[SessionManager] 🔄 Restaurando sesión para usuario: ${userId}`)

      // Verificar si ya existe una sesión activa en memoria
      const existingSession = BaileysService.getConnectionStatus(userId)
      
      if (existingSession && existingSession.status === 'CONNECTED') {
        console.log(`[SessionManager] ✅ Sesión ya activa para: ${userId}`)
        return
      }

      // Intentar reconectar
      const result = await BaileysService.initializeConnection(userId)

      if (result.success || result.qr) {
        console.log(`[SessionManager] ✅ Sesión restaurada para: ${userId}`)
        
        // Configurar reconexión automática si se desconecta
        this.setupAutoReconnect(userId)
      } else {
        console.log(`[SessionManager] ⚠️ No se pudo restaurar sesión para: ${userId}`)
        
        // Actualizar estado en DB
        await db.whatsAppConnection.update({
          where: { userId },
          data: {
            status: 'DISCONNECTED',
            isConnected: false
          }
        })
      }

    } catch (error) {
      console.error(`[SessionManager] ❌ Error restaurando sesión para ${userId}:`, error)
    }
  }

  /**
   * Configurar reconexión automática
   */
  static setupAutoReconnect(userId: string) {
    // Limpiar intervalo anterior si existe
    const existingInterval = this.reconnectIntervals.get(userId)
    if (existingInterval) {
      clearInterval(existingInterval)
    }

    // Verificar conexión cada 30 segundos (más frecuente)
    const interval = setInterval(async () => {
      try {
        // Verificar en memoria primero
        const session = BaileysService.getConnectionStatus(userId)
        
        if (!session || session.status !== 'CONNECTED') {
          console.log(`[SessionManager] ⚠️ Sesión no activa en memoria, verificando DB...`)
          
          const connection = await db.whatsAppConnection.findUnique({
            where: { userId }
          })

          if (connection && (connection.status === 'CONNECTED' || connection.isConnected)) {
            console.log(`[SessionManager] 🔄 Reconectando usuario: ${userId}`)
            await this.restoreSession(userId)
          }
        }
      } catch (error) {
        console.error(`[SessionManager] Error en auto-reconexión para ${userId}:`, error)
      }
    }, 30 * 1000) // Cada 30 segundos

    this.reconnectIntervals.set(userId, interval)
    console.log(`[SessionManager] ⏰ Auto-reconexión configurada para: ${userId} (cada 30 seg)`)
  }

  /**
   * Verificar todas las sesiones activas
   */
  static async checkAllSessions() {
    try {
      console.log('[SessionManager] 🔍 Verificando todas las sesiones...')

      const connections = await db.whatsAppConnection.findMany({
        where: {
          OR: [
            { status: 'CONNECTED' },
            { isConnected: true }
          ]
        }
      })

      for (const connection of connections) {
        const session = BaileysService.getConnectionStatus(connection.userId)
        
        if (!session || session.status !== 'CONNECTED') {
          console.log(`[SessionManager] ⚠️ Sesión perdida para ${connection.userId}, reconectando...`)
          await this.restoreSession(connection.userId)
        }
      }

      console.log('[SessionManager] ✅ Verificación completada')

    } catch (error) {
      console.error('[SessionManager] Error verificando sesiones:', error)
    }
  }

  /**
   * Detener auto-reconexión para un usuario
   */
  static stopAutoReconnect(userId: string) {
    const interval = this.reconnectIntervals.get(userId)
    if (interval) {
      clearInterval(interval)
      this.reconnectIntervals.delete(userId)
      console.log(`[SessionManager] ⏹️ Auto-reconexión detenida para: ${userId}`)
    }
  }

  /**
   * Limpiar todos los intervalos
   */
  static cleanup() {
    console.log('[SessionManager] 🧹 Limpiando intervalos...')
    
    for (const [userId, interval] of Array.from(this.reconnectIntervals.entries())) {
      clearInterval(interval)
      console.log(`[SessionManager] Intervalo limpiado para: ${userId}`)
    }
    
    this.reconnectIntervals.clear()
    this.isInitialized = false
  }
}

// Inicializar automáticamente cuando se importa el módulo
if (typeof window === 'undefined') {
  // Solo en el servidor
  SessionManager.initialize().catch(console.error)
}
