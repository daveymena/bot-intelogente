/**
 * 🔄 SISTEMA DE AUTO-RECONEXIÓN DE WHATSAPP
 * 
 * Conecta automáticamente WhatsApp cuando el servidor inicia
 * y mantiene la conexión activa con reconexión automática
 */

import { db } from './db'

export class WhatsAppAutoReconnect {
    private static reconnectInterval: NodeJS.Timeout | null = null
    private static isInitialized = false
    private static reconnectAttempts = 0
    private static maxReconnectAttempts = 5

    /**
     * Inicializar sistema de auto-reconexión
     */
    static async initialize() {
        if (this.isInitialized) {
            console.log('🔄 [Auto-Reconnect] Ya está inicializado')
            return
        }

        console.log('🚀 [Auto-Reconnect] Iniciando sistema de auto-reconexión...')
        this.isInitialized = true

        // Esperar 5 segundos para que el servidor esté completamente listo
        await this.sleep(5000)

        // Intentar conectar inmediatamente
        await this.attemptConnection()

        // Configurar verificación periódica cada 30 segundos
        this.reconnectInterval = setInterval(async () => {
            await this.checkAndReconnect()
        }, 30000) // 30 segundos

        console.log('✅ [Auto-Reconnect] Sistema iniciado correctamente')
    }

    /**
     * Verificar y reconectar si es necesario
     */
    private static async checkAndReconnect() {
        try {
            // Obtener todos los usuarios activos
            const users = await db.user.findMany({
                where: {
                    role: { in: ['ADMIN', 'USER'] }
                },
                select: {
                    id: true,
                    email: true,
                    whatsappNumber: true
                }
            })

            if (users.length === 0) {
                console.log('⚠️ [Auto-Reconnect] No hay usuarios para conectar')
                return
            }

            // Verificar estado de conexión
            const { BaileysStableService } = await import('./baileys-stable-service')
            
            for (const user of users) {
                const session = BaileysStableService.getConnectionStatus(user.id)
                const isConnected = session?.status === 'CONNECTED' && session?.isReady
                
                if (!isConnected) {
                    console.log(`🔄 [Auto-Reconnect] Usuario ${user.email} desconectado (estado: ${session?.status || 'sin sesión'}), intentando reconectar...`)
                    await this.attemptConnection(user.id)
                } else {
                    console.log(`✅ [Auto-Reconnect] Usuario ${user.email} conectado`)
                }
            }

            // Resetear contador de intentos si hay conexión exitosa
            this.reconnectAttempts = 0

        } catch (error) {
            console.error('❌ [Auto-Reconnect] Error en verificación:', error)
        }
    }

    /**
     * Intentar conectar WhatsApp
     */
    private static async attemptConnection(userId?: string) {
        try {
            console.log('🔌 [Auto-Reconnect] Intentando conectar WhatsApp...')

            // Obtener usuario
            let user
            if (userId) {
                user = await db.user.findUnique({ where: { id: userId } })
            } else {
                // Buscar el primer usuario admin
                user = await db.user.findFirst({
                    where: { role: 'ADMIN' }
                })
            }

            if (!user) {
                console.log('⚠️ [Auto-Reconnect] No se encontró usuario para conectar')
                return
            }

            // Importar servicio de Baileys
            const { BaileysStableService } = await import('./baileys-stable-service')

            // Verificar si ya está conectado
            const session = BaileysStableService.getConnectionStatus(user.id)
            if (session?.status === 'CONNECTED' && session?.isReady) {
                console.log(`✅ [Auto-Reconnect] ${user.email} ya está conectado`)
                return
            }

            // Verificar si hay sesión guardada (archivos de autenticación)
            const authDir = `auth_sessions/${user.id}`
            const fs = await import('fs')
            const path = await import('path')
            const authPath = path.join(process.cwd(), authDir)
            
            if (!fs.existsSync(authPath) || fs.readdirSync(authPath).length === 0) {
                console.log(`⚠️ [Auto-Reconnect] No hay sesión guardada para ${user.email}, se requiere escanear QR`)
                return
            }

            // Intentar conectar usando sesión guardada
            console.log(`🔌 [Auto-Reconnect] Conectando ${user.email} con sesión guardada...`)
            const result = await BaileysStableService.initializeConnection(user.id)

            if (result.success) {
                console.log(`✅ [Auto-Reconnect] ${user.email} conectado exitosamente`)
                this.reconnectAttempts = 0
            } else if (result.qr) {
                console.log(`📱 [Auto-Reconnect] ${user.email} requiere escanear QR code`)
            } else {
                console.log(`⚠️ [Auto-Reconnect] ${user.email} no pudo conectar: ${result.error}`)
            }

        } catch (error: any) {
            this.reconnectAttempts++
            console.error(`❌ [Auto-Reconnect] Error al conectar (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts}):`, error.message)

            // Si se alcanzó el máximo de intentos, esperar más tiempo
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.log('⚠️ [Auto-Reconnect] Máximo de intentos alcanzado, esperando 5 minutos...')
                await this.sleep(300000) // 5 minutos
                this.reconnectAttempts = 0
            }
        }
    }

    /**
     * Detener sistema de auto-reconexión
     */
    static stop() {
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval)
            this.reconnectInterval = null
            this.isInitialized = false
            console.log('🛑 [Auto-Reconnect] Sistema detenido')
        }
    }

    /**
     * Forzar reconexión inmediata
     */
    static async forceReconnect(userId?: string) {
        console.log('🔄 [Auto-Reconnect] Forzando reconexión...')
        await this.attemptConnection(userId)
    }

    /**
     * Utilidad: Sleep
     */
    private static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

// Exportar para uso en server.ts
export default WhatsAppAutoReconnect
