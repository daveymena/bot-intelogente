"use strict";
/**
 * Servicio de transcripción de audio
 * Integrado en el nuevo sistema conversacional
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribirAudio = transcribirAudio;
exports.transcribirAudioConFallback = transcribirAudioConFallback;
exports.esAudio = esAudio;
exports.guardarAudioTemporal = guardarAudioTemporal;
exports.limpiarAudioTemporal = limpiarAudioTemporal;
exports.procesarAudio = procesarAudio;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const fs_1 = __importDefault(require("fs"));
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY || '',
});
/**
 * Transcribe un archivo de audio usando Groq Whisper
 */
async function transcribirAudio(audioPath) {
    try {
        console.log('[AudioService] Transcribiendo audio:', audioPath);
        // Verificar que el archivo existe
        if (!fs_1.default.existsSync(audioPath)) {
            throw new Error('Archivo de audio no encontrado');
        }
        // Crear stream del archivo
        const audioFile = fs_1.default.createReadStream(audioPath);
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
    }
    catch (error) {
        console.error('[AudioService] Error transcribiendo:', error);
        throw new Error('Error al transcribir audio');
    }
}
/**
 * Transcribe audio con fallback
 */
async function transcribirAudioConFallback(audioPath) {
    try {
        // Intentar con Groq primero
        return await transcribirAudio(audioPath);
    }
    catch (error) {
        console.error('[AudioService] Groq falló, intentando fallback...');
        // Fallback: devolver mensaje genérico
        return '[Audio recibido - No se pudo transcribir]';
    }
}
/**
 * Detecta si un mensaje es un audio
 */
function esAudio(tipoMensaje) {
    return tipoMensaje === 'audio' || tipoMensaje === 'voice';
}
/**
 * Guarda audio temporalmente
 */
async function guardarAudioTemporal(buffer, extension = 'ogg') {
    const tempDir = 'temp-audio';
    const tempPath = `${tempDir}/audio_${Date.now()}.${extension}`;
    // Crear directorio si no existe
    if (!fs_1.default.existsSync(tempDir)) {
        fs_1.default.mkdirSync(tempDir, { recursive: true });
    }
    // Guardar archivo
    await fs_1.default.promises.writeFile(tempPath, buffer);
    return tempPath;
}
/**
 * Limpia archivo temporal
 */
async function limpiarAudioTemporal(audioPath) {
    try {
        if (fs_1.default.existsSync(audioPath)) {
            await fs_1.default.promises.unlink(audioPath);
            console.log('[AudioService] Audio temporal eliminado:', audioPath);
        }
    }
    catch (error) {
        console.error('[AudioService] Error limpiando audio:', error);
    }
}
/**
 * Procesa audio completo: guardar, transcribir, limpiar
 */
async function procesarAudio(buffer) {
    let audioPath = null;
    try {
        // Guardar temporalmente
        audioPath = await guardarAudioTemporal(buffer);
        // Transcribir
        const texto = await transcribirAudioConFallback(audioPath);
        return texto;
    }
    finally {
        // Limpiar siempre
        if (audioPath) {
            await limpiarAudioTemporal(audioPath);
        }
    }
}
