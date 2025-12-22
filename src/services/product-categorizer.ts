/**
 * 🤖 Intelligent Product Categorization Service
 * 
 * Automatically categorizes products using AI analysis of:
 * - Product name
 * - Description
 * - Existing category/subcategory
 * 
 * Returns:
 * - mainCategory (e.g., "Tecnología", "Cursos", "Ropa")
 * - subCategory (e.g., "Laptops", "Accesorios", "Audio")
 * - tags (array of keywords)
 * - isAccessory (boolean)
 * - parentCategory (if accessory)
 * - confidence (0-100)
 */

import { GroqAPIRotator } from '../lib/groq-api-rotator';

export interface ProductCategorizationInput {
  name: string;
  description?: string;
  currentCategory?: string;
  currentSubcategory?: string;
  price?: number;
}

export interface ProductCategorizationResult {
  mainCategory: string;
  subCategory: string;
  tags: string[];
  isAccessory: boolean;
  parentCategory: string | null;
  confidence: number;
  reasoning: string;
}

export class ProductCategorizer {
  /**
   * Categorize a single product using AI
   */
  static async categorizeProduct(
    input: ProductCategorizationInput
  ): Promise<ProductCategorizationResult> {
    const prompt = this.buildCategorizationPrompt(input);

    try {
      // Try with Groq first
      const response = await GroqAPIRotator.makeRequest(
        [{ role: 'user', content: prompt }],
        {
          temperature: 0.2, // Low temperature for consistent categorization
          maxTokens: 300,
        }
      );

      // Parse AI response
      const result = this.parseCategorizationResponse(response);
      
      console.log(`✅ Producto categorizado: "${input.name}" → ${result.mainCategory} / ${result.subCategory}`);
      
      return result;
    } catch (error) {
      console.error('⚠️ Error en categorización con IA:', error);
      
      // Fallback to rule-based categorization
      return this.ruleBasedCategorization(input);
    }
  }

  /**
   * Categorize multiple products in batch
   */
  static async categorizeBatch(
    products: ProductCategorizationInput[],
    batchSize: number = 5
  ): Promise<ProductCategorizationResult[]> {
    const results: ProductCategorizationResult[] = [];
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      console.log(`📦 Procesando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}...`);
      
      const batchResults = await Promise.all(
        batch.map(product => this.categorizeProduct(product))
      );
      
      results.push(...batchResults);
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Build AI prompt for categorization
   */
  private static buildCategorizationPrompt(input: ProductCategorizationInput): string {
    return `Analiza este producto y categorizalo de forma inteligente:

PRODUCTO:
Nombre: "${input.name}"
${input.description ? `Descripción: "${input.description}"` : ''}
${input.currentCategory ? `Categoría actual: "${input.currentCategory}"` : ''}
${input.price ? `Precio: $${input.price}` : ''}

INSTRUCCIONES:
1. Determina la categoría principal (mainCategory):
   - Tecnología (computadores, celulares, accesorios tech)
   - Cursos (educación digital, capacitaciones)
   - Ropa (vestuario, accesorios de moda)
   - Hogar (muebles, decoración)
   - Otros

2. Determina la subcategoría (subCategory):
   - Para Tecnología: "Laptops", "Smartphones", "Tablets", "Accesorios de Computador", "Audio", "Gaming", etc.
   - Para Cursos: "Diseño", "Programación", "Idiomas", "Marketing", "Música", etc.
   - Para Ropa: "Camisetas", "Pantalones", "Zapatos", "Accesorios", etc.

3. Identifica si es un ACCESORIO (isAccessory):
   - true si es: base, soporte, funda, cargador, cable, mouse, teclado, audífonos, etc.
   - false si es un producto principal: laptop, smartphone, curso, etc.

4. Si es accesorio, identifica la categoría padre (parentCategory):
   - "Laptops" si es base/soporte/funda para portátil
   - "Smartphones" si es funda/cargador para celular
   - null si no es accesorio

5. Genera tags relevantes (máximo 5):
   - Palabras clave que describan el producto
   - Incluye variaciones y sinónimos
   - Ejemplo: ["portátil", "laptop", "asus", "gaming", "estudio"]

6. Asigna confianza (0-100):
   - 90-100: Muy claro (nombre explícito)
   - 70-89: Claro (inferible del contexto)
   - 50-69: Moderado (requiere interpretación)
   - 0-49: Bajo (ambiguo)

RESPONDE SOLO CON JSON (sin markdown):
{
  "mainCategory": "Tecnología",
  "subCategory": "Laptops",
  "tags": ["portátil", "laptop", "asus"],
  "isAccessory": false,
  "parentCategory": null,
  "confidence": 95,
  "reasoning": "Es un computador portátil de la marca Asus"
}`;
  }

  /**
   * Parse AI response into structured result
   */
  private static parseCategorizationResponse(response: string): ProductCategorizationResult {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        mainCategory: parsed.mainCategory || 'Otros',
        subCategory: parsed.subCategory || 'General',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        isAccessory: parsed.isAccessory === true,
        parentCategory: parsed.parentCategory || null,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 50,
        reasoning: parsed.reasoning || 'Categorización automática',
      };
    } catch (error) {
      console.error('⚠️ Error parseando respuesta de IA:', error);
      throw error;
    }
  }

  /**
   * Rule-based categorization fallback (when AI fails)
   */
  private static ruleBasedCategorization(
    input: ProductCategorizationInput
  ): ProductCategorizationResult {
    const nameLower = input.name.toLowerCase();
    const descLower = (input.description || '').toLowerCase();
    const text = `${nameLower} ${descLower}`;

    // Detect accessories first
    const accessoryKeywords = [
      'base', 'soporte', 'funda', 'cargador', 'cable', 'adaptador',
      'mouse', 'teclado', 'audifono', 'audífono', 'diadema',
      'airpod', 'earbud', 'parlante', 'bafle', 'hub', 'dock'
    ];
    const isAccessory = accessoryKeywords.some(keyword => text.includes(keyword));

    // Detect main category
    let mainCategory = 'Otros';
    let subCategory = 'General';
    let parentCategory: string | null = null;
    const tags: string[] = [];

    // Technology products
    if (text.includes('portátil') || text.includes('portatil') || text.includes('laptop')) {
      mainCategory = 'Tecnología';
      if (isAccessory) {
        subCategory = 'Accesorios de Computador';
        parentCategory = 'Laptops';
      } else {
        subCategory = 'Laptops';
      }
      tags.push('portátil', 'laptop', 'computador');
    } else if (text.includes('celular') || text.includes('smartphone') || text.includes('iphone') || text.includes('samsung')) {
      mainCategory = 'Tecnología';
      subCategory = isAccessory ? 'Accesorios de Celular' : 'Smartphones';
      if (isAccessory) parentCategory = 'Smartphones';
      tags.push('celular', 'smartphone');
    } else if (text.includes('curso') || text.includes('capacitación') || text.includes('megapack')) {
      mainCategory = 'Cursos';
      subCategory = 'General';
      tags.push('curso', 'educación');
      
      // Detect course type
      if (text.includes('diseño')) {
        subCategory = 'Diseño';
        tags.push('diseño');
      } else if (text.includes('idioma') || text.includes('inglés') || text.includes('ingles')) {
        subCategory = 'Idiomas';
        tags.push('idiomas');
      } else if (text.includes('programación') || text.includes('programacion')) {
        subCategory = 'Programación';
        tags.push('programación');
      }
    }

    return {
      mainCategory,
      subCategory,
      tags,
      isAccessory,
      parentCategory,
      confidence: 60, // Lower confidence for rule-based
      reasoning: 'Categorización basada en reglas (fallback)',
    };
  }

  /**
   * Validate categorization result
   */
  static validateCategorization(result: ProductCategorizationResult): boolean {
    return (
      result.mainCategory.length > 0 &&
      result.subCategory.length > 0 &&
      result.confidence >= 0 &&
      result.confidence <= 100 &&
      (!result.isAccessory || result.parentCategory !== null)
    );
  }
}
