/**
 * Sistema de Categorización Inteligente de Productos
 * Analiza productos y asigna automáticamente categorías, subcategorías y tags
 */

import Groq from 'groq-sdk';

// Categorías principales del sistema
export const MAIN_CATEGORIES = {
  TECNOLOGIA: 'Tecnología',
  CURSOS: 'Cursos Digitales',
  MEGAPACKS: 'Megapacks',
  SERVICIOS: 'Servicios',
  OTROS: 'Otros'
} as const;

// Subcategorías por categoría principal
export const SUB_CATEGORIES = {
  TECNOLOGIA: [
    'Laptops',
    'Computadores de Escritorio',
    'Tablets',
    'Celulares',
    'Accesorios de Computador',
    'Audio',
    'Gaming',
    'Componentes',
    'Redes',
    'Almacenamiento'
  ],
  CURSOS: [
    'Música',
    'Idiomas',
    'Programación',
    'Diseño',
    'Marketing',
    'Negocios',
    'Desarrollo Personal'
  ],
  MEGAPACKS: [
    'Cursos Variados',
    'Recursos Digitales',
    'Plantillas',
    'Software'
  ],
  SERVICIOS: [
    'Reparación',
    'Instalación',
    'Consultoría',
    'Soporte Técnico'
  ]
} as const;

export interface CategorizationResult {
  mainCategory: string;
  subCategory: string;
  tags: string[];
  isAccessory: boolean;
  parentCategory?: string;
  confidence: number;
  reasoning: string;
}

export class ProductCategorizer {
  private static groqClient: Groq | null = null;

  private static getGroqClient(): Groq {
    if (!this.groqClient) {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('GROQ_API_KEY no configurada');
      }
      this.groqClient = new Groq({ apiKey });
    }
    return this.groqClient;
  }

  /**
   * Categoriza un producto usando IA
   */
  static async categorizeProduct(
    name: string,
    description?: string
  ): Promise<CategorizationResult> {
    try {
      const groq = this.getGroqClient();

      const prompt = `Eres un experto en categorización de productos. Analiza el siguiente producto y devuelve SOLO un JSON válido con esta estructura exacta:

{
  "mainCategory": "una de: Tecnología, Cursos Digitales, Megapacks, Servicios, Otros",
  "subCategory": "subcategoría específica",
  "tags": ["tag1", "tag2", "tag3"],
  "isAccessory": true/false,
  "parentCategory": "categoría padre si es accesorio, null si no",
  "confidence": 0.0-1.0,
  "reasoning": "breve explicación"
}

PRODUCTO:
Nombre: ${name}
${description ? `Descripción: ${description}` : ''}

REGLAS:
1. Si es un accesorio (mouse, teclado, audífonos, cable, funda, etc.), marca isAccessory=true
2. Si isAccessory=true, especifica parentCategory (ej: "Computadores" para mouse)
3. Tags deben ser palabras clave relevantes para búsqueda
4. Confidence debe reflejar qué tan seguro estás de la categorización
5. NO inventes información, usa solo lo que está en el nombre/descripción

Responde SOLO con el JSON, sin texto adicional.`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // ✅ Modelo actualizado
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('Respuesta vacía de la IA');
      }

      // Extraer JSON de la respuesta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se encontró JSON en la respuesta');
      }

      const result = JSON.parse(jsonMatch[0]) as CategorizationResult;

      // Validar resultado
      if (!result.mainCategory || !result.subCategory || !Array.isArray(result.tags)) {
        throw new Error('Formato de respuesta inválido');
      }

      return result;

    } catch (error) {
      console.error('❌ Error en categorización con IA:', error);
      
      // Fallback: categorización básica por palabras clave
      return this.fallbackCategorization(name, description);
    }
  }

  /**
   * Categorización de respaldo sin IA (basada en palabras clave)
   */
  private static fallbackCategorization(
    name: string,
    description?: string
  ): CategorizationResult {
    const text = `${name} ${description || ''}`.toLowerCase();

    // Detectar accesorios
    const accessoryKeywords = [
      'mouse', 'teclado', 'audífono', 'cable', 'cargador', 'funda',
      'protector', 'base', 'soporte', 'adaptador', 'hub', 'docking'
    ];
    const isAccessory = accessoryKeywords.some(keyword => text.includes(keyword));

    // Detectar categoría principal
    let mainCategory = MAIN_CATEGORIES.OTROS;
    let subCategory = 'General';
    let parentCategory: string | undefined;
    const tags: string[] = [];

    if (text.match(/portátil|laptop|notebook|ultrabook/)) {
      mainCategory = MAIN_CATEGORIES.TECNOLOGIA;
      subCategory = 'Laptops';
      tags.push('portátil', 'computador');
    } else if (text.match(/computador|pc|desktop|torre/)) {
      mainCategory = MAIN_CATEGORIES.TECNOLOGIA;
      subCategory = 'Computadores de Escritorio';
      tags.push('computador', 'escritorio');
    } else if (text.match(/curso|aprende|aprender|clases/)) {
      mainCategory = MAIN_CATEGORIES.CURSOS;
      if (text.match(/piano|guitarra|música|musical/)) {
        subCategory = 'Música';
        tags.push('música', 'instrumento');
      } else if (text.match(/inglés|francés|alemán|idioma/)) {
        subCategory = 'Idiomas';
        tags.push('idiomas', 'lenguaje');
      } else {
        subCategory = 'Desarrollo Personal';
      }
    } else if (text.match(/megapack|pack|colección/)) {
      mainCategory = MAIN_CATEGORIES.MEGAPACKS;
      subCategory = 'Cursos Variados';
      tags.push('megapack', 'colección');
    }

    if (isAccessory) {
      parentCategory = subCategory;
      subCategory = 'Accesorios de ' + subCategory;
    }

    // Agregar tags adicionales
    if (text.match(/gaming|gamer|juegos/)) tags.push('gaming');
    if (text.match(/profesional|trabajo|oficina/)) tags.push('profesional');
    if (text.match(/estudiante|estudio/)) tags.push('estudiantes');

    return {
      mainCategory,
      subCategory,
      tags: [...new Set(tags)], // Eliminar duplicados
      isAccessory,
      parentCategory,
      confidence: 0.7,
      reasoning: 'Categorización automática por palabras clave (fallback)'
    };
  }

  /**
   * Categoriza múltiples productos en lote
   */
  static async categorizeProducts(
    products: Array<{ id: number; name: string; description?: string }>
  ): Promise<Map<number, CategorizationResult>> {
    const results = new Map<number, CategorizationResult>();

    console.log(`📦 Categorizando ${products.length} productos...`);

    for (const product of products) {
      try {
        const result = await this.categorizeProduct(product.name, product.description);
        results.set(product.id, result);
        
        console.log(`✅ ${product.name} → ${result.mainCategory} / ${result.subCategory}`);
        
        // Pequeño delay para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Error categorizando producto ${product.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Valida si una categorización es coherente
   */
  static validateCategorization(result: CategorizationResult): boolean {
    // Verificar que la categoría principal existe
    const validMainCategories = Object.values(MAIN_CATEGORIES);
    if (!validMainCategories.includes(result.mainCategory)) {
      return false;
    }

    // Verificar que tiene al menos un tag
    if (!result.tags || result.tags.length === 0) {
      return false;
    }

    // Si es accesorio, debe tener parentCategory
    if (result.isAccessory && !result.parentCategory) {
      return false;
    }

    return true;
  }
}
