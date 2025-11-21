"use strict";
/**
 * 🎯 SISTEMA DE SCORING INTELIGENTE DE PRODUCTOS
 * Calcula la relevancia de productos basándose en palabras clave
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductScorer = void 0;
class ProductScorer {
    /**
     * Calcula el score de relevancia de un producto
     */
    static scoreProduct(product, keywords) {
        let score = 0;
        const productName = product.name.toLowerCase();
        const productDesc = (product.description || '').toLowerCase();
        const productSubcat = (product.subcategory || '').toLowerCase();
        const productText = `${productName} ${productDesc} ${productSubcat}`;
        // Procesar cada palabra clave
        keywords.forEach((keyword, index) => {
            const keywordLower = keyword.toLowerCase();
            const isGeneric = this.GENERIC_WORDS.includes(keywordLower);
            // PRIORIDAD MÁXIMA: Coincidencia en el nombre
            if (productName.includes(keywordLower)) {
                if (!isGeneric) {
                    // Palabra específica (inglés, diseño, programación, etc.)
                    score += 50;
                    console.log(`[ProductScorer] 🎯 "${keyword}" en nombre de "${product.name}": +50 puntos`);
                }
                else {
                    // Palabra genérica (curso, mega, pack)
                    score += 10;
                }
                // Bonus si está al inicio
                if (productName.startsWith(keywordLower)) {
                    score += 15;
                    console.log(`[ProductScorer] 🚀 "${keyword}" al inicio de "${product.name}": +15 puntos`);
                }
            }
            // PRIORIDAD MEDIA: En subcategoría
            else if (productSubcat.includes(keywordLower)) {
                score += 30;
                console.log(`[ProductScorer] 📂 "${keyword}" en subcategoría de "${product.name}": +30 puntos`);
            }
            // PRIORIDAD BAJA: En descripción
            else if (productDesc.includes(keywordLower)) {
                score += 5;
            }
            // Bonus por primera palabra clave (más importante)
            if (index === 0 && productText.includes(keywordLower) && !isGeneric) {
                score += 10;
            }
        });
        // MEGA BONUS: Contiene TODAS las palabras clave importantes
        const importantKeywords = keywords.filter(kw => !this.GENERIC_WORDS.includes(kw.toLowerCase()) && kw.length > 3);
        if (importantKeywords.length > 0) {
            const containsAllImportant = importantKeywords.every(kw => productText.includes(kw.toLowerCase()));
            if (containsAllImportant) {
                score += 100;
                console.log(`[ProductScorer] 🌟 "${product.name}" contiene TODAS las palabras importantes: +100 MEGA BONUS`);
            }
        }
        return { product, score };
    }
    /**
     * Calcula scores para múltiples productos y los ordena
     */
    static scoreProducts(products, keywords) {
        const scoredProducts = products.map(product => this.scoreProduct(product, keywords));
        // Filtrar y ordenar por relevancia
        const relevantProducts = scoredProducts
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        // Log de resultados
        relevantProducts.forEach(item => {
            console.log(`[ProductScorer] 📊 ${item.product.name}: ${item.score} puntos`);
        });
        return relevantProducts.map(item => item.product);
    }
}
exports.ProductScorer = ProductScorer;
// Palabras genéricas que no deben dar puntos altos
ProductScorer.GENERIC_WORDS = [
    'curso', 'cursos', 'mega', 'pack', 'megapack', 'de', 'el', 'la'
];
