/**
 * 🧠 SISTEMA DE INTELIGENCIA AUTO-VALIDANTE
 * 
 * Este sistema asegura que el bot:
 * 1. Razone inteligentemente antes de responder
 * 2. Entienda a detalle lo que quiere el cliente
 * 3. NO invente información
 * 4. Valide que su respuesta sea verdadera antes de enviarla
 */

import { Product } from '@prisma/client';

export interface IntelligentReasoning {
  // Comprensión del cliente
  userIntent: string;
  userNeed: string;
  specificProduct?: string;
  priceInquiry: boolean;
  paymentInquiry: boolean;
  
  // Razonamiento del bot
  reasoning: string;
  confidence: number;
  shouldShowMultipleProducts: boolean;
  
  // Validación
  hasRequiredData: boolean;
  canAnswerTruthfully: boolean;
  potentialIssues: string[];
}

export interface ValidatedResponse {
  isValid: boolean;
  response: string;
  confidence: number;
  reasoning: string;
  issues: string[];
  corrections?: string[];
}

export class SelfValidatingAI {
  /**
   * 🧠 PASO 1: Razonar sobre lo que quiere el cliente
   */
  static analyzeUserIntent(
    userMessage: string,
    conversationContext?: any
  ): IntelligentReasoning {
    const lower = userMessage.toLowerCase().trim();
    
    console.log('[SelfValidatingAI] 🧠 Analizando intención del usuario...');
    console.log(`[SelfValidatingAI] Mensaje: "${userMessage}"`);
    
    // Detectar intención específica
    const userIntent = this.detectIntent(lower);
    const userNeed = this.extractNeed(lower);
    const specificProduct = this.extractProductName(lower);
    const priceInquiry = this.isPriceQuestion(lower);
    const paymentInquiry = this.isPaymentQuestion(lower);
    
    // Razonar si debe mostrar múltiples productos
    const shouldShowMultipleProducts = this.shouldShowMultiple(
      lower,
      specificProduct,
      priceInquiry,
      conversationContext
    );
    
    // Calcular confianza en la comprensión
    const confidence = this.calculateUnderstandingConfidence(
      userIntent,
      userNeed,
      specificProduct
    );
    
    const reasoning = this.buildReasoning(
      userIntent,
      userNeed,
      specificProduct,
      shouldShowMultipleProducts
    );
    
    console.log(`[SelfValidatingAI] 💡 Intención: ${userIntent}`);
    console.log(`[SelfValidatingAI] 🎯 Necesidad: ${userNeed}`);
    console.log(`[SelfValidatingAI] 📊 Confianza: ${(confidence * 100).toFixed(0)}%`);
    
    return {
      userIntent,
      userNeed,
      specificProduct,
      priceInquiry,
      paymentInquiry,
      reasoning,
      confidence,
      shouldShowMultipleProducts,
      hasRequiredData: true,
      canAnswerTruthfully: true,
      potentialIssues: []
    };
  }
  
  /**
   * ✅ PASO 2: Validar que la respuesta sea verdadera ANTES de enviarla
   */
  static validateResponseTruthfulness(
    userMessage: string,
    proposedResponse: string,
    availableProducts: Product[],
    reasoning: IntelligentReasoning
  ): ValidatedResponse {
    console.log('[SelfValidatingAI] ✅ Validando veracidad de la respuesta...');
    
    const issues: string[] = [];
    const corrections: string[] = [];
    
    // 1. Verificar que no invente productos
    const mentionedProducts = this.extractProductsFromResponse(proposedResponse);
    for (const mentioned of mentionedProducts) {
      const exists = availableProducts.some(p => 
        p.name.toLowerCase().includes(mentioned.toLowerCase())
      );
      
      if (!exists) {
        issues.push(`Menciona producto "${mentioned}" que no existe en catálogo`);
        corrections.push(`Eliminar mención de "${mentioned}"`);
      }
    }
    
    // 2. Verificar que los precios sean correctos
    const priceMatches = proposedResponse.match(/\$?([\d,\.]+)\s*(?:COP|pesos?)?/gi);
    if (priceMatches && availableProducts.length > 0) {
      for (const priceMatch of priceMatches) {
        const priceNum = parseInt(priceMatch.replace(/[^\d]/g, ''));
        const matchesAnyProduct = availableProducts.some(p => p.price === priceNum);
        
        if (!matchesAnyProduct && priceNum > 0) {
          issues.push(`Menciona precio $${priceNum} que no coincide con ningún producto`);
          corrections.push(`Verificar precio contra catálogo real`);
        }
      }
    }
    
    // 3. Verificar que responda lo que se preguntó
    if (reasoning.priceInquiry) {
      const hasPrice = /\$[\d,]+/.test(proposedResponse);
      if (!hasPrice) {
        issues.push('Usuario preguntó precio pero respuesta no incluye precio');
        corrections.push('Agregar precio del producto');
      }
    }
    
    if (reasoning.paymentInquiry) {
      const hasPaymentInfo = /mercadopago|paypal|nequi|daviplata|transferencia/i.test(proposedResponse);
      if (!hasPaymentInfo) {
        issues.push('Usuario preguntó métodos de pago pero respuesta no los incluye');
        corrections.push('Agregar métodos de pago disponibles');
      }
    }
    
    // 4. Verificar que no muestre múltiples productos si pregunta es específica
    if (!reasoning.shouldShowMultipleProducts) {
      const productCount = this.countProductsInResponse(proposedResponse);
      if (productCount > 1) {
        issues.push(`Pregunta específica pero respuesta menciona ${productCount} productos`);
        corrections.push('Enfocarse solo en el producto solicitado');
      }
    }
    
    // 5. Verificar que no invente características
    const hasInventedPhrases = this.detectInventedContent(proposedResponse);
    if (hasInventedPhrases.length > 0) {
      issues.push(`Posible contenido inventado: ${hasInventedPhrases.join(', ')}`);
      corrections.push('Usar solo información verificada del catálogo');
    }
    
    // Calcular validez
    const isValid = issues.length === 0;
    const confidence = isValid ? 0.95 : Math.max(0.3, 1 - (issues.length * 0.2));
    
    if (!isValid) {
      console.log(`[SelfValidatingAI] ❌ Respuesta NO ES VÁLIDA`);
      console.log(`[SelfValidatingAI] Problemas encontrados:`);
      issues.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log(`[SelfValidatingAI] ✅ Respuesta VÁLIDA y VERAZ`);
    }
    
    return {
      isValid,
      response: proposedResponse,
      confidence,
      reasoning: reasoning.reasoning,
      issues,
      corrections
    };
  }
  
  /**
   * 🔧 PASO 3: Corregir respuesta si no es válida
   */
  static correctInvalidResponse(
    validation: ValidatedResponse,
    availableProducts: Product[],
    reasoning: IntelligentReasoning
  ): string {
    if (validation.isValid) {
      return validation.response;
    }
    
    console.log('[SelfValidatingAI] 🔧 Corrigiendo respuesta inválida...');
    
    // Si no hay productos disponibles, ser honesto
    if (availableProducts.length === 0) {
      return 'Disculpa, no tengo información sobre ese producto en este momento. ¿Puedo ayudarte con algo más?';
    }
    
    // Si debe mostrar solo 1 producto
    if (!reasoning.shouldShowMultipleProducts && availableProducts.length > 0) {
      const product = availableProducts[0];
      let corrected = `Claro, te cuento sobre el **${product.name}**\n\n`;
      
      if (reasoning.priceInquiry) {
        corrected += `💰 Precio: $${product.price.toLocaleString('es-CO')} COP\n\n`;
      }
      
      if (product.description) {
        corrected += `${product.description.substring(0, 200)}...\n\n`;
      }
      
      if (reasoning.paymentInquiry) {
        corrected += `Puedes pagar por:\n`;
        corrected += `- MercadoPago (tarjetas, PSE)\n`;
        corrected += `- PayPal (internacional)\n`;
        corrected += `- Nequi: 3136174267\n`;
        corrected += `- Daviplata: 3136174267\n\n`;
      }
      
      corrected += `¿Te gustaría más información?`;
      
      return corrected;
    }
    
    // Si debe mostrar múltiples (máximo 3)
    const topProducts = availableProducts.slice(0, 3);
    let corrected = `Tengo estas opciones para ti:\n\n`;
    
    topProducts.forEach((p, i) => {
      corrected += `${i + 1}. **${p.name}**\n`;
      corrected += `   💰 $${p.price.toLocaleString('es-CO')} COP\n\n`;
    });
    
    corrected += `¿Cuál te interesa más?`;
    
    return corrected;
  }
  
  // ==================== MÉTODOS AUXILIARES ====================
  
  private static detectIntent(message: string): string {
    if (/precio|costo|vale|cuánto/.test(message)) return 'price_inquiry';
    if (/pago|pagar|comprar|método/.test(message)) return 'payment_inquiry';
    if (/foto|imagen|ver/.test(message)) return 'photo_request';
    if (/curso|megapack|laptop|producto/.test(message)) return 'product_inquiry';
    return 'general_inquiry';
  }
  
  private static extractNeed(message: string): string {
    // Extraer qué necesita realmente el cliente
    const patterns = [
      { regex: /curso\s+(?:de\s+)?([a-záéíóúñ\s]+)/i, type: 'curso' },
      { regex: /megapack\s+(?:de\s+)?([a-záéíóúñ\s]+)/i, type: 'megapack' },
      { regex: /laptop|portátil/i, type: 'laptop' },
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern.regex);
      if (match) {
        return match[1] ? `${pattern.type} de ${match[1]}` : pattern.type;
      }
    }
    
    return 'información general';
  }
  
  private static extractProductName(message: string): string | undefined {
    const patterns = [
      /curso\s+(?:de\s+|completo\s+de\s+)?([a-záéíóúñ\s]+)/i,
      /megapack\s+(?:de\s+)?([a-záéíóúñ\s]+)/i,
      /laptop\s+([a-záéíóúñ0-9\s]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return undefined;
  }
  
  private static isPriceQuestion(message: string): boolean {
    return /precio|costo|vale|cuánto|qué precio/.test(message);
  }
  
  private static isPaymentQuestion(message: string): boolean {
    return /pago|pagar|método|forma de pago|cómo pago/.test(message);
  }
  
  private static shouldShowMultiple(
    message: string,
    specificProduct: string | undefined,
    priceInquiry: boolean,
    context?: any
  ): boolean {
    // Si pregunta por producto específico o precio, mostrar solo 1
    if (specificProduct || priceInquiry) return false;
    
    // Si hay producto en contexto, mantenerlo
    if (context?.currentProduct) return false;
    
    // Si pregunta "qué tienes", "opciones", etc., mostrar varios
    if (/qué.*tienes|opciones|disponibles|muéstrame/.test(message)) return true;
    
    return false;
  }
  
  private static calculateUnderstandingConfidence(
    intent: string,
    need: string,
    specificProduct: string | undefined
  ): number {
    let confidence = 0.5;
    
    if (intent !== 'general_inquiry') confidence += 0.2;
    if (need !== 'información general') confidence += 0.2;
    if (specificProduct) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }
  
  private static buildReasoning(
    intent: string,
    need: string,
    specificProduct: string | undefined,
    showMultiple: boolean
  ): string {
    let reasoning = `El cliente tiene intención de: ${intent}. `;
    reasoning += `Necesita: ${need}. `;
    
    if (specificProduct) {
      reasoning += `Producto específico: ${specificProduct}. `;
    }
    
    reasoning += showMultiple 
      ? 'Debo mostrar múltiples opciones.'
      : 'Debo enfocarme en un solo producto.';
    
    return reasoning;
  }
  
  private static extractProductsFromResponse(response: string): string[] {
    const products: string[] = [];
    
    // Buscar patrones de productos mencionados
    const patterns = [
      /\*\*([^*]+)\*\*/g,  // **Nombre Producto**
      /(?:curso|megapack|laptop)\s+(?:de\s+)?([a-záéíóúñ\s]+)/gi,
    ];
    
    for (const pattern of patterns) {
      const matches = response.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) products.push(match[1].trim());
      }
    }
    
    return [...new Set(products)]; // Eliminar duplicados
  }
  
  private static countProductsInResponse(response: string): number {
    const patterns = [
      /\d+\.\s+\*\*[^*]+\*\*/g,  // "1. **Producto**"
      /\d+\)\s+[A-ZÁÉÍÓÚÑ]/g,     // "1) Producto"
    ];
    
    let maxCount = 0;
    for (const pattern of patterns) {
      const matches = response.match(pattern);
      if (matches) {
        maxCount = Math.max(maxCount, matches.length);
      }
    }
    
    return maxCount || 1;
  }
  
  private static detectInventedContent(response: string): string[] {
    const invented: string[] = [];
    
    // Frases que indican contenido inventado
    const suspiciousPatterns = [
      /incluye\s+certificado/i,
      /certificado\s+(?:al|de)\s+(?:finalizar|finalización)/i,
      /certificado\s+(?:oficial|internacional|digital)/i,
      // /acceso\s+(?:ilimitado|de por vida)/i, // Comentado porque SI ofrecemos acceso de por vida
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(response)) {
        invented.push(pattern.source);
      }
    }
    
    return invented;
  }
}
