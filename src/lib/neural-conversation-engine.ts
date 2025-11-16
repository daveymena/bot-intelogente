/**
 * Neural Conversation Engine
 * Motor de conversación con redes neuronales simples
 * Entrena al bot con flujos conversacionales completos
 * Mantiene memoria y contexto durante toda la conversación
 */

import fs from 'fs'
import path from 'path'

interface ConversationTurn {
  turno: number
  rol: 'usuario' | 'bot'
  mensaje: string
  intención: string
  contexto_memoria?: string
  entidades: string[]
  sentimiento: string
  producto?: string
  precio?: number
  acciones?: string[]
}

interface ConversationFlow {
  id: string
  nombre: string
  intención: string
  contexto: string
  conversación: ConversationTurn[]
}

interface ConversationMemory {
  producto_actual: string | null
  historial_compras: string[]
  preferencias: { [key: string]: any }
  contexto_conversación: string
  intención_actual: string
  sentimiento_usuario: string
  turno_actual: number
}

interface NeuralPattern {
  entrada: string[]
  salida: string
  peso: number
  intención: string
  contexto: string
}

export class NeuralConversationEngine {
  private static flujos: ConversationFlow[] = []
  private static patrones: NeuralPattern[] = []
  private static memoria: Map<string, ConversationMemory> = new Map()
  private static trainingPath = path.join(process.cwd(), 'data', 'entrenamiento-flujo-completo-conversacional.json')

  /**
   * Inicializar motor de conversación
   */
  static async initialize(): Promise<void> {
    console.log('[NeuralEngine] 🧠 Inicializando Motor de Conversación Neural...')

    try {
      // Cargar flujos de entrenamiento
      await this.loadTrainingFlows()

      // Entrenar patrones neuronales
      this.trainNeuralPatterns()

      console.log('[NeuralEngine] ✅ Motor de conversación inicializado')
      console.log(`[NeuralEngine] 📚 Flujos cargados: ${this.flujos.length}`)
      console.log(`[NeuralEngine] 🧠 Patrones neuronales: ${this.patrones.length}`)
    } catch (error) {
      console.error('[NeuralEngine] ❌ Error inicializando:', error)
      throw error
    }
  }

  /**
   * Cargar flujos de entrenamiento
   */
  private static async loadTrainingFlows(): Promise<void> {
    try {
      if (!fs.existsSync(this.trainingPath)) {
        console.warn('[NeuralEngine] ⚠️ Archivo de entrenamiento no encontrado')
        return
      }

      const data = fs.readFileSync(this.trainingPath, 'utf-8')
      const trainingData = JSON.parse(data)

      this.flujos = trainingData.flujos_conversacionales || []
      console.log(`[NeuralEngine] 📚 ${this.flujos.length} flujos de entrenamiento cargados`)
    } catch (error) {
      console.error('[NeuralEngine] ❌ Error cargando flujos:', error)
    }
  }

  /**
   * Entrenar patrones neuronales
   * Crea patrones de entrada-salida basados en los flujos
   */
  private static trainNeuralPatterns(): void {
    console.log('[NeuralEngine] 🧠 Entrenando patrones neuronales...')

    this.patrones = []

    for (const flujo of this.flujos) {
      const conversación = flujo.conversación

      // Procesar cada turno del usuario
      for (let i = 0; i < conversación.length; i += 2) {
        const turnoUsuario = conversación[i]
        const turnoBot = conversación[i + 1]

        if (!turnoBot) continue

        // Extraer palabras clave del mensaje del usuario
        const palabrasClaveUsuario = this.extraerPalabrasClaveNormalizadas(turnoUsuario.mensaje)

        // Crear patrón neuronal
        const patron: NeuralPattern = {
          entrada: palabrasClaveUsuario,
          salida: turnoBot.mensaje,
          peso: this.calcularPesoPatron(turnoUsuario, turnoBot),
          intención: turnoBot.intención,
          contexto: turnoUsuario.contexto_memoria || flujo.contexto
        }

        this.patrones.push(patron)
      }
    }

    console.log(`[NeuralEngine] ✅ ${this.patrones.length} patrones neuronales entrenados`)
  }

  /**
   * Extraer palabras clave normalizadas
   */
  private static extraerPalabrasClaveNormalizadas(texto: string): string[] {
    return texto
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(palabra => palabra.length > 2)
  }

  /**
   * Calcular peso del patrón
   * Patrones más específicos tienen mayor peso
   */
  private static calcularPesoPatron(turnoUsuario: ConversationTurn, turnoBot: ConversationTurn): number {
    let peso = 0.5 // Base

    // Bonus por entidades específicas
    if (turnoUsuario.entidades.length > 0) {
      peso += 0.2
    }

    // Bonus por contexto de memoria
    if (turnoUsuario.contexto_memoria) {
      peso += 0.15
    }

    // Bonus por intención clara
    if (turnoUsuario.intención !== 'general') {
      peso += 0.15
    }

    return Math.min(peso, 1.0)
  }

  /**
   * Procesar mensaje con motor neural
   */
  static async processMessage(
    userMessage: string,
    userId: string,
    from: string
  ): Promise<{
    respuesta: string
    intención: string
    confianza: number
    acciones: string[]
    memoria_actualizada: ConversationMemory
  }> {
    console.log(`[NeuralEngine] 🧠 Procesando: "${userMessage.substring(0, 50)}..."`)

    try {
      // 1. Obtener o crear memoria del usuario
      const memoria = this.getOrCreateMemory(userId, from)

      // 2. Extraer palabras clave
      const palabrasClaveUsuario = this.extraerPalabrasClaveNormalizadas(userMessage)

      // 3. Detectar intención
      const intención = this.detectarIntención(userMessage, memoria)

      // 4. Buscar patrón más similar
      const mejorPatron = this.buscarPatronMasSimilar(
        palabrasClaveUsuario,
        intención,
        memoria
      )

      // 5. Generar respuesta
      let respuesta = mejorPatron?.salida || this.generarRespuestaGenérica(intención)
      const confianza = mejorPatron?.peso || 0.3

      // 6. Extraer acciones de la respuesta
      const acciones = mejorPatron?.salida.includes('guardar') ? ['guardar_contexto'] : []

      // 7. Actualizar memoria
      this.actualizarMemoria(memoria, userMessage, respuesta, intención)

      console.log(`[NeuralEngine] ✅ Respuesta generada (confianza: ${(confianza * 100).toFixed(0)}%)`)

      return {
        respuesta,
        intención,
        confianza,
        acciones,
        memoria_actualizada: memoria
      }
    } catch (error) {
      console.error('[NeuralEngine] ❌ Error procesando:', error)
      return {
        respuesta: 'Disculpa, tuve un problema. Intenta de nuevo.',
        intención: 'error',
        confianza: 0,
        acciones: [],
        memoria_actualizada: this.getOrCreateMemory(userId, from)
      }
    }
  }

  /**
   * Detectar intención del usuario
   */
  private static detectarIntención(mensaje: string, memoria: ConversationMemory): string {
    const lowerMsg = mensaje.toLowerCase()

    // Palabras clave por intención
    const intenciones: { [key: string]: string[] } = {
      product_search: ['tienes', 'hay', 'qué', 'busco', 'quiero', 'necesito', 'disponible'],
      product_info: ['más', 'información', 'detalles', 'especificaciones', 'características', 'cuéntame'],
      price_inquiry: ['precio', 'costo', 'cuánto', 'vale', 'cuesta'],
      purchase: ['comprar', 'quiero comprar', 'voy a comprar', 'compro'],
      payment: ['pagar', 'pago', 'transferencia', 'nequi', 'daviplata', 'tarjeta'],
      support: ['ayuda', 'problema', 'error', 'no funciona', 'soporte'],
      objection: ['caro', 'muy caro', 'es mucho', 'no puedo', 'es mucho dinero'],
      satisfaction: ['me encantó', 'excelente', 'perfecto', 'muy bueno', 'me gustó'],
      escalation: ['gerente', 'humano', 'hablar con', 'quiero hablar']
    }

    // Buscar coincidencias
    for (const [intención, palabras] of Object.entries(intenciones)) {
      if (palabras.some(palabra => lowerMsg.includes(palabra))) {
        return intención
      }
    }

    // Si hay producto en memoria y pide más info
    if (memoria.producto_actual && lowerMsg.match(/más|mas|detalles|información/i)) {
      return 'product_info'
    }

    return 'general'
  }

  /**
   * Buscar patrón más similar
   */
  private static buscarPatronMasSimilar(
    palabrasClaveUsuario: string[],
    intención: string,
    memoria: ConversationMemory
  ): NeuralPattern | null {
    let mejorPatron: NeuralPattern | null = null
    let mejorSimilitud = 0

    for (const patrón of this.patrones) {
      // Calcular similitud Jaccard
      const set1 = new Set(palabrasClaveUsuario)
      const set2 = new Set(patrón.entrada)
      const intersección = new Set([...set1].filter(x => set2.has(x)))
      const unión = new Set([...set1, ...set2])
      let similitud = intersección.size / unión.size

      // Bonus si la intención coincide
      if (patrón.intención === intención) {
        similitud += 0.2
      }

      // Bonus si hay contexto de memoria
      if (memoria.producto_actual && patrón.contexto.includes(memoria.producto_actual)) {
        similitud += 0.3
      }

      // Limitar a 1.0
      similitud = Math.min(similitud, 1.0)

      if (similitud > mejorSimilitud) {
        mejorSimilitud = similitud
        mejorPatron = patrón
      }
    }

    // Retornar si hay similitud significativa
    if (mejorSimilitud > 0.3) {
      console.log(`[NeuralEngine] 🎯 Patrón encontrado (similitud: ${(mejorSimilitud * 100).toFixed(0)}%)`)
      return mejorPatron
    }

    return null
  }

  /**
   * Generar respuesta genérica
   */
  private static generarRespuestaGenérica(intención: string): string {
    const respuestas: { [key: string]: string[] } = {
      product_search: [
        '¡Claro! 🎯 Tenemos varias opciones. ¿Cuál te interesa?',
        '¡Perfecto! 👍 Déjame mostrarte lo que tenemos.'
      ],
      product_info: [
        '¡Claro! 📚 Te doy todos los detalles.',
        '¡Excelente! 🔍 Aquí está la información completa.'
      ],
      price_inquiry: [
        '💰 El precio depende del producto. ¿Cuál te interesa?',
        '💵 Te muestro los precios disponibles.'
      ],
      purchase: [
        '¡Excelente! 🛒 Vamos a procesar tu compra.',
        '¡Perfecto! 🎉 Aquí está el resumen.'
      ],
      payment: [
        '💳 ¿Cuál es tu método de pago preferido?',
        '💰 Tenemos varios métodos disponibles.'
      ],
      support: [
        '🤝 Estoy aquí para ayudarte. ¿Cuál es el problema?',
        '🆘 Cuéntame qué necesitas.'
      ],
      general: [
        '¡Claro! 😊 ¿En qué te puedo ayudar?',
        '👋 Estoy aquí para asistirte.'
      ]
    }

    const opciones = respuestas[intención] || respuestas.general
    return opciones[Math.floor(Math.random() * opciones.length)]
  }

  /**
   * Obtener o crear memoria del usuario
   */
  private static getOrCreateMemory(userId: string, from: string): ConversationMemory {
    const key = `${userId}:${from}`

    if (!this.memoria.has(key)) {
      this.memoria.set(key, {
        producto_actual: null,
        historial_compras: [],
        preferencias: {},
        contexto_conversación: '',
        intención_actual: 'general',
        sentimiento_usuario: 'neutral',
        turno_actual: 0
      })
    }

    return this.memoria.get(key)!
  }

  /**
   * Actualizar memoria
   */
  private static actualizarMemoria(
    memoria: ConversationMemory,
    mensajeUsuario: string,
    respuestaBot: string,
    intención: string
  ): void {
    // Actualizar turno
    memoria.turno_actual++

    // Actualizar intención
    memoria.intención_actual = intención

    // Extraer producto si se menciona
    const productosKeywords: { [key: string]: string } = {
      piano: 'Curso de Piano',
      guitarra: 'Curso de Guitarra',
      canto: 'Curso de Canto',
      laptop: 'Laptop',
      moto: 'Motocicleta'
    }

    for (const [keyword, producto] of Object.entries(productosKeywords)) {
      if (mensajeUsuario.toLowerCase().includes(keyword)) {
        memoria.producto_actual = producto
        break
      }
    }

    // Actualizar contexto
    memoria.contexto_conversación = `${mensajeUsuario} -> ${respuestaBot}`

    // Detectar sentimiento
    if (mensajeUsuario.match(/excelente|perfecto|me encantó|muy bueno/i)) {
      memoria.sentimiento_usuario = 'muy_satisfecho'
    } else if (mensajeUsuario.match(/caro|problema|error|no funciona/i)) {
      memoria.sentimiento_usuario = 'frustrado'
    } else if (mensajeUsuario.match(/interesado|quiero|necesito/i)) {
      memoria.sentimiento_usuario = 'interesado'
    }

    console.log(`[NeuralEngine] 💾 Memoria actualizada (turno: ${memoria.turno_actual}, sentimiento: ${memoria.sentimiento_usuario})`)
  }

  /**
   * Obtener estadísticas
   */
  static getStats() {
    return {
      flujos_entrenados: this.flujos.length,
      patrones_neuronales: this.patrones.length,
      usuarios_activos: this.memoria.size,
      timestamp: new Date()
    }
  }

  /**
   * Limpiar memoria
   */
  static clearMemory(): void {
    this.memoria.clear()
    console.log('[NeuralEngine] 🗑️ Memoria limpiada')
  }
}

export default NeuralConversationEngine
