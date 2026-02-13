/**
 * OpenClaw Orchestrator Architect - v2.0
 * Este es el "Director de Orquesta" oficial basado en el framework OpenClaw.
 */

import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Función auxiliar para formatear resultados de productos
const formatProductResult = async (product: any, userId: string) => {
    // Dynamic imports for services
    const { MercadoPagoDynamicService } = await import('../mercadopago-dynamic-service');
    const { getOrCreatePayPalLink } = await import('../paypal-service');

    // Generar/Obtener links en paralelo
    const [mpResult, payPalUrl] = await Promise.all([
        MercadoPagoDynamicService.generatePaymentLink(product.id, userId).catch(() => ({ success: false, paymentUrl: null })),
        getOrCreatePayPalLink(product.id).catch(() => null)
    ]);

    let images: string[] = [];
    if (product.images) {
        try {
            const parsed = typeof product.images === 'string' && product.images.startsWith('[') ? JSON.parse(product.images) : product.images;
            images = Array.isArray(parsed) ? parsed : [product.images];
        } catch (e) {
            if (product.images.includes(',')) {
                images = product.images.split(',').map((img: string) => img.trim());
            } else if (product.images.startsWith('http')) {
                images = [product.images];
            }
        }
    }
    // Limpiar URLs vacías o placeholders
    images = images.filter((img: any) => typeof img === 'string' && img.startsWith('http'));

    return {
        success: true,
        data: {
            ...product,
            images: images.length > 0 ? images : null,
            // Prioridad: Link dinámico nuevo -> Link guardado en DB -> null
            paymentLink: (mpResult && mpResult.success) ? mpResult.paymentUrl : (product.paymentLinkMercadoPago || null),
            payPalLink: payPalUrl || product.paymentLinkPayPal || null,
            deliveryLink: product.deliveryLink || null,
            configurations: product.configurations || null
        }
    };
};

// Herramientas avanzadas del bot (Skills de OpenClaw v2.1)
export const TOOLS: any = {
    list_products_by_category: {
        name: 'list_products_by_category',
        description: '🔴 PRIORIDAD: USA ESTA cuando el usuario pregunta por CATEGORÍA GENERAL sin mencionar nombre completo de producto. Ejemplos: "cursos digitales?", "Curso digitales ?", "laptops?", "qué computadores tienes?", "muéstrame megapacks", "productos digitales?". Muestra 3-5 opciones para que el cliente elija. SIEMPRE usa esta si el mensaje NO contiene un nombre COMPLETO de producto.',
        execute: async (params: any, context: any) => {
            try {
                if (!params.searchTerm) return { success: false, message: 'No se envió término de búsqueda' };

                const searchTerm = params.searchTerm.toLowerCase();
                
                // 🎯 FILTRO CONTEXTUAL: Excluir productos digitales cuando se buscan periféricos físicos
                const peripheralKeywords = ['teclado', 'mouse', 'monitor', 'auriculares', 'audífonos', 'webcam', 'micrófono'];
                const isPeripheralSearch = peripheralKeywords.some(kw => searchTerm.includes(kw));
                
                let productsToSearch = context.products;
                
                if (isPeripheralSearch) {
                    // Excluir cursos y megapacks cuando se busca un periférico
                    productsToSearch = context.products.filter((p: any) => {
                        const tipo = (p.tipo_producto || '').toLowerCase();
                        const name = (p.name || '').toLowerCase();
                        const category = (p.category || '').toLowerCase();
                        const tags = (p.tags || '').toLowerCase();
                        
                        // Excluir si es curso, megapack o producto musical
                        const isDigitalCourse = tipo.includes('curso') || tipo.includes('digital') || 
                                               name.includes('curso') || name.includes('mega pack') || name.includes('megapack') ||
                                               category.includes('curso') || category.includes('digital') || category.includes('educación');
                        
                        const isMusicalProduct = name.includes('piano') || name.includes('guitarra') || name.includes('batería') ||
                                                tags.includes('piano') || tags.includes('guitarra') || tags.includes('música') || tags.includes('musica') ||
                                                tags.includes('instrumento');
                        
                        return !isDigitalCourse && !isMusicalProduct;
                    });
                    console.log(`[Skill] 🔍 Búsqueda de periférico: Filtrando ${context.products.length - productsToSearch.length} productos digitales/musicales`);
                }
                
                // 🎯 FILTRO DE ACCESORIOS: Excluir accesorios cuando se busca el producto principal
                const mainProductKeywords = ['portátil', 'portatil', 'laptop', 'computador', 'computadora', 'moto', 'motocicleta'];
                const isMainProductSearch = mainProductKeywords.some(kw => searchTerm.includes(kw));
                
                // NO filtrar si el usuario busca específicamente un accesorio (contiene "para")
                const isAccessorySearch = searchTerm.includes(' para ') || searchTerm.includes('base') || searchTerm.includes('soporte') || searchTerm.includes('funda');
                
                if (isMainProductSearch && !isAccessorySearch) {
                    const beforeFilter = productsToSearch.length;
                    // Excluir accesorios cuando se busca el producto principal
                    productsToSearch = productsToSearch.filter((p: any) => {
                        const name = (p.name || '').toLowerCase();
                        const description = (p.description || '').toLowerCase();
                        const searchText = `${name} ${description}`;
                        
                        // Lista de palabras que indican que es un accesorio
                        const accessoryIndicators = [
                            'base para', 'soporte para', 'funda para', 'bolso para', 'maletín para',
                            'cargador para', 'adaptador para', 'cable para', 'protector para',
                            'casco para', 'guantes para', 'kit para', 'accesorio para',
                            'mouse', 'ratón', 'teclado', 'audífonos', 'auriculares'
                        ];
                        
                        // Si el nombre contiene algún indicador de accesorio, excluirlo
                        const isAccessory = accessoryIndicators.some(indicator => searchText.includes(indicator));
                        
                        return !isAccessory;
                    });
                    
                    const filtered = beforeFilter - productsToSearch.length;
                    if (filtered > 0) {
                        console.log(`[Skill] 🔍 Búsqueda de producto principal: Filtrando ${filtered} accesorios`);
                    }
                }
                
                // 🎯 BÚSQUEDA FUZZY PARA MÚLTIPLES PRODUCTOS
                const Fuse = (await import('fuse.js')).default;
                const fuse = new Fuse(productsToSearch, {
                    threshold: 0.6,
                    keys: [
                        { name: 'name', weight: 0.5 },
                        { name: 'tags', weight: 0.3 },
                        { name: 'category', weight: 0.2 }
                    ]
                });

                const results = fuse.search(searchTerm).slice(0, 5); // Máximo 5 productos
                
                if (results.length === 0) {
                    console.log(`[Skill] ❌ No se encontraron productos para: "${searchTerm}"`);
                    return { success: false, message: 'No hay productos en esa categoría.' };
                }

                console.log(`[Skill] ✅ Encontrados ${results.length} productos para: "${searchTerm}"`);

                const products = results.map(r => ({
                    id: r.item.id,
                    name: r.item.name,
                    price: r.item.price,
                    description: r.item.description,
                    category: r.item.category,
                    images: r.item.images,
                    match: Math.round((1 - r.score!) * 100)
                }));

                return {
                    success: true,
                    data: {
                        searchTerm,
                        count: products.length,
                        products
                    }
                };
            } catch (error: any) {
                console.error('[Skill] Error en list_products_by_category:', error.message);
                return { success: false, message: error.message };
            }
        }
    },
    get_payment_info: {
        name: 'get_payment_info',
        description: 'Obtiene detalles de cuentas bancaria (BBVA) y Nequi para concretar la venta.',
        execute: async (params: any, context: any) => {
            let extraData: any = {};
            if (context.activeProduct) {
                console.log(`[Skill] 💳 Generando links dinámicos para producto activo: ${context.activeProduct.name}`);
                const formatted = await formatProductResult(context.activeProduct, context.userId);
                if (formatted.success) {
                    extraData = {
                        paymentLink: formatted.data.paymentLink,
                        payPalLink: formatted.data.payPalLink,
                        productName: context.activeProduct.name,
                        price: context.activeProduct.price
                    };
                }
            }

            return {
                success: true,
                data: {
                    ...extraData,
                    bank: {
                        name: process.env.BANK_NAME || 'BBVA',
                        account: process.env.BANK_ACCOUNT_NUMBER || '0616001940',
                        holder: process.env.BANK_ACCOUNT_HOLDER || 'TecnoVariedades D&S'
                    },
                    nequi: {
                        number: process.env.NEQUI_NUMBER || '3136174267'
                    }
                }
            };
        }
    },
    get_product_with_payment: {
        name: 'get_product_with_payment',
        description: '🟡 USA ESTA SOLO cuando el usuario menciona un NOMBRE COMPLETO y ESPECÍFICO de producto. Ejemplos: "Mega Pack 11", "Laptop Asus Vivobook 15", "Curso de Piano Avanzado". NO uses esta si pregunta por categoría general como "cursos" o "laptops".',
        execute: async (params: any, context: any) => {
            try {
                const searchId = params.productId || params.searchTerm;
                if (!searchId) return { success: false, message: 'No se envió término de búsqueda' };
                console.log(`[Skill] 🔍 Buscando producto específico para: "${searchId}"`);

                // 🎯 1. Intento de búsqueda directa por ID (Súper rápido)
                const directMatch = context.products.find((p: any) => p.id === searchId);
                if (directMatch) {
                    console.log(`[Skill] ✅ Encontrado por ID directo: ${directMatch.name}`);
                    return await formatProductResult(directMatch, context.userId);
                }
                
                // 🎯 2. BÚSQUEDA FUZZY AVANZADA (Si el ID falla o es un nombre)
                const Fuse = (await import('fuse.js')).default;
                const fuse = new Fuse(context.products, {
                    threshold: 0.7,
                    keys: [
                        { name: 'id', weight: 0.4 },
                        { name: 'name', weight: 0.6 },
                        { name: 'tags', weight: 0.2 }
                    ]
                });

                const results = fuse.search(searchId.toLowerCase());
                const product = results.length > 0 ? results[0].item : null;
                
                if (!product) {
                    console.log(`[Skill] ❌ No se encontró producto real para: "${searchId}"`);
                    return { success: false, message: 'Producto no existe en el catálogo real.' };
                }

                console.log(`[Skill] ✅ Encontrado en catálogo: ${product.name}`);
                return await formatProductResult(product, context.userId);
            } catch (error: any) {
                console.error('[Skill] Error crítico:', error.message);
                return { success: false, message: error.message };
            }
        }
    },

    get_business_knowledge: {
        name: 'get_business_knowledge',
        description: 'Obtiene el contexto completo del negocio (métodos de pago, políticas de envío, horarios, etc.)',
        execute: async (params: any, context: any) => {
            try {
                const { BusinessKnowledgeService } = await import('../business-knowledge-service');
                const knowledge = await BusinessKnowledgeService.getKnowledge(context.userId);
                return { success: true, data: knowledge };
            } catch (error: any) {
                console.error('[Tool] Error en get_business_knowledge:', error);
                return { success: false, message: error.message };
            }
        }
    },
    analyze_market: {
        name: 'analyze_market',
        description: 'Analiza la tendencia de precios y ofrece una recomendación de compra.',
        execute: async (params: any, context: any) => {
            return { success: true, data: "El mercado actual está en alta demanda para tecnología. ¡Es el momento perfecto para comprar!" };
        }
    },
    
    // 🧠 HERRAMIENTAS DE INTERPRETACIÓN SEMÁNTICA
    analyze_intent: {
        name: 'analyze_intent',
        description: '🧠 Analiza la intención del cliente cuando el mensaje es AMBIGUO o VAGO. Usa AI para entender QUÉ busca realmente. Ejemplos: "busco un teclado" (¿computadora o musical?), "algo para trabajar" (¿laptop o curso?), "necesito un regalo" (¿para quién?). NO uses si el mensaje es claro.',
        execute: async (params: any, context: any) => {
            try {
                const { SemanticInterpreterService } = await import('./semantic-interpreter');
                const analysis = await SemanticInterpreterService.analyzeIntent(
                    params.message || context.lastMessage,
                    context.conversationHistory || [],
                    context.userId
                );
                
                console.log(`[Tool] 🧠 Análisis de intención completado`);
                console.log(`  - Intención: ${analysis.primaryIntent.intent}`);
                console.log(`  - Confianza: ${analysis.primaryIntent.confidence.toFixed(2)}`);
                console.log(`  - Ambigüedad: ${analysis.ambiguityScore.toFixed(2)}`);
                console.log(`  - Requiere clarificación: ${analysis.requiresClarification}`);
                
                return {
                    success: true,
                    data: {
                        intent: analysis.primaryIntent.intent,
                        confidence: analysis.primaryIntent.confidence,
                        productType: analysis.primaryIntent.productType,
                        keywords: analysis.primaryIntent.keywords,
                        ambiguityScore: analysis.ambiguityScore,
                        requiresClarification: analysis.requiresClarification,
                        allInterpretations: analysis.interpretations.map(i => ({
                            intent: i.intent,
                            confidence: i.confidence,
                            productType: i.productType
                        }))
                    }
                };
            } catch (error: any) {
                console.error('[Tool] Error en analyze_intent:', error.message);
                return { success: false, message: error.message };
            }
        }
    },
    
    ask_clarification: {
        name: 'ask_clarification',
        description: '💬 Genera preguntas de clarificación cuando la intención es ambigua. Usa DESPUÉS de analyze_intent si requiresClarification=true. Genera máximo 2 preguntas específicas con opciones. Ejemplos: "¿Teclado para escribir o musical?", "¿Para qué tipo de trabajo?"',
        execute: async (params: any, context: any) => {
            try {
                // Necesita el análisis previo
                if (!params.intentAnalysis) {
                    return { success: false, message: 'Se requiere análisis de intención previo (usa analyze_intent primero)' };
                }
                
                const { ClarificationEngine } = await import('./clarification-engine');
                const questions = ClarificationEngine.generateQuestions(
                    params.intentAnalysis,
                    params.maxQuestions || 2
                );
                
                if (questions.length === 0) {
                    return { success: false, message: 'No se necesitan preguntas de clarificación' };
                }
                
                const questionText = ClarificationEngine.formatQuestionForUser(questions);
                
                console.log(`[Tool] 💬 ${questions.length} preguntas de clarificación generadas`);
                
                return {
                    success: true,
                    data: {
                        questionText,
                        questions: questions.map(q => ({
                            question: q.question,
                            options: q.options,
                            type: q.type
                        }))
                    }
                };
            } catch (error: any) {
                console.error('[Tool] Error en ask_clarification:', error.message);
                return { success: false, message: error.message };
            }
        }
    },
    
    semantic_product_search: {
        name: 'semantic_product_search',
        description: '🎯 Búsqueda SEMÁNTICA de productos SIN depender de tags. Usa AI para encontrar productos relevantes basándose en la INTENCIÓN del cliente. Mejor que búsqueda por keywords cuando: 1) El cliente usa lenguaje natural ("algo para trabajar"), 2) Hay errores ortográficos ("curzo de piyano"), 3) Búsqueda conceptual ("para aprender música"). Requiere intención del cliente.',
        execute: async (params: any, context: any) => {
            try {
                if (!params.intent) {
                    return { success: false, message: 'Se requiere intención del cliente (usa analyze_intent primero)' };
                }
                
                const { ProductMatcherService } = await import('./product-matcher');
                
                // Construir criterios de búsqueda
                const criteria: any = {
                    intent: {
                        intent: params.intent,
                        confidence: params.confidence || 0.7,
                        productType: params.productType || 'ambiguous',
                        keywords: params.keywords || [],
                        reasoning: 'Búsqueda semántica'
                    }
                };
                
                if (params.useCase) criteria.useCase = params.useCase;
                if (params.budget) criteria.budget = params.budget;
                
                const matches = await ProductMatcherService.matchProducts(
                    criteria,
                    context.products,
                    params.limit || 5
                );
                
                if (matches.length === 0) {
                    console.log(`[Tool] 🎯 No se encontraron productos semánticamente`);
                    return { success: false, message: 'No se encontraron productos relevantes' };
                }
                
                console.log(`[Tool] 🎯 ${matches.length} productos encontrados semánticamente`);
                
                // Formatear resultados
                const products = matches.map(m => ({
                    id: m.product.id,
                    name: m.product.name,
                    price: m.product.price,
                    description: m.product.description,
                    category: m.product.category,
                    images: m.product.images,
                    relevanceScore: m.relevanceScore,
                    matchReasons: m.matchReasons
                }));
                
                return {
                    success: true,
                    data: {
                        count: products.length,
                        products,
                        searchIntent: params.intent
                    }
                };
            } catch (error: any) {
                console.error('[Tool] Error en semantic_product_search:', error.message);
                return { success: false, message: error.message };
            }
        }
    }
};

class OpenClawOrchestrator {
    conversationHistory: Map<string, any[]>;
    maxHistory: number;
    apiKeys: string[];
    currentKeyIndex: number;
    keyFailures: Map<string, { count: number; lastFail: number }>;

    constructor() {
        this.conversationHistory = new Map();
        this.maxHistory = 20;
        
        // 🔑 SISTEMA DE ROTACIÓN DE API KEYS
        this.apiKeys = [
            process.env.GROQ_API_KEY,
            process.env.GROQ_API_KEY_2,
            process.env.GROQ_API_KEY_3,
            process.env.GROQ_API_KEY_4,
            process.env.GROQ_API_KEY_5
        ].filter(Boolean) as string[]; // Filtrar keys vacías
        
        this.currentKeyIndex = 0;
        this.keyFailures = new Map(); // Rastrear fallos por key
        
        console.log(`[OpenClaw] 🔑 ${this.apiKeys.length} API keys disponibles para rotación`);
    }
    
    /**
     * Obtiene la siguiente API key disponible
     * Salta keys que han fallado recientemente
     */
    getNextApiKey() {
        const now = Date.now();
        const maxAttempts = this.apiKeys.length;
        
        for (let i = 0; i < maxAttempts; i++) {
            const key = this.apiKeys[this.currentKeyIndex];
            const failures = this.keyFailures.get(key) || { count: 0, lastFail: 0 };
            
            // Si la key falló hace menos de 5 minutos, saltarla
            if (failures.count > 0 && (now - failures.lastFail) < 5 * 60 * 1000) {
                console.log(`[OpenClaw] ⏭️ Saltando key ${this.currentKeyIndex + 1} (cooldown activo)`);
                this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
                continue;
            }
            
            return { key, index: this.currentKeyIndex };
        }
        
        // Si todas las keys están en cooldown, usar la primera de todos modos
        console.log(`[OpenClaw] ⚠️ Todas las keys en cooldown, usando key 1`);
        return { key: this.apiKeys[0], index: 0 };
    }
    
    /**
     * Marca una key como fallida
     */
    markKeyAsFailed(key: string) {
        const failures = this.keyFailures.get(key) || { count: 0, lastFail: 0 };
        failures.count++;
        failures.lastFail = Date.now();
        this.keyFailures.set(key, failures);
        
        console.log(`[OpenClaw] ❌ Key ${this.currentKeyIndex + 1} marcada como fallida (${failures.count} fallos)`);
    }
    
    /**
     * Rota a la siguiente key
     */
    rotateToNextKey() {
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
        console.log(`[OpenClaw] 🔄 Rotando a key ${this.currentKeyIndex + 1}/${this.apiKeys.length}`);
    }

    async processMessage(messageText: string, from: string, context: any) {
        console.log(`[Architect] 🧠 Iniciando Modo Ultra Inteligente para ${from}...`);
        
        const currentStage = context.currentStage || 'saludo';
        if (!this.conversationHistory.has(from)) {
            this.conversationHistory.set(from, []);
        }
        const history = this.conversationHistory.get(from)!;

        // 1. Cargar Cerebro
        let brainContext = '';
        try {
            const { BusinessKnowledgeService } = await import('../business-knowledge-service');
            const knowledge = await BusinessKnowledgeService.getKnowledge(context.userId);
            brainContext = BusinessKnowledgeService.formatForPrompt(knowledge);
        } catch (e) { /* ignore */ }

        // 🏷️ CARGAR MAPA DE CATEGORÍAS
        let categoryMap = '';
        try {
            const { CategoryManagementService } = await import('../category-management-service');
            categoryMap = await CategoryManagementService.generateCategoryMapForPrompt(context.userId);
        } catch (e) { /* ignore */ }

        // 2. Pre-búsqueda INTELIGENTE
        let catalogHints = 'No hay coincidencias.';
        let isGeneralSearch = false;
        
        // Detectar si es búsqueda GENERAL por categoría (palabras clave sin nombres específicos)
        const generalKeywords = ['curso', 'cursos', 'digital', 'digitales', 'laptop', 'laptops', 'computador', 'computadores', 'megapack', 'megapacks', 'moto', 'motos', 'producto', 'productos', 'opciones', 'tienes', 'muéstrame', 'qué', 'cuáles', 'busco', 'necesito', 'teclado', 'teclados', 'mouse', 'monitor', 'impresora'];
        const specificIndicators = ['mega pack 11', 'mega pack 1', 'megapack 11', 'laptop asus', 'moto auteco', 'curso de piano', 'pack de'];
        const msgLower = messageText.toLowerCase().trim();
        
        // Es búsqueda general si:
        // 1. Contiene palabras clave generales
        // 2. NO contiene indicadores específicos (nombres completos de productos)
        // 3. Es una pregunta corta (máximo 5 palabras)
        const hasGeneralKeyword = generalKeywords.some(kw => msgLower.includes(kw));
        const hasSpecificIndicator = specificIndicators.some(ind => msgLower.includes(ind));
        const wordCount = msgLower.replace(/[?¿!¡.,]/g, '').split(' ').filter(w => w.length > 0).length;
        const isShortQuery = wordCount <= 5;
        
        isGeneralSearch = hasGeneralKeyword && !hasSpecificIndicator && isShortQuery;
        
        console.log(`[Architect] 🔍 Análisis búsqueda: "${messageText}" | General: ${isGeneralSearch} | Palabras: ${wordCount}`);
        
        try {
            const Fuse = (await import('fuse.js')).default;
            const fuse = new Fuse(context.products, { threshold: 0.6, keys: ['name', 'tags', 'description', 'category'] });
            const hints = fuse.search(messageText).slice(0, 8); // Aumentar a 8 para mejor contexto
            
            if (hints.length > 0) {
                if (isGeneralSearch) {
                    // Para búsquedas generales, mostrar categorías Y cantidad de productos
                    const categoryCount: any = {};
                    hints.forEach(h => {
                        const cat = h.item.tipo_producto || h.item.category || 'Sin categoría';
                        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
                    });
                    const categoryInfo = Object.entries(categoryCount)
                        .map(([cat, count]) => `${cat} (${count} productos)`)
                        .join(', ');
                    catalogHints = `🔍 BÚSQUEDA GENERAL DETECTADA\n📦 Categorías disponibles: ${categoryInfo}\n⚠️ IMPORTANTE: Usar 'list_products_by_category' para mostrar LISTA de opciones`;
                } else {
                    // Para búsquedas específicas, mostrar productos individuales
                    catalogHints = `🎯 PRODUCTOS ESPECÍFICOS ENCONTRADOS:\n` + 
                        hints.map(h => `• ID: ${h.item.id} | NOMBRE: ${h.item.name} | TIPO: ${h.item.tipo_producto || 'N/A'}`).join('\n');
                }
            }
        } catch (e) { /* silent */ }

        // 3. Razonamiento
        const analysis = await this._think(messageText, history, brainContext, categoryMap, catalogHints, { ...context, currentStage });
        console.log(`[Architect] 💡 Análisis: ${analysis.reasoning}`);
        
        // 🎯 NUEVA LÓGICA: Si hay respuesta sugerida (preguntas de calificación), usarla directamente
        if (analysis.suggestedResponse) {
            console.log('[Architect] 💬 Usando respuesta conversacional sugerida (AIDA)');
            history.push({ role: 'user', content: messageText });
            history.push({ role: 'assistant', content: analysis.suggestedResponse });
            
            if (history.length > this.maxHistory * 2) {
                this.conversationHistory.set(from, history.slice(-this.maxHistory * 2));
            }

            return {
                text: analysis.suggestedResponse,
                success: true,
                media: null,
                toolData: null,
                isSpecific: false,
                nextStage: 'calificando_necesidades' // Nuevo stage para tracking
            };
        }
        
        let toolData: any = null;
        let nextStage = currentStage;

        if (analysis.toolToUse && TOOLS[analysis.toolToUse]) {
            console.log(`[Architect] 🛠️ Ejecutando Skill: ${analysis.toolToUse}`);
            try {
                const result = await TOOLS[analysis.toolToUse].execute(analysis.toolParams, context);
                if (result && result.success) {
                    toolData = result.data;
                    console.log(`[Architect] ✅ Skill completado con éxito`);
                    
                    // Transiciones automáticas
                    if (analysis.toolToUse === 'get_product_with_payment') nextStage = 'viendo_producto';
                    if (analysis.toolToUse === 'list_products_by_category') nextStage = 'buscando_producto';
                    if (analysis.toolToUse === 'get_payment_info') nextStage = 'pago';
                } else {
                    console.log(`[Architect] ⚠️ Skill no encontró resultados`);
                }
            } catch (e: any) { console.error(`[Architect] ❌ Error en skill:`, e.message); }
        }

        // Reglas de Oro KENNETH
        const msg = messageText.toLowerCase();
        if (msg.includes('comprar') || msg.includes('interesa') || msg.includes('lo quiero')) nextStage = 'interes_compra';
        if (msg.includes('gracias') || msg.includes('listo')) nextStage = 'cerrado';

        // 💾 4. ACTUALIZAR HISTORIAL
        history.push({ role: 'user', content: messageText });
        
        // 4. Generatriz de Respuesta
        let response = await this._generateResponse(messageText, history, brainContext, toolData, nextStage);
        
        // Guardar respuesta en historial
        history.push({ role: 'assistant', content: response });
        if (history.length > this.maxHistory * 2) {
            this.conversationHistory.set(from, history.slice(-this.maxHistory * 2));
        }

        // 🛠️ REEMPLAZO FORZADO (Seguridad OpenClaw)
        // Esto asegura que si la IA dejó un placeholder por error, lo llenamos nosotros con los datos reales
        if (toolData && (toolData.id || toolData.name)) {
            const specs = toolData.configurations || 'Ver descripción';
            // Safe safe check for price
            const price = typeof toolData.price === 'number' 
                ? toolData.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) 
                : toolData.price;
            
            response = response
                .replace(/{name}/g, toolData.name || 'Producto')
                .replace(/{price}/g, price || 'Consultar')
                .replace(/{description}/g, toolData.description || '')
                .replace(/{configurations}/g, specs)
                .replace(/{tipo_entrega}/g, toolData.tipo_entrega || 'Envío a domicilio')
                .replace(/{paymentLink}/g, toolData.paymentLink ? `🔗 MercadoPago: ${toolData.paymentLink}` : '💳 MercadoPago: Consultar')
                .replace(/{payPalLink}/g, toolData.payPalLink ? `🔗 PayPal/Internacional: ${toolData.payPalLink}` : '');
        }

        // 5. Multimedia
        let media: any = null;
        let isSpecific = false;
        if (toolData) {
            let imageSource = null;
            if (toolData.images) {
                imageSource = toolData.images;
            } else if (toolData.products && toolData.products[0]?.images) {
                imageSource = toolData.products[0].images;
            } else if (toolData.product?.images) {
                imageSource = toolData.product.images;
            }

            if (imageSource) {
                if (Array.isArray(imageSource)) {
                    media = imageSource;
                } else {
                    try {
                        const parsed = (typeof imageSource === 'string' && imageSource.startsWith('[')) ? JSON.parse(imageSource) : imageSource;
                        media = Array.isArray(parsed) ? parsed : [imageSource];
                    } catch (e) { 
                        media = [imageSource]; 
                    }
                }
                console.log(`[Architect] 📸 Media detectada: ${media.length} imágenes`);
            }
            if (toolData.id) isSpecific = true;
        }

        return { text: response, success: true, media, toolData, isSpecific, nextStage };
    }

    async _think(message: string, history: any[], brainContext: string, categoryMap: string, catalogHints: string, context: any) {
        const stage = context.currentStage || 'saludo';
        
        // 🎯 NUEVA ESTRATEGIA: Usar ConversationStrategyService para determinar enfoque
        const { ConversationStrategyService } = await import('./conversation-strategy');
        const strategy = ConversationStrategyService.determineStrategy(
            message,
            context.products || [],
            history
        );

        // Si la estrategia dice que debemos hacer preguntas primero
        if (strategy.shouldAskQuestions && strategy.suggestedQuestions) {
            console.log('[Architect] 🎯 Estrategia AIDA: Hacer preguntas de calificación primero');
            return {
                reasoning: strategy.reasoning,
                toolToUse: null,
                suggestedResponse: ConversationStrategyService.generateQualificationResponse(strategy.suggestedQuestions)
            };
        }

        // Si la estrategia ya determinó la herramienta, usarla
        if (strategy.toolToUse) {
            console.log(`[Architect] 🎯 Estrategia determinada: ${strategy.toolToUse}`);
            
            const searchTerm = message.toLowerCase()
                .replace(/[?¿!¡]/g, '')
                .trim();

            return {
                reasoning: strategy.reasoning,
                toolToUse: strategy.toolToUse,
                toolParams: strategy.toolToUse === 'list_products_by_category' 
                    ? { searchTerm } 
                    : { productId: searchTerm }
            };
        }

        // Fallback: Usar AI para decidir (casos edge)
        const systemPrompt = `Eres el Cerebro Estratégico de OpenClaw. Analiza y elige la herramienta adecuada.

    ### 📍 ESTADO ACTUAL: ${stage}

    ### 📋 CONTEXTO NEGOCIO:
    ${brainContext}

    ### 🏷️ CATÁLOGO HINTS (Productos reales disponibles):
    ${catalogHints}

    ### 🛠️ TOOLS DISPONIBLES:
    ${Object.values(TOOLS).map((t: any) => `- ${t.name}: ${t.description}`).join('\n')}

    ### 🚨 REGLAS ANTI-INVENCIÓN (CRÍTICO):
    1. **UBICACIÓN REAL**: Centro Comercial El Diamante 2, Local 158, Cali, Valle del Cauca
    2. **HORARIOS**: NUNCA inventes horarios - SIEMPRE di "Consultar disponibilidad por WhatsApp"
    3. **NUNCA INVENTES**: direcciones, calles, avenidas, horarios - usa solo información real

    ### 💳 REGLAS DE PAGO Y ENTREGA POR TIPO DE PRODUCTO:

    **PRODUCTOS DIGITALES** (Megapack, Cursos, Productos Digitales):
    - ✅ SOLO pago virtual (MercadoPago/PayPal)
    - ✅ Entrega INMEDIATA por Drive/Correo/WhatsApp
    - ❌ NO retiro en tienda (es digital)
    - ⚠️ NO incluyen certificado
    - 🎬 100% Pregrabados

    **PRODUCTOS FÍSICOS - TECNOLOGÍA** (Computadores, Laptops, Impresoras, Teclados, Mouse):
    - ✅ Pago virtual (MercadoPago/PayPal) O Contraentrega
    - ✅ Envío a domicilio O Retiro en tienda (CC El Diamante 2, Local 158, Cali)
    - 📦 Pregunta PRIMERO: "¿Prefieres envío a domicilio o retiro en tienda?"

    **PRODUCTOS DROPSHIPPING**:
    - ✅ Contraentrega O Pago virtual
    - ✅ SOLO envío a domicilio
    - ❌ NO retiro en tienda

    ### 🚀 REGLAS PARA ELEGIR HERRAMIENTA (CRÍTICO):

    **🎯 PASO 1: Identifica el tipo de mensaje**

    Lee el mensaje del usuario y determina:

    **MENSAJE AMBIGUO/VAGO** → USA 'analyze_intent' PRIMERO:
    - Usuario usa lenguaje vago o ambiguo
    - Ejemplos que REQUIEREN análisis semántico:
      ✅ "busco un teclado" → analyze_intent (¿computadora o musical?)
      ✅ "algo para trabajar" → analyze_intent (¿laptop, curso, software?)
      ✅ "necesito un regalo" → analyze_intent (¿para quién? ¿qué le gusta?)
      ✅ "curzo de piyano" → analyze_intent (corregir ortografía y entender)
      ✅ "para aprender" → analyze_intent (¿qué quiere aprender?)
    - Después de analyze_intent:
      * Si requiresClarification=true → USA 'ask_clarification'
      * Si requiresClarification=false → USA 'semantic_product_search' con la intención detectada

    **BÚSQUEDA GENERAL CLARA** → USA 'list_products_by_category':
    - Usuario pregunta por CATEGORÍA sin mencionar nombre específico
    - Ejemplos:
      ✅ "cursos digitales?" → list_products_by_category (searchTerm: "cursos digitales")
      ✅ "laptops?" → list_products_by_category (searchTerm: "laptops")
      ✅ "megapacks?" → list_products_by_category (searchTerm: "megapacks")

    **BÚSQUEDA ESPECÍFICA** → USA 'get_product_with_payment':
    - Usuario menciona un NOMBRE COMPLETO que aparece en "CATÁLOGO HINTS"
    - Ejemplos:
      ✅ "Mega Pack 11" → get_product_with_payment (productId: "Mega Pack 11")
      ✅ "Laptop Asus Vivobook" → get_product_with_payment (productId: "Laptop Asus Vivobook")

    **🎯 PASO 2: Otras herramientas**
    - **Pagos**: Si pregunta cómo pagar → 'get_payment_info'
    - **Chat simple**: Solo saludos/despedidas → toolToUse: null

    **🧠 FLUJO DE HERRAMIENTAS SEMÁNTICAS:**
    1. analyze_intent (detecta intención y ambigüedad)
    2. ask_clarification (si es ambiguo, genera preguntas)
    3. semantic_product_search (busca productos por intención, no por tags)

    **⚠️ CUÁNDO USAR HERRAMIENTAS SEMÁNTICAS:**
    - Mensaje vago o ambiguo
    - Errores ortográficos
    - Lenguaje natural ("algo para...", "necesito...")
    - Búsqueda conceptual ("para aprender", "para regalo")

    Responde SOLO JSON:
    { 
      "reasoning": "Por qué elegí esta herramienta",
      "toolToUse": "nombre_o_null", 
      "toolParams": { /* parámetros según la herramienta */ } 
    }`;

            const response = await this._callAI(systemPrompt, history, `MENSAJE: "${message}"`);
            try {
                // Limpiador de JSON avanzado
                let cleanJson = response.trim();
                if (cleanJson.includes('{')) {
                    cleanJson = cleanJson.substring(cleanJson.indexOf('{'), cleanJson.lastIndexOf('}') + 1);
                }
                return JSON.parse(cleanJson);
            } catch (e) {
                console.warn('[Architect] ⚠️ Error parseando razonamiento, fallback a respuesta directa');
                return { reasoning: "Respuesta directa por falta de claridad en intención.", toolToUse: null };
            }
        }




    async _generateResponse(userMessage: string, history: any[], brainContext: string, toolData: any, stage: string) {
        let soul = '';
        try {
            soul = fs.readFileSync(path.join(process.cwd(), '.openclaw-workspace', 'SOUL.md'), 'utf-8');
        } catch (e) {
            soul = 'Eres David, un asistente de ventas profesional y amable.';
        }
        
        const isProductList = toolData && toolData.products && Array.isArray(toolData.products);
        
        let systemPrompt = `
${soul}

### 🏠 ESTADO ACTUAL: ${stage}
${this._getStageInstruction(stage)}

### 🏢 CONTEXTO:
${brainContext}
`;

        if (isProductList) {
            const productCount = toolData.products.length;
            const productsToShow = toolData.products.slice(0, 5); // Mostrar hasta 5 productos
            
            systemPrompt += `
### asesorando_producto (MODO LISTA DE OPCIONES):
El cliente preguntó por una CATEGORÍA GENERAL. Debes mostrar una LISTA de opciones para que elija.

PRODUCTOS ENCONTRADOS (${productCount} total):
${toolData.products.map((p: any, i: number) => {
    const price = typeof p.price === 'number' ? p.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) : `$${p.price}`;
    return `${i+1}. ${p.name} - ${price}`;
}).join('\n')}

FORMATO OBLIGATORIO (USA ESTE EXACTO):
¡Claro! Tenemos ${productCount} opciones disponibles:

━━━━━━━━━━━━━━━━━━
${productsToShow.map((p: any, i: number) => {
    const price = typeof p.price === 'number' ? p.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) : `$${p.price}`;
    return `${i+1}️⃣ *${p.name}*\n   💰 ${price}`;
}).join('\n\n')}
━━━━━━━━━━━━━━━━━━

¿Cuál te interesa más? Puedo darte todos los detalles 🦞🔥

REGLAS CRÍTICAS:
- NO inventes productos que no están en la lista
- NO des detalles de UN solo producto, muestra la LISTA completa
- USA los separadores ━━━━━━━━━━━━━━━━━━
- Mantén el formato con números y emojis
- Si el cliente elige uno, ENTONCES usa get_product_with_payment
`;
        } else if (toolData && (toolData.id || toolData.name)) {
            const isDigital = toolData.category === 'DIGITAL' || toolData.tipo_producto === 'digital' || toolData.tipo_producto === 'curso';
            
            systemPrompt += `
### viendo_producto (CARD PROFESIONAL):
REGLA HARD-ENFORCED: TU RESPUESTA DEBE SER ÚNICAMENTE LA CARD. NO ESCRIBAS INTRODUCCIÓN NI CONCLUSIÓN. EMPIEZA DIRECTO CON EL EMOJI.

DATOS DEL PRODUCTO REAL:
${JSON.stringify(toolData, null, 2)}

---
${isDigital ? `
OBLIGATORIO (FORMATO DIGITAL/MEGAPACK/CURSO):
🎹 *{name}*
💰 Precio: {price}
🎬 Formato: 100% Pregrabado / Drive
📲 Entrega: Correo / WhatsApp
⚠️ Diploma: No incluye certificado

━━━━━━━━━━━━━━━━━━
📋 *Descripción*
{description}
━━━━━━━━━━━━━━━━━━

{paymentLink}
{payPalLink}

🛡️ Garantía: 7 días de Satisfacción | 📦 Entrega: Link de Acceso
📩 ¿Deseas comprarlo y recibir el acceso ahora mismo?
` : `
OBLIGATORIO (FORMATO TECNOLOGÍA/FÍSICO):
💻 *{name}*
💰 Precio: {price}
📦 Stock: Disponible | 🚚 Entrega: {tipo_entrega}
⚙️ Specs: {configurations}

━━━━━━━━━━━━━━━━━━
📋 *Descripción*
{description}
━━━━━━━━━━━━━━━━━━

📩 ¿Te lo envío ya mismo o tienes alguna duda?
`}
`;
        } else if (stage === 'pago' && toolData) {
            systemPrompt += `
### pago (CIERRE):
REGLA HARD-ENFORCED: TU RESPUESTA DEBE SER ÚNICAMENTE LA CARD. NO ESCRIBAS PÁRRAFOS LARGOS.

DATOS:
${JSON.stringify(toolData, null, 2)}

FORMATO OBLIGATORIO:
¡Excelente elección! Aquí tienes los datos para concretar tu pedido:

━━━━━━━━━━━━━━━━━━
🏦 *Transferencia Bancaria*
Banco: BBVA
Cuenta Ahorros: 0616001940
Titular: TecnoVariedades D&S

📱 *Nequi / Daviplata*
Número: 3136174267

💰 *Links de Pago*
{paymentLink}
{payPalLink}
━━━━━━━━━━━━━━━━━━

¿Me confirmas cuando realices el pago para procesar tu envío de inmediato? 🦞🔥
`;
        } else {
            systemPrompt += `
### 💬 CHARLA GENERAL:
Responde como David, mantén la conversación viva pero guía al usuario a que busque algo. NO INVENTES SPECS. SI QUIERE COMPRAR ALGO, PIDE QUE TE DIGA EL NOMBRE DEL PRODUCTO.
`;
        }

        systemPrompt += `
---
🚀 **ULTIMÁTUM DE FORMATO PARA DAVID (CRÍTICO)**:
1. SI HAY DATOS DE PRODUCTO (toolData), DEBES USAR LA CARD CON SEPARADORES OBLIGATORIAMENTE.
2. NO ESCRIBAS INTRODUCCIONES. EMPIEZA DIRECTO CON LA CARD O EL SALUDO CORTO.
3. EL SEPARADOR ES ESTE: ━━━━━━━━━━━━━━━━━━
4. USA LOS EMOJIS INDICADOS.
5. SI NO CUMPLES EL FORMATO, EL SISTEMA OPENCLAW FALLARÁ.

🚨 **REGLAS ANTI-INVENCIÓN (OBLIGATORIO)**:
- **UBICACIÓN REAL**: Centro Comercial El Diamante 2, Local 158, Cali, Valle del Cauca
- **NUNCA USES**: [direccion], [ubicación], Calle 123, Avenida 45, Bogotá, ni ninguna dirección inventada
- **HORARIOS**: NUNCA inventes horarios - di "Consultar disponibilidad por WhatsApp: +57 304 274 8687"
- **PRODUCTOS DIGITALES**: NO menciones retiro en tienda - solo entrega por Drive/Correo/WhatsApp
- **PRODUCTOS FÍSICOS**: Pregunta PRIMERO si quiere envío o retiro antes de dar opciones

**EJEMPLO CORRECTO** si preguntan dónde ver productos:
"Puedes:
📍 **Visitar nuestra tienda**: Centro Comercial El Diamante 2, Local 158, Cali
🛍 **Ver nuestro catálogo**: Te puedo mostrar los productos disponibles
¿Qué prefieres?"

**EJEMPLO INCORRECTO** (NUNCA HAGAS ESTO):
"Estamos en [direccion]" ❌
"Calle 123, Avenida 45, Bogotá" ❌
"Lunes a Viernes 9am-6pm" ❌
---
`;

        return await this._callAI(systemPrompt, history, userMessage);
    }

    _getStageInstruction(stage: string) {
        const stages: any = {
            'saludo': 'Saluda con punch y pregunta qué busca hoy.',
            'buscando_producto': 'Muestra opciones y ayuda a filtrar. No satures, sé un asesor.',
            'viendo_producto': 'Vende los beneficios del producto actual. Usa la CARD profesional.',
            'interes_compra': 'El cliente quiere comprar. Confirma su interés y menciona que enviarás métodos de pago.',
            'pago': 'Muestra las cuentas bancarias y links de pago. Guíalo al cierre.',
            'confirmacion': 'Pide datos de envío: Ciudad, Dirección, Nombre y Teléfono.',
            'cerrado': 'Agradece la compra y confirma que el pedido está en proceso.'
        };
        return stages[stage] || stages['saludo'];
    }

    async _callAI(systemPrompt: string, history: any[], message: string) {
        // Lista de modelos en orden de preferencia (del más potente al más económico)
        const models = [
            'llama-3.1-8b-instant',     // Más rápido y económico
            'llama-3.3-70b-versatile',  // Más potente pero consume más tokens
            'mixtral-8x7b-32768'        // Alternativa si los otros fallan
        ];
        
        // Intentar con cada modelo
        for (const model of models) {
            // Intentar con cada API key disponible
            for (let keyAttempt = 0; keyAttempt < this.apiKeys.length; keyAttempt++) {
                const { key, index } = this.getNextApiKey();
                
                try {
                    const groq = new Groq({ apiKey: key });
                    
                    const response = await groq.chat.completions.create({
                        model: model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            ...history,
                            { role: 'user', content: message }
                        ],
                        temperature: 0.6,  // Reducido de 0.7 para respuestas más rápidas
                        max_tokens: 800,   // Reducido de 1024 para respuestas más concisas
                        top_p: 0.9,        // Agregado para mejor calidad
                        stream: false      // Sin streaming para respuesta directa
                    }) as any;

                    // ✅ ÉXITO - Limpiar contador de fallos para esta key
                    if (this.keyFailures.has(key)) {
                        this.keyFailures.delete(key);
                    }
                    
                    if (model !== models[0] || index !== 0) {
                        console.log(`[OpenClaw] ℹ️ Usando modelo ${model} con key ${index + 1}/${this.apiKeys.length}`);
                    }
                    
                    return response.choices[0].message.content || "Error generando respuesta";
                    
                } catch (error: any) {
                    const isRateLimit = error.message?.includes('rate_limit_exceeded') || 
                                       error.message?.includes('429') ||
                                       error.status === 429;
                    
                    if (isRateLimit) {
                        console.log(`[OpenClaw] ⚠️ Rate limit en modelo ${model} con key ${index + 1}`);
                        
                        // Marcar key como fallida
                        this.markKeyAsFailed(key);
                        
                        // Rotar a la siguiente key
                        this.rotateToNextKey();
                        
                        // Si aún hay más keys, intentar con la siguiente
                        if (keyAttempt < this.apiKeys.length - 1) {
                            console.log(`[OpenClaw] 🔄 Intentando con siguiente key...`);
                            continue; // Probar siguiente key con el mismo modelo
                        }
                        
                        // Si se agotaron todas las keys, probar siguiente modelo
                        if (model !== models[models.length - 1]) {
                            console.log(`[OpenClaw] 🔄 Todas las keys agotadas, probando modelo ${models[models.indexOf(model) + 1]}...`);
                            break; // Salir del loop de keys para probar siguiente modelo
                        }
                    } else {
                        // Error diferente a rate limit
                        console.error(`[OpenClaw] ❌ Error con modelo ${model} y key ${index + 1}:`, error.message);
                        
                        // Si no es rate limit, probar siguiente modelo directamente
                        if (model !== models[models.length - 1]) {
                            break;
                        }
                    }
                }
            }
        }
        
        // 🛡️ 4. ÚLTIMO RECURSO: OLLAMA LOCAL (Segundo Recurso)
        console.log('[OpenClaw] 🛡️ Verificando disponibilidad de Ollama...');
        try {
            const { OllamaService } = await import('../ollama-service');
            const isAvailable = await OllamaService.isAvailable();
            console.log(`[OpenClaw] 🤖 Ollama disponible: ${isAvailable}`);
            
            if (isAvailable) {
                console.log('[OpenClaw] 🚀 Generando respuesta con Ollama...');
                const ollamaResponse = await OllamaService.generateResponse({
                    systemPrompt,
                    messages: [
                        ...history,
                        { role: 'user', content: message }
                    ]
                });
                
                if (ollamaResponse && ollamaResponse.text) {
                    console.log('[OpenClaw] ✅ Rescatado por Ollama Local');
                    return ollamaResponse.text;
                }
            }
        } catch (ollamaError: any) {
            console.error('[OpenClaw] ❌ Fallo también Ollama:', ollamaError.message);
        }
        
        // Si llegamos aquí, todos los modelos, API keys y Ollama fallaron
        console.error('[OpenClaw] ❌ Todos los recursos (Groq + Ollama) agotados');
        return "David: El sistema está un poco saturado ahora mismo, pero no te preocupes. Escríbeme de nuevo en unos minutos o déjame tu consulta y te responderé en cuanto se libere. 😊";
    }
}

export const openClawOrchestrator = new OpenClawOrchestrator();
