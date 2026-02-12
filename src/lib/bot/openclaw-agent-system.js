/*
 * 🤖 OpenClaw Agent System v1.0
 * El "director de orquesta" que analiza intenciones y decide qué herramientas usar.
 * Implementado para TecnoVariedades D&S
 */

import dotenv from 'dotenv';
dotenv.config();

/**
 * 🛠️ SISTEMA DE HERRAMIENTAS (TOOLS)
 * Define capacidades adicionales para la IA
 */
export const TOOLS = {
    get_payment_info: {
        name: 'get_payment_info',
        description: 'Obtiene detalles de cuentas bancarias (Bancolombia) y Nequi para concretar la venta.',
        parameters: {},
        execute: async (params, context) => {
            return {
                success: true,
                data: {
                    bank: {
                        name: process.env.BANK_NAME || 'Bancolombia',
                        account: process.env.BANK_ACCOUNT_NUMBER || '1234567890',
                        holder: process.env.BANK_ACCOUNT_HOLDER || 'Nombre Titular'
                    },
                    nequi: {
                        number: process.env.NEQUI_NUMBER || '3136174267'
                    }
                }
            };
        }
    },
    get_product_details: {
        name: 'get_product_details',
        description: 'Obtiene detalles técnicos y links de pago de un producto específico.',
        parameters: {
            productId: { type: 'string', description: 'ID único del producto' }
        },
        execute: async (params, context) => {
            const product = context.products.find(p => p.id === params.productId);
            if (!product) return { success: false, message: 'Producto no encontrado' };
            return { success: true, data: product };
        }
    }
};

class OpenClawAgent {
    constructor() {
        this.conversationHistory = new Map();
        this.maxHistory = 20;
    }

    /**
     * Procesa un mensaje entrante y decide la mejor acción
     * @param {string} messageText - El texto enviado por el usuario
     * @param {string} from - ID del usuario (número de teléfono)
     * @param {object} contextBot - Datos del negocio y productos
     */
    async processMessage(messageText, from, contextBot) {
        try {
            console.log(`[OpenClaw] 📩 Procesando de ${from}: "${messageText}"`);
            
            // 1. Gestionar Memoria
            if (!this.conversationHistory.has(from)) {
                this.conversationHistory.set(from, []);
            }
            const history = this.conversationHistory.get(from);

            // 2. Análisis de Intención (Clasificación Interna)
            const analysis = await this._analyzeIntention(messageText, history, contextBot);
            
            let toolResult = null;
            if (analysis.toolToUse && TOOLS[analysis.toolToUse]) {
                console.log(`[OpenClaw] 🔧 Ejecutando herramienta: ${analysis.toolToUse}`);
                toolResult = await TOOLS[analysis.toolToUse].execute(analysis.toolParams, contextBot);
            }

            // 3. Generar Respuesta con el Proveedor configurado
            const response = await this._generateResponse(messageText, history, contextBot, toolResult);

            // 4. Actualizar Memoria (limitar a 20 mensajes)
            history.push({ role: 'user', content: messageText });
            history.push({ role: 'assistant', content: response });
            if (history.length > this.maxHistory * 2) {
                this.conversationHistory.set(from, history.slice(-this.maxHistory * 2));
            }

            return { 
                text: response, 
                toolUsed: analysis.toolToUse,
                success: true
            };
        } catch (error) {
            console.error('[OpenClaw Agent Error]:', error);
            return { 
                text: "David: Tuve un pequeño contratiempo procesando tu solicitud. ¡Pero aquí estoy! ¿Qué necesitas exactamente? 😊",
                success: false
            };
        }
    }

    /**
     * Clasificador de intenciones ultra-rápido
     */
    async _analyzeIntention(text, history, context) {
        const lowerText = text.toLowerCase();
        
        // Detección simple para pagos
        if (lowerText.includes('pagar') || lowerText.includes('nequi') || lowerText.includes('cuenta') || lowerText.includes('bancolombia')) {
            return { toolToUse: 'get_payment_info', toolParams: {} };
        }

        // Detección de productos específicos
        const productMatch = context.products.find(p => lowerText.includes(p.name.toLowerCase()));
        if (productMatch) {
            return { toolToUse: 'get_product_details', toolParams: { productId: productMatch.id } };
        }

        return { toolToUse: null, toolParams: {} };
    }

    /**
     * Motor de Generación de Respuesta (Ollama/Groq)
     */
    async _generateResponse(userMessage, history, context, toolResult) {
        const provider = process.env.AI_PROVIDER || 'ollama';
        
        const systemPrompt = `
Eres David, el asistente virtual oficial de "${context.business.name}".
PERSONALIDAD: Profesional, innovador, extremadamente servicial y persuasivo. Usa emojis (🚀, ✅, 💻, 💳) para que la charla sea amena.

CONTEXTO DEL NEGOCIO:
${JSON.stringify(context.business)}

${toolResult ? `DATOS OBTENIDOS (HERRAMIENTA): ${JSON.stringify(toolResult.data)}` : ''}

INFORMACIÓN DE PRODUCTOS DISPONIBLES:
${context.products.map(p => `- ${p.name}: $${p.price} ${p.currency}`).join('\n')}

INSTRUCCIONES:
1. Si el usuario pregunta por pagos, da la información de Nequi/Bancolombia que recibiste.
2. Si pregunta por un producto, resalta sus beneficios (no solo specs).
3. Responde siempre en español.
4. Si no sabes algo, invita al usuario a esperar que un humano lo contacte.
        `.trim();

        if (process.env.USE_OLLAMA === 'true' && provider === 'ollama') {
            return await this._callOllama(systemPrompt, history, userMessage);
        } else {
            return await this._callGroq(systemPrompt, history, userMessage);
        }
    }

    async _callGroq(systemPrompt, history, message) {
        const keys = [
            process.env.GROQ_API_KEY,
            process.env.GROQ_API_KEY_2,
            process.env.GROQ_API_KEY_3,
            process.env.GROQ_API_KEY_4,
            process.env.GROQ_API_KEY_5
        ].filter(Boolean);

        for (const key of keys) {
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
                        messages: [
                            { role: 'system', content: systemPrompt },
                            ...history,
                            { role: 'user', content: message }
                        ],
                        temperature: 0.7,
                        max_tokens: 800
                    })
                });
                
                if (!response.ok) throw new Error(`Groq HTTP Error: ${response.status}`);
                
                const data = await response.json();
                return data.choices[0].message.content;
            } catch (e) {
                console.error(`[OpenClaw] ⚠️ Error con API Key de Groq, intentando la siguiente...`, e.message);
                continue; // Probar con la siguiente llave
            }
        }
        return "David: Mis sistemas de IA están muy ocupados en este momento. ¡Pero no te preocupes! Déjame tu duda y te responderé en cuanto recupere la conexión. 😊";
    }

    async _callOllama(systemPrompt, history, message) {
        try {
            const response = await fetch(`${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: process.env.OLLAMA_MODEL || 'gemma2:2b',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...history,
                        { role: 'user', content: message }
                    ],
                    stream: false
                })
            });
            const data = await response.json();
            return data.message.content;
        } catch (e) {
            console.error('Ollama Local Error:', e);
            // Fallback a Groq si Ollama falla
            return await this._callGroq(systemPrompt, history, message);
        }
    }
}

export const openClawAgent = new OpenClawAgent();
