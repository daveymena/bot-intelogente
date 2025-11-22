/**
 * 📸 SERVICIO ESPECIALIZADO DE ENVÍO DE FOTOS DE PRODUCTOS
 * Envía cada producto con su foto correspondiente
 */

import { WASocket } from '@whiskeysockets/baileys'
import { GoogleDriveConverter } from './google-drive-converter'
import axios from 'axios'

export interface ProductWithPhoto {
  id: string
  name: string
  price: number
  currency: string
  description?: string
  images?: string // JSON string
  specs?: any
}

export class ProductPhotoSender {
  /**
   * Enviar productos con sus fotos (uno por uno)
   */
  static async sendProductsWithPhotos(
    socket: WASocket,
    to: string,
    products: ProductWithPhoto[],
    maxProducts: number = 5
  ): Promise<{ sent: number; failed: number }> {
    try {
      const productsToSend = Math.min(products.length, maxProducts)
      console.log(`[ProductPhotoSender] 📸 Enviando ${productsToSend} productos con fotos`)

      let sent = 0
      let failed = 0

      for (let i = 0; i < productsToSend; i++) {
        const product = products[i]

        try {
          // Enviar producto con su foto
          const result = await this.sendSingleProductWithPhoto(socket, to, product, i + 1, productsToSend)

          if (result.success) {
            sent++
          } else {
            failed++
            console.log(`[ProductPhotoSender] ⚠️ Falló envío de ${product.name}`)
          }

          // Pausa inteligente entre productos para no saturar
          if (i < productsToSend - 1) {
            const pauseTime = this.calculatePauseTime(sent, failed, i + 1)
            await new Promise(resolve => setTimeout(resolve, pauseTime))
          }

        } catch (error: any) {
          console.error(`[ProductPhotoSender] ❌ Error enviando producto ${i + 1}:`, error.message)
          failed++

          // Si hay muchos errores consecutivos, aumentar pausa
          if (failed > sent + 2) {
            console.log(`[ProductPhotoSender] 🛑 Muchos errores, aumentando pausa a 5s`)
            await new Promise(resolve => setTimeout(resolve, 5000))
          }
        }
      }

      console.log(`[ProductPhotoSender] 📊 Resultado final: ${sent} enviados, ${failed} fallidos`)
      return { sent, failed }

    } catch (error) {
      console.error('[ProductPhotoSender] ❌ Error general:', error)
      return { sent: 0, failed: products.length }
    }
  }

  /**
   * Calcular tiempo de pausa inteligente basado en rendimiento
   */
  private static calculatePauseTime(sent: number, failed: number, currentIndex: number): number {
    const successRate = sent / (sent + failed) || 1

    // Si hay muchos fallos, aumentar pausa
    if (successRate < 0.5) {
      return 4000 // 4 segundos
    }

    // Pausa base de 2 segundos, reducir si todo va bien
    let basePause = 2000

    // Si llevamos varios productos exitosos, reducir pausa ligeramente
    if (sent >= 3 && failed === 0) {
      basePause = 1500
    }

    return basePause
  }

  /**
   * Enviar un solo producto con su foto
   */
  static async sendSingleProductWithPhoto(
    socket: WASocket,
    to: string,
    product: ProductWithPhoto,
    index: number,
    total: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[ProductPhotoSender] 📦 Enviando producto ${index}/${total}: ${product.name}`)

      // Obtener fotos del producto
      let photos: string[] = []
      if (product.images) {
        try {
          const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
          photos = Array.isArray(parsed) ? parsed : [parsed]
          console.log(`[ProductPhotoSender] 📸 Fotos encontradas: ${photos.length}`)
        } catch (e) {
          console.log(`[ProductPhotoSender] ⚠️ Error parseando imágenes:`, e)
        }
      }

      // Convertir URLs de Google Drive
      if (photos.length > 0) {
        photos = GoogleDriveConverter.convertMultipleUrls(photos)
        console.log(`[ProductPhotoSender] 🔗 URLs convertidas: ${photos[0]}`)
      }

      // Preparar mensaje de texto
      const caption = this.formatProductCaption(product, index, total)

      // Si tiene foto, enviar con imagen
      if (photos.length > 0 && photos[0] && photos[0].trim() !== '') {
        const photoUrl = photos[0] // Primera foto del producto
        console.log(`[ProductPhotoSender] 🖼️ Intentando descargar foto desde: ${photoUrl.substring(0, 100)}...`)

        try {
          // Descargar imagen
          const imageBuffer = await this.downloadImage(photoUrl)
          
          if (!imageBuffer) {
            console.log(`[ProductPhotoSender] ⚠️ No se pudo descargar la imagen, enviando solo texto`)
            await socket.sendMessage(to, { text: caption })
            return { success: true }
          }

          console.log(`[ProductPhotoSender] ✅ Imagen descargada, enviando...`)

          // Enviar imagen con caption
          await socket.sendMessage(to, {
            image: imageBuffer,
            caption: caption
          })

          console.log(`[ProductPhotoSender] ✅ Producto enviado con foto exitosamente`)
          return { success: true }

        } catch (error: any) {
          console.error(`[ProductPhotoSender] ❌ Error enviando imagen:`, error.message)
          console.error(`[ProductPhotoSender] Stack:`, error.stack)
          // Si falla la imagen, enviar solo texto
          await socket.sendMessage(to, { text: caption })
          return { success: true }
        }

      } else {
        // Sin foto, enviar solo texto
        console.log(`[ProductPhotoSender] 📝 Producto sin foto válida, enviando solo texto`)
        await socket.sendMessage(to, { text: caption })
        return { success: true }
      }

    } catch (error: any) {
      console.error(`[ProductPhotoSender] ❌ Error general:`, error.message)
      return { success: false, error: error.message }
    }
  }

  /**
   * Formatear caption del producto (VERSIÓN MEJORADA Y ORDENADA)
   */
  private static formatProductCaption(
    product: ProductWithPhoto,
    index: number,
    total: number
  ): string {
    let caption = ''

    // 🎯 ENCABEZADO CON NOMBRE
    caption += `━━━━━━━━━━━━━━━━━━━━\n`
    caption += `✨ *${product.name}*\n`
    caption += `━━━━━━━━━━━━━━━━━━━━\n\n`

    // 📝 DESCRIPCIÓN COMPLETA (no truncada)
    if (product.description && product.description.length > 10) {
      caption += `📝 *Descripción:*\n`
      caption += `${product.description}\n\n`
    }

    // ✨ ESPECIFICACIONES (si existen)
    if (product.specs) {
      try {
        const specs = typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs
        
        // Detectar tipo de producto
        const isCourse = product.name.toLowerCase().includes('curso') || 
                        product.description?.toLowerCase().includes('curso') ||
                        product.description?.toLowerCase().includes('aprende')
        
        const isMegapack = product.name.toLowerCase().includes('megapack') ||
                          product.name.toLowerCase().includes('mega pack')
        
        if (isCourse) {
          // FORMATO PARA CURSOS
          caption += `🎓 *Detalles del Curso:*\n`
          if (specs.duration) caption += `⏱️ Duración: ${specs.duration}\n`
          if (specs.level) caption += `📊 Nivel: ${specs.level}\n`
          if (specs.modules) caption += `📚 Módulos: ${specs.modules}\n`
          if (specs.lessons) caption += `🎬 Lecciones: ${specs.lessons}\n`
          if (specs.language) caption += `🌐 Idioma: ${specs.language}\n`
          if (specs.certificate) caption += `🏆 Certificado: ${specs.certificate}\n`
          if (specs.access) caption += `♾️ Acceso: ${specs.access}\n`
          if (specs.support) caption += `💬 Soporte: ${specs.support}\n`
          caption += '\n'
          
          // QUÉ APRENDERÁS
          if (specs.whatYouLearn || specs.topics) {
            caption += `💡 *Qué Aprenderás:*\n`
            const topics = specs.whatYouLearn || specs.topics
            if (Array.isArray(topics)) {
              topics.slice(0, 5).forEach((topic: string) => {
                caption += `  ✓ ${topic}\n`
              })
            } else if (typeof topics === 'string') {
              caption += `  ${topics}\n`
            }
            caption += '\n'
          }
          
        } else if (isMegapack) {
          // FORMATO PARA MEGAPACKS
          caption += `📦 *Contenido del Megapack:*\n`
          if (specs.totalCourses) caption += `🎓 Cursos incluidos: ${specs.totalCourses}\n`
          if (specs.totalSize) caption += `💾 Tamaño total: ${specs.totalSize}\n`
          if (specs.categories) caption += `📂 Categorías: ${specs.categories}\n`
          if (specs.format) caption += `📄 Formato: ${specs.format}\n`
          if (specs.language) caption += `🌐 Idioma: ${specs.language}\n`
          caption += '\n'
          
        } else {
          // FORMATO PARA PRODUCTOS FÍSICOS (laptops, motos, etc.)
          caption += `✨ *Especificaciones:*\n`
          if (specs.processor) caption += `⚙️ Procesador: ${specs.processor}\n`
          if (specs.ram) caption += `💾 RAM: ${specs.ram}\n`
          if (specs.storage) caption += `💿 Almacenamiento: ${specs.storage}\n`
          if (specs.screen) caption += `🖥️ Pantalla: ${specs.screen}\n`
          if (specs.graphics) caption += `🎮 Gráficos: ${specs.graphics}\n`
          if (specs.battery) caption += `🔋 Batería: ${specs.battery}\n`
          if (specs.weight) caption += `⚖️ Peso: ${specs.weight}\n`
          if (specs.color) caption += `🎨 Color: ${specs.color}\n`
          if (specs.brand) caption += `🏷️ Marca: ${specs.brand}\n`
          if (specs.model) caption += `📱 Modelo: ${specs.model}\n`
          caption += '\n'
        }
        
      } catch (e) {
        console.error('[ProductPhotoSender] Error parseando specs:', e)
      }
    }

    // 💰 PRECIO DESTACADO
    const formattedPrice = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: product.currency || 'COP',
      minimumFractionDigits: 0
    }).format(product.price)

    caption += `━━━━━━━━━━━━━━━━━━━━\n`
    caption += `💰 *PRECIO: ${formattedPrice}*\n`
    caption += `━━━━━━━━━━━━━━━━━━━━\n\n`

    // ✅ BENEFICIOS Y CALL TO ACTION
    if (total === 1) {
      caption += `✅ *Beneficios:*\n`
      caption += `  • Disponible de inmediato\n`
      caption += `  • Envío a toda Colombia\n`
      caption += `  • Garantía incluida\n`
      caption += `  • Soporte personalizado\n\n`
      caption += `💬 ¿Te interesa? Puedo enviarte los métodos de pago 😊`
    } else {
      caption += `📱 Opción ${index} de ${total}\n\n`
    }

    return caption
  }

  /**
   * Descargar imagen desde URL con reintentos y validaciones
   */
  private static async downloadImage(url: string, maxRetries: number = 2): Promise<Buffer | null> {
    try {
      // Validar URL
      if (!url || url.trim() === '') {
        console.log(`[ProductPhotoSender] ⚠️ URL vacía`)
        return null
      }

      // Limpiar URL
      url = url.trim()

      // Convertir URL de Google Drive si es necesario
      if (GoogleDriveConverter.isGoogleDriveUrl(url)) {
        url = GoogleDriveConverter.convertToDirectUrl(url)
        console.log(`[ProductPhotoSender] 🔄 URL convertida: ${url.substring(0, 50)}...`)
      }

      console.log(`[ProductPhotoSender] 📥 Descargando imagen...`)

      let lastError: any = null

      // Intentar descargar con reintentos
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[ProductPhotoSender] 🔄 Intento ${attempt}/${maxRetries}`)

          const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 15000, // 15 segundos
            maxRedirects: 5,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'image/*,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept-Encoding': 'gzip, deflate, br',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          })

          if (response.status === 200 && response.data) {
            const buffer = Buffer.from(response.data)

            // Validar que sea una imagen
            if (!this.isValidImageBuffer(buffer)) {
              console.log(`[ProductPhotoSender] ⚠️ El contenido descargado no es una imagen válida`)
              return null
            }

            const sizeKB = (buffer.length / 1024).toFixed(2)
            console.log(`[ProductPhotoSender] ✅ Imagen descargada: ${sizeKB} KB`)

            // Validar tamaño (máximo 10MB)
            if (buffer.length > 10 * 1024 * 1024) {
              console.log(`[ProductPhotoSender] ⚠️ Imagen muy grande (${sizeKB} KB), omitiendo`)
              return null
            }

            return buffer
          } else {
            console.log(`[ProductPhotoSender] ⚠️ Respuesta HTTP ${response.status}`)
            lastError = new Error(`HTTP ${response.status}`)
          }

        } catch (error: any) {
          lastError = error
          console.log(`[ProductPhotoSender] ⚠️ Intento ${attempt} falló:`, error.message)

          // Si no es el último intento, esperar antes de reintentar
          if (attempt < maxRetries) {
            const waitTime = attempt * 1000 // Espera incremental
            console.log(`[ProductPhotoSender] ⏳ Esperando ${waitTime}ms antes del siguiente intento...`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
          }
        }
      }

      // Si todos los intentos fallaron
      console.error(`[ProductPhotoSender] ❌ Error descargando imagen después de ${maxRetries} intentos:`, lastError?.message)
      return null

    } catch (error: any) {
      console.error(`[ProductPhotoSender] ❌ Error general descargando imagen:`, error.message)
      return null
    }
  }

  /**
   * Validar que el buffer contenga una imagen
   */
  private static isValidImageBuffer(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 4) return false

    // Verificar headers de imagen comunes
    const header = buffer.subarray(0, 4)

    // JPEG: FF D8 FF
    if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) return true

    // PNG: 89 50 4E 47
    if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) return true

    // GIF: 47 49 46 38
    if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38) return true

    // WebP: 52 49 46 46 (RIFF)
    if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46) return true

    return false
  }

  /**
   * Detectar si el mensaje solicita fotos
   */
  static detectPhotoRequest(message: string): boolean {
    const normalized = message.toLowerCase().trim()

    const photoPatterns = [
      // Solicitudes directas
      /\b(foto|fotos|imagen|imagenes|imágenes|pic|pics|picture|pictures)\b/i,
      /\b(me\s+(envía|envia|manda|pasa|muestra|enseña))\s+(foto|fotos|imagen)/i,
      /\b(tiene|tienes|hay)\s+(foto|fotos|imagen)/i,
      /\b(ver|mirar|revisar|mostrar)\s+(foto|fotos|imagen)/i,
      /\b(foto|fotos|imagen)\s+(del|de|para|sobre)/i,
      /\b(cómo|como)\s+(se\s+ve|luce|es)/i,

      // Variaciones colombianas
      /\b(mándame|mandame|pasame|pásame)\s+(foto|fotos|imagen)/i,
      /\b(quiero\s+ver)/i,
      /\b(déjame|dejame)\s+ver/i,
      /\b(a\s+ver)/i,

      // Preguntas sobre apariencia
      /\b(qué\s+tal\s+se\s+ve|que\s+tal\s+se\s+ve)/i,
      /\b(cómo\s+es|como\s+es)/i,
      /\b(de\s+qué\s+color|de\s+que\s+color)/i,
    ]

    return photoPatterns.some(pattern => pattern.test(normalized))
  }

  /**
   * Determinar si se deben enviar fotos automáticamente
   */
  static shouldSendPhotosAutomatically(
    message: string,
    hasImages: boolean,
    photosAlreadySent: boolean,
    productId: string,
    lastSentProductId?: string
  ): { shouldSend: boolean; reason: string } {

    // Si no tiene imágenes, no enviar
    if (!hasImages) {
      return { shouldSend: false, reason: 'Producto sin imágenes disponibles' }
    }

    // Si ya envió fotos de este producto específico, no reenviar
    if (photosAlreadySent && lastSentProductId === productId) {
      return { shouldSend: false, reason: 'Fotos ya enviadas para este producto' }
    }

    // Si el mensaje es una solicitud explícita de fotos, enviar
    if (this.detectPhotoRequest(message)) {
      return { shouldSend: true, reason: 'Solicitud explícita de fotos' }
    }

    // Si es la primera mención del producto, enviar fotos para mejor experiencia
    if (!photosAlreadySent) {
      return { shouldSend: true, reason: 'Primera mención del producto' }
    }

    // Si cambió de producto, enviar fotos del nuevo
    if (lastSentProductId && lastSentProductId !== productId) {
      return { shouldSend: true, reason: 'Cambio de producto detectado' }
    }

    // Por defecto, no enviar automáticamente para evitar spam
    return { shouldSend: false, reason: 'Evitando envío automático repetitivo' }
  }

  /**
   * Obtener estadísticas de envío de fotos
   */
  static getPhotoStats(): {
    totalRequests: number
    successfulSends: number
    failedSends: number
    averageResponseTime: number
  } {
    // Por ahora, estadísticas básicas (podrían expandirse)
    return {
      totalRequests: 0, // TODO: Implementar contador
      successfulSends: 0,
      failedSends: 0,
      averageResponseTime: 0
    }
  }
}
