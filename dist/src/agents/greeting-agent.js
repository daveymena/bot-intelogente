"use strict";
/**
 * Agente de Saludo
 * Maneja saludos y bienvenidas (funciona SIN IA externa)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreetingAgent = void 0;
const base_agent_1 = require("./base-agent");
class GreetingAgent extends base_agent_1.BaseAgent {
    constructor() {
        super('GreetingAgent');
    }
    /**
     * Ejecuta el agente
     */
    async execute(message, memory) {
        // Este agente SIEMPRE puede manejar localmente
        return this.handleLocally(message, memory);
    }
    /**
     * Determina si puede manejar localmente (siempre SÍ)
     */
    canHandleLocally(message, memory) {
        return true; // Los saludos NUNCA necesitan IA externa
    }
    /**
     * Maneja el saludo localmente
     */
    async handleLocally(message, memory) {
        this.log('Manejando saludo localmente');
        // 🔥 CORRECCIÓN CRÍTICA: Si ya se envió saludo en esta conversación, NO repetir
        if (memory.greetingSent) {
            this.log('Saludo ya enviado anteriormente - evitando repetición');
            // Si tiene producto en contexto, ir directo a él
            if (memory.currentProduct) {
                return {
                    text: `¿Sigues interesado en el *${memory.currentProduct.name}*?

O si prefieres, puedo ayudarte con algo más 🤔`,
                    nextAgent: 'product',
                    confidence: 0.95,
                };
            }
            // Si no hay producto, ir a búsqueda
            return {
                text: `¿En qué puedo ayudarte? 🤔`,
                nextAgent: 'search',
                confidence: 0.95,
            };
        }
        // Marcar que se va a enviar saludo
        memory.greetingSent = true;
        const isReturningCustomer = memory.messageCount > 1;
        const hasName = !!memory.userName;
        // Cliente recurrente
        if (isReturningCustomer) {
            const greeting = hasName
                ? `¡Hola de nuevo, ${memory.userName}! 😊`
                : `¡Hola de nuevo! 😊`;
            // Si tiene producto en contexto, recordarlo
            if (memory.currentProduct) {
                return {
                    text: `${greeting}

¿Sigues interesado en el *${memory.currentProduct.name}*?

O si prefieres, puedo ayudarte con algo más 🤔`,
                    nextAgent: 'product',
                    confidence: 0.95,
                };
            }
            return {
                text: `${greeting}

¿En qué puedo ayudarte hoy? 💡`,
                nextAgent: 'search',
                confidence: 0.95,
            };
        }
        // Cliente nuevo
        const greetings = [
            `¡Hola! 👋 Bienvenido a *Tecnovariedades D&S*

¿Qué te gustaría ver?
💻 Computadores y laptops
🏍️ Motos
💎 Cursos digitales (Megapacks)
🔧 Servicios técnicos`,
            `¡Hola! 😊 Bienvenido a *Tecnovariedades D&S*

Tenemos:
• 💻 Tecnología (laptops, accesorios)
• 🏍️ Motos
• 💎 Cursos digitales
• 🔧 Servicios

¿Qué te interesa?`,
            `¡Hola! 👋 ¿Cómo estás?

Soy el asistente de *Tecnovariedades D&S*

Puedo ayudarte con:
✅ Información de productos
✅ Precios y disponibilidad
✅ Métodos de pago
✅ Envíos

¿Qué necesitas? 😊`,
        ];
        // Seleccionar saludo aleatorio
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        return {
            text: greeting,
            nextAgent: 'search',
            confidence: 0.95,
        };
    }
    /**
     * Maneja con IA (no se usa, pero debe implementarse)
     */
    async handleWithAI(message, memory) {
        // Los saludos nunca necesitan IA, pero por si acaso
        return this.handleLocally(message, memory);
    }
}
exports.GreetingAgent = GreetingAgent;
