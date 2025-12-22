/**
 * 🎨 GENERADOR DE PLANTILLAS PERSONALIZADAS
 * Crea plantillas de respuesta adaptadas al tipo de producto y estrategia de venta
 */

import { ProductClassifier, ProductType, SalesStrategy, ProductClassification } from './product-classifier';
import { Utils } from './plantillas-respuestas-bot';

export class TemplateGenerator {
  /**
   * 🎯 GENERAR PLANTILLA DE PRODUCTO ENCONTRADO
   */
  static generateProductFoundTemplate(
    product: any,
    classification: ProductClassification
  ): string {
    const { type, strategy, deliveryOptions, salesApproach } = classification;

    switch (type) {
      case ProductType.DIGITAL:
        return this.generateDigitalProductTemplate(product);

      case ProductType.PHYSICAL_HIGH_VALUE:
        return this.generateHighValueProductTemplate(product, deliveryOptions);

      case ProductType.PHYSICAL_LOW_VALUE:
        return this.generateLowValueProductTemplate(product, deliveryOptions);

      case ProductType.PHYSICAL_MEDIUM_VALUE:
        return this.generateMediumValueProductTemplate(product, deliveryOptions);

      case ProductType.SERVICE:
        return this.generateServiceTemplate(product);

      default:
        return this.generateGenericProductTemplate(product);
    }
  }

  /**
   * 📚 PLANTILLA PARA PRODUCTOS DIGITALES
   */
  private static generateDigitalProductTemplate(product: any): string {
    return `¡Perfecto! 🎯 Encontré exactamente lo que buscas:

🎓 *${product.name}*
💰 *Precio:* ${Utils.formatPrice(product.price)} COP

✨ *Incluye:*
${product.description ? `• ${product.description}` : '• Contenido completo y actualizado'}

🚀 *Entrega AUTOMÁTICA e INMEDIATA*
✅ Pagas y recibes tu acceso al instante
📧 Link de descarga directo a tu email/WhatsApp
🔓 Disponible 24/7 desde cualquier dispositivo

━━━━━━━━━━━━━━━━━━━━━━
💳 *ELIGE TU MÉTODO DE PAGO:*
━━━━━━━━━━━━━━━━━━━━━━

1️⃣ *MercadoPago* 💳
   ✅ Tarjetas, PSE, efectivo
   ✅ Pago 100% seguro
   👉 Responde: "MercadoPago"

2️⃣ *PayPal* 🌍
   ✅ Tarjetas internacionales
   ✅ Protección al comprador
   👉 Responde: "PayPal"

3️⃣ *Nequi* 📱
   ✅ Transferencia al 3136174267
   ✅ Envía captura del pago
   👉 Responde: "Nequi"

4️⃣ *Daviplata* 💰
   ✅ Transferencia al 3136174267
   ✅ Envía captura del pago
   👉 Responde: "Daviplata"

━━━━━━━━━━━━━━━━━━━━━━

🎁 *¡OFERTA ESPECIAL!*
Compra ahora y recibe acceso inmediato + soporte personalizado

💬 *¿Listo para comprar?*
Solo responde con el método de pago que prefieres y te genero tu link al instante 🚀`;
  }

  /**
   * 💻 PLANTILLA PARA PRODUCTOS DE ALTO VALOR
   */
  private static generateHighValueProductTemplate(product: any, deliveryOptions: string[]): string {
    const deliveryText = deliveryOptions.includes('ENTREGA_LOCAL')
      ? '🚚 *Entrega local* disponible en nuestra tienda'
      : '🚚 *Envío seguro* con seguimiento completo';

    return `¡Excelente elección! 💎 Encontramos este producto premium:

🖥️ *${product.name}*
💰 *Precio:* ${Utils.formatPrice(product.price)} COP

⚡ *Características destacadas:*
${product.description ? `• ${product.description}` : '• Producto de alta calidad'}

${deliveryText}
🛡️ *Garantía extendida* incluida
📞 *Asesoría técnica* especializada

━━━━━━━━━━━━━━━━━━━━━━
💳 *OPCIONES DE PAGO:*
━━━━━━━━━━━━━━━━━━━━━━

1️⃣ *Pago en Línea* 💳
   ✅ MercadoPago o PayPal
   ✅ Envío inmediato después del pago
   👉 Responde: "Pago en línea"

2️⃣ *Contraentrega* 🚚
   ✅ Pagas cuando recibes el producto
   ✅ Sin riesgos, verificas antes de pagar
   👉 Responde: "Contraentrega"

3️⃣ *Transferencia* 📱
   ✅ Nequi/Daviplata al 3136174267
   ✅ Envía captura y enviamos tu pedido
   👉 Responde: "Transferencia"

━━━━━━━━━━━━━━━━━━━━━━

🎁 *INCLUYE:*
✅ Envío asegurado
✅ Garantía extendida
✅ Soporte técnico

💬 *¿Cómo prefieres pagar?*
Responde con tu opción y procesamos tu pedido al instante 🚀`;
  }

  /**
   * 🎒 PLANTILLA PARA PRODUCTOS DE BAJO VALOR
   */
  private static generateLowValueProductTemplate(product: any, deliveryOptions: string[]): string {
    const deliveryText = deliveryOptions.includes('CONTRAENTREGA')
      ? '🚚 *Contraentrega disponible* - Pagas al recibir'
      : '🚚 *Envío económico* a toda Colombia';

    return `¡Genial! 🎉 Encontré este producto perfecto:

🎒 *${product.name}*
💰 *Precio:* ${Utils.formatPrice(product.price)} COP

✨ *Ideal para:*
${product.description ? `• ${product.description}` : '• Producto de calidad a excelente precio'}

${deliveryText}
⚡ *Entrega rápida* (2-3 días hábiles)

━━━━━━━━━━━━━━━━━━━━━━
💳 *ELIGE TU MÉTODO DE PAGO:*
━━━━━━━━━━━━━━━━━━━━━━

1️⃣ *Contraentrega* 🚚
   ✅ Pagas cuando recibes
   ✅ Sin riesgos
   👉 Responde: "Contraentrega"

2️⃣ *MercadoPago* 💳
   ✅ Tarjetas, PSE, efectivo
   ✅ Envío inmediato
   👉 Responde: "MercadoPago"

3️⃣ *Transferencia* 📱
   ✅ Nequi/Daviplata al 3136174267
   ✅ Envía captura del pago
   👉 Responde: "Nequi" o "Daviplata"

━━━━━━━━━━━━━━━━━━━━━━

🎁 *¡Aprovecha!*
Compra ahora y recibe en 2-3 días

💬 *¿Listo para ordenar?*
Solo responde con tu método de pago preferido 🚀`;
  }

  /**
   * ⌨️ PLANTILLA PARA PRODUCTOS DE VALOR MEDIO
   */
  private static generateMediumValueProductTemplate(product: any, deliveryOptions: string[]): string {
    const deliveryOptionsText = deliveryOptions.map(option => {
      switch (option) {
        case 'ENTREGA_LOCAL': return '🏪 Recojo en tienda';
        case 'ENVIO_NORMAL': return '🚚 Envío normal';
        case 'CONTRAENTREGA': return '💰 Pago contra entrega';
        default: return option;
      }
    }).join(' • ');

    return `¡Perfecto! 🎯 Este producto combina calidad y precio:

⌨️ *${product.name}*
💰 *Precio:* ${Utils.formatPrice(product.price)} COP

🔧 *Especificaciones:*
${product.description ? `• ${product.description}` : '• Producto confiable y duradero'}

🚚 *Opciones de entrega:*
• ${deliveryOptionsText}

💳 *Métodos de pago disponibles:*
• PayPal 🌍
• MercadoPago 💳
• Nequi al 3136174267 📱
• Daviplata al 3136174267 💰

¿Te envío más fotos o genero el link de pago dinámico? 📸`;
  }

  /**
   * 🔧 PLANTILLA PARA SERVICIOS
   */
  private static generateServiceTemplate(product: any): string {
    return `¡Claro! 👨‍💼 Ofrecemos este servicio profesional:

🔧 *${product.name}*

💼 *Servicio incluye:*
${product.description ? `• ${product.description}` : '• Atención especializada'}

⏰ *Precio:* ${Utils.formatPrice(product.price)} COP
📅 *Disponibilidad:* Consultar agenda
⭐ *Garantía:* Trabajo garantizado

💳 *Métodos de pago disponibles:*
• PayPal 🌍
• MercadoPago 💳
• Nequi al 3136174267 📱
• Daviplata al 3136174267 💰
• Transferencia bancaria 💼

¿Te gustaría agendar una consulta gratuita para evaluar tus necesidades o generar el link de pago? 🤝

Responde "Sí" para coordinar una cita, "Más info" para detalles completos, o "Pagar" para generar el link.`;
  }

  /**
   * 📦 PLANTILLA GENÉRICA DE FALLBACK
   */
  private static generateGenericProductTemplate(product: any): string {
    return `¡Encontré este producto! 📦

📦 *${product.name}*
💰 *Precio:* ${Utils.formatPrice(product.price)} COP

${product.description ? `📝 ${product.description}` : ''}

¿Te interesa este producto? Puedo darte más información o generar el link de compra. 🤔`;
  }

  /**
   * 🎨 GENERAR PLANTILLAS COMPLETAS PARA UN CLIENTE
   */
  static async generateClientTemplates(userId: string): Promise<{
    templates: Record<string, string>;
    productClassifications: Record<string, ProductClassification>;
    summary: any;
  }> {
    try {
      const { db } = await import('./db');

      // Obtener todos los productos del cliente
      const products = await db.product.findMany({
        where: { userId, status: 'AVAILABLE' },
        take: 50 // Limitar para rendimiento
      });

      const templates: Record<string, string> = {};
      const productClassifications: Record<string, ProductClassification> = {};

      // Generar plantilla para cada producto
      for (const product of products) {
        const classification = ProductClassifier.classifyProduct(product);
        const template = this.generateProductFoundTemplate(product, classification);

        templates[product.id] = template;
        productClassifications[product.id] = classification;
      }

      // Análisis del portafolio
      const portfolioAnalysis = await ProductClassifier.analyzeClientPortfolio(userId);

      // Generar plantillas adicionales basadas en el análisis
      templates['welcome'] = this.generateWelcomeTemplate(portfolioAnalysis.summary);
      templates['payment_methods'] = this.generatePaymentMethodsTemplate(portfolioAnalysis.summary);
      templates['shipping_info'] = this.generateShippingTemplate(portfolioAnalysis.summary);

      return {
        templates,
        productClassifications,
        summary: portfolioAnalysis
      };
    } catch (error) {
      console.error('[TemplateGenerator] Error generando plantillas:', error);
      throw error;
    }
  }

  /**
   * 👋 PLANTILLA DE BIENVENIDA PERSONALIZADA
   */
  private static generateWelcomeTemplate(summary: any): string {
    let focus = '';

    if (summary.digitalPercentage > 50) {
      focus = '📚 cursos, megapacks y productos digitales';
    } else if (summary.servicePercentage > 50) {
      focus = '🔧 servicios profesionales especializados';
    } else if (summary.avgPrice > 300000) {
      focus = '💎 productos premium de alta calidad';
    } else {
      focus = '🎯 productos de calidad al mejor precio';
    }

    return `¡Hola! 👋 Bienvenido a nuestra tienda especializada en ${focus}.

¿En qué puedo ayudarte hoy? 🤖

Tenemos ${summary.totalProducts} productos disponibles con precios desde ${Utils.formatPrice(Math.round(summary.avgPrice * 0.5))} COP.

Pregúntame por cualquier producto o servicio que necesites. 💫`;
  }

  /**
   * 💳 PLANTILLA DE MÉTODOS DE PAGO
   */
  private static generatePaymentMethodsTemplate(summary: any): string {
    const methods = [
      '💳 MercadoPago',
      '🌍 PayPal',
      '📱 Nequi al 3136174267',
      '💰 Daviplata al 3136174267'
    ];

    if (summary.avgPrice < 100000) {
      methods.push('💵 Efectivo contra entrega');
    }

    if (summary.servicePercentage > 30) {
      methods.push('💼 Transferencia bancaria');
    }

    return `💰 *Formas de pago disponibles:*

${methods.map(method => `• ${method}`).join('\n')}

⚡ *Pago seguro y confiable*
🚀 *Procesamiento inmediato*
🔗 *Links dinámicos generados automáticamente*

¿Con cuál prefieres pagar? 🤔`;
  }

  /**
   * 🚚 PLANTILLA DE ENVÍOS
   */
  private static generateShippingTemplate(summary: any): string {
    if (summary.digitalPercentage > 70) {
      return `📧 *Entrega inmediata para productos digitales*

🎯 *Acceso instantáneo* después del pago
📱 *Disponible* en todos tus dispositivos
🔓 *Sin restricciones* de horario

¡Recibirás tu acceso en minutos! ⚡`;
    }

    if (summary.avgPrice > 300000) {
      return `🚚 *Entrega especializada*

🏪 *Recojo en tienda* disponible
🚛 *Envío seguro* con seguimiento GPS
📞 *Coordinación previa* de entrega
🛡️ *Seguro incluido* en productos de alto valor

¿Prefieres recogerlo o te lo enviamos? 🤝`;
    }

    return `🚚 *Envíos a toda Colombia*

📦 *Empaquetado seguro*
⚡ *Entrega 2-3 días hábiles*
💰 *Pago contra entrega* disponible
📊 *Seguimiento* en tiempo real

¿A qué ciudad necesitas el envío? 📍`;
  }

  /**
   * 🎯 OBTENER PLANTILLA PARA UN PRODUCTO ESPECÍFICO
   */
  static async getProductTemplate(productId: string, userId: string): Promise<string> {
    try {
      const { db } = await import('./db');

      const product = await db.product.findFirst({
        where: { id: productId, userId }
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const classification = ProductClassifier.classifyProduct(product);
      return this.generateProductFoundTemplate(product, classification);
    } catch (error) {
      console.error('[TemplateGenerator] Error obteniendo plantilla:', error);
      return 'Producto encontrado. ¿Te gustaría más información o generar el link de compra? 🤔';
    }
  }
}