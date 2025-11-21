"use strict";
/**
 * Servicio de envío de fotos de productos
 * Integrado en el nuevo sistema conversacional
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerFotosProducto = obtenerFotosProducto;
exports.tienefotos = tienefotos;
exports.obtenerFotoPrincipal = obtenerFotoPrincipal;
exports.formatearMensajeConFoto = formatearMensajeConFoto;
exports.detectarSolicitudFotos = detectarSolicitudFotos;
/**
 * Obtiene las fotos de un producto
 */
function obtenerFotosProducto(producto) {
    if (!producto.imagenes || producto.imagenes.length === 0) {
        return [];
    }
    return producto.imagenes.map((url, index) => ({
        url,
        caption: index === 0 ? generarCaptionPrincipal(producto) : undefined,
    }));
}
/**
 * Genera el caption para la foto principal
 */
function generarCaptionPrincipal(producto) {
    let caption = `📦 *${producto.nombre}*\n\n`;
    if (producto.descripcion) {
        const descripcionCorta = producto.descripcion.substring(0, 150);
        caption += `${descripcionCorta}${producto.descripcion.length > 150 ? '...' : ''}\n\n`;
    }
    caption += `💰 *$${producto.precio.toLocaleString('es-CO')} COP*\n`;
    if (producto.stock !== undefined) {
        if (producto.stock > 0) {
            caption += `✅ Disponible (${producto.stock} unidades)\n`;
        }
        else {
            caption += `⚠️ Consultar disponibilidad\n`;
        }
    }
    caption += `\n¿Te interesa? 😊`;
    return caption;
}
/**
 * Verifica si un producto tiene fotos
 */
function tienefotos(producto) {
    return producto.imagenes !== undefined && producto.imagenes.length > 0;
}
/**
 * Obtiene la primera foto de un producto
 */
function obtenerFotoPrincipal(producto) {
    const fotos = obtenerFotosProducto(producto);
    return fotos.length > 0 ? fotos[0] : null;
}
/**
 * Formatea mensaje para enviar con foto
 */
function formatearMensajeConFoto(producto) {
    return `Te envío la foto de *${producto.nombre}* 📸`;
}
/**
 * Detecta si el usuario solicita fotos
 */
function detectarSolicitudFotos(mensaje) {
    const textoLower = mensaje.toLowerCase();
    const patrones = [
        /foto/i,
        /imagen/i,
        /picture/i,
        /pic/i,
        /ver/i,
        /muestra/i,
        /enseña/i,
        /cómo (es|se ve)/i,
    ];
    return patrones.some(patron => patron.test(textoLower));
}
