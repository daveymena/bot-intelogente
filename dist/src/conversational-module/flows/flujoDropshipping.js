"use strict";
/**
 * Flujo de conversación para dropshipping
 * Maneja productos con envío incluido y contrareembolso
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.procesarFlujoDropshipping = procesarFlujoDropshipping;
const groqClient_1 = require("../ai/groqClient");
const promptBuilder_1 = require("../ai/promptBuilder");
const obtenerContexto_1 = require("../utils/obtenerContexto");
async function procesarFlujoDropshipping(mensaje, producto, contexto) {
    try {
        const messages = [
            {
                role: 'system',
                content: (0, promptBuilder_1.construirPromptSistema)() + '\n\n' + (0, promptBuilder_1.construirPromptDropshipping)(producto),
            },
        ];
        // Agregar historial reciente
        const historial = (0, obtenerContexto_1.obtenerHistorialParaIA)(contexto, 4);
        messages.push(...historial);
        // Agregar mensaje actual
        messages.push({
            role: 'user',
            content: mensaje,
        });
        const respuesta = await (0, groqClient_1.sendWithFallback)(messages, {
            temperature: 0.7,
            maxTokens: 500,
        });
        let contenido = respuesta.content;
        // Validar precio
        const precioReal = producto.precio;
        contenido = contenido.replace(/\$\s*\d{1,3}(?:[.,]\d{3})*/g, `$${precioReal.toLocaleString('es-CO')}`);
        return contenido;
    }
    catch (error) {
        console.error('[FlujoDropshipping] Error:', error);
        return `¡Excelente elección! *${producto.nombre}* 🎁

💰 Precio promocional: $${producto.precio.toLocaleString('es-CO')} COP
🚚 Envío incluido a toda Colombia
📦 Entrega en 3-5 días hábiles

¿A qué ciudad lo necesitas? Te confirmo disponibilidad 📍`;
    }
}
