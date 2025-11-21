"use strict";
/**
 * 💳 GENERADOR DE LINKS DE PAGO PARA EL BOT
 *
 * Genera links de pago dinámicos cuando el cliente los solicita
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotPaymentLinkGenerator = void 0;
const db_1 = require("./db");
class BotPaymentLinkGenerator {
    /**
     * Generar links de pago para un producto
     */
    static async generatePaymentLinks(productId, userId, quantity = 1) {
        try {
            // Obtener producto de la base de datos
            const product = await db_1.db.product.findFirst({
                where: {
                    id: productId,
                    userId: userId,
                    status: 'AVAILABLE'
                }
            });
            if (!product) {
                return {
                    success: false,
                    message: 'Producto no encontrado'
                };
            }
            const total = product.price * quantity;
            const formattedPrice = total.toLocaleString('es-CO');
            // Generar links dinámicos
            const mercadoPagoLink = await this.createMercadoPagoLink(product, quantity, userId);
            const payPalLink = await this.createPayPalLink(product, quantity, userId);
            const whatsAppLink = this.createWhatsAppLink(product, quantity);
            // Obtener información de Nequi/Daviplata desde configuración
            const paymentInfo = await this.getPaymentInfo(userId);
            // Construir mensaje para el cliente
            const message = this.buildPaymentMessage(product.name, formattedPrice, mercadoPagoLink, payPalLink, whatsAppLink, paymentInfo);
            return {
                success: true,
                mercadoPagoLink,
                payPalLink,
                whatsAppLink,
                nequiInfo: paymentInfo.nequi,
                daviplataInfo: paymentInfo.daviplata,
                message
            };
        }
        catch (error) {
            console.error('[BotPaymentLinkGenerator] Error:', error);
            return {
                success: false,
                message: 'Error generando links de pago'
            };
        }
    }
    /**
     * Crear link de MercadoPago
     */
    static async createMercadoPagoLink(product, quantity, userId) {
        try {
            // Soportar ambos nombres de variable
            const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN;
            if (!MERCADOPAGO_ACCESS_TOKEN) {
                console.log('[BotPaymentLinkGenerator] MercadoPago no configurado');
                return undefined;
            }
            const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';
            const total = product.price * quantity;
            // Configurar preference de MercadoPago
            const preference = {
                items: [
                    {
                        title: product.name,
                        description: product.description || product.name,
                        quantity: quantity,
                        unit_price: total,
                        currency_id: 'COP',
                    },
                ],
                external_reference: JSON.stringify({
                    userId,
                    productId: product.id,
                    quantity,
                    type: 'product_purchase',
                }),
                statement_descriptor: 'Tecnovariedades',
                payment_methods: {
                    excluded_payment_types: [],
                    installments: 12
                }
            };
            // Solo agregar back_urls y auto_return si NO es localhost
            if (!baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
                preference.back_urls = {
                    success: `${baseUrl}/payment/success?product=${encodeURIComponent(product.name)}`,
                    failure: `${baseUrl}/payment/failure?product=${encodeURIComponent(product.name)}`,
                    pending: `${baseUrl}/payment/pending?product=${encodeURIComponent(product.name)}`,
                };
                preference.auto_return = 'approved';
                preference.notification_url = `${baseUrl}/api/webhooks/mercadopago`;
            }
            const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
                },
                body: JSON.stringify(preference),
            });
            if (!response.ok) {
                console.error('[BotPaymentLinkGenerator] Error MercadoPago:', await response.text());
                return undefined;
            }
            const data = await response.json();
            console.log('[BotPaymentLinkGenerator] ✅ Link MercadoPago generado');
            return data.init_point;
        }
        catch (error) {
            console.error('[BotPaymentLinkGenerator] Error creando link MercadoPago:', error);
            return undefined;
        }
    }
    /**
     * Crear link de PayPal
     */
    static async createPayPalLink(product, quantity, userId) {
        try {
            const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
            const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
            if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
                console.log('[BotPaymentLinkGenerator] PayPal no configurado');
                return undefined;
            }
            // Obtener token de acceso
            const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
            const tokenResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${auth}`,
                },
                body: 'grant_type=client_credentials',
            });
            const { access_token } = await tokenResponse.json();
            // Convertir COP a USD (aproximado)
            const total = product.price * quantity;
            const priceUSD = (total / 4000).toFixed(2);
            const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';
            // Crear orden
            const orderResponse = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${access_token}`,
                },
                body: JSON.stringify({
                    intent: 'CAPTURE',
                    purchase_units: [
                        {
                            description: product.name,
                            amount: {
                                currency_code: 'USD',
                                value: priceUSD,
                            },
                            custom_id: JSON.stringify({
                                userId,
                                productId: product.id,
                                quantity,
                                type: 'product_purchase',
                            }),
                        },
                    ],
                    application_context: {
                        return_url: `${baseUrl}/payment/success`,
                        cancel_url: `${baseUrl}/payment/failure`,
                        brand_name: 'Tecnovariedades D&S',
                        user_action: 'PAY_NOW',
                    },
                }),
            });
            const orderData = await orderResponse.json();
            const approveUrl = orderData.links?.find((link) => link.rel === 'approve')?.href;
            if (approveUrl) {
                console.log('[BotPaymentLinkGenerator] ✅ Link PayPal generado');
            }
            return approveUrl;
        }
        catch (error) {
            console.error('[BotPaymentLinkGenerator] Error creando link PayPal:', error);
            return undefined;
        }
    }
    /**
     * Crear link de WhatsApp para contacto directo
     */
    static createWhatsAppLink(product, quantity) {
        const phone = '573042748687'; // Tecnovariedades D&S
        const total = product.price * quantity;
        const message = `Hola! Me interesa este producto:\n\n` +
            `📦 ${product.name}\n` +
            `💰 Precio: $${total.toLocaleString('es-CO')} COP\n` +
            `📊 Cantidad: ${quantity}\n\n` +
            `¿Está disponible?`;
        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }
    /**
     * Obtener información de pago desde configuración
     */
    static async getPaymentInfo(userId) {
        try {
            const settings = await db_1.db.botSettings.findUnique({
                where: { userId }
            });
            // Extraer info de pago desde botPersonality o configuración
            return {
                nequi: '3136174267', // Actualizado
                daviplata: '3136174267' // Actualizado
            };
        }
        catch (error) {
            return {
                nequi: '3136174267',
                daviplata: '3136174267'
            };
        }
    }
    /**
     * Construir mensaje de pago para el cliente
     */
    static buildPaymentMessage(productName, formattedPrice, mercadoPagoLink, payPalLink, whatsAppLink, paymentInfo) {
        let message = `🟢 ¡Perfecto! Aquí están tus opciones de pago\n\n`;
        message += `📦 *Producto:* ${productName}\n`;
        message += `💰 *Total a Pagar:* ${formattedPrice} COP\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `*MÉTODOS DE PAGO DISPONIBLES:*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        // MercadoPago
        if (mercadoPagoLink) {
            message += `💳 *1. Mercado Pago*\n`;
            message += `   💰 Precio: ${formattedPrice} COP\n`;
            message += `   ✅ Tarjetas, PSE, Efectivo\n`;
            message += `   🔒 Pago 100% seguro\n`;
            message += `   👉 Link: ${mercadoPagoLink}\n\n`;
        }
        // PayPal
        if (payPalLink) {
            // Calcular precio aproximado en USD
            const priceNumber = parseFloat(formattedPrice.replace(/\./g, '').replace(',', '.'));
            const priceUSD = (priceNumber / 4000).toFixed(2);
            message += `💙 *2. PayPal*\n`;
            message += `   💰 Precio: ${formattedPrice} COP\n`;
            message += `   💵 Aprox: ${priceUSD} USD\n`;
            message += `   ✅ Tarjetas internacionales\n`;
            message += `   🔒 Protección al comprador\n`;
            message += `   ℹ️ Te pedirá iniciar sesión en PayPal\n`;
            message += `   👉 Link: ${payPalLink}\n\n`;
        }
        // Nequi
        if (paymentInfo?.nequi) {
            message += `📱 *3. Nequi*\n`;
            message += `   💰 Precio: ${formattedPrice} COP\n`;
            message += `   📞 Número: ${paymentInfo.nequi}\n`;
            message += `   📸 Envía captura del pago\n\n`;
        }
        // Daviplata
        if (paymentInfo?.daviplata) {
            message += `📱 *4. Daviplata*\n`;
            message += `   💰 Precio: ${formattedPrice} COP\n`;
            message += `   📞 Número: ${paymentInfo.daviplata}\n`;
            message += `   📸 Envía captura del pago\n\n`;
        }
        // WhatsApp directo
        if (whatsAppLink) {
            message += `💬 *5. Contacto Directo*\n`;
            message += `   📞 Habla con un asesor\n`;
            message += `   👉 ${whatsAppLink}\n\n`;
        }
        message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `✅ *Todos los métodos son seguros*\n`;
        message += `📦 *Entrega inmediata* después del pago\n`;
        message += `🔒 *Compra protegida*\n\n`;
        message += `¿Con cuál método prefieres pagar? 😊`;
        return message;
    }
    /**
     * Detectar si el cliente solicita links de pago (MEJORADO - MÁS AGRESIVO)
     */
    static detectPaymentRequest(message) {
        const normalized = message.toLowerCase().trim();
        const paymentPatterns = [
            // Links de pago (con typos comunes)
            /\b(link|lik|enlace|url)\s+(de\s+)?(pago|compra)/i,
            /\b(envía|envia|enviame|envíame|manda|mandame|mándame|pasa|pasame|pásame|dame|deme|puedes\s+enviar)\s+(el\s+|la\s+)?(link|lik|enlace)/i,
            // Cómo pagar (MÁS AGRESIVO)
            /\b(cómo|como)\s+(pago|compro|puedo\s+pagar|se\s+paga)/i,
            /\b(cómo|como)\s+(es\s+el\s+)?(pago|proceso\s+de\s+pago)/i,
            /\b(quiero|deseo|me\s+interesa)\s+(pagar|comprar|adquirir)/i,
            /\b(listo\s+para\s+pagar|voy\s+a\s+pagar)/i,
            // Métodos de pago (MÁS ESPECÍFICO)
            /\b(métodos?|metodos?|formas?|opciones?|medios?)\s+(de\s+)?(pago|compra)/i,
            /\b(qué\s+métodos?|que\s+métodos?|que\s+metodos?|cuáles\s+métodos?|cuales\s+métodos?)/i,
            /^(metodo|método)\s+(de\s+)?pago\??$/i,
            /\b(mercado\s*pago|mercadopago|paypal|nequi|daviplata|pse)/i,
            /\b(tarjeta|efectivo|transferencia|consignación|consignacion)/i,
            // Proceder con pago
            /\b(proceder|continuar|seguir)\s+(con\s+)?(el\s+|la\s+)?(pago|compra)/i,
            /\b(realizar|hacer|efectuar)\s+(el\s+|la\s+)?(pago|compra)/i,
            /\b(me\s+lo\s+llevo|lo\s+compro|lo\s+quiero)/i,
            // Preguntas sobre pago
            /\b(acepta|aceptan|recibe|reciben)\s+(nequi|daviplata|tarjeta|paypal|mercadopago|efectivo)/i,
            /\b(puedo\s+pagar|se\s+puede\s+pagar|podría\s+pagar)\s+(con|por|en)/i,
            /\b(información|info|datos|detalles)\s+(de\s+|del\s+|para\s+|sobre\s+)?(pago|compra)/i,
            // Variaciones directas (SOLO si es pregunta o intención clara)
            /^(pagar|comprar|adquirir)$/i,
            /\b(quiero\s+)?(pagar|comprar|adquirir)\b/i,
            /\b(voy\s+a\s+)?(pagar|comprar)\b/i,
            // Preguntas sobre disponibilidad de métodos
            /\b(tienen|tienes|hay)\s+(nequi|daviplata|mercadopago|paypal)/i,
            /\b(aceptan|acepta)\s+(tarjeta|efectivo|transferencia)/i,
            // Solicitudes de información de pago
            /\b(dónde|donde|a\s+dónde|a\s+donde)\s+(pago|consigno|transfiero)/i,
            /\b(número|cuenta|datos)\s+(para|de)\s+(pagar|transferir|consignar)/i,
        ];
        return paymentPatterns.some(pattern => pattern.test(normalized));
    }
}
exports.BotPaymentLinkGenerator = BotPaymentLinkGenerator;
