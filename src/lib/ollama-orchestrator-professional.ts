/**
 * 🎯 OLLAMA ORCHESTRATOR PROFESSIONAL
 * Sistema simple y rápido con gemma2:2b
 */

import { db } from './db'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OrchestratorResponse {
  message: string
  source: 'ollama' | 'groq' | 'local'
  confidence: number
  products?: any[]
}

export class OllamaProfessionalOrchestrator {
  private static config = {
    url: process.env.OLLAMA_BASE_URL || process.env.OLLAMA_URL || 'https://davey-ollama2.mapf5v.easypanel.host',
    model: process.env.OLLAMA_MODEL || 'llama3.2:3b', // ⚡ Más rápido: 527ms
    modelSecondary: 'gemma2:2b', // 🥈 Fallback: 670ms
    modelTertiary: 'llama3.1:8b', // 🥉 Fallback final: 1263ms
    timeout: parseInt(process.env.OLLAMA_TIMEOUT || '30000') // ✅ Reducido a 30s (3x promedio)
  }

  // Caché de respuestas rápidas
  private static quickResponses: Record<string, string> = {
    'hola': '¡Hola! 😊 Bienvenido a Tecnovariedades D&S. ¿En qué puedo ayudarte?',
    'hi': '¡Hola! 😊 Bienvenido a Tecnovariedades D&S. ¿En qué puedo ayudarte?',
    'gracias': '¡Con gusto! 😊 ¿Necesitas algo más?',
    'ok': '¡Perfecto! 😊 ¿Algo más en lo que pueda ayudarte?',
    'sí': '¡Excelente! 😊',
    'no': 'Entendido. ¿Algo más? 😊'
  }

  /**
   * Procesar mensaje
   */
  static async processMessage(
    userMessage: string,
    userId: string,
    conversationHistory: Message[] = []
  ): Promise<OrchestratorResponse> {
    // Verificar caché
    const lowerMsg = userMessage.toLowerCase().trim()
    if (this.quickResponses[lowerMsg]) {
      console.log('[Orchestrator] ⚡ Respuesta desde caché')
      return {
        message: this.quickResponses[lowerMsg],
        source: 'ollama',
        confidence: 100
      }
    }

    // Buscar productos
    const products = await this.searchProducts(userMessage, userId)
    console.log(`[Orchestrator] 🔍 Productos encontrados: ${products.length}`)

    // Construir prompt
    const systemPrompt = this.buildPrompt(products)
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.slice(-8),
      { role: 'user' as const, content: userMessage }
    ]

    // Llamar Ollama
    try {
      const response = await this.callOllama(messages)
      return {
        message: response,
        source: 'ollama',
        confidence: 85,
        products: products.length > 0 ? products : undefined
      }
    } catch (error) {
      console.log('[Orchestrator] ❌ Ollama falló, usando bot local')
      return this.localResponse(userMessage, products)
    }
  }

  /**
   * Buscar productos usando el sistema inteligente
   */
  private static async searchProducts(query: string, userId: string): Promise<any[]> {
    try {
      // Usar el sistema de búsqueda inteligente
      const { intelligentProductSearch } = await import('./intelligent-product-search')
      
      const result = await intelligentProductSearch({
        userMessage: query,
        previousProducts: [],
        conversationHistory: []
      })

      if (!result) return []

      // Si es consulta general, devolver múltiples productos
      if (result.isGeneralQuery && result.products) {
        return result.products.slice(0, 3)
      }

      // Si es consulta específica, devolver solo ese producto
      if (result.product) {
        return [result.product]
      }

      return []
    } catch (error) {
      console.error('[Orchestrator] Error en búsqueda inteligente:', error)
      return []
    }
  }

  /**
   * Construir prompt
   */
  private static buildPrompt(products: any[]): string {
    let prompt = `🇪🇸 IDIOMA OBLIGATORIO: ESPAÑOL (COLOMBIA) 🇪🇸
⚠️ NUNCA RESPONDAS EN INGLÉS - SOLO ESPAÑOL ⚠️

Eres Alex, vendedor colombiano de Tecnovariedades D&S por WhatsApp.

🚨 REGLA CRÍTICA DE IDIOMA:
- SIEMPRE responde en ESPAÑOL (Colombia)
- NUNCA uses inglés, ni una sola palabra
- Si el cliente pregunta en inglés, responde en ESPAÑOL
- Eres un vendedor colombiano, NO un asistente genérico de IA
- NO digas "I understand", "Here's why", "Unfortunately" (INGLÉS PROHIBIDO)

IDENTIDAD:
- Trabajas para: Tecnovariedades D&S
- Vendes: Productos reales de nuestro catálogo
- NO eres ChatGPT, Claude, ni asistente genérico
- Eres un VENDEDOR PROFESIONAL colombiano

REGLAS:
- Lee el historial completo
- Si dice "opción 2" → Busca qué productos YA mostraste
- NO repitas el saludo
- Máximo 4 líneas
- Emojis sutiles 😊
- SIEMPRE en ESPAÑOL

AGENTES DEL SISTEMA:
- Agente de búsqueda: Busca productos en BD
- Agente de pagos: Genera links con MercadoPago/PayPal API
- Agente de fotos: Envía imágenes automáticamente
- TÚ solo coordinas

PAGOS:
- Si dice "generar link": "Perfecto 🙌 Enseguida genero tu enlace..."
- El agente de pagos genera el link real
- NO inventes links

`

    if (products.length > 0) {
      prompt += `\nPRODUCTOS REALES:\n`
      products.slice(0, 3).forEach((p, i) => {
        prompt += `${i + 1}. ${p.name} - $${p.price.toLocaleString('es-CO')} COP\n`
      })
      prompt += `\nMuestra estos productos. NO inventes otros.\n`
    }

    return prompt
  }

  /**
   * Llamar Ollama con fallback automático entre modelos
   */
  private static async callOllama(messages: Message[]): Promise<string> {
    const prompt = messages.map(m => {
      if (m.role === 'system') return m.content
      if (m.role === 'user') return `Cliente: ${m.content}`
      return `Alex: ${m.content}`
    }).join('\n\n') + '\n\nAlex: '

    // Intentar con modelo primario (más rápido)
    try {
      console.log(`[Orchestrator] ⚡ Intentando con ${this.config.model}`)
      return await this.callOllamaModel(prompt, this.config.model)
    } catch (error) {
      console.log(`[Orchestrator] ⚠️ ${this.config.model} falló, probando ${this.config.modelSecondary}`)
      
      // Intentar con modelo secundario
      try {
        return await this.callOllamaModel(prompt, this.config.modelSecondary)
      } catch (error2) {
        console.log(`[Orchestrator] ⚠️ ${this.config.modelSecondary} falló, probando ${this.config.modelTertiary}`)
        
        // Último intento con modelo terciario
        return await this.callOllamaModel(prompt, this.config.modelTertiary)
      }
    }
  }

  /**
   * Llamar Ollama con un modelo específico
   */
  private static async callOllamaModel(prompt: string, model: string): Promise<string> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(`${this.config.url}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.6,
            num_predict: 150,
            repeat_penalty: 1.2
          }
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Ollama HTTP ${response.status}`)
      }

      const data = await response.json()
      return data.response || ''
    } catch (error: any) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  /**
   * Respuesta local (fallback)
   */
  private static localResponse(message: string, products: any[]): OrchestratorResponse {
    const lowerMsg = message.toLowerCase()

    if (products.length > 0) {
      let response = '¡Perfecto! 😊 Tengo:\n\n'
      products.slice(0, 3).forEach((p, i) => {
        response += `${i + 1}. ${p.name} - $${p.price.toLocaleString('es-CO')} COP\n`
      })
      response += '\n¿Cuál te interesa?'
      
      return { message: response, source: 'local', confidence: 70, products }
    }

    // Respuestas genéricas
    if (lowerMsg.includes('pago') || lowerMsg.includes('pagar')) {
      return {
        message: 'Puedes pagar con MercadoPago, PayPal, Nequi o Daviplata. ¿Cuál prefieres? 😊',
        source: 'local',
        confidence: 90
      }
    }

    return {
      message: '😊 ¿En qué puedo ayudarte? Tenemos laptops, cursos y megapacks.',
      source: 'local',
      confidence: 60
    }
  }

  /**
   * Verificar disponibilidad
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.url}/api/tags`, {
        signal: AbortSignal.timeout(3000)
      })
      return response.ok
    } catch {
      return false
    }
  }
}
