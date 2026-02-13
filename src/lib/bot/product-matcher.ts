/**
 * 🎯 PRODUCT MATCHER SERVICE
 * 
 * Encuentra productos relevantes basándose en la intención del cliente
 * SIN depender de tags. Usa similitud semántica con AI.
 */

import { Groq } from 'groq-sdk';
import type { Interpretation } from './semantic-interpreter';

export interface ProductMatch {
  product: any;
  relevanceScore: number;
  matchReasons: string[];
  semanticSimilarity: number;
  useCaseMatch?: boolean;
  budgetMatch?: boolean;
}

export interface MatchingCriteria {
  intent: Interpretation;
  useCase?: string;
  budget?: { min: number; max: number };
  specifications?: Record<string, any>;
  excludeCategories?: string[];
}

export class ProductMatcherService {
  /**
   * Encuentra productos que coincidan con la intención del cliente
   */
  static async matchProducts(
    criteria: MatchingCriteria,
    products: any[],
    limit: number = 5
  ): Promise<ProductMatch[]> {
    console.log('[ProductMatcher] 🎯 Buscando productos relevantes...');
    console.log(`[ProductMatcher] Intención: ${criteria.intent.intent}`);
    console.log(`[ProductMatcher] Productos disponibles: ${products.length}`);

    try {
      // 1. Filtrar por tipo de producto si es claro
      let filteredProducts = this.filterByProductType(products, criteria.intent.productType);
      console.log(`[ProductMatcher] Después de filtrar por tipo: ${filteredProducts.length}`);

      // 2. Filtrar por caso de uso si se especificó
      if (criteria.useCase) {
        filteredProducts = this.filterByUseCase(filteredProducts, criteria.useCase);
        console.log(`[ProductMatcher] Después de filtrar por uso: ${filteredProducts.length}`);
      }

      // 3. Filtrar por presupuesto si se especificó
      if (criteria.budget) {
        filteredProducts = this.filterByBudget(filteredProducts, criteria.budget);
        console.log(`[ProductMatcher] Después de filtrar por presupuesto: ${filteredProducts.length}`);
      }

      // 4. Calcular similitud semántica para cada producto
      const matches = await this.calculateSemanticMatches(
        criteria.intent,
        filteredProducts
      );

      // 5. Ordenar por relevancia y limitar
      matches.sort((a, b) => b.relevanceScore - a.relevanceScore);
      const topMatches = matches.slice(0, limit);

      console.log(`[ProductMatcher] ✅ ${topMatches.length} productos encontrados`);
      topMatches.forEach((match, i) => {
        console.log(`  ${i + 1}. ${match.product.name} (score: ${match.relevanceScore.toFixed(2)})`);
      });

      return topMatches;
    } catch (error: any) {
      console.error('[ProductMatcher] ❌ Error:', error.message);
      
      // Fallback: usar búsqueda por keywords
      return this.fallbackKeywordMatch(criteria, products, limit);
    }
  }

  /**
   * Filtra productos por tipo
   */
  private static filterByProductType(products: any[], productType: string): any[] {
    if (productType === 'ambiguous') {
      return products; // No filtrar si es ambiguo
    }

    return products.filter(p => {
      const tipo = (p.tipo_producto || '').toLowerCase();
      const category = (p.category || '').toLowerCase();

      if (productType === 'physical') {
        return tipo === 'simple' || tipo === 'physical' || 
               category.includes('laptop') || category.includes('moto') ||
               category.includes('computador') || category.includes('periférico');
      }

      if (productType === 'digital') {
        return tipo === 'digital' || tipo === 'curso' ||
               category.includes('curso') || category.includes('megapack') ||
               category.includes('digital');
      }

      return true;
    });
  }

  /**
   * Filtra productos por caso de uso
   */
  static filterByUseCase(products: any[], useCase: string): any[] {
    const useCaseLower = useCase.toLowerCase();

    return products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const description = (p.description || '').toLowerCase();
      const searchText = `${name} ${description}`;

      // Casos de uso comunes
      if (useCaseLower.includes('trabajar') || useCaseLower.includes('trabajo')) {
        return searchText.includes('laptop') || searchText.includes('computador') ||
               searchText.includes('oficina') || searchText.includes('productividad');
      }

      if (useCaseLower.includes('estudiar') || useCaseLower.includes('aprender')) {
        return searchText.includes('curso') || searchText.includes('educación') ||
               searchText.includes('aprendizaje') || searchText.includes('estudiante');
      }

      if (useCaseLower.includes('música') || useCaseLower.includes('musical')) {
        return searchText.includes('piano') || searchText.includes('guitarra') ||
               searchText.includes('música') || searchText.includes('instrumento');
      }

      if (useCaseLower.includes('diseño') || useCaseLower.includes('gráfico')) {
        return searchText.includes('diseño') || searchText.includes('gráfico') ||
               searchText.includes('potente') || searchText.includes('ram');
      }

      // Match genérico por keywords
      const useCaseKeywords = useCaseLower.split(' ');
      return useCaseKeywords.some(kw => searchText.includes(kw));
    });
  }

  /**
   * Filtra productos por presupuesto
   */
  private static filterByBudget(
    products: any[],
    budget: { min: number; max: number }
  ): any[] {
    return products.filter(p => {
      const price = typeof p.price === 'number' ? p.price : parseFloat(p.price || '0');
      return price >= budget.min && price <= budget.max;
    });
  }

  /**
   * Calcula similitud semántica usando AI
   */
  private static async calculateSemanticMatches(
    intent: Interpretation,
    products: any[]
  ): Promise<ProductMatch[]> {
    // Si hay pocos productos, calcular similitud para todos
    if (products.length <= 10) {
      const matches = await Promise.all(
        products.map(async (product) => {
          const similarity = await this.calculateSemanticSimilarity(
            intent.intent,
            `${product.name}. ${product.description || ''}`
          );

          return {
            product,
            relevanceScore: similarity,
            matchReasons: this.generateMatchReasons(intent, product, similarity),
            semanticSimilarity: similarity,
          };
        })
      );

      return matches;
    }

    // Si hay muchos productos, usar búsqueda por keywords primero
    const keywordMatches = this.quickKeywordFilter(products, intent.keywords);
    const topProducts = keywordMatches.slice(0, 15); // Top 15 por keywords

    const matches = await Promise.all(
      topProducts.map(async (product) => {
        const similarity = await this.calculateSemanticSimilarity(
          intent.intent,
          `${product.name}. ${product.description || ''}`
        );

        return {
          product,
          relevanceScore: similarity,
          matchReasons: this.generateMatchReasons(intent, product, similarity),
          semanticSimilarity: similarity,
        };
      })
    );

    return matches;
  }

  /**
   * Calcula similitud semántica entre intención y producto usando AI
   */
  static async calculateSemanticSimilarity(
    intent: string,
    productDescription: string
  ): Promise<number> {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      const prompt = `Califica la similitud semántica entre la intención del cliente y el producto.

INTENCIÓN DEL CLIENTE: "${intent}"
PRODUCTO: "${productDescription}"

Responde con un número entre 0 y 1:
- 1.0 = Coincidencia perfecta
- 0.7-0.9 = Muy relevante
- 0.5-0.6 = Algo relevante
- 0.0-0.4 = No relevante

Considera:
- ¿El producto satisface la necesidad del cliente?
- ¿Las características coinciden con lo que busca?
- ¿El tipo de producto es correcto?

Responde SOLO con el número (ejemplo: 0.85)`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en evaluar relevancia de productos. Respondes SOLO con un número entre 0 y 1.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 10,
      });

      const content = response.choices[0].message.content || '0.5';
      const score = parseFloat(content.trim());

      return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score));
    } catch (error: any) {
      console.error('[ProductMatcher] Error calculando similitud:', error.message);
      return 0.5; // Score neutral en caso de error
    }
  }

  /**
   * Filtro rápido por keywords (sin AI)
   */
  private static quickKeywordFilter(products: any[], keywords: string[]): any[] {
    return products
      .map(product => {
        const searchText = `${product.name} ${product.description || ''} ${product.category || ''}`.toLowerCase();
        const matchCount = keywords.filter(kw => searchText.includes(kw.toLowerCase())).length;
        
        return { product, matchCount };
      })
      .filter(item => item.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount)
      .map(item => item.product);
  }

  /**
   * Genera razones de por qué el producto coincide
   */
  private static generateMatchReasons(
    intent: Interpretation,
    product: any,
    similarity: number
  ): string[] {
    const reasons: string[] = [];

    if (similarity > 0.8) {
      reasons.push('Alta similitud semántica con tu búsqueda');
    }

    // Verificar keywords
    const productText = `${product.name} ${product.description || ''}`.toLowerCase();
    const matchingKeywords = intent.keywords.filter(kw => 
      productText.includes(kw.toLowerCase())
    );

    if (matchingKeywords.length > 0) {
      reasons.push(`Coincide con: ${matchingKeywords.join(', ')}`);
    }

    // Verificar categoría
    if (intent.category && product.category?.toLowerCase().includes(intent.category.toLowerCase())) {
      reasons.push(`Categoría correcta: ${intent.category}`);
    }

    // Verificar tipo de producto
    if (intent.productType !== 'ambiguous') {
      reasons.push(`Tipo de producto correcto: ${intent.productType}`);
    }

    return reasons.length > 0 ? reasons : ['Producto relevante'];
  }

  /**
   * Fallback: búsqueda por keywords cuando AI falla
   */
  private static fallbackKeywordMatch(
    criteria: MatchingCriteria,
    products: any[],
    limit: number
  ): ProductMatch[] {
    console.log('[ProductMatcher] 🔄 Usando fallback por keywords...');

    const matches = this.quickKeywordFilter(products, criteria.intent.keywords);
    
    return matches.slice(0, limit).map(product => ({
      product,
      relevanceScore: 0.6,
      matchReasons: ['Búsqueda por keywords (fallback)'],
      semanticSimilarity: 0.6,
    }));
  }
}
