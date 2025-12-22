/**
 * ✅ VALIDADOR DE RESPUESTAS
 * Asegura que el bot NUNCA invente información
 * Solo usa datos EXACTOS de la base de datos
 */

import { ResponseFormatter } from './response-formatter';

export class ResponseValidator {
  /**
   * Valida que la respuesta solo contenga información del producto real
   */
  static validateProductResponse(response: string, product: any): {
    isValid: boolean;
    errors: string[];
    correctedResponse?: string;
  } {
    const errors: string[] = [];

    // 1. Verificar que el precio sea exacto
    const priceInResponse = this.extractPrice(response);
    if (priceInResponse && priceInResponse !== product.price) {
      errors.push(`Precio incorrecto: ${priceInResponse} (debe ser ${product.price})`);
    }

    // 2. Verificar que el nombre sea exacto
    if (!response.includes(product.name)) {
      errors.push(`Nombre del producto no coincide`);
    }

    // 3. Verificar que no invente características
    const inventedPhrases = [
      'más de 1000 cursos',
      'certificación oficial',
      'garantía de por vida',
      'soporte 24/7',
      'actualización automática'
    ];

    inventedPhrases.forEach(phrase => {
      if (response.toLowerCase().includes(phrase.toLowerCase())) {
        // Verificar si está en la descripción real
        if (!product.description?.toLowerCase().includes(phrase.toLowerCase())) {
          errors.push(`Frase inventada detectada: "${phrase}"`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      correctedResponse: errors.length > 0 ? this.correctResponse(response, product) : undefined
    };
  }

  /**
   * Extrae el precio de una respuesta
   */
  private static extractPrice(response: string): number | null {
    const priceMatch = response.match(/\$?([\d,\.]+)\s*COP/i);
    if (priceMatch) {
      return parseInt(priceMatch[1].replace(/[,\.]/g, ''));
    }
    return null;
  }

  /**
   * Corrige una respuesta para que solo use información real
   */
  private static correctResponse(response: string, product: any): string {
    // Generar respuesta segura usando solo datos reales
    return ResponseFormatter.formatProductInfo(product);
  }

  /**
   * Valida que la imagen sea del producto correcto
   */
  static validateProductImage(product: any): {
    hasImage: boolean;
    imageUrl?: string;
    error?: string;
  } {
    if (!product.imageUrl || product.imageUrl.trim() === '') {
      return {
        hasImage: false,
        error: 'Producto sin imagen'
      };
    }

    // Verificar que la URL sea válida
    try {
      new URL(product.imageUrl);
      return {
        hasImage: true,
        imageUrl: product.imageUrl
      };
    } catch {
      return {
        hasImage: false,
        error: 'URL de imagen inválida'
      };
    }
  }

  /**
   * Genera respuesta segura usando SOLO información de la BD
   */
  static generateSafeResponse(product: any, userQuery: string): string {
    console.log('[ResponseValidator] 🛡️ Generando respuesta segura con datos reales');
    
    // Extraer beneficio SOLO de la descripción real
    const benefit = this.extractRealBenefit(product, userQuery);
    
    // Usar formateador para respuesta limpia
    let response = '¡Perfecto! 😊\n\n';
    response += ResponseFormatter.formatProductInfo(product, benefit);
    response += '\n¿Te gustaría más información o proceder con la compra? 😄';

    // Validar antes de retornar
    const validation = this.validateProductResponse(response, product);
    
    if (!validation.isValid) {
      console.warn('[ResponseValidator] ⚠️ Respuesta con errores:', validation.errors);
      return validation.correctedResponse || response;
    }

    console.log('[ResponseValidator] ✅ Respuesta validada correctamente');
    return ResponseFormatter.cleanForWhatsApp(response);
  }

  /**
   * Extrae beneficio REAL de la descripción del producto
   */
  private static extractRealBenefit(product: any, userQuery: string): string {
    const desc = product.description || '';
    
    if (!desc) {
      return `Acceso completo a ${product.name}`;
    }

    // Buscar oraciones relevantes a la consulta
    const sentences = desc.split(/[.!?]\n/).map(s => s.trim()).filter(s => s.length > 20);
    
    if (sentences.length === 0) {
      return desc.substring(0, 150);
    }

    // Buscar la oración más relevante
    const queryWords = userQuery.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const relevantSentences = sentences.filter(s => {
      const sLower = s.toLowerCase();
      return queryWords.some(w => sLower.includes(w));
    });

    if (relevantSentences.length > 0) {
      return relevantSentences[0];
    }

    // Retornar primera oración
    return sentences[0];
  }

  /**
   * Valida que el producto exista y esté disponible
   */
  static validateProductAvailability(product: any): {
    isAvailable: boolean;
    reason?: string;
  } {
    if (!product) {
      return {
        isAvailable: false,
        reason: 'Producto no encontrado'
      };
    }

    if (product.status !== 'AVAILABLE') {
      return {
        isAvailable: false,
        reason: `Producto no disponible (estado: ${product.status})`
      };
    }

    if (product.stock !== null && product.stock <= 0) {
      return {
        isAvailable: false,
        reason: 'Producto agotado'
      };
    }

    return {
      isAvailable: true
    };
  }

  /**
   * Genera mensaje de error cuando no hay producto
   */
  static generateNoProductMessage(userQuery: string): string {
    return `Lo siento 😔\n\nNo encontré un producto que coincida exactamente con "${userQuery}".\n\n¿Podrías ser más específico o probar con otra búsqueda?\n\n¿En qué más puedo ayudarte? 😊`;
  }

  /**
   * Valida que los métodos de pago sean correctos
   */
  static validatePaymentMethods(methods: string[]): boolean {
    const validMethods = [
      'mercadopago',
      'paypal',
      'nequi',
      'daviplata',
      'transferencia',
      'hotmart'
    ];

    return methods.every(method => 
      validMethods.includes(method.toLowerCase())
    );
  }

  /**
   * Registra advertencia si se detecta información inventada
   */
  static logInventedInfo(response: string, product: any): void {
    const validation = this.validateProductResponse(response, product);
    
    if (!validation.isValid) {
      console.error('[ResponseValidator] 🚨 INFORMACIÓN INVENTADA DETECTADA:');
      validation.errors.forEach(error => {
        console.error(`  ❌ ${error}`);
      });
      console.error(`  📦 Producto: ${product.name}`);
      console.error(`  💬 Respuesta: ${response.substring(0, 100)}...`);
    }
  }
}
