/**
 * 🎯 SERVICIO DE FLUJO DE CALIFICACIÓN
 * 
 * Implementa un flujo de ventas profesional donde el bot:
 * 1. Detecta cuando el cliente pregunta por una categoría general
 * 2. Hace preguntas de calificación para entender necesidades
 * 3. Solo después muestra productos específicos
 * 
 * Ejemplo:
 * Cliente: "¿Tienes laptops?"
 * Bot: "¡Claro! Tengo varias opciones. ¿Para qué la necesitas principalmente?"
 * Cliente: "Para trabajar"
 * Bot: "Perfecto, te muestro las mejores para trabajo..."
 */

import { db } from './db'

interface QualificationState {
  category: string
  askedQuestion: boolean
  needsQualified: boolean
  qualificationAnswer?: string
  timestamp: number
}

export class QualificationFlowService {
  // Almacenar estado de calificación por conversación
  private static qualificationStates: Map<string, QualificationState> = new Map()

  /**
   * Detectar si el mensaje es una pregunta general sobre una categoría
   */
  static detectGeneralCategoryQuery(message: string): {
    isGeneral: boolean
    category?: string
    keywords?: string[]
  } {
    const normalized = message.toLowerCase().trim()

    // Patrones de preguntas generales
    const generalPatterns = [
      // Laptops
      {
        category: 'laptops',
        patterns: [
          /\b(tienes?|tienen?|hay|vende[ns]?|manejas?)\s+(laptop|laptops|portátil|portatil|computador|pc|notebook)/i,
          /\b(qué|que)\s+(laptop|laptops|portátil|portatil|computador)/i,
          /\b(laptop|laptops|portátil|portatil|computador)\s+(disponible|hay|tienes?)/i,
        ],
        keywords: ['laptop', 'portátil', 'computador', 'pc']
      },
      // Cursos
      {
        category: 'cursos',
        patterns: [
          /\b(tienes?|tienen?|hay|vende[ns]?|manejas?)\s+(curso|cursos|capacitación|capacitacion|formación|formacion)/i,
          /\b(qué|que)\s+(curso|cursos)/i,
          /\b(curso|cursos)\s+(disponible|hay|tienes?)/i,
        ],
        keywords: ['curso', 'cursos', 'capacitación', 'formación']
      },
      // Megapacks
      {
        category: 'megapacks',
        patterns: [
          /\b(tienes?|tienen?|hay|vende[ns]?|manejas?)\s+(megapack|mega pack|paquete)/i,
          /\b(qué|que)\s+(megapack|mega pack|paquete)/i,
          /\b(megapack|mega pack|paquete)\s+(disponible|hay|tienes?)/i,
        ],
        keywords: ['megapack', 'mega pack', 'paquete']
      },
      // Motos
      {
        category: 'motos',
        patterns: [
          /\b(tienes?|tienen?|hay|vende[ns]?|manejas?)\s+(moto|motos|motocicleta)/i,
          /\b(qué|que)\s+(moto|motos|motocicleta)/i,
          /\b(moto|motos|motocicleta)\s+(disponible|hay|tienes?)/i,
        ],
        keywords: ['moto', 'motos', 'motocicleta']
      }
    ]

    for (const pattern of generalPatterns) {
      for (const regex of pattern.patterns) {
        if (regex.test(normalized)) {
          console.log(`[QualificationFlow] 🎯 Pregunta general detectada: ${pattern.category}`)
          return {
            isGeneral: true,
            category: pattern.category,
            keywords: pattern.keywords
          }
        }
      }
    }

    return { isGeneral: false }
  }

  /**
   * Generar pregunta de calificación según la categoría
   */
  static generateQualificationQuestion(category: string): string {
    const questions: Record<string, string[]> = {
      laptops: [
        '¡Claro! Tengo varias opciones de laptops disponibles. 💻\n\n¿Para qué la necesitas principalmente?\n\n1️⃣ Trabajo/Oficina\n2️⃣ Juegos/Gaming\n3️⃣ Estudio/Universidad\n4️⃣ Diseño/Edición\n5️⃣ Uso básico (navegar, videos)',
        '¡Perfecto! Tengo laptops disponibles. 💻\n\n¿Qué tipo de uso le darás?\n\n• Trabajo profesional\n• Gaming\n• Estudios\n• Diseño gráfico\n• Uso personal',
        '¡Sí! Tengo laptops. 💻\n\n¿Cuál es tu prioridad?\n\n📊 Rendimiento para trabajo\n🎮 Gaming\n📚 Estudios\n🎨 Diseño/Edición\n💼 Uso general'
      ],
      cursos: [
        '¡Claro! Tengo varios cursos disponibles. 📚\n\n¿Qué te gustaría aprender?\n\n1️⃣ Música (Piano, Guitarra)\n2️⃣ Programación\n3️⃣ Diseño\n4️⃣ Marketing\n5️⃣ Otro tema',
        '¡Perfecto! Tengo cursos en diferentes áreas. 📚\n\n¿En qué área te interesa capacitarte?\n\n• Música\n• Tecnología\n• Diseño\n• Negocios\n• Desarrollo personal',
      ],
      megapacks: [
        '¡Sí! Tengo megapacks con miles de recursos. 📦\n\n¿Qué tipo de contenido buscas?\n\n1️⃣ Cursos variados\n2️⃣ Diseño gráfico\n3️⃣ Marketing digital\n4️⃣ Programación\n5️⃣ Todo incluido',
        '¡Claro! Tengo megapacks completos. 📦\n\n¿Para qué área los necesitas?\n\n• Aprendizaje general\n• Diseño\n• Marketing\n• Desarrollo web\n• Emprendimiento',
      ],
      motos: [
        '¡Sí! Tengo motos disponibles. 🏍️\n\n¿Para qué la necesitas?\n\n1️⃣ Trabajo/Domicilio\n2️⃣ Uso personal/Paseo\n3️⃣ Viajes largos\n4️⃣ Ciudad',
        '¡Perfecto! Tengo motos. 🏍️\n\n¿Qué uso le darás?\n\n• Trabajo\n• Transporte diario\n• Viajes\n• Recreación',
      ]
    }

    const categoryQuestions = questions[category] || [
      '¡Claro! Tengo varias opciones disponibles. 😊\n\n¿Qué características son más importantes para ti?'
    ]

    // Seleccionar pregunta aleatoria
    return categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)]
  }

  /**
   * Guardar estado de calificación
   */
  static setQualificationState(
    conversationKey: string,
    category: string,
    askedQuestion: boolean = true
  ): void {
    this.qualificationStates.set(conversationKey, {
      category,
      askedQuestion,
      needsQualified: true,
      timestamp: Date.now()
    })

    console.log(`[QualificationFlow] 💾 Estado guardado: ${category} - Pregunta hecha: ${askedQuestion}`)
  }

  /**
   * Obtener estado de calificación
   */
  static getQualificationState(conversationKey: string): QualificationState | null {
    const state = this.qualificationStates.get(conversationKey)

    // Limpiar estados antiguos (más de 5 minutos)
    if (state && Date.now() - state.timestamp > 5 * 60 * 1000) {
      this.qualificationStates.delete(conversationKey)
      return null
    }

    return state || null
  }

  /**
   * Actualizar respuesta de calificación
   */
  static updateQualificationAnswer(
    conversationKey: string,
    answer: string
  ): void {
    const state = this.qualificationStates.get(conversationKey)
    if (state) {
      state.qualificationAnswer = answer
      state.needsQualified = false
      console.log(`[QualificationFlow] ✅ Respuesta guardada: ${answer}`)
    }
  }

  /**
   * Limpiar estado de calificación
   */
  static clearQualificationState(conversationKey: string): void {
    this.qualificationStates.delete(conversationKey)
    console.log(`[QualificationFlow] 🗑️ Estado limpiado`)
  }

  /**
   * Detectar si el mensaje es una respuesta a la pregunta de calificación
   */
  static isQualificationAnswer(message: string, category: string): {
    isAnswer: boolean
    intent?: string
  } {
    const normalized = message.toLowerCase().trim()

    // Patrones de respuesta según categoría
    const answerPatterns: Record<string, Array<{ pattern: RegExp; intent: string }>> = {
      laptops: [
        { pattern: /\b(trabajo|oficina|laboral|empresa)\b/i, intent: 'trabajo' },
        { pattern: /\b(juego|juegos|gaming|gamer|videojuego)\b/i, intent: 'gaming' },
        { pattern: /\b(estudio|estudiar|universidad|colegio|clase)\b/i, intent: 'estudio' },
        { pattern: /\b(diseño|diseñar|edición|editar|photoshop|video)\b/i, intent: 'diseño' },
        { pattern: /\b(básico|basico|navegar|internet|videos|personal)\b/i, intent: 'basico' },
        { pattern: /\b(1|uno|primera|opción 1|opcion 1)\b/i, intent: 'trabajo' },
        { pattern: /\b(2|dos|segunda|opción 2|opcion 2)\b/i, intent: 'gaming' },
        { pattern: /\b(3|tres|tercera|opción 3|opcion 3)\b/i, intent: 'estudio' },
        { pattern: /\b(4|cuatro|cuarta|opción 4|opcion 4)\b/i, intent: 'diseño' },
        { pattern: /\b(5|cinco|quinta|opción 5|opcion 5)\b/i, intent: 'basico' },
      ],
      cursos: [
        { pattern: /\b(música|musica|piano|guitarra|canto)\b/i, intent: 'musica' },
        { pattern: /\b(programación|programacion|código|codigo|desarrollo)\b/i, intent: 'programacion' },
        { pattern: /\b(diseño|diseñar|gráfico|grafico)\b/i, intent: 'diseño' },
        { pattern: /\b(marketing|ventas|publicidad)\b/i, intent: 'marketing' },
        { pattern: /\b(1|uno|primera|opción 1|opcion 1)\b/i, intent: 'musica' },
        { pattern: /\b(2|dos|segunda|opción 2|opcion 2)\b/i, intent: 'programacion' },
      ],
      motos: [
        { pattern: /\b(trabajo|domicilio|laboral|repartir)\b/i, intent: 'trabajo' },
        { pattern: /\b(personal|paseo|recreación|recreacion)\b/i, intent: 'personal' },
        { pattern: /\b(viaje|viajes|largo|carretera)\b/i, intent: 'viajes' },
        { pattern: /\b(ciudad|urbano|transporte)\b/i, intent: 'ciudad' },
      ]
    }

    const patterns = answerPatterns[category] || []

    for (const { pattern, intent } of patterns) {
      if (pattern.test(normalized)) {
        console.log(`[QualificationFlow] ✅ Respuesta detectada: ${intent}`)
        return { isAnswer: true, intent }
      }
    }

    return { isAnswer: false }
  }

  /**
   * Filtrar productos según la respuesta de calificación
   */
  static async filterProductsByQualification(
    userId: string,
    category: string,
    intent: string
  ): Promise<any[]> {
    console.log(`[QualificationFlow] 🔍 Filtrando productos: ${category} - ${intent}`)

    // Obtener todos los productos de la categoría
    const allProducts = await db.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE'
      }
    })

    // Filtrar por categoría y intent
    const filtered = allProducts.filter(product => {
      const name = product.name.toLowerCase()
      const desc = (product.description || '').toLowerCase()
      const combined = `${name} ${desc}`

      // Verificar categoría
      let matchesCategory = false
      if (category === 'laptops') {
        matchesCategory = /laptop|portátil|portatil|computador/i.test(combined)
      } else if (category === 'cursos') {
        matchesCategory = /curso/i.test(combined)
      } else if (category === 'megapacks') {
        matchesCategory = /megapack|mega pack/i.test(combined)
      } else if (category === 'motos') {
        matchesCategory = /moto|motocicleta/i.test(combined)
      }

      if (!matchesCategory) return false

      // Filtrar por intent (uso específico)
      if (intent === 'trabajo') {
        return /trabajo|oficina|profesional|business/i.test(combined)
      } else if (intent === 'gaming') {
        return /gaming|gamer|juego|rtx|nvidia|amd/i.test(combined)
      } else if (intent === 'estudio') {
        return /estudio|estudiante|universidad|educación/i.test(combined)
      } else if (intent === 'diseño') {
        return /diseño|edición|creativo|photoshop|premiere/i.test(combined)
      } else if (intent === 'basico') {
        return !/gaming|gamer|diseño|profesional/i.test(combined)
      } else if (intent === 'musica') {
        return /piano|guitarra|música|musica/i.test(combined)
      }

      // Si no hay filtro específico, devolver todos de la categoría
      return true
    })

    console.log(`[QualificationFlow] ✅ Productos filtrados: ${filtered.length}`)
    return filtered.slice(0, 5) // Máximo 5 productos
  }

  /**
   * Generar respuesta con productos filtrados
   */
  static generateFilteredResponse(
    products: any[],
    category: string,
    intent: string
  ): string {
    if (products.length === 0) {
      return `No tengo productos específicos para ese uso en este momento. 😔\n\n¿Te gustaría ver otras opciones disponibles?`
    }

    let intro = ''
    if (intent === 'trabajo') {
      intro = '💼 Perfecto, estas son las mejores opciones para trabajo:'
    } else if (intent === 'gaming') {
      intro = '🎮 ¡Genial! Estas son ideales para gaming:'
    } else if (intent === 'estudio') {
      intro = '📚 Excelente, estas son perfectas para estudios:'
    } else if (intent === 'diseño') {
      intro = '🎨 ¡Perfecto! Estas son ideales para diseño:'
    } else if (intent === 'basico') {
      intro = '💻 Estas son excelentes para uso general:'
    } else if (intent === 'musica') {
      intro = '🎵 ¡Genial! Estos cursos de música te van a encantar:'
    } else {
      intro = `✨ Estas son las mejores opciones de ${category}:`
    }

    return intro // La lista de productos se agregará después
  }
}
