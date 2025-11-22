/**
 * 🧠 SISTEMA DE ENTRENAMIENTO AVANZADO PARA BOT CONVERSACIONAL
 * 
 * Este sistema hace el bot "indestructible" detectando:
 * - Patrones de conversación exitosos
 * - Intenciones ocultas del usuario
 * - Contexto profundo de la conversación
 * - Momentos clave para cerrar ventas
 * - Objeciones antes de que se expresen
 * - Señales de compra implícitas
 */

import { db } from './db';
import { ConversationLearningService } from './conversation-learning-service';

interface ConversationPattern {
  // Patrón detectado
  pattern: string;
  
  // Contexto donde ocurre
  context: {
    stage: string; // greeting, search, product, payment, closing
    userEmotion: 'positive' | 'neutral' | 'negative' | 'excited' | 'doubtful';
    productCategory?: string;
    priceRange?: string;
  };
  
  // Resultado
  outcome: 'sale' | 'objection' | 'clarification' | 'abandonment';
  
  // Confianza del patrón
  confidence: number;
  
  // Frecuencia de aparición
  frequency: number;
}

interface HiddenIntent {
  // Intención oculta detectada
  intent: string;
  
  // Señales que la revelan
  signals: string[];
  
  // Confianza de detección
  confidence: number;
  
  // Acción recomendada
  recommendedAction: string;
}

interface ConversationMoment {
  // Tipo de momento
  type: 'buying_signal' | 'objection_forming' | 'losing_interest' | 'needs_clarification' | 'ready_to_close';
  
  // Indicadores
  indicators: string[];
  
  // Urgencia (0-1)
  urgency: number;
  
  // Respuesta óptima
  optimalResponse: string;
}

export class AdvancedConversationTrainer {
  /**
   * 🎯 DETECTAR PATRONES DE CONVERSACIÓN EXITOSOS
   * 
   * Analiza conversaciones pasadas para identificar qué funciona
   */
  static async detectSuccessPatterns(userId?: string): Promise<ConversationPattern[]> {
    try {
      console.log('🔍 [TRAINER] Analizando patrones de conversación exitosos...');
      
      // Obtener conversaciones exitosas (que terminaron en venta)
      const successfulConversations = await db.conversation.findMany({
        where: {
          userId: userId || undefined,
          outcome: 'sale'
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        },
        take: 100
      });
      
      const patterns: ConversationPattern[] = [];
      
      for (const conversation of successfulConversations) {
        // Analizar secuencia de mensajes
        const messageSequence = conversation.messages.map(m => ({
          role: m.role,
          content: m.content.toLowerCase(),
          timestamp: m.createdAt
        }));
        
        // Detectar patrones clave
        const detectedPatterns = this.analyzeMessageSequence(messageSequence);
        
        patterns.push(...detectedPatterns);
      }
      
      // Agrupar y contar frecuencias
      const groupedPatterns = this.groupPatternsByFrequency(patterns);
      
      console.log(`✅ [TRAINER] ${groupedPatterns.length} patrones exitosos detectados`);
      
      return groupedPatterns;
      
    } catch (error) {
      console.error('❌ [TRAINER] Error detectando patrones:', error);
      return [];
    }
  }
  
  /**
   * 🕵️ DETECTAR INTENCIONES OCULTAS
   * 
   * Identifica lo que el usuario REALMENTE quiere, aunque no lo diga directamente
   */
  static detectHiddenIntent(
    message: string,
    conversationHistory: Array<{ role: string; content: string }>,
    context: any
  ): HiddenIntent | null {
    const lowerMessage = message.toLowerCase();
    
    // 🎯 SEÑAL 1: Pregunta por precio repetidamente = Preocupación por presupuesto
    if (this.countOccurrences(conversationHistory, ['precio', 'costo', 'cuánto']) >= 2) {
      return {
        intent: 'budget_concern',
        signals: ['Pregunta por precio múltiples veces', 'Compara precios'],
        confidence: 0.85,
        recommendedAction: 'Ofrecer opciones de pago flexibles o productos más económicos'
      };
    }
    
    // 🎯 SEÑAL 2: Pregunta por características técnicas = Usuario experto
    const technicalTerms = ['procesador', 'ram', 'ssd', 'gpu', 'especificaciones', 'benchmark'];
    if (technicalTerms.some(term => lowerMessage.includes(term))) {
      return {
        intent: 'expert_user',
        signals: ['Usa términos técnicos', 'Pregunta por especificaciones detalladas'],
        confidence: 0.9,
        recommendedAction: 'Proporcionar información técnica detallada, evitar explicaciones básicas'
      };
    }
    
    // 🎯 SEÑAL 3: Menciona "pensarlo" o "después" = Objeción de tiempo
    if (lowerMessage.includes('pensarlo') || lowerMessage.includes('después') || lowerMessage.includes('luego')) {
      return {
        intent: 'time_objection',
        signals: ['Dice que lo pensará', 'Pospone la decisión'],
        confidence: 0.8,
        recommendedAction: 'Crear urgencia con oferta limitada o destacar beneficio inmediato'
      };
    }
    
    // 🎯 SEÑAL 4: Pregunta por garantía o devoluciones = Miedo al riesgo
    if (lowerMessage.includes('garantía') || lowerMessage.includes('devolución') || lowerMessage.includes('reembolso')) {
      return {
        intent: 'risk_aversion',
        signals: ['Pregunta por garantías', 'Preocupado por devoluciones'],
        confidence: 0.85,
        recommendedAction: 'Enfatizar garantía, testimonios y política de devolución clara'
      };
    }
    
    // 🎯 SEÑAL 5: Compara con otras tiendas = Está comprando en múltiples lugares
    if (lowerMessage.includes('otro lugar') || lowerMessage.includes('otra tienda') || lowerMessage.includes('competencia')) {
      return {
        intent: 'comparison_shopping',
        signals: ['Menciona otras tiendas', 'Compara opciones'],
        confidence: 0.9,
        recommendedAction: 'Destacar ventajas únicas, servicio personalizado, entrega rápida'
      };
    }
    
    // 🎯 SEÑAL 6: Pregunta por envío repetidamente = Preocupación por logística
    if (this.countOccurrences(conversationHistory, ['envío', 'entrega', 'demora']) >= 2) {
      return {
        intent: 'delivery_concern',
        signals: ['Pregunta por envío múltiples veces', 'Preocupado por tiempos'],
        confidence: 0.8,
        recommendedAction: 'Ofrecer envío express o recoger en tienda si es posible'
      };
    }
    
    // 🎯 SEÑAL 7: Usa emojis positivos = Usuario emocionado
    const positiveEmojis = ['😊', '😄', '🤩', '😍', '👍', '💪', '🔥'];
    if (positiveEmojis.some(emoji => message.includes(emoji))) {
      return {
        intent: 'excited_buyer',
        signals: ['Usa emojis positivos', 'Tono entusiasta'],
        confidence: 0.95,
        recommendedAction: 'Aprovechar el momento, facilitar compra inmediata'
      };
    }
    
    // 🎯 SEÑAL 8: Pregunta por opiniones o reviews = Necesita validación social
    if (lowerMessage.includes('opinión') || lowerMessage.includes('review') || lowerMessage.includes('recomendación')) {
      return {
        intent: 'needs_social_proof',
        signals: ['Pide opiniones', 'Busca validación'],
        confidence: 0.85,
        recommendedAction: 'Compartir testimonios, reseñas positivas, casos de éxito'
      };
    }
    
    return null;
  }
  
  /**
   * ⏰ DETECTAR MOMENTOS CLAVE EN LA CONVERSACIÓN
   * 
   * Identifica el momento exacto para actuar (cerrar venta, manejar objeción, etc.)
   */
  static detectCriticalMoment(
    message: string,
    conversationHistory: Array<{ role: string; content: string }>,
    context: any
  ): ConversationMoment | null {
    const lowerMessage = message.toLowerCase();
    
    // 🟢 MOMENTO 1: SEÑAL DE COMPRA FUERTE
    const buyingSignals = [
      'lo quiero', 'lo compro', 'me interesa', 'cómo pago',
      'métodos de pago', 'proceder', 'confirmar', 'dale'
    ];
    
    if (buyingSignals.some(signal => lowerMessage.includes(signal))) {
      return {
        type: 'ready_to_close',
        indicators: ['Expresó intención de compra directa'],
        urgency: 0.95,
        optimalResponse: 'Facilitar el pago inmediatamente, sin distracciones'
      };
    }
    
    // 🟡 MOMENTO 2: OBJECIÓN FORMÁNDOSE
    const objectionSignals = [
      'pero', 'aunque', 'sin embargo', 'el problema es',
      'no estoy seguro', 'no sé', 'me preocupa'
    ];
    
    if (objectionSignals.some(signal => lowerMessage.includes(signal))) {
      return {
        type: 'objection_forming',
        indicators: ['Usa palabras de duda o contraste'],
        urgency: 0.8,
        optimalResponse: 'Abordar la objeción inmediatamente con empatía y solución'
      };
    }
    
    // 🔴 MOMENTO 3: PERDIENDO INTERÉS
    const disinterestSignals = [
      'ok', 'ya veo', 'entiendo', 'gracias', 'adiós',
      'después', 'luego', 'otro día'
    ];
    
    // Solo si el mensaje es MUY corto (señal de desinterés)
    if (message.length < 15 && disinterestSignals.some(signal => lowerMessage.includes(signal))) {
      return {
        type: 'losing_interest',
        indicators: ['Respuestas cortas', 'Señales de despedida'],
        urgency: 0.9,
        optimalResponse: 'Crear urgencia o ofrecer incentivo para mantener interés'
      };
    }
    
    // 🔵 MOMENTO 4: NECESITA CLARIFICACIÓN
    const confusionSignals = [
      '?', 'no entiendo', 'cómo', 'qué significa',
      'explica', 'no me queda claro'
    ];
    
    if (confusionSignals.some(signal => lowerMessage.includes(signal))) {
      return {
        type: 'needs_clarification',
        indicators: ['Hace preguntas de clarificación', 'Expresa confusión'],
        urgency: 0.7,
        optimalResponse: 'Simplificar explicación, usar ejemplos concretos'
      };
    }
    
    // 🟢 MOMENTO 5: SEÑAL DE COMPRA IMPLÍCITA
    const implicitBuyingSignals = [
      'cuándo llega', 'tiempo de entrega', 'viene con',
      'incluye', 'qué más', 'y si', 'puedo'
    ];
    
    if (implicitBuyingSignals.some(signal => lowerMessage.includes(signal)) && context.currentProduct) {
      return {
        type: 'buying_signal',
        indicators: ['Pregunta por detalles post-compra', 'Asume que va a comprar'],
        urgency: 0.85,
        optimalResponse: 'Confirmar detalles y facilitar cierre de venta'
      };
    }
    
    return null;
  }
  
  /**
   * 📊 ANALIZAR SECUENCIA DE MENSAJES
   * 
   * Detecta patrones en la secuencia de mensajes
   */
  private static analyzeMessageSequence(
    messages: Array<{ role: string; content: string; timestamp: Date }>
  ): ConversationPattern[] {
    const patterns: ConversationPattern[] = [];
    
    // Patrón 1: Pregunta por precio → Pregunta por métodos de pago → Compra
    if (this.hasSequence(messages, ['precio', 'pago', 'compro'])) {
      patterns.push({
        pattern: 'price_payment_purchase',
        context: {
          stage: 'payment',
          userEmotion: 'positive',
        },
        outcome: 'sale',
        confidence: 0.9,
        frequency: 1
      });
    }
    
    // Patrón 2: Pregunta por características → Pide foto → Compra
    if (this.hasSequence(messages, ['características', 'foto', 'quiero'])) {
      patterns.push({
        pattern: 'features_photo_purchase',
        context: {
          stage: 'product',
          userEmotion: 'excited',
        },
        outcome: 'sale',
        confidence: 0.85,
        frequency: 1
      });
    }
    
    // Patrón 3: Objeción de precio → Oferta de descuento → Compra
    if (this.hasSequence(messages, ['caro', 'descuento', 'dale'])) {
      patterns.push({
        pattern: 'price_objection_discount_purchase',
        context: {
          stage: 'product',
          userEmotion: 'doubtful',
        },
        outcome: 'sale',
        confidence: 0.8,
        frequency: 1
      });
    }
    
    return patterns;
  }
  
  /**
   * 🔢 CONTAR OCURRENCIAS DE PALABRAS CLAVE
   */
  private static countOccurrences(
    history: Array<{ role: string; content: string }>,
    keywords: string[]
  ): number {
    let count = 0;
    
    for (const message of history) {
      const lowerContent = message.content.toLowerCase();
      for (const keyword of keywords) {
        if (lowerContent.includes(keyword)) {
          count++;
        }
      }
    }
    
    return count;
  }
  
  /**
   * 🔍 VERIFICAR SI HAY UNA SECUENCIA DE PALABRAS
   */
  private static hasSequence(
    messages: Array<{ role: string; content: string; timestamp: Date }>,
    sequence: string[]
  ): boolean {
    let sequenceIndex = 0;
    
    for (const message of messages) {
      const lowerContent = message.content.toLowerCase();
      
      if (lowerContent.includes(sequence[sequenceIndex])) {
        sequenceIndex++;
        
        if (sequenceIndex === sequence.length) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * 📈 AGRUPAR PATRONES POR FRECUENCIA
   */
  private static groupPatternsByFrequency(patterns: ConversationPattern[]): ConversationPattern[] {
    const grouped = new Map<string, ConversationPattern>();
    
    for (const pattern of patterns) {
      const existing = grouped.get(pattern.pattern);
      
      if (existing) {
        existing.frequency++;
        existing.confidence = Math.min(1.0, existing.confidence + 0.05);
      } else {
        grouped.set(pattern.pattern, { ...pattern });
      }
    }
    
    return Array.from(grouped.values())
      .sort((a, b) => b.frequency - a.frequency);
  }
  
  /**
   * 🎓 ENTRENAR CON CONVERSACIONES REALES
   * 
   * Aprende de conversaciones reales para mejorar detección
   */
  static async trainWithRealConversations(limit: number = 100): Promise<void> {
    try {
      console.log('🎓 [TRAINER] Iniciando entrenamiento con conversaciones reales...');
      
      // Obtener conversaciones recientes
      const conversations = await db.conversation.findMany({
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      
      let patternsDetected = 0;
      let intentsDetected = 0;
      let momentsDetected = 0;
      
      for (const conversation of conversations) {
        const messages = conversation.messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.createdAt
        }));
        
        // Detectar patrones
        const patterns = this.analyzeMessageSequence(messages);
        patternsDetected += patterns.length;
        
        // Detectar intenciones ocultas en cada mensaje del usuario
        for (let i = 0; i < messages.length; i++) {
          const message = messages[i];
          
          if (message.role === 'user') {
            const history = messages.slice(0, i);
            
            const hiddenIntent = this.detectHiddenIntent(
              message.content,
              history,
              {}
            );
            
            if (hiddenIntent) {
              intentsDetected++;
            }
            
            const criticalMoment = this.detectCriticalMoment(
              message.content,
              history,
              {}
            );
            
            if (criticalMoment) {
              momentsDetected++;
            }
          }
        }
      }
      
      console.log('✅ [TRAINER] Entrenamiento completado:');
      console.log(`   📊 Patrones detectados: ${patternsDetected}`);
      console.log(`   🕵️ Intenciones ocultas: ${intentsDetected}`);
      console.log(`   ⏰ Momentos críticos: ${momentsDetected}`);
      
    } catch (error) {
      console.error('❌ [TRAINER] Error en entrenamiento:', error);
    }
  }
  
  /**
   * 📈 OBTENER ESTADÍSTICAS DE ENTRENAMIENTO
   */
  static async getTrainingStats(): Promise<{
    totalPatterns: number;
    topPatterns: ConversationPattern[];
    successRate: number;
  }> {
    try {
      const patterns = await this.detectSuccessPatterns();
      
      const totalConversations = await db.conversation.count();
      const successfulConversations = await db.conversation.count({
        where: { outcome: 'sale' }
      });
      
      const successRate = totalConversations > 0
        ? (successfulConversations / totalConversations) * 100
        : 0;
      
      return {
        totalPatterns: patterns.length,
        topPatterns: patterns.slice(0, 10),
        successRate
      };
      
    } catch (error) {
      console.error('❌ [TRAINER] Error obteniendo estadísticas:', error);
      return {
        totalPatterns: 0,
        topPatterns: [],
        successRate: 0
      };
    }
  }
}
