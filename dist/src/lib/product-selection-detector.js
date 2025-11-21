"use strict";
/**
 * 🎯 DETECTOR DE SELECCIÓN DE PRODUCTOS
 * Detecta cuando el cliente elige un producto específico de una lista
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSelectionDetector = void 0;
class ProductSelectionDetector {
    /**
     * Detectar si el mensaje es una selección de producto
     */
    static detectSelection(message, previousBotMessage) {
        const lowerMsg = message.toLowerCase().trim();
        // Patrones de selección por posición
        const positionPatterns = [
            // Números directos
            { pattern: /^(\d+)$/, method: 'position' },
            { pattern: /^el (\d+)/, method: 'position' },
            { pattern: /^la (\d+)/, method: 'position' },
            { pattern: /opci[oó]n (\d+)/, method: 'position' },
            { pattern: /n[uú]mero (\d+)/, method: 'position' },
            // Ordinales
            { pattern: /primer[oa]/, position: 1, method: 'position' },
            { pattern: /segund[oa]/, position: 2, method: 'position' },
            { pattern: /tercer[oa]/, position: 3, method: 'position' },
            { pattern: /cuart[oa]/, position: 4, method: 'position' },
            { pattern: /quint[oa]/, position: 5, method: 'position' },
            // Referencias
            { pattern: /^este$/, method: 'reference' },
            { pattern: /^ese$/, method: 'reference' },
            { pattern: /^esta$/, method: 'reference' },
            { pattern: /^esa$/, method: 'reference' },
            { pattern: /este port[aá]til/, method: 'reference' },
            { pattern: /esta laptop/, method: 'reference' },
            { pattern: /ese computador/, method: 'reference' },
            { pattern: /este curso/, method: 'reference' },
            { pattern: /este producto/, method: 'reference' },
            // Confirmaciones
            { pattern: /^s[ií]$/, method: 'reference' },
            { pattern: /^ok$/, method: 'reference' },
            { pattern: /^dale$/, method: 'reference' },
            { pattern: /^perfecto$/, method: 'reference' },
            { pattern: /me gusta/, method: 'reference' },
            { pattern: /me interesa/, method: 'reference' },
            { pattern: /lo quiero/, method: 'reference' },
            { pattern: /la quiero/, method: 'reference' },
        ];
        // Verificar cada patrón
        for (const { pattern, position, method } of positionPatterns) {
            const match = lowerMsg.match(pattern);
            if (match) {
                // Si tiene posición fija (ordinales)
                if (position) {
                    return {
                        isSelection: true,
                        position,
                        confidence: 0.95,
                        method
                    };
                }
                // Si capturó un número
                if (match[1]) {
                    const num = parseInt(match[1]);
                    if (num >= 1 && num <= 10) {
                        return {
                            isSelection: true,
                            position: num,
                            confidence: 0.98,
                            method
                        };
                    }
                }
                // Si es referencia (este, ese, etc.)
                if (method === 'reference') {
                    // Intentar extraer posición del mensaje anterior del bot
                    const lastPosition = this.extractLastProductPosition(previousBotMessage);
                    return {
                        isSelection: true,
                        position: lastPosition || 1, // Por defecto el primero
                        confidence: lastPosition ? 0.90 : 0.75,
                        method
                    };
                }
            }
        }
        // No es una selección
        return {
            isSelection: false,
            confidence: 0,
            method: 'none'
        };
    }
    /**
     * Extraer la posición del último producto mencionado en el mensaje del bot
     */
    static extractLastProductPosition(botMessage) {
        if (!botMessage)
            return null;
        // Buscar patrones como "1️⃣", "2️⃣", "📦 *Producto 1*", etc.
        const patterns = [
            /(\d+)️⃣/g,
            /\*Producto (\d+)\*/g,
            /^(\d+)\./gm,
            /🔹 \*.*?\* \((\d+)\)/g
        ];
        let lastPosition = null;
        for (const pattern of patterns) {
            const matches = [...botMessage.matchAll(pattern)];
            if (matches.length > 0) {
                // Tomar el último match
                const lastMatch = matches[matches.length - 1];
                lastPosition = parseInt(lastMatch[1]);
            }
        }
        return lastPosition;
    }
    /**
     * Extraer productos de un mensaje del bot
     */
    static extractProductsFromBotMessage(botMessage) {
        const products = [];
        // Patrones para extraer productos
        const patterns = [
            // "📦 *Nombre del Producto*"
            /📦\s*\*([^*]+)\*/g,
            // "1️⃣ *Nombre del Producto*"
            /(\d+)️⃣\s*\*([^*]+)\*/g,
            // "🔹 *Nombre del Producto*"
            /🔹\s*\*([^*]+)\*/g,
        ];
        let position = 1;
        for (const pattern of patterns) {
            const matches = [...botMessage.matchAll(pattern)];
            for (const match of matches) {
                const name = match[2] || match[1]; // Dependiendo del patrón
                if (name && name.trim()) {
                    products.push({
                        position: position++,
                        name: name.trim()
                    });
                }
            }
        }
        return products;
    }
    /**
     * Obtener el producto seleccionado de una lista
     */
    static getSelectedProduct(selection, productList, previousBotMessage) {
        if (!selection.isSelection || !selection.position) {
            return null;
        }
        // Ajustar índice (posición 1 = índice 0)
        const index = selection.position - 1;
        if (index >= 0 && index < productList.length) {
            return productList[index];
        }
        // Si no hay lista, intentar extraer del mensaje del bot
        if (previousBotMessage) {
            const extractedProducts = this.extractProductsFromBotMessage(previousBotMessage);
            const found = extractedProducts.find(p => p.position === selection.position);
            if (found) {
                console.log(`[Selection] Producto extraído del mensaje: ${found.name}`);
                return { name: found.name };
            }
        }
        return null;
    }
}
exports.ProductSelectionDetector = ProductSelectionDetector;
