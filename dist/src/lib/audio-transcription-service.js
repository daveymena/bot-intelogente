"use strict";
/**
 * 🎤 SERVICIO DE TRANSCRIPCIÓN DE AUDIO CON GROQ WHISPER
 * Sistema de transcripción de audio para WhatsApp
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioTranscriptionService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const form_data_1 = __importDefault(require("form-data"));
const node_fetch_1 = __importDefault(require("node-fetch"));
class AudioTranscriptionService {
    constructor() {
        this.model = 'whisper-large-v3';
        this.language = 'es';
        this.groqApiKey = process.env.GROQ_API_KEY || '';
        this.tempDir = path_1.default.join(process.cwd(), 'temp-audio');
        this.ensureTempDir();
    }
    async ensureTempDir() {
        try {
            await promises_1.default.mkdir(this.tempDir, { recursive: true });
            console.log('[Audio] 📁 Directorio temporal creado');
        }
        catch (error) {
            console.error('[Audio] ❌ Error creando directorio:', error);
        }
    }
    /**
     * Transcribir audio de WhatsApp a texto
     */
    async transcribeWhatsAppAudio(message) {
        const startTime = Date.now();
        try {
            console.log('[Audio] 🎤 Iniciando transcripción...');
            // 1. Verificar que tiene media
            if (!message.hasMedia) {
                throw new Error('El mensaje no contiene media');
            }
            // 2. Descargar audio
            const media = await message.downloadMedia();
            if (!media) {
                throw new Error('No se pudo descargar el audio');
            }
            // 3. Verificar que es audio
            if (!media.mimetype.startsWith('audio/')) {
                throw new Error(`Tipo no soportado: ${media.mimetype}`);
            }
            console.log(`[Audio] 🎵 Audio detectado: ${media.mimetype}`);
            // 4. Guardar temporalmente
            const tempFileName = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.ogg`;
            const tempFilePath = path_1.default.join(this.tempDir, tempFileName);
            const audioBuffer = Buffer.from(media.data, 'base64');
            await promises_1.default.writeFile(tempFilePath, audioBuffer);
            console.log(`[Audio] 💾 Guardado: ${tempFileName}`);
            // 5. Transcribir con Groq
            const transcription = await this.transcribeWithGroq(tempFilePath);
            // 6. Limpiar archivo temporal
            try {
                await promises_1.default.unlink(tempFilePath);
                console.log('[Audio] 🗑️ Archivo temporal eliminado');
            }
            catch (error) {
                console.error('[Audio] ⚠️ Error eliminando temporal:', error);
            }
            const processingTime = Date.now() - startTime;
            console.log(`[Audio] ✅ Transcripción completada en ${processingTime}ms`);
            console.log(`[Audio] 📝 Texto: "${transcription}"`);
            return transcription;
        }
        catch (error) {
            console.error('[Audio] ❌ Error en transcripción:', error.message);
            throw error;
        }
    }
    /**
     * Transcribir con Groq Whisper API
     */
    async transcribeWithGroq(audioFilePath) {
        try {
            if (!this.groqApiKey) {
                throw new Error('GROQ_API_KEY no configurada');
            }
            console.log('[Audio] 🌐 Enviando a Groq Whisper...');
            // Crear FormData
            const form = new form_data_1.default();
            const audioBuffer = await promises_1.default.readFile(audioFilePath);
            form.append('file', audioBuffer, {
                filename: path_1.default.basename(audioFilePath),
                contentType: 'audio/ogg'
            });
            form.append('model', this.model);
            form.append('language', this.language);
            form.append('temperature', '0.2');
            form.append('response_format', 'json');
            // Llamar a API
            const response = await (0, node_fetch_1.default)('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.groqApiKey}`,
                    ...form.getHeaders()
                },
                body: form
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Groq API error: ${response.status} - ${errorText}`);
            }
            const result = await response.json();
            if (!result.text) {
                throw new Error('No se recibió transcripción de Groq');
            }
            return result.text.trim();
        }
        catch (error) {
            console.error('[Audio] ❌ Error en Groq:', error.message);
            throw error;
        }
    }
    /**
     * Limpiar archivos temporales antiguos (más de 1 hora)
     */
    async cleanOldTempFiles() {
        try {
            const files = await promises_1.default.readdir(this.tempDir);
            const now = Date.now();
            const oneHour = 60 * 60 * 1000;
            for (const file of files) {
                const filePath = path_1.default.join(this.tempDir, file);
                const stats = await promises_1.default.stat(filePath);
                if (now - stats.mtimeMs > oneHour) {
                    await promises_1.default.unlink(filePath);
                    console.log(`[Audio] 🗑️ Eliminado archivo antiguo: ${file}`);
                }
            }
        }
        catch (error) {
            console.error('[Audio] ⚠️ Error limpiando archivos:', error);
        }
    }
}
exports.AudioTranscriptionService = AudioTranscriptionService;
