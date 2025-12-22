/**
 * Super Sales AI - IA Conversacional con Capacidades de Ventas
 * 
 * Este sistema permite al bot:
 * 1. Conversar libremente sobre cualquier tema
 * 2. Mantener contexto de productos mientras habla de otras cosas
 * 3. Traer al cliente de vuelta a la venta naturalmente
 * 4. Enviar fotos automáticamente cuando menciona productos
 */

import { OllamaProfessionalOrchestrator as OllamaOrchestratorProfessional } from './ollama-orchestrator-professional';
import { ContextMemoryEnhanced } from './context-memory-enhanced';
import { db } from './db';

interface ConversationState {
  hasActiveProduct: boolean;
  productId?: string;
  productName?: string;
  conversationStage: 'casual' | 'product_interest' | 'negotiation' | 'closing';
  lastProductMention: Date | null;
  casualTopicCount: number; // Cuántos mensajes casuales seguidos
}

export class SuperSalesAI {
  /**
   * Procesa mensaje con inteligencia conversacional completa
   */
  static async processMessage(
    botUserId: string,
    userId: string,
    message: string,
    context: any
  ): Promise<{
    response: string;
    shouldSendPhotos: boolean;
    photos?: Array<{ url: string; caption?: string }>;
    salesAction?: 'show_product' | 'send_payment' | 'follow_up' | 'none';
  }> {
    // 1. Obtener estado de conversación
    const state = await this.getConversationState(botUserId, userId);
    
    // 2. Analizar el mensaje con Ollama
    const analysis = await this.analyzeMessage(message, state, context);
    
    console.log('[SuperSalesAI] 🧠 Análisis:', analysis);
    
    // 3. Decidir estrategia de respuesta
    if (analysis.isProductQuery) {
      // Consulta sobre productos - Respuesta directa con fotos
      return await this.handleProductQuery(botUserId, userId, message, analysis, context);
    } else if (analysis.isCasualConversation) {
      // Conversación casual - Responder libremente pero mantener contexto de venta
      return await this.handleCasualConversation(botUserId, userId, message, state, analysis, context);
    } else if (analysis.isPurchaseIntent) {
      // Intención de compra - Cerrar venta
      return await this.handlePurchaseIntent(botUserId, userId, message, state, context);
    } else {
      // Consulta general - Responder con inteligencia
      return await this.handleGeneralQuery(botUserId, userId, message, state, context);
    }
  }

  /**
   * Analiza el mensaje para entender intención y contexto
   */
  private static async analyzeMessage(
    message: string,
    state: ConversationState,
    context: any
  ): Promise<{
    isProductQuery: boolean;
    isCasualConversation: boolean;
    isPurchaseIntent: boolean;
    isGeneralQuery: boolean;
    topic: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    shouldReturnToSales: boolean;
  }> {
    const messageLower = message.toLowerCase();
    
    // Detectar consulta de productos
    const productKeywords = [
      'producto', 'precio', 'costo', 'vale', 'vender', 'comprar',
      'laptop', 'portátil', 'curso', 'moto', 'computador',
      'disponible', 'stock', 'tienes', 'vendes', 'ofreces'
    ];
    const isProductQuery = productKeywords.some(k => messageLower.includes(k));
    
    // Detectar intención de compra
    const purchaseKeywords = [
      'comprar', 'adquirir', 'pagar', 'método de pago', 'link',
      'quiero', 'me interesa', 'lo llevo', 'cómo pago'
    ];
    const isPurchaseIntent = purchaseKeywords.some(k => messageLower.includes(k));
    
    // Detectar conversación casual
    const casualKeywords = [
      'hola', 'buenos días', 'buenas tardes', 'cómo estás',
      'qué tal', 'clima', 'tiempo', 'día', 'gracias',
      'chiste', 'historia', 'cuéntame', 'sabes'
    ];
    const isCasualConversation = casualKeywords.some(k => messageLower.includes(k)) && !isProductQuery;
    
    // Decidir si debe retornar a ventas
    const shouldReturnToSales = 
      state.hasActiveProduct && 
      state.casualTopicCount >= 2 && // Después de 2 mensajes casuales
      !isProductQuery &&
      !isPurchaseIntent;
    
    return {
      isProductQuery,
      isCasualConversation,
      isPurchaseIntent,
      isGeneralQuery: !isProductQuery && !isCasualConversation && !isPurchaseIntent,
      topic: this.extractTopic(message),
      sentiment: this.detectSentiment(message),
      shouldReturnToSales
    };
  }

  /**
   * Maneja consultas sobre productos
   */
  private static async handleProductQuery(
    botUserId: string,
    userId: string,
    message: string,
    analysis: any,
    context: any
  ): Promise<any> {
    console.log('[SuperSalesAI] 📦 Manejando consulta de producto');
    
    // Buscar producto con búsqueda semántica
    const { semanticProductSearch } = await import('./semantic-product-search');
    const result = await semanticProductSearch(message, context.historialMensajes?.slice(-5).join('\n'));
    
    if (!result || !result.product) {
      return {
        response: 'No encontré ese producto específico. ¿Podrías darme más detalles sobre lo que buscas? 🤔',
        shouldSendPhotos: false,
        salesAction: 'none'
      };
    }
    
    const product = result.product;
    
    // Guardar en contexto mejorado
    await ContextMemoryEnhanced.saveProductContext(
      botUserId,
      userId,
      product.id,
      product.name,
      product.price,
      product.category
    );
    
    // Generar respuesta con Ollama
    const prompt = `Eres un vendedor experto. Un cliente pregunta sobre este producto:

PRODUCTO:
- Nombre: ${product.name}
- Precio: $${product.price.toLocaleString('es-CO')} COP
- Descripción: ${product.description || 'Producto de alta calidad'}
- Categoría: ${product.category}

MENSAJE DEL CLIENTE: "${message}"

INSTRUCCIONES:
1. Responde de forma natural y entusiasta
2. Destaca los beneficios del producto (no solo características)
3. Crea urgencia sutil (stock limitado, oferta especial)
4. Termina con una pregunta que invite a comprar
5. Usa emojis apropiados
6. Máximo 4 líneas

RESPUESTA:`;

    const response = await OllamaOrchestratorProfessional.processMessage(
      prompt,
      userId,
      []
    );
    
    // Preparar fotos
    const photos = this.getProductPhotos(product);
    
    return {
      response: response.message,
      shouldSendPhotos: photos.length > 0,
      photos: photos,
      salesAction: 'show_product'
    };
  }

  /**
   * Maneja conversación casual manteniendo contexto de venta
   */
  private static async handleCasualConversation(
    botUserId: string,
    userId: string,
    message: string,
    state: ConversationState,
    analysis: any,
    context: any
  ): Promise<any> {
    console.log('[SuperSalesAI] 💬 Manejando conversación casual');
    
    // Incrementar contador de mensajes casuales
    state.casualTopicCount++;
    
    let prompt = '';
    
    if (analysis.shouldReturnToSales && state.productName) {
      // Responder al tema casual PERO traer de vuelta a la venta
      prompt = `Eres un vendedor carismático conversando con un cliente.

CONTEXTO:
- El cliente está interesado en: ${state.productName}
- Ahora habla de: ${analysis.topic}
- Has conversado ${state.casualTopicCount} mensajes sobre otros temas

MENSAJE DEL CLIENTE: "${message}"

INSTRUCCIONES:
1. Responde brevemente al tema que menciona (1-2 líneas)
2. Luego, NATURALMENTE conecta con el producto que le interesa
3. Hazle una pregunta sobre el producto para retomar la venta
4. Sé amigable y natural, no forzado
5. Usa emojis

EJEMPLO:
Cliente: "Hace mucho calor hoy"
Tú: "¡Sí! Un día perfecto para quedarse en casa aprendiendo algo nuevo 😊 Por cierto, ¿ya decidiste sobre el ${state.productName}? Te puedo dar más detalles si quieres 🎯"

RESPUESTA:`;
    } else {
      // Responder libremente al tema casual
      prompt = `Eres un asistente amigable y conversacional.

MENSAJE DEL CLIENTE: "${message}"

INSTRUCCIONES:
1. Responde de forma natural y amigable
2. Sé breve (2-3 líneas máximo)
3. Muestra interés genuino
4. Usa emojis apropiados
5. Si es un saludo, responde cordialmente

RESPUESTA:`;
    }
    
    const response = await OllamaOrchestratorProfessional.processMessage(
      prompt,
      userId,
      []
    );
    
    return {
      response: response.message,
      shouldSendPhotos: false,
      salesAction: analysis.shouldReturnToSales ? 'follow_up' : 'none'
    };
  }

  /**
   * Maneja intención de compra
   */
  private static async handlePurchaseIntent(
    botUserId: string,
    userId: string,
    message: string,
    state: ConversationState,
    context: any
  ): Promise<any> {
    console.log('[SuperSalesAI] 💳 Manejando intención de compra');
    
    // Obtener producto del contexto
    const productContext = await ContextMemoryEnhanced.getCurrentProduct(botUserId, userId);
    
    if (!productContext) {
      return {
        response: '¡Perfecto! ¿Qué producto te gustaría comprar? 😊',
        shouldSendPhotos: false,
        salesAction: 'none'
      };
    }
    
    // Generar links de pago reales
    const { BotPaymentLinkGenerator } = await import('./bot-payment-link-generator');
    const paymentResult = await BotPaymentLinkGenerator.generatePaymentLinks(
      productContext.productId,
      botUserId,
      1
    );
    
    if (paymentResult.success && paymentResult.message) {
      return {
        response: paymentResult.message,
        shouldSendPhotos: false,
        salesAction: 'send_payment'
      };
    }
    
    return {
      response: `¡Excelente decisión! 🎉\n\nEstoy generando tu link de pago para *${productContext.productName}*\n\n💰 Total: $${productContext.price.toLocaleString('es-CO')} COP\n\n⏳ Un momento...`,
      shouldSendPhotos: false,
      salesAction: 'send_payment'
    };
  }

  /**
   * Maneja consultas generales
   */
  private static async handleGeneralQuery(
    botUserId: string,
    userId: string,
    message: string,
    state: ConversationState,
    context: any
  ): Promise<any> {
    console.log('[SuperSalesAI] ❓ Manejando consulta general');
    
    const prompt = `Eres un asistente inteligente y útil de una tienda de tecnología.

MENSAJE DEL CLIENTE: "${message}"

INSTRUCCIONES:
1. Responde de forma útil y precisa
2. Si no sabes algo, sé honesto
3. Si la pregunta se relaciona con productos, menciona que puedes ayudar
4. Sé breve y claro
5. Usa emojis apropiados

RESPUESTA:`;
    
    const response = await OllamaOrchestratorProfessional.processMessage(
      prompt,
      userId,
      []
    );
    
    return {
      response: response.message,
      shouldSendPhotos: false,
      salesAction: 'none'
    };
  }

  /**
   * Obtiene estado de conversación
   */
  private static async getConversationState(
    botUserId: string,
    userId: string
  ): Promise<ConversationState> {
    const productContext = await ContextMemoryEnhanced.getCurrentProduct(botUserId, userId);
    
    return {
      hasActiveProduct: !!productContext,
      productId: productContext?.productId,
      productName: productContext?.productName,
      conversationStage: productContext ? 'product_interest' : 'casual',
      lastProductMention: productContext?.timestamp || null,
      casualTopicCount: 0 // Se actualiza dinámicamente
    };
  }

  /**
   * Extrae el tema principal del mensaje
   */
  private static extractTopic(message: string): string {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('clima') || messageLower.includes('tiempo')) return 'clima';
    if (messageLower.includes('día') || messageLower.includes('mañana')) return 'día';
    if (messageLower.includes('gracias')) return 'agradecimiento';
    if (messageLower.includes('hola') || messageLower.includes('buenos')) return 'saludo';
    
    return 'general';
  }

  /**
   * Detecta sentimiento del mensaje
   */
  private static detectSentiment(message: string): 'positive' | 'neutral' | 'negative' {
    const messageLower = message.toLowerCase();
    
    const positiveWords = ['gracias', 'excelente', 'perfecto', 'genial', 'bueno', 'bien'];
    const negativeWords = ['malo', 'problema', 'error', 'no funciona', 'caro'];
    
    if (positiveWords.some(w => messageLower.includes(w))) return 'positive';
    if (negativeWords.some(w => messageLower.includes(w))) return 'negative';
    
    return 'neutral';
  }

  /**
   * Obtiene fotos del producto
   */
  private static getProductPhotos(product: any): Array<{ url: string; caption?: string }> {
    try {
      let images: string[] = [];
      
      if (typeof product.images === 'string') {
        images = JSON.parse(product.images);
      } else if (Array.isArray(product.images)) {
        images = product.images;
      }
      
      return images
        .filter(url => url && url.trim() !== '')
        .slice(0, 3) // Máximo 3 fotos
        .map(url => ({
          url,
          caption: product.name
        }));
    } catch (error) {
      console.error('[SuperSalesAI] Error obteniendo fotos:', error);
      return [];
    }
  }
}
