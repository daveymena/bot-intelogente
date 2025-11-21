"use strict";
/**
 * 📝 FORMATEADOR DE RESPUESTAS
 * Formatea respuestas para WhatsApp con emojis, viñetas y espaciado
 * Hace que las respuestas sean fáciles de leer y no saturen al cliente
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseFormatter = void 0;
class ResponseFormatter {
    /**
     * Formatea información de un producto de forma limpia
     */
    static formatProductInfo(product, benefit) {
        let response = '';
        // Título con emoji
        response += `📦 *${product.name}*\n\n`;
        // Beneficio si existe
        if (benefit) {
            response += `✨ *¿Por qué es perfecto para ti?*\n`;
            response += `${benefit}\n\n`;
        }
        // Precio destacado
        response += `💰 *Precio:* $${product.price.toLocaleString('es-CO')} COP\n\n`;
        // Características principales (si hay descripción)
        if (product.description && product.description.length > 50) {
            response += `📚 *Incluye:*\n`;
            // Extraer puntos clave de la descripción
            const points = this.extractKeyPoints(product.description);
            points.forEach(point => {
                response += `  • ${point}\n`;
            });
            response += '\n';
        }
        // Información adicional
        response += `🎓 *Acceso:* De por vida\n`;
        response += `✅ *Disponibilidad:* Inmediata\n`;
        if (product.category === 'DIGITAL') {
            response += `📱 *Formato:* Digital (acceso online)\n`;
        }
        return response;
    }
    /**
     * Formatea lista de métodos de pago
     */
    static formatPaymentMethods() {
        let response = '💳 *Métodos de Pago Disponibles:*\n\n';
        response += '🟦 *MercadoPago*\n';
        response += '  • Tarjeta de crédito/débito\n';
        response += '  • PSE\n';
        response += '  • Efectivo en puntos\n\n';
        response += '🟨 *PayPal*\n';
        response += '  • Tarjetas internacionales\n';
        response += '  • Saldo PayPal\n\n';
        response += '📱 *Nequi*\n';
        response += '  • Transferencia directa\n\n';
        response += '💳 *Daviplata*\n';
        response += '  • Transferencia directa\n\n';
        response += '🏦 *Transferencia Bancaria*\n';
        response += '  • Cualquier banco\n\n';
        response += '¿Con cuál prefieres continuar? 😊';
        return response;
    }
    /**
     * Formatea respuesta de bienvenida
     */
    static formatWelcome(userName) {
        let response = `¡Hola${userName ? ' ' + userName : ''}! 👋\n\n`;
        response += `Bienvenido a *Tecnovariedades D&S* 🎉\n\n`;
        response += `¿En qué puedo ayudarte hoy?\n\n`;
        response += `📚 *Nuestros productos:*\n`;
        response += `  • Cursos digitales\n`;
        response += `  • Megapacks educativos\n`;
        response += `  • Laptops y computadores\n`;
        response += `  • Accesorios tecnológicos\n`;
        response += `  • Motos\n\n`;
        response += `¿Qué te interesa? 😊`;
        return response;
    }
    /**
     * Formatea respuesta de despedida
     */
    static formatFarewell() {
        const farewells = [
            '¡De nada! 😊\n\nEstoy aquí si necesitas algo más.\n¡Que tengas un excelente día! 👋',
            '¡Un placer ayudarte! 😄\n\nCualquier cosa, aquí estoy.\n¡Hasta pronto! 🚀',
            '¡Perfecto! 👍\n\nSi necesitas algo más, no dudes en escribirme.\n¡Que te vaya muy bien! ✨'
        ];
        return farewells[Math.floor(Math.random() * farewells.length)];
    }
    /**
     * Formatea confirmación de pago
     */
    static formatPaymentConfirmation(method, link) {
        let response = '¡Perfecto! 💳\n\n';
        response += `*Método seleccionado:* ${method}\n\n`;
        if (link) {
            response += `👇 *Tu enlace de pago:*\n${link}\n\n`;
        }
        response += `📋 *Pasos siguientes:*\n`;
        response += `  1️⃣ Realiza el pago\n`;
        response += `  2️⃣ Recibirás confirmación por email\n`;
        response += `  3️⃣ Acceso inmediato al producto\n\n`;
        response += `⚠️ *Importante:* Revisa tu bandeja de spam\n\n`;
        response += `¿Alguna pregunta? 😊`;
        return response;
    }
    /**
     * Formatea lista de productos (máximo 3)
     */
    static formatProductList(products) {
        let response = '📦 *Productos disponibles:*\n\n';
        products.slice(0, 3).forEach((product, index) => {
            response += `${index + 1}️⃣ *${product.name}*\n`;
            response += `   💰 $${product.price.toLocaleString('es-CO')} COP\n`;
            if (product.description) {
                const shortDesc = product.description.substring(0, 80);
                response += `   📝 ${shortDesc}${product.description.length > 80 ? '...' : ''}\n`;
            }
            response += '\n';
        });
        if (products.length > 3) {
            response += `_...y ${products.length - 3} productos más_\n\n`;
        }
        response += '¿Cuál te interesa? 😊';
        return response;
    }
    /**
     * Formatea error o problema de forma amigable
     */
    static formatError(message) {
        let response = '😅 Ups, algo no salió bien\n\n';
        response += `${message}\n\n`;
        response += '¿Puedes intentar de nuevo o reformular tu pregunta? 🙏';
        return response;
    }
    /**
     * Formatea respuesta con información adicional
     */
    static formatAdditionalInfo(title, items) {
        let response = `ℹ️ *${title}*\n\n`;
        items.forEach(item => {
            response += `  • ${item}\n`;
        });
        response += '\n¿Necesitas más información? 😊';
        return response;
    }
    /**
     * Extrae puntos clave de un texto largo
     */
    static extractKeyPoints(text, maxPoints = 5) {
        // Dividir por puntos, comas o saltos de línea
        const sentences = text.split(/[.,\n]+/).map(s => s.trim()).filter(s => s.length > 10);
        // Tomar las primeras oraciones más relevantes
        const points = [];
        for (const sentence of sentences) {
            if (points.length >= maxPoints)
                break;
            // Limpiar y acortar si es necesario
            let point = sentence;
            if (point.length > 80) {
                point = point.substring(0, 77) + '...';
            }
            points.push(point);
        }
        // Si no hay suficientes puntos, dividir el texto en chunks
        if (points.length === 0 && text.length > 0) {
            const words = text.split(/\s+/);
            let currentPoint = '';
            for (const word of words) {
                if (currentPoint.length + word.length > 80) {
                    if (currentPoint) {
                        points.push(currentPoint.trim());
                        if (points.length >= maxPoints)
                            break;
                    }
                    currentPoint = word;
                }
                else {
                    currentPoint += ' ' + word;
                }
            }
            if (currentPoint && points.length < maxPoints) {
                points.push(currentPoint.trim());
            }
        }
        return points;
    }
    /**
     * Formatea respuesta con secciones
     */
    static formatSections(sections) {
        let response = '';
        sections.forEach((section, index) => {
            const emoji = section.emoji || '📌';
            response += `${emoji} *${section.title}*\n`;
            response += `${section.content}\n`;
            // Agregar espacio entre secciones (excepto la última)
            if (index < sections.length - 1) {
                response += '\n';
            }
        });
        return response;
    }
    /**
     * Limpia y formatea texto para WhatsApp
     */
    static cleanForWhatsApp(text) {
        return text
            // Eliminar markdown excesivo
            .replace(/\*\*\*/g, '*')
            .replace(/___/g, '_')
            // Asegurar espaciado correcto
            .replace(/\n{3,}/g, '\n\n')
            // Limpiar espacios al inicio/final
            .trim();
    }
    /**
     * Formatea precio de forma destacada
     */
    static formatPrice(price, currency = 'COP') {
        return `💰 *$${price.toLocaleString('es-CO')} ${currency}*`;
    }
    /**
     * Formatea lista con viñetas personalizadas
     */
    static formatList(items, emoji = '•') {
        return items.map(item => `  ${emoji} ${item}`).join('\n');
    }
}
exports.ResponseFormatter = ResponseFormatter;
