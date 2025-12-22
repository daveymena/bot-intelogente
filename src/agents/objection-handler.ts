/**
 * 🛡️ MANEJADOR DE OBJECIONES
 * Detecta y maneja objeciones del cliente de forma profesional
 */

import { SharedMemory, Product } from './shared-memory';

export interface ObjectionResponse {
  type: 'price' | 'quality' | 'timing' | 'comparison' | 'trust' | 'need' | 'unknown';
  response: string;
  nextAction: 'continue' | 'show_alternatives' | 'offer_discount' | 'schedule_followup';
  confidence: number;
}

export class ObjectionHandler {
  /**
   * Detecta y maneja objeciones
   */
  static handleObjection(
    message: string,
    memory: SharedMemory,
    product?: Product
  ): ObjectionResponse | null {
    const msg = message.toLowerCase();
    
    // 🚫 NO interceptar si es selección de método de pago
    if (this.isPaymentMethodSelection(msg)) {
      return null; // Dejar que el PaymentAgent lo maneje
    }
    
    // 🚫 NO interceptar confirmaciones de pago ni consultas de entrega/envío
    if (this.isPaymentConfirmation(msg) || this.isDeliveryQuery(msg)) {
      return null;
    }
    
    // 1. OBJECIÓN DE PRECIO
    if (this.isPriceObjection(msg)) {
      return this.handlePriceObjection(product, memory);
    }
    
    // 2. OBJECIÓN DE CALIDAD
    if (this.isQualityObjection(msg)) {
      return this.handleQualityObjection(product);
    }
    
    // 3. OBJECIÓN DE TIEMPO
    if (this.isTimingObjection(msg)) {
      return this.handleTimingObjection(product);
    }
    
    // 4. OBJECIÓN DE COMPARACIÓN
    if (this.isComparisonObjection(msg)) {
      return this.handleComparisonObjection(product);
    }
    
    // 5. OBJECIÓN DE CONFIANZA
    if (this.isTrustObjection(msg)) {
      return this.handleTrustObjection(product);
    }
    
    // 6. OBJECIÓN DE NECESIDAD
    if (this.isNeedObjection(msg)) {
      return this.handleNeedObjection(product);
    }
    
    return null;
  }
  
  /**
   * Detecta si es selección de método de pago (NO es objeción)
   */
  private static isPaymentMethodSelection(msg: string): boolean {
    const paymentKeywords = [
      'paypal', 'nequi', 'daviplata', 'mercadopago', 'mercado pago',
      'consignacion', 'consignación', 'bancaria', 'contraentrega',
      'tarjeta', 'pse', 'efectivo',
    ];
    
    // Si menciona un método de pago específico, NO es objeción
    return paymentKeywords.some(kw => msg.includes(kw));
  }

  private static isPaymentConfirmation(msg: string): boolean {
    const patterns = [
      'pague', 'pagúe', 'pagué', 'pago realizado', 'realice el pago', 'realicé el pago',
      'envio el comprobante', 'envío el comprobante', 'envié el comprobante', 'adjunto comprobante',
      'mandé el comprobante', 'mande el comprobante'
    ];
    return patterns.some(p => msg.includes(p));
  }

  private static isDeliveryQuery(msg: string): boolean {
    const keywords = [
      'entrega', 'envio', 'envío', 'domicilio', 'contrareembolso', 'contra reembolso',
      'como me lo envias', 'cómo me lo envías', 'cuando llega', 'cuándo llega', 'tiempo de entrega'
    ];
    return keywords.some(k => msg.includes(k));
  }
  
  /**
   * Detecta objeción de precio
   */
  private static isPriceObjection(msg: string): boolean {
    const keywords = [
      'caro', 'costoso', 'muy caro', 'mucho dinero',
      'no tengo', 'no puedo pagar', 'no me alcanza',
      'precio alto', 'muy costoso', 'demasiado caro',
    ];
    return keywords.some(kw => msg.includes(kw));
  }
  
  /**
   * Maneja objeción de precio
   */
  private static handlePriceObjection(
    product: Product | undefined,
    memory: SharedMemory
  ): ObjectionResponse {
    if (!product) {
      return {
        type: 'price',
        response: 'Entiendo tu preocupación por el precio 💰\n\n¿Qué presupuesto tienes en mente? Puedo mostrarte opciones que se ajusten',
        nextAction: 'show_alternatives',
        confidence: 0.8,
      };
    }
    
    const price = product.price.toLocaleString('es-CO');
    
    let response = `Entiendo que el precio es importante 💰\n\n`;
    response += `El *${product.name}* está en *${price} COP*\n\n`;
    response += `Te cuento por qué vale la pena:\n\n`;
    
    // Agregar valor según tipo de producto
    if (product.category?.toLowerCase().includes('curso')) {
      response += `✅ Acceso de por vida\n`;
      response += `✅ Certificado incluido\n`;
      response += `✅ Actualizaciones gratis\n`;
      response += `✅ Soporte incluido\n\n`;
      response += `Es una inversión en tu futuro profesional 🎓`;
    } else if (product.category?.toLowerCase().includes('laptop') || 
               product.category?.toLowerCase().includes('computador')) {
      response += `✅ Garantía incluida\n`;
      response += `✅ Soporte técnico\n`;
      response += `✅ Producto nuevo y original\n`;
      response += `✅ Entrega inmediata\n\n`;
      response += `Además, tenemos opciones de pago flexibles 💳`;
    } else {
      response += `✅ Producto de calidad\n`;
      response += `✅ Garantía incluida\n`;
      response += `✅ Soporte post-venta\n\n`;
      response += `¿Te gustaría ver opciones de pago? 💳`;
    }
    
    return {
      type: 'price',
      response,
      nextAction: 'continue',
      confidence: 0.85,
    };
  }
  
  /**
   * Detecta objeción de calidad
   */
  private static isQualityObjection(msg: string): boolean {
    const keywords = [
      'calidad', 'bueno', 'malo', 'funciona',
      'confiable', 'dura', 'garantia', 'garantía',
      'original', 'nuevo', 'usado',
    ];
    return keywords.some(kw => msg.includes(kw));
  }
  
  /**
   * Maneja objeción de calidad
   */
  private static handleQualityObjection(product: Product | undefined): ObjectionResponse {
    if (!product) {
      return {
        type: 'quality',
        response: 'Todos nuestros productos son de alta calidad ✅\n\n¿Qué producto te interesa? Te cuento más sobre su calidad',
        nextAction: 'continue',
        confidence: 0.8,
      };
    }
    
    let response = `¡Excelente pregunta! 👍\n\n`;
    response += `El *${product.name}* es:\n\n`;
    response += `✅ *100% Original*\n`;
    response += `✅ *Garantía incluida*\n`;
    response += `✅ *Probado antes de enviar*\n`;
    response += `✅ *Soporte técnico incluido*\n\n`;
    
    if (product.category?.toLowerCase().includes('curso')) {
      response += `Además, nuestros cursos son:\n`;
      response += `🎓 Creados por expertos\n`;
      response += `🎓 Contenido actualizado\n`;
      response += `🎓 Certificado al finalizar\n\n`;
    }
    
    response += `Tenemos cientos de clientes satisfechos 😊\n\n`;
    response += `¿Te gustaría comprarlo?`;
    
    return {
      type: 'quality',
      response,
      nextAction: 'continue',
      confidence: 0.9,
    };
  }
  
  /**
   * Detecta objeción de tiempo
   */
  private static isTimingObjection(msg: string): boolean {
    const keywords = [
      'después', 'despues', 'luego', 'más tarde', 'mas tarde',
      'pensarlo', 'pensar', 'decidir', 'tiempo',
      'mañana', 'semana', 'mes',
    ];
    return keywords.some(kw => msg.includes(kw));
  }
  
  /**
   * Maneja objeción de tiempo
   */
  private static handleTimingObjection(product: Product | undefined): ObjectionResponse {
    if (!product) {
      return {
        type: 'timing',
        response: 'Entiendo que necesitas tiempo para decidir ⏰\n\n¿Hay algo específico que te gustaría saber antes de decidir?',
        nextAction: 'schedule_followup',
        confidence: 0.8,
      };
    }
    
    const price = product.price.toLocaleString('es-CO');
    
    let response = `Entiendo que quieras pensarlo 😊\n\n`;
    response += `Te cuento algo importante:\n\n`;
    response += `⚠️ El precio actual de *${price} COP* es una oferta especial\n`;
    response += `⚠️ Tenemos stock limitado\n`;
    response += `⚠️ Los precios pueden cambiar pronto\n\n`;
    response += `¿Hay algo que te preocupa o que quieras saber antes de decidir? 🤔`;
    
    return {
      type: 'timing',
      response,
      nextAction: 'continue',
      confidence: 0.85,
    };
  }
  
  /**
   * Detecta objeción de comparación
   */
  private static isComparisonObjection(msg: string): boolean {
    // NO es comparación si pide información del producto actual
    const infoKeywords = [
      'informacion de', 'información de', 'sobre este', 'sobre el',
      'de este curso', 'del curso', 'del producto', 'este producto',
      'este curso', 'mas informacion', 'más información',
    ];
    
    if (infoKeywords.some(kw => msg.includes(kw))) {
      return false; // Es solicitud de información, NO comparación
    }
    
    // SÍ es comparación si menciona otros productos
    const keywords = [
      'comparar con', 'otro producto', 'otra opcion', 'otra opción',
      'otras opciones', 'otros cursos', 'otros productos',
      'diferencia con', 'mejor que', 'peor que',
      'cual es mejor', 'cuál es mejor',
    ];
    return keywords.some(kw => msg.includes(kw));
  }
  
  /**
   * Maneja objeción de comparación
   */
  private static handleComparisonObjection(product: Product | undefined): ObjectionResponse {
    if (!product) {
      return {
        type: 'comparison',
        response: '¡Claro! 😊 Puedo mostrarte diferentes opciones\n\n¿Qué tipo de producto buscas?',
        nextAction: 'show_alternatives',
        confidence: 0.8,
      };
    }
    
    let response = `Entiendo que quieras comparar 🔍\n\n`;
    response += `El *${product.name}* destaca por:\n\n`;
    
    // Agregar ventajas competitivas
    if (product.category?.toLowerCase().includes('curso')) {
      response += `✅ Mejor relación calidad-precio\n`;
      response += `✅ Acceso de por vida (no mensualidades)\n`;
      response += `✅ Certificado incluido\n`;
      response += `✅ Actualizaciones gratis\n\n`;
    } else {
      response += `✅ Precio competitivo\n`;
      response += `✅ Garantía extendida\n`;
      response += `✅ Soporte técnico incluido\n`;
      response += `✅ Entrega inmediata\n\n`;
    }
    
    response += `¿Con qué otro producto lo estás comparando? Puedo ayudarte a ver las diferencias 😊`;
    
    return {
      type: 'comparison',
      response,
      nextAction: 'continue',
      confidence: 0.85,
    };
  }
  
  /**
   * Detecta objeción de confianza
   */
  private static isTrustObjection(msg: string): boolean {
    const keywords = [
      'confianza', 'seguro', 'estafa', 'fraude',
      'real', 'verdad', 'mentira', 'engaño',
      'testimonios', 'reseñas', 'opiniones',
    ];
    return keywords.some(kw => msg.includes(kw));
  }
  
  /**
   * Maneja objeción de confianza
   */
  private static handleTrustObjection(product: Product | undefined): ObjectionResponse {
    let response = `Entiendo tu preocupación, es normal 😊\n\n`;
    response += `Te cuento sobre nosotros:\n\n`;
    response += `✅ *Tecnovariedades D&S*\n`;
    response += `✅ Años de experiencia en el mercado\n`;
    response += `✅ Cientos de clientes satisfechos\n`;
    response += `✅ Garantía en todos nuestros productos\n`;
    response += `✅ Soporte post-venta\n\n`;
    response += `📱 Puedes contactarnos al: +57 313 617 4267\n\n`;
    response += `¿Hay algo específico que te preocupa? 🤔`;
    
    return {
      type: 'trust',
      response,
      nextAction: 'continue',
      confidence: 0.9,
    };
  }
  
  /**
   * Detecta objeción de necesidad
   */
  private static isNeedObjection(msg: string): boolean {
    const keywords = [
      'no necesito', 'no lo necesito', 'no me sirve',
      'no es para mi', 'no es para mí',
      'no lo uso', 'no lo usaría',
    ];
    return keywords.some(kw => msg.includes(kw));
  }
  
  /**
   * Maneja objeción de necesidad
   */
  private static handleNeedObjection(product: Product | undefined): ObjectionResponse {
    if (!product) {
      return {
        type: 'need',
        response: 'Entiendo 😊\n\n¿Qué tipo de producto sí te interesaría?',
        nextAction: 'show_alternatives',
        confidence: 0.8,
      };
    }
    
    let response = `Entiendo 😊\n\n`;
    response += `¿Puedo preguntarte qué es lo que buscas exactamente?\n\n`;
    response += `Tal vez tengo algo que se ajuste mejor a tus necesidades 🎯`;
    
    return {
      type: 'need',
      response,
      nextAction: 'show_alternatives',
      confidence: 0.75,
    };
  }
}
