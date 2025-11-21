"use strict";
/**
 * 💳 CONFIGURACIÓN DE MÉTODOS DE PAGO
 * Configuración centralizada de todos los métodos de pago disponibles
 * IMPORTANTE: Las credenciales sensibles deben ir en variables de entorno
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentHelper = exports.PaymentConfig = void 0;
exports.PaymentConfig = {
    // 🎹 CURSO DE PIANO
    piano: {
        price: 60000,
        currency: 'COP',
        info_link: 'https://landein-page-pian2.vercel.app/',
        payment_link: 'https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205',
        platform: 'Hotmart',
    },
    // 🎓 MEGAPACKS
    megapacks: {
        individual: {
            price: 20000,
            currency: 'COP',
            methods: {
                mobile_payment: {
                    number: '3136174267',
                    platforms: ['Nequi', 'Daviplata', 'Davivienda'],
                    description: 'Transferencia móvil',
                },
                credit_card: {
                    link: 'https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf',
                    platform: 'Payco',
                    description: 'Pago con tarjeta de crédito',
                },
            },
        },
        complete: {
            price: 60000,
            currency: 'COP',
            total_products: 40,
            savings: 740000,
            info_link: 'https://mpago.li/32cJgK3',
            payment_link: 'https://www.paypal.com/invoice/p/#INV2-U2K8-6UU6-HMTD-NETG',
            platform: 'PayPal',
        },
    },
    // 🔧 CREDENCIALES API (para integración futura)
    api_credentials: {
        mercado_pago: {
            public_key: process.env.MERCADO_PAGO_PUBLIC_KEY || 'APP_USR-23c2d74a-d01f-473e-a305-0e5999f023bc',
            access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-8419296773492182-072623-ec7505166228860ec8b43957c948e7da-2021591453',
        },
        paypal: {
            client_id: process.env.PAYPAL_CLIENT_ID || 'BAAtdQwVN8LvIoRstmHZWlo2ndcJBP8dFZdXLc8HJGdYUXstriO6mO0GJMZimkBCdZHotBkulELqeFm_R4',
            client_secret: process.env.PAYPAL_CLIENT_SECRET || 'EBTNhFlUHIrSklnmaOL4oHfdXyJCZwbsfIOc5y-G0OoeIuFTFe31E2bODAVLMIVOVi1rvD_PXBJYV0UU',
        },
    },
    // 🏍️ PRODUCTOS FÍSICOS
    physical_products: {
        moto: {
            price: 6500000,
            negotiable_price: 6300000,
            currency: 'COP',
            contact: '+57 304 274 8687',
            location: 'Centro Comercial El Diamante 2, San Nicolás',
        },
        laptops: {
            contact: '+57 304 274 8687',
        },
    },
    // 📞 INFORMACIÓN DE CONTACTO GENERAL
    contact: {
        whatsapp: '+57 304 274 8687',
        email: 'deinermen25@gmail.com',
        company: 'Tecnovariedades D&S',
        location: 'Cali, Valle del Cauca, Colombia',
    },
    // 🔒 CONFIGURACIÓN DE SEGURIDAD
    security: {
        payment_link_expiry: 60, // minutos
        accepted_currencies: ['COP', 'USD'],
        enabled_methods: ['paypal', 'mercado_pago', 'mobile_payment', 'credit_card'],
    },
};
// 💳 FUNCIONES AUXILIARES
class PaymentHelper {
    /**
     * Obtener información de pago para un producto
     */
    static getPaymentInfo(product, type = 'info') {
        const config = exports.PaymentConfig[product];
        if (!config)
            return null;
        if (type === 'payment' && config.payment_link) {
            return {
                link: config.payment_link,
                platform: config.platform,
                price: config.price,
                currency: config.currency,
            };
        }
        if (type === 'info' && config.info_link) {
            return {
                link: config.info_link,
                price: config.price,
                currency: config.currency,
            };
        }
        return config;
    }
    /**
     * Formatear precio en COP
     */
    static formatPrice(price, currency = 'COP') {
        return `$${price.toLocaleString()} ${currency}`;
    }
    /**
     * Obtener métodos de pago disponibles para megapacks individuales
     */
    static getMegapackIndividualMethods() {
        return exports.PaymentConfig.megapacks.individual.methods;
    }
    /**
     * Verificar si un método de pago está habilitado
     */
    static isPaymentMethodEnabled(method) {
        return exports.PaymentConfig.security.enabled_methods.includes(method);
    }
    /**
     * Generar link de pago de Mercado Pago
     */
    static async generateMercadoPagoLink(title, price, quantity = 1) {
        try {
            // Aquí se integraría con la API de Mercado Pago
            // Por ahora retornamos un link de ejemplo
            console.log('[Payment] Generando link de Mercado Pago:', { title, price, quantity });
            // TODO: Implementar integración real con Mercado Pago SDK
            return `https://mpago.la/example-${Date.now()}`;
        }
        catch (error) {
            console.error('[Payment] Error generando link de Mercado Pago:', error);
            return null;
        }
    }
    /**
     * Generar link de pago de PayPal
     */
    static async generatePayPalLink(title, price, quantity = 1) {
        try {
            // Aquí se integraría con la API de PayPal
            console.log('[Payment] Generando link de PayPal:', { title, price, quantity });
            // TODO: Implementar integración real con PayPal SDK
            return `https://paypal.com/invoice/example-${Date.now()}`;
        }
        catch (error) {
            console.error('[Payment] Error generando link de PayPal:', error);
            return null;
        }
    }
}
exports.PaymentHelper = PaymentHelper;
exports.default = exports.PaymentConfig;
