"use strict";
/**
 * 🎯 SERVICIO DE IA ORIENTADO A VENTAS
 * Combina IA con técnicas de ventas profesionales
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesOrientedAIService = void 0;
const training_data_1 = require("./training-data");
class SalesOrientedAIService {
    /**
     * Procesar mensaje con enfoque de ventas
     */
    static async processWithSalesApproach(message, products, conversationHistory) {
        const normalizedMessage = message.toLowerCase().trim();
        // 1. DETECTAR SEÑALES DE COMPRA
        if ((0, training_data_1.detectBuyingSignal)(message)) {
            return {
                response: this.generateClosingResponse(products),
                salesStage: 'closing',
                nextActions: ['send_payment_link', 'confirm_details', 'close_sale'],
                shouldSendProducts: false
            };
        }
        // 2. MANEJAR OBJECIONES
        const objection = (0, training_data_1.detectObjection)(message);
        if (objection) {
            return {
                response: this.handleObjection(objection, products),
                salesStage: 'objection',
                nextActions: ['address_concern', 'provide_value', 'ask_closing_question'],
                shouldSendProducts: false
            };
        }
        // 3. SALUDOS (Etapa inicial)
        const greetingResponse = (0, training_data_1.findBestResponse)(message, training_data_1.greetingPatterns);
        if (greetingResponse) {
            return {
                response: greetingResponse,
                salesStage: 'greeting',
                nextActions: ['ask_needs', 'show_categories'],
                shouldSendProducts: false
            };
        }
        // 4. CONSULTAS GENERALES (Descubrimiento)
        const generalResponse = (0, training_data_1.findBestResponse)(message, training_data_1.generalInquiryPatterns);
        if (generalResponse) {
            return {
                response: generalResponse,
                salesStage: 'discovery',
                nextActions: ['qualify_lead', 'present_products'],
                shouldSendProducts: false
            };
        }
        // 5. PRESENTACIÓN DE PRODUCTOS
        if (products.length > 0) {
            return {
                response: this.generateProductPresentation(products, message),
                salesStage: 'presentation',
                nextActions: ['highlight_benefits', 'create_urgency', 'ask_closing_question'],
                shouldSendProducts: true
            };
        }
        // 6. RESPUESTA GENÉRICA CON ENFOQUE DE VENTAS
        return {
            response: this.generateGenericSalesResponse(message, conversationHistory),
            salesStage: 'discovery',
            nextActions: ['ask_needs', 'qualify_lead'],
            shouldSendProducts: false
        };
    }
    /**
     * Generar presentación de productos con enfoque de ventas
     */
    static generateProductPresentation(products, userMessage) {
        const productCount = products.length;
        if (productCount === 1) {
            const product = products[0];
            return `¡Perfecto! Tengo justo lo que necesitas 🎯

Te presento una excelente opción que se ajusta a lo que buscas.

(Te envío la información completa con foto en un momento...)

💡 **¿Por qué te va a encantar?**
✅ Excelente relación calidad-precio
✅ Garantía incluida
✅ Soporte técnico post-venta
✅ Disponible para entrega inmediata

¿Te gustaría conocer más detalles o tienes alguna pregunta específica?`;
        }
        return `¡Excelente elección! 🎯

Tengo ${productCount} opciones perfectas para ti, cada una con sus ventajas.

(Te las envío con fotos y detalles completos...)

💡 **Todas incluyen:**
✅ Garantía oficial
✅ Soporte técnico
✅ Asesoría personalizada
✅ Entrega rápida

Mientras las revisas, dime: **¿Cuál es tu prioridad principal?**
- ¿Mejor precio?
- ¿Mejores especificaciones?
- ¿Balance precio-calidad?

Así te ayudo a elegir la ideal para ti 😊`;
    }
    /**
     * Manejar objeciones con técnicas de ventas
     */
    static handleObjection(objectionType, products) {
        const objection = training_data_1.objectionHandling[objectionType];
        if (!objection) {
            return `Entiendo tu preocupación. Déjame ayudarte a resolverla.

¿Qué es específicamente lo que te preocupa? Así puedo darte la información exacta que necesitas para tomar la mejor decisión. 😊`;
        }
        const response = objection.responses[0];
        // Agregar call-to-action
        return `${response}

💬 **Cuéntame:** ¿Qué más necesitas saber para sentirte 100% seguro de tu compra?`;
    }
    /**
     * Generar respuesta de cierre
     */
    static generateClosingResponse(products) {
        if (products.length === 0) {
            return `¡Perfecto! Estás listo para avanzar 🎉

${training_data_1.faqResponses.payment_methods}

**¿Cuál método prefieres?** Te guío en el proceso paso a paso. 😊`;
        }
        const product = products[0];
        return `¡Excelente decisión! 🎉

**RESUMEN DE TU COMPRA:**
📦 Producto: ${product.name}
💰 Precio: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(product.price)}

${training_data_1.faqResponses.payment_methods}

**SIGUIENTE PASO:**
1️⃣ Elige tu método de pago preferido
2️⃣ Completa el pago
3️⃣ Envíame el comprobante
4️⃣ ¡Listo! Coordinamos la entrega

¿Con cuál método quieres pagar? 😊`;
    }
    /**
     * Generar respuesta genérica con enfoque de ventas
     */
    static generateGenericSalesResponse(message, history) {
        // Detectar si es una pregunta de seguimiento
        const isFollowUp = history.length > 2;
        if (isFollowUp) {
            return `Claro, con gusto te ayudo con eso 😊

Para darte la mejor respuesta y recomendación, cuéntame un poco más:

❓ **¿Qué es lo más importante para ti?**
- ¿Tienes un presupuesto en mente?
- ¿Para qué lo vas a usar principalmente?
- ¿Necesitas algo específico?

Así puedo mostrarte exactamente lo que necesitas. 🎯`;
        }
        return `¡Hola! 👋 Gracias por contactarnos.

Estoy aquí para ayudarte a encontrar exactamente lo que necesitas.

💻 **Tenemos:**
- Laptops (nuevas y usadas)
- PCs de escritorio
- Gaming
- Accesorios
- Cursos digitales (Megapacks)

**¿Qué te interesa?** O si prefieres, cuéntame para qué lo necesitas y te recomiendo lo mejor. 😊`;
    }
    /**
     * Agregar técnica de cierre a respuesta
     */
    static addClosingTechnique(response, technique) {
        const closing = training_data_1.closingTechniques[technique];
        return `${response}

${closing}`;
    }
    /**
     * Detectar etapa de venta actual
     */
    static detectSalesStage(conversationHistory) {
        if (conversationHistory.length === 0)
            return 'greeting';
        if (conversationHistory.length <= 2)
            return 'discovery';
        const lastMessages = conversationHistory.slice(-3).map((m) => m.content.toLowerCase());
        // Detectar objeciones
        if (lastMessages.some(m => m.includes('caro') || m.includes('pensarlo') || m.includes('no se'))) {
            return 'objection';
        }
        // Detectar cierre
        if (lastMessages.some(m => m.includes('pago') || m.includes('comprar') || m.includes('cuando'))) {
            return 'closing';
        }
        // Detectar presentación
        if (lastMessages.some(m => m.includes('precio') || m.includes('especificaciones') || m.includes('características'))) {
            return 'presentation';
        }
        return 'discovery';
    }
    /**
     * Generar urgencia (sin ser agresivo)
     */
    static generateUrgency(product) {
        const urgencyMessages = [
            `💡 **Dato importante:** Este modelo tiene alta demanda. Si te interesa, te recomiendo apartarlo pronto.`,
            `⏰ **Aviso:** Tenemos pocas unidades disponibles. ¿Te lo reservo?`,
            `🎯 **Oportunidad:** El precio actual es una oferta especial. Mañana podría cambiar.`,
            `✨ **Consejo:** Si decides hoy, te incluyo envío gratis.`
        ];
        return urgencyMessages[Math.floor(Math.random() * urgencyMessages.length)];
    }
    /**
     * Generar pregunta de calificación
     */
    static generateQualifyingQuestion(context) {
        const questions = {
            budget: '💰 **Para recomendarte mejor:** ¿Tienes un presupuesto aproximado en mente?',
            use_case: '🎯 **Para encontrar lo ideal:** ¿Para qué lo vas a usar principalmente?',
            timeline: '⏰ **Para coordinar:** ¿Para cuándo lo necesitas?',
            preferences: '✨ **Para personalizar:** ¿Tienes alguna preferencia específica? (marca, color, tamaño)',
        };
        return questions[context] || questions.use_case;
    }
}
exports.SalesOrientedAIService = SalesOrientedAIService;
exports.default = SalesOrientedAIService;
