/**
 * Servicio de transcripción de audio
 * Integrado en el nuevo sistema conversacional
 */

import Groq from 'groq-sdk';
import fs from 'fs';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

/**
 * Transcribe un archivo de audio usando Groq Whisper
 */
export async function transcribirAudio(audioPath: string): Promise<string> {
  try {
    console.log('[AudioService] Transcribiendo audio:', audioPath);

    // Verificar que el archivo existe
    if (!fs.existsSync(audioPath)) {
      throw new Error('Archivo de audio no encontrado');
    }

    // Crear stream del archivo
    const audioFile = fs.createReadStream(audioPath);

    // Transcribir con Groq Whisper
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      language: 'es', // Español
      response_format: 'json',
      temperature: 0.0,
    });

    const texto = transcription.text || '';
    console.log('[AudioService] Transcripción:', texto);

    return texto;

  } catch (error) {
    console.error('[AudioService] Error transcribiendo:', error);
    throw new Error('Error al transcribir audio');
  }
}

/**
 * Transcribe audio con fallback
 */
export async function transcribirAudioConFallback(audioPath: string): Promise<string> {
  try {
    // Intentar con Groq primero
    return await transcribirAudio(audioPath);
  } catch (error) {
    console.error('[AudioService] Groq falló, intentando fallback...');
    
    // Fallback: devolver mensaje genérico
    return '[Audio recibido - No se pudo transcribir]';
  }
}

/**
 * Detecta si un mensaje es un audio
 */
export function esAudio(tipoMensaje: string): boolean {
  return tipoMensaje === 'audio' || tipoMensaje === 'voice';
}

/**
 * Guarda audio temporalmente
 */
export async function guardarAudioTemporal(
  buffer: Buffer,
  extension: string = 'ogg'
): Promise<string> {
  const tempDir = 'temp-audio';
  const tempPath = `${tempDir}/audio_${Date.now()}.${extension}`;

  // Crear directorio si no existe
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Guardar archivo
  await fs.promises.writeFile(tempPath, buffer);

  return tempPath;
}

/**
 * Limpia archivo temporal
 */
export async function limpiarAudioTemporal(audioPath: string): Promise<void> {
  try {
    if (fs.existsSync(audioPath)) {
      await fs.promises.unlink(audioPath);
      console.log('[AudioService] Audio temporal eliminado:', audioPath);
    }
  } catch (error) {
    console.error('[AudioService] Error limpiando audio:', error);
  }
}

/**
 * Procesa audio completo: guardar, transcribir, limpiar
 */
export async function procesarAudio(buffer: Buffer): Promise<string> {
  let audioPath: string | null = null;

  try {
    // Guardar temporalmente
    audioPath = await guardarAudioTemporal(buffer);

    // Transcribir
    const texto = await transcribirAudioConFallback(audioPath);

    return texto;

  } finally {
    // Limpiar siempre
    if (audioPath) {
      await limpiarAudioTemporal(audioPath);
    }
  }
}
