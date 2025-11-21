/**
 * Agente Intérprete
 * Reinterpreta consultas ambiguas para entender la intención REAL del cliente
 * Actúa como traductor interno entre el cliente y los demás agentes
 */

import { BaseAgent, AgentResponse } from './base-agent';
import { SharedMemory } from './shared-memory';

export class InterpreterAgent extends BaseAgent {
  constructor() {
    super('InterpreterAgent');
  }
  
  /**
   * Ejecuta el agente intérprete
   */
  async execute(message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('🧠 Interpretando intención real del cliente...');
    
    const interpretation = await this.interpretQuery(message, memory);
    
    this.log(`✅ Interpretación: ${interpretation.intent}`);
    this.log(`📝 Detalles: ${JSON.stringify(interpretation.details)}`);
    
    return {
      text: '', // No responde directamente, solo interpreta
      nextAgent: interpretation.nextAgent,
      confidence: interpretation.confidence,
      metadata: {
        interpretation: interpretation
      }
    };
  }
  
  /**
   * Interpreta la consulta del cliente
   */
  private async interpretQuery(message: string, memory: SharedMemory): Promise<Interpretation> {
    const cleanMsg = this.cleanMessage(message);
    
    // 1. BÚSQUEDA DE PRODUCTOS (no específica)
    if (this.isGeneralProductInquiry(cleanMsg)) {
      return this.interpretProductInquiry(cleanMsg, memory);
    }
    
    // 2. BÚSQUEDA ESPECÍFICA (con detalles)
    if (this.isSpecificProductSearch(cleanMsg)) {
      return this.interpretSpecificSearch(cleanMsg, memory);
    }
    
    // 3. MÉTODOS DE PAGO
    if (this.isPaymentInquiry(cleanMsg)) {
      return this.interpretPaymentInquiry(cleanMsg, memory);
    }
    
    // 4. INFORMACIÓN DE PRODUCTO
    if (this.isProductInfoRequest(cleanMsg)) {
      return this.interpretProductInfo(cleanMsg, memory);
    }
    
    // 5. PRESUPUESTO
    if (this.isBudgetInquiry(cleanMsg)) {
      return this.interpretBudgetInquiry(cleanMsg, memory);
    }
    
    // 6. DISPONIBILIDAD
    if (this.isAvailabilityCheck(cleanMsg)) {
      return this.interpretAvailability(cleanMsg, memory);
    }
    
    // 7. COMPARACIÓN
    if (this.isComparison(cleanMsg)) {
      return this.interpretComparison(cleanMsg, memory);
    }
    
    // Por defecto, búsqueda general
    return {
      intent: 'search',
      confidence: 0.5,
      nextAgent: 'search',
      details: {
        query: message,
        type: 'general'
      }
    };
  }
  
  /**
   * Interpreta consulta general de productos
   * Ejemplo: "portátiles" → quiere ver opciones, no comprar específico
   */
  private interpretProductInquiry(message: string, memory: SharedMemory): Interpretation {
    const category = this.detectCategory(message);
    
    return {
      intent: 'browse_category',
      confidence: 0.9,
      nextAgent: 'search',
      details: {
        query: message,
        type: 'category_browse',
        category: category,
        needsOptions: true,
        clarification: `El cliente quiere ver opciones de ${category}. Debe preguntarle:
- ¿Para qué uso? (trabajo, estudio, gaming, diseño)
- ¿Cuál es su presupuesto?
- ¿Características específicas?`
      }
    };
  }
  
  /**
   * Interpreta búsqueda específica
   * Ejemplo: "curso de piano" → quiere ESE curso específico
   */
  private interpretSpecificSearch(message: string, memory: SharedMemory): Interpretation {
    const specificTerms = this.extractSpecificTerms(message);
    
    return {
      intent: 'specific_product',
      confidence: 0.95,
      nextAgent: 'search',
      details: {
        query: message,
        type: 'specific_search',
        specificTerms: specificTerms,
        needsExactMatch: true,
        clarification: `El cliente busca específicamente: ${specificTerms.join(', ')}`
      }
    };
  }
  
  /**
   * Interpreta consulta de métodos de pago
   */
  private interpretPaymentInquiry(message: string, memory: SharedMemory): Interpretation {
    const paymentMethod = this.detectPaymentMethod(message);
    
    if (paymentMethod) {
      return {
        intent: 'specific_payment_method',
        confidence: 0.95,
        nextAgent: 'payment',
        details: {
          query: message,
          type: 'payment_method',
          method: paymentMethod,
          clarification: `El cliente quiere pagar por ${paymentMethod}. Enviar:
- MercadoPago/PayPal: Link dinámico
- Nequi/Daviplata: Número y esperar comprobante
- Contraentrega: Confirmar dirección`
        }
      };
    }
    
    return {
      intent: 'payment_options',
      confidence: 0.9,
      nextAgent: 'payment',
      details: {
        query: message,
        type: 'payment_inquiry',
        clarification: 'El cliente quiere saber las opciones de pago disponibles'
      }
    };
  }
  
  /**
   * Interpreta solicitud de información de producto
   */
  private interpretProductInfo(message: string, memory: SharedMemory): Interpretation {
    const infoType = this.detectInfoType(message);
    
    return {
      intent: 'product_details',
      confidence: 0.9,
      nextAgent: 'product',
      details: {
        query: message,
        type: 'info_request',
        infoType: infoType,
        clarification: `El cliente quiere saber sobre: ${infoType}`
      }
    };
  }
  
  /**
   * Interpreta consulta de presupuesto
   */
  private interpretBudgetInquiry(message: string, memory: SharedMemory): Interpretation {
    const budget = this.extractBudget(message);
    
    return {
      intent: 'budget_search',
      confidence: 0.95,
      nextAgent: 'search',
      details: {
        query: message,
        type: 'budget_based',
        budget: budget,
        clarification: `El cliente tiene presupuesto de ${budget}. Mostrar opciones dentro de ese rango.`
      }
    };
  }
  
  /**
   * Interpreta consulta de disponibilidad
   */
  private interpretAvailability(message: string, memory: SharedMemory): Interpretation {
    return {
      intent: 'check_availability',
      confidence: 0.9,
      nextAgent: 'search',
      details: {
        query: message,
        type: 'availability',
        clarification: 'El cliente quiere saber si hay disponibilidad, no está comprando aún'
      }
    };
  }
  
  /**
   * Interpreta solicitud de comparación
   */
  private interpretComparison(message: string, memory: SharedMemory): Interpretation {
    return {
      intent: 'compare_products',
      confidence: 0.9,
      nextAgent: 'product',
      details: {
        query: message,
        type: 'comparison',
        clarification: 'El cliente quiere comparar opciones antes de decidir'
      }
    };
  }
  
  // ============================================
  // FUNCIONES DE DETECCIÓN
  // ============================================
  
  private isGeneralProductInquiry(message: string): boolean {
    const patterns = [
      /^(tienen|hay|venden|manejan|trabajan)\s+(portatil|laptop|moto|curso|impresora)/i,
      /^(busco|necesito|quiero|me interesa)\s+(portatil|laptop|moto|curso|impresora)/i,
      /^(portatil|laptop|moto|curso|impresora)s?$/i,
      /disponible.*(portatil|laptop|moto|curso)/i
    ];
    
    return patterns.some(p => p.test(message));
  }
  
  private isSpecificProductSearch(message: string): boolean {
    const patterns = [
      /curso\s+de\s+\w+/i,
      /megapack\s+de\s+\w+/i,
      /(portatil|laptop)\s+(gaming|diseño|trabajo)/i,
      /moto\s+(bajaj|yamaha|honda)/i,
      /\w+\s+(especifico|particular|exacto)/i
    ];
    
    return patterns.some(p => p.test(message));
  }
  
  private isPaymentInquiry(message: string): boolean {
    const patterns = [
      /(como|cual|que)\s+(pago|pagar|forma|metodo)/i,
      /(mercadopago|paypal|nequi|daviplata|contraentrega)/i,
      /opciones?\s+de\s+pago/i,
      /puedo\s+pagar/i
    ];
    
    return patterns.some(p => p.test(message));
  }
  
  private isProductInfoRequest(message: string): boolean {
    const patterns = [
      /(caracteristica|especificacion|detalle|informacion)/i,
      /(como|que)\s+(es|tiene|trae|incluye)/i,
      /mas\s+(info|informacion|detalle)/i,
      /(garantia|entrega|envio)/i
    ];
    
    return patterns.some(p => p.test(message));
  }
  
  private isBudgetInquiry(message: string): boolean {
    const patterns = [
      /presupuesto\s+de\s+\$?\d+/i,
      /tengo\s+\$?\d+/i,
      /hasta\s+\$?\d+/i,
      /entre\s+\$?\d+\s+y\s+\$?\d+/i,
      /economico|barato|precio/i
    ];
    
    return patterns.some(p => p.test(message));
  }
  
  private isAvailabilityCheck(message: string): boolean {
    const patterns = [
      /(tienen|hay|existe|manejan)\s+disponible/i,
      /en\s+stock/i,
      /disponibilidad/i
    ];
    
    return patterns.some(p => p.test(message));
  }
  
  private isComparison(message: string): boolean {
    const patterns = [
      /(diferencia|comparar|cual\s+es\s+mejor)/i,
      /entre\s+\w+\s+y\s+\w+/i,
      /(opciones|alternativas)/i
    ];
    
    return patterns.some(p => p.test(message));
  }
  
  // ============================================
  // FUNCIONES DE EXTRACCIÓN
  // ============================================
  
  private detectCategory(message: string): string {
    if (/portatil|laptop|computador/i.test(message)) return 'portátiles';
    if (/moto|motocicleta/i.test(message)) return 'motos';
    if (/curso/i.test(message)) return 'cursos';
    if (/megapack/i.test(message)) return 'megapacks';
    if (/impresora/i.test(message)) return 'impresoras';
    if (/servicio|reparacion/i.test(message)) return 'servicios';
    return 'productos';
  }
  
  private extractSpecificTerms(message: string): string[] {
    const terms: string[] = [];
    
    // Extraer términos específicos
    const patterns = [
      /curso\s+de\s+(\w+)/i,
      /megapack\s+de\s+(\w+)/i,
      /(gaming|diseño|trabajo|estudio)/i,
      /(bajaj|yamaha|honda|suzuki)/i,
      /(piano|guitarra|ingles|frances)/i
    ];
    
    patterns.forEach(pattern => {
      const match = message.match(pattern);
      if (match) {
        terms.push(match[1] || match[0]);
      }
    });
    
    return terms;
  }
  
  private detectPaymentMethod(message: string): string | null {
    if (/mercadopago|mercado\s+pago/i.test(message)) return 'MercadoPago';
    if (/paypal/i.test(message)) return 'PayPal';
    if (/nequi/i.test(message)) return 'Nequi';
    if (/daviplata/i.test(message)) return 'Daviplata';
    if (/contraentrega|contra\s+entrega/i.test(message)) return 'Contraentrega';
    if (/transferencia|bancolombia/i.test(message)) return 'Transferencia';
    return null;
  }
  
  private detectInfoType(message: string): string {
    if (/caracteristica|especificacion/i.test(message)) return 'características técnicas';
    if (/garantia/i.test(message)) return 'garantía';
    if (/entrega|envio/i.test(message)) return 'información de entrega';
    if (/precio|costo|valor/i.test(message)) return 'precio';
    if (/incluye|trae/i.test(message)) return 'qué incluye';
    return 'información general';
  }
  
  private extractBudget(message: string): string {
    const match = message.match(/\$?([\d,\.]+)/);
    if (match) {
      return `$${match[1]}`;
    }
    
    if (/economico|barato/i.test(message)) return 'económico';
    if (/premium|alto/i.test(message)) return 'premium';
    
    return 'no especificado';
  }
}

// Tipos
interface Interpretation {
  intent: string;
  confidence: number;
  nextAgent: string;
  details: {
    query: string;
    type: string;
    clarification?: string;
    [key: string]: any;
  };
}
