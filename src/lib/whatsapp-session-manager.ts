/**
 * 🔒 WhatsApp Session Manager
 * 
 * Sistema de gestión de sesiones de WhatsApp que previene:
 * - Conexiones duplicadas
 * - Múltiples sesiones del mismo número
 * - Conflictos de sesión
 * - Escaneo de QR cuando ya hay una sesión activa
 */

import { db } from './db'

interface SessionLock {
    userId: string
    phoneNumber: string
    lockedAt: Date
    expiresAt: Date
}

export class WhatsAppSessionManager {
    // Mapa de sesiones bloqueadas en memoria (para prevenir race conditions)
    private static sessionLocks: Map<string, SessionLock> = new Map()

    // Tiempo de expiración del bloqueo (5 minutos)
    private static LOCK_EXPIRATION_MS = 5 * 60 * 1000

    /**
     * 🔍 Verificar si un usuario puede conectar WhatsApp
     * Retorna: { canConnect: boolean, reason?: string, existingConnection?: any }
     */
    static async canUserConnect(userId: string): Promise<{
        canConnect: boolean
        reason?: string
        existingConnection?: any
    }> {
        try {
            console.log(`[SessionManager] 🔍 Verificando si usuario ${userId} puede conectar...`)

            // 1. Verificar si ya existe una conexión activa en la base de datos
            const existingConnection = await db.whatsAppConnection.findUnique({
                where: { userId }
            })

            if (existingConnection) {
                // Si está conectado, no permitir nueva conexión
                if (existingConnection.isConnected && existingConnection.status === 'CONNECTED') {
                    console.log(`[SessionManager] ❌ Usuario ya tiene conexión activa`)
                    return {
                        canConnect: false,
                        reason: 'Ya tienes una conexión activa de WhatsApp. Desconecta primero antes de escanear un nuevo QR.',
                        existingConnection
                    }
                }

                // Si está en proceso de conexión (QR pendiente), no permitir nueva conexión
                if (existingConnection.status === 'QR_PENDING' || existingConnection.status === 'CONNECTING') {
                    const qrAge = existingConnection.qrExpiresAt
                        ? Date.now() - existingConnection.qrExpiresAt.getTime()
                        : 0

                    // Si el QR tiene menos de 2 minutos, no permitir nueva conexión
                    if (qrAge < 2 * 60 * 1000) {
                        console.log(`[SessionManager] ❌ Usuario tiene QR pendiente reciente`)
                        return {
                            canConnect: false,
                            reason: 'Ya tienes un código QR pendiente. Espera a que expire o escanéalo.',
                            existingConnection
                        }
                    }
                }
            }

            // 2. Verificar bloqueo en memoria (race condition protection)
            const lock = this.sessionLocks.get(userId)
            if (lock && lock.expiresAt > new Date()) {
                console.log(`[SessionManager] ❌ Usuario tiene bloqueo activo en memoria`)
                return {
                    canConnect: false,
                    reason: 'Hay una conexión en proceso. Espera unos segundos.',
                    existingConnection
                }
            }

            // 3. Verificar si el número de teléfono ya está registrado por otro usuario
            if (existingConnection?.phoneNumber && existingConnection.phoneNumber !== 'pending') {
                const duplicateConnection = await db.whatsAppConnection.findFirst({
                    where: {
                        phoneNumber: existingConnection.phoneNumber,
                        userId: { not: userId },
                        isConnected: true
                    }
                })

                if (duplicateConnection) {
                    console.log(`[SessionManager] ⚠️ Número ya registrado por otro usuario`)
                    return {
                        canConnect: false,
                        reason: 'Este número de WhatsApp ya está registrado en otra cuenta.',
                        existingConnection
                    }
                }
            }

            console.log(`[SessionManager] ✅ Usuario puede conectar`)
            return { canConnect: true }

        } catch (error) {
            console.error('[SessionManager] ❌ Error verificando permisos:', error)
            return {
                canConnect: false,
                reason: 'Error verificando estado de conexión. Intenta de nuevo.'
            }
        }
    }

    /**
     * 🔒 Bloquear sesión (prevenir conexiones simultáneas)
     */
    static lockSession(userId: string, phoneNumber: string = 'pending'): void {
        const lock: SessionLock = {
            userId,
            phoneNumber,
            lockedAt: new Date(),
            expiresAt: new Date(Date.now() + this.LOCK_EXPIRATION_MS)
        }

        this.sessionLocks.set(userId, lock)
        console.log(`[SessionManager] 🔒 Sesión bloqueada para usuario ${userId}`)

        // Auto-desbloquear después del tiempo de expiración
        setTimeout(() => {
            this.unlockSession(userId)
        }, this.LOCK_EXPIRATION_MS)
    }

    /**
     * 🔓 Desbloquear sesión
     */
    static unlockSession(userId: string): void {
        if (this.sessionLocks.has(userId)) {
            this.sessionLocks.delete(userId)
            console.log(`[SessionManager] 🔓 Sesión desbloqueada para usuario ${userId}`)
        }
    }

    /**
     * 🧹 Limpiar sesión anterior antes de conectar nueva
     */
    static async cleanupBeforeConnect(userId: string): Promise<void> {
        try {
            console.log(`[SessionManager] 🧹 Limpiando sesión anterior para usuario ${userId}`)

            // Actualizar estado en DB
            await db.whatsAppConnection.updateMany({
                where: { userId },
                data: {
                    status: 'DISCONNECTED',
                    isConnected: false,
                    qrCode: null,
                    qrExpiresAt: null,
                    lastError: 'Sesión limpiada para nueva conexión'
                }
            })

            console.log(`[SessionManager] ✅ Sesión anterior limpiada`)
        } catch (error) {
            console.error('[SessionManager] ❌ Error limpiando sesión:', error)
        }
    }

    /**
     * 🔍 Detectar y resolver conflictos de número duplicado
     */
    static async detectAndResolveConflicts(phoneNumber: string): Promise<{
        hasConflict: boolean
        conflictingUsers?: string[]
        resolved: boolean
    }> {
        try {
            console.log(`[SessionManager] 🔍 Detectando conflictos para número ${phoneNumber}`)

            // Buscar todas las conexiones con este número
            const connections = await db.whatsAppConnection.findMany({
                where: {
                    phoneNumber: phoneNumber,
                    NOT: {
                        phoneNumber: 'pending'
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true
                        }
                    }
                }
            })

            if (connections.length <= 1) {
                console.log(`[SessionManager] ✅ No hay conflictos`)
                return { hasConflict: false, resolved: true }
            }

            console.log(`[SessionManager] ⚠️ Conflicto detectado: ${connections.length} conexiones con el mismo número`)

            // Ordenar por última conexión (la más reciente primero)
            connections.sort((a, b) => {
                const dateA = a.lastConnectedAt?.getTime() || 0
                const dateB = b.lastConnectedAt?.getTime() || 0
                return dateB - dateA
            })

            // Mantener solo la conexión más reciente, desconectar las demás
            const [keepConnection, ...removeConnections] = connections

            console.log(`[SessionManager] 🔧 Manteniendo conexión de usuario ${keepConnection.userId}`)
            console.log(`[SessionManager] 🗑️ Desconectando ${removeConnections.length} conexiones antiguas`)

            // Desconectar las conexiones antiguas
            for (const conn of removeConnections) {
                await db.whatsAppConnection.update({
                    where: { id: conn.id },
                    data: {
                        status: 'DISCONNECTED',
                        isConnected: false,
                        lastError: 'Desconectado por conflicto de número duplicado'
                    }
                })

                console.log(`[SessionManager] ✅ Desconectado usuario ${conn.userId}`)
            }

            return {
                hasConflict: true,
                conflictingUsers: removeConnections.map(c => c.userId),
                resolved: true
            }

        } catch (error) {
            console.error('[SessionManager] ❌ Error resolviendo conflictos:', error)
            return {
                hasConflict: true,
                resolved: false
            }
        }
    }

    /**
     * 📊 Obtener estadísticas de sesiones
     */
    static async getSessionStats(): Promise<{
        totalConnections: number
        activeConnections: number
        pendingQR: number
        disconnected: number
        duplicates: number
    }> {
        try {
            const connections = await db.whatsAppConnection.findMany()

            const stats = {
                totalConnections: connections.length,
                activeConnections: connections.filter(c => c.isConnected && c.status === 'CONNECTED').length,
                pendingQR: connections.filter(c => c.status === 'QR_PENDING').length,
                disconnected: connections.filter(c => c.status === 'DISCONNECTED').length,
                duplicates: 0
            }

            // Detectar duplicados
            const phoneNumbers = connections
                .filter(c => c.phoneNumber !== 'pending')
                .map(c => c.phoneNumber)

            const uniqueNumbers = new Set(phoneNumbers)
            stats.duplicates = phoneNumbers.length - uniqueNumbers.size

            return stats
        } catch (error) {
            console.error('[SessionManager] ❌ Error obteniendo estadísticas:', error)
            return {
                totalConnections: 0,
                activeConnections: 0,
                pendingQR: 0,
                disconnected: 0,
                duplicates: 0
            }
        }
    }

    /**
     * 🔍 Verificar si un número ya está registrado
     */
    static async isPhoneNumberRegistered(phoneNumber: string, excludeUserId?: string): Promise<{
        isRegistered: boolean
        registeredBy?: string
    }> {
        try {
            const connection = await db.whatsAppConnection.findFirst({
                where: {
                    phoneNumber: phoneNumber,
                    NOT: {
                        phoneNumber: 'pending'
                    },
                    isConnected: true,
                    ...(excludeUserId ? { userId: { not: excludeUserId } } : {})
                },
                include: {
                    user: {
                        select: {
                            email: true
                        }
                    }
                }
            })

            if (connection) {
                return {
                    isRegistered: true,
                    registeredBy: connection.user.email
                }
            }

            return { isRegistered: false }
        } catch (error) {
            console.error('[SessionManager] ❌ Error verificando número:', error)
            return { isRegistered: false }
        }
    }

    /**
     * 🧹 Limpiar sesiones expiradas
     */
    static async cleanupExpiredSessions(): Promise<number> {
        try {
            console.log(`[SessionManager] 🧹 Limpiando sesiones expiradas...`)

            // Limpiar QR codes expirados (más de 5 minutos)
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

            const result = await db.whatsAppConnection.updateMany({
                where: {
                    status: 'QR_PENDING',
                    qrExpiresAt: {
                        lt: fiveMinutesAgo
                    }
                },
                data: {
                    status: 'DISCONNECTED',
                    qrCode: null,
                    qrExpiresAt: null,
                    lastError: 'QR code expirado'
                }
            })

            console.log(`[SessionManager] ✅ ${result.count} sesiones expiradas limpiadas`)
            return result.count
        } catch (error) {
            console.error('[SessionManager] ❌ Error limpiando sesiones:', error)
            return 0
        }
    }

    /**
     * 🔄 Limpiar bloqueos en memoria expirados
     */
    static cleanupExpiredLocks(): void {
        const now = new Date()
        let cleaned = 0

        for (const [userId, lock] of this.sessionLocks.entries()) {
            if (lock.expiresAt < now) {
                this.sessionLocks.delete(userId)
                cleaned++
            }
        }

        if (cleaned > 0) {
            console.log(`[SessionManager] 🧹 ${cleaned} bloqueos expirados limpiados`)
        }
    }
}

// Ejecutar limpieza periódica cada 5 minutos
setInterval(() => {
    WhatsAppSessionManager.cleanupExpiredSessions()
    WhatsAppSessionManager.cleanupExpiredLocks()
}, 5 * 60 * 1000)
