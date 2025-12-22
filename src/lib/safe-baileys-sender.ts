/**
 * 🛡️ SAFE BAILEYS SENDER
 * Wrapper seguro para enviar mensajes con protección anti-ban
 */

import { AntiBanMiddleware } from './anti-ban-middleware'
import type { WASocket } from '@whiskeysockets/baileys'

export interface SafeSendOptions {
  userId: string
  recipient: string
  message: string
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'audio' | 'document'
  forceHumanize?: boolean
}

export class SafeBaileysSender {
  /**
   * Enviar mensaje de texto de forma segura
   */
  static async sendText(
    sock: WASocket,
    options: SafeSendOptions
  ): Promise<boolean> {
    try {
      const { userId, recipient, message, forceHumanize = true } = options

      // 1. Verificar rate limiting
      if (!AntiBanMiddleware.canSendMessage(userId)) {
        console.log(`⚠️ [SafeSender] Rate limit alcanzado para ${userId}`)
        return false
      }

      // 2. Verificar spam
      if (AntiBanMiddleware.isSpam(userId, recipient, message)) {
        console.log(`⚠️ [SafeSender] Mensaje detectado como spam`)
        return false
      }

      // 3. Delay humano
      await AntiBanMiddleware.humanDelay()

      // 4. Humanizar texto con variaciones inteligentes
      let finalMessage = message
      
      if (forceHumanize) {
        // Obtener cuántas veces se ha enviado este mensaje
        const phraseKey = message.toLowerCase().replace(/[^\w\s]/g, '').substring(0, 50).trim()
        const phraseCount = AntiBanMiddleware['metrics'].get(userId)?.phraseUsage.get(phraseKey) || 0
        
        // Usar variación según el número de veces enviado
        finalMessage = AntiBanMiddleware.generateMessageVariation(message, phraseCount)
      }

      // 5. Enviar mensaje
      await sock.sendMessage(recipient, { text: finalMessage })

      // 6. Registrar envío
      AntiBanMiddleware.recordMessage(userId, recipient, message)

      console.log(`✅ [SafeSender] Mensaje enviado a ${recipient}`)
      return true

    } catch (error) {
      console.error(`❌ [SafeSender] Error enviando mensaje:`, error)
      return false
    }
  }

  /**
   * Enviar media de forma segura
   */
  static async sendMedia(
    sock: WASocket,
    options: SafeSendOptions
  ): Promise<boolean> {
    try {
      const { userId, recipient, message, mediaUrl, mediaType = 'image' } = options

      if (!mediaUrl) {
        console.error(`❌ [SafeSender] Media URL requerida`)
        return false
      }

      // 1. Verificar rate limiting
      if (!AntiBanMiddleware.canSendMessage(userId)) {
        console.log(`⚠️ [SafeSender] Rate limit alcanzado para ${userId}`)
        return false
      }

      // 2. Delay humano extra para media
      await AntiBanMiddleware.mediaDelay()

      // 3. Enviar media según tipo
      const mediaMessage: any = {
        caption: message
      }

      switch (mediaType) {
        case 'image':
          mediaMessage.image = { url: mediaUrl }
          break
        case 'video':
          mediaMessage.video = { url: mediaUrl }
          break
        case 'audio':
          mediaMessage.audio = { url: mediaUrl }
          break
        case 'document':
          mediaMessage.document = { url: mediaUrl }
          break
      }

      await sock.sendMessage(recipient, mediaMessage)

      // 4. Registrar envío
      AntiBanMiddleware.recordMessage(userId, recipient, `[MEDIA] ${message}`)

      console.log(`✅ [SafeSender] Media enviada a ${recipient}`)
      return true

    } catch (error) {
      console.error(`❌ [SafeSender] Error enviando media:`, error)
      return false
    }
  }

  /**
   * Enviar múltiples mensajes de forma segura (con delays)
   */
  static async sendBatch(
    sock: WASocket,
    userId: string,
    messages: Array<{ recipient: string; message: string }>
  ): Promise<number> {
    let successCount = 0

    for (const msg of messages) {
      const success = await this.sendText(sock, {
        userId,
        recipient: msg.recipient,
        message: msg.message
      })

      if (success) {
        successCount++
      } else {
        // Si falla, esperar más tiempo antes del siguiente
        await new Promise(resolve => setTimeout(resolve, 5000))
      }

      // Delay entre mensajes del batch
      await AntiBanMiddleware.humanDelay()
    }

    return successCount
  }

  /**
   * Verificar si es seguro enviar mensaje
   */
  static canSend(userId: string, recipient: string, message: string): boolean {
    return AntiBanMiddleware.canSendMessage(userId) &&
           !AntiBanMiddleware.isSpam(userId, recipient, message)
  }

  /**
   * Obtener estadísticas de envío
   */
  static getStats(userId: string): any {
    return AntiBanMiddleware.getStats(userId)
  }

  /**
   * Resetear límites de usuario
   */
  static resetLimits(userId: string): void {
    AntiBanMiddleware.resetMetrics(userId)
  }
}
