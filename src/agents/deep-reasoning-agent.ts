/**
 * Deep Reasoning Agent
 * 
 * Agente de razonamiento profundo que analiza el contexto completo
 * de la conversación antes de permitir que el bot responda.
 * 
 * Funciones:
 * 1. Analizar el historial de conversación completo
 * 2. Identificar el producto/tema actual de discusión
 * 3. Detectar referencias implícitas (ej: "foto" = foto del producto mencionado)
 * 4. Prevenir respuestas por inercia o fuera de contexto
 * 5. Enriquecer el contexto para otros agentes
 */

import { ConversationContextService } from '@/lib/conversation-context-service';
import { SharedMemory, Product } from './shared-memory';

interface ReasoningResult {
  understood: boolean;
  contextSummary: string;
  currentProduct: Product | null;
  userIntent: {
    primary: string; // 'request_photo', 'ask_price', 'confirm_purchase', etc.
    confidence: number;
    implicitReference: boolean; // true si el usuario se refiere a algo mencionado antes
  };
  recommendations: {
    shouldSendPhoto: boolean;
    productId: string | null;
    shouldAskClarification: boolean;
    clarificationNeeded: string | null;
  };
  reasoning: string; // Explicación del razonamiento
  suggestedAgent: string; // Agente sugerido para manejar esta intención
}

export class DeepReasoningAgent {
  /**
   * Analiza profundamente el contexto de la conversación
   */
  static async analyzeContext(
    chatId: string,
    currentMessage: string,
    memory: SharedMemory,
    interpretation?: any // Interpretación del InterpreterAgent
  ): Promise<ReasoningResult> {
    console.log('\n🧠 [DEEP REASONING] Iniciando análisis profundo...');
    console.log(`📱 Chat: ${chatId}`);
    console.log(`💬 Mensaje: "${currentMessage}"`);
    
    // 0. Si hay interpretación previa, usarla
    if (interpretation) {
      console.log('🔍 [REASONING] Usando interpretación previa:');
      console.log(`   Intent: ${interpretation.intent}`);
      console.log(`   Type: ${interpretation.details.type}`);
      console.log(`   Clarification: ${interpretation.details.clarification}`);
    }

    // 1. Obtener contexto de conversación
    const conversationContext = ConversationContextService.getProductContext(chatId);
    
    // 2. Identificar el producto actual en discusión
    const currentProduct = this.identifyCurrentProduct(memory, conversationContext);
    
    // 3. Analizar la intención del usuario con contexto E INTERPRETACIÓN
    const userIntent = this.analyzeUserIntent(
      currentMessage, 
      memory, 
      currentProduct,
      interpretation // Pasar interpretación
    );
    
    // 4. Generar recomendaciones basadas en el razonamiento
    const recommendations = this.generateRecommendations(userIntent, currentProduct);
    
    // 5. Crear resumen del contexto
    const contextSummary = this.createContextSummary(memory, currentProduct);
    
    // 6. Explicar el razonamiento
    const reasoning = this.explainReasoning(currentMessage, currentProduct, userIntent);

    // 7. Determinar el agente sugerido basado en la intención
    const suggestedAgent = this.selectAgent(userIntent.primary, currentProduct);

    const result: ReasoningResult = {
      understood: userIntent.confidence > 0.6,
      contextSummary,
      currentProduct,
      userIntent,
      recommendations,
      reasoning,
      suggestedAgent
    };

    console.log('\n🎯 [REASONING RESULT]');
    console.log(`✅ Entendido: ${result.understood}`);
    console.log(`🎯 Intención: ${result.userIntent.primary} (${(result.userIntent.confidence * 100).toFixed(0)}%)`);
    console.log(`📦 Producto actual: ${currentProduct?.name || 'Ninguno'}`);
    console.log(`🤖 Agente sugerido: ${suggestedAgent}`);
    console.log(`💡 Razonamiento: ${reasoning}`);
    console.log(`📋 Recomendaciones:`, recommendations);
    console.log('\n🧠 ========================================\n');

    return result;
  }

  /**
   * Identifica el producto actual en discusión
   */
  private static identifyCurrentProduct(
    memory: SharedMemory,
    conversationContext: any
  ): Product | null {
    // 1. Primero verificar si hay producto en la memoria compartida
    if (memory.currentProduct) {
      console.log(`🔍 Producto en memoria: ${memory.currentProduct.name}`);
      return memory.currentProduct;
    }

    // 2. Verificar productos interesados
    if (memory.interestedProducts && memory.interestedProducts.length > 0) {
      const lastProduct = memory.interestedProducts[memory.interestedProducts.length - 1];
      console.log(`🔍 Último producto interesado: ${lastProduct.name}`);
      return lastProduct;
    }

    // 3. Verificar contexto de conversación
    if (conversationContext && conversationContext.lastProductId) {
      console.log(`🔍 Producto en contexto de conversación: ${conversationContext.lastProductName}`);
      return {
        id: conversationContext.lastProductId,
        name: conversationContext.lastProductName,
        price: conversationContext.productDetails?.price || 0,
        category: conversationContext.productDetails?.category || 'general',
      };
    }

    // 4. Buscar en el historial de mensajes
    const recentBotMessages = memory.messages
      .filter(msg => msg.role === 'assistant')
      .slice(-5);

    for (const message of recentBotMessages.reverse()) {
      const content = message.content.toLowerCase();

      // 🔥 CORRECCIÓN: Patrones más robustos para identificar productos
      const productPatterns = [
        // Patrones principales
        /encontré el (.+?)(?:\n|$)/i,
        /perfecto.*?encontré el (.+?)(?:\n|$)/i,
        /te presento el (.+?)(?:\n|$)/i,
        /te cuento sobre el (.+?)(?:\n|$)/i,
        /este es el (.+?)(?:\n|$)/i,

        // Patrones de productos específicos
        /smartwatch (.+?)(?:\n|$)/i,
        /mega pack \d+: (.+?)(?:\n|$)/i,
        /curso de (.+?)(?:\n|$)/i,
        /curso completo de (.+?)(?:\n|$)/i,
        // Patrones específicos de productos (capturan nombre completo)
        /curso\s+(?:de\s+|completo\s+de\s+)?(.+?)(?:\n|$)/i,  // "curso de piano", "curso completo de piano"
        /mega\s*pack\s+(.+?)(?:\n|$)/i,  // "mega pack diseño"
        /portátil\s+(.+?)(?:\n|$)/i,
        /laptop\s+(.+?)(?:\n|$)/i,
        /computador\s+(.+?)(?:\n|$)/i,
        /moto\s+(.+?)(?:\n|$)/i,
        /motocicleta\s+(.+?)(?:\n|$)/i,

        // Patrones de listas numeradas
        /\d+\.\s*\*\*(.+?)\*\*/i,  // "1. **Producto**"
        /\d+\.\s*(.+?)(?:\n|$)/i,  // "1. Producto"

        // Patrones generales
        /\*\*(.+?)\*\*/i,  // Texto en negrita
        /💻\s*(.+?)(?:\n|$)/i,  // Con emoji de laptop
        /🏍️\s*(.+?)(?:\n|$)/i,  // Con emoji de moto
        /💎\s*(.+?)(?:\n|$)/i,  // Con emoji de cursos
        /🎹\s*(.+?)(?:\n|$)/i,  // Con emoji de piano
      ];

      for (const pattern of productPatterns) {
        const match = content.match(pattern);
        if (match) {
          let productName = match[1].trim();

          // Limpiar el nombre extraído
          productName = this.cleanExtractedProductName(productName);

          if (productName && productName.length > 3) {
            console.log(`🔍 Producto identificado en historial: "${productName}"`);

            // Retornar producto básico (será enriquecido después)
            return {
              id: 'temp-' + Date.now(),
              name: productName,
              price: 0,
              category: 'general',
            };
          }
        }
      }
    }

    console.log('❌ No se identificó producto en contexto');
    return null;
  }

  /**
   * Analiza la intención del usuario considerando el contexto
   */
  private static analyzeUserIntent(
    message: string,
    memory: SharedMemory,
    currentProduct: Product | null,
    interpretation?: any // Interpretación del InterpreterAgent
  ): {
    primary: string;
    confidence: number;
    implicitReference: boolean;
  } {
    const lowerMessage = message.toLowerCase().trim();
    
    // 🔍 Si hay interpretación previa, usarla con prioridad
    if (interpretation) {
      console.log('🔍 [REASONING] Usando interpretación para determinar intención');
      
      // Mapear intent de interpretación a intención de razonamiento
      const intentMap: { [key: string]: string } = {
        'browse_category': 'browse_products',
        'specific_product': 'search_specific_product',
        'specific_payment_method': 'request_payment_method',
        'payment_options': 'request_payment_info',
        'product_details': 'request_product_info',
        'budget_search': 'search_by_budget',
        'check_availability': 'check_stock',
        'compare_products': 'compare_options'
      };
      
      const mappedIntent = intentMap[interpretation.intent] || interpretation.intent;
      
      return {
        primary: mappedIntent,
        confidence: interpretation.confidence,
        implicitReference: interpretation.details.needsOptions || false
      };
    }

    // Detectar referencias implícitas a fotos
    if (this.isPhotoRequest(lowerMessage)) {
      if (currentProduct) {
        // El usuario está pidiendo la foto del producto actual
        return {
          primary: 'request_photo_current_product',
          confidence: 0.95,
          implicitReference: true
        };
      } else {
        // No hay contexto de producto, necesita clarificación
        return {
          primary: 'request_photo_unclear',
          confidence: 0.7,
          implicitReference: false
        };
      }
    }

    // Detectar solicitud de precio
    if (this.isPriceRequest(lowerMessage)) {
      if (currentProduct) {
        return {
          primary: 'request_price_current_product',
          confidence: 0.95,
          implicitReference: true
        };
      } else {
        return {
          primary: 'request_price_unclear',
          confidence: 0.7,
          implicitReference: false
        };
      }
    }

    // Detectar confirmación de compra
    if (this.isPurchaseConfirmation(lowerMessage)) {
      if (currentProduct) {
        return {
          primary: 'confirm_purchase',
          confidence: 0.9,
          implicitReference: true
        };
      } else {
        return {
          primary: 'purchase_unclear',
          confidence: 0.6,
          implicitReference: false
        };
      }
    }

    // Detectar solicitud de métodos de pago
    if (this.isPaymentMethodRequest(lowerMessage)) {
      return {
        primary: 'request_payment_method',
        confidence: 0.95,
        implicitReference: currentProduct ? true : false
      };
    }

    // Detectar solicitud de más información
    if (this.isMoreInfoRequest(lowerMessage)) {
      if (currentProduct) {
        return {
          primary: 'request_more_info',
          confidence: 0.85,
          implicitReference: true
        };
      } else {
        return {
          primary: 'general_inquiry',
          confidence: 0.7,
          implicitReference: false
        };
      }
    }

    // Detectar búsqueda de producto nuevo
    if (this.isProductSearch(lowerMessage)) {
      return {
        primary: 'search_product',
        confidence: 0.8,
        implicitReference: false
      };
    }

    // Detectar saludo
    if (this.isGreeting(lowerMessage)) {
      return {
        primary: 'greeting',
        confidence: 0.9,
        implicitReference: false
      };
    }

    // Detectar confirmación de pago pendiente
    if (this.isPendingPaymentConfirmation(lowerMessage)) {
      return {
        primary: 'pending_payment_confirmation',
        confidence: 0.95,
        implicitReference: true
      };
    }

    // Detectar agradecimiento/despedida
    if (this.isFarewell(lowerMessage)) {
      return {
        primary: 'farewell',
        confidence: 0.9,
        implicitReference: false
      };
    }

    // Intención no clara
    return {
      primary: 'unclear',
      confidence: 0.3,
      implicitReference: false
    };
  }

  /**
   * Genera recomendaciones basadas en el razonamiento
   */
  private static generateRecommendations(
    userIntent: any,
    currentProduct: Product | null
  ): {
    shouldSendPhoto: boolean;
    productId: string | null;
    shouldAskClarification: boolean;
    clarificationNeeded: string | null;
  } {
    const recommendations = {
      shouldSendPhoto: false,
      productId: null as string | null,
      shouldAskClarification: false,
      clarificationNeeded: null as string | null
    };

    switch (userIntent.primary) {
      case 'request_photo_current_product':
        recommendations.shouldSendPhoto = true;
        recommendations.productId = currentProduct?.id || null;
        break;

      case 'request_photo_unclear':
        recommendations.shouldAskClarification = true;
        recommendations.clarificationNeeded = '¿De qué producto te gustaría ver la foto?';
        break;

      case 'request_price_current_product':
        // El precio ya debería estar en el contexto, solo confirmar
        recommendations.productId = currentProduct?.id || null;
        break;

      case 'confirm_purchase':
        recommendations.productId = currentProduct?.id || null;
        break;

      case 'request_more_info':
        recommendations.productId = currentProduct?.id || null;
        break;

      case 'purchase_unclear':
      case 'request_price_unclear':
        recommendations.shouldAskClarification = true;
        recommendations.clarificationNeeded = '¿Sobre qué producto te gustaría saber más?';
        break;
    }

    return recommendations;
  }

  /**
   * Crea un resumen del contexto para otros agentes
   */
  private static createContextSummary(
    memory: SharedMemory,
    currentProduct: Product | null
  ): string {
    const recentMessages = memory.messages.slice(-5);
    const summary = recentMessages
      .map(msg => `${msg.role === 'user' ? 'Cliente' : 'Bot'}: ${msg.content.substring(0, 100)}`)
      .join('\n');

    if (currentProduct) {
      return `Producto en discusión: ${currentProduct.name}\n\nÚltimos mensajes:\n${summary}`;
    }

    return `Sin producto específico en discusión.\n\nÚltimos mensajes:\n${summary}`;
  }

  /**
   * Explica el razonamiento realizado
   */
  private static explainReasoning(
    message: string,
    currentProduct: Product | null,
    userIntent: any
  ): string {
    if (userIntent.primary === 'request_photo_current_product') {
      return `El cliente preguntó "${message}". En el contexto reciente se mencionó "${currentProduct?.name}". Por lo tanto, el cliente está pidiendo la foto de ese producto específico, no buscando cursos de fotografía.`;
    }

    if (userIntent.primary === 'request_photo_unclear') {
      return `El cliente preguntó por una foto pero no hay un producto específico en el contexto reciente. Se necesita clarificación.`;
    }

    if (userIntent.implicitReference && currentProduct) {
      return `El cliente se refiere implícitamente a "${currentProduct.name}" que fue mencionado recientemente en la conversación.`;
    }

    return `Analizando el mensaje "${message}" sin contexto de producto específico.`;
  }

  // ============================================
  // Métodos auxiliares de detección
  // ============================================

  private static isPhotoRequest(message: string): boolean {
    const photoKeywords = [
      'foto', 'fotos', 'imagen', 'imagenes', 'picture', 'pic',
      'tienes foto', 'tiene foto', 'ver foto', 'muestra foto',
      'envía foto', 'envia foto', 'manda foto', 'pasa foto',
      'como se ve', 'cómo se ve', 'como es', 'cómo es'
    ];
    return photoKeywords.some(keyword => message.includes(keyword));
  }

  private static isPriceRequest(message: string): boolean {
    const priceKeywords = [
      'precio', 'costo', 'vale', 'valor', 'cuanto cuesta',
      'cuánto cuesta', 'cuanto vale', 'cuánto vale',
      'cuanto es', 'cuánto es', 'que precio', 'qué precio'
    ];
    return priceKeywords.some(keyword => message.includes(keyword));
  }

  private static isPurchaseConfirmation(message: string): boolean {
    const purchaseKeywords = [
      'comprar', 'comprarlo', 'lo compro', 'lo quiero',
      'me interesa', 'lo llevo', 'dame', 'quiero',
      'confirmar', 'confirmo', 'si lo quiero', 'sí lo quiero'
    ];
    return purchaseKeywords.some(keyword => message.includes(keyword));
  }

  private static isPaymentMethodRequest(message: string): boolean {
    const paymentMethodKeywords = [
      'pagar por', 'pago por', 'quiero pagar',
      'como pago', 'cómo pago', 'metodos de pago', 'métodos de pago',
      'formas de pago', 'opciones de pago',
      'transferencia', 'nequi', 'daviplata', 'efectivo',
      'mercadopago', 'paypal', 'tarjeta', 'contraentrega'
    ];
    return paymentMethodKeywords.some(keyword => message.includes(keyword));
  }

  private static isMoreInfoRequest(message: string): boolean {
    const infoKeywords = [
      'más información', 'mas informacion', 'más info', 'mas info',
      'detalles', 'características', 'especificaciones',
      'dime más', 'cuéntame más', 'que más', 'qué más'
    ];
    return infoKeywords.some(keyword => message.includes(keyword));
  }

  private static isProductSearch(message: string): boolean {
    const searchKeywords = [
      'busco', 'necesito', 'quiero', 'tienes', 'tienen',
      'venden', 'hay', 'existe', 'me interesa'
    ];
    const productKeywords = [
      'laptop', 'portátil', 'computador', 'pc', 'moto',
      'curso', 'megapack', 'smartwatch', 'reloj'
    ];
    
    const hasSearchKeyword = searchKeywords.some(k => message.includes(k));
    const hasProductKeyword = productKeywords.some(k => message.includes(k));
    
    return hasSearchKeyword && hasProductKeyword;
  }

  private static isGreeting(message: string): boolean {
    const greetings = [
      'hola', 'buenos días', 'buenas tardes', 'buenas noches',
      'buen día', 'saludos', 'hey', 'holi', 'ola'
    ];
    return greetings.some(g => message.includes(g));
  }

  private static isPendingPaymentConfirmation(message: string): boolean {
    const pendingPatterns = [
      'luego te envio', 'luego te mando', 'luego te paso',
      'despues te envio', 'despues te mando', 'despues te paso',
      'más tarde te envio', 'mas tarde te envio',
      'ahorita te envio', 'ya te envio', 'te envio el comprobante',
      'te mando el comprobante', 'te paso el comprobante',
      'voy a pagar', 'voy a hacer el pago', 'voy a transferir',
      'dame un momento', 'espera un momento', 'dame unos minutos'
    ];
    return pendingPatterns.some(p => message.includes(p));
  }

  private static isFarewell(message: string): boolean {
    const farewells = [
      'gracias', 'muchas gracias', 'ok gracias', 'perfecto gracias',
      'entendido', 'ok', 'vale', 'perfecto', 'listo',
      'adios', 'adiós', 'chao', 'hasta luego', 'nos vemos',
      'bye', 'hasta pronto'
    ];
    return farewells.some(f => message.includes(f));
  }

  /**
   * Selecciona el agente apropiado basado en la intención
   */
  private static selectAgent(intent: string, currentProduct: Product | null): string {
    // Mapeo de intenciones a agentes
    const intentToAgent: { [key: string]: string } = {
      // Saludos
      'greeting': 'greeting',
      
      // Búsqueda de productos
      'search_product': 'search',
      'browse_products': 'search',
      'search_specific_product': 'search',
      'search_by_budget': 'search',
      
      // Información de producto
      'request_more_info': 'product',
      'request_price_current_product': 'product',
      'request_product_info': 'product',
      'check_stock': 'product',
      'compare_options': 'product',
      
      // Fotos
      'request_photo_current_product': 'photo',
      'request_photo_unclear': 'photo',
      
      // Pagos
      'confirm_purchase': 'payment',
      'request_payment_info': 'payment',
      'request_payment_method': 'payment',
      'pending_payment_confirmation': 'closing',
      
      // Cierre
      'farewell': 'closing',
      'thank_you': 'closing',
    };

    // Si la intención está mapeada, usar ese agente
    if (intentToAgent[intent]) {
      return intentToAgent[intent];
    }

    // Si no está claro pero hay producto en contexto, ir a product
    if (currentProduct && intent.includes('unclear')) {
      return 'product';
    }

    // Por defecto, ir a search
    return 'search';
  }

  private static extractProductNameFromLine(line: string): string | null {
    // Remover emojis y caracteres especiales
    const cleaned = line.replace(/[✅💰📦🎯🔥⚡]/g, '').trim();

    // Si la línea tiene más de 5 palabras, probablemente no es un nombre de producto
    const words = cleaned.split(' ');
    if (words.length > 10 || words.length < 2) return null;

    return cleaned;
  }

  /**
   * Limpia el nombre de producto extraído de los patrones
   */
  private static cleanExtractedProductName(productName: string): string {
    let cleaned = productName;

    // 🔪 CORTAR en signos de interrogación o puntos (evita incluir preguntas)
    cleaned = cleaned.split(/[?¿]/)[0].trim();

    // Remover caracteres especiales y emojis
    cleaned = cleaned.replace(/[✅💰📦🎯🔥⚡💻🏍️💎🎹📱⭐🟢✨👉•\*\*"]/g, '').trim();

    // Remover números al inicio (como "1. " o "03 ")
    cleaned = cleaned.replace(/^\d+\.\s*/, '').trim();

    // Remover comillas y paréntesis
    cleaned = cleaned.replace(/["'()]/g, '').trim();

    // Remover palabras de relleno al inicio
    cleaned = cleaned.replace(/^(el|la|los|las|un|una)\s+/i, '').trim();

    // Si queda muy corto o muy largo, probablemente no es válido
    if (cleaned.length < 3 || cleaned.length > 80) {
      return '';
    }

    return cleaned;
  }
}
