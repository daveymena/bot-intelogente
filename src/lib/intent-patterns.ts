/**
 * Patrones de Intenciones
 * Base de datos completa de patrones para detectar intenciones del cliente
 */

export const IntentPatterns = {
  // ============================================
  // SALUDOS Y DESPEDIDAS
  // ============================================
  greeting: [
    /^hola$/i,
    /^hola\s+(que\s+tal|como\s+estas?|buenos?\s+dias?|buenas?\s+tardes?|buenas?\s+noches?)/i,
    /^buenos?\s+dias?$/i,
    /^buenas?\s+tardes?$/i,
    /^buenas?\s+noches?$/i,
    /^buenas?$/i,
    /^muy\s+buenas?$/i,
    /^hola\s+muy\s+buenas?$/i,
    /^saludos?$/i,
    /^hey$/i,
    /^holi$/i,
    /^que\s+tal$/i,
    /^como\s+estas?$/i,
    /^como\s+va$/i,
    /^alo$/i,
    /^aló$/i,
  ],

  farewell: [
    /^(adios|adiós|chao|chau|hasta\s+luego|nos\s+vemos|bye)$/i,
    /^gracias\s+(por\s+todo)?$/i,
    /^ok\s+gracias$/i,
    /^perfecto\s+gracias$/i,
    /^eso\s+es\s+todo$/i,
    /^nada\s+mas$/i,
    /^nada\s+más$/i,
  ],

  // ============================================
  // MÉTODOS DE PAGO (PRIORIDAD ALTA)
  // ============================================
  payment_inquiry: [
    // Preguntas directas
    /metodos?\s+(de\s+)?pago/i,
    /formas?\s+(de\s+)?pago/i,
    /el\s+metodo\s+(de\s+)?pago/i,
    /la\s+forma\s+(de\s+)?pago/i,
    /medios?\s+(de\s+)?pago/i,
    /opciones?\s+(de\s+)?pago/i,
    
    // Cómo pagar
    /como\s+(puedo\s+)?pagar/i,
    /como\s+se\s+paga/i,
    /como\s+hago\s+el\s+pago/i,
    /de\s+que\s+forma\s+pago/i,
    
    // Aceptan/tienen
    /acepta(n)?\s+(tarjeta|efectivo|transferencia|nequi|daviplata)/i,
    /tienen\s+(tarjeta|efectivo|transferencia|nequi|daviplata)/i,
    /puedo\s+pagar\s+con/i,
    /se\s+puede\s+pagar\s+con/i,
    
    // Qué métodos
    /que\s+metodos?\s+acepta/i,
    /cuales?\s+son\s+los\s+metodos/i,
    /cuales?\s+metodos?\s+tienen/i,
    /que\s+formas?\s+de\s+pago/i,
    
    // Métodos específicos mencionados
    /^(mercadopago|paypal|nequi|daviplata|contraentrega|transferencia)$/i,
  ],

  // ============================================
  // PAGO PENDIENTE
  // ============================================
  pending_payment: [
    /luego\s+(te\s+)?(envio|mando|paso)/i,
    /despues\s+(te\s+)?(envio|mando|paso)/i,
    /después\s+(te\s+)?(envío|mando|paso)/i,
    /mas\s+tarde\s+(te\s+)?(envio|mando|paso)/i,
    /más\s+tarde\s+(te\s+)?(envío|mando|paso)/i,
    /ahorita\s+(te\s+)?(envio|mando|paso)/i,
    /ya\s+(te\s+)?(envio|mando|paso)/i,
    /en\s+un\s+rato\s+(te\s+)?(envio|mando|paso)/i,
    /cuando\s+(pueda|tenga)\s+(te\s+)?(envio|mando|paso)/i,
    /voy\s+a\s+(pagar|hacer\s+el\s+pago|transferir)/i,
    /dame\s+(un\s+momento|unos\s+minutos)/i,
    /espera\s+(un\s+momento|unos\s+minutos)/i,
    /te\s+aviso\s+cuando\s+pague/i,
  ],

  // ============================================
  // INFORMACIÓN DE PRODUCTO
  // ============================================
  product_info: [
    // Características
    /(caracteristica|especificacion|detalle|informacion)/i,
    /que\s+(caracteristicas|especificaciones|detalles)\s+tiene/i,
    /cuales?\s+son\s+(las\s+)?(caracteristicas|especificaciones)/i,
    
    // Qué incluye/trae
    /(que|cual)\s+(incluye|trae|contiene)/i,
    /viene\s+con/i,
    /que\s+me\s+dan/i,
    
    // Más información
    /mas\s+(info|informacion|detalle)/i,
    /más\s+(info|información|detalle)/i,
    /cuentame\s+mas/i,
    /cuéntame\s+más/i,
    /me\s+interesa\s+saber\s+mas/i,
    
    // Garantía
    /garantia/i,
    /garantía/i,
    /tiene\s+garantia/i,
    /cuanto\s+tiempo\s+de\s+garantia/i,
    
    // Entrega
    /(entrega|envio|envío)/i,
    /como\s+(me\s+)?lo\s+(entregan|envian)/i,
    /cuando\s+(llega|me\s+llega)/i,
    /cuanto\s+(demora|tarda)\s+(el\s+)?envio/i,
  ],

  // ============================================
  // PRECIO
  // ============================================
  price_inquiry: [
    /cuanto\s+(cuesta|vale|es|sale)/i,
    /cuánto\s+(cuesta|vale|es|sale)/i,
    /cual\s+es\s+el\s+precio/i,
    /cuál\s+es\s+el\s+precio/i,
    /que\s+precio\s+tiene/i,
    /qué\s+precio\s+tiene/i,
    /a\s+como\s+(esta|está)/i,
    /precio/i,
    /valor/i,
    /costo/i,
  ],

  // ============================================
  // DISPONIBILIDAD
  // ============================================
  availability: [
    /(tienen|hay|existe|manejan)\s+disponible/i,
    /esta\s+disponible/i,
    /está\s+disponible/i,
    /en\s+stock/i,
    /disponibilidad/i,
    /lo\s+tienen/i,
    /tienen\s+en\s+existencia/i,
  ],

  // ============================================
  // PREGUNTAS GENERALES (NO PRODUCTOS)
  // ============================================
  general_question: [
    // Ubicación
    /donde\s+(esta|estan|queda|quedan)/i,
    /dónde\s+(está|están|queda|quedan)/i,
    /cual\s+es\s+(tu|su|la)\s+(direccion|ubicacion)/i,
    /cuál\s+es\s+(tu|su|la)\s+(dirección|ubicación)/i,
    /donde\s+los\s+encuentro/i,
    /tienen\s+tienda\s+fisica/i,
    /tienen\s+tienda\s+física/i,
    
    // Horarios
    /horario/i,
    /cuando\s+(abren|cierran|atienden)/i,
    /cuándo\s+(abren|cierran|atienden)/i,
    /a\s+que\s+hora\s+(abren|cierran)/i,
    /que\s+dias\s+atienden/i,
    /qué\s+días\s+atienden/i,
    
    // Contacto
    /telefono|contacto|email|correo/i,
    /teléfono|contacto|email|correo/i,
    /como\s+los\s+contacto/i,
    /cómo\s+los\s+contacto/i,
    /numero\s+de\s+telefono/i,
    /número\s+de\s+teléfono/i,
    
    // Servicios
    /que\s+(servicios|hacen|ofrecen)/i,
    /qué\s+(servicios|hacen|ofrecen)/i,
    /hacen\s+(reparacion|mantenimiento|instalacion)/i,
    /arreglan|reparan|instalan/i,
    /dan\s+soporte/i,
    
    // Políticas
    /politica\s+de/i,
    /política\s+de/i,
    /devolucion|devolución/i,
    /cambio/i,
    /como\s+funciona\s+(el|la)/i,
    /cómo\s+funciona\s+(el|la)/i,
    
    // Envíos
    /envian\s+a/i,
    /envían\s+a/i,
    /hacen\s+envios/i,
    /hacen\s+envíos/i,
    /cuanto\s+(demora|tarda)\s+(el\s+)?envio/i,
    /cuánto\s+(demora|tarda)\s+(el\s+)?envío/i,
    
    // Identidad del bot
    /quien\s+(eres|es)/i,
    /quién\s+(eres|es)/i,
    /que\s+es\s+(esto|eso)/i,
    /qué\s+es\s+(esto|eso)/i,
    /como\s+te\s+llamas/i,
    /cómo\s+te\s+llamas/i,
    /eres\s+(un\s+)?bot/i,
    
    // Productos que NO vendemos
    /venden\s+(comida|ropa|zapatos|muebles|libros|juguetes)/i,
    /tienen\s+(comida|ropa|zapatos|muebles|libros|juguetes)/i,
  ],

  // ============================================
  // BÚSQUEDA DE PRODUCTOS
  // ============================================
  product_search: [
    // Búsqueda explícita
    /busco/i,
    /necesito/i,
    /quiero\s+(ver|comprar|adquirir)/i,
    /me\s+interesa/i,
    /muestrame|muéstrame/i,
    
    // Tienen/hay
    /tienen/i,
    /hay/i,
    /venden/i,
    /manejan/i,
    /trabajan/i,
    
    // Productos específicos
    /portatil|portátil|laptop|computador/i,
    /moto|motocicleta/i,
    /curso/i,
    /megapack/i,
    /impresora/i,
  ],

  // ============================================
  // COMPARACIÓN
  // ============================================
  comparison: [
    /(diferencia|comparar|cual\s+es\s+mejor)/i,
    /entre\s+\w+\s+y\s+\w+/i,
    /(opciones|alternativas)/i,
    /que\s+me\s+recomienda/i,
    /qué\s+me\s+recomienda/i,
    /cual\s+me\s+conviene/i,
    /cuál\s+me\s+conviene/i,
  ],

  // ============================================
  // PRESUPUESTO
  // ============================================
  budget: [
    /presupuesto\s+de\s+\$?\d+/i,
    /tengo\s+\$?\d+/i,
    /hasta\s+\$?\d+/i,
    /entre\s+\$?\d+\s+y\s+\$?\d+/i,
    /economico|económico/i,
    /barato/i,
    /mas\s+barato/i,
    /más\s+barato/i,
    /menor\s+precio/i,
  ],
};

/**
 * Verifica si un mensaje coincide con algún patrón de intención
 */
export function matchesIntent(message: string, intent: keyof typeof IntentPatterns): boolean {
  const patterns = IntentPatterns[intent];
  if (!patterns) return false;
  
  return patterns.some(pattern => pattern.test(message));
}

/**
 * Detecta la intención principal del mensaje
 * Retorna la intención con mayor prioridad que coincida
 */
export function detectIntent(message: string): string | null {
  const cleanMsg = message.toLowerCase().trim();
  
  // Orden de prioridad (de mayor a menor)
  const priorityOrder: (keyof typeof IntentPatterns)[] = [
    'greeting',
    'farewell',
    'pending_payment',
    'payment_inquiry',
    'price_inquiry',
    'product_info',
    'availability',
    'general_question',
    'comparison',
    'budget',
    'product_search',
  ];
  
  for (const intent of priorityOrder) {
    if (matchesIntent(cleanMsg, intent)) {
      return intent;
    }
  }
  
  return null;
}
