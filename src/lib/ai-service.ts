import { groqService } from './groq-service'
import { ollamaService } from './ollama-service'

export interface AIResponse {
  content: string
  model: string
  confidence: number
  tokens?: number
}

export interface AIContext {
  customerName?: string
  conversationHistory?: Array<{ role: string; content: string }>
  products?: any[]
  businessInfo?: {
    name: string
    phone: string
    email?: string
  }
  prompts?: Record<string, string>
}

export class AIService {
  /**
   * Generate AI response using available models
   */
  static async generateResponse(
    message: string,
    context: AIContext,
    preferredModel: string = 'llama-3.1-8b'
  ): Promise<AIResponse> {
    try {
      // Try Ollama first if available
      if (process.env.USE_OLLAMA === 'true') {
        try {
          const ollamaResponse = await ollamaService.generateResponse(message, context)
          return {
            content: ollamaResponse.response,
            model: 'ollama',
            confidence: 0.9,
            tokens: ollamaResponse.response.length
          }
        } catch (ollamaError) {
          console.warn('Ollama failed, falling back to Groq:', ollamaError)
        }
      }

      // Fallback to Groq
      const systemPrompt = this.buildSystemPrompt(context)
      const messages = [
        { role: 'system', content: systemPrompt },
        ...(context.conversationHistory || []),
        { role: 'user', content: message }
      ]

      const groqResponse = await groqService.generateResponse(messages, preferredModel)
      
      return {
        content: groqResponse.response,
        model: preferredModel,
        confidence: 0.85,
        tokens: groqResponse.tokens
      }
    } catch (error) {
      console.error('Error generating AI response:', error)
      throw new Error('Failed to generate AI response')
    }
  }

  /**
   * Build system prompt from context
   */
  private static buildSystemPrompt(context: AIContext): string {
    let prompt = context.prompts?.system || 'Eres un asistente de ventas profesional.'

    if (context.businessInfo) {
      prompt += `\n\nNegocio: ${context.businessInfo.name}`
      if (context.businessInfo.phone) {
        prompt += `\nTeléfono: ${context.businessInfo.phone}`
      }
    }

    if (context.products && context.products.length > 0) {
      prompt += '\n\nProductos disponibles:\n'
      context.products.forEach((product, index) => {
        prompt += `${index + 1}. ${product.name} - $${product.price}\n`
      })
    }

    if (context.customerName) {
      prompt += `\n\nCliente: ${context.customerName}`
    }

    return prompt
  }

  /**
   * Get available AI models
   */
  static getAvailableModels(): string[] {
    const models = ['llama-3.1-8b', 'llama-3.1-70b', 'mixtral-8x7b']
    
    if (process.env.USE_OLLAMA === 'true') {
      models.unshift('ollama')
    }

    return models
  }

  /**
   * Test if a specific model is working
   */
  static async testModel(model: string): Promise<boolean> {
    try {
      if (model === 'ollama') {
        return await ollamaService.testConnection()
      }

      const testResponse = await groqService.generateResponse(
        [{ role: 'user', content: 'Test' }],
        model
      )
      return !!testResponse.response
    } catch (error) {
      console.error(`Model ${model} test failed:`, error)
      return false
    }
  }
}
