/**
 * 🧠 SERVICIO DE CONTEXTO DE CONVERSACIÓN MEJORADO
 * Mantiene memoria completa de la conversación para responder preguntas de seguimiento
 */

interface ConversationContext {
  lastProductId: string
  lastProductName: string
  lastMentionedAt: Date
  messageCount: number
  // Nuevos campos para contexto enriquecido
  lastIntent: string // última intención detectada
  lastAction: string // última acción realizada
  conversationHistory: Array<{
    role: 'user' | 'bot'
    message: string
    intent: string
    timestamp: Date
  }>
  productDetails?: {
    price: number
    category: string
    type: 'digital' | 'physical'
    paymentMethods?: string[]
  }
  userPreferences?: {
    preferredPaymentMethod?: string
    budget?: number
    interests?: string[]
  }
}

export class ConversationContextService {
  // Memoria en RAM (por conversación)
  private static contexts = new Map<string, ConversationContext>()
  
  // Tiempo máximo de memoria: 30 minutos (aumentado)
  private static CONTEXT_TIMEOUT = 30 * 60 * 1000

  /**
   * Guardar producto en el contexto de la conversación
   */
  static setProductContext(
    conversationKey: string,
    productId: string,
    productName: string,
    productDetails?: {
      price: number
      category: string
      type: 'digital' | 'physical'
      paymentMethods?: string[]
    }
  ): void {
    const existing = this.contexts.get(conversationKey)
    
    this.contexts.set(conversationKey, {
      lastProductId: productId,
      lastProductName: productName,
      lastMentionedAt: new Date(),
      messageCount: existing ? existing.messageCount + 1 : 1,
      lastIntent: existing?.lastIntent || 'product_search',
      lastAction: 'product_shown',
      conversationHistory: existing?.conversationHistory || [],
      productDetails,
      userPreferences: existing?.userPreferences
    })

    console.log(`[Context] 💾 Guardado en memoria: ${productName} para ${conversationKey}`)
  }

  /**
   * Agregar mensaje al historial de conversación
   */
  static addMessage(
    conversationKey: string,
    role: 'user' | 'bot',
    message: string,
    intent: string
  ): void {
    const context = this.contexts.get(conversationKey)
    if (!context) return

    context.conversationHistory.push({
      role,
      message,
      intent,
      timestamp: new Date()
    })

    // Mantener solo los últimos 20 mensajes
    if (context.conversationHistory.length > 20) {
      context.conversationHistory = context.conversationHistory.slice(-20)
    }

    context.lastMentionedAt = new Date()
  }

  /**
   * Actualizar intención y acción actual
   */
  static updateIntent(
    conversationKey: string,
    intent: string,
    action?: string
  ): void {
    const context = this.contexts.get(conversationKey)
    if (!context) return

    context.lastIntent = intent
    if (action) context.lastAction = action
    context.lastMentionedAt = new Date()
  }

  /**
   * Guardar preferencias del usuario
   */
  static setUserPreference(
    conversationKey: string,
    key: string,
    value: any
  ): void {
    const context = this.contexts.get(conversationKey)
    if (!context) return

    if (!context.userPreferences) {
      context.userPreferences = {}
    }

    context.userPreferences[key] = value
    console.log(`[Context] 💡 Preferencia guardada: ${key} = ${value}`)
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
      console.log(`[Context] 🔄 Contexto renovado para ${conversationKey} (${context.messageCount} mensajes)`)
    }
  }

  /**
   * Renovar tiempo del contexto (mantener vivo)
   */
  static renewContext(conversationKey: string): void {
    const context = this.contexts.get(conversationKey)
    if (context) {
      context.lastMentionedAt = new Date()
      console.log(`[Context] ⏰ Tiempo renovado para ${conversationKey}`)
    }
  }

  /**
   * Limpiar contextos expirados (mantenimiento)
   */
  static cleanExpiredContexts(): void {
    const now = new Date().getTime()
    let cleaned = 0

    for (const [key, context] of Array.from(this.contexts.entries())) {
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
