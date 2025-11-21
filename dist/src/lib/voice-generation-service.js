"use strict";
/**
 * 🎙️ SERVICIO DE GENERACIÓN DE VOZ
 * Convierte texto a audio con voz personalizada
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceGenerationService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
class VoiceGenerationService {
    constructor() {
        // Configuración desde .env
        this.apiKey = process.env.ELEVENLABS_API_KEY || process.env.OPENAI_API_KEY || '';
        this.voiceId = process.env.VOICE_ID || 'default';
        this.provider = process.env.VOICE_PROVIDER || 'elevenlabs';
        this.tempDir = path_1.default.join(process.cwd(), 'temp-voice');
        this.ensureTempDir();
    }
    async ensureTempDir() {
        try {
            await promises_1.default.mkdir(this.tempDir, { recursive: true });
            console.log('[Voice] 📁 Directorio temporal creado');
        }
        catch (error) {
            console.error('[Voice] ❌ Error creando directorio:', error);
        }
    }
    /**
     * Generar audio desde texto
     */
    async generateVoice(text) {
        console.log(`[Voice] 🎙️ Generando audio: "${text.substring(0, 50)}..."`);
        try {
            switch (this.provider) {
                case 'elevenlabs':
                    return await this.generateWithElevenLabs(text);
                case 'openai':
                    return await this.generateWithOpenAI(text);
                case 'google':
                    return await this.generateWithGoogle(text);
                default:
                    throw new Error(`Provider no soportado: ${this.provider}`);
            }
        }
        catch (error) {
            console.error('[Voice] ❌ Error generando voz:', error.message);
            throw error;
        }
    }
    /**
     * ElevenLabs - Mejor calidad y clonación de voz
     */
    async generateWithElevenLabs(text) {
        if (!this.apiKey) {
            throw new Error('ELEVENLABS_API_KEY no configurada');
        }
        console.log('[Voice] 🌐 Usando ElevenLabs...');
        const response = await (0, node_fetch_1.default)(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': this.apiKey
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.5,
                    use_speaker_boost: true
                }
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`ElevenLabs error: ${response.status} - ${error}`);
        }
        const audioBuffer = await response.buffer();
        console.log(`[Voice] ✅ Audio generado: ${audioBuffer.length} bytes`);
        return audioBuffer;
    }
    /**
     * OpenAI TTS - Buena calidad, más económico
     */
    async generateWithOpenAI(text) {
        if (!this.apiKey) {
            throw new Error('OPENAI_API_KEY no configurada');
        }
        console.log('[Voice] 🌐 Usando OpenAI TTS...');
        const response = await (0, node_fetch_1.default)('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'tts-1-hd',
                input: text,
                voice: this.voiceId || 'alloy', // alloy, echo, fable, onyx, nova, shimmer
                speed: 1.0
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenAI error: ${response.status} - ${error}`);
        }
        const audioBuffer = await response.buffer();
        console.log(`[Voice] ✅ Audio generado: ${audioBuffer.length} bytes`);
        return audioBuffer;
    }
    /**
     * Google Cloud TTS - Gratis hasta cierto límite
     */
    async generateWithGoogle(text) {
        if (!this.apiKey) {
            throw new Error('GOOGLE_CLOUD_API_KEY no configurada');
        }
        console.log('[Voice] 🌐 Usando Google Cloud TTS...');
        const response = await (0, node_fetch_1.default)(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: { text },
                voice: {
                    languageCode: 'es-ES',
                    name: this.voiceId || 'es-ES-Standard-A',
                    ssmlGender: 'NEUTRAL'
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: 1.0,
                    pitch: 0.0
                }
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Google error: ${response.status} - ${error}`);
        }
        const result = await response.json();
        const audioBuffer = Buffer.from(result.audioContent, 'base64');
        console.log(`[Voice] ✅ Audio generado: ${audioBuffer.length} bytes`);
        return audioBuffer;
    }
    /**
     * Guardar audio temporalmente
     */
    async saveAudioTemp(audioBuffer) {
        const fileName = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
        const filePath = path_1.default.join(this.tempDir, fileName);
        await promises_1.default.writeFile(filePath, audioBuffer);
        console.log(`[Voice] 💾 Audio guardado: ${fileName}`);
        return filePath;
    }
    /**
     * Limpiar archivos temporales antiguos
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
                    console.log(`[Voice] 🗑️ Eliminado archivo antiguo: ${file}`);
                }
            }
        }
        catch (error) {
            console.error('[Voice] ⚠️ Error limpiando archivos:', error);
        }
    }
    /**
     * Verificar si el servicio está configurado
     */
    isConfigured() {
        return !!this.apiKey;
    }
    /**
     * Obtener información del servicio
     */
    getInfo() {
        return {
            provider: this.provider,
            configured: this.isConfigured(),
            voiceId: this.voiceId
        };
    }
}
exports.VoiceGenerationService = VoiceGenerationService;
