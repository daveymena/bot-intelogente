/**
 * Motor de Upselling Inteligente
 * Genera recomendaciones de productos relacionados y bundles
 */

import { db } from '@/lib/db';
import type { ProductoInfo } from '../ai/promptBuilder-simple';

interface UpsellRecommendation {
  type: 'related' | 'bundle' | 'upgrade';
  products: ProductoInfo[];
  message: string;
  discount?: number;
  bundlePrice?: number;
}

interface BundleConfig {
  name: string;
  products: ProductoInfo[];
  discount: number; // Porcentaje de descuento
  description: string;
}

/**
 * Motor principal de Upselling
 */
export class UpsellingEngine {
  /**
   * Genera recomendación de upsell basada en el producto actual
   */
  static async generateUpsell(
    currentProduct: ProductoInfo,
    context?: any
  ): Promise<UpsellRecommendation | null> {
    try {
      console.log('[UpsellingEngine] 🎯 Generando upsell para:', currentProduct.nombre);

      // 1. Buscar productos relacionados
      const relatedProducts = await this.findRelatedProducts(currentProduct);

      if (relatedProducts.length === 0) {
        console.log('[UpsellingEngine] ❌ No hay productos relacionados');
        return null;
      }

      // 2. Determinar tipo de upsell
      const upsellType = this.determineUpsellType(currentProduct, relatedProducts);

      // 3. Generar mensaje según tipo
      let recommendation: UpsellRecommendation;

      switch (upsellType) {
        case 'bundle':
          recommendation = await this.createBundle(currentProduct, relatedProducts);
          break;
        case 'upgrade':
          recommendation = this.createUpgrade(currentProduct, relatedProducts);
          break;
        default:
          recommendation = this.createRelatedRecommendation(currentProduct, relatedProducts);
      }

      console.log('[UpsellingEngine] ✅ Upsell generado:', recommendation.type);
      return recommendation;

    } catch (error) {
      console.error('[UpsellingEngine] Error:', error);
      return null;
    }
  }

  /**
   * Busca productos relacionados por categoría y precio similar
   */
  private static async findRelatedProducts(
    product: ProductoInfo
  ): Promise<ProductoInfo[]> {
    try {
      const productos = await db.product.findMany({
        where: {
          category: product.categoria,
          status: 'AVAILABLE',
          id: { not: product.id },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      return productos.map(p => ({
        id: p.id,
        nombre: p.name,
        descripcion: p.description || undefined,
        precio: p.price,
        categoria: p.category,
        tipoVenta: p.subcategory || undefined,
        imagenes: p.images ? JSON.parse(p.images) : [],
        stock: p.stock || undefined,
        metodosPago: [],
      }));
    } catch (error) {
      console.error('[UpsellingEngine] Error buscando productos relacionados:', error);
      return [];
    }
  }

  /**
   * Determina el mejor tipo de upsell
   */
  private static determineUpsellType(
    current: ProductoInfo,
    related: ProductoInfo[]
  ): 'bundle' | 'upgrade' | 'related' {
    // Si hay productos más caros, ofrecer upgrade
    const hasUpgrade = related.some(p => p.precio > current.precio * 1.2);
    if (hasUpgrade) return 'upgrade';

    // Si hay 2+ productos complementarios, crear bundle
    if (related.length >= 2) return 'bundle';

    // Por defecto, productos relacionados
    return 'related';
  }

  /**
   * Crea un bundle con descuento
   */
  private static async createBundle(
    mainProduct: ProductoInfo,
    relatedProducts: ProductoInfo[]
  ): Promise<UpsellRecommendation> {
    // Seleccionar los 2 mejores productos para el bundle
    const bundleProducts = relatedProducts.slice(0, 2);
    const allProducts = [mainProduct, ...bundleProducts];

    // Calcular precio total y descuento
    const totalPrice = allProducts.reduce((sum, p) => sum + p.precio, 0);
    const discount = 15; // 15% de descuento en bundles
    const bundlePrice = Math.round(totalPrice * (1 - discount / 100));
    const savings = totalPrice - bundlePrice;

    const message = this.generateBundleMessage(
      mainProduct,
      bundleProducts,
      totalPrice,
      bundlePrice,
      discount,
      savings
    );

    return {
      type: 'bundle',
      products: allProducts,
      message,
      discount,
      bundlePrice,
    };
  }

  /**
   * Crea recomendación de upgrade
   */
  private static createUpgrade(
    current: ProductoInfo,
    related: ProductoInfo[]
  ): UpsellRecommendation {
    // Encontrar el mejor upgrade (más caro pero no demasiado)
    const upgrades = related
      .filter(p => p.precio > current.precio && p.precio < current.precio * 2)
      .sort((a, b) => a.precio - b.precio);

    const upgradeProduct = upgrades[0] || related[0];
    const priceDiff = upgradeProduct.precio - current.precio;

    const message = `🔥 *¡UPGRADE DISPONIBLE!*

Has elegido: *${current.nombre}*
💰 Precio: $${current.precio.toLocaleString('es-CO')} COP

✨ *MEJOR OPCIÓN:*
*${upgradeProduct.nombre}*
💎 Precio: $${upgradeProduct.precio.toLocaleString('es-CO')} COP

⚡ Por solo $${priceDiff.toLocaleString('es-CO')} COP más, obtienes:
${upgradeProduct.descripcion ? `\n${upgradeProduct.descripcion.slice(0, 150)}...` : '✅ Características superiores'}

¿Te gustaría el upgrade? 🚀`;

    return {
      type: 'upgrade',
      products: [upgradeProduct],
      message,
    };
  }

  /**
   * Crea recomendación de productos relacionados
   */
  private static createRelatedRecommendation(
    current: ProductoInfo,
    related: ProductoInfo[]
  ): UpsellRecommendation {
    const recommendations = related.slice(0, 3);

    let message = `✨ *PRODUCTOS RELACIONADOS*

Ya que te interesa *${current.nombre}*, también te pueden gustar:

`;

    recommendations.forEach((p, i) => {
      message += `${i + 1}. *${p.nombre}*\n`;
      message += `   💰 $${p.precio.toLocaleString('es-CO')} COP\n\n`;
    });

    message += '¿Alguno te interesa? 😊';

    return {
      type: 'related',
      products: recommendations,
      message,
    };
  }

  /**
   * Genera mensaje para bundle
   */
  private static generateBundleMessage(
    main: ProductoInfo,
    bundleItems: ProductoInfo[],
    totalPrice: number,
    bundlePrice: number,
    discount: number,
    savings: number
  ): string {
    const isDigital = main.categoria.toLowerCase().includes('digital') ||
                      main.categoria.toLowerCase().includes('curso');

    let message = `🎁 *¡OFERTA ESPECIAL DE BUNDLE!*

━━━━━━━━━━━━━━━━━━━━

📦 *PACK COMPLETO:*

✅ ${main.nombre}
`;

    bundleItems.forEach(item => {
      message += `✅ ${item.nombre}\n`;
    });

    message += `
━━━━━━━━━━━━━━━━━━━━

💰 Precio individual: $${totalPrice.toLocaleString('es-CO')} COP
🔥 Precio BUNDLE: $${bundlePrice.toLocaleString('es-CO')} COP
⚡ AHORRAS: $${savings.toLocaleString('es-CO')} COP (${discount}%)

`;

    if (isDigital) {
      message += `🎯 *BENEFICIOS ADICIONALES:*
✨ Acceso inmediato a todo
📚 Contenido complementario
🎓 Aprende más rápido
💎 Mejor inversión

`;
    }

    message += `⏰ *Oferta válida SOLO HOY*

¿Aprovechamos este bundle? 🚀`;

    return message;
  }

  /**
   * Genera upsell post-compra (cross-sell)
   */
  static async generateCrossSell(
    purchasedProduct: ProductoInfo
  ): Promise<UpsellRecommendation | null> {
    try {
      console.log('[UpsellingEngine] 🛒 Generando cross-sell post-compra');

      const complementary = await this.findComplementaryProducts(purchasedProduct);

      if (complementary.length === 0) {
        return null;
      }

      const message = `🎉 *¡Gracias por tu compra de ${purchasedProduct.nombre}!*

💡 Los clientes que compraron esto también adquirieron:

`;

      const recommendations = complementary.slice(0, 2);
      let crossSellMessage = message;

      recommendations.forEach((p, i) => {
        crossSellMessage += `${i + 1}. *${p.nombre}*\n`;
        crossSellMessage += `   💰 $${p.precio.toLocaleString('es-CO')} COP\n`;
        crossSellMessage += `   🎁 Descuento especial: 10% OFF\n\n`;
      });

      crossSellMessage += '¿Te interesa alguno? 😊';

      return {
        type: 'related',
        products: recommendations,
        message: crossSellMessage,
        discount: 10,
      };

    } catch (error) {
      console.error('[UpsellingEngine] Error en cross-sell:', error);
      return null;
    }
  }

  /**
   * Busca productos complementarios
   */
  private static async findComplementaryProducts(
    product: ProductoInfo
  ): Promise<ProductoInfo[]> {
    // Buscar en la misma categoría pero diferente subcategoría
    try {
      const productos = await db.product.findMany({
        where: {
          category: product.categoria,
          subcategory: { not: product.tipoVenta },
          status: 'AVAILABLE',
          id: { not: product.id },
        },
        take: 3,
        orderBy: { createdAt: 'desc' },
      });

      return productos.map(p => ({
        id: p.id,
        nombre: p.name,
        descripcion: p.description || undefined,
        precio: p.price,
        categoria: p.category,
        tipoVenta: p.subcategory || undefined,
        imagenes: p.images ? JSON.parse(p.images) : [],
        stock: p.stock || undefined,
        metodosPago: [],
      }));
    } catch (error) {
      console.error('[UpsellingEngine] Error buscando complementarios:', error);
      return [];
    }
  }

  /**
   * Calcula el valor óptimo de bundle
   */
  static calculateOptimalBundleDiscount(
    products: ProductoInfo[]
  ): number {
    const totalPrice = products.reduce((sum, p) => sum + p.precio, 0);

    // Descuentos escalonados según valor total
    if (totalPrice > 500000) return 20; // 20% para bundles grandes
    if (totalPrice > 300000) return 15; // 15% para bundles medianos
    return 10; // 10% para bundles pequeños
  }

  /**
   * Verifica si un producto es elegible para upsell
   */
  static isEligibleForUpsell(product: ProductoInfo): boolean {
    // Productos digitales siempre son elegibles
    if (product.categoria.toLowerCase().includes('digital')) {
      return true;
    }

    // Productos físicos con precio > 50,000 COP
    return product.precio > 50000;
  }
}
