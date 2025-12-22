/**
 * BÚSQUEDA INTELIGENTE CON FALLBACK
 * Usa ProductIntelligenceService para búsqueda precisa
 */

import { db } from '@/lib/db';
import { ProductIntelligenceService } from './product-intelligence-service';

export class IntelligentSearchFallback {
  /**
   * Busca productos usando ProductIntelligenceService
   * 1. Usa el sistema inteligente de búsqueda
   * 2. Si no encuentra, busca en megapacks relacionados
   */
  static async searchWithFallback(query: string, userId: string): Promise<{
    products: any[];
    searchType: 'exact' | 'megapack' | 'none';
    reason: string;
  }> {
    console.log(`🔍 [Fallback] Buscando con ProductIntelligenceService: "${query}"`);
    
    // 1. USAR PRODUCTINTELLIGENCESERVICE (sistema corregido)
    const product = await ProductIntelligenceService.findProduct(query, userId);
    
    if (product) {
      console.log(`✅ [Fallback] Producto encontrado: ${product.name}`);
      return {
        products: [product],
        searchType: 'exact',
        reason: 'Encontré productos que coinciden exactamente'
      };
    }
    
    // 2. FALLBACK: Buscar en MEGAPACKS relacionados
    console.log(`🔄 [Fallback] No encontré producto específico, buscando en megapacks...`);
    const keywords = this.extractKeywords(query.toLowerCase());
    const megapackProducts = await this.searchMegapacks(keywords, userId);
    
    if (megapackProducts.length > 0) {
      console.log(`✅ [Fallback] Encontrados ${megapackProducts.length} megapacks relacionados`);
      return {
        products: megapackProducts,
        searchType: 'megapack',
        reason: `No encontré un curso individual, pero tengo megapacks que lo incluyen`
      };
    }
    
    // 3. NO ENCONTRADO
    console.log(`❌ [Fallback] No se encontraron productos`);
    return {
      products: [],
      searchType: 'none',
      reason: 'No encontré productos relacionados'
    };
  }
  
  /**
   * Búsqueda exacta en cursos individuales
   */
  private static async searchExact(keywords: string[], userId: string): Promise<any[]> {
    if (keywords.length === 0) return [];
    
    // Buscar productos que contengan TODAS las keywords (AND)
    // Esto hace la búsqueda más específica
    const products = await db.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE',
        category: 'DIGITAL',
        AND: keywords.map(kw => ({
          OR: [
            { name: { contains: kw, mode: 'insensitive' } },
            { description: { contains: kw, mode: 'insensitive' } }
          ]
        }))
      },
      take: 5
    });
    
    // Si no encuentra con AND, buscar con OR (más flexible)
    if (products.length === 0) {
      return await db.product.findMany({
        where: {
          userId,
          status: 'AVAILABLE',
          category: 'DIGITAL',
          OR: keywords.flatMap(kw => [
            { name: { contains: kw, mode: 'insensitive' } },
            { description: { contains: kw, mode: 'insensitive' } }
          ])
        },
        take: 5
      });
    }
    
    return products;
  }
  
  /**
   * Búsqueda en megapacks (fallback)
   */
  private static async searchMegapacks(keywords: string[], userId: string): Promise<any[]> {
    if (keywords.length === 0) {
      // Si no hay keywords, buscar todos los megapacks
      return await db.product.findMany({
        where: {
          userId,
          status: 'AVAILABLE',
          category: 'DIGITAL',
          OR: [
            { name: { contains: 'mega', mode: 'insensitive' } },
            { name: { contains: 'pack', mode: 'insensitive' } }
          ]
        },
        take: 3
      });
    }
    
    // 1. BÚSQUEDA ESPECÍFICA: Megapacks que contengan TODAS las keywords (AND)
    // Ejemplo: "curso de idiomas" → busca megapacks con "curso" Y "idiomas"
    const specificMegapacks = await db.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE',
        category: 'DIGITAL',
        OR: [
          { name: { contains: 'mega', mode: 'insensitive' } },
          { name: { contains: 'pack', mode: 'insensitive' } }
        ],
        AND: keywords.map(kw => ({
          OR: [
            { name: { contains: kw, mode: 'insensitive' } },
            { description: { contains: kw, mode: 'insensitive' } }
          ]
        }))
      },
      take: 1 // Solo 1 producto específico
    });
    
    if (specificMegapacks.length > 0) {
      console.log(`✅ [Fallback] Encontrado megapack específico con TODAS las keywords`);
      return specificMegapacks;
    }
    
    // 2. BÚSQUEDA FLEXIBLE: Megapacks que contengan ALGUNA keyword (OR)
    // Mostrar SOLO 1 producto para ser más específico
    const flexibleMegapacks = await db.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE',
        category: 'DIGITAL',
        OR: [
          { name: { contains: 'mega', mode: 'insensitive' } },
          { name: { contains: 'pack', mode: 'insensitive' } }
        ],
        AND: [
          {
            OR: keywords.flatMap(kw => [
              { name: { contains: kw, mode: 'insensitive' } },
              { description: { contains: kw, mode: 'insensitive' } }
            ])
          }
        ]
      },
      take: 1 // Solo 1 producto para ser específico
    });
    
    if (flexibleMegapacks.length > 0) {
      console.log(`✅ [Fallback] Encontrado 1 megapack relacionado con las keywords`);
      return flexibleMegapacks;
    }
    
    // 3. FALLBACK FINAL: Mostrar todos los megapacks
    console.log(`🔄 [Fallback] No encontré megapacks con keywords, mostrando todos los megapacks`);
    return await db.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE',
        category: 'DIGITAL',
        OR: [
          { name: { contains: 'mega', mode: 'insensitive' } },
          { name: { contains: 'pack', mode: 'insensitive' } }
        ]
      },
      take: 3
    });
  }
  
  /**
   * Extrae keywords importantes de la consulta
   */
  private static extractKeywords(query: string): string[] {
    // Solo palabras muy comunes que no aportan significado
    const stopwords = [
      'para', 'con', 'de', 'del', 'la', 'el', 'un', 'una', 'los', 'las', 'y', 'o', 'en', 'por',
      'busco', 'quiero', 'necesito', 'tienes', 'deseo', 'interesa', 'informacion', 'info',
      'precio', 'costo', 'valor', 'cuanto', 'como', 'donde', 'hola', 'saludos', 'buenos', 'dias',
      'mucho', 'muy', 'mas', 'menos', 'algo', 'algun', 'alguna'
    ];
    
    return query
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 2)
      .filter(w => !stopwords.includes(w));
  }
}
