/**
 * 🔍 Servicio de Búsqueda por Categorías
 * Facilita encontrar productos usando el sistema de categorías estructurado
 */

import { PrismaClient } from '@prisma/client'
import { findCategoryByKeywords, generateCategoriesMessage, generateSubcategoriesMessage, PRODUCT_CATEGORIES } from './product-categories'

const prisma = new PrismaClient()

export class CategorySearchService {
  /**
   * Buscar productos por categoría y subcategoría
   */
  static async searchByCategory(
    query: string,
    userId: string
  ): Promise<{
    products: any[]
    category: string | null
    subcategory: string | null
    message: string
  }> {
    try {
      // Detectar categoría y subcategoría
      const { category, subcategory } = findCategoryByKeywords(query)
      
      if (!category) {
        // No se encontró categoría, mostrar todas las disponibles
        return {
          products: [],
          category: null,
          subcategory: null,
          message: generateCategoriesMessage()
        }
      }
      
      console.log(`🏷️ [Category Search] Categoría: ${category.name}, Subcategoría: ${subcategory?.name || 'Todas'}`)
      
      // Construir filtros de búsqueda
      const searchTerms: string[] = []
      
      if (subcategory) {
        // Buscar por subcategoría específica
        searchTerms.push(...subcategory.keywords)
      } else {
        // Buscar por toda la categoría
        searchTerms.push(...category.keywords)
        category.subcategories.forEach(sub => {
          searchTerms.push(...sub.keywords)
        })
      }
      
      // Buscar productos
      const products = await prisma.product.findMany({
        where: {
          userId,
          status: 'AVAILABLE',
          OR: searchTerms.map(term => ({
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { description: { contains: term, mode: 'insensitive' } },
              { subcategory: { contains: term, mode: 'insensitive' } },
              { customCategory: { contains: term, mode: 'insensitive' } }
            ]
          }))
        },
        orderBy: [
          { searchPriority: 'desc' },
          { price: 'asc' }
        ],
        take: 20
      })
      
      console.log(`✅ [Category Search] Encontrados ${products.length} productos`)
      
      // Generar mensaje
      let message = ''
      
      if (products.length === 0) {
        message = `${category.emoji} *${category.name}*\n\n`
        if (subcategory) {
          message += `${subcategory.emoji} ${subcategory.name}\n\n`
        }
        message += '❌ No hay productos disponibles en esta categoría por el momento.\n\n'
        message += '💬 ¿Te gustaría ver otra categoría?'
      } else {
        message = `${category.emoji} *${category.name.toUpperCase()}*\n`
        if (subcategory) {
          message += `${subcategory.emoji} ${subcategory.name}\n`
        }
        message += `\n✅ Encontré ${products.length} producto${products.length > 1 ? 's' : ''} disponible${products.length > 1 ? 's' : ''}:\n\n`
        
        // Listar productos
        products.slice(0, 10).forEach((product, index) => {
          const emoji = this.getProductEmoji(product)
          const price = `$${product.price.toLocaleString('es-CO')} COP`
          message += `${index + 1}. ${emoji} *${product.name}*\n`
          message += `   💰 ${price}\n`
          if (product.stock > 0) {
            message += `   ✅ ${product.stock} disponible${product.stock > 1 ? 's' : ''}\n`
          }
          message += '\n'
        })
        
        if (products.length > 10) {
          message += `_...y ${products.length - 10} más_\n\n`
        }
        
        message += '💬 Escribe el número o nombre del producto que te interesa'
      }
      
      return {
        products,
        category: category.id,
        subcategory: subcategory?.id || null,
        message
      }
      
    } catch (error) {
      console.error('❌ [Category Search] Error:', error)
      return {
        products: [],
        category: null,
        subcategory: null,
        message: '❌ Error buscando productos. Por favor intenta de nuevo.'
      }
    }
  }
  
  /**
   * Mostrar todas las categorías disponibles
   */
  static showAllCategories(): string {
    return generateCategoriesMessage()
  }
  
  /**
   * Mostrar subcategorías de una categoría
   */
  static showSubcategories(categoryId: string): string {
    return generateSubcategoriesMessage(categoryId)
  }
  
  /**
   * Detectar si el usuario está pidiendo ver categorías
   */
  static isAskingForCategories(query: string): boolean {
    const queryLower = query.toLowerCase()
    const triggers = [
      'categorias',
      'categorías',
      'que tienen',
      'qué tienen',
      'que venden',
      'qué venden',
      'que productos',
      'qué productos',
      'mostrar todo',
      'ver todo',
      'catalogo',
      'catálogo',
      'menu',
      'menú'
    ]
    
    return triggers.some(trigger => queryLower.includes(trigger))
  }
  
  /**
   * Obtener emoji del producto
   */
  private static getProductEmoji(product: any): string {
    const name = product.name.toLowerCase()
    
    // Computadores
    if (name.includes('portatil') || name.includes('laptop')) return '💻'
    if (name.includes('escritorio') || name.includes('desktop')) return '🖥️'
    if (name.includes('gaming') || name.includes('gamer')) return '🎮'
    
    // Periféricos
    if (name.includes('monitor') || name.includes('pantalla')) return '🖥️'
    if (name.includes('teclado')) return '⌨️'
    if (name.includes('mouse') || name.includes('ratón')) return '🖱️'
    if (name.includes('audifono') || name.includes('headphone')) return '🎧'
    if (name.includes('parlante') || name.includes('speaker')) return '🔊'
    if (name.includes('microfono')) return '🎤'
    
    // Otros
    if (name.includes('impresora')) return '🖨️'
    if (name.includes('camara')) return '📷'
    if (name.includes('celular') || name.includes('telefono')) return '📱'
    if (name.includes('moto')) return '🏍️'
    if (name.includes('bicicleta')) return '🚴'
    
    // Digitales
    if (name.includes('curso')) return '📚'
    if (name.includes('megapack') || name.includes('mega pack')) return '📦'
    
    // Default
    if (product.category === 'DIGITAL') return '💾'
    if (product.category === 'PHYSICAL') return '📦'
    return '🛍️'
  }
  
  /**
   * Actualizar subcategoría de productos automáticamente
   */
  static async autoAssignSubcategories(userId: string): Promise<number> {
    try {
      console.log('🏷️ [Category Search] Asignando subcategorías automáticamente...')
      
      const products = await prisma.product.findMany({
        where: { userId }
      })
      
      let updated = 0
      
      for (const product of products) {
        const { category, subcategory } = findCategoryByKeywords(product.name + ' ' + product.description)
        
        if (subcategory) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              subcategory: subcategory.name,
              customCategory: category?.name
            }
          })
          updated++
        }
      }
      
      console.log(`✅ [Category Search] ${updated} productos actualizados con subcategorías`)
      return updated
      
    } catch (error) {
      console.error('❌ [Category Search] Error asignando subcategorías:', error)
      return 0
    }
  }
}
