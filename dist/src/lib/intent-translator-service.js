"use strict";
/**
 * 🧠 SERVICIO DE TRADUCCIÓN DE INTENCIÓN LOCAL
 * Sistema de razonamiento sin IA externa que entiende la intención del cliente
 * Funciona sin tokens, completamente local
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentTranslatorService = void 0;
class IntentTranslatorService {
    /**
     * Traduce el mensaje del cliente a una intención clara
     */
    static translateIntent(message) {
        console.log('[IntentTranslator] 📝 Mensaje original:', message);
        // Paso 1: Corregir ortografía
        const correctedMessage = this.correctSpelling(message);
        console.log('[IntentTranslator] ✅ Mensaje corregido:', correctedMessage);
        // Paso 2: Detectar intención usando patrones
        const intentMatch = this.detectIntent(correctedMessage);
        if (intentMatch) {
            console.log('[IntentTranslator] 🎯 Intención detectada:', intentMatch.intent);
            console.log('[IntentTranslator] 🔑 Palabras clave:', intentMatch.keywords);
            console.log('[IntentTranslator] 💯 Confianza:', `${(intentMatch.confidence * 100).toFixed(0)}%`);
            return {
                originalMessage: message,
                correctedMessage: correctedMessage,
                detectedIntent: intentMatch.intent,
                productKeywords: intentMatch.keywords,
                confidence: intentMatch.confidence,
                reasoning: intentMatch.reasoning
            };
        }
        // Paso 3: Si no hay patrón específico, extraer palabras clave generales
        const keywords = this.extractGeneralKeywords(correctedMessage);
        console.log('[IntentTranslator] 🔍 Extracción general de palabras clave:', keywords);
        return {
            originalMessage: message,
            correctedMessage: correctedMessage,
            detectedIntent: 'busqueda_general',
            productKeywords: keywords,
            confidence: 0.7,
            reasoning: 'Búsqueda general basada en palabras clave'
        };
    }
    /**
     * Corrige errores ortográficos comunes
     */
    static correctSpelling(message) {
        let corrected = message.toLowerCase();
        // Aplicar correcciones del diccionario
        for (const [error, correction] of Object.entries(this.CORRECTIONS)) {
            const regex = new RegExp(`\\b${error}\\b`, 'gi');
            corrected = corrected.replace(regex, correction);
        }
        return corrected;
    }
    /**
     * Detecta la intención usando patrones predefinidos
     */
    static detectIntent(message) {
        for (const pattern of this.INTENT_PATTERNS) {
            const match = message.match(pattern.pattern);
            if (match) {
                const keywords = pattern.extract(match);
                return {
                    intent: pattern.intent,
                    keywords: keywords,
                    confidence: pattern.confidence,
                    reasoning: `Patrón detectado: ${pattern.intent}`
                };
            }
        }
        return null;
    }
    /**
     * Extrae palabras clave generales cuando no hay patrón específico
     */
    static extractGeneralKeywords(message) {
        const stopWords = ['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'y', 'o',
            'para', 'con', 'por', 'que', 'me', 'te', 'se', 'su', 'sus', 'al',
            'hola', 'buenos', 'días', 'tardes', 'noches', 'muy', 'buenas'];
        const words = message
            .toLowerCase()
            .replace(/[¿?¡!.,;:]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word));
        return [...new Set(words)];
    }
    /**
     * Genera una consulta de búsqueda optimizada basada en la intención
     */
    static generateSearchQuery(intentResult) {
        // Usar las palabras clave detectadas para crear una consulta optimizada
        return intentResult.productKeywords.join(' ');
    }
    /**
     * Obtiene el nombre del producto más probable basado en la intención
     */
    static getMostLikelyProduct(intentResult) {
        const intentToProduct = {
            'buscar_curso_diseno_grafico': 'Mega Pack 01: Cursos Diseño Gráfico',
            'buscar_megapack_diseno': 'Mega Pack 01: Cursos Diseño Gráfico',
            'buscar_curso_ingles': 'Mega Pack 03: Cursos Inglés',
            'buscar_curso_programacion': 'Mega Pack 02: Cursos Programación Web',
            'buscar_curso_marketing': 'Mega Pack 03: Cursos Marketing Digital',
            'buscar_pack_completo': 'PACK COMPLETO 40 Mega Packs'
        };
        return intentToProduct[intentResult.detectedIntent] || null;
    }
}
exports.IntentTranslatorService = IntentTranslatorService;
/**
 * Diccionario de correcciones ortográficas comunes
 */
IntentTranslatorService.CORRECTIONS = {
    // Errores comunes de "diseño"
    'diseno': 'diseño',
    'diseño': 'diseño',
    'diceno': 'diseño',
    'diselo': 'diseño',
    'disenio': 'diseño',
    // Errores comunes de "gráfico"
    'grafico': 'gráfico',
    'grafico': 'gráfico',
    'grafiko': 'gráfico',
    'grafic': 'gráfico',
    // Errores comunes de "megapack"
    'mega pack': 'megapack',
    'mega-pack': 'megapack',
    'megapak': 'megapack',
    'mega pak': 'megapack',
    'megapac': 'megapack',
    // Errores comunes de "inglés"
    'ingles': 'inglés',
    'inglez': 'inglés',
    'ingle': 'inglés',
    // Errores comunes de "programación"
    'programacion': 'programación',
    'programasion': 'programación',
    'programaciom': 'programación',
    // Otros errores comunes
    'curso': 'curso',
    'curzo': 'curso',
    'courso': 'curso',
    'interesa': 'interesa',
    'intereza': 'interesa',
    'quiero': 'quiero',
    'kiero': 'quiero',
    'tienes': 'tienes',
    'tenes': 'tienes'
};
/**
 * Patrones de intención para detectar qué busca el cliente
 */
IntentTranslatorService.INTENT_PATTERNS = [
    {
        pattern: /(?:me\s+)?(?:interesa|intereza|quiero|kiero|busco|necesito).*(?:mega\s*pack|megapack|megapak).*(\d+)/i,
        intent: 'buscar_megapack_numero',
        extract: (match) => [`megapack ${match[1]}`],
        confidence: 0.95
    },
    {
        pattern: /(?:me\s+)?(?:interesa|intereza|quiero|kiero|busco|necesito).*(?:curso|curzo).*(?:diseño|diseno|diceno).*(?:gráfico|grafico|grafiko)/i,
        intent: 'buscar_curso_diseno_grafico',
        extract: () => ['diseño gráfico', 'megapack 01'],
        confidence: 0.9
    },
    {
        pattern: /(?:me\s+)?(?:interesa|intereza|quiero|kiero|busco|necesito).*(?:curso|curzo).*(?:inglés|ingles|inglez)/i,
        intent: 'buscar_curso_ingles',
        extract: () => ['inglés', 'megapack 03'],
        confidence: 0.9
    },
    {
        pattern: /(?:me\s+)?(?:interesa|intereza|quiero|kiero|busco|necesito).*(?:curso|curzo).*(?:programación|programacion|programasion)/i,
        intent: 'buscar_curso_programacion',
        extract: () => ['programación', 'megapack 02'],
        confidence: 0.9
    },
    {
        pattern: /(?:me\s+)?(?:interesa|intereza|quiero|kiero|busco|necesito).*(?:curso|curzo).*(?:marketing|marketi)/i,
        intent: 'buscar_curso_marketing',
        extract: () => ['marketing', 'megapack 03', 'megapack 11'],
        confidence: 0.9
    },
    {
        pattern: /(?:tienes|tenes|hay).*(?:curso|curzo).*(?:diseño|diseno)/i,
        intent: 'buscar_curso_diseno_grafico',
        extract: () => ['diseño gráfico', 'megapack 01'],
        confidence: 0.85
    },
    {
        pattern: /(?:tienes|tenes|hay).*(?:curso|curzo).*(?:inglés|ingles)/i,
        intent: 'buscar_curso_ingles',
        extract: () => ['inglés', 'megapack 03'],
        confidence: 0.85
    },
    {
        pattern: /(?:mega\s*pack|megapack|megapak).*(?:diseño|diseno)/i,
        intent: 'buscar_megapack_diseno',
        extract: () => ['diseño gráfico', 'megapack 01'],
        confidence: 0.9
    },
    {
        pattern: /(?:mega\s*pack|megapack|megapak).*(?:completo|todos|40)/i,
        intent: 'buscar_pack_completo',
        extract: () => ['pack completo', '40 megapacks'],
        confidence: 0.95
    }
];
