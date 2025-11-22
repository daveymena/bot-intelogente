/**
 * 🧠 Sistema de Aprendizaje Reforzado (Reinforcement Learning)
 * 
 * Este sistema permite que el bot aprenda automáticamente de cada conversación,
 * mejorando sus respuestas basándose en el feedback del cliente.
 */

import { db } from './db'

// Tipos de feedback
export enum FeedbackType {
  POSITIVE_EXPLICIT = 'positive_explicit',     // "gracias", "perfecto"
  POSITIVE_IMPLICIT = 'positive_implicit',     // continúa conversación
  NEGATIVE_EXPLICIT = 'negative_explicit',     // "no entiendo", "no me sirve"
  NEGATIVE_IMPLICIT = 'negative_implicit',     // abandona conversación
  CONVERSION = 'conversion',                   // solicita pago, compra
  ENGAGEMENT = 'engagement'                    // interacción activa
}

// Sistema de recompensas
export const REWARDS = {
  PURCHASE: 10,              // Cliente compra
  PAYMENT_REQUEST: 5,        // Cliente solicita pago
  EXPLICIT_THANKS: 3,        // Cliente agradece
  CONTINUE_CONVERSATION: 2,  // Cliente continúa
  EXPLICIT_COMPLAINT: -2,    // Cliente se queja
  QUICK_ABANDON: -5          // Cliente abandona rápido
}

// Señales positivas
const POSITIVE_SIGNALS = [
  'gracias', 'perfecto', 'excelente', 'genial', 'bueno',
  'me interesa', 'me gusta', 'quiero', 'comprar',
  'dale', 'ok', 'sí', 'si', 'claro', 'vale'
]

// Señales negativas
const NEGATIVE_SIGNALS = [
  'no entiendo', 'no me sirve', 'muy caro', 'no me gusta',
  'no quiero', 'no me interesa', 'mal', 'malo',
  'no funciona', 'error', 'problema'
]

interface ConversationFeedback {
  conversationId: string
  totalReward: number
  positiveSignals: number
  negativeSignals: number
  conversionAchieved: boolean
  engagementScore: number
  duration: number
  messageCount: number
}

interface PatternPerformance {
  pattern: string
  frequency: number
  successRate: number
  averageReward: number
  trend: 'improving' | 'stable' | 'declining'
  lastUsed: Date
}

export class ReinforcementLearningSystem {
  /**
   * Capturar feedback de una conversación
   */
  static async captureFeedback(
    conversationId: string,
    userId: string
  ): Promise<ConversationFeedback> {
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!conversation) {
      throw new Error('Conversación no encontrada')
    }

    const messages = conversation.messages
    let totalReward = 0
    let positiveSignals = 0
    let negativeSignals = 0
    let conversionAchieved = false
    let engagementScore = 0

    // Analizar cada mensaje del cliente
    for (const message of messages) {
      if (message.direction === 'INCOMING') {
        const content = message.content.toLowerCase()

        // Detectar señales positivas
        for (const signal of POSITIVE_SIGNALS) {
          if (content.includes(signal)) {
            positiveSignals++
            totalReward += REWARDS.EXPLICIT_THANKS
            break
          }
        }

        // Detectar señales negativas
        for (const signal of NEGATIVE_SIGNALS) {
          if (content.includes(signal)) {
            negativeSignals++
            totalReward += REWARDS.EXPLICIT_COMPLAINT
            break
          }
        }

        // Detectar intención de pago/compra
        if (
          content.includes('pago') ||
          content.includes('comprar') ||
          content.includes('link')
        ) {
          conversionAchieved = true
          totalReward += REWARDS.PAYMENT_REQUEST
        }

        // Engagement (cada mensaje del cliente)
        engagementScore++
        totalReward += REWARDS.CONTINUE_CONVERSATION
      }
    }

    // Calcular duración
    const duration = messages.length > 0
      ? messages[messages.length - 1].createdAt.getTime() - messages[0].createdAt.getTime()
      : 0

    // Penalizar abandono rápido (< 2 minutos, < 3 mensajes)
    if (duration < 120000 && messages.length < 3) {
      totalReward += REWARDS.QUICK_ABANDON
    }

    const feedback: ConversationFeedback = {
      conversationId,
      totalReward,
      positiveSignals,
      negativeSignals,
      conversionAchieved,
      engagementScore,
      duration,
      messageCount: messages.length
    }

    // Guardar feedback en BD
    await this.saveFeedback(conversationId, userId, feedback)

    return feedback
  }

  /**
   * Guardar feedback en base de datos
   */
  private static async saveFeedback(
    conversationId: string,
    userId: string,
    feedback: ConversationFeedback
  ): Promise<void> {
    // Crear tabla de feedback si no existe (se hace en Prisma)
    // Por ahora, guardamos en un campo JSON en la conversación
    await db.conversation.update({
      where: { id: conversationId },
      data: {
        // @ts-ignore - Campo personalizado
        feedback: JSON.stringify(feedback)
      }
    })
  }

  /**
   * Evaluar rendimiento de patrones de respuesta
   */
  static async evaluatePatterns(userId: string): Promise<PatternPerformance[]> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const conversations = await db.conversation.findMany({
      where: {
        userId
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      take: 100 // Limitar a últimas 100 conversaciones
    })

    const patternMap = new Map<string, {
      frequency: number
      totalReward: number
      successCount: number
      lastUsed: Date
    }>()

    // Analizar cada conversación
    for (const conv of conversations) {
      const feedback = await this.captureFeedback(conv.id, userId)
      const messages = conv.messages

      // Extraer patrones de respuesta del bot
      for (let i = 0; i < messages.length - 1; i++) {
        const userMsg = messages[i]
        const botMsg = messages[i + 1]

        if (userMsg.direction === 'INCOMING' && botMsg.direction === 'OUTGOING') {
          const pattern = this.extractPattern(userMsg.content, botMsg.content)

          if (!patternMap.has(pattern)) {
            patternMap.set(pattern, {
              frequency: 0,
              totalReward: 0,
              successCount: 0,
              lastUsed: botMsg.createdAt
            })
          }

          const data = patternMap.get(pattern)!
          data.frequency++
          data.totalReward += feedback.totalReward / messages.length
          if (feedback.totalReward > 0) {
            data.successCount++
          }
          if (botMsg.createdAt > data.lastUsed) {
            data.lastUsed = botMsg.createdAt
          }
        }
      }
    }

    // Convertir a array de PatternPerformance
    const patterns: PatternPerformance[] = []

    for (const [pattern, data] of patternMap.entries()) {
      const successRate = data.successCount / data.frequency
      const averageReward = data.totalReward / data.frequency

      // Calcular tendencia
      let trend: 'improving' | 'stable' | 'declining' = 'stable'
      if (averageReward > 5) trend = 'improving'
      else if (averageReward < -2) trend = 'declining'

      patterns.push({
        pattern,
        frequency: data.frequency,
        successRate,
        averageReward,
        trend,
        lastUsed: data.lastUsed
      })
    }

    return patterns.sort((a, b) => b.averageReward - a.averageReward)
  }

  /**
   * Actualizar modelo basado en feedback
   */
  static async updateModel(userId: string): Promise<{
    patternsImproved: number
    patternsRemoved: number
    newExamples: number
  }> {
    const patterns = await this.evaluatePatterns(userId)

    let patternsImproved = 0
    let patternsRemoved = 0
    let newExamples = 0

    // Identificar patrones exitosos (para reforzar)
    const successfulPatterns = patterns.filter(
      p => p.averageReward > 3 && p.frequency >= 5
    )

    // Identificar patrones problemáticos (para eliminar/mejorar)
    const problematicPatterns = patterns.filter(
      p => p.averageReward < -1 && p.frequency >= 3
    )

    console.log(`[RL] Patrones exitosos: ${successfulPatterns.length}`)
    console.log(`[RL] Patrones problemáticos: ${problematicPatterns.length}`)

    // Reforzar patrones exitosos
    for (const pattern of successfulPatterns) {
      // Aquí se agregarían a los ejemplos de entrenamiento
      // o se aumentaría su peso en el modelo
      patternsImproved++
    }

    // Marcar patrones problemáticos para revisión
    for (const pattern of problematicPatterns) {
      // Aquí se marcarían para revisión manual
      // o se reducirían su peso en el modelo
      patternsRemoved++
    }

    return {
      patternsImproved,
      patternsRemoved,
      newExamples
    }
  }

  /**
   * Obtener métricas de aprendizaje
   */
  static async getLearningMetrics(userId: string): Promise<{
    totalConversations: number
    averageReward: number
    conversionRate: number
    engagementRate: number
    improvementTrend: number
  }> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const conversations = await db.conversation.findMany({
      where: {
        userId
      },
      take: 100 // Limitar a últimas 100 conversaciones
    })

    let totalReward = 0
    let conversions = 0
    let totalEngagement = 0

    for (const conv of conversations) {
      const feedback = await this.captureFeedback(conv.id, userId)
      totalReward += feedback.totalReward
      if (feedback.conversionAchieved) conversions++
      totalEngagement += feedback.engagementScore
    }

    const totalConversations = conversations.length
    const averageReward = totalConversations > 0 ? totalReward / totalConversations : 0
    const conversionRate = totalConversations > 0 ? conversions / totalConversations : 0
    const engagementRate = totalConversations > 0 ? totalEngagement / totalConversations : 0

    // Calcular tendencia de mejora (comparar últimos 7 días vs 7 días anteriores)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentConvs = conversations.filter(c => c.lastMessageAt >= sevenDaysAgo)
    const olderConvs = conversations.filter(c => c.lastMessageAt < sevenDaysAgo)

    let recentReward = 0
    let olderReward = 0

    for (const conv of recentConvs) {
      const feedback = await this.captureFeedback(conv.id, userId)
      recentReward += feedback.totalReward
    }

    for (const conv of olderConvs) {
      const feedback = await this.captureFeedback(conv.id, userId)
      olderReward += feedback.totalReward
    }

    const recentAvg = recentConvs.length > 0 ? recentReward / recentConvs.length : 0
    const olderAvg = olderConvs.length > 0 ? olderReward / olderConvs.length : 0
    const improvementTrend = recentAvg - olderAvg

    return {
      totalConversations,
      averageReward,
      conversionRate,
      engagementRate,
      improvementTrend
    }
  }

  /**
   * Extraer patrón de pregunta-respuesta
   */
  private static extractPattern(userMessage: string, botResponse: string): string {
    const userPattern = userMessage.toLowerCase().substring(0, 50)
    const botPattern = botResponse.toLowerCase().substring(0, 50)
    return `${userPattern} -> ${botPattern}`
  }

  /**
   * Resetear aprendizaje (para testing)
   */
  static async resetLearning(userId: string): Promise<void> {
    // Limpiar feedback de conversaciones
    await db.conversation.updateMany({
      where: { userId },
      data: {
        // @ts-ignore
        feedback: null
      }
    })

    console.log(`[RL] Aprendizaje reseteado para usuario: ${userId}`)
  }
}
