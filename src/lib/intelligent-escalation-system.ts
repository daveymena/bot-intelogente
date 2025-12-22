/**
 * 🚀 SISTEMA DE ESCALAMIENTO INTELIGENTE
 * 
 * Flujo de respuesta:
 * 1. Plantillas locales (rápido, gratis)
 * 2. IA para casos complejos (Groq/Ollama)
 * 3. Escalamiento a humano si la IA no puede ayudar
 */

export interface EscalationResult {
  shouldEscalate: boolean;
  reason?: string;
  confidence: number;
  attemptedMethods: string[];
}

export class IntelligentEscalationSystem {
  static shouldEscalate(messageText: string, history: string[], confidence: number) {
    throw new Error('Method not implemented.');
  }
  private static readonly HUMAN_CONTACT = '3136174267';
  private static readonly LOW_CONFIDENCE_THRESHOLD = 50;
  private static readonly ESCALATION_KEYWORDS = [
    'hablar con alguien',
    'hablar con una persona',
    'asesor',
    'humano',
    'persona real',
    'no entiendes',
    'no me ayudas',
    'quiero hablar',
    'necesito ayuda',
    'esto no funciona',
    'no sirve',
    'mal servicio'
  ];

  /**
   * Evaluar si se debe escalar a humano
   */
  static shouldEscalateToHuman(
    userMessage: string,
    botResponse: string,
    confidence: number,
    attemptedMethods: string[]
  ): EscalationResult {
    const reasons: string[] = [];

    // 1. Cliente pide explícitamente hablar con humano
    const asksForHuman = this.ESCALATION_KEYWORDS.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );
    
    if (asksForHuman) {
      return {
        shouldEscalate: true,
        reason: 'Cliente solicitó hablar con un asesor',
        confidence: 100,
        attemptedMethods
      };
    }

    // 2. Confianza muy baja en la respuesta
    if (confidence < this.LOW_CONFIDENCE_THRESHOLD) {
      reasons.push('Confianza baja en la respuesta');
    }

    // 3. Bot no encontró productos relevantes
    if (botResponse.includes('no encontré') || 
        botResponse.includes('no tengo') ||
        botResponse.includes('no está disponible')) {
      reasons.push('No se encontraron productos relevantes');
    }

    // 4. Bot pide aclaración repetidamente
    if (botResponse.includes('podrías aclarar') || 
        botResponse.includes('especificar mejor')) {
      reasons.push('Bot necesita aclaración');
    }

    // 5. Pregunta muy compleja que requiere asesoría personalizada
    const isComplexQuery = this.isComplexQuery(userMessage);
    if (isComplexQuery) {
      reasons.push('Consulta compleja que requiere asesoría personalizada');
    }

    // Decidir si escalar
    const shouldEscalate = reasons.length >= 2 || 
                          (confidence < 40) ||
                          (isComplexQuery && confidence < 60);

    return {
      shouldEscalate,
      reason: reasons.join(', '),
      confidence,
      attemptedMethods
    };
  }

  /**
   * Detectar si es una consulta compleja
   */
  private static isComplexQuery(message: string): boolean {
    const complexIndicators = [
      'comparar',
      'diferencia entre',
      'cuál es mejor',
      'recomiéndame',
      'no sé qué',
      'ayúdame a elegir',
      'qué me conviene',
      'tengo dudas',
      'no estoy seguro'
    ];

    return complexIndicators.some(indicator => 
      message.toLowerCase().includes(indicator)
    );
  }

  /**
   * Generar mensaje de escalamiento a humano
   */
  static generateEscalationMessage(reason?: string): string {
    const messages = [
      `👨‍💼 *Te conecto con un asesor humano*\n\n` +
      `Entiendo que necesitas ayuda más personalizada. ` +
      `Un asesor experto te atenderá de inmediato.\n\n` +
      `📱 *Contacta directamente:*\n` +
      `WhatsApp: ${this.HUMAN_CONTACT}\n\n` +
      `O espera un momento, te contactaremos enseguida. ⏱️`,

      `🤝 *Déjame conectarte con nuestro equipo*\n\n` +
      `Para brindarte la mejor atención, te paso con un asesor que ` +
      `podrá ayudarte de forma personalizada.\n\n` +
      `📞 *Llama o escribe:*\n` +
      `${this.HUMAN_CONTACT}\n\n` +
      `¡Estamos aquí para ayudarte! 😊`,

      `💬 *Asesoría personalizada disponible*\n\n` +
      `Veo que necesitas ayuda especializada. ` +
      `Nuestro equipo está listo para atenderte.\n\n` +
      `📱 *Contacto directo:*\n` +
      `WhatsApp: ${this.HUMAN_CONTACT}\n\n` +
      `Respuesta inmediata garantizada ⚡`
    ];

    // Seleccionar mensaje aleatorio para variedad
    const selectedMessage = messages[Math.floor(Math.random() * messages.length)];

    // Agregar razón si existe
    if (reason) {
      return `${selectedMessage}\n\n_Motivo: ${reason}_`;
    }

    return selectedMessage;
  }

  /**
   * Generar link de WhatsApp directo
   */
  static generateWhatsAppLink(message: string): string {
    const encodedMessage = encodeURIComponent(
      `Hola, necesito ayuda con: ${message}`
    );
    return `https://wa.me/${this.HUMAN_CONTACT}?text=${encodedMessage}`;
  }

  /**
   * Evaluar si la respuesta del bot es satisfactoria
   */
  static isResponseSatisfactory(
    botResponse: string,
    confidence: number
  ): boolean {
    // Respuesta muy corta o genérica
    if (botResponse.length < 50) return false;

    // Confianza muy baja
    if (confidence < 40) return false;

    // Respuestas de error
    const errorIndicators = [
      'no entendí',
      'no encontré',
      'error',
      'disculpa',
      'lo siento',
      'no puedo',
      'no tengo información'
    ];

    const hasError = errorIndicators.some(indicator =>
      botResponse.toLowerCase().includes(indicator)
    );

    if (hasError && confidence < 70) return false;

    return true;
  }

  /**
   * Registrar intento de escalamiento (para analytics)
   */
  static async logEscalation(
    userId: string,
    userMessage: string,
    reason: string,
    confidence: number
  ): Promise<void> {
    try {
      const { db } = await import('./db');
      
      // Guardar en tabla de escalamientos (si existe)
      // O en logs para análisis posterior
      console.log('[Escalation] 📊 Escalamiento registrado:', {
        userId,
        message: userMessage.substring(0, 100),
        reason,
        confidence,
        timestamp: new Date()
      });

      // TODO: Guardar en BD para analytics
      // await db.escalation.create({ ... })

    } catch (error) {
      console.error('[Escalation] Error registrando escalamiento:', error);
    }
  }
}
