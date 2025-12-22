/**
 * Búsqueda Fuzzy de Productos
 * Tolera errores ortográficos y encuentra productos similares
 */

/**
 * Calcula la distancia de Levenshtein entre dos strings
 * Mide cuántos cambios se necesitan para convertir un string en otro
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Inicializar matriz
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Calcular distancia
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // Eliminación
        matrix[i][j - 1] + 1,      // Inserción
        matrix[i - 1][j - 1] + cost // Sustitución
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calcula similitud entre dos strings (0-100%)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  
  if (maxLength === 0) return 100;
  
  return Math.round(((maxLength - distance) / maxLength) * 100);
}

/**
 * Mapeo de palabras comúnmente mal escritas
 */
const COMMON_TYPOS: Record<string, string> = {
  // Typos comunes en español
  'cisor': 'curso',
  'curzo': 'curso',
  'qurso': 'curso',
  'laptop': 'laptop',
  'labtop': 'laptop',
  'laptob': 'laptop',
  'megapak': 'megapack',
  'megapac': 'megapack',
  'piano': 'piano',
  'pian': 'piano',
  'diseño': 'diseño',
  'diseno': 'diseño',
  'fotografia': 'fotografía',
  'fotoshop': 'photoshop',
  'idioma': 'idioma',
  'idiomas': 'idiomas',
  'ingles': 'inglés',
  'computador': 'computador',
  'computadora': 'computador',
  'pc': 'computador'
};

/**
 * Corrige errores ortográficos comunes
 */
function correctTypos(text: string): string {
  const words = text.toLowerCase().split(' ');
  const corrected = words.map(word => {
    // Buscar corrección exacta
    if (COMMON_TYPOS[word]) {
      return COMMON_TYPOS[word];
    }
    
    // Buscar corrección similar
    for (const [typo, correct] of Object.entries(COMMON_TYPOS)) {
      const similarity = calculateSimilarity(word, typo);
      if (similarity >= 80) {
        return correct;
      }
    }
    
    return word;
  });
  
  return corrected.join(' ');
}

/**
 * Interfaz de resultado de búsqueda fuzzy
 */
export interface FuzzySearchResult {
  product: any;
  score: number;
  matchType: 'exact' | 'fuzzy' | 'partial' | 'related';
  matchedField: 'name' | 'description' | 'tags' | 'category';
}

/**
 * Motor de búsqueda fuzzy de productos
 */
export class FuzzyProductSearch {
  
  /**
   * Busca productos con tolerancia a errores
   */
  static search(query: string, products: any[], options: {
    minSimilarity?: number;
    maxResults?: number;
    includePartial?: boolean;
  } = {}): FuzzySearchResult[] {
    const {
      minSimilarity = 60,
      maxResults = 10,
      includePartial = true
    } = options;
    
    console.log('[FuzzySearch] 🔍 Buscando:', query);
    
    // Corregir typos primero
    const correctedQuery = correctTypos(query);
    console.log('[FuzzySearch] ✏️ Consulta corregida:', correctedQuery);
    
    const results: FuzzySearchResult[] = [];
    const queryLower = correctedQuery.toLowerCase();
    const queryWords = queryLower.split(' ').filter(w => w.length > 2);
    
    for (const product of products) {
      const productName = (product.name || '').toLowerCase();
      const productDesc = (product.description || '').toLowerCase();
      const productTags = (product.smartTags || product.tags || '').toLowerCase();
      const productCategory = (product.category || '').toLowerCase();
      
      // 1. Match exacto en nombre
      if (productName.includes(queryLower)) {
        results.push({
          product,
          score: 100,
          matchType: 'exact',
          matchedField: 'name'
        });
        continue;
      }
      
      // 2. Match exacto en tags
      if (productTags.includes(queryLower)) {
        results.push({
          product,
          score: 95,
          matchType: 'exact',
          matchedField: 'tags'
        });
        continue;
      }
      
      // 3. Match fuzzy en nombre
      const nameSimilarity = calculateSimilarity(queryLower, productName);
      if (nameSimilarity >= minSimilarity) {
        results.push({
          product,
          score: nameSimilarity,
          matchType: 'fuzzy',
          matchedField: 'name'
        });
        continue;
      }
      
      // 4. Match parcial por palabras
      if (includePartial && queryWords.length > 0) {
        let maxWordScore = 0;
        let matchedInName = false;
        
        for (const word of queryWords) {
          // Buscar palabra en nombre
          if (productName.includes(word)) {
            maxWordScore = Math.max(maxWordScore, 90);
            matchedInName = true;
          }
          
          // Buscar palabra en tags
          if (productTags.includes(word)) {
            maxWordScore = Math.max(maxWordScore, 85);
          }
          
          // Buscar palabra en descripción
          if (productDesc.includes(word)) {
            maxWordScore = Math.max(maxWordScore, 70);
          }
          
          // Fuzzy match en palabras individuales del nombre del producto
          const productWords = productName.split(' ');
          for (const productWord of productWords) {
            if (productWord.length > 2) {
              const wordSimilarity = calculateSimilarity(word, productWord);
              if (wordSimilarity >= minSimilarity) {
                maxWordScore = Math.max(maxWordScore, wordSimilarity - 10);
                matchedInName = true;
              }
            }
          }
        }
        
        if (maxWordScore >= minSimilarity) {
          results.push({
            product,
            score: maxWordScore,
            matchType: 'partial',
            matchedField: matchedInName ? 'name' : 'description'
          });
          continue;
        }
      }
      
      // 5. Match por categoría relacionada
      const categoryMatches = [
        { keywords: ['curso', 'cursos', 'class', 'aprender'], category: 'DIGITAL' },
        { keywords: ['laptop', 'computador', 'pc', 'notebook'], category: 'LAPTOP' },
        { keywords: ['moto', 'motocicleta', 'vehículo'], category: 'MOTORCYCLE' },
        { keywords: ['megapack', 'pack', 'paquete'], category: 'DIGITAL' }
      ];
      
      for (const categoryMatch of categoryMatches) {
        if (categoryMatch.keywords.some(k => queryLower.includes(k))) {
          if (productCategory === categoryMatch.category.toLowerCase()) {
            results.push({
              product,
              score: 65,
              matchType: 'related',
              matchedField: 'category'
            });
            break;
          }
        }
      }
    }
    
    // Ordenar por score descendente
    results.sort((a, b) => b.score - a.score);
    
    // Limitar resultados
    const limited = results.slice(0, maxResults);
    
    console.log(`[FuzzySearch] ✅ Encontrados ${limited.length} resultados`);
    limited.forEach((r, i) => {
      console.log(`[FuzzySearch]   ${i + 1}. ${r.product.name} (${r.score}% - ${r.matchType})`);
    });
    
    return limited;
  }
  
  /**
   * Busca un solo producto con la mejor coincidencia
   */
  static searchOne(query: string, products: any[], minSimilarity: number = 70): any | null {
    const results = this.search(query, products, { minSimilarity, maxResults: 1 });
    return results.length > 0 ? results[0].product : null;
  }
  
  /**
   * Genera sugerencias cuando no hay resultados
   */
  static generateSuggestions(query: string, products: any[], count: number = 3): any[] {
    // Buscar con umbral muy bajo para sugerencias
    const results = this.search(query, products, { 
      minSimilarity: 40, 
      maxResults: count,
      includePartial: true 
    });
    
    return results.map(r => r.product);
  }
}

/**
 * Función de utilidad para integración rápida
 */
export function fuzzySearchProducts(query: string, products: any[]): any[] {
  const results = FuzzyProductSearch.search(query, products, {
    minSimilarity: 60,
    maxResults: 5
  });
  
  return results.map(r => r.product);
}
