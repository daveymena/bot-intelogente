"use strict";
/**
 * 🧠 SERVICIO DE RAZONAMIENTO PROFUNDO
 * Sistema de análisis paso a paso antes de responder
 * Chain of Thought Reasoning para entender mejor las consultas
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReasoningService = void 0;
const db_1 = require("./db");
const product_intelligence_service_1 = require("./product-intelligence-service");
const conversation_context_service_1 = require("./conversation-context-service");
const ai_multi_provider_1 = require("./ai-multi-provider");
const greeting_detector_1 = require("./greeting-detector");
class ReasoningService {
    /**
     * PASO 1: Analizar el mensaje y entender QUÉ está preguntando
     */
    static analyzeQuery(message) {
        const messageLower = message.toLowerCase();
        // Detectar intención principal
        let mainIntent = 'unknown';
        const subIntents = [];
        const keywords = [];
        let needsContext = false;
        // INTENCIÓN: Pedir link/enlace de pago
        if (/(?:envía|envia|manda|pasa|dame|quiero|necesito|me das|me pasas|me envías|me mandas)\s*(?:el|la)?\s*(?:link|enlace|url|página|pagina)/i.test(messageLower) ||
            /(?:link|enlace|url)\s*(?:de|del|para)?\s*(?:pago|compra|comprar)/i.test(messageLower) ||
            /(?:cuál|cual)\s*(?:es|sería)?\s*(?:el|la)?\s*(?:link|enlace|url)/i.test(messageLower) ||
            /^(?:link|enlace|url)$/i.test(messageLower) ||
            /^(?:envía|envia|manda|pasa|dame)\s+(?:el|la)\s+(?:link|enlace|url)$/i.test(messageLower) ||
            /^(?:envíame|enviame|mándame|mandame|pásame|pasame)\s+(?:el|la)?\s*(?:link|enlace|url)$/i.test(messageLower)) {
            mainIntent = 'request_payment_link';
            subIntents.push('needs_product_context');
            needsContext = true;
            keywords.push('link', 'pago', 'enlace');
        }
        // INTENCIÓN: Cómo pagar / métodos de pago
        else if (/(?:cómo|como)\s*(?:puedo|se|hago para)?\s*(?:pagar|comprar|adquirir)/i.test(messageLower) ||
            /(?:métodos|metodos|formas|opciones)\s*(?:de)?\s*(?:pago|compra)/i.test(messageLower) ||
            /(?:qué|que)\s*(?:métodos|metodos|formas)\s*(?:de pago|aceptan|tienen)/i.test(messageLower)) {
            mainIntent = 'ask_payment_methods';
            subIntents.push('needs_product_context');
            needsContext = true;
            keywords.push('pago', 'métodos', 'comprar');
        }
        // INTENCIÓN: Precio
        else if (/(?:cuánto|cuanto|qué|que)\s*(?:cuesta|vale|precio|valor|es el precio)/i.test(messageLower) ||
            /(?:precio|costo)\s*(?:de|del)/i.test(messageLower)) {
            mainIntent = 'ask_price';
            subIntents.push('needs_product_context');
            needsContext = true;
            keywords.push('precio', 'cuesta');
        }
        // INTENCIÓN: Información del producto
        else if (/(?:info|información|informacion|detalles|características|caracteristicas)\s*(?:de|del|sobre)/i.test(messageLower) ||
            /(?:qué|que)\s*(?:es|tiene|incluye|trae)/i.test(messageLower) ||
            /(?:cuéntame|cuentame|dime|explícame|explicame)\s*(?:sobre|de|del)/i.test(messageLower)) {
            mainIntent = 'ask_info';
            subIntents.push('needs_product_context');
            needsContext = true;
            keywords.push('info', 'detalles');
        }
        // INTENCIÓN: Comprar
        else if (/(?:quiero|deseo|me gustaría|quisiera|voy a)\s*(?:comprar|adquirir|pedir|ordenar)/i.test(messageLower) ||
            /(?:comprar|compra|pedido|orden)/i.test(messageLower)) {
            mainIntent = 'want_to_buy';
            subIntents.push('needs_product_context', 'needs_payment_info');
            needsContext = true;
            keywords.push('comprar', 'pedido');
        }
        // INTENCIÓN: Disponibilidad
        else if (/(?:disponible|hay|tienes|tienen|queda|quedan|stock)/i.test(messageLower)) {
            mainIntent = 'ask_availability';
            subIntents.push('needs_product_context');
            needsContext = true;
            keywords.push('disponible', 'stock');
        }
        // INTENCIÓN: Saludo
        else if (/^(?:hola|hi|hey|buenos días|buenas tardes|buenas noches|buenas)$/i.test(messageLower)) {
            mainIntent = 'greeting';
            needsContext = false;
        }
        // INTENCIÓN: Agradecimiento
        else if (/^(?:gracias|muchas gracias|ok|vale|perfecto|entendido|listo)$/i.test(messageLower)) {
            mainIntent = 'acknowledgment';
            needsContext = false;
        }
        // Detectar si usa pronombres que requieren contexto
        if (/^(?:ese|esa|esto|esta|eso|el|la|lo)\s/i.test(messageLower) ||
            /^(?:y|pero|entonces|además|también)\s/i.test(messageLower)) {
            needsContext = true;
            subIntents.push('uses_pronouns');
        }
        return {
            mainIntent,
            subIntents,
            keywords,
            needsContext
        };
    }
    /**
     * PASO 2: Buscar el producto mencionado o en contexto
     */
    static async findRelevantProduct(message, userId, conversationKey, conversationHistory) {
        // Estrategia 1: Buscar en el mensaje actual
        let product = await product_intelligence_service_1.ProductIntelligenceService.findProduct(message, userId);
        if (product) {
            console.log(`[Reasoning] ✅ Producto encontrado en mensaje actual: ${product.name}`);
            return product;
        }
        // Estrategia 2: Buscar en memoria de contexto
        const context = conversation_context_service_1.ConversationContextService.getProductContext(conversationKey);
        if (context) {
            product = await db_1.db.product.findUnique({
                where: { id: context.lastProductId }
            });
            if (product) {
                console.log(`[Reasoning] 💾 Producto recuperado de memoria: ${product.name}`);
                return product;
            }
        }
        // Estrategia 3: Buscar en historial de conversación
        if (conversationHistory.length > 0) {
            console.log(`[Reasoning] 📚 Buscando en historial...`);
            // Buscar en los últimos 5 mensajes del usuario
            for (let i = conversationHistory.length - 1; i >= Math.max(0, conversationHistory.length - 10); i--) {
                const historicalMessage = conversationHistory[i];
                if (historicalMessage.role === 'user') {
                    const foundProduct = await product_intelligence_service_1.ProductIntelligenceService.findProduct(historicalMessage.content, userId);
                    if (foundProduct) {
                        console.log(`[Reasoning] ✅ Producto encontrado en historial: ${foundProduct.name}`);
                        return foundProduct;
                    }
                }
            }
        }
        console.log(`[Reasoning] ❌ No se encontró producto`);
        return null;
    }
    /**
     * PASO 3: Extraer información de pago del producto
     */
    static extractPaymentInfo(product) {
        const links = product_intelligence_service_1.ProductIntelligenceService.extractLinks(product);
        const isDigital = product.category === 'DIGITAL';
        const isPhysical = product.category === 'PHYSICAL';
        const methods = [];
        if (links.buy)
            methods.push('Hotmart');
        if (links.mercadopago)
            methods.push('MercadoPago');
        if (links.paypal)
            methods.push('PayPal');
        if (links.contacto)
            methods.push('Contacto directo');
        // Productos físicos siempre tienen contacto directo
        if (isPhysical) {
            methods.push('Contacto directo');
            methods.push('Efectivo');
            methods.push('Transferencia');
            methods.push('Nequi/Daviplata');
        }
        return {
            hasPaymentLinks: methods.length > 0,
            methods,
            links,
            isDigital,
            isPhysical
        };
    }
    /**
     * RAZONAMIENTO COMPLETO: Analizar, buscar, decidir
     */
    static async reason(message, userId, customerPhone, conversationHistory = []) {
        const steps = [];
        const conversationKey = `${userId}:${customerPhone}`;
        // PASO 0: Detectar si es SOLO un saludo
        if (greeting_detector_1.GreetingDetector.isGreeting(message)) {
            console.log(`[Reasoning] 👋 Saludo detectado - Respuesta simple`);
            return {
                steps: [{
                        step: 0,
                        thought: 'El cliente solo está saludando',
                        action: 'Responder con saludo amigable sin información de productos',
                        result: { type: 'greeting' }
                    }],
                finalIntent: 'greeting',
                confidence: 1.0,
                shouldUseAI: false,
                suggestedResponse: greeting_detector_1.GreetingDetector.generateGreetingResponse()
            };
        }
        // PASO 0.5: Detectar si es pregunta general (deshabilitado temporalmente)
        // TODO: Implementar isGeneralQuestion en GreetingDetector
        // PASO 1: Analizar la consulta
        steps.push({
            step: 1,
            thought: 'Analizando el mensaje para entender qué está preguntando el cliente',
            action: 'Detectar intención principal y palabras clave'
        });
        const analysis = this.analyzeQuery(message);
        steps[0].result = {
            intent: analysis.mainIntent,
            subIntents: analysis.subIntents,
            keywords: analysis.keywords,
            needsContext: analysis.needsContext
        };
        console.log(`[Reasoning] Paso 1 - Intención detectada: ${analysis.mainIntent}`);
        console.log(`[Reasoning] Necesita contexto: ${analysis.needsContext}`);
        // PASO 2: Buscar producto si es necesario
        let product = null;
        if (analysis.needsContext || analysis.subIntents.includes('needs_product_context')) {
            steps.push({
                step: 2,
                thought: 'El cliente pregunta sobre un producto. Necesito identificar cuál.',
                action: 'Buscar producto en mensaje actual, memoria o historial'
            });
            product = await this.findRelevantProduct(message, userId, conversationKey, conversationHistory);
            steps[1].result = product ? {
                found: true,
                productName: product.name,
                productId: product.id
            } : {
                found: false,
                reason: 'No se encontró producto en mensaje, memoria ni historial'
            };
            console.log(`[Reasoning] Paso 2 - Producto: ${product ? product.name : 'No encontrado'}`);
        }
        // PASO 3: Analizar información de pago si pregunta por eso
        let paymentInfo = null;
        if (product && (analysis.mainIntent === 'request_payment_link' ||
            analysis.mainIntent === 'ask_payment_methods' ||
            analysis.mainIntent === 'want_to_buy')) {
            steps.push({
                step: 3,
                thought: 'El cliente quiere información de pago. Voy a verificar qué métodos tiene disponibles este producto.',
                action: 'Extraer métodos de pago y enlaces del producto'
            });
            paymentInfo = this.extractPaymentInfo(product);
            steps[2].result = {
                hasLinks: paymentInfo.hasPaymentLinks,
                methods: paymentInfo.methods,
                isDigital: paymentInfo.isDigital,
                isPhysical: paymentInfo.isPhysical
            };
            console.log(`[Reasoning] Paso 3 - Métodos de pago: ${paymentInfo.methods.join(', ')}`);
        }
        // PASO 4: Decidir cómo responder
        steps.push({
            step: steps.length + 1,
            thought: 'Ahora que entiendo la pregunta y tengo la información, voy a decidir cómo responder.',
            action: 'Generar respuesta apropiada'
        });
        let shouldUseAI = true;
        let suggestedResponse;
        let confidence = 0.7;
        // Casos donde podemos responder directamente sin IA
        if (analysis.mainIntent === 'greeting') {
            shouldUseAI = false;
            confidence = 0.95;
            suggestedResponse = '👋 Hola ¡Bienvenido a Tecnovariedades D&S! 😄💻\n\nAquí encontrarás tecnología, soporte, cursos y herramientas digitales para potenciar tu día a día.\n\n📦 ¿Buscas algún producto, servicio o información en especial?';
        }
        else if (analysis.mainIntent === 'acknowledgment') {
            shouldUseAI = false;
            confidence = 0.95;
            suggestedResponse = '¡Perfecto! 👍 ¿Hay algo más en lo que pueda ayudarte?';
        }
        else if (analysis.mainIntent === 'request_payment_link' && product && paymentInfo) {
            shouldUseAI = false;
            confidence = 0.9;
            suggestedResponse = await this.generatePaymentLinkResponse(product, paymentInfo);
        }
        else if (analysis.mainIntent === 'ask_payment_methods' && product && paymentInfo) {
            shouldUseAI = false;
            confidence = 0.9;
            suggestedResponse = this.generatePaymentMethodsResponse(product, paymentInfo);
        }
        else if (analysis.mainIntent === 'ask_price' && product) {
            shouldUseAI = false;
            confidence = 0.9;
            suggestedResponse = this.generatePriceResponse(product);
        }
        else if (!product && analysis.needsContext) {
            // No encontró producto pero lo necesita
            shouldUseAI = true;
            confidence = 0.6;
            suggestedResponse = undefined; // Dejar que la IA maneje esto
        }
        steps[steps.length - 1].result = {
            shouldUseAI,
            confidence,
            hasDirectResponse: !!suggestedResponse
        };
        console.log(`[Reasoning] Paso ${steps.length} - Decisión: ${shouldUseAI ? 'Usar IA' : 'Respuesta directa'}`);
        return {
            steps,
            finalIntent: analysis.mainIntent,
            confidence,
            productFound: product,
            shouldUseAI,
            suggestedResponse
        };
    }
    /**
     * Generar respuesta de link de pago
     */
    static async generatePaymentLinkResponse(product, paymentInfo) {
        const emoji = product_intelligence_service_1.ProductIntelligenceService.extractProductInfo(product).emoji;
        // Productos físicos
        if (paymentInfo.isPhysical) {
            return `Para adquirir ${product.name} ${emoji}, contáctanos directamente:\n\n📞 WhatsApp: +57 304 274 8687\n📧 deinermen25@gmail.com\n📍 Centro Comercial El Diamante 2, San Nicolás, Cali\n\nMétodos de pago:\n✅ Efectivo\n✅ Transferencia\n✅ Nequi/Daviplata\n✅ Tarjeta de crédito`;
        }
        // Productos digitales - Generar links dinámicos
        try {
            const { PaymentLinkGenerator } = await Promise.resolve().then(() => __importStar(require('./payment-link-generator')));
            const paymentLinks = await PaymentLinkGenerator.generatePaymentLinks(product.id);
            if (paymentLinks) {
                return PaymentLinkGenerator.formatForWhatsApp(paymentLinks);
            }
        }
        catch (error) {
            console.error('[Reasoning] Error generando links:', error);
        }
        // Fallback si no se pueden generar links
        let response = `¡Perfecto! Aquí están los métodos de pago para ${product.name} ${emoji}\n\n💰 Precio: ${product.price.toLocaleString('es-CO')} COP\n\n`;
        response += `1️⃣ **NEQUI / DAVIPLATA**\n`;
        response += `   📱 Número: 3136174267\n\n`;
        response += `2️⃣ **TRANSFERENCIA BANCARIA**\n`;
        response += `   🏦 Banco: Bancolombia\n`;
        response += `   📋 Cuenta: 12345678901\n\n`;
        response += `📞 **Soporte:** +57 304 274 8687\n\n`;
        response += `¿Con cuál método deseas pagar?`;
        return response;
    }
    /**
     * Generar respuesta de métodos de pago
     */
    static generatePaymentMethodsResponse(product, paymentInfo) {
        const emoji = product_intelligence_service_1.ProductIntelligenceService.extractProductInfo(product).emoji;
        let response = `Para ${product.name} ${emoji} aceptamos:\n\n`;
        if (paymentInfo.isPhysical) {
            response += `✅ Efectivo\n✅ Transferencia bancaria\n✅ Nequi/Daviplata\n✅ Tarjeta de crédito\n\n📍 Ubicación:\nCentro Comercial El Diamante 2, San Nicolás, Cali\n\n📞 Contacto:\n+57 304 274 8687`;
        }
        else {
            paymentInfo.methods.forEach((method) => {
                response += `✅ ${method}\n`;
            });
            response += `\n💰 Precio: ${product.price.toLocaleString('es-CO')} COP\n\n¿Deseas el enlace de pago?`;
        }
        return response;
    }
    /**
     * Generar respuesta de precio
     */
    static generatePriceResponse(product) {
        const emoji = product_intelligence_service_1.ProductIntelligenceService.extractProductInfo(product).emoji;
        let response = `El ${product.name} cuesta **${product.price.toLocaleString('es-CO')} COP** ${emoji}\n\n`;
        if (product.description) {
            const firstLine = product.description.split('\n')[0];
            response += `${firstLine}\n\n`;
        }
        response += `¿Deseas más información o el enlace de compra?`;
        return response;
    }
    /**
     * Generar respuesta usando AIMultiProvider cuando se necesita IA
     */
    static async generateAIResponse(message, userId, customerPhone, reasoningResult, conversationHistory = []) {
        // Si ya tenemos una respuesta sugerida, usarla
        if (!reasoningResult.shouldUseAI && reasoningResult.suggestedResponse) {
            return reasoningResult.suggestedResponse;
        }
        // Construir contexto enriquecido para la IA
        let contextPrompt = `Eres un asistente de ventas de Tecnovariedades D&S.\n\n`;
        // Agregar información del razonamiento
        contextPrompt += `📊 ANÁLISIS DE LA CONSULTA:\n`;
        contextPrompt += `- Intención detectada: ${reasoningResult.finalIntent}\n`;
        contextPrompt += `- Confianza: ${(reasoningResult.confidence * 100).toFixed(0)}%\n\n`;
        // Agregar información del producto si se encontró
        if (reasoningResult.productFound) {
            const product = reasoningResult.productFound;
            contextPrompt += `🎯 PRODUCTO RELEVANTE:\n`;
            contextPrompt += `- Nombre: ${product.name}\n`;
            contextPrompt += `- Precio: ${product.price.toLocaleString('es-CO')} COP\n`;
            contextPrompt += `- Categoría: ${product.category}\n`;
            if (product.description) {
                contextPrompt += `- Descripción: ${product.description.substring(0, 200)}...\n`;
            }
            contextPrompt += `\n`;
        }
        // Agregar historial de conversación
        if (conversationHistory.length > 0) {
            contextPrompt += `💬 HISTORIAL RECIENTE:\n`;
            conversationHistory.slice(-3).forEach(msg => {
                contextPrompt += `${msg.role === 'user' ? '👤 Cliente' : '🤖 Asistente'}: ${msg.content}\n`;
            });
            contextPrompt += `\n`;
        }
        contextPrompt += `📝 MENSAJE ACTUAL DEL CLIENTE:\n${message}\n\n`;
        contextPrompt += `Responde de manera natural, amigable y profesional. Si el cliente pregunta por un producto que no encontramos, ofrece ayuda para buscar lo que necesita.`;
        try {
            // Construir mensajes para el multi-provider
            const messages = [
                {
                    role: 'system',
                    content: 'Eres un asistente de ventas experto en tecnología, amigable y profesional. Respondes en español de manera natural y conversacional.'
                },
                {
                    role: 'user',
                    content: contextPrompt
                }
            ];
            // Usar AIMultiProvider con fallback automático
            const aiResponse = await ai_multi_provider_1.AIMultiProvider.generateCompletion(messages, {
                temperature: 0.7,
                max_tokens: 500
            });
            return aiResponse.content;
        }
        catch (error) {
            console.error('[Reasoning] Error generando respuesta con IA:', error);
            // Fallback si falla la IA
            if (reasoningResult.suggestedResponse) {
                return reasoningResult.suggestedResponse;
            }
            return '¡Hola! Estoy aquí para ayudarte. ¿En qué puedo asistirte hoy? 😊';
        }
    }
    /**
     * Mostrar el proceso de razonamiento (para debugging)
     */
    static formatReasoningSteps(result) {
        let output = '🧠 PROCESO DE RAZONAMIENTO:\n\n';
        result.steps.forEach(step => {
            output += `${step.step}. ${step.thought}\n`;
            output += `   Acción: ${step.action}\n`;
            if (step.result) {
                output += `   Resultado: ${JSON.stringify(step.result, null, 2)}\n`;
            }
            output += '\n';
        });
        output += `\n✅ DECISIÓN FINAL:\n`;
        output += `- Intención: ${result.finalIntent}\n`;
        output += `- Confianza: ${(result.confidence * 100).toFixed(0)}%\n`;
        output += `- Producto: ${result.productFound ? result.productFound.name : 'No encontrado'}\n`;
        output += `- Usar IA: ${result.shouldUseAI ? 'Sí' : 'No (respuesta directa)'}\n`;
        return output;
    }
}
exports.ReasoningService = ReasoningService;
