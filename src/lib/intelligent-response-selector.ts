/**
 * 🧠 INTELLIGENT RESPONSE SELECTOR
 * 
 * Decide qué tipo de respuesta generar según el contexto:
 * - Múltiples opciones (3) para búsquedas generales
 * - Producto específico para búsquedas concretas
 * - Cierre de venta cuando hay intención de compra
 * - Clarificación cuando no entiende
 * 
 * Características:
 * - Valida productos contra BD
 * - Usa AIDA para respuestas
 * - Mantiene contexto persistente
 * - Compatible con SaaS
 */

import { Product } from '@prisma/client';
import { ProductValidator } from './product-validator';
import { AidaResponseGenerator } from './aida-response-generator';
import { PersistentMemoryManager } from './persistent-memory-manager';
import { GroqDynamicResponseSystem } from './groq-dynamic-response-system';

interface ResponseSelection {
  responseType: 'multi_option' | 'single_product' | 'closing' | 'clarification' | 'no_products';
  text: string;
  products: Product[];
  confidence: number;
}

export class IntelligentResponseSelector {
  /**
   * Seleccionar y generar respuesta inteligente
   */
  static async selectResponse(params: {
    message: string;
    chatId: string;
    userId: string;
    intent: string;
    currentProduct?: any;
  }): Promise<ResponseSelection> {
    const { message, chatId, userId, intent, currentProduct } = params;

    console.log(`🧠 [SELECTOR] Analizando mensaje: "${message.substring(0, 50)}..."`);
    console.log(`   Intent: ${intent}`);
    console.log(`   Producto actual: ${currentProduct?.name || 'Ninguno'}`);

    // Obtener memoria persistente
    const memory = await PersistentMemoryManager.getMemory(chatId, userId);

    // PRIORIDAD MÁXIMA: Detectar pago por keywords DIRECTAMENTE (no depender del intent)
    const lowerMessage = message.toLowerCase();
    const paymentKeywords = [
      'pago', 'pagar', 'comprar', 'compro',
      'método', 'metodo', 'métodos', 'metodos',
      'forma de pago', 'formas de pago',
      'cómo pago', 'como pago',
      'mercadopago', 'paypal', 'nequi', 'daviplata',
      'transferencia', 'efectivo', 'tarjeta'
    ];
    
    if (paymentKeywords.some(kw => lowerMessage.includes(kw))) {
      console.log(`💳 [SELECTOR] Detectada pregunta sobre PAGO (keyword match)`);
      return await this.handlePaymentIntent(memory, userId);
    }

    // CASO 1: Intención de pago (cierre de venta) - Fallback si no detectó arriba
    if (this.isPaymentIntent(intent, message)) {
      console.log(`💳 [SELECTOR] Detectada pregunta sobre PAGO (intent match)`);
      return await this.handlePaymentIntent(memory, userId);
    }

    // CASO 2: Ya hay producto seleccionado y pregunta sobre él
    if (currentProduct && this.isProductQuestion(message)) {
      return await this.handleProductQuestion(currentProduct, userId);
    }

    // CASO 3: Búsqueda de producto específico
    if (this.isSpecificProductSearch(message)) {
      return await this.handleSpecificSearch(message, userId);
    }

    // CASO 4: Búsqueda por categoría (mostrar 3 opciones)
    if (this.isCategorySearch(message, intent)) {
      return await this.handleCategorySearch(message, userId);
    }

    // CASO 5: Búsqueda general
    return await this.handleGeneralSearch(message, userId);
  }

  /**
   * Manejar intención de pago
   */
  private static async handlePaymentIntent(
    memory: any,
    userId: string
  ): Promise<ResponseSelection> {
    // Si no hay producto en contexto, mostrar métodos de pago generales
    if (!memory.currentProduct) {
      return {
        responseType: 'closing',
        text: `💳 **Métodos de Pago Disponibles**

Aceptamos las siguientes formas de pago:

1. 💳 **MercadoPago**
   → Paga con tarjeta en cuotas sin interés
   → Seguro y confiable

2. 💵 **Nequi / Daviplata**
   → Transferencia instantánea
   → Sin comisiones

3. 🏦 **Transferencia Bancaria**
   → Bancolombia, Davivienda, etc.
   → Confirmación rápida

4. 💰 **PayPal**
   → Pago internacional
   → Protección al comprador

5. 💵 **Efectivo**
   → Pago contra entrega
   → Disponible en algunas zonas

¿Cuál método prefieres? 😊`,
        products: [],
        confidence: 0.95
      };
    }

    // Si hay producto en contexto, buscar en BD y mostrar cierre de venta
    const product = await ProductValidator.findSpecific(memory.currentProduct.name, userId);

    if (!product) {
      // Si el producto no existe, mostrar métodos generales
      return {
        responseType: 'closing',
        text: `💳 **Métodos de Pago Disponibles**

Aceptamos:
• MercadoPago (cuotas sin interés)
• Nequi / Daviplata
• Transferencia bancaria
• PayPal
• Efectivo (contra entrega)

¿Cuál prefieres? 😊`,
        products: [],
        confidence: 0.85
      };
    }

    const aidaResponse = AidaResponseGenerator.generateClosing(product);

    return {
      responseType: 'closing',
      text: aidaResponse.text,
      products: [product],
      confidence: 0.95
    };
  }

  /**
   * Manejar pregunta sobre producto actual
   */
  private static async handleProductQuestion(
    currentProduct: any,
    userId: string
  ): Promise<ResponseSelection> {
    // Validar que el producto existe
    const product = await ProductValidator.findSpecific(currentProduct.name, userId);

    if (!product) {
      return {
        responseType: 'no_products',
        text: 'Lo siento, ese producto ya no está disponible. ¿Te gustaría ver otras opciones? 😊',
        products: [],
        confidence: 0.7
      };
    }

    // Usar generación dinámica con Groq
    console.log(`🎨 [SELECTOR] Generando descripción dinámica para pregunta sobre ${product.name}`);
    
    try {
      const dynamicResponse = await GroqDynamicResponseSystem.generateDynamic({
        product
      });

      console.log(`✅ [SELECTOR] Descripción dinámica generada (${dynamicResponse.technique})`);

      return {
        responseType: 'single_product',
        text: dynamicResponse.text,
        products: [product],
        confidence: 0.95
      };
    } catch (error) {
      console.log(`⚠️ [SELECTOR] Fallback a AIDA estático`);
      const aidaResponse = AidaResponseGenerator.generateSingleProduct(product);

      return {
        responseType: 'single_product',
        text: aidaResponse.text,
        products: [product],
        confidence: 0.9
      };
    }
  }

  /**
   * Manejar búsqueda específica de producto
   */
  private static async handleSpecificSearch(
    message: string,
    userId: string
  ): Promise<ResponseSelection> {
    console.log(`🔍 [SELECTOR] Búsqueda específica`);

    const product = await ProductValidator.findSpecific(message, userId);

    if (!product) {
      // Intentar búsqueda general como fallback
      const products = await ProductValidator.search(message, userId, 3);
      
      if (products.length > 0) {
        const aidaResponse = AidaResponseGenerator.generateMultiOption(products, message);
        return {
          responseType: 'multi_option',
          text: aidaResponse.text,
          products,
          confidence: 0.75
        };
      }

      console.log(`⚠️ [SELECTOR] Producto específico no encontrado - Activando fallback a IA`);
      return {
        responseType: 'no_products',
        text: `Lo siento, no encontré "${message}". ¿Te gustaría ver otras opciones disponibles? 🔍`,
        products: [],
        confidence: 0.3  // Baja confianza para activar IA externa
      };
    }

    // Usar generación dinámica con Groq
    console.log(`🎨 [SELECTOR] Generando descripción dinámica para ${product.name}`);
    
    try {
      const dynamicResponse = await GroqDynamicResponseSystem.generateDynamic({
        product
      });

      console.log(`✅ [SELECTOR] Descripción dinámica generada (${dynamicResponse.technique})`);

      return {
        responseType: 'single_product',
        text: dynamicResponse.text,
        products: [product],
        confidence: 0.95
      };
    } catch (error) {
      console.log(`⚠️ [SELECTOR] Fallback a AIDA estático`);
      const aidaResponse = AidaResponseGenerator.generateSingleProduct(product);

      return {
        responseType: 'single_product',
        text: aidaResponse.text,
        products: [product],
        confidence: 0.9
      };
    }
  }

  /**
   * Manejar búsqueda por categoría (Top 3)
   */
  private static async handleCategorySearch(
    message: string,
    userId: string
  ): Promise<ResponseSelection> {
    console.log(`🔍 [SELECTOR] Búsqueda por categoría`);

    const category = this.extractCategory(message);
    const products = await ProductValidator.findByCategory(category, userId, 3);

    if (products.length === 0) {
      console.log(`⚠️ [SELECTOR] Categoría sin productos - Activando fallback a IA`);
      return {
        responseType: 'no_products',
        text: `Lo siento, no tengo productos en la categoría "${category}" en este momento. ¿Te gustaría ver otras opciones? 😊`,
        products: [],
        confidence: 0.3  // Baja confianza para activar IA externa
      };
    }

    const aidaResponse = AidaResponseGenerator.generateMultiOption(products, message);

    return {
      responseType: 'multi_option',
      text: aidaResponse.text,
      products,
      confidence: 0.85
    };
  }

  /**
   * Manejar búsqueda general
   */
  private static async handleGeneralSearch(
    message: string,
    userId: string
  ): Promise<ResponseSelection> {
    console.log(`🔍 [SELECTOR] Búsqueda general`);

    const products = await ProductValidator.search(message, userId, 3);

    if (products.length === 0) {
      console.log(`⚠️ [SELECTOR] No se encontraron productos - Activando fallback a IA`);
      return {
        responseType: 'clarification',
        text: '¿Podrías ser más específico sobre lo que buscas? 😊',
        products: [],
        confidence: 0.3  // Baja confianza para activar IA externa
      };
    }

    const aidaResponse = AidaResponseGenerator.generateMultiOption(products, message);

    return {
      responseType: 'multi_option',
      text: aidaResponse.text,
      products,
      confidence: 0.75
    };
  }

  /**
   * Detectar si es intención de pago
   */
  private static isPaymentIntent(intent: string, message: string): boolean {
    const paymentIntents = [
      'request_payment_method',
      'confirm_purchase',
      'purchase_intent',
      'payment'
    ];

    if (paymentIntents.includes(intent)) return true;

    const lowerMessage = message.toLowerCase();
    
    const paymentKeywords = [
      'pagar', 'pago', 'comprar', 'compro',
      'método', 'metodo', 'métodos', 'metodos',
      'método de pago', 'metodo de pago',
      'métodos de pago', 'metodos de pago',
      'forma de pago', 'formas de pago',
      'cómo pago', 'como pago',
      'cómo puedo pagar', 'como puedo pagar',
      'lo quiero', 'lo compro', 'quiero comprar',
      'mercadopago', 'mercado pago', 'paypal',
      'nequi', 'daviplata', 'transferencia',
      'efectivo', 'tarjeta'
    ];

    return paymentKeywords.some(kw => lowerMessage.includes(kw));
  }

  /**
   * Detectar si es pregunta sobre producto actual
   */
  private static isProductQuestion(message: string): boolean {
    const questionKeywords = [
      'precio', 'costo', 'características', 'especificaciones',
      'foto', 'imagen', 'disponible', 'stock', 'garantía',
      'envío', 'entrega', 'más información', 'detalles'
    ];

    return questionKeywords.some(kw => message.toLowerCase().includes(kw));
  }

  /**
   * Detectar si es búsqueda específica
   */
  private static isSpecificProductSearch(message: string): boolean {
    // Si menciona marca + modelo, es específico
    const brands = ['lenovo', 'hp', 'dell', 'asus', 'acer', 'apple', 'samsung', 'lg'];
    const hasBrand = brands.some(brand => message.toLowerCase().includes(brand));

    // Si tiene números (modelo), es específico
    const hasModel = /\d+/.test(message);

    return hasBrand || hasModel || message.split(' ').length >= 3;
  }

  /**
   * Detectar si es búsqueda por categoría
   */
  private static isCategorySearch(message: string, intent: string): boolean {
    const categoryIntents = [
      'browse_products',
      'search_product',
      'browse_category'
    ];

    if (categoryIntents.includes(intent)) return true;

    const categoryKeywords = [
      'laptops', 'portátiles', 'computadores', 'motos',
      'cursos', 'megapacks', 'smartwatch', 'relojes'
    ];

    return categoryKeywords.some(kw => message.toLowerCase().includes(kw));
  }

  /**
   * Extraer categoría del mensaje
   */
  private static extractCategory(message: string): string {
    const lowerMessage = message.toLowerCase();

    const categories: Record<string, string> = {
      'laptop': 'laptop',
      'portátil': 'laptop',
      'computador': 'laptop',
      'pc': 'laptop',
      'moto': 'moto',
      'motocicleta': 'moto',
      'curso': 'curso',
      'megapack': 'megapack',
      'smartwatch': 'smartwatch',
      'reloj': 'smartwatch'
    };

    for (const [keyword, category] of Object.entries(categories)) {
      if (lowerMessage.includes(keyword)) {
        return category;
      }
    }

    return lowerMessage.split(' ')[0];
  }
}
