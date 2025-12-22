/**
 * 🧠 SISTEMA DE APRENDIZAJE CONTINUO DE CONVERSACIONES
 *
 * Aprende de las conversaciones para mejorar respuestas futuras:
 * - Patrones exitosos de conversación
 * - Preferencias del usuario
 * - Intenciones comunes
 * - Respuestas efectivas
 */

import { db } from './db'

interface ConversationPattern {
  id: string
  userMessage: string
  botResponse: string
  intent: string
  success: boolean
  userId: string
  conversationId: string
  timestamp: Date
  context: {
    productCategory?: string
    userStage?: string
    responseTime?: number
  }
}

interface UserPreference {
  userId: string
  preference: string
  value: string
  confidence: number
  lastUpdated: Date
  occurrences: number
}

export class ConversationLearningService {
  private static patterns: Map<string, ConversationPattern[]> = new Map()
  private static userPreferences: Map<string, UserPreference[]> = new Map()

  /**
   * Registrar un patrón de conversación exitoso
   */
  static async recordSuccessfulPattern(
    userId: string,
    conversationId: string,
    userMessage: string,
    botResponse: string,
    intent: string,
    context: any = {}
  ): Promise<void> {
    try {
      const pattern: ConversationPattern = {
        id: `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userMessage: userMessage.toLowerCase().trim(),
        botResponse,
        intent,
        success: true,
        userId,
        conversationId,
        timestamp: new Date(),
        context: {
          productCategory: context.productCategory,
          userStage: context.userStage,
          responseTime: context.responseTime
        }
      }

      // Guardar en memoria local
      if (!this.patterns.has(userId)) {
        this.patterns.set(userId, [])
      }
      this.patterns.get(userId)!.push(pattern)

      // Limitar a últimos 50 patrones por usuario
      const userPatterns = this.patterns.get(userId)!
      if (userPatterns.length > 50) {
        userPatterns.splice(0, userPatterns.length - 50)
      }

      // Guardar en base de datos (opcional, para análisis posterior)
      await this.savePatternToDB(pattern)

      console.log(`🧠 Patrón exitoso registrado: ${intent} para ${userId}`)

    } catch (error) {
      console.error('Error registrando patrón de conversación:', error)
    }
  }

  /**
   * Registrar una preferencia del usuario
   */
  static async recordUserPreference(
    userId: string,
    preference: string,
    value: string,
    confidence: number = 0.8
  ): Promise<void> {
    try {
      const existingPrefs = this.userPreferences.get(userId) || []
      const existingPref = existingPrefs.find(p => p.preference === preference)

      if (existingPref) {
        // Actualizar preferencia existente
        existingPref.value = value
        existingPref.confidence = Math.min(1.0, existingPref.confidence + 0.1)
        existingPref.lastUpdated = new Date()
        existingPref.occurrences++
      } else {
        // Crear nueva preferencia
        const newPref: UserPreference = {
          userId,
          preference,
          value,
          confidence,
          lastUpdated: new Date(),
          occurrences: 1
        }
        existingPrefs.push(newPref)
      }

      this.userPreferences.set(userId, existingPrefs)

      // Guardar en BD
      await this.savePreferenceToDB(userId, preference, value, confidence)

      console.log(`🧠 Preferencia registrada: ${preference} = ${value} para ${userId}`)

    } catch (error) {
      console.error('Error registrando preferencia:', error)
    }
  }

  /**
   * Obtener respuesta aprendida para un mensaje similar
   */
  static getLearnedResponse(
    userId: string,
    message: string,
    intent: string
  ): { response: string; confidence: number } | null {
    try {
      const userPatterns = this.patterns.get(userId) || []
      const normalizedMessage = message.toLowerCase().trim()

      // Buscar patrones similares
      const similarPatterns = userPatterns.filter(p =>
        p.intent === intent &&
        this.calculateSimilarity(p.userMessage, normalizedMessage) > 0.7
      )

      if (similarPatterns.length === 0) {
        return null
      }

      // Tomar el patrón más reciente y exitoso
      const bestPattern = similarPatterns
        .filter(p => p.success)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]

      if (!bestPattern) {
        return null
      }

      const confidence = Math.min(0.9, 0.6 + (bestPattern.context.responseTime || 0) * 0.001)

      return {
        response: bestPattern.botResponse,
        confidence
      }

    } catch (error) {
      console.error('Error obteniendo respuesta aprendida:', error)
      return null
    }
  }

  /**
   * Obtener preferencias del usuario
   */
  static getUserPreferences(userId: string): UserPreference[] {
    return this.userPreferences.get(userId) || []
  }

  /**
   * Obtener estadísticas de aprendizaje
   */
  static getLearningStats(userId?: string): {
    totalPatterns: number
    totalPreferences: number
    usersWithLearning: number
  } {
    let totalPatterns = 0
    let totalPreferences = 0

    if (userId) {
      totalPatterns = this.patterns.get(userId)?.length || 0
      totalPreferences = this.userPreferences.get(userId)?.length || 0
    } else {
      totalPatterns = Array.from(this.patterns.values()).reduce((sum, patterns) => sum + patterns.length, 0)
      totalPreferences = Array.from(this.userPreferences.values()).reduce((sum, prefs) => sum + prefs.length, 0)
    }

    return {
      totalPatterns,
      totalPreferences,
      usersWithLearning: this.patterns.size
    }
  }

  /**
   * Calcular similitud entre dos mensajes (simple)
   */
  private static calculateSimilarity(text1: string, text2: string): number {
    if (text1 === text2) return 1.0

    const words1 = new Set(text1.split(' '))
    const words2 = new Set(text2.split(' '))

    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])

    return intersection.size / union.size
  }

  /**
   * Guardar patrón en base de datos
   */
  private static async savePatternToDB(pattern: ConversationPattern): Promise<void> {
    try {
      // Crear tabla si no existe (esto sería mejor en una migración)
      await db.$executeRaw`
        CREATE TABLE IF NOT EXISTS conversation_patterns (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          conversation_id TEXT NOT NULL,
          user_message TEXT NOT NULL,
          bot_response TEXT NOT NULL,
          intent TEXT NOT NULL,
          success BOOLEAN DEFAULT TRUE,
          context JSONB,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      await db.$executeRaw`
        INSERT INTO conversation_patterns (id, user_id, conversation_id, user_message, bot_response, intent, success, context, timestamp)
        VALUES (${pattern.id}, ${pattern.userId}, ${pattern.conversationId}, ${pattern.userMessage}, ${pattern.botResponse}, ${pattern.intent}, ${pattern.success}, ${JSON.stringify(pattern.context)}, ${pattern.timestamp})
      `
    } catch (error) {
      // Silenciar errores de BD para no interrumpir el flujo
      console.log('⚠️ No se pudo guardar patrón en BD (continuando...)')
    }
  }

  /**
   * Guardar preferencia en base de datos
   */
  private static async savePreferenceToDB(
    userId: string,
    preference: string,
    value: string,
    confidence: number
  ): Promise<void> {
    try {
      await db.$executeRaw`
        CREATE TABLE IF NOT EXISTS user_preferences (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          preference TEXT NOT NULL,
          value TEXT NOT NULL,
          confidence REAL DEFAULT 0.5,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          occurrences INTEGER DEFAULT 1,
          UNIQUE(user_id, preference)
        )
      `

      await db.$executeRaw`
        INSERT INTO user_preferences (user_id, preference, value, confidence, last_updated, occurrences)
        VALUES (${userId}, ${preference}, ${value}, ${confidence}, NOW(), 1)
        ON CONFLICT (user_id, preference)
        DO UPDATE SET
          value = EXCLUDED.value,
          confidence = LEAST(1.0, user_preferences.confidence + 0.1),
          last_updated = NOW(),
          occurrences = user_preferences.occurrences + 1
      `
    } catch (error) {
      console.log('⚠️ No se pudo guardar preferencia en BD (continuando...)')
    }
  }

  /**
   * Limpiar datos antiguos (mantener solo últimos 30 días)
   */
  static async cleanupOldData(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      // Limpiar de memoria
      for (const [userId, patterns] of this.patterns.entries()) {
        const recentPatterns = patterns.filter(p => p.timestamp > thirtyDaysAgo)
        if (recentPatterns.length !== patterns.length) {
          this.patterns.set(userId, recentPatterns)
        }
      }

      // Limpiar de BD
      await db.$executeRaw`
        DELETE FROM conversation_patterns
        WHERE timestamp < ${thirtyDaysAgo}
      `

      await db.$executeRaw`
        DELETE FROM user_preferences
        WHERE last_updated < ${thirtyDaysAgo} AND occurrences < 3
      `

      console.log('🧠 Datos antiguos limpiados')

    } catch (error) {
      console.error('Error limpiando datos antiguos:', error)
    }
  }
}

// Limpiar datos antiguos cada semana
setInterval(() => {
  ConversationLearningService.cleanupOldData()
}, 7 * 24 * 60 * 60 * 1000)