/**
 * 🔄 SERVICIO DE AUTO-RECONEXIÓN WHATSAPP
 * Sistema robusto para mantener la conexión activa
 */

import { WhatsAppWebService } from './whatsapp-web-service'
import { db } from './db'

interface ReconnectionConfig {
  maxRetries: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
  healthCheckInterval: number
}

interface ReconnectionState {
  userId: string
  retryCount: number
  lastAttempt: Date | null
  nextAttempt: Date | null
  isReconnecting: boolean
  consecutiveFailures: number
}

export class WhatsAppReconnectionService {
  private static config: ReconnectionConfig = {
    maxRetries: 10,
    initialDelay: 5000, // 5 segundos
    maxDelay: 300000, // 5 minutos
    backoffMultiplier: 1.5,
    healthCheckInterval: 30000 // 30 segundos
  }

  private static reconnectionStates: Map<string, ReconnectionState> = new Map()
  private static healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map()
  private static reconnectionTimeouts: Map<string, NodeJS.Timeout> = new Map()

  /**
   * 🚀 Iniciar monitoreo de reconexión para un usuario
   */
  static startMonitoring(userId: string) {
    console.log(`[Reconnection] 🎯 Iniciando monitoreo para usuario: ${userId}`)

    // Inicializar estado
    if (!this.reconnectionStates.has(userId)) {
      this.reconnectionStates.set(userId, {
        userId,
        retryCount: 0,
        lastAttempt: null,
        nextAttempt: null,
        isReconnecting: false,
        consecutiveFailures: 0
      })
    }

    // Detener monitoreo anterior si existe
    this.stopMonitoring(userId)

    // Iniciar health check periódico
    const interval = setInterval(async () => {
      await this.performHealthCheck(userId)
    }, this.config.healthCheckInterval)

    this.healthCheckIntervals.set(userId, interval)

    console.log(`[Reconnection] ✅ Monitoreo activo cada ${this.config.healthCheckInterval / 1000}s`)
  }

  /**
   * 🛑 Detener monitoreo de reconexión
   */
  static stopMonitoring(userId: string) {
    // Limpiar interval de health check
    const interval = this.healthCheckIntervals.get(userId)
    if (interval) {
      clearInterval(interval)
      this.healthCheckIntervals.delete(userId)
    }

    // Limpiar timeout de reconexión
    const timeout = this.reconnectionTimeouts.get(userId)
    if (timeout) {
      clearTimeout(timeout)
      this.reconnectionTimeouts.delete(userId)
    }

    console.log(`[Reconnection] 🛑 Monitoreo detenido para usuario: ${userId}`)
  }

  /**
   * 🏥 Realizar health check de la conexión
   */
  private static async performHealthCheck(userId: string) {
    try {
      const session = WhatsAppWebService.getSession(userId)
      
      if (!session) {
        console.log(`[Reconnection] ⚠️ No hay sesión para usuario: ${userId}`)
        return
      }

      const { client, status, isReady } = session

      // Si está conectado y listo, todo bien
      if (status === 'CONNECTED' && isReady && client) {
        const state = this.reconnectionStates.get(userId)
        if (state) {
          // Resetear contadores si estaba fallando
          if (state.consecutiveFailures > 0) {
            console.log(`[Reconnection] ✅ Conexión recuperada para usuario: ${userId}`)
            state.retryCount = 0
            state.consecutiveFailures = 0
            state.isReconnecting = false
          }
        }
        return
      }

      // Si está desconectado, intentar reconectar
      if (status === 'DISCONNECTED' || !isReady) {
        console.log(`[Reconnection] ⚠️ Conexión perdida detectada (status: ${status}, ready: ${isReady})`)
        await this.attemptReconnection(userId)
      }

    } catch (error) {
      console.error(`[Reconnection] ❌ Error en health check:`, error)
    }
  }

  /**
   * 🔄 Intentar reconexión
   */
  private static async attemptReconnection(userId: string) {
    const state = this.reconnectionStates.get(userId)
    
    if (!state) {
      console.log(`[Reconnection] ⚠️ No hay estado para usuario: ${userId}`)
      return
    }

    // Si ya está reconectando, no hacer nada
    if (state.isReconnecting) {
      console.log(`[Reconnection] ⏳ Ya hay una reconexión en progreso`)
      return
    }

    // Verificar si alcanzó el máximo de reintentos
    if (state.retryCount >= this.config.maxRetries) {
      console.log(`[Reconnection] ❌ Máximo de reintentos alcanzado (${this.config.maxRetries})`)
      await this.notifyReconnectionFailure(userId)
      return
    }

    // Marcar como reconectando
    state.isReconnecting = true
    state.retryCount++
    state.lastAttempt = new Date()

    // Calcular delay con backoff exponencial
    const delay = Math.min(
      this.config.initialDelay * Math.pow(this.config.backoffMultiplier, state.retryCount - 1),
      this.config.maxDelay
    )

    state.nextAttempt = new Date(Date.now() + delay)

    console.log(`[Reconnection] 🔄 Intento ${state.retryCount}/${this.config.maxRetries} en ${delay / 1000}s`)

    // Programar reconexión
    const timeout = setTimeout(async () => {
      try {
        await this.executeReconnection(userId)
      } catch (error) {
        console.error(`[Reconnection] ❌ Error ejecutando reconexión:`, error)
        state.consecutiveFailures++
        state.isReconnecting = false
      }
    }, delay)

    this.reconnectionTimeouts.set(userId, timeout)
  }

  /**
   * ⚡ Ejecutar reconexión
   */
  private static async executeReconnection(userId: string) {
    const state = this.reconnectionStates.get(userId)
    
    if (!state) return

    console.log(`[Reconnection] ⚡ Ejecutando reconexión para usuario: ${userId}`)

    try {
      // 1. Limpiar sesión anterior
      console.log(`[Reconnection] 🧹 Limpiando sesión anterior...`)
      await WhatsAppWebService.disconnect(userId)
      
      // Esperar un momento para que se limpie completamente
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 2. Intentar reconectar
      console.log(`[Reconnection] 🚀 Iniciando nueva conexión...`)
      const result = await WhatsAppWebService.initializeConnection(userId)

      if (result.success) {
        console.log(`[Reconnection] ✅ Reconexión exitosa`)
        
        // Resetear estado
        state.retryCount = 0
        state.consecutiveFailures = 0
        state.isReconnecting = false
        state.lastAttempt = new Date()
        state.nextAttempt = null

        // Actualizar en DB
        await db.whatsAppConnection.update({
          where: { userId },
          data: {
            status: 'CONNECTED',
            lastReconnection: new Date(),
            reconnectionAttempts: 0
          }
        })

        // Notificar éxito
        await this.notifyReconnectionSuccess(userId)

      } else {
        console.log(`[Reconnection] ❌ Reconexión fallida: ${result.error}`)
        state.consecutiveFailures++
        state.isReconnecting = false

        // Actualizar en DB
        await db.whatsAppConnection.update({
          where: { userId },
          data: {
            reconnectionAttempts: state.retryCount,
            lastReconnectionAttempt: new Date()
          }
        })

        // Intentar de nuevo si no alcanzó el máximo
        if (state.retryCount < this.config.maxRetries) {
          await this.attemptReconnection(userId)
        } else {
          await this.notifyReconnectionFailure(userId)
        }
      }

    } catch (error) {
      console.error(`[Reconnection] ❌ Error en reconexión:`, error)
      state.consecutiveFailures++
      state.isReconnecting = false

      // Intentar de nuevo
      if (state.retryCount < this.config.maxRetries) {
        await this.attemptReconnection(userId)
      }
    }
  }

  /**
   * 📢 Notificar éxito de reconexión
   */
  private static async notifyReconnectionSuccess(userId: string) {
    try {
      console.log(`[Reconnection] 📢 Notificando éxito de reconexión`)
      
      // Aquí podrías enviar una notificación al usuario
      // Por ejemplo, un email o actualizar un estado en el dashboard
      
    } catch (error) {
      console.error(`[Reconnection] ❌ Error notificando éxito:`, error)
    }
  }

  /**
   * 📢 Notificar fallo de reconexión
   */
  private static async notifyReconnectionFailure(userId: string) {
    try {
      console.log(`[Reconnection] 📢 Notificando fallo de reconexión`)
      
      // Actualizar estado en DB
      await db.whatsAppConnection.update({
        where: { userId },
        data: {
          status: 'DISCONNECTED',
          isConnected: false,
          reconnectionFailed: true,
          lastReconnectionAttempt: new Date()
        }
      })

      // Aquí podrías enviar una notificación al usuario
      // Por ejemplo, un email urgente o SMS
      
    } catch (error) {
      console.error(`[Reconnection] ❌ Error notificando fallo:`, error)
    }
  }

  /**
   * 🔄 Forzar reconexión inmediata
   */
  static async forceReconnection(userId: string) {
    console.log(`[Reconnection] 🔄 Forzando reconexión inmediata para usuario: ${userId}`)

    const state = this.reconnectionStates.get(userId)
    if (state) {
      state.retryCount = 0
      state.consecutiveFailures = 0
      state.isReconnecting = false
    }

    await this.executeReconnection(userId)
  }

  /**
   * 📊 Obtener estado de reconexión
   */
  static getReconnectionState(userId: string): ReconnectionState | null {
    return this.reconnectionStates.get(userId) || null
  }

  /**
   * ⚙️ Actualizar configuración
   */
  static updateConfig(config: Partial<ReconnectionConfig>) {
    this.config = { ...this.config, ...config }
    console.log(`[Reconnection] ⚙️ Configuración actualizada:`, this.config)
  }

  /**
   * 🧹 Limpiar todo
   */
  static cleanup() {
    console.log(`[Reconnection] 🧹 Limpiando todos los monitoreos`)
    
    // Detener todos los monitoreos
    for (const userId of this.reconnectionStates.keys()) {
      this.stopMonitoring(userId)
    }

    // Limpiar estados
    this.reconnectionStates.clear()
  }
}
