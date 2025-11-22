/**
 * 🤖 Wrapper del Orquestador de Agentes
 * Adapta el orquestador de agentes al formato esperado por Baileys
 */

import { Orchestrator } from './orchestrator'
import { db } from '@/lib/db'

interface ProcessMessageParams {
  message: string
  userId: string
  conversationId: string
  customerPhone: string
  history: Array<{ role: 'user' | 'assistant'; content: string }>
}

interface AgentResponse {
  message: string
  confidence: number
  intent?: string
  shouldSendPhotos?: boolean
  photos?: string[]
  productId?: string
  agentUsed?: string
}

export class AgentOrchestrator {
  private static orchestrator: Orchestrator | null = null

  /**
   * Obtener instancia del orquestador
   */
  private static getOrchestrator(): Orchestrator {
    if (!this.orchestrator) {
      this.orchestrator = new Orchestrator()
      console.log('[AgentOrchestrator] ✅ Orquestador inicializado')
    }
    return this.orchestrator
  }

  /**
   * Procesar mensaje con el sistema de agentes
   */
  static async processMessage(params: ProcessMessageParams): Promise<AgentResponse> {
    const { message, userId, conversationId, customerPhone, history } = params

    console.log('[AgentOrchestrator] 🤖 Procesando con agentes especializados')
    console.log(`[AgentOrchestrator] 📨 Mensaje: "${message.substring(0, 100)}"`)

    try {
      const orchestrator = this.getOrchestrator()

      // Crear chatId único para esta conversación
      const chatId = `${userId}:${customerPhone}`

      // Procesar con el orquestador
      const response = await orchestrator.processMessage({
        chatId,
        userId,
        message,
        userName: undefined // Puedes obtenerlo de la conversación si lo tienes
      })

      console.log(`[AgentOrchestrator] ✅ Respuesta generada`)
      console.log(`[AgentOrchestrator] 🎯 Confianza: ${(response.confidence * 100).toFixed(0)}%`)

      // Verificar si hay producto en el contexto y debe enviar fotos
      let shouldSendPhotos = false
      let photos: string[] = []
      let productId: string | undefined

      if (response.context?.currentProduct) {
        productId = response.context.currentProduct.id
        
        // Obtener producto completo de la BD para las fotos
        const product = await db.product.findUnique({
          where: { id: productId }
        })

        if (product && product.images && product.images.length > 0) {
          // Detectar si debe enviar fotos
          const photoKeywords = ['foto', 'imagen', 'ver', 'muestra', 'manda', 'envia', 'pasa']
          const needsPhoto = photoKeywords.some(kw => message.toLowerCase().includes(kw))
          
          // O si es la primera vez que menciona el producto
          const isFirstMention = history.filter(h => 
            h.content.toLowerCase().includes(product.name.toLowerCase())
          ).length <= 1

          if (needsPhoto || isFirstMention) {
            shouldSendPhotos = true
            photos = product.images
            console.log(`[AgentOrchestrator] 📸 Debe enviar ${photos.length} foto(s) del producto`)
          }
        }
      }

      // Convertir respuesta al formato esperado
      return {
        message: response.text,
        confidence: response.confidence,
        intent: response.context?.salesStage || 'general',
        shouldSendPhotos,
        photos,
        productId,
        agentUsed: response.nextAgent || 'orchestrator'
      }

      // 🔥 SISTEMA DE FALLBACK INTELIGENTE A IA
      // Si la confianza es baja, usar IA como respaldo
      const confidenceThreshold = parseFloat(process.env.AI_FALLBACK_CONFIDENCE_THRESHOLD || '0.6')
      
      if (response.confidence < confidenceThreshold) {
        console.log(`[AgentOrchestrator] ⚠️ Confianza baja (${(response.confidence * 100).toFixed(0)}%)`)
        console.log('[AgentOrchestrator] 🤖 Activando fallback a IA (Groq)...')
        
        try {
          const { AIMultiProvider } = await import('@/lib/ai-multi-provider')
          
          // Construir contexto para la IA
          const contextMessages = history.slice(-4).map(h => ({
            role: h.role,
            content: h.content
          }))
          
          // Agregar mensaje actual
          contextMessages.push({
            role: 'user',
            content: message
          })
          
          // Llamar a la IA
          const aiResponse = await AIMultiProvider.generateResponse({
            messages: contextMessages,
            systemPrompt: `Eres un asistente de ventas profesional y amigable de Tecnovariedades D&S.
Responde de forma natural, concisa y útil. Si no entiendes algo, pide clarificación.
Mantén un tono conversacional y usa emojis apropiadamente.`,
            maxTokens: 200,
            temperature: 0.7
          })
          
          console.log('[AgentOrchestrator] ✅ IA generó respuesta de respaldo')
          
          return {
            message: aiResponse,
            confidence: 0.75, // Confianza media con IA
            intent: 'ai_fallback',
            shouldSendPhotos,
            photos,
            productId,
            agentUsed: 'ai_fallback'
          }
        } catch (aiError) {
          console.error('[AgentOrchestrator] ❌ Error en fallback a IA:', aiError)
          // Si falla la IA, usar la respuesta original del agente
        }
      }

      // Retornar respuesta del agente (original o si falló el fallback)
      return {
        message: response.text,
        confidence: response.confidence,
        intent: response.context?.salesStage || 'general',
        shouldSendPhotos,
        photos,
        productId,
        agentUsed: response.nextAgent || 'orchestrator'
      }

    } catch (error) {
      console.error('[AgentOrchestrator] ❌ Error procesando mensaje:', error)

      // Fallback final: respuesta genérica
      return {
        message: 'Disculpa, tuve un problema procesando tu mensaje. ¿Podrías intentar de nuevo? 🙏',
        confidence: 0.3,
        intent: 'error',
        shouldSendPhotos: false,
        photos: [],
        agentUsed: 'fallback'
      }
    }
  }

  /**
   * Limpiar memorias antiguas (ejecutar periódicamente)
   */
  static cleanOldMemories(): void {
    const orchestrator = this.getOrchestrator()
    orchestrator.cleanOldMemories()
    console.log('[AgentOrchestrator] 🧹 Memorias antiguas limpiadas')
  }

  /**
   * Obtener estadísticas
   */
  static getStats() {
    const orchestrator = this.getOrchestrator()
    return orchestrator.getStats()
  }
}
