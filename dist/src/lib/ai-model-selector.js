"use strict";
/**
 * 🤖 SELECTOR INTELIGENTE DE MODELOS DE IA
 * Detecta automáticamente qué modelos están disponibles y los usa
 * Evita rate limits rotando entre modelos disponibles
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModelSelector = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
class AIModelSelector {
    /**
     * Obtener el mejor modelo disponible
     */
    static async getBestAvailableModel() {
        try {
            // Si el caché es reciente, usarlo
            if (this.modelCache.length > 0 && this.lastCheck) {
                const timeSinceCheck = Date.now() - this.lastCheck.getTime();
                if (timeSinceCheck < this.checkInterval) {
                    const available = this.modelCache.find(m => m.available);
                    if (available) {
                        console.log(`[Model Selector] 📦 Usando modelo en caché: ${available.id}`);
                        return available.id;
                    }
                }
            }
            // Actualizar lista de modelos disponibles
            await this.updateAvailableModels();
            // Obtener el mejor modelo disponible
            const bestModel = this.modelCache.find(m => m.available);
            if (bestModel) {
                console.log(`[Model Selector] ✅ Mejor modelo disponible: ${bestModel.id}`);
                return bestModel.id;
            }
            // Fallback al modelo por defecto
            console.log(`[Model Selector] ⚠️ No se encontraron modelos disponibles, usando fallback`);
            return 'llama-3.1-8b-instant';
        }
        catch (error) {
            console.error('[Model Selector] ❌ Error obteniendo modelo:', error);
            return 'llama-3.1-8b-instant';
        }
    }
    /**
     * Actualizar lista de modelos disponibles
     */
    static async updateAvailableModels() {
        console.log('[Model Selector] 🔍 Detectando modelos disponibles...');
        const availableModels = [];
        for (const model of this.GROQ_MODELS) {
            try {
                // Intentar una llamada de prueba muy pequeña
                const testResponse = await this.groq.chat.completions.create({
                    model: model.id,
                    messages: [{ role: 'user', content: 'Hi' }],
                    max_tokens: 5,
                    temperature: 0
                });
                if (testResponse.choices && testResponse.choices.length > 0) {
                    availableModels.push({
                        ...model,
                        available: true,
                        lastUsed: new Date()
                    });
                    console.log(`[Model Selector] ✅ ${model.id} - Disponible`);
                }
            }
            catch (error) {
                const errorMessage = error?.message || String(error);
                // Si es rate limit, el modelo existe pero está agotado
                if (errorMessage.includes('rate_limit_exceeded')) {
                    availableModels.push({
                        ...model,
                        available: false,
                        lastError: 'Rate limit exceeded'
                    });
                    console.log(`[Model Selector] ⏳ ${model.id} - Rate limit alcanzado`);
                }
                // Si es modelo no encontrado, no está disponible
                else if (errorMessage.includes('model_not_found') || errorMessage.includes('404')) {
                    console.log(`[Model Selector] ❌ ${model.id} - No encontrado`);
                }
                // Otros errores
                else {
                    availableModels.push({
                        ...model,
                        available: false,
                        lastError: errorMessage
                    });
                    console.log(`[Model Selector] ⚠️ ${model.id} - Error: ${errorMessage.substring(0, 50)}`);
                }
            }
            // Pequeña pausa entre pruebas para no saturar la API
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.modelCache = availableModels;
        this.lastCheck = new Date();
        const availableCount = availableModels.filter(m => m.available).length;
        console.log(`[Model Selector] 📊 Resumen: ${availableCount}/${this.GROQ_MODELS.length} modelos disponibles`);
    }
    /**
     * Obtener lista de modelos disponibles
     */
    static async getAvailableModels() {
        if (this.modelCache.length === 0 || !this.lastCheck) {
            await this.updateAvailableModels();
        }
        return this.modelCache.filter(m => m.available);
    }
    /**
     * Obtener estadísticas de modelos
     */
    static async getModelStats() {
        if (this.modelCache.length === 0 || !this.lastCheck) {
            await this.updateAvailableModels();
        }
        return {
            total: this.modelCache.length,
            available: this.modelCache.filter(m => m.available).length,
            rateLimited: this.modelCache.filter(m => m.lastError?.includes('rate_limit')).length,
            models: this.modelCache
        };
    }
    /**
     * Forzar actualización de modelos
     */
    static async forceUpdate() {
        this.lastCheck = null;
        this.modelCache = [];
        await this.updateAvailableModels();
    }
    /**
     * Obtener modelo alternativo si el actual falla
     */
    static async getAlternativeModel(failedModel) {
        const available = this.modelCache.filter(m => m.available && m.id !== failedModel);
        if (available.length > 0) {
            // Ordenar por velocidad y calidad
            available.sort((a, b) => {
                const speedScore = { fast: 3, medium: 2, slow: 1 };
                const qualityScore = { high: 3, medium: 2, low: 1 };
                const scoreA = speedScore[a.speed] + qualityScore[a.quality];
                const scoreB = speedScore[b.speed] + qualityScore[b.quality];
                return scoreB - scoreA;
            });
            console.log(`[Model Selector] 🔄 Modelo alternativo: ${available[0].id}`);
            return available[0].id;
        }
        return null;
    }
    /**
     * Marcar modelo como fallido
     */
    static markModelAsFailed(modelId, error) {
        const model = this.modelCache.find(m => m.id === modelId);
        if (model) {
            model.available = false;
            model.lastError = error;
            console.log(`[Model Selector] ❌ Modelo ${modelId} marcado como fallido: ${error}`);
        }
    }
}
exports.AIModelSelector = AIModelSelector;
AIModelSelector.groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY || ''
});
AIModelSelector.modelCache = [];
AIModelSelector.lastCheck = null;
AIModelSelector.checkInterval = 5 * 60 * 1000; // 5 minutos
/**
 * Lista de modelos de Groq ordenados por preferencia
 */
AIModelSelector.GROQ_MODELS = [
    {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B Instant',
        tokensPerDay: 100000,
        speed: 'fast',
        quality: 'high'
    },
    {
        id: 'llama-3.2-3b-preview',
        name: 'Llama 3.2 3B Preview',
        tokensPerDay: 100000,
        speed: 'fast',
        quality: 'medium'
    },
    {
        id: 'llama-3.2-1b-preview',
        name: 'Llama 3.2 1B Preview',
        tokensPerDay: 100000,
        speed: 'fast',
        quality: 'medium'
    },
    {
        id: 'gemma2-9b-it',
        name: 'Gemma 2 9B',
        tokensPerDay: 100000,
        speed: 'fast',
        quality: 'high'
    },
    {
        id: 'gemma-7b-it',
        name: 'Gemma 7B',
        tokensPerDay: 100000,
        speed: 'fast',
        quality: 'medium'
    },
    {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        tokensPerDay: 100000,
        speed: 'medium',
        quality: 'high'
    },
    {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B Versatile',
        tokensPerDay: 100000,
        speed: 'slow',
        quality: 'high'
    }
];
