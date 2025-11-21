"use strict";
/**
 * 💳 SERVICIO DE MERCADOPAGO
 * Integración real con la API de MercadoPago para crear links de pago dinámicos
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMercadoPagoLink = createMercadoPagoLink;
exports.getMercadoPagoPaymentStatus = getMercadoPagoPaymentStatus;
/**
 * Crear preferencia de pago en MercadoPago
 */
async function createMercadoPagoLink(product) {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
        throw new Error('MERCADO_PAGO_ACCESS_TOKEN no configurado');
    }
    console.log('[MercadoPago] Creando preferencia para:', product.name);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';
    const preference = {
        items: [
            {
                title: product.name,
                description: product.description || product.name,
                quantity: 1,
                unit_price: product.price,
                currency_id: product.currency || 'COP'
            }
        ],
        back_urls: {
            success: `${appUrl}/tienda/success`,
            failure: `${appUrl}/tienda/failure`,
            pending: `${appUrl}/tienda/pending`
        },
        external_reference: product.id
    };
    try {
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(preference)
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[MercadoPago] Error response:', errorText);
            throw new Error(`MercadoPago API error: ${response.status}`);
        }
        const data = await response.json();
        console.log('[MercadoPago] ✅ Preferencia creada:', data.id);
        console.log('[MercadoPago] ✅ Link generado:', data.init_point);
        return data.init_point; // Este es el link de pago real
    }
    catch (error) {
        console.error('[MercadoPago] Error creando preferencia:', error);
        throw error;
    }
}
/**
 * Verificar estado de un pago
 */
async function getMercadoPagoPaymentStatus(paymentId) {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
        throw new Error('MERCADO_PAGO_ACCESS_TOKEN no configurado');
    }
    try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error(`MercadoPago API error: ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error('[MercadoPago] Error obteniendo estado:', error);
        throw error;
    }
}
