/**
 * 🎯 MANEJADOR DE FLUJOS POR TIPO DE PRODUCTO
 * Cada tipo de producto tiene su propio flujo de venta
 */

export interface ProductFlowResponse {
  text: string;
  needsData: boolean;
  dataFields?: string[];
  nextStep?: string;
}

export class ProductFlowHandler {
  /**
   * Genera respuesta según el tipo de producto
   */
  static generateResponse(product: any, isFirstContact: boolean = true): ProductFlowResponse {
    const category = product.category;
    const subcategory = product.subcategory?.toLowerCase() || '';
    const name = product.name.toLowerCase();
    
    // Detectar tipo de flujo
    if (category === 'DIGITAL') {
      return this.flowDigital(product, isFirstContact);
    }
    
    // Detectar si es servicio
    if (this.isService(product)) {
      return this.flowService(product, isFirstContact);
    }
    
    // Detectar si es dropshipping o local
    if (this.isDropshipping(product)) {
      return this.flowDropshipping(product, isFirstContact);
    }
    
    // Por defecto: productos locales (computadores, celulares, etc.)
    return this.flowLocal(product, isFirstContact);
  }

  /**
   * Detecta si es un servicio
   */
  private static isService(product: any): boolean {
    const indicators = ['reparacion', 'reparación', 'servicio', 'mantenimiento', 'diagnostico', 'diagnóstico', 'revision', 'revisión'];
    const text = `${product.name} ${product.description || ''}`.toLowerCase();
    return indicators.some(ind => text.includes(ind));
  }

  /**
   * Detecta si es dropshipping (productos de anuncios)
   */
  private static isDropshipping(product: any): boolean {
    // Productos dropshipping típicamente son accesorios, gadgets pequeños
    const dropshippingKeywords = [
      'mouse', 'teclado', 'auricular', 'cable', 'cargador', 'funda',
      'protector', 'soporte', 'base', 'hub', 'adaptador', 'memoria usb',
      'tarjeta', 'lampara', 'ventilador', 'smartwatch'
    ];
    
    const name = product.name.toLowerCase();
    return dropshippingKeywords.some(kw => name.includes(kw));
  }

  /**
   * FLUJO 1: PRODUCTOS DIGITALES (Cursos/Megapacks)
   */
  private static flowDigital(product: any, isFirstContact: boolean): ProductFlowResponse {
    let text = `¡Sí! 😊 Tenemos disponible el *${product.name}*\n\n`;
    
    // Descripción
    if (product.description) {
      const desc = product.description.substring(0, 200);
      text += `✨ ${desc}${product.description.length > 200 ? '...' : ''}\n\n`;
    }
    
    // Precio
    text += `💰 *Precio:* $${product.price.toLocaleString('es-CO')} COP\n\n`;
    
    // Beneficios digitales
    text += `✅ *Incluye:*\n`;
    text += `• Acceso inmediato después del pago\n`;
    text += `• Contenido descargable\n`;
    text += `• Acceso de por vida\n`;
    text += `• Soporte incluido\n\n`;
    
    // Call to action
    text += `¿Te gustaría conocer los métodos de pago? 😊`;
    
    return {
      text,
      needsData: false,
      nextStep: 'payment_methods'
    };
  }

  /**
   * FLUJO 2: DROPSHIPPING (Productos de anuncios)
   */
  private static flowDropshipping(product: any, isFirstContact: boolean): ProductFlowResponse {
    let text = `¡Perfecto! 😊 Tenemos el *${product.name}*\n\n`;
    
    // Descripción completa
    if (product.description) {
      text += `📝 *Características:*\n${product.description}\n\n`;
    }
    
    // Precio
    text += `💰 *Precio:* $${product.price.toLocaleString('es-CO')} COP\n\n`;
    
    // INFORMACIÓN DE ENVÍO (clave para dropshipping)
    text += `📦 *Envío y Entrega:*\n`;
    text += `• *Pago contraentrega* disponible 💵\n`;
    text += `• Tiempo de entrega: 3-5 días hábiles 🚚\n`;
    text += `• Envío a toda Colombia 🇨🇴\n`;
    text += `• Te enviamos la guía de seguimiento\n\n`;
    
    if (isFirstContact) {
      // Primera vez: pedir confirmación
      text += `¿Te gustaría hacer el pedido? 😊\n\n`;
      text += `Solo necesito tus datos para procesar el envío 📋`;
    } else {
      // Ya confirmó: pedir datos
      text += `📋 *Necesito los siguientes datos:*\n`;
      text += `• Nombre completo\n`;
      text += `• Dirección de entrega\n`;
      text += `• Ciudad\n`;
      text += `• Teléfono de contacto\n\n`;
      text += `Una vez confirmes, procesamos tu pedido y te enviamos la guía de seguimiento en el transcurso del día 📦`;
    }
    
    return {
      text,
      needsData: !isFirstContact,
      dataFields: ['nombre', 'direccion', 'ciudad', 'telefono'],
      nextStep: isFirstContact ? 'confirm_order' : 'collect_data'
    };
  }

  /**
   * FLUJO 3: PRODUCTOS LOCALES (Computadores, celulares, consolas)
   */
  private static flowLocal(product: any, isFirstContact: boolean): ProductFlowResponse {
    let text = `¡Claro! 😊 Te cuento sobre el *${product.name}*\n\n`;
    
    // Descripción detallada para convencer
    if (product.description) {
      text += `✨ *Características:*\n${product.description}\n\n`;
    }
    
    // Precio destacado
    text += `💰 *Precio:* $${product.price.toLocaleString('es-CO')} COP\n\n`;
    
    // Beneficios del producto
    text += `✅ *Beneficios:*\n`;
    text += `• Producto nuevo con garantía\n`;
    text += `• Soporte técnico incluido\n`;
    text += `• Disponible para entrega inmediata\n\n`;
    
    // 3 OPCIONES DE COMPRA (clave para productos locales)
    text += `🛒 *Opciones de compra:*\n\n`;
    text += `1️⃣ *Contraentrega* 💵\n`;
    text += `   Pagas cuando recibes el producto\n`;
    text += `   Envío: 2-3 días hábiles\n\n`;
    
    text += `2️⃣ *Visita nuestro local* 🏪\n`;
    text += `   Puedes verlo y probarlo antes de comprar\n`;
    text += `   📍 Dirección: [Tu dirección]\n`;
    text += `   🕐 Horario: Lun-Sáb 9am-6pm\n\n`;
    
    text += `3️⃣ *Separar con cita* 📅\n`;
    text += `   Agenda un día para venir\n`;
    text += `   Te lo guardamos hasta que vengas\n\n`;
    
    text += `¿Cuál opción prefieres? 😊`;
    
    return {
      text,
      needsData: false,
      nextStep: 'choose_option'
    };
  }

  /**
   * FLUJO 4: SERVICIOS (Reparación, diagnóstico)
   */
  private static flowService(product: any, isFirstContact: boolean): ProductFlowResponse {
    let text = `¡Sí! 😊 Ofrecemos el servicio de *${product.name}*\n\n`;
    
    // Descripción del servicio
    if (product.description) {
      text += `🔧 *En qué consiste:*\n${product.description}\n\n`;
    }
    
    // Precio
    text += `💰 *Precio:* $${product.price.toLocaleString('es-CO')} COP\n\n`;
    
    // PROCESO DEL SERVICIO (clave para servicios)
    text += `📋 *Proceso:*\n`;
    text += `1️⃣ Agendamos una cita contigo\n`;
    text += `2️⃣ Revisión y diagnóstico del equipo\n`;
    text += `3️⃣ Te informamos el problema y costo\n`;
    text += `4️⃣ Realizamos la reparación\n`;
    text += `5️⃣ Entrega con garantía\n\n`;
    
    // Información adicional
    text += `⏱️ *Tiempo estimado:* 1-3 días hábiles\n`;
    text += `✅ *Garantía incluida*\n\n`;
    
    if (isFirstContact) {
      text += `¿Te gustaría agendar una cita? 😊\n\n`;
      text += `Necesito algunos datos para coordinar:`;
    } else {
      text += `📅 *Para agendar necesito:*\n`;
      text += `• Tu nombre\n`;
      text += `• Teléfono de contacto\n`;
      text += `• Tipo de equipo (marca/modelo)\n`;
      text += `• Descripción del problema\n`;
      text += `• Día preferido para la cita\n\n`;
      text += `Con esta info coordinamos tu cita 📱`;
    }
    
    return {
      text,
      needsData: !isFirstContact,
      dataFields: ['nombre', 'telefono', 'equipo', 'problema', 'dia_preferido'],
      nextStep: isFirstContact ? 'confirm_appointment' : 'collect_data'
    };
  }

  /**
   * Genera respuesta para cuando el cliente elige una opción
   */
  static handleOptionSelection(product: any, option: string): ProductFlowResponse {
    const name = product.name.toLowerCase();
    
    if (option.includes('contraentrega') || option.includes('1')) {
      return {
        text: `¡Perfecto! 😊 Procesaremos tu pedido con *pago contraentrega*\n\n📋 Necesito los siguientes datos:\n• Nombre completo\n• Dirección de entrega\n• Ciudad\n• Teléfono de contacto\n\nUna vez los tengas, te confirmo el pedido y el tiempo de entrega 📦`,
        needsData: true,
        dataFields: ['nombre', 'direccion', 'ciudad', 'telefono'],
        nextStep: 'collect_data'
      };
    }
    
    if (option.includes('local') || option.includes('visita') || option.includes('2')) {
      return {
        text: `¡Genial! 😊 Te esperamos en nuestro local\n\n📍 *Dirección:* [Tu dirección aquí]\n🕐 *Horario:* Lunes a Sábado, 9:00 AM - 6:00 PM\n📱 *Teléfono:* +57 300 556 0186\n\n¿Necesitas indicaciones de cómo llegar? 🗺️`,
        needsData: false,
        nextStep: 'visit_local'
      };
    }
    
    if (option.includes('separar') || option.includes('cita') || option.includes('3')) {
      return {
        text: `¡Excelente! 😊 Te separamos el producto\n\n📅 Para agendar tu cita necesito:\n• Tu nombre\n• Teléfono de contacto\n• Día que prefieres venir\n\nTe lo guardamos hasta ese día 📦`,
        needsData: true,
        dataFields: ['nombre', 'telefono', 'dia_preferido'],
        nextStep: 'collect_data'
      };
    }
    
    return {
      text: `No entendí tu opción 😅\n\nPor favor elige:\n1️⃣ Contraentrega\n2️⃣ Visitar el local\n3️⃣ Separar con cita`,
      needsData: false,
      nextStep: 'choose_option'
    };
  }
}
