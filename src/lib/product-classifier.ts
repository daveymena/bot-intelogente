/**
 * 🧠 CLASIFICADOR INTELIGENTE DE PRODUCTOS
 * Sistema automático para categorizar productos y determinar estrategias de venta
 */

import { db } from './db';

export enum ProductType {
  DIGITAL = 'DIGITAL',           // Cursos, megapacks, software
  PHYSICAL_HIGH_VALUE = 'PHYSICAL_HIGH_VALUE', // Computadores, impresoras (>500k COP)
  PHYSICAL_LOW_VALUE = 'PHYSICAL_LOW_VALUE',   // Bolsos, cintas, accesorios (<100k COP)
  PHYSICAL_MEDIUM_VALUE = 'PHYSICAL_MEDIUM_VALUE', // Teclados, mouse (100k-500k COP)
  SERVICE = 'SERVICE'            // Servicios profesionales
}

export enum SalesStrategy {
  INFO_AND_SELL = 'INFO_AND_SELL',           // Dar info y vender (digitales)
  LOCAL_DELIVERY = 'LOCAL_DELIVERY',         // Entrega local preferida (alto valor)
  DROPSHIPPING = 'DROPSHIPPING',             // Solo contraentrega (bajo valor)
  CONSULTATION = 'CONSULTATION',             // Requiere consulta (servicios)
  MIXED = 'MIXED'                           // Combinación de estrategias
}

export interface ProductClassification {
  type: ProductType;
  strategy: SalesStrategy;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  deliveryOptions: string[];
  salesApproach: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class ProductClassifier {
  // Umbrales de precio para clasificación automática
  private static readonly PRICE_THRESHOLDS = {
    HIGH_VALUE: 500000,    // > 500k COP = Alto valor
    MEDIUM_VALUE: 100000,  // 100k-500k COP = Valor medio
    LOW_VALUE: 100000      // < 100k COP = Bajo valor
  };

  // Palabras clave para detectar categorías
  private static readonly CATEGORY_KEYWORDS = {
    DIGITAL: ['curso', 'megapack', 'pack', 'digital', 'online', 'software', 'ebook', 'video'],
    HIGH_VALUE: ['computador', 'laptop', 'impresora', 'monitor', 'television', 'nevera', 'lavadora'],
    LOW_VALUE: ['bolso', 'cinta', 'accesorio', 'llavero', 'mouse', 'teclado', 'audifono', 'cable'],
    SERVICE: ['servicio', 'consultoria', 'asesoria', 'reparacion', 'mantenimiento', 'instalacion']
  };

  /**
   * 🧠 CLASIFICAR PRODUCTO AUTOMÁTICAMENTE
   */
  static classifyProduct(product: any): ProductClassification {
    const name = product.name?.toLowerCase() || '';
    const description = product.description?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';
    const price = product.price || 0;

    // 1. PRIMERO: Verificar categoría explícita
    if (category.includes('digital') || category.includes('curso')) {
      return this.createDigitalClassification(product);
    }

    if (category.includes('service') || category.includes('servicio')) {
      return this.createServiceClassification(product);
    }

    // 2. SEGUNDO: Análisis de palabras clave en nombre y descripción
    const text = `${name} ${description}`;

    // Detectar digitales
    if (this.CATEGORY_KEYWORDS.DIGITAL.some(keyword => text.includes(keyword))) {
      return this.createDigitalClassification(product);
    }

    // Detectar servicios
    if (this.CATEGORY_KEYWORDS.SERVICE.some(keyword => text.includes(keyword))) {
      return this.createServiceClassification(product);
    }

    // Detectar alto valor
    if (this.CATEGORY_KEYWORDS.HIGH_VALUE.some(keyword => text.includes(keyword))) {
      return this.createHighValueClassification(product);
    }

    // Detectar bajo valor
    if (this.CATEGORY_KEYWORDS.LOW_VALUE.some(keyword => text.includes(keyword))) {
      return this.createLowValueClassification(product);
    }

    // 3. TERCERO: Clasificación por precio (fallback)
    if (price >= this.PRICE_THRESHOLDS.HIGH_VALUE) {
      return this.createHighValueClassification(product);
    } else if (price >= this.PRICE_THRESHOLDS.MEDIUM_VALUE) {
      return this.createMediumValueClassification(product);
    } else {
      return this.createLowValueClassification(product);
    }
  }

  /**
   * 📚 CLASIFICACIÓN PARA PRODUCTOS DIGITALES
   */
  private static createDigitalClassification(product: any): ProductClassification {
    return {
      type: ProductType.DIGITAL,
      strategy: SalesStrategy.INFO_AND_SELL,
      priority: 'HIGH',
      deliveryOptions: ['INMEDIATA', 'EMAIL'],
      salesApproach: 'Información completa + Venta directa + Acceso inmediato',
      riskLevel: 'LOW'
    };
  }

  /**
   * 🔧 CLASIFICACIÓN PARA SERVICIOS
   */
  private static createServiceClassification(product: any): ProductClassification {
    return {
      type: ProductType.SERVICE,
      strategy: SalesStrategy.CONSULTATION,
      priority: 'HIGH',
      deliveryOptions: ['PROGRAMAR_CITA', 'CONSULTA_PREVIA'],
      salesApproach: 'Consulta inicial + Presupuesto personalizado + Cita programada',
      riskLevel: 'MEDIUM'
    };
  }

  /**
   * 💻 CLASIFICACIÓN PARA PRODUCTOS DE ALTO VALOR
   */
  private static createHighValueClassification(product: any): ProductClassification {
    return {
      type: ProductType.PHYSICAL_HIGH_VALUE,
      strategy: SalesStrategy.LOCAL_DELIVERY,
      priority: 'MEDIUM',
      deliveryOptions: ['ENTREGA_LOCAL', 'ENVIO_SEGURO', 'RECOJO_EN_TIENDA'],
      salesApproach: 'Demostración física + Venta local preferida + Garantía extendida',
      riskLevel: 'HIGH'
    };
  }

  /**
   * ⌨️ CLASIFICACIÓN PARA PRODUCTOS DE VALOR MEDIO
   */
  private static createMediumValueClassification(product: any): ProductClassification {
    return {
      type: ProductType.PHYSICAL_MEDIUM_VALUE,
      strategy: SalesStrategy.MIXED,
      priority: 'MEDIUM',
      deliveryOptions: ['ENTREGA_LOCAL', 'ENVIO_NORMAL', 'CONTRAENTREGA'],
      salesApproach: 'Información técnica + Opciones de entrega flexibles',
      riskLevel: 'MEDIUM'
    };
  }

  /**
   * 🎒 CLASIFICACIÓN PARA PRODUCTOS DE BAJO VALOR
   */
  private static createLowValueClassification(product: any): ProductClassification {
    return {
      type: ProductType.PHYSICAL_LOW_VALUE,
      strategy: SalesStrategy.DROPSHIPPING,
      priority: 'LOW',
      deliveryOptions: ['CONTRAENTREGA', 'ENVIO_ECONOMICO'],
      salesApproach: 'Venta online + Pago contra entrega + Sin riesgos',
      riskLevel: 'LOW'
    };
  }

  /**
   * 🎯 OBTENER ESTRATEGIA DE VENTA PARA UN PRODUCTO
   */
  static async getSalesStrategy(productId: string, userId: string): Promise<ProductClassification> {
    try {
      const product = await db.product.findFirst({
        where: {
          id: productId,
          userId: userId
        }
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      return this.classifyProduct(product);
    } catch (error) {
      console.error('[ProductClassifier] Error obteniendo estrategia:', error);
      // Fallback: asumir producto físico de bajo valor
      return this.createLowValueClassification({ price: 50000 });
    }
  }

  /**
   * 📊 ANALIZAR PORTAFOLIO COMPLETO DE UN CLIENTE
   */
  static async analyzeClientPortfolio(userId: string): Promise<{
    summary: {
      totalProducts: number;
      digitalPercentage: number;
      physicalPercentage: number;
      servicePercentage: number;
      avgPrice: number;
      mainStrategy: SalesStrategy;
    };
    recommendations: string[];
  }> {
    try {
      const products = await db.product.findMany({
        where: { userId, status: 'AVAILABLE' }
      });

      if (products.length === 0) {
        return {
          summary: {
            totalProducts: 0,
            digitalPercentage: 0,
            physicalPercentage: 0,
            servicePercentage: 0,
            avgPrice: 0,
            mainStrategy: SalesStrategy.INFO_AND_SELL
          },
          recommendations: ['Agregue productos para comenzar el análisis']
        };
      }

      // Clasificar todos los productos
      const classifications = products.map(p => this.classifyProduct(p));

      // Calcular estadísticas
      const digitalCount = classifications.filter(c => c.type === ProductType.DIGITAL).length;
      const physicalCount = classifications.filter(c =>
        [ProductType.PHYSICAL_HIGH_VALUE, ProductType.PHYSICAL_MEDIUM_VALUE, ProductType.PHYSICAL_LOW_VALUE].includes(c.type)
      ).length;
      const serviceCount = classifications.filter(c => c.type === ProductType.SERVICE).length;

      const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;

      // Determinar estrategia principal
      const strategies = classifications.map(c => c.strategy);
      const mainStrategy = strategies.reduce((prev, curr) =>
        strategies.filter(s => s === curr).length > strategies.filter(s => s === prev).length ? curr : prev,
        strategies[0]
      );

      // Generar recomendaciones
      const recommendations = this.generateRecommendations(classifications, avgPrice);

      return {
        summary: {
          totalProducts: products.length,
          digitalPercentage: Math.round((digitalCount / products.length) * 100),
          physicalPercentage: Math.round((physicalCount / products.length) * 100),
          servicePercentage: Math.round((serviceCount / products.length) * 100),
          avgPrice: Math.round(avgPrice),
          mainStrategy
        },
        recommendations
      };
    } catch (error) {
      console.error('[ProductClassifier] Error analizando portafolio:', error);
      throw error;
    }
  }

  /**
   * 💡 GENERAR RECOMENDACIONES BASADAS EN EL ANÁLISIS
   */
  private static generateRecommendations(
    classifications: ProductClassification[],
    avgPrice: number
  ): string[] {
    const recommendations: string[] = [];

    const digitalCount = classifications.filter(c => c.type === ProductType.DIGITAL).length;
    const highValueCount = classifications.filter(c => c.type === ProductType.PHYSICAL_HIGH_VALUE).length;
    const lowValueCount = classifications.filter(c => c.type === ProductType.PHYSICAL_LOW_VALUE).length;

    // Recomendaciones basadas en composición del portafolio
    if (digitalCount > classifications.length * 0.7) {
      recommendations.push('Excelente portafolio digital - enfoque en ventas online con acceso inmediato');
    }

    if (highValueCount > classifications.length * 0.5) {
      recommendations.push('Productos de alto valor - priorizar entregas locales y demostraciones físicas');
    }

    if (lowValueCount > classifications.length * 0.5) {
      recommendations.push('Productos de bajo valor - ideal para dropshipping y ventas contra entrega');
    }

    if (avgPrice > 300000) {
      recommendations.push('Precios elevados - implementar sistema de consultas previas y financiamiento');
    }

    if (avgPrice < 50000) {
      recommendations.push('Precios accesibles - optimizar para ventas masivas y promociones');
    }

    return recommendations;
  }
}