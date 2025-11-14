/**
 * 💬 HANDLER DE MENSAJES CON SISTEMA HÍBRIDO
 * Procesa todos los mensajes de WhatsApp con inteligencia
 */

import { BotHybridIntegration } from './bot-hybrid-integration'
import { db } from './db'

export class HybridMessageHandler {
  private botIntegration: BotHybridIntegration

  constructor(groqApiKey?: string) {
    this.botIntegration = new BotHybridIntegration(groqApiKey)
  }

  /**
   * Procesar mensaje entrante de WhatsApp
   */
  async handleIncomingMessage(
    message: string,
    from: string,
    userId: string
  ): Promise<string> {
    try {
      console.log(`📨 Mensaje de ${from}: "${message}"`)

      // Procesar con sistema híbrido
      const response = await this.botIntegration.processMessage(
        message,
        from,
        userId
      )

      console.log(`💬 Respuesta: "${response.substring(0, 100)}..."`)

      // Guardar en base de datos
      await this.saveMessage(userId, from, message, response)

      return response

    } catch (error) {
      console.error('❌ Error en handler:', error)
      return '😅 Disculpa, tuve un problema. ¿Puedes intentar de nuevo?'
    }
  }

  /**
   * Guardar mensaje en base de datos
   */
  private async saveMessage(
    userId: string,
    from: string,
    userMessage: string,
    botResponse: string
  ) {
    try {
      await db.message.create({
        data: {
          userId,
          from,
          content: userMessage,
          response: botResponse,
          timestamp: new Date()
        }
      })
    } catch (error) {
      console.error('Error guardando mensaje:', error)
    }
  }

  /**
   * Cambiar modo de IA
   */
  setAIMode(enabled: boolean) {
    this.botIntegration.setAIMode(enabled)
  }
}
