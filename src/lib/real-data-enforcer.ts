/**
 * SISTEMA DE VERIFICACIÓN DE DATOS REALES
 * Garantiza que SIEMPRE se usen datos de la base de datos
 * NUNCA permite precios inventados o información falsa
 */

import { db } from './db';

interface ProductData {
  id: string;
  name: string;
  price: number;
  description: string | null;
  category: string;
  images: string[];
  stock: number | null;
  deliveryLink: string | null;
}

export class RealDataEnforcer {
  /**
   * Obtiene datos REALES del producto desde la BD
   * NUNCA devuelve datos inventados
   */
  static async getProductData(productId: string): Promise<ProductData | null> {
    try {
      const product = await db.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          price: true,
          description: true,
          category: true,
          images: true,
          stock: true
        }
      });

      if (!product) {
        console.log(`[RealDataEnforcer] ❌ Producto ${productId} no encontrado`);
        return null;
      }

      // Parsear imágenes
      let images: string[] = [];
      try {
        if (product.images) {
          images = typeof product.images === 'string' 
            ? JSON.parse(product.images) 
            : product.images;
        }
      } catch (e) {
        console.error('[RealDataEnforcer] Error parseando imágenes:', e);
      }

      // Convertir rutas relativas a URLs absolutas
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      const data: ProductData = {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        images: images
          .filter(img => {
            if (!img || img.trim() === '') return false;
            const trimmed = img.trim();
            // Aceptar URLs completas O rutas relativas
            return trimmed.startsWith('http') || trimmed.startsWith('/');
          })
          .map(img => {
            const trimmed = img.trim();
            // Si es ruta relativa, convertir a URL absoluta
            if (trimmed.startsWith('/') && !trimmed.startsWith('http')) {
              return `${baseUrl}${trimmed}`;
            }
            return trimmed;
          }),
        stock: product.stock,
        deliveryLink: null // Campo no existe en schema actual
      };

      console.log(`[RealDataEnforcer] ✅ Datos reales obtenidos:`);
      console.log(`   Producto: ${data.name}`);
      console.log(`   Precio REAL: $${data.price.toLocaleString('es-CO')} COP`);
      console.log(`   Imágenes: ${data.images.length}`);

      return data;
    } catch (error) {
      console.error('[RealDataEnforcer] Error obteniendo datos:', error);
      return null;
    }
  }

  /**
   * Busca producto por nombre y devuelve datos REALES
   */
  static async searchProduct(query: string): Promise<ProductData | null> {
    try {
      console.log(`[RealDataEnforcer] 🔍 Buscando: "${query}"`);

      const product = await db.product.findFirst({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { has: query.toLowerCase() } }
          ]
        },
        select: {
          id: true,
          name: true,
          price: true,
          description: true,
          category: true,
          images: true,
          stock: true
        }
      });

      if (!product) {
        console.log(`[RealDataEnforcer] ❌ No se encontró producto para: "${query}"`);
        return null;
      }

      return await this.getProductData(product.id);
    } catch (error) {
      console.error('[RealDataEnforcer] Error buscando producto:', error);
      return null;
    }
  }

  /**
   * Verifica que el precio en el mensaje coincida con la BD
   * Si no coincide, devuelve el precio REAL
   */
  static async verifyPrice(productId: string, claimedPrice: number): Promise<{
    isCorrect: boolean;
    realPrice: number;
    message?: string;
  }> {
    const product = await this.getProductData(productId);
    
    if (!product) {
      return {
        isCorrect: false,
        realPrice: 0,
        message: 'Producto no encontrado'
      };
    }

    const isCorrect = product.price === claimedPrice;

    if (!isCorrect) {
      console.log(`[RealDataEnforcer] ⚠️ PRECIO INCORRECTO DETECTADO`);
      console.log(`   Precio reclamado: $${claimedPrice.toLocaleString('es-CO')}`);
      console.log(`   Precio REAL: $${product.price.toLocaleString('es-CO')}`);
    }

    return {
      isCorrect,
      realPrice: product.price,
      message: isCorrect 
        ? undefined 
        : `Precio incorrecto. El precio real es $${product.price.toLocaleString('es-CO')} COP`
    };
  }

  /**
   * Formatea el precio correctamente en pesos colombianos
   */
  static formatPrice(price: number): string {
    return `$${price.toLocaleString('es-CO')} COP`;
  }

  /**
   * Genera mensaje de producto con datos REALES garantizados
   */
  static async generateProductMessage(productId: string): Promise<string | null> {
    const product = await this.getProductData(productId);
    
    if (!product) {
      return null;
    }

    const esDigital = product.category === 'DIGITAL' || product.category === 'MEGAPACK';
    const emoji = esDigital ? '📚' : '💻';

    let message = `${emoji} *${product.name}*\n\n`;
    message += `💰 *Precio:* ${this.formatPrice(product.price)}\n\n`;

    if (product.description) {
      message += `📝 *Descripción:*\n${product.description}\n\n`;
    }

    if (esDigital) {
      message += `✅ *Entrega:* Inmediata por WhatsApp\n`;
      message += `📦 *Formato:* Digital\n`;
    } else {
      if (product.stock && product.stock > 0) {
        message += `📦 *Stock:* ${product.stock} unidades disponibles\n`;
      }
    }

    message += `\n¿Te interesa? 😊`;

    return message;
  }

  /**
   * Obtiene todos los megapacks con sus precios REALES
   */
  static async getAllMegapackPrices(): Promise<Map<string, number>> {
    try {
      const megapacks = await db.product.findMany({
        where: {
          OR: [
            { name: { contains: 'Mega Pack', mode: 'insensitive' } },
            { name: { contains: 'Megapack', mode: 'insensitive' } },
            { category: 'MEGAPACK' }
          ]
        },
        select: {
          id: true,
          name: true,
          price: true
        }
      });

      const priceMap = new Map<string, number>();
      megapacks.forEach(mp => {
        priceMap.set(mp.id, mp.price);
        console.log(`[RealDataEnforcer] 📦 ${mp.name}: $${mp.price.toLocaleString('es-CO')}`);
      });

      return priceMap;
    } catch (error) {
      console.error('[RealDataEnforcer] Error obteniendo precios de megapacks:', error);
      return new Map();
    }
  }

  /**
   * Valida que un mensaje no contenga precios inventados
   */
  static async validateMessage(message: string, productId?: string): Promise<{
    isValid: boolean;
    errors: string[];
    correctedMessage?: string;
  }> {
    const errors: string[] = [];

    // Buscar menciones de precios en el mensaje
    const priceRegex = /\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:COP|pesos?|mil)?/gi;
    const matches = message.match(priceRegex);

    if (matches && productId) {
      const product = await this.getProductData(productId);
      if (product) {
        const realPriceStr = product.price.toString();
        
        for (const match of matches) {
          const numStr = match.replace(/[^\d]/g, '');
          if (numStr && numStr !== realPriceStr) {
            errors.push(`Precio incorrecto: ${match}. El precio real es ${this.formatPrice(product.price)}`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      correctedMessage: errors.length > 0 ? await this.generateProductMessage(productId!) : undefined
    };
  }
}
