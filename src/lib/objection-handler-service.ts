/**
 * 🛡️ SISTEMA DE MANEJO DE OBJECIONES Y PREGUNTAS FRECUENTES
 *
 * Maneja objeciones comunes y responde preguntas frecuentes de forma inteligente:
 * - Objeciones de precio
 * - Dudas sobre calidad
 * - Preguntas sobre garantía
 * - Comparaciones con competencia
 * - Preguntas frecuentes (FAQ)
 */

import { ConversationLearningService } from './conversation-learning-service'

export type ObjectionType =
  | 'price_too_high'
  | 'need_to_think'
  | 'found_cheaper'
  | 'quality_doubt'
  | 'warranty_concern'
  | 'shipping_concern'
  | 'payment_concern'
  | 'trust_issue'
  | 'timing_issue'
  | 'comparison_request'

interface ObjectionResponse {
  type: ObjectionType
  response: string
  followUp?: string
  confidence: number
}

interface FAQ {
  question: string
  keywords: string[]
  answer: string
  category: string
}

export class ObjectionHandlerService {
  /**
   * Respuestas a objeciones comunes
   */
  private static objectionResponses: Record<ObjectionType, string[]> = {
    price_too_high: [
      '💰 Entiendo tu preocupación por el precio. Este producto tiene una excelente relación calidad-precio porque incluye [características]. Además, ofrecemos facilidades de pago que pueden ayudarte.',
      '💰 El precio refleja la calidad y durabilidad del producto. A largo plazo, es una inversión que vale la pena. ¿Te gustaría conocer nuestras opciones de pago?',
      '💰 Comprendo que el precio es importante. Este producto incluye garantía y soporte, lo que lo hace una compra segura. ¿Qué presupuesto tenías en mente?'
    ],

    need_to_think: [
      '🤔 ¡Por supuesto! Es una decisión importante. ¿Hay algo específico que te gustaría saber para ayudarte a decidir?',
      '🤔 Entiendo perfectamente. Tómate tu tiempo. Si tienes alguna duda o necesitas más información, estoy aquí para ayudarte.',
      '🤔 Claro, es normal querer pensarlo. ¿Hay alguna preocupación específica que pueda resolver para ti?'
    ],

    found_cheaper: [
      '🔍 Entiendo que hayas encontrado opciones más económicas. Nuestros productos se destacan por [calidad/garantía/soporte]. ¿Te gustaría que te explique las diferencias?',
      '🔍 Es importante comparar no solo el precio, sino también la calidad, garantía y servicio post-venta. Nosotros ofrecemos [ventajas]. ¿Qué características son más importantes para ti?',
      '🔍 Aprecio que compares opciones. Nuestro precio incluye [beneficios adicionales] que otras opciones no tienen. ¿Te gustaría conocer más detalles?'
    ],

    quality_doubt: [
      '✅ Excelente pregunta. Todos nuestros productos son [originales/probados]. Además, ofrecemos garantía de [X meses/años] para tu tranquilidad.',
      '✅ La calidad es nuestra prioridad. Este producto tiene [certificaciones/reviews positivos/garantía]. ¿Te gustaría ver testimonios de otros clientes?',
      '✅ Entiendo tu preocupación. Trabajamos solo con [proveedores confiables/marcas reconocidas] y todos nuestros productos pasan por control de calidad.'
    ],

    warranty_concern: [
      '🛡️ ¡Gran pregunta! Ofrecemos garantía de [X meses/años] que cubre [detalles]. Además, nuestro servicio post-venta está siempre disponible para ayudarte.',
      '🛡️ Todos nuestros productos incluyen garantía oficial. Si tienes algún problema, lo resolvemos rápidamente. Tu satisfacción es nuestra prioridad.',
      '🛡️ La garantía cubre [detalles específicos]. Además, tenemos un proceso de reclamación muy sencillo y rápido.'
    ],

    shipping_concern: [
      '📦 Hacemos envíos a toda Colombia. El tiempo de entrega es de [X días] y el costo es de [X COP] o gratis en compras superiores a [X COP].',
      '📦 Trabajamos con transportadoras confiables. Tu pedido llega en [X días] con seguimiento en tiempo real. ¿A qué ciudad lo necesitas?',
      '📦 El envío es seguro y rápido. Empacamos todo con cuidado y te damos el número de guía para que sigas tu pedido.'
    ],

    payment_concern: [
      '💳 ¡Claro! En Tecnovariedades D&S aceptamos múltiples formas de pago 100% seguras:\n\n• 💳 MercadoPago (tarjetas, PSE, efectivo)\n• 💰 PayPal (tarjetas internacionales)\n• 📱 Nequi y Daviplata\n• 🏦 Consignación bancaria\n• 🚚 Contraentrega (productos físicos)\n\n¿Con cuál prefieres pagar?',
      '💳 Puedes pagar de la forma que te resulte más cómoda:\n\n✅ Tarjeta de crédito/débito\n✅ Transferencia bancaria\n✅ Nequi o Daviplata\n✅ Efectivo contraentrega\n\nTodos nuestros métodos son seguros y verificados. ¿Cuál prefieres?',
      '💳 Trabajamos con plataformas certificadas y seguras:\n\n🔒 MercadoPago (protección al comprador)\n🔒 PayPal (garantía internacional)\n🔒 Transferencias directas\n\nTu información está 100% protegida. ¿Qué método te gustaría usar?'
    ],

    trust_issue: [
      '🤝 Entiendo tu preocupación. Somos una empresa establecida con [X años] de experiencia. Tenemos cientos de clientes satisfechos.',
      '🤝 Tu confianza es importante para nosotros. Puedes ver nuestras reseñas y testimonios. Además, ofrecemos garantía de satisfacción.',
      '🤝 Trabajamos con transparencia total. Puedes verificar nuestros productos, garantías y políticas antes de comprar.'
    ],

    timing_issue: [
      '⏰ Entiendo que el timing es importante. ¿Cuándo necesitarías el producto? Podemos coordinar la entrega según tu disponibilidad.',
      '⏰ No hay problema. Podemos reservar el producto para ti. ¿Cuándo te gustaría recibirlo?',
      '⏰ Perfecto, podemos ajustarnos a tus tiempos. El producto estará disponible cuando lo necesites.'
    ],

    comparison_request: [
      '⚖️ Claro, te ayudo a comparar. [Producto A] es mejor para [uso], mientras que [Producto B] destaca en [característica]. ¿Qué es más importante para ti?',
      '⚖️ Ambos son excelentes opciones. La diferencia principal está en [característica]. Según tu necesidad de [X], te recomendaría [opción].',
      '⚖️ Te explico las diferencias: [comparación detallada]. ¿Cuál se ajusta mejor a lo que buscas?'
    ]
  }

  /**
   * Preguntas frecuentes (FAQ)
   */
  private static faqs: FAQ[] = [
    {
      question: '¿Hacen envíos a toda Colombia?',
      keywords: ['envío', 'envían', 'colombia', 'ciudades', 'departamentos'],
      answer: '📦 ¡Sí! Hacemos envíos a toda Colombia. El tiempo de entrega varía según la ciudad (1-5 días hábiles). El costo depende del destino y peso del producto.',
      category: 'shipping'
    },
    {
      question: '¿Cuáles son los métodos de pago?',
      keywords: ['pago', 'pagar', 'métodos', 'formas', 'tarjeta', 'efectivo'],
      answer: '💳 Aceptamos: Tarjetas de crédito/débito, MercadoPago, PayPal, Nequi, Daviplata, transferencias bancarias y efectivo contra entrega.',
      category: 'payment'
    },
    {
      question: '¿Los productos tienen garantía?',
      keywords: ['garantía', 'garantia', 'cobertura', 'protección'],
      answer: '🛡️ Sí, todos nuestros productos incluyen garantía. Los productos físicos tienen garantía del fabricante (6-12 meses) y los digitales tienen garantía de satisfacción.',
      category: 'warranty'
    },
    {
      question: '¿Cuánto demora la entrega?',
      keywords: ['demora', 'tiempo', 'cuánto tarda', 'días', 'entrega'],
      answer: '⏰ El tiempo de entrega depende de tu ubicación: Bogotá (1-2 días), ciudades principales (2-3 días), otras ciudades (3-5 días hábiles).',
      category: 'shipping'
    },
    {
      question: '¿Puedo devolver el producto?',
      keywords: ['devolver', 'devolución', 'cambio', 'reembolso'],
      answer: '🔄 Sí, tienes 5 días para devoluciones en productos físicos (sin usar, en empaque original). Productos digitales no aplican para devolución una vez entregados.',
      category: 'returns'
    },
    {
      question: '¿Los productos son originales?',
      keywords: ['original', 'originales', 'auténtico', 'genuino', 'falso'],
      answer: '✅ ¡Absolutamente! Todos nuestros productos son 100% originales. Trabajamos directamente con distribuidores autorizados y ofrecemos garantía de autenticidad.',
      category: 'quality'
    },
    {
      question: '¿Tienen tienda física?',
      keywords: ['tienda', 'física', 'local', 'dirección', 'ubicación', 'visitar'],
      answer: '🏪 Actualmente operamos principalmente online para ofrecerte mejores precios. Hacemos entregas personales en Bogotá y envíos a todo el país.',
      category: 'general'
    },
    {
      question: '¿Puedo pagar en cuotas?',
      keywords: ['cuotas', 'financiación', 'plazos', 'mensualidades'],
      answer: '💰 Sí, puedes pagar en cuotas con tarjeta de crédito a través de MercadoPago o PayPal. El número de cuotas depende de tu banco.',
      category: 'payment'
    }
  ]

  /**
   * Detectar y manejar objeción
   */
  static handleObjection(
    message: string,
    userId: string,
    productContext?: any
  ): ObjectionResponse | null {
    const normalizedMessage = message.toLowerCase().trim()

    // Detectar tipo de objeción
    const objectionType = this.detectObjectionType(normalizedMessage)

    if (!objectionType) {
      return null
    }

    // Obtener respuesta apropiada
    const responses = this.objectionResponses[objectionType]
    const response = responses[Math.floor(Math.random() * responses.length)]

    // Personalizar respuesta con contexto del producto
    let personalizedResponse = response
    if (productContext) {
      personalizedResponse = response
        .replace('[características]', productContext.features || 'excelentes características')
        .replace('[X meses/años]', productContext.warranty || '12 meses')
        .replace('[X días]', productContext.deliveryDays || '3-5')
        .replace('[X COP]', productContext.shippingCost || '15,000')
    }

    // Registrar para aprendizaje
    ConversationLearningService.recordSuccessfulPattern(
      userId,
      'objection_handling',
      message,
      personalizedResponse,
      `objection_${objectionType}`,
      { objectionType, productContext }
    ).catch(console.error)

    return {
      type: objectionType,
      response: personalizedResponse,
      followUp: this.getFollowUpQuestion(objectionType),
      confidence: 0.85
    }
  }

  /**
   * Responder pregunta frecuente
   */
  static answerFAQ(message: string, userId: string): string | null {
    const normalizedMessage = message.toLowerCase().trim()

    // Buscar FAQ que coincida
    for (const faq of this.faqs) {
      const matchScore = faq.keywords.filter(keyword =>
        normalizedMessage.includes(keyword)
      ).length

      if (matchScore >= 2 || faq.keywords.some(k => normalizedMessage.includes(k) && k.length > 6)) {
        // Registrar para aprendizaje
        ConversationLearningService.recordSuccessfulPattern(
          userId,
          'faq_response',
          message,
          faq.answer,
          `faq_${faq.category}`,
          { category: faq.category, question: faq.question }
        ).catch(console.error)

        return faq.answer
      }
    }

    return null
  }

  /**
   * Detectar tipo de objeción
   */
  private static detectObjectionType(message: string): ObjectionType | null {
    // ⚠️ IMPORTANTE: Excluir nombres de métodos de pago para no confundirlos con objeciones
    const paymentMethods = [
      'mercadopago', 'mercado pago', 'paypal', 'nequi', 'daviplata',
      'contraentrega', 'contra entrega', 'transferencia', 'consignacion',
      'consignación', 'tarjeta', 'efectivo', 'pse'
    ];
    
    const msgLower = message.toLowerCase().trim();
    
    // Si el mensaje es exactamente un método de pago, NO es una objeción
    if (paymentMethods.some(method => msgLower === method || msgLower.includes(method))) {
      return null;
    }
    
    const objectionPatterns: Record<ObjectionType, string[]> = {
      price_too_high: ['caro', 'costoso', 'mucho', 'precio alto', 'muy costoso'],
      need_to_think: ['pensarlo', 'pensar', 'decidir', 'consultar', 'tiempo'],
      found_cheaper: ['más barato', 'encontré', 'vi más económico', 'otro lugar'],
      quality_doubt: ['calidad', 'bueno', 'confiable', 'dura', 'resistente'],
      warranty_concern: ['garantía', 'garantia', 'cobertura', 'protección'],
      shipping_concern: ['envío', 'entrega', 'demora', 'llega'],
      payment_concern: ['como pago', 'puedo pagar', 'es seguro pagar'],
      trust_issue: ['confianza', 'seguro', 'estafa', 'real'],
      timing_issue: ['tiempo', 'prisa', 'urgente', 'cuándo'],
      comparison_request: ['diferencia', 'comparar', 'mejor', 'versus']
    }

    for (const [type, patterns] of Object.entries(objectionPatterns)) {
      if (patterns.some(pattern => message.includes(pattern))) {
        return type as ObjectionType
      }
    }

    return null
  }

  /**
   * Obtener pregunta de seguimiento
   */
  private static getFollowUpQuestion(objectionType: ObjectionType): string {
    const followUps: Record<ObjectionType, string> = {
      price_too_high: '¿Qué presupuesto tenías en mente? Puedo mostrarte opciones que se ajusten.',
      need_to_think: '¿Hay algo específico que te preocupa o que pueda aclarar?',
      found_cheaper: '¿Te gustaría que te explique qué incluye nuestro precio?',
      quality_doubt: '¿Te gustaría ver testimonios de otros clientes satisfechos?',
      warranty_concern: '¿Tienes alguna pregunta específica sobre la garantía?',
      shipping_concern: '¿A qué ciudad necesitas el envío?',
      payment_concern: '¿Qué método de pago prefieres?',
      trust_issue: '¿Te gustaría ver nuestras reseñas y testimonios?',
      timing_issue: '¿Para cuándo necesitarías el producto?',
      comparison_request: '¿Qué características son más importantes para ti?'
    }

    return followUps[objectionType]
  }

  /**
   * Agregar nueva FAQ dinámicamente
   */
  static addFAQ(question: string, keywords: string[], answer: string, category: string): void {
    this.faqs.push({ question, keywords, answer, category })
    console.log(`📚 Nueva FAQ agregada: ${question}`)
  }

  /**
   * Obtener estadísticas
   */
  static getStats(): {
    totalObjectionTypes: number
    totalFAQs: number
    faqCategories: string[]
  } {
    return {
      totalObjectionTypes: Object.keys(this.objectionResponses).length,
      totalFAQs: this.faqs.length,
      faqCategories: [...new Set(this.faqs.map(f => f.category))]
    }
  }
}
