/**
 * 🤖 GENERADOR DE RESPUESTAS LOCAL
 * Sistema de razonamiento profundo que NO requiere IA externa
 * Genera respuestas inteligentes usando lógica, plantillas y contexto
 */

import { LocalProductMatcher } from './local-product-matcher';
import { IntentTranslator } from './intent-translator';

interface GeneratorContext {
  userName?: string;
  previousProduct?: string;
  conversationHistory: Array<{ role: string; content: string }>;
  paymentIntent?: boolean;
  preferredPaymentMethod?: string;
}

export class LocalResponseGenerator {
  
  /**
   * Generar respuesta completa sin IA externa
   */
  static async generateIntelligentResponse(params: {
    userMessage: string;
    products: any[];
    context: GeneratorContext;
  }): Promise<{ text: string; confidence: number; actions: any[] }> {
    
    const { userMessage, products, context } = params;
    
    console.log('[LocalGenerator] 🧠 Generando respuesta sin IA externa');
    
    // 1. Detectar intención
    const intent = IntentTranslator.analyzeIntent(userMessage);
    console.log('[LocalGenerator] 🎯 Intención:', intent.type);
    
    // 2. Determinar tipo de respuesta necesaria
    const responseType = this.determineResponseType(userMessage, products, context, intent);
    
    // 3. Generar respuesta según el tipo
    let response: string;
    let actions: any[] = [];
    let confidence = 0.85;
    
    switch (responseType) {
      case 'greeting':
        response = this.generateGreeting(context.userName);
        break;
        
      case 'product_recommendation':
        const result = this.generateProductRecommendation(products, intent, userMessage);
        response = result.text;
        actions = result.actions;
        break;
        
      case 'product_details':
        response = this.generateProductDetails(products[0], userMessage);
        actions = [{ type: 'send_image', productId: products[0]?.id }];
        break;
        
      case 'price_inquiry':
        response = this.generatePriceResponse(products, userMessage);
        break;
        
      case 'payment_methods':
        response = this.generatePaymentMethodsResponse();
        actions = [{ type: 'show_payment_methods' }];
        break;
        
      case 'purchase_intent':
        response = this.generatePurchaseFlow(products[0], context);
        actions = [{ type: 'show_payment_methods' }];
        break;
        
      case 'comparison':
        response = this.generateComparison(products);
        break;
        
      case 'availability':
        response = this.generateAvailabilityResponse(products);
        break;
        
      case 'no_products_found':
        response = this.generateNoProductsResponse(userMessage, intent);
        break;
        
      default:
        response = this.generateGenericResponse(userMessage, context);
        confidence = 0.7;
    }
    
    // 4. Personalizar con nombre si está disponible
    if (context.userName && !response.includes(context.userName)) {
      response = this.addPersonalization(response, context.userName);
    }
    
    console.log('[LocalGenerator] ✅ Respuesta generada localmente');
    
    return { text: response, confidence, actions };
  }
  
  /**
   * Determinar qué tipo de respuesta generar
   */
  private static determineResponseType(
    message: string,
    products: any[],
    context: GeneratorContext,
    intent: any
  ): string {
    
    const msgLower = message.toLowerCase();
    
    // Saludo
    if (/^(hola|buenos|buenas|hey|hi|saludos)/i.test(message) && message.length < 30) {
      return 'greeting';
    }
    
    // Métodos de pago
    if (msgLower.includes('pago') || msgLower.includes('pagar') || 
        msgLower.includes('método') || msgLower.includes('forma de pago')) {
      return 'payment_methods';
    }
    
    // Intención de compra
    if ((msgLower.includes('quiero comprar') || msgLower.includes('me interesa') ||
         msgLower.includes('lo quiero') || msgLower.includes('cómo compro')) && products.length > 0) {
      return 'purchase_intent';
    }
    
    // Consulta de precio
    if ((msgLower.includes('cuánto cuesta') || msgLower.includes('precio') ||
         msgLower.includes('cuanto vale') || msgLower.includes('cuánto vale')) && products.length > 0) {
      return 'price_inquiry';
    }
    
    // Disponibilidad
    if (msgLower.includes('disponible') || msgLower.includes('stock') ||
        msgLower.includes('tienen') || msgLower.includes('hay')) {
      return products.length > 0 ? 'availability' : 'no_products_found';
    }
    
    // Comparación
    if (products.length > 1 && (msgLower.includes('diferencia') || 
        msgLower.includes('comparar') || msgLower.includes('mejor'))) {
      return 'comparison';
    }
    
    // Detalles de producto
    if (products.length === 1 && (msgLower.includes('características') ||
        msgLower.includes('especificaciones') || msgLower.includes('más información'))) {
      return 'product_details';
    }
    
    // Recomendación de productos
    if (products.length > 0) {
      return 'product_recommendation';
    }
    
    // No se encontraron productos
    if (intent.type !== 'general' && products.length === 0) {
      return 'no_products_found';
    }
    
    return 'generic';
  }
  
  /**
   * Generar saludo personalizado
   */
  private static generateGreeting(userName?: string): string {
    const greetings = [
      `¡Hola${userName ? ' ' + userName : ''}! 😊 Bienvenido a Tecnovariedades D&S. ¿En qué puedo ayudarte hoy?`,
      `¡Hola! 👋 Soy tu asistente virtual de Tecnovariedades D&S. ¿Qué producto estás buscando?`,
      `¡Buen día${userName ? ' ' + userName : ''}! 🌟 ¿Te puedo ayudar a encontrar algo?`,
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  /**
   * Generar recomendación de productos
   */
  private static generateProductRecommendation(
    products: any[],
    intent: any,
    userMessage: string
  ): { text: string; actions: any[] } {
    
    if (products.length === 0) {
      return {
        text: this.generateNoProductsResponse(userMessage, intent),
        actions: []
      };
    }
    
    let response = '';
    const actions: any[] = [];
    
    if (products.length === 1) {
      const product = products[0];
      response = `¡Excelente elección! 🎯\n\n`;
      response += `**${product.name}**\n`;
      response += `💰 Precio: $${product.price.toLocaleString('es-CO')} COP\n\n`;
      
      if (product.description) {
        response += `${product.description.substring(0, 200)}...\n\n`;
      }
      
      response += `¿Te gustaría conocer más detalles o proceder con la compra? 🛒`;
      
      actions.push({ type: 'send_image', productId: product.id });
      
    } else {
      response = `¡Tenemos ${products.length} opciones excelentes para ti! 🌟\n\n`;
      
      products.slice(0, 3).forEach((product, index) => {
        response += `${index + 1}. **${product.name}**\n`;
        response += `   💰 $${product.price.toLocaleString('es-CO')} COP\n\n`;
        
        actions.push({ type: 'send_image', productId: product.id });
      });
      
      if (products.length > 3) {
        response += `...y ${products.length - 3} opciones más.\n\n`;
      }
      
      response += `¿Cuál te interesa más? Puedo darte más detalles de cualquiera. 😊`;
    }
    
    return { text: response, actions };
  }
  
  /**
   * Generar detalles de producto
   */
  private static generateProductDetails(product: any, userMessage: string): string {
    if (!product) return 'No encontré información de ese producto.';
    
    let response = `📦 **${product.name}**\n\n`;
    
    if (product.description) {
      response += `${product.description}\n\n`;
    }
    
    response += `💰 **Precio:** $${product.price.toLocaleString('es-CO')} COP\n`;
    
    if (product.stock > 0) {
      response += `✅ **Disponible** (${product.stock} unidades)\n`;
    } else {
      response += `⚠️ **Consultar disponibilidad**\n`;
    }
    
    if (product.category) {
      response += `📁 **Categoría:** ${product.category}\n`;
    }
    
    response += `\n¿Te gustaría comprarlo? Puedo mostrarte las formas de pago disponibles. 🛒`;
    
    return response;
  }
  
  /**
   * Generar respuesta de precio
   */
  private static generatePriceResponse(products: any[], userMessage: string): string {
    if (products.length === 0) {
      return 'No encontré el producto que mencionas. ¿Podrías darme más detalles?';
    }
    
    if (products.length === 1) {
      const product = products[0];
      return `El precio de **${product.name}** es de **$${product.price.toLocaleString('es-CO')} COP**. 💰\n\n¿Te gustaría comprarlo?`;
    }
    
    let response = 'Aquí están los precios:\n\n';
    products.slice(0, 5).forEach((product, index) => {
      response += `${index + 1}. ${product.name}: $${product.price.toLocaleString('es-CO')} COP\n`;
    });
    
    response += '\n¿Cuál te interesa?';
    return response;
  }
  
  /**
   * Generar respuesta de métodos de pago
   */
  private static generatePaymentMethodsResponse(): string {
    return `Aceptamos los siguientes métodos de pago: 💳\n\n` +
           `1. 💳 **Tarjeta de crédito/débito** (MercadoPago)\n` +
           `2. 📱 **Nequi**\n` +
           `3. 💰 **Daviplata**\n` +
           `4. 🏦 **Transferencia bancaria**\n` +
           `5. 🌐 **PayPal**\n\n` +
           `¿Con cuál prefieres pagar?`;
  }
  
  /**
   * Generar flujo de compra
   */
  private static generatePurchaseFlow(product: any, context: GeneratorContext): string {
    if (!product) {
      return '¿Qué producto te gustaría comprar? Puedo mostrarte nuestro catálogo.';
    }
    
    return `¡Perfecto! Vamos a proceder con la compra de **${product.name}**. 🛒\n\n` +
           `💰 Total: $${product.price.toLocaleString('es-CO')} COP\n\n` +
           `¿Con qué método te gustaría pagar?\n\n` +
           `1. Tarjeta 💳\n` +
           `2. Nequi 📱\n` +
           `3. Daviplata 💰\n` +
           `4. Transferencia 🏦\n` +
           `5. PayPal 🌐`;
  }
  
  /**
   * Generar comparación de productos
   */
  private static generateComparison(products: any[]): string {
    if (products.length < 2) {
      return 'Necesito al menos 2 productos para comparar. ¿Cuáles te interesan?';
    }
    
    let response = '📊 **Comparación:**\n\n';
    
    products.slice(0, 3).forEach((product, index) => {
      response += `**Opción ${index + 1}: ${product.name}**\n`;
      response += `💰 Precio: $${product.price.toLocaleString('es-CO')} COP\n`;
      if (product.description) {
        response += `📝 ${product.description.substring(0, 100)}...\n`;
      }
      response += `\n`;
    });
    
    response += '¿Cuál se ajusta mejor a lo que buscas?';
    return response;
  }
  
  /**
   * Generar respuesta de disponibilidad
   */
  private static generateAvailabilityResponse(products: any[]): string {
    if (products.length === 0) {
      return 'No tenemos ese producto en este momento. ¿Te gustaría ver opciones similares?';
    }
    
    const available = products.filter(p => p.stock > 0);
    
    if (available.length === 0) {
      return 'Los productos que mencionas están agotados temporalmente. ¿Quieres que te avise cuando estén disponibles?';
    }
    
    return `¡Sí, tenemos disponibilidad! ✅\n\n` +
           available.slice(0, 3).map(p => 
             `• ${p.name} - ${p.stock} unidades disponibles`
           ).join('\n') +
           `\n\n¿Te gustaría comprar alguno?`;
  }
  
  /**
   * Generar respuesta cuando no se encuentran productos
   */
  private static generateNoProductsResponse(userMessage: string, intent: any): string {
    return `No encontré productos exactos para "${intent.topic || userMessage}", pero puedo ayudarte de otras formas:\n\n` +
           `1. 📱 Ver nuestro catálogo completo\n` +
           `2. 🔍 Buscar productos similares\n` +
           `3. 💬 Hablar con un asesor\n\n` +
           `¿Qué prefieres?`;
  }
  
  /**
   * Generar respuesta genérica
   */
  private static generateGenericResponse(userMessage: string, context: GeneratorContext): string {
    return `Entiendo que preguntas sobre "${userMessage}". 🤔\n\n` +
           `Puedo ayudarte con:\n` +
           `• Ver productos disponibles 📦\n` +
           `• Información de precios 💰\n` +
           `• Métodos de pago 💳\n` +
           `• Realizar una compra 🛒\n\n` +
           `¿Qué necesitas?`;
  }
  
  /**
   * Agregar personalización con nombre
   */
  private static addPersonalization(response: string, userName: string): string {
    // Agregar nombre al final si no está
    if (!response.includes(userName)) {
      return response + `\n\n¿En qué más puedo ayudarte, ${userName}? 😊`;
    }
    return response;
  }
}
