"use strict";
/**
 * 🤖 Manejador de Respuestas Directas (Sin IA)
 * Para preguntas simples que no requieren IA
 *
 * CASOS QUE MANEJA:
 * - Saludos simples
 * - Agradecimientos
 * - Confirmaciones (sí, ok, vale)
 * - Horarios de atención (desde BD)
 * - Ubicación (desde BD)
 * - Despedidas
 * - Preguntas sobre envíos (desde BD)
 * - Preguntas sobre garantía (desde BD)
 *
 * TODO LO DEMÁS → Groq (IA)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectResponseHandler = void 0;
const db_1 = require("./db");
class DirectResponseHandler {
    /**
     * Verificar si puede responder directamente sin IA
     */
    static canHandleDirectly(message) {
        const normalized = message.toLowerCase().trim();
        // ⚠️ TODO lo relacionado con PAGOS debe ir a IA o AutoPhotoPaymentHandler
        // NO manejar: isIntencionPago (eliminado)
        return this.isSaludo(normalized) ||
            this.isAgradecimiento(normalized) ||
            this.isConfirmacion(normalized) ||
            this.isDespedida(normalized) ||
            // this.isIntencionPago(normalized) ||  // ← DESACTIVADO
            this.isPreguntaHorario(normalized) ||
            this.isPreguntaUbicacion(normalized) ||
            this.isPreguntaEnvio(normalized) ||
            this.isPreguntaGarantia(normalized);
    }
    /**
     * Generar respuesta directa (ASYNC para cargar desde BD)
     */
    static async getDirectResponse(message, botName = 'tu asistente', userId) {
        const normalized = message.toLowerCase().trim();
        // 1. Saludos
        if (this.isSaludo(normalized)) {
            return this.getSaludoResponse(botName);
        }
        // 2. Agradecimientos
        if (this.isAgradecimiento(normalized)) {
            return this.getAgradecimientoResponse();
        }
        // 3. Confirmaciones simples
        if (this.isConfirmacion(normalized)) {
            return this.getConfirmacionResponse();
        }
        // 4. Despedidas
        if (this.isDespedida(normalized)) {
            return this.getDespedidaResponse();
        }
        // 5. Intención de pago - DESACTIVADO
        // TODO lo relacionado con pagos debe ir a IA o AutoPhotoPaymentHandler
        // if (this.isIntencionPago(normalized)) {
        //   return this.getIntencionPagoResponse();
        // }
        // Para las siguientes respuestas, necesitamos cargar config desde BD
        const config = userId ? await this.getConfig(userId) : null;
        // 6. Horarios
        if (this.isPreguntaHorario(normalized)) {
            return this.getHorarioResponse(config);
        }
        // 6. Ubicación
        if (this.isPreguntaUbicacion(normalized)) {
            return this.getUbicacionResponse(config);
        }
        // 7. Envíos
        if (this.isPreguntaEnvio(normalized)) {
            return this.getEnvioResponse(config);
        }
        // 8. Garantía
        if (this.isPreguntaGarantia(normalized)) {
            return this.getGarantiaResponse(config);
        }
        return null;
    }
    /**
     * Obtener configuración desde BD (con cache)
     */
    static async getConfig(userId) {
        // Verificar cache
        const cached = this.configCache.get(userId);
        const expiry = this.cacheExpiry.get(userId);
        if (cached && expiry && Date.now() < expiry) {
            return cached;
        }
        // Cargar desde BD
        try {
            // Cargar configuración del bot
            const settings = await db_1.db.botSettings.findUnique({
                where: { userId }
            });
            // Cargar información del usuario (business info)
            const user = await db_1.db.user.findUnique({
                where: { id: userId },
                select: {
                    businessHours: true,
                    businessAddress: true,
                    businessPhone: true,
                    businessDescription: true
                }
            });
            // Combinar ambas configuraciones
            const config = {
                ...settings,
                ...user
            };
            if (config) {
                this.configCache.set(userId, config);
                this.cacheExpiry.set(userId, Date.now() + this.CACHE_TTL);
                return config;
            }
        }
        catch (error) {
            console.error('[DirectResponseHandler] Error cargando config:', error);
        }
        return null;
    }
    /**
     * Detectar saludos
     */
    static isSaludo(message) {
        const saludos = [
            /^(hola|hey|holi|buenas|buenos|buen)\b/i,
            /^(buenos días|buenas tardes|buenas noches)/i,
            /^(hi|hello)\b/i
        ];
        return saludos.some(p => p.test(message)) && message.length < 30;
    }
    /**
     * Detectar agradecimientos
     */
    static isAgradecimiento(message) {
        const patterns = [
            /^(gracias|muchas gracias|mil gracias|thanks|thank you)\b/i,
            /^(te agradezco|agradezco)\b/i
        ];
        return patterns.some(p => p.test(message));
    }
    /**
     * Detectar confirmaciones simples
     */
    static isConfirmacion(message) {
        const patterns = [
            /^(sí|si|ok|okay|vale|perfecto|excelente|genial|bien)\b/i,
            /^(entiendo|entendido|claro)\b/i
        ];
        return patterns.some(p => p.test(message)) && message.length < 20;
    }
    /**
     * Detectar intención de realizar pago (NO solicitud de links)
     */
    static isIntencionPago(message) {
        const normalized = message.toLowerCase();
        // ⚠️ NO es intención de pago si está pidiendo links, métodos o información
        const excludePatterns = [
            /\b(link|enlace|url)\b/i,
            /\b(método|metodo|forma|formas|opción|opcion|opciones)\b/i,
            /\b(cómo|como|cual|cuales|que)\b/i,
            /\b(dame|envía|envia|manda|pasa|muestra|dime)\b/i,
            /\b(puedo|se\s+puede|aceptan|tienen|hay)\b/i,
            /\b(información|info|datos|detalles)\b/i,
            /\?/ // Si tiene pregunta, NO es intención de pago
        ];
        if (excludePatterns.some(p => p.test(normalized))) {
            return false; // Es una pregunta sobre pago, no intención de pagar
        }
        // ⚠️ SÍ es intención de pago SOLO si dice EXPLÍCITAMENTE que va a pagar
        const intentPatterns = [
            /\b(voy\s+a\s+)?(realizar|hacer|efectuar)\s+(el\s+)?pago/i,
            /\b(voy\s+a\s+)?(pagar|comprar)\s+(ahora|ya|ahorita)/i,
            /\b(procedo|procedere)\s+(con\s+)?(el\s+)?pago/i,
            /\b(listo|ok|perfecto),?\s+(voy\s+a\s+)?(pagar|comprar)/i,
            /\b(ya\s+)?(pago|compro|realizo\s+el\s+pago)/i,
            /\b(voy\s+a\s+hacer\s+el\s+pago)/i
        ];
        return intentPatterns.some(p => p.test(normalized));
    }
    /**
     * Detectar preguntas sobre horario
     */
    static isPreguntaHorario(message) {
        return /\b(horario|hora|abierto|abren|cierran|atienden)\b/i.test(message);
    }
    /**
     * Detectar preguntas sobre ubicación
     */
    static isPreguntaUbicacion(message) {
        return /\b(ubicación|ubicacion|dirección|direccion|dónde|donde|están|quedan)\b/i.test(message) &&
            !message.includes('producto');
    }
    /**
     * Respuesta de saludo
     */
    static getSaludoResponse(botName) {
        return `👋 ¡Hola! 😊 Bienvenido a Tecnovariedades D&S

Soy ${botName}

¿En qué puedo ayudarte hoy? 🎯`;
    }
    /**
     * Respuesta de agradecimiento
     */
    static getAgradecimientoResponse() {
        const respuestas = [
            '😊 ¡Con gusto! Estoy aquí para ayudarte',
            '✨ ¡De nada! ¿Necesitas algo más?',
            '🙌 ¡Para eso estoy! ¿Algo más en lo que pueda ayudarte?'
        ];
        return respuestas[Math.floor(Math.random() * respuestas.length)];
    }
    /**
     * Respuesta de confirmación
     */
    static getConfirmacionResponse() {
        return '👍 Perfecto\n\n¿Hay algo más en lo que pueda ayudarte?';
    }
    /**
     * Respuesta de horario (desde BD o fallback)
     */
    static getHorarioResponse(config) {
        // Intentar obtener desde BD
        if (config?.businessHours) {
            return `🕐 Horario de Atención

${config.businessHours}

📞 WhatsApp: ${config.whatsappNumber || '+57 304 274 8687'}

¿En qué más puedo ayudarte?`;
        }
        // Fallback
        return `🕐 Horario de Atención

📅 Lunes a Viernes: 9:00 AM - 6:00 PM
📅 Sábados: 9:00 AM - 2:00 PM
📅 Domingos: Cerrado

📞 WhatsApp: +57 304 274 8687

¿En qué más puedo ayudarte?`;
    }
    /**
     * Respuesta de ubicación (desde BD o fallback)
     */
    static getUbicacionResponse(config) {
        // Intentar obtener desde BD
        if (config?.businessAddress) {
            return `📍 Ubicación

${config.businessAddress}

📞 Contacto: ${config.whatsappNumber || '+57 304 274 8687'}

¿Necesitas indicaciones o algo más?`;
        }
        // Fallback
        return `📍 Ubicación

Centro Comercial El Diamante 2
San Nicolás, Cali
Colombia

📞 Contacto: +57 304 274 8687

¿Necesitas indicaciones o algo más?`;
    }
    /**
     * Detectar despedidas
     */
    static isDespedida(message) {
        const patterns = [
            /^(chao|chau|adiós|adios|bye|hasta luego|nos vemos)\b/i,
            /^(que tengas|que tenga)\b/i
        ];
        return patterns.some(p => p.test(message)) && message.length < 30;
    }
    /**
     * Detectar preguntas sobre envío
     */
    static isPreguntaEnvio(message) {
        return /\b(envío|envio|envían|envian|domicilio|entrega|despacho|shipping)\b/i.test(message) &&
            !message.includes('foto') &&
            !message.includes('link');
    }
    /**
     * Detectar preguntas sobre garantía
     */
    static isPreguntaGarantia(message) {
        return /\b(garantía|garantia|warranty|devolución|devolucion|cambio)\b/i.test(message);
    }
    /**
     * Respuesta de despedida
     */
    static getDespedidaResponse() {
        const respuestas = [
            '👋 ¡Hasta pronto! Que tengas un excelente día 😊',
            '✨ ¡Nos vemos! Estoy aquí cuando me necesites 🙌',
            '😊 ¡Chao! Vuelve cuando quieras, aquí estaré'
        ];
        return respuestas[Math.floor(Math.random() * respuestas.length)];
    }
    /**
     * Respuesta cuando el cliente va a realizar el pago
     */
    static getIntencionPagoResponse() {
        const respuestas = [
            '¡Perfecto! 🎉\n\nTe estaré esperando para confirmar tu pago\n\nUna vez realices el pago, envíame el comprobante y te activo tu producto de inmediato 😊',
            '¡Excelente! 👏\n\nCuando termines el pago, envíame una captura del comprobante y te entrego tu producto al instante 🚀',
            '¡Genial! ✨\n\nRealiza tu pago tranquilo\n\nCuando termines, envíame el comprobante y te activo todo de inmediato 😊'
        ];
        return respuestas[Math.floor(Math.random() * respuestas.length)];
    }
    /**
     * Respuesta sobre envíos (desde BD o fallback)
     */
    static getEnvioResponse(config) {
        // Intentar obtener desde BD
        if (config?.shippingInfo) {
            return `🚚 Información de Envíos

${config.shippingInfo}

¿Quieres saber el costo de envío a tu ciudad?`;
        }
        // Fallback
        return `🚚 Información de Envíos

✅ Envíos a toda Colombia
📦 Tiempo de entrega: 2-5 días hábiles
💰 Costo: Depende de la ciudad

📍 Cali: Envío gratis en compras mayores a $100.000
🌎 Otras ciudades: Coordinadora, Servientrega, Interrapidísimo

¿Quieres saber el costo de envío a tu ciudad?`;
    }
    /**
     * Respuesta sobre garantía (desde BD o fallback)
     */
    static getGarantiaResponse(config) {
        // Intentar obtener desde BD
        if (config?.warrantyInfo) {
            return `🛡️ Garantía y Devoluciones

${config.warrantyInfo}

¿Tienes alguna duda específica sobre garantía?`;
        }
        // Fallback
        return `🛡️ Garantía y Devoluciones

✅ Garantía de 30 días en todos los productos
🔄 Cambios y devoluciones sin problema
📦 Productos nuevos y sellados

Condiciones:
• Producto en perfecto estado
• Empaque original
• Factura de compra

¿Tienes alguna duda específica sobre garantía?`;
    }
}
exports.DirectResponseHandler = DirectResponseHandler;
// Cache de configuración para evitar múltiples consultas a BD
DirectResponseHandler.configCache = new Map();
DirectResponseHandler.cacheExpiry = new Map();
DirectResponseHandler.CACHE_TTL = 5 * 60 * 1000; // 5 minutos
