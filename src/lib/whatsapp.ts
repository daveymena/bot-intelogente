/**
 * 📱 WhatsApp Service Adapter
 * 
 * Este adaptador mantiene la compatibilidad con rutas que usan @/lib/whatsapp
 * Centraliza las llamadas en el BaileysStableService.
 */

import { BaileysStableService } from './baileys-stable-service'
import { db } from './db'

export class WhatsAppService {
  /**
   * Obtener estado de conexión
   */
  static async getConnectionStatus(userId: string) {
    return BaileysStableService.getConnectionStatus(userId)
  }

  /**
   * Verificar salud de la conexión
   */
  static async checkConnectionHealth(userId: string) {
    const session = BaileysStableService.getConnectionStatus(userId)
    return {
      status: session?.status === 'CONNECTED' ? 'healthy' : 'unhealthy',
      latency: 'ok'
    }
  }

  /**
   * Obtener estadísticas de conexión
   */
  static async getConnectionStats(userId: string) {
    const connection = await db.whatsAppConnection.findUnique({
      where: { userId }
    })
    return {
      uptime: connection?.lastConnectedAt ? '24/7' : 'N/A',
      messagesSent: 0, // Podríamos contar de la DB
      lastMessageAt: connection?.lastMessageAt
    }
  }

  /**
   * Inicializar conexión
   */
  static async initializeConnection(userId: string, phoneNumber: string) {
    console.log(`[Adapter] Inicializando conexión para ${phoneNumber}...`)
    return await BaileysStableService.initializeConnection(userId)
  }

  /**
   * Generar nuevo código QR
   */
  static async generateQRCode(connectionId: string, phoneNumber: string) {
    // En Baileys, esto implica reinicializar la conexión
    const connection = await db.whatsAppConnection.findUnique({ where: { id: connectionId } })
    if (!connection) return null
    
    const result = await BaileysStableService.initializeConnection(connection.userId)
    return result.qr || null
  }

  /**
   * Desconectar
   */
  static async disconnect(userId: string) {
    return await BaileysStableService.disconnect(userId)
  }

  /**
   * Reconexión automática
   */
  static async autoReconnect(userId: string) {
    const result = await BaileysStableService.initializeConnection(userId)
    return result.success
  }
}
