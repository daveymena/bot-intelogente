/**
 * 🧠 SERVICIO DE CONTEXTO DE CONVERSACIÓN HÍBRIDO
 * Combina memoria en RAM con persistencia en base de datos
 * Mantiene el contexto de conversaciones de WhatsApp
 */

import { db } from './db'

interface ConversationMessage {
  role: 'user' | 'bot' | 'system'
  message: string
  timestamp: Date
  messageType?: string
}

interface ProductDetails {
  price: number
  category: string
  type: 'digital' | 'physical'
}

interface ConversationContext {
  userId: string
  customerPhone: string
  lastProductId?: string
  lastProductName?: string
  lastIntent?: string
  lastAction?: string
  conversationHistory: ConversationMessage[]
  productDetails?: ProductDetails
  userPreferences?: Record<string, any>
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export class ConversationContextHybrid {
  private static contexts: Map<string, ConversationContext> = new Map()
  private static readonly MAX_HISTORY_LENGTH = 50
  private static readonly CLEANUP_INTERVAL = 3600000 // 1 hora

  /**
   * Generar clave única para el contexto
   */
  private static getContextKey(userId: string, customerPhone: string): string {
    return `${userId}:${customerPhone}`
  }

  /**
   * Obtener contexto completo
   */
  static async getContext(userId: string, customerPhone: string): Promise<ConversationContext | null> {
    const key = this.getContextKey(userId, customerPhone)
    
    // Primero buscar en memoria
    if (this.contexts.has(key)) {
      return this.contexts.get(key)!
    }

    // Buscar en base de datos
    try {
      const conversation = await db.conversation.findFirst({
        where: {
          userId: userId,
          customerPhone: customerPhone
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: this.MAX_HISTORY_LENGTH
          }
        }
      })

      if (conversation) {
        const context: ConversationContext = {
          userId: conversation.userId,
          customerPhone: conversation.customerPhone,
          lastProductId: conversation.productId?.toString(),
          lastProductName: conversation.productName || undefined,
          lastIntent: conversation.lastIntent || undefined,
          lastAction: conversation.lastAction || undefined,
          conversationHistory: conversation.messages.reverse().map(msg => ({
            role: msg.role as 'user' | 'bot' | 'system',
            message: msg.content,
            timestamp: msg.createdAt,
            messageType: msg.messageType || 'message'
          })),
          userPreferences: conversation.metadata as Record<string, any> || {},
          metadata: conversation.metadata as Record<string, any> || {},
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt
        }

        // Guardar en memoria para acceso rápido
        this.contexts.set(key, context)
        return context
      }
    } catch (error) {
      console.error('[ConversationContextHybrid] Error al obtener contexto:', error)
    }

    return null
  }

  /**
   * Obtener contexto específico de producto
   */
  static async getProductContext(userId: string, customerPhone: string): Promise<ConversationContext | null> {
    const context = await this.getContext(userId, customerPhone)
    
    if (context && context.lastProductId) {
      return context
    }

    return null
  }

  /**
   * Guardar contexto de producto
   */
  static async saveProductContext(
    userId: string,
    customerPhone: string,
    productId: string,
    productName: string,
    productDetails?: ProductDetails
  ): Promise<void> {
    const key = this.getContextKey(userId, customerPhone)
    const now = new Date()

    // Actualizar memoria
    let context = this.contexts.get(key)
    if (!context) {
      context = {
        userId,
        customerPhone,
        conversationHistory: [],
        createdAt: now,
        updatedAt: now
      }
    }

    context.lastProductId = productId
    context.lastProductName = productName
    context.productDetails = productDetails
    context.updatedAt = now

    this.contexts.set(key, context)

    // Persistir en base de datos
    try {
      await db.conversation.upsert({
        where: {
          userId_customerPhone: {
            userId: userId,
            customerPhone: customerPhone
          }
        },
        update: {
          productId: parseInt(productId) || null,
          productName: productName,
          lastIntent: 'product_interest',
          lastAction: 'product_selected',
          metadata: {
            ...context.metadata,
            productDetails: productDetails
          },
          updatedAt: now
        },
        create: {
          userId: userId,
          customerPhone: customerPhone,
          productId: parseInt(productId) || null,
          productName: productName,
          status: 'ACTIVE',
          lastIntent: 'product_interest',
          lastAction: 'product_selected',
          metadata: {
            productDetails: productDetails
          },
          createdAt: now,
          updatedAt: now
        }
      })
    } catch (error) {
      console.error('[ConversationContextHybrid] Error al guardar contexto de producto:', error)
    }
  }

  /**
   * Agregar mensaje al historial
   */
  static async addMessage(
    userId: string,
    customerPhone: string,
    role: 'user' | 'bot' | 'system',
    message: string,
    messageType: string = 'message'
  ): Promise<void> {
    const key = this.getContextKey(userId, customerPhone)
    const now = new Date()

    // Actualizar memoria
    let context = this.contexts.get(key)
    if (!context) {
      context = {
        userId,
        customerPhone,
        conversationHistory: [],
        createdAt: now,
        updatedAt: now
      }
    }

    const newMessage: ConversationMessage = {
      role,
      message,
      timestamp: now,
      messageType
    }

    context.conversationHistory.push(newMessage)

    // Mantener solo los últimos mensajes
    if (context.conversationHistory.length > this.MAX_HISTORY_LENGTH) {
      context.conversationHistory = context.conversationHistory.slice(-this.MAX_HISTORY_LENGTH)
    }

    context.updatedAt = now
    this.contexts.set(key, context)

    // Persistir en base de datos
    try {
      // Asegurar que existe la conversación
      await db.conversation.upsert({
        where: {
          userId_customerPhone: {
            userId: userId,
            customerPhone: customerPhone
          }
        },
        update: {
          updatedAt: now
        },
        create: {
          userId: userId,
          customerPhone: customerPhone,
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now
        }
      })

      // Agregar el mensaje
      await db.conversationMessage.create({
        data: {
          conversationId: await this.getConversationId(userId, customerPhone),
          role: role,
          content: message,
          messageType: messageType,
          createdAt: now
        }
      })
    } catch (error) {
      console.error('[ConversationContextHybrid] Error al guardar mensaje:', error)
    }
  }

  /**
   * Actualizar contexto completo
   */
  static async updateContext(
    userId: string,
    customerPhone: string,
    updates: Partial<ConversationContext>
  ): Promise<void> {
    const key = this.getContextKey(userId, customerPhone)
    const now = new Date()

    // Actualizar memoria
    let context = this.contexts.get(key) || await this.getContext(userId, customerPhone)
    if (!context) {
      context = {
        userId,
        customerPhone,
        conversationHistory: [],
        createdAt: now,
        updatedAt: now
      }
    }

    // Aplicar actualizaciones
    Object.assign(context, updates, { updatedAt: now })
    this.contexts.set(key, context)

    // Persistir en base de datos
    try {
      await db.conversation.upsert({
        where: {
          userId_customerPhone: {
            userId: userId,
            customerPhone: customerPhone
          }
        },
        update: {
          productId: context.lastProductId ? parseInt(context.lastProductId) : null,
          productName: context.lastProductName,
          lastIntent: context.lastIntent,
          lastAction: context.lastAction,
          metadata: context.metadata,
          updatedAt: now
        },
        create: {
          userId: userId,
          customerPhone: customerPhone,
          productId: context.lastProductId ? parseInt(context.lastProductId) : null,
          productName: context.lastProductName,
          status: 'ACTIVE',
          lastIntent: context.lastIntent,
          lastAction: context.lastAction,
          metadata: context.metadata,
          createdAt: now,
          updatedAt: now
        }
      })
    } catch (error) {
      console.error('[ConversationContextHybrid] Error al actualizar contexto:', error)
    }
  }

  /**
   * Obtener ID de conversación
   */
  private static async getConversationId(userId: string, customerPhone: string): Promise<string> {
    try {
      const conversation = await db.conversation.findFirst({
        where: {
          userId: userId,
          customerPhone: customerPhone
        },
        select: { id: true }
      })

      return conversation?.id || 'default'
    } catch (error) {
      console.error('[ConversationContextHybrid] Error al obtener ID de conversación:', error)
      return 'default'
    }
  }

  /**
   * Limpiar contexto
   */
  static async clearContext(userId: string, customerPhone: string): Promise<void> {
    const key = this.getContextKey(userId, customerPhone)
    
    // Limpiar memoria
    this.contexts.delete(key)

    // Limpiar base de datos
    try {
      await db.conversation.updateMany({
        where: {
          userId: userId,
          customerPhone: customerPhone
        },
        data: {
          productId: null,
          productName: null,
          lastIntent: null,
          lastAction: null,
          status: 'INACTIVE'
        }
      })
    } catch (error) {
      console.error('[ConversationContextHybrid] Error al limpiar contexto:', error)
    }
  }

  /**
   * Obtener estadísticas
   */
  static getStats(): {
    totalContexts: number
    activeContexts: number
    memoryUsage: number
  } {
    const totalContexts = this.contexts.size
    const activeContexts = Array.from(this.contexts.values()).filter(
      ctx => Date.now() - ctx.updatedAt.getTime() < 3600000 // Activos en la última hora
    ).length

    return {
      totalContexts,
      activeContexts,
      memoryUsage: totalContexts * 1024 // Estimación aproximada en bytes
    }
  }

  /**
   * Limpieza automática de contextos antiguos
   */
  static cleanup(): void {
    const now = Date.now()
    const cutoff = now - this.CLEANUP_INTERVAL

    for (const [key, context] of this.contexts.entries()) {
      if (context.updatedAt.getTime() < cutoff) {
        this.contexts.delete(key)
      }
    }

    console.log(`[ConversationContextHybrid] Limpieza completada. Contextos activos: ${this.contexts.size}`)
  }

  /**
   * Inicializar limpieza automática
   */
  static initializeCleanup(): void {
    setInterval(() => {
      this.cleanup()
    }, this.CLEANUP_INTERVAL)

    console.log('[ConversationContextHybrid] Sistema de limpieza automática iniciado')
  }
}

// Inicializar limpieza automática al cargar el módulo
ConversationContextHybrid.initializeCleanup()