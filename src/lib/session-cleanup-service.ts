/**
 * 🧹 Servicio de Auto-Limpieza de Sesiones WhatsApp
 * 
 * Detecta y elimina automáticamente sesiones corruptas que quedan en "limbo"
 * - Sesiones en CONNECTING por más de 3 minutos
 * - Sesiones en QR_PENDING por más de 5 minutos
 * - Archivos de sesión corruptos
 * - Locks de conexión expirados
 */

import fs from 'fs'
import path from 'path'
import { db } from './db'

interface SessionHealth {
  userId: string
  status: string
  isHealthy: boolean
  issues: string[]
  shouldCleanup: boolean
}

export class SessionCleanupService {
  private static readonly MAX_CONNECTING_TIME = 3 * 60 * 1000 // 3 minutos
  private static readonly MAX_QR_PENDING_TIME = 5 * 60 * 1000 // 5 minutos
  private static readonly MAX_LOCK_TIME = 2 * 60 * 1000 // 2 minutos
  
  /**
   * 🔍 Verificar salud de una sesión
   */
  static async checkSessionHealth(userId: string): Promise<SessionHealth> {
    const issues: string[] = []
    let shouldCleanup = false

    try {
      // Verificar estado en base de datos
      const connection = await db.whatsAppConnection.findUnique({
        where: { userId }
      })

      if (!connection) {
        return {
          userId,
          status: 'NOT_FOUND',
          isHealthy: true,
          issues: [],
          shouldCleanup: false
        }
      }

      const now = Date.now()
      const lastUpdate = connection.updatedAt.getTime()
      const timeSinceUpdate = now - lastUpdate

      // 🚨 Detectar sesión en CONNECTING por mucho tiempo
      if (connection.status === 'CONNECTING' && timeSinceUpdate > this.MAX_CONNECTING_TIME) {
        issues.push(`Sesión en CONNECTING por ${Math.round(timeSinceUpdate / 1000)}s (máx: ${this.MAX_CONNECTING_TIME / 1000}s)`)
        shouldCleanup = true
      }

      // 🚨 Detectar QR expirado
      if (connection.status === 'QR_PENDING') {
        if (connection.qrExpiresAt && connection.qrExpiresAt < new Date()) {
          issues.push('QR expirado')
          shouldCleanup = true
        } else if (timeSinceUpdate > this.MAX_QR_PENDING_TIME) {
          issues.push(`QR pendiente por ${Math.round(timeSinceUpdate / 1000)}s (máx: ${this.MAX_QR_PENDING_TIME / 1000}s)`)
          shouldCleanup = true
        }
      }

      // 🚨 Detectar múltiples intentos fallidos
      if (connection.connectionAttempts && connection.connectionAttempts > 5) {
        issues.push(`Demasiados intentos de conexión: ${connection.connectionAttempts}`)
        shouldCleanup = true
      }

      // 🚨 Verificar archivos de sesión corruptos
      const authDir = path.join(process.cwd(), 'auth_sessions', userId)
      if (fs.existsSync(authDir)) {
        const files = fs.readdirSync(authDir)
        if (files.length === 0) {
          issues.push('Directorio de sesión vacío')
          shouldCleanup = true
        }
      }

      return {
        userId,
        status: connection.status,
        isHealthy: issues.length === 0,
        issues,
        shouldCleanup
      }

    } catch (error) {
      console.error(`[SessionCleanup] Error verificando salud de sesión ${userId}:`, error)
      return {
        userId,
        status: 'ERROR',
        isHealthy: false,
        issues: ['Error al verificar sesión'],
        shouldCleanup: true
      }
    }
  }

  /**
   * 🧹 Limpiar sesión corrupta
   */
  static async cleanupCorruptedSession(userId: string): Promise<boolean> {
    console.log(`[SessionCleanup] 🧹 Limpiando sesión corrupta para usuario: ${userId}`)

    try {
      // 1. Eliminar archivos de sesión
      const authDir = path.join(process.cwd(), 'auth_sessions', userId)
      if (fs.existsSync(authDir)) {
        console.log(`[SessionCleanup] 📁 Eliminando directorio: ${authDir}`)
        fs.rmSync(authDir, { recursive: true, force: true })
      }

      // 2. Actualizar estado en base de datos
      await db.whatsAppConnection.update({
        where: { userId },
        data: {
          status: 'DISCONNECTED',
          isConnected: false,
          qrCode: null,
          qrExpiresAt: null,
          connectionAttempts: 0,
          lastError: 'Sesión limpiada automáticamente por corrupción'
        }
      })

      console.log(`[SessionCleanup] ✅ Sesión limpiada exitosamente`)
      return true

    } catch (error) {
      console.error(`[SessionCleanup] ❌ Error limpiando sesión:`, error)
      return false
    }
  }

  /**
   * 🔄 Auto-limpieza automática (ejecutar periódicamente)
   */
  static async autoCleanup(): Promise<void> {
    console.log(`[SessionCleanup] 🔄 Iniciando auto-limpieza...`)

    try {
      // Obtener todas las conexiones activas
      const connections = await db.whatsAppConnection.findMany({
        where: {
          OR: [
            { status: 'CONNECTING' },
            { status: 'QR_PENDING' }
          ]
        }
      })

      console.log(`[SessionCleanup] 📊 Encontradas ${connections.length} sesiones activas`)

      let cleaned = 0
      for (const connection of connections) {
        const health = await this.checkSessionHealth(connection.userId)
        
        if (health.shouldCleanup) {
          console.log(`[SessionCleanup] 🚨 Sesión corrupta detectada:`, {
            userId: connection.userId,
            status: connection.status,
            issues: health.issues
          })

          const success = await this.cleanupCorruptedSession(connection.userId)
          if (success) {
            cleaned++
          }
        }
      }

      console.log(`[SessionCleanup] ✅ Auto-limpieza completada: ${cleaned} sesiones limpiadas`)

    } catch (error) {
      console.error(`[SessionCleanup] ❌ Error en auto-limpieza:`, error)
    }
  }

  /**
   * 🔒 Limpiar locks expirados
   */
  static async cleanupExpiredLocks(): Promise<void> {
    console.log(`[SessionCleanup] 🔒 Limpiando locks expirados...`)

    try {
      const connections = await db.whatsAppConnection.findMany({
        where: {
          status: 'CONNECTING'
        }
      })

      const now = Date.now()
      let cleaned = 0

      for (const connection of connections) {
        const timeSinceUpdate = now - connection.updatedAt.getTime()
        
        if (timeSinceUpdate > this.MAX_LOCK_TIME) {
          console.log(`[SessionCleanup] 🔓 Lock expirado para ${connection.userId} (${Math.round(timeSinceUpdate / 1000)}s)`)
          
          await db.whatsAppConnection.update({
            where: { userId: connection.userId },
            data: {
              status: 'DISCONNECTED',
              lastError: 'Lock de conexión expirado'
            }
          })
          
          cleaned++
        }
      }

      console.log(`[SessionCleanup] ✅ ${cleaned} locks limpiados`)

    } catch (error) {
      console.error(`[SessionCleanup] ❌ Error limpiando locks:`, error)
    }
  }

  /**
   * 🚀 Iniciar servicio de auto-limpieza periódica
   */
  static startAutoCleanupService(intervalMinutes: number = 2): NodeJS.Timeout {
    console.log(`[SessionCleanup] 🚀 Iniciando servicio de auto-limpieza (cada ${intervalMinutes} minutos)`)

    // Ejecutar inmediatamente
    this.autoCleanup()
    this.cleanupExpiredLocks()

    // Ejecutar periódicamente
    return setInterval(async () => {
      await this.autoCleanup()
      await this.cleanupExpiredLocks()
    }, intervalMinutes * 60 * 1000)
  }

  /**
   * 🧪 Diagnóstico completo del sistema
   */
  static async diagnosticReport(): Promise<{
    totalSessions: number
    healthySessions: number
    corruptedSessions: number
    details: SessionHealth[]
  }> {
    console.log(`[SessionCleanup] 🧪 Generando reporte de diagnóstico...`)

    try {
      const connections = await db.whatsAppConnection.findMany()
      const details: SessionHealth[] = []

      for (const connection of connections) {
        const health = await this.checkSessionHealth(connection.userId)
        details.push(health)
      }

      const healthySessions = details.filter(d => d.isHealthy).length
      const corruptedSessions = details.filter(d => d.shouldCleanup).length

      const report = {
        totalSessions: connections.length,
        healthySessions,
        corruptedSessions,
        details
      }

      console.log(`[SessionCleanup] 📊 Reporte:`, {
        total: report.totalSessions,
        healthy: report.healthySessions,
        corrupted: report.corruptedSessions
      })

      return report

    } catch (error) {
      console.error(`[SessionCleanup] ❌ Error generando reporte:`, error)
      return {
        totalSessions: 0,
        healthySessions: 0,
        corruptedSessions: 0,
        details: []
      }
    }
  }
}
