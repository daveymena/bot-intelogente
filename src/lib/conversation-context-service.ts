/**
 * 🧠 SERVICIO DE CONTEXTO DE CONVERSACIÓN
 * Mantiene memoria del último producto mencionado por conversación
 */

interface ConversationContext {
  lastProductId: string
  lastProductName: string
  lastMentionedAt: Date
  messageCount: number
}

export class ConversationContextService {
  // Memoria en RAM (por conversación)
  private static contexts = new Map<string, ConversationContext>()
  
  // Tiempo máximo de memoria: 10 minutos
  private static CONTEXT_TIMEOUT = 10 * 60 * 1000

  /**
   * Guardar producto en el contexto de la conversación
   */
  static setProductContext(
    conversationKey: string,
    productId: string,
    productName: string
  ): void {
    const existing = this.contexts.get(conversationKey)
    
    this.contexts.set(conversationKey, {
      lastProductId: productId,
      lastProductName: productName,
      lastMentionedAt: new Date(),
      messageCount: existing ? existing.messageCount + 1 : 1
    })

    console.log(`[Context] 💾 Guardado en memoria: ${productName} para ${conversationKey}`)
  }

  /**
   * Obtener producto del contexto de la conversación
   */
  static getProductContext(conversationKey: string): ConversationContext | null {
    const context = this.contexts.get(conversationKey)
    
    if (!context) {
      console.log(`[Context] ❌ No hay contexto para ${conversationKey}`)
      return null
    }

    // Verificar si el contexto expiró
    const now = new Date().getTime()
    const lastMention = context.lastMentionedAt.getTime()
    const elapsed = now - lastMention

    if (elapsed > this.CONTEXT_TIMEOUT) {
      console.log(`[Context] ⏰ Contexto expirado para ${conversationKey} (${Math.round(elapsed / 1000)}s)`)
      this.contexts.delete(conversationKey)
      return null
    }

    console.log(`[Context] ✅ Contexto encontrado: ${context.lastProductName} (${context.messageCount} mensajes)`)
    return context
  }

  /**
   * Limpiar contexto de una conversación
   */
  static clearContext(conversationKey: string): void {
    this.contexts.delete(conversationKey)
    console.log(`[Context] 🗑️ Contexto limpiado para ${conversationKey}`)
  }

  /**
   * Actualizar contador de mensajes (sin cambiar producto)
   */
  static incrementMessageCount(conversationKey: string): void {
    const context = this.contexts.get(conversationKey)
    if (context) {
      context.messageCount++
      context.lastMentionedAt = new Date() // Renovar tiempo
    }
  }

  /**
   * Limpiar contextos expirados (mantenimiento)
   */
  static cleanExpiredContexts(): void {
    const now = new Date().getTime()
    let cleaned = 0

    for (const [key, context] of this.contexts.entries()) {
      const elapsed = now - context.lastMentionedAt.getTime()
      if (elapsed > this.CONTEXT_TIMEOUT) {
        this.contexts.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`[Context] 🧹 Limpiados ${cleaned} contextos expirados`)
    }
  }

  /**
   * Obtener estadísticas de contextos activos
   */
  static getStats(): { total: number, contexts: Array<{ key: string, product: string, messages: number }> } {
    const contexts = Array.from(this.contexts.entries()).map(([key, ctx]) => ({
      key,
      product: ctx.lastProductName,
      messages: ctx.messageCount
    }))

    return {
      total: contexts.length,
      contexts
    }
  }
}

// Limpiar contextos expirados cada 5 minutos
setInterval(() => {
  ConversationContextService.cleanExpiredContexts()
}, 5 * 60 * 1000)
