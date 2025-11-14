/**
 * 🔍 SERVICIO DE COINCIDENCIA DIFUSA (FUZZY MATCHING)
 * Permite entender palabras mal escritas o incompletas
 * 
 * Ejemplos:
 * - "laptp" → "laptop"
 * - "moto" → "moto"
 * - "pino" → "piano"
 * - "macbok" → "macbook"
 */

export class FuzzyMatchService {
  /**
   * Calcular distancia de Levenshtein entre dos strings
   * (número de cambios necesarios para convertir una palabra en otra)
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length
    const len2 = str2.length
    const matrix: number[][] = []

    // Inicializar matriz
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j
    }

    // Calcular distancia
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // Eliminación
          matrix[i][j - 1] + 1,      // Inserción
          matrix[i - 1][j - 1] + cost // Sustitución
        )
      }
    }

    return matrix[len1][len2]
  }

  /**
   * Calcular similitud entre dos strings (0-1)
   * 1 = idénticos, 0 = completamente diferentes
   */
  static calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim()
    const s2 = str2.toLowerCase().trim()

    // Si son idénticos
    if (s1 === s2) return 1

    // Si uno contiene al otro
    if (s1.includes(s2) || s2.includes(s1)) {
      const longer = Math.max(s1.length, s2.length)
      const shorter = Math.min(s1.length, s2.length)
      return shorter / longer
    }

    // Calcular distancia de Levenshtein
    const distance = this.levenshteinDistance(s1, s2)
    const maxLength = Math.max(s1.length, s2.length)

    // Convertir distancia a similitud (0-1)
    return 1 - (distance / maxLength)
  }

  /**
   * Encontrar la mejor coincidencia de una palabra en una lista
   */
  static findBestMatch(
    query: string,
    candidates: string[],
    threshold: number = 0.6
  ): { match: string; similarity: number } | null {
    let bestMatch: string | null = null
    let bestSimilarity = 0

    for (const candidate of candidates) {
      const similarity = this.calculateSimilarity(query, candidate)
      
      if (similarity > bestSimilarity && similarity >= threshold) {
        bestSimilarity = similarity
        bestMatch = candidate
      }
    }

    if (bestMatch) {
      return { match: bestMatch, similarity: bestSimilarity }
    }

    return null
  }

  /**
   * Corregir palabras mal escritas en una consulta
   */
  static correctTypos(
    query: string,
    dictionary: string[],
    threshold: number = 0.7
  ): { corrected: string; corrections: Array<{ original: string; corrected: string; similarity: number }> } {
    const words = query.toLowerCase().split(/\s+/)
    const corrections: Array<{ original: string; corrected: string; similarity: number }> = []
    const correctedWords: string[] = []

    for (const word of words) {
      // Buscar mejor coincidencia en el diccionario
      const match = this.findBestMatch(word, dictionary, threshold)

      if (match && match.match !== word) {
        // Se encontró una corrección
        corrections.push({
          original: word,
          corrected: match.match,
          similarity: match.similarity
        })
        correctedWords.push(match.match)
      } else {
        // Mantener palabra original
        correctedWords.push(word)
      }
    }

    return {
      corrected: correctedWords.join(' '),
      corrections
    }
  }

  /**
   * Verificar si una palabra es similar a alguna en la lista
   */
  static isSimilarToAny(
    word: string,
    candidates: string[],
    threshold: number = 0.7
  ): boolean {
    return candidates.some(candidate => 
      this.calculateSimilarity(word, candidate) >= threshold
    )
  }

  /**
   * Normalizar texto para búsqueda (quitar acentos, etc.)
   */
  static normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9\s]/g, '') // Quitar caracteres especiales
      .trim()
  }

  /**
   * Buscar coincidencias difusas en un texto
   */
  static fuzzySearch(
    query: string,
    text: string,
    threshold: number = 0.7
  ): boolean {
    const normalizedQuery = this.normalize(query)
    const normalizedText = this.normalize(text)

    // Búsqueda exacta primero
    if (normalizedText.includes(normalizedQuery)) {
      return true
    }

    // Búsqueda difusa palabra por palabra
    const queryWords = normalizedQuery.split(/\s+/)
    const textWords = normalizedText.split(/\s+/)

    for (const queryWord of queryWords) {
      const found = textWords.some(textWord => 
        this.calculateSimilarity(queryWord, textWord) >= threshold
      )
      if (found) {
        return true
      }
    }

    return false
  }

  /**
   * Diccionario común de productos y términos
   */
  static getCommonProductTerms(): string[] {
    return [
      // Productos
      'laptop', 'laptops', 'computador', 'computadora', 'portatil',
      'moto', 'motos', 'motocicleta', 'motocicletas',
      'piano', 'pianos', 'teclado', 'teclados',
      'macbook', 'mac', 'apple',
      'asus', 'vivobook',
      'hp', 'lenovo', 'dell', 'acer',
      'bajaj', 'pulsar', 'yamaha', 'honda',
      'megapack', 'mega', 'pack', 'paquete', 'packs', 'megapacks',
      'curso', 'cursos', 'capacitacion', 'capacitación',
      'completo', 'completa', 'todos', 'todo',
      
      // Condiciones
      'nuevo', 'nueva', 'nuevos', 'nuevas',
      'usado', 'usada', 'usados', 'usadas',
      'reacondicionado', 'reacondicionada',
      
      // Acciones
      'comprar', 'vender', 'precio', 'costo', 'valor',
      'informacion', 'información', 'info', 'detalles',
      'disponible', 'disponibilidad', 'stock',
      'envio', 'envío', 'entrega', 'delivery',
      'pago', 'pagos', 'metodo', 'método',
      
      // Características
      'color', 'colores', 'tamaño', 'tamano',
      'garantia', 'garantía', 'warranty',
      'especificaciones', 'caracteristicas', 'características',
      'modelo', 'modelos', 'version', 'versión'
    ]
  }

  /**
   * Extraer números de un texto
   */
  static extractNumbers(text: string): number[] {
    const matches = text.match(/\d+/g)
    return matches ? matches.map(n => parseInt(n)) : []
  }

  /**
   * Detectar si el usuario busca "todos los megapacks" o un pack específico
   */
  static detectMegapackIntent(query: string): {
    wantsAll: boolean
    specificNumber?: number
    isMegapackQuery: boolean
  } {
    const normalized = this.normalize(query)
    
    // Detectar si menciona megapacks
    const isMegapackQuery = /mega\s*pack|paquete|pack/.test(normalized)
    
    if (!isMegapackQuery) {
      return { wantsAll: false, isMegapackQuery: false }
    }

    // Detectar si quiere "todos" o "completo"
    const wantsAll = /todos|todo|completo|completa|40|cuarenta/.test(normalized)
    
    // Extraer número específico si lo menciona
    const numbers = this.extractNumbers(query)
    const specificNumber = numbers.length === 1 && numbers[0] <= 40 ? numbers[0] : undefined

    return {
      wantsAll,
      specificNumber,
      isMegapackQuery: true
    }
  }
}
