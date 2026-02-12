/**
 * 🏷️ SISTEMA DE CATEGORÍAS DINÁMICAS
 * Gestiona categorías personalizadas por usuario y nicho
 */

import { db } from './db';

export interface CategoryHierarchy {
  main: string;
  subcategories: string[];
  synonyms: string[];
  relatedTerms: string[];
}

export class CategoryManagementService {
  /**
   * Extrae y organiza categorías automáticamente de los productos
   */
  static async extractCategories(userId: string): Promise<CategoryHierarchy[]> {
    try {
      console.log('[CategoryManager] 📊 Extrayendo categorías...');

      const products = await db.product.findMany({
        where: { userId, status: 'AVAILABLE' },
        select: {
          mainCategory: true,
          customCategory: true,
          category: true,
          name: true,
          tags: true
        }
      });

      // Agrupar por categoría principal
      const categoryMap = new Map<string, Set<string>>();
      const synonymMap = new Map<string, Set<string>>();

      products.forEach(product => {
        const mainCat = product.mainCategory || product.category || 'General';
        const subCat = product.customCategory || '';

        if (!categoryMap.has(mainCat)) {
          categoryMap.set(mainCat, new Set());
          synonymMap.set(mainCat, new Set());
        }

        if (subCat) {
          categoryMap.get(mainCat)!.add(subCat);
        }

        // Extraer sinónimos de tags
        if (product.tags) {
          try {
            const tags = JSON.parse(product.tags);
            if (Array.isArray(tags)) {
              tags.forEach(tag => synonymMap.get(mainCat)!.add(tag.toLowerCase()));
            }
          } catch (e) {
            // Ignorar errores de parsing
          }
        }

        // Extraer términos del nombre del producto
        const words = product.name.toLowerCase().split(' ');
        words.forEach(word => {
          if (word.length > 4) {
            synonymMap.get(mainCat)!.add(word);
          }
        });
      });

      // Construir jerarquía
      const hierarchy: CategoryHierarchy[] = [];

      categoryMap.forEach((subcats, mainCat) => {
        hierarchy.push({
          main: mainCat,
          subcategories: Array.from(subcats),
          synonyms: Array.from(synonymMap.get(mainCat) || []).slice(0, 10),
          relatedTerms: this.generateRelatedTerms(mainCat)
        });
      });

      console.log(`[CategoryManager] ✅ ${hierarchy.length} categorías extraídas`);
      return hierarchy;

    } catch (error: any) {
      console.error('[CategoryManager] ❌ Error extrayendo categorías:', error.message);
      return [];
    }
  }

  /**
   * Genera términos relacionados basados en la categoría
   */
  private static generateRelatedTerms(category: string): string[] {
    const relatedTermsMap: Record<string, string[]> = {
      'PHYSICAL': ['envío', 'entrega', 'domicilio', 'despacho'],
      'DIGITAL': ['descarga', 'acceso inmediato', 'online', 'virtual'],
      'SERVICE': ['agendar', 'reservar', 'cita', 'horario'],
      'Tecnología': ['especificaciones', 'garantía', 'marca', 'modelo'],
      'Ropa': ['talla', 'color', 'material', 'estilo'],
      'Alimentos': ['ingredientes', 'tamaño', 'porción', 'sabor'],
      'Salud': ['consulta', 'especialista', 'tratamiento', 'diagnóstico']
    };

    return relatedTermsMap[category] || ['precio', 'disponibilidad', 'características'];
  }

  /**
   * Busca productos por categoría con sinónimos inteligentes
   */
  static async searchByCategory(
    userId: string,
    searchTerm: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      const searchLower = searchTerm.toLowerCase();

      // Buscar en múltiples campos
      const products = await db.product.findMany({
        where: {
          userId,
          status: 'AVAILABLE',
          OR: [
            { mainCategory: { contains: searchLower, mode: 'insensitive' } },
            { customCategory: { contains: searchLower, mode: 'insensitive' } },
            { name: { contains: searchLower, mode: 'insensitive' } },
            { tags: { contains: searchLower, mode: 'insensitive' } },
            { description: { contains: searchLower, mode: 'insensitive' } }
          ]
        },
        take: limit,
        orderBy: { searchPriority: 'desc' }
      });

      return products;

    } catch (error: any) {
      console.error('[CategoryManager] ❌ Error buscando por categoría:', error.message);
      return [];
    }
  }

  /**
   * Sugiere categorías basadas en el input del usuario
   */
  static async suggestCategories(userId: string, input: string): Promise<string[]> {
    try {
      const categories = await this.extractCategories(userId);
      const inputLower = input.toLowerCase();
      const suggestions: string[] = [];

      categories.forEach(cat => {
        // Coincidencia exacta
        if (cat.main.toLowerCase().includes(inputLower)) {
          suggestions.push(cat.main);
        }

        // Coincidencia en subcategorías
        cat.subcategories.forEach(sub => {
          if (sub.toLowerCase().includes(inputLower)) {
            suggestions.push(`${cat.main} > ${sub}`);
          }
        });

        // Coincidencia en sinónimos
        cat.synonyms.forEach(syn => {
          if (syn.includes(inputLower) && !suggestions.includes(cat.main)) {
            suggestions.push(cat.main);
          }
        });
      });

      return suggestions.slice(0, 5);

    } catch (error: any) {
      console.error('[CategoryManager] ❌ Error sugiriendo categorías:', error.message);
      return [];
    }
  }

  /**
   * Genera un mapa de categorías para el prompt del orquestador
   */
  static async generateCategoryMapForPrompt(userId: string): Promise<string> {
    try {
      const categories = await this.extractCategories(userId);

      if (categories.length === 0) {
        return 'No hay categorías definidas.';
      }

      let categoryText = '\n📂 CATEGORÍAS DEL CATÁLOGO:\n';

      categories.forEach(cat => {
        categoryText += `\n▸ ${cat.main}`;
        if (cat.subcategories.length > 0) {
          categoryText += `\n  Subcategorías: ${cat.subcategories.slice(0, 5).join(', ')}`;
        }
        if (cat.relatedTerms.length > 0) {
          categoryText += `\n  Términos relacionados: ${cat.relatedTerms.join(', ')}`;
        }
      });

      return categoryText;

    } catch (error: any) {
      console.error('[CategoryManager] ❌ Error generando mapa de categorías:', error.message);
      return '';
    }
  }
}
