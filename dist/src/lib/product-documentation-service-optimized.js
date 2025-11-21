"use strict";
/**
 * 📚 SERVICIO DE DOCUMENTACIÓN DE PRODUCTOS OPTIMIZADO
 * Versión ultra-compacta para reducir tokens enviados a la IA
 * Reduce el tamaño del contexto de 22,000+ tokens a menos de 2,000
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductDocumentationService = void 0;
const db_1 = require("./db");
class ProductDocumentationService {
    /**
     * Generar documentación COMPACTA de productos (optimizada para tokens)
     * Solo información esencial para reducir el tamaño del contexto
     */
    static async generateFullProductDocumentation(userId) {
        try {
            const products = await db_1.db.product.findMany({
                where: { userId, status: 'AVAILABLE' },
                orderBy: { name: 'asc' }
            });
            if (products.length === 0) {
                return `📦 No hay productos disponibles.`;
            }
            // Versión ULTRA COMPACTA para reducir tokens
            let documentation = `📦 PRODUCTOS (${products.length}):\n\n`;
            products.forEach((product, index) => {
                const emoji = this.getProductEmoji(product);
                documentation += `${index + 1}. ${emoji} ${product.name}\n`;
                documentation += `   💰 $${product.price.toLocaleString('es-CO')}\n`;
                // Solo descripción corta (primeras 80 caracteres)
                if (product.description) {
                    const shortDesc = product.description.substring(0, 80).trim();
                    documentation += `   📝 ${shortDesc}${product.description.length > 80 ? '...' : ''}\n`;
                }
                // Stock si existe
                if (product.stock && product.stock > 0) {
                    documentation += `   📦 Stock: ${product.stock}\n`;
                }
                // Métodos de pago (compacto)
                try {
                    const tags = product.tags ? JSON.parse(product.tags) : [];
                    const payments = [];
                    tags.forEach((tag) => {
                        if (typeof tag === 'string') {
                            if (tag.startsWith('hotmart:'))
                                payments.push('Hotmart');
                            else if (tag.startsWith('mercadopago:'))
                                payments.push('MercadoPago');
                            else if (tag.startsWith('paypal:'))
                                payments.push('PayPal');
                            else if (tag.startsWith('nequi:'))
                                payments.push('Nequi');
                            else if (tag.startsWith('payco:'))
                                payments.push('ePayco');
                        }
                    });
                    if (payments.length > 0) {
                        documentation += `   💳 ${payments.join(', ')}\n`;
                    }
                    else if (product.category === 'PHYSICAL') {
                        documentation += `   💳 Efectivo/Transferencia/Nequi\n`;
                    }
                }
                catch (e) {
                    // Ignorar errores de parsing
                }
                documentation += `\n`;
            });
            return documentation;
        }
        catch (error) {
            console.error('[Product Docs] Error generando documentación:', error);
            return `📦 Error al cargar productos.`;
        }
    }
    /**
     * Generar resumen ejecutivo ULTRA COMPACTO
     */
    static async generateExecutiveSummary(userId) {
        try {
            const products = await db_1.db.product.findMany({
                where: { userId, status: 'AVAILABLE' }
            });
            if (products.length === 0) {
                return `📊 No hay productos.`;
            }
            const categories = new Map();
            let totalValue = 0;
            products.forEach(p => {
                categories.set(p.category, (categories.get(p.category) || 0) + 1);
                totalValue += p.price;
            });
            let summary = `📊 ${products.length} productos, $${totalValue.toLocaleString('es-CO')} total\n`;
            categories.forEach((count, category) => {
                summary += `${category}: ${count} | `;
            });
            return summary.trim();
        }
        catch (error) {
            console.error('[Product Docs] Error generando resumen:', error);
            return `📊 Error.`;
        }
    }
    /**
     * Generar lista rápida de productos (solo nombres y precios)
     */
    static async generateQuickList(userId) {
        try {
            const products = await db_1.db.product.findMany({
                where: { userId, status: 'AVAILABLE' },
                orderBy: { price: 'asc' }
            });
            if (products.length === 0) {
                return `No hay productos disponibles.`;
            }
            let list = `📦 PRODUCTOS:\n\n`;
            products.forEach((product, index) => {
                const emoji = this.getProductEmoji(product);
                list += `${index + 1}. ${emoji} ${product.name} - $${product.price.toLocaleString('es-CO')}\n`;
            });
            list += `\n¿Cuál te interesa?`;
            return list;
        }
        catch (error) {
            console.error('[Product Docs] Error generando lista rápida:', error);
            return `Error al cargar productos.`;
        }
    }
    /**
     * Obtener emoji según el tipo de producto
     */
    static getProductEmoji(product) {
        const name = product.name.toLowerCase();
        const desc = (product.description || '').toLowerCase();
        if (name.includes('piano') || desc.includes('piano'))
            return '🎹';
        if (name.includes('laptop') || name.includes('portatil') || name.includes('macbook'))
            return '💻';
        if (name.includes('moto') || name.includes('pulsar') || name.includes('bajaj'))
            return '🏍️';
        if (name.includes('curso') || name.includes('mega pack') || name.includes('megapack'))
            return '📚';
        if (name.includes('phone') || name.includes('celular'))
            return '📱';
        if (name.includes('tablet'))
            return '📱';
        if (name.includes('watch') || name.includes('reloj'))
            return '⌚';
        if (product.category === 'DIGITAL')
            return '💾';
        if (product.category === 'PHYSICAL')
            return '📦';
        return '🎯';
    }
    /**
     * Buscar productos por categoría
     */
    static async getProductsByCategory(userId, category) {
        try {
            return await db_1.db.product.findMany({
                where: {
                    userId,
                    status: 'AVAILABLE',
                    category: category
                },
                orderBy: { price: 'asc' }
            });
        }
        catch (error) {
            console.error('[Product Docs] Error buscando por categoría:', error);
            return [];
        }
    }
    /**
     * Obtener estadísticas del catálogo
     */
    static async getCatalogStats(userId) {
        try {
            const products = await db_1.db.product.findMany({
                where: { userId, status: 'AVAILABLE' }
            });
            const byCategory = new Map();
            let totalValue = 0;
            products.forEach(p => {
                byCategory.set(p.category, (byCategory.get(p.category) || 0) + 1);
                totalValue += p.price;
            });
            return {
                total: products.length,
                byCategory,
                avgPrice: products.length > 0 ? totalValue / products.length : 0,
                totalValue
            };
        }
        catch (error) {
            console.error('[Product Docs] Error obteniendo estadísticas:', error);
            return {
                total: 0,
                byCategory: new Map(),
                avgPrice: 0,
                totalValue: 0
            };
        }
    }
}
exports.ProductDocumentationService = ProductDocumentationService;
