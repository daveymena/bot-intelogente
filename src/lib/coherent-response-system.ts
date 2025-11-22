/**
 * 🗣️ SISTEMA DE RESPUESTAS COHERENTES
 * Genera respuestas personalizadas y coherentes basadas en memoria unificada
 */

import { UnifiedMemory } from './unified-memory-service';

export interface CoherentResponseOptions {
  intent: string;
  context: UnifiedMemory;
  baseResponse?: string;
  tone?: 'professional' | 'friendly' | 'casual';
  includePersonalization?: boolean;
}

export class CoherentResponseSystem {
  private static instance: CoherentResponseSystem;

  static getInstance(): CoherentResponseSystem {
    if (!CoherentResponseSystem.instance) {
      CoherentResponseSystem.instance = new CoherentResponseSystem();
    }
    return CoherentResponseSystem.instance;
  }

  /**
   * Genera respuesta coherente basada en contexto unificado
   */
  generateCoherentResponse(options: CoherentResponseOptions): string {
    const { intent, context, baseResponse, tone = 'friendly', includePersonalization = true } = options;

    let response = baseResponse || this.getBaseResponseForIntent(intent, context);

    // Personalizar según contexto
    if (includePersonalization) {
      response = this.personalizeResponse(response, context, tone);
    }

    // Agregar referencias contextuales
    response = this.addContextualReferences(response, context);

    // Asegurar coherencia temporal
    response = this.ensureTemporalCoherence(response, context);

    return response;
  }

  /**
   * Obtiene respuesta base según intención y contexto
   */
  private getBaseResponseForIntent(intent: string, context: UnifiedMemory): string {
    const responses = {
      greeting: this.getGreetingResponse(context),
      product_info: this.getProductInfoResponse(context),
      price_inquiry: this.getPriceInquiryResponse(context),
      payment_request: this.getPaymentRequestResponse(context),
      objection: this.getObjectionResponse(context),
      confirmation: this.getConfirmationResponse(context)
    };

    return responses[intent as keyof typeof responses] || '¿En qué puedo ayudarte?';
  }

  /**
   * Personaliza respuesta según perfil del cliente
   */
  private personalizeResponse(response: string, context: UnifiedMemory, tone: string): string {
    let personalized = response;

    // Agregar nombre si está disponible
    if (context.userName && context.messageCount > 1) {
      if (tone === 'friendly') {
        personalized = personalized.replace(/^/, `¡Hola ${context.userName}! `);
      } else if (tone === 'professional') {
        personalized = personalized.replace(/^/, `Estimado ${context.userName}, `);
      }
    }

    // Adaptar tono según historial de conversación
    if (context.messageCount > 5) {
      // Cliente recurrente - más directo
      personalized = personalized.replace(/¿En qué puedo ayudarte\?/g, '¿Qué más necesitas?');
    }

    // Considerar presupuesto mencionado
    if (context.budget?.amount) {
      const budget = context.budget.amount;
      if (context.currentProduct && context.currentProduct.price > budget) {
        personalized += `\n\n💰 Veo que tu presupuesto es de $${budget.toLocaleString('es-CO')} COP. Tengo opciones más económicas disponibles.`;
      }
    }

    return personalized;
  }

  /**
   * Agrega referencias contextuales para mantener coherencia
   */
  private addContextualReferences(response: string, context: UnifiedMemory): string {
    let enhanced = response;

    // Referencia al producto actual
    if (context.currentProduct && !response.includes(context.currentProduct.name)) {
      if (context.messageCount > 2) {
        enhanced = enhanced.replace(/^(.*)$/m, `$1\n\n📦 Siguiendo con el ${context.currentProduct.name}...`);
      }
    }

    // Recordar productos anteriores si es relevante
    if (context.productHistory.length > 1 && context.messageCount > 3) {
      const lastProduct = context.productHistory[context.productHistory.length - 1];
      if (lastProduct.name !== context.currentProduct?.name) {
        enhanced += `\n\n📚 Recuerdo que también te interesó el ${lastProduct.name}.`;
      }
    }

    // Mencionar objeciones previas si existen
    if (context.objections.length > 0 && context.messageCount > 2) {
      const lastObjection = context.objections[context.objections.length - 1];
      if (lastObjection.type === 'price') {
        enhanced += `\n\n💰 Sé que el precio fue una preocupación anterior. ¿Quieres que busque alternativas más económicas?`;
      }
    }

    return enhanced;
  }

  /**
   * Asegura coherencia temporal en las respuestas
   */
  private ensureTemporalCoherence(response: string, context: UnifiedMemory): string {
    // Evitar repeticiones innecesarias
    if (context.messageCount < 3) {
      return response; // Permitir cierto nivel de repetición en conversaciones nuevas
    }

    // Si la conversación lleva tiempo, hacer respuestas más concisas
    if (context.messageCount > 10) {
      response = response.replace(/¡Hola! /g, '');
      response = response.replace(/¿En qué puedo ayudarte\?/g, '¿Qué necesitas?');
    }

    return response;
  }

  // Respuestas específicas por intención

  private getGreetingResponse(context: UnifiedMemory): string {
    if (context.messageCount === 1) {
      return '¡Hola! 👋 Soy tu asistente de *Tecnovariedades D&S*\n\n¿En qué puedo ayudarte hoy? Tenemos:\n• 💻 Laptops y tecnología\n• 🏍️ Motos\n• 📚 Cursos digitales\n• 📦 Megapacks educativos';
    } else if (context.currentProduct) {
      return `¡Hola de nuevo! 😊 Seguimos con el *${context.currentProduct.name}*. ¿Qué más necesitas saber?`;
    } else {
      return '¡Hola de nuevo! 😊 ¿En qué más puedo ayudarte?';
    }
  }

  private getProductInfoResponse(context: UnifiedMemory): string {
    if (context.currentProduct) {
      const price = context.currentProduct.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
      return `¡Perfecto! 😊 El *${context.currentProduct.name}* es una excelente opción.\n\n💰 *Precio:* ${price}\n\n¿Te gustaría conocer más detalles o ver las opciones de pago?`;
    }
    return '¿Qué producto te interesa conocer mejor? Puedo mostrarte laptops, motos, cursos o megapacks 📦';
  }

  private getPriceInquiryResponse(context: UnifiedMemory): string {
    if (context.currentProduct) {
      const price = context.currentProduct.price.toLocaleString('es-CO');
      return `El precio del ${context.currentProduct.name} es $${price} COP. ¿Te parece bien o prefieres ver otras opciones?`;
    }
    return '¿De qué producto quieres saber el precio?';
  }

  private getPaymentRequestResponse(context: UnifiedMemory): string {
    if (context.currentProduct) {
      const price = context.currentProduct.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
      return `¡Excelente decisión! 🎉\n\n📦 *Producto:* ${context.currentProduct.name}\n💰 *Total:* ${price}\n\n¿Qué método de pago prefieres?\n\n💳 MercadoPago\n💰 PayPal\n📱 Nequi/Daviplata\n🏦 Consignación\n\nEscribe el nombre del método que prefieras 😊`;
    }
    return '¿Qué producto quieres comprar? Te ayudo con el proceso de pago 💳';
  }

  private getObjectionResponse(context: UnifiedMemory): string {
    const lastObjection = context.objections[context.objections.length - 1];
    if (lastObjection?.type === 'price') {
      return '💰 Entiendo tu preocupación por el precio.\n\nTenemos varias opciones:\n• Métodos de pago flexibles\n• Productos más económicos\n• Ofertas especiales\n\n¿Qué presupuesto tienes en mente? Así puedo mostrarte las mejores opciones 😊';
    } else if (lastObjection?.type === 'quality') {
      return '✅ Entiendo tu preocupación por la calidad.\n\nTodos nuestros productos:\n• Son 100% originales\n• Tienen garantía\n• Cuentan con soporte post-venta\n\n¿Te gustaría ver testimonios de clientes satisfechos?';
    }
    return '🤔 Entiendo tus dudas. ¿Me puedes contar más sobre tu preocupación para ayudarte mejor?';
  }

  private getConfirmationResponse(context: UnifiedMemory): string {
    if (context.paymentIntent && context.currentProduct) {
      const price = context.currentProduct.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
      return `¡Perfecto! 🎉\n\n📦 *${context.currentProduct.name}*\n💰 *${price}*\n\n¿Estás listo para proceder con el pago? Escribe "Sí" para continuar 😊`;
    } else if (context.currentProduct) {
      return `¿Confirmas que quieres el *${context.currentProduct.name}*? Escribe "Sí" para continuar 😊`;
    }
    return '¿Confirmas que quieres continuar con esta opción? 😊';
  }
}