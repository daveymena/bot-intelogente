"use strict";
/**
 * 🎭 MESSAGE VARIATION SERVICE
 * Servicio para generar variaciones inteligentes de mensajes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageVariationService = void 0;
class MessageVariationService {
    /**
     * Generar variación de mensaje según contexto
     */
    static generateVariation(message, variationIndex = 0) {
        // Detectar contexto del mensaje
        const context = this.detectContext(message);
        // Obtener plantilla de variaciones
        const template = this.TEMPLATES[context];
        if (!template) {
            // Si no hay plantilla, usar variación genérica
            return this.genericVariation(message, variationIndex);
        }
        // Seleccionar variación según el índice
        const variations = template.variations;
        const selectedVariation = variations[variationIndex % variations.length];
        // Aplicar variación
        return selectedVariation(message);
    }
    /**
     * Detectar contexto del mensaje
     */
    static detectContext(message) {
        for (const [context, template] of Object.entries(this.TEMPLATES)) {
            for (const pattern of template.patterns) {
                if (pattern.test(message)) {
                    return context;
                }
            }
        }
        return 'productInfo'; // Contexto por defecto
    }
    /**
     * Variación genérica (cuando no hay contexto específico)
     */
    static genericVariation(message, variationIndex) {
        const variations = [
            (msg) => msg,
            (msg) => `${msg} 😊`,
            (msg) => `${msg} 👍`,
            (msg) => `${msg} ✅`,
            (msg) => `Claro! ${msg}`,
            (msg) => `${msg} ¿Te ayudo en algo más?`,
            (msg) => `${msg} 🙌`,
        ];
        const selectedVariation = variations[variationIndex % variations.length];
        return selectedVariation(message);
    }
    /**
     * Agregar variaciones de palabras comunes
     */
    static replaceCommonWords(message) {
        const replacements = {
            'hola': ['hola', 'hey', 'qué tal', 'buenas', 'saludos'],
            'gracias': ['gracias', 'muchas gracias', 'te agradezco', 'mil gracias', 'super agradecido'],
            'sí': ['sí', 'claro', 'por supuesto', 'exacto', 'correcto', 'afirmativo'],
            'no': ['no', 'nop', 'negativo', 'no exactamente', 'no es así'],
            'bien': ['bien', 'genial', 'perfecto', 'excelente', 'muy bien', 'súper'],
            'ok': ['ok', 'vale', 'entendido', 'perfecto', 'listo', 'de acuerdo'],
            'producto': ['producto', 'artículo', 'item', 'mercancía'],
            'precio': ['precio', 'costo', 'valor', 'tarifa'],
            'comprar': ['comprar', 'adquirir', 'llevar', 'obtener'],
            'envío': ['envío', 'entrega', 'despacho', 'delivery'],
        };
        let result = message;
        // Seleccionar aleatoriamente una palabra para reemplazar
        const words = Object.keys(replacements);
        const shuffled = words.sort(() => Math.random() - 0.5);
        for (const word of shuffled) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            if (regex.test(result)) {
                const variations = replacements[word];
                const replacement = variations[Math.floor(Math.random() * variations.length)];
                result = result.replace(regex, replacement);
                break; // Solo reemplazar una palabra
            }
        }
        return result;
    }
    /**
     * Agregar emojis contextuales
     */
    static addContextualEmoji(message) {
        const emojiMap = {
            'producto': ['📦', '🛍️', '🎁'],
            'precio': ['💰', '💵', '💳'],
            'oferta': ['🎉', '🔥', '⚡', '✨'],
            'gracias': ['😊', '🙏', '❤️', '🤗'],
            'hola': ['👋', '😊', '🙂'],
            'pregunta': ['🤔', '❓', '💭'],
            'ayuda': ['🤝', '💪', '🆘'],
            'envío': ['🚚', '📦', '🚀'],
            'disponible': ['✅', '👍', '🟢'],
        };
        for (const [keyword, emojis] of Object.entries(emojiMap)) {
            if (new RegExp(keyword, 'i').test(message)) {
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                // 50% al inicio, 50% al final
                return Math.random() > 0.5 ? `${emoji} ${message}` : `${message} ${emoji}`;
            }
        }
        return message;
    }
    /**
     * Generar variación completa (combina todas las técnicas)
     */
    static generateCompleteVariation(message, variationIndex = 0) {
        let result = message;
        // 1. Aplicar variación de contexto
        result = this.generateVariation(result, variationIndex);
        // 2. Reemplazar palabras comunes (30% de probabilidad)
        if (Math.random() > 0.7) {
            result = this.replaceCommonWords(result);
        }
        // 3. Agregar emoji contextual (40% de probabilidad)
        if (Math.random() > 0.6) {
            result = this.addContextualEmoji(result);
        }
        return result;
    }
}
exports.MessageVariationService = MessageVariationService;
/**
 * Plantillas de variación por contexto
 */
MessageVariationService.TEMPLATES = {
    // Saludos
    greeting: {
        patterns: [/^(hola|hey|buenos|buenas|qué tal)/i],
        variations: [
            (msg) => msg,
            (msg) => `¡${msg}!`,
            (msg) => `${msg} 😊`,
            (msg) => `${msg} ¿Cómo estás?`,
            (msg) => `${msg} ¿Qué tal todo?`,
            (msg) => `Hey! ${msg.replace(/^(hola|hey)/i, '')}`,
            (msg) => `Buenas! ${msg.replace(/^(hola|hey|buenos|buenas)/i, '')}`,
        ]
    },
    // Confirmaciones
    confirmation: {
        patterns: [/(sí|claro|perfecto|ok|listo|entendido|correcto)/i],
        variations: [
            (msg) => msg,
            (msg) => `${msg} ✅`,
            (msg) => `${msg} 👍`,
            (msg) => `Perfecto! ${msg}`,
            (msg) => `Claro! ${msg}`,
            (msg) => `Por supuesto! ${msg}`,
            (msg) => `Exacto! ${msg}`,
            (msg) => `${msg} Genial!`,
        ]
    },
    // Agradecimientos
    thanks: {
        patterns: [/(gracias|te agradezco|muchas gracias)/i],
        variations: [
            (msg) => msg,
            (msg) => `${msg} 😊`,
            (msg) => `${msg} ¡Un placer ayudarte!`,
            (msg) => `${msg} Estamos para servirte`,
            (msg) => `De nada! ${msg.replace(/gracias/i, '')}`,
            (msg) => `Con gusto! ${msg.replace(/gracias/i, '')}`,
            (msg) => `${msg} 🙌`,
        ]
    },
    // Preguntas
    question: {
        patterns: [/\?$/],
        variations: [
            (msg) => msg,
            (msg) => `${msg} 🤔`,
            (msg) => `Déjame preguntarte: ${msg}`,
            (msg) => `Una pregunta: ${msg}`,
            (msg) => `${msg} ¿Qué opinas?`,
            (msg) => `Cuéntame: ${msg}`,
            (msg) => `Me gustaría saber: ${msg}`,
        ]
    },
    // Información de productos
    productInfo: {
        patterns: [/(producto|precio|disponible|stock|características)/i],
        variations: [
            (msg) => msg,
            (msg) => `${msg} 📦`,
            (msg) => `Te cuento: ${msg}`,
            (msg) => `Mira: ${msg}`,
            (msg) => `Aquí está la info: ${msg}`,
            (msg) => `${msg} ¿Te interesa?`,
            (msg) => `Déjame mostrarte: ${msg}`,
        ]
    },
    // Despedidas
    farewell: {
        patterns: [/(adiós|hasta luego|nos vemos|chao|bye)/i],
        variations: [
            (msg) => msg,
            (msg) => `${msg} 👋`,
            (msg) => `${msg} ¡Que tengas un excelente día!`,
            (msg) => `${msg} Estamos para servirte`,
            (msg) => `${msg} ¡Vuelve pronto!`,
            (msg) => `${msg} 😊`,
            (msg) => `${msg} ¡Hasta pronto!`,
        ]
    },
    // Ofertas/Promociones
    offer: {
        patterns: [/(oferta|descuento|promoción|rebaja|precio especial)/i],
        variations: [
            (msg) => msg,
            (msg) => `${msg} 🎉`,
            (msg) => `${msg} ¡No te lo pierdas!`,
            (msg) => `¡Atención! ${msg}`,
            (msg) => `${msg} 🔥`,
            (msg) => `Mira esta oferta: ${msg}`,
            (msg) => `${msg} ¡Aprovecha!`,
        ]
    },
    // Ayuda/Soporte
    help: {
        patterns: [/(ayuda|problema|error|no funciona|ayúdame)/i],
        variations: [
            (msg) => msg,
            (msg) => `${msg} 🤝`,
            (msg) => `Claro! ${msg}`,
            (msg) => `Con gusto te ayudo: ${msg}`,
            (msg) => `${msg} Estoy aquí para ayudarte`,
            (msg) => `Déjame ayudarte: ${msg}`,
            (msg) => `${msg} ¿En qué más puedo ayudarte?`,
        ]
    },
};
