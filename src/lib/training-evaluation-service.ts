/**
 * 📊 SERVICIO DE EVALUACIÓN DE DATOS DE ENTRENAMIENTO
 * 
 * Evalúa automáticamente la calidad de las respuestas del bot
 */

import { db } from './db'

export class TrainingEvaluationService {
  
  /**
   * Evaluar calidad de la interacción basado en la siguiente respuesta
   */
  static async evaluateInteraction(
    conversationId: string,
    previousMessageContent: string,
    nextUserMessage: string
  ): Promise<void> {
    try {
      // Buscar el training data correspondiente
      const trainingData = await db.trainingData.findFirst({
        where: {
          conversationId,
          botResponse: previousMessageContent,
          evaluatedAt: null
        },
        orderBy: { createdAt: 'desc' }
      })
      
      if (!trainingData) {
        return // No hay datos para evaluar
      }
      
      const score = this.calculateQualityScore(nextUserMessage)
      const wasSuccessful = this.wasSuccessful(nextUserMessage)
      
      await db.trainingData.update({
        where: { id: trainingData.id },
        data: {
          qualityScore: score,
          wasSuccessful,
          userFeedback: nextUserMessage,
          evaluatedAt: new Date()
        }
      })
      
      console.log(`[Training] ✅ Evaluado: score=${score}, success=${wasSuccessful}`)
      
    } catch (error) {
      console.error('[Training] ❌ Error evaluando:', error)
    }
  }
  
  /**
   * Calcular score de calidad (1-5)
   */
  private static calculateQualityScore(nextMessage: string): number {
    const normalized = nextMessage.toLowerCase()
    
    // Score 5: Respuestas muy positivas (intención de compra)
    const veryPositive = [
      /\b(perfecto|excelente|genial|increíble|me encanta)\b/,
      /\b(lo quiero|lo compro|me lo llevo|voy a comprar)\b/,
      /\b(dame el link|envíame el link|quiero pagar)\b/,
      /\b(voy a realizar el pago|procedo con el pago)\b/
    ]
    if (veryPositive.some(p => p.test(normalized))) {
      return 5
    }
    
    // Score 4: Respuestas positivas (interés)
    const positive = [
      /\b(ok|bien|sí|si|dale|listo|gracias)\b/,
      /\b(me gusta|me interesa|me sirve)\b/,
      /\b(más información|más detalles|cuéntame más)\b/,
      /\b(me envías fotos|quiero ver|muéstrame)\b/
    ]
    if (positive.some(p => p.test(normalized))) {
      return 4
    }
    
    // Score 3: Neutral (pide aclaraciones)
    const neutral = [
      /\b(más|info|detalles|explica|cómo|como)\b/,
      /\b(cuánto|precio|cuesta|valor)\b/,
      /\b(incluye|tiene|características)\b/
    ]
    if (neutral.some(p => p.test(normalized))) {
      return 3
    }
    
    // Score 2: Negativas suaves (confusión)
    const negative = [
      /\b(no entiendo|confuso|no sé|duda|no estoy seguro)\b/,
      /\b(no es lo que busco|no me convence)\b/
    ]
    if (negative.some(p => p.test(normalized))) {
      return 2
    }
    
    // Score 1: Negativas fuertes (rechazo)
    const veryNegative = [
      /\b(no me sirve|no me gusta|no quiero|mal|horrible)\b/,
      /\b(no funciona|error|problema|falla)\b/,
      /\b(no me interesa|no gracias|paso)\b/
    ]
    if (veryNegative.some(p => p.test(normalized))) {
      return 1
    }
    
    return 3 // Neutral por defecto
  }
  
  /**
   * Determinar si fue exitosa (hubo conversión)
   */
  private static wasSuccessful(nextMessage: string): boolean {
    const normalized = nextMessage.toLowerCase()
    
    const successPatterns = [
      /\b(comprar|pagar|link|método|voy a|lo quiero)\b/,
      /\b(me interesa|me lo llevo|procedo)\b/,
      /\b(dame|envíame|pásame)\s+(el\s+)?(link|enlace)\b/,
      /\b(realizar el pago|efectuar el pago)\b/
    ]
    
    return successPatterns.some(p => p.test(normalized))
  }
  
  /**
   * Evaluar múltiples interacciones de una conversación
   */
  static async evaluateConversation(conversationId: string): Promise<void> {
    try {
      // Obtener todos los mensajes de la conversación
      const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })
      
      if (!conversation) return
      
      const messages = conversation.messages
      
      // Evaluar cada par de mensajes (bot → usuario)
      for (let i = 0; i < messages.length - 1; i++) {
        const currentMsg = messages[i]
        const nextMsg = messages[i + 1]
        
        // Si el mensaje actual es del bot y el siguiente del usuario
        if (currentMsg.direction === 'OUTGOING' && nextMsg.direction === 'INCOMING') {
          await this.evaluateInteraction(
            conversationId,
            currentMsg.content,
            nextMsg.content
          )
        }
      }
      
      console.log(`[Training] ✅ Conversación evaluada: ${conversationId}`)
      
    } catch (error) {
      console.error('[Training] ❌ Error evaluando conversación:', error)
    }
  }
}
