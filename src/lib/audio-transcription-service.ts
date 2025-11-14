/**
 * 🎤 SERVICIO DE TRANSCRIPCIÓN DE AUDIO CON GROQ WHISPER
 * Sistema de transcripción de audio para WhatsApp
 */

import fs from 'fs/promises'
import path from 'path'
import FormData from 'form-data'
import fetch from 'node-fetch'

export class AudioTranscriptionService {
  private groqApiKey: string
  private tempDir: string
  private model = 'whisper-large-v3'
  private language = 'es'

  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || ''
    this.tempDir = path.join(process.cwd(), 'temp-audio')
    this.ensureTempDir()
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true })
      console.log('[Audio] 📁 Directorio temporal creado')
    } catch (error) {
      console.error('[Audio] ❌ Error creando directorio:', error)
    }
  }

  /**
   * Transcribir audio de WhatsApp a texto
   */
  async transcribeWhatsAppAudio(message: any): Promise<string> {
    const startTime = Date.now()

    try {
      console.log('[Audio] 🎤 Iniciando transcripción...')

      // 1. Verificar que tiene media
      if (!message.hasMedia) {
        throw new Error('El mensaje no contiene media')
      }

      // 2. Descargar audio
      const media = await message.downloadMedia()

      if (!media) {
        throw new Error('No se pudo descargar el audio')
      }

      // 3. Verificar que es audio
      if (!media.mimetype.startsWith('audio/')) {
        throw new Error(`Tipo no soportado: ${media.mimetype}`)
      }

      console.log(`[Audio] 🎵 Audio detectado: ${media.mimetype}`)

      // 4. Guardar temporalmente
      const tempFileName = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.ogg`
      const tempFilePath = path.join(this.tempDir, tempFileName)

      const audioBuffer = Buffer.from(media.data, 'base64')
      await fs.writeFile(tempFilePath, audioBuffer)

      console.log(`[Audio] 💾 Guardado: ${tempFileName}`)

      // 5. Transcribir con Groq
      const transcription = await this.transcribeWithGroq(tempFilePath)

      // 6. Limpiar archivo temporal
      try {
        await fs.unlink(tempFilePath)
        console.log('[Audio] 🗑️ Archivo temporal eliminado')
      } catch (error) {
        console.error('[Audio] ⚠️ Error eliminando temporal:', error)
      }

      const processingTime = Date.now() - startTime
      console.log(`[Audio] ✅ Transcripción completada en ${processingTime}ms`)
      console.log(`[Audio] 📝 Texto: "${transcription}"`)

      return transcription

    } catch (error: any) {
      console.error('[Audio] ❌ Error en transcripción:', error.message)
      throw error
    }
  }

  /**
   * Transcribir con Groq Whisper API
   */
  async transcribeWithGroq(audioFilePath: string): Promise<string> {
    try {
      if (!this.groqApiKey) {
        throw new Error('GROQ_API_KEY no configurada')
      }

      console.log('[Audio] 🌐 Enviando a Groq Whisper...')

      // Crear FormData
      const form = new FormData()
      const audioBuffer = await fs.readFile(audioFilePath)
      
      form.append('file', audioBuffer, {
        filename: path.basename(audioFilePath),
        contentType: 'audio/ogg'
      })
      form.append('model', this.model)
      form.append('language', this.language)
      form.append('temperature', '0.2')
      form.append('response_format', 'json')

      // Llamar a API
      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          ...form.getHeaders()
        },
        body: form
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Groq API error: ${response.status} - ${errorText}`)
      }

      const result: any = await response.json()

      if (!result.text) {
        throw new Error('No se recibió transcripción de Groq')
      }

      return result.text.trim()

    } catch (error: any) {
      console.error('[Audio] ❌ Error en Groq:', error.message)
      throw error
    }
  }

  /**
   * Limpiar archivos temporales antiguos (más de 1 hora)
   */
  async cleanOldTempFiles() {
    try {
      const files = await fs.readdir(this.tempDir)
      const now = Date.now()
      const oneHour = 60 * 60 * 1000

      for (const file of files) {
        const filePath = path.join(this.tempDir, file)
        const stats = await fs.stat(filePath)
        
        if (now - stats.mtimeMs > oneHour) {
          await fs.unlink(filePath)
          console.log(`[Audio] 🗑️ Eliminado archivo antiguo: ${file}`)
        }
      }
    } catch (error) {
      console.error('[Audio] ⚠️ Error limpiando archivos:', error)
    }
  }
}
