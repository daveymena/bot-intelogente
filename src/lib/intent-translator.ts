/**
 * 🧠 TRADUCTOR DE INTENCIONES
 * Convierte lo que dice el cliente en términos que el bot entiende
 * Razonamiento profundo local sin IA
 */

export interface TranslatedIntent {
  originalQuery: string;
  translatedTerms: string[];
  productType: 'megapack' | 'curso' | 'producto_fisico' | 'servicio' | 'general';
  confidence: number;
  reasoning: string;
}

export class IntentTranslator {
  /**
   * Traduce la intención del cliente a términos de búsqueda
   */
  static translate(userMessage: string): TranslatedIntent {
    const normalized = userMessage.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .trim();

    console.log('[IntentTranslator] 🧠 Analizando:', userMessage);

    // 1. DETECTAR TIPO DE PRODUCTO
    const productType = this.detectProductType(normalized);
    console.log('[IntentTranslator] 📦 Tipo detectado:', productType);

    // 2. EXTRAER TEMA/CATEGORÍA
    const tema = this.extractTopic(normalized);
    console.log('[IntentTranslator] 🎯 Tema extraído:', tema);

    // 3. GENERAR TÉRMINOS DE BÚSQUEDA
    const terms = this.generateSearchTerms(normalized, productType, tema);
    console.log('[IntentTranslator] 🔍 Términos generados:', terms);

    // 4. CALCULAR CONFIANZA
    const confidence = this.calculateConfidence(normalized, terms);

    // 5. GENERAR RAZONAMIENTO
    const reasoning = this.generateReasoning(normalized, productType, tema, terms);

    return {
      originalQuery: userMessage,
      translatedTerms: terms,
      productType,
      confidence,
      reasoning
    };
  }

  /**
   * Detecta el tipo de producto que busca el cliente
   */
  private static detectProductType(text: string): TranslatedIntent['productType'] {
    // Megapack
    if (text.includes('megapack') || text.includes('mega pack') || 
        text.includes('pack completo') || text.includes('todos los cursos')) {
      return 'megapack';
    }

    // Curso individual
    if (text.includes('curso') || text.includes('cursos') || 
        text.includes('aprender') || text.includes('enseñar')) {
      return 'curso';
    }

    // Producto físico
    if (text.includes('laptop') || text.includes('portatil') || text.includes('computador') ||
        text.includes('monitor') || text.includes('teclado') || text.includes('mouse') ||
        text.includes('moto') || text.includes('motocicleta')) {
      return 'producto_fisico';
    }

    // Servicio
    if (text.includes('reparacion') || text.includes('reparación') || 
        text.includes('arreglo') || text.includes('mantenimiento')) {
      return 'servicio';
    }

    return 'general';
  }

  /**
   * Extrae el tema o categoría de lo que busca
   * MEJORADO: Prioriza términos específicos sobre genéricos
   */
  private static extractTopic(text: string): string | null {
    // 🎯 PRIORIDAD 1: Términos ESPECÍFICOS (buscar primero)
    const specificTopics = {
      'piano': ['piano'],
      'guitarra': ['guitarra'],
      'bateria': ['bateria', 'batería'],
      'ingles': ['ingles', 'inglés', 'english'],
      'frances': ['frances', 'francés', 'french'],
      'aleman': ['aleman', 'alemán', 'german'],
      'diseño': ['diseño', 'diseno', 'grafico', 'gráfico', 'photoshop', 'illustrator'],
      'programacion': ['programacion', 'programación', 'codigo', 'código', 'javascript', 'python', 'web'],
      'reparacion': ['reparacion', 'reparación', 'arreglo', 'servicio tecnico']
    };
    
    // Buscar términos específicos primero
    for (const [topic, keywords] of Object.entries(specificTopics)) {
      if (keywords.some(kw => text.includes(kw))) {
        return topic;
      }
    }
    
    // 🎯 PRIORIDAD 2: Términos GENERALES (solo si no encontró específico)
    const generalTopics = {
      'musica': ['musica', 'música', 'audio', 'produccion musical'],
      'marketing': ['marketing', 'ventas', 'publicidad', 'redes sociales'],
      'video': ['video', 'edicion', 'edición', 'premiere', 'filmora'],
      'fotografia': ['fotografia', 'fotografía', 'foto', 'camara'],
      'excel': ['excel', 'office', 'word', 'powerpoint'],
      'idiomas': ['idioma', 'idiomas', 'language'],
      
      // Productos físicos
      'laptop': ['laptop', 'portatil', 'portátil', 'computador', 'notebook'],
      'gaming': ['gaming', 'gamer', 'juegos', 'videojuegos'],
      'monitor': ['monitor', 'pantalla', 'display'],
      'moto': ['moto', 'motocicleta', 'motorcycle']
    };

    for (const [topic, keywords] of Object.entries(generalTopics)) {
      if (keywords.some(kw => text.includes(kw))) {
        return topic;
      }
    }

    return null;
  }

  /**
   * Genera términos de búsqueda inteligentes
   * MEJORADO: Solo usa palabras que el cliente realmente mencionó
   */
  private static generateSearchTerms(
    text: string, 
    productType: TranslatedIntent['productType'],
    tema: string | null
  ): string[] {
    const terms: string[] = [];
    const textLower = text.toLowerCase();

    // Agregar tipo de producto
    if (productType === 'megapack') {
      terms.push('mega pack', 'megapack');
    } else if (productType === 'curso') {
      terms.push('curso', 'cursos');
    }

    // 🎯 CRÍTICO: Solo agregar el tema si el cliente lo mencionó explícitamente
    if (tema) {
      // Si el cliente mencionó específicamente una palabra (ej: "piano"),
      // NO agregar variaciones genéricas (ej: "música", "audio")
      
      // Verificar si mencionó algo específico
      const specificMentions = {
        'piano': textLower.includes('piano'),
        'guitarra': textLower.includes('guitarra'),
        'bateria': textLower.includes('bateria') || textLower.includes('batería'),
        'ingles': textLower.includes('ingles') || textLower.includes('inglés'),
        'frances': textLower.includes('frances') || textLower.includes('francés'),
        'diseño': textLower.includes('diseño') || textLower.includes('diseno'),
        'programacion': textLower.includes('programacion') || textLower.includes('programación')
      };
      
      // Si mencionó algo específico, usar SOLO eso
      let usedSpecific = false;
      for (const [specific, mentioned] of Object.entries(specificMentions)) {
        if (mentioned) {
          terms.push(specific);
          // Agregar solo variaciones de ESE término específico
          const variations = this.getTopicVariations(specific);
          terms.push(...variations);
          usedSpecific = true;
          break; // Solo el primero que encuentre
        }
      }
      
      // Si NO mencionó nada específico, usar el tema general
      if (!usedSpecific) {
        terms.push(tema);
        const variations = this.getTopicVariations(tema);
        terms.push(...variations);
      }
    }

    // Agregar palabras clave del texto original (solo las importantes)
    const keywords = this.extractKeywords(text);
    terms.push(...keywords);

    // Eliminar duplicados
    return [...new Set(terms)];
  }

  /**
   * Obtiene variaciones de un tema
   * MEJORADO: Variaciones específicas sin términos genéricos
   */
  private static getTopicVariations(tema: string): string[] {
    const variations: Record<string, string[]> = {
      // Diseño
      'diseño': ['diseno', 'diseño grafico', 'diseno grafico', 'diseño gráfico', 'design'],
      
      // Programación
      'programacion': ['programación', 'codigo', 'código', 'desarrollo', 'programming'],
      
      // Reparación
      'reparacion': ['reparación', 'arreglo', 'mantenimiento', 'servicio tecnico'],
      
      // Productos físicos
      'laptop': ['portatil', 'portátil', 'computador', 'notebook', 'pc'],
      'telefono': ['teléfono', 'celular', 'movil', 'móvil', 'smartphone'],
      
      // Idiomas
      'ingles': ['inglés', 'english', 'curso de ingles', 'curso de inglés'],
      'frances': ['francés', 'french', 'curso de frances', 'curso de francés'],
      
      // Música - ESPECÍFICOS (no genéricos)
      'piano': ['piano', 'curso de piano', 'clases de piano', 'aprender piano', 'tocar piano'],
      'guitarra': ['guitarra', 'curso de guitarra', 'clases de guitarra', 'tocar guitarra'],
      'bateria': ['bateria', 'batería', 'curso de bateria', 'clases de bateria'],
      'musica': ['música', 'cursos de musica', 'cursos de música', 'produccion musical'], // Solo si dice "música" general
      
      // Fotografía
      'fotografia': ['fotografía', 'foto', 'imagen']
    };

    return variations[tema] || [];
  }

  /**
   * Extrae palabras clave importantes
   */
  private static extractKeywords(text: string): string[] {
    const stopWords = [
      'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'y', 'o',
      'para', 'con', 'por', 'que', 'me', 'te', 'se', 'su', 'sus', 'al',
      'hola', 'buenos', 'dias', 'tardes', 'noches', 'quiero', 'necesito',
      'busco', 'interesa', 'informacion', 'sobre', 'mas', 'favor', 'tienes',
      'tiene', 'hay', 'muy', 'buenas', 'buena', 'estoy', 'este', 'ese'
    ];

    return text
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 5); // Máximo 5 palabras clave
  }

  /**
   * Calcula la confianza de la traducción
   */
  private static calculateConfidence(text: string, terms: string[]): number {
    let confidence = 0.5; // Base

    // +0.2 si detectó tipo de producto
    if (text.includes('curso') || text.includes('megapack') || text.includes('laptop')) {
      confidence += 0.2;
    }

    // +0.2 si tiene tema claro
    if (terms.length > 2) {
      confidence += 0.2;
    }

    // +0.1 si es específico
    if (text.length > 20) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Genera explicación del razonamiento
   */
  private static generateReasoning(
    text: string,
    productType: TranslatedIntent['productType'],
    tema: string | null,
    terms: string[]
  ): string {
    let reasoning = `Cliente dice: "${text}"\n`;
    reasoning += `→ Tipo de producto: ${productType}\n`;
    
    if (tema) {
      reasoning += `→ Tema identificado: ${tema}\n`;
    }
    
    reasoning += `→ Buscar productos con: ${terms.join(', ')}`;
    
    return reasoning;
  }

  /**
   * Traduce consultas comunes a términos específicos
   */
  static translateCommonQueries(text: string): string[] {
    const normalized = text.toLowerCase();
    const translations: Record<string, string[]> = {
      // Diseño
      'diseño grafico': ['mega pack 01', 'diseño', 'grafico', 'photoshop', 'illustrator'],
      'diseño': ['diseño', 'diseno', 'grafico', 'gráfico'],
      
      // Programación
      'programacion': ['programacion', 'programación', 'codigo', 'web', 'desarrollo'],
      'programacion web': ['mega pack 02', 'programacion', 'web', 'javascript'],
      
      // Reparación
      'reparacion de telefonos': ['mega pack 18', 'reparacion', 'telefono', 'celular', 'movil'],
      'reparacion': ['reparacion', 'reparación', 'arreglo', 'servicio'],
      
      // Marketing
      'marketing': ['marketing', 'ventas', 'publicidad', 'redes sociales'],
      
      // Productos físicos
      'laptop': ['laptop', 'portatil', 'portátil', 'computador'],
      'laptop gaming': ['laptop', 'gaming', 'gamer', 'ryzen 5', 'ryzen 7'],
      'laptop trabajo': ['laptop', 'trabajo', 'oficina', 'ryzen 3', 'intel i5']
    };

    // Buscar coincidencias
    for (const [query, terms] of Object.entries(translations)) {
      if (normalized.includes(query)) {
        return terms;
      }
    }

    return [];
  }
}
