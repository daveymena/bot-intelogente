/**
 * 🔄 SISTEMA DE ROTACIÓN AUTOMÁTICA DE APIs GROQ
 * 
 * Características:
 * - Múltiples APIs de Groq
 * - Rotación automática cuando se agotan tokens
 * - Prueba todos los modelos disponibles
 * - Fallback inteligente
 * - Registro de uso y errores
 */

import Groq from 'groq-sdk';

interface GroqAPIConfig {
    apiKey: string;
    name: string;
    isActive: boolean;
    failCount: number;
    lastError?: string;
    lastUsed?: Date;
}

interface ModelConfig {
    name: string;
    isActive: boolean;
    failCount: number;
}

export class GroqAPIRotator {
    private static apis: GroqAPIConfig[] = [
        process.env.GROQ_API_KEY,
        process.env.GROQ_API_KEY_2,
        process.env.GROQ_API_KEY_3,
        process.env.GROQ_API_KEY_4,
        process.env.GROQ_API_KEY_5,
        process.env.GROQ_API_KEY_6,
        process.env.GROQ_API_KEY_7,
        process.env.GROQ_API_KEY_8
    ]
        .filter((key): key is string => !!key && key.length > 0)
        .map((apiKey, index) => ({
            apiKey,
            name: `API-${index + 1}`,
            isActive: true,
            failCount: 0
        }));

    private static models: ModelConfig[] = [
        { name: 'llama-3.1-8b-instant', isActive: true, failCount: 0 },      // PRIMERO: Más rápido y consume menos tokens
        { name: 'gemma2-9b-it', isActive: true, failCount: 0 },              // SEGUNDO: Bueno y eficiente
        { name: 'mixtral-8x7b-32768', isActive: true, failCount: 0 },        // TERCERO: Más potente
        { name: 'llama-3.3-70b-versatile', isActive: true, failCount: 0 }    // ÚLTIMO: Solo si los demás fallan
    ];

    private static currentApiIndex = 0;
    private static currentModelIndex = 0;
    private static maxFailsBeforeRotate = 3;

    /**
     * 🚀 Realizar llamada a Groq con rotación automática
     */
    static async makeRequest(
        messages: any[],
        options: {
            temperature?: number;
            maxTokens?: number;
            preferredModel?: string;
        } = {}
    ): Promise<string> {
        const startTime = Date.now();
        let lastError: Error | null = null;

        // Intentar con todas las combinaciones de API + Modelo
        for (let apiAttempt = 0; apiAttempt < this.apis.length; apiAttempt++) {
            const api = this.getCurrentAPI();

            if (!api.isActive) {
                console.log(`[Groq Rotator] ⏭️  ${api.name} desactivada, probando siguiente...`);
                this.rotateAPI();
                continue;
            }

            for (let modelAttempt = 0; modelAttempt < this.models.length; modelAttempt++) {
                const model = this.getCurrentModel();

                if (!model.isActive) {
                    console.log(`[Groq Rotator] ⏭️  Modelo ${model.name} desactivado, probando siguiente...`);
                    this.rotateModel();
                    continue;
                }

                try {
                    console.log(`[Groq Rotator] 🔄 Intentando ${api.name} con ${model.name}...`);

                    const groq = new Groq({ apiKey: api.apiKey });
                    const completion = await groq.chat.completions.create({
                        messages,
                        model: model.name,
                        temperature: options.temperature ?? 0.7,
                        max_tokens: options.maxTokens ?? 500
                    });

                    const response = completion.choices[0]?.message?.content || '';
                    const duration = Date.now() - startTime;

                    // ✅ Éxito - resetear contadores
                    api.failCount = 0;
                    model.failCount = 0;
                    api.lastUsed = new Date();

                    console.log(`[Groq Rotator] ✅ Éxito con ${api.name} + ${model.name} (${duration}ms)`);

                    return response;

                } catch (error: any) {
                    lastError = error;
                    const errorMsg = error.message || String(error);

                    console.log(`[Groq Rotator] ❌ Error con ${api.name} + ${model.name}: ${errorMsg}`);

                    // Analizar tipo de error
                    if (this.isRateLimitError(error)) {
                        console.log(`[Groq Rotator] 🚫 Rate limit alcanzado en ${api.name}`);
                        api.failCount++;

                        if (api.failCount >= this.maxFailsBeforeRotate) {
                            console.log(`[Groq Rotator] ⚠️  ${api.name} desactivada temporalmente`);
                            api.isActive = false;
                            api.lastError = 'Rate limit exceeded';
                        }

                        // Rotar a siguiente API inmediatamente
                        this.rotateAPI();
                        break; // Salir del loop de modelos, probar siguiente API

                    } else if (this.isModelError(error)) {
                        console.log(`[Groq Rotator] 🚫 Modelo ${model.name} no disponible`);
                        model.failCount++;

                        if (model.failCount >= this.maxFailsBeforeRotate) {
                            console.log(`[Groq Rotator] ⚠️  Modelo ${model.name} desactivado`);
                            model.isActive = false;
                        }

                        // Probar siguiente modelo
                        this.rotateModel();

                    } else {
                        // Error desconocido, probar siguiente combinación
                        console.log(`[Groq Rotator] ⚠️  Error desconocido, probando siguiente...`);
                        this.rotateModel();
                    }
                }
            }

            // Si llegamos aquí, todos los modelos fallaron con esta API
            // Rotar a siguiente API
            this.rotateAPI();
        }

        // Si llegamos aquí, todas las APIs y modelos fallaron
        console.error(`[Groq Rotator] ❌ TODAS LAS APIs AGOTADAS`);
        throw new Error(`Todas las APIs de Groq están agotadas o no disponibles. Último error: ${lastError?.message}`);
    }

    /**
     * 🔄 Rotar a siguiente API
     */
    private static rotateAPI(): void {
        this.currentApiIndex = (this.currentApiIndex + 1) % this.apis.length;
        console.log(`[Groq Rotator] 🔄 Rotando a ${this.getCurrentAPI().name}`);
    }

    /**
     * 🔄 Rotar a siguiente modelo
     */
    private static rotateModel(): void {
        this.currentModelIndex = (this.currentModelIndex + 1) % this.models.length;
        console.log(`[Groq Rotator] 🔄 Rotando a modelo ${this.getCurrentModel().name}`);
    }

    /**
     * 📊 Obtener API actual
     */
    private static getCurrentAPI(): GroqAPIConfig {
        return this.apis[this.currentApiIndex];
    }

    /**
     * 📊 Obtener modelo actual
     */
    private static getCurrentModel(): ModelConfig {
        return this.models[this.currentModelIndex];
    }

    /**
     * 🔍 Detectar error de rate limit
     */
    private static isRateLimitError(error: any): boolean {
        const errorMsg = error.message?.toLowerCase() || String(error).toLowerCase();
        return (
            errorMsg.includes('rate limit') ||
            errorMsg.includes('quota') ||
            errorMsg.includes('too many requests') ||
            error.status === 429
        );
    }

    /**
     * 🔍 Detectar error de modelo
     */
    private static isModelError(error: any): boolean {
        const errorMsg = error.message?.toLowerCase() || String(error).toLowerCase();
        return (
            errorMsg.includes('model') ||
            errorMsg.includes('decommissioned') ||
            errorMsg.includes('not found') ||
            error.status === 404
        );
    }

    /**
     * 🔄 Reactivar APIs después de un tiempo
     */
    static reactivateAPIs(): void {
        console.log('[Groq Rotator] 🔄 Reactivando todas las APIs...');
        this.apis.forEach(api => {
            api.isActive = true;
            api.failCount = 0;
            api.lastError = undefined;
        });
        this.models.forEach(model => {
            model.isActive = true;
            model.failCount = 0;
        });
        console.log('[Groq Rotator] ✅ Todas las APIs reactivadas');
    }

    /**
     * 📊 Obtener estado del sistema
     */
    static getStatus(): {
        apis: GroqAPIConfig[];
        models: ModelConfig[];
        currentAPI: string;
        currentModel: string;
    } {
        return {
            apis: this.apis,
            models: this.models,
            currentAPI: this.getCurrentAPI().name,
            currentModel: this.getCurrentModel().name
        };
    }

    /**
     * 🔧 Agregar nueva API
     */
    static addAPI(apiKey: string, name: string): void {
        this.apis.push({
            apiKey,
            name,
            isActive: true,
            failCount: 0
        });
        console.log(`[Groq Rotator] ➕ API ${name} agregada`);
    }

    /**
     * 🗑️ Remover API
     */
    static removeAPI(name: string): void {
        const index = this.apis.findIndex(api => api.name === name);
        if (index !== -1) {
            this.apis.splice(index, 1);
            console.log(`[Groq Rotator] ➖ API ${name} removida`);
        }
    }
}

// Reactivar APIs cada 1 hora
setInterval(() => {
    GroqAPIRotator.reactivateAPIs();
}, 60 * 60 * 1000);
