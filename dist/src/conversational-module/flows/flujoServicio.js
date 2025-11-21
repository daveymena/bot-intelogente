"use strict";
/**
 * Flujo de conversación para servicios
 * Maneja servicios técnicos, reparaciones, asesorías
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.procesarFlujoServicio = procesarFlujoServicio;
const groqClient_1 = require("../ai/groqClient");
const promptBuilder_1 = require("../ai/promptBuilder");
const obtenerContexto_1 = require("../utils/obtenerContexto");
async function procesarFlujoServicio(mensaje, producto, contexto) {
    try {
        const messages = [
            {
                role: 'system',
                content: (0, promptBuilder_1.construirPromptSistema)() + '\n\n' + (0, promptBuilder_1.construirPromptServicio)(producto),
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
        return respuesta.content;
    }
    catch (error) {
        console.error('[FlujoServicio] Error:', error);
        return `¡Claro! Ofrecemos *${producto.nombre}* 🔧

💰 Desde: $${producto.precio.toLocaleString('es-CO')} COP

Para darte un precio exacto, cuéntame:
- ¿Qué problema presenta?
- ¿Marca y modelo?

Así puedo ayudarte mejor 😊`;
    }
}
