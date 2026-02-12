/**
 * FORMATEADOR PROFESIONAL DE RESPUESTAS
 * Estilo: Moderno, elegante, con emojis, sin asteriscos
 * Para: Tecnovariedades D&S
 */

export class ProfessionalResponseFormatter {
  
  /**
   * Saludo inicial profesional
   */
  static formatWelcome(userName?: string): string {
    const greeting = userName ? `¡Hola ${userName}!` : '¡Hola!';
    
    return `${greeting} 👋 Bienvenido(a) a Tecnovariedades D&S ✨

Gracias por escribirnos.

Soy David, tu asesor virtual 🤖💬
Estoy aquí para ayudarte a elegir el producto ideal según lo que necesitas.

📌 ¿Qué estás buscando hoy?

1️⃣ Computadores y productos físicos
2️⃣ Cursos digitales individuales
3️⃣ Megapacks de cursos
4️⃣ Dropshipping para emprender
5️⃣ Hablar con un asesor humano 👨‍💼`;
  }

  /**
   * Formato para mostrar UN producto (con precio real)
   */
  static formatSingleProduct(product: {
    name: string;
    price: number;
    description: string;
    category: string;
    features?: string[];
  }): string {
    const emoji = this.getCategoryEmoji(product.category);
    const priceFormatted = this.formatPrice(product.price);
    
    let response = `${emoji} ${product.name}

💰 Precio: ${priceFormatted}

📋 ${product.description}`;

    if (product.features && product.features.length > 0) {
      response += '\n\n✨ Incluye:';
      product.features.slice(0, 5).forEach(feature => {
        response += `\n• ${feature}`;
      });
    }

    response += '\n\n🛒 ¿Te gustaría asegurar tu compra ahora?';
    
    return response;
  }

  /**
   * Formato para mostrar MÚLTIPLES productos
   */
  static formatMultipleProducts(products: Array<{
    name: string;
    price: number;
    description: string;
    category: string;
  }>): string {
    const emoji = this.getCategoryEmoji(products[0]?.category || 'DIGITAL');
    
    let response = `${emoji} Encontré estas opciones para ti:\n\n`;
    
    products.slice(0, 3).forEach((product, index) => {
      const priceFormatted = this.formatPrice(product.price);
      response += `${index + 1}️⃣ ${product.name}\n`;
      response += `   💰 ${priceFormatted}\n`;
      response += `   📋 ${product.description.substring(0, 80)}...\n\n`;
    });

    response += '👉 ¿Cuál te interesa más? Puedo darte todos los detalles 😊';
    
    return response;
  }

  /**
   * Respuesta cuando se pregunta por cursos
   */
  static formatCoursesResponse(): string {
    return `¡Excelente elección! 😄📚

En Tecnovariedades D&S contamos con formación práctica y actualizada para que aprendas desde cero o refuerces tus conocimientos.

🎓 Opciones disponibles:

1️⃣ Cursos individuales (Photoshop, Illustrator, Branding, etc.)
2️⃣ Megapack Premium con todos los cursos 💥

👉 ¿Te gustaría aprender algo específico o prefieres el paquete completo?`;
  }

  /**
   * Respuesta para megapack
   */
  static formatMegapackResponse(megapack: {
    name: string;
    price: number;
    courses: string[];
  }): string {
    const priceFormatted = this.formatPrice(megapack.price);
    
    let response = `🔥 ¡Perfecto! Te presento nuestro ${megapack.name}:

🎓 Incluye:`;

    megapack.courses.slice(0, 7).forEach(course => {
      response += `\n• ${course}`;
    });

    if (megapack.courses.length > 7) {
      response += `\n• y más...`;
    }

    response += `\n\n📦 Acceso inmediato
📱 Compatible con celular y PC
♾️ Acceso ilimitado

💰 Precio especial de hoy:
✨ ${priceFormatted}

¿Deseas asegurar tu acceso ahora?`;

    return response;
  }

  /**
   * Transición a cierre de venta
   */
  static formatSalesTransition(): string {
    return `Si deseas, puedo ayudarte a finalizar tu compra ahora mismo 😊

También puedo resolver cualquier duda antes de continuar.

👉 ¿Cómo prefieres avanzar?

1️⃣ Comprar ahora
2️⃣ Ver formas de pago
3️⃣ Hacer una pregunta`;
  }

  /**
   * Cierre de venta (cuando decide comprar)
   */
  static formatCheckout(productName: string, price: number): string {
    const priceFormatted = this.formatPrice(price);
    
    return `¡Excelente decisión! 🎉

📦 Producto: ${productName}
💰 Total: ${priceFormatted}

💳 Formas de pago disponibles:
• Nequi
• Daviplata
• Bancolombia
• Transferencia

📩 Una vez realizado el pago, recibirás:
✔ Acceso inmediato al producto
✔ Instrucciones claras por WhatsApp
✔ Soporte si lo necesitas

👉 Avísame cuando realices el pago y continúo con el proceso 😊`;
  }

  /**
   * Cierre final elegante (después de la venta)
   */
  static formatFinalGoodbye(): string {
    return `✨ Gracias por confiar en Tecnovariedades D&S

Ha sido un gusto atenderte 😊

Si más adelante necesitas:
🖥️ Computadores
📚 Más cursos
🛠️ Soporte técnico

Escríbenos en cualquier momento.

¡Que tengas un excelente día! 🌟`;
  }

  /**
   * Cierre sin compra (profesional)
   */
  static formatNoSaleGoodbye(): string {
    return `No hay problema 😊

Tu información queda guardada para cuando decidas continuar.

📌 Recuerda: Tenemos promociones activas y cupos limitados en algunos productos.

Cuando gustes, solo escríbenos y con gusto te asesoramos ✨

¡Feliz día!`;
  }

  /**
   * Respuesta cuando pregunta por computadores
   */
  static formatComputersResponse(): string {
    return `🖥️ ¡Excelente elección!

En Tecnovariedades D&S tenemos computadores listos para entrega inmediata 🚀

💻 Computadoras recomendadas según tu necesidad:

• Para estudio 📘: Core i5 / 8GB RAM
• Para oficina 🧑‍💼: Core i5 / 16GB RAM / SSD
• Para diseño 🎨: Core i7 / 16–32GB RAM / Tarjeta gráfica

👉 Cuéntame: ¿para qué la necesitas? Te recomiendo la mejor al precio más bajo 💰📉`;
  }

  /**
   * Respuesta cuando no entiende
   */
  static formatDidNotUnderstand(): string {
    return `Disculpa, no estoy seguro de entender 🤔

¿Podrías decirme qué estás buscando?

Por ejemplo:
• "Busco un curso de diseño"
• "Necesito una computadora"
• "Quiero ver los megapacks"

Estoy aquí para ayudarte 😊`;
  }

  /**
   * Formato Ultra-Premium (Card Moderna)
   */
  static formatPremiumCard(title: string, content: string, footer?: string, emoji: string = '💎'): string {
    const separator = '━━━━━━━━━━━━━━━━━━━━━━━━';
    
    return `╔══════════════════════╗
  ${emoji} ${title}
╚══════════════════════╝

${content}

${separator}

${footer ? `${footer}\n\n` : ''}🎯 ¿Te gustaría saber más? 😊`;
  }

  /**
   * Respuesta cuando pide fotos
   */
  static formatPhotoRequest(productName: string): string {
    return `¡Claro! 📸

Te envío las fotos de ${productName} en un momento...`;
  }

  /**
   * Respuesta cuando pregunta por precio
   */
  static formatPriceInquiry(productName: string, price: number): string {
    const priceFormatted = this.formatPrice(price);
    
    return `El precio de ${productName} es:

💰 ${priceFormatted}

✨ Precio especial de hoy
📦 Acceso inmediato
🎁 Incluye todo lo que necesitas

¿Te gustaría proceder con la compra?`;
  }

  /**
   * 🎹 FORMATO — CURSO (Pianao/Otros)
   */
  static formatCourseCard(product: any): string {
    const priceFormatted = this.formatPrice(product.price);
    const configs = product.configurations ? JSON.parse(product.configurations) : {};
    
    return `🎹 ${product.name.toUpperCase()}

💰 Precio: ${priceFormatted}
📚 Modalidad: ${configs.modalidad || 'Online'}
⏱ Duración: ${configs.duracion || 'Acceso ilimitado'}
📈 Nivel: ${configs.nivel || 'Principiante a Avanzado'}
👨‍🏫 Instructor: ${configs.instructor || 'Certificado'}

📋 Descripción
${product.description}

✨ Incluye:
${configs.beneficios || '• Técnicas básicas y avanzadas\n• Material de estudio\n• Acceso 24/7'}

📦 Acceso: ${configs.acceso || 'Inmediato después del pago'}
🛡 Garantía: ${configs.garantia || '7 días'}

💳 Métodos de pago disponibles:
• Transferencia (Nequi/Daviplata)
• Tarjeta de crédito
• Pago digital (PayPal/MercadoPago)

📩 ¿Deseas inscribirte o recibir más información?`;
  }

  /**
   * 💻 FORMATO — DISPOSITIVOS (Laptops/Variables)
   */
  static formatVariableCard(product: any): string {
    const priceFormatted = this.formatPrice(product.price);
    const configs = product.configurations ? JSON.parse(product.configurations) : {};
    
    return `💻 ${product.name.toUpperCase()}

🖥 Modelo: ${product.name}

💰 Precio desde: ${priceFormatted}
📦 Stock: Disponible
🚚 Entrega: ${product.tipo_entrega === 'local' ? 'Retiro en tienda' : 'Envio a domicilio'}
🛡 Garantía: ${configs.garantia || '12 meses'}

⚙️ Configuraciones disponibles:
• RAM: ${configs.ram || '8GB / 16GB'}
• SSD: ${configs.ssd || '256GB / 512GB'}
• Procesador: ${configs.cpu || 'Intel / AMD'}

📋 Descripción
${product.description}

📩 ¿Quieres cotizar una configuración específica?`;
  }

  /**
   * 📦 FORMATO — PRODUCTO DROPSHIPPING
   */
  static formatDropshippingCard(product: any): string {
    const priceFormatted = this.formatPrice(product.price);
    const configs = product.configurations ? JSON.parse(product.configurations) : {};
    
    return `📦 PRODUCTO DISPONIBLE

🛍 ${product.name}

💰 Precio: ${priceFormatted}
🌎 Envío internacional
⏱ Entrega estimada: ${configs.tiempo_entrega || '12-15 días'}

📋 Descripción
${product.description}

ℹ Este producto se envía desde proveedor externo.

💳 Pago disponible:
• Pago anticipado (Link de pago / Transferencia)

📩 ¿Deseas pedirlo?`;
  }

  /**
   * 🛒 FORMATO — PRODUCTO LOCAL
   */
  static formatLocalCard(product: any, businessAddress: string): string {
    const priceFormatted = this.formatPrice(product.price);
    
    return `🛍 ${product.name}

💰 Precio: ${priceFormatted}
📦 Disponible para entrega inmediata

📍 Retiro en tienda:
${businessAddress || 'Nuestra tienda física'}

📋 Descripción
${product.description}

💳 Pagos:
• Transferencia
• Efectivo
• Tarjeta

📩 ¿Deseas reservarlo?`;
  }

  /**
   * 🧠 MODO ASESOR — PREGUNTAR USO
   */
  static formatAdvisorStep1(): string {
    return `Perfecto 👨‍💻
Te ayudo a elegir el portátil ideal.

¿Para qué lo usarás principalmente?

1️⃣ Trabajo / oficina
2️⃣ Estudio
3️⃣ Gaming
4️⃣ Diseño / edición`;
  }

  /**
   * 🧠 MODO ASESOR — PREGUNTAR PRESUPUESTO
   */
  static formatAdvisorStep2(use: string): string {
    const useName = use === '1' ? 'Trabajo' : use === '2' ? 'Estudio' : use === '3' ? 'Gaming' : 'Diseño';
    return `Excelente 👍 (${useName})

¿Qué presupuesto aproximado tienes?

1️⃣ Menos de 2 millones
2️⃣ 2 a 3 millones
3️⃣ Más de 3 millones`;
  }

  /**
   * 🧠 MODO ASESOR — MOSTRAR OPCIONES RECOMENDADAS
   */
  static formatAdvisorRecommendations(products: any[]): string {
    let response = `💻 Opciones recomendadas para ti:\n\n`;
    
    products.slice(0, 3).forEach((p, i) => {
      response += `${i + 1}️⃣ ${p.name} — ${this.formatPrice(p.price)}\n`;
    });

    response += `\nResponde con el número para ver detalles.`;
    return response;
  }

  /**
   * 💎 FORMATO GENERAL AUTODETECTADO
   */
  static formatAutoCard(product: any, businessAddress: string = ''): string {
    if (product.tipo_producto === 'curso') return this.formatCourseCard(product);
    if (product.tipo_producto === 'variable') return this.formatVariableCard(product);
    if (product.tipo_entrega === 'dropshipping') return this.formatDropshippingCard(product);
    if (product.tipo_entrega === 'local') return this.formatLocalCard(product, businessAddress);
    
    return this.formatSingleProduct(product);
  }


  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Formatear precio en COP (Elegante)
   */
  static formatPrice(price: number): string {
    return `$${price.toLocaleString('es-CO')} COP`;
  }

  /**
   * Obtener emoji según categoría
   */
  static getCategoryEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
      'PHYSICAL': '📦',
      'DIGITAL': '⚡',
      'SERVICE': '🛠️',
      'MEGAPACK': '🚀',
      'COURSE': '🎓',
      'COMPUTER': '💻'
    };
    
    return emojiMap[category.toUpperCase()] || '✨';
  }

  /**
   * Limpiar y AIRAR el texto para máxima legibilidad
   */
  static cleanOldFormat(text: string): string {
    console.log('[Formatter] 🧹 Limpiando respuesta para formato AIREADO (Fase 2)...');
    
    // 1. Remover excesos (***, ___)
    let clean = text.replace(/\*\*\*/g, '').replace(/___/g, '');

    // 2. 🎨 FUERZA BRUTA DE ESPACIADO:
    // Asegurar SIEMPRE doble salto de línea antes y después de separadores, INCLUSO si están pegados a texto
    // Primero, limpiar espacios existentes alrededor
    clean = clean.replace(/[\n\s]*━━━━━━━━━━━━━━━━━━━━━━━━[\n\s]*/g, '\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n');
    
    // 3. Espaciar emojis claves (títulos de sección)
    // Ej: "💰 Precio:" -> "\n\n💰 Precio:"
    const sectionEmojis = ['💰', '💳', '📦', '🚀', '✨', '👉', '✅', '🎹', '➤'];
    sectionEmojis.forEach(emoji => {
       // Buscar el emoji y forzar saltos antes
       const regex = new RegExp(`[\\n\\s]*(${emoji})`, 'g'); 
       clean = clean.replace(regex, '\n\n$1');
    });

    // 4. ESTRATEGIA FINAL: Si hay un salto de línea simple entre frases largas, convertir a doble.
    // Esto evita bloques de texto en párrafos.
    clean = clean.replace(/([.!?])\n([A-Z¿¡])/g, '$1\n\n$2');

    // 5. Limpiar saltos de línea excesivos (más de 3, dejar max 2)
    clean = clean.replace(/\n{3,}/g, '\n\n');

    return clean.trim();
  }

  /**
   * Agregar espaciado profesional
   */
  static addProfessionalSpacing(text: string): string {
    // Asegurar espaciado entre emojis y texto
    text = text.replace(/([\u{1F300}-\u{1F9FF}])([A-Za-z0-9áéíóúÁÉÍÓÚ])/gu, '$1 $2');
    
    return text.trim();
  }
}
