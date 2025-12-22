/**
 * Enhanced Local Bot - Sistema de respuestas locales instantáneas
 * Maneja el 70% de las consultas comunes sin usar IA
 * Respuestas en < 100ms
 */

interface LocalResponse {
  wasLocal: boolean;
  response: string;
  category?: string;
  confidence: number;
}

interface BotMetrics {
  totalMessages: number;
  localResponses: number;
  aiResponses: number;
  averageResponseTime: number;
  categoryStats: Record<string, number>;
}

export class EnhancedLocalBot {
  private metrics: BotMetrics = {
    totalMessages: 0,
    localResponses: 0,
    aiResponses: 0,
    averageResponseTime: 0,
    categoryStats: {}
  };

  /**
   * Procesa un mensaje y determina si puede responder localmente
   */
  async processMessage(message: string): Promise<LocalResponse> {
    const startTime = Date.now();
    this.metrics.totalMessages++;

    const normalizedMessage = this.normalizeMessage(message);

    // Intentar detectar patrón local
    const localResponse = this.detectPattern(normalizedMessage);

    const responseTime = Date.now() - startTime;
    this.updateMetrics(localResponse.wasLocal, responseTime, localResponse.category);

    return localResponse;
  }

  /**
   * Normaliza el mensaje para mejor detección
   */
  private normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[¿?¡!]/g, ''); // Quitar signos de interrogación/exclamación
  }

  /**
   * Detecta patrones y genera respuesta local
   * SOLO responde a mensajes MUY SIMPLES Y DIRECTOS
   * 
   * ⚠️ REGLA CRÍTICA: TODO lo que requiera RAZONAMIENTO → IA
   * - Pagos (necesita producto, precio, generar enlaces)
   * - Productos (necesita buscar, explicar, recomendar)
   * - Preguntas (necesita contexto, historial)
   * - Métodos de pago (necesita saber qué producto)
   */
  private detectPattern(message: string): LocalResponse {
    // ⚠️ REGLA 1: Solo responder si el mensaje es CORTO y DIRECTO
    const isVeryShort = message.length <= 20; // MUY corto
    const hasMultipleQuestions = (message.match(/\?/g) || []).length > 1;
    const hasComma = message.includes(','); // Tiene contexto adicional
    const hasPor = message.includes(' por '); // "gracias por..."
    const hasTodo = message.includes(' todo'); // "gracias por todo"
    
    // Si tiene contexto adicional → IA
    if (!isVeryShort || hasMultipleQuestions || hasComma || hasPor || hasTodo) {
      return {
        wasLocal: false,
        response: '',
        confidence: 0
      };
    }

    // ⚠️ REGLA 2: NUNCA manejar pagos localmente
    // Palabras clave de pago → Siempre IA
    const paymentKeywords = [
      'pago', 'pagar', 'comprar', 'compra', 'link', 'enlace',
      'mercado', 'paypal', 'hotmart', 'nequi', 'daviplata',
      'transferencia', 'tarjeta', 'efectivo', 'precio', 'cuesta',
      'cuanto', 'valor', 'metodo', 'forma'
    ];
    
    if (paymentKeywords.some(keyword => message.includes(keyword))) {
      console.log('[Bot Local] ⚠️ Palabra clave de pago detectada → Enviando a IA');
      return {
        wasLocal: false,
        response: '',
        confidence: 0
      };
    }

    // ⚠️ REGLA 3: NUNCA manejar productos localmente
    // Palabras clave de productos → Siempre IA
    const productKeywords = [
      'curso', 'laptop', 'moto', 'megapack', 'pack', 'producto',
      'computador', 'portatil', 'diadema', 'monitor', 'teclado',
      'mouse', 'impresora', 'piano', 'diseño', 'programacion',
      'marketing', 'idiomas', 'fotografia', 'video', 'excel',
      'office', 'emprendimiento', 'arquitectura', 'ingenieria'
    ];
    
    if (productKeywords.some(keyword => message.includes(keyword))) {
      console.log('[Bot Local] ⚠️ Palabra clave de producto detectada → Enviando a IA');
      return {
        wasLocal: false,
        response: '',
        confidence: 0
      };
    }

    // ⚠️ REGLA 4: NUNCA manejar preguntas localmente
    // Cualquier pregunta → IA (necesita razonamiento)
    const questionWords = [
      'que', 'cual', 'como', 'cuando', 'donde', 'quien',
      'cuanto', 'por que', 'para que', 'puedo', 'tienen',
      'hay', 'esta', 'son', 'es'
    ];
    
    if (questionWords.some(word => message.includes(word))) {
      console.log('[Bot Local] ⚠️ Pregunta detectada → Enviando a IA');
      return {
        wasLocal: false,
        response: '',
        confidence: 0
      };
    }

    // ✅ SOLO MANEJAR LOCALMENTE: Saludos, despedidas, agradecimientos PUROS

    // Categoría 1: Saludos SIMPLES (solo saludos puros)
    if (this.detectGreetings(message)) {
      return {
        wasLocal: true,
        response: this.generateGreeting(message),
        category: 'greeting',
        confidence: 0.95
      };
    }

    // Categoría 2: Despedidas SIMPLES
    if (this.detectFarewells(message)) {
      return {
        wasLocal: true,
        response: this.generateFarewell(message),
        category: 'farewell',
        confidence: 0.95
      };
    }

    // Categoría 3: Agradecimientos SIMPLES
    if (this.detectThanks(message)) {
      return {
        wasLocal: true,
        response: this.generateThanksResponse(message),
        category: 'thanks',
        confidence: 0.95
      };
    }

    // Categoría 4: Confirmaciones SIMPLES (ok, listo, etc.)
    if (this.detectConfirmations(message)) {
      return {
        wasLocal: true,
        response: this.generateConfirmationResponse(message),
        category: 'confirmation',
        confidence: 0.9
      };
    }

    // ⚠️ TODO LO DEMÁS VA A IA
    // - Métodos de pago → IA (puede necesitar contexto del producto)
    // - Envío → IA (puede necesitar ciudad específica)
    // - Garantía → IA (puede necesitar contexto del producto)
    // - Horarios → IA (puede tener preguntas específicas)
    // - Disponibilidad → IA (necesita consultar BD)
    // - Sobre el negocio → IA (puede ser pregunta compleja)

    // No se detectó patrón local - usar IA
    return {
      wasLocal: false,
      response: '',
      confidence: 0
    };
  }

  // ==================== DETECCIÓN DE PATRONES ====================

  /**
   * Detecta saludos
   */
  private detectGreetings(message: string): boolean {
    const greetingPatterns = [
      /^hola\b/,
      /^buenos dias/,
      /^buenas tardes/,
      /^buenas noches/,
      /^buen dia/,
      /^buenas/,
      /^que tal/,
      /^como estas/,
      /^como esta/,
      /^hey\b/,
      /^ey\b/,
      /^saludos/,
      /^holi/,
      /^holaaa/,
      /^holaa/,
      /^ola\b/,
      /^olaaa/,
      /^que hubo/,
      /^quiubo/,
      /^quihubo/,
      /^hola buenas/,
      /^hola buen/,
      /^presente/,
      /^alo\b/,
      /^aloo/,
      /^hola como/,
      /^hola que/
    ];

    return greetingPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Detecta despedidas
   */
  private detectFarewells(message: string): boolean {
    const farewellPatterns = [
      /^adios\b/,
      /^chao\b/,
      /^chau\b/,
      /^hasta luego/,
      /^hasta pronto/,
      /^nos vemos/,
      /^bye\b/,
      /^gracias adios/,
      /^gracias chao/,
      /^ok adios/,
      /^ok chao/,
      /^listo adios/,
      /^listo chao/,
      /^perfecto adios/,
      /^perfecto chao/,
      /^hasta la proxima/,
      /^hasta otra/,
      /^me voy/,
      /^ya me voy/
    ];

    return farewellPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Detecta preguntas sobre métodos de pago
   */
  private detectPaymentQuestions(message: string): boolean {
    // ⚠️ EXCLUIR solicitudes de links de pago (deben ir a IA)
    const paymentLinkPatterns = [
      /link.*pago/,
      /pago.*link/,
      /envia.*link/,
      /manda.*link/,
      /pasa.*link/,
      /dame.*link/,
      /quiero.*link/,
      /necesito.*link/,
      /link.*mercado/,
      /link.*paypal/,
      /link.*hotmart/,
      /generar.*link/,
      /crear.*link/
    ];

    // Si está pidiendo un link específico, NO responder localmente
    if (paymentLinkPatterns.some(pattern => pattern.test(message))) {
      return false;
    }

    const paymentKeywords = [
      'metodo', 'metodos', 'forma', 'formas', 'pago', 'pagos',
      'pagar', 'como pago', 'puedo pagar', 'aceptan',
      'tarjeta', 'efectivo', 'transferencia', 'nequi', 'daviplata',
      'bancolombia', 'credito', 'debito', 'consignacion', 'deposito'
    ];

    const hasPaymentKeyword = paymentKeywords.some(keyword => 
      message.includes(keyword)
    );

    const isQuestion = message.includes('como') || 
                      message.includes('cual') || 
                      message.includes('que') ||
                      message.includes('puedo') ||
                      message.includes('aceptan');

    return hasPaymentKeyword && (isQuestion || message.length < 50);
  }

  /**
   * Detecta preguntas sobre envío
   */
  private detectShippingQuestions(message: string): boolean {
    const shippingKeywords = [
      'envio', 'envios', 'enviar', 'envian',
      'entrega', 'entregas', 'entregar', 'entregan',
      'domicilio', 'domicilios',
      'despacho', 'despachos',
      'llega', 'llegan', 'llegada',
      'demora', 'demoran', 'tarda', 'tardan',
      'cuanto tiempo', 'cuando llega',
      'coordinadora', 'servientrega', 'interrapidisimo',
      'transportadora', 'mensajeria'
    ];

    return shippingKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Detecta preguntas sobre garantía
   */
  private detectWarrantyQuestions(message: string): boolean {
    const warrantyKeywords = [
      'garantia', 'garantias',
      'devolucion', 'devoluciones', 'devolver',
      'cambio', 'cambios', 'cambiar',
      'defecto', 'defectos', 'defectuoso',
      'dañado', 'daño', 'dañada',
      'problema', 'problemas',
      'falla', 'fallas', 'fallo',
      'reclamo', 'reclamos',
      'reembolso', 'reembolsos'
    ];

    return warrantyKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Detecta preguntas sobre horarios
   */
  private detectScheduleQuestions(message: string): boolean {
    const scheduleKeywords = [
      'horario', 'horarios',
      'hora', 'horas',
      'atienden', 'atencion',
      'abren', 'cierran',
      'abierto', 'cerrado',
      'cuando atienden', 'que horas',
      'a que hora', 'hasta que hora',
      'domingo', 'sabado', 'festivo',
      'fin de semana'
    ];

    return scheduleKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Detecta preguntas sobre disponibilidad
   */
  private detectAvailabilityQuestions(message: string): boolean {
    const availabilityKeywords = [
      'disponible', 'disponibles', 'disponibilidad',
      'hay', 'tienen', 'tienes', 'tiene',
      'stock', 'existencia', 'existencias',
      'quedan', 'queda',
      'en stock', 'agotado', 'agotada'
    ];

    const hasKeyword = availabilityKeywords.some(keyword => 
      message.includes(keyword)
    );

    // Evitar confusión con preguntas complejas de productos
    const isSimpleQuestion = message.length < 80;

    return hasKeyword && isSimpleQuestion;
  }

  /**
   * Detecta agradecimientos
   */
  private detectThanks(message: string): boolean {
    const thanksPatterns = [
      /^gracias\b/,
      /^muchas gracias/,
      /^mil gracias/,
      /^gracias por/,
      /^te agradezco/,
      /^le agradezco/,
      /^agradecido/,
      /^agradecida/,
      /^thanks\b/,
      /^thank you/,
      /^grax\b/,
      /^grcs\b/,
      /^graciass/,
      /^graciasss/
    ];

    return thanksPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Detecta confirmaciones
   */
  private detectConfirmations(message: string): boolean {
    const confirmationPatterns = [
      /^si\b/,
      /^sii\b/,
      /^siii\b/,
      /^ok\b/,
      /^okay\b/,
      /^vale\b/,
      /^perfecto\b/,
      /^excelente\b/,
      /^genial\b/,
      /^listo\b/,
      /^dale\b/,
      /^claro\b/,
      /^por supuesto/,
      /^de acuerdo/,
      /^entendido\b/,
      /^comprendo\b/,
      /^entiendo\b/
    ];

    return confirmationPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Detecta preguntas sobre el negocio
   */
  private detectBusinessQuestions(message: string): boolean {
    const businessKeywords = [
      'quienes son', 'quien es', 'que es',
      'empresa', 'negocio', 'tienda',
      'donde estan', 'donde quedan', 'ubicacion',
      'direccion', 'donde los encuentro',
      'confiable', 'confianza', 'seguro',
      'experiencia', 'tiempo', 'años',
      'whatsapp', 'telefono', 'contacto',
      'redes sociales', 'instagram', 'facebook'
    ];

    return businessKeywords.some(keyword => message.includes(keyword));
  }

  // ==================== GENERACIÓN DE RESPUESTAS ====================

  /**
   * Genera respuesta de saludo
   */
  private generateGreeting(message: string): string {
    const greetings = [
      "¡Hola! 👋 Bienvenido a *Tecnovariedades D&S*\n\n¿En qué puedo ayudarte hoy? 😊",
      "¡Hola! 😊 ¡Qué gusto saludarte!\n\n¿Qué producto te interesa? Tenemos laptops, motos, cursos digitales y más 🎯",
      "¡Hola! 👋 Gracias por contactarnos\n\n¿Buscas algo en particular? Estoy aquí para ayudarte 💙"
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Genera respuesta de despedida
   */
  private generateFarewell(message: string): string {
    const farewells = [
      "¡Hasta pronto! 👋 Gracias por contactarnos\n\nCualquier duda, aquí estamos 😊",
      "¡Chao! 😊 Que tengas un excelente día\n\nVuelve cuando quieras 💙",
      "¡Nos vemos! 👋 Gracias por tu tiempo\n\nEstamos para servirte 🎯"
    ];

    return farewells[Math.floor(Math.random() * farewells.length)];
  }

  /**
   * Genera información de métodos de pago
   */
  private generatePaymentInfo(message: string): string {
    return `💳 *MÉTODOS DE PAGO DISPONIBLES*

Aceptamos múltiples formas de pago:

*Productos Digitales:*
• 💻 Hotmart (tarjetas, PSE)
• 💰 MercadoPago
• 🌐 PayPal

*Productos Físicos:*
• 💳 Tarjetas crédito/débito
• 📱 Nequi
• 📱 Daviplata
• 🏦 Transferencia Bancolombia
• 💵 Efectivo (contraentrega)

¿Te interesa algún producto en particular? 😊`;
  }

  /**
   * Genera información de envío
   */
  private generateShippingInfo(message: string): string {
    return `📦 *INFORMACIÓN DE ENVÍO*

*Cobertura:*
• 🇨🇴 Envíos a toda Colombia

*Tiempo de entrega:*
• 🏙️ Bogotá: 1-2 días hábiles
• 🌆 Ciudades principales: 2-4 días hábiles
• 🏘️ Otras ciudades: 3-5 días hábiles

*Transportadoras:*
• Coordinadora
• Servientrega
• Interrapidísimo

*Costo:*
El costo de envío se calcula según tu ciudad y el producto.

¿A qué ciudad necesitas el envío? 📍`;
  }

  /**
   * Genera información de garantía
   */
  private generateWarrantyInfo(message: string): string {
    return `✅ *GARANTÍA Y DEVOLUCIONES*

*Garantía:*
• 📱 Productos físicos: Garantía del fabricante
• 💻 Productos digitales: Soporte incluido

*Devoluciones:*
• ⏰ 30 días para productos físicos
• 🔄 Cambios por defectos de fábrica
• 💰 Reembolso según políticas

*Proceso:*
1. Contacta con nosotros
2. Describe el problema
3. Te guiamos en el proceso

¿Tienes algún problema con un producto? Cuéntame 😊`;
  }

  /**
   * Genera información de horarios
   */
  private generateScheduleInfo(message: string): string {
    return `🕐 *HORARIOS DE ATENCIÓN*

*Lunes a Viernes:*
• 8:00 AM - 6:00 PM

*Sábados:*
• 9:00 AM - 2:00 PM

*Domingos y Festivos:*
• Cerrado

*Atención por WhatsApp:*
• Respondemos en horario laboral
• Mensajes fuera de horario se responden al día siguiente

¿En qué más puedo ayudarte? 😊`;
  }

  /**
   * Genera información de disponibilidad
   */
  private generateAvailabilityInfo(message: string): string {
    return `📊 *DISPONIBILIDAD DE PRODUCTOS*

Para verificar la disponibilidad exacta de un producto:

1. Dime qué producto te interesa
2. Verifico el stock en tiempo real
3. Te confirmo disponibilidad y precio

*Productos populares:*
• 💻 Laptops HP, Lenovo, Dell
• 🏍️ Motos eléctricas
• 📚 Cursos digitales
• 📦 Megapacks digitales

¿Qué producto buscas? 🔍`;
  }

  /**
   * Genera respuesta a agradecimientos
   */
  private generateThanksResponse(message: string): string {
    const responses = [
      "¡Con mucho gusto! 😊\n\n¿Hay algo más en lo que pueda ayudarte?",
      "¡Para eso estamos! 💙\n\n¿Necesitas algo más?",
      "¡Un placer ayudarte! 😊\n\nCualquier otra duda, aquí estoy"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Genera respuesta a confirmaciones
   */
  private generateConfirmationResponse(message: string): string {
    const responses = [
      "¡Perfecto! 😊\n\n¿Continuamos con tu pedido?",
      "¡Excelente! 🎯\n\n¿Qué sigue?",
      "¡Genial! 💙\n\n¿En qué más te ayudo?"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Genera información del negocio
   */
  private generateBusinessInfo(message: string): string {
    return `🏢 *TECNOVARIEDADES D&S*

*¿Quiénes somos?*
Somos una empresa colombiana especializada en tecnología y productos digitales.

*Productos:*
• 💻 Laptops y computadores
• 🏍️ Motos eléctricas
• 📚 Cursos digitales
• 📦 Megapacks de contenido

*Contacto:*
• 📱 WhatsApp: Este número
• 🌐 Catálogo online disponible

*Compromiso:*
✅ Productos de calidad
✅ Precios competitivos
✅ Atención personalizada
✅ Envíos seguros

¿Qué producto te interesa conocer? 😊`;
  }

  // ==================== MÉTRICAS ====================

  /**
   * Actualiza métricas del bot
   */
  private updateMetrics(wasLocal: boolean, responseTime: number, category?: string): void {
    if (wasLocal) {
      this.metrics.localResponses++;
      if (category) {
        this.metrics.categoryStats[category] = (this.metrics.categoryStats[category] || 0) + 1;
      }
    } else {
      this.metrics.aiResponses++;
    }

    // Actualizar tiempo promedio
    const totalTime = this.metrics.averageResponseTime * (this.metrics.totalMessages - 1);
    this.metrics.averageResponseTime = (totalTime + responseTime) / this.metrics.totalMessages;
  }

  /**
   * Obtiene métricas del bot
   */
  getMetrics(): BotMetrics {
    return {
      ...this.metrics,
      categoryStats: { ...this.metrics.categoryStats }
    };
  }

  /**
   * Reinicia métricas
   */
  resetMetrics(): void {
    this.metrics = {
      totalMessages: 0,
      localResponses: 0,
      aiResponses: 0,
      averageResponseTime: 0,
      categoryStats: {}
    };
  }

  /**
   * Obtiene estadísticas formateadas
   */
  getFormattedStats(): string {
    const localPercentage = ((this.metrics.localResponses / this.metrics.totalMessages) * 100).toFixed(1);
    const aiPercentage = ((this.metrics.aiResponses / this.metrics.totalMessages) * 100).toFixed(1);

    let stats = `📊 *ESTADÍSTICAS DEL BOT LOCAL*\n\n`;
    stats += `Total mensajes: ${this.metrics.totalMessages}\n`;
    stats += `Respuestas locales: ${this.metrics.localResponses} (${localPercentage}%)\n`;
    stats += `Respuestas IA: ${this.metrics.aiResponses} (${aiPercentage}%)\n`;
    stats += `Tiempo promedio: ${this.metrics.averageResponseTime.toFixed(0)}ms\n\n`;
    
    stats += `*Por categoría:*\n`;
    Object.entries(this.metrics.categoryStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        stats += `• ${category}: ${count}\n`;
      });

    return stats;
  }
}
