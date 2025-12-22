/**
 * 🎯 VALIDADOR DE RESPUESTAS MEJORADO
 * 
 * Asegura que las respuestas del bot sean lógicas y enfocadas:
 * - No enviar múltiples productos para preguntas específicas
 * - Mantener contexto coherente
 * - Validar relevancia de productos mencionados
 */

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  suggestions?: string[];
  confidence: number;
}

export interface MessageContext {
  currentProduct?: {
    id: string;
    name: string;
    price: number;
  };
  lastQuery?: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export class ResponseValidatorEnhanced {
  /**
   * Valida que la respuesta sea apropiada para la pregunta del usuario
   */
  static validateResponse(
    userMessage: string,
    botResponse: string,
    context?: MessageContext
  ): ValidationResult {
    console.log('[ResponseValidator] 🔍 Validando respuesta...');
    console.log(`[ResponseValidator] Usuario: "${userMessage}"`);
    console.log(`[ResponseValidator] Bot: "${botResponse.substring(0, 100)}..."`);

    // 1. Validar que no haya múltiples productos para preguntas específicas
    const isSpecificQuestion = this.isSpecificQuestion(userMessage, context);
    const productCount = this.countProductsInResponse(botResponse);

    if (isSpecificQuestion && productCount > 1) {
      console.log(`[ResponseValidator] ❌ Pregunta específica pero ${productCount} productos en respuesta`);
      return {
        isValid: false,
        reason: `Pregunta específica pero la respuesta menciona ${productCount} productos`,
        suggestions: [
          'Enfocarse solo en el producto que el usuario preguntó',
          'Eliminar menciones de otros productos'
        ],
        confidence: 0.3
      };
    }

    // 2. Validar relevancia de productos mencionados
    const relevanceCheck = this.validateProductRelevance(userMessage, botResponse, context);
    if (!relevanceCheck.isValid) {
      return relevanceCheck;
    }

    // 3. Validar que mantenga el contexto si hay producto actual
    if (context?.currentProduct) {
      const contextCheck = this.validateContextMaintenance(botResponse, context);
      if (!contextCheck.isValid) {
        return contextCheck;
      }
    }

    // 4. Validar lógica de ventas
    const salesLogicCheck = this.validateSalesLogic(userMessage, botResponse);
    if (!salesLogicCheck.isValid) {
      return salesLogicCheck;
    }

    console.log('[ResponseValidator] ✅ Respuesta válida');
    return {
      isValid: true,
      confidence: 0.95
    };
  }

  /**
   * Determina si la pregunta del usuario es específica (espera 1 producto) o general (puede recibir varios)
   */
  private static isSpecificQuestion(userMessage: string, context?: MessageContext): boolean {
    const lower = userMessage.toLowerCase().trim();

    // Indicadores de pregunta específica
    const specificIndicators = [
      // Preguntas sobre precio
      /cuánto cuesta/i,
      /cuál es el precio/i,
      /qué precio/i,
      /precio de/i,
      /vale/i,
      
      // Preguntas sobre producto específico
      /curso de [a-záéíóúñ]+/i,
      /megapack de [a-záéíóúñ]+/i,
      /laptop [a-záéíóúñ0-9]+/i,
      
      // Referencias al contexto
      /ese/i,
      /esa/i,
      /el que mencionaste/i,
      /del que hablamos/i,
      
      // Preguntas sobre características específicas
      /tiene foto/i,
      /tienes foto/i,
      /más información/i,
      /detalles de/i,
      /características de/i,
    ];

    // Si coincide con algún indicador específico
    if (specificIndicators.some(pattern => pattern.test(lower))) {
      console.log('[ResponseValidator] 🎯 Pregunta ESPECÍFICA detectada');
      return true;
    }

    // Si hay producto en contexto y la pregunta es corta (probablemente se refiere a ese producto)
    if (context?.currentProduct && lower.split(' ').length <= 5) {
      console.log('[ResponseValidator] 🎯 Pregunta corta con producto en contexto - ESPECÍFICA');
      return true;
    }

    // Indicadores de pregunta general
    const generalIndicators = [
      /qué.*tienes/i,
      /cuáles.*tienes/i,
      /qué.*vendes/i,
      /muéstrame/i,
      /opciones/i,
      /disponibles/i,
    ];

    if (generalIndicators.some(pattern => pattern.test(lower))) {
      console.log('[ResponseValidator] 📋 Pregunta GENERAL detectada');
      return false;
    }

    // Por defecto, si menciona un nombre específico, es específica
    const mentionsSpecificProduct = /curso|megapack|laptop|portátil|moto/.test(lower);
    const hasSpecificName = lower.split(' ').length >= 3 && mentionsSpecificProduct;
    
    console.log(`[ResponseValidator] ${hasSpecificName ? '🎯 ESPECÍFICA' : '📋 GENERAL'} (por defecto)`);
    return hasSpecificName;
  }

  /**
   * Cuenta cuántos productos diferentes se mencionan en la respuesta
   */
  private static countProductsInResponse(response: string): number {
    // Patrones que indican múltiples productos
    const multiProductPatterns = [
      /\d+\.\s+\*\*[^*]+\*\*/g, // "1. **Producto**"
      /\d+\)\s+[A-ZÁÉÍÓÚÑ]/g,    // "1) Producto"
      /[•●]\s+[A-ZÁÉÍÓÚÑ]/g,     // "• Producto"
    ];

    let maxCount = 0;
    for (const pattern of multiProductPatterns) {
      const matches = response.match(pattern);
      if (matches) {
        maxCount = Math.max(maxCount, matches.length);
      }
    }

    // Si encontramos patrones de lista, ese es el conteo
    if (maxCount > 0) {
      console.log(`[ResponseValidator] 📊 ${maxCount} productos detectados en lista`);
      return maxCount;
    }

    // Si no hay patrones de lista, buscar menciones de precios (cada precio = 1 producto)
    const priceMatches = response.match(/\$[\d,]+\s*COP/g);
    if (priceMatches && priceMatches.length > 1) {
      console.log(`[ResponseValidator] 📊 ${priceMatches.length} productos detectados por precios`);
      return priceMatches.length;
    }

    // Por defecto, asumir 1 producto
    console.log('[ResponseValidator] 📊 1 producto detectado');
    return 1;
  }

  /**
   * Valida que los productos mencionados sean relevantes a la pregunta
   */
  private static validateProductRelevance(
    userMessage: string,
    botResponse: string,
    context?: MessageContext
  ): ValidationResult {
    const lower = userMessage.toLowerCase();

    // Extraer términos clave del mensaje del usuario
    const userKeywords = this.extractKeywords(lower);
    const responseKeywords = this.extractKeywords(botResponse.toLowerCase());

    // Si el usuario menciona un producto específico, debe estar en la respuesta
    const specificProductMentioned = this.extractProductName(lower);
    if (specificProductMentioned) {
      const isInResponse = botResponse.toLowerCase().includes(specificProductMentioned);
      if (!isInResponse) {
        console.log(`[ResponseValidator] ❌ Producto "${specificProductMentioned}" no está en la respuesta`);
        return {
          isValid: false,
          reason: `Usuario preguntó por "${specificProductMentioned}" pero no está en la respuesta`,
          confidence: 0.2
        };
      }
    }

    // Verificar que haya overlap de keywords
    const overlap = userKeywords.filter(k => responseKeywords.includes(k));
    if (userKeywords.length > 0 && overlap.length === 0) {
      console.log('[ResponseValidator] ⚠️ Sin overlap de keywords entre pregunta y respuesta');
      return {
        isValid: false,
        reason: 'La respuesta no parece relacionada con la pregunta',
        confidence: 0.4
      };
    }

    return { isValid: true, confidence: 0.9 };
  }

  /**
   * Valida que se mantenga el contexto del producto actual
   */
  private static validateContextMaintenance(
    botResponse: string,
    context: MessageContext
  ): ValidationResult {
    if (!context.currentProduct) {
      return { isValid: true, confidence: 1.0 };
    }

    const currentProductName = context.currentProduct.name.toLowerCase();
    const responseHasCurrentProduct = botResponse.toLowerCase().includes(currentProductName);

    // Si hay producto en contexto, debería mencionarse en la respuesta
    // EXCEPCIÓN: Si es una pregunta general nueva, puede cambiar de producto
    if (!responseHasCurrentProduct) {
      console.log(`[ResponseValidator] ⚠️ Producto en contexto "${currentProductName}" no está en respuesta`);
      // No invalidar, solo advertir
    }

    return { isValid: true, confidence: 0.85 };
  }

  /**
   * Valida que la respuesta siga lógica de ventas
   */
  private static validateSalesLogic(
    userMessage: string,
    botResponse: string
  ): ValidationResult {
    const lower = userMessage.toLowerCase();

    // Si el usuario pregunta por precio, la respuesta DEBE incluir un precio
    if (/precio|costo|vale|cuánto/.test(lower)) {
      const hasPrice = /\$[\d,]+\s*COP/.test(botResponse);
      if (!hasPrice) {
        console.log('[ResponseValidator] ❌ Pregunta sobre precio pero respuesta no incluye precio');
        return {
          isValid: false,
          reason: 'Usuario preguntó por precio pero la respuesta no incluye precio',
          confidence: 0.3
        };
      }
    }

    // Si el usuario pregunta por métodos de pago, la respuesta DEBE incluir métodos
    if (/método|metodo|pago|pagar|cómo pago/.test(lower)) {
      const hasPaymentMethods = /mercadopago|paypal|nequi|daviplata|transferencia/i.test(botResponse);
      if (!hasPaymentMethods) {
        console.log('[ResponseValidator] ❌ Pregunta sobre pago pero respuesta no incluye métodos');
        return {
          isValid: false,
          reason: 'Usuario preguntó por métodos de pago pero la respuesta no los incluye',
          confidence: 0.3
        };
      }
    }

    return { isValid: true, confidence: 0.95 };
  }

  /**
   * Extrae keywords relevantes del texto
   */
  private static extractKeywords(text: string): string[] {
    const stopwords = ['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'para', 'con', 'y', 'o', 'que', 'es', 'por'];
    
    return text
      .toLowerCase()
      .replace(/[¿?¡!.,;:]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopwords.includes(word));
  }

  /**
   * Extrae el nombre de producto mencionado en el texto
   */
  private static extractProductName(text: string): string | null {
    // Patrones para extraer nombres de productos
    const patterns = [
      /curso\s+(?:de\s+|completo\s+de\s+)?([a-záéíóúñ\s]+)/i,
      /megapack\s+(?:de\s+)?([a-záéíóúñ\s]+)/i,
      /laptop\s+([a-záéíóúñ0-9\s]+)/i,
      /portátil\s+([a-záéíóúñ0-9\s]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Sugiere correcciones para una respuesta inválida
   */
  static suggestCorrections(
    userMessage: string,
    botResponse: string,
    validationResult: ValidationResult
  ): string {
    if (validationResult.isValid) {
      return botResponse;
    }

    console.log('[ResponseValidator] 🔧 Generando sugerencias de corrección...');

    // Si hay múltiples productos pero debería ser específico
    if (validationResult.reason?.includes('productos')) {
      const productName = this.extractProductName(userMessage.toLowerCase());
      if (productName) {
        return `Enfócate solo en: ${productName}`;
      }
    }

    return 'Respuesta necesita corrección manual';
  }
}
