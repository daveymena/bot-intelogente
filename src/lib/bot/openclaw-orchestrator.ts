/**
 * OpenClaw Orchestrator Architect - v2.0
 * Este es el "Director de Orquesta" oficial basado en el framework OpenClaw.
 */

import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { ConversationContextService } from '../conversation-context-service';

dotenv.config();

/**
 * 🔧 Función auxiliar para timeout en operaciones asíncronas
 * Evita que el bot se quede "pegado" esperando respuestas lentas
 */
const withTimeout = async <T>(
    promise: Promise<T>,
    timeoutMs: number,
    fallbackValue: T,
    operationName: string = 'Operation'
): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((resolve) => {
            setTimeout(() => {
                console.log(`[OpenClaw] ⏱️ Timeout en ${operationName} (${timeoutMs}ms) - usando fallback`);
                resolve(fallbackValue);
            }, timeoutMs);
        })
    ]);
};

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
                
                // 🚀 BÚSQUEDA PROFESIONAL CON SUPABASE (Prioridad) + TIMEOUT
                try {
                  const { SupabaseProductService } = await import('../openclaw-supabase-products');
                  
                  // ⏱️ Timeout de 3 segundos para evitar que el bot se quede pegado
                  const supabaseResults = await withTimeout(
                      SupabaseProductService.searchProducts(context.userId, searchTerm),
                      3000, // 3 segundos máximo
                      [], // Si falla, retornar array vacío
                      'Supabase Product Search'
                  );
                  
                  if (supabaseResults.length > 0) {
                      console.log(`[Skill] 🚀 Supabase Professional Search encontró ${supabaseResults.length} resultados`);
                      return {
                          success: true,
                          data: {
                              searchTerm,
                              count: supabaseResults.length,
                              products: supabaseResults.map(p => ({
                                  id: p.id,
                                  name: p.name,
                                  price: p.price,
                                  description: p.description,
                                  category: p.category,
                                  images: p.images,
                                  match: 100 // Supabase FTS es preciso
                              }))
                          }
                      };
                  }
                } catch (e) {
                  console.error('[Skill] Supabase search failed, falling back to local search');
                }

                // 🎯 FALLBACK: Lógica local (Fuse + Filtros)
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

                const products = results.map(r => {
                    const item = r.item as any;
                    return {
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        description: item.description,
                        category: item.category,
                        images: item.images,
                        match: Math.round((1 - r.score!) * 100)
                    };
                });

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

                // 🚀 0. INTENTO CON SUPABASE (Profesional)
                try {
                    const { supabase } = await import('../supabase');
                    
                    // Búsqueda con timeout manual
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 2000)
                    );
                    
                    const searchPromise = supabase
                        .from('products')
                        .select('*')
                        .or(`id.eq.${searchId},name.ilike.${searchId}`)
                        .eq('userId', context.userId)
                        .single();
                    
                    const { data: sbProduct, error } = await Promise.race([
                        searchPromise,
                        timeoutPromise
                    ]).catch(() => ({ data: null, error: new Error('Timeout') })) as any;
                    
                    if (sbProduct && !error) {
                        console.log(`[Skill] ✅ Encontrado en SUPABASE: ${sbProduct.name}`);
                        return await formatProductResult(sbProduct, context.userId);
                    } else if (error) {
                        console.log(`[Skill] ⏱️ Supabase timeout o error, usando fallback local`);
                    }
                } catch (e) {
                    console.error('[Skill] Supabase direct match failed, usando fallback local');
                }

                // 🎯 1. Intento de búsqueda directa por ID (Local Fallback)
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
    // Ya no necesitamos Map interno - usamos ConversationContextService
    // conversationHistory: Map<string, any[]>;  // ❌ ELIMINADO
    maxHistory: number;
    apiKeys: string[];
    currentKeyIndex: number;
    keyFailures: Map<string, { count: number; lastFail: number }>;

    constructor() {
        // this.conversationHistory = new Map();  // ❌ ELIMINADO
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
        console.log(`[OpenClaw] 💾 Usando memoria persistente (ConversationContextService)`);
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

    async processMessage(messageText: string, from: string, context: any, hasImage: boolean = false) {
        console.log(`[Architect] 🧠 Iniciando Modo Ultra Inteligente para ${from}...`);
        
        const currentStage = context.currentStage || 'saludo';
        
        // ✅ CARGAR HISTORIAL DESDE SERVICIO PERSISTENTE (DB + RAM)
        console.log(`[Architect] 💾 Cargando historial persistente para ${from}...`);
        const historyMessages = await ConversationContextService.getMessageHistory(
            from,
            context.userId,
            this.maxHistory
        );
        
        // Convertir al formato esperado por OpenClaw
        const history = historyMessages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        
        console.log(`[Architect] 📚 Historial cargado: ${history.length} mensajes`);

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

        // 🎨 BUSCAR PLANTILLA COMO EJEMPLO DE ESTILO (SÓLO REFERENCIA)
        let styleExample = null;
        try {
            const { ConversationMatcher } = await import('./conversation-matcher');
            const { TemplateRenderer } = await import('./template-renderer');
            const match = ConversationMatcher.findBestMatch(messageText);
            if (match && match.confidence > 0.6) {
                styleExample = await TemplateRenderer.render(match.template, {
                    userId: context.userId,
                    productId: context.activeProduct?.id || context.productId
                });
                console.log(`[Architect] 🎨 Plantilla de estilo encontrada: ${match.template.id} (${Math.round(match.confidence * 100)}%)`);
            }
        } catch (te) { /* ignore */ }

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
                        const item = h.item as any;
                        const cat = item.tipo_producto || item.category || 'Sin categoría';
                        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
                    });
                    const categoryInfo = Object.entries(categoryCount)
                        .map(([cat, count]) => `${cat} (${count} productos)`)
                        .join(', ');
                    catalogHints = `🔍 BÚSQUEDA GENERAL DETECTADA\n📦 Categorías disponibles: ${categoryInfo}\n⚠️ IMPORTANTE: Usar 'list_products_by_category' para mostrar LISTA de opciones`;
                } else {
                    // Para búsquedas específicas, mostrar productos individuales
                    catalogHints = `🎯 PRODUCTOS ESPECÍFICOS ENCONTRADOS:\n` + 
                        hints.map(h => {
                            const item = h.item as any;
                            return `• ID: ${item.id} | NOMBRE: ${item.name} | TIPO: ${item.tipo_producto || 'N/A'}`;
                        }).join('\n');
                }
            }
        } catch (e) { /* silent */ }

        // 3. Razonamiento
        const analysis = await this._think(messageText, history, brainContext, categoryMap, catalogHints, { ...context, currentStage });
        console.log(`[Architect] 💡 Análisis: ${analysis.reasoning}`);
        
        // 🎯 NUEVA LÓGICA: Si hay respuesta sugerida (preguntas de calificación), usarla directamente
        let toolData: any = null;
        if (analysis.suggestedResponse && !analysis.toolToUse) {
            console.log('[Architect] � Incorporando sugerencia conversacional como draft');
            toolData = { suggestedDraft: analysis.suggestedResponse };
        }
        
        let nextStage = currentStage;

        if (analysis.toolToUse && TOOLS[analysis.toolToUse]) {
            console.log(`[Architect] 🛠️ Ejecutando Skill: ${analysis.toolToUse}`);
            try {
                const result = await TOOLS[analysis.toolToUse].execute(analysis.toolParams, context);
                if (result && result.success) {
                    toolData = result.data;
                    console.log(`[Architect] ✅ Skill completado con éxito`);
                    
                    // 💾 Guardar producto activo en contexto para get_payment_info
                    if (analysis.toolToUse === 'get_product_with_payment' && toolData) {
                        context.activeProduct = toolData;
                        console.log(`[Architect] 💾 Producto activo guardado: ${toolData.name}`);
                    }
                    
                    // Transiciones automáticas
                    if (analysis.toolToUse === 'get_product_with_payment') nextStage = 'viendo_producto';
                    if (analysis.toolToUse === 'list_products_by_category') nextStage = 'buscando_producto';
                    if (analysis.toolToUse === 'get_payment_info') nextStage = 'pago';
                } else {
                    console.log(`[Architect] ⚠️ Skill no encontró resultados`);
                }
            } catch (e: any) { console.error(`[Architect] ❌ Error en skill:`, e.message); }
        }

        // Reglas de Oro KENNETH (Transiciones basadas en palabras clave)
        const msg = messageText.toLowerCase();
        
        // Evitar sobrescribir estados avanzados con estados iniciales
        const advanceStages = ['pago', 'pago_pendiente', 'pago_validando', 'confirmacion', 'cerrado'];
        if (!advanceStages.includes(nextStage)) {
            if (msg.includes('comprar') || msg.includes('interesa') || msg.includes('lo quiero')) {
                nextStage = 'interes_compra';
            }
        }
        
        // 🚨 LÓGICA RÍGIDA DE PAGO (Evita confirmaciones falsas)
        const inPaymentFlow = currentStage === 'pago' || currentStage === 'pago_pendiente' || currentStage === 'pago_validando';
        
        if (inPaymentFlow) {
            const confirmedKeywords = ['si', 'listo', 'ya', 'pagado', 'pague', 'hecho', 'confirmar'];
            const isConfirming = confirmedKeywords.some(kw => msg === kw || msg.includes(kw));
            
            if (hasImage) {
                console.log('[Architect] 📸 Imagen de pago detectada. Pasando a VALIDACIÓN.');
                nextStage = 'pago_validando';
            } else if (isConfirming) {
                console.log('[Architect] ⚠️ Confirmación sin imagen. Pasando a PAGO PENDIENTE.');
                nextStage = 'pago_pendiente';
            }
        }

        if (msg.includes('gracias') && currentStage === 'cerrado') {
            nextStage = 'cerrado';
        }

        // 4. Generatriz de Respuesta
        let response = await this._generateResponse(messageText, history, brainContext, { ...toolData, styleExample }, nextStage);
        
        // ✅ GUARDAR EN SERVICIO PERSISTENTE (DB + RAM)
        console.log(`[Architect] 💾 Guardando conversación en memoria persistente...`);
        await ConversationContextService.addMessage(from, context.userId, 'user', messageText);
        await ConversationContextService.addMessage(from, context.userId, 'assistant', response);

        // 🛠️ REEMPLAZO FORZADO (Seguridad OpenClaw)
        // 🛠️ REEMPLAZO FORZADO (Seguridad OpenClaw)
        if (toolData) {
            const finalName = toolData.name || toolData.productName || 'Producto';
            const priceVal = toolData.price || toolData.productPrice;
            const price = typeof priceVal === 'number' 
                ? priceVal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) 
                : (priceVal || '');
            
            const specs = toolData.configurations || toolData.specs || 'Consultar';
            
            response = response
                .replace(/{name}/g, finalName)
                .replace(/{price}/g, price)
                .replace(/{description}/g, toolData.description || '')
                .replace(/{configurations}/g, typeof specs === 'string' ? specs : JSON.stringify(specs))
                .replace(/{tipo_entrega}/g, toolData.tipo_entrega || 'Envío a domicilio')
                .replace(/{paymentLink}/g, toolData.paymentLink ? `🔗 MercadoPago: ${toolData.paymentLink}` : '💳 MercadoPago: Link no disponible (Solicitar a asesor)')
                .replace(/{payPalLink}/g, toolData.payPalLink ? `🔗 PayPal/Internacional: ${toolData.payPalLink}` : '');
        }

        // 🛡️ SALVAGUARDA: Si por alguna razón la respuesta está vacía, dar una por defecto
        if (!response || response.trim().length === 0) {
            console.error('[Architect] ❌ Respuesta generada VACÍA. Usando fallback.');
            response = "¡Hola! Soy David. Estoy aquí para asesorarte con lo que necesites. ¿En qué puedo ayudarte hoy? 😊";
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

        // Si la estrategia ya tiene una respuesta sugerida (ej. saludos o despedidas)
        if (strategy.suggestedResponse) {
            return {
                reasoning: strategy.reasoning,
                toolToUse: strategy.toolToUse,
                suggestedResponse: strategy.suggestedResponse
            };
        }

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

    **🎯 PASO 2: Otras herramientas (PRIORIDAD ALTA)**
    
    **⚠️ REGLA CRÍTICA - PAGOS (VERIFICAR PRIMERO):**
    Si el mensaje contiene CUALQUIERA de estas palabras/frases, SIEMPRE usar 'get_payment_info':
    - "pago", "pagos", "pagar", "método", "metodo", "forma", "formas"
    - "cuenta", "cuentas", "bancaria", "banco", "nequi", "daviplata"
    - "transferencia", "consignación", "deposito"
    - "cómo compro", "como compro", "cómo adquiero"
    
    Ejemplos que SIEMPRE usan get_payment_info:
    ✅ "método de pago?" → get_payment_info
    ✅ "Metodo de pago cual es?" → get_payment_info
    ✅ "cómo puedo pagar?" → get_payment_info
    ✅ "cuál es la cuenta?" → get_payment_info
    ✅ "formas de pago?" → get_payment_info
    ✅ "dame el nequi" → get_payment_info
    ✅ "cómo compro?" → get_payment_info
    
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
            soul = 'Eres David, un asesor de ventas experto en tecnología y educación digital.';
        }
        
        const isProductList = toolData && toolData.products && Array.isArray(toolData.products);
        
        let systemPrompt = `
${soul}

### 🏠 ESTADO ACTUAL: ${stage}
${this._getStageInstruction(stage)}

### 🏢 CONTEXTO DEL NEGOCIO:
${brainContext}

### 🎨 GUÍA DE ESTILO Y FORMATO (AUTONOMÍA TOTAL)
Eres libre de estructurar tu respuesta como prefieras para ser más persuasivo, pero David suele seguir estas mejores prácticas:
1. Breve introducción empática (1 línea).
2. Separador: ━━━━━━━━━━━━━━━━━━
3. Cuerpo del mensaje (información útil, cards de producto, o asesoría técnica).
4. Separador: ━━━━━━━━━━━━━━━━━━
5. Pregunta de cierre (CTA) clara y directa.

EMOJIS CLAVE: 💻 (Tech), 🎹 (Cursos), 💰 (Precio), 📦 (Stock), 🚚 (Envío), ✅ (Ventaja), ⚠️ (Nota), 🎯 (Recomendación), 💳 (Pago).
`;

        if (toolData?.styleExample) {
            systemPrompt += `
### 🎨 EJEMPLO DE ESTILO "DAVID" (SÓLO COMO REFERENCIA):
Este es un ejemplo de cómo David suele responder en esta situación. Tienes autonomía total para ajustarlo, mejorarlo o ignorarlo si crees que hay una mejor forma de cerrar la venta:
━━━━━━━━━━━━━━━━━━
${toolData.styleExample}
━━━━━━━━━━━━━━━━━━
`;
        }

        if (isProductList) {
            const productCount = toolData.products.length;
            const productsToShow = toolData.products.slice(0, 5);
            
            systemPrompt += `
### SUGERENCIA: MODO LISTA DE OPCIONES
El cliente busca opciones generales. Aquí tienes un ejemplo de cómo David muestra listas:
¡Claro! Encontré estas ${productCount} excelentes opciones para ti:

━━━━━━━━━━━━━━━━━━
${productsToShow.map((p: any, i: number) => {
    const priceVal = p.price;
    const price = typeof priceVal === 'number' ? priceVal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) : `$${priceVal}`;
    return `${i+1}️⃣ *${p.name}*\n   💰 ${price}`;
}).join('\n\n')}
━━━━━━━━━━━━━━━━━━

¿Cuál de estos te llama más la atención para darte todos los detalles? 🦞🔥
`;
        } else if (toolData && (toolData.id || toolData.name)) {
            const isDigital = toolData.category === 'DIGITAL' || toolData.tipo_producto === 'digital' || toolData.tipo_producto === 'curso';
            
            systemPrompt += `
### SUGERENCIA: CARD DE PRODUCTO (VISTA DETALLADA)
Cuando el cliente se interesa en un producto específico, David usa este formato de alto impacto:

DATOS DEL PRODUCTO: ${JSON.stringify(toolData)}
${isDigital ? `
¡Excelente elección! Este curso es de los más solicitados:

━━━━━━━━━━━━━━━━━━
🎹 *{name}*
💰 Precio: {price}
🎬 Formato: 100% Pregrabado / Acceso de por vida
📲 Entrega: Inmediata por Correo/WhatsApp
🛡️ Garantía: 7 días de Satisfacción

📋 *Descripción*
{description}
━━━━━━━━━━━━━━━━━━

{paymentLink}
{payPalLink}

📩 ¿Deseas inscribirte ahora mismo y empezar hoy?
` : `
¡Buenísima elección! Aquí tienes los detalles técnicos:

━━━━━━━━━━━━━━━━━━
💻 *{name}*
💰 Precio: {price}
⚙️ Specs: {configurations}
📦 Stock: Disponible | 🚚 Entrega: {tipo_entrega}

📋 *Descripción*
{description}
━━━━━━━━━━━━━━━━━━

📩 ¿Te gustaría que lo apartemos para envío o prefieres pasar al local?
`}
`;
        } else if (stage === 'pago' && toolData) {
            systemPrompt += `
### MODO CIERRE / PAGO:
Proporciona los datos de pago de forma clara. David siempre usa separadores aquí:

DATOS: ${JSON.stringify(toolData)}
¡Perfecto! Aquí tienes los datos para concretar tu compra ahora mismo:

━━━━━━━━━━━━━━━━━━
🏦 *Transferencia Bancaria*
Banco: BBVA
Cuenta Ahorros: 0616001940
Titular: TecnoVariedades D&S

📱 *Nequi / Daviplata*
Número: 3136174267

💳 *Pagos Digitales*
{paymentLink}
{payPalLink}
━━━━━━━━━━━━━━━━━━

¿Me confirmas cuando realices el pago enviando el comprobante por aquí para procesar tu pedido de inmediato? 🦞🔥
`;
        } else if (stage === 'pago_pendiente') {
            systemPrompt += `
### MODO: ESPERANDO COMPROBANTE
El cliente dice que ya pagó o quiere pagar, pero NO ha enviado la foto del recibo.
TU MISIÓN: Pide amablemente el comprobante. NUNCA digas que el pago fue procesado con éxito todavía.
EJEMPLO: "¡Excelente! Por favor, envíame una foto o captura de pantalla del comprobante de pago por aquí mismo para validarlo y procesar tu entrega de inmediato. 😊"
`;
        } else if (stage === 'pago_validando') {
            systemPrompt += `
### MODO: VALIDACIÓN HUMANA (ADMIN)
El cliente ya envió la foto. 
TU MISIÓN: Dile que el pago está siendo validado por el supervisor.
EJEMPLO: "¡Recibido! 🎉 He pasado tu comprobante a validación con nuestro supervisor. En cuanto me den el 'visto bueno' aquí mismo, procederemos con tu entrega. ¡Gracias por tu compra!"
`;
        } else {
            systemPrompt += `
### MODO CONVERSACIONAL / ASESORÍA EXPERTA:
TU MISIÓN: Responder con una lógica impecable basada en los datos reales. No des respuestas genéricas.

🧠 **LÓGICA DE VENTAS "DAVID"**:
1. **Deducción Técnica**: Si el cliente pregunta por "qué es mejor", compara especificaciones de los HINTS del catálogo.
2. **Manejo de Objeciones**: Si el precio parece alto, explica POR QUÉ (memoria RAM superior, procesador de última generación, garantía extendida en Cali).
3. **Validación de Datos**: Si el cliente menciona una dirección o ciudad, confirma que llegamos allí (Envío nacional incluido en digitales, coordinado en físicos).
4. **Contexto Local**: Reafirma que estamos en el CC El Diamante 2, Local 158, Cali, para generar confianza de negocio físico real.

GUÍA DE RESPUESTA:
- Usa el historial para no repetir información.
- Si el cliente está confundido, simplifica los términos técnicos.
- Termina siempre guiando al siguiente paso de venta o resolviendo la duda con autoridad.
`;
        }

        systemPrompt += `
---
🚀 **INSTRUCCIONES FINALES DE PENSAMIENTO LÓGICO**:
1. **Analiza vs Inventa**: Antes de escribir, verifica si el dato está en el CONTEXTO. Si no está, usa la lógica de "consultar con soporte/bodega".
2. **Coherencia**: Mantén una narrativa lógica. Si ofreciste un curso antes, no ofrezcas una laptop ahora a menos que el usuario lo pida.
3. **Identidad**: Eres David, el estratega de TecnoVariedades D&S. Tu tono es profesional, inteligente y persuasivo.
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
            'pago': 'Muestra las cuentas bancarias y links de pago. Dile que DEBE enviar el comprobante.',
            'pago_pendiente': '⚠️ REGLA: Pide amablemente el comprobante de pago (físico/captura). NO confirmes la venta aún.',
            'pago_validando': '✅ Recibiste el comprobante. Dile que lo estás validando con el supervisor y confirmarás en breve.',
            'confirmacion': 'Pide datos de envío: Ciudad, Dirección, Nombre y Teléfono.',
            'cerrado': 'Agradece la compra y confirma que el pedido está en proceso.'
        };
        return stages[stage] || stages['saludo'];
    }

    async _callAI(systemPrompt: string, history: any[], message: string) {
        // Lista de modelos en orden de preferencia (70b primero para máxima coherencia)
        const models = [
            'llama-3.3-70b-versatile',  // Máxima potencia y coherencia siguiendo reglas
            'llama-3.1-8b-instant',      // Rápido si el anterior falla
            'mixtral-8x7b-32768'         // Alternativa final
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
        return "David: ¡Hola! Soy el asesor virtual de la tienda. He tenido un pequeño retraso técnico, pero ya estoy aquí. ¿En qué te puedo ayudar hoy? 😊";
    }
}

export const openClawOrchestrator = new OpenClawOrchestrator();
