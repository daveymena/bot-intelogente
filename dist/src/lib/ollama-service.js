"use strict";
/**
 * 🤖 SERVICIO DE OLLAMA LOCAL
 * Integración con Ollama para usar modelos locales (gemma:2b)
 * Perfecto para entrenamiento sin consumir tokens de APIs externas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaService = void 0;
class OllamaService {
    static get baseUrl() {
        return process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    }
    static get model() {
        return process.env.OLLAMA_MODEL || 'gemma3:4b';
    }
    static get timeout() {
        return parseInt(process.env.OLLAMA_TIMEOUT || '300000'); // 5 minutos para gemma2:4b
    }
    static get enabled() {
        return process.env.OLLAMA_ENABLED === 'true';
    }
    /**
     * Verificar si Ollama está disponible
     */
    static async isAvailable() {
        if (!this.enabled) {
            console.log('[Ollama] ⚠️ Deshabilitado en .env (OLLAMA_ENABLED=false)');
            return false;
        }
        try {
            console.log('[Ollama] Verificando conexión a:', this.baseUrl);
            console.log('[Ollama] OLLAMA_ENABLED:', this.enabled);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos para Easypanel
            // Intentar con /api/tags (endpoint estándar de Ollama)
            const response = await fetch(`${this.baseUrl}/api/tags`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                const data = await response.json();
                console.log('[Ollama] ✅ Conectado exitosamente');
                console.log('[Ollama] 📦 Modelos disponibles:', data.models?.length || 0);
                return true;
            }
            console.log('[Ollama] ❌ Respuesta no OK:', response.status, response.statusText);
            return false;
        }
        catch (error) {
            if (error.name === 'AbortError') {
                console.log('[Ollama] ⏱️ Timeout después de 15 segundos');
            }
            else {
                console.log('[Ollama] ❌ Error de conexión:', error.message);
            }
            console.log('[Ollama] 💡 Verifica:');
            console.log('[Ollama]    - URL correcta:', this.baseUrl);
            console.log('[Ollama]    - Ollama corriendo en Easypanel');
            console.log('[Ollama]    - Puerto 11434 accesible');
            return false;
        }
    }
    /**
     * Generar respuesta con Ollama
     */
    static async generateResponse(params) {
        if (!this.enabled) {
            return null;
        }
        try {
            console.log('[Ollama] 🤖 Generando respuesta con', this.model);
            const ollamaMessages = [
                { role: 'system', content: params.systemPrompt },
                ...params.messages.slice(-10).map(m => ({
                    role: m.role,
                    content: m.content
                }))
            ];
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: ollamaMessages,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                        num_predict: parseInt(process.env.OLLAMA_MAX_TOKENS || '500')
                    }
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                console.error('[Ollama] Error en respuesta:', response.status);
                return null;
            }
            const data = await response.json();
            const text = data.message.content;
            console.log('[Ollama] ✅ Respuesta generada:', text.substring(0, 100) + '...');
            return {
                text,
                confidence: 0.85 // Ollama local tiene buena confianza
            };
        }
        catch (error) {
            if (error.name === 'AbortError') {
                console.error('[Ollama] ⏱️ Timeout después de', this.timeout, 'ms');
            }
            else {
                console.error('[Ollama] ❌ Error:', error.message);
            }
            return null;
        }
    }
    /**
     * Verificar que el modelo esté descargado
     */
    static async checkModel() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            if (!response.ok)
                return false;
            const data = await response.json();
            const models = data.models || [];
            const hasModel = models.some((m) => m.name === this.model);
            if (!hasModel) {
                console.log(`[Ollama] ⚠️ Modelo ${this.model} no encontrado`);
                console.log('[Ollama] 💡 Descárgalo con: ollama pull', this.model);
            }
            return hasModel;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Obtener información del modelo
     */
    static async getModelInfo() {
        try {
            const response = await fetch(`${this.baseUrl}/api/show`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: this.model
                })
            });
            if (!response.ok)
                return null;
            return await response.json();
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Listar modelos disponibles
     */
    static async listModels() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            if (!response.ok)
                return [];
            const data = await response.json();
            return (data.models || []).map((m) => m.name);
        }
        catch (error) {
            return [];
        }
    }
}
exports.OllamaService = OllamaService;
