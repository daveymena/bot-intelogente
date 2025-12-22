/**
 * 🎼 ORQUESTADOR INTELIGENTE DE VENTAS
 *
 * Sistema maestro que coordina todos los componentes de IA para crear
 * una experiencia de venta completamente automatizada y profesional.
 *
 * Integra:
 * - Análisis de personalidad del cliente
 * - Roles profesionales dinámicos
 * - Técnicas de venta avanzadas
 * - Manejo inteligente de objeciones
 * - Cierres profesionales
 * - Upselling y cross-selling
 * - Aprendizaje continuo
 */

import { db } from './db'
import { ProfessionalSalesEngine } from './professional-sales-engine'
import { AdvancedSalesClosing, attemptAdvancedClose } from './advanced-sales-closing'
import { IntelligentObjectionHandling, handleObjection } from './intelligent-objection-handling'
import { IntelligentUpselling, attemptIntelligentUpsell } from './intelligent-upselling'
import * as Personality from './conversational-personality'

export interface SalesOrchestratorContext {
  customerId: string
  userId: string
  message: string
  conversationHistory: any[]
  currentProduct?: any
  customerProfile?: any
  salesStage: 'awareness' | 'interest' | 'consideration' | 'decision' | 'action'
  activeTechnique?: string
  techniqueStep?: number
  pendingUpsell?: any
  objectionInProgress?: boolean
}

export interface OrchestratorResponse {
  response: string
  action: 'continue' | 'close_attempt' | 'objection_handling' | 'upsell' | 'completed'
  metadata: {
    techniqueUsed?: string
    confidence?: number
    nextAction?: string
    productRecommended?: any
  }
}

export class IntelligentSalesOrchestrator {
  private static activeContexts = new Map<string, SalesOrchestratorContext>()
  private static learningMetrics = new Map<string, any>()

  /**
   * Procesar mensaje del cliente y generar respuesta inteligente
   */
  static async processCustomerMessage(context: SalesOrchestratorContext): Promise<OrchestratorResponse> {

    const { customerId, message, conversationHistory, customerProfile, salesStage } = context

    // 1. PRIORIDAD: Verificar si hay objeción activa
    if (context.objectionInProgress) {
      return await this.handleActiveObjection(context)
    }

    // 2. Verificar si hay técnica de cierre en progreso
    if (context.activeTechnique && context.techniqueStep) {
      return await this.continueClosingTechnique(context)
    }

    // 3. Detectar objeciones en el mensaje actual
    const objectionCheck = await handleObjection(
      customerId,
      message,
      conversationHistory,
      customerProfile,
      context.currentProduct
    )

    if (objectionCheck.hasObjection) {
      // Marcar objeción en progreso
      context.objectionInProgress = true
      this.activeContexts.set(customerId, context)

      return {
        response: objectionCheck.response!,
        action: 'objection_handling',
        metadata: {
          techniqueUsed: 'objection_reframe',
          nextAction: 'follow_up_objection'
        }
      }
    }

    // 4. Intentar cierre si es apropiado
    const closeAttempt = await attemptAdvancedClose(
      customerId,
      message,
      conversationHistory,
      customerProfile,
      context.currentProduct
    )

    if (closeAttempt.shouldClose) {
      // Iniciar técnica de cierre
      context.activeTechnique = closeAttempt.technique?.id
      context.techniqueStep = 1
      this.activeContexts.set(customerId, context)

      return {
        response: closeAttempt.response,
        action: 'close_attempt',
        metadata: {
          techniqueUsed: closeAttempt.technique?.id,
          confidence: closeAttempt.technique?.successRate
        }
      }
    }

    // 5. Intentar upselling/cross-selling
    const upsellAttempt = await attemptIntelligentUpsell(
      customerId,
      context.currentProduct,
      conversationHistory
    )

    if (upsellAttempt.shouldUpsell) {
      context.pendingUpsell = upsellAttempt.opportunity
      this.activeContexts.set(customerId, context)

      return {
        response: upsellAttempt.message!,
        action: 'upsell',
        metadata: {
          productRecommended: upsellAttempt.opportunity?.product,
          confidence: 0.8
        }
      }
    }

    // 6. Respuesta profesional estándar usando motor de ventas
    const professionalResponse = await ProfessionalSalesEngine.generateProfessionalResponse(
      customerId,
      message,
      {
        role: ProfessionalSalesEngine.selectProfessionalRole(
          customerProfile,
          salesStage,
          context.currentProduct?.category || 'general'
        ),
        customer: customerProfile,
        product: context.currentProduct,
        conversationStage: salesStage,
        techniquesUsed: [],
        objectionsHandled: [],
        valueProposition: '',
        urgencyLevel: 'medium'
      },
      context.currentProduct
    )

    // Actualizar contexto
    this.activeContexts.set(customerId, context)

    return {
      response: professionalResponse,
      action: 'continue',
      metadata: {
        techniqueUsed: 'professional_response',
        confidence: 0.9
      }
    }
  }

  /**
   * Continuar técnica de cierre en progreso
   */
  private static async continueClosingTechnique(context: SalesOrchestratorContext): Promise<OrchestratorResponse> {

    const { customerId, activeTechnique, techniqueStep, message } = context

    if (!activeTechnique || !techniqueStep) {
      throw new Error('No active closing technique')
    }

    const technique = AdvancedSalesClosing.CLOSING_TECHNIQUES.find(t => t.id === activeTechnique)
    if (!technique) {
      throw new Error('Technique not found')
    }

    // Manejar respuesta del cliente
    const result = AdvancedSalesClosing.handleClosingResponse(message, technique, techniqueStep)

    if (result.completed) {
      // Cierre exitoso - limpiar contexto
      context.activeTechnique = undefined
      context.techniqueStep = undefined
      this.activeContexts.set(customerId, context)

      return {
        response: result.response,
        action: 'completed',
        metadata: {
          techniqueUsed: activeTechnique,
          confidence: 1.0
        }
      }
    } else if (result.nextStep) {
      // Continuar con siguiente paso
      context.techniqueStep = result.nextStep
      this.activeContexts.set(customerId, context)

      return {
        response: result.response,
        action: 'close_attempt',
        metadata: {
          techniqueUsed: activeTechnique,
          nextAction: 'continue_closing'
        }
      }
    } else {
      // Respuesta no esperada - repetir paso
      return {
        response: result.response,
        action: 'close_attempt',
        metadata: {
          techniqueUsed: activeTechnique,
          nextAction: 'retry_step'
        }
      }
    }
  }

  /**
   * Manejar objeción activa
   */
  private static async handleActiveObjection(context: SalesOrchestratorContext): Promise<OrchestratorResponse> {

    const { customerId, message } = context

    // Evaluar respuesta a la objeción
    const objectionResolved = this.evaluateObjectionResponse(message)

    if (objectionResolved) {
      // Objeción resuelta - continuar normalmente
      context.objectionInProgress = false
      this.activeContexts.set(customerId, context)

      // Registrar aprendizaje
      IntelligentObjectionHandling.recordObjectionResult(
        customerId,
        'unknown', // TODO: track specific objection
        'reframe',
        true
      )

      return {
        response: '¡Perfecto! Sigamos entonces. ¿En qué más puedo ayudarte?',
        action: 'continue',
        metadata: {
          techniqueUsed: 'objection_resolved',
          confidence: 0.9
        }
      }
    } else {
      // Objeción persiste - intentar técnica alternativa
      const alternativeResponse = await this.generateAlternativeObjectionResponse(context)

      return {
        response: alternativeResponse,
        action: 'objection_handling',
        metadata: {
          techniqueUsed: 'alternative_objection_handling',
          nextAction: 'follow_up_objection'
        }
      }
    }
  }

  /**
   * Evaluar si la respuesta del cliente resuelve la objeción
   */
  private static evaluateObjectionResponse(message: string): boolean {

    const positiveSignals = [
      'sí', 'claro', 'perfecto', 'ok', 'bueno', 'vale', 'entendido',
      'me convence', 'está bien', 'procedamos', 'hagámoslo'
    ]

    const negativeSignals = [
      'no', 'pero', 'aunque', 'sin embargo', 'igual', 'todavía',
      'aún', 'sigo pensando', 'me preocupa'
    ]

    const normalizedMessage = message.toLowerCase()

    const positiveCount = positiveSignals.filter(signal => normalizedMessage.includes(signal)).length
    const negativeCount = negativeSignals.filter(signal => normalizedMessage.includes(signal)).length

    return positiveCount > negativeCount
  }

  /**
   * Generar respuesta alternativa para objeción persistente
   */
  private static async generateAlternativeObjectionResponse(context: SalesOrchestratorContext): Promise<string> {

    const alternatives = [
      'Entiendo tu preocupación. Déjame mostrarte cómo otros clientes en tu situación la superaron.',
      'Es una duda muy válida. ¿Qué específicamente te haría sentir más cómodo?',
      'Muchos clientes llegan con la misma preocupación. ¿Te gustaría que te comparta algunos casos de éxito?',
      'Te entiendo perfectamente. ¿Hay algún aspecto específico que te preocupa más?'
    ]

    const response = alternatives[Math.floor(Math.random() * alternatives.length)]

    return Personality.generateNaturalResponse({
      baseMessage: response,
      addEmpathy: 'objection'
    })
  }

  /**
   * Obtener contexto activo de un cliente
   */
  static getActiveContext(customerId: string): SalesOrchestratorContext | undefined {
    return this.activeContexts.get(customerId)
  }

  /**
   * Actualizar contexto de un cliente
   */
  static updateContext(customerId: string, updates: Partial<SalesOrchestratorContext>): void {
    const existing = this.activeContexts.get(customerId)
    if (existing) {
      this.activeContexts.set(customerId, { ...existing, ...updates })
    }
  }

  /**
   * Limpiar contexto de un cliente
   */
  static clearContext(customerId: string): void {
    this.activeContexts.delete(customerId)
  }

  /**
   * Registrar resultado de interacción para aprendizaje
   */
  static recordInteractionResult(
    customerId: string,
    action: string,
    success: boolean,
    metadata?: any
  ): void {

    const metrics = this.learningMetrics.get(customerId) || {
      totalInteractions: 0,
      successfulInteractions: 0,
      actionStats: {}
    }

    metrics.totalInteractions++
    if (success) metrics.successfulInteractions++

    if (!metrics.actionStats[action]) {
      metrics.actionStats[action] = { attempts: 0, successes: 0 }
    }

    metrics.actionStats[action].attempts++
    if (success) metrics.actionStats[action].successes++

    this.learningMetrics.set(customerId, metrics)
  }

  /**
   * Obtener métricas de rendimiento del orquestador
   */
  static getPerformanceMetrics(): any {
    const overallStats = {
      totalInteractions: 0,
      successfulInteractions: 0,
      successRate: 0,
      actionPerformance: {} as any
    }

    for (const [customerId, metrics] of this.learningMetrics) {
      overallStats.totalInteractions += metrics.totalInteractions
      overallStats.successfulInteractions += metrics.successfulInteractions

      // Agregar estadísticas por acción
      Object.entries(metrics.actionStats).forEach(([action, stats]: [string, any]) => {
        if (!overallStats.actionPerformance[action]) {
          overallStats.actionPerformance[action] = { attempts: 0, successes: 0 }
        }
        overallStats.actionPerformance[action].attempts += stats.attempts
        overallStats.actionPerformance[action].successes += stats.successes
      })
    }

    overallStats.successRate = overallStats.totalInteractions > 0
      ? overallStats.successfulInteractions / overallStats.totalInteractions
      : 0

    return overallStats
  }

  /**
   * Optimizar estrategias basado en métricas de aprendizaje
   */
  static optimizeStrategies(): void {

    const metrics = this.getPerformanceMetrics()

    // Identificar técnicas con bajo rendimiento
    const lowPerformingActions = Object.entries(metrics.actionPerformance)
      .filter(([action, stats]: [string, any]) => {
        const successRate = stats.successes / stats.attempts
        return stats.attempts > 5 && successRate < 0.5
      })
      .map(([action]) => action)

    if (lowPerformingActions.length > 0) {
      console.log('[SalesOrchestrator] Técnicas de bajo rendimiento detectadas:', lowPerformingActions)
      // TODO: Implementar lógica de optimización automática
    }
  }
}

// ============ INTEGRACIÓN CON SISTEMA PRINCIPAL ============

export async function processWithIntelligentOrchestrator(
  userId: string,
  customerId: string,
  message: string,
  conversationHistory: any[],
  currentProduct?: any
): Promise<OrchestratorResponse> {

  // Obtener o crear contexto
  let context = IntelligentSalesOrchestrator.getActiveContext(customerId)

  if (!context) {
    // Determinar etapa de conversación
    const salesStage = determineSalesStage(conversationHistory)

    // Obtener perfil del cliente (si existe)
    const customerProfile = await getCustomerProfile(customerId, conversationHistory)

    context = {
      customerId,
      userId,
      message,
      conversationHistory,
      currentProduct,
      customerProfile,
      salesStage
    }
  } else {
    // Actualizar contexto existente
    context.message = message
    context.conversationHistory = conversationHistory
    context.currentProduct = currentProduct
  }

  // Procesar con orquestador
  const result = await IntelligentSalesOrchestrator.processCustomerMessage(context)

  // Registrar resultado para aprendizaje
  IntelligentSalesOrchestrator.recordInteractionResult(
    customerId,
    result.action,
    result.action === 'completed', // Considerar 'completed' como éxito
    result.metadata
  )

  return result
}

/**
 * Determinar etapa de ventas basada en historial
 */
function determineSalesStage(history: any[]): 'awareness' | 'interest' | 'consideration' | 'decision' | 'action' {
  if (history.length === 0) return 'awareness'
  if (history.length <= 2) return 'interest'
  if (history.length <= 5) return 'consideration'

  const hasPurchaseIntent = history.some(h =>
    h.content.toLowerCase().includes('comprar') ||
    h.content.toLowerCase().includes('pedido') ||
    h.content.toLowerCase().includes('quiero')
  )

  if (hasPurchaseIntent) return 'decision'
  return 'action'
}

/**
 * Obtener perfil del cliente desde BD o crear uno básico
 */
async function getCustomerProfile(customerId: string, conversationHistory: any[]): Promise<any> {

  // Intentar obtener de BD (usando tabla existente o creando perfil básico)
  try {
    // Por ahora usar perfil básico - TODO: implementar tabla customerProfile
    const customerProfile = ProfessionalSalesEngine['customerProfiles'].get(customerId)
    if (customerProfile) {
      return customerProfile
    }
  } catch (error) {
    console.error('Error obteniendo perfil de cliente:', error)
  }

  // Crear perfil básico basado en conversación
  return ProfessionalSalesEngine['customerProfiles'].get(customerId) || {
    personalityType: 'expressive',
    buyingStyle: 'emotional',
    interests: [],
    budgetRange: { min: 0, max: 1000000 }
  }
}