/**
 * 🧠 CAPA DE INTELIGENCIA CONVERSACIONAL
 * 
 * Capa intermedia que analiza CADA mensaje antes de que llegue al orquestador
 * para detectar patrones, intenciones ocultas y momentos críticos.
 * 
 * Hace el bot "indestructible" al:
 * 1. Predecir objeciones antes de que se expresen
 * 2. Detectar señales de compra implícitas
 * 3. Identificar el momento exacto para cerrar venta
 * 4. Adaptar el tono según la emoción del usuario
 * 5. Prevenir pérdida de interés
 */

import { AdvancedConversationTrainer } from './advanced-conversation-trainer';
import { ConversationLearningService } from './conversation-learning-service';

interface IntelligenceAnalysis {
  // Intención oculta detectada
  hiddenIntent: {
    intent: string;
    confidence: number;
    recommendedAction: string;
  } | null;
  
  // Momento crítico detectado
  criticalMoment: {
    type: string;
    urgency: number;
    optimalResponse: string;
  } | null;
  
  // Emoción del usuario
  userEmotion: 'positive' | 'neutral' | 'negative' | 'excited' | 'doubtful';
  
  // Nivel de interés (0-1)
  interestLevel: number;
  
  // Probabilidad de compra (0-1)
  purchaseProbability: number;
  
  // Recomendaciones para el bot
  recommendations: {
    tone: 'enthusiastic' | 'empathetic' | 'professional' | 'urgent';
    focus: 'close_sale' | 'handle_objection' | 'provide_info' | 'create_urgency';
    priority: 'high' | 'medium' | 'low';
  };
}

export class ConversationIntelligenceLayer {
  /**
   * 🔍 ANALIZAR MENSAJE ANTES DE PROCESARLO
   * 
   * Esta es la función principal que se llama ANTES del orquestador
   */
  static async analyzeBeforeProcessing(params: {
    message: string;
    chatId: string;
    userId: string;
    conversationHistory: Array<{ role: string; content: string }>;
    context: any;
  }): Promise<IntelligenceAnalysis> {
    const { message, chatId, userId, conversationHistory, context } = params;
    
    console.log('\n🧠 ========================================');
    console.log('🧠 CAPA DE INTELIGENCIA CONVERSACIONAL');
    console.log('🧠 ========================================\n');
    
    // 1. Detectar intención oculta
    const hiddenIntent = AdvancedConversationTrainer.detectHiddenIntent(
      message,
      conversationHistory,
      context
    );
    
    if (hiddenIntent) {
      console.log('🕵️ [INTELLIGENCE] Intención oculta detectada:');
      console.log(`   Intent: ${hiddenIntent.intent}`);
      console.log(`   Confianza: ${(hiddenIntent.confidence * 100).toFixed(0)}%`);
      console.log(`   Acción recomendada: ${hiddenIntent.recommendedAction}`);
    }
    
    // 2. Detectar momento crítico
    const criticalMoment = AdvancedConversationTrainer.detectCriticalMoment(
      message,
      conversationHistory,
      context
    );
    
    if (criticalMoment) {
      console.log('⏰ [INTELLIGENCE] Momento crítico detectado:');
      console.log(`   Tipo: ${criticalMoment.type}`);
      console.log(`   Urgencia: ${(criticalMoment.urgency * 100).toFixed(0)}%`);
      console.log(`   Respuesta óptima: ${criticalMoment.optimalResponse}`);
    }
    
    // 3. Detectar emoción del usuario
    const userEmotion = this.detectUserEmotion(message, conversationHistory);
    console.log(`😊 [INTELLIGENCE] Emoción del usuario: ${userEmotion}`);
    
    // 4. Calcular nivel de interés
    const interestLevel = this.calculateInterestLevel(message, conversationHistory, context);
    console.log(`📊 [INTELLIGENCE] Nivel de interés: ${(interestLevel * 100).toFixed(0)}%`);
    
    // 5. Calcular probabilidad de compra
    const purchaseProbability = this.calculatePurchaseProbability(
      message,
      conversationHistory,
      context,
      hiddenIntent,
      criticalMoment
    );
    console.log(`💰 [INTELLIGENCE] Probabilidad de compra: ${(purchaseProbability * 100).toFixed(0)}%`);
    
    // 6. Generar recomendaciones
    const recommendations = this.generateRecommendations(
      userEmotion,
      interestLevel,
      purchaseProbability,
      hiddenIntent,
      criticalMoment
    );
    
    console.log('💡 [INTELLIGENCE] Recomendaciones:');
    console.log(`   Tono: ${recommendations.tone}`);
    console.log(`   Enfoque: ${recommendations.focus}`);
    console.log(`   Prioridad: ${recommendations.priority}`);
    
    console.log('\n🧠 ========================================\n');
    
    return {
      hiddenIntent: hiddenIntent ? {
        intent: hiddenIntent.intent,
        confidence: hiddenIntent.confidence,
        recommendedAction: hiddenIntent.recommendedAction
      } : null,
      criticalMoment: criticalMoment ? {
        type: criticalMoment.type,
        urgency: criticalMoment.urgency,
        optimalResponse: criticalMoment.optimalResponse
      } : null,
      userEmotion,
      interestLevel,
      purchaseProbability,
      recommendations
    };
  }
  
  /**
   * 😊 DETECTAR EMOCIÓN DEL USUARIO
   */
  private static detectUserEmotion(
    message: string,
    history: Array<{ role: string; content: string }>
  ): 'positive' | 'neutral' | 'negative' | 'excited' | 'doubtful' {
    const lowerMessage = message.toLowerCase();
    
    // Emojis y palabras positivas
    const positiveSignals = ['😊', '😄', '🤩', '😍', '👍', '💪', '🔥', 'genial', 'perfecto', 'excelente', 'me encanta'];
    const excitedSignals = ['wow', 'increíble', 'asombroso', '!!!', 'justo lo que buscaba'];
    const negativeSignals = ['😞', '😔', '😕', 'mal', 'problema', 'no me gusta', 'decepcionado'];
    const doubtfulSignals = ['🤔', 'no sé', 'no estoy seguro', 'dudas', 'pensarlo', 'tal vez'];
    
    if (excitedSignals.some(signal => lowerMessage.includes(signal))) {
      return 'excited';
    }
    
    if (positiveSignals.some(signal => lowerMessage.includes(signal))) {
      return 'positive';
    }
    
    if (negativeSignals.some(signal => lowerMessage.includes(signal))) {
      return 'negative';
    }
    
    if (doubtfulSignals.some(signal => lowerMessage.includes(signal))) {
      return 'doubtful';
    }
    
    return 'neutral';
  }
  
  /**
   * 📊 CALCULAR NIVEL DE INTERÉS
   */
  private static calculateInterestLevel(
    message: string,
    history: Array<{ role: string; content: string }>,
    context: any
  ): number {
    let score = 0.5; // Base neutral
    
    const lowerMessage = message.toLowerCase();
    
    // Señales de alto interés
    if (lowerMessage.includes('me interesa') || lowerMessage.includes('quiero')) score += 0.3;
    if (lowerMessage.includes('precio') || lowerMessage.includes('costo')) score += 0.2;
    if (lowerMessage.includes('foto') || lowerMessage.includes('imagen')) score += 0.15;
    if (lowerMessage.includes('características') || lowerMessage.includes('detalles')) score += 0.15;
    if (lowerMessage.includes('pago') || lowerMessage.includes('comprar')) score += 0.4;
    
    // Señales de bajo interés
    if (message.length < 10) score -= 0.2;
    if (lowerMessage === 'ok' || lowerMessage === 'ya') score -= 0.3;
    if (lowerMessage.includes('después') || lowerMessage.includes('luego')) score -= 0.4;
    
    // Bonus por contexto
    if (context.currentProduct) score += 0.1;
    if (context.paymentIntent) score += 0.2;
    
    // Bonus por historial activo
    const recentMessages = history.slice(-5);
    if (recentMessages.length >= 3) score += 0.1;
    
    return Math.max(0, Math.min(1, score));
  }
  
  /**
   * 💰 CALCULAR PROBABILIDAD DE COMPRA
   */
  private static calculatePurchaseProbability(
    message: string,
    history: Array<{ role: string; content: string }>,
    context: any,
    hiddenIntent: any,
    criticalMoment: any
  ): number {
    let probability = 0.3; // Base
    
    const lowerMessage = message.toLowerCase();
    
    // Señales directas de compra
    const buyingSignals = ['compro', 'lo quiero', 'cómo pago', 'métodos de pago', 'proceder'];
    if (buyingSignals.some(signal => lowerMessage.includes(signal))) {
      probability += 0.5;
    }
    
    // Momento crítico de cierre
    if (criticalMoment?.type === 'ready_to_close') {
      probability += 0.3;
    }
    
    // Señal de compra implícita
    if (criticalMoment?.type === 'buying_signal') {
      probability += 0.2;
    }
    
    // Intención oculta positiva
    if (hiddenIntent?.intent === 'excited_buyer') {
      probability += 0.25;
    }
    
    // Contexto favorable
    if (context.currentProduct) probability += 0.1;
    if (context.paymentIntent) probability += 0.15;
    if (context.preferredPaymentMethod) probability += 0.1;
    
    // Historial de interacción
    const messageCount = history.length;
    if (messageCount >= 5 && messageCount <= 15) {
      probability += 0.1; // Sweet spot de conversación
    }
    
    // Penalizaciones
    if (hiddenIntent?.intent === 'time_objection') probability -= 0.2;
    if (hiddenIntent?.intent === 'budget_concern') probability -= 0.15;
    if (criticalMoment?.type === 'losing_interest') probability -= 0.3;
    
    return Math.max(0, Math.min(1, probability));
  }
  
  /**
   * 💡 GENERAR RECOMENDACIONES
   */
  private static generateRecommendations(
    emotion: string,
    interestLevel: number,
    purchaseProbability: number,
    hiddenIntent: any,
    criticalMoment: any
  ): {
    tone: 'enthusiastic' | 'empathetic' | 'professional' | 'urgent';
    focus: 'close_sale' | 'handle_objection' | 'provide_info' | 'create_urgency';
    priority: 'high' | 'medium' | 'low';
  } {
    // Determinar tono
    let tone: 'enthusiastic' | 'empathetic' | 'professional' | 'urgent' = 'professional';
    
    if (emotion === 'excited') tone = 'enthusiastic';
    else if (emotion === 'doubtful' || emotion === 'negative') tone = 'empathetic';
    else if (criticalMoment?.urgency > 0.8) tone = 'urgent';
    
    // Determinar enfoque
    let focus: 'close_sale' | 'handle_objection' | 'provide_info' | 'create_urgency' = 'provide_info';
    
    if (purchaseProbability > 0.7) {
      focus = 'close_sale';
    } else if (hiddenIntent?.intent === 'time_objection' || hiddenIntent?.intent === 'budget_concern') {
      focus = 'handle_objection';
    } else if (criticalMoment?.type === 'losing_interest') {
      focus = 'create_urgency';
    }
    
    // Determinar prioridad
    let priority: 'high' | 'medium' | 'low' = 'medium';
    
    if (criticalMoment?.urgency > 0.8 || purchaseProbability > 0.7) {
      priority = 'high';
    } else if (interestLevel < 0.3) {
      priority = 'low';
    }
    
    return { tone, focus, priority };
  }
  
  /**
   * 📈 REGISTRAR RESULTADO DE LA CONVERSACIÓN
   * 
   * Después de que el bot responde, registrar si fue exitoso
   */
  static async recordConversationOutcome(params: {
    chatId: string;
    userId: string;
    analysis: IntelligenceAnalysis;
    botResponse: string;
    userReaction?: string;
    outcome: 'sale' | 'continued' | 'abandoned';
  }): Promise<void> {
    const { chatId, userId, analysis, botResponse, userReaction, outcome } = params;
    
    try {
      // Registrar en el sistema de aprendizaje
      if (outcome === 'sale') {
        await ConversationLearningService.recordSuccessfulPattern(
          userId,
          chatId,
          userReaction || 'compra realizada',
          botResponse,
          'purchase',
          {
            emotion: analysis.userEmotion,
            interestLevel: analysis.interestLevel,
            purchaseProbability: analysis.purchaseProbability
          }
        );
        
        console.log('✅ [INTELLIGENCE] Conversación exitosa registrada para aprendizaje');
      }
      
    } catch (error) {
      console.error('❌ [INTELLIGENCE] Error registrando resultado:', error);
    }
  }
}
