/**
 * 🧠 AI Model Selector - Selección inteligente de modelos
 * Detecta automáticamente qué modelos están disponibles y cuáles funcionan mejor
 */

interface ModelInfo {
  name: string
  provider: 'groq' | 'openai' | 'claude' | 'gemini'
  available: boolean
  lastTested: Date
  failureCount: number
  avgResponseTime: number
  maxTokens: number
}

export class AIModelSelector {
  private static models: Map<string, ModelInfo> = new Map()
  private static lastCheck: Date | null = null
  private static checkInterval = 5 * 60 * 1000 // 5 minutos

  /**
   * Obtener el mejor modelo disponible
   */
  static async getBestAvailableModel(): Promise<string | null> {
    await this.updateModelAvailability()
    
    // Filtrar modelos disponibles y ordenar por rendimiento
    const availableModels = Array.from(this.models.values())
      .filter(model => model.available && model.failureCount < 3)
      .sort((a, b) => {
        // Priorizar por menor tiempo de respuesta y menos fallos
        const scoreA = a.avgResponseTime + (a.failureCount * 1000)
        const scoreB = b.avgResponseTime + (b.failureCount * 1000)
        return scoreA - scoreB
      })

    return availableModels.length > 0 ? availableModels[0].name : null
  }

  /**
   * Obtener modelo alternativo cuando uno falla
   */
  static async getAlternativeModel(failedModel: string): Promise<string | null> {
    const availableModels = Array.from(this.models.values())
      .filter(model => 
        model.name !== failedModel && 
        model.available && 
        model.failureCount < 3
      )
      .sort((a, b) => a.failureCount - b.failureCount)

    return availableModels.length > 0 ? availableModels[0].name : null
  }

  /**
   * Marcar modelo como fallido
   */
  static markModelAsFailed(modelName: string, reason: string): void {
    const model = this.models.get(modelName)
    if (model) {
      model.failureCount++
      model.lastTested = new Date()
      
      // Si falla mucho, marcarlo como no disponible temporalmente
      if (model.failureCount >= 3) {
        model.available = false
      }
      
      console.log(`⚠️ Modelo ${modelName} marcado como fallido: ${reason} (fallos: ${model.failureCount})`)
    }
  }

  /**
   * Marcar modelo como exitoso
   */
  static markModelAsSuccessful(modelName: string, responseTime: number): void {
    let model = this.models.get(modelName)
    if (!model) {
      // Crear entrada si no existe
      model = {
        name: modelName,
        provider: this.detectProvider(modelName),
        available: true,
        lastTested: new Date(),
        failureCount: 0,
        avgResponseTime: responseTime,
        maxTokens: this.getMaxTokens(modelName)
      }
      this.models.set(modelName, model)
    } else {
      // Actualizar estadísticas
      model.available = true
      model.lastTested = new Date()
      model.failureCount = Math.max(0, model.failureCount - 1) // Reducir fallos en éxito
      model.avgResponseTime = (model.avgResponseTime + responseTime) / 2 // Promedio móvil
    }
  }

  /**
   * Actualizar disponibilidad de modelos
   */
  private static async updateModelAvailability(): Promise<void> {
    const now = new Date()
    
    // Solo verificar cada 5 minutos
    if (this.lastCheck && (now.getTime() - this.lastCheck.getTime()) < this.checkInterval) {
      return
    }

    this.lastCheck = now

    // Modelos por defecto a verificar
    const defaultModels = [
      'llama-3.1-8b-instant',
      'llama-3.1-70b-versatile',
      'mixtral-8x7b-32768',
      'gemma2-9b-it'
    ]

    for (const modelName of defaultModels) {
      if (!this.models.has(modelName)) {
        this.models.set(modelName, {
          name: modelName,
          provider: this.detectProvider(modelName),
          available: true, // Asumir disponible hasta que falle
          lastTested: now,
          failureCount: 0,
          avgResponseTime: 2000, // 2s por defecto
          maxTokens: this.getMaxTokens(modelName)
        })
      }
    }
  }

  /**
   * Detectar proveedor por nombre del modelo
   */
  private static detectProvider(modelName: string): 'groq' | 'openai' | 'claude' | 'gemini' {
    if (modelName.includes('llama') || modelName.includes('mixtral') || modelName.includes('gemma')) {
      return 'groq'
    }
    if (modelName.includes('gpt')) {
      return 'openai'
    }
    if (modelName.includes('claude')) {
      return 'claude'
    }
    if (modelName.includes('gemini')) {
      return 'gemini'
    }
    return 'groq' // Por defecto
  }

  /**
   * Obtener límite de tokens por modelo
   */
  private static getMaxTokens(modelName: string): number {
    const tokenLimits: Record<string, number> = {
      'llama-3.1-8b-instant': 8192,
      'llama-3.1-70b-versatile': 8192,
      'mixtral-8x7b-32768': 32768,
      'gemma2-9b-it': 8192,
      'gpt-4': 8192,
      'gpt-3.5-turbo': 4096,
      'claude-3-sonnet': 4096
    }
    
    return tokenLimits[modelName] || 4096
  }

  /**
   * Obtener estadísticas de todos los modelos
   */
  static getModelStats(): ModelInfo[] {
    return Array.from(this.models.values())
  }

  /**
   * Resetear estadísticas de fallos
   */
  static resetFailureStats(): void {
    for (const model of this.models.values()) {
      model.failureCount = 0
      model.available = true
    }
    console.log('✅ Estadísticas de fallos reseteadas')
  }
}