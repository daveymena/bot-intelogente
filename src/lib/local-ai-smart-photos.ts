/**
 * Local AI Smart Photos Service
 * Envía fotos inteligentemente basado en la IA local
 * Integración con productos y análisis de intención
 */

import { WASocket } from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'
import { db } from './db'

interface PhotoSendResult {
  sent: number
  failed: number
  errors: string[]
}

export class LocalAISmartPhotos {
  /**
   * Enviar fotos inteligentemente
   */
  static async sendSmartPhotos(
    socket: WASocket,
    from: string,
    products: any[],
    intent: string,
    userId: string
  ): Promise<PhotoSendResult> {
    const result: PhotoSendResult = {
      sent: 0,
      failed: 0,
      errors: []
    }

    try {
      console.log(`[SmartPhotos] 📸 Enviando fotos inteligentes (${products.length} productos)`)

      // Determinar cantidad de fotos según intención
      const photoCount = this.getPhotoCountByIntent(intent)
      const productsToSend = products.slice(0, photoCount)

      console.log(`[SmartPhotos] 🎯 Intención: ${intent}, Fotos a enviar: ${photoCount}`)

      // Enviar fotos de cada producto
      for (const product of productsToSend) {
        try {
          const sent = await this.sendProductPhotos(socket, from, product, userId)
          result.sent += sent
        } catch (error) {
          result.failed++
          result.errors.push(`Error enviando fotos de ${product.name}: ${error}`)
          console.error(`[SmartPhotos] ❌ Error con ${product.name}:`, error)
        }
      }

      console.log(`[SmartPhotos] ✅ Fotos enviadas: ${result.sent}, Fallidas: ${result.failed}`)

      return result
    } catch (error) {
      console.error('[SmartPhotos] ❌ Error enviando fotos inteligentes:', error)
      result.errors.push(String(error))
      return result
    }
  }

  /**
   * Obtener cantidad de fotos según intención
   */
  private static getPhotoCountByIntent(intent: string): number {
    const photoCountMap: { [key: string]: number } = {
      search: 3,           // Búsqueda: 3 productos
      purchase: 1,         // Compra: 1 producto específico
      recommendation: 2,   // Recomendación: 2 productos
      info: 1,            // Información: 1 producto
      general: 2,         // General: 2 productos
      payment: 1,         // Pago: 1 producto
      support: 0,         // Soporte: sin fotos
      tracking: 0         // Seguimiento: sin fotos
    }

    return photoCountMap[intent] || 2
  }

  /**
   * Enviar fotos de un producto
   */
  private static async sendProductPhotos(
    socket: WASocket,
    from: string,
    product: any,
    userId: string
  ): Promise<number> {
    let sent = 0

    try {
      // Obtener imágenes del producto
      const images = await this.getProductImages(product)

      if (images.length === 0) {
        console.log(`[SmartPhotos] ⚠️ No hay imágenes para ${product.name}`)
        return 0
      }

      // Enviar primera imagen con descripción
      const caption = this.generateProductCaption(product)

      for (let i = 0; i < images.length; i++) {
        const imagePath = images[i]

        try {
          // Verificar que el archivo existe
          if (!fs.existsSync(imagePath)) {
            console.log(`[SmartPhotos] ⚠️ Archivo no encontrado: ${imagePath}`)
            continue
          }

          // Leer imagen
          const imageBuffer = fs.readFileSync(imagePath)

          // Enviar imagen
          if (i === 0) {
            // Primera imagen con caption
            await socket.sendMessage(from, {
              image: imageBuffer,
              caption: caption
            })
          } else {
            // Imágenes adicionales sin caption
            await socket.sendMessage(from, {
              image: imageBuffer
            })
          }

          sent++
          console.log(`[SmartPhotos] ✅ Imagen ${i + 1}/${images.length} enviada`)

          // Esperar entre envíos para no saturar
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (error) {
          console.error(`[SmartPhotos] ❌ Error enviando imagen ${i + 1}:`, error)
        }
      }

      // Guardar en BD que se enviaron fotos
      await this.logPhotoSend(userId, from, product.id, sent)

      return sent
    } catch (error) {
      console.error('[SmartPhotos] ❌ Error enviando fotos del producto:', error)
      return 0
    }
  }

  /**
   * Obtener imágenes del producto
   */
  private static async getProductImages(product: any): Promise<string[]> {
    const images: string[] = []

    try {
      // Si el producto tiene URLs de imagen
      if (product.images && Array.isArray(product.images)) {
        for (const image of product.images) {
          if (typeof image === 'string' && image.startsWith('http')) {
            // Descargar imagen de URL
            const localPath = await this.downloadImage(image, product.id)
            if (localPath) {
              images.push(localPath)
            }
          } else if (typeof image === 'string') {
            // Ruta local
            if (fs.existsSync(image)) {
              images.push(image)
            }
          }
        }
      }

      // Si no hay imágenes, buscar en carpeta de productos
      if (images.length === 0) {
        const productFolder = path.join(process.cwd(), 'public', 'products', product.id)
        if (fs.existsSync(productFolder)) {
          const files = fs.readdirSync(productFolder)
          const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f))
          images.push(
            ...imageFiles.map(f => path.join(productFolder, f))
          )
        }
      }

      // Si aún no hay imágenes, buscar en carpeta moto (legacy)
      if (images.length === 0) {
        const motoFolder = path.join(process.cwd(), 'moto')
        if (fs.existsSync(motoFolder)) {
          const files = fs.readdirSync(motoFolder)
          const productFiles = files.filter(f =>
            f.toLowerCase().includes(product.name.toLowerCase().substring(0, 5))
          )
          images.push(
            ...productFiles.map(f => path.join(motoFolder, f))
          )
        }
      }

      return images.slice(0, 3) // Máximo 3 imágenes por producto
    } catch (error) {
      console.error('[SmartPhotos] ❌ Error obteniendo imágenes:', error)
      return []
    }
  }

  /**
   * Descargar imagen de URL
   */
  private static async downloadImage(url: string, productId: string): Promise<string | null> {
    try {
      const response = await fetch(url)
      if (!response.ok) return null

      const buffer = await response.arrayBuffer()
      const filename = `${productId}_${Date.now()}.jpg`
      const filepath = path.join(process.cwd(), 'temp-images', filename)

      // Crear carpeta si no existe
      const dir = path.dirname(filepath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      fs.writeFileSync(filepath, Buffer.from(buffer))
      console.log(`[SmartPhotos] ✅ Imagen descargada: ${filename}`)

      return filepath
    } catch (error) {
      console.error('[SmartPhotos] ❌ Error descargando imagen:', error)
      return null
    }
  }

  /**
   * Generar caption del producto
   */
  private static generateProductCaption(product: any): string {
    let caption = `*${product.name}*\n\n`

    if (product.description) {
      caption += `📝 ${product.description}\n\n`
    }

    if (product.price) {
      caption += `💰 Precio: $${product.price.toLocaleString('es-CO')}\n`
    }

    if (product.category) {
      caption += `🏷️ Categoría: ${product.category}\n`
    }

    if (product.stock !== undefined) {
      caption += `📦 Stock: ${product.stock > 0 ? 'Disponible' : 'Agotado'}\n`
    }

    caption += `\n¿Te interesa? Cuéntame 😊`

    return caption
  }

  /**
   * Registrar envío de fotos
   */
  private static async logPhotoSend(
    userId: string,
    from: string,
    productId: string,
    photoCount: number
  ): Promise<void> {
    try {
      await db.photoLog.create({
        data: {
          userId,
          from,
          productId,
          photoCount,
          sentAt: new Date()
        }
      })
    } catch (error) {
      console.error('[SmartPhotos] ⚠️ Error registrando envío de fotos:', error)
    }
  }

  /**
   * Enviar galería de productos
   */
  static async sendProductGallery(
    socket: WASocket,
    from: string,
    products: any[],
    userId: string
  ): Promise<PhotoSendResult> {
    const result: PhotoSendResult = {
      sent: 0,
      failed: 0,
      errors: []
    }

    try {
      console.log(`[SmartPhotos] 🎨 Enviando galería de ${products.length} productos`)

      // Enviar mensaje introductorio
      const intro = '¡Mira nuestra galería de productos! 📸\n\n'
      await socket.sendMessage(from, { text: intro })

      // Enviar fotos de cada producto
      for (const product of products.slice(0, 5)) {
        try {
          const sent = await this.sendProductPhotos(socket, from, product, userId)
          result.sent += sent
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          result.failed++
          result.errors.push(String(error))
        }
      }

      // Mensaje de cierre
      const closing = '\n¿Cuál te gusta? Cuéntame el número o el nombre 😊'
      await socket.sendMessage(from, { text: closing })

      return result
    } catch (error) {
      console.error('[SmartPhotos] ❌ Error enviando galería:', error)
      result.errors.push(String(error))
      return result
    }
  }

  /**
   * Enviar foto de producto específico
   */
  static async sendSpecificProductPhoto(
    socket: WASocket,
    from: string,
    productId: string,
    userId: string
  ): Promise<PhotoSendResult> {
    const result: PhotoSendResult = {
      sent: 0,
      failed: 0,
      errors: []
    }

    try {
      // Obtener producto
      const product = await db.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        result.errors.push('Producto no encontrado')
        return result
      }

      console.log(`[SmartPhotos] 📸 Enviando foto de ${product.name}`)

      const sent = await this.sendProductPhotos(socket, from, product, userId)
      result.sent = sent

      return result
    } catch (error) {
      console.error('[SmartPhotos] ❌ Error enviando foto específica:', error)
      result.errors.push(String(error))
      return result
    }
  }

  /**
   * Limpiar imágenes temporales
   */
  static async cleanupTempImages(): Promise<void> {
    try {
      const tempDir = path.join(process.cwd(), 'temp-images')
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir)
        for (const file of files) {
          const filepath = path.join(tempDir, file)
          const stats = fs.statSync(filepath)
          const ageInHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60)

          // Eliminar imágenes más antiguas de 24 horas
          if (ageInHours > 24) {
            fs.unlinkSync(filepath)
            console.log(`[SmartPhotos] 🗑️ Imagen temporal eliminada: ${file}`)
          }
        }
      }
    } catch (error) {
      console.error('[SmartPhotos] ⚠️ Error limpiando imágenes temporales:', error)
    }
  }
}

export default LocalAISmartPhotos
