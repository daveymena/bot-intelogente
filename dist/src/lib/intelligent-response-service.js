"use strict";
/**
 * 🧠 SERVICIO DE RESPUESTAS INTELIGENTES
 * Sistema de razonamiento que decide cuándo usar bot local vs IA avanzada
 * Incluye demoras humanas y burbujas de "escribiendo..."
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligentResponseService = void 0;
const deep_reasoning_ai_service_1 = require("./deep-reasoning-ai-service");
class IntelligentResponseService {
    /**
     * Analizar complejidad del mensaje y decidir qué tipo de respuesta usar
     * ACTUALIZADO: Siempre usa IA para analizar contexto correctamente
     */
    static analyzeMessageComplexity(message) {
        const lowerMessage = message.toLowerCase();
        // 🟢 SOLO SALUDOS MUY BÁSICOS sin contexto - Bot local
        const verySimplePatterns = [
            /^(hola|hi|hey|buenos días|buenas tardes|buenas noches)$/i,
            /^(gracias|muchas gracias|ok|vale|perfecto|entendido)$/i,
            /^(sí|si|no|nop|nope)$/i,
        ];
        for (const pattern of verySimplePatterns) {
            if (pattern.test(message)) {
                return {
                    useAdvancedAI: false,
                    reason: 'Saludo básico - Bot local',
                    complexity: 'simple',
                    estimatedDelay: this.getHumanDelay('simple')
                };
            }
        }
        // 🔴 TODO LO DEMÁS USA GROQ - Para analizar contexto correctamente
        // Esto incluye preguntas sobre productos, precios, disponibilidad, etc.
        if (message.length < 30) {
            return {
                useAdvancedAI: true,
                reason: 'Pregunta corta - Requiere análisis de contexto con Groq',
                complexity: 'simple',
                estimatedDelay: this.getHumanDelay('simple')
            };
        }
        // 🔴 CASOS COMPLEJOS - Requieren análisis profundo
        const complexPatterns = [
            /agendar|cita|reunión|appointment/i,
            /negociar|descuento|rebaja|oferta especial/i,
            /comparar|diferencia|mejor opción|cuál es mejor/i,
            /recomendar|sugerir|aconsejar|qué me recomiendas/i,
            /cuánto.*quedar|precio final|total a pagar/i,
            /garantía|devolución|cambio|reembolso/i,
            /especificaciones técnicas|características detalladas/i,
            /compatible con|funciona con|sirve para/i,
            /problema|error|falla|no funciona|ayuda/i,
            /explicar|cómo funciona|cómo se usa/i,
            /diferencia entre|ventajas|desventajas/i,
            /varios|múltiples|algunos|diferentes/i, // Preguntas sobre múltiples productos
        ];
        for (const pattern of complexPatterns) {
            if (pattern.test(lowerMessage)) {
                return {
                    useAdvancedAI: true,
                    reason: 'Requiere análisis profundo con Groq',
                    complexity: 'complex',
                    estimatedDelay: this.getHumanDelay('complex')
                };
            }
        }
        // 🔴 PREGUNTAS QUE REQUIEREN CONTEXTO - SIEMPRE Groq
        // Preguntas vagas que necesitan memoria de conversación
        const needsContextPatterns = [
            /^(y|pero|entonces|además|también)\s/i, // Empieza con conjunción (necesita contexto)
            /^(eso|ese|esa|esto|esta|aquello)\s/i, // Referencias (necesita contexto)
            /^(me|te|le)\s+(das|envías|pasas|mandas)/i, // "me das el link" (necesita saber QUÉ)
            /^(cuál|cual|qué)\s+(es|sería|me)/i, // Preguntas abiertas
            /precio|cuesta|vale|disponible|stock|hay|tienes/i, // Preguntas sobre productos
        ];
        for (const pattern of needsContextPatterns) {
            if (pattern.test(message)) {
                return {
                    useAdvancedAI: true,
                    reason: 'Requiere Groq - Necesita contexto de conversación',
                    complexity: 'complex',
                    estimatedDelay: this.getHumanDelay('complex')
                };
            }
        }
        // 🟠 CASOS MEDIOS - Depende de la longitud y contexto
        if (message.length > 150) {
            return {
                useAdvancedAI: true,
                reason: 'Requiere Groq - Mensaje muy largo',
                complexity: 'complex',
                estimatedDelay: this.getHumanDelay('complex')
            };
        }
        if (message.split(' ').length > 20) {
            return {
                useAdvancedAI: true,
                reason: 'Requiere Groq - Múltiples preguntas',
                complexity: 'medium',
                estimatedDelay: this.getHumanDelay('medium')
            };
        }
        // 🟢 MENCIONA PRODUCTO ESPECÍFICO - Bot local puede manejar
        const productKeywords = ['laptop', 'moto', 'curso', 'piano', 'macbook', 'asus', 'bajaj', 'mega pack'];
        const hasProductKeyword = productKeywords.some(keyword => lowerMessage.includes(keyword));
        if (hasProductKeyword && message.length < 80) {
            return {
                useAdvancedAI: false,
                reason: 'Pregunta sobre producto específico - Bot local',
                complexity: 'simple',
                estimatedDelay: this.getHumanDelay('simple')
            };
        }
        // Por defecto, usar bot local para preguntas simples
        return {
            useAdvancedAI: false,
            reason: 'Pregunta estándar - Bot local (ahorro de tokens)',
            complexity: 'simple',
            estimatedDelay: this.getHumanDelay('simple')
        };
    }
    /**
     * Calcular demora humana realista según complejidad
     * REFORZADO para parecer mucho más natural y humano
     */
    static getHumanDelay(complexity) {
        const delays = {
            simple: { min: 3000, max: 6000 }, // 3-6 segundos (lectura + respuesta rápida)
            medium: { min: 6000, max: 12000 }, // 6-12 segundos (pensando + escribiendo)
            complex: { min: 12000, max: 20000 }, // 12-20 segundos (analizando + escribiendo largo)
        };
        const range = delays[complexity];
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }
    /**
     * Simular escritura humana (burbujas de "escribiendo...") de forma MUY REALISTA
     * Incluye pausas aleatorias para simular que el humano está pensando
     */
    static async simulateTyping(phoneNumber, duration) {
        try {
            console.log(`[Typing] 💬 Simulando escritura REALISTA por ${duration}ms para ${phoneNumber}`);
            // Dividir el tiempo en múltiples segmentos con pausas
            // Esto simula que el humano escribe, pausa para pensar, y sigue escribiendo
            const segments = Math.floor(duration / 3000) + 1; // Un segmento cada 3 segundos
            const segmentDuration = duration / segments;
            for (let i = 0; i < segments; i++) {
                // Enviar estado de "escribiendo" a WhatsApp
                // await BaileysService.sendPresenceUpdate(phoneNumber, 'composing')
                console.log(`[Typing] ✍️  Escribiendo... (segmento ${i + 1}/${segments})`);
                // Escribir por un tiempo
                const writingTime = segmentDuration * 0.7; // 70% del tiempo escribiendo
                await new Promise(resolve => setTimeout(resolve, writingTime));
                // Pausa para "pensar" (excepto en el último segmento)
                if (i < segments - 1) {
                    // await BaileysService.sendPresenceUpdate(phoneNumber, 'paused')
                    console.log(`[Typing] 🤔 Pensando...`);
                    const pauseTime = segmentDuration * 0.3; // 30% del tiempo pensando
                    await new Promise(resolve => setTimeout(resolve, pauseTime));
                }
            }
            // Detener estado de "escribiendo"
            // await BaileysService.sendPresenceUpdate(phoneNumber, 'paused')
            console.log(`[Typing] ✅ Escritura completada para ${phoneNumber}`);
        }
        catch (error) {
            console.error('[Typing] ❌ Error simulando escritura:', error);
            // Si falla, al menos esperar el tiempo completo
            await new Promise(resolve => setTimeout(resolve, duration));
        }
    }
    /**
     * Generar respuesta con demora humana y burbujas
     */
    static async generateResponseWithHumanTouch(userId, customerMessage, customerPhone, conversationHistory = []) {
        const startTime = Date.now();
        try {
            // 1. Analizar complejidad del mensaje
            const decision = this.analyzeMessageComplexity(customerMessage);
            console.log(`[Intelligence] Decisión de respuesta:`, {
                complexity: decision.complexity,
                useAdvancedAI: decision.useAdvancedAI,
                reason: decision.reason,
                delay: decision.estimatedDelay
            });
            // 2. Simular burbujas de "escribiendo..." antes de responder
            // Agregar delay adicional basado en la longitud del mensaje del cliente
            // (simula que el bot está leyendo el mensaje)
            const readingDelay = Math.min(customerMessage.length * 30, 3000); // Max 3 segundos de lectura
            console.log(`[Intelligence] 📖 Tiempo de lectura: ${readingDelay}ms`);
            await new Promise(resolve => setTimeout(resolve, readingDelay));
            // Ahora simular escritura
            await this.simulateTyping(customerPhone, decision.estimatedDelay);
            // 3. Generar respuesta según la decisión
            let response;
            if (decision.useAdvancedAI) {
                // Usar IA avanzada (Groq con modelo potente)
                console.log(`[Intelligence] 🧠 Usando RAZONAMIENTO PROFUNDO con documentación completa`);
                response = await deep_reasoning_ai_service_1.DeepReasoningAIService.generateIntelligentResponse(userId, customerMessage, customerPhone, conversationHistory);
            }
            else {
                // Usar bot local (respuestas rápidas y simples)
                console.log(`[Intelligence] ⚡ Usando BOT LOCAL para respuesta simple`);
                response = await this.generateSimpleResponse(userId, customerMessage, customerPhone, conversationHistory);
            }
            // 4. Delay final basado en la longitud de la respuesta
            // Simula el tiempo que toma "escribir" la respuesta
            const responseLength = response.message.length;
            const writingDelay = Math.min(responseLength * 20, 5000); // Max 5 segundos adicionales
            console.log(`[Intelligence] ✍️  Tiempo de escritura de respuesta: ${writingDelay}ms (${responseLength} caracteres)`);
            await new Promise(resolve => setTimeout(resolve, writingDelay));
            const responseTime = Date.now() - startTime;
            return {
                message: response.message,
                confidence: response.confidence,
                usedAdvancedAI: decision.useAdvancedAI,
                complexity: decision.complexity,
                responseTime
            };
        }
        catch (error) {
            console.error('[Intelligence] Error generando respuesta:', error);
            // Fallback con demora humana
            await this.simulateTyping(customerPhone, 2000);
            return {
                message: '¡Hola! Gracias por contactarnos. Un momento por favor, te atenderé enseguida. 😊',
                confidence: 0.5,
                usedAdvancedAI: false,
                complexity: 'simple',
                responseTime: Date.now() - startTime
            };
        }
    }
    /**
     * Generar respuesta simple sin IA avanzada
     */
    static async generateSimpleResponse(userId, message, _customerPhone, conversationHistory = []) {
        const lowerMessage = message.toLowerCase();
        // Saludos
        if (/^(hola|hi|hey|buenos días|buenas tardes|buenas noches)$/i.test(message)) {
            return {
                message: '👋 Hola ¡Bienvenido a Tecnovariedades D&S! 😄💻\n\nAquí encontrarás tecnología, soporte, cursos y herramientas digitales para potenciar tu día a día.\n\n📦 ¿Buscas algún producto, servicio o información en especial?',
                confidence: 0.95
            };
        }
        // Agradecimientos
        if (/^(gracias|muchas gracias)$/i.test(message)) {
            return {
                message: '¡De nada! 😊 Estoy aquí para ayudarte. ¿Necesitas algo más?',
                confidence: 0.95
            };
        }
        // Confirmaciones
        if (/^(ok|vale|perfecto|entendido)$/i.test(message)) {
            return {
                message: '¡Perfecto! 👍 ¿Hay algo más en lo que pueda ayudarte?',
                confidence: 0.95
            };
        }
        // Para todo lo demás, usar IA pero con respuesta rápida
        return await deep_reasoning_ai_service_1.DeepReasoningAIService.generateIntelligentResponse(userId, message, _customerPhone, conversationHistory);
    }
    /**
     * Calcular tiempo de lectura humano (para mensajes largos)
     */
    static calculateReadingTime(message) {
        // Promedio de lectura: 200 palabras por minuto
        const words = message.split(' ').length;
        const readingTimeMs = (words / 200) * 60 * 1000;
        // Mínimo 1 segundo, máximo 5 segundos
        return Math.min(Math.max(readingTimeMs, 1000), 5000);
    }
    /**
     * Agregar variación humana al tiempo de respuesta
     */
    static addHumanVariation(baseDelay) {
        // Agregar ±20% de variación aleatoria
        const variation = baseDelay * 0.2;
        const randomVariation = (Math.random() * variation * 2) - variation;
        return Math.floor(baseDelay + randomVariation);
    }
}
exports.IntelligentResponseService = IntelligentResponseService;
