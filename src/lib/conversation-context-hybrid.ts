/**
 * 🔄 SERVICIO HÍBRIDO DE CONTEXTO
 * Combina memoria RAM (rápido) con Base de Datos (persistente)
 */

import { ConversationContextService } from './conversation-context-service'
import { ConversationContextDBService } from './conversation-context-db-service'

export class ConversationContextHybrid {
  /**
   * Guardar contexto (RAM + BD)
   */
  static async saveProductContext(
    userId: string,
    customerPhone: string,
    productId: string,
    productName: string,
    productDetails?: {
      price: number
      category: string
      type: 'digital' | 'physical'
      paymentMethods?: string[]
    }
  ): Promise<void> {
    const conversationKey = `${userId}:${customerPhone}`

    // 1. Guardar en RAM (rápido)
    ConversationContextService.setProductContext(
      conversationKey,
      productId,
      productName,
      productDetails
    )

    // 2. Guardar en BD (persistente)
    await ConversationContextDBService.saveContext(userId, customerPhone, {
      productId,
      productName,
      productDetails,
      action: 'product_shown'
    })

    console.log(`🔄 [Hybrid Context] Guardado en RAM + BD: ${productName}`)
  }

  /**
   * Agregar mensaje (RAM + BD)
   */
  static async addMessage(
    userId: string,
    customerPhone: string,
    role: 'user' | 'bot',
    message: string,
    intent: string
  ): Promise<void> {
    const conversationKey = `${userId}:${customerPhone}`

    // 1. Guardar en RAM
    ConversationContextService.addMessage(conversationKey, role, message, intent)

    // 2. Guardar en BD
    await ConversationContextDBService.saveContext(userId, customerPhone, {
      message: { role, text: message, intent }
    })

    console.log(`🔄 [Hybrid Context] Mensaje guardado: ${role}`)
  }

  /**
   * Obtener contexto (RAM primero, BD si no existe)
   */
  static async getProductContext(
    userId: string,
    customerPhone: string
  ): Promise<any> {
    const conversationKey = `${userId}:${customerPhone}`

    // 1. Intentar obtener de RAM (rápido)
    let context = ConversationContextService.getProductContext(conversationKey)

    if (context) {
      console.log(`🔄 [Hybrid Context] Contexto encontrado en RAM`)
      return context
    }

    // 2. Si no está en RAM, buscar en BD
    console.log(`🔄 [Hybrid Context] No está en RAM, buscando en BD...`)
    const dbContext = await ConversationContextDBService.getContext(userId, customerPhone)

    if (dbContext) {
      // Restaurar en RAM para próximas consultas
      if (dbContext.lastProductId && dbContext.lastProductName) {
        ConversationContextService.setProductContext(
          conversationKey,
          dbContext.lastProductId,
          dbContext.lastProductName,
          dbContext.productDetails
        )
      }

      console.log(`🔄 [Hybrid Context] Contexto restaurado desde BD`)
      return {
        lastProductId: dbContext.lastProductId,
        lastProductName: dbContext.lastProductName,
        lastMentionedAt: dbContext.lastUpdated,
        messageCount: dbContext.messageHistory.length,
        lastIntent: dbContext.lastIntent,
        lastAction: dbContext.lastAction,
        conversationHistory: dbContext.messageHistory,
        productDetails: dbContext.productDetails,
        userPreferences: dbContext.userPreferences
      }
    }

    console.log(`🔄 [Hybrid Context] No hay contexto disponible`)
    return null
  }

  /**
   * Obtener resumen del contexto
   */
  static async getContextSummary(
    userId: string,
    customerPhone: string
  ): Promise<string> {
    const context = await this.getProductContext(userId, customerPhone)

    if (!context) {
      return 'Cliente nuevo, sin historial previo.'
    }

    let summary = `📋 CONTEXTO:\n\n`

    if (context.lastProductName) {
      summary += `🎯 Producto actual: ${context.lastProductName}\n`
    }

    if (context.conversationHistory && context.conversationHistory.length > 0) {
      summary += `💬 Mensajes recientes: ${context.conversationHistory.length}\n`
      const lastMessages = context.conversationHistory.slice(-3)
      lastMessages.forEach((msg: any) => {
        const emoji = msg.role === 'user' ? '👤' : '🤖'
        summary += `${emoji} ${msg.message.substring(0, 80)}...\n`
      })
    }

    if (context.productDetails) {
      summary += `\n💰 Precio: $${context.productDetails.price.toLocaleString()}\n`
      summary += `📦 Tipo: ${context.productDetails.type === 'PHYSICAL' ? 'Físico' : 'Digital'}\n`
    }

    return summary
  }

  /**
   * Renovar contexto (mantener vivo)
   */
  static async renewContext(
    userId: string,
    customerPhone: string
  ): Promise<void> {
    const conversationKey = `${userId}:${customerPhone}`

    // Renovar en RAM
    ConversationContextService.renewContext(conversationKey)

    // Actualizar timestamp en BD
    await ConversationContextDBService.saveContext(userId, customerPhone, {})
  }

  /**
   * Limpiar contexto
   */
  static async clearContext(
    userId: string,
    customerPhone: string
  ): Promise<void> {
    const conversationKey = `${userId}:${customerPhone}`

    // Limpiar RAM
    ConversationContextService.clearContext(conversationKey)

    // Cerrar en BD
    await ConversationContextDBService.closeConversation(userId, customerPhone)

    console.log(`🔄 [Hybrid Context] Contexto limpiado completamente`)
  }
}
