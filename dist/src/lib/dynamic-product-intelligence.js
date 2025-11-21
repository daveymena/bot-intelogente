"use strict";
/**
 * 🧠 INTELIGENCIA DINÁMICA DE PRODUCTOS
 * Sistema que aprende automáticamente de TODOS los productos en la BD
 * Funciona para productos actuales y futuros sin configuración manual
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicProductIntelligence = void 0;
const db_1 = require("./db");
class DynamicProductIntelligence {
    /**
     * Extrae palabras clave inteligentes de la descripción del producto
     */
    static extractProductKeywords(product) {
        const text = `${product.name} ${product.description || ''} ${product.subcategory || ''}`.toLowerCase();
        // Palabras clave importantes (no genéricas)
        const keywords = new Set();
        // Extraer palabras significativas (más de 4 letras)
        const words = text.split(/\s+/).filter(w => w.length > 4);
        words.forEach(w => keywords.add(w));
        // Detectar temas específicos
        const temas = [
            'inglés', 'ingles', 'idiomas', 'lenguajes',
            'diseño', 'diseno', 'gráfico', 'grafico', 'photoshop', 'illustrator',
            'programación', 'programacion', 'código', 'codigo', 'desarrollo', 'web',
            'marketing', 'publicidad', 'redes', 'sociales',
            'excel', 'office', 'word', 'powerpoint',
            'video', 'edición', 'edicion', 'premiere', 'after',
            'fotografía', 'fotografia', 'cámara', 'camara',
            'música', 'musica', 'audio', 'piano', 'guitarra',
            '3d', 'animación', 'animacion', 'blender',
            'emprendimiento', 'negocio', 'empresa',
            'hacking', 'seguridad', 'ciberseguridad'
        ];
        temas.forEach(tema => {
            if (text.includes(tema)) {
                keywords.add(tema);
            }
        });
        return Array.from(keywords);
    }
    /**
     * Analiza la intención del cliente y encuentra el mejor producto
     */
    static async findBestProductMatch(userQuery, userId) {
        try {
            console.log('[DynamicIntelligence] 🔍 Analizando consulta:', userQuery);
            // Normalizar consulta
            const queryNormalized = userQuery.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            // Obtener TODOS los productos
            const allProducts = await db_1.db.product.findMany({
                where: {
                    userId,
                    status: 'AVAILABLE'
                }
            });
            console.log(`[DynamicIntelligence] 📦 Analizando ${allProducts.length} productos...`);
            // Calcular relevancia para cada producto
            const matches = [];
            for (const product of allProducts) {
                const productName = product.name.toLowerCase();
                const productDesc = (product.description || '').toLowerCase();
                const productSubcat = (product.subcategory || '').toLowerCase();
                const productText = `${productName} ${productDesc} ${productSubcat}`;
                // Normalizar texto del producto
                const productNormalized = productText
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                let score = 0;
                const reasons = [];
                // Extraer keywords del producto
                const productKeywords = this.extractProductKeywords(product);
                // Extraer palabras de la consulta
                const queryWords = queryNormalized.split(/\s+/).filter(w => w.length > 3);
                // ANÁLISIS 1: Coincidencias directas en nombre
                queryWords.forEach(word => {
                    if (productName.includes(word)) {
                        score += 50;
                        reasons.push(`"${word}" en nombre`);
                    }
                });
                // ANÁLISIS 2: Coincidencias en subcategoría
                queryWords.forEach(word => {
                    if (productSubcat.includes(word)) {
                        score += 40;
                        reasons.push(`"${word}" en categoría`);
                    }
                });
                // ANÁLISIS 3: Coincidencias en descripción
                queryWords.forEach(word => {
                    if (productDesc.includes(word)) {
                        score += 20;
                        reasons.push(`"${word}" en descripción`);
                    }
                });
                // ANÁLISIS 4: Keywords del producto que coinciden con la consulta
                productKeywords.forEach(keyword => {
                    if (queryNormalized.includes(keyword)) {
                        score += 30;
                        reasons.push(`keyword "${keyword}" coincide`);
                    }
                });
                // ANÁLISIS 5: Sinónimos y relaciones semánticas
                const semanticMatches = this.findSemanticMatches(queryNormalized, productNormalized);
                score += semanticMatches.score;
                reasons.push(...semanticMatches.reasons);
                // ANÁLISIS 6: Bonus por coincidencia completa
                const allQueryWordsInProduct = queryWords.every(w => productNormalized.includes(w));
                if (allQueryWordsInProduct && queryWords.length > 1) {
                    score += 100;
                    reasons.push('COINCIDENCIA COMPLETA');
                }
                // Si hay score significativo, agregar a matches
                if (score > 50) {
                    // Generar beneficio automático
                    const benefit = this.generateBenefit(product, queryNormalized);
                    matches.push({
                        product,
                        score,
                        matchReason: reasons.join(', '),
                        benefit
                    });
                }
            }
            // Ordenar por score
            matches.sort((a, b) => b.score - a.score);
            if (matches.length > 0) {
                const best = matches[0];
                console.log(`[DynamicIntelligence] ✅ Mejor match: ${best.product.name}`);
                console.log(`[DynamicIntelligence] 📊 Score: ${best.score}`);
                console.log(`[DynamicIntelligence] 💡 Razón: ${best.matchReason}`);
                console.log(`[DynamicIntelligence] ✨ Beneficio: ${best.benefit}`);
                return best;
            }
            console.log('[DynamicIntelligence] ❌ No se encontró match significativo');
            return null;
        }
        catch (error) {
            console.error('[DynamicIntelligence] Error:', error);
            return null;
        }
    }
    /**
     * Encuentra coincidencias semánticas (sinónimos, relaciones)
     */
    static findSemanticMatches(query, productText) {
        let score = 0;
        const reasons = [];
        // Mapeo de sinónimos y relaciones
        const semanticMap = {
            'ingles': ['english', 'idiomas', 'lenguajes', 'languages'],
            'diseño': ['design', 'grafico', 'photoshop', 'illustrator', 'creativo'],
            'programacion': ['codigo', 'desarrollo', 'web', 'software', 'developer'],
            'marketing': ['publicidad', 'redes', 'social', 'ads', 'seo'],
            'excel': ['office', 'microsoft', 'hojas', 'calculo'],
            'video': ['edicion', 'premiere', 'after', 'multimedia'],
            'fotografia': ['foto', 'camara', 'imagen', 'photography'],
            'musica': ['audio', 'sonido', 'produccion', 'musical'],
            '3d': ['animacion', 'modelado', 'blender', 'maya'],
            'negocio': ['emprendimiento', 'empresa', 'startup', 'business']
        };
        // Buscar relaciones semánticas
        for (const [key, synonyms] of Object.entries(semanticMap)) {
            if (query.includes(key)) {
                for (const synonym of synonyms) {
                    if (productText.includes(synonym)) {
                        score += 25;
                        reasons.push(`relación semántica: ${key} → ${synonym}`);
                    }
                }
            }
        }
        return { score, reasons };
    }
    /**
     * Genera automáticamente el beneficio del producto
     */
    static generateBenefit(product, query) {
        const desc = product.description || '';
        // Extraer beneficios de la descripción
        let benefit = '';
        // Si la descripción es larga, extraer lo más relevante
        if (desc.length > 100) {
            // Buscar frases que contengan palabras de la consulta
            const sentences = desc.split(/[.!?]\s+/);
            const relevantSentences = sentences.filter(s => {
                const queryWords = query.split(/\s+/).filter(w => w.length > 3);
                return queryWords.some(w => s.toLowerCase().includes(w));
            });
            if (relevantSentences.length > 0) {
                benefit = relevantSentences.slice(0, 2).join('. ');
            }
            else {
                // Tomar las primeras 2 oraciones
                benefit = sentences.slice(0, 2).join('. ');
            }
        }
        else {
            benefit = desc;
        }
        // Si no hay descripción, generar beneficio genérico
        if (!benefit) {
            benefit = `Acceso completo a ${product.name} con contenido de alta calidad`;
        }
        return benefit;
    }
    /**
     * Genera respuesta inteligente con el producto encontrado
     */
    static generateIntelligentResponse(match, userQuery) {
        const { ResponseValidator } = require('./response-validator');
        // Validar disponibilidad del producto
        const availability = ResponseValidator.validateProductAvailability(match.product);
        if (!availability.isAvailable) {
            console.warn('[DynamicIntelligence] ⚠️ Producto no disponible:', availability.reason);
            return ResponseValidator.generateNoProductMessage(userQuery);
        }
        // Generar respuesta segura usando SOLO datos reales
        const response = ResponseValidator.generateSafeResponse(match.product, userQuery);
        // Validar que no se haya inventado nada
        ResponseValidator.logInventedInfo(response, match.product);
        return response;
    }
    /**
     * Aprende automáticamente de conversaciones exitosas
     */
    static async learnFromSuccess(userQuery, productId, response) {
        try {
            // Guardar en base de conocimiento
            const { LocalKnowledgeBase } = await Promise.resolve().then(() => __importStar(require('./local-knowledge-base')));
            await LocalKnowledgeBase.saveSuccessfulResponse({
                userQuery,
                botResponse: response,
                productId,
                confidence: 0.9
            });
            console.log('[DynamicIntelligence] 💾 Aprendizaje guardado para futuras consultas');
        }
        catch (error) {
            console.error('[DynamicIntelligence] Error guardando aprendizaje:', error);
        }
    }
}
exports.DynamicProductIntelligence = DynamicProductIntelligence;
