"use strict";
/**
 * 🧠 SISTEMA DE RAZONAMIENTO AVANZADO CON IA
 * Ollama (Principal) + Groq (Respaldo)
 * Con Chain of Thought y análisis profundo
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAdvancedReasoning = void 0;
class AIAdvancedReasoning {
    /**
     * 🎯 MÉTODO PRINCIPAL: Generar respuesta con razonamiento profundo
     */
    static async generateWithReasoning(messages, options = {}) {
        const { useReasoning = true, temperature = 0.7, maxTokens = 500 } = options;
        console.log('[AI Advanced] 🧠 Iniciando generación con razonamiento...');
        // Si se solicita razonamiento, agregar prompt especial
        if (useReasoning) {
            messages = this.addReasoningPrompt(messages);
        }
        // Intentar con Ollama primero
        try {
            console.log('[AI Advanced] 🔄 Intentando con Ollama...');
            const ollamaResponse = await this.tryOllama(messages, { temperature, maxTokens });
            if (ollamaResponse.content) {
                console.log('[AI Advanced] ✅ Éxito con Ollama');
                return {
                    ...ollamaResponse,
                    confidence: 0.95
                };
            }
        }
        catch (error) {
            console.error('[AI Advanced] ❌ Ollama falló:', error.message);
        }
        // Si Ollama falla, usar Groq como respaldo
        try {
            console.log('[AI Advanced] 🔄 Usando Groq como respaldo...');
            const groqResponse = await this.tryGroq(messages, { temperature, maxTokens });
            if (groqResponse.content) {
                console.log('[AI Advanced] ✅ Éxito con Groq');
                return {
                    ...groqResponse,
                    confidence: 0.90
                };
            }
        }
        catch (error) {
            console.error('[AI Advanced] ❌ Groq falló:', error.message);
        }
        // Si ambos fallan, lanzar error
        throw new Error('Todas las IAs fallaron. Verifica tu configuración.');
    }
    /**
     * 🧠 Agregar prompt de razonamiento profundo
     */
    static addReasoningPrompt(messages) {
        const reasoningPrompt = `
Antes de responder, piensa paso a paso:

1. ANÁLISIS: ¿Qué está preguntando realmente el cliente?
2. CONTEXTO: ¿Qué información relevante tengo del historial?
3. INTENCIÓN: ¿Cuál es su objetivo principal?
4. ACCIÓN: ¿Qué necesita para resolver su consulta?
5. RESPUESTA: Genera una respuesta clara, natural y útil.

Usa un tono amigable, profesional y conversacional.
Sé específico y directo.
Si mencionas productos, incluye precios y detalles relevantes.
Si necesitas más información, pregunta de forma natural.
`;
        // Agregar el prompt de razonamiento al sistema
        const systemMessage = messages.find(m => m.role === 'system');
        if (systemMessage) {
            systemMessage.content += '\n\n' + reasoningPrompt;
            return messages;
        }
        else {
            return [
                { role: 'system', content: reasoningPrompt },
                ...messages
            ];
        }
    }
    /**
     * 🤖 Intentar con Ollama
     */
    static async tryOllama(messages, options) {
        const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        const ollamaModel = process.env.OLLAMA_MODEL || 'gemma:2b';
        const timeout = parseInt(process.env.OLLAMA_TIMEOUT || '60000');
        if (!process.env.OLLAMA_ENABLED || process.env.OLLAMA_ENABLED !== 'true') {
            throw new Error('Ollama no está habilitado');
        }
        console.log(`[Ollama] 📡 Conectando a: ${ollamaUrl}`);
        console.log(`[Ollama] 🤖 Modelo: ${ollamaModel}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(`${ollamaUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: ollamaModel,
                    messages: messages,
                    stream: false,
                    options: {
                        temperature: options.temperature,
                        num_predict: options.maxTokens,
                    }
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ollama HTTP ${response.status}: ${errorText}`);
            }
            const data = await response.json();
            if (!data.message || !data.message.content) {
                throw new Error('Respuesta de Ollama inválida');
            }
            return {
                content: data.message.content,
                provider: 'ollama',
                model: ollamaModel,
                confidence: 0.95
            };
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error(`Ollama timeout después de ${timeout}ms`);
            }
            throw error;
        }
    }
    /**
     * ⚡ Intentar con Groq
     */
    static async tryGroq(messages, options) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY no configurado');
        }
        const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
        const timeout = parseInt(process.env.GROQ_TIMEOUT || '5000');
        console.log(`[Groq] ⚡ Modelo: ${model}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    temperature: options.temperature,
                    max_tokens: options.maxTokens,
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Groq HTTP ${response.status}: ${errorText}`);
            }
            const data = await response.json();
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Respuesta de Groq inválida');
            }
            return {
                content: data.choices[0].message.content,
                provider: 'groq',
                model: model,
                confidence: 0.90
            };
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error(`Groq timeout después de ${timeout}ms`);
            }
            throw error;
        }
    }
    /**
     * 🔍 Analizar intención del mensaje con razonamiento
     */
    static async analyzeIntent(message, context) {
        const messages = [
            {
                role: 'system',
                content: `Eres un experto en análisis de intenciones de clientes.
Analiza el mensaje y determina:
1. La intención principal (comprar, preguntar_precio, pedir_info, saludar, etc.)
2. Tu nivel de confianza (0-1)
3. Si necesitas más información

Responde en formato JSON:
{
  "intent": "nombre_de_la_intencion",
  "confidence": 0.95,
  "reasoning": "explicación breve",
  "needsMoreInfo": false
}`
            },
            {
                role: 'user',
                content: `Mensaje del cliente: "${message}"
${context && context.length > 0 ? `\nContexto previo: ${context.join(', ')}` : ''}`
            }
        ];
        try {
            const response = await this.generateWithReasoning(messages, {
                useReasoning: false,
                temperature: 0.3,
                maxTokens: 200
            });
            // Intentar parsear JSON de la respuesta
            const jsonMatch = response.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                return result;
            }
            // Si no hay JSON, retornar análisis básico
            return {
                intent: 'unknown',
                confidence: 0.5,
                reasoning: response.content,
                needsMoreInfo: true
            };
        }
        catch (error) {
            console.error('[AI Advanced] Error analizando intención:', error);
            return {
                intent: 'unknown',
                confidence: 0.3,
                reasoning: 'Error en análisis',
                needsMoreInfo: true
            };
        }
    }
    /**
     * 💬 Generar respuesta conversacional con contexto
     */
    static async generateConversationalResponse(userMessage, conversationHistory, systemContext) {
        const messages = [
            {
                role: 'system',
                content: systemContext
            },
            ...conversationHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            })),
            {
                role: 'user',
                content: userMessage
            }
        ];
        return await this.generateWithReasoning(messages, {
            useReasoning: true,
            temperature: 0.7,
            maxTokens: 500
        });
    }
}
exports.AIAdvancedReasoning = AIAdvancedReasoning;
