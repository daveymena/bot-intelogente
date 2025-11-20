/**
 * 🔌 MANEJADOR SIMPLE DE MENSAJES
 * Integra el SimpleBotEngine con Baileys
 * Reemplaza todo el sistema complejo anterior
 */

import { AdvancedBotEngine } from './advanced-bot-engine'
import { db } from './db'

export class SimpleBotHandler {
  /**
   * Procesar mensaje entrante de WhatsApp
   */
  static async handleIncomingMessage(
    userId: string,
    customerPhone: string,
    message: string,
    sock: any
  ): Promise<void> {
    try {
      console.log(`[SimpleBotHandler] 📨 Mensaje de ${customerPhone}: "${message}"`)
      
      // 1. Guardar mensaje en BD
      await this.saveMessage(userId, customerPhone, message, 'INCOMING')
      
      // 2. Procesar con el motor avanzado
      const response = await AdvancedBotEngine.processMessage(
        customerPhone,
        userId,
        message
      )
      
      // 3. Enviar respuesta
      await this.sendMessage(sock, customerPhone, response)
      
      // 4. Guardar respuesta en BD
      await this.saveMessage(userId, customerPhone, response, 'OUTGOING')
      
      console.log(`[SimpleBotHandler] ✅ Respuesta enviada`)
      
    } catch (error) {
      console.error('[SimpleBotHandler] ❌ Error:', error)
      
      // Respuesta de error
      const errorResponse = `Disculpa, tuve un problema técnico. ¿Puedes intentar de nuevo? 😊`
      await this.sendMessage(sock, customerPhone, errorResponse)
    }
  }

  /**
   * Enviar mensaje por WhatsApp
   */
  private static async sendMessage(
    sock: any,
    phone: string,
    message: string
  ): Promise<void> {
    try {
      // Simular escritura (más humano)
      const typingTime = Math.min(message.length * 30, 3000) // Max 3 segundos
      
      await sock.sendPresenceUpdate('composing', phone)
      await new Promise(resolve => setTimeout(resolve, typingTime))
      await sock.sendPresenceUpdate('paused', phone)
      
      // Enviar mensaje
      await sock.sendMessage(phone, { text: message })
      
    } catch (error) {
      console.error('[SimpleBotHandler] Error enviando mensaje:', error)
      throw error
    }
  }

  /**
   * Guardar mensaje en base de datos
   */
  private static async saveMessage(
    userId: string,
    customerPhone: string,
    content: string,
    direction: 'INCOMING' | 'OUTGOING'
  ): Promise<void> {
    try {
      // Buscar o crear conversación
      let conversation = await db.conversation.findFirst({
        where: {
          userId,
          customerPhone,
          status: 'ACTIVE'
        }
      })

      if (!conversation) {
        conversation = await db.conversation.create({
          data: {
            userId,
            customerPhone,
            customerName: customerPhone.split('@')[0],
            status: 'ACTIVE'
          }
        })
      }

      // Guardar mensaje
      await db.message.create({
        data: {
          conversationId: conversation.id,
          content,
          direction
        }
      })
      
    } catch (error) {
      console.error('[SimpleBotHandler] Error guardando mensaje:', error)
      // No lanzar error, solo logear
    }
  }

  /**
   * Limpiar memoria de un chat
   */
  static clearChatMemory(customerPhone: string): void {
    AdvancedBotEngine.clearMemory(customerPhone)
  }

  /**
   * Obtener estado de memoria (debugging)
   */
  static getMemoryState(customerPhone: string, userId: string) {
    return AdvancedBotEngine.getMemoryState(customerPhone, userId)
  }
}
