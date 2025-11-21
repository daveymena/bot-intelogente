"use strict";
/**
 * Flujo de conversación general
 * Maneja saludos, consultas generales, despedidas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.procesarFlujoGeneral = procesarFlujoGeneral;
const groqClient_1 = require("../ai/groqClient");
const promptBuilder_1 = require("../ai/promptBuilder");
const obtenerContexto_1 = require("../utils/obtenerContexto");
async function procesarFlujoGeneral(mensaje, intencion, contexto) {
    // Respuestas rápidas para intenciones comunes
    if (intencion === 'saludo') {
        return generarSaludo();
    }
    if (intencion === 'despedida') {
        return generarDespedida();
    }
    // Para otras consultas generales, usar IA
    try {
        const messages = [
            {
                role: 'system',
                content: (0, promptBuilder_1.construirPromptSistema)() + '\n\n' + (0, promptBuilder_1.construirPromptGeneral)(),
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
            temperature: 0.8,
            maxTokens: 400,
        });
        return respuesta.content;
    }
    catch (error) {
        console.error('[FlujoGeneral] Error:', error);
        return `¡Hola! 👋 Soy tu asistente de ventas de Tecnovariedades D&S.

¿En qué puedo ayudarte hoy?
- 💻 Computadores y laptops
- 🏍️ Motos
- 💎 Cursos y megapacks digitales
- 🔧 Servicio técnico

¡Pregúntame lo que necesites! 😊`;
    }
}
function generarSaludo() {
    const saludos = [
        `¡Hola! 👋 Bienvenido a *Tecnovariedades D&S*

¿Qué te gustaría ver hoy?
💻 Computadores
🏍️ Motos
💎 Productos digitales
🔧 Servicios

¡Estoy aquí para ayudarte! 😊`,
        `¡Hola! 😊 ¿Cómo estás?

Soy tu asistente de ventas. Puedo ayudarte con:
- Información de productos
- Precios y disponibilidad
- Métodos de pago
- Envíos

¿Qué necesitas? 💬`,
        `¡Bienvenido! 🎉

Estoy aquí para ayudarte a encontrar lo que buscas.

¿Te interesa algún producto en particular? 🔍`,
    ];
    return saludos[Math.floor(Math.random() * saludos.length)];
}
function generarDespedida() {
    const despedidas = [
        `¡Gracias por escribir! 😊

Si necesitas algo más, aquí estaré.
¡Que tengas un excelente día! 🌟`,
        `¡Hasta pronto! 👋

Recuerda que estoy disponible cuando me necesites.
¡Feliz día! ☀️`,
        `¡Nos vemos! 😊

Cualquier duda, no dudes en escribir.
¡Cuídate! 💙`,
    ];
    return despedidas[Math.floor(Math.random() * despedidas.length)];
}
