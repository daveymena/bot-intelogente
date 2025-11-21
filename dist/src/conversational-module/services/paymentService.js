"use strict";
/**
 * Servicio de generación de links de pago dinámicos
 * Integrado en el nuevo sistema conversacional
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarLinksPago = generarLinksPago;
exports.formatearLinksPago = formatearLinksPago;
exports.generarLinkMercadoPago = generarLinkMercadoPago;
const db_1 = require("@/lib/db");
/**
 * Genera links de pago para un producto
 */
async function generarLinksPago(producto) {
    try {
        // Buscar producto en BD para obtener links configurados
        const productoDB = await db_1.db.product.findFirst({
            where: { id: producto.id.toString() },
        });
        if (!productoDB) {
            return {
                methods: ['Efectivo', 'Transferencia'],
            };
        }
        const links = {
            methods: [],
        };
        // MercadoPago
        if (productoDB.paymentLinkMercadoPago) {
            links.mercadopago = productoDB.paymentLinkMercadoPago;
            links.methods.push('MercadoPago');
        }
        // PayPal
        if (productoDB.paymentLinkPayPal) {
            links.paypal = productoDB.paymentLinkPayPal;
            links.methods.push('PayPal');
        }
        // Custom (Hotmart, etc.)
        if (productoDB.paymentLinkCustom) {
            links.custom = productoDB.paymentLinkCustom;
            links.methods.push('Link directo');
        }
        // Métodos por defecto si no hay links
        if (links.methods.length === 0) {
            links.methods = ['Nequi', 'Daviplata', 'Transferencia', 'Efectivo'];
        }
        return links;
    }
    catch (error) {
        console.error('[PaymentService] Error:', error);
        return {
            methods: ['Efectivo', 'Transferencia'],
        };
    }
}
/**
 * Formatea los links de pago para WhatsApp
 */
function formatearLinksPago(producto, links) {
    let mensaje = `💳 *MÉTODOS DE PAGO*\n\n`;
    mensaje += `Producto: *${producto.nombre}*\n`;
    mensaje += `Precio: *$${producto.precio.toLocaleString('es-CO')} COP*\n\n`;
    if (links.mercadopago) {
        mensaje += `🟢 *MercadoPago*\n${links.mercadopago}\n\n`;
    }
    if (links.paypal) {
        mensaje += `🔵 *PayPal*\n${links.paypal}\n\n`;
    }
    if (links.custom) {
        mensaje += `🔗 *Link de pago*\n${links.custom}\n\n`;
    }
    if (links.methods.length > 0 && !links.mercadopago && !links.paypal && !links.custom) {
        mensaje += `📱 *Métodos disponibles:*\n`;
        links.methods.forEach(method => {
            mensaje += `• ${method}\n`;
        });
        mensaje += `\nEscríbeme para coordinar el pago 😊`;
    }
    return mensaje;
}
/**
 * Genera link de pago dinámico con MercadoPago
 */
async function generarLinkMercadoPago(producto, userId) {
    try {
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            console.log('[PaymentService] MercadoPago no configurado');
            return null;
        }
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                items: [
                    {
                        title: producto.nombre,
                        description: producto.descripcion || '',
                        quantity: 1,
                        currency_id: 'COP',
                        unit_price: producto.precio,
                    },
                ],
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_URL}/payment/success`,
                    failure: `${process.env.NEXT_PUBLIC_URL}/payment/failure`,
                    pending: `${process.env.NEXT_PUBLIC_URL}/payment/pending`,
                },
                auto_return: 'approved',
                external_reference: `${userId}-${producto.id}`,
            }),
        });
        if (!response.ok) {
            console.error('[PaymentService] Error MercadoPago:', await response.text());
            return null;
        }
        const data = await response.json();
        return data.init_point; // Link de pago
    }
    catch (error) {
        console.error('[PaymentService] Error generando link MercadoPago:', error);
        return null;
    }
}
