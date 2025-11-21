"use strict";
/**
 * Sistema de Entrenamiento Automático del Bot
 *
 * Este servicio entrena al bot en segundo plano con casos de prueba complejos
 * y aprende de sus errores para mejorar las respuestas futuras.
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
exports.BotTrainingService = void 0;
const db_1 = require("@/lib/db");
class BotTrainingService {
    /**
     * Genera casos de prueba basados en productos reales
     */
    static generateRealTrainingCases(products) {
        const cases = [];
        // Casos básicos que siempre se incluyen
        cases.push({
            id: 'basic_001',
            userMessage: 'Hola',
            expectedIntent: 'greeting',
            expectedAction: 'greeting',
            complexity: 'easy',
            correctResponse: 'Debe saludar amigablemente y ofrecer ayuda'
        });
        cases.push({
            id: 'basic_002',
            userMessage: 'Qué productos tienes?',
            expectedIntent: 'product_list',
            expectedAction: 'product_list',
            complexity: 'easy',
            correctResponse: 'Debe listar categorías o productos disponibles'
        });
        // Tomar los primeros 10 productos para generar casos
        const sampleProducts = products.slice(0, 10);
        sampleProducts.forEach((product, index) => {
            const productName = product.name;
            const productWords = productName.toLowerCase().split(' ');
            const mainKeyword = productWords.find(w => w.length > 4) || productWords[0];
            // Caso 1: Pregunta de precio
            cases.push({
                id: `price_${index + 1}`,
                userMessage: `Cuánto cuesta ${productName.toLowerCase()}?`,
                expectedIntent: 'product_info',
                expectedProducts: [productName],
                expectedAction: 'product_info',
                complexity: 'easy',
                correctResponse: `Debe dar el precio exacto de ${productName}`
            });
            // Caso 2: Consulta general
            cases.push({
                id: `search_${index + 1}`,
                userMessage: `Tienes ${mainKeyword}?`,
                expectedIntent: 'product_list',
                expectedProducts: [productName],
                expectedAction: 'product_list',
                complexity: 'medium',
                correctResponse: `Debe mencionar ${productName} u otros productos similares`
            });
            // Caso 3: Información del producto
            if (index < 3) {
                cases.push({
                    id: `info_${index + 1}`,
                    userMessage: `Cuéntame sobre ${productName.toLowerCase()}`,
                    expectedIntent: 'product_info',
                    expectedProducts: [productName],
                    expectedAction: 'product_info',
                    complexity: 'medium',
                    correctResponse: `Debe dar descripción completa de ${productName}`
                });
            }
        });
        // Casos de comparación (si hay suficientes productos)
        if (products.length >= 2) {
            const prod1 = products[0].name;
            const prod2 = products[1].name;
            cases.push({
                id: 'compare_001',
                userMessage: `Cuál es la diferencia entre ${prod1.toLowerCase()} y ${prod2.toLowerCase()}?`,
                expectedIntent: 'product_comparison',
                expectedProducts: [prod1, prod2],
                expectedAction: 'product_info',
                complexity: 'hard',
                correctResponse: `Debe explicar diferencias entre ${prod1} y ${prod2}`
            });
        }
        // Casos de presupuesto
        if (products.length > 0) {
            const avgPrice = Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length);
            cases.push({
                id: 'budget_001',
                userMessage: `Tengo ${avgPrice} pesos, qué me recomiendas?`,
                expectedIntent: 'product_recommendation',
                expectedAction: 'product_list',
                complexity: 'hard',
                context: `Cliente con presupuesto de ${avgPrice}`,
                correctResponse: 'Debe recomendar productos dentro del presupuesto'
            });
        }
        // Casos trampa (productos que NO existen)
        cases.push({
            id: 'trap_001',
            userMessage: 'Tienes iPhones?',
            expectedIntent: 'product_not_available',
            expectedProducts: [],
            expectedAction: 'product_list',
            complexity: 'hard',
            context: 'Producto que NO vendemos',
            correctResponse: 'Debe decir que NO vende iPhones y ofrecer productos que SÍ tiene'
        });
        cases.push({
            id: 'trap_002',
            userMessage: 'Cuánto cuesta el Tesla Model 3?',
            expectedIntent: 'product_not_available',
            expectedProducts: [],
            expectedAction: 'product_info',
            complexity: 'hard',
            context: 'Producto absurdo que obviamente NO vendemos',
            correctResponse: 'Debe aclarar que no vende autos y ofrecer lo que SÍ tiene'
        });
        return cases;
    }
    /**
     * Inicia el entrenamiento en segundo plano
     */
    static async startBackgroundTraining(userId) {
        if (this.isTraining) {
            console.log('⚠️ Entrenamiento ya en progreso');
            return;
        }
        this.isTraining = true;
        console.log('🎓 Iniciando entrenamiento del bot en segundo plano...');
        try {
            // Obtener productos reales de la base de datos
            const products = await db_1.db.product.findMany({
                where: { userId, status: 'AVAILABLE' },
                select: { id: true, name: true, description: true, price: true, category: true }
            });
            console.log(`📦 Productos cargados: ${products.length}`);
            // Generar casos de prueba basados en productos reales
            const realCases = this.generateRealTrainingCases(products);
            console.log(`🧪 Casos de prueba generados: ${realCases.length}`);
            // Entrenar con cada caso
            for (const trainingCase of realCases) {
                await this.trainWithCase(trainingCase, products, userId);
                // Pausa de 3 segundos entre casos para no saturar la API
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
            // Analizar resultados
            const analysis = this.analyzeTrainingResults();
            // Guardar patrones aprendidos
            await this.saveLearningPatterns(userId);
            console.log('✅ Entrenamiento completado');
            console.log('📊 Análisis:', analysis);
            return analysis;
        }
        catch (error) {
            console.error('❌ Error en entrenamiento:', error);
        }
        finally {
            this.isTraining = false;
        }
    }
    /**
     * Entrena con un caso específico
     */
    static async trainWithCase(trainingCase, products, userId) {
        console.log(`\n🧪 Probando caso: ${trainingCase.id} (${trainingCase.complexity})`);
        console.log(`   Mensaje: "${trainingCase.userMessage}"`);
        try {
            // Importar dinámicamente el servicio de IA
            const { AIService } = await Promise.resolve().then(() => __importStar(require('./ai-service')));
            // Llamar directamente al servicio de IA
            const data = await AIService.generateResponse(userId, trainingCase.userMessage, 'training_bot', // phoneNumber
            [] // conversationHistory vacío para casos de prueba
            );
            // Evaluar la respuesta
            const evaluation = this.evaluateResponse(trainingCase, data);
            // Guardar resultado
            this.trainingResults.push(evaluation);
            // Aprender del resultado
            if (!evaluation.isCorrect) {
                await this.learnFromMistake(trainingCase, evaluation);
            }
            else {
                await this.reinforceCorrectPattern(trainingCase, evaluation);
            }
            // Log del resultado
            const emoji = evaluation.isCorrect ? '✅' : '❌';
            console.log(`   ${emoji} Resultado: ${evaluation.isCorrect ? 'CORRECTO' : 'INCORRECTO'}`);
            console.log(`   Confianza: ${(evaluation.confidence * 100).toFixed(1)}%`);
            if (evaluation.errors.length > 0) {
                console.log(`   Errores:`, evaluation.errors);
            }
            if (evaluation.suggestions.length > 0) {
                console.log(`   Sugerencias:`, evaluation.suggestions);
            }
        }
        catch (error) {
            console.error(`   ❌ Error en caso ${trainingCase.id}:`, error);
        }
    }
    /**
     * Evalúa si la respuesta del bot es correcta
     */
    static evaluateResponse(trainingCase, botResponse) {
        const errors = [];
        const suggestions = [];
        let isCorrect = true;
        let confidence = botResponse.confidence || 0;
        // Verificar intent detectado
        const detectedIntent = botResponse.intent || 'unknown';
        if (detectedIntent !== trainingCase.expectedIntent) {
            errors.push(`Intent incorrecto: esperaba "${trainingCase.expectedIntent}", obtuvo "${detectedIntent}"`);
            isCorrect = false;
        }
        // Verificar productos mencionados
        if (trainingCase.expectedProducts && trainingCase.expectedProducts.length > 0) {
            const responseText = botResponse.message?.toLowerCase() || '';
            const mentionedProducts = trainingCase.expectedProducts.filter(product => responseText.includes(product.toLowerCase()));
            if (mentionedProducts.length === 0) {
                errors.push(`No mencionó ningún producto esperado: ${trainingCase.expectedProducts.join(', ')}`);
                isCorrect = false;
            }
            else if (mentionedProducts.length < trainingCase.expectedProducts.length) {
                const missing = trainingCase.expectedProducts.filter(p => !mentionedProducts.includes(p));
                suggestions.push(`Faltó mencionar: ${missing.join(', ')}`);
            }
        }
        // Verificar casos trampa
        if (trainingCase.id.startsWith('trap_')) {
            const responseText = botResponse.message?.toLowerCase() || '';
            if (trainingCase.id === 'trap_001' && responseText.includes('iphone')) {
                errors.push('Mencionó iPhone cuando NO lo vendemos');
                isCorrect = false;
            }
            if (trainingCase.id === 'trap_002' && responseText.includes('guitarra') && !responseText.includes('piano')) {
                errors.push('Habló de guitarra cuando solo tenemos curso de PIANO');
                isCorrect = false;
            }
        }
        // Verificar longitud de respuesta
        const responseLength = botResponse.message?.length || 0;
        if (responseLength < 50) {
            suggestions.push('Respuesta muy corta, debería dar más detalles');
        }
        else if (responseLength > 1000) {
            suggestions.push('Respuesta muy larga, debería ser más concisa');
        }
        // Verificar tono amigable
        const responseText = botResponse.message?.toLowerCase() || '';
        const friendlyWords = ['gracias', 'encantado', 'ayudar', 'gusto', '😊', '👋', '✨'];
        const hasFriendlyTone = friendlyWords.some(word => responseText.includes(word));
        if (!hasFriendlyTone && trainingCase.expectedAction !== 'complaint') {
            suggestions.push('Debería usar un tono más amigable');
        }
        return {
            caseId: trainingCase.id,
            userMessage: trainingCase.userMessage,
            botResponse: botResponse.message || '',
            expectedIntent: trainingCase.expectedIntent,
            detectedIntent,
            isCorrect,
            confidence,
            errors,
            suggestions,
            timestamp: new Date()
        };
    }
    /**
     * Aprende de un error
     */
    static async learnFromMistake(trainingCase, evaluation) {
        console.log(`   📝 Aprendiendo del error en caso ${trainingCase.id}...`);
        // Crear patrón de corrección
        const correctionPattern = {
            pattern: trainingCase.userMessage.toLowerCase(),
            intent: trainingCase.expectedIntent,
            products: trainingCase.expectedProducts || [],
            successRate: 0,
            timesUsed: 1,
            lastUsed: new Date()
        };
        // Guardar en memoria
        this.learningPatterns.set(trainingCase.id, correctionPattern);
        // TODO: Guardar en base de datos para persistencia
        // await db.learningPattern.create({ data: correctionPattern })
    }
    /**
     * Refuerza un patrón correcto
     */
    static async reinforceCorrectPattern(trainingCase, evaluation) {
        const existing = this.learningPatterns.get(trainingCase.id);
        if (existing) {
            existing.successRate = (existing.successRate * existing.timesUsed + 1) / (existing.timesUsed + 1);
            existing.timesUsed++;
            existing.lastUsed = new Date();
        }
        else {
            this.learningPatterns.set(trainingCase.id, {
                pattern: trainingCase.userMessage.toLowerCase(),
                intent: trainingCase.expectedIntent,
                products: trainingCase.expectedProducts || [],
                successRate: 1,
                timesUsed: 1,
                lastUsed: new Date()
            });
        }
    }
    /**
     * Analiza los resultados del entrenamiento
     */
    static analyzeTrainingResults() {
        const total = this.trainingResults.length;
        const correct = this.trainingResults.filter(r => r.isCorrect).length;
        const incorrect = total - correct;
        const accuracy = (correct / total) * 100;
        const byComplexity = {
            easy: this.trainingResults.filter(r => r.caseId.startsWith('easy_')),
            medium: this.trainingResults.filter(r => r.caseId.startsWith('medium_')),
            hard: this.trainingResults.filter(r => r.caseId.startsWith('hard_')),
            expert: this.trainingResults.filter(r => r.caseId.startsWith('expert_')),
            trap: this.trainingResults.filter(r => r.caseId.startsWith('trap_'))
        };
        const analysis = {
            total,
            correct,
            incorrect,
            accuracy: accuracy.toFixed(2) + '%',
            byComplexity: {
                easy: {
                    total: byComplexity.easy.length,
                    correct: byComplexity.easy.filter(r => r.isCorrect).length,
                    accuracy: ((byComplexity.easy.filter(r => r.isCorrect).length / byComplexity.easy.length) * 100).toFixed(2) + '%'
                },
                medium: {
                    total: byComplexity.medium.length,
                    correct: byComplexity.medium.filter(r => r.isCorrect).length,
                    accuracy: ((byComplexity.medium.filter(r => r.isCorrect).length / byComplexity.medium.length) * 100).toFixed(2) + '%'
                },
                hard: {
                    total: byComplexity.hard.length,
                    correct: byComplexity.hard.filter(r => r.isCorrect).length,
                    accuracy: ((byComplexity.hard.filter(r => r.isCorrect).length / byComplexity.hard.length) * 100).toFixed(2) + '%'
                },
                expert: {
                    total: byComplexity.expert.length,
                    correct: byComplexity.expert.filter(r => r.isCorrect).length,
                    accuracy: ((byComplexity.expert.filter(r => r.isCorrect).length / byComplexity.expert.length) * 100).toFixed(2) + '%'
                },
                trap: {
                    total: byComplexity.trap.length,
                    correct: byComplexity.trap.filter(r => r.isCorrect).length,
                    accuracy: ((byComplexity.trap.filter(r => r.isCorrect).length / byComplexity.trap.length) * 100).toFixed(2) + '%'
                }
            },
            commonErrors: this.getCommonErrors(),
            topSuggestions: this.getTopSuggestions()
        };
        return analysis;
    }
    /**
     * Obtiene los errores más comunes
     */
    static getCommonErrors() {
        const errorCounts = new Map();
        this.trainingResults.forEach(result => {
            result.errors.forEach(error => {
                errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
            });
        });
        return Array.from(errorCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([error, count]) => `${error} (${count} veces)`);
    }
    /**
     * Obtiene las sugerencias más frecuentes
     */
    static getTopSuggestions() {
        const suggestionCounts = new Map();
        this.trainingResults.forEach(result => {
            result.suggestions.forEach(suggestion => {
                suggestionCounts.set(suggestion, (suggestionCounts.get(suggestion) || 0) + 1);
            });
        });
        return Array.from(suggestionCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([suggestion, count]) => `${suggestion} (${count} veces)`);
    }
    /**
     * Guarda los patrones aprendidos
     */
    static async saveLearningPatterns(userId) {
        console.log(`\n💾 Guardando ${this.learningPatterns.size} patrones aprendidos...`);
        // TODO: Guardar en base de datos
        // Por ahora, guardar en archivo JSON
        const patterns = Array.from(this.learningPatterns.entries()).map(([id, pattern]) => ({
            id,
            ...pattern
        }));
        console.log('✅ Patrones guardados');
        return patterns;
    }
    /**
     * Obtiene los resultados del entrenamiento
     */
    static getTrainingResults() {
        return this.trainingResults;
    }
    /**
     * Obtiene los patrones aprendidos
     */
    static getLearningPatterns() {
        return Array.from(this.learningPatterns.values());
    }
    /**
     * Limpia los resultados del entrenamiento
     */
    static clearTrainingResults() {
        this.trainingResults = [];
        this.learningPatterns.clear();
    }
}
exports.BotTrainingService = BotTrainingService;
BotTrainingService.trainingResults = [];
BotTrainingService.learningPatterns = new Map();
BotTrainingService.isTraining = false;
/**
 * Casos de prueba complejos para entrenar al bot (DEPRECADO - usar generateRealTrainingCases)
 */
BotTrainingService.trainingCases = [
    // ========== CASOS FÁCILES ==========
    {
        id: 'easy_001',
        userMessage: 'Hola',
        expectedIntent: 'greeting',
        expectedAction: 'greeting',
        complexity: 'easy',
        correctResponse: 'Debe saludar amigablemente y ofrecer ayuda'
    },
    {
        id: 'easy_002',
        userMessage: 'Cuánto cuesta el curso de piano?',
        expectedIntent: 'product_info',
        expectedProducts: ['curso de piano'],
        expectedAction: 'product_info',
        complexity: 'easy',
        correctResponse: 'Debe dar precio exacto del curso de piano'
    },
    {
        id: 'easy_003',
        userMessage: 'Tienes laptops?',
        expectedIntent: 'product_list',
        expectedProducts: ['laptop'],
        expectedAction: 'product_list',
        complexity: 'easy',
        correctResponse: 'Debe listar laptops disponibles con precios'
    },
    // ========== CASOS MEDIOS ==========
    {
        id: 'medium_001',
        userMessage: 'Busco algo para aprender música pero no sé qué',
        expectedIntent: 'product_recommendation',
        expectedProducts: ['curso de piano', 'megapack'],
        expectedAction: 'product_list',
        complexity: 'medium',
        correctResponse: 'Debe recomendar curso de piano y explicar beneficios'
    },
    {
        id: 'medium_002',
        userMessage: 'Necesito una compu que sirva para diseño gráfico',
        expectedIntent: 'product_recommendation',
        expectedProducts: ['laptop'],
        expectedAction: 'product_info',
        complexity: 'medium',
        correctResponse: 'Debe recomendar laptop con buenas especificaciones para diseño'
    },
    {
        id: 'medium_003',
        userMessage: 'Cuál es la diferencia entre el curso y el megapack?',
        expectedIntent: 'product_comparison',
        expectedProducts: ['curso de piano', 'megapack'],
        expectedAction: 'product_info',
        complexity: 'medium',
        correctResponse: 'Debe explicar diferencias claras entre ambos productos'
    },
    {
        id: 'medium_004',
        userMessage: 'La moto viene con garantía?',
        expectedIntent: 'product_info',
        expectedProducts: ['moto'],
        expectedAction: 'product_info',
        complexity: 'medium',
        correctResponse: 'Debe dar información sobre garantía de la moto'
    },
    // ========== CASOS DIFÍCILES ==========
    {
        id: 'hard_001',
        userMessage: 'Tengo 500 mil pesos, qué me recomiendas para empezar un negocio online?',
        expectedIntent: 'product_recommendation',
        expectedProducts: ['laptop', 'curso', 'megapack'],
        expectedAction: 'product_list',
        complexity: 'hard',
        context: 'Cliente con presupuesto limitado buscando emprender',
        correctResponse: 'Debe recomendar productos dentro del presupuesto y explicar cómo ayudan a emprender'
    },
    {
        id: 'hard_002',
        userMessage: 'Mi hijo quiere aprender piano pero no tengo piano en casa, sirve el curso?',
        expectedIntent: 'product_info',
        expectedProducts: ['curso de piano'],
        expectedAction: 'product_info',
        complexity: 'hard',
        context: 'Objeción sobre requisitos del producto',
        correctResponse: 'Debe explicar que el curso incluye teclado virtual y no necesita piano físico'
    },
    {
        id: 'hard_003',
        userMessage: 'Compré el curso hace 2 días pero no me llegó el acceso',
        expectedIntent: 'complaint',
        expectedProducts: ['curso'],
        expectedAction: 'complaint',
        complexity: 'hard',
        context: 'Cliente con problema post-venta',
        correctResponse: 'Debe disculparse, pedir datos de compra y escalar a humano'
    },
    {
        id: 'hard_004',
        userMessage: 'La laptop que me vendieron no prende, quiero devolución',
        expectedIntent: 'complaint',
        expectedProducts: ['laptop'],
        expectedAction: 'complaint',
        complexity: 'hard',
        context: 'Reclamo serio que requiere escalamiento',
        correctResponse: 'Debe disculparse, mostrar empatía y escalar inmediatamente a humano'
    },
    // ========== CASOS EXPERTOS (MUY COMPLEJOS) ==========
    {
        id: 'expert_001',
        userMessage: 'Hola, vi que tienen laptops y cursos. Estoy buscando algo para mi sobrino que está en la universidad estudiando ingeniería de sistemas. Tiene que hacer programación y diseño 3D. Mi presupuesto es máximo 2 millones. También me interesa que aprenda algo extra en su tiempo libre, le gusta la música. Qué me recomiendas?',
        expectedIntent: 'complex_recommendation',
        expectedProducts: ['laptop', 'curso de piano'],
        expectedAction: 'product_list',
        complexity: 'expert',
        context: 'Consulta compleja con múltiples necesidades y presupuesto',
        correctResponse: 'Debe recomendar laptop adecuada para programación/diseño dentro del presupuesto Y sugerir curso de piano como complemento'
    },
    {
        id: 'expert_002',
        userMessage: 'Buenas, hace un mes compré una moto con ustedes. Todo bien, pero ahora necesito cambiar el aceite y no sé dónde. También quiero saber si tienen repuestos. Ah, y mi hermano está interesado en comprar una igual, tiene descuento por referido?',
        expectedIntent: 'multiple_intents',
        expectedProducts: ['moto'],
        expectedAction: 'help',
        complexity: 'expert',
        context: 'Múltiples preguntas en un solo mensaje: post-venta, repuestos, referidos',
        correctResponse: 'Debe responder TODAS las preguntas: mantenimiento, repuestos, y programa de referidos'
    },
    {
        id: 'expert_003',
        userMessage: 'Mira, estoy entre comprar el curso de piano o el megapack. El curso es más barato pero el megapack trae más cosas. Pero no sé si todo lo del megapack me sirve. Yo solo quiero aprender piano clásico, no me interesa mucho lo moderno. Qué me conviene más? Y si compro ahora, cuándo me llega?',
        expectedIntent: 'complex_comparison',
        expectedProducts: ['curso de piano', 'megapack'],
        expectedAction: 'product_info',
        complexity: 'expert',
        context: 'Comparación detallada con necesidades específicas y pregunta adicional de entrega',
        correctResponse: 'Debe analizar necesidades específicas (piano clásico), recomendar el curso normal, explicar por qué, y responder sobre entrega inmediata'
    },
    {
        id: 'expert_004',
        userMessage: 'Hola! Tengo varias dudas: 1) Las laptops tienen garantía? 2) Aceptan tarjeta de crédito? 3) Hacen envíos a Medellín? 4) Si compro hoy cuándo llega? 5) Puedo pagar en cuotas?',
        expectedIntent: 'multiple_questions',
        expectedProducts: ['laptop'],
        expectedAction: 'help',
        complexity: 'expert',
        context: '5 preguntas diferentes en un solo mensaje',
        correctResponse: 'Debe responder TODAS las 5 preguntas de forma clara y ordenada'
    },
    {
        id: 'expert_005',
        userMessage: 'Estoy buscando una laptop pero no entiendo mucho de tecnología. Necesito que me expliques qué significa RAM, procesador, disco duro, todo eso. Y también quiero saber cuál me recomiendas para trabajar desde casa, hacer videollamadas, usar Excel y navegar en internet. Nada muy pesado.',
        expectedIntent: 'educational_recommendation',
        expectedProducts: ['laptop'],
        expectedAction: 'product_info',
        complexity: 'expert',
        context: 'Cliente que necesita educación técnica + recomendación',
        correctResponse: 'Debe explicar términos técnicos de forma simple Y recomendar laptop básica adecuada para trabajo remoto'
    },
    // ========== CASOS TRAMPA (PARA DETECTAR ERRORES) ==========
    {
        id: 'trap_001',
        userMessage: 'Tienes iPhones?',
        expectedIntent: 'product_not_available',
        expectedProducts: [],
        expectedAction: 'product_list',
        complexity: 'hard',
        context: 'Producto que NO vendemos',
        correctResponse: 'Debe decir que NO vende iPhones y ofrecer productos que SÍ tiene (laptops)'
    },
    {
        id: 'trap_002',
        userMessage: 'Cuánto cuesta el curso de guitarra?',
        expectedIntent: 'product_not_available',
        expectedProducts: [],
        expectedAction: 'product_info',
        complexity: 'hard',
        context: 'Curso que NO existe (solo hay de piano)',
        correctResponse: 'Debe aclarar que solo tiene curso de PIANO, no de guitarra'
    },
    {
        id: 'trap_003',
        userMessage: 'La laptop de 8GB de RAM cuánto cuesta?',
        expectedIntent: 'product_info',
        expectedProducts: ['laptop'],
        expectedAction: 'product_info',
        complexity: 'hard',
        context: 'Especificación que puede no coincidir exactamente',
        correctResponse: 'Debe buscar laptop más cercana a esas especificaciones o preguntar más detalles'
    },
];
