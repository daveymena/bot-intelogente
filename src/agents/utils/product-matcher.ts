/**
 * Product Matcher
 * Busca y extrae productos de la base de datos
 * Funciona SIN IA externa usando búsqueda inteligente
 */

import { db } from '@/lib/db';
import { Product } from '../shared-memory';

export class ProductMatcher {
  /**
   * Busca productos por consulta del usuario
   */
  static async searchProducts(query: string, userId: string): Promise<Product[]> {
    try {
      const cleanQuery = query.toLowerCase().trim();
      
      // Extraer palabras clave
      const keywords = this.extractKeywords(cleanQuery);
      
      console.log('[ProductMatcher] 🔍 Palabras clave:', keywords);
      
      if (keywords.length === 0) {
        return [];
      }
      
      // Buscar en la base de datos
      const products = await db.product.findMany({
        where: {
          userId,
          status: 'AVAILABLE',
          OR: keywords.map(keyword => ({
            OR: [
              { name: { contains: keyword, mode: 'insensitive' } },
              { description: { contains: keyword, mode: 'insensitive' } },
              { category: { contains: keyword, mode: 'insensitive' } },
              { tags: { contains: keyword, mode: 'insensitive' } },
            ]
          }))
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      
      // Calcular relevancia
      const productsWithScore = products.map(p => {
        const score = this.calculateRelevance(p, keywords);
        return { product: p, score };
      });
      
      // Ordenar por relevancia
      productsWithScore.sort((a, b) => b.score - a.score);
      
      console.log('[ProductMatcher] ✅ Encontrados:', productsWithScore.length);
      if (productsWithScore.length > 0) {
        console.log('[ProductMatcher] Mejor match:', productsWithScore[0].product.name, 'Score:', productsWithScore[0].score);
      }
      
      // Convertir a formato Product
      return productsWithScore.map(({ product: p }) => ({
        id: p.id,
        name: p.name,
        description: p.description || undefined,
        price: p.price,
        category: p.category,
        images: p.images ? JSON.parse(p.images) : [],
        stock: p.stock || undefined,
        specs: this.extractSpecs(p.description || ''),
      }));
      
    } catch (error) {
      console.error('[ProductMatcher] ❌ Error:', error);
      return [];
    }
  }
  
  /**
   * Busca un producto por ID
   */
  static async getProductById(productId: string, userId: string): Promise<Product | null> {
    try {
      const p = await db.product.findFirst({
        where: {
          id: productId,
          userId,
        },
      });
      
      if (!p) return null;
      
      return {
        id: p.id,
        name: p.name,
        description: p.description || undefined,
        price: p.price,
        category: p.category,
        images: p.images ? JSON.parse(p.images) : [],
        stock: p.stock || undefined,
        specs: this.extractSpecs(p.description || ''),
      };
    } catch (error) {
      console.error('[ProductMatcher] ❌ Error obteniendo producto:', error);
      return null;
    }
  }
  
  /**
   * Extrae palabras clave del mensaje
   */
  private static extractKeywords(query: string): string[] {
    const stopWords = [
      'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'y', 'o',
      'para', 'con', 'por', 'que', 'me', 'te', 'se', 'su', 'sus', 'al',
      'hola', 'buenos', 'dias', 'tardes', 'noches', 'quiero', 'necesito',
      'busco', 'interesa', 'información', 'sobre', 'más', 'favor', 'tienes',
      'tiene', 'hay', 'muy', 'buenas', 'buena', 'estoy', 'interesado'
    ];
    
    const words = query
      .replace(/[¿?¡!.,;:]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.includes(w));
    
    return [...new Set(words)]; // Eliminar duplicados
  }
  
  /**
   * Calcula la relevancia de un producto
   */
  private static calculateRelevance(product: any, keywords: string[]): number {
    const name = product.name.toLowerCase();
    const description = (product.description || '').toLowerCase();
    const category = product.category.toLowerCase();
    
    let score = 0;
    
    keywords.forEach(keyword => {
      if (name.includes(keyword)) score += 5; // Nombre vale más
      if (description.includes(keyword)) score += 2;
      if (category.includes(keyword)) score += 3;
    });
    
    return score;
  }
  
  /**
   * Extrae especificaciones del texto de descripción
   */
  private static extractSpecs(description: string): string[] {
    const specs: string[] = [];
    
    // Buscar patrones comunes de especificaciones
    const patterns = [
      /(\d+GB\s+RAM)/gi,
      /(\d+GB\s+SSD)/gi,
      /(\d+GB\s+HDD)/gi,
      /(Intel\s+Core\s+i\d)/gi,
      /(AMD\s+Ryzen\s+\d)/gi,
      /(Pantalla\s+\d+\.?\d*"?)/gi,
      /(\d+\s*pulgadas)/gi,
    ];
    
    patterns.forEach(pattern => {
      const matches = description.match(pattern);
      if (matches) {
        specs.push(...matches);
      }
    });
    
    return [...new Set(specs)]; // Eliminar duplicados
  }
  
  /**
   * Busca productos por categoría
   */
  static async getProductsByCategory(category: string, userId: string): Promise<Product[]> {
    try {
      const products = await db.product.findMany({
        where: {
          userId,
          status: 'AVAILABLE',
          category: { contains: category, mode: 'insensitive' },
        },
        take: 5,
        orderBy: { price: 'asc' },
      });
      
      return products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || undefined,
        price: p.price,
        category: p.category,
        images: p.images ? JSON.parse(p.images) : [],
        stock: p.stock || undefined,
        specs: this.extractSpecs(p.description || ''),
      }));
    } catch (error) {
      console.error('[ProductMatcher] ❌ Error buscando por categoría:', error);
      return [];
    }
  }
}
