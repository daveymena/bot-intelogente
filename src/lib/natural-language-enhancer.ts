/**
 * Servicio de Mejora de Lenguaje Natural
 * Convierte respuestas de plantilla en conversaciones humanas
 */

interface ResponseEnhancementOptions {
  includeGreeting?: boolean;
  addEmphasis?: boolean;
  conversationalTone?: boolean;
  productContext?: {
    name: string;
    category: string;
    price: number;
  };
}

export class NaturalLanguageEnhancer {
  
  /**
   * Mejora una respuesta agregando elementos conversacionales naturales
   */
  static enhance(baseResponse: string, options: ResponseEnhancementOptions = {}): string {
    const { 
      includeGreeting = true, 
      addEmphasis = true, 
      conversationalTone = true,
      productContext 
    } = options;
    
    let enhanced = baseResponse;
    
    // 🎯 Etapa 1: Agregar saludo contextual si es necesario
    if (includeGreeting && !this.hasGreeting(baseResponse)) {
      enhanced = this.addContextualGreeting(enhanced, productContext);
    }
    
    // 🎯 Etapa 2: Hacer la respuesta más conversacional
    if (conversationalTone) {
      enhanced = this.makeConversational(enhanced);
    }
    
    // 🎯 Etapa 3: Agregar énfasis natural
    if (addEmphasis) {
      enhanced = this.addNaturalEmphasis(enhanced);
    }
    
    // 🎯 Etapa 4: Evitar respuestas robóticas
    enhanced = this.removeRoboticPatterns(enhanced);
    
    return enhanced;
  }
  
  /**
   * Detecta si la respuesta ya tiene un saludo
   */
  private static hasGreeting(text: string): boolean {
    const greetings = [
      'hola', 'buenos', 'buenas', 'qué tal', 'cómo estás',
      'perfecto', 'excelente', 'genial', 'claro'
    ];
    const lowerText = text.toLowerCase();
    return greetings.some(g => lowerText.startsWith(g));
  }
  
  /**
   * Agrega un saludo contextual apropiado
   */
  private static addContextualGreeting(text: string, productContext?: any): string {
    const greetings = [
      '¡Perfecto! 😊',
      '¡Claro! 👍',
      '¡Con gusto! ✨',
      '¡Excelente pregunta! 🎯',
      '¡Genial! 💪'
    ];
    
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    // Si hay contexto de producto, hacer el saludo más específico
    if (productContext) {
      return `${randomGreeting} Te cuento sobre ${productContext.name}:\n\n${text}`;
    }
    
    return `${randomGreeting}\n\n${text}`;
  }
  
  /**
   * Hace la respuesta más conversacional
   */
  private static makeConversational(text: string): string {
    let conversational = text;
    
    // Transformaciones para sonar más humano
    const transformations: Record<string, string> = {
      // Hacer preguntas más naturales
      '¿Desea': '¿Te gustaría',
      '¿Necesita': '¿Necesitas',
      '¿Quiere': '¿Quieres',
      
      // Usar lenguaje más cercano
      'usted puede': 'puedes',
      'usted tiene': 'tienes',
      
      // Conectores más naturales
      'Además,': 'También,',
      'Asimismo,': 'Y además,',
      'Por otro lado,': 'Por cierto,',
      
      // Evitar lenguaje formal excesivo
      'le informo que': 'te cuento que',
      'quisiera informarle': 'quiero contarte',
      'a su disposición': 'disponible para ti'
    };
    
    for (const [formal, natural] of Object.entries(transformations)) {
      const regex = new RegExp(formal, 'gi');
      conversational = conversational.replace(regex, natural);
    }
    
    return conversational;
  }
  
  /**
   * Agrega énfasis natural en puntos clave
   */
  private static addNaturalEmphasis(text: string): string {
    let emphasized = text;
    
    // Agregar énfasis a información importante
    const emphasisPatterns = [
      // Precios
      { 
        pattern: /(\$[\d,]+)\s*(COP|USD|EUR)/gi, 
        replacement: '💰 *$1* $2' 
      },
      
      // Beneficios clave
      {
        pattern: /(\bgratis\b|\bgratuito\b|\bincluido\b)/gi,
        replacement: '✅ *$1*'
      },
      
      // Urgencia
      {
        pattern: /(\boferta\b|\blimitado\b|\bhoy\b|\bahora\b)/gi,
        replacement: '🔥 *$1*'
      }
    ];
    
    for (const { pattern, replacement } of emphasisPatterns) {
      // Solo aplicar si no está ya enfatizado
      if (!emphasized.includes('*')) {
        emphasized = emphasized.replace(pattern, replacement);
      }
    }
    
    return emphasized;
  }
  
  /**
   * Remueve patrones que suenan robóticos
   */
  private static removeRoboticPatterns(text: string): string {
    let natural = text;
    
    // Patrones robóticos a evitar
    const roboticPatterns = [
      { pattern: /\bDebe\b/g, replacement: 'Puedes' },
      { pattern: /\bTiene que\b/g, replacement: 'Necesitas' },
      { pattern: /\bEs necesario\b/g, replacement: 'Te recomiendo' },
      { pattern: /\bSe requiere\b/g, replacement: 'Necesitas' },
      { pattern: /\bPor favor, tenga en cuenta\b/gi, replacement: 'Ten en cuenta' }
    ];
    
    for (const { pattern, replacement } of roboticPatterns) {
      natural = natural.replace(pattern, replacement);
    }
    
    return natural;
  }
  
  /**
   * Agrega una transición natural cuando el cliente se sale del contexto
   */
  static handleOffTopicTransition(userMessage: string, currentTopic?: string): string {
    const transitions = [
      `Entiendo tu pregunta 🤔, aunque es un tema diferente te ayudo con gusto.`,
      `Perfecto, cambiemos de tema 👍 déjame ayudarte con eso.`,
      `¡Claro! Con gusto te ayudo con eso también 😊`,
      `Entiendo, hablemos de eso 💬`
    ];
    
    const randomTransition = transitions[Math.floor(Math.random() * transitions.length)];
    
    if (currentTopic) {
      return `${randomTransition}\n\n(Nota: Estábamos hablando de "${currentTopic}", pero puedo ayudarte con lo que necesites 😊)\n\n`;
    }
    
    return `${randomTransition}\n\n`;
  }
  
  /**
   * Valida que la respuesta esté completa y tenga sentido
   */
  static validateResponse(response: string): { isValid: boolean; reason?: string } {
    // Verificar longitud mínima
    if (response.trim().length < 20) {
      return { isValid: false, reason: 'Respuesta demasiado corta' };
    }
    
    // Verificar que no sea solo emojis
    const textWithoutEmojis = response.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
    if (textWithoutEmojis.length < 10) {
      return { isValid: false, reason: 'Respuesta solo contiene emojis' };
    }
    
    // Verificar que tenga contenido útil (no solo saludos)
    const meaningfulWords = ['precio', 'producto', 'disponible', 'características', 'pago', 'envío'];
    const lowerResponse = response.toLowerCase();
    const hasMeaning = meaningfulWords.some(word => lowerResponse.includes(word));
    
    if (!hasMeaning && response.length < 100) {
      return { isValid: false, reason: 'Respuesta no contiene información útil' };
    }
    
    return { isValid: true };
  }
}

/**
 * Servicio de Simulación de Escritura Humana
 */
export class HumanTypingSimulator {
  
  /**
   * Calcula el tiempo de espera basado en la longitud del mensaje
   * para simular escritura humana realista
   */
  static calculateTypingDelay(messageLength: number): number {
    // Velocidad de escritura promedio: 40-60 palabras por minuto
    // ~ 200-300 caracteres por minuto
    // ~ 3-5 caracteres por segundo
    
    const charsPerSecond = 4; // Velocidad realista
    const baseDelay = (messageLength / charsPerSecond) * 1000; // en milisegundos
    
    // Agregar variación aleatoria del 20% para parecer más humano
    const variation = baseDelay * 0.2 * (Math.random() - 0.5);
    const totalDelay = baseDelay + variation;
    
    // Límites razonables
    const minDelay = 1000; // 1 segundo mínimo
    const maxDelay = 5000; // 5 segundos máximo
    
    return Math.max(minDelay, Math.min(maxDelay, totalDelay));
  }
  
  /**
   * Divide el mensaje en chunks para simular pausas naturales
   */
  static getTypingChunks(message: string): string[] {
    const sentences = message.split(/([.!?]\s+)/);
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (let i = 0; i < sentences.length; i++) {
      currentChunk += sentences[i];
      
      // Crear chunk cada 2-3 oraciones o al final
      if ((i + 1) % 3 === 0 || i === sentences.length - 1) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
      }
    }
    
    return chunks.length > 0 ? chunks : [message];
  }
}
