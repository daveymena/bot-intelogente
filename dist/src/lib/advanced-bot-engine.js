"use strict";
/**
 * 🤖 MOTOR AVANZADO DE BOT CON RAZONAMIENTO LOCAL DE NIVEL IA
 *
 * Sistema que combina agentes especializados con razonamiento local sofisticado
 * para proporcionar respuestas de calidad AI sin depender de tokens externos.
 *
 * CARACTERÍSTICAS:
 * - Razonamiento profundo sin IA externa
 * - Agentes especializados integrados
 * - Conversión de ventas inteligente
 * - Manejo robusto de cualquier producto
 * - Validaciones y fallbacks avanzados
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedBotEngine = void 0;
const deep_reasoning_agent_1 = require("../agents/deep-reasoning-agent");
const search_agent_1 = require("../agents/search-agent");
const greeting_agent_1 = require("../agents/greeting-agent");
const shared_memory_1 = require("../agents/shared-memory");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY || ''
});
// ============================================
// 1. MEMORIA COMPARTIDA AVANZADA
// ============================================
class AdvancedMemoryManager {
    static getMemory(chatId, userId) {
        return this.memoryService.get(chatId, userId);
    }
    static addMessage(chatId, role, content) {
        this.memoryService.addMessage(chatId, role, content);
    }
    static updateMemory(chatId, updates) {
        this.memoryService.update(chatId, updates);
    }
    static clearMemory(chatId) {
        this.memoryService.clear(chatId);
    }
}
AdvancedMemoryManager.memoryService = shared_memory_1.SharedMemoryService.getInstance();
// ============================================
// 2. ORQUESTADOR DE AGENTES
// ============================================
class AgentOrchestrator {
    constructor() {
        this.agents = {
            greeting: new greeting_agent_1.GreetingAgent(),
            search: new search_agent_1.SearchAgent(),
            deepReasoning: new deep_reasoning_agent_1.DeepReasoningAgent()
        };
    }
    async processWithAgents(chatId, message, memory) {
        console.log('\n🤖 [AGENT ORCHESTRATOR] Procesando con agentes especializados...');
        // 1. Análisis profundo del contexto
        const reasoning = await deep_reasoning_agent_1.DeepReasoningAgent.analyzeContext(chatId, message, memory);
        console.log(`🎯 Intención detectada: ${reasoning.userIntent.primary} (${(reasoning.userIntent.confidence * 100).toFixed(0)}%)`);
        // 2. Ejecutar agente apropiado según intención
        let agentResponse = null;
        switch (reasoning.userIntent.primary) {
            case 'greeting':
                agentResponse = await this.agents.greeting.execute(message, memory);
                break;
            case 'search_product':
            case 'request_photo_unclear':
            case 'request_price_unclear':
                agentResponse = await this.agents.search.execute(message, memory);
                break;
            default:
                // Para intenciones complejas, usar búsqueda inteligente
                agentResponse = await this.agents.search.execute(message, memory);
        }
        // 3. Aplicar recomendaciones del razonamiento profundo
        const enhancedResponse = this.applyReasoningRecommendations(agentResponse, reasoning);
        return {
            response: enhancedResponse.text,
            confidence: agentResponse.confidence || 0.8,
            actions: agentResponse.actions || []
        };
    }
    applyReasoningRecommendations(agentResponse, reasoning) {
        let enhanced = { ...agentResponse };
        // Aplicar recomendaciones del agente de razonamiento
        if (reasoning.recommendations.shouldSendPhoto && reasoning.recommendations.productId) {
            enhanced.actions = enhanced.actions || [];
            enhanced.actions.push({
                type: 'send_photo',
                productId: reasoning.recommendations.productId
            });
        }
        if (reasoning.recommendations.shouldAskClarification) {
            enhanced.text += `\n\n${reasoning.recommendations.clarificationNeeded}`;
        }
        return enhanced;
    }
}
// ============================================
// 3. GENERADOR DE RESPUESTAS DE VENTAS INTELIGENTE
// ============================================
class SalesResponseGenerator {
    /**
     * Genera respuestas de conversión sutiles como un experto en ventas
     */
    static generateSalesResponse(product, context, intent) {
        const productName = product.name;
        const price = product.price.toLocaleString('es-CO');
        const category = product.category;
        // Estrategias de conversión según el contexto
        switch (intent) {
            case 'price_inquiry':
                return this.handlePriceInquiry(product, price);
            case 'feature_question':
                return this.handleFeatureQuestion(product);
            case 'comparison_request':
                return this.handleComparisonRequest(product);
            case 'objection_handling':
                return this.handleObjection(product, context.lastMessage);
            default:
                return this.generateGeneralSalesPitch(product, price);
        }
    }
    static handlePriceInquiry(product, price) {
        const responses = [
            `Excelente elección con el ${product.name}! El precio es de $${price} COP, y te aseguro que es una inversión que vale la pena. ¿Te gustaría que te cuente más sobre sus características?`,
            `¡Perfecto! El ${product.name} tiene un valor de $${price} COP. Es uno de nuestros productos más vendidos porque realmente cumple con lo que promete. ¿Quieres saber qué incluye?`,
            `El precio del ${product.name} es $${price} COP. Es un precio justo por la calidad que obtienes. ¿Te interesa conocer las opiniones de otros clientes que ya lo tienen?`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    static handleFeatureQuestion(product) {
        const features = this.extractKeyFeatures(product.description);
        if (features.length === 0) {
            return `El ${product.name} es excelente en su categoría. ¿Hay algo específico que te gustaría saber sobre él?`;
        }
        let response = `¡Claro! El ${product.name} destaca por:\n\n`;
        features.slice(0, 3).forEach(feature => {
            response += `✅ ${feature}\n`;
        });
        response += `\n¿Te gustaría ver fotos o saber más sobre alguna de estas características?`;
        return response;
    }
    static handleComparisonRequest(product) {
        return `El ${product.name} se destaca en su categoría por su relación calidad-precio. Comparado con opciones similares, ofrece mejores características a un precio competitivo. ¿Qué aspectos te gustaría comparar específicamente?`;
    }
    static handleObjection(product, objection) {
        const lowerObjection = objection.toLowerCase();
        if (lowerObjection.includes('caro') || lowerObjection.includes('precio')) {
            return `Entiendo tu preocupación por el precio. Sin embargo, el ${product.name} ofrece un valor excepcional que se amortiza rápidamente. ¿Te gustaría que te muestre cómo otros clientes han visto retorno en su inversión?`;
        }
        if (lowerObjection.includes('tiempo') || lowerObjection.includes('entrega')) {
            return `La entrega es rápida y segura. Normalmente llega en 2-3 días hábiles. ¿Te gustaría que verifique la disponibilidad específica para tu ubicación?`;
        }
        return `Entiendo tu preocupación. El ${product.name} ha sido diseñado pensando en clientes como tú. ¿Me permites aclarar ese punto específico?`;
    }
    static generateGeneralSalesPitch(product, price) {
        const pitches = [
            `El ${product.name} es perfecto para lo que necesitas. A solo $${price} COP, representa una excelente oportunidad. ¿Te gustaría conocer más detalles?`,
            `¡No te pierdas el ${product.name}! Es una de nuestras mejores opciones a $${price} COP. ¿Quieres que te ayude con el proceso de compra?`,
            `El ${product.name} combina calidad y precio accesible. Por solo $${price} COP, obtienes exactamente lo que buscas. ¿Te interesa proceder?`
        ];
        return pitches[Math.floor(Math.random() * pitches.length)];
    }
    static extractKeyFeatures(description) {
        const features = [];
        // Buscar características en la descripción
        const lines = description.split('\n');
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('✅')) {
                const feature = trimmed.replace(/^[•\-✅]\s*/, '').trim();
                if (feature.length > 10 && feature.length < 100) {
                    features.push(feature);
                }
            }
        });
        return features;
    }
}
// ============================================
// 4. MOTOR PRINCIPAL AVANZADO
// ============================================
class AdvancedBotEngine {
    /**
     * Procesar mensaje con razonamiento avanzado local
     */
    static async processMessage(chatId, userId, message) {
        try {
            console.log(`\n🚀 [ADVANCED BOT] Procesando mensaje avanzado: "${message}"`);
            // 1. Obtener memoria avanzada
            const memory = AdvancedMemoryManager.getMemory(chatId, userId);
            AdvancedMemoryManager.addMessage(chatId, 'user', message);
            // 2. Procesar con agentes especializados
            const agentResult = await this.orchestrator.processWithAgents(chatId, message, memory);
            let response = agentResult.response;
            // 3. Aplicar lógica de ventas inteligente si hay producto en contexto
            if (memory.currentProduct && agentResult.confidence > 0.7) {
                const salesResponse = SalesResponseGenerator.generateSalesResponse(memory.currentProduct, { lastMessage: message }, this.detectSalesIntent(message));
                // Combinar respuesta del agente con respuesta de ventas
                response = this.combineResponses(response, salesResponse);
            }
            // 4. Fallback a IA si la confianza es baja y hay tokens disponibles
            if (agentResult.confidence < 0.6 && this.shouldUseAI(message)) {
                console.log('🤖 Confianza baja, usando IA como fallback...');
                const aiResponse = await this.generateAIResponse(message, memory);
                if (aiResponse) {
                    response = aiResponse;
                }
            }
            // 5. Guardar respuesta en memoria
            AdvancedMemoryManager.addMessage(chatId, 'assistant', response);
            console.log(`✅ [ADVANCED BOT] Respuesta generada (${response.length} caracteres, confianza: ${(agentResult.confidence * 100).toFixed(0)}%)`);
            return response;
        }
        catch (error) {
            console.error('❌ [ADVANCED BOT] Error:', error);
            return `Disculpa, tuve un problema técnico. ¿Puedes intentar de nuevo? 😊`;
        }
    }
    /**
     * Detectar intención de ventas
     */
    static detectSalesIntent(message) {
        const lower = message.toLowerCase();
        if (lower.includes('precio') || lower.includes('cuesta') || lower.includes('vale')) {
            return 'price_inquiry';
        }
        if (lower.includes('característica') || lower.includes('funcion') || lower.includes('hace')) {
            return 'feature_question';
        }
        if (lower.includes('comparado') || lower.includes('versus') || lower.includes('mejor')) {
            return 'comparison_request';
        }
        if (lower.includes('caro') || lower.includes('mucho') || lower.includes('espera')) {
            return 'objection_handling';
        }
        return 'general_inquiry';
    }
    /**
     * Combinar respuestas de agentes con respuestas de ventas
     */
    static combineResponses(agentResponse, salesResponse) {
        // Si la respuesta del agente ya incluye elementos de ventas, usar solo esa
        if (agentResponse.includes('💰') || agentResponse.includes('comprar') || agentResponse.includes('precio')) {
            return agentResponse;
        }
        // Combinar inteligentemente
        return `${agentResponse}\n\n${salesResponse}`;
    }
    /**
     * Determinar si usar IA como fallback
     */
    static shouldUseAI(message) {
        // Usar IA solo para consultas muy complejas o cuando el sistema local no está seguro
        const complexPatterns = [
            /como funciona/i,
            /diferencia entre/i,
            /cual es mejor/i,
            /recomienda/i,
            /opinion/i
        ];
        return complexPatterns.some(pattern => pattern.test(message)) && !!process.env.GROQ_API_KEY;
    }
    /**
     * Generar respuesta con IA como fallback
     */
    static async generateAIResponse(message, memory) {
        try {
            const context = memory.messages.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n');
            const prompt = `Eres un asistente de ventas experto para Tecnovariedades D&S.
Contexto reciente:
${context}

Mensaje del cliente: ${message}

Responde de manera profesional, persuasiva pero no agresiva. Mantén la conversación fluida.`;
            const completion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.1-8b-instant',
                temperature: 0.7,
                max_tokens: 200
            });
            return completion.choices[0]?.message?.content || null;
        }
        catch (error) {
            console.error('Error generando respuesta con IA:', error);
            return null;
        }
    }
    /**
     * Limpiar memoria de un chat
     */
    static clearMemory(chatId) {
        AdvancedMemoryManager.clearMemory(chatId);
        console.log(`🧹 Memoria avanzada limpiada para ${chatId}`);
    }
    /**
     * Obtener estado de memoria para debugging
     */
    static getMemoryState(chatId, userId) {
        return AdvancedMemoryManager.getMemory(chatId, userId);
    }
}
exports.AdvancedBotEngine = AdvancedBotEngine;
AdvancedBotEngine.orchestrator = new AgentOrchestrator();
