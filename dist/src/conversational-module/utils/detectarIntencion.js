"use strict";
/**
 * Detector de intención del usuario
 * Clasifica el mensaje en categorías para dirigir al flujo correcto
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectarIntencion = detectarIntencion;
exports.extraerEntidades = extraerEntidades;
/**
 * Detecta la intención del mensaje del usuario
 */
function detectarIntencion(mensaje) {
    const textoLower = mensaje.toLowerCase().trim();
    // Saludo
    if (/^(hola|buenos días|buenas tardes|buenas noches|hey|hi|saludos)/i.test(textoLower)) {
        return { intencion: 'saludo', confianza: 0.95 };
    }
    // Despedida
    if (/^(adiós|chao|hasta luego|gracias|bye|nos vemos)/i.test(textoLower)) {
        return { intencion: 'despedida', confianza: 0.95 };
    }
    // Solicitud de pago
    if (/(cómo pago|métodos de pago|pagar|comprar|adquirir|link de pago|paypal|mercadopago|nequi|daviplata)/i.test(textoLower)) {
        return { intencion: 'solicitud_pago', confianza: 0.9 };
    }
    // Consulta de precio
    if (/(cuánto cuesta|precio|valor|cuánto vale|cuánto es|cuánto sale)/i.test(textoLower)) {
        return { intencion: 'consulta_precio', confianza: 0.85 };
    }
    // Consulta de disponibilidad
    if (/(tienen|hay|disponible|stock|existencia|queda)/i.test(textoLower)) {
        return { intencion: 'consulta_disponibilidad', confianza: 0.85 };
    }
    // Solicitud de envío
    if (/(envío|enviar|domicilio|entrega|dirección|despacho|contrareembolso)/i.test(textoLower)) {
        return { intencion: 'solicitud_envio', confianza: 0.85 };
    }
    // Servicio técnico
    if (/(reparar|arreglar|no funciona|dañado|problema|falla|técnico|soporte)/i.test(textoLower)) {
        return { intencion: 'servicio_tecnico', confianza: 0.85 };
    }
    // Queja o reclamo
    if (/(queja|reclamo|mal servicio|insatisfecho|devolver|reembolso)/i.test(textoLower)) {
        return { intencion: 'queja_reclamo', confianza: 0.85 };
    }
    // Búsqueda de producto (por defecto si menciona palabras clave)
    if (/(computador|portátil|laptop|moto|curso|megapack|audífonos|mouse|teclado)/i.test(textoLower)) {
        return { intencion: 'busqueda_producto', confianza: 0.75 };
    }
    // General (no se detectó intención específica)
    return { intencion: 'general', confianza: 0.5 };
}
/**
 * Extrae entidades del mensaje (productos, precios, ubicaciones)
 */
function extraerEntidades(mensaje) {
    const entidades = {};
    // Extraer mención de producto
    const productoMatch = mensaje.match(/(computador|portátil|laptop|moto|curso|megapack|audífonos|mouse|teclado|ns160|akt|yamaha)/i);
    if (productoMatch) {
        entidades.producto = productoMatch[0];
    }
    // Extraer precio mencionado
    const precioMatch = mensaje.match(/\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/);
    if (precioMatch) {
        entidades.precio = parseFloat(precioMatch[1].replace(/[.,]/g, ''));
    }
    // Extraer ubicación
    const ubicacionMatch = mensaje.match(/(bogotá|medellín|cali|barranquilla|cartagena|bucaramanga|pereira|manizales|ibagué|santa marta)/i);
    if (ubicacionMatch) {
        entidades.ubicacion = ubicacionMatch[0];
    }
    return entidades;
}
