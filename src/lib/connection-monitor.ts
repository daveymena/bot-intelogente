/**
 * 🔍 MONITOR DE CONEXIÓN
 * Sistema que verifica y mantiene la conexión de WhatsApp activa
 */

import { BaileysService } from './baileys-service'

export class ConnectionMonitor {
    private static intervals: Map<string, NodeJS.Timeout> = new Map()
    private static isEnabled = process.env.ENABLE_CONNECTION_MONITOR !== 'false'

    /**
     * Iniciar monitoreo de conexión para un usuario
     */
    static startMonitoring(userId: string) {
        if (!this.isEnabled) {
            return
        }

        // Detener monitoreo previo si existe
        this.stopMonitoring(userId)

        console.log(`[Monitor] 🔍 Iniciando monitoreo de conexión para ${userId}`)

        // Verificar conexión cada 30 segundos
        const interval = setInterval(async () => {
            try {
                const status = await BaileysService.getConnectionStatus(userId)

                if (!status || status.status !== 'CONNECTED') {
                    console.log(`[Monitor] ⚠️ Conexión perdida para ${userId}, reconectando...`)
                    await BaileysService.initializeConnection(userId)
                } else {
                    // Conexión OK, hacer ping silencioso
                    console.log(`[Monitor] ✅ Conexión activa para ${userId}`)
                }
            } catch (error) {
                console.error(`[Monitor] ❌ Error verificando conexión:`, error)
            }
        }, 30000) // Cada 30 segundos

        this.intervals.set(userId, interval)
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
