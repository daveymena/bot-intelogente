/**
 * 🧠 ANALIZADOR ASÍNCRONO CON OLLAMA
 * 
 * Ollama analiza en background mientras el bot responde inmediatamente.
 * Luego Groq formatea la respuesta final.
 */

import { db } from './db'

interface AnalysisResult {
  intent: string
  products: any[]
  context: string
  confidence: number
}

export class AsyncOllamaAnalyzer {
  private static pendingAnalysis: Map<string, Promise<AnalysisResult>> = new Map()

  /**
   * Iniciar análisis en background (no espera)
   */
  static async startAnalysis(
    conversationKey: string,
    userMessage: string,
    userId: string
  ): Promise<void> {
    console.log('[AsyncOllama] 🚀 Iniciando análisis en background...')

    // Crear promesa de análisis
    const analysisPromise = this.performAnalysis(userMessage, userId)
    
    // Guardar en mapa (no await)
    this.pendingAnalysis.set(conversationKey, analysisPromise)

    // Ejecutar en background
    analysisPromise
      .then(result => {
        console.log('[AsyncOllama] ✅ Análisis completado en background')
        console.log(`[AsyncOllama] 📊 Intención: ${result.intent}, Productos: ${result.products.length}`)
      })
      .catch(error => {
        console.error('[AsyncOllama] ❌ Error en análisis:', error.message)
      })
  }

  /**
   * Obtener resultado del análisis (espera si aún no termina)
   */
  static async getAnalysisResult(conversationKey: string): Promise<AnalysisResult | null> {
    const analysis = this.pendingAnalysis.get(conversationKey)
    
    if (!analysis) {
      console.log('[AsyncOllama] ⚠️ No hay análisis pendiente')
      return null
    }

    try {
      console.log('[AsyncOllama] ⏳ Esperando resultado de análisis...')
      const result = await analysis
      
      // Limpiar del mapa
      this.pendingAnalysis.delete(conversationKey)
      
      return result
    } catch (error) {
      console.error('[AsyncOllama] ❌ Error obteniendo resultado:', error)
      this.pendingAnalysis.delete(conversationKey)
      return null
    }
  }

  /**
   * Verificar si hay análisis en progreso
   */
  static hasAnalysisInProgress(conversationKey: string): boolean {
    return this.pendingAnalysis.has(conversationKey)
  }

  /**
   * Realizar análisis con Ollama
   */
  private static async performAnalysis(
    userMessage: string,
    userId: string
  ): Promise<AnalysisResult> {
    console.log('[AsyncOllama] 🤖 Analizando con Ollama...')

    // 1. Analizar intención
    const intent = await this.analyzeIntent(userMessage)
    
    // 2. Buscar productos en BD
    const products = await this.searchProducts(userMessage, userId)
    
    // 3. Construir contexto
    const context = this.buildContext(products, intent)

    return {
      intent,
      products,
      context,
      confidence: 85
    }
  }

  /**
   * Analizar intención con Ollama
   */
  private static async analyzeIntent(userMessage: string): Promise<string> {
    try {
      const ollamaUrl = process.env.OLLAMA_BASE_URL || 'https://davey-ollama.mapf5v.easypanel.host'
      const ollamaModel = process.env.OLLAMA_MODEL || 'mistral:latest'

      const prompt = `Analiza la intención del cliente en UNA palabra:
- "busqueda" si busca productos
- "detalle" si quiere detalles de un producto
- "pago" si quiere pagar
- "saludo" si es un saludo
- "general" para otras consultas

Mensaje: "${userMessage}"

Responde SOLO con la palabra de intención:`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          prompt,
          stream: false,
          options: {
            temperature: 0.1,
            num_predict: 50
          }
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const intent = data.response.trim().toLowerCase()
        console.log('[AsyncOllama] 🎯 Intención detectada:', intent)
        return intent
      }
    } catch (error) {
      console.error('[AsyncOllama] ⚠️ Error analizando intención:', error)
    }

    return 'general'
  }

  /**
   * Buscar productos en BD
   */
  private static async searchProducts(userMessage: string, userId: string): Promise<any[]> {
    try {
      // Búsqueda simple por palabras clave
      const keywords = userMessage.toLowerCase().split(' ').filter(w => w.length > 3)
      
      const products = await db.product.findMany({
        where: {
          OR: [
            { name: { contains: keywords[0], mode: 'insensitive' } },
            { description: { contains: keywords[0], mode: 'insensitive' } }
          ],
          status: 'AVAILABLE'
        },
        take: 5
      })

      console.log('[AsyncOllama] 📦 Productos encontrados:', products.length)
      return products
    } catch (error) {
      console.error('[AsyncOllama] ⚠️ Error buscando productos:', error)
      return []
    }
  }

  /**
   * Construir contexto para Groq
   */
  private static buildContext(products: any[], intent: string): string {
    if (products.length === 0) {
      return 'No se encontraron productos.'
    }

    let context = `Productos encontrados:\n\n`
    
    products.forEach((p, i) => {
      context += `${i + 1}. ${p.name}\n`
      context += `   Precio: $${p.price.toLocaleString('es-CO')} COP\n`
      if (p.description) {
        context += `   Descripción: ${p.description.substring(0, 100)}...\n`
      }
      context += `\n`
    })

    return context
  }
}
