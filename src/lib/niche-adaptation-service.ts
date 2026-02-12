/**
 * 🌐 SISTEMA UNIVERSAL DE ADAPTACIÓN DE NICHO
 * Detecta automáticamente el tipo de negocio y adapta OpenClaw
 */

import { db } from './db';

export interface BusinessNiche {
  type: string; // 'technology', 'fashion', 'food', 'services', 'health', etc.
  subtype?: string; // 'electronics', 'clothing', 'restaurant', etc.
  characteristics: {
    hasPhysicalProducts: boolean;
    hasDigitalProducts: boolean;
    hasServices: boolean;
    requiresAppointments: boolean;
    requiresShipping: boolean;
    hasVariations: boolean; // Tallas, colores, capacidades, etc.
  };
  vocabulary: {
    productTerm: string; // 'producto', 'artículo', 'servicio', 'plato', etc.
    categoryTerms: string[]; // Términos comunes en este nicho
    actionVerbs: string[]; // 'comprar', 'reservar', 'agendar', 'pedir', etc.
  };
}

export class NicheAdaptationService {
  /**
   * Detecta automáticamente el nicho del negocio basado en productos y configuración
   */
  static async detectBusinessNiche(userId: string): Promise<BusinessNiche> {
    try {
      console.log('[NicheAdapter] 🔍 Detectando nicho del negocio...');

      // 1. Obtener productos y configuración
      const products = await db.product.findMany({
        where: { userId, status: 'AVAILABLE' },
        select: {
          category: true,
          mainCategory: true,
          customCategory: true,
          name: true,
          description: true,
          tags: true
        },
        take: 100
      });

      const botSettings = await db.botSettings.findUnique({
        where: { userId }
      });

      // 2. Analizar categorías predominantes
      const categoryCount: Record<string, number> = {};
      const customCategories: Set<string> = new Set();
      
      products.forEach(p => {
        // Contar categorías principales
        if (p.category) {
          categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
        }
        
        // Recopilar categorías personalizadas
        if (p.mainCategory) customCategories.add(p.mainCategory.toLowerCase());
        if (p.customCategory) customCategories.add(p.customCategory.toLowerCase());
      });

      // 3. Detectar tipo de negocio basado en patrones
      const niche = this.inferNicheFromData(
        categoryCount,
        Array.from(customCategories),
        products,
        botSettings
      );

      console.log('[NicheAdapter] ✅ Nicho detectado:', niche.type, niche.subtype);
      return niche;

    } catch (error: any) {
      console.error('[NicheAdapter] ❌ Error detectando nicho:', error.message);
      return this.getDefaultNiche();
    }
  }

  /**
   * Infiere el nicho basado en los datos disponibles
   */
  private static inferNicheFromData(
    categoryCount: Record<string, number>,
    customCategories: string[],
    products: any[],
    botSettings: any
  ): BusinessNiche {
    // Palabras clave por nicho
    const nicheKeywords = {
      technology: ['laptop', 'computador', 'mouse', 'teclado', 'monitor', 'celular', 'tablet', 'auricular', 'cable', 'cargador'],
      fashion: ['camisa', 'pantalón', 'vestido', 'zapato', 'blusa', 'falda', 'jean', 'ropa', 'accesorio'],
      food: ['plato', 'comida', 'bebida', 'menú', 'almuerzo', 'cena', 'desayuno', 'postre'],
      health: ['consulta', 'terapia', 'tratamiento', 'medicina', 'vitamina', 'suplemento'],
      beauty: ['maquillaje', 'crema', 'shampoo', 'perfume', 'tratamiento facial', 'manicure'],
      home: ['mueble', 'decoración', 'cocina', 'baño', 'sala', 'comedor', 'silla', 'mesa'],
      sports: ['bicicleta', 'pelota', 'raqueta', 'pesa', 'gimnasio', 'deporte'],
      education: ['curso', 'clase', 'tutoría', 'capacitación', 'taller', 'seminario'],
      automotive: ['carro', 'moto', 'repuesto', 'llanta', 'aceite', 'batería'],
      music: ['guitarra', 'piano', 'batería', 'micrófono', 'amplificador', 'instrumento']
    };

    // Analizar productos para detectar nicho
    let detectedNiche = 'general';
    let maxScore = 0;

    for (const [niche, keywords] of Object.entries(nicheKeywords)) {
      let score = 0;
      
      products.forEach(product => {
        const text = `${product.name} ${product.description || ''} ${product.tags || ''}`.toLowerCase();
        keywords.forEach(keyword => {
          if (text.includes(keyword)) score += 10;
        });
      });

      customCategories.forEach(cat => {
        keywords.forEach(keyword => {
          if (cat.includes(keyword)) score += 20;
        });
      });

      if (score > maxScore) {
        maxScore = score;
        detectedNiche = niche;
      }
    }

    // Construir características del nicho
    return this.buildNicheProfile(detectedNiche, categoryCount);
  }

  /**
   * Construye el perfil completo del nicho
   */
  private static buildNicheProfile(nicheType: string, categoryCount: Record<string, number>): BusinessNiche {
    const profiles: Record<string, BusinessNiche> = {
      technology: {
        type: 'technology',
        subtype: 'electronics',
        characteristics: {
          hasPhysicalProducts: true,
          hasDigitalProducts: false,
          hasServices: false,
          requiresAppointments: false,
          requiresShipping: true,
          hasVariations: true // Capacidades, colores, marcas
        },
        vocabulary: {
          productTerm: 'producto',
          categoryTerms: ['portátil', 'laptop', 'computador', 'mouse', 'teclado', 'monitor', 'celular'],
          actionVerbs: ['comprar', 'adquirir', 'cotizar', 'consultar precio']
        }
      },
      fashion: {
        type: 'fashion',
        subtype: 'clothing',
        characteristics: {
          hasPhysicalProducts: true,
          hasDigitalProducts: false,
          hasServices: false,
          requiresAppointments: false,
          requiresShipping: true,
          hasVariations: true // Tallas, colores
        },
        vocabulary: {
          productTerm: 'prenda',
          categoryTerms: ['camisa', 'pantalón', 'vestido', 'zapatos', 'accesorios'],
          actionVerbs: ['comprar', 'probar', 'ver modelos', 'consultar tallas']
        }
      },
      food: {
        type: 'food',
        subtype: 'restaurant',
        characteristics: {
          hasPhysicalProducts: true,
          hasDigitalProducts: false,
          hasServices: true,
          requiresAppointments: false,
          requiresShipping: false, // Delivery
          hasVariations: true // Tamaños, ingredientes
        },
        vocabulary: {
          productTerm: 'plato',
          categoryTerms: ['entrada', 'plato fuerte', 'postre', 'bebida', 'combo'],
          actionVerbs: ['pedir', 'ordenar', 'reservar', 'domicilio']
        }
      },
      health: {
        type: 'health',
        subtype: 'medical',
        characteristics: {
          hasPhysicalProducts: false,
          hasDigitalProducts: false,
          hasServices: true,
          requiresAppointments: true,
          requiresShipping: false,
          hasVariations: false
        },
        vocabulary: {
          productTerm: 'servicio',
          categoryTerms: ['consulta', 'terapia', 'tratamiento', 'examen'],
          actionVerbs: ['agendar', 'reservar cita', 'consultar disponibilidad']
        }
      },
      music: {
        type: 'music',
        subtype: 'instruments',
        characteristics: {
          hasPhysicalProducts: true,
          hasDigitalProducts: true, // Partituras, cursos
          hasServices: true, // Clases
          requiresAppointments: false,
          requiresShipping: true,
          hasVariations: true // Marcas, tamaños
        },
        vocabulary: {
          productTerm: 'instrumento',
          categoryTerms: ['guitarra', 'piano', 'batería', 'teclado', 'bajo'],
          actionVerbs: ['comprar', 'cotizar', 'agendar clase', 'consultar']
        }
      }
    };

    return profiles[nicheType] || this.getDefaultNiche();
  }

  /**
   * Retorna un nicho por defecto (genérico)
   */
  private static getDefaultNiche(): BusinessNiche {
    return {
      type: 'general',
      subtype: 'commerce',
      characteristics: {
        hasPhysicalProducts: true,
        hasDigitalProducts: false,
        hasServices: false,
        requiresAppointments: false,
        requiresShipping: true,
        hasVariations: true
      },
      vocabulary: {
        productTerm: 'producto',
        categoryTerms: ['artículo', 'item', 'producto'],
        actionVerbs: ['comprar', 'adquirir', 'consultar', 'cotizar']
      }
    };
  }

  /**
   * Genera instrucciones específicas del nicho para el orquestador
   */
  static generateNicheInstructions(niche: BusinessNiche): string {
    let instructions = `\n🎯 ADAPTACIÓN AL NICHO: ${niche.type.toUpperCase()}\n`;
    
    instructions += `\nCARACTERÍSTICAS DEL NEGOCIO:\n`;
    if (niche.characteristics.hasPhysicalProducts) {
      instructions += `- Vende productos físicos que requieren ${niche.characteristics.requiresShipping ? 'envío' : 'retiro en tienda'}\n`;
    }
    if (niche.characteristics.hasDigitalProducts) {
      instructions += `- Ofrece productos digitales de entrega inmediata\n`;
    }
    if (niche.characteristics.hasServices) {
      instructions += `- Presta servicios ${niche.characteristics.requiresAppointments ? 'que requieren agendamiento' : 'bajo demanda'}\n`;
    }
    if (niche.characteristics.hasVariations) {
      instructions += `- Los productos tienen variaciones (tallas, colores, capacidades, etc.)\n`;
    }

    instructions += `\nVOCABULARIO ESPECÍFICO:\n`;
    instructions += `- Usa "${niche.vocabulary.productTerm}" en lugar de "producto" genérico\n`;
    instructions += `- Verbos de acción: ${niche.vocabulary.actionVerbs.join(', ')}\n`;
    instructions += `- Categorías comunes: ${niche.vocabulary.categoryTerms.slice(0, 5).join(', ')}\n`;

    instructions += `\nCOMPORTAMIENTO ESPERADO:\n`;
    if (niche.characteristics.requiresAppointments) {
      instructions += `- Siempre ofrece opciones de fecha/hora para agendar\n`;
    }
    if (niche.characteristics.hasVariations) {
      instructions += `- Pregunta por preferencias específicas (talla, color, marca, etc.)\n`;
    }
    if (niche.characteristics.requiresShipping) {
      instructions += `- Menciona opciones de envío y costos\n`;
    }

    return instructions;
  }
}
