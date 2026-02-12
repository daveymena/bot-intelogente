import { db } from './db'
import { BaileysStableService } from './baileys-stable-service'
import path from 'path'
import fs from 'fs'

export class WhatsAppSessionManager {
  // Mapa de bloqueos de conexión: userId -> timestamp
  private static connectionLocks: Map<string, number> = new Map()

  /**
   * Verificar si un usuario puede conectar
   * Valida límites del plan y conexiones existentes
   */
  static async canUserConnect(userId: string): Promise<{ 
    canConnect: boolean; 
    reason?: string;
    existingConnection?: any;
  }> {
    try {
      // 1. Obtener usuario y suscripción
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          whatsappConnection: true
        }
      })

      if (!user) {
        return { canConnect: false, reason: 'Usuario no encontrado' }
      }

      // 2. Verificar si ya hay una conexión activa
      // Si está conectado, PERMITIR reconexión (el frontend manejará la confirmación)
      /*
      if (user.whatsappConnection && user.whatsappConnection.isConnected) {
        return { 
          canConnect: false, 
          reason: 'Ya existe una conexión activa',
          existingConnection: user.whatsappConnection
        }
      }
      */

      // 3. Verificar límites del plan (Opcional - por ahora permitir siempre en Beta)
      // const plan = user.subscriptionPlan || 'free'
      // if (plan === 'free' && user.whatsappConnection) { ... }

      return { canConnect: true }
    } catch (error) {
      console.error('[WhatsAppSessionManager] Error verificando conexión:', error)
      return { canConnect: false, reason: 'Error interno verificando permisos' }
    }
  }

  /**
   * Bloquear sesión para evitar múltiples intentos simultáneos
   */
  static lockSession(userId: string): boolean {
    const existingLock = this.connectionLocks.get(userId)
    const lockDuration = 2 * 60 * 1000 // 2 minutos

    if (existingLock && (Date.now() - existingLock < lockDuration)) {
      return false // Ya bloqueado
    }

    this.connectionLocks.set(userId, Date.now())
    return true
  }

  /**
   * Desbloquear sesión
   */
  static unlockSession(userId: string): void {
    this.connectionLocks.delete(userId)
  }

  /**
   * Limpiar estado antes de una nueva conexión
   */
  static async cleanupBeforeConnect(userId: string): Promise<void> {
    try {
      console.log(`[WhatsAppSessionManager] 🧹 Limpiando estado anterior para ${userId}`)
      
      // 1. Desconectar sesión activa en memoria si existe
      await BaileysStableService.disconnect(userId)

      // 2. Limpiar base de datos
      await db.whatsAppConnection.upsert({
        where: { userId },
        create: {
          userId,
          status: 'DISCONNECTED',
          isConnected: false,
          qrCode: null,
          connectionAttempts: 0
        },
        update: {
          status: 'DISCONNECTED',
          isConnected: false,
          qrCode: null,
          connectionAttempts: 0,
          lastError: null
        }
      })

      // 3. (Opcional) Limpiar archivos de sesión corruptos si se desea forzar reset total
      // const sessionDir = path.join(process.cwd(), 'auth_sessions', userId)
      // if (fs.existsSync(sessionDir)) {
      //   fs.rmSync(sessionDir, { recursive: true, force: true })
      // }

      console.log(`[WhatsAppSessionManager] ✅ Limpieza completada`)
    } catch (error) {
      console.error('[WhatsAppSessionManager] ⚠️ Error en limpieza (no crítico):', error)
    }
  }
}
