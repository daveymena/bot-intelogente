/**
 * 📱 FORMATEADOR DE RESPUESTAS PARA WHATSAPP
 * Optimiza las respuestas para que sean visuales, concisas y fáciles de leer
 */

export interface ProductInfo {
  name: string
  price: number
  currency: string
  specs?: {
    processor?: string
    ram?: string
    storage?: string
    screen?: string
    [key: string]: string | undefined
  }
}

export class WhatsAppResponseFormatter {
  /**
   * Formatear lista de productos de forma visual y concisa
   */
  static formatProductList(products: ProductInfo[], category: string = 'Productos'): string {
    if (products.length === 0) {
      return '❌ No hay productos disponibles en este momento.'
    }

    let response = `💻 *${category} Disponibles*\n\n`
    response += '¡Claro que sí! 😎 Tenemos opciones para diferentes presupuestos 👇\n\n'

    products.forEach((product, index) => {
      // Emoji según categoría
      const emoji = this.getCategoryEmoji(product.name)
      
      // Nombre corto (máximo 40 caracteres)
      const shortName = this.shortenProductName(product.name)
      
      response += `🔹 *${shortName}*\n`
      
      // Specs en una línea con emojis
      if (product.specs) {
        const specsLine = this.formatSpecsInline(product.specs)
        if (specsLine) {
          response += `${specsLine}\n`
        }
      }
      
      // Precio destacado
      response += `💰 *${this.formatPrice(product.price, product.currency)}*\n`
      
      // Separador entre productos (excepto el último)
      if (index < products.length - 1) {
        response += '\n'
      }
    })

    // Pregunta de cierre
    response += '\n¿Te gustaría que te recomiende uno según tu uso? 🤔\n'
    response += '(Ej: trabajo, estudios, diseño, gaming) 🎮💼📚'

    return response
  }

  /**
   * Acortar nombre de producto manteniendo lo esencial
   */
  private static shortenProductName(name: string): string {
    // Remover palabras redundantes
    let short = name
      .replace(/Portátil|Portatil|Laptop/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

    // Si es muy largo, tomar solo marca y modelo
    if (short.length > 45) {
      const parts = short.split(' ')
      short = parts.slice(0, 3).join(' ')
    }

    return short
  }

  /**
   * Formatear specs en una línea con emojis
   */
  private static formatSpecsInline(specs: Record<string, string | undefined>): string {
    const parts: string[] = []

    // Procesador
    if (specs.processor) {
      const proc = this.shortenProcessor(specs.processor)
      parts.push(`⚙️ ${proc}`)
    }

    // RAM y Storage juntos
    const memory: string[] = []
    if (specs.ram) memory.push(specs.ram)
    if (specs.storage) memory.push(specs.storage)
    if (memory.length > 0) {
      parts.push(`💾 ${memory.join(' / ')}`)
    }

    // Pantalla
    if (specs.screen) {
      parts.push(`🖥️ ${specs.screen}`)
    }

    return parts.join(' ')
  }

  /**
   * Acortar nombre de procesador
   */
  private static shortenProcessor(processor: string): string {
    return processor
      .replace(/Intel Core /gi, '')
      .replace(/AMD Ryzen /gi, 'Ryzen ')
      .replace(/\(.*?\)/g, '')
      .trim()
  }

  /**
   * Formatear precio
   */
  private static formatPrice(price: number, currency: string = 'COP'): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price)
  }

  /**
   * Obtener emoji según categoría del producto
   */
  private static getCategoryEmoji(productName: string): string {
    const name = productName.toLowerCase()

    if (name.includes('laptop') || name.includes('portátil')) return '💻'
    if (name.includes('celular') || name.includes('phone')) return '📱'
    if (name.includes('audífono') || name.includes('headphone')) return '🎧'
    if (name.includes('reloj') || name.includes('watch')) return '⌚'
    if (name.includes('tablet')) return '📱'
    if (name.includes('cámara') || name.includes('camera')) return '📷'
    if (name.includes('consola') || name.includes('playstation') || name.includes('xbox')) return '🎮'
    if (name.includes('curso') || name.includes('megapack')) return '📚'
    if (name.includes('teclado')) return '⌨️'
    if (name.includes('mouse')) return '🖱️'
    if (name.includes('monitor')) return '🖥️'

    return '📦'
  }

  /**
   * Formatear respuesta de producto individual
   */
  static formatSingleProduct(product: ProductInfo): string {
    const emoji = this.getCategoryEmoji(product.name)
    
    let response = `${emoji} *${product.name}*\n\n`

    // Specs detalladas
    if (product.specs) {
      if (product.specs.processor) {
        response += `⚙️ *Procesador:* ${product.specs.processor}\n`
      }
      if (product.specs.ram) {
        response += `💾 *RAM:* ${product.specs.ram}\n`
      }
      if (product.specs.storage) {
        response += `💿 *Almacenamiento:* ${product.specs.storage}\n`
      }
      if (product.specs.screen) {
        response += `🖥️ *Pantalla:* ${product.specs.screen}\n`
      }
      response += '\n'
    }

    // Precio destacado
    response += `💰 *Precio:* ${this.formatPrice(product.price, product.currency)}\n\n`

    // Call to action
    response += '¿Te interesa este producto? 😊\n'
    response += 'Puedo enviarte más detalles o el link de pago 💳'

    return response
  }

  /**
   * Formatear respuesta corta (para preguntas simples)
   */
  static formatShortResponse(message: string, includeEmoji: boolean = true): string {
    if (!includeEmoji) return message

    // Agregar emoji apropiado al inicio si no tiene
    if (!/^[\p{Emoji}]/u.test(message)) {
      return `✨ ${message}`
    }

    return message
  }

  /**
   * Formatear comparación de productos
   */
  static formatProductComparison(product1: ProductInfo, product2: ProductInfo): string {
    let response = '⚖️ *Comparación de Productos*\n\n'

    // Producto 1
    response += `🔹 *${this.shortenProductName(product1.name)}*\n`
    if (product1.specs) {
      response += `${this.formatSpecsInline(product1.specs)}\n`
    }
    response += `💰 ${this.formatPrice(product1.price, product1.currency)}\n\n`

    // VS
    response += '🆚\n\n'

    // Producto 2
    response += `🔹 *${this.shortenProductName(product2.name)}*\n`
    if (product2.specs) {
      response += `${this.formatSpecsInline(product2.specs)}\n`
    }
    response += `💰 ${this.formatPrice(product2.price, product2.currency)}\n\n`

    // Diferencia de precio
    const diff = Math.abs(product1.price - product2.price)
    response += `💵 Diferencia: ${this.formatPrice(diff, product1.currency)}\n\n`

    response += '¿Cuál te llama más la atención? 🤔'

    return response
  }

  /**
   * Extraer specs de un producto desde su descripción
   */
  static extractSpecs(product: any): Record<string, string> {
    const specs: Record<string, string> = {}
    const name = product.name || ''
    const desc = product.description || ''
    const combined = `${name} ${desc}`.toLowerCase()

    // Procesador
    const procMatch = combined.match(/(intel core i[3579]|ryzen [3579]|intel [3579]|core i[3579])[- ]?\w*/i)
    if (procMatch) {
      specs.processor = procMatch[0]
    }

    // RAM
    const ramMatch = combined.match(/(\d+)\s*gb\s*(ram|ddr\d?|lpddr\d?)/i)
    if (ramMatch) {
      specs.ram = `${ramMatch[1]}GB`
    }

    // Storage
    const storageMatch = combined.match(/(\d+)\s*(gb|tb)\s*(ssd|hdd|nvme)/i)
    if (storageMatch) {
      specs.storage = `${storageMatch[1]}${storageMatch[2].toUpperCase()} ${storageMatch[3].toUpperCase()}`
    }

    // Pantalla
    const screenMatch = combined.match(/(\d+\.?\d*)\s*("|pulgadas|inch)/i)
    if (screenMatch) {
      specs.screen = `${screenMatch[1]}"`
    }

    return specs
  }
}
