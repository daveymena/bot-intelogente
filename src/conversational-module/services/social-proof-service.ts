/**
 * Servicio de Prueba Social
 * Agrega garantías, testimonios y elementos de confianza
 */

export interface SocialProofElement {
  type: 'testimonial' | 'guarantee' | 'stats' | 'certification';
  content: string;
  author?: string;
  rating?: number;
}

export interface GuaranteeConfig {
  type: 'money_back' | 'satisfaction' | 'quality' | 'delivery';
  days?: number;
  description: string;
  icon: string;
}

/**
 * Servicio de Prueba Social
 */
export class SocialProofService {
  /**
   * Garantías predefinidas por tipo de producto
   */
  private static guarantees: Record<string, GuaranteeConfig[]> = {
    DIGITAL: [
      {
        type: 'money_back',
        days: 7,
        description: 'Garantía de devolución de dinero',
        icon: '💰',
      },
      {
        type: 'satisfaction',
        description: '100% Satisfacción garantizada',
        icon: '✅',
      },
      {
        type: 'quality',
        description: 'Contenido de alta calidad verificado',
        icon: '⭐',
      },
    ],
    PHYSICAL: [
      {
        type: 'quality',
        days: 30,
        description: 'Garantía de calidad',
        icon: '🛡️',
      },
      {
        type: 'delivery',
        description: 'Envío seguro y rastreable',
        icon: '📦',
      },
      {
        type: 'satisfaction',
        days: 15,
        description: 'Cambios y devoluciones',
        icon: '🔄',
      },
    ],
    SERVICE: [
      {
        type: 'satisfaction',
        description: 'Satisfacción 100% garantizada',
        icon: '✨',
      },
      {
        type: 'quality',
        description: 'Profesionales experimentados',
        icon: '👨‍🔧',
      },
    ],
  };

  /**
   * Testimonios genéricos por categoría
   */
  private static testimonials: Record<string, SocialProofElement[]> = {
    DIGITAL: [
      {
        type: 'testimonial',
        content: 'Excelente contenido, muy completo y fácil de seguir. Lo recomiendo 100%',
        author: 'María G.',
        rating: 5,
      },
      {
        type: 'testimonial',
        content: 'Superó mis expectativas. La mejor inversión que he hecho en mi formación',
        author: 'Carlos R.',
        rating: 5,
      },
      {
        type: 'testimonial',
        content: 'Material de calidad profesional. Muy satisfecho con la compra',
        author: 'Ana M.',
        rating: 5,
      },
    ],
    PHYSICAL: [
      {
        type: 'testimonial',
        content: 'Producto de excelente calidad, llegó rápido y bien empacado',
        author: 'Luis P.',
        rating: 5,
      },
      {
        type: 'testimonial',
        content: 'Justo lo que esperaba. Muy buena atención al cliente',
        author: 'Diana S.',
        rating: 5,
      },
    ],
    SERVICE: [
      {
        type: 'testimonial',
        content: 'Servicio profesional y rápido. Muy recomendado',
        author: 'Jorge M.',
        rating: 5,
      },
    ],
  };

  /**
   * Estadísticas de confianza
   */
  private static stats: SocialProofElement[] = [
    {
      type: 'stats',
      content: '+5,000 clientes satisfechos',
    },
    {
      type: 'stats',
      content: '98% de valoraciones positivas',
    },
    {
      type: 'stats',
      content: '+10 años de experiencia',
    },
  ];

  /**
   * Genera mensaje con garantías para un producto
   */
  static generateGuaranteeMessage(category: string): string {
    const productType = this.getProductType(category);
    const guarantees = this.guarantees[productType] || this.guarantees.PHYSICAL;

    let message = '🛡️ *GARANTÍAS Y SEGURIDAD*\n\n';

    guarantees.forEach(g => {
      message += `${g.icon} *${g.description}*\n`;
      if (g.days) {
        message += `   ${g.days} días de garantía\n`;
      }
      message += '\n';
    });

    return message;
  }

  /**
   * Genera mensaje con testimonios
   */
  static generateTestimonialMessage(category: string, count: number = 2): string {
    const productType = this.getProductType(category);
    const testimonials = this.testimonials[productType] || this.testimonials.PHYSICAL;

    const selectedTestimonials = testimonials.slice(0, count);

    let message = '⭐ *LO QUE DICEN NUESTROS CLIENTES*\n\n';

    selectedTestimonials.forEach((t, i) => {
      const stars = '⭐'.repeat(t.rating || 5);
      message += `${i + 1}. ${stars}\n`;
      message += `"${t.content}"\n`;
      message += `— ${t.author}\n\n`;
    });

    return message;
  }

  /**
   * Genera mensaje con estadísticas de confianza
   */
  static generateStatsMessage(): string {
    let message = '📊 *NÚMEROS QUE NOS RESPALDAN*\n\n';

    this.stats.forEach(stat => {
      message += `✅ ${stat.content}\n`;
    });

    message += '\n🏆 Empresa verificada y confiable';

    return message;
  }

  /**
   * Genera mensaje completo de prueba social
   */
  static generateFullSocialProof(
    category: string,
    includeTestimonials: boolean = true,
    includeStats: boolean = true
  ): string {
    let message = '';

    // Garantías
    message += this.generateGuaranteeMessage(category);
    message += '\n━━━━━━━━━━━━━━━━━━━━\n\n';

    // Testimonios
    if (includeTestimonials) {
      message += this.generateTestimonialMessage(category, 2);
      message += '\n━━━━━━━━━━━━━━━━━━━━\n\n';
    }

    // Estadísticas
    if (includeStats) {
      message += this.generateStatsMessage();
    }

    return message;
  }

  /**
   * Agrega prueba social a un mensaje existente
   */
  static addSocialProofToMessage(
    originalMessage: string,
    category: string,
    type: 'guarantee' | 'testimonial' | 'stats' | 'full' = 'guarantee'
  ): string {
    let socialProof = '';

    switch (type) {
      case 'guarantee':
        socialProof = this.generateGuaranteeMessage(category);
        break;
      case 'testimonial':
        socialProof = this.generateTestimonialMessage(category, 1);
        break;
      case 'stats':
        socialProof = this.generateStatsMessage();
        break;
      case 'full':
        socialProof = this.generateFullSocialProof(category, true, true);
        break;
    }

    return `${originalMessage}\n\n━━━━━━━━━━━━━━━━━━━━\n\n${socialProof}`;
  }

  /**
   * Obtiene garantía específica por tipo
   */
  static getGuarantee(
    category: string,
    guaranteeType: GuaranteeConfig['type']
  ): GuaranteeConfig | null {
    const productType = this.getProductType(category);
    const guarantees = this.guarantees[productType] || this.guarantees.PHYSICAL;

    return guarantees.find(g => g.type === guaranteeType) || null;
  }

  /**
   * Genera mensaje de garantía de devolución de dinero
   */
  static generateMoneyBackGuarantee(days: number = 7): string {
    return `💰 *GARANTÍA DE DEVOLUCIÓN*

Si no estás 100% satisfecho, te devolvemos tu dinero.

✅ ${days} días para solicitar reembolso
✅ Sin preguntas
✅ Proceso simple y rápido

*Tu satisfacción es nuestra prioridad* 🎯`;
  }

  /**
   * Genera mensaje de envío seguro
   */
  static generateSecureDeliveryMessage(): string {
    return `📦 *ENVÍO SEGURO Y CONFIABLE*

✅ Empaque profesional
✅ Rastreo en tiempo real
✅ Seguro de envío incluido
✅ Entrega garantizada

*Tu producto llegará en perfectas condiciones* 🛡️`;
  }

  /**
   * Determina el tipo de producto
   */
  private static getProductType(category: string): 'DIGITAL' | 'PHYSICAL' | 'SERVICE' {
    const categoryLower = category.toLowerCase();

    if (categoryLower.includes('digital') || categoryLower.includes('curso') || categoryLower.includes('megapack')) {
      return 'DIGITAL';
    }

    if (categoryLower.includes('service') || categoryLower.includes('servicio')) {
      return 'SERVICE';
    }

    return 'PHYSICAL';
  }

  /**
   * Genera sello de confianza
   */
  static generateTrustBadge(): string {
    return `
🏆 *EMPRESA VERIFICADA*
✅ Pagos 100% seguros
✅ Datos protegidos
✅ Atención personalizada
✅ Respuesta rápida
`;
  }

  /**
   * Genera mensaje de urgencia con prueba social
   */
  static generateUrgencyWithSocialProof(
    productName: string,
    stock?: number
  ): string {
    let message = '⚡ *ALTA DEMANDA*\n\n';

    if (stock && stock < 10) {
      message += `⚠️ Solo quedan ${stock} unidades de *${productName}*\n\n`;
    } else {
      message += `🔥 *${productName}* es uno de nuestros productos más vendidos\n\n`;
    }

    message += '👥 *Otros clientes están viendo este producto ahora*\n\n';
    message += '💡 Asegura el tuyo antes de que se agote';

    return message;
  }
}
