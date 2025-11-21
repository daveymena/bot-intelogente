"use strict";
/**
 * Clase Base para Todos los Agentes
 * Cada agente hereda de esta clase y implementa su lógica específica
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
class BaseAgent {
    constructor(name) {
        this.name = name;
    }
    /**
     * Log helper
     */
    log(message, data) {
        console.log(`[${this.name}] ${message}`, data || '');
    }
    /**
     * Formatea precio en COP
     */
    formatPrice(price) {
        return `${price.toLocaleString('es-CO')} COP`;
    }
    /**
     * Detecta palabras clave en el mensaje
     */
    hasKeywords(message, keywords) {
        const lowerMessage = message.toLowerCase();
        return keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
    }
    /**
     * Limpia el mensaje del usuario
     */
    cleanMessage(message) {
        return message
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''); // Quitar acentos
    }
}
exports.BaseAgent = BaseAgent;
