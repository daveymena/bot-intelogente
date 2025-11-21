"use strict";
/**
 * 🧠 SISTEMA INTELIGENTE DE CONSULTA DE PRODUCTOS
 * Entiende la intención del cliente, busca en la BD y formatea la respuesta
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
exports.IntelligentProductQuerySystem = void 0;
const db_1 = require("./db");
const whatsapp_response_formatter_1 = require("./whatsapp-response-formatter");
class IntelligentProductQuerySystem {
    /**
     * PASO 1: Analizar la intención del cliente (MEJORADO CON IA)
     */
    static async analyzeIntent(message, conversationHistory = []) {
        const messageLower = message.toLowerCase().trim();
        // 🧠 ANÁLISIS INTELIGENTE CON IA (GROQ) - PRIORIDAD PRINCIPAL
        // La IA analiza TODAS las intenciones, incluyendo saludos
        try {
            const { default: Groq } = await Promise.resolve().then(() => __importStar(require('groq-sdk')));
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const analysisPrompt = `Analiza este mensaje de un cliente y determina su intención:

Mensaje: "${message}"

Responde SOLO con un JSON en este formato exacto:
{
  "type": "greeting" | "product_search" | "product_detail" | "comparison" | "general_info",
  "category": "PHYSICAL" | "DIGITAL" | "SERVICE" | null,
  "keywords": ["palabra1", "palabra2"],
  "confidence": 0-100
}

Reglas:
- greeting: saludos (ej: "hola", "buenos días", "hola muy buenas", "buenas tardes")
- product_search: busca productos en general (ej: "quiero un portatil", "tienes laptops", "necesito computador")
- product_detail: pregunta por producto específico (ej: "el lenovo ideapad", "ese dell que mencionaste")
- comparison: compara productos (ej: "cual es mejor", "diferencias entre")
- general_info: preguntas generales (ej: "formas de pago", "envios", "garantía")
- category: PHYSICAL para productos físicos, DIGITAL para digitales, SERVICE para servicios
- keywords: palabras clave importantes del mensaje
- confidence: qué tan seguro estás (0-100)

IMPORTANTE: 
- Entiende errores ortográficos y lenguaje informal
- Si es un saludo simple (hola, buenas, etc), marca como "greeting" con alta confianza
- Si es saludo + pregunta (ej: "hola, tienes laptops?"), marca como "product_search"`;
            const response = await groq.chat.completions.create({
                messages: [{ role: 'user', content: analysisPrompt }],
                model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
                temperature: 0.3,
                max_tokens: 200
            });
            const rawResponse = response.choices[0]?.message?.content || '{}';
            console.log(`🤖 IA analiza intención: ${rawResponse}`);
            const aiAnalysis = JSON.parse(rawResponse);
            console.log(`📊 Intención detectada: ${aiAnalysis.type} (confianza: ${aiAnalysis.confidence}%)`);
            // Si la IA tiene confianza razonable, usar su análisis
            if (aiAnalysis.confidence >= 60) {
                return {
                    type: aiAnalysis.type,
                    category: aiAnalysis.category,
                    features: aiAnalysis.keywords || [],
                    context: `IA detectó: ${aiAnalysis.type} (confianza: ${aiAnalysis.confidence}%)`
                };
            }
        }
        catch (error) {
            console.log('⚠️ Análisis IA falló, usando detección local:', error.message || error);
        }
        // 🔄 FALLBACK: Detección local solo si la IA falla
        console.log('🔄 Usando detección local como fallback');
        // Detectar saludo (local - rápido)
        if (this.isGreeting(messageLower)) {
            console.log('👋 Saludo detectado localmente:', messageLower);
            return {
                type: 'greeting',
                context: 'Cliente está saludando'
            };
        }
        // FALLBACK: Detección local (si IA falla o baja confianza)
        // Detectar comparación
        if (this.isComparison(messageLower)) {
            return {
                type: 'comparison',
                context: 'Cliente quiere comparar productos',
                ...this.extractComparisonDetails(messageLower)
            };
        }
        // Detectar búsqueda de producto específico
        if (this.isSpecificProduct(messageLower)) {
            return {
                type: 'product_detail',
                specificProduct: this.extractProductName(messageLower),
                context: 'Cliente busca un producto específico'
            };
        }
        // Detectar búsqueda por categoría
        const category = this.detectCategory(messageLower);
        if (category) {
            // Extraer keywords del mensaje original para búsqueda semántica
            const messageKeywords = this.extractKeywordsFromMessage(messageLower);
            return {
                type: 'product_search',
                category,
                priceRange: this.extractPriceRange(messageLower),
                features: messageKeywords.length > 0 ? messageKeywords : this.extractFeatures(messageLower),
                context: `Cliente busca productos de categoría: ${category}`
            };
        }
        // Información general
        return {
            type: 'general_info',
            context: 'Consulta general sobre servicios'
        };
    }
    /**
     * PASO 2: Buscar productos en la base de datos según la intención
     */
    static async searchProducts(intent, userId) {
        const whereClause = {
            userId,
            status: 'AVAILABLE'
        };
        // Búsqueda por categoría
        if (intent.category) {
            whereClause.category = intent.category;
        }
        // Búsqueda por rango de precio
        if (intent.priceRange) {
            whereClause.price = {};
            if (intent.priceRange.min) {
                whereClause.price.gte = intent.priceRange.min;
            }
            if (intent.priceRange.max) {
                whereClause.price.lte = intent.priceRange.max;
            }
        }
        // Búsqueda por nombre específico
        if (intent.specificProduct) {
            whereClause.OR = [
                { name: { contains: intent.specificProduct, mode: 'insensitive' } },
                { description: { contains: intent.specificProduct, mode: 'insensitive' } }
            ];
        }
        // 🎯 BÚSQUEDA SEMÁNTICA POR KEYWORDS (PRIORIDAD)
        // Expandir keywords de la IA con sinónimos y variaciones
        const searchKeywords = this.expandKeywords(intent.features || []);
        console.log('🔑 Keywords expandidas:', searchKeywords);
        if (searchKeywords.length > 0 && !intent.specificProduct) {
            whereClause.OR = searchKeywords.flatMap(keyword => [
                { name: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
                { tags: { contains: keyword, mode: 'insensitive' } }
            ]);
            console.log('🔍 Búsqueda semántica activada');
        }
        try {
            // Buscar más productos para poder rankearlos
            const products = await db_1.db.product.findMany({
                where: whereClause,
                take: 20,
                orderBy: [
                    { createdAt: 'desc' }
                ]
            });
            console.log(`📦 Productos encontrados (antes de ranking): ${products.length}`);
            // 🎯 RANKING INTELIGENTE: Priorizar productos principales sobre accesorios
            if (searchKeywords.length > 0 && products.length > 0) {
                const rankedProducts = this.rankProducts(products, searchKeywords);
                console.log('   Top 4 después de ranking:', rankedProducts.slice(0, 4).map(p => p.name));
                return rankedProducts.slice(0, 4);
            }
            if (products.length > 0) {
                console.log('   Primeros resultados:', products.slice(0, 2).map(p => p.name));
            }
            return products.slice(0, 4);
        }
        catch (error) {
            console.error('Error buscando productos:', error);
            return [];
        }
    }
    /**
     * Rankear productos por relevancia (priorizar productos principales sobre accesorios)
     */
    static rankProducts(products, keywords) {
        return products
            .map(product => {
            let score = 0;
            const nameLower = product.name.toLowerCase();
            const descLower = (product.description || '').toLowerCase();
            // Puntos por coincidencia exacta en el nombre (alta prioridad)
            keywords.forEach(keyword => {
                if (nameLower.includes(keyword)) {
                    score += 100;
                }
                if (descLower.includes(keyword)) {
                    score += 10;
                }
            });
            // Penalizar accesorios comunes
            const accessoryKeywords = [
                'base', 'soporte', 'protector', 'funda', 'estuche',
                'ventilador', 'enfriador', 'cable', 'adaptador', 'cargador',
                'mouse', 'teclado', 'diadema', 'parlante', 'webcam', 'cámara'
            ];
            accessoryKeywords.forEach(acc => {
                if (nameLower.includes(acc)) {
                    score -= 50;
                }
            });
            // Bonus por precio alto (productos principales suelen ser más caros)
            if (product.price > 1000000) {
                score += 20;
            }
            else if (product.price > 500000) {
                score += 10;
            }
            return { ...product, _score: score };
        })
            .sort((a, b) => b._score - a._score);
    }
    /**
     * Expandir keywords con sinónimos y variaciones para búsqueda más efectiva
     */
    static expandKeywords(keywords) {
        const expanded = new Set();
        // Mapa de sinónimos y variaciones
        const synonymMap = {
            'computadores': ['portátil', 'portatil', 'laptop', 'computador', 'notebook'],
            'computador': ['portátil', 'portatil', 'laptop', 'notebook'],
            'portátiles': ['portátil', 'portatil', 'laptop', 'notebook'],
            'portátil': ['portátil', 'portatil', 'laptop', 'notebook'],
            'portatil': ['portátil', 'portatil', 'laptop', 'notebook'],
            'laptop': ['portátil', 'portatil', 'laptop', 'notebook'],
            'laptops': ['portátil', 'portatil', 'laptop', 'notebook'],
            'celular': ['celular', 'teléfono', 'telefono', 'smartphone', 'móvil', 'movil'],
            'celulares': ['celular', 'teléfono', 'telefono', 'smartphone', 'móvil', 'movil'],
            'teléfono': ['celular', 'teléfono', 'telefono', 'smartphone'],
            'telefono': ['celular', 'teléfono', 'telefono', 'smartphone'],
            'tablet': ['tablet', 'tableta', 'ipad'],
            'tablets': ['tablet', 'tableta', 'ipad'],
            'monitor': ['monitor', 'pantalla'],
            'monitores': ['monitor', 'pantalla'],
            'impresora': ['impresora', 'printer'],
            'impresoras': ['impresora', 'printer'],
            'diadema': ['diadema', 'audífono', 'headset', 'auricular'],
            'diademas': ['diadema', 'audífono', 'headset', 'auricular'],
            'mouse': ['mouse', 'ratón', 'raton'],
            'teclado': ['teclado', 'keyboard'],
            'teclados': ['teclado', 'keyboard'],
            'curso': ['curso', 'capacitación', 'capacitacion', 'formación', 'formacion'],
            'cursos': ['curso', 'capacitación', 'capacitacion', 'formación', 'formacion'],
            'megapack': ['megapack', 'mega pack', 'pack'],
            'megapacks': ['megapack', 'mega pack', 'pack']
        };
        // Expandir cada keyword
        for (const keyword of keywords) {
            const keywordLower = keyword.toLowerCase().trim();
            // Agregar la keyword original
            expanded.add(keywordLower);
            // Agregar sinónimos si existen
            if (synonymMap[keywordLower]) {
                synonymMap[keywordLower].forEach(syn => expanded.add(syn));
            }
        }
        return Array.from(expanded);
    }
    /**
     * Extraer keywords específicas del contexto para búsqueda semántica
     */
    static extractContextKeywords(context) {
        const contextLower = context.toLowerCase();
        const keywords = [];
        // Computadores/Portátiles
        if (contextLower.includes('portátil') || contextLower.includes('portatil') ||
            contextLower.includes('laptop') || contextLower.includes('computador')) {
            keywords.push('portátil', 'portatil', 'laptop');
        }
        // Celulares
        if (contextLower.includes('celular') || contextLower.includes('teléfono') ||
            contextLower.includes('telefono') || contextLower.includes('smartphone')) {
            keywords.push('celular', 'teléfono', 'smartphone');
        }
        // Tablets
        if (contextLower.includes('tablet') || contextLower.includes('ipad')) {
            keywords.push('tablet', 'ipad');
        }
        // Monitores
        if (contextLower.includes('monitor') || contextLower.includes('pantalla')) {
            keywords.push('monitor', 'pantalla');
        }
        // Impresoras
        if (contextLower.includes('impresora') || contextLower.includes('printer')) {
            keywords.push('impresora');
        }
        // Diademas/Audífonos
        if (contextLower.includes('diadema') || contextLower.includes('audífono') ||
            contextLower.includes('headset') || contextLower.includes('auricular')) {
            keywords.push('diadema', 'audífono', 'headset');
        }
        // Mouse/Teclado
        if (contextLower.includes('mouse') || contextLower.includes('ratón')) {
            keywords.push('mouse');
        }
        if (contextLower.includes('teclado') || contextLower.includes('keyboard')) {
            keywords.push('teclado');
        }
        // Cursos
        if (contextLower.includes('curso') || contextLower.includes('capacitación')) {
            keywords.push('curso');
        }
        // Megapacks
        if (contextLower.includes('megapack') || contextLower.includes('mega pack')) {
            keywords.push('megapack', 'mega pack');
        }
        return keywords;
    }
    /**
     * PASO 3: Armar respuesta inteligente y formateada
     */
    static async buildIntelligentResponse(intent, products, message) {
        // Si es saludo
        if (intent.type === 'greeting') {
            return this.buildGreetingResponse();
        }
        // Si no hay productos
        if (products.length === 0) {
            return this.buildNoResultsResponse(intent, message);
        }
        // Si es producto específico (1 resultado)
        if (intent.type === 'product_detail' && products.length === 1) {
            return this.buildSingleProductResponse(products[0], intent);
        }
        // Si es comparación
        if (intent.type === 'comparison' && products.length >= 2) {
            return this.buildComparisonResponse(products.slice(0, 2), intent);
        }
        // Búsqueda general de productos
        return this.buildProductListResponse(products, intent);
    }
    /**
     * Construir respuesta de saludo
     */
    static buildGreetingResponse() {
        return `👋 ¡Hola! Bienvenido a Tecnovariedades D&S 😄💻

Aquí encontrarás tecnología, soporte, cursos y herramientas digitales para potenciar tu día a día.

📦 ¿Buscas algún producto, servicio o información en especial?`;
    }
    /**
     * Construir respuesta cuando no hay resultados
     */
    static buildNoResultsResponse(intent, message) {
        let response = '😅 No encontré productos exactos con esa búsqueda.\n\n';
        response += '💡 *Sugerencias:*\n';
        response += '🔹 Intenta con términos más generales\n';
        response += '🔹 Pregunta por categorías: "portátiles", "celulares", "cursos"\n';
        response += '🔹 Indica tu presupuesto: "portátiles hasta 2 millones"\n\n';
        response += '¿Qué tipo de producto te interesa? 🤔';
        return response;
    }
    /**
     * Construir respuesta de producto individual
     */
    static buildSingleProductResponse(product, intent) {
        const productInfo = {
            name: product.name,
            price: product.price,
            currency: product.currency || 'COP',
            specs: whatsapp_response_formatter_1.WhatsAppResponseFormatter.extractSpecs(product)
        };
        let response = whatsapp_response_formatter_1.WhatsAppResponseFormatter.formatSingleProduct(productInfo);
        // Agregar contexto adicional si hay
        if (product.description && product.description.length > 50) {
            response += '\n\n📝 *Descripción:*\n';
            response += product.description.substring(0, 200);
            if (product.description.length > 200) {
                response += '...';
            }
        }
        return response;
    }
    /**
     * Construir respuesta de comparación
     */
    static buildComparisonResponse(products, intent) {
        const product1 = {
            name: products[0].name,
            price: products[0].price,
            currency: products[0].currency || 'COP',
            specs: whatsapp_response_formatter_1.WhatsAppResponseFormatter.extractSpecs(products[0])
        };
        const product2 = {
            name: products[1].name,
            price: products[1].price,
            currency: products[1].currency || 'COP',
            specs: whatsapp_response_formatter_1.WhatsAppResponseFormatter.extractSpecs(products[1])
        };
        return whatsapp_response_formatter_1.WhatsAppResponseFormatter.formatProductComparison(product1, product2);
    }
    /**
     * Construir respuesta de lista de productos
     */
    static buildProductListResponse(products, intent) {
        const productInfos = products.map(p => ({
            name: p.name,
            price: p.price,
            currency: p.currency || 'COP',
            specs: whatsapp_response_formatter_1.WhatsAppResponseFormatter.extractSpecs(p)
        }));
        // Determinar título de categoría
        let categoryTitle = 'Productos';
        if (intent.category === 'PHYSICAL') {
            if (intent.context.includes('portátil') || intent.context.includes('laptop')) {
                categoryTitle = 'Portátiles';
            }
            else if (intent.context.includes('celular') || intent.context.includes('phone')) {
                categoryTitle = 'Celulares';
            }
            else if (intent.context.includes('tablet')) {
                categoryTitle = 'Tablets';
            }
        }
        else if (intent.category === 'DIGITAL') {
            categoryTitle = 'Cursos Digitales';
        }
        let response = whatsapp_response_formatter_1.WhatsAppResponseFormatter.formatProductList(productInfos, categoryTitle);
        // Agregar contexto adicional según la búsqueda
        if (intent.priceRange) {
            response += '\n\n💰 *Filtrado por presupuesto*';
            if (intent.priceRange.max) {
                response += `\nMostrando opciones hasta ${this.formatPrice(intent.priceRange.max)}`;
            }
        }
        return response;
    }
    /**
     * MÉTODO PRINCIPAL: Procesar consulta completa
     */
    static async processQuery(message, userId, conversationHistory = []) {
        try {
            // PASO 1: Analizar intención
            const intent = await this.analyzeIntent(message, conversationHistory);
            console.log('🧠 Intención detectada:', intent);
            // PASO 2: Buscar productos si es necesario
            let products = [];
            if (intent.type === 'product_search' ||
                intent.type === 'product_detail' ||
                intent.type === 'comparison') {
                products = await this.searchProducts(intent, userId);
                console.log(`📦 Productos encontrados: ${products.length}`);
            }
            // PASO 3: Construir respuesta
            const response = await this.buildIntelligentResponse(intent, products, message);
            return response;
        }
        catch (error) {
            console.error('❌ Error procesando consulta:', error);
            return '😅 Disculpa, tuve un problema procesando tu consulta. ¿Puedes intentar de nuevo?';
        }
    }
    // ============ MÉTODOS DE DETECCIÓN ============
    static isGreeting(message) {
        const greetings = [
            'hola', 'buenas', 'buenos dias', 'buenos días', 'buenas tardes',
            'buenas noches', 'hey', 'saludos', 'que tal', 'qué tal',
            'buen dia', 'buen día', 'buena tarde', 'buena noche',
            'hola muy buenas', 'hola buenas', 'hola buenos dias'
        ];
        // Si el mensaje es corto y contiene un saludo, es definitivamente un saludo
        if (message.length < 30) {
            return greetings.some(g => message.includes(g));
        }
        // Si el mensaje es más largo, verificar que EMPIECE con saludo
        return greetings.some(g => message.startsWith(g));
    }
    static isComparison(message) {
        const comparisonWords = ['comparar', 'diferencia', 'vs', 'versus', 'mejor',
            'cual es mejor', 'cuál es mejor', 'entre'];
        return comparisonWords.some(w => message.includes(w));
    }
    static isSpecificProduct(message) {
        // Detecta si menciona marca + modelo específico
        const brands = ['acer', 'asus', 'hp', 'dell', 'lenovo', 'samsung', 'apple',
            'xiaomi', 'huawei', 'lg', 'sony'];
        return brands.some(b => message.includes(b));
    }
    /**
     * Extraer keywords relevantes del mensaje para búsqueda
     */
    static extractKeywordsFromMessage(message) {
        const keywords = [];
        // Computadores/Laptops
        const computerKeywords = [
            'portatil', 'portátil', 'portatiles', 'laptop', 'laptops',
            'computador', 'computadora', 'computadores', 'pc', 'notebook'
        ];
        computerKeywords.forEach(kw => {
            if (message.includes(kw)) {
                keywords.push('computador');
                return;
            }
        });
        // Celulares
        const phoneKeywords = ['celular', 'telefono', 'teléfono', 'smartphone', 'movil', 'móvil'];
        phoneKeywords.forEach(kw => {
            if (message.includes(kw)) {
                keywords.push('celular');
                return;
            }
        });
        // Tablets
        const tabletKeywords = ['tablet', 'tableta', 'ipad'];
        tabletKeywords.forEach(kw => {
            if (message.includes(kw)) {
                keywords.push('tablet');
                return;
            }
        });
        // Monitores
        const monitorKeywords = ['monitor', 'pantalla'];
        monitorKeywords.forEach(kw => {
            if (message.includes(kw)) {
                keywords.push('monitor');
                return;
            }
        });
        // Cursos
        const courseKeywords = ['curso', 'cursos', 'capacitación', 'capacitacion'];
        courseKeywords.forEach(kw => {
            if (message.includes(kw)) {
                keywords.push('curso');
                return;
            }
        });
        // Megapacks
        const megapackKeywords = ['megapack', 'mega pack', 'pack'];
        megapackKeywords.forEach(kw => {
            if (message.includes(kw)) {
                keywords.push('megapack');
                return;
            }
        });
        return keywords;
    }
    static detectCategory(message) {
        // Normalizar mensaje (quitar acentos y espacios extra)
        const normalized = message
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
        // Computadores/Laptops (con variaciones y errores comunes)
        const computerKeywords = [
            'portatil', 'portátil', 'portatiles', 'laptop', 'laptops',
            'computador', 'computadora', 'pc', 'notebook', 'ultrabook',
            'compu', 'note', 'lap', 'ordenador'
        ];
        if (computerKeywords.some(kw => normalized.includes(kw))) {
            return 'PHYSICAL';
        }
        // Celulares/Teléfonos
        const phoneKeywords = [
            'celular', 'telefono', 'teléfono', 'movil', 'móvil',
            'smartphone', 'phone', 'cel', 'fono'
        ];
        if (phoneKeywords.some(kw => normalized.includes(kw))) {
            return 'PHYSICAL';
        }
        // Tablets
        const tabletKeywords = ['tablet', 'ipad', 'tableta'];
        if (tabletKeywords.some(kw => normalized.includes(kw))) {
            return 'PHYSICAL';
        }
        // Cursos/Digitales
        const digitalKeywords = [
            'curso', 'cursos', 'megapack', 'capacitacion', 'capacitación',
            'formacion', 'formación', 'clase', 'clases', 'tutorial',
            'ebook', 'libro digital', 'pdf'
        ];
        if (digitalKeywords.some(kw => normalized.includes(kw))) {
            return 'DIGITAL';
        }
        // Si menciona "producto" o "comprar" sin especificar, asumir PHYSICAL
        if (normalized.includes('producto') || normalized.includes('comprar') ||
            normalized.includes('vender') || normalized.includes('disponible')) {
            return 'PHYSICAL';
        }
        return null;
    }
    static extractPriceRange(message) {
        const range = {};
        // Detectar "hasta X"
        const hastaMatch = message.match(/hasta\s+(\d+(?:\.\d+)?)\s*(millones?|mil)?/i);
        if (hastaMatch) {
            let amount = parseFloat(hastaMatch[1]);
            if (hastaMatch[2]?.includes('millon')) {
                amount *= 1000000;
            }
            else if (hastaMatch[2]?.includes('mil')) {
                amount *= 1000;
            }
            range.max = amount;
        }
        // Detectar "desde X"
        const desdeMatch = message.match(/desde\s+(\d+(?:\.\d+)?)\s*(millones?|mil)?/i);
        if (desdeMatch) {
            let amount = parseFloat(desdeMatch[1]);
            if (desdeMatch[2]?.includes('millon')) {
                amount *= 1000000;
            }
            else if (desdeMatch[2]?.includes('mil')) {
                amount *= 1000;
            }
            range.min = amount;
        }
        // Detectar "entre X y Y"
        const entreMatch = message.match(/entre\s+(\d+(?:\.\d+)?)\s*y\s*(\d+(?:\.\d+)?)\s*(millones?|mil)?/i);
        if (entreMatch) {
            let min = parseFloat(entreMatch[1]);
            let max = parseFloat(entreMatch[2]);
            if (entreMatch[3]?.includes('millon')) {
                min *= 1000000;
                max *= 1000000;
            }
            else if (entreMatch[3]?.includes('mil')) {
                min *= 1000;
                max *= 1000;
            }
            range.min = min;
            range.max = max;
        }
        return Object.keys(range).length > 0 ? range : undefined;
    }
    static extractFeatures(message) {
        const features = [];
        // Procesadores
        if (message.includes('i5') || message.includes('intel 5'))
            features.push('i5');
        if (message.includes('i7') || message.includes('intel 7'))
            features.push('i7');
        if (message.includes('ryzen'))
            features.push('ryzen');
        // RAM
        if (message.includes('16gb') || message.includes('16 gb'))
            features.push('16GB');
        if (message.includes('8gb') || message.includes('8 gb'))
            features.push('8GB');
        // Almacenamiento
        if (message.includes('ssd'))
            features.push('SSD');
        if (message.includes('1tb') || message.includes('1 tb'))
            features.push('1TB');
        // Uso
        if (message.includes('gaming') || message.includes('juegos'))
            features.push('gaming');
        if (message.includes('diseño') || message.includes('edición'))
            features.push('diseño');
        if (message.includes('trabajo') || message.includes('oficina'))
            features.push('trabajo');
        return features;
    }
    static extractProductName(message) {
        // Extraer nombre de producto mencionado
        const words = message.split(' ');
        const brands = ['acer', 'asus', 'hp', 'dell', 'lenovo', 'samsung', 'apple'];
        for (let i = 0; i < words.length; i++) {
            if (brands.includes(words[i].toLowerCase())) {
                // Tomar marca + siguiente palabra (modelo)
                return words.slice(i, i + 3).join(' ');
            }
        }
        return message;
    }
    static extractComparisonDetails(message) {
        // Extraer detalles de comparación
        return {
            category: this.detectCategory(message) || undefined,
            features: this.extractFeatures(message)
        };
    }
    static formatPrice(price) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    }
}
exports.IntelligentProductQuerySystem = IntelligentProductQuerySystem;
