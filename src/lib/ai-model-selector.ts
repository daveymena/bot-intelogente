/**
 * 🤖 SELECTOR INTELIGENTE DE MODELOS DE IA
 * Detecta automáticamente qué modelos están disponibles y los usa
 * Evita rate limits rotando entre modelos disponibles
 */

import Groq from 'groq-sdk'

interface ModelInfo {
  id: string
  name: string
  tokensPerDay: number
  speed: 'fast' | 'medium' | 'slow'
  quality: 'high' | 'medium' | 'low'
  available: boolean
  lastError?: string
  lastUsed?: Date
}

export class AIModelSelector {
  private static groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || ''
  })

  private static modelCache: ModelInfo[] = []
  private static lastCheck: Date | null = null
  private static checkInterval = 5 * 60 * 1000 // 5 minutos

  /**
   * Lista de modelos de Groq ordenados por preferencia
   */
  private static readonly GROQ_MODELS = [
    {
      id: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B Instant',
      tokensPerDay: 100000,
      speed: 'fast' as const,
      quality: 'high' as const
    },
    {
      id: 'llama-3.2-3b-preview',
      name: 'Llama 3.2 3B Preview',
      tokensPerDay: 100000,
      speed: 'fast' as const,
      quality: 'medium' as const
    },
    {
      id: 'llama-3.2-1b-preview',
      name: 'Llama 3.2 1B Preview',
      tokensPerDay: 100000,
      speed: 'fast' as const,
      quality: 'medium' as const
    },
    {
      id: 'gemma2-9b-it',
      name: 'Gemma 2 9B',
      tokensPerDay: 100000,
      speed: 'fast' as const,
      quality: 'high' as const
    },
    {
      id: 'gemma-7b-it',
      name: 'Gemma 7B',
      tokensPerDay: 100000,
      speed: 'fast' as const,
      quality: 'medium' as const
    },
    {
      id: 'mixtral-8x7b-32768',
      name: 'Mixtral 8x7B',
      tokensPerDay: 100000,
      speed: 'medium' as const,
      quality: 'high' as const
    },
    {
      id: 'llama-3.3-70b-versatile',
      name: 'Llama 3.3 70B Versatile',
      tokensPerDay: 100000,
      speed: 'slow' as const,
      quality: 'high' as const
    }
  ]

  /**
   * Obtener el mejor modelo disponible
   */
  static async getBestAvailableModel(): Promise<string> {
    try {
      // Si el caché es reciente, usarlo
      if (this.modelCache.length > 0 && this.lastCheck) {
        const timeSinceCheck = Date.now() - this.lastCheck.getTime()
        if (timeSinceCheck < this.checkInterval) {
          const available = this.modelCache.find(m => m.available)
          if (available) {
            console.log(`[Model Selector] 📦 Usando modelo en caché: ${available.id}`)
            return available.id
          }
        }
      }

      // Actualizar lista de modelos disponibles
      await this.updateAvailableModels()

      // Obtener el mejor modelo disponible
      const bestModel = this.modelCache.find(m => m.available)

      if (bestModel) {
        console.log(`[Model Selector] ✅ Mejor modelo disponible: ${bestModel.id}`)
        return bestModel.id
      }

      // Fallback al modelo por defecto
      console.log(`[Model Selector] ⚠️ No se encontraron modelos disponibles, usando fallback`)
      return 'llama-3.1-8b-instant'
    } catch (error) {
      console.error('[Model Selector] ❌ Error obteniendo modelo:', error)
      return 'llama-3.1-8b-instant'
    }
  }

  /**
   * Actualizar lista de modelos disponibles
   */
  private static async updateAvailableModels(): Promise<void> {
    console.log('[Model Selector] 🔍 Detectando modelos disponibles...')

    const availableModels: ModelInfo[] = []

    for (const model of this.GROQ_MODELS) {
      try {
        // Intentar una llamada de prueba muy pequeña
        const testResponse = await this.groq.chat.completions.create({
          model: model.id,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
          temperature: 0
        })

        if (testResponse.choices && testResponse.choices.length > 0) {
          availableModels.push({
            ...model,
            available: true,
            lastUsed: new Date()
          })
          console.log(`[Model Selector] ✅ ${model.id} - Disponible`)
        }
      } catch (error: any) {
        const errorMessage = error?.message || String(error)
        
        // Si es rate limit, el modelo existe pero está agotado
        if (errorMessage.includes('rate_limit_exceeded')) {
          availableModels.push({
            ...model,
            available: false,
            lastError: 'Rate limit exceeded'
          })
          console.log(`[Model Selector] ⏳ ${model.id} - Rate limit alcanzado`)
        } 
        // Si es modelo no encontrado, no está disponible
        else if (errorMessage.includes('model_not_found') || errorMessage.includes('404')) {
          console.log(`[Model Selector] ❌ ${model.id} - No encontrado`)
        }
        // Otros errores
        else {
          availableModels.push({
            ...model,
            available: false,
            lastError: errorMessage
          })
          console.log(`[Model Selector] ⚠️ ${model.id} - Error: ${errorMessage.substring(0, 50)}`)
        }
      }

      // Pequeña pausa entre pruebas para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    this.modelCache = availableModels
    this.lastCheck = new Date()

    const availableCount = availableModels.filter(m => m.available).length
    console.log(`[Model Selector] 📊 Resumen: ${availableCount}/${this.GROQ_MODELS.length} modelos disponibles`)
  }

  /**
   * Obtener lista de modelos disponibles
   */
  static async getAvailableModels(): Promise<ModelInfo[]> {
    if (this.modelCache.length === 0 || !this.lastCheck) {
      await this.updateAvailableModels()
    }
    return this.modelCache.filter(m => m.available)
  }

  /**
   * Obtener estadísticas de modelos
   */
  static async getModelStats(): Promise<{
    total: number
    available: number
    rateLimited: number
    models: ModelInfo[]
  }> {
    if (this.modelCache.length === 0 || !this.lastCheck) {
      await this.updateAvailableModels()
    }

    return {
      total: this.modelCache.length,
      available: this.modelCache.filter(m => m.available).length,
      rateLimited: this.modelCache.filter(m => m.lastError?.includes('rate_limit')).length,
      models: this.modelCache
    }
  }

  /**
   * Forzar actualización de modelos
   */
  static async forceUpdate(): Promise<void> {
    this.lastCheck = null
    this.modelCache = []
    await this.updateAvailableModels()
  }

  /**
   * Obtener modelo alternativo si el actual falla
   */
  static async getAlternativeModel(failedModel: string): Promise<string | null> {
    const available = this.modelCache.filter(m => m.available && m.id !== failedModel)
    
    if (available.length > 0) {
      // Ordenar por velocidad y calidad
      available.sort((a, b) => {
        const speedScore = { fast: 3, medium: 2, slow: 1 }
        const qualityScore = { high: 3, medium: 2, low: 1 }
        
        const scoreA = speedScore[a.speed] + qualityScore[a.quality]
        const scoreB = speedScore[b.speed] + qualityScore[b.quality]
        
        return scoreB - scoreA
      })

      console.log(`[Model Selector] 🔄 Modelo alternativo: ${available[0].id}`)
      return available[0].id
    }

    return null
  }

  /**
   * Marcar modelo como fallido
   */
  static markModelAsFailed(modelId: string, error: string): void {
    const model = this.modelCache.find(m => m.id === modelId)
    if (model) {
      model.available = false
      model.lastError = error
      console.log(`[Model Selector] ❌ Modelo ${modelId} marcado como fallido: ${error}`)
    }
  }
}
