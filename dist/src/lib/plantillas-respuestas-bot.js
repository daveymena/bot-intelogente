"use strict";
/**
 * Smart Sales Bot Pro — Flujo conversacional completo para Baileys + Groq
 * Proyecto: Tecnovariedades D&S
 *
 * Motor modular de plantillas, manejador de estados, integraciones
 * y ejemplos listos para conectar con Baileys (WhatsApp) y Groq (Llama 3.1)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowEngine = exports.BaileysHelpers = exports.PaymentLinkGenerator = exports.PaymentIntentDetector = exports.Templates = exports.Utils = void 0;
exports.createFlowEngine = createFlowEngine;
const axios_1 = __importDefault(require("axios"));
const db_1 = require("./db");
// --------------------------- HELPERS ---------------------------
exports.Utils = {
    fill(template = '', data = {}) {
        return template.replace(/\{(.*?)\}/g, (_, k) => {
            const key = k.trim();
            return (data[key] !== undefined && data[key] !== null) ? data[key] : `{${key}}`;
        });
    },
    shortId() {
        return Math.random().toString(36).slice(2, 9);
    },
    norm(text = '') {
        return (text || '').toLowerCase().trim();
    },
    formatPrice(price) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    }
};
// --------------------------- TEMPLATES ---------------------------
exports.Templates = {
    meta: {
        brandName: 'Tecnovariedades D&S',
        businessPhone: '+57 300 123 4567',
        supportEmail: 'soporte@tecnovariedades.com'
    },
    messages: {
        welcome: `¡Hola! 👋 Bienvenido a {brandName} — soy tu asistente virtual.

¿En qué te puedo ayudar hoy?

Puedes escribir:
- "Ver productos"
- "Cursos / Megapack"
- "Reparación"
- "Hablar con asesor"`,
        product_info: `🔎 *{product_name}*

{description}

💰 Precio: {price}
📦 Disponibilidad: {stock}
✨ Uso recomendado: {use}

Puedes responder: "Fotos", "Especificaciones", "Comprar" o "Comparar"`,
        bundle_info: `🎓 *Megapack: {pack_name}*

📚 Incluye: {count} cursos
🔓 Acceso: {access}
💰 Precio pack: {price_pack}
💵 Precio por unidad: {price_unit}

Responde: "Demo", "Comprar Pack" o "Ver lista completa"`,
        payment_link: `💳 *¡Perfecto {customer_name}!*

Aquí tienes tu link seguro de pago vía *{payment_method}* para:

📦 *{product_name}*
💰 Total: {total}

👉 {payment_link}

⚠️ Una vez realizado el pago, envíanos una captura o espera unos segundos para confirmar automáticamente tu compra.

¿Deseas que te envíe también el *comprobante digital o factura*?`,
        payment_methods: `💰 Actualmente aceptamos los siguientes métodos de pago:

- 💵 *MercadoPago* (tarjeta, PSE, efectivo)
- 🌍 *PayPal* (tarjeta internacional)
- 📱 *Nequi* (transferencia)
- 💳 *Daviplata* (transferencia)

¿Con cuál te gustaría realizar tu compra?`,
        purchase_confirmation: `✅ *Compra confirmada*

📋 Orden: {order_id}
📦 Producto: {product_name}
💰 Total: {total}
💳 Método: {payment_method}

Recibirás enlace y acceso en {delivery_time}.

¿Deseas factura o comprobante? Responde "Factura"`,
        fallback: `Lo siento, no entendí eso. Puedes escribir:
- "Ver productos"
- "Cursos"
- "Servicio"
- "Hablar con asesor"`,
        goodbye: `Gracias por contactarnos 🙌

Si necesitas algo más, escribe en cualquier momento.

¡Que tengas un gran día!`
    }
};
// --------------------------- PAYMENT INTENT DETECTOR ---------------------------
class PaymentIntentDetector {
    static detectIntent(text) {
        const norm = exports.Utils.norm(text);
        // Detectar solicitud directa de link de pago
        if (this.paymentIntents.some(intent => norm.includes(intent))) {
            return 'payment_request';
        }
        // Detectar consulta sobre métodos de pago
        if (norm.includes('metodo') || norm.includes('formas de pago') || norm.includes('como pago')) {
            return 'payment_methods';
        }
        return null;
    }
    static detectPaymentMethod(text) {
        const norm = exports.Utils.norm(text);
        if (norm.includes('mercado') || norm.includes('mercadopago'))
            return 'mercadopago';
        if (norm.includes('paypal'))
            return 'paypal';
        if (norm.includes('nequi'))
            return 'nequi';
        if (norm.includes('daviplata'))
            return 'daviplata';
        return null;
    }
}
exports.PaymentIntentDetector = PaymentIntentDetector;
PaymentIntentDetector.paymentIntents = [
    'quiero pagar',
    'enviame el link',
    'cómo puedo pagar',
    'pago ahora',
    'dame el enlace',
    'pasame el pago',
    'link de compra',
    'finalizar compra',
    'quiero el link',
    'link de mercado pago',
    'link de paypal',
    'enviar link',
    'método de pago',
    'formas de pago',
    'como pago',
    'quiero comprar',
    'realizar pago'
];
// --------------------------- PAYMENT LINK GENERATOR ---------------------------
class PaymentLinkGenerator {
    static async generateLink(params) {
        try {
            // Llamar a la API de generación de links de pago
            const response = await axios_1.default.post(`${process.env.NEXT_PUBLIC_APP_URL}/api/payments/generate-link`, {
                productId: params.productId,
                productName: params.productName,
                amount: params.amount,
                method: params.method,
                userId: params.userId
            });
            return response.data.paymentLink || response.data.link;
        }
        catch (error) {
            console.error('Error generando link de pago:', error);
            // Fallback: generar link manual según el método
            return this.generateFallbackLink(params);
        }
    }
    static generateFallbackLink(params) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        switch (params.method.toLowerCase()) {
            case 'mercadopago':
                return `${baseUrl}/payment/mercadopago?product=${encodeURIComponent(params.productName)}&amount=${params.amount}`;
            case 'paypal':
                return `${baseUrl}/payment/paypal?product=${encodeURIComponent(params.productName)}&amount=${params.amount}`;
            default:
                return `${baseUrl}/payment?product=${encodeURIComponent(params.productName)}&amount=${params.amount}`;
        }
    }
}
exports.PaymentLinkGenerator = PaymentLinkGenerator;
// --------------------------- BAILEYS HELPERS ---------------------------
exports.BaileysHelpers = {
    textMessage(text) {
        return { type: 'text', text };
    },
    buttonsMessage(text, buttons) {
        return { type: 'buttons', text, buttons };
    },
    listMessage(title, sections) {
        return { type: 'list', title, sections };
    },
    mediaMessage(url, caption = '') {
        return { type: 'image', url, caption };
    }
};
// --------------------------- FLOW ENGINE ---------------------------
class FlowEngine {
    constructor() {
        this.sessions = new Map();
    }
    getSession(chatId) {
        if (!this.sessions.has(chatId)) {
            this.sessions.set(chatId, {
                id: chatId,
                state: 'welcome',
                context: {},
                history: []
            });
        }
        return this.sessions.get(chatId);
    }
    pushHistory(chatId, from, text) {
        const session = this.getSession(chatId);
        session.history.push({ from, text, ts: Date.now() });
        // Mantener solo últimos 20 mensajes
        if (session.history.length > 20) {
            session.history = session.history.slice(-20);
        }
    }
    async handleIncoming(params) {
        const { chatId, userName, text } = params;
        const session = this.getSession(chatId);
        if (userName)
            session.context.userName = userName;
        this.pushHistory(chatId, 'user', text);
        const responses = [];
        // 1. DETECTAR INTENCIÓN DE PAGO PRIMERO
        const paymentIntent = PaymentIntentDetector.detectIntent(text);
        if (paymentIntent === 'payment_methods') {
            const msg = exports.Templates.messages.payment_methods;
            responses.push(exports.BaileysHelpers.buttonsMessage(msg, [
                { id: 'pay_mercadopago', text: '💳 MercadoPago' },
                { id: 'pay_paypal', text: '🌍 PayPal' },
                { id: 'pay_nequi', text: '📱 Nequi' }
            ]));
            return responses;
        }
        if (paymentIntent === 'payment_request') {
            return await this.handlePaymentRequest(chatId, text, session, responses);
        }
        // 2. DETECCIÓN DE INTENCIONES GENERALES
        const norm = exports.Utils.norm(text);
        let intent = 'unknown';
        if (session.state === 'welcome') {
            if (/hola|buenas|buenos|hey/.test(norm))
                intent = 'greet';
            else if (/curso|megapack|pack|curso completo/.test(norm))
                intent = 'digital';
            else if (/comprar|precio|tiene|disponible|stock/.test(norm))
                intent = 'product_inquiry';
            else if (/repar|servicio|soporte|arreglar/.test(norm))
                intent = 'service';
            else
                intent = 'greet';
        }
        else {
            if (/comprar|aceptar|pagar|si,? quiero/.test(norm))
                intent = 'buy_confirm';
            else if (/foto|fotos|imagenes|video/.test(norm))
                intent = 'media_request';
            else if (/precio|cuanto|costo/.test(norm))
                intent = 'price';
            else if (/ayuda|soporte|problema/.test(norm))
                intent = 'support';
            else
                intent = 'unknown';
        }
        // 3. MANEJAR INTENCIONES
        return await this.handleIntent(intent, chatId, text, session, responses);
    }
    async handlePaymentRequest(chatId, text, session, responses) {
        const product = session.context.product;
        if (!product) {
            responses.push(exports.BaileysHelpers.textMessage('¿Qué producto deseas comprar? Por favor, selecciona un producto primero escribiendo su nombre o "Ver productos".'));
            return responses;
        }
        // Detectar método de pago preferido
        let method = PaymentIntentDetector.detectPaymentMethod(text) || session.context.paymentMethod || 'mercadopago';
        session.context.paymentMethod = method;
        // Generar link de pago
        const paymentLink = await PaymentLinkGenerator.generateLink({
            productId: product.id,
            productName: product.name,
            amount: product.price,
            method
        });
        // Crear orden
        const orderId = 'ORD-' + exports.Utils.shortId().toUpperCase();
        session.context.order = {
            id: orderId,
            product,
            total: product.price,
            paymentLink,
            method
        };
        session.state = 'awaiting_payment';
        const msg = exports.Utils.fill(exports.Templates.messages.payment_link, {
            customer_name: session.context.userName || 'amigo',
            payment_method: method.toUpperCase(),
            product_name: product.name,
            total: exports.Utils.formatPrice(product.price),
            payment_link: paymentLink
        });
        responses.push(exports.BaileysHelpers.textMessage(msg));
        responses.push(exports.BaileysHelpers.buttonsMessage('¿Qué deseas hacer?', [
            { id: 'payment_done', text: '✅ Ya pagué' },
            { id: 'change_method', text: '🔄 Cambiar método' },
            { id: 'view_products', text: '🛒 Ver otros productos' }
        ]));
        this.pushHistory(chatId, 'bot', msg);
        return responses;
    }
    async handleIntent(intent, chatId, text, session, responses) {
        if (intent === 'greet') {
            session.state = 'awaiting_choice';
            const txt = exports.Utils.fill(exports.Templates.messages.welcome, exports.Templates.meta);
            responses.push(exports.BaileysHelpers.textMessage(txt));
            this.pushHistory(chatId, 'bot', txt);
            return responses;
        }
        if (intent === 'digital') {
            return await this.handleDigitalProducts(chatId, session, responses);
        }
        if (intent === 'product_inquiry') {
            return await this.handleProductInquiry(chatId, text, session, responses);
        }
        if (intent === 'buy_confirm') {
            return await this.handleBuyConfirm(chatId, session, responses);
        }
        if (intent === 'media_request') {
            return await this.handleMediaRequest(chatId, session, responses);
        }
        // Fallback
        const txt = exports.Templates.messages.fallback;
        responses.push(exports.BaileysHelpers.textMessage(txt));
        return responses;
    }
    async handleDigitalProducts(chatId, session, responses) {
        session.state = 'browsing_digital';
        try {
            const products = await db_1.db.product.findMany({
                where: {
                    category: 'DIGITAL'
                },
                take: 5
            });
            if (products.length > 0) {
                const prod = products[0];
                session.context.product = prod;
                const txt = exports.Utils.fill(exports.Templates.messages.bundle_info, {
                    pack_name: prod.name,
                    count: prod.stock || 0,
                    access: 'vitalicio',
                    price_pack: exports.Utils.formatPrice(prod.price),
                    price_unit: 'Desde $9.99'
                });
                responses.push(exports.BaileysHelpers.buttonsMessage(txt, [
                    { id: 'demo', text: 'Ver demo' },
                    { id: 'buy_pack', text: 'Comprar pack' }
                ]));
                this.pushHistory(chatId, 'bot', txt);
            }
        }
        catch (error) {
            console.error('Error cargando productos digitales:', error);
            responses.push(exports.BaileysHelpers.textMessage('Disculpa, hubo un error cargando los productos. Intenta de nuevo.'));
        }
        return responses;
    }
    async handleProductInquiry(chatId, text, session, responses) {
        session.state = 'browsing_physical';
        try {
            const products = await db_1.db.product.findMany({
                where: {
                    OR: [
                        { name: { contains: text, mode: 'insensitive' } },
                        { description: { contains: text, mode: 'insensitive' } }
                    ]
                },
                take: 1
            });
            const found = products[0];
            if (!found) {
                responses.push(exports.BaileysHelpers.textMessage(exports.Templates.messages.fallback));
                return responses;
            }
            session.context.product = found;
            const txt = exports.Utils.fill(exports.Templates.messages.product_info, {
                product_name: found.name,
                description: found.description || '',
                price: exports.Utils.formatPrice(found.price),
                stock: found.stock || 0,
                use: found.category || ''
            });
            responses.push(exports.BaileysHelpers.buttonsMessage(txt, [
                { id: `pics_${found.id}`, text: 'Fotos' },
                { id: `buy_${found.id}`, text: 'Comprar' },
                { id: `compare_${found.id}`, text: 'Comparar' }
            ]));
            this.pushHistory(chatId, 'bot', txt);
        }
        catch (error) {
            console.error('Error buscando productos:', error);
            responses.push(exports.BaileysHelpers.textMessage('Disculpa, hubo un error buscando productos. Intenta de nuevo.'));
        }
        return responses;
    }
    async handleBuyConfirm(chatId, session, responses) {
        const prod = session.context.product;
        if (!prod) {
            responses.push(exports.BaileysHelpers.textMessage('¿Qué producto deseas comprar? Escríbelo o selecciona del catálogo.'));
            return responses;
        }
        // Preguntar método de pago
        responses.push(exports.BaileysHelpers.textMessage(exports.Templates.messages.payment_methods));
        responses.push(exports.BaileysHelpers.buttonsMessage('Selecciona tu método de pago:', [
            { id: 'pay_mercadopago', text: '💳 MercadoPago' },
            { id: 'pay_paypal', text: '🌍 PayPal' },
            { id: 'pay_nequi', text: '📱 Nequi' }
        ]));
        session.state = 'selecting_payment';
        return responses;
    }
    async handleMediaRequest(chatId, session, responses) {
        const prod = session.context.product;
        if (prod && prod.images && prod.images.length > 0) {
            responses.push(exports.BaileysHelpers.mediaMessage(prod.images[0], `Imagen de ${prod.name}`));
            responses.push(exports.BaileysHelpers.buttonsMessage('¿Deseas más fotos o ver precio?', [
                { id: 'more_pics', text: 'Más fotos' },
                { id: 'buy', text: 'Comprar ahora' }
            ]));
        }
        else {
            responses.push(exports.BaileysHelpers.textMessage('No tenemos fotos reales disponibles para este producto, ¿deseas ver especificaciones o comparar?'));
        }
        return responses;
    }
}
exports.FlowEngine = FlowEngine;
// --------------------------- EXPORTS ---------------------------
function createFlowEngine() {
    return new FlowEngine();
}
