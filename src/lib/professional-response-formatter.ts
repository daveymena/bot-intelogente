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

Soy Dani, tu asesor virtual 🤖💬
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

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Formatear precio en COP
   */
  static formatPrice(price: number): string {
    return `$${price.toLocaleString('es-CO')} COP`;
  }

  /**
   * Obtener emoji según categoría
   */
  static getCategoryEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
      'PHYSICAL': '🖥️',
      'DIGITAL': '📚',
      'SERVICE': '🛠️',
      'MEGAPACK': '💥',
      'COURSE': '🎓',
      'COMPUTER': '💻'
    };
    
    return emojiMap[category.toUpperCase()] || '📦';
  }

  /**
   * Limpiar texto de asteriscos y formato antiguo
   */
  static cleanOldFormat(text: string): string {
    // Remover asteriscos de negrilla
    text = text.replace(/\*\*(.*?)\*\*/g, '$1');
    text = text.replace(/\*(.*?)\*/g, '$1');
    
    // Remover guiones bajos
    text = text.replace(/__(.*?)__/g, '$1');
    text = text.replace(/_(.*?)_/g, '$1');
    
    return text;
  }

  /**
   * Agregar espaciado profesional
   */
  static addProfessionalSpacing(text: string): string {
    // Asegurar doble salto de línea entre secciones
    text = text.replace(/\n([A-Z0-9])/g, '\n\n$1');
    
    // Asegurar espacio después de emojis
    text = text.replace(/([\u{1F300}-\u{1F9FF}])([A-Za-z])/gu, '$1 $2');
    
    return text;
  }
}
