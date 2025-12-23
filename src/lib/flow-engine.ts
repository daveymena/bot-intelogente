/**
 * 🔄 FlowEngine
 * 
 * Motor de flujos dinámicos que selecciona y ejecuta el flujo correcto
 * según el tipo de negocio y la intención del usuario.
 */

import { BusinessContext, BusinessType } from './business-context-detector'

// Tipos de flujo disponibles
export type FlowType = 
  | 'product_inquiry'    // Consulta de producto
  | 'product_purchase'   // Compra de producto físico/digital
  | 'service_inquiry'    // Consulta de servicio
  | 'service_booking'    // Agendar servicio/cita
  | 'menu_display'       // Mostrar menú de restaurante
  | 'food_order'         // Pedido de comida
  | 'quote_request'      // Solicitar cotización
  | 'location_service'   // Servicio a domicilio
  | 'more_options'       // Mostrar más opciones
  | 'general_inquiry'    // Consulta general
  | 'greeting'           // Saludo inicial
  | 'payment'            // Proceso de pago
  | 'support'            // Soporte/ayuda

// Etapas de cada flujo
export type FlowStage = 
  | 'initial'
  | 'show_item'
  | 'show_options'
  | 'collect_variant'    // Talla, color, etc.
  | 'collect_quantity'
  | 'collect_date'
  | 'collect_time'
  | 'collect_location'
  | 'collect_contact'
  | 'collect_customization'
  | 'confirm_order'
  | 'show_payment'
  | 'await_payment'
  | 'complete'

// Estado de conversación
export interface ConversationState {
  flowType: FlowType
  stage: FlowStage
  currentItemId?: string
  currentItemName?: string
  currentCategory?: string
  collectedData: {
    variant?: string
    quantity?: number
    date?: string
    time?: string
    location?: string
    name?: string
    phone?: string
    email?: string
    customizations?: string[]
    notes?: string
  }
  history: string[]  // Historial de stages visitados
}

// Paso de flujo
export interface FlowStep {
  id: string
  type: 'ask' | 'show' | 'confirm' | 'collect' | 'complete'
  prompt?: string
  options?: string[]
  validation?: (input: string) => boolean
  nextStep?: string | ((input: string, state: ConversationState) => string)
}

// Resultado de flujo
export interface FlowResult {
  response: string
  nextStage: FlowStage
  requiresInput: boolean
  inputType?: 'text' | 'location' | 'date' | 'time' | 'options' | 'phone'
  options?: string[]
  sendMedia?: boolean
  mediaUrls?: string[]
  complete?: boolean
}

// Palabras clave para detectar intenciones
const INTENT_KEYWORDS = {
  greeting: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'hi', 'ola', 'saludos'],
  product_inquiry: ['tienes', 'tienen', 'hay', 'busco', 'necesito', 'quiero ver', 'muestrame', 'info', 'información', 'precio', 'cuanto', 'cuánto', 'cuesta', 'vale'],
  product_purchase: ['comprar', 'quiero', 'lo quiero', 'me interesa', 'si', 'sí', 'dale', 'va', 'listo', 'confirmo', 'pagar'],
  service_booking: ['agendar', 'cita', 'reservar', 'turno', 'disponibilidad', 'horario', 'cuando', 'cuándo'],
  menu_display: ['menu', 'menú', 'carta', 'que tienen', 'qué tienen', 'opciones'],
  food_order: ['pedir', 'ordenar', 'quiero comer', 'para llevar', 'domicilio', 'delivery'],
  quote_request: ['cotización', 'cotizar', 'presupuesto', 'cuanto saldría', 'cuánto saldría'],
  more_options: ['más', 'mas', 'otros', 'otras', 'referencias', 'opciones', 'alternativas', 'similares', 'parecidos'],
  payment: ['pagar', 'pago', 'transferencia', 'nequi', 'daviplata', 'mercadopago', 'paypal', 'tarjeta'],
  support: ['ayuda', 'problema', 'no funciona', 'error', 'queja', 'reclamo', 'devolver', 'garantía']
}

export class FlowEngine {
  
  /**
   * Detecta el flujo apropiado basándose en el mensaje y contexto
   */
  static detectFlow(
    message: string, 
    businessContext: BusinessContext, 
    currentState?: ConversationState
  ): FlowType {
    const normalizedMessage = this.normalizeMessage(message)
    
    // Si hay un flujo en progreso, verificar si continúa o cambia
    if (currentState && currentState.stage !== 'complete') {
      // Verificar si el usuario quiere cambiar de flujo
      const newIntent = this.detectIntent(normalizedMessage)
      if (newIntent && newIntent !== currentState.flowType) {
        // Solo cambiar si es una intención clara diferente
        if (['greeting', 'product_inquiry', 'more_options', 'support'].includes(newIntent)) {
          return newIntent
        }
      }
      // Continuar con el flujo actual
      return currentState.flowType
    }
    
    // Detectar intención del mensaje
    const intent = this.detectIntent(normalizedMessage)
    if (intent) return intent
    
    // Usar tipo de negocio para determinar flujo por defecto
    switch (businessContext.type) {
      case 'STORE':
        return 'product_inquiry'
      case 'SERVICE':
        return businessContext.features.hasAppointments ? 'service_booking' : 'service_inquiry'
      case 'RESTAURANT':
        return 'menu_display'
      case 'HYBRID':
        // Para híbridos, analizar más el mensaje
        if (businessContext.features.hasFood) return 'menu_display'
        if (businessContext.features.hasServices) return 'service_inquiry'
        return 'product_inquiry'
      default:
        return 'general_inquiry'
    }
  }
  
  /**
   * Detecta la intención del mensaje
   */
  private static detectIntent(message: string): FlowType | null {
    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      for (const keyword of keywords) {
        if (message.includes(keyword)) {
          return intent as FlowType
        }
      }
    }
    return null
  }
  
  /**
   * Obtiene los pasos del flujo según el tipo
   */
  static getFlowSteps(flowType: FlowType, businessContext: BusinessContext): FlowStep[] {
    switch (flowType) {
      case 'product_purchase':
        return this.getProductPurchaseSteps(businessContext)
      case 'service_booking':
        return this.getServiceBookingSteps(businessContext)
      case 'food_order':
        return this.getFoodOrderSteps(businessContext)
      case 'location_service':
        return this.getLocationServiceSteps(businessContext)
      default:
        return this.getDefaultSteps()
    }
  }
  
  /**
   * Flujo de compra de producto
   */
  private static getProductPurchaseSteps(context: BusinessContext): FlowStep[] {
    const steps: FlowStep[] = [
      {
        id: 'show_item',
        type: 'show',
        prompt: 'Mostrando producto...'
      },
      {
        id: 'confirm_interest',
        type: 'ask',
        prompt: '¿Te interesa este producto?',
        options: ['Sí, lo quiero', 'Ver más opciones', 'Tengo una pregunta']
      }
    ]
    
    // Si tiene variantes (tallas, colores)
    steps.push({
      id: 'collect_variant',
      type: 'collect',
      prompt: '¿Qué variante prefieres?'
    })
    
    // Cantidad
    steps.push({
      id: 'collect_quantity',
      type: 'collect',
      prompt: '¿Cuántas unidades deseas?',
      validation: (input) => !isNaN(parseInt(input)) && parseInt(input) > 0
    })
    
    // Si tiene delivery
    if (context.features.hasDelivery) {
      steps.push({
        id: 'collect_delivery',
        type: 'ask',
        prompt: '¿Cómo prefieres recibirlo?',
        options: ['Envío a domicilio', 'Recoger en tienda']
      })
      
      steps.push({
        id: 'collect_location',
        type: 'collect',
        prompt: '¿A qué dirección te lo enviamos?'
      })
    }
    
    // Contacto
    steps.push({
      id: 'collect_contact',
      type: 'collect',
      prompt: '¿A qué nombre va el pedido?'
    })
    
    // Confirmación
    steps.push({
      id: 'confirm_order',
      type: 'confirm',
      prompt: 'Resumen de tu pedido...'
    })
    
    // Pago
    steps.push({
      id: 'show_payment',
      type: 'show',
      prompt: 'Métodos de pago disponibles...'
    })
    
    steps.push({
      id: 'complete',
      type: 'complete',
      prompt: '¡Gracias por tu compra!'
    })
    
    return steps
  }
  
  /**
   * Flujo de reserva de servicio
   */
  private static getServiceBookingSteps(context: BusinessContext): FlowStep[] {
    return [
      {
        id: 'show_item',
        type: 'show',
        prompt: 'Información del servicio...'
      },
      {
        id: 'collect_date',
        type: 'collect',
        prompt: '¿Qué día te gustaría agendar?'
      },
      {
        id: 'collect_time',
        type: 'collect',
        prompt: '¿A qué hora prefieres?'
      },
      {
        id: 'collect_contact',
        type: 'collect',
        prompt: '¿A qué nombre agendamos la cita?'
      },
      {
        id: 'collect_phone',
        type: 'collect',
        prompt: '¿Número de contacto?',
        validation: (input) => /^\d{10}$/.test(input.replace(/\D/g, ''))
      },
      {
        id: 'confirm_booking',
        type: 'confirm',
        prompt: 'Confirmación de tu cita...'
      },
      {
        id: 'complete',
        type: 'complete',
        prompt: '¡Cita agendada exitosamente!'
      }
    ]
  }
  
  /**
   * Flujo de pedido de comida
   */
  private static getFoodOrderSteps(context: BusinessContext): FlowStep[] {
    return [
      {
        id: 'show_menu',
        type: 'show',
        prompt: 'Nuestro menú...'
      },
      {
        id: 'collect_order',
        type: 'collect',
        prompt: '¿Qué te gustaría ordenar?'
      },
      {
        id: 'collect_customization',
        type: 'ask',
        prompt: '¿Alguna personalización?',
        options: ['Sin cebolla', 'Extra queso', 'Picante', 'Normal']
      },
      {
        id: 'collect_delivery_type',
        type: 'ask',
        prompt: '¿Para llevar o domicilio?',
        options: ['Domicilio', 'Para llevar', 'Comer aquí']
      },
      {
        id: 'collect_location',
        type: 'collect',
        prompt: '¿A qué dirección te lo enviamos?'
      },
      {
        id: 'confirm_order',
        type: 'confirm',
        prompt: 'Tu pedido...'
      },
      {
        id: 'show_payment',
        type: 'show',
        prompt: 'Métodos de pago...'
      },
      {
        id: 'complete',
        type: 'complete',
        prompt: '¡Pedido confirmado!'
      }
    ]
  }
  
  /**
   * Flujo de servicio a domicilio
   */
  private static getLocationServiceSteps(context: BusinessContext): FlowStep[] {
    return [
      {
        id: 'show_item',
        type: 'show',
        prompt: 'Información del servicio...'
      },
      {
        id: 'collect_location',
        type: 'collect',
        prompt: '¿En qué dirección necesitas el servicio?'
      },
      {
        id: 'validate_area',
        type: 'confirm',
        prompt: 'Verificando cobertura...'
      },
      {
        id: 'collect_date',
        type: 'collect',
        prompt: '¿Qué día te queda bien?'
      },
      {
        id: 'collect_time',
        type: 'collect',
        prompt: '¿A qué hora?'
      },
      {
        id: 'collect_contact',
        type: 'collect',
        prompt: '¿Nombre y teléfono de contacto?'
      },
      {
        id: 'confirm_service',
        type: 'confirm',
        prompt: 'Resumen del servicio...'
      },
      {
        id: 'complete',
        type: 'complete',
        prompt: '¡Servicio agendado!'
      }
    ]
  }
  
  /**
   * Pasos por defecto
   */
  private static getDefaultSteps(): FlowStep[] {
    return [
      {
        id: 'initial',
        type: 'ask',
        prompt: '¿En qué puedo ayudarte?'
      }
    ]
  }
  
  /**
   * Ejecuta un paso del flujo
   */
  static executeStep(
    step: FlowStep, 
    userInput: string, 
    state: ConversationState
  ): FlowResult {
    // Validar input si es necesario
    if (step.validation && !step.validation(userInput)) {
      return {
        response: 'Por favor, ingresa un valor válido.',
        nextStage: state.stage,
        requiresInput: true
      }
    }
    
    // Actualizar datos recolectados según el paso
    this.updateCollectedData(step.id, userInput, state)
    
    // Determinar siguiente paso
    const nextStepId = typeof step.nextStep === 'function' 
      ? step.nextStep(userInput, state)
      : step.nextStep
    
    return {
      response: step.prompt || '',
      nextStage: (nextStepId as FlowStage) || 'complete',
      requiresInput: step.type === 'collect' || step.type === 'ask',
      options: step.options,
      complete: step.type === 'complete'
    }
  }
  
  /**
   * Actualiza los datos recolectados
   */
  private static updateCollectedData(stepId: string, input: string, state: ConversationState): void {
    switch (stepId) {
      case 'collect_variant':
        state.collectedData.variant = input
        break
      case 'collect_quantity':
        state.collectedData.quantity = parseInt(input) || 1
        break
      case 'collect_date':
        state.collectedData.date = input
        break
      case 'collect_time':
        state.collectedData.time = input
        break
      case 'collect_location':
        state.collectedData.location = input
        break
      case 'collect_contact':
        state.collectedData.name = input
        break
      case 'collect_phone':
        state.collectedData.phone = input
        break
    }
  }
  
  /**
   * Crea un nuevo estado de conversación
   */
  static createState(flowType: FlowType, itemId?: string, itemName?: string): ConversationState {
    return {
      flowType,
      stage: 'initial',
      currentItemId: itemId,
      currentItemName: itemName,
      collectedData: {},
      history: ['initial']
    }
  }
  
  /**
   * Normaliza el mensaje para análisis
   */
  private static normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
  }
}

export default FlowEngine
