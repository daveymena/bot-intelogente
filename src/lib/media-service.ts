/**
 * 📸 SERVICIO DE MEDIOS
 * Manejo de fotos, videos, audios y transcripción
 */

import Groq from 'groq-sdk'
import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

export class MediaService {
  /**
   * 🎤 Transcribir audio usando Groq Whisper
   */
  static async transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
    try {
      console.log('[Media] 🎤 Transcribiendo audio con Groq Whisper...')

      // Guardar temporalmente el audio
      const tempDir = path.join(process.cwd(), 'temp')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      const extension = this.getAudioExtension(mimeType)
      const tempFile = path.join(tempDir, `audio_${Date.now()}.${extension}`)
      fs.writeFileSync(tempFile, audioBuffer)

      // Transcribir con Groq Whisper
      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(tempFile),
        model: 'whisper-large-v3',
        language: 'es', // Español
        response_format: 'json',
        temperature: 0.0
      })

      // Eliminar archivo temporal
      fs.unlinkSync(tempFile)

      console.log('[Media] ✅ Audio transcrito:', transcription.text)
      return transcription.text

    } catch (error) {
      console.error('[Media] ❌ Error transcribiendo audio:', error)
      throw error
    }
  }

  /**
   * 📸 Enviar imagen con caption
   */
  static async prepareImageMessage(imageUrl: string, caption?: string) {
    try {
      console.log('[Media] 📸 Preparando imagen:', imageUrl)

      // Si es una URL, descargar la imagen
      let imageBuffer: Buffer

      if (imageUrl.startsWith('http')) {
        const response = await fetch(imageUrl)
        const arrayBuffer = await response.arrayBuffer()
        imageBuffer = Buffer.from(arrayBuffer)
      } else {
        // Si es una ruta local web (ej: /fotos/imagen.jpg), convertir a ruta del sistema
        let filePath = imageUrl
        if (imageUrl.startsWith('/')) {
          // Convertir ruta web a ruta del sistema de archivos
          filePath = path.join(process.cwd(), 'public', imageUrl)
        }
        
        console.log('[Media] 📂 Leyendo archivo desde:', filePath)
        
        // Verificar que el archivo existe
        if (!fs.existsSync(filePath)) {
          throw new Error(`Archivo no encontrado: ${filePath}`)
        }
        
        imageBuffer = fs.readFileSync(filePath)
      }

      return {
        image: imageBuffer,
        caption: caption || ''
      }
    } catch (error) {
      console.error('[Media] ❌ Error preparando imagen:', error)
      throw error
    }
  }

  /**
   * 🎥 Enviar video con caption
   */
  static async prepareVideoMessage(videoUrl: string, caption?: string) {
    try {
      console.log('[Media] 🎥 Preparando video:', videoUrl)

      let videoBuffer: Buffer

      if (videoUrl.startsWith('http')) {
        const response = await fetch(videoUrl)
        const arrayBuffer = await response.arrayBuffer()
        videoBuffer = Buffer.from(arrayBuffer)
      } else {
        // Si es una ruta local web, convertir a ruta del sistema
        let filePath = videoUrl
        if (videoUrl.startsWith('/')) {
          filePath = path.join(process.cwd(), 'public', videoUrl)
        }
        
        console.log('[Media] 📂 Leyendo video desde:', filePath)
        
        if (!fs.existsSync(filePath)) {
          throw new Error(`Archivo no encontrado: ${filePath}`)
        }
        
        videoBuffer = fs.readFileSync(filePath)
      }

      return {
        video: videoBuffer,
        caption: caption || ''
      }
    } catch (error) {
      console.error('[Media] ❌ Error preparando video:', error)
      throw error
    }
  }

  /**
   * 📄 Enviar documento
   */
  static async prepareDocumentMessage(documentUrl: string, fileName: string) {
    try {
      console.log('[Media] 📄 Preparando documento:', documentUrl)

      let documentBuffer: Buffer

      if (documentUrl.startsWith('http')) {
        const response = await fetch(documentUrl)
        const arrayBuffer = await response.arrayBuffer()
        documentBuffer = Buffer.from(arrayBuffer)
      } else {
        // Si es una ruta local web, convertir a ruta del sistema
        let filePath = documentUrl
        if (documentUrl.startsWith('/')) {
          filePath = path.join(process.cwd(), 'public', documentUrl)
        }
        
        console.log('[Media] 📂 Leyendo documento desde:', filePath)
        
        if (!fs.existsSync(filePath)) {
          throw new Error(`Archivo no encontrado: ${filePath}`)
        }
        
        documentBuffer = fs.readFileSync(filePath)
      }

      return {
        document: documentBuffer,
        fileName: fileName,
        mimetype: this.getMimeType(fileName)
      }
    } catch (error) {
      console.error('[Media] ❌ Error preparando documento:', error)
      throw error
    }
  }

  /**
   * Obtener extensión de audio según mime type
   */
  private static getAudioExtension(mimeType: string): string {
    const extensions: { [key: string]: string } = {
      'audio/ogg': 'ogg',
      'audio/mpeg': 'mp3',
      'audio/mp4': 'm4a',
      'audio/amr': 'amr',
      'audio/wav': 'wav'
    }
    return extensions[mimeType] || 'ogg'
  }

  /**
   * Obtener mime type según extensión
   */
  private static getMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase()
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'mp4': 'video/mp4',
      'mp3': 'audio/mpeg'
    }
    return mimeTypes[extension || ''] || 'application/octet-stream'
  }

  /**
   * Descargar media de WhatsApp
   */
  static async downloadWhatsAppMedia(message: any): Promise<Buffer | null> {
    try {
      if (!message.message) return null

      // Detectar tipo de media
      const mediaType = Object.keys(message.message).find(key =>
        ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'].includes(key)
      )

      if (!mediaType) return null

      console.log('[Media] 📥 Descargando media de tipo:', mediaType)

      // Descargar el buffer
      const buffer = await message.downloadMediaMessage()

      return buffer
    } catch (error) {
      console.error('[Media] ❌ Error descargando media:', error)
      return null
    }
  }

  /**
   * Detectar si un mensaje contiene media
   */
  static hasMedia(message: any): boolean {
    if (!message.message) return false

    const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage']
    return mediaTypes.some(type => message.message[type])
  }

  /**
   * Obtener tipo de media
   */
  static getMediaType(message: any): 'image' | 'video' | 'audio' | 'document' | null {
    if (!message.message) return null

    if (message.message.imageMessage) return 'image'
    if (message.message.videoMessage) return 'video'
    if (message.message.audioMessage) return 'audio'
    if (message.message.documentMessage) return 'document'

    return null
  }
}
