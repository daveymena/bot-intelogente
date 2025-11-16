/**
 * Conversation Memory Service
 * Mantiene contexto de la conversación actual
 * Recuerda productos, intenciones y contexto previo
 */

interface ConversationContext {
  userId: string
  from: string
  lastProduct: {
    id: string
    name: string
    description: string
    price: number
  } | null
  lastIntent: string
  messageHistory: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: number
  }>
  createdAt: number
  lastActivityAt: number
}

export class ConversationMemoryService {
  private static conversations: Map<string, ConversationContext> = new Map()
  private static readonly MEMORY_TIMEOUT = 30 * 60 * 1000 // 30 minutos

  /**
   * Obtener o crear contexto de conversación
   */
  static getOrCreateContext(userId: string, from: string): ConversationContext {
    const key = `${userId}:${from}`

    // Si existe y no ha expirado, retornar
    if (this.conversations.has(key)) {
      const context = this.conversations.get(key)!
      const age = Date.now() - context.lastActivityAt

      if (age < this.MEMORY_TIMEOUT) {
        context.lastActivityAt = Date.now()
        return context
      } else {
        // Expiró, eliminar
        this.conversations.delete(key)
      }
    }

    // Crear nuevo contexto
    const context: ConversationContext = {
      userId,
      from,
      lastProduct: null,
      lastIntent: 'general',
      messageHistory: [],
      createdAt: Date.now(),
      lastActivityAt: Date.now()
    }

    this.conversations.set(key, context)
    console.log(`[Memory] 📝 Nuevo contexto creado para ${from}`)

    return context
  }

  /**
   * Agregar mensaje al historial
   */
  static addMessage(
    userId: string,
    from: string,
    role: 'user' | 'assistant',
    content: string
  ): void {
    const context = this.getOrCreateContext(userId, from)

    context.messageHistory.push({
      role,
      content,
      timestamp: Date.now()
    })

    // Mantener solo últimos 20 mensajes
    if (context.messageHistory.length > 20) {
      context.messageHistory = context.messageHistory.slice(-20)
    }

    context.lastActivityAt = Date.now()
  }

  /**
   * Actualizar producto en contexto
   */
  static setLastProduct(
    userId: string,
    from: string,
    product: { id: string; name: string; description: string; price: number }
  ): void {
    const context = this.getOrCreateContext(userId, from)
    context.lastProduct = product
    context.lastActivityAt = Date.now()

    console.log(`[Memory] 📦 Producto guardado: ${product.name}`)
  }

  /**
   * Obtener último producto
   */
  static getLastProduct(userId: string, from: string): any | null {
    const context = this.getOrCreateContext(userId, from)
    return context.lastProduct
  }

  /**
   * Actualizar intención
   */
  static setLastIntent(userId: string, from: string, intent: string): void {
    const context = this.getOrCreateContext(userId, from)
    context.lastIntent = intent
    context.lastActivityAt = Date.now()
  }

  /**
   * Obtener intención anterior
   */
  static getLastIntent(userId: string, from: string): string {
    const context = this.getOrCreateContext(userId, from)
    return context.lastIntent
  }

  /**
   * Obtener historial de mensajes
   */
  static getMessageHistory(userId: string, from: string): Array<{
    role: 'user' | 'assistant'
    content: string
  }> {
    const context = this.getOrCreateContext(userId, from)
    return context.messageHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
  }

  /**
   * Obtener contexto completo como string para usar en búsqueda
   */
  static getContextSummary(userId: string, from: string): string {
    const context = this.getOrCreateContext(userId, from)

    let summary = ''

    if (context.lastProduct) {
      summary += `Producto anterior: ${context.lastProduct.name}. `
    }

    if (context.lastIntent) {
      summary += `Intención anterior: ${context.lastIntent}. `
    }

    if (context.messageHistory.length > 0) {
      const lastUserMessage = [...context.messageHistory]
        .reverse()
        .find(m => m.role === 'user')

      if (lastUserMessage) {
        summary += `Último mensaje del usuario: "${lastUserMessage.content}". `
      }
    }

    return summary
  }

  /**
   * Detectar si el usuario está pidiendo más información del producto anterior
   */
  static isAskingForMoreInfo(userId: string, from: string, userMessage: string): boolean {
    const context = this.getOrCreateContext(userId, from)

    if (!context.lastProduct) {
      return false
    }

    const lowerMessage = userMessage.toLowerCase()

    // Palabras clave que indican que quiere más información
    const moreInfoKeywords = [
      'más',
      'mas',
      'detalles',
      'características',
      'especificaciones',
      'información',
      'cuéntame',
      'dime',
      'explica',
      'cómo',
      'cuándo',
      'dónde',
      'precio',
      'costo',
      'garantía',
      'envío',
      'entrega',
      'disponible',
      'stock',
      'sí',
      'si',
      'claro',
      'dale',
      'ok',
      'okay',
      'perfecto',
      'genial',
      'excelente'
    ]

    const isAskingMore = moreInfoKeywords.some(keyword => lowerMessage.includes(keyword))

    if (isAskingMore) {
      console.log(`[Memory] 💭 Usuario pidiendo más información sobre: ${context.lastProduct.name}`)
      return true
    }

    return false
  }

  /**
   * Limpiar contexto expirado
   */
  static cleanupExpired(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, context] of this.conversations.entries()) {
      if (now - context.lastActivityAt > this.MEMORY_TIMEOUT) {
        this.conversations.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`[Memory] 🗑️ Limpiados ${cleaned} contextos expirados`)
    }
  }

  /**
   * Obtener estadísticas
   */
  static getStats(): {
    activeConversations: number
    totalMessages: number
  } {
    let totalMessages = 0

    for (const context of this.conversations.values()) {
      totalMessages += context.messageHistory.length
    }

    return {
      activeConversations: this.conversations.size,
      totalMessages
    }
  }

  /**
   * Limpiar todo (para testing)
   */
  static clear(): void {
    this.conversations.clear()
    console.log(`[Memory] 🗑️ Memoria limpiada`)
  }
}

export default ConversationMemoryService
