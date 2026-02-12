/**
 * Template Renderer
 * Renderiza plantillas de conversación con variables dinámicas
 */

import { type ConversationTemplate, templateVariables } from './conversation-templates';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RenderContext {
  userId: string;
  customerPhone?: string;
  productId?: string;
  conversationId?: string;
  customVariables?: Record<string, string>;
}

export class TemplateRenderer {
  /**
   * Renderiza una plantilla con variables dinámicas
   */
  static async render(
    template: ConversationTemplate,
    context: RenderContext
  ): Promise<string> {
    let rendered = template.response;

    // Obtener datos del negocio
    const businessData = await this.getBusinessData(context.userId);
    
    // Obtener datos del producto si existe
    let productData: any = null;
    if (context.productId) {
      productData = await this.getProductData(context.productId);
    }

    // Reemplazar variables del negocio
    rendered = this.replaceBusinessVariables(rendered, businessData);

    // Reemplazar variables del producto
    if (productData) {
      rendered = this.replaceProductVariables(rendered, productData);
    }

    // Reemplazar variables personalizadas
    if (context.customVariables) {
      rendered = this.replaceCustomVariables(rendered, context.customVariables);
    }

    // Limpiar variables no reemplazadas
    rendered = this.cleanUnreplacedVariables(rendered);

    return rendered;
  }

  /**
   * Renderiza múltiples plantillas (para follow-ups)
   */
  static async renderMultiple(
    templates: ConversationTemplate[],
    context: RenderContext
  ): Promise<string[]> {
    return Promise.all(
      templates.map(template => this.render(template, context))
    );
  }

  /**
   * Obtiene datos del negocio desde la base de datos
   */
  private static async getBusinessData(userId: string): Promise<Record<string, string>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { settings: true }
      });

      if (!user) {
        return this.getDefaultBusinessData();
      }

      const settings = user.settings?.[0];

      return {
        BUSINESS_NAME: settings?.businessName || user.businessName || 'Tecnovariedades D&S',
        BUSINESS_HOURS: settings?.businessHours || 'Lunes a Viernes 9am-6pm, Sábados 9am-2pm',
        BUSINESS_ADDRESS: settings?.businessAddress || 'Centro Comercial El Diamante 2, Local 158, Cali',
        CONTACT_INFO: this.formatContactInfo(user, settings),
        BUSINESS_DESCRIPTION: settings?.businessDescription || 'Tecnología y productos digitales de calidad',
        PAYMENT_METHODS: this.formatPaymentMethods(settings),
        SHIPPING_INFO: this.formatShippingInfo(settings),
        DELIVERY_TIMES: settings?.deliveryTimes || '2-4 días hábiles en ciudades principales',
        RETURN_POLICY: settings?.returnPolicy || '7 días de garantía de satisfacción',
        WARRANTY_INFO: settings?.warrantyInfo || 'Garantía según fabricante'
      };
    } catch (error) {
      console.error('[TemplateRenderer] Error obteniendo datos del negocio:', error);
      return this.getDefaultBusinessData();
    }
  }

  /**
   * Obtiene datos del producto
   */
  private static async getProductData(productId: string): Promise<Record<string, string>> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) return {};

      return {
        PRODUCT_NAME: product.name,
        PRODUCT_PRICE: this.formatPrice(product.price, product.currency),
        PRODUCT_DESCRIPTION: product.description || '',
        PRODUCT_CATEGORY: product.category || '',
        PRODUCT_STOCK: product.stock ? `${product.stock} unidades` : 'Disponible',
        PRODUCT_SPECS: product.configurations || 'Ver descripción'
      };
    } catch (error) {
      console.error('[TemplateRenderer] Error obteniendo datos del producto:', error);
      return {};
    }
  }

  /**
   * Reemplaza variables del negocio en el texto
   */
  private static replaceBusinessVariables(
    text: string,
    businessData: Record<string, string>
  ): string {
    let result = text;
    
    for (const [key, value] of Object.entries(businessData)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, value);
    }

    return result;
  }

  /**
   * Reemplaza variables del producto en el texto
   */
  private static replaceProductVariables(
    text: string,
    productData: Record<string, string>
  ): string {
    let result = text;
    
    for (const [key, value] of Object.entries(productData)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, value);
    }

    return result;
  }

  /**
   * Reemplaza variables personalizadas
   */
  private static replaceCustomVariables(
    text: string,
    customVars: Record<string, string>
  ): string {
    let result = text;
    
    for (const [key, value] of Object.entries(customVars)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, value);
    }

    return result;
  }

  /**
   * Limpia variables que no fueron reemplazadas
   */
  private static cleanUnreplacedVariables(text: string): string {
    // Reemplazar variables no encontradas con texto genérico
    return text.replace(/\{([A-Z_]+)\}/g, (match, varName) => {
      console.warn(`[TemplateRenderer] Variable no reemplazada: ${varName}`);
      return '[información no disponible]';
    });
  }

  /**
   * Formatea información de contacto
   */
  private static formatContactInfo(user: any, settings: any): string {
    const parts: string[] = [];
    
    if (user.phone) parts.push(`📱 WhatsApp: ${user.phone}`);
    if (user.email) parts.push(`📧 Email: ${user.email}`);
    if (settings?.instagram) parts.push(`📸 Instagram: @${settings.instagram}`);
    if (settings?.facebook) parts.push(`👥 Facebook: ${settings.facebook}`);

    return parts.length > 0 ? parts.join('\n') : 'Contáctanos por este medio';
  }

  /**
   * Formatea métodos de pago
   */
  private static formatPaymentMethods(settings: any): string {
    const methods: string[] = [];
    
    if (settings?.acceptBankTransfer !== false) {
      methods.push('💳 Transferencia bancaria');
    }
    if (settings?.acceptCreditCard !== false) {
      methods.push('💳 Tarjeta de crédito/débito');
    }
    if (settings?.acceptNequi !== false) {
      methods.push('📱 Nequi');
    }
    if (settings?.acceptDaviplata !== false) {
      methods.push('📱 Daviplata');
    }
    if (settings?.acceptCashOnDelivery !== false) {
      methods.push('💵 Contra entrega');
    }

    return methods.length > 0 
      ? methods.join('\n') 
      : '💳 Transferencia bancaria\n💳 Tarjeta de crédito\n📱 Nequi/Daviplata';
  }

  /**
   * Formatea información de envío
   */
  private static formatShippingInfo(settings: any): string {
    return settings?.shippingInfo || 
      '📦 Envío a todo Colombia\n🚚 Tiempo: 2-4 días hábiles\n💰 Costo según ciudad';
  }

  /**
   * Formatea precio
   */
  private static formatPrice(price: number, currency: string = 'COP'): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency
    }).format(price);
  }

  /**
   * Datos por defecto del negocio
   */
  private static getDefaultBusinessData(): Record<string, string> {
    return {
      BUSINESS_NAME: 'Tecnovariedades D&S',
      BUSINESS_HOURS: 'Lunes a Viernes 9am-6pm, Sábados 9am-2pm',
      BUSINESS_ADDRESS: 'Centro Comercial El Diamante 2, Local 158, Cali',
      CONTACT_INFO: '📱 WhatsApp: +57 304 274 8687',
      BUSINESS_DESCRIPTION: 'Tecnología y productos digitales de calidad',
      PAYMENT_METHODS: '💳 Transferencia bancaria\n💳 Tarjeta de crédito\n📱 Nequi/Daviplata',
      SHIPPING_INFO: '📦 Envío a todo Colombia\n🚚 2-4 días hábiles',
      DELIVERY_TIMES: '2-4 días hábiles en ciudades principales',
      RETURN_POLICY: '7 días de garantía de satisfacción',
      WARRANTY_INFO: 'Garantía según fabricante',
      PRODUCT_CATEGORIES: '💻 Laptops\n📱 Celulares\n🎓 Cursos Digitales\n📦 Megapacks',
      CURRENT_PROMOTIONS: 'Consulta nuestras promociones vigentes',
      INSTALLMENT_OPTIONS: 'Consulta opciones de financiación disponibles'
    };
  }

  /**
   * Genera opciones de follow-up formateadas
   */
  static formatFollowUpOptions(followUps: string[]): string {
    if (!followUps || followUps.length === 0) return '';

    return '\n\n' + followUps.map((option, index) => 
      `${index + 1}️⃣ ${option}`
    ).join('\n');
  }
}
