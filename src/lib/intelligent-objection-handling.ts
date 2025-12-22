/**
 * 🛡️ SISTEMA INTELIGENTE DE MANEJO DE OBJECIONES
 *
 * Sistema avanzado que identifica, clasifica y maneja objeciones
 * de forma automática usando técnicas de PNL y psicología de ventas.
 */

import { db } from './db'
import * as Personality from './conversational-personality'

export interface ObjectionPattern {
  id: string
  category: 'price' | 'trust' | 'need' | 'competition' | 'timing' | 'authority'
  keywords: string[]
  intensity: 'low' | 'medium' | 'high'
  frequency: number
  responses: ObjectionResponse[]
}

export interface ObjectionResponse {
  technique: 'reframe' | 'question' | 'story' | 'evidence' | 'alternative' | 'urgency'
  message: string
  successRate: number
  followUpQuestion?: string
}

export class IntelligentObjectionHandling {
  private static objectionHistory = new Map<string, any[]>()
  private static objectionPatterns: ObjectionPattern[] = [
    {
      id: 'price_too_high',
      category: 'price',
      keywords: ['caro', 'costoso', 'precio alto', 'muy caro', 'excesivo', 'cuesta mucho'],
      intensity: 'high',
      frequency: 0,
      responses: [
        {
          technique: 'reframe',
          message: 'Entiendo que el precio es importante. Pero considera que este producto te ahorra $X mensuales. ¿Cuánto tiempo tardarías en recuperar la inversión?',
          successRate: 0.75,
          followUpQuestion: '¿Cuál sería tu presupuesto ideal?'
        },
        {
          technique: 'evidence',
          message: 'Más de 500 clientes encontraron que el valor supera ampliamente el costo inicial. ¿Te gustaría ver algunos casos de éxito?',
          successRate: 0.82,
          followUpQuestion: '¿Qué beneficios son más importantes para ti?'
        },
        {
          technique: 'alternative',
          message: 'Tenemos opciones más económicas que mantienen la calidad esencial. ¿Te gustaría conocerlas?',
          successRate: 0.68,
          followUpQuestion: '¿Qué características no puedes prescindir?'
        }
      ]
    },
    {
      id: 'not_trustworthy',
      category: 'trust',
      keywords: ['confianza', 'seguro', 'fiable', 'garantía', 'respaldo', 'serio'],
      intensity: 'high',
      frequency: 0,
      responses: [
        {
          technique: 'evidence',
          message: 'Llevamos 5 años en el mercado con más de 2000 clientes satisfechos. Todas nuestras transacciones están protegidas por garantía.',
          successRate: 0.88,
          followUpQuestion: '¿Qué específicamente te preocupa?'
        },
        {
          technique: 'story',
          message: 'Déjame contarte la historia de Carlos, que tenía las mismas dudas que tú. Hoy es uno de nuestros mejores clientes.',
          successRate: 0.79,
          followUpQuestion: '¿Qué te haría sentir más seguro?'
        }
      ]
    },
    {
      id: 'dont_need_it',
      category: 'need',
      keywords: ['necesito', 'no necesito', 'para qué', 'sirve', 'utilidad', 'beneficio'],
      intensity: 'medium',
      frequency: 0,
      responses: [
        {
          technique: 'question',
          message: '¿Me podrías contar más sobre tu situación actual? Así puedo mostrarte exactamente cómo te beneficia.',
          successRate: 0.91,
          followUpQuestion: '¿Qué problemas intentas resolver?'
        },
        {
          technique: 'story',
          message: 'Muchos clientes como tú pensaban que no lo necesitaban, hasta que probaron y duplicaron su productividad.',
          successRate: 0.73,
          followUpQuestion: '¿Cómo mides actualmente tu eficiencia?'
        }
      ]
    },
    {
      id: 'competitor_better',
      category: 'competition',
      keywords: ['competencia', 'otro lugar', 'mejor precio', 'comparar', 'diferente'],
      intensity: 'medium',
      frequency: 0,
      responses: [
        {
          technique: 'reframe',
          message: 'Es inteligente comparar opciones. ¿Qué encuentras mejor en la competencia que te preocupa perder aquí?',
          successRate: 0.85,
          followUpQuestion: '¿Qué aspectos valoras más?'
        },
        {
          technique: 'evidence',
          message: 'Hemos comparado directamente con la competencia. Nuestros clientes reportan 30% más satisfacción. ¿Te gustaría ver el análisis?',
          successRate: 0.76,
          followUpQuestion: '¿Qué características son críticas para ti?'
        }
      ]
    },
    {
      id: 'bad_timing',
      category: 'timing',
      keywords: ['ahora no', 'luego', 'esperar', 'tiempo', 'momento', 'ocupado'],
      intensity: 'low',
      frequency: 0,
      responses: [
        {
          technique: 'urgency',
          message: 'Entiendo que el momento no es perfecto. Pero esta oferta especial termina pronto. ¿Te reservo el precio actual?',
          successRate: 0.71,
          followUpQuestion: '¿Cuándo sería un mejor momento?'
        },
        {
          technique: 'alternative',
          message: '¿Qué tal si empezamos con algo pequeño? Podemos hacer una prueba gratuita de 7 días.',
          successRate: 0.79,
          followUpQuestion: '¿Qué te parece esa opción?'
        }
      ]
    },
    {
      id: 'no_authority',
      category: 'authority',
      keywords: ['decidir', 'consultar', 'jefe', 'pareja', 'familia', 'autorización'],
      intensity: 'medium',
      frequency: 0,
      responses: [
        {
          technique: 'question',
          message: 'Entiendo que necesitas consultar. ¿Qué aspectos son más importantes para quien decide?',
          successRate: 0.83,
          followUpQuestion: '¿Cómo puedo ayudarte a presentar la información?'
        },
        {
          technique: 'evidence',
          message: 'Puedo prepararte un resumen ejecutivo con todos los beneficios y ROI. ¿Te gustaría que te lo envíe?',
          successRate: 0.77,
          followUpQuestion: '¿Qué formato prefieres?'
        }
      ]
    }
  ]

  /**
   * Detectar y clasificar objeción en el mensaje
   */
  static detectObjection(message: string): {
    hasObjection: boolean
    objection?: ObjectionPattern
    confidence: number
  } {

    const normalizedMessage = message.toLowerCase().trim()

    for (const pattern of this.objectionPatterns) {
      const matches = pattern.keywords.filter(keyword =>
        normalizedMessage.includes(keyword.toLowerCase())
      )

      if (matches.length > 0) {
        // Calcular confianza basada en cantidad de keywords coincidentes
        const confidence = Math.min(matches.length / pattern.keywords.length, 1)

        // Incrementar frecuencia del patrón
        pattern.frequency++

        return {
          hasObjection: true,
          objection: pattern,
          confidence
        }
      }
    }

    return {
      hasObjection: false,
      confidence: 0
    }
  }

  /**
   * Generar respuesta inteligente a la objeción
   */
  static async generateObjectionResponse(
    objection: ObjectionPattern,
    customerId: string,
    context: {
      conversationHistory: any[]
      customerProfile?: any
      productInfo?: any
    }
  ): Promise<string> {

    // Seleccionar mejor respuesta basada en historial y perfil
    const bestResponse = this.selectBestResponse(objection, customerId, context)

    if (!bestResponse) {
      return this.generateFallbackResponse(objection)
    }

    // Personalizar respuesta con información del producto
    let response = this.personalizeResponse(bestResponse.message, context.productInfo)

    // Registrar en historial
    this.recordObjectionHandling(customerId, objection.id, bestResponse.technique)

    // Añadir pregunta de seguimiento si existe
    if (bestResponse.followUpQuestion) {
      response += `\n\n${bestResponse.followUpQuestion}`
    }

    // Hacer respuesta natural y empática
    return Personality.generateNaturalResponse({
      baseMessage: response,
      addEmpathy: objection.intensity === 'high' ? 'objection' : undefined,
      context: {
        conversationCount: context.conversationHistory.length,
        hasProductMatch: true
      }
    })
  }

  /**
   * Seleccionar mejor respuesta basada en contexto
   */
  private static selectBestResponse(
    objection: ObjectionPattern,
    customerId: string,
    context: any
  ): ObjectionResponse | null {

    const history = this.objectionHistory.get(customerId) || []

    // Filtrar respuestas que no han fallado recientemente
    const availableResponses = objection.responses.filter(response => {
      const recentFailures = history
        .filter(h => h.objectionId === objection.id && h.technique === response.technique)
        .slice(-2) // Últimas 2 interacciones

      return recentFailures.length === 0 || recentFailures.some(h => h.success)
    })

    if (availableResponses.length === 0) {
      return objection.responses[0] // Fallback a primera respuesta
    }

    // Seleccionar basada en perfil del cliente
    if (context.customerProfile) {
      const profile = context.customerProfile

      if (profile.buyingStyle === 'logical' && objection.category === 'price') {
        return availableResponses.find(r => r.technique === 'evidence') || availableResponses[0]
      }

      if (profile.buyingStyle === 'emotional') {
        return availableResponses.find(r => r.technique === 'story') || availableResponses[0]
      }
    }

    // Seleccionar por tasa de éxito
    return availableResponses.reduce((best, current) =>
      current.successRate > best.successRate ? current : best
    )
  }

  /**
   * Personalizar respuesta con información del producto
   */
  private static personalizeResponse(
    message: string,
    productInfo?: any
  ): string {

    if (!productInfo) return message

    return message
      .replace('$X', Personality.formatPriceNaturally(productInfo.monthlySavings || 100000))
      .replace('producto', productInfo.name || 'producto')
      .replace('5 años', productInfo.experience || '5 años')
  }

  /**
   * Generar respuesta de fallback cuando no hay respuesta específica
   */
  private static generateFallbackResponse(objection: ObjectionPattern): string {

    const fallbacks = {
      price: 'Entiendo tu preocupación por el precio. ¿Me podrías decir cuál sería un monto más cómodo para ti?',
      trust: 'La confianza es fundamental. ¿Qué específicamente te preocupa de trabajar con nosotros?',
      need: 'Me gustaría entender mejor tus necesidades. ¿Puedes contarme más sobre tu situación actual?',
      competition: 'Es bueno comparar opciones. ¿Qué encuentras mejor en otras alternativas?',
      timing: 'El timing es importante. ¿Cuándo sería un mejor momento para ti?',
      authority: 'Entiendo que necesitas consultar con otros. ¿Cómo puedo ayudarte en ese proceso?'
    }

    return fallbacks[objection.category] || '¿Puedes explicarme mejor tu preocupación?'
  }

  /**
   * Registrar resultado del manejo de objeción
   */
  static recordObjectionResult(
    customerId: string,
    objectionId: string,
    technique: string,
    success: boolean
  ): void {

    const history = this.objectionHistory.get(customerId) || []
    history.push({
      objectionId,
      technique,
      success,
      timestamp: new Date()
    })

    // Mantener solo últimas 10 interacciones
    if (history.length > 10) {
      history.splice(0, history.length - 10)
    }

    this.objectionHistory.set(customerId, history)

    // Actualizar tasa de éxito de la respuesta
    const pattern = this.objectionPatterns.find(p => p.id === objectionId)
    if (pattern) {
      const response = pattern.responses.find(r => r.technique === technique)
      if (response) {
        // Actualizar tasa de éxito usando promedio móvil
        const alpha = 0.1 // Factor de aprendizaje
        response.successRate = response.successRate * (1 - alpha) + (success ? 1 : 0) * alpha
      }
    }
  }

  /**
   * Obtener estadísticas de objeciones
   */
  static getObjectionStats(): any {
    const stats = {
      totalObjections: 0,
      successfulHandlings: 0,
      categoryStats: {} as any,
      patternStats: {} as any
    }

    for (const [customerId, history] of this.objectionHistory) {
      for (const interaction of history) {
        stats.totalObjections++

        if (interaction.success) {
          stats.successfulHandlings++
        }

        // Estadísticas por categoría
        const pattern = this.objectionPatterns.find(p => p.id === interaction.objectionId)
        if (pattern) {
          if (!stats.categoryStats[pattern.category]) {
            stats.categoryStats[pattern.category] = { total: 0, success: 0 }
          }
          stats.categoryStats[pattern.category].total++
          if (interaction.success) {
            stats.categoryStats[pattern.category].success++
          }

          // Estadísticas por patrón específico
          if (!stats.patternStats[pattern.id]) {
            stats.patternStats[pattern.id] = { total: 0, success: 0 }
          }
          stats.patternStats[pattern.id].total++
          if (interaction.success) {
            stats.patternStats[pattern.id].success++
          }
        }
      }
    }

    return stats
  }

  /**
   * Registrar manejo de objeción en historial
   */
  private static recordObjectionHandling(
    customerId: string,
    objectionId: string,
    technique: string
  ): void {

    const history = this.objectionHistory.get(customerId) || []
    history.push({
      objectionId,
      technique,
      timestamp: new Date(),
      success: null // Se actualizará después
    })

    this.objectionHistory.set(customerId, history)
  }
}

// ============ TÉCNICAS AVANZADAS DE MANEJO DE OBJECIONES ============

export class AdvancedObjectionTechniques {

  /**
   * Técnica del "Sí, y además..."
   */
  static yesAndTechnique(objection: string, productBenefit: string): string {
    return `Sí, entiendo tu punto sobre ${objection}, y además, ${productBenefit}. ¿Qué te parece?`
  }

  /**
   * Técnica de aislamiento de objeciones
   */
  static isolateObjection(objection: string): string {
    return `Asumiendo que superamos ${objection}, ¿estarías interesado en proceder?`
  }

  /**
   * Técnica del boomerang (devolver la objeción)
   */
  static boomerangTechnique(objection: string, benefit: string): string {
    return `Exactamente, ${objection} es una de las razones por las que ${benefit}. ¿No crees?`
  }

  /**
   * Técnica de la pregunta indirecta
   */
  static indirectQuestionTechnique(): string {
    const questions = [
      '¿Qué te haría decidir hoy mismo?',
      '¿Qué tendría que pasar para que esto fuera perfecto para ti?',
      'Si tuviéramos una garantía extendida, ¿cambiaría tu decisión?'
    ]
    return questions[Math.floor(Math.random() * questions.length)]
  }

  /**
   * Técnica de la tercera parte
   */
  static thirdPartyTechnique(): string {
    const stories = [
      'Tuve un cliente que pensaba exactamente lo mismo que tú, y después de ver los resultados cambió completamente de opinión.',
      'Muchos de nuestros clientes llegan con esa misma preocupación, pero una vez que ven el valor real, se convierten en nuestros mejores referentes.',
      'Es normal tener esa duda. Déjame contarte cómo otros clientes en tu situación la superaron.'
    ]
    return stories[Math.floor(Math.random() * stories.length)]
  }
}

// ============ OBJECIONES COMUNES POR INDUSTRIA ============

export class IndustrySpecificObjections {

  /**
   * Objeciones comunes en e-commerce
   */
  static eCommerceObjections: ObjectionPattern[] = [
    {
      id: 'shipping_costs',
      category: 'price',
      keywords: ['envío caro', 'gastos envío', 'costo envío'],
      intensity: 'medium',
      frequency: 0,
      responses: [{
        technique: 'reframe',
        message: 'El envío es gratuito a partir de $200.000. ¿Te gustaría agregar algo más para alcanzar el monto?',
        successRate: 0.85
      }]
    },
    {
      id: 'return_policy',
      category: 'trust',
      keywords: ['devolución', 'cambiar', 'regresar'],
      intensity: 'medium',
      frequency: 0,
      responses: [{
        technique: 'evidence',
        message: 'Tenemos política de devolución gratuita en 30 días. Más de 95% de nuestros clientes están completamente satisfechos.',
        successRate: 0.92
      }]
    }
  ]

  /**
   * Objeciones comunes en productos digitales
   */
  static digitalProductsObjections: ObjectionPattern[] = [
    {
      id: 'instant_access',
      category: 'trust',
      keywords: ['acceso inmediato', 'recibo ya', 'inmediato'],
      intensity: 'low',
      frequency: 0,
      responses: [{
        technique: 'evidence',
        message: 'Recibirás el acceso completo por email en menos de 5 minutos después del pago confirmado.',
        successRate: 0.96
      }]
    },
    {
      id: 'content_quality',
      category: 'trust',
      keywords: ['calidad contenido', 'vale la pena', 'bueno'],
      intensity: 'medium',
      frequency: 0,
      responses: [{
        technique: 'evidence',
        message: 'Más de 2000 estudiantes han calificado nuestro contenido con 4.8/5 estrellas. ¿Te gustaría ver algunas reseñas?',
        successRate: 0.88
      }]
    }
  ]
}

// ============ INTEGRACIÓN CON SISTEMA PRINCIPAL ============

export async function handleObjection(
  customerId: string,
  message: string,
  conversationHistory: any[],
  customerProfile?: any,
  productInfo?: any
): Promise<{
  hasObjection: boolean
  response?: string
  objectionType?: string
}> {

  // Detectar objeción
  const objectionDetection = IntelligentObjectionHandling.detectObjection(message)

  if (!objectionDetection.hasObjection || !objectionDetection.objection) {
    return { hasObjection: false }
  }

  // Generar respuesta
  const response = await IntelligentObjectionHandling.generateObjectionResponse(
    objectionDetection.objection,
    customerId,
    {
      conversationHistory,
      customerProfile,
      productInfo
    }
  )

  return {
    hasObjection: true,
    response,
    objectionType: objectionDetection.objection.category
  }
}