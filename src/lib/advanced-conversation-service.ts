// 🧠 SERVICIO AVANZADO DE CONVERSACIÓN
// Sistema que nunca se queda sin respuesta

import {
  greetingPatterns,
  generalInquiryPatterns,
  objectionHandling,
  productScenarios,
  recoveryMessages,
  closingTechniques,
  faqResponses,
  findBestResponse,
  detectBuyingSignal,
  detectObjection
} from './training-data';

interface ConversationContext {
  userId: string;
  currentProduct?: string;
  lastInteraction: Date;
  conversationStage: 'greeting' | 'inquiry' | 'presentation' | 'objection' | 'closing';
  userBudget?: number;
  userNeeds?: string[];
  objections: string[];
  buyingSignals: number;
}

class AdvancedConversationService {
  private contexts: Map<string, ConversationContext> = new Map();

  /**
   * Procesa un mensaje y genera la mejor respuesta posible
   */
  async processMessage(userId: string, message: string): Promise<string> {
    const context = this.getOrCreateContext(userId);
    const normalizedMessage = message.toLowerCase().trim();

    // 1. Detectar señales de compra (prioridad máxima)
    if (detectBuyingSignal(normalizedMessage)) {
      context.buyingSignals++;
      return this.handleBuyingSignal(context, normalizedMessage);
    }

    // 2. Detectar objeciones
    const objection = detectObjection(normalizedMessage);
    if (objection) {
      context.conversationStage = 'objection';
      context.objections.push(objection);
      return this.handleObjection(objection, context);
    }

    // 3. Saludos
    if (context.conversationStage === 'greeting' || this.isGreeting(normalizedMessage)) {
      context.conversationStage = 'inquiry';
      return findBestResponse(normalizedMessage, greetingPatterns) || this.getDefaultGreeting();
    }

    // 4. Consultas generales
    const generalResponse = findBestResponse(normalizedMessage, generalInquiryPatterns);
    if (generalResponse) {
      context.conversationStage = 'presentation';
      return generalResponse;
    }

    // 5. Preguntas sobre producto específico
    if (context.currentProduct) {
      const productResponse = this.findProductScenarioResponse(context.currentProduct, normalizedMessage);
      if (productResponse) {
        return productResponse;
      }
    }

    // 6. Preguntas frecuentes
    const faqResponse = this.handleFAQ(normalizedMessage);
    if (faqResponse) {
      return faqResponse;
    }

    // 7. Extracción de intención (fallback inteligente)
    return this.intelligentFallback(normalizedMessage, context);
  }

  /**
   * Maneja señales de compra
   */
  private handleBuyingSignal(context: ConversationContext, message: string): string {
    if (message.includes('cuando') || message.includes('recoger') || message.includes('horario')) {
      return `¡Perfecto! 🎉

📍 PUEDES RECOGER:
- Dirección: [Tu dirección aquí]
- Horario: Lun-Sáb 9am-7pm
- Domingo: 10am-2pm

🚚 O TE LO ENVIAMOS:
- Envío local: $5-10 (mismo día)
- Envío nacional: $15-25 (1-3 días)

¿Prefieres recoger o que te lo enviemos?`;
    }

    if (message.includes('pago') || message.includes('tarjeta') || message.includes('efectivo')) {
      return `💳 FORMAS DE PAGO:

✅ Efectivo (5% descuento adicional)
✅ Transferencia bancaria
✅ Tarjeta débito/crédito
✅ PayPal / MercadoPago
✅ Pago en 2-3 cuotas sin interés

¿Con cuál te gustaría pagar?`;
    }

    if (message.includes('stock') || message.includes('disponible') || message.includes('tienen')) {
      return `✅ ¡SÍ, TENEMOS EN STOCK!

${context.currentProduct ? `El ${context.currentProduct} está disponible para entrega inmediata.` : 'El producto que te interesa está disponible.'}

🎯 PARA ASEGURARLO:
- Apártalo con $50
- O cómpralo ahora y recógelo hoy mismo

¿Lo apartamos?`;
    }

    if (message.includes('factura')) {
      return `📄 SÍ, INCLUYE FACTURA:

✅ Factura fiscal completa
✅ Garantía por escrito
✅ Comprobante de pago
✅ Válida para contabilidad

¿Necesitas factura a nombre de empresa o persona?`;
    }

    // Cierre general
    return this.getClosingResponse(context);
  }

  /**
   * Maneja objeciones
   */
  private handleObjection(objectionType: string, context: ConversationContext): string {
    const objection = objectionHandling[objectionType as keyof typeof objectionHandling];
    
    if (!objection) {
      return this.intelligentFallback('', context);
    }

    const response = objection.responses[0];
    
    // Si es la segunda vez que menciona la misma objeción, ser más agresivo
    const objectionCount = context.objections.filter(o => o === objectionType).length;
    if (objectionCount > 1) {
      return this.handleRepeatedObjection(objectionType, context);
    }

    return response;
  }

  /**
   * Maneja objeciones repetidas con más agresividad
   */
  private handleRepeatedObjection(objectionType: string, context: ConversationContext): string {
    switch (objectionType) {
      case 'price_too_high':
        return `Entiendo que el precio es importante. Déjame ser directo:

💰 ESTE ES EL MEJOR PRECIO que puedo ofrecerte:
- Ya incluye descuento
- Ya incluye accesorios
- Ya incluye garantía

🎯 OPCIONES FINALES:
1️⃣ Apartado de $50 y pagas el resto después
2️⃣ Te muestro algo más económico
3️⃣ Esperamos a que haya promoción (puede tardar semanas)

¿Cuál prefieres? No quiero que pierdas esta oportunidad.`;

      case 'thinking_about_it':
        return `Te entiendo perfectamente. Pero déjame ser honesto:

⏰ REALIDAD:
- Este producto tiene alta demanda
- El precio puede subir mañana
- Puede agotarse hoy mismo

🎁 ÚLTIMA OFERTA:
- Apártalo con $50 (reembolsable si cambias de opinión)
- Precio congelado por 48 horas
- Regalo adicional si decides hoy

¿Qué pierdes? Nada. ¿Qué ganas? Todo.

¿Lo apartamos?`;

      default:
        return this.getClosingResponse(context);
    }
  }

  /**
   * Busca respuesta en escenarios de producto
   */
  private findProductScenarioResponse(productId: string, message: string): string | null {
    const product = productScenarios.find(p => p.productId === productId);
    if (!product) return null;

    for (const scenario of product.scenarios) {
      if (message.includes(scenario.question.toLowerCase())) {
        return scenario.answer;
      }
    }

    return null;
  }

  /**
   * Maneja preguntas frecuentes
   */
  private handleFAQ(message: string): string | null {
    if (message.includes('garantia') || message.includes('garantía')) {
      return faqResponses.warranty;
    }

    if (message.includes('pago') || message.includes('tarjeta') || message.includes('efectivo')) {
      return faqResponses.payment_methods;
    }

    if (message.includes('envio') || message.includes('envío') || message.includes('delivery')) {
      return faqResponses.delivery;
    }

    if (message.includes('donde') || message.includes('ubicacion') || message.includes('ubicación') || message.includes('direccion')) {
      return faqResponses.location;
    }

    if (message.includes('devolucion') || message.includes('devolución') || message.includes('cambio')) {
      return faqResponses.return_policy;
    }

    return null;
  }

  /**
   * Fallback inteligente - NUNCA dice "no sé"
   */
  private intelligentFallback(message: string, context: ConversationContext): string {
    // Analizar palabras clave para inferir intención
    const keywords = this.extractKeywords(message);

    // Si menciona números, probablemente pregunta por precio o specs
    if (/\d+/.test(message)) {
      return `Veo que mencionas números. ¿Estás preguntando por:
- 💰 Precio o presupuesto?
- 📊 Especificaciones técnicas?
- 📦 Cantidad disponible?

Dime específicamente y te ayudo al instante.`;
    }

    // Si es una pregunta
    if (message.includes('?') || message.startsWith('que') || message.startsWith('cual') || 
        message.startsWith('como') || message.startsWith('cuando') || message.startsWith('donde')) {
      return `Excelente pregunta. Para darte la respuesta más precisa:

¿Te refieres a:
- 💻 Características del producto?
- 💰 Precios y formas de pago?
- 🚚 Envío y entrega?
- 🛡️ Garantía y soporte?

Especifícame y te respondo al detalle.`;
    }

    // Si es muy corto o confuso
    if (message.length < 10) {
      return `Quiero ayudarte pero necesito un poco más de información. 

¿Podrías decirme:
- ¿Qué producto te interesa?
- ¿Qué necesitas saber específicamente?

Así te doy la respuesta exacta que buscas. 😊`;
    }

    // Fallback general - redirigir a acción
    return `Entiendo tu consulta. Para ayudarte mejor, dime:

🎯 ¿Qué estás buscando específicamente?

Tenemos:
💻 Computadoras y laptops
📱 Celulares y tablets  
🎮 Gaming y accesorios
⌨️ Periféricos

O si prefieres, llámame al [NÚMERO] y te atiendo personalmente.`;
  }

  /**
   * Extrae palabras clave del mensaje
   */
  private extractKeywords(message: string): string[] {
    const commonWords = ['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'que', 'como', 'para', 'con'];
    return message
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word));
  }

  /**
   * Verifica si es un saludo
   */
  private isGreeting(message: string): boolean {
    const greetings = ['hola', 'buenas', 'buenos', 'hey', 'ola', 'saludos'];
    return greetings.some(g => message.includes(g));
  }

  /**
   * Obtiene o crea contexto de conversación
   */
  private getOrCreateContext(userId: string): ConversationContext {
    if (!this.contexts.has(userId)) {
      this.contexts.set(userId, {
        userId,
        lastInteraction: new Date(),
        conversationStage: 'greeting',
        objections: [],
        buyingSignals: 0
      });
    }

    const context = this.contexts.get(userId)!;
    context.lastInteraction = new Date();
    return context;
  }

  /**
   * Obtiene respuesta de cierre apropiada
   */
  private getClosingResponse(context: ConversationContext): string {
    if (context.buyingSignals >= 2) {
      return closingTechniques.assumed;
    }

    if (context.objections.length > 0) {
      return closingTechniques.benefit;
    }

    return closingTechniques.alternative;
  }

  /**
   * Saludo por defecto
   */
  private getDefaultGreeting(): string {
    return `¡Hola! 👋 Bienvenido a MegaComputer. 

Estoy aquí para ayudarte a encontrar el equipo perfecto para ti.

¿Qué estás buscando hoy?
💻 Computadora
🖥️ Laptop
📱 Celular/Tablet
🎮 Gaming

O dime directamente qué necesitas y te asesoro.`;
  }

  /**
   * Limpia contextos antiguos (llamar periódicamente)
   */
  cleanOldContexts(hoursOld: number = 24): void {
    const now = new Date();
    for (const [userId, context] of this.contexts.entries()) {
      const hoursSinceLastInteraction = 
        (now.getTime() - context.lastInteraction.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastInteraction > hoursOld) {
        this.contexts.delete(userId);
      }
    }
  }
}

export const advancedConversationService = new AdvancedConversationService();
