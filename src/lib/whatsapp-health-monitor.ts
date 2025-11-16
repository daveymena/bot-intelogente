/**
 * WhatsApp Health Monitor
 * Monitorea la salud de la conexión de WhatsApp Web (Baileys)
 * Detecta desconexiones silenciosas y reconecta automáticamente
 */

import { WASocket } from '@whiskeysockets/baileys'

export interface HealthMetrics {
  connectionStatus: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'UNHEALTHY'
  uptime: number // ms
  reconnectAttempts: number
  lastConnectedAt: Date | null
  lastDisconnectAt: Date | null
  lastHealthCheckAt: Date
  averageResponseTime: number // ms
  messagesSent: number
  messagesReceived: number
  errorRate: number // 0-1
  isHealthy: boolean
  lastError: string | null
}

export class WhatsAppHealthMonitor {
  private static monitors: Map<string, HealthMonitorInstance> = new Map()

  static createMonitor(userId: string, socket: WASocket): HealthMonitorInstance {
    const monitor = new HealthMonitorInstance(userId, socket)
    this.monitors.set(userId, monitor)
    return monitor
  }

  static getMonitor(userId: string): HealthMonitorInstance | undefined {
    return this.monitors.get(userId)
  }

  static removeMonitor(userId: string): void {
    const monitor = this.monitors.get(userId)
    if (monitor) {
      monitor.stop()
      this.monitors.delete(userId)
    }
  }

  static getAllMetrics(): Map<string, HealthMetrics> {
    const metrics = new Map<string, HealthMetrics>()
    this.monitors.forEach((monitor, userId) => {
      metrics.set(userId, monitor.getMetrics())
    })
    return metrics
  }
}

class HealthMonitorInstance {
  private userId: string
  private socket: WASocket
  private metrics: HealthMetrics
  private healthCheckInterval: NodeJS.Timeout | null = null
  private lastPingTime: number = 0
  private responseTimeBuffer: number[] = []
  private maxBufferSize = 100

  constructor(userId: string, socket: WASocket) {
    this.userId = userId
    this.socket = socket

    this.metrics = {
      connectionStatus: 'CONNECTING',
      uptime: 0,
      reconnectAttempts: 0,
      lastConnectedAt: null,
      lastDisconnectAt: null,
      lastHealthCheckAt: new Date(),
      averageResponseTime: 0,
      messagesSent: 0,
      messagesReceived: 0,
      errorRate: 0,
      isHealthy: false,
      lastError: null
    }

    this.start()
  }

  /**
   * Iniciar monitoreo de salud
   */
  private start(): void {
    console.log(`[HealthMonitor] 🏥 Iniciando monitoreo para usuario: ${this.userId}`)

    // Health check cada 30 segundos
    const checkInterval = parseInt(process.env.CONNECTION_HEALTH_CHECK_INTERVAL || '30000')
    
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck()
    }, checkInterval)

    // Realizar primer check inmediatamente
    this.performHealthCheck()
  }

  /**
   * Detener monitoreo
   */
  stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
    console.log(`[HealthMonitor] 🛑 Monitoreo detenido para usuario: ${this.userId}`)
  }

  /**
   * Realizar health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      this.metrics.lastHealthCheckAt = new Date()

      // Verificar si socket existe
      if (!this.socket) {
        this.metrics.connectionStatus = 'DISCONNECTED'
        this.metrics.isHealthy = false
        this.metrics.lastError = 'Socket no disponible'
        return
      }

      // Verificar si socket está conectado
      const isConnected = this.socket.user !== undefined

      if (!isConnected) {
        this.metrics.connectionStatus = 'DISCONNECTED'
        this.metrics.isHealthy = false
        this.metrics.lastDisconnectAt = new Date()
        this.metrics.lastError = 'Socket desconectado'
        console.log(`[HealthMonitor] ⚠️ Desconexión detectada para ${this.userId}`)
        return
      }

      // Enviar ping para verificar latencia
      const startTime = Date.now()
      this.lastPingTime = startTime

      try {
        // Intentar obtener info del usuario (ping ligero)
        const user = this.socket.user
        const responseTime = Date.now() - startTime

        // Registrar tiempo de respuesta
        this.recordResponseTime(responseTime)

        // Actualizar estado
        this.metrics.connectionStatus = 'CONNECTED'
        this.metrics.lastConnectedAt = new Date()
        this.metrics.uptime = Date.now() - (this.metrics.lastConnectedAt?.getTime() || Date.now())

        // Verificar si es saludable
        const threshold = parseInt(process.env.CONNECTION_HEALTH_THRESHOLD || '80')
        this.metrics.isHealthy = this.calculateHealth() >= threshold

        if (this.metrics.isHealthy) {
          console.log(`[HealthMonitor] ✅ Salud OK para ${this.userId} (${responseTime}ms)`)
        } else {
          console.log(`[HealthMonitor] ⚠️ Salud degradada para ${this.userId}`)
          this.metrics.lastError = 'Salud degradada'
        }
      } catch (pingError) {
        this.metrics.connectionStatus = 'UNHEALTHY'
        this.metrics.isHealthy = false
        this.metrics.lastError = pingError instanceof Error ? pingError.message : 'Error en ping'
        console.log(`[HealthMonitor] ❌ Error en ping para ${this.userId}:`, pingError)
      }
    } catch (error) {
      this.metrics.isHealthy = false
      this.metrics.lastError = error instanceof Error ? error.message : 'Error desconocido'
      console.error(`[HealthMonitor] ❌ Error en health check:`, error)
    }
  }

  /**
   * Registrar tiempo de respuesta
   */
  private recordResponseTime(responseTime: number): void {
    this.responseTimeBuffer.push(responseTime)

    // Mantener buffer de tamaño máximo
    if (this.responseTimeBuffer.length > this.maxBufferSize) {
      this.responseTimeBuffer.shift()
    }

    // Calcular promedio
    const sum = this.responseTimeBuffer.reduce((a, b) => a + b, 0)
    this.metrics.averageResponseTime = Math.round(sum / this.responseTimeBuffer.length)
  }

  /**
   * Calcular puntuación de salud (0-100)
   */
  private calculateHealth(): number {
    let health = 100

    // Penalizar por tiempo de respuesta alto
    if (this.metrics.averageResponseTime > 5000) {
      health -= 30
    } else if (this.metrics.averageResponseTime > 2000) {
      health -= 15
    }

    // Penalizar por tasa de error alta
    if (this.metrics.errorRate > 0.1) {
      health -= 20
    } else if (this.metrics.errorRate > 0.05) {
      health -= 10
    }

    // Penalizar por desconexiones recientes
    if (this.metrics.lastDisconnectAt) {
      const timeSinceDisconnect = Date.now() - this.metrics.lastDisconnectAt.getTime()
      if (timeSinceDisconnect < 60000) { // Menos de 1 minuto
        health -= 25
      }
    }

    return Math.max(0, Math.min(100, health))
  }

  /**
   * Registrar mensaje enviado
   */
  recordMessageSent(): void {
    this.metrics.messagesSent++
  }

  /**
   * Registrar mensaje recibido
   */
  recordMessageReceived(): void {
    this.metrics.messagesReceived++
  }

  /**
   * Registrar error
   */
  recordError(error: Error | string): void {
    const totalMessages = this.metrics.messagesSent + this.metrics.messagesReceived
    if (totalMessages > 0) {
      this.metrics.errorRate = (this.metrics.errorRate * (totalMessages - 1) + 1) / totalMessages
    }
    this.metrics.lastError = error instanceof Error ? error.message : error
  }

  /**
   * Obtener métricas actuales
   */
  getMetrics(): HealthMetrics {
    return { ...this.metrics }
  }

  /**
   * Obtener estado resumido
   */
  getStatus(): string {
    if (this.metrics.connectionStatus === 'CONNECTED' && this.metrics.isHealthy) {
      return '✅ Saludable'
    } else if (this.metrics.connectionStatus === 'CONNECTED') {
      return '⚠️ Degradado'
    } else if (this.metrics.connectionStatus === 'CONNECTING') {
      return '🔄 Conectando'
    } else {
      return '❌ Desconectado'
    }
  }

  /**
   * Verificar si necesita reconexión
   */
  needsReconnection(): boolean {
    return (
      this.metrics.connectionStatus === 'DISCONNECTED' ||
      (this.metrics.connectionStatus === 'UNHEALTHY' && this.metrics.averageResponseTime > 10000)
    )
  }

  /**
   * Resetear métricas
   */
  reset(): void {
    this.metrics = {
      connectionStatus: 'CONNECTING',
      uptime: 0,
      reconnectAttempts: 0,
      lastConnectedAt: null,
      lastDisconnectAt: null,
      lastHealthCheckAt: new Date(),
      averageResponseTime: 0,
      messagesSent: 0,
      messagesReceived: 0,
      errorRate: 0,
      isHealthy: false,
      lastError: null
    }
    this.responseTimeBuffer = []
  }
}

/**
 * Exportar para uso en otros módulos
 */
export default WhatsAppHealthMonitor
