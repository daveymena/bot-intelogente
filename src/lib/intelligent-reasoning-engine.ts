/**
 * Motor de Razonamiento Inteligente
 * Permite al bot razonar sobre situaciones complejas y manejar contextos fuera del tema
 */

interface ReasoningContext {
  userMessage: string;
  conversationHistory: Array<{ role: string; content: string }>;
  currentTopic?: string;
  currentProduct?: any;
  businessInfo: {
    name: string;
    products: string[];
    services: string[];
  };
}

interface ReasoningResult {
  intent: string;
  confidence: number;
  shouldChangeContext: boolean;
  suggestedAction: string;
  reasoning: string;
  isOffTopic: boolean;
}

export class IntelligentReasoningEngine {
  
  /**
   * Analiza el mensaje del usuario y determina la mejor acción
   */
  static async reason(context: ReasoningContext): Promise<ReasoningResult> {
    const { userMessage, currentTopic, currentProduct, businessInfo } = context;
    
    console.log('[Reasoning] 🧠 Analizando mensaje:', userMessage);
    
    // 🎯 Paso 1: Detectar intención principal
    const intent = this.detectIntent(userMessage);
    console.log('[Reasoning] 🎯 Intención detectada:', intent);
    
    // 🎯 Paso 2: Verificar si está fuera del contexto del negocio
    const isOffTopic = this.isOffTopic(userMessage, businessInfo);
    console.log('[Reasoning] 📊 Fuera de tema:', isOffTopic);
    
    // 🎯 Paso 3: Determinar si debe cambiar el contexto
    const shouldChangeContext = this.shouldChangeContext(userMessage, currentTopic, currentProduct);
    console.log('[Reasoning] 🔄 Cambiar contexto:', shouldChangeContext);
    
    // 🎯 Paso 4: Calcular confianza del razonamiento
    const confidence = this.calculateConfidence(intent, isOffTopic, context);
    console.log('[Reasoning] 💯 Confianza:', (confidence * 100).toFixed(0) + '%');
    
    // 🎯 Paso 5: Generar acción sugerida
    const suggestedAction = this.generateAction(intent, isOffTopic, currentProduct);
    
    // 🎯 Paso 6: Construir explicación del razonamiento
    const reasoning = this.buildReasoning(intent, isOffTopic, shouldChangeContext, currentTopic);
    
    return {
      intent,
      confidence,
      shouldChangeContext,
      suggestedAction,
      reasoning,
      isOffTopic
    };
  }
  
  /**
   * Detecta la intención principal del mensaje
   */
  private static detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // 🎯 Intenciones de producto
    if (lowerMessage.includes('precio') || lowerMessage.includes('cuesta') || lowerMessage.includes('cuánto')) {
      return 'query_price';
    }
    
    if (lowerMessage.includes('disponible') || lowerMessage.includes('stock') || lowerMessage.includes('tienen')) {
      return 'check_availability';
    }
    
    if (lowerMessage.includes('características') || lowerMessage.includes('especificaciones') || lowerMessage.includes('detalles')) {
      return 'query_details';
    }
    
    if (lowerMessage.includes('foto') || lowerMessage.includes('imagen') || lowerMessage.includes('ver')) {
      return 'request_image';
    }
    
    // 🎯 Intenciones de pago
    if (lowerMessage.includes('comprar') || lowerMessage.includes('llevar') || lowerMessage.includes('adquirir')) {
      return 'intent_purchase';
    }
    
    if (lowerMessage.includes('pagar') || lowerMessage.includes('pago') || lowerMessage.includes('método')) {
      return 'query_payment';
    }
    
    // 🎯 Intenciones de soporte
    if (lowerMessage.includes('problema') || lowerMessage.includes('ayuda') || lowerMessage.includes('soporte')) {
      return 'request_support';
    }
    
    if (lowerMessage.includes('garantía') || lowerMessage.includes('devolución') || lowerMessage.includes('cambio')) {
      return 'query_warranty';
    }
    
    // 🎯 Intenciones de envío/entrega
    if (lowerMessage.includes('envío') || lowerMessage.includes('entrega') || lowerMessage.includes('llega')) {
      return 'query_shipping';
    }
    
    // 🎯 Intenciones conversacionales
    if (lowerMessage.includes('gracias') || lowerMessage.includes('ok') || lowerMessage.includes('vale')) {
      return 'acknowledgment';
    }
    
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas')) {
      return 'greeting';
    }
    
    // 🎯 Por defecto: búsqueda general
    return 'general_query';
  }
  
  /**
   * Interpreta intenciones implícitas del mensaje y las relaciona con el negocio
   * NUEVO ENFOQUE: Ver cada mensaje como una oportunidad de venta
   */
  private static isOffTopic(message: string, businessInfo: any): boolean {
    // 🎯 NUEVO ENFOQUE: NUNCA rechazar, siempre interpretar
    // El bot debe ser capaz de relacionar CUALQUIER pregunta con el negocio
    
    const lowerMessage = message.toLowerCase();
    
    // ✅ Detectar intenciones implícitas que SÍ se pueden relacionar con productos
    const implicitIntents = {
      // Necesidades de trabajo/productividad → Laptops, cursos de Office
      trabajo: ['trabajar', 'trabajo', 'oficina', 'productividad', 'home office', 'remoto'],
      
      // Necesidades de aprendizaje → Cursos digitales
      aprendizaje: ['aprender', 'estudiar', 'educación', 'conocimiento', 'capacitar', 'mejorar'],
      
      // Necesidades de entretenimiento → Laptops gaming, cursos creativos
      entretenimiento: ['jugar', 'gaming', 'diversión', 'streaming', 'videos', 'películas'],
      
      // Necesidades de transporte → Motos
      transporte: ['movilizar', 'desplazar', 'transporte', 'viajar', 'economizar combustible'],
      
      // Necesidades de desarrollo profesional → Cursos técnicos
      desarrollo: ['crecer', 'avanzar', 'carrera', 'profesional', 'habilidades', 'competencias'],
      
      // Necesidades creativas → Cursos de diseño, laptops para diseño
      creatividad: ['crear', 'diseñar', 'arte', 'creativo', 'proyectos', 'ideas'],
      
      // Necesidades económicas → Productos económicos, megapacks con descuento
      economico: ['ahorrar', 'económico', 'barato', 'presupuesto', 'precio bajo', 'oferta']
    };
    
    // Verificar si el mensaje tiene alguna intención implícita relacionable
    for (const [intent, keywords] of Object.entries(implicitIntents)) {
      const hasIntent = keywords.some(keyword => lowerMessage.includes(keyword));
      if (hasIntent) {
        console.log(`[Reasoning] 💡 Intención implícita detectada: ${intent} - RELACIONABLE CON NEGOCIO`);
        return false; // NO está fuera de tema, es una oportunidad de venta
      }
    }
    
    // Verificar menciones directas de productos/servicios
    const directMentions = [
      'laptop', 'computador', 'portátil', 'pc', 'computadora',
      'curso', 'megapack', 'pack', 'capacitación', 'formación',
      'moto', 'motocicleta', 'vehículo',
      'tecnología', 'software', 'programa', 'aplicación'
    ];
    
    const mentionsProduct = directMentions.some(product => lowerMessage.includes(product));
    if (mentionsProduct) {
      console.log('[Reasoning] ✅ Mención directa de producto detectada');
      return false;
    }
    
    // 🎯 IMPORTANTE: Solo considerar "off-topic" si es completamente irrelevante
    // Ej: insultos, spam, o preguntas absolutamente imposibles de relacionar
    const trulyIrrelevant = [
      'insulto', 'spam', 'publicidad externa',
      // NO incluir clima, deportes, etc - pueden relacionarse con el negocio
    ];
    
    const isIrrelevant = trulyIrrelevant.some(word => lowerMessage.includes(word));
    if (isIrrelevant) {
      console.log('[Reasoning] ⚠️ Mensaje verdaderamente irrelevante detectado');
      return true;
    }
    
    // Por defecto: SI el mensaje es una pregunta o comentario general,
    // considerarlo como oportunidad de venta (NO off-topic)
    console.log('[Reasoning] 🎯 Mensaje interpretable como oportunidad de venta');
    return false;
  }
  
  /**
   * Determina si se debe cambiar el contexto actual
   */
  private static shouldChangeContext(
    message: string, 
    currentTopic?: string, 
    currentProduct?: any
  ): boolean {
    const lowerMessage = message.toLowerCase();
    
    // Indicadores explícitos de cambio de tema
    const changeIndicators = [
      'mejor otro', 'otro producto', 'algo diferente', 'distinto',
      'también tengo', 'qué más', 'otras opciones'
    ];
    
    const hasChangeIndicator = changeIndicators.some(indicator => 
      lowerMessage.includes(indicator)
    );
    
    if (hasChangeIndicator) {
      console.log('[Reasoning] 🔄 Indicador explícito de cambio de tema');
      return true;
    }
    
    // Si hay producto en contexto pero el mensaje no lo menciona
    if (currentProduct && !lowerMessage.includes(currentProduct.name.toLowerCase())) {
      // Buscar menciones de categorías diferentes
      const categoriesInMessage = this.extractCategories(message);
      if (categoriesInMessage.length > 0 && 
          !categoriesInMessage.includes(currentProduct.category?.toLowerCase())) {
        console.log('[Reasoning] 🔄 Usuario pregunta por categoría diferente');
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Extrae categorías mencionadas en el mensaje
   */
  private static extractCategories(message: string): string[] {
    const lowerMessage = message.toLowerCase();
    const categories: string[] = [];
    
    const categoryKeywords: Record<string, string[]> = {
      'digital': ['curso', 'megapack', 'digital', 'online'],
      'physical': ['laptop', 'computador', 'portátil', 'pc'],
      'vehicle': ['moto', 'motocicleta', 'vehículo']
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        categories.push(category);
      }
    }
    
    return categories;
  }
  
  /**
   * Calcula la confianza del razonamiento
   */
  private static calculateConfidence(
    intent: string,
    isOffTopic: boolean,
    context: ReasoningContext
  ): number {
    let confidence = 0.7; // Base
    
    // Aumentar confianza si la intención es clara
    if (['query_price', 'intent_purchase', 'query_payment'].includes(intent)) {
      confidence += 0.2;
    }
    
    // Reducir confianza si está fuera de tema
    if (isOffTopic) {
      confidence -= 0.3;
    }
    
    // Aumentar si hay historial de conversación
    if (context.conversationHistory.length > 2) {
      confidence += 0.1;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }
  
  /**
   * Genera la acción sugerida basada en el razonamiento
   */
  private static generateAction(
    intent: string, 
    isOffTopic: boolean, 
    currentProduct?: any
  ): string {
    // Si está fuera de tema, redirigir al negocio
    if (isOffTopic) {
      return 'redirect_to_business';
    }
    
    // Acciones basadas en intención
    const actionMap: Record<string, string> = {
      'query_price': 'show_price_info',
      'check_availability': 'check_stock',
      'query_details': 'show_product_details',
      'request_image': 'send_product_image',
      'intent_purchase': 'initiate_payment_flow',
      'query_payment': 'show_payment_methods',
      'request_support': 'escalate_to_human',
      'query_warranty': 'show_warranty_info',
      'query_shipping': 'show_shipping_info',
      'acknowledgment': 'acknowledge_kindly',
      'greeting': 'greet_and_offer_help',
      'general_query': 'search_and_respond'
    };
    
    return actionMap[intent] || 'general_response';
  }
  
  /**
   * Construye la explicación del razonamiento
   */
  private static buildReasoning(
    intent: string,
    isOffTopic: boolean,
    shouldChangeContext: boolean,
    currentTopic?: string
  ): string {
    let reasoning = `Intención detectada: ${intent}. `;
    
    if (isOffTopic) {
      reasoning += 'El tema está fuera del alcance del negocio. ';
    }
    
    if (shouldChangeContext) {
      reasoning += `El usuario quiere cambiar de tema${currentTopic ? ` (actualmente: ${currentTopic})` : ''}. `;
    } else if (currentTopic) {
      reasoning += `Mantener contexto actual: ${currentTopic}. `;
    }
    
    return reasoning;
  }
  
  /**
   * Interpreta intenciones implícitas y genera respuesta relacionada con productos
   * NUEVA ESTRATEGIA: Actuar como vendedor inteligente que siempre encuentra conexión
   */
  static interpretImplicitIntent(userMessage: string, businessInfo: any): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // 🎯 Interpretar necesidades implícitas y relacionar con productos
    
    // TRABAJO / PRODUCTIVIDAD
    if (lowerMessage.includes('trabajar') || lowerMessage.includes('trabajo') || 
        lowerMessage.includes('oficina') || lowerMessage.includes('productividad') ||
        lowerMessage.includes('home office') || lowerMessage.includes('remoto')) {
      return `Entiendo que necesitas algo para trabajar 💼. Tengo lo perfecto para ti:\n\n🖥️ Laptops profesionales ideales para trabajo remoto\n📚 Cursos de Office, Excel, productividad\n\n¿Qué te interesa más para mejorar tu productividad? 🎯`;
    }
    
    // APRENDIZAJE / EDUCACIÓN
    if (lowerMessage.includes('aprender') || lowerMessage.includes('estudiar') ||
        lowerMessage.includes('educación') || lowerMessage.includes('conocimiento') ||
        lowerMessage.includes('capacitar')) {
      return `¡Excelente que quieras aprender! 📚 Tenemos opciones perfectas:\n\n✨ Cursos individuales en múltiples áreas\n🎁 Megapacks con 40+ cursos a precio increíble\n💻 Laptops ideales para estudiar\n\n¿Qué área te gustaría dominar? 🎯`;
    }
    
    // GAMING / ENTRETENIMIENTO
    if (lowerMessage.includes('jugar') || lowerMessage.includes('gaming') ||
        lowerMessage.includes('diversión') || lowerMessage.includes('streaming')) {
      return `¡Gaming! 🎮 Déjame mostrarte lo que tengo:\n\n💻 Laptops con gráficas potentes para gaming\n📚 Cursos de diseño de videojuegos\n🎬 Cursos de edición de video para streaming\n\n¿Para qué tipo de juegos o contenido lo necesitas? 🔥`;
    }
    
    // TRANSPORTE / MOVILIDAD
    if (lowerMessage.includes('movilizar') || lowerMessage.includes('desplazar') ||
        lowerMessage.includes('transporte') || lowerMessage.includes('economizar')) {
      return `¿Buscas movilizarte? 🏍️ Tengo justo lo que necesitas:\n\n🏍️ Motos económicas y eficientes\n💰 Excelentes precios y facilidades de pago\n\n¿Te gustaría conocer las opciones disponibles? 🎯`;
    }
    
    // DESARROLLO PROFESIONAL
    if (lowerMessage.includes('crecer') || lowerMessage.includes('avanzar') ||
        lowerMessage.includes('carrera') || lowerMessage.includes('profesional') ||
        lowerMessage.includes('habilidades')) {
      return `¡Invertir en tu desarrollo es la mejor decisión! 💪\n\n📚 Cursos profesionales completos\n🎁 Megapacks con múltiples habilidades\n💻 Herramientas para tu crecimiento profesional\n\n¿En qué área quieres destacar? 🚀`;
    }
    
    // CREATIVIDAD / DISEÑO
    if (lowerMessage.includes('crear') || lowerMessage.includes('diseñar') ||
        lowerMessage.includes('arte') || lowerMessage.includes('creativo') ||
        lowerMessage.includes('proyectos')) {
      return `¡Perfecto para creativos! 🎨\n\n📚 Cursos de diseño gráfico, Photoshop, Illustrator\n💻 Laptops potentes para diseño\n🎁 Megapacks creativos con todo lo que necesitas\n\n¿Qué tipo de proyectos quieres crear? ✨`;
    }
    
    // AHORRO / ECONOMÍA
    if (lowerMessage.includes('ahorrar') || lowerMessage.includes('económico') ||
        lowerMessage.includes('barato') || lowerMessage.includes('presupuesto') ||
        lowerMessage.includes('oferta')) {
      return `¡Tengo las mejores ofertas para ti! 💰\n\n🎁 Megapacks con 40+ cursos por solo $60.000\n💻 Laptops con excelente relación calidad-precio\n✅ Múltiples métodos de pago\n\n¿Cuál es tu presupuesto aproximado? 🎯`;
    }
    
    // RESPUESTA GENÉRICA INTELIGENTE (si no hay match específico)
    return `Entiendo lo que buscas 🤔. En ${businessInfo.name} tenemos:\n\n💻 Tecnología (Laptops, accesorios)\n📚 Educación (Cursos, Megapacks)\n🏍️ Movilidad (Motos)\n\n¿Cuál de estas opciones te ayudaría más con lo que necesitas? 😊`;
  }
  
  /**
   * Mantener método legacy para compatibilidad (ahora usa interpretación)
   */
  static generateOffTopicResponse(businessInfo: any): string {
    // Redirigir al nuevo método de interpretación
    return `Hmm, déjame ayudarte de otra forma 🤔\n\nEn ${businessInfo.name} tenemos:\n💻 Laptops y tecnología\n📚 Cursos y capacitación\n🏍️ Motos\n\n¿Hay algo de esto que te pueda interesar? 😊`;
  }
}
