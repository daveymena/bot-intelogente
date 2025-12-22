/**
 * 📚 SERVICIO DE DOCUMENTACIÓN DE PRODUCTOS
 * Genera documentación completa de TODOS los productos para la IA
 * Asegura que la IA tenga acceso a toda la información disponible
 */

import { db } from './db'

export class ProductDocumentationService {
  /**
   * Generar documentación completa de TODOS los productos
   * Esta documentación se pasa a la IA para que tenga contexto completo
   */
  static async generateFullProductDocumentation(userId: string): Promise<string> {
    try {
      const products = await db.product.findMany({
        where: { userId, status: 'AVAILABLE' },
        orderBy: { name: 'asc' }
      })

      if (products.length === 0) {
        return `# 📦 CATÁLOGO DE PRODUCTOS\n\nNo hay productos disponibles actualmente.`
      }

      let documentation = `# 📦 CATÁLOGO COMPLETO DE PRODUCTOS\n\n`
      documentation += `Total de productos disponibles: ${products.length}\n\n`
      documentation += `---\n\n`

      products.forEach((product, index) => {
        documentation += `## ${index + 1}. ${product.name}\n\n`
        documentation += `- **ID:** ${product.id}\n`
        documentation += `- **Precio:** $${product.price.toLocaleString('es-CO')} COP\n`
        documentation += `- **Categoría:** ${product.category}\n`

        if (product.description) {
          documentation += `- **Descripción:**\n  ${product.description.replace(/\n/g, '\n  ')}\n`
        }

        if (product.stock && product.stock > 0) {
          documentation += `- **Stock:** ${product.stock} unidades disponibles\n`
        }

        // Extraer métodos de pago de los tags
        try {
          const tags = product.tags ? JSON.parse(product.tags) : []
          const paymentMethods: string[] = []
          const paymentLinks: { [key: string]: string } = {}

          tags.forEach((tag: string) => {
            if (typeof tag === 'string') {
              if (tag.startsWith('hotmart:')) {
                paymentMethods.push('Hotmart (pago directo)')
                paymentLinks['Hotmart'] = tag.replace('hotmart:', '')
              } else if (tag.startsWith('mercadopago:')) {
                paymentMethods.push('MercadoPago')
                paymentLinks['MercadoPago'] = tag.replace('mercadopago:', '')
              } else if (tag.startsWith('paypal:')) {
                paymentMethods.push('PayPal')
                paymentLinks['PayPal'] = tag.replace('paypal:', '')
              } else if (tag.startsWith('nequi:')) {
                paymentMethods.push('Nequi/Daviplata')
                paymentLinks['Nequi'] = tag.replace('nequi:', '')
              } else if (tag.startsWith('payco:')) {
                paymentMethods.push('Tarjeta de crédito (ePayco)')
                paymentLinks['ePayco'] = tag.replace('payco:', '')
              } else if (tag.startsWith('contacto:')) {
                paymentMethods.push('Contacto directo')
                paymentLinks['Contacto'] = tag.replace('contacto:', '')
              }
            }
          })

          if (paymentMethods.length > 0) {
            documentation += `- **Métodos de pago disponibles:**\n`
            paymentMethods.forEach(method => {
              documentation += `  • ${method}\n`
            })

            // Agregar links si existen
            if (Object.keys(paymentLinks).length > 0) {
              documentation += `- **Enlaces de pago:**\n`
              Object.entries(paymentLinks).forEach(([method, link]) => {
                documentation += `  • ${method}: ${link}\n`
              })
            }
          } else if (product.category === 'PHYSICAL') {
            // Productos físicos siempre tienen contacto directo
            documentation += `- **Métodos de pago disponibles:**\n`
            documentation += `  • Efectivo\n`
            documentation += `  • Transferencia bancaria\n`
            documentation += `  • Nequi/Daviplata\n`
            documentation += `  • Tarjeta de crédito\n`
            documentation += `- **Contacto:** +57 304 274 8687\n`
            documentation += `- **Ubicación:** Centro Comercial El Diamante 2, San Nicolás, Cali\n`
          }
        } catch (e) {
          console.error(`[Product Docs] Error parseando tags del producto ${product.id}:`, e)
        }

        // Extraer imágenes
        try {
          const images = product.images ? JSON.parse(product.images) : []
          if (images.length > 0) {
            documentation += `- **Imágenes:** ${images.length} foto(s) disponible(s)\n`
          }
        } catch (e) {
          console.error(`[Product Docs] Error parseando imágenes del producto ${product.id}:`, e)
        }

        // Información adicional según categoría
        if (product.category === 'DIGITAL') {
          documentation += `- **Tipo:** Producto digital (acceso inmediato después del pago)\n`
        } else if (product.category === 'PHYSICAL') {
          documentation += `- **Tipo:** Producto físico (requiere entrega o recogida)\n`
        }

        documentation += `\n---\n\n`
      })

      return documentation
    } catch (error) {
      console.error('[Product Docs] Error generando documentación:', error)
      return `# 📦 CATÁLOGO DE PRODUCTOS\n\nError al cargar productos. Por favor, contacta al administrador.`
    }
  }

  /**
   * Generar resumen ejecutivo para la IA
   * Información condensada para contexto rápido
   */
  static async generateExecutiveSummary(userId: string): Promise<string> {
    try {
      const products = await db.product.findMany({
        where: { userId, status: 'AVAILABLE' }
      })

      if (products.length === 0) {
        return `📊 RESUMEN: No hay productos disponibles.`
      }

      const categories = new Map<string, number>()
      const priceRanges = {
        low: 0,    // < 100,000
        medium: 0, // 100,000 - 1,000,000
        high: 0    // > 1,000,000
      }
      let totalValue = 0
      let minPrice = Infinity
      let maxPrice = 0

      products.forEach(p => {
        // Contar por categoría
        categories.set(p.category, (categories.get(p.category) || 0) + 1)

        // Calcular rangos de precio
        totalValue += p.price
        if (p.price < minPrice) minPrice = p.price
        if (p.price > maxPrice) maxPrice = p.price

        if (p.price < 100000) {
          priceRanges.low++
        } else if (p.price <= 1000000) {
          priceRanges.medium++
        } else {
          priceRanges.high++
        }
      })

      let summary = `📊 RESUMEN EJECUTIVO DEL CATÁLOGO:\n\n`
      summary += `- **Total de productos:** ${products.length}\n`
      summary += `- **Valor total del inventario:** $${totalValue.toLocaleString('es-CO')} COP\n`
      summary += `- **Rango de precios:** $${minPrice.toLocaleString('es-CO')} - $${maxPrice.toLocaleString('es-CO')} COP\n\n`

      summary += `**Distribución por categoría:**\n`
      categories.forEach((count, category) => {
        const percentage = ((count / products.length) * 100).toFixed(0)
        summary += `  • ${category}: ${count} producto(s) (${percentage}%)\n`
      })

      summary += `\n**Distribución por precio:**\n`
      summary += `  • Económicos (< $100K): ${priceRanges.low} producto(s)\n`
      summary += `  • Medios ($100K - $1M): ${priceRanges.medium} producto(s)\n`
      summary += `  • Premium (> $1M): ${priceRanges.high} producto(s)\n`

      return summary
    } catch (error) {
      console.error('[Product Docs] Error generando resumen:', error)
      return `📊 RESUMEN: Error al cargar información.`
    }
  }

  /**
   * Generar lista rápida de productos (solo nombres y precios)
   * Para respuestas rápidas cuando el cliente pregunta "qué productos tienes"
   */
  static async generateQuickList(userId: string): Promise<string> {
    try {
      const products = await db.product.findMany({
        where: { userId, status: 'AVAILABLE' },
        orderBy: { price: 'asc' }
      })

      if (products.length === 0) {
        return `No hay productos disponibles actualmente.`
      }

      let list = `📦 **PRODUCTOS DISPONIBLES:**\n\n`

      products.forEach((product, index) => {
        const emoji = this.getProductEmoji(product)
        list += `${index + 1}. ${emoji} **${product.name}**\n`
        list += `   💰 $${product.price.toLocaleString('es-CO')} COP\n`
        if (product.stock && product.stock > 0) {
          list += `   📦 ${product.stock} disponible(s)\n`
        }
        list += `\n`
      })

      list += `¿Cuál te interesa?`

      return list
    } catch (error) {
      console.error('[Product Docs] Error generando lista rápida:', error)
      return `Error al cargar productos.`
    }
  }

  /**
   * Obtener emoji según el tipo de producto
   */
  private static getProductEmoji(product: any): string {
    const name = product.name.toLowerCase()
    const desc = (product.description || '').toLowerCase()

    if (name.includes('piano') || desc.includes('piano')) return '🎹'
    if (name.includes('laptop') || name.includes('portatil') || name.includes('macbook')) return '💻'
    if (name.includes('moto') || name.includes('pulsar') || name.includes('bajaj')) return '🏍️'
    if (name.includes('curso') || name.includes('mega pack') || name.includes('megapack')) return '📚'
    if (name.includes('phone') || name.includes('celular')) return '📱'
    if (name.includes('tablet')) return '📱'
    if (name.includes('watch') || name.includes('reloj')) return '⌚'
    if (product.category === 'DIGITAL') return '💾'
    if (product.category === 'PHYSICAL') return '📦'

    return '🎯'
  }

  /**
   * Buscar productos por categoría
   */
  static async getProductsByCategory(userId: string, category: string): Promise<any[]> {
    try {
      return await db.product.findMany({
        where: {
          userId,
          status: 'AVAILABLE',
          category: category.toUpperCase() as any
        },
        orderBy: { price: 'asc' }
      })
    } catch (error) {
      console.error('[Product Docs] Error buscando por categoría:', error)
      return []
    }
  }

  /**
   * Obtener estadísticas del catálogo
   */
  static async getCatalogStats(userId: string): Promise<{
    total: number
    byCategory: Map<string, number>
    avgPrice: number
    totalValue: number
  }> {
    try {
      const products = await db.product.findMany({
        where: { userId, status: 'AVAILABLE' }
      })

      const byCategory = new Map<string, number>()
      let totalValue = 0

      products.forEach(p => {
        byCategory.set(p.category, (byCategory.get(p.category) || 0) + 1)
        totalValue += p.price
      })

      return {
        total: products.length,
        byCategory,
        avgPrice: products.length > 0 ? totalValue / products.length : 0,
        totalValue
      }
    } catch (error) {
      console.error('[Product Docs] Error obteniendo estadísticas:', error)
      return {
        total: 0,
        byCategory: new Map(),
        avgPrice: 0,
        totalValue: 0
      }
    }
  }
}
