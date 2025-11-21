"use strict";
/**
 * 🤖 INTEGRACIÓN COMPLETA DE IA CON FORMATO WHATSAPP
 * Une el sistema de IA con el formateador visual para respuestas optimizadas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIResponseIntegration = void 0;
const whatsapp_response_formatter_1 = require("./whatsapp-response-formatter");
const custom_greeting_system_1 = require("./custom-greeting-system");
const db_1 = require("./db");
class AIResponseIntegration {
    /**
     * Procesar mensaje y generar respuesta formateada
     */
    static async processMessage(options) {
        const { userId, message, conversationHistory = [] } = options;
        // 1. Detectar si es un saludo
        if (custom_greeting_system_1.CustomGreetingSystem.isGreeting(message)) {
            const greeting = await custom_greeting_system_1.CustomGreetingSystem.getCustomGreeting(userId);
            return `${greeting.greeting}\n\n${greeting.context}`;
        }
        // 2. Detectar si está preguntando por productos
        const isProductQuery = this.detectProductQuery(message);
        if (isProductQuery) {
            return await this.handleProductQuery(userId, message);
        }
        // 3. Respuesta general con IA
        return await this.handleGeneralQuery(userId, message, conversationHistory);
    }
    /**
     * Detectar si el mensaje pregunta por productos
     */
    static detectProductQuery(message) {
        const messageLower = message.toLowerCase();
        const productKeywords = [
            'portátil', 'portatil', 'laptop',
            'celular', 'teléfono', 'telefono', 'phone',
            'tablet', 'ipad',
            'audífono', 'audifono', 'headphone',
            'reloj', 'watch',
            'curso', 'megapack',
            'precio', 'costo', 'cuanto cuesta', 'cuánto cuesta',
            'disponible', 'tienen', 'venden',
            'catálogo', 'catalogo', 'productos',
            'opciones', 'modelos'
        ];
        return productKeywords.some(keyword => messageLower.includes(keyword));
    }
    /**
     * Manejar consulta de productos
     */
    static async handleProductQuery(userId, message) {
        const messageLower = message.toLowerCase();
        // Detectar categoría específica
        let category;
        let searchTerm;
        if (messageLower.includes('portátil') || messageLower.includes('portatil') || messageLower.includes('laptop')) {
            category = 'PHYSICAL';
            searchTerm = 'laptop portátil';
        }
        else if (messageLower.includes('celular') || messageLower.includes('teléfono') || messageLower.includes('phone')) {
            category = 'PHYSICAL';
            searchTerm = 'celular phone';
        }
        else if (messageLower.includes('curso') || messageLower.includes('megapack')) {
            category = 'DIGITAL';
            searchTerm = 'curso megapack';
        }
        // Buscar productos
        const products = await db_1.db.product.findMany({
            where: {
                userId,
                status: 'AVAILABLE',
                ...(category && { category }),
                ...(searchTerm && {
                    OR: [
                        { name: { contains: searchTerm.split(' ')[0], mode: 'insensitive' } },
                        { description: { contains: searchTerm.split(' ')[0], mode: 'insensitive' } }
                    ]
                })
            },
            take: 4,
            orderBy: { createdAt: 'desc' }
        });
        if (products.length === 0) {
            return '😅 Lo siento, no encontré productos que coincidan con tu búsqueda.\n\n¿Podrías ser más específico?';
        }
        // Formatear productos
        const productInfos = products.map(p => ({
            name: p.name,
            price: p.price,
            currency: p.currency || 'COP',
            specs: whatsapp_response_formatter_1.WhatsAppResponseFormatter.extractSpecs(p)
        }));
        // Determinar título de categoría
        let categoryTitle = 'Productos';
        if (searchTerm?.includes('laptop'))
            categoryTitle = 'Portátiles';
        else if (searchTerm?.includes('celular'))
            categoryTitle = 'Celulares';
        else if (searchTerm?.includes('curso'))
            categoryTitle = 'Cursos';
        return whatsapp_response_formatter_1.WhatsAppResponseFormatter.formatProductList(productInfos, categoryTitle);
    }
    /**
     * Manejar consulta general con IA
     */
    static async handleGeneralQuery(userId, message, conversationHistory) {
        // Aquí se integraría con tu servicio de IA (Groq, Ollama, etc.)
        // Por ahora, retornamos una respuesta formateada simple
        const messageLower = message.toLowerCase();
        // Respuestas rápidas comunes
        if (messageLower.includes('horario') || messageLower.includes('hora')) {
            return '🕐 *Horario de Atención*\n\nEstamos disponibles:\n🔹 Lunes a Viernes: 9:00 AM - 6:00 PM\n🔹 Sábados: 10:00 AM - 2:00 PM\n\n¿En qué más puedo ayudarte? 😊';
        }
        if (messageLower.includes('ubicación') || messageLower.includes('ubicacion') || messageLower.includes('dirección')) {
            return '📍 *Nuestra Ubicación*\n\nPuedes visitarnos en:\n🏢 [Dirección de la tienda]\n\n¿Necesitas indicaciones? 🗺️';
        }
        if (messageLower.includes('envío') || messageLower.includes('envio') || messageLower.includes('domicilio')) {
            return '🚚 *Envíos*\n\n¡Hacemos envíos a todo el país!\n\n🔹 Envío local: 1-2 días\n🔹 Envío nacional: 3-5 días\n\nEl costo varía según tu ubicación 📦\n\n¿Quieres cotizar un envío? 😊';
        }
        if (messageLower.includes('pago') || messageLower.includes('forma de pago')) {
            return '💳 *Métodos de Pago*\n\nAceptamos:\n🔹 Transferencia bancaria\n🔹 Nequi / Daviplata\n🔹 Tarjetas de crédito/débito\n🔹 Efectivo (en tienda)\n\n¿Cuál prefieres? 😊';
        }
        if (messageLower.includes('garantía') || messageLower.includes('garantia')) {
            return '✅ *Garantía*\n\nTodos nuestros productos tienen:\n🔹 Garantía del fabricante\n🔹 Soporte técnico\n🔹 Cambios por defectos de fábrica\n\n¿Tienes alguna duda específica? 🤔';
        }
        // Respuesta genérica formateada
        return whatsapp_response_formatter_1.WhatsAppResponseFormatter.formatShortResponse('Estoy aquí para ayudarte 😊\n\nPuedo ayudarte con:\n🔹 Ver productos disponibles\n🔹 Información de precios\n🔹 Métodos de pago\n🔹 Envíos y entregas\n\n¿Qué te gustaría saber?');
    }
    /**
     * Formatear respuesta de IA para WhatsApp
     */
    static formatAIResponse(aiResponse) {
        // Limpiar respuesta de IA
        let formatted = aiResponse.trim();
        // Asegurar que no sea muy larga (máximo 1000 caracteres)
        if (formatted.length > 1000) {
            formatted = formatted.substring(0, 997) + '...';
        }
        // Agregar emojis si no tiene
        if (!/[\p{Emoji}]/u.test(formatted)) {
            formatted = `✨ ${formatted}`;
        }
        return formatted;
    }
    /**
     * Generar prompt del sistema optimizado
     */
    static async generateSystemPrompt(userId) {
        return await custom_greeting_system_1.CustomGreetingSystem.generateSystemPrompt(userId);
    }
}
exports.AIResponseIntegration = AIResponseIntegration;
