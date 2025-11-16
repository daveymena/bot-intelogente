/**
 * SERVICIO DE GALERÍA DE FOTOS Y ENVÍO AUTOMÁTICO
 * - Mejora visualización de fotos
 * - Envía fotos automáticamente cuando preguntan por producto
 */

import { db } from './db'

export class ProductImageGalleryService {
  /**
   * Obtener todas las imágenes de un producto
   */
  static async getProductImages(productId: string): Promise<string[]> {
    try {
      const product = await db.product.findUnique({
        where: { id: productId },
        select: { images: true }
      })

      if (!product) return []

      if (typeof product.images === 'string') {
        try {
          return JSON.parse(product.images)
        } catch {
          return [product.images]
        }
      }

      return Array.isArray(product.images) ? product.images : []
    } catch (error) {
      console.error('Error obteniendo imágenes:', error)
      return []
    }
  }

  /**
   * Generar mensaje con fotos para enviar a cliente
   */
  static async generateProductPhotoMessage(productId: string, productName: string): Promise<string> {
    try {
      const images = await this.getProductImages(productId)

      if (images.length === 0) {
        return `📸 No tengo fotos disponibles del ${productName} en este momento.`
      }

      let message = `📸 *Fotos del ${productName}:*\n\n`

      images.forEach((img, idx) => {
        message += `${idx + 1}. ${img}\n`
      })

      message += `\n¿Te gustaría más información o deseas agregarlo al carrito?`

      return message
    } catch (error) {
      console.error('Error generando mensaje de fotos:', error)
      return `📸 Fotos del ${productName} disponibles. ¿Te interesa?`
    }
  }

  /**
   * Detectar si el usuario pregunta por fotos
   */
  static detectPhotoRequest(message: string): boolean {
    const photoKeywords = [
      'foto', 'fotos', 'imagen', 'imágenes', 'imagen',
      'cómo se ve', 'como se ve', 'muéstrame', 'muestrame',
      'enseña', 'ensenã', 'ver foto', 'ver fotos',
      'foto del', 'fotos del', 'cómo es', 'como es'
    ]

    const normalized = message.toLowerCase()
    return photoKeywords.some(keyword => normalized.includes(keyword))
  }

  /**
   * Detectar si pregunta por un producto específico
   */
  static extractProductName(message: string): string | null {
    // Buscar patrones como "del [producto]", "de [producto]", "[producto]"
    const patterns = [
      /del\s+(.+?)(?:\?|$)/i,
      /de\s+(.+?)(?:\?|$)/i,
      /la\s+(.+?)(?:\?|$)/i,
      /el\s+(.+?)(?:\?|$)/i,
      /^(.+?)(?:\?|$)/i
    ]

    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    return null
  }

  /**
   * Buscar producto por nombre
   */
  static async findProductByName(name: string): Promise<any | null> {
    try {
      return await db.product.findFirst({
        where: {
          OR: [
            { name: { contains: name, mode: 'insensitive' } },
            { description: { contains: name, mode: 'insensitive' } }
          ],
          status: 'AVAILABLE'
        }
      })
    } catch (error) {
      console.error('Error buscando producto:', error)
      return null
    }
  }

  /**
   * Procesar solicitud de fotos del usuario
   */
  static async handlePhotoRequest(message: string): Promise<{
    hasPhotos: boolean
    message: string
    productId?: string
    images?: string[]
  }> {
    try {
      // Detectar si pregunta por fotos
      if (!this.detectPhotoRequest(message)) {
        return { hasPhotos: false, message: '' }
      }

      // Extraer nombre del producto
      const productName = this.extractProductName(message)
      if (!productName) {
        return {
          hasPhotos: false,
          message: '¿De cuál producto quieres ver las fotos? 📸'
        }
      }

      // Buscar producto
      const product = await this.findProductByName(productName)
      if (!product) {
        return {
          hasPhotos: false,
          message: `No encontré el producto "${productName}". ¿Cuál buscas? 🔍`
        }
      }

      // Obtener imágenes
      const images = await this.getProductImages(product.id)
      if (images.length === 0) {
        return {
          hasPhotos: false,
          message: `No tengo fotos del ${product.name} disponibles en este momento.`
        }
      }

      // Generar mensaje con fotos
      const photoMessage = await this.generateProductPhotoMessage(product.id, product.name)

      return {
        hasPhotos: true,
        message: photoMessage,
        productId: product.id,
        images
      }
    } catch (error) {
      console.error('Error procesando solicitud de fotos:', error)
      return {
        hasPhotos: false,
        message: 'Error al procesar tu solicitud. Intenta de nuevo.'
      }
    }
  }

  /**
   * Generar HTML para galería de fotos
   */
  static generateGalleryHTML(images: string[], productName: string): string {
    if (images.length === 0) return ''

    let html = `<div class="product-gallery">\n`
    html += `  <h3>${productName}</h3>\n`
    html += `  <div class="gallery-grid">\n`

    images.forEach((img, idx) => {
      html += `    <div class="gallery-item" data-index="${idx}">\n`
      html += `      <img src="${img}" alt="${productName} ${idx + 1}" />\n`
      html += `    </div>\n`
    })

    html += `  </div>\n`
    html += `</div>\n`

    return html
  }
}
