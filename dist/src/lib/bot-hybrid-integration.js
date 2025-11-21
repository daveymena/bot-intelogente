"use strict";
/**
 * 🤖 INTEGRACIÓN DEL SISTEMA HÍBRIDO CON BAILEYS
 * Conecta el bot de WhatsApp con el sistema inteligente
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotHybridIntegration = void 0;
const hybrid_intelligent_response_system_1 = require("./hybrid-intelligent-response-system");
const intelligent_product_query_system_1 = require("./intelligent-product-query-system");
class BotHybridIntegration {
    constructor(groqApiKey) {
        this.conversationHistory = new Map();
        this.useAI = true;
        if (groqApiKey) {
            // Inicializar sistema híbrido con IA
            this.initializeHybridSystem(groqApiKey);
            this.useAI = true;
        }
        else {
            // Usar solo sistema local (sin IA)
            this.useAI = false;
            console.log('⚠️  Sistema híbrido: Modo LOCAL (sin IA)');
        }
    }
    async initializeHybridSystem(groqApiKey) {
        try {
            this.hybridSystem = await (0, hybrid_intelligent_response_system_1.createGroqHybridSystem)(groqApiKey);
            console.log('✅ Sistema híbrido inicializado con IA');
        }
        catch (error) {
            console.error('❌ Error inicializando sistema híbrido:', error);
            this.useAI = false;
        }
    }
    /**
     * Procesar mensaje del cliente
     */
    async processMessage(message, from, userId) {
        try {
            // Obtener historial de conversación
            const history = this.conversationHistory.get(from) || [];
            let response;
            if (this.useAI && this.hybridSystem) {
                // MODO HÍBRIDO: BD + IA + Formato
                console.log('🧠 Procesando con sistema híbrido (BD + IA)');
                response = await this.hybridSystem.processMessage(message, userId, history);
            }
            else {
                // MODO LOCAL: Solo BD + Formato
                console.log('📦 Procesando con sistema local (solo BD)');
                response = await intelligent_product_query_system_1.IntelligentProductQuerySystem.processQuery(message, userId, history);
            }
            // Actualizar historial
            this.updateHistory(from, message, response);
            return response;
        }
        catch (error) {
            console.error('❌ Error procesando mensaje:', error);
            return '😅 Disculpa, tuve un problema procesando tu mensaje. ¿Puedes intentar de nuevo?';
        }
    }
    /**
     * Actualizar historial de conversación
     */
    updateHistory(from, userMessage, botResponse) {
        const history = this.conversationHistory.get(from) || [];
        history.push({ role: 'user', content: userMessage }, { role: 'assistant', content: botResponse });
        // Mantener solo los últimos 10 mensajes
        if (history.length > 10) {
            history.splice(0, history.length - 10);
        }
        this.conversationHistory.set(from, history);
    }
    /**
     * Limpiar historial de un usuario
     */
    clearHistory(from) {
        this.conversationHistory.delete(from);
    }
    /**
     * Cambiar modo de operación
     */
    setAIMode(enabled) {
        this.useAI = enabled;
        console.log(`🔄 Modo IA: ${enabled ? 'ACTIVADO' : 'DESACTIVADO'}`);
    }
}
exports.BotHybridIntegration = BotHybridIntegration;
