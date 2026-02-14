/**
 * 📱 WhatsApp Web Service Adapter
 * 
 * Este servicio actúa como un puente (adapter) para mantener la compatibilidad 
 * con rutas antiguas que buscan un servicio centralizado de WhatsApp.
 * Redirige todas las llamadas al nuevo sistema robusto BaileysStableService.
 */

import { BaileysStableService } from './baileys-stable-service'
import { MessageQueueService } from './message-queue-service'

export class WhatsAppWebService {
  /**
   * Enviar mensaje (Adapter)
   */
  static async sendMessage(userId: string, to: string, content: string): Promise<boolean> {
    console.log(`[Adapter] Reenviando envío de mensaje a BaileysStableService...`)
    return await BaileysStableService.sendMessage(userId, to, content)
  }

  /**
   * Desconectar (Adapter)
   */
  static async disconnect(userId: string): Promise<boolean> {
    console.log(`[Adapter] Reenviando desconexión a BaileysStableService...`)
    return await BaileysStableService.disconnect(userId)
  }

  /**
   * Obtener estadísticas de la cola (Adapter)
   */
  static async getQueueStats(): Promise<any> {
    console.log(`[Adapter] Obteniendo stats de MessageQueueService...`)
    return await MessageQueueService.getQueueStats()
  }

  /**
   * Obtener estado de conexión (Adapter)
   */
  static async getConnectionStatus(userId: string) {
    return BaileysStableService.getConnectionStatus(userId)
  }
}
