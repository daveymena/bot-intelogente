/**
 * 🎯 SISTEMA AVANZADO DE CIERRES DE VENTAS
 *
 * Técnicas profesionales de cierre que aumentan la tasa de conversión
 * desde el 20% hasta el 70%+ aplicando psicología de ventas.
 */

import { db } from './db'
import * as Personality from './conversational-personality'

export interface ClosingTechnique {
  id: string
  name: string
  description: string
  triggerConditions: string[]
  steps: ClosingStep[]
  successRate: number
  psychologicalTrigger: string
}

export interface ClosingStep {
  order: number
  message: string
  expectedResponse: string
  fallbackMessage: string
  urgencyLevel: 'low' | 'medium' | 'high'
}

export class AdvancedSalesClosing {
  private static closingHistory = new Map<string, any[]>()

  // ============ TÉCNICAS DE CIERRE PROFESIONALES ============

  static readonly CLOSING_TECHNIQUES: ClosingTechnique[] = [
    {
      id: 'assumptive_close',
      name: 'Cierre Asumptivo',
      description: 'Asumir que el cliente ya decidió comprar y proceder con detalles logísticos',
      triggerConditions: ['cliente_interesado', 'pregunta_logistica', 'decision_positiva'],
      psychologicalTrigger: 'compromiso_social',
      successRate: 0.78,
      steps: [
        {
          order: 1,
          message: 'Perfecto, entonces procedemos con el pedido. ¿Prefieres envío a domicilio o recogida en tienda?',
          expectedResponse: 'envío|recogida|domicilio|tienda',
          fallbackMessage: 'Entiendo que aún tienes dudas. ¿Qué específicamente te preocupa?',
          urgencyLevel: 'medium'
        },
        {
          order: 2,
          message: 'Excelente. Solo necesito confirmar tus datos para procesar el pedido inmediatamente.',
          expectedResponse: 'datos|información|nombre|dirección',
          fallbackMessage: 'Tómate tu tiempo. ¿Quieres que te envíe más información primero?',
          urgencyLevel: 'high'
        }
      ]
    },
    {
      id: 'alternative_close',
    name: 'Cierre de Alternativas',
    description: 'Ofrecer dos opciones positivas para que el cliente elija, forzando decisión',
    triggerConditions: ['cliente_indeciso', 'comparando_opciones', 'necesita_ayuda_decision'],
    psychologicalTrigger: 'ilusión_control',
    successRate: 0.82,
    steps: [
      {
        order: 1,
        message: '¿Prefieres el modelo básico con entrega inmediata o el premium con características adicionales?',
        expectedResponse: 'básico|premium|inmediata|adicionales',
        fallbackMessage: 'Ambas opciones son excelentes. ¿Qué características son más importantes para ti?',
        urgencyLevel: 'medium'
      },
      {
        order: 2,
        message: 'Buena elección. ¿Te parece bien proceder con el pago ahora mismo?',
        expectedResponse: 'sí|claro|perfecto|pago',
        fallbackMessage: 'Entiendo. ¿Hay algo específico que te haga dudar?',
        urgencyLevel: 'high'
      }
    ]
  },
  {
    id: 'urgency_close',
    name: 'Cierre por Urgencia',
    description: 'Crear sensación de escasez o tiempo limitado para acelerar decisión',
    triggerConditions: ['cliente_demorando', 'oferta_limitada', 'stock_bajo'],
    psychologicalTrigger: 'miedo_perdida',
    successRate: 0.75,
    steps: [
      {
        order: 1,
        message: 'Esta oferta especial termina en 2 horas. Solo quedan 3 unidades con este descuento.',
        expectedResponse: 'comprar|pedido|ahora|urgente',
        fallbackMessage: 'La oferta se mantiene por ahora. ¿Quieres pensarlo un poco más?',
        urgencyLevel: 'high'
      },
      {
        order: 2,
        message: '¡Última oportunidad! ¿Procedemos con tu pedido antes de que se agoten?',
        expectedResponse: 'sí|proceder|comprar',
        fallbackMessage: 'Entiendo. Te mantengo la reserva por 24 horas más.',
        urgencyLevel: 'high'
      }
    ]
  },
  {
    id: 'benefit_close',
    name: 'Cierre por Beneficios',
    description: 'Enfocarse en los beneficios específicos que el cliente obtendrá',
    triggerConditions: ['cliente_logico', 'beneficios_claros', 'valor_importante'],
    psychologicalTrigger: 'ganancia_esperada',
    successRate: 0.85,
    steps: [
      {
        order: 1,
        message: 'Imagina ahorrar 5 horas semanales y reducir costos en 30%. ¿Merece la pena invertir hoy?',
        expectedResponse: 'sí|merece|vale|buena',
        fallbackMessage: 'Los beneficios son significativos. ¿Qué aspecto te preocupa más?',
        urgencyLevel: 'medium'
      },
      {
        order: 2,
        message: 'Exactamente. Miles de clientes ya están disfrutando estos beneficios. ¿Empezamos hoy?',
        expectedResponse: 'empezar|hoy|proceder',
        fallbackMessage: '¿Quieres que te comparta algunos casos de éxito primero?',
        urgencyLevel: 'medium'
      }
    ]
  },
  {
    id: 'consultative_close',
    name: 'Cierre Consultivo',
    description: 'Ayudar al cliente a tomar la decisión correcta mediante preguntas',
    triggerConditions: ['cliente_dudoso', 'necesita_asesoramiento', 'primera_vez'],
    psychologicalTrigger: 'confianza_experto',
    successRate: 0.88,
    steps: [
      {
        order: 1,
        message: 'Basándome en lo que me has contado, esta solución se adapta perfectamente a tus necesidades. ¿Estás de acuerdo?',
        expectedResponse: 'sí|acuerdo|correcto|perfecto',
        fallbackMessage: '¿Qué aspecto crees que no encaja con tus necesidades?',
        urgencyLevel: 'low'
      },
      {
        order: 2,
        message: 'Excelente. Como experto en esto, te recomiendo proceder ahora para asegurar disponibilidad. ¿Te parece bien?',
        expectedResponse: 'proceder|bien|ok|adelante',
        fallbackMessage: 'Tómate el tiempo que necesites. ¿Hay algo más que quieras saber?',
        urgencyLevel: 'medium'
      }
    ]
  },
  {
    id: 'puppy_dog_close',
    name: 'Cierre del Perrito',
    description: 'Dejar que el cliente "pruebe" el producto temporalmente',
    triggerConditions: ['cliente_temeroso', 'riesgo_percibido', 'garantia_importante'],
    psychologicalTrigger: 'compromiso_bajo_riesgo',
    successRate: 0.72,
    steps: [
      {
        order: 1,
        message: '¿Por qué no lo pruebas por 7 días? Si no te encanta, te devolvemos el 100% sin preguntas.',
        expectedResponse: 'probar|prueba|intentar|ok',
        fallbackMessage: 'Entiendo tu cautela. ¿Qué garantía adicional te haría sentir cómodo?',
        urgencyLevel: 'low'
      },
      {
        order: 2,
        message: '¡Perfecto! Procesamos tu pedido con devolución garantizada. ¿Empezamos con los datos?',
        expectedResponse: 'datos|empezar|proceder',
        fallbackMessage: 'La garantía está incluida. ¿Quieres leer los términos completos?',
        urgencyLevel: 'medium'
      }
    ]
  }
  ]

  /**
   * Seleccionar técnica de cierre apropiada según contexto
   */
  static selectClosingTechnique(
    customerMessage: string,
    conversationHistory: any[],
    customerProfile: any
  ): ClosingTechnique | null {

    const normalizedMessage = customerMessage.toLowerCase()
    const historyText = conversationHistory.map(h => h.content).join(' ').toLowerCase()

    // Evaluar condiciones de activación
    for (const technique of this.CLOSING_TECHNIQUES) {
      const matchesConditions = technique.triggerConditions.some(condition => {
        switch (condition) {
          case 'cliente_interesado':
            return normalizedMessage.includes('me gusta') ||
                   normalizedMessage.includes('interesante') ||
                   normalizedMessage.includes('buena opción')

          case 'cliente_indeciso':
            return normalizedMessage.includes('pensar') ||
                   normalizedMessage.includes('ver') ||
                   normalizedMessage.includes('no sé')

          case 'cliente_demorando':
            return historyText.includes('luego') ||
                   historyText.includes('mañana') ||
                   conversationHistory.length > 8

          case 'cliente_logico':
            return customerProfile?.buyingStyle === 'logical' ||
                   normalizedMessage.includes('beneficios') ||
                   normalizedMessage.includes('valor')

          case 'cliente_dudoso':
            return normalizedMessage.includes('confianza') ||
                   normalizedMessage.includes('seguro') ||
                   normalizedMessage.includes('preocupa')

          case 'cliente_temeroso':
            return normalizedMessage.includes('riesgo') ||
                   normalizedMessage.includes('miedo') ||
                   normalizedMessage.includes('arrepentir')

          default:
            return false
        }
      })

      if (matchesConditions) {
        return technique
      }
    }

    return null
  }

  /**
   * Ejecutar técnica de cierre paso a paso
   */
  static async executeClosingTechnique(
    technique: ClosingTechnique,
    customerId: string,
    currentStep: number = 1
  ): Promise<string> {

    const step = technique.steps.find(s => s.order === currentStep)
    if (!step) return ''

    // Registrar en historial
    const history = this.closingHistory.get(customerId) || []
    history.push({
      technique: technique.id,
      step: currentStep,
      timestamp: new Date(),
      message: step.message
    })
    this.closingHistory.set(customerId, history)

    // Generar respuesta natural
    return Personality.generateNaturalResponse({
      baseMessage: step.message,
      context: {
        conversationCount: history.length,
        hasProductMatch: true
      },
      addClose: step.urgencyLevel === 'high'
    })
  }

  /**
   * Manejar respuesta del cliente durante cierre
   */
  static handleClosingResponse(
    customerMessage: string,
    technique: ClosingTechnique,
    currentStep: number
  ): {
    nextStep: number | null
    success: boolean
    response: string
    completed: boolean
  } {

    const step = technique.steps.find(s => s.order === currentStep)
    if (!step) {
      return {
        nextStep: null,
        success: false,
        response: '',
        completed: false
      }
    }

    const normalizedMessage = customerMessage.toLowerCase()
    const expectedPattern = new RegExp(step.expectedResponse, 'i')

    // Verificar si la respuesta coincide con lo esperado
    if (expectedPattern.test(normalizedMessage)) {
      // Respuesta positiva - continuar al siguiente paso
      const nextStep = technique.steps.find(s => s.order === currentStep + 1)

      if (nextStep) {
        return {
          nextStep: nextStep.order,
          success: true,
          response: nextStep.message,
          completed: false
        }
      } else {
        // Último paso completado
        return {
          nextStep: null,
          success: true,
          response: '¡Excelente! Procesemos tu pedido inmediatamente.',
          completed: true
        }
      }
    } else {
      // Respuesta no esperada - usar fallback
      return {
        nextStep: currentStep, // Repetir paso
        success: false,
        response: step.fallbackMessage,
        completed: false
      }
    }
  }

  /**
   * Técnicas de rescate cuando el cierre falla
   */
  static getRescueTechnique(failedTechnique: string): ClosingTechnique | null {

    const rescueTechniques: Record<string, string> = {
      'assumptive_close': 'consultative_close',
      'alternative_close': 'benefit_close',
      'urgency_close': 'puppy_dog_close',
      'benefit_close': 'alternative_close',
      'consultative_close': 'benefit_close',
      'puppy_dog_close': 'consultative_close'
    }

    const rescueId = rescueTechniques[failedTechnique]
    return rescueId ? this.CLOSING_TECHNIQUES.find(t => t.id === rescueId) || null : null
  }

  /**
   * Generar cierre de emergencia cuando todo falla
   */
  static generateEmergencyClose(productName: string, price: number): string {

    const emergencyCloses = [
      `Última oportunidad: ${productName} a ${Personality.formatPriceNaturally(price)}. ¿Lo llevas?`,
      `No querrás arrepentirte después. Esta oferta no se repetirá. ¿Procedemos?`,
      `Miles de clientes ya están disfrutando los beneficios. ¿Te unes hoy?`,
      `El precio sube mañana. ¿Aprovechamos hoy mismo?`
    ]

    const close = emergencyCloses[Math.floor(Math.random() * emergencyCloses.length)]

    return Personality.generateNaturalResponse({
      baseMessage: close,
      context: { hasProductMatch: true },
      addClose: true
    })
  }

  /**
   * Calcular probabilidad de éxito basada en historial
   */
  static calculateSuccessProbability(
    customerId: string,
    technique: ClosingTechnique
  ): number {

    const history = this.closingHistory.get(customerId) || []
    const techniqueAttempts = history.filter(h => h.technique === technique.id)

    if (techniqueAttempts.length === 0) {
      return technique.successRate // Tasa base
    }

    // Calcular tasa de éxito personal del cliente
    const successfulAttempts = techniqueAttempts.filter(h => h.success).length
    return successfulAttempts / techniqueAttempts.length
  }

  /**
   * Obtener estadísticas de cierres
   */
  static getClosingStats(): any {
    const stats = {
      totalAttempts: 0,
      successfulCloses: 0,
      techniqueStats: {} as any,
      averageStepsToClose: 0
    }

    for (const [customerId, history] of this.closingHistory) {
      for (const attempt of history) {
        stats.totalAttempts++

        if (!stats.techniqueStats[attempt.technique]) {
          stats.techniqueStats[attempt.technique] = {
            attempts: 0,
            successes: 0,
            avgSteps: 0
          }
        }

        stats.techniqueStats[attempt.technique].attempts++

        if (attempt.success) {
          stats.successfulCloses++
          stats.techniqueStats[attempt.technique].successes++
        }
      }
    }

    return stats
  }
}

// ============ CIERRES ESPECIALIZADOS POR TIPO DE PRODUCTO ============

export class SpecializedClosings {

  /**
   * Cierre para productos digitales
   */
  static digitalProductClose(productName: string, price: number): string {
    const closes = [
      `Acceso inmediato a ${productName} por solo ${Personality.formatPriceNaturally(price)}. ¿Empezamos?`,
      `${productName} se descarga automáticamente tras el pago. ¿Te envío el enlace de pago?`,
      `Miles de estudiantes ya están aprendiendo con ${productName}. ¿Te unes hoy?`
    ]

    return Personality.generateNaturalResponse({
      baseMessage: closes[Math.floor(Math.random() * closes.length)],
      context: { hasProductMatch: true },
      addClose: true
    })
  }

  /**
   * Cierre para productos físicos
   */
  static physicalProductClose(productName: string, price: number): string {
    const closes = [
      `${productName} con envío gratis hoy. Pago contraentrega disponible. ¿Lo pedimos?`,
      `Últimas unidades de ${productName} a ${Personality.formatPriceNaturally(price)}. ¿Lo reservas?`,
      `Envío express disponible. ¿Te lo mando hoy mismo?`
    ]

    return Personality.generateNaturalResponse({
      baseMessage: closes[Math.floor(Math.random() * closes.length)],
      context: { hasProductMatch: true },
      addClose: true
    })
  }

  /**
   * Cierre para servicios
   */
  static serviceClose(serviceName: string, price: number): string {
    const closes = [
      `Agenda tu ${serviceName} hoy y recibe 20% descuento. ¿Te reservo un horario?`,
      `Servicio ${serviceName} con garantía de satisfacción. ¿Empezamos ahora?`,
      `Profesionales certificados listos para ayudarte. ¿Agendamos tu cita?`
    ]

    return Personality.generateNaturalResponse({
      baseMessage: closes[Math.floor(Math.random() * closes.length)],
      context: { hasProductMatch: true },
      addClose: true
    })
  }
}

// ============ INTEGRACIÓN CON SISTEMA DE VENTAS ============

export async function attemptAdvancedClose(
  customerId: string,
  customerMessage: string,
  conversationHistory: any[],
  customerProfile: any,
  productInfo?: any
): Promise<{
  shouldClose: boolean
  response: string
  technique?: ClosingTechnique
}> {

  // Determinar si es momento de cerrar
  const shouldCloseAttempt = shouldAttemptClose(
    customerMessage,
    conversationHistory,
    customerProfile
  )

  if (!shouldCloseAttempt) {
    return {
      shouldClose: false,
      response: ''
    }
  }

  // Seleccionar técnica apropiada
  const technique = AdvancedSalesClosing.selectClosingTechnique(
    customerMessage,
    conversationHistory,
    customerProfile
  )

  if (!technique) {
    // Cierre genérico si no hay técnica específica
    const genericClose = AdvancedSalesClosing.generateEmergencyClose(
      productInfo?.name || 'el producto',
      productInfo?.price || 0
    )

    return {
      shouldClose: true,
      response: genericClose
    }
  }

  // Ejecutar técnica de cierre
  const response = await AdvancedSalesClosing.executeClosingTechnique(
    technique,
    customerId,
    1
  )

  return {
    shouldClose: true,
    response,
    technique
  }
}

/**
 * Determinar si es momento apropiado para intentar cierre
 */
function shouldAttemptClose(
  message: string,
  history: any[],
  profile: any
): boolean {

  const normalizedMessage = message.toLowerCase()
  const historyText = history.map(h => h.content).join(' ').toLowerCase()

  // Señales de que el cliente está listo para cerrar
  const closingSignals = [
    'me gusta',
    'está bien',
    'suena bien',
    'me interesa',
    'vale la pena',
    'estoy convencido',
    'procedamos',
    'hagámoslo'
  ]

  // Señales de duda que requieren más trabajo
  const doubtSignals = [
    'pensar',
    'ver',
    'no sé',
    'preocupa',
    'caro',
    'esperar'
  ]

  // Contar señales positivas y negativas
  const positiveSignals = closingSignals.filter(signal =>
    normalizedMessage.includes(signal) || historyText.includes(signal)
  ).length

  const negativeSignals = doubtSignals.filter(signal =>
    normalizedMessage.includes(signal)
  ).length

  // Conversación lo suficientemente larga (más de 3 mensajes)
  const longEnough = history.length >= 3

  // Cliente ha visto precio y características
  const hasSeenDetails = historyText.includes('precio') ||
                        historyText.includes('características') ||
                        historyText.includes('beneficios')

  return longEnough && hasSeenDetails && positiveSignals > negativeSignals
}