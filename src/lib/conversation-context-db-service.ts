/**
 * 💾 SERVICIO DE CONTEXTO DE CONVERSACIÓN CON BASE DE DATOS
 * Guarda el contexto en PostgreSQL para persistencia real
 */

import { db } from './db'

interface ConversationContextDB {
  conversationId: string
  customerPhone: string
  lastProductId?: string
  lastProductName?: string
  lastIntent?: string
  lastAction?: string
  messageHistory: Array<{
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
  lastUpdated: Date
}

export class ConversationContextDBService {
  /**
   * Guardar o actualizar contexto en BD
   */
  static async saveContext(
    userId: string,
    customerPhone: string,
    data: {
      productId?: string
      productName?: string
      intent?: string
      action?: string
      message?: { role: 'user' | 'bot'; text: string; intent: string }
      productDetails?: any
      userPreferences?: any
    }
  ): Promise<void> {
    try {
      // Buscar conversación existente
      let conversation = await db.conversation.findFirst({
        where: {
          userId,
          customerPhone,
          status: 'ACTIVE'
        }
      })

      // Si no existe, crear nueva
      if (!conversation) {
        conversation = await db.conversation.create({
          data: {
            userId,
            customerPhone,
            customerName: customerPhone,
            status: 'ACTIVE',
            productId: data.productId,
            productName: data.productName
          }
        })
        console.log(`💾 [Context DB] Nueva conversación creada: ${conversation.id}`)
      }

      // Actualizar contexto
      const updateData: any = {
        lastMessageAt: new Date()
      }

      if (data.productId) updateData.productId = data.productId
      if (data.productName) updateData.productName = data.productName

      await db.conversation.update({
        where: { id: conversation.id },
        data: updateData
      })

      // Guardar mensaje en historial
      if (data.message) {
        await db.message.create({
          data: {
            conversationId: conversation.id,
            content: data.message.text,
            direction: data.message.role === 'user' ? 'INCOMING' : 'OUTGOING'
          }
        })
      }

      console.log(`💾 [Context DB] Contexto guardado para ${customerPhone}`)
    } catch (error) {
      console.error('❌ [Context DB] Error guardando contexto:', error)
    }
  }

  /**
   * Obtener contexto desde BD
   */
  static async getContext(
    userId: string,
    customerPhone: string
  ): Promise<ConversationContextDB | null> {
    try {
      // Buscar conversación activa
      const conversation = await db.conversation.findFirst({
        where: {
          userId,
          customerPhone,
          status: 'ACTIVE'
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 20 // Últimos 20 mensajes
          }
        }
      })

      if (!conversation) {
        console.log(`💾 [Context DB] No hay contexto en BD para ${customerPhone}`)
        return null
      }

      // Verificar si el contexto es reciente (últimas 24 horas)
      const now = new Date()
      const lastMessage = conversation.lastMessageAt
      const hoursSinceLastMessage = (now.getTime() - lastMessage.getTime()) / (1000 * 60 * 60)

      if (hoursSinceLastMessage > 24) {
        console.log(`💾 [Context DB] Contexto expirado (${hoursSinceLastMessage.toFixed(1)}h)`)
        return null
      }

      // Construir contexto
      const context: ConversationContextDB = {
        conversationId: conversation.id,
        customerPhone: conversation.customerPhone,
        lastProductId: conversation.productId || undefined,
        lastProductName: conversation.productName || undefined,
        lastIntent: undefined,
        lastAction: undefined,
        messageHistory: conversation.messages.map(m => ({
          role: m.direction === 'INCOMING' ? 'user' as const : 'bot' as const,
          message: m.content,
          intent: 'unknown', // Campo no disponible en schema actual
          timestamp: m.createdAt
        })).reverse(), // Orden cronológico
        lastUpdated: conversation.lastMessageAt
      }

      console.log(`💾 [Context DB] Contexto recuperado: ${conversation.productName || 'sin producto'} (${conversation.messages.length} mensajes)`)
      return context
    } catch (error) {
      console.error('❌ [Context DB] Error obteniendo contexto:', error)
      return null
    }
  }

  /**
   * Obtener resumen del contexto para prompts
   */
  static async getContextSummary(
    userId: string,
    customerPhone: string
  ): Promise<string> {
    const context = await this.getContext(userId, customerPhone)

    if (!context) {
      return 'Cliente nuevo, sin historial previo.'
    }

    let summary = `📋 CONTEXTO DE LA CONVERSACIÓN:\n\n`

    // Producto actual
    if (context.lastProductName) {
      summary += `🎯 Producto en contexto: ${context.lastProductName}\n`
    }

    // Historial reciente (últimos 5 mensajes)
    if (context.messageHistory.length > 0) {
      summary += `\n💬 Últimos mensajes:\n`
      const recentMessages = context.messageHistory.slice(-5)
      recentMessages.forEach(msg => {
        const emoji = msg.role === 'user' ? '👤' : '🤖'
        summary += `${emoji} ${msg.message.substring(0, 100)}${msg.message.length > 100 ? '...' : ''}\n`
      })
    }

    // Preferencias
    if (context.userPreferences) {
      summary += `\n💡 Preferencias:\n`
      if (context.userPreferences.budget) {
        summary += `- Presupuesto: $${context.userPreferences.budget.toLocaleString()}\n`
      }
      if (context.userPreferences.preferredPaymentMethod) {
        summary += `- Método de pago preferido: ${context.userPreferences.preferredPaymentMethod}\n`
      }
    }

    return summary
  }

  /**
   * Limpiar contextos antiguos (mantenimiento)
   */
  static async cleanOldContexts(daysOld: number = 7): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const result = await db.conversation.updateMany({
        where: {
          lastMessageAt: {
            lt: cutoffDate
          },
          status: 'ACTIVE'
        },
        data: {
          status: 'ARCHIVED'
        }
      })

      console.log(`💾 [Context DB] Archivadas ${result.count} conversaciones antiguas`)
      return result.count
    } catch (error) {
      console.error('❌ [Context DB] Error limpiando contextos:', error)
      return 0
    }
  }

  /**
   * Cerrar conversación
   */
  static async closeConversation(
    userId: string,
    customerPhone: string
  ): Promise<void> {
    try {
      await db.conversation.updateMany({
        where: {
          userId,
          customerPhone,
          status: 'ACTIVE'
        },
        data: {
          status: 'CLOSED'
        }
      })

      console.log(`💾 [Context DB] Conversación cerrada para ${customerPhone}`)
    } catch (error) {
      console.error('❌ [Context DB] Error cerrando conversación:', error)
    }
  }
}

// Limpiar contextos antiguos cada 24 horas
setInterval(() => {
  ConversationContextDBService.cleanOldContexts(7)
}, 24 * 60 * 60 * 1000)
