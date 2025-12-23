/**
 * 📁 CategoryAutoGenerator
 * 
 * Genera y organiza categorías automáticamente basándose en los items
 * agregados por el tenant.
 */

import { prisma } from '@/lib/db'
import Groq from 'groq-sdk'

// Sugerencia de categoría
export interface CategorySuggestion {
  category: string
  subcategory?: string
  confidence: number
  isNew: boolean
  suggestedIcon?: string
  keywords: string[]
}

// Categoría
export interface Category {
  id: string
  userId: string
  name: string
  slug: string
  description?: string
  parentId?: string
  icon?: string
  order: number
  itemType: 'PRODUCT' | 'SERVICE' | 'FOOD' | 'MIXED'
  keywords: string[]
  itemCount: number
  flowType?: string
  requiresBooking?: boolean
  requiresLocation?: boolean
}

// Item para análisis
interface ItemForAnalysis {
  name: string
  description?: string | null
  price: number
  category?: string
}

// Mapeo de palabras clave a categorías predefinidas
const CATEGORY_KEYWORDS: Record<string, { keywords: string[]; icon: string; itemType: string }> = {
  // Tecnología
  'Computadores': { keywords: ['laptop', 'portatil', 'computador', 'pc', 'notebook', 'desktop'], icon: '💻', itemType: 'PRODUCT' },
  'Celulares': { keywords: ['celular', 'smartphone', 'telefono', 'movil', 'iphone', 'samsung', 'xiaomi'], icon: '📱', itemType: 'PRODUCT' },
  'Tablets': { keywords: ['tablet', 'ipad', 'tab'], icon: '📱', itemType: 'PRODUCT' },
  'Accesorios Tech': { keywords: ['audifonos', 'auriculares', 'cargador', 'cable', 'funda', 'protector', 'mouse', 'teclado'], icon: '🎧', itemType: 'PRODUCT' },
  'Impresoras': { keywords: ['impresora', 'scanner', 'multifuncional', 'tinta', 'toner'], icon: '🖨️', itemType: 'PRODUCT' },
  
  // Vehículos
  'Motos': { keywords: ['moto', 'motocicleta', 'scooter', 'ciclomotor'], icon: '🏍️', itemType: 'PRODUCT' },
  'Bicicletas': { keywords: ['bicicleta', 'bici', 'cicla'], icon: '🚲', itemType: 'PRODUCT' },
  
  // Cursos y Digital
  'Cursos Online': { keywords: ['curso', 'clase', 'leccion', 'tutorial', 'formacion', 'capacitacion'], icon: '📚', itemType: 'PRODUCT' },
  'Megapacks': { keywords: ['megapack', 'pack', 'bundle', 'coleccion', 'paquete'], icon: '📦', itemType: 'PRODUCT' },
  'Software': { keywords: ['software', 'programa', 'licencia', 'app', 'aplicacion'], icon: '💿', itemType: 'PRODUCT' },
  
  // Servicios
  'Consultoría': { keywords: ['consultoria', 'asesoria', 'coaching', 'mentoria'], icon: '💼', itemType: 'SERVICE' },
  'Salud': { keywords: ['medico', 'doctor', 'clinica', 'consulta', 'terapia', 'tratamiento'], icon: '🏥', itemType: 'SERVICE' },
  'Belleza': { keywords: ['peluqueria', 'salon', 'spa', 'masaje', 'manicure', 'estetica'], icon: '💅', itemType: 'SERVICE' },
  'Reparaciones': { keywords: ['reparacion', 'arreglo', 'mantenimiento', 'servicio tecnico'], icon: '🔧', itemType: 'SERVICE' },
  
  // Comida
  'Comida Rápida': { keywords: ['hamburguesa', 'pizza', 'hot dog', 'papas', 'combo'], icon: '🍔', itemType: 'FOOD' },
  'Restaurante': { keywords: ['almuerzo', 'cena', 'plato', 'menu', 'entrada', 'postre'], icon: '🍽️', itemType: 'FOOD' },
  'Cafetería': { keywords: ['cafe', 'cappuccino', 'latte', 'pastel', 'torta'], icon: '☕', itemType: 'FOOD' },
  'Panadería': { keywords: ['pan', 'panaderia', 'croissant', 'empanada'], icon: '🥐', itemType: 'FOOD' },
  
  // Ropa y Moda
  'Ropa': { keywords: ['camisa', 'pantalon', 'vestido', 'falda', 'chaqueta', 'camiseta'], icon: '👕', itemType: 'PRODUCT' },
  'Calzado': { keywords: ['zapatos', 'tenis', 'botas', 'sandalias'], icon: '👟', itemType: 'PRODUCT' },
  'Accesorios Moda': { keywords: ['bolso', 'cartera', 'reloj', 'gafas', 'collar', 'anillo'], icon: '👜', itemType: 'PRODUCT' },
  
  // Hogar
  'Muebles': { keywords: ['mueble', 'sofa', 'mesa', 'silla', 'cama', 'escritorio'], icon: '🛋️', itemType: 'PRODUCT' },
  'Electrodomésticos': { keywords: ['nevera', 'lavadora', 'microondas', 'licuadora', 'electrodomestico'], icon: '🏠', itemType: 'PRODUCT' },
  'Decoración': { keywords: ['decoracion', 'lampara', 'cortina', 'alfombra', 'cuadro'], icon: '🖼️', itemType: 'PRODUCT' }
}

export class CategoryAutoGenerator {
  
  /**
   * Detecta la categoría para un nuevo item
   */
  static async detectCategory(
    item: ItemForAnalysis, 
    existingCategories: Category[]
  ): Promise<CategorySuggestion> {
    const text = this.normalizeText(`${item.name} ${item.description || ''}`)
    
    // Primero intentar con categorías existentes del usuario
    for (const category of existingCategories) {
      const categoryKeywords = category.keywords || []
      for (const keyword of categoryKeywords) {
        if (text.includes(keyword.toLowerCase())) {
          return {
            category: category.name,
            confidence: 0.9,
            isNew: false,
            suggestedIcon: category.icon || '📦',
            keywords: categoryKeywords
          }
        }
      }
    }
    
    // Luego intentar con categorías predefinidas
    let bestMatch: { name: string; score: number; data: typeof CATEGORY_KEYWORDS[string] } | null = null
    
    for (const [categoryName, data] of Object.entries(CATEGORY_KEYWORDS)) {
      let score = 0
      for (const keyword of data.keywords) {
        if (text.includes(keyword)) {
          score++
        }
      }
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { name: categoryName, score, data }
      }
    }
    
    if (bestMatch && bestMatch.score >= 1) {
      return {
        category: bestMatch.name,
        confidence: Math.min(bestMatch.score / 3, 1),
        isNew: !existingCategories.some(c => c.name === bestMatch!.name),
        suggestedIcon: bestMatch.data.icon,
        keywords: bestMatch.data.keywords
      }
    }
    
    // Si no hay match, usar IA para sugerir
    return this.detectWithAI(item)
  }
  
  /**
   * Usa IA para detectar categoría cuando no hay match
   */
  private static async detectWithAI(item: ItemForAnalysis): Promise<CategorySuggestion> {
    try {
      const groqApiKey = process.env.GROQ_API_KEY
      if (!groqApiKey) {
        return this.getDefaultSuggestion(item)
      }
      
      const groq = new Groq({ apiKey: groqApiKey })
      
      const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{
          role: 'user',
          content: `Analiza este producto/servicio y sugiere una categoría apropiada en español.

Producto: ${item.name}
Descripción: ${item.description || 'Sin descripción'}
Precio: ${item.price}

Responde SOLO con un JSON así:
{
  "category": "Nombre de categoría",
  "icon": "emoji apropiado",
  "keywords": ["palabra1", "palabra2", "palabra3"],
  "itemType": "PRODUCT" o "SERVICE" o "FOOD"
}`
        }],
        temperature: 0.3,
        max_tokens: 150
      })
      
      const content = response.choices[0]?.message?.content || ''
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          category: parsed.category || 'General',
          confidence: 0.7,
          isNew: true,
          suggestedIcon: parsed.icon || '📦',
          keywords: parsed.keywords || []
        }
      }
    } catch (error) {
      console.error('Error detectando categoría con IA:', error)
    }
    
    return this.getDefaultSuggestion(item)
  }
  
  /**
   * Sugerencia por defecto
   */
  private static getDefaultSuggestion(item: ItemForAnalysis): CategorySuggestion {
    return {
      category: 'General',
      confidence: 0.3,
      isNew: true,
      suggestedIcon: '📦',
      keywords: this.extractKeywords(item.name)
    }
  }
  
  /**
   * Genera categorías automáticamente para todos los items
   */
  static async generateCategories(items: ItemForAnalysis[]): Promise<Category[]> {
    const categoryMap = new Map<string, {
      items: ItemForAnalysis[]
      icon: string
      itemType: string
      keywords: Set<string>
    }>()
    
    for (const item of items) {
      const suggestion = await this.detectCategory(item, [])
      
      if (!categoryMap.has(suggestion.category)) {
        categoryMap.set(suggestion.category, {
          items: [],
          icon: suggestion.suggestedIcon || '📦',
          itemType: 'PRODUCT',
          keywords: new Set(suggestion.keywords)
        })
      }
      
      const cat = categoryMap.get(suggestion.category)!
      cat.items.push(item)
      suggestion.keywords.forEach(k => cat.keywords.add(k))
    }
    
    // Convertir a array de categorías
    const categories: Category[] = []
    let order = 0
    
    for (const [name, data] of categoryMap) {
      categories.push({
        id: this.generateSlug(name),
        userId: '',
        name,
        slug: this.generateSlug(name),
        icon: data.icon,
        order: order++,
        itemType: data.itemType as any,
        keywords: Array.from(data.keywords),
        itemCount: data.items.length
      })
    }
    
    return categories
  }
  
  /**
   * Guarda categorías en la base de datos
   */
  static async saveCategories(userId: string, categories: Category[]): Promise<void> {
    for (const category of categories) {
      await prisma.category.upsert({
        where: {
          userId_slug: {
            userId,
            slug: category.slug
          }
        },
        create: {
          userId,
          name: category.name,
          slug: category.slug,
          icon: category.icon,
          order: category.order,
          itemType: category.itemType,
          keywords: JSON.stringify(category.keywords),
          itemCount: category.itemCount,
          isAutoGenerated: true,
          generatedBy: 'AI'
        },
        update: {
          itemCount: category.itemCount,
          keywords: JSON.stringify(category.keywords)
        }
      })
    }
  }
  
  /**
   * Reorganiza categorías cuando hay cambios significativos
   */
  static async reorganizeCategories(userId: string): Promise<Category[]> {
    // Obtener todos los productos del usuario
    const products = await prisma.product.findMany({
      where: { userId },
      select: { name: true, description: true, price: true, category: true }
    })
    
    // Generar nuevas categorías
    const categories = await this.generateCategories(products)
    
    // Guardar
    await this.saveCategories(userId, categories.map(c => ({ ...c, userId })))
    
    return categories
  }
  
  /**
   * Sugiere subcategorías basadas en items similares
   */
  static async suggestSubcategories(
    categoryName: string, 
    items: ItemForAnalysis[]
  ): Promise<string[]> {
    if (items.length < 5) return []
    
    // Agrupar por palabras comunes
    const wordGroups = new Map<string, number>()
    
    for (const item of items) {
      const words = this.extractKeywords(item.name)
      for (const word of words) {
        wordGroups.set(word, (wordGroups.get(word) || 0) + 1)
      }
    }
    
    // Filtrar palabras que aparecen en al menos 30% de items
    const threshold = items.length * 0.3
    const subcategories: string[] = []
    
    for (const [word, count] of wordGroups) {
      if (count >= threshold && count < items.length * 0.9) {
        subcategories.push(this.capitalizeFirst(word))
      }
    }
    
    return subcategories.slice(0, 5)
  }
  
  /**
   * Obtiene categorías de un usuario
   */
  static async getUserCategories(userId: string): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { order: 'asc' }
    })
    
    return categories.map(c => ({
      ...c,
      keywords: c.keywords ? JSON.parse(c.keywords) : [],
      description: c.description || undefined,
      parentId: c.parentId || undefined,
      icon: c.icon || undefined,
      flowType: c.flowType || undefined
    }))
  }
  
  /**
   * Normaliza texto
   */
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .trim()
  }
  
  /**
   * Extrae palabras clave
   */
  private static extractKeywords(text: string): string[] {
    const stopWords = ['de', 'la', 'el', 'en', 'con', 'para', 'por', 'un', 'una', 'los', 'las', 'del', 'al']
    return this.normalizeText(text)
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.includes(w))
  }
  
  /**
   * Genera slug
   */
  private static generateSlug(name: string): string {
    return this.normalizeText(name)
      .replace(/\s+/g, '-')
      .substring(0, 50)
  }
  
  /**
   * Capitaliza primera letra
   */
  private static capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }
}

export default CategoryAutoGenerator
