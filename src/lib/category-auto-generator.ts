/**
 * CategoryAutoGenerator
 * Servicio para auto-detectar y generar categorías de productos usando IA
 */

interface ProductData {
  name: string
  description?: string
  price: number
}

interface CategorySuggestion {
  category: 'PHYSICAL' | 'DIGITAL' | 'SERVICE'
  confidence: number
  reasoning: string
  suggestedTags?: string[]
}

export class CategoryAutoGenerator {
  /**
   * Detecta la categoría de un producto basándose en su nombre, descripción y precio
   */
  static async detectCategory(
    product: ProductData,
    existingCategories: string[] = []
  ): Promise<CategorySuggestion> {
    const { name, description, price } = product
    const text = `${name} ${description || ''}`.toLowerCase()

    // Palabras clave para productos físicos
    const physicalKeywords = [
      'laptop', 'computador', 'pc', 'moto', 'motocicleta', 'bicicleta',
      'celular', 'teléfono', 'tablet', 'auricular', 'mouse', 'teclado',
      'monitor', 'impresora', 'cámara', 'televisor', 'consola',
      'ropa', 'zapatos', 'accesorio', 'reloj', 'joya',
      'mueble', 'electrodoméstico', 'herramienta', 'juguete',
      'libro físico', 'revista', 'producto', 'artículo'
    ]

    // Palabras clave para productos digitales
    const digitalKeywords = [
      'curso', 'ebook', 'pdf', 'video', 'tutorial', 'capacitación',
      'software', 'app', 'aplicación', 'licencia', 'suscripción',
      'plantilla', 'template', 'pack', 'megapack', 'bundle',
      'descarga', 'digital', 'online', 'virtual', 'acceso',
      'membresía', 'webinar', 'masterclass', 'guía digital'
    ]

    // Palabras clave para servicios
    const serviceKeywords = [
      'servicio', 'asesoría', 'consultoría', 'instalación',
      'reparación', 'mantenimiento', 'soporte', 'asistencia',
      'diseño', 'desarrollo', 'programación', 'marketing',
      'publicidad', 'fotografía', 'video', 'edición',
      'limpieza', 'transporte', 'delivery', 'envío',
      'terapia', 'masaje', 'entrenamiento', 'coaching'
    ]

    // Contar coincidencias
    let physicalScore = 0
    let digitalScore = 0
    let serviceScore = 0

    physicalKeywords.forEach(keyword => {
      if (text.includes(keyword)) physicalScore++
    })

    digitalKeywords.forEach(keyword => {
      if (text.includes(keyword)) digitalScore++
    })

    serviceKeywords.forEach(keyword => {
      if (text.includes(keyword)) serviceScore++
    })

    // Heurísticas adicionales basadas en precio
    if (price > 500000) {
      physicalScore += 0.5 // Productos físicos tienden a ser más caros
    }
    if (price < 100000) {
      digitalScore += 0.5 // Productos digitales tienden a ser más baratos
    }

    // Determinar categoría ganadora
    const maxScore = Math.max(physicalScore, digitalScore, serviceScore)
    const totalScore = physicalScore + digitalScore + serviceScore

    let category: 'PHYSICAL' | 'DIGITAL' | 'SERVICE'
    let reasoning: string
    let confidence: number

    if (maxScore === 0) {
      // Sin coincidencias claras, usar heurística de precio
      if (price > 300000) {
        category = 'PHYSICAL'
        reasoning = 'Clasificado como físico por precio alto sin palabras clave específicas'
        confidence = 0.4
      } else {
        category = 'DIGITAL'
        reasoning = 'Clasificado como digital por defecto sin palabras clave específicas'
        confidence = 0.3
      }
    } else {
      confidence = maxScore / (totalScore || 1)

      if (physicalScore === maxScore) {
        category = 'PHYSICAL'
        reasoning = `Detectadas ${physicalScore} palabras clave de productos físicos`
      } else if (digitalScore === maxScore) {
        category = 'DIGITAL'
        reasoning = `Detectadas ${digitalScore} palabras clave de productos digitales`
      } else {
        category = 'SERVICE'
        reasoning = `Detectadas ${serviceScore} palabras clave de servicios`
      }
    }

    // Generar tags sugeridos
    const suggestedTags = this.generateTags(text, category)

    return {
      category,
      confidence: Math.min(confidence, 1),
      reasoning,
      suggestedTags
    }
  }

  /**
   * Genera categorías automáticas para múltiples productos
   */
  static async generateCategories(products: ProductData[]): Promise<Map<string, CategorySuggestion>> {
    const results = new Map<string, CategorySuggestion>()

    for (const product of products) {
      const suggestion = await this.detectCategory(product)
      results.set(product.name, suggestion)
    }

    return results
  }

  /**
   * Genera tags sugeridos basados en el texto y categoría
   */
  private static generateTags(text: string, category: string): string[] {
    const tags: string[] = []

    // Tags por categoría
    if (category === 'PHYSICAL') {
      if (text.includes('laptop') || text.includes('computador')) tags.push('tecnología', 'computación')
      if (text.includes('moto')) tags.push('vehículos', 'transporte')
      if (text.includes('celular') || text.includes('teléfono')) tags.push('tecnología', 'móviles')
    } else if (category === 'DIGITAL') {
      if (text.includes('curso')) tags.push('educación', 'aprendizaje')
      if (text.includes('ebook') || text.includes('pdf')) tags.push('lectura', 'digital')
      if (text.includes('software')) tags.push('tecnología', 'herramientas')
    } else if (category === 'SERVICE') {
      if (text.includes('asesoría') || text.includes('consultoría')) tags.push('profesional', 'experto')
      if (text.includes('reparación')) tags.push('mantenimiento', 'técnico')
    }

    // Tags generales
    if (text.includes('premium') || text.includes('pro')) tags.push('premium')
    if (text.includes('básico') || text.includes('starter')) tags.push('básico')
    if (text.includes('avanzado')) tags.push('avanzado')

    return [...new Set(tags)] // Eliminar duplicados
  }
}
