import { SaasContextService } from './saasContextService';

export interface CategoryMatch {
  category: string | null;
  subcategory: string | null;
  confidence: number;
}

/**
 * Servicio de Categorización Dinámica (SaaS)
 * Detecta categorías basadas en los productos reales del cliente
 */
export class CategoryService {

  /**
   * Detecta la categoría de una búsqueda usando la configuración del Tenant
   */
  static async detectCategory(userId: string, query: string): Promise<CategoryMatch> {
    const tenantConfig = await SaasContextService.getTenantConfig(userId);
    
    if (!tenantConfig) {
      // Fallback a lógica legacy si no hay config
      return { category: null, subcategory: null, confidence: 0 };
    }

    const queryLower = query.toLowerCase();
    const activeCategories = tenantConfig.categories.active;
    
    // 1. Búsqueda Exacta en Categorías Activas
    for (const cat of activeCategories) {
      if (queryLower.includes(cat.toLowerCase())) {
        return { category: cat, subcategory: null, confidence: 1.0 };
      }
    }

    // 2. Búsqueda por Mapeos/Sinónimos (Si existen)
    // TODO: Implementar mapeos configurables en BD
    // Por ahora, usamos lógica simple de palabras clave
    
    // Ejemplo: Si el tenant tiene "Ropa", mapear "camiseta", "pantalon"
    if (activeCategories.includes('Ropa')) {
      if (/\b(camiseta|pantalon|camisa|vestido)\b/.test(queryLower)) {
        return { category: 'Ropa', subcategory: null, confidence: 0.9 };
      }
    }

    // Ejemplo: Si el tenant tiene "Tecnología" o "COMPUTER"
    if (activeCategories.some(c => ['Tecnología', 'COMPUTER', 'Laptops'].includes(c))) {
      if (/\b(portatil|laptop|pc|computador)\b/.test(queryLower)) {
        return { category: 'COMPUTER', subcategory: 'LAPTOP', confidence: 0.9 };
      }
    }

    return { category: null, subcategory: null, confidence: 0 };
  }

  /**
   * Verifica si una categoría es válida para este tenant
   */
  static async isValidCategory(userId: string, category: string): Promise<boolean> {
    const tenantConfig = await SaasContextService.getTenantConfig(userId);
    if (!tenantConfig) return false;
    
    return tenantConfig.categories.active.includes(category);
  }
}
