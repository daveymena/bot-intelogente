/**
 * Baileys Local AI Integration
 * Integra la IA local directamente en el flujo de Baileys
 * Reemplaza intelligent-conversation-engine que requiere Groq/Ollama
 */

import { WASocket } from '@whiskeysockets/baileys'
import { LocalAIOnlyService } from './local-ai-only-service'
import { LocalAISmartPhotos } from './local-ai-smart-photos'
import { DynamicPaymentLinks } from './dynamic-payment-links'
import { db } from './db'

interface MessageProcessResult {
  success: boolean
  message: string
  confidence: number
  intent: string
  shouldSendPhotos: boolean
  photoProductIds?: string[]
  paymentLink?: string
  responseTime: number
  error?: string
}

export class BaileysLocalAIIntegration {
  /**
   * Procesar mensaje con IA local
   */
  static async processMessageWithLocalAI(
    socket: WASocket,
    userId: string,
    from: string,
    messageText: string,
    conversationId: string
  ): Promise<MessageProcessResult> {
    const startTime = Date.now()

    try {
      console.log(`[BaileysLocalAI] 🧠 Procesando mensaje con IA Local...`)

      // Inicializar IA Local si no está lista
      await LocalAIOnlyService.initialize()

      // Obtener historial de conversación
      const history = await this.getConversationHistory(conversationId)

      // Procesar con IA Local
      const aiResponse = await LocalAIOnlyService.processMessage(
        messageText,
        userId,
        history,
        from
      )

      console.log(`[BaileysLocalAI] ✅ IA Local procesó: ${aiResponse.intent}`)

      // Enviar respuesta principal
      await socket.sendMessage(from, { text: aiResponse.message })
      console.log(`[BaileysLocalAI] 📤 Mensaje enviado`)

      // Guardar respuesta en BD
      await db.message.create({
        data: {
          conversationId,
          content: aiResponse.message,
          direction: 'OUTGOING',
          type: 'TEXT'
        }
      })

      // Enviar fotos si es necesario
      if (aiResponse.shouldSendPhotos && aiResponse.photoProductIds) {
        console.log(`[BaileysLocalAI] 📸 Enviando fotos inteligentes...`)

        try {
          // Obtener productos
          const products = await db.product.findMany({
            where: {
              id: {
                in: aiResponse.photoProductIds
              }
            }
          })

          // Enviar fotos
          await LocalAISmartPhotos.sendSmartPhotos(
            socket,
            from,
            products,
            aiResponse.intent,
            userId
          )

          console.log(`[BaileysLocalAI] ✅ Fotos enviadas`)
        } catch (photoError) {
          console.error(`[BaileysLocalAI] ⚠️ Error enviando fotos:`, photoError)
        }
      }

      // Generar link de pago si es necesario
      if (aiResponse.paymentLink) {
        console.log(`[BaileysLocalAI] 💳 Enviando link de pago...`)

        try {
          const paymentMessage = `\n💳 *Link de Pago*\n${aiResponse.paymentLink}`
          await socket.sendMessage(from, { text: paymentMessage })

          await db.message.create({
            data: {
              conversationId,
              content: paymentMessage,
              direction: 'OUTGOING',
              type: 'TEXT'
            }
          })

          console.log(`[BaileysLocalAI] ✅ Link de pago enviado`)
        } catch (paymentError) {
          console.error(`[BaileysLocalAI] ⚠️ Error enviando link:`, paymentError)
        }
      }

      // Actualizar conversación
      await db.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
      })

      const responseTime = Date.now() - startTime

      return {
        success: true,
        message: aiResponse.message,
        confidence: aiResponse.confidence,
        intent: aiResponse.intent,
        shouldSendPhotos: aiResponse.shouldSendPhotos,
        photoProductIds: aiResponse.photoProductIds,
        paymentLink: aiResponse.paymentLink,
        responseTime
      }
    } catch (error) {
      console.error(`[BaileysLocalAI] ❌ Error procesando mensaje:`, error)

      const responseTime = Date.now() - startTime

      return {
        success: false,
        message: 'Disculpa, tuve un problema procesando tu mensaje. Intenta de nuevo.',
        confidence: 0,
        intent: 'error',
        shouldSendPhotos: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Obtener historial de conversación
   */
  private static async getConversationHistory(conversationId: string): Promise<any[]> {
    try {
      const messages = await db.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: 10
      })

      // Invertir para orden cronológico
      return messages.reverse().map(msg => ({
        role: msg.direction === 'INCOMING' ? 'user' : 'assistant',
        content: msg.content
      }))
    } catch (error) {
      console.error(`[BaileysLocalAI] ⚠️ Error obteniendo historial:`, error)
      return []
    }
  }

  /**
   * Procesar múltiples mensajes
   */
  static async processMultipleMessages(
    socket: WASocket,
    userId: string,
    from: string,
    messages: string[],
    conversationId: string
  ): Promise<MessageProcessResult[]> {
    const results: MessageProcessResult[] = []

    for (const message of messages) {
      const result = await this.processMessageWithLocalAI(
        socket,
        userId,
        from,
        message,
        conversationId
      )
      results.push(result)

      // Esperar entre mensajes
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    return results
  }

  /**
   * Obtener estadísticas de IA Local
   */
  static async getStats() {
    try {
      const stats = LocalAIOnlyService.getStats()

      return {
        ...stats,
        timestamp: new Date(),
        status: 'active'
      }
    } catch (error) {
      console.error(`[BaileysLocalAI] ❌ Error obteniendo estadísticas:`, error)
      return {
        isInitialized: false,
        trainingDataSize: 0,
        productsCount: 0,
        paymentMethodsCount: 0,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Verificar que IA Local está lista
   */
  static async verifyLocalAIReady(): Promise<boolean> {
    try {
      await LocalAIOnlyService.initialize()
      const stats = LocalAIOnlyService.getStats()
      return stats.isInitialized && stats.trainingDataSize > 0
    } catch (error) {
      console.error(`[BaileysLocalAI] ❌ Error verificando IA Local:`, error)
      return false
    }
  }
}

export default BaileysLocalAIIntegration
