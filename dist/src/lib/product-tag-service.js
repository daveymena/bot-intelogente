"use strict";
/**
 * 🏷️ SERVICIO DE TAGS INTELIGENTES PARA PRODUCTOS
 * Sistema SaaS que facilita la configuración de productos para clientes
 * Genera tags automáticamente y sugiere configuraciones óptimas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductTagService = void 0;
class ProductTagService {
    /**
     * Genera sugerencias de tags inteligentes para un producto
     */
    static generateTagSuggestions(product) {
        const suggestions = [];
        const text = `${product.name} ${product.description || ''}`.toLowerCase();
        // Analizar por categorías existentes
        for (const [categoryKey, categoryData] of Object.entries(this.CATEGORY_TEMPLATES)) {
            let categoryScore = 0;
            const matchedTerms = [];
            // Verificar coincidencias en el texto del producto
            for (const term of categoryData.searchTerms) {
                if (text.includes(term.toLowerCase())) {
                    categoryScore += 20;
                    matchedTerms.push(term);
                }
            }
            // Verificar tags de categoría
            for (const tag of categoryData.tags) {
                if (text.includes(tag.toLowerCase())) {
                    categoryScore += 15;
                    matchedTerms.push(tag);
                }
            }
            // Si hay buena coincidencia, agregar sugerencia
            if (categoryScore >= 15) {
                suggestions.push({
                    tag: categoryKey,
                    category: categoryKey,
                    confidence: Math.min(categoryScore / 100, 1),
                    description: `Categoría ${categoryKey} - términos encontrados: ${matchedTerms.slice(0, 3).join(', ')}`,
                    searchTerms: matchedTerms
                });
            }
        }
        // Analizar palabras clave específicas del producto
        const specificTags = this.extractSpecificTags(text);
        suggestions.push(...specificTags);
        // Ordenar por confianza
        return suggestions.sort((a, b) => b.confidence - a.confidence);
    }
    /**
     * Extrae tags específicos del texto del producto
     */
    static extractSpecificTags(text) {
        const tags = [];
        const words = text.split(/\s+/).filter(w => w.length > 3);
        // Buscar términos técnicos específicos
        const technicalTerms = [
            'javascript', 'python', 'react', 'node', 'php', 'java', 'mysql', 'mongodb',
            'photoshop', 'illustrator', 'premiere', 'lightroom', 'after effects',
            'facebook', 'instagram', 'google', 'ads', 'seo', 'sem',
            'piano', 'guitarra', 'bateria', 'canto', 'voz',
            'ingles', 'español', 'frances', 'aleman', 'italiano', 'chino',
            'marketing', 'ventas', 'publicidad', 'branding', 'logo'
        ];
        for (const term of technicalTerms) {
            if (text.includes(term)) {
                tags.push({
                    tag: term,
                    category: this.guessCategoryFromTerm(term),
                    confidence: 0.8,
                    description: `Término técnico específico: ${term}`,
                    searchTerms: [term]
                });
            }
        }
        return tags;
    }
    /**
     * Adivina la categoría basada en un término
     */
    static guessCategoryFromTerm(term) {
        const categoryMap = {
            'javascript': 'programacion',
            'python': 'programacion',
            'react': 'programacion',
            'node': 'programacion',
            'php': 'programacion',
            'java': 'programacion',
            'mysql': 'programacion',
            'mongodb': 'programacion',
            'photoshop': 'diseno',
            'illustrator': 'diseno',
            'premiere': 'video',
            'lightroom': 'fotografia',
            'facebook': 'marketing',
            'instagram': 'marketing',
            'google': 'marketing',
            'seo': 'marketing',
            'sem': 'marketing',
            'piano': 'musica',
            'guitarra': 'musica',
            'bateria': 'musica',
            'canto': 'musica',
            'ingles': 'idiomas',
            'español': 'idiomas',
            'frances': 'idiomas',
            'aleman': 'idiomas'
        };
        return categoryMap[term] || 'general';
    }
    /**
     * Genera configuración completa para un producto
     */
    static generateProductConfig(product) {
        const suggestions = this.generateTagSuggestions(product);
        const primarySuggestion = suggestions[0];
        // Generar tags basados en sugerencias
        const tags = new Set();
        // Agregar tags de la categoría principal
        if (primarySuggestion) {
            tags.add(primarySuggestion.tag);
            const categoryData = this.CATEGORY_TEMPLATES[primarySuggestion.category];
            if (categoryData) {
                categoryData.tags.forEach(tag => tags.add(tag));
            }
        }
        // Agregar tags específicos encontrados
        suggestions.forEach(suggestion => {
            suggestion.searchTerms.forEach(term => tags.add(term));
        });
        // Agregar tags del nombre del producto
        const nameWords = product.name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        nameWords.forEach(word => tags.add(word));
        return {
            name: product.name,
            description: product.description || '',
            category: primarySuggestion?.category || product.category || 'general',
            tags: Array.from(tags),
            searchPriority: primarySuggestion ? Math.round(primarySuggestion.confidence * 10) : 5,
            autoGenerated: true
        };
    }
    /**
     * Valida configuración de tags
     */
    static validateTagConfig(config) {
        const warnings = [];
        const suggestions = [];
        // Verificar que tenga al menos 3 tags
        if (config.tags.length < 3) {
            warnings.push('Se recomienda tener al menos 3 tags para mejor búsqueda');
            suggestions.push('Agregue más tags relacionados con su producto');
        }
        // Verificar que tenga tags de búsqueda comunes
        const hasSearchTerms = config.tags.some(tag => this.CATEGORY_TEMPLATES[config.category]?.searchTerms.some(term => tag.toLowerCase().includes(term.toLowerCase())));
        if (!hasSearchTerms) {
            warnings.push('Considere agregar términos de búsqueda comunes para su categoría');
            const categoryData = this.CATEGORY_TEMPLATES[config.category];
            if (categoryData) {
                suggestions.push(`Términos sugeridos: ${categoryData.searchTerms.slice(0, 3).join(', ')}`);
            }
        }
        // Verificar duplicados
        const uniqueTags = new Set(config.tags.map(t => t.toLowerCase()));
        if (uniqueTags.size !== config.tags.length) {
            warnings.push('Hay tags duplicados (diferentes solo en mayúsculas/minúsculas)');
            suggestions.push('Elimine los tags duplicados');
        }
        return {
            isValid: warnings.length === 0,
            warnings,
            suggestions
        };
    }
    /**
     * Optimiza tags para mejor búsqueda
     */
    static optimizeTags(tags) {
        const optimized = new Set();
        tags.forEach(tag => {
            const normalized = tag.toLowerCase().trim();
            // Agregar el tag normalizado
            optimized.add(normalized);
            // Agregar variaciones comunes
            if (normalized.endsWith('s') && normalized.length > 3) {
                optimized.add(normalized.slice(0, -1)); // Singular
            }
            // Agregar sin acentos
            const withoutAccents = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (withoutAccents !== normalized) {
                optimized.add(withoutAccents);
            }
        });
        return Array.from(optimized);
    }
    /**
     * Obtiene estadísticas de uso de tags
     */
    static getTagStats(products) {
        const tagCounts = new Map();
        products.forEach(product => {
            product.tags.forEach(tag => {
                const normalized = tag.toLowerCase();
                tagCounts.set(normalized, (tagCounts.get(normalized) || 0) + 1);
            });
        });
        const mostUsed = Array.from(tagCounts.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        const totalProducts = products.length;
        const productsWithTags = products.filter(p => p.tags.length > 0).length;
        const coverage = totalProducts > 0 ? (productsWithTags / totalProducts) * 100 : 0;
        const recommendations = [];
        if (coverage < 70) {
            recommendations.push('Considere agregar más tags a sus productos para mejorar la búsqueda');
        }
        if (mostUsed.length < 5) {
            recommendations.push('Diversifique los tags para cubrir más términos de búsqueda');
        }
        return {
            mostUsed,
            coverage,
            recommendations
        };
    }
}
exports.ProductTagService = ProductTagService;
/**
 * Categorías predefinidas con sus tags inteligentes
 */
ProductTagService.CATEGORY_TEMPLATES = {
    'cursos': {
        tags: ['curso', 'capacitación', 'aprendizaje', 'educación', 'formación'],
        searchTerms: ['curso de', 'aprender', 'enseñar', 'clases de', 'capacitación en']
    },
    'musica': {
        tags: ['música', 'musical', 'instrumento', 'audio', 'producción'],
        searchTerms: ['piano', 'guitarra', 'batería', 'canto', 'producción musical', 'mezcla', 'mastering']
    },
    'idiomas': {
        tags: ['idioma', 'language', 'conversación', 'gramática', 'vocabulario'],
        searchTerms: ['inglés', 'español', 'francés', 'alemán', 'italiano', 'chino', 'japonés', 'portugués']
    },
    'diseno': {
        tags: ['diseño', 'gráfico', 'creativo', 'visual', 'arte'],
        searchTerms: ['photoshop', 'illustrator', 'indesign', 'corel', 'diseño web', 'logo', 'branding']
    },
    'programacion': {
        tags: ['programación', 'código', 'desarrollo', 'software', 'web'],
        searchTerms: ['javascript', 'python', 'java', 'php', 'react', 'node', 'html', 'css', 'mysql']
    },
    'marketing': {
        tags: ['marketing', 'ventas', 'publicidad', 'redes sociales', 'estrategia'],
        searchTerms: ['facebook ads', 'google ads', 'seo', 'sem', 'email marketing', 'social media']
    },
    'fotografia': {
        tags: ['fotografía', 'foto', 'imagen', 'cámara', 'edición'],
        searchTerms: ['lightroom', 'photoshop', 'edición', 'retrato', 'paisaje', 'producto']
    },
    'video': {
        tags: ['video', 'edición', 'producción', 'cine', 'audiovisual'],
        searchTerms: ['premiere', 'after effects', 'final cut', 'da vinci', 'edición video']
    },
    'negocios': {
        tags: ['negocio', 'emprendimiento', 'empresa', 'finanzas', 'estrategia'],
        searchTerms: ['emprender', 'empresa', 'finanzas', 'contabilidad', 'administración']
    },
    'salud': {
        tags: ['salud', 'bienestar', 'fitness', 'nutrición', 'mente'],
        searchTerms: ['gimnasio', 'nutrición', 'meditación', 'yoga', 'psicología']
    },
    'tecnologia': {
        tags: ['tecnología', 'hardware', 'software', 'gadgets', 'innovación'],
        searchTerms: ['computador', 'laptop', 'celular', 'tablet', 'impresora']
    }
};
