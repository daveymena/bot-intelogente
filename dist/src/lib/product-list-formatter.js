"use strict";
/**
 * 📋 FORMATEADOR DE LISTAS DE PRODUCTOS
 * Organiza múltiples productos de forma visual y atractiva
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductListFormatter = void 0;
class ProductListFormatter {
    /**
     * Formatear lista de productos de forma visual
     */
    static formatProductList(products, query) {
        if (products.length === 0) {
            return '❌ No encontré productos que coincidan con tu búsqueda.';
        }
        if (products.length === 1) {
            // Un solo producto: formato detallado
            return this.formatSingleProduct(products[0]);
        }
        // Múltiples productos: formato de lista
        return this.formatMultipleProducts(products, query);
    }
    /**
     * Formato para un solo producto (detallado)
     */
    static formatSingleProduct(product) {
        const emoji = this.getCategoryEmoji(product.category);
        const priceFormatted = product.price.toLocaleString('es-CO');
        let response = `${emoji} *${product.name}*\n\n`;
        if (product.description) {
            // Limitar descripción a 150 caracteres
            const desc = product.description.length > 150
                ? product.description.substring(0, 150) + '...'
                : product.description;
            response += `📝 ${desc}\n\n`;
        }
        response += `💰 *Precio:* $${priceFormatted} COP\n`;
        if (product.stock && product.stock > 0) {
            response += `✅ *Disponible:* ${product.stock} unidades\n`;
        }
        else if (product.category === 'DIGITAL') {
            response += `✅ *Disponible:* Acceso inmediato\n`;
        }
        response += `\n¿Te interesa? 😊`;
        return response;
    }
    /**
     * Formato para múltiples productos (lista compacta)
     */
    static formatMultipleProducts(products, query) {
        const category = this.detectCategory(query);
        const categoryEmoji = this.getCategoryEmoji(category);
        let response = `${categoryEmoji} *Encontré ${products.length} opciones para ti:*\n\n`;
        products.forEach((product, index) => {
            const number = this.getNumberEmoji(index + 1);
            const priceFormatted = product.price.toLocaleString('es-CO');
            const availability = this.getAvailabilityIndicator(product);
            // Formato compacto por producto
            response += `${number} *${product.name}*\n`;
            response += `   💰 $${priceFormatted} COP ${availability}\n`;
            // Agregar característica destacada si existe
            const highlight = this.extractHighlight(product);
            if (highlight) {
                response += `   ✨ ${highlight}\n`;
            }
            response += `\n`;
        });
        response += `📱 *¿Cuál te interesa?* Dime el número o nombre 😊`;
        return response;
    }
    /**
     * Obtener emoji según categoría
     */
    static getCategoryEmoji(category) {
        const emojiMap = {
            'laptop': '💻',
            'monitor': '🖥️',
            'teclado': '⌨️',
            'mouse': '🖱️',
            'diadema': '🎧',
            'parlante': '🔊',
            'impresora': '🖨️',
            'curso': '📚',
            'megapack': '📦',
            'moto': '🏍️',
            'DIGITAL': '💾',
            'PHYSICAL': '📦',
            'SERVICE': '🛠️'
        };
        const categoryLower = category.toLowerCase();
        for (const [key, emoji] of Object.entries(emojiMap)) {
            if (categoryLower.includes(key)) {
                return emoji;
            }
        }
        return '🎯';
    }
    /**
     * Detectar categoría de la búsqueda
     */
    static detectCategory(query) {
        const queryLower = query.toLowerCase();
        if (queryLower.includes('laptop') || queryLower.includes('portátil') || queryLower.includes('computador')) {
            return 'laptop';
        }
        if (queryLower.includes('monitor') || queryLower.includes('pantalla')) {
            return 'monitor';
        }
        if (queryLower.includes('teclado')) {
            return 'teclado';
        }
        if (queryLower.includes('mouse') || queryLower.includes('ratón')) {
            return 'mouse';
        }
        if (queryLower.includes('diadema') || queryLower.includes('audífono')) {
            return 'diadema';
        }
        if (queryLower.includes('parlante') || queryLower.includes('bocina')) {
            return 'parlante';
        }
        if (queryLower.includes('curso')) {
            return 'curso';
        }
        if (queryLower.includes('megapack') || queryLower.includes('mega pack')) {
            return 'megapack';
        }
        return 'producto';
    }
    /**
     * Obtener emoji de número
     */
    static getNumberEmoji(num) {
        const emojiNumbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        return num <= 10 ? emojiNumbers[num - 1] : `${num}.`;
    }
    /**
     * Obtener indicador de disponibilidad
     */
    static getAvailabilityIndicator(product) {
        if (product.category === 'DIGITAL') {
            return '✅';
        }
        if (product.stock) {
            if (product.stock > 5) {
                return '✅';
            }
            else if (product.stock > 0) {
                return '⚠️';
            }
        }
        return '✅';
    }
    /**
     * Extraer característica destacada del producto
     */
    static extractHighlight(product) {
        const name = product.name.toLowerCase();
        const desc = (product.description || '').toLowerCase();
        // Buscar características destacadas
        const highlights = [
            { pattern: /(\d+gb|16gb|32gb|64gb|128gb|256gb|512gb|1tb)/i, prefix: 'Memoria' },
            { pattern: /(intel|amd|ryzen|core i\d)/i, prefix: 'Procesador' },
            { pattern: /(\d+\.?\d*\s*pulgadas?|\d+\.?\d*"|\d+\.?\d*'')/i, prefix: 'Pantalla' },
            { pattern: /(inalámbrico|wireless|bluetooth)/i, prefix: 'Conexión' },
            { pattern: /(rgb|led|iluminado)/i, prefix: 'Iluminación' },
            { pattern: /(gaming|gamer)/i, prefix: 'Gaming' }
        ];
        for (const { pattern, prefix } of highlights) {
            const match = name.match(pattern) || desc.match(pattern);
            if (match) {
                return `${prefix}: ${match[0]}`;
            }
        }
        return null;
    }
    /**
     * Formatear comparación de productos (cuando cliente compara)
     */
    static formatComparison(products) {
        if (products.length < 2) {
            return this.formatProductList(products, '');
        }
        let response = `📊 *Comparación de productos:*\n\n`;
        products.forEach((product, index) => {
            const number = this.getNumberEmoji(index + 1);
            const priceFormatted = product.price.toLocaleString('es-CO');
            response += `${number} *${product.name}*\n`;
            response += `   💰 $${priceFormatted} COP\n`;
            // Extraer specs para comparar
            const specs = this.extractSpecs(product);
            if (specs.length > 0) {
                specs.forEach(spec => {
                    response += `   • ${spec}\n`;
                });
            }
            response += `\n`;
        });
        response += `🤔 *¿Cuál prefieres?* Puedo ayudarte a decidir 😊`;
        return response;
    }
    /**
     * Extraer especificaciones del producto
     */
    static extractSpecs(product) {
        const specs = [];
        const text = `${product.name} ${product.description || ''}`.toLowerCase();
        // RAM
        const ramMatch = text.match(/(\d+gb)\s*(ram|ddr\d)/i);
        if (ramMatch) {
            specs.push(`RAM: ${ramMatch[1].toUpperCase()}`);
        }
        // Almacenamiento
        const storageMatch = text.match(/(\d+gb|\d+tb)\s*(ssd|hdd|nvme)/i);
        if (storageMatch) {
            specs.push(`Almacenamiento: ${storageMatch[1].toUpperCase()} ${storageMatch[2].toUpperCase()}`);
        }
        // Procesador
        const cpuMatch = text.match(/(intel core i\d|ryzen \d|amd)/i);
        if (cpuMatch) {
            specs.push(`CPU: ${cpuMatch[1]}`);
        }
        // Pantalla
        const screenMatch = text.match(/(\d+\.?\d*)\s*(pulgadas?|"|'')/i);
        if (screenMatch) {
            specs.push(`Pantalla: ${screenMatch[1]}"`);
        }
        return specs;
    }
    /**
     * Formatear productos por rango de precio
     */
    static formatByPriceRange(products, maxBudget) {
        if (products.length === 0) {
            return '❌ No encontré productos en ese rango de precio.';
        }
        // Ordenar por precio
        const sorted = [...products].sort((a, b) => a.price - b.price);
        let response = maxBudget
            ? `💰 *Opciones dentro de tu presupuesto ($${maxBudget.toLocaleString('es-CO')} COP):*\n\n`
            : `💰 *Opciones ordenadas por precio:*\n\n`;
        sorted.forEach((product, index) => {
            const number = this.getNumberEmoji(index + 1);
            const priceFormatted = product.price.toLocaleString('es-CO');
            const withinBudget = !maxBudget || product.price <= maxBudget;
            response += `${number} *${product.name}*\n`;
            response += `   💰 $${priceFormatted} COP ${withinBudget ? '✅' : '⚠️'}\n\n`;
        });
        response += `📱 *¿Cuál te interesa?* 😊`;
        return response;
    }
}
exports.ProductListFormatter = ProductListFormatter;
