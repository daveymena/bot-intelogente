/**
 * Servicio de Transcripción de Audio con Groq Whisper
 * Convierte mensajes de voz de WhatsApp a texto
 */

import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

config();

export class AudioTranscriptionService {
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.tempDir = path.join(process.cwd(), 'temp-audio');
    this.ensureTempDir();
  }

  /**
   * Asegurar que existe el directorio temporal
   */
  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }
  }

  /**
   * Transcribir audio de WhatsApp a texto
   */
  async transcribeWhatsAppAudio(message) {
    try {
      // 1. Verificar que el mensaje tiene audio
      if (!message.hasMedia) {
        throw new Error('El mensaje no contiene media');
      }

      // 2. Obtener información del media
      const media = await message.downloadMedia();
      
      if (!media) {
        throw new Error('No se pudo descargar el audio');
      }

      // 3. Verificar que es audio
      if (!media.mimetype.startsWith('audio/')) {
        throw new Error(`Tipo de archivo no soportado: ${media.mimetype}`);
      }

      // 4. Guardar archivo temporal
      const tempFileName = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.ogg`;
      const tempFilePath = path.join(this.tempDir, tempFileName);
      
      // Convertir base64 a buffer y guardar
      const audioBuffer = Buffer.from(media.data, 'base64');
      await fs.writeFile(tempFilePath, audioBuffer);

      // 5. Transcribir con Groq Whisper
      const transcription = await this.transcribeWithGroq(tempFilePath);

      // 6. Limpiar archivo temporal
      await this.cleanupTempFile(tempFilePath);

      return transcription;

    } catch (error) {
      console.error('❌ [Audio] Error en transcripción:', error);
      throw error;
    }
  }

  /**
   * Transcribir archivo con Groq Whisper
   */
  async transcribeWithGroq(filePath) {
    try {
      if (!this.groqApiKey) {
        throw new Error('GROQ_API_KEY no configurada');
      }

      // Crear FormData para envío
      const formData = new FormData();
      const audioStream = await fs.readFile(filePath);
      
      formData.append('file', audioStream, {
        filename: path.basename(filePath),
        contentType: 'audio/ogg'
      });
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'es'); // Español
      formData.append('response_format', 'json');
      formData.append('temperature', '0.2'); // Más preciso

      // Llamar a la API de Groq
      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          ...formData.getHeaders()
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.text) {
        throw new Error('No se obtuvo transcripción de Groq');
      }

      return result.text.trim();

    } catch (error) {
      console.error('❌ [Groq] Error en transcripción:', error);
      throw error;
    }
  }

  /**
   * Limpiar archivo temporal
   */
  async cleanupTempFile(filePath) {
    try {
      await fs.unlink(filePath);
      // Log silencioso - solo para debug interno
    } catch (error) {
      console.error('⚠️ [Audio] Error eliminando archivo temporal:', error);
    }
  }

  /**
   * Limpiar todos los archivos temporales antiguos
   */
  async cleanupOldTempFiles() {
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();
      const maxAge = 60 * 60 * 1000; // 1 hora

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          console.log(`🗑️ [Audio] Archivo antiguo eliminado: ${file}`);
        }
      }
    } catch (error) {
      console.error('⚠️ [Audio] Error limpiando archivos antiguos:', error);
    }
  }

  /**
   * Verificar si el servicio está configurado correctamente
   */
  isConfigured() {
    return !!this.groqApiKey;
  }

  /**
   * Obtener estadísticas del servicio
   */
  getStats() {
    return {
      configured: this.isConfigured(),
      tempDir: this.tempDir,
      groqModel: 'whisper-large-v3'
    };
  }
}

// Exportar instancia singleton
export const audioTranscriptionService = new AudioTranscriptionService();