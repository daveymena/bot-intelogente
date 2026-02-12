/**
 * Sistema de Plantillas de Conversación
 * Textos predefinidos para cubrir todos los escenarios de atención al cliente
 */

export interface ConversationTemplate {
  id: string;
  category: string;
  trigger: string[];
  response: string;
  followUp?: string[];
  requiresHuman?: boolean;
}

export const conversationTemplates: ConversationTemplate[] = [
  // ============================================
  // SALUDOS Y BIENVENIDA
  // ============================================
  {
    id: 'greeting_morning',
    category: 'greeting',
    trigger: ['buenos días', 'buen día', 'buenas'],
    response: '¡Buenos días! 😊 Bienvenido/a a {BUSINESS_NAME}. ¿En qué puedo ayudarte hoy?',
    followUp: ['Ver productos', 'Consultar precios', 'Hacer pedido']
  },
  {
    id: 'greeting_afternoon',
    category: 'greeting',
    trigger: ['buenas tardes', 'buena tarde'],
    response: '¡Buenas tardes! 👋 Es un placer atenderte. ¿Qué necesitas?',
    followUp: ['Ver catálogo', 'Información de envío', 'Métodos de pago']
  },
  {
    id: 'greeting_evening',
    category: 'greeting',
    trigger: ['buenas noches', 'buena noche'],
    response: '¡Buenas noches! 🌙 Estoy aquí para ayudarte. ¿Qué buscas?',
    followUp: ['Ver productos disponibles', 'Consultar stock', 'Hacer pedido']
  },
  {
    id: 'greeting_generic',
    category: 'greeting',
    trigger: ['hola', 'hey', 'ola', 'saludos', 'qué tal'],
    response: '¡Hola! 👋 Soy el asistente virtual de {BUSINESS_NAME}. Estoy aquí para ayudarte con:\n\n✅ Información de productos\n✅ Precios y disponibilidad\n✅ Realizar pedidos\n✅ Seguimiento de compras\n\n¿Qué necesitas hoy?',
    followUp: ['Ver productos', 'Consultar precios', 'Estado de pedido']
  },

  // ============================================
  // INFORMACIÓN DE PRODUCTOS
  // ============================================
  {
    id: 'product_inquiry_general',
    category: 'product_info',
    trigger: ['qué venden', 'qué tienen', 'qué productos', 'catálogo', 'que ofrecen'],
    response: 'Tenemos una amplia variedad de productos:\n\n💻 Laptops y Computadores\n📱 Celulares y Tablets\n🎓 Cursos Digitales\n📦 Megapacks de Diseño\n🏍️ Motos y Vehículos\n\n¿Qué tipo de producto te interesa?',
    followUp: ['Ver todo', 'Filtrar por precio', 'Productos destacados']
  },
  {
    id: 'product_availability',
    category: 'product_info',
    trigger: ['tienen', 'hay', 'disponible', 'stock', 'existencia'],
    response: 'Déjame verificar la disponibilidad para ti. ¿Qué producto específico buscas?',
    followUp: ['Buscar por nombre', 'Ver disponibles', 'Notificarme cuando llegue']
  },
  {
    id: 'product_specifications',
    category: 'product_info',
    trigger: ['características', 'especificaciones', 'detalles', 'ficha técnica', 'specs'],
    response: 'Con gusto te proporciono las especificaciones. ¿De qué producto necesitas información detallada?',
    followUp: ['Ver ficha completa', 'Comparar productos', 'Ver imágenes']
  },
  {
    id: 'product_recommendations',
    category: 'product_info',
    trigger: ['recomienda', 'sugieres', 'aconsejas', 'qué me conviene', 'cuál es mejor'],
    response: 'Claro, con gusto te ayudo a elegir. Para darte la mejor recomendación, cuéntame:\n\n• ¿Para qué lo necesitas?\n• ¿Cuál es tu presupuesto aproximado?\n• ¿Tienes alguna preferencia específica?',
    followUp: ['Ver más vendidos', 'Ver ofertas', 'Comparar opciones']
  },

  // ============================================
  // PRECIOS Y PAGOS
  // ============================================
  {
    id: 'price_inquiry',
    category: 'pricing',
    trigger: ['cuánto cuesta', 'precio', 'valor', 'cuánto vale', 'cuánto es'],
    response: '¿De qué producto necesitas saber el precio? Puedes decirme el nombre o enviármelo de la lista.',
    followUp: ['Ver lista de precios', 'Productos en oferta', 'Descuentos disponibles']
  },
  {
    id: 'payment_methods',
    category: 'pricing',
    trigger: ['cómo pago', 'formas de pago', 'métodos de pago', 'puedo pagar con'],
    response: 'Aceptamos los siguientes métodos de pago:\n\n{PAYMENT_METHODS}\n\n¿Con cuál prefieres pagar?',
    followUp: ['Pagar ahora', 'Más información', 'Pago en cuotas']
  },
  {
    id: 'discounts',
    category: 'pricing',
    trigger: ['descuento', 'oferta', 'promoción', 'rebaja', 'barato'],
    response: '¡Tenemos excelentes ofertas! 🎉\n\n{CURRENT_PROMOTIONS}\n\n¿Te interesa alguna de estas promociones?',
    followUp: ['Ver todas las ofertas', 'Aplicar descuento', 'Condiciones']
  },
  {
    id: 'installments',
    category: 'pricing',
    trigger: ['cuotas', 'financiación', 'pagar en partes', 'mensualidades', 'plazos'],
    response: 'Sí, ofrecemos opciones de pago en cuotas:\n\n{INSTALLMENT_OPTIONS}\n\n¿Qué opción te interesa?',
    followUp: ['Calcular cuotas', 'Ver condiciones', 'Aplicar ahora']
  },

  // ============================================
  // PROCESO DE COMPRA
  // ============================================
  {
    id: 'how_to_buy',
    category: 'purchase',
    trigger: ['cómo compro', 'cómo hago el pedido', 'quiero comprar', 'proceso de compra'],
    response: 'Comprar es muy fácil:\n\n1️⃣ Dime qué producto quieres\n2️⃣ Confirmo precio y disponibilidad\n3️⃣ Te envío el link de pago\n4️⃣ Realizas el pago\n5️⃣ ¡Listo! Te enviamos tu pedido\n\n¿Qué producto te interesa?',
    followUp: ['Ver productos', 'Hacer pedido ahora', 'Más información']
  },
  {
    id: 'order_confirmation',
    category: 'purchase',
    trigger: ['confirmar pedido', 'quiero este', 'lo compro', 'me lo llevo'],
    response: 'Perfecto! Para confirmar tu pedido necesito:\n\n📦 Producto(s) que deseas\n📍 Dirección de entrega\n📱 Teléfono de contacto\n💳 Método de pago preferido\n\n¿Me confirmas estos datos?',
    followUp: ['Enviar datos', 'Cambiar producto', 'Cancelar']
  },
  {
    id: 'cart_management',
    category: 'purchase',
    trigger: ['agregar al carrito', 'añadir', 'quiero varios', 'comprar más'],
    response: 'Perfecto, voy agregando a tu pedido. Dime qué más necesitas y al final confirmamos todo junto.',
    followUp: ['Ver mi carrito', 'Continuar comprando', 'Finalizar pedido']
  },

  // ============================================
  // ENVÍOS Y ENTREGAS
  // ============================================
  {
    id: 'shipping_info',
    category: 'shipping',
    trigger: ['envío', 'entrega', 'domicilio', 'despacho', 'envían'],
    response: 'Información de envíos:\n\n📦 {SHIPPING_INFO}\n\n¿A qué ciudad necesitas el envío?',
    followUp: ['Calcular costo de envío', 'Tiempo de entrega', 'Recoger en tienda']
  },
  {
    id: 'shipping_cost',
    category: 'shipping',
    trigger: ['cuánto cuesta el envío', 'valor del envío', 'cobran envío'],
    response: 'El costo de envío depende de tu ubicación. ¿A qué ciudad/zona necesitas el envío?',
    followUp: ['Calcular envío', 'Envío gratis', 'Recoger personalmente']
  },
  {
    id: 'delivery_time',
    category: 'shipping',
    trigger: ['cuánto demora', 'cuándo llega', 'tiempo de entrega', 'cuántos días'],
    response: 'Los tiempos de entrega son:\n\n{DELIVERY_TIMES}\n\n¿A qué ciudad es el envío?',
    followUp: ['Envío express', 'Rastrear pedido', 'Cambiar dirección']
  },
  {
    id: 'order_tracking',
    category: 'shipping',
    trigger: ['rastrear', 'seguimiento', 'dónde está mi pedido', 'tracking', 'guía'],
    response: 'Para rastrear tu pedido necesito tu número de orden o el teléfono con el que compraste. ¿Cuál es?',
    followUp: ['Ver estado', 'Contactar mensajero', 'Reportar problema']
  },

  // ============================================
  // SOPORTE Y PROBLEMAS
  // ============================================
  {
    id: 'problem_general',
    category: 'support',
    trigger: ['problema', 'error', 'falla', 'no funciona', 'ayuda'],
    response: 'Lamento que tengas un inconveniente. Cuéntame qué está pasando para ayudarte a resolverlo.',
    followUp: ['Describir problema', 'Hablar con humano', 'Ver soluciones'],
    requiresHuman: true
  },
  {
    id: 'complaint',
    category: 'support',
    trigger: ['queja', 'reclamo', 'insatisfecho', 'molesto', 'mal servicio'],
    response: 'Lamento mucho la situación. Tu satisfacción es muy importante para nosotros. Voy a conectarte con un asesor humano que te atenderá personalmente.',
    requiresHuman: true
  },
  {
    id: 'return_refund',
    category: 'support',
    trigger: ['devolución', 'reembolso', 'devolver', 'garantía', 'cambio'],
    response: 'Entiendo que necesitas hacer una devolución o cambio. Nuestra política es:\n\n{RETURN_POLICY}\n\n¿Cuál es el motivo de la devolución?',
    followUp: ['Iniciar devolución', 'Ver política completa', 'Hablar con soporte'],
    requiresHuman: true
  },
  {
    id: 'warranty',
    category: 'support',
    trigger: ['garantía', 'warranty', 'defecto', 'daño', 'roto'],
    response: 'Todos nuestros productos tienen garantía:\n\n{WARRANTY_INFO}\n\n¿Qué producto presenta el problema?',
    followUp: ['Activar garantía', 'Ver términos', 'Soporte técnico'],
    requiresHuman: true
  },

  // ============================================
  // INFORMACIÓN DE LA EMPRESA
  // ============================================
  {
    id: 'business_hours',
    category: 'business_info',
    trigger: ['horario', 'qué hora', 'hasta qué hora', 'cuándo abren'],
    response: 'Nuestro horario de atención es:\n\n{BUSINESS_HOURS}\n\nEl bot está disponible 24/7 para consultas básicas.',
    followUp: ['Contactar ahora', 'Dejar mensaje', 'Ver ubicación']
  },
  {
    id: 'location',
    category: 'business_info',
    trigger: ['dónde están', 'ubicación', 'dirección', 'local', 'tienda física'],
    response: 'Nuestra ubicación:\n\n📍 {BUSINESS_ADDRESS}\n\n¿Necesitas indicaciones para llegar?',
    followUp: ['Ver en mapa', 'Cómo llegar', 'Horarios de tienda']
  },
  {
    id: 'contact_info',
    category: 'business_info',
    trigger: ['contacto', 'teléfono', 'email', 'correo', 'redes sociales'],
    response: 'Puedes contactarnos por:\n\n{CONTACT_INFO}\n\n¿Prefieres que te contactemos nosotros?',
    followUp: ['Llamarme', 'Enviar email', 'Ver redes sociales']
  },
  {
    id: 'about_business',
    category: 'business_info',
    trigger: ['quiénes son', 'sobre ustedes', 'empresa', 'negocio', 'historia'],
    response: '{BUSINESS_DESCRIPTION}\n\n¿Te gustaría saber algo más específico?',
    followUp: ['Ver productos', 'Misión y visión', 'Contactar']
  },

  // ============================================
  // RESPUESTAS A SITUACIONES ESPECIALES
  // ============================================
  {
    id: 'out_of_stock',
    category: 'special',
    trigger: ['agotado', 'no hay', 'sin stock'],
    response: 'Ese producto está temporalmente agotado. Puedo:\n\n1️⃣ Notificarte cuando llegue\n2️⃣ Mostrarte alternativas similares\n3️⃣ Reservarlo para ti\n\n¿Qué prefieres?',
    followUp: ['Notificarme', 'Ver alternativas', 'Reservar']
  },
  {
    id: 'price_negotiation',
    category: 'special',
    trigger: ['más barato', 'descuento', 'rebaja', 'negociar', 'mejor precio'],
    response: 'Nuestros precios ya incluyen el mejor valor posible. Sin embargo, tenemos:\n\n• Descuentos por volumen\n• Promociones especiales\n• Programa de puntos\n\n¿Te interesa conocer estas opciones?',
    followUp: ['Ver promociones', 'Compra por mayor', 'Programa de lealtad']
  },
  {
    id: 'bulk_order',
    category: 'special',
    trigger: ['mayoreo', 'por mayor', 'cantidad', 'varios', 'al por mayor'],
    response: '¡Excelente! Para compras al por mayor tenemos precios especiales. ¿Cuántas unidades necesitas y de qué producto?',
    followUp: ['Cotizar', 'Ver condiciones', 'Hablar con ventas'],
    requiresHuman: true
  },
  {
    id: 'custom_order',
    category: 'special',
    trigger: ['personalizado', 'a medida', 'especial', 'customizado'],
    response: 'Sí, podemos hacer pedidos personalizados. Cuéntame qué necesitas específicamente y te conecto con nuestro equipo especializado.',
    requiresHuman: true
  },

  // ============================================
  // MANEJO DE CONFUSIÓN O INCOMPRENSIÓN
  // ============================================
  {
    id: 'clarification_needed',
    category: 'clarification',
    trigger: ['no entiendo', 'confuso', 'explica mejor', 'no me queda claro'],
    response: 'Disculpa si no fui claro. Déjame explicarlo de otra manera. ¿Qué parte específica necesitas que aclare?',
    followUp: ['Explicar de nuevo', 'Ver ejemplo', 'Hablar con humano']
  },
  {
    id: 'bot_limitation',
    category: 'clarification',
    trigger: ['no puedes', 'no sabes', 'no entiendes'],
    response: 'Tienes razón, hay cosas que requieren atención humana. Te conecto con un asesor que podrá ayudarte mejor.',
    requiresHuman: true
  },
  {
    id: 'repeat_request',
    category: 'clarification',
    trigger: ['repite', 'otra vez', 'de nuevo', 'no escuché'],
    response: 'Claro, con gusto te lo repito:\n\n{LAST_RESPONSE}\n\n¿Quedó más claro ahora?',
    followUp: ['Sí, gracias', 'Explicar diferente', 'Hablar con humano']
  },

  // ============================================
  // DESPEDIDAS Y CIERRE
  // ============================================
  {
    id: 'goodbye',
    category: 'farewell',
    trigger: ['adiós', 'chao', 'hasta luego', 'nos vemos', 'gracias'],
    response: '¡Gracias por contactarnos! 😊 Si necesitas algo más, estoy aquí 24/7. ¡Que tengas un excelente día!',
    followUp: []
  },
  {
    id: 'thanks',
    category: 'farewell',
    trigger: ['gracias', 'muchas gracias', 'te agradezco'],
    response: '¡De nada! Es un placer ayudarte. ¿Necesitas algo más?',
    followUp: ['Sí, otra consulta', 'No, eso es todo']
  },

  // ============================================
  // RESPUESTAS DE EMERGENCIA (FALLBACK)
  // ============================================
  {
    id: 'fallback_general',
    category: 'fallback',
    trigger: [],
    response: 'Entiendo que necesitas ayuda, pero no estoy seguro de cómo ayudarte con eso específicamente. Puedo:\n\n• Mostrarte nuestros productos\n• Ayudarte con un pedido\n• Conectarte con un asesor humano\n\n¿Qué prefieres?',
    followUp: ['Ver productos', 'Hacer pedido', 'Hablar con humano']
  },
  {
    id: 'inappropriate_content',
    category: 'fallback',
    trigger: [],
    response: 'Soy un asistente de ventas y solo puedo ayudarte con temas relacionados a nuestros productos y servicios. ¿Hay algo en lo que pueda asistirte?',
    followUp: ['Ver productos', 'Información de empresa']
  }
];

/**
 * Variables dinámicas que se reemplazan en las plantillas
 */
export const templateVariables = {
  BUSINESS_NAME: 'nombre del negocio',
  PRODUCT_CATEGORIES: 'categorías de productos',
  PAYMENT_METHODS: 'métodos de pago disponibles',
  CURRENT_PROMOTIONS: 'promociones actuales',
  INSTALLMENT_OPTIONS: 'opciones de financiación',
  SHIPPING_INFO: 'información de envíos',
  DELIVERY_TIMES: 'tiempos de entrega',
  RETURN_POLICY: 'política de devoluciones',
  WARRANTY_INFO: 'información de garantía',
  BUSINESS_HOURS: 'horario de atención',
  BUSINESS_ADDRESS: 'dirección física',
  CONTACT_INFO: 'información de contacto',
  BUSINESS_DESCRIPTION: 'descripción del negocio',
  LAST_RESPONSE: 'última respuesta enviada'
};
