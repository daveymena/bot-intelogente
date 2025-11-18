/**
 * 🎯 GESTOR DE FLUJO CONVERSACIONAL
 * Controla el flujo de la conversación paso a paso
 * Asegura que el cliente avance de forma natural hacia la compra
 */

import { SharedMemory } from './shared-memory';

export type ConversationStage = 
  | 'greeting'      // Saludo inicial
  | 'discovery'     // Descubrir necesidades
  | 'search'        // Búsqueda de productos
  | 'presentation'  // Presentación del producto
  | 'qualification' // Calificación (preguntas sobre necesidades)
  | 'objection'     // Manejo de objeciones
  | 'payment'       // Proceso de pago
  | 'closing'       // Cierre de venta
  | 'support';      // Soporte post-venta

export interface FlowDecision {i
  currentStage: ConversationStage;
  nextStage: ConversationStage;
  shouldAskQuestion: boolean;
  suggestedQuestion?: string;
  shouldShowProduct: boolean;
  shouldShowPayment: boolean;
  confidence: number;
  reasoning: string;
}

export class ConversationFlowManager {
  /**
   * Analiza el estado actual y decide el siguiente paso
   */
  static analyzeFlow(memory: SharedMemory, userMessage: string): FlowDecision {
    const currentStage = memory.salesStage as ConversationStage;
    const messageCount = memory.messageCount;
    const hasProduct = !!memory.currentProduct;
    const hasPaymentIntent = memory.paymentIntent;
    
    console.log('[FlowManager] 📊 Analizando flujo:', {
      stage: currentStage,
      messages: messageCount,
      hasProduct,
      hasPaymentIntent,
    });
    
    // 1. GREETING → DISCOVERY
    if (currentStage === 'greeting' && messageCount <= 2) {
      return {
        currentStage: 'greeting',
        nextStage: 'discovery',
        shouldAskQuestion: true,
        suggestedQuestion: this.getDiscoveryQuestion(memory),
        shouldShowProduct: false,
        shouldShowPayment: false,
        confidence: 0.9,
        reasoning: 'Cliente recién llegó, necesitamos descubrir sus necesidades',
      };
    }
    
    // 2. DISCOVERY → SEARCH
    if (currentStage === 'discovery' || (currentStage === 'greeting' && messageCount > 2)) {
      const hasSearchIntent = this.detectSearchIntent(userMessage);
      
      if (hasSearchIntent) {
        return {
          currentStage: 'discovery',
          nextStage: 'search',
          shouldAskQuestion: false,
          shouldShowProduct: false,
          shouldShowPayment: false,
          confidence: 0.85,
          reasoning: 'Cliente expresó lo que busca, proceder a búsqueda',
        };
      }
      
      return {
        currentStage: 'discovery',
        nextStage: 'discovery',
        shouldAskQuestion: true,
        suggestedQuestion: this.getDiscoveryQuestion(memory),
        shouldShowProduct: false,
        shouldShowPayment: false,
        confidence: 0.8,
        reasoning: 'Aún no sabemos qué busca, seguir descubriendo',
      };
    }
    
    // 3. SEARCH → PRESENTATION
    if (currentStage === 'search' && hasProduct) {
      return {
        currentStage: 'search',
        nextStage: 'presentation',
        shouldAskQuestion: false,
        shouldShowProduct: true,
        shouldShowPayment: false,
        confidence: 0.9,
        reasoning: 'Producto encontrado, presentar al cliente',
      };
    }
    
    // 4. PRESENTATION → QUALIFICATION
    if (currentStage === 'presentation' && hasProduct && !memory.productInfoSent) {
      return {
        currentStage: 'presentation',
        nextStage: 'qualification',
        shouldAskQuestion: true,
        suggestedQuestion: this.getQualificationQuestion(memory),
        shouldShowProduct: true,
        shouldShowPayment: false,
        confidence: 0.85,
        reasoning: 'Producto presentado, calificar interés del cliente',
      };
    }
    
    // 5. QUALIFICATION → PAYMENT
    if ((currentStage === 'qualification' || currentStage === 'presentation') && hasProduct) {
      const hasBuyingSignal = this.detectBuyingSignal(userMessage);
      
      if (hasBuyingSignal || hasPaymentIntent) {
        return {
          currentStage: 'qualification',
          nextStage: 'payment',
          shouldAskQuestion: false,
          shouldShowProduct: false,
          shouldShowPayment: true,
          confidence: 0.95,
          reasoning: 'Cliente mostró señal de compra, proceder a pago',
        };
      }
      
      // Seguir calificando
      return {
        currentStage: 'qualification',
        nextStage: 'qualification',
        shouldAskQuestion: true,
        suggestedQuestion: this.getQualificationQuestion(memory),
        shouldShowProduct: false,
        shouldShowPayment: false,
        confidence: 0.8,
        reasoning: 'Cliente interesado pero no listo, seguir calificando',
      };
    }
    
    // 6. PAYMENT → CLOSING
    if (currentStage === 'payment' && memory.paymentLinkSent) {
      return {
        currentStage: 'payment',
        nextStage: 'closing',
        shouldAskQuestion: false,
        shouldShowProduct: false,
        shouldShowPayment: false,
        confidence: 0.9,
        reasoning: 'Link de pago enviado, cerrar venta',
      };
    }
    
    // 7. OBJECTION HANDLING
    const hasObjection = this.detectObjection(userMessage);
    if (hasObjection && hasProduct) {
      return {
        currentStage: currentStage,
        nextStage: 'objection',
        shouldAskQuestion: false,
        shouldShowProduct: false,
        shouldShowPayment: false,
        confidence: 0.85,
        reasoning: 'Cliente tiene objeción, manejar antes de continuar',
      };
    }
    
    // DEFAULT: Mantener stage actual
    return {
      currentStage: currentStage,
      nextStage: currentStage,
      shouldAskQuestion: false,
      shouldShowProduct: false,
      shouldShowPayment: false,
      confidence: 0.7,
      reasoning: 'Continuar en stage actual',
    };
  }
  
  /**
   * Genera pregunta de descubrimiento según el contexto
   */
  private static getDiscoveryQuestion(memory: SharedMemory): string {
    const questions = [
      '¿Qué tipo de producto estás buscando? 🤔',
      '¿En qué puedo ayudarte hoy? 😊',
      '¿Buscas algo en particular? 🔍',
      '¿Qué necesitas? Cuéntame para ayudarte mejor 💬',
    ];
    
    // Rotar preguntas para no repetir
    const index = memory.messageCount % questions.length;
    return questions[index];
  }
  
  /**
   * Genera pregunta de calificación según el producto
   */
  private static getQualificationQuestion(memory: SharedMemory): string {
    const product = memory.currentProduct;
    
    if (!product) {
      return '¿Te interesa algún producto en particular? 🤔';
    }
    
    // Preguntas según tipo de producto
    if (product.category?.toLowerCase().includes('curso') || 
        product.category?.toLowerCase().includes('digital')) {
      return '¿Este curso es para ti o para alguien más? 🎓';
    }
    
    if (product.category?.toLowerCase().includes('laptop') || 
        product.category?.toLowerCase().includes('computador')) {
      return '¿Para qué lo vas a usar principalmente? 💻';
    }
    
    if (product.category?.toLowerCase().includes('moto')) {
      return '¿Es tu primera moto o ya tienes experiencia? 🏍️';
    }
    
    // Pregunta genérica
    return '¿Qué te parece este producto? ¿Cumple con lo que buscas? 🤔';
  }
  
  /**
   * Detecta intención de búsqueda en el mensaje
   */
  private static detectSearchIntent(message: string): boolean {
    const msg = message.toLowerCase();
    
    const searchKeywords = [
      'busco', 'necesito', 'quiero', 'me interesa',
      'tienes', 'tienen', 'hay', 'venden',
      'laptop', 'computador', 'moto', 'curso',
      'megapack', 'servicio', 'reparacion',
    ];
    
    return searchKeywords.some(kw => msg.includes(kw));
  }
  
  /**
   * Detecta señales de compra en el mensaje
   */
  private static detectBuyingSignal(message: string): boolean {
    const msg = message.toLowerCase();
    
    const buyingSignals = [
      'comprar', 'comprarlo', 'lo compro', 'lo quiero',
      'pagar', 'pagarlo', 'cuanto cuesta', 'precio',
      'metodo', 'método', 'forma de pago',
      'si', 'sí', 'dale', 'ok', 'perfecto',
      'me interesa', 'me gusta', 'lo necesito',
    ];
    
    return buyingSignals.some(signal => msg.includes(signal));
  }
  
  /**
   * Detecta objeciones en el mensaje
   */
  private static detectObjection(message: string): boolean {
    const msg = message.toLowerCase();
    
    const objections = [
      'caro', 'costoso', 'muy caro', 'mucho dinero',
      'no tengo', 'no puedo', 'no me alcanza',
      'pensarlo', 'pensar', 'dudas', 'no estoy seguro',
      'comparar', 'ver otras opciones',
      'garantia', 'garantía', 'devolucion', 'devolución',
    ];
    
    return objections.some(obj => msg.includes(obj));
  }
  
  /**
   * Obtiene el siguiente paso recomendado
   */
  static getNextAction(decision: FlowDecision): string {
    if (decision.shouldShowPayment) {
      return 'show_payment_methods';
    }
    
    if (decision.shouldShowProduct) {
      return 'show_product_details';
    }
    
    if (decision.shouldAskQuestion) {
      return 'ask_qualifying_question';
    }
    
    return 'continue_conversation';
  }
}
