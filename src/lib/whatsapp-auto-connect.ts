/**
 * 🔄 WhatsApp Auto Connect Adapter
 * 
 * Permite mantener compatibilidad con rutas que gestionan reconexiones automáticas.
 */

import { SafeReconnectManager } from './safe-reconnect-manager'
import { BaileysStableService } from './baileys-stable-service'

export class WhatsAppAutoConnect {
  /**
   * Obtener estado global de reconexiones
   */
  static getStatus() {
    return {
      active: true,
      manager: 'SafeReconnectManager',
      stats: 'Ajustado para evitar bans'
    }
  }

  /**
   * Forzar reconexión para un usuario
   */
  static async forceReconnect(userId: string): Promise<boolean> {
    console.log(`[AutoConnect] 🔄 Forzando reconexión para ${userId}`)
    
    // Si ya está conectando, no duplicar
    if (!SafeReconnectManager.canReconnect(userId)) {
      return false
    }

    try {
      const result = await BaileysStableService.initializeConnection(userId)
      return result.success
    } catch (e) {
      console.error('[AutoConnect] Error forzando reconexión:', e)
      return false
    }
  }
}
