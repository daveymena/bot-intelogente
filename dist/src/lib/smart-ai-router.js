"use strict";
/**
 * 🧠 Smart AI Router
 * Decide qué IA usar según la complejidad de la pregunta
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartAIRouter = void 0;
class SmartAIRouter {
    /**
     * Determinar qué IA usar según el tipo de pregunta
     */
    static shouldUseGroq(message, hasProducts) {
        const normalized = message.toLowerCase().trim();
        // 1. SIEMPRE usar Groq para solicitudes de fotos/pagos/links
        if (this.isPhotoOrPaymentRequest(normalized)) {
            console.log('[SmartRouter] 🎯 Usando Groq: Solicitud de fotos/pago');
            return true;
        }
        // 2. SIEMPRE usar Groq para preguntas sobre información detallada
        if (this.isDetailedInfoRequest(normalized)) {
            console.log('[SmartRouter] 🎯 Usando Groq: Información detallada');
            return true;
        }
        // 3. SIEMPRE usar Groq si hay productos en contexto (para precisión)
        if (hasProducts) {
            console.log('[SmartRouter] 🎯 Usando Groq: Productos en contexto');
            return true;
        }
        // 4. SIEMPRE usar Groq para preguntas de compra/venta
        if (this.isSalesQuestion(normalized)) {
            console.log('[SmartRouter] 🎯 Usando Groq: Pregunta de ventas');
            return true;
        }
        // 5. Usar bot local (Ollama) para preguntas simples
        console.log('[SmartRouter] 🏠 Usando Ollama: Pregunta simple');
        return false;
    }
    /**
     * Detectar solicitudes de fotos o pagos
     */
    static isPhotoOrPaymentRequest(message) {
        const patterns = [
            // Fotos
            /\b(foto|fotos|imagen|pic|picture|muestra|enseña|ver)/i,
            // Pagos
            /\b(pago|pagar|comprar|link|lik|enlace|método|metodo|forma)/i,
            /\b(mercadopago|paypal|nequi|daviplata|tarjeta)/i,
        ];
        return patterns.some(p => p.test(message));
    }
    /**
     * Detectar preguntas sobre información detallada
     */
    static isDetailedInfoRequest(message) {
        const patterns = [
            // Información detallada
            /\b(qué incluye|que incluye|características|especificaciones|detalles)/i,
            /\b(cuánto cuesta|cuanto cuesta|precio|valor|costo)/i,
            /\b(información|info|dime sobre|háblame de|explica)/i,
            // Comparaciones
            /\b(diferencia|comparar|mejor|vs|versus)/i,
            // Disponibilidad
            /\b(disponible|hay|tienen|tienes|stock)/i,
        ];
        return patterns.some(p => p.test(message));
    }
    /**
     * Detectar preguntas de ventas
     */
    static isSalesQuestion(message) {
        const patterns = [
            /\b(comprar|adquirir|conseguir|obtener)/i,
            /\b(garantía|garantia|devolución|devolucion)/i,
            /\b(envío|envio|entrega|delivery)/i,
            /\b(descuento|oferta|promoción|promocion)/i,
        ];
        return patterns.some(p => p.test(message));
    }
    /**
     * Determinar si es una pregunta simple (puede usar Ollama)
     */
    static isSimpleQuestion(message) {
        const normalized = message.toLowerCase().trim();
        const simplePatterns = [
            // Saludos
            /^(hola|hey|buenos|buenas|hi|hello)/i,
            // Preguntas muy simples
            /^(sí|si|no|ok|vale|gracias|thank)/i,
            // Confirmaciones
            /^(entiendo|perfecto|excelente|genial)/i,
        ];
        return simplePatterns.some(p => p.test(normalized));
    }
    /**
     * Obtener el nombre del modelo a usar
     */
    static getModelName(useGroq) {
        return useGroq ? 'Groq (Llama 3.1)' : 'Ollama (Local)';
    }
}
exports.SmartAIRouter = SmartAIRouter;
