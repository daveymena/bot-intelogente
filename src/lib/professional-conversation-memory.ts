/**
 * 🧠 MEMORIA PROFESIONAL DE CONVERSACIÓN
 * Sistema avanzado de memoria contextual para mantener el hilo de la conversación
 */

interface ConversationMemory {
  // Producto actual
  currentProduct: {
    id: string
    name: string
    price: number
    category: string
    mentionedAt: Date
  } | null
  
  // Historial de productos mencionados (últimos 5)
  productHistory: Array<{
    id: string
    name: string
    mentionedAt: Date
  }>
  
  // Intenciones detectadas
  intentions: Array<{
    type: string // 'buy', 'info', 'price', 'compare', etc.
    detectedAt: Date
  }>
  
  // Presupuesto mencionado
  budget: {
    amount: number | null
    mentionedAt: Date | null
  }
  
  // Objeciones mencionadas
  objections: Array<{
    type: string // 'price', 'quality', 'doubt', etc.
    message: string
    detectedAt: Date
  }>
  
  // Preferencias del cliente
  preferences: {
    priceRange?: { min: number, max: number }
    categories?: string[]
    keywords?: string[]
  }
  
  // Estado de la conversación
  state: {
    stage: 'greeting' | 'discovery' | 'presentation' | 'negotiation' | 'closing' | 'post_sale'
    lastInteraction: Date
    messageCount: number
    isActive: boolean
  }
  
  // Resumen de la conversación
  summary: string
}

import Redis from 'ioredis'

export class ProfessionalConversationMemory {
  private static memories = new Map<string, ConversationMemory>()
  private static MEMORY_TIMEOUT = 24 * 60 * 60 * 1000
  private static redis: Redis | null = null
  private static redisEnabled = false
  private static redisKeyPrefix = 'conversation:memory:'

  private static initRedis() {
    if (this.redisEnabled) return
    const url = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL
    if (!url) return
    this.redis = new Redis(url as string)
    this.redisEnabled = true
  }

  private static async saveToRedis(key: string, memory: ConversationMemory) {
    this.initRedis()
    if (!this.redis) return
    const fullKey = `${this.redisKeyPrefix}${key}`
    await this.redis.set(fullKey, JSON.stringify(memory), 'EX', Math.floor(this.MEMORY_TIMEOUT / 1000))
  }

  private static async loadFromRedis(key: string): Promise<ConversationMemory | null> {
    this.initRedis()
    if (!this.redis) return null
    const fullKey = `${this.redisKeyPrefix}${key}`
    let data: string | null = null
    try {
      data = await this.redis.get(fullKey)
    } catch {
      return null
    }
    if (!data) return null
    try {
      const parsed = JSON.parse(data)
      if (parsed.currentProduct && parsed.currentProduct.mentionedAt) {
        parsed.currentProduct.mentionedAt = new Date(parsed.currentProduct.mentionedAt)
      }
      if (Array.isArray(parsed.productHistory)) {
        parsed.productHistory = parsed.productHistory.map((p: any) => ({
          ...p,
          mentionedAt: p.mentionedAt ? new Date(p.mentionedAt) : new Date()
        }))
      }
      if (parsed.budget && parsed.budget.mentionedAt) {
        parsed.budget.mentionedAt = new Date(parsed.budget.mentionedAt)
      }
      if (parsed.state && parsed.state.lastInteraction) {
        parsed.state.lastInteraction = new Date(parsed.state.lastInteraction)
      }
      return parsed as ConversationMemory
    } catch {
      return null
    }
  }

  static async hydrateFromStore(conversationKey: string): Promise<void> {
    const exists = this.memories.get(conversationKey)
    if (exists) return
    const loaded = await this.loadFromRedis(conversationKey)
    if (loaded) {
      this.memories.set(conversationKey, loaded)
    }
  }
  
  /**
   * Inicializar memoria para una conversación nueva
   */
  static initMemory(conversationKey: string): void {
    if (!this.memories.has(conversationKey)) {
      this.memories.set(conversationKey, {
        currentProduct: null,
        productHistory: [],
        intentions: [],
        budget: { amount: null, mentionedAt: null },
        objections: [],
        preferences: {},
        state: {
          stage: 'greeting',
          lastInteraction: new Date(),
          messageCount: 0,
          isActive: true
        },
        summary: ''
      })
      
      console.log(`[Memory] 🆕 Memoria inicializada para ${conversationKey}`)
      const mem = this.memories.get(conversationKey)!
      this.saveToRedis(conversationKey, mem).catch(() => {})
    }
  }
  
  /**
   * Actualizar producto actual
   */
  static setCurrentProduct(
    conversationKey: string,
    productId: string,
    productName: string,
    price: number,
    category: string
  ): void {
    this.initMemory(conversationKey)
    const memory = this.memories.get(conversationKey)!
    
    // Guardar producto anterior en historial
    if (memory.currentProduct) {
      memory.productHistory.unshift({
        id: memory.currentProduct.id,
        name: memory.currentProduct.name,
        mentionedAt: memory.currentProduct.mentionedAt
      })
      
      // Mantener solo últimos 5 productos
      if (memory.productHistory.length > 5) {
        memory.productHistory = memory.productHistory.slice(0, 5)
      }
    }
    
    // Actualizar producto actual
    memory.currentProduct = {
      id: productId,
      name: productName,
      price,
      category,
      mentionedAt: new Date()
    }
    
    memory.state.lastInteraction = new Date()
    memory.state.messageCount++
    
    console.log(`[Memory] 💾 Producto actual: ${productName}`)
    console.log(`[Memory] 📚 Historial: ${memory.productHistory.length} productos`)
    this.saveToRedis(conversationKey, memory).catch(() => {})
  }
  
  /**
   * Limpiar historial de productos
   */
  static clearProductHistory(conversationKey: string): void {
    this.initMemory(conversationKey)
    const memory = this.memories.get(conversationKey)!
    memory.productHistory = []
    console.log(`[Memory] 🗑️ Historial de productos limpiado`)
    this.saveToRedis(conversationKey, memory).catch(() => {})
  }
  
  /**
   * Agregar producto al historial (sin hacerlo actual)
   */
  static addToProductHistory(
    conversationKey: string,
    productId: string,
    productName: string
  ): void {
    this.initMemory(conversationKey)
    const memory = this.memories.get(conversationKey)!
    
    memory.productHistory.push({
      id: productId,
      name: productName,
      mentionedAt: new Date()
    })
    
    // Mantener solo últimos 10 productos
    if (memory.productHistory.length > 10) {
      memory.productHistory = memory.productHistory.slice(0, 10)
    }
    this.saveToRedis(conversationKey, memory).catch(() => {})
  }
  
  /**
   * Registrar intención detectada
   */
  static addIntention(conversationKey: string, intentionType: string): void {
    this.initMemory(conversationKey)
    const memory = this.memories.get(conversationKey)!
    
    memory.intentions.push({
      type: intentionType,
      detectedAt: new Date()
    })
    
    // Mantener solo últimas 10 intenciones
    if (memory.intentions.length > 10) {
      memory.intentions = memory.intentions.slice(-10)
    }
    
    // Actualizar etapa según intención
    this.updateStage(conversationKey, intentionType)
    
    console.log(`[Memory] 🎯 Intención registrada: ${intentionType}`)
    this.saveToRedis(conversationKey, memory).catch(() => {})
  }
  
  /**
   * Actualizar etapa de la conversación
   */
  private static updateStage(conversationKey: string, intentionType: string): void {
    const memory = this.memories.get(conversationKey)!
    
    const stageMap: Record<string, ConversationMemory['state']['stage']> = {
      'greeting': 'greeting',
      'info': 'discovery',
      'search': 'discovery',
      'price': 'presentation',
      'compare': 'presentation',
      'objection': 'negotiation',
      'budget': 'negotiation',
      'buy': 'closing',
      'payment': 'closing'
    }
    
    const newStage = stageMap[intentionType]
    if (newStage && newStage !== memory.state.stage) {
      memory.state.stage = newStage
      console.log(`[Memory] 📊 Etapa actualizada: ${newStage}`)
      this.saveToRedis(conversationKey, memory).catch(() => {})
    }
  }
  
  /**
   * Registrar presupuesto mencionado
   */
  static setBudget(conversationKey: string, amount: number): void {
    this.initMemory(conversationKey)
    const memory = this.memories.get(conversationKey)!
    
    memory.budget = {
      amount,
      mentionedAt: new Date()
    }
    
    console.log(`[Memory] 💰 Presupuesto registrado: ${amount.toLocaleString('es-CO')} COP`)
    this.saveToRedis(conversationKey, memory).catch(() => {})
  }
  
  /**
   * Registrar objeción
   */
  static addObjection(conversationKey: string, type: string, message: string): void {
    this.initMemory(conversationKey)
    const memory = this.memories.get(conversationKey)!
    
    memory.objections.push({
      type,
      message,
      detectedAt: new Date()
    })
    
    // Mantener solo últimas 5 objeciones
    if (memory.objections.length > 5) {
      memory.objections = memory.objections.slice(-5)
    }
    
    console.log(`[Memory] ⚠️ Objeción registrada: ${type}`)
    this.saveToRedis(conversationKey, memory).catch(() => {})
  }
  
  /**
   * Actualizar preferencias del cliente
   */
  static updatePreferences(
    conversationKey: string,
    preferences: Partial<ConversationMemory['preferences']>
  ): void {
    this.initMemory(conversationKey)
    const memory = this.memories.get(conversationKey)!
    
    memory.preferences = {
      ...memory.preferences,
      ...preferences
    }
    
    console.log(`[Memory] ⚙️ Preferencias actualizadas`)
    this.saveToRedis(conversationKey, memory).catch(() => {})
  }
  
  /**
   * Obtener memoria completa
   */
  static getMemory(conversationKey: string): ConversationMemory | null {
    let memory = this.memories.get(conversationKey)
    if (!memory) {
      return null
    }
    
    // Verificar expiración
    const elapsed = new Date().getTime() - memory.state.lastInteraction.getTime()
    if (elapsed > this.MEMORY_TIMEOUT) {
      console.log(`[Memory] ⏰ Memoria expirada (${Math.round(elapsed / 3600000)}h)`)
      this.memories.delete(conversationKey)
      return null
    }
    
    return memory
  }
  
  /**
   * Generar resumen contextual para el prompt de IA
   */
  static generateContextSummary(conversationKey: string): string {
    const memory = this.getMemory(conversationKey)
    
    if (!memory) {
      return 'Nueva conversación sin historial previo.'
    }
    
    let summary = '📋 CONTEXTO DE LA CONVERSACIÓN:\n\n'
    
    // Producto actual
    if (memory.currentProduct) {
      summary += `🎯 PRODUCTO ACTUAL:\n`
      summary += `   - Nombre: ${memory.currentProduct.name}\n`
      summary += `   - Precio: ${memory.currentProduct.price.toLocaleString('es-CO')} COP\n`
      summary += `   - Categoría: ${memory.currentProduct.category}\n`
      summary += `   - Mencionado hace: ${this.getTimeAgo(memory.currentProduct.mentionedAt)}\n\n`
    }
    
    // Historial de productos
    if (memory.productHistory.length > 0) {
      summary += `📚 PRODUCTOS PREVIAMENTE MENCIONADOS:\n`
      memory.productHistory.forEach((p, i) => {
        summary += `   ${i + 1}. ${p.name} (hace ${this.getTimeAgo(p.mentionedAt)})\n`
      })
      summary += '\n'
    }
    
    // Presupuesto
    if (memory.budget.amount) {
      summary += `💰 PRESUPUESTO DEL CLIENTE:\n`
      summary += `   - Máximo: ${memory.budget.amount.toLocaleString('es-CO')} COP\n`
      summary += `   - Mencionado hace: ${this.getTimeAgo(memory.budget.mentionedAt!)}\n\n`
    }
    
    // Objeciones recientes
    if (memory.objections.length > 0) {
      summary += `⚠️ OBJECIONES DETECTADAS:\n`
      memory.objections.slice(-3).forEach(obj => {
        summary += `   - ${obj.type}: "${obj.message}"\n`
      })
      summary += '\n'
    }
    
    // Etapa de la conversación
    summary += `📊 ETAPA ACTUAL: ${this.getStageLabel(memory.state.stage)}\n`
    summary += `💬 Mensajes intercambiados: ${memory.state.messageCount}\n\n`
    
    // Instrucciones según etapa
    summary += this.getStageInstructions(memory.state.stage)
    
    return summary
  }
  
  /**
   * Obtener tiempo transcurrido en formato legible
   */
  private static getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return `${Math.floor(seconds / 86400)}d`
  }
  
  /**
   * Obtener etiqueta de etapa
   */
  private static getStageLabel(stage: ConversationMemory['state']['stage']): string {
    const labels = {
      'greeting': 'Saludo inicial',
      'discovery': 'Descubrimiento de necesidades',
      'presentation': 'Presentación de productos',
      'negotiation': 'Negociación',
      'closing': 'Cierre de venta',
      'post_sale': 'Post-venta'
    }
    return labels[stage]
  }
  
  /**
   * Obtener instrucciones según etapa
   */
  private static getStageInstructions(stage: ConversationMemory['state']['stage']): string {
    const instructions = {
      'greeting': '👋 Enfócate en dar la bienvenida y entender qué busca el cliente.',
      'discovery': '🔍 Haz preguntas para entender mejor las necesidades del cliente.',
      'presentation': '📦 Presenta el producto destacando beneficios relevantes para el cliente.',
      'negotiation': '💬 Maneja objeciones con empatía y ofrece alternativas si es necesario.',
      'closing': '✅ El cliente está listo para comprar, facilita el proceso de pago.',
      'post_sale': '🎉 Confirma la compra y ofrece soporte post-venta.'
    }
    return `\n🎯 INSTRUCCIÓN: ${instructions[stage]}\n`
  }
  
  /**
   * Incrementar contador de mensajes
   */
  static incrementMessageCount(conversationKey: string): void {
    const memory = this.memories.get(conversationKey)
    if (memory) {
      memory.state.messageCount++
      memory.state.lastInteraction = new Date()
      this.saveToRedis(conversationKey, memory).catch(() => {})
    }
  }
  
  /**
   * Limpiar memoria
   */
  static clearMemory(conversationKey: string): void {
    this.memories.delete(conversationKey)
    console.log(`[Memory] 🗑️ Memoria limpiada para ${conversationKey}`)
    this.initRedis()
    if (this.redis) {
      const fullKey = `${this.redisKeyPrefix}${conversationKey}`
      this.redis.del(fullKey).catch(() => {})
    }
  }
  
  /**
   * Limpiar memorias expiradas
   */
  static cleanExpiredMemories(): void {
    const now = new Date().getTime()
    let cleaned = 0
    
    for (const [key, memory] of Array.from(this.memories.entries())) {
      const elapsed = now - memory.state.lastInteraction.getTime()
      if (elapsed > this.MEMORY_TIMEOUT) {
        this.memories.delete(key)
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      console.log(`[Memory] 🧹 Limpiadas ${cleaned} memorias expiradas`)
    }
  }
  
  /**
   * Obtener estadísticas
   */
  static getStats(): {
    total: number
    byStage: Record<string, number>
    avgMessages: number
  } {
    const memories = Array.from(this.memories.values())
    
    const byStage: Record<string, number> = {}
    let totalMessages = 0
    
    memories.forEach(m => {
      byStage[m.state.stage] = (byStage[m.state.stage] || 0) + 1
      totalMessages += m.state.messageCount
    })
    
    return {
      total: memories.length,
      byStage,
      avgMessages: memories.length > 0 ? Math.round(totalMessages / memories.length) : 0
    }
  }
}

// Limpiar memorias expiradas cada 30 minutos
setInterval(() => {
  ProfessionalConversationMemory.cleanExpiredMemories()
}, 30 * 60 * 1000)
