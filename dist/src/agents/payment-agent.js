"use strict";
/**
 * Agente de Pago
 * Maneja todo el proceso de pago (funciona SIN IA externa)
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
exports.PaymentAgent = void 0;
const base_agent_1 = require("./base-agent");
const shared_memory_1 = require("./shared-memory");
const payment_methods_config_1 = require("@/lib/payment-methods-config");
class PaymentAgent extends base_agent_1.BaseAgent {
    constructor() {
        super('PaymentAgent');
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
        return true; // Los pagos NUNCA necesitan IA externa
    }
    /**
     * Maneja el pago localmente
     */
    async handleLocally(message, memory) {
        this.log('Manejando pago localmente');
        let product = memory.currentProduct;
        const memoryService = shared_memory_1.SharedMemoryService.getInstance();
        // 🧠 Si no hay producto en contexto, BUSCAR EN MENSAJE ACTUAL PRIMERO
        if (!product) {
            this.log('⚠️ No hay producto en memoria, buscando...');
            // 🔥 1️⃣ PRIMERO: Buscar producto mencionado en el MENSAJE ACTUAL
            const productInMessage = await this.extractProductFromMessage(message, memory.userId);
            if (productInMessage) {
                this.log(`✅ Producto extraído del mensaje actual: ${productInMessage.name}`);
                product = productInMessage;
                memoryService.setCurrentProduct(memory.chatId, product, 'payment_intent');
                memory.currentProduct = product;
                memory.salesStage = 'payment';
            }
            // 2️⃣ Intentar obtener del historial de productos (más confiable)
            if (!product) {
                product = memoryService.findProductInHistory(memory.chatId);
                if (product) {
                    this.log(`✅ Producto recuperado del historial: ${product.name}`);
                    memoryService.setCurrentProduct(memory.chatId, product, 'payment_intent');
                    memory.currentProduct = product;
                    memory.salesStage = 'payment';
                }
            }
            // 3️⃣ Buscar en mensajes del asistente
            if (!product) {
                const recentMessages = memory.messages.slice(-10);
                for (const msg of recentMessages.reverse()) {
                    if (msg.role === 'assistant') {
                        const productMention = await this.extractProductFromMessage(msg.content, memory.userId);
                        if (productMention) {
                            this.log(`✅ Producto extraído de mensajes: ${productMention.name}`);
                            product = productMention;
                            memoryService.setCurrentProduct(memory.chatId, product, 'payment_intent');
                            memory.currentProduct = product;
                            memory.salesStage = 'payment';
                            break;
                        }
                    }
                }
            }
            // 4️⃣ Si aún no hay producto, buscar en productos interesados
            if (!product && memory.interestedProducts?.length > 0) {
                this.log(`✅ Usando último producto de interestedProducts: ${memory.interestedProducts[memory.interestedProducts.length - 1].name}`);
                product = memory.interestedProducts[memory.interestedProducts.length - 1];
                memoryService.setCurrentProduct(memory.chatId, product, 'payment_intent');
                memory.currentProduct = product;
                memory.salesStage = 'payment';
            }
            // 5️⃣ Si definitivamente no hay producto
            if (!product) {
                return {
                    text: `Primero necesito saber qué producto quieres comprar 😊

¿Qué te interesa?`,
                    nextAgent: 'search',
                    confidence: 0.9,
                };
            }
        }
        // Detectar si está seleccionando un método específico
        const selectedMethod = this.detectPaymentMethod(message);
        if (selectedMethod) {
            return await this.generatePaymentLink(product, selectedMethod, memory);
        }
        // Mostrar todos los métodos de pago
        return this.showAllPaymentMethods(product, memory);
    }
    /**
     * Detecta el método de pago seleccionado
     */
    detectPaymentMethod(message) {
        const msg = message.toLowerCase().trim();
        // Métodos virtuales
        if (msg.includes('mercadopago') || msg.includes('mercado pago') || msg === 'mercadopago') {
            return 'mercadopago';
        }
        if (msg.includes('paypal') || msg === 'paypal') {
            return 'paypal';
        }
        // Transferencias móviles
        if (msg.includes('nequi') || msg === 'nequi') {
            return 'nequi';
        }
        if (msg.includes('daviplata') || msg === 'daviplata') {
            return 'daviplata';
        }
        // Consignación bancaria
        if (msg.includes('consignacion') || msg.includes('consignación') ||
            msg.includes('bancaria') || msg.includes('banco') ||
            msg === 'consignacion' || msg === 'consignación') {
            return 'consignacion';
        }
        // Contraentrega
        if (msg.includes('contraentrega') || msg.includes('contra entrega') ||
            msg === 'contraentrega') {
            return 'contraentrega';
        }
        // Métodos genéricos
        if (msg.includes('tarjeta'))
            return 'mercadopago'; // Redirigir a MercadoPago
        if (msg.includes('efectivo'))
            return 'mercadopago'; // Redirigir a MercadoPago
        if (msg.includes('pse'))
            return 'mercadopago'; // Redirigir a MercadoPago
        return null;
    }
    /**
     * Extrae producto mencionado en un mensaje
     */
    async extractProductFromMessage(messageContent, userId) {
        try {
            // Importar dinámicamente para evitar dependencias circulares
            const { db } = await Promise.resolve().then(() => __importStar(require('@/lib/db')));
            const msgLower = messageContent.toLowerCase();
            // Buscar productos que coincidan con el contenido del mensaje
            const products = await db.product.findMany({
                where: {
                    userId,
                    status: 'AVAILABLE'
                }
            });
            // 🔥 BÚSQUEDA INTELIGENTE: Buscar por nombre completo o palabras clave
            for (const p of products) {
                const productNameLower = p.name.toLowerCase();
                // 1. Coincidencia exacta del nombre completo
                if (msgLower.includes(productNameLower)) {
                    this.log(`✅ Coincidencia exacta: ${p.name}`);
                    return {
                        id: p.id,
                        name: p.name,
                        description: p.description || undefined,
                        price: p.price,
                        category: p.category,
                        images: p.images ? [p.images] : undefined,
                        stock: p.stock || undefined,
                        specs: undefined
                    };
                }
                // 2. Coincidencia por palabras clave importantes (mínimo 2 palabras)
                const productWords = productNameLower.split(' ').filter(w => w.length > 3);
                const matchedWords = productWords.filter(word => msgLower.includes(word));
                if (matchedWords.length >= 2) {
                    this.log(`✅ Coincidencia por palabras clave (${matchedWords.length}/${productWords.length}): ${p.name}`);
                    return {
                        id: p.id,
                        name: p.name,
                        description: p.description || undefined,
                        price: p.price,
                        category: p.category,
                        images: p.images ? [p.images] : undefined,
                        stock: p.stock || undefined,
                        specs: undefined
                    };
                }
            }
            // 3. Búsqueda por categoría o tipo de producto
            const categoryKeywords = {
                'curso': ['curso', 'aprender', 'enseñanza'],
                'megapack': ['megapack', 'pack', 'colección'],
                'laptop': ['laptop', 'portátil', 'computador'],
                'moto': ['moto', 'motocicleta'],
            };
            for (const p of products) {
                const category = p.category?.toLowerCase() || '';
                const keywords = categoryKeywords[category] || [];
                if (keywords.some(kw => msgLower.includes(kw))) {
                    this.log(`✅ Coincidencia por categoría: ${p.name}`);
                    return {
                        id: p.id,
                        name: p.name,
                        description: p.description || undefined,
                        price: p.price,
                        category: p.category,
                        images: p.images ? [p.images] : undefined,
                        stock: p.stock || undefined,
                        specs: undefined
                    };
                }
            }
            return null;
        }
        catch (error) {
            console.error('[PaymentAgent] Error extrayendo producto del mensaje:', error);
            return null;
        }
    }
    /**
     * Muestra todos los métodos de pago disponibles según el tipo de producto
     */
    showAllPaymentMethods(product, memory) {
        this.log('Mostrando todos los métodos de pago');
        const price = this.formatPrice(product.price);
        const isDigital = payment_methods_config_1.PaymentMethodsConfig.isDigitalProduct(product);
        let text = `¡Perfecto! 💳 Puedes pagar *${product.name}* por:\n\n`;
        text += `💰 *Monto:* ${price}\n\n`;
        // Usar configuración centralizada
        text += payment_methods_config_1.PaymentMethodsConfig.formatMethodsList(isDigital);
        text += `¿Con cuál método prefieres pagar? 🤔`;
        // Marcar intención de pago
        memory.paymentIntent = true;
        return {
            text,
            nextAgent: 'payment',
            confidence: 0.95,
        };
    }
    /**
     * Genera link de pago para un método específico
     */
    async generatePaymentLink(product, method, memory) {
        this.log(`Generando link de pago para: ${method}`);
        const price = this.formatPrice(product.price);
        const isDigital = payment_methods_config_1.PaymentMethodsConfig.isDigitalProduct(product);
        // Validar que el método esté disponible para este producto
        if (!payment_methods_config_1.PaymentMethodsConfig.isMethodAvailable(method, isDigital)) {
            const errorMessage = payment_methods_config_1.PaymentMethodsConfig.getUnavailableMessage(method, isDigital);
            return {
                text: errorMessage,
                nextAgent: 'payment',
                confidence: 0.9,
            };
        }
        // Guardar método preferido
        memory.preferredPaymentMethod = method;
        memory.paymentLinkSent = true;
        // 🔔 REGISTRAR PAGO PENDIENTE PARA SEGUIMIENTO
        try {
            const { paymentFollowUpService } = await Promise.resolve().then(() => __importStar(require('@/lib/payment-follow-up-service')));
            const customerPhone = memory.chatId.split(':')[1] || memory.chatId;
            await paymentFollowUpService.registerPendingPayment({
                userId: memory.userId,
                customerPhone,
                productId: product.id,
                productName: product.name,
                amount: product.price,
                paymentMethod: method,
            });
            this.log(`✅ Pago pendiente registrado para seguimiento automático`);
        }
        catch (error) {
            this.log(`⚠️ Error registrando seguimiento de pago:`, error);
            // Continuar sin seguimiento si falla
        }
        // Generar instrucciones usando la configuración
        const instructions = payment_methods_config_1.PaymentMethodsConfig.generatePaymentInstructions(method, product, price);
        let text = `¡Excelente elección! 💳\n\n`;
        text += `📦 *Producto:* ${product.name}\n`;
        text += `💰 *Monto:* ${price}\n\n`;
        // Para PayPal, mostrar email directamente (más simple y siempre funciona)
        if (method === 'paypal') {
            const paypalEmail = process.env.PAYPAL_EMAIL || 'deinermena25@gmail.com';
            const priceUSD = (product.price / 4000).toFixed(2);
            text += `💰 *PayPal:*\n`;
            text += `📧 Email: ${paypalEmail}\n`;
            text += `💵 Monto a enviar: $${priceUSD} USD\n\n`;
            text += `*Pasos:*\n`;
            text += `1️⃣ Abre PayPal o tu app de banco\n`;
            text += `2️⃣ Envía $${priceUSD} USD a:\n`;
            text += `   ${paypalEmail}\n`;
            text += `3️⃣ En el concepto escribe: ${product.name}\n`;
            text += `4️⃣ Envíame captura del comprobante\n\n`;
        }
        // Para MercadoPago, generar link DINÁMICO
        else if (method === 'mercadopago') {
            // Usar el generador de links dinámicos
            const { BotPaymentLinkGenerator } = await Promise.resolve().then(() => __importStar(require('@/lib/bot-payment-link-generator')));
            const paymentResult = await BotPaymentLinkGenerator.generatePaymentLinks(product.id, memory.userId, 1);
            if (paymentResult.success && paymentResult.mercadoPagoLink) {
                text += `🔗 *Link de MercadoPago:*\n${paymentResult.mercadoPagoLink}\n\n`;
                text += `${instructions}\n\n`;
            }
            else {
                // Fallback si falla la generación
                text += `${instructions}\n\n`;
                text += `⚠️ Por favor contacta con nosotros para procesar tu pago:\n`;
                text += `📱 WhatsApp: +57 304 274 8687\n\n`;
            }
        }
        // Para otros métodos, usar instrucciones
        else {
            text += `${instructions}\n\n`;
        }
        // Mensaje de entrega según tipo de producto
        if (isDigital) {
            text += `📧 *Entrega:* Recibirás el acceso por correo inmediatamente después de confirmar el pago ✅`;
        }
        else {
            text += `📦 *Envío:* Procesaremos tu pedido inmediatamente después de confirmar el pago ✅`;
        }
        // 🔍 DEBUG: Verificar que el texto tenga el número
        console.log('[PaymentAgent] 📝 Texto generado (primeros 300 chars):', text.substring(0, 300));
        console.log('[PaymentAgent] 🔍 Contiene número de Nequi:', text.includes('3136174267'));
        return {
            text,
            nextAgent: 'closing',
            confidence: 0.95,
            actions: [
                {
                    type: 'send_specific_payment_method',
                    method,
                    product,
                    formattedText: text, // Enviar el texto completo formateado
                },
            ],
        };
    }
    /**
     * Maneja con IA (no se usa, pero debe implementarse)
     */
    async handleWithAI(message, memory) {
        // Los pagos nunca necesitan IA, pero por si acaso
        return this.handleLocally(message, memory);
    }
}
exports.PaymentAgent = PaymentAgent;
