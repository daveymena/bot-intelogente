/**
 * Formatea información de productos para WhatsApp
 */

export class ProductFormatter {
  /**
   * Formatea un solo producto con separadores visuales
   */
  static formatSingleProduct(product: any, index?: number): string {
    const emoji = this.getProductEmoji(product);
    const number = index ? `${index}️⃣ ` : '';
    
    const specs = this.extractSpecs(product);
    
    return `
━━━━━━━━━━━━━━━━━━━━━━
${emoji} ${number}${product.name}
━━━━━━━━━━━━━━━━━━━━━━

${this.getHighlight(product)}

🧩 Especificaciones:
${specs}

💰 Precio: ${product.price.toLocaleString('es-CO')} COP
📦 Stock: ${product.stock > 0 ? 'Disponible' : 'Consultar'}
🚚 Envío: Gratis a toda Colombia
🛡️ Garantía: 12 meses

━━━━━━━━━━━━━━━━━━━━━━
`.trim();
  }

  /**
   * Obtiene emoji según tipo de producto
   */
  private static getProductEmoji(product: any): string {
    const name = product.name.toLowerCase();
    if (name.includes('portátil') || name.includes('portatil') || name.includes('laptop')) return '💻';
    if (name.includes('mouse') || name.includes('teclado')) return '⌨️';
    if (name.includes('monitor')) return '🖥️';
    if (name.includes('curso')) return '📚';
    if (name.includes('mega')) return '📦';
    if (name.includes('moto')) return '🏍️';
    return '✨';
  }

  /**
   * Obtiene el destacado del producto
   */
  private static getHighlight(product: any): string {
    const desc = (product.description || '').toLowerCase();
    
    if (desc.includes('ideal para')) {
      const match = desc.match(/ideal para [^.]+/i);
      if (match) return `🔥 ${match[0]}`;
    }
    
    if (desc.includes('gamer') || desc.includes('gaming')) {
      return '🔥 Perfecto para gaming y trabajo exigente';
    }
    
    if (desc.includes('estudio') || desc.includes('estudiante')) {
      return '🔥 Ideal para estudiantes y trabajo';
    }
    
    if (desc.includes('profesional') || desc.includes('trabajo')) {
      return '🔥 Excelente para uso profesional';
    }
    
    return '🔥 Excelente opción de calidad';
  }

  /**
   * Extrae especificaciones del producto
   */
  private static extractSpecs(product: any): string {
    const desc = product.description || '';
    const specs: string[] = [];
    
    // Procesador
    const cpuMatch = desc.match(/(intel|amd|ryzen|core)[^,\n]{0,50}/i);
    if (cpuMatch) {
      specs.push(`⚙️ ${cpuMatch[0].trim()}`);
    }
    
    // RAM
    const ramMatch = desc.match(/\d+gb[^,\n]{0,20}ram/i);
    if (ramMatch) {
      specs.push(`🧠 ${ramMatch[0].trim()}`);
    }
    
    // Almacenamiento
    const storageMatch = desc.match(/\d+[gt]b[^,\n]{0,20}(ssd|hdd)/i);
    if (storageMatch) {
      specs.push(`💾 ${storageMatch[0].trim()}`);
    }
    
    // Pantalla
    const screenMatch = desc.match(/pantalla[^,\n]{0,30}|\d+\.?\d*["\s]*(pulgadas?|inch|fhd|hd)/i);
    if (screenMatch) {
      specs.push(`📺 ${screenMatch[0].trim()}`);
    }
    
    return specs.length > 0 ? specs.join('\n') : '📋 Ver descripción completa';
  }

  /**
   * Formatea mensaje inicial para múltiples productos
   */
  static formatInitialMessage(category: string, count: number): string {
    return `👍 Sí, tenemos ${category} disponibles.\n\nTe muestro las ${count} mejores opciones:`;
  }

  /**
   * Formatea mensaje final
   */
  static formatFinalMessage(): string {
    return '¿Quieres más opciones según tu presupuesto 💰 o uso (estudio 🎓, trabajo 💼, juegos 🎮)?\n\nEstoy aquí para ayudarte 😄💬';
  }
}
