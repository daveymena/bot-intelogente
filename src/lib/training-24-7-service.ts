/**
 * 🎓 SERVICIO DE ENTRENAMIENTO 24/7
 * 
 * Gestiona el entrenamiento continuo del bot con:
 * - Groq (respuestas rápidas)
 * - Ollama (razonamiento profundo)
 * - Envío automático de fotos
 * - Respuestas humanizadas
 */

import { db } from './db'
import fs from 'fs'
import path from 'path'

interface TrainingData {
  userMessage: string
  botResponse: string
  intent: string
  productId?: string
  includePhoto?: boolean
  tone: 'casual' | 'professional' | 'friendly'
  confidence: number
  timestamp: Date
}

export class Training24_7Service {
  private static trainingCache: Map<string, TrainingData[]> = new Map()
  private static isInitialized = false

  /**
   * Inicializar servicio de entrenamiento
   */
  static async initialize() {
    if (this.isInitialized) return

    console.log('[Training24/7] 🎓 Inicializando servicio de entrenamiento...')

    try {
      // Cargar datos de entrenamiento
      await this.loadTrainingData()
      this.isInitialized = true
      console.log('[Training24/7] ✅ Servicio inicializado')
    } catch (error) {
      console.error('[Training24/7] ❌ Error inicializando:', error)
    }
  }

  /**
   * Cargar datos de entrenamiento desde archivos
   */
  private static async loadTrainingData() {
    const archivos = [
      'data/entrenamiento-24-7-completo.json',
      'data/entrenamiento-completo-todos-productos.json',
      'data/entrenamiento-flujo-completo-conversacional.json'
    ]

    for (const archivo of archivos) {
      try {
        const rutaCompleta = path.join(process.cwd(), archivo)
        if (!fs.existsSync(rutaCompleta)) continue

        const contenido = await fs.promises.readFile(rutaCompleta, 'utf-8')
        const datos = JSON.parse(contenido)

        if (datos.ejemplos) {
          for (const ejemplo of datos.ejemplos) {
            const key = this.generateKey(ejemplo.entrada)
            const existing = this.trainingCache.get(key) || []
            existing.push({
              userMessage: ejemplo.entrada,
              botResponse: ejemplo.salida,
              intent: ejemplo.intencion,
              productId: ejemplo.producto_id,
              includePhoto: ejemplo.incluir_foto,
              tone: ejemplo.tono || 'friendly',
              confidence: 0.9,
              timestamp: new Date()
            })
            this.trainingCache.set(key, existing)
          }
        }

        console.log(`[Training24/7] ✅ Cargado: ${archivo}`)
      } catch (error) {
        console.log(`[Training24/7] ⚠️ No se pudo cargar: ${archivo}`)
      }
    }

    console.log(`[Training24/7] 📚 Total de patrones cargados: ${this.trainingCache.size}`)
  }

  /**
   * Generar clave para búsqueda rápida
   */
  private static generateKey(message: string): string {
    return message
      .toLowerCase()
      .replace(/[¿?¡!.,]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join('_')
  }

  /**
   * Buscar respuesta entrenada
   */
  static async findTrainedResponse(
    userMessage: string,
    userId: string
  ): Promise<TrainingData | null> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const key = this.generateKey(userMessage)
    const candidates = this.trainingCache.get(key)

    if (!candidates || candidates.length === 0) {
      return null
    }

    // Retornar el más relevante
    return candidates[0]
  }

  /**
   * Determinar si debe enviar foto
   */
  static shouldSendPhoto(
    intent: string,
    productId?: string
  ): boolean {
    // Intenciones que típicamente requieren fotos
    const photoIntents = [
      'photo_request',
      'product_info',
      'product_search',
      'product_details'
    ]

    return photoIntents.includes(intent) && !!productId
  }

  /**
   * Obtener tono apropiado según contexto
   */
  static getToneForContext(
    intent: string,
    messageCount: number
  ): 'casual' | 'professional' | 'friendly' {
    // Primera interacción: friendly
    if (messageCount <= 1) return 'friendly'

    // Intenciones de compra: professional
    if (['purchase', 'payment', 'payment_request'].includes(intent)) {
      return 'professional'
    }

    // Consultas generales: casual
    if (['greeting', 'general_inquiry'].includes(intent)) {
      return 'casual'
    }

    // Por defecto: friendly
    return 'friendly'
  }

  /**
   * Registrar nueva interacción para aprendizaje
   */
  static async recordInteraction(
    userId: string,
    userMessage: string,
    botResponse: string,
    intent: string,
    productId?: string,
    includePhoto?: boolean
  ) {
    try {
      // Guardar en base de datos para análisis futuro
      await db.conversationAnalytics.create({
        data: {
          userId,
          userMessage,
          botResponse,
          intent,
          productId,
          includePhoto: includePhoto || false,
          timestamp: new Date()
        }
      }).catch(() => {
        // Tabla puede no existir, ignorar error
      })

      // Agregar al cache para uso inmediato
      const key = this.generateKey(userMessage)
      const existing = this.trainingCache.get(key) || []
      existing.push({
        userMessage,
        botResponse,
        intent,
        productId,
        includePhoto,
        tone: 'friendly',
        confidence: 0.8,
        timestamp: new Date()
      })
      this.trainingCache.set(key, existing)

    } catch (error) {
      console.error('[Training24/7] ⚠️ Error registrando interacción:', error)
    }
  }

  /**
   * Obtener estadísticas de entrenamiento
   */
  static getStats() {
    return {
      totalPatterns: this.trainingCache.size,
      isInitialized: this.isInitialized,
      cacheSize: this.trainingCache.size
    }
  }

  /**
   * Limpiar cache (útil para recargar datos)
   */
  static clearCache() {
    this.trainingCache.clear()
    this.isInitialized = false
    console.log('[Training24/7] 🧹 Cache limpiado')
  }

  /**
   * Recargar datos de entrenamiento
   */
  static async reload() {
    this.clearCache()
    await this.initialize()
    console.log('[Training24/7] 🔄 Datos recargados')
  }
}
