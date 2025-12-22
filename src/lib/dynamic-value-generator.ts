/**
 * 🎯 DYNAMIC VALUE GENERATOR - VERSIÓN SIMPLIFICADA
 * 
 * Genera descripciones ÚNICAS y PERSUASIVAS para productos.
 * Usa solo campos existentes del Product (sin specifications).
 */

import { Product } from '@prisma/client';

interface ValueProposition {
  mainBenefit: string;
  emotionalHook: string;
  problemSolved: string;
  callToAction: string;
}

interface DynamicDescription {
  text: string;
  variation: number;
  technique: string;
}

export class DynamicValueGenerator {
  /**
   * Generar descripción dinámica y persuasiva
   */
  static async generateDynamic(params: {
    product: Product;
    variationSeed?: number;
  }): Promise<DynamicDescription> {
    const { product, variationSeed } = params;

    // Extraer valor del producto
    const valueProps = this.extractValuePropositions(product);

    // Seleccionar técnica de persuasión
    const technique = this.selectPersuasionTechnique(variationSeed);

    // Generar descripción única
    const text = this.generateByTechnique(product, valueProps, technique);

    return {
      text,
      variation: variationSeed || Math.floor(Math.random() * 1000),
      technique
    };
  }

  /**
   * Extraer proposiciones de valor
   */
  private static extractValuePropositions(product: Product): ValueProposition {
    return {
      mainBenefit: this.identifyMainBenefit(product),
      emotionalHook: this.createEmotionalHook(product),
      problemSolved: this.identifyProblemSolved(product),
      callToAction: this.generateCTA()
    };
  }

  /**
   * Identificar beneficio principal basado en categoría
   */
  private static identifyMainBenefit(product: Product): string {
    const category = product.category;
    
    const benefits: Record<string, string> = {
      'LAPTOP': 'Potencia y movilidad para tu día a día',
      'DESKTOP': 'Máximo rendimiento para gaming y trabajo',
      'MOTORCYCLE': 'Libertad y economía en cada viaje',
      'ACCESSORY': 'Complementa perfectamente tu equipo',
      'COMPONENT': 'Mejora el rendimiento de tu sistema',
      'COURSE': 'Aprende nuevas habilidades profesionales',
      'DIGITAL': 'Acceso inmediato a contenido de calidad'
    };

    return benefits[category] || 'Excelente relación calidad-precio';
  }

  /**
   * Crear gancho emocional
   */
  private static createEmotionalHook(product: Product): string {
    const hooks = [
      `Imagina logrando más con ${product.name}`,
      `¿Te imaginas la diferencia que hará ${product.name}?`,
      `Piensa en todo lo que lograrás con ${product.name}`,
      `Visualiza tu éxito con ${product.name}`
    ];

    const randomIndex = Math.floor(Math.random() * hooks.length);
    return hooks[randomIndex];
  }

  /**
   * Identificar problema que resuelve
   */
  private static identifyProblemSolved(product: Product): string {
    const category = product.category;
    
    const problems: Record<string, string> = {
      'LAPTOP': '¿Cansado de equipos lentos que frenan tu productividad?',
      'DESKTOP': '¿Frustrado por el lag en tus juegos favoritos?',
      'MOTORCYCLE': '¿Harto de perder tiempo en el tráfico?',
      'ACCESSORY': '¿Necesitas complementar tu equipo?',
      'COMPONENT': '¿Quieres mejorar el rendimiento?',
      'COURSE': '¿Buscas crecer profesionalmente?',
      'DIGITAL': '¿Necesitas contenido de calidad?'
    };

    return problems[category] || '¿Buscas una solución efectiva?';
  }

  /**
   * Generar Call-to-Action
   */
  private static generateCTA(): string {
    const ctas = [
      '¿Te gustaría saber más detalles?',
      '¿Quieres conocer las formas de pago?',
      '¿Te interesa? Puedo darte más información',
      '¿Listo para dar el siguiente paso?',
      '¿Quieres que te cuente más?'
    ];

    const randomIndex = Math.floor(Math.random() * ctas.length);
    return ctas[randomIndex];
  }

  /**
   * Seleccionar técnica de persuasión
   */
  private static selectPersuasionTechnique(seed?: number): string {
    const techniques = [
      'storytelling',
      'problem_solution',
      'emotional',
      'benefit_focused',
      'scarcity'
    ];

    const index = seed ? seed % techniques.length : Math.floor(Math.random() * techniques.length);
    return techniques[index];
  }

  /**
   * Generar descripción por técnica
   */
  private static generateByTechnique(
    product: Product,
    valueProps: ValueProposition,
    technique: string
  ): string {
    switch (technique) {
      case 'storytelling':
        return this.generateStorytelling(product, valueProps);
      
      case 'problem_solution':
        return this.generateProblemSolution(product, valueProps);
      
      case 'emotional':
        return this.generateEmotional(product, valueProps);
      
      case 'scarcity':
        return this.generateScarcity(product, valueProps);
      
      default:
        return this.generateBenefitFocused(product, valueProps);
    }
  }

  /**
   * Técnica: Storytelling
   */
  private static generateStorytelling(product: Product, valueProps: ValueProposition): string {
    return `
${valueProps.emotionalHook} 🌟

Con el **${product.name}**, eso es posible.

${valueProps.mainBenefit}. No es solo un producto, es la herramienta que transformará tu día a día.

${product.description ? `💡 **Detalles:**\n${product.description}` : ''}

💰 **Inversión**: ${this.formatPrice(product.price)}

${valueProps.callToAction} 😊
    `.trim();
  }

  /**
   * Técnica: Problema → Solución
   */
  private static generateProblemSolution(product: Product, valueProps: ValueProposition): string {
    return `
${valueProps.problemSolved}

✨ **La solución está aquí**: ${product.name}

${valueProps.mainBenefit}. Este es el producto que estabas buscando.

${product.description ? `🎯 **Características:**\n${product.description}` : ''}

💰 **Precio**: ${this.formatPrice(product.price)}

${valueProps.callToAction} 🚀
    `.trim();
  }

  /**
   * Técnica: Conexión Emocional
   */
  private static generateEmotional(product: Product, valueProps: ValueProposition): string {
    return `
¡Excelente elección! 🎯

El **${product.name}** es más que un producto, es la respuesta a lo que necesitas.

${valueProps.emotionalHook} ✨

${valueProps.mainBenefit}

${product.description ? `💎 **Por qué te encantará:**\n${product.description}` : ''}

💰 **Inversión en tu futuro**: ${this.formatPrice(product.price)}

${valueProps.callToAction} 💬
    `.trim();
  }

  /**
   * Técnica: Enfoque en Beneficios
   */
  private static generateBenefitFocused(product: Product, valueProps: ValueProposition): string {
    return `
¡Perfecto! 💻 El **${product.name}** es ideal para ti.

✨ **Beneficio principal**: ${valueProps.mainBenefit}

${product.description ? `🔥 **Lo que obtienes:**\n${product.description}` : ''}

💰 **Precio**: ${this.formatPrice(product.price)}

${valueProps.callToAction} 😊
    `.trim();
  }

  /**
   * Técnica: Escasez
   */
  private static generateScarcity(product: Product, valueProps: ValueProposition): string {
    const stockMessage = product.stock && product.stock <= 5 
      ? `⚠️ **Solo quedan ${product.stock} unidades**`
      : '✅ **Disponible ahora**';

    return `
${stockMessage}

El **${product.name}** es uno de nuestros productos más solicitados.

${valueProps.mainBenefit} 🚀

${product.description ? `🎯 **Características:**\n${product.description}` : ''}

💰 **Precio especial**: ${this.formatPrice(product.price)}

${valueProps.callToAction} ⚡
    `.trim();
  }

  /**
   * Formatear precio
   */
  private static formatPrice(price: number): string {
    return `$${price.toLocaleString('es-CO')} COP`;
  }
}
