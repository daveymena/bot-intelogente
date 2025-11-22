/**
 * Contextual Brain - Sistema de Razonamiento Contextual
 * 
 * Piensa como un humano, usando el contexto de la conversación
 * para entender lo que el usuario REALMENTE necesita.
 * 
 * NO usa sistema de puntos, usa LÓGICA y CONTEXTO.
 */

import { Product } from '@/agents/shared-memory';

export interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  products?: Product[];
}

export interface ConversationContext {
  lastProductsShown: Product[];
  lastBotAction: 'show_products' | 'answer_question' | 'greeting' | 'other';
  userLastIntent: string;
  conversationStage: 'initial' | 'product_exploration' | 'product_detail' | 'closing';
}

export interface ReasoningResult {
  understood: boolean;
  type: 'reference_to_context' | 'usage_question' | 'new_search' | 'unclear';
  confidence: number;
  
  // Para referencias al contexto
  referencedProducts?: Product[];
  
  // Para preguntas de uso
  useCase?: string;
  currentProduct?: Product;
  
  // Para búsquedas nuevas
  searchQuery?: string;
  searchType?: 'exact' | 'category' | 'brand';
  
  // Explicación del razonamiento
  reasoning: string;
}

export class ContextualBrain {
  /**
   * Procesa un mensaje usando razonamiento contextual
   */
  static async processMessage(params: {
    message: string;
    chatId: string;
    conversationHistory: Message[];
    currentProduct?: Product;
  }): Promise<ReasoningResult> {
    const { message, conversationHistory, currentProduct } = params;
    
    console.log('\n🧠 [CONTEXTUAL BRAIN] Iniciando razonamiento...');
    console.log(`💬 Mensaje: "${message}"`);
    
    const lowerMessage = message.toLowerCase().trim();
    
    // 1. Detectar referencias a mensajes anteriores
    if (this.isReferenceToContext(lowerMessage)) {
      console.log('🔍 [BRAIN] Detectada referencia al contexto');
      return this.handleContextReference(lowerMessage, conversationHistory, currentProduct);
    }
    
    // 2. Detectar preguntas sobre uso/aplicación
    if (currentProduct && this.isUsageQuestion(lowerMessage)) {
      console.log('🎯 [BRAIN] Detectada pregunta sobre uso');
      return this.handleUsageQuestion(lowerMessage, currentProduct);
    }
    
    // 3. Detectar búsqueda nueva explícita
    if (this.isNewSearch(lowerMessage)) {
      console.log('🔎 [BRAIN] Detectada búsqueda nueva');
      return this.handleNewSearch(lowerMessage);
    }
    
    // 4. No está claro
    console.log('❓ [BRAIN] Intención no clara');
    return {
      understood: false,
      type: 'unclear',
      confidence: 0.3,
      reasoning: 'No se pudo determinar la intención con el contexto disponible'
    };
  }
  
  /**
   * Detecta si el mensaje hace referencia al contexto anterior
   */
  private static isReferenceToContext(message: string): boolean {
    const referencePatterns = [
      'recomendaste', 'dijiste', 'mostraste', 'mencionaste',
      'que me', 'cual me', 'el que', 'la que',
      'ese', 'esa', 'esos', 'esas',
      'el primero', 'el segundo', 'la primera'
    ];
    
    return referencePatterns.some(pattern => message.includes(pattern));
  }
  
  /**
   * Detecta si es una pregunta sobre uso/aplicación
   */
  private static isUsageQuestion(message: string): boolean {
    const usagePatterns = [
      'sirve para', 'funciona para', 'se puede usar para',
      'para', 'de', 'en',
      'estudio', 'trabajo', 'gaming', 'juegos',
      'diseño', 'edicion', 'video', 'programacion'
    ];
    
    return usagePatterns.some(pattern => message.includes(pattern));
  }
  
  /**
   * Detecta si es una búsqueda nueva
   */
  private static isNewSearch(message: string): boolean {
    const searchPatterns = [
      'busco', 'necesito', 'quiero ver', 'muestrame',
      'tienes', 'tienen', 'hay', 'venden',
      'otro', 'otra', 'diferente'
    ];
    
    const productKeywords = [
      'laptop', 'portatil', 'computador', 'pc',
      'moto', 'motocicleta',
      'curso', 'megapack'
    ];
    
    const hasSearch = searchPatterns.some(p => message.includes(p));
    const hasProduct = productKeywords.some(p => message.includes(p));
    
    return hasSearch && hasProduct;
  }
  
  /**
   * Maneja referencias al contexto anterior
   */
  private static handleContextReference(
    message: string,
    history: Message[],
    currentProduct?: Product
  ): ReasoningResult {
    // Buscar productos mencionados en los últimos 3 mensajes del bot
    const recentBotMessages = history
      .filter(m => m.role === 'bot')
      .slice(-3);
    
    let referencedProducts: Product[] = [];
    
    for (const botMsg of recentBotMessages) {
      if (botMsg.products && botMsg.products.length > 0) {
        referencedProducts = botMsg.products;
        break;
      }
    }
    
    // Si encontró productos en el contexto
    if (referencedProducts.length > 0) {
      // Verificar si también es pregunta de uso
      const useCase = this.extractUseCase(message);
      
      if (useCase) {
        return {
          understood: true,
          type: 'usage_question',
          confidence: 0.95,
          referencedProducts,
          useCase,
          currentProduct: referencedProducts[0],
          reasoning: `Usuario pregunta si los productos que mostré sirven para "${useCase}"`
        };
      }
      
      return {
        understood: true,
        type: 'reference_to_context',
        confidence: 0.9,
        referencedProducts,
        reasoning: 'Usuario se refiere a productos que mostré anteriormente'
      };
    }
    
    // Si hay producto actual
    if (currentProduct) {
      const useCase = this.extractUseCase(message);
      
      return {
        understood: true,
        type: 'usage_question',
        confidence: 0.85,
        currentProduct,
        useCase,
        reasoning: `Usuario pregunta sobre el producto actual${useCase ? ` para "${useCase}"` : ''}`
      };
    }
    
    return {
      understood: false,
      type: 'unclear',
      confidence: 0.4,
      reasoning: 'Referencia al contexto pero no encontré productos mencionados'
    };
  }
  
  /**
   * Maneja preguntas sobre uso
   */
  private static handleUsageQuestion(
    message: string,
    currentProduct: Product
  ): ReasoningResult {
    const useCase = this.extractUseCase(message);
    
    return {
      understood: true,
      type: 'usage_question',
      confidence: 0.9,
      currentProduct,
      useCase,
      reasoning: `Usuario pregunta si "${currentProduct.name}" sirve para "${useCase}"`
    };
  }
  
  /**
   * Maneja búsquedas nuevas
   */
  private static handleNewSearch(message: string): ReasoningResult {
    // Detectar tipo de búsqueda
    const brands = ['asus', 'hp', 'dell', 'lenovo', 'acer', 'yamaha', 'bajaj'];
    const hasBrand = brands.some(b => message.includes(b));
    
    const categories = ['laptop', 'portatil', 'moto', 'curso', 'megapack'];
    const hasCategory = categories.some(c => message.includes(c));
    
    let searchType: 'exact' | 'category' | 'brand' = 'category';
    
    if (hasBrand) {
      searchType = 'brand';
    }
    
    return {
      understood: true,
      type: 'new_search',
      confidence: 0.85,
      searchQuery: message,
      searchType,
      reasoning: `Usuario busca productos nuevos (tipo: ${searchType})`
    };
  }
  
  /**
   * Extrae el caso de uso del mensaje
   */
  private static extractUseCase(message: string): string | undefined {
    const useCases = [
      'estudio', 'trabajo', 'gaming', 'juegos',
      'diseño', 'edicion', 'video', 'programacion',
      'oficina', 'casa', 'universidad'
    ];
    
    for (const useCase of useCases) {
      if (message.includes(useCase)) {
        return useCase;
      }
    }
    
    return undefined;
  }
}
