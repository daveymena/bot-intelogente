/**
 * 💰 Pipeline de Ventas Integral
 * Gestiona el flujo completo desde el primer contacto hasta el cierre
 */

import { ConversationalEngine, ConversationContext, ConversationAnalysis, SalesStage } from './conversational-engine';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock?: number;
  digitalDelivery?: boolean;
  benefits: string[];
}

export interface Customer {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  interests: string[];
  budget?: number;
  previousPurchases: string[];
}

export interface SalesOpportunity {
  id: string;
  customer: Customer;
  stage: SalesStage;
  products: Product[];
  value: number;
  createdAt: Date;
  lastInteraction: Date;
  notes: string;
  conversionProbability: number;
}

export interface SalesResult {
  success: boolean;
  opportunityId: string;
  stage: SalesStage;
  nextAction: string;
  recommendedProducts: Product[];
  message: string;
}

/**
 * Gestor central del pipeline de ventas
 */
export class SalesFlowManager {
  private conversationalEngine: ConversationalEngine;
  private opportunities: Map<string, SalesOpportunity> = new Map();
  private productCatalog: Map<string, Product> = new Map();

  constructor(groqApiKey: string) {
    this.conversationalEngine = new ConversationalEngine(groqApiKey);
  }

  /**
   * Inicia una nueva oportunidad de venta
   */
  async initiateSale(customer: Customer, initialMessage: string): Promise<SalesResult> {
    const opportunityId = this._generateId();

    // Contexto inicial
    const context: ConversationContext = {
      userId: customer.id,
      conversationHistory: [
        {
          role: 'user',
          content: initialMessage,
          timestamp: new Date(),
        },
      ],
      customerProfile: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        interests: customer.interests,
        budget: customer.budget,
        purchaseHistory: [],
      },
      currentStage: 'greeting',
      metadata: {},
    };

    // Analiza la intención del cliente
    const analysis = await this.conversationalEngine.analyzeConversation(context);

    // Genera respuesta profesional
    const responseMessage = await this.conversationalEngine.generateResponse(context, analysis);

    // Actualiza la etapa de venta
    const newStage = this.conversationalEngine.updateSalesStage(
      context.currentStage,
      analysis,
      context
    );

    // Crea la oportunidad
    const opportunity: SalesOpportunity = {
      id: opportunityId,
      customer,
      stage: newStage,
      products: this._recommendProducts(analysis.productRecommendations, customer),
      value: 0,
      createdAt: new Date(),
      lastInteraction: new Date(),
      notes: initialMessage,
      conversionProbability: this._calculateConversionProbability(analysis),
    };

    this.opportunities.set(opportunityId, opportunity);

    return {
      success: true,
      opportunityId,
      stage: newStage,
      nextAction: this._getNextAction(newStage),
      recommendedProducts: opportunity.products,
      message: responseMessage,
    };
  }

  /**
   * Continúa una conversación activa
   */
  async continueConversation(
    opportunityId: string,
    customerMessage: string
  ): Promise<SalesResult> {
    const opportunity = this.opportunities.get(opportunityId);
    if (!opportunity) {
      throw new Error(`Oportunidad ${opportunityId} no encontrada`);
    }

    // Reconstruye el contexto
    const context: ConversationContext = {
      userId: opportunity.customer.id,
      conversationHistory: [
        // Historial previo...
        {
          role: 'user',
          content: customerMessage,
          timestamp: new Date(),
        },
      ],
      customerProfile: {
        name: opportunity.customer.name,
        phone: opportunity.customer.phone,
        email: opportunity.customer.email,
        interests: opportunity.customer.interests,
        budget: opportunity.customer.budget,
        purchaseHistory: opportunity.customer.previousPurchases.map(id => ({
          productId: id,
          productName: this.productCatalog.get(id)?.name || 'Producto',
          date: new Date(),
          amount: 0,
          status: 'completed',
        })),
      },
      currentStage: opportunity.stage,
      metadata: {},
    };

    // Analiza
    const analysis = await this.conversationalEngine.analyzeConversation(context);

    // Manejo especial de objeciones
    let responseMessage = await this.conversationalEngine.generateResponse(context, analysis);
    if (analysis.hasObjection) {
      responseMessage = await this._handleObjection(opportunity, customerMessage, responseMessage);
    }

    // Actualiza etapa
    const newStage = this.conversationalEngine.updateSalesStage(
      opportunity.stage,
      analysis,
      context
    );

    // Verifica si está listo para cerrar
    if (analysis.shouldOfferProduct && newStage !== 'closing') {
      responseMessage = await this._prepareClosingOffer(opportunity, responseMessage);
    }

    // Actualiza la oportunidad
    opportunity.stage = newStage;
    opportunity.lastInteraction = new Date();
    opportunity.conversionProbability = this._calculateConversionProbability(analysis);

    if (analysis.shouldOfferProduct) {
      opportunity.products = this._recommendProducts(
        analysis.productRecommendations,
        opportunity.customer
      );
      opportunity.value = opportunity.products.reduce((sum, p) => sum + p.price, 0);
    }

    return {
      success: true,
      opportunityId,
      stage: newStage,
      nextAction: this._getNextAction(newStage),
      recommendedProducts: opportunity.products,
      message: responseMessage,
    };
  }

  /**
   * Cierra una venta (genera link de pago, confirma compra, etc.)
   */
  async closeSale(opportunityId: string, products: Product[]): Promise<{
    success: boolean;
    paymentLink?: string;
    confirmationMessage: string;
    deliveryInfo: string;
  }> {
    const opportunity = this.opportunities.get(opportunityId);
    if (!opportunity) {
      throw new Error(`Oportunidad ${opportunityId} no encontrada`);
    }

    const totalAmount = products.reduce((sum, p) => sum + p.price, 0);

    // Aquí iría la integración con el sistema de pagos
    // Por ahora, simula el comportamiento
    const paymentLink = `https://pago.tuapp.com/checkout/${opportunityId}?total=${totalAmount}`;

    const confirmationMessage = `
¡Excelente! 🎉 Tu pedido está confirmado.

📦 **Resumen de tu compra:**
${products.map(p => `• ${p.name} - $${p.price.toLocaleString('es-CO')}`).join('\n')}

💰 **Total: $${totalAmount.toLocaleString('es-CO')}**

🔗 **Procesa tu pago aquí:** ${paymentLink}

Después del pago recibirás un correo de confirmación con todos los detalles de entrega.
    `;

    opportunity.stage = 'post_sale';

    return {
      success: true,
      paymentLink,
      confirmationMessage,
      deliveryInfo: this._generateDeliveryInfo(products),
    };
  }

  /**
   * Obtiene el estado actual de una oportunidad
   */
  getOpportunity(opportunityId: string): SalesOpportunity | null {
    return this.opportunities.get(opportunityId) || null;
  }

  /**
   * Maneja objeciones del cliente
   */
  private async _handleObjection(
    opportunity: SalesOpportunity,
    customerObjection: string,
    initialResponse: string
  ): Promise<string> {
    // Aquí iría lógica más sofisticada de manejo de objeciones
    // Por ahora, retorna la respuesta inicial enriquecida
    return `
Entiendo tu preocupación. 🤔 ${initialResponse}

Si tienes más dudas específicas, estoy aquí para ayudarte. ¿Hay algo más que quieras saber?
    `;
  }

  /**
   * Prepara la oferta de cierre
   */
  private async _prepareClosingOffer(
    opportunity: SalesOpportunity,
    baseMessage: string
  ): Promise<string> {
    const products = opportunity.products;
    const total = products.reduce((sum, p) => sum + p.price, 0);

    return `
${baseMessage}

---

📋 **Hemos preparado lo perfecto para ti:**

${products
  .map(p => `✅ **${p.name}** - $${p.price.toLocaleString('es-CO')}
   ${p.description}
   ${p.benefits.join(' • ')}`)
  .join('\n\n')}

💰 **Inversión total:** $${total.toLocaleString('es-CO')}

¿Procedemos? Solo necesito tu confirmación. 👇
    `;
  }

  /**
   * Genera información de entrega
   */
  private _generateDeliveryInfo(products: Product[]): string {
    const hasDigital = products.some(p => p.digitalDelivery);
    const hasPhysical = products.some(p => !p.digitalDelivery);

    let info = '';

    if (hasDigital) {
      info += `
📲 **Productos Digitales:** Se entregarán inmediatamente después del pago por correo.
      `;
    }

    if (hasPhysical) {
      info += `
🚚 **Productos Físicos:** Se entregarán en 1-3 días hábiles según tu ubicación.
      `;
    }

    return info;
  }

  /**
   * Recomienda productos basado en análisis
   */
  private _recommendProducts(productIds: string[], _customer: Customer): Product[] {
    return productIds
      .map(id => this.productCatalog.get(id))
      .filter((p): p is Product => p !== undefined);
  }

  /**
   * Calcula probabilidad de conversión
   */
  private _calculateConversionProbability(analysis: ConversationAnalysis): number {
    let probability = 0.5; // Base 50%

    if (analysis.sentiment === 'positive') probability += 0.2;
    if (analysis.shouldOfferProduct) probability += 0.15;
    if (!analysis.hasObjection) probability += 0.1;

    return Math.min(probability, 1);
  }

  /**
   * Obtiene la siguiente acción recomendada
   */
  private _getNextAction(stage: SalesStage): string {
    const actions: Record<SalesStage, string> = {
      greeting: 'Recibe al cliente calurosamente y pregunta qué le trae hoy',
      needs_analysis: 'Profundiza en las necesidades específicas del cliente',
      product_discovery: 'Presenta productos que se alineen con sus necesidades',
      objection_handling: 'Aborda sus preocupaciones con empatía e información',
      pricing: 'Presenta opciones de pago flexible y valor agregado',
      closing: 'Facilita la compra con links claros y pasos simples',
      post_sale: 'Agradece, ofrece soporte y solicita referrals',
    };

    return actions[stage] || 'Continúa con la conversación de venta';
  }

  /**
   * Genera ID único
   */
  private _generateId(): string {
    return `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================
  // Métodos públicos para gestión del catálogo
  // ============================================

  addProduct(product: Product): void {
    this.productCatalog.set(product.id, product);
  }

  getProduct(productId: string): Product | undefined {
    return this.productCatalog.get(productId);
  }

  getAllProducts(): Product[] {
    return Array.from(this.productCatalog.values());
  }
}

export function createSalesFlowManager(groqApiKey: string): SalesFlowManager {
  return new SalesFlowManager(groqApiKey);
}
