/**
 * 🎯 AIDA RESPONSE GENERATOR
 * 
 * Genera respuestas profesionales usando metodología AIDA
 * (Atención, Interés, Deseo, Acción)
 * 
 * Características:
 * - Respuestas con 3 opciones para búsquedas generales
 * - Respuestas específicas para productos concretos
 * - Respuestas de cierre de venta
 * - Emojis y formato atractivo
 * - Compatible con SaaS
 */

import { Product } from '@prisma/client';

interface AidaResponse {
  text: string;
  type: 'multi_option' | 'single_product' | 'closing' | 'clarification';
  products: Product[];
}

export class AidaResponseGenerator {
  /**
   * Generar respuesta con múltiples opciones (Top 3)
   */
  static generateMultiOption(products: Product[], searchQuery?: string): AidaResponse {
    if (products.length === 0) {
      return {
        text: this.generateNoProductsResponse(searchQuery),
        type: 'clarification',
        products: []
      };
    }

    // ATENCIÓN: Hook inicial
    const attention = this.getAttentionHook(products[0].category, searchQuery);
    
    // INTERÉS + DESEO: Presentar opciones
    const options = products.slice(0, 3).map((product, index) => {
      return this.formatProductOption(product, index + 1);
    }).join('\n\n');

    // ACCIÓN: CTA claro
    const action = this.getActionCTA('multi');

    const text = `${attention}\n\n${options}\n\n${action}`;

    return {
      text,
      type: 'multi_option',
      products: products.slice(0, 3)
    };
  }

  /**
   * Generar respuesta para producto específico
   */
  static generateSingleProduct(product: Product): AidaResponse {
    // ATENCIÓN: Validación de elección
    const attention = `¡Excelente elección! 🎯 ${this.getProductEmoji(product.category)}`;

    // INTERÉS: Información clave del producto
    const interest = this.formatProductDetails(product);

    // DESEO: Beneficios y casos de uso
    const desire = this.generateDesireSection(product);

    // ACCIÓN: Siguiente paso
    const action = `¿Te gustaría conocer las formas de pago? 💳`;

    const text = `${attention}\n\n${interest}\n\n${desire}\n\n${action}`;

    return {
      text,
      type: 'single_product',
      products: [product]
    };
  }

  /**
   * Generar respuesta de cierre de venta
   */
  static generateClosing(product: Product, paymentMethod?: string): AidaResponse {
    const productInfo = `**${product.name}**\n💰 ${this.formatPrice(product.price)}`;

    let text: string;

    if (paymentMethod) {
      // Ya seleccionó método de pago
      text = `¡Perfecto! 🎉\n\n${productInfo}\n\nPago con: ${paymentMethod}\n\n` +
             `Te enviaré los datos de pago ahora mismo. ¿Listo para continuar? ✅`;
    } else {
      // Ofrecer métodos de pago
      text = `¡Excelente! 💚\n\n${productInfo}\n\n` +
             `**Métodos de pago disponibles:**\n` +
             `1. 💳 MercadoPago - Paga en cuotas sin interés\n` +
             `2. 📱 Nequi/Daviplata - Transferencia inmediata\n` +
             `3. 💵 Efectivo - Descuento del 5%\n` +
             `4. 🏦 Transferencia bancaria\n\n` +
             `¿Cuál prefieres? 😊`;
    }

    return {
      text,
      type: 'closing',
      products: [product]
    };
  }

  /**
   * Generar respuesta cuando no hay productos
   */
  private static generateNoProductsResponse(searchQuery?: string): string {
    if (searchQuery) {
      return `Lo siento, no tengo productos que coincidan con "${searchQuery}" en este momento. 😔\n\n` +
             `¿Te gustaría que te muestre otras opciones disponibles? 🔍`;
    }

    return `Lo siento, no tengo productos disponibles en este momento. 😔\n\n` +
           `¿Hay algo más en lo que pueda ayudarte? 😊`;
  }

  /**
   * Formatear opción de producto (para lista de 3)
   */
  private static formatProductOption(product: Product, index: number): string {
    const emoji = this.getProductEmoji(product.category);
    const price = this.formatPrice(product.price);
    const features = this.extractKeyFeatures(product);
    const benefit = this.getMainBenefit(product);

    return `**${index}. ${product.name}** - ${price}\n` +
           `${emoji} ${features}\n` +
           `→ ${benefit}`;
  }

  /**
   * Formatear detalles completos de producto
   */
  private static formatProductDetails(product: Product): string {
    const emoji = this.getProductEmoji(product.category);
    const price = this.formatPrice(product.price);

    let details = `${emoji} **${product.name}**\n💰 Precio: ${price}`;

    if (product.description) {
      const shortDesc = product.description.substring(0, 200);
      details += `\n\n📝 ${shortDesc}${product.description.length > 200 ? '...' : ''}`;
    }

    return details;
  }

  /**
   * Generar sección de DESEO (beneficios)
   */
  private static generateDesireSection(product: Product): string {
    const benefits = this.getProductBenefits(product);
    
    if (benefits.length === 0) {
      return `✨ **Perfecto para ti**`;
    }

    const benefitsList = benefits.map(b => `✓ ${b}`).join('\n');
    return `✨ **Ideal para:**\n${benefitsList}`;
  }

  /**
   * Obtener hook de atención según categoría
   */
  private static getAttentionHook(category: string, searchQuery?: string): string {
    const hooks: Record<string, string> = {
      'PHYSICAL': '¡Perfecto! 💻 Tengo excelentes opciones para ti:',
      'DIGITAL': '¡Genial! 💎 Estos cursos te encantarán:',
      'SERVICE': '¡Excelente! 🎯 Estos servicios son ideales:'
    };

    return hooks[category] || `¡Encontré esto para ti! 🔍`;
  }

  /**
   * Obtener CTA según tipo
   */
  private static getActionCTA(type: 'multi' | 'single'): string {
    if (type === 'multi') {
      return `¿Cuál te llama más la atención? 😊`;
    }
    return `¿Te gustaría saber más? 💬`;
  }

  /**
   * Obtener emoji según categoría
   */
  private static getProductEmoji(category: string): string {
    const emojis: Record<string, string> = {
      'PHYSICAL': '💻',
      'DIGITAL': '💎',
      'SERVICE': '🎯'
    };
    return emojis[category] || '📦';
  }

  /**
   * Formatear precio
   */
  private static formatPrice(price: number, currency: string = 'COP'): string {
    return `$${price.toLocaleString('es-CO')} ${currency}`;
  }

  /**
   * Extraer características clave
   */
  private static extractKeyFeatures(product: Product): string {
    if (!product.description) return '';

    // Buscar características en la descripción
    const desc = product.description.toLowerCase();
    const features: string[] = [];

    // Patrones comunes
    if (desc.includes('gb') || desc.includes('ram')) {
      const match = desc.match(/(\d+\s?gb)/i);
      if (match) features.push(match[1]);
    }

    if (desc.includes('rtx') || desc.includes('gtx')) {
      const match = desc.match(/(rtx|gtx)\s?\d+/i);
      if (match) features.push(match[0].toUpperCase());
    }

    if (desc.includes('i5') || desc.includes('i7') || desc.includes('i9')) {
      const match = desc.match(/i[579]/i);
      if (match) features.push(`Intel ${match[0]}`);
    }

    return features.slice(0, 3).join(' | ') || 'Características destacadas';
  }

  /**
   * Obtener beneficio principal
   */
  private static getMainBenefit(product: Product): string {
    const category = product.category;

    const benefits: Record<string, string[]> = {
      'PHYSICAL': [
        'Ideal para trabajo y gaming',
        'Máximo rendimiento',
        'Perfecto para profesionales'
      ],
      'DIGITAL': [
        'Aprende a tu ritmo',
        'Acceso inmediato',
        'Acceso vitalicio'
      ],
      'SERVICE': [
        'Resultados garantizados',
        'Atención personalizada',
        'Calidad profesional'
      ]
    };

    const categoryBenefits = benefits[category] || ['Excelente opción'];
    return categoryBenefits[Math.floor(Math.random() * categoryBenefits.length)];
  }

  /**
   * Obtener beneficios del producto
   */
  private static getProductBenefits(product: Product): string[] {
    const benefits: string[] = [];

    // Basado en categoría
    if (product.category === 'PHYSICAL') {
      benefits.push('Garantía incluida');
      benefits.push('Envío a todo el país');
    } else if (product.category === 'DIGITAL') {
      benefits.push('Acceso inmediato');
      benefits.push('Actualizaciones gratis');
    }

    return benefits;
  }
}
