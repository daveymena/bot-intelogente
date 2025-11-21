"use strict";
/**
 * 🛍️ SERVICIO DE CATÁLOGO DE WHATSAPP
 * Integración con el catálogo de WhatsApp Business
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppCatalogService = void 0;
class WhatsAppCatalogService {
    /**
     * Obtener productos del catálogo de WhatsApp
     */
    static async getCatalogProducts(socket, businessJid) {
        try {
            console.log('[Catalog] 🛍️ Obteniendo productos del catálogo...');
            // Obtener catálogo de WhatsApp Business
            const catalog = await socket.query({
                tag: 'iq',
                attrs: {
                    to: businessJid,
                    type: 'get',
                    xmlns: 'w:biz:catalog'
                },
                content: [
                    {
                        tag: 'product_catalog',
                        attrs: {
                            v: '2'
                        }
                    }
                ]
            });
            console.log('[Catalog] ✅ Catálogo obtenido');
            return catalog;
        }
        catch (error) {
            console.error('[Catalog] ❌ Error obteniendo catálogo:', error.message);
            return null;
        }
    }
    /**
     * Enviar producto del catálogo en un mensaje
     */
    static async sendCatalogProduct(socket, to, productId, businessJid) {
        try {
            console.log(`[Catalog] 📤 Enviando producto del catálogo: ${productId}`);
            await socket.sendMessage(to, {
                productMessage: {
                    product: {
                        productId: productId,
                        businessOwnerJid: businessJid
                    }
                }
            });
            console.log('[Catalog] ✅ Producto del catálogo enviado');
            return true;
        }
        catch (error) {
            console.error('[Catalog] ❌ Error enviando producto:', error.message);
            return false;
        }
    }
    /**
     * Enviar lista de productos del catálogo
     */
    static async sendCatalogList(socket, to, products, businessJid) {
        try {
            console.log(`[Catalog] 📤 Enviando lista de ${products.length} productos`);
            // WhatsApp permite enviar hasta 10 productos en una lista
            const productsToSend = products.slice(0, 10);
            await socket.sendMessage(to, {
                listMessage: {
                    title: '🛍️ Productos Disponibles',
                    description: 'Selecciona un producto para ver más detalles',
                    buttonText: 'Ver Productos',
                    listType: 1,
                    sections: [
                        {
                            title: 'Catálogo',
                            rows: productsToSend.map(product => ({
                                title: product.name,
                                rowId: `product_${product.id}`,
                                description: 'Toca para ver detalles'
                            }))
                        }
                    ]
                }
            });
            console.log('[Catalog] ✅ Lista de productos enviada');
            return true;
        }
        catch (error) {
            console.error('[Catalog] ❌ Error enviando lista:', error.message);
            return false;
        }
    }
    /**
     * Parsear URL del catálogo de WhatsApp
     * Ejemplo: https://wa.me/p/24914630374871955/573042748687
     */
    static parseCatalogUrl(url) {
        try {
            const match = url.match(/wa\.me\/p\/(\d+)\/(\d+)/);
            if (match) {
                return {
                    productId: match[1],
                    businessPhone: match[2]
                };
            }
            return null;
        }
        catch (error) {
            console.error('[Catalog] ❌ Error parseando URL:', error);
            return null;
        }
    }
    /**
     * Convertir número de teléfono a JID de WhatsApp
     */
    static phoneToJid(phone) {
        // Remover caracteres no numéricos
        const cleanPhone = phone.replace(/\D/g, '');
        // Agregar @s.whatsapp.net para JID de negocio
        return `${cleanPhone}@s.whatsapp.net`;
    }
}
exports.WhatsAppCatalogService = WhatsAppCatalogService;
