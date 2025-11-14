/**
 * 🤖 INTEGRACIÓN DEL SISTEMA HÍBRIDO CON BAILEYS
 * Conecta el bot de WhatsApp con el sistema inteligente
 */

import { createGroqHybridSystem } from './hybrid-intelligent-response-system'
import { IntelligentProductQuerySystem } from './intelligent-product-query-system'

export class BotHybridIntegration {
  private hybridSystem: any
  private conversationHistory: Map<string, any[]> = new Map()
  private useAI: boolean = true

  constructor(groqApiKey?: string) {
    if (groqApiKey) {
      // Inicializar sistema híbrido con IA
      this.initializeHybridSystem(groqApiKey)
      this.useAI = true
    } else {
      // Usar solo sistema local (sin IA)
      this.useAI = false
      console.log('⚠️  Sistema híbrido: Modo LOCAL (sin IA)')
    }
  }

  private async initializeHybridSystem(groqApiKey: string) {
    try {
      this.hybridSystem = await createGroqHybridSystem(groqApiKey)
      console.log('✅ Sistema híbrido inicializado con IA')
    } catch (error) {
      console.error('❌ Error inicializando sistema híbrido:', error)
      this.useAI = false
    }
  }

  /**
   * Procesar mensaje del cliente
   */
  async processMessage(
    message: string,
    from: string,
    userId: string
  ): Promise<string> {
    try {
      // Obtener historial de conversación
      const history = this.conversationHistory.get(from) || []

      let response: string

      if (this.useAI && this.hybridSystem) {
        // MODO HÍBRIDO: BD + IA + Formato
        console.log('🧠 Procesando con sistema híbrido (BD + IA)')
        response = await this.hybridSystem.processMessage(
          message,
          userId,
          history
        )
      } else {
        // MODO LOCAL: Solo BD + Formato
        console.log('📦 Procesando con sistema local (solo BD)')
        response = await IntelligentProductQuerySystem.processQuery(
          message,
          userId,
          history
        )
      }

      // Actualizar historial
      this.updateHistory(from, message, response)

      return response

    } catch (error) {
      console.error('❌ Error procesando mensaje:', error)
      return '😅 Disculpa, tuve un problema procesando tu mensaje. ¿Puedes intentar de nuevo?'
    }
  }

  /**
   * Actualizar historial de conversación
   */
  private updateHistory(from: string, userMessage: string, botResponse: string) {
    const history = this.conversationHistory.get(from) || []
    
    history.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: botResponse }
    )

    // Mantener solo los últimos 10 mensajes
    if (history.length > 10) {
      history.splice(0, history.length - 10)
    }

    this.conversationHistory.set(from, history)
  }

  /**
   * Limpiar historial de un usuario
   */
  clearHistory(from: string) {
    this.conversationHistory.delete(from)
  }

  /**
   * Cambiar modo de operación
   */
  setAIMode(enabled: boolean) {
    this.useAI = enabled
    console.log(`🔄 Modo IA: ${enabled ? 'ACTIVADO' : 'DESACTIVADO'}`)
  }
}
