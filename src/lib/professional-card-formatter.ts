/**
 * FORMATEADOR PROFESIONAL TIPO CARD/BOLETA
 * Sin asteriscos, sin puntos, solo emojis y espaciado elegante
 */

export class ProfessionalCardFormatter {
  /**
   * Formatea un producto en estilo card/boleta profesional
   */
  static formatProductCard(product: any, context: 'single' | 'list' = 'single'): string {
    const emoji = this.getCategoryEmoji(product.category);
    const price = this.formatPrice(product.price);
    
    if (context === 'list') {
      // Formato compacto para listas
      return `${emoji} ${product.name}\n💰 ${price}\n`;
    }
    
    // Formato completo tipo boleta
    let card = '';
    
    // Header con emoji y nombre
    card += `${emoji} ${product.name}\n\n`;
    
    // Precio destacado
    card += `💰 Precio: ${price}\n\n`;
    
    // Descripción (si existe)
    if (product.description) {
      const desc = product.description.substring(0, 200);
      card += `📋 ${desc}${product.description.length > 200 ? '...' : ''}\n\n`;
    }
    
    // Características (si es digital)
    if (product.category === 'DIGITAL') {
      card += `✨ Incluye:\n`;
      card += `• Acceso inmediato\n`;
      card += `• Entrega digital por WhatsApp\n`;
      card += `• Soporte incluido\n\n`;
    }
    
    // Call to action
    card += `🛒 ¿Te gustaría comprarlo?\n`;
    card += `Escribe "pagar" para ver los métodos de pago`;
    
    return card;
  }
  
  /**
   * Formatea múltiples productos en lista
   */
  static formatProductList(products: any[], reason?: string): string {
    let message = '';
    
    // Mensaje introductorio si hay razón
    if (reason) {
      message += `💡 ${reason}\n\n`;
    } else {
      message += `✨ Encontré estas opciones para ti:\n\n`;
    }
    
    // Lista de productos
    products.forEach((product, index) => {
      const emoji = this.getCategoryEmoji(product.category);
      const price = this.formatPrice(product.price);
      
      message += `${index + 1}️⃣ ${emoji} ${product.name}\n`;
      message += `   💰 ${price}\n`;
      
      if (product.description) {
        const shortDesc = product.description.substring(0, 80);
        message += `   📝 ${shortDesc}${product.description.length > 80 ? '...' : ''}\n`;
      }
      
      message += `\n`;
    });
    
    // Call to action
    message += `¿Cuál te interesa?\n`;
    message += `Dime el número o el nombre 😊`;
    
    return message;
  }
  
  /**
   * Formatea mensaje de no encontrado
   */
  static formatNotFound(query: string): string {
    return `😅 No encontré productos para "${query}"\n\n` +
           `💡 Intenta con:\n` +
           `• Palabras clave más específicas\n` +
           `• Nombre del producto\n` +
           `• Categoría (laptop, curso, megapack)\n\n` +
           `¿En qué más puedo ayudarte? 😊`;
  }
  
  /**
   * Formatea mensaje de megapack como alternativa
   */
  static formatMegapackAlternative(megapacks: any[], originalQuery: string): string {
    let message = `💡 No encontré un curso individual de ${originalQuery}\n\n`;
    message += `Pero tengo estos megapacks que lo incluyen:\n\n`;
    
    megapacks.forEach((pack, index) => {
      const price = this.formatPrice(pack.price);
      message += `${index + 1}️⃣ 📦 ${pack.name}\n`;
      message += `   💰 ${price}\n`;
      
      if (pack.description) {
        const shortDesc = pack.description.substring(0, 100);
        message += `   📝 ${shortDesc}${pack.description.length > 100 ? '...' : ''}\n`;
      }
      
      message += `\n`;
    });
    
    message += `¿Te interesa alguno?\n`;
    message += `Dime el número para más información 😊`;
    
    return message;
  }
  
  /**
   * Obtiene emoji según categoría
   */
  private static getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      'DIGITAL': '🎓',
      'PHYSICAL': '💻',
      'SERVICE': '🔧',
      'DROPSHIPPING': '📦'
    };
    return emojis[category] || '📦';
  }
  
  /**
   * Formatea precio sin puntos ni asteriscos
   */
  private static formatPrice(price: number): string {
    return `${price.toLocaleString('es-CO')} COP`;
  }
  
  /**
   * Limpia formato antiguo (asteriscos, puntos, etc)
   */
  static cleanOldFormat(text: string): string {
    return text
      // Eliminar asteriscos de negrilla
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      // Eliminar guiones bajos de cursiva
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Eliminar bullets con guiones
      .replace(/^[\s]*-[\s]+/gm, '• ')
      // Limpiar múltiples espacios
      .replace(/\s{3,}/g, '\n\n')
      .trim();
  }
}
