/**
 * Super Sales AI - IA Conversacional con Capacidades de Ventas CORREGIDA
 * 
 * CORRECCIONES:
 * 1. ✅ Mantiene contexto del producto entre mensajes
 * 2. ✅ Envía fotos automáticamente
 * 3. ✅ Usa formato CARD visual para respuestas
 */

import { OllamaProfessionalOrchestrator as OllamaOrchestratorProfessional } from './ollama-orchestrator-professional';
import { ContextMemoryEnhanced } from './context-memory-enhanced';
import { ConversationContextHybrid } from './conversation-context-hybrid';
import { db } from './db';

interface ConversationState {
  hasActiveProduct: boolean;
  productId?: string;
  productName?: string;
  conversationStage: 'casual' | 'product_interest' | 'negotiation' | 'closing';
  lastProductMention: Date | null;
  casualTopicCount: number;
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
    
    // 2. Analizar el mensaje
    const analysis = await this.analyzeMessage(message, state, context);
    
    console.log('[SuperSalesAI] 🧠 Análisis:', analysis);
    
    // 3. Decidir estrategia de respuesta
    if (analysis.isProductQuery) {
      return await this.handleProductQuery(botUserId, userId, message, analysis, context);
    } else if (analysis.isPurchaseIntent) {
      return await this.handlePurchaseIntent(botUserId, userId, message, state, context);
    } else if (analysis.isCasualConversation) {
      return await this.handleCasualConversation(botUserId, userId, message, state, analysis, context);
    } else {
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
      'disponible', 'stock', 'tienes', 'vendes', 'ofreces',
      'foto', 'imagen', 'ver', 'muestra', 'enseña'
    ];
    const isProductQuery = productKeywords.some(k => messageLower.includes(k));
    
    // Detectar intención de compra
    const purchaseKeywords = [
      'comprar', 'adquirir', 'pagar', 'método de pago', 'link',
      'quiero', 'me interesa', 'lo llevo', 'cómo pago', 'link de pago'
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
      state.casualTopicCount >= 2 &&
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
   * Maneja consultas sobre productos - CORREGIDO
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
    const conversationContext = context.historialMensajes
      ?.slice(-5)
      .map((m: any) => `${m.rol}: ${m.contenido}`)
      .join('\n');
    
    const result = await semanticProductSearch(message, conversationContext);
    
    if (!result || !result.product) {
      return {
        response: 'No encontré ese producto específico. ¿Podrías darme más detalles sobre lo que buscas? 🤔',
        shouldSendPhotos: false,
        salesAction: 'none'
      };
    }
    
    const product = result.product;
    
    console.log('[SuperSalesAI] ✅ Producto encontrado:', product.name);
    console.log('[SuperSalesAI] 💰 Precio:', product.price);
    console.log('[SuperSalesAI] 📸 Imágenes:', product.images);
    
    // GUARDAR EN CONTEXTO MÚLTIPLE (PERSISTENCIA MEJORADA)
    try {
      // 1. Contexto mejorado
      await ContextMemoryEnhanced.saveProductContext(
        botUserId,
        userId,
        product.id,
        product.name,
        product.price,
        product.category
      );
      
      // 2. Contexto híbrido
      await ConversationContextHybrid.saveProductContext(
        botUserId,
        userId,
        product.id,
        product.name,
        {
          price: product.price,
          category: product.category,
          type: product.category === 'DIGITAL' ? 'digital' : 'physical'
        }
      );
      
      console.log('[SuperSalesAI] ✅ Contexto guardado en múltiples sistemas');
    } catch (error) {
      console.error('[SuperSalesAI] ❌ Error guardando contexto:', error);
    }
    
    // Determinar si es producto digital o físico
    const esDigital = product.category === 'DIGITAL' || 
                      product.subcategory?.toLowerCase().includes('curso') ||
                      product.subcategory?.toLowerCase().includes('megapack');
    
    // Generar respuesta con formato CARD
    const response = this.formatProductResponse(product, esDigital);
    
    // Preparar fotos
    const photos = this.getProductPhotos(product);
    
    console.log('[SuperSalesAI] 📸 Fotos preparadas:', photos.length);
    
    return {
      response: response,
      shouldSendPhotos: photos.length > 0,
      photos: photos,
      salesAction: 'show_product'
    };
  }
  
  /**
   * Formatea respuesta de producto con estilo CARD visual
   */
  private static formatProductResponse(product: any, esDigital: boolean): string {
    const emoji = esDigital ? '🎓' : '📦';
    const disponibilidad = esDigital 
      ? '✅ Siempre disponible (entrega digital inmediata)'
      : '✅ Disponible (consultar stock exacto)';
    
    // Extraer descripción corta (primeras 2-3 líneas)
    let descripcionCorta = product.description || 'Producto de alta calidad';
    if (descripcionCorta.length > 200) {
      descripcionCorta = descripcionCorta.substring(0, 200) + '...';
    }
    
    return `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  *${product.name}* ${emoji}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

📋 *DESCRIPCIÓN:*
${descripcionCorta}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 *PRECIO:*
${product.price.toLocaleString('es-CO')} COP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ *DISPONIBILIDAD:*
${disponibilidad}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${esDigital ? `📲 *ENTREGA:*
• Automática por WhatsApp/Email
• Acceso instantáneo después del pago
• Sin esperas ni trámites

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━` : `🚚 *OPCIONES DE ENTREGA:*
• 🏪 Recogida en tienda
• 📮 Envío a domicilio (costo adicional)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`}

💳 *MÉTODOS DE PAGO:*
• 💳 MercadoPago (link de pago)
• 💰 PayPal (link de pago)
• 📱 Nequi
• 💵 Daviplata
• 🏦 Transferencia bancaria

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 ¿Te gustaría ${esDigital ? 'comprarlo' : 'más información'}? 😊`;
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
    
    state.casualTopicCount++;
    
    let prompt = '';
    
    if (analysis.shouldReturnToSales && state.productName) {
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

RESPUESTA:`;
    } else {
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
   * Maneja intención de compra - CORREGIDO
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
    
    console.log('[SuperSalesAI] 📦 Producto en contexto:', productContext.productName);
    console.log('[SuperSalesAI] 💰 Precio:', productContext.price);
    
    // Generar links de pago reales
    const { BotPaymentLinkGenerator } = await import('./bot-payment-link-generator');
    const paymentResult = await BotPaymentLinkGenerator.generatePaymentLinks(
      productContext.productId,
      botUserId,
      1
    );
    
    if (paymentResult.success && paymentResult.message) {
      console.log('[SuperSalesAI] ✅ Links de pago generados');
      return {
        response: paymentResult.message,
        shouldSendPhotos: false,
        salesAction: 'send_payment'
      };
    }
    
    return {
      response: `¡Excelente decisión! 🎉\n\nEstoy generando tu link de pago para *${productContext.productName}*\n\n💰 Total: ${productContext.price.toLocaleString('es-CO')} COP\n\n⏳ Un momento...`,
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
      casualTopicCount: 0
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
   * Obtiene fotos del producto - CORREGIDO
   */
  private static getProductPhotos(product: any): Array<{ url: string; caption?: string }> {
    try {
      console.log('[SuperSalesAI] 🔍 Procesando fotos del producto');
      console.log('[SuperSalesAI] 📸 Images raw:', product.images);
      
      let images: string[] = [];
      
      if (typeof product.images === 'string') {
        try {
          images = JSON.parse(product.images);
        } catch (e) {
          console.log('[SuperSalesAI] ⚠️ Error parseando JSON, intentando split');
          images = product.images.split(',').map((url: string) => url.trim());
        }
      } else if (Array.isArray(product.images)) {
        images = product.images;
      }
      
      console.log('[SuperSalesAI] 📸 Images parsed:', images);
      
      // Filtrar y convertir URLs
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:4000';
      
      const photos = images
        .filter(url => url && url.trim() !== '')
        .map(url => {
          // Convertir rutas locales a URLs completas
          let fullUrl = url;
          if (url.startsWith('/')) {
            fullUrl = `${baseUrl}${url}`;
            console.log('[SuperSalesAI] 🔄 Convertido:', url, '→', fullUrl);
          }
          return fullUrl;
        })
        .filter(url => url.startsWith('http')) // Solo URLs válidas
        .slice(0, 3) // Máximo 3 fotos
        .map(url => ({
          url,
          caption: `📸 ${product.name}`
        }));
      
      console.log('[SuperSalesAI] ✅ Fotos finales:', photos.length);
      photos.forEach((p, i) => {
        console.log(`[SuperSalesAI]   ${i + 1}. ${p.url}`);
      });
      
      return photos;
    } catch (error) {
      console.error('[SuperSalesAI] ❌ Error obteniendo fotos:', error);
      return [];
    }
  }
}
