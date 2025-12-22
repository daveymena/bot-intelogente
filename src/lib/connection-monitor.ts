/**
 * 🔍 MONITOR DE CONEXIÓN
 * Sistema que verifica y mantiene la conexión de WhatsApp activa
 */

import { WhatsAppWebService } from './whatsapp-web-service'

export class ConnectionMonitor {
    private static intervals: Map<string, NodeJS.Timeout> = new Map()
    private static isEnabled = process.env.ENABLE_CONNECTION_MONITOR !== 'false'
    private static conflictDetected: Map<string, boolean> = new Map()
    private static reconnectAttempts: Map<string, number> = new Map()
    private static readonly MAX_RECONNECT_ATTEMPTS = 3

    /**
     * Iniciar monitoreo de conexión para un usuario
     */
    static startMonitoring(userId: string) {
        if (!this.isEnabled) {
            return
        }

        // Detener monitoreo previo si existe
        this.stopMonitoring(userId)

        // Resetear contadores
        this.conflictDetected.set(userId, false)
        this.reconnectAttempts.set(userId, 0)

        console.log(`[Monitor] 🔍 Iniciando monitoreo de conexión para ${userId}`)

        // Verificar conexión cada 30 segundos
        const interval = setInterval(async () => {
            try {
                // Si se detectó conflicto, no intentar reconectar
                if (this.conflictDetected.get(userId)) {
                    console.log(`[Monitor] ⏸️ Monitoreo pausado por conflicto de sesión para ${userId}`)
                    return
                }

                const status = WhatsAppWebService.getConnectionStatus(userId)

                if (!status || status.status !== 'CONNECTED') {
                    // Verificar intentos de reconexión
                    const attempts = this.reconnectAttempts.get(userId) || 0
                    
                    if (attempts >= this.MAX_RECONNECT_ATTEMPTS) {
                        console.log(`[Monitor] 🛑 Máximo de intentos alcanzado para ${userId}, deteniendo monitoreo`)
                        this.stopMonitoring(userId)
                        return
                    }

                    console.log(`[Monitor] ⚠️ Conexión perdida para ${userId}, reconectando... (intento ${attempts + 1}/${this.MAX_RECONNECT_ATTEMPTS})`)
                    this.reconnectAttempts.set(userId, attempts + 1)
                    
                    await WhatsAppWebService.initializeConnection(userId)
                } else {
                    // Conexión OK, resetear contador
                    this.reconnectAttempts.set(userId, 0)
                    console.log(`[Monitor] ✅ Conexión activa para ${userId}`)
                }
            } catch (error) {
                console.error(`[Monitor] ❌ Error verificando conexión:`, error)
            }
        }, 30000) // Cada 30 segundos

        this.intervals.set(userId, interval)
    }

    /**
     * Marcar que se detectó un conflicto de sesión
     */
    static markConflict(userId: string) {
        console.log(`[Monitor] ⚠️ Conflicto de sesión detectado para ${userId}`)
        this.conflictDetected.set(userId, true)
        this.stopMonitoring(userId)
    }

    /**
     * Limpiar marca de conflicto
     */
    static clearConflict(userId: string) {
        this.conflictDetected.set(userId, false)
        this.reconnectAttempts.set(userId, 0)
    }

    /**
     * Detener monitoreo de conexión
     */
    static stopMonitoring(userId: string) {
        const interval = this.intervals.get(userId)
        if (interval) {
            clearInterval(interval)
            this.intervals.delete(userId)
            console.log(`[Monitor] 🛑 Monitoreo detenido para ${userId}`)
        }
    }

    /**
     * Detener todos los monitoreos
     */
    static stopAll() {
        console.log('[Monitor] 🛑 Deteniendo todos los monitoreos...')
        this.intervals.forEach((interval, userId) => {
            clearInterval(interval)
            console.log(`[Monitor] 🛑 Monitoreo detenido para ${userId}`)
        })
        this.intervals.clear()
    }

    /**
     * Verificar estado de monitoreo
     */
    static isMonitoring(userId: string): boolean {
        return this.intervals.has(userId)
    }

    /**
     * Obtener usuarios monitoreados
     */
    static getMonitoredUsers(): string[] {
        return Array.from(this.intervals.keys())
    }
}

// Limpiar al cerrar el proceso
process.on('SIGINT', () => {
    ConnectionMonitor.stopAll()
    process.exit(0)
})

process.on('SIGTERM', () => {
    ConnectionMonitor.stopAll()
    process.exit(0)
})
