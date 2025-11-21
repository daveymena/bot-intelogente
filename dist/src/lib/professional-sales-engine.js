"use strict";
/**
 * 🚀 MOTOR DE VENTAS PROFESIONAL INTELIGENTE
 *
 * Sistema avanzado que transforma el bot en un vendedor profesional
 * capaz de asumir diferentes roles y aplicar técnicas de venta expertas.
 *
 * Características principales:
 * - Sistema de roles profesionales (Vendedor, Consultor, Asesor, etc.)
 * - Técnicas de venta avanzadas (SPIN, Challenger, etc.)
 * - Análisis de personalidad del cliente
 * - Manejo inteligente de objeciones
 * - Cierres de venta profesionales
 * - Upselling y cross-selling inteligente
 * - Aprendizaje continuo basado en resultados
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
exports.ProfessionalSalesEngine = void 0;
exports.enhanceBotWithProfessionalSales = enhanceBotWithProfessionalSales;
const Personality = __importStar(require("./conversational-personality"));
// ============ ROLES PROFESIONALES ============
const PROFESSIONAL_ROLES = [
    {
        id: 'sales_consultant',
        name: 'Consultor de Ventas',
        description: 'Especialista en ventas consultivas, enfocado en entender necesidades del cliente',
        expertise: ['descubrimiento', 'consultoría', 'relaciones', 'confianza'],
        salesStyle: 'consultative',
        techniques: ['SPIN', 'needs_analysis', 'value_proposition'],
        personalityTraits: {
            name: 'Carlos Mendoza',
            tone: 'friendly',
            useEmojis: true,
            regionalVariant: 'colombia'
        }
    },
    {
        id: 'product_expert',
        name: 'Experto en Productos',
        description: 'Especialista técnico que domina características y beneficios de productos',
        expertise: ['productos', 'técnico', 'especificaciones', 'comparaciones'],
        salesStyle: 'technical',
        techniques: ['feature_benefit', 'comparison', 'demonstration'],
        personalityTraits: {
            name: 'Ana García',
            tone: 'casual',
            useEmojis: false,
            regionalVariant: 'neutral'
        }
    },
    {
        id: 'relationship_builder',
        name: 'Constructor de Relaciones',
        description: 'Enfocado en construir confianza y relaciones a largo plazo',
        expertise: ['relaciones', 'confianza', 'seguimiento', 'soporte'],
        salesStyle: 'relationship',
        techniques: ['storytelling', 'social_proof', 'follow_up'],
        personalityTraits: {
            name: 'María Rodríguez',
            tone: 'friendly',
            useEmojis: true,
            regionalVariant: 'colombia'
        }
    },
    {
        id: 'closing_specialist',
        name: 'Especialista en Cierres',
        description: 'Experto en técnicas de cierre y manejo de objeciones finales',
        expertise: ['cierres', 'objeciones', 'negociación', 'urgencia'],
        salesStyle: 'aggressive',
        techniques: ['assumptive_close', 'urgency', 'objection_handling'],
        personalityTraits: {
            name: 'Roberto Silva',
            tone: 'casual',
            useEmojis: true,
            regionalVariant: 'colombia'
        }
    }
];
// ============ TÉCNICAS DE VENTA AVANZADAS ============
const SALES_TECHNIQUES = [
    {
        id: 'SPIN',
        name: 'SPIN Selling',
        description: 'Técnica de preguntas situacionales, problemáticas, implicaciones y necesidad',
        triggerConditions: ['primera_interacción', 'cliente_indeciso', 'necesidad_no_clara'],
        responseTemplates: [
            'Entiendo tu situación. ¿Me podrías contar más sobre {problema}?',
            'Eso es interesante. ¿Cómo afecta eso a tu día a día?',
            'Veo que eso es importante. ¿Qué pasaría si no se resuelve?'
        ],
        successRate: 0.85
    },
    {
        id: 'challenger',
        name: 'Challenger Sale',
        description: 'Desafiar las suposiciones del cliente y enseñar nueva perspectiva',
        triggerConditions: ['cliente_complaciente', 'mercado_competitivo', 'necesidad_cambiar'],
        responseTemplates: [
            'Muchos clientes pensaban como tú, pero descubrieron que...',
            '¿Sabías que la mayoría de nuestros clientes ahorran hasta 30% con esta solución?',
            'El enfoque tradicional ya no funciona. Déjame mostrarte por qué...'
        ],
        successRate: 0.78
    },
    {
        id: 'storytelling',
        name: 'Storytelling',
        description: 'Contar historias para conectar emocionalmente con el cliente',
        triggerConditions: ['cliente_emocional', 'relación_inicial', 'testimonial'],
        responseTemplates: [
            'Déjame contarte la historia de Juan, que estaba en tu misma situación...',
            'Tuve un cliente que empezó igual que tú y ahora...',
            'Imagina que ya tienes el producto. ¿Cómo cambiaría tu día?'
        ],
        successRate: 0.82
    },
    {
        id: 'social_proof',
        name: 'Prueba Social',
        description: 'Usar testimonios y casos de éxito para generar confianza',
        triggerConditions: ['cliente_dudoso', 'primera_vez', 'confianza_baja'],
        responseTemplates: [
            'Más de 500 clientes ya han elegido esta solución con excelentes resultados',
            'Nuestros clientes reportan un ahorro promedio del 25%',
            'Lee lo que dice María: "Me cambió completamente la forma de trabajar"'
        ],
        successRate: 0.88
    },
    {
        id: 'scarcity',
        name: 'Escasez y Urgencia',
        description: 'Crear sensación de urgencia para acelerar la decisión',
        triggerConditions: ['cliente_indeciso', 'stock_limitado', 'oferta_temporal'],
        responseTemplates: [
            'Solo quedan 3 unidades con este precio especial',
            'Esta oferta termina en 24 horas',
            'Los primeros 10 clientes reciben envío gratis hoy mismo'
        ],
        successRate: 0.76
    },
    {
        id: 'objection_reframe',
        name: 'Reframing de Objeciones',
        description: 'Convertir objeciones en oportunidades de venta',
        triggerConditions: ['objeción_precio', 'objeción_tiempo', 'objeción_confianza'],
        responseTemplates: [
            'Entiendo tu preocupación por el precio. ¿Qué valor le das a ahorrar 5 horas semanales?',
            'El tiempo de implementación es mínimo comparado con los beneficios a largo plazo',
            'Más de 95% de nuestros clientes estaban igual de preocupados al inicio'
        ],
        successRate: 0.91
    }
];
// ============ MOTOR PRINCIPAL ============
class ProfessionalSalesEngine {
    /**
     * Inicializar perfil de cliente basado en conversación
     */
    static async initializeCustomerProfile(customerId, initialMessage, conversationHistory) {
        // Analizar personalidad basado en mensajes
        const personalityType = this.analyzePersonality(initialMessage, conversationHistory);
        const buyingStyle = this.analyzeBuyingStyle(initialMessage, conversationHistory);
        const profile = {
            customerId,
            personalityType,
            buyingStyle,
            decisionFactors: [],
            objections: [],
            interests: this.extractInterests(initialMessage)
        };
        this.customerProfiles.set(customerId, profile);
        return profile;
    }
    /**
     * Seleccionar rol profesional apropiado según contexto
     */
    static selectProfessionalRole(customerProfile, conversationStage, productType) {
        // Lógica de selección de rol basada en perfil del cliente
        if (conversationStage === 'awareness' || conversationStage === 'interest') {
            if (customerProfile.personalityType === 'analytical') {
                return PROFESSIONAL_ROLES.find(r => r.id === 'product_expert');
            }
            return PROFESSIONAL_ROLES.find(r => r.id === 'sales_consultant');
        }
        if (conversationStage === 'consideration') {
            if (customerProfile.buyingStyle === 'emotional') {
                return PROFESSIONAL_ROLES.find(r => r.id === 'relationship_builder');
            }
            return PROFESSIONAL_ROLES.find(r => r.id === 'sales_consultant');
        }
        if (conversationStage === 'decision' || conversationStage === 'action') {
            return PROFESSIONAL_ROLES.find(r => r.id === 'closing_specialist');
        }
        return PROFESSIONAL_ROLES[0]; // Default
    }
    /**
     * Generar respuesta profesional usando técnicas avanzadas
     */
    static async generateProfessionalResponse(customerId, message, context, productInfo) {
        const { role, customer, conversationStage } = context;
        // Seleccionar técnica apropiada
        const technique = this.selectSalesTechnique(message, context);
        if (!technique) {
            // Respuesta por defecto usando personalidad del rol
            return Personality.generateNaturalResponse({
                baseMessage: `Entiendo. ¿En qué más puedo ayudarte?`,
                context: { conversationCount: context.techniquesUsed.length }
            });
        }
        // Generar respuesta usando la técnica seleccionada
        const response = await this.applySalesTechnique(technique, message, context, productInfo);
        // Aplicar personalidad del rol profesional
        const professionalResponse = this.applyRolePersonality(response, role);
        // Actualizar contexto
        context.techniquesUsed.push(technique.id);
        return professionalResponse;
    }
    /**
     * Aplicar técnica de venta específica
     */
    static async applySalesTechnique(technique, message, context, productInfo) {
        const { customer, product } = context;
        switch (technique.id) {
            case 'SPIN':
                return this.applySPINSelling(message, customer, product);
            case 'challenger':
                return this.applyChallengerSale(message, customer, product);
            case 'storytelling':
                return this.applyStorytelling(message, customer, product);
            case 'social_proof':
                return this.applySocialProof(message, customer, product);
            case 'scarcity':
                return this.applyScarcity(message, customer, product);
            case 'objection_reframe':
                return this.applyObjectionReframing(message, customer, product);
            default:
                return this.applyDefaultTechnique(message, context);
        }
    }
    /**
     * Aplicar técnica SPIN Selling
     */
    static applySPINSelling(message, customer, product) {
        const spinQuestions = {
            situational: [
                '¿Me podrías contar cómo usas actualmente este tipo de productos?',
                '¿Cuántas personas usan algo similar en tu entorno?',
                '¿Desde cuándo tienes esta necesidad?'
            ],
            problem: [
                '¿Qué problemas encuentras con tu solución actual?',
                '¿Qué te gustaría mejorar de tu proceso actual?',
                '¿Qué te impide lograr tus objetivos?'
            ],
            implication: [
                '¿Cómo afecta eso a tu productividad?',
                '¿Qué impacto tiene en tus resultados?',
                '¿Cómo se traduce eso en costos o tiempo perdido?'
            ],
            need: [
                '¿Qué sería ideal para resolver esto?',
                '¿Qué características son críticas para ti?',
                '¿Qué resultado esperas lograr?'
            ]
        };
        // Seleccionar tipo de pregunta SPIN basado en contexto
        const questionType = this.determineSPINQuestionType(message, customer);
        const questions = spinQuestions[questionType];
        const question = questions[Math.floor(Math.random() * questions.length)];
        return Personality.generateNaturalResponse({
            baseMessage: question,
            addEmpathy: 'question'
        });
    }
    /**
     * Aplicar venta Challenger
     */
    static applyChallengerSale(message, customer, product) {
        const challengerResponses = [
            `Muchos clientes como tú pensaban que ${this.extractAssumption(message)}, pero descubrieron que nuestra solución ofrece beneficios inesperados.`,
            `El enfoque tradicional ya no es suficiente. Déjame mostrarte cómo ${product?.name || 'nuestro producto'} revoluciona este proceso.`,
            `¿Sabías que el 70% de nuestros clientes ahorran hasta 40% en costos operativos con esta solución?`
        ];
        const response = challengerResponses[Math.floor(Math.random() * challengerResponses.length)];
        return Personality.generateNaturalResponse({
            baseMessage: response,
            context: { hasProductMatch: true }
        });
    }
    /**
     * Aplicar Storytelling
     */
    static applyStorytelling(message, customer, product) {
        const stories = [
            `Tuve un cliente en tu misma situación. Buscaba exactamente lo mismo que tú, y después de implementar ${product?.name || 'nuestra solución'}, me contó que le cambió completamente su forma de trabajar.`,
            `Déjame contarte la historia de Ana, que empezó igual que tú. Al principio era escéptica, pero ahora no puede imaginarse sin ${product?.name || 'nuestro producto'}.`,
            `Imagina que ya tienes ${product?.name || 'nuestro producto'}. ¿Cómo sería tu día? ¿Qué cambiaría?`
        ];
        const story = stories[Math.floor(Math.random() * stories.length)];
        return Personality.generateNaturalResponse({
            baseMessage: story,
            context: { hasProductMatch: true }
        });
    }
    /**
     * Aplicar Prueba Social
     */
    static applySocialProof(message, customer, product) {
        const socialProofs = [
            `Más de 500 clientes ya han elegido ${product?.name || 'nuestra solución'} y reportan un promedio de 85% de satisfacción.`,
            `Nuestros clientes ahorran en promedio $500.000 mensuales después de implementar ${product?.name || 'nuestra solución'}.`,
            `"${product?.name || 'Esta solución'} me ha permitido duplicar mi productividad" - Testimonio de cliente verificado.`
        ];
        const proof = socialProofs[Math.floor(Math.random() * socialProofs.length)];
        return Personality.generateNaturalResponse({
            baseMessage: proof,
            context: { hasProductMatch: true }
        });
    }
    /**
     * Aplicar Escasez
     */
    static applyScarcity(message, customer, product) {
        const scarcityTactics = [
            `Solo quedan 5 unidades de ${product?.name || 'este producto'} con el precio especial de lanzamiento.`,
            `Esta oferta promocional termina en las próximas 24 horas. Después volverá al precio regular.`,
            `Los primeros 10 clientes que compren hoy reciben envío gratuito + 6 meses de soporte premium.`
        ];
        const tactic = scarcityTactics[Math.floor(Math.random() * scarcityTactics.length)];
        return Personality.generateNaturalResponse({
            baseMessage: tactic,
            context: { hasProductMatch: true },
            addClose: true
        });
    }
    /**
     * Aplicar Reframing de Objeciones
     */
    static applyObjectionReframing(message, customer, product) {
        const objectionType = this.classifyObjection(message);
        const reframes = {
            price: `Entiendo que el precio es importante. Pero considera que ${product?.name || 'nuestra solución'} te ahorra $300.000 mensuales. ¿Cuánto tiempo tardarías en recuperar la inversión?`,
            time: `El tiempo de implementación es mínimo comparado con los años de beneficios que obtendrás.`,
            trust: `Más del 95% de nuestros clientes estaban igual de preocupados al inicio, pero ahora son nuestros mejores referentes.`
        };
        const reframe = reframes[objectionType] || `Veo tu punto. Déjame mostrarte cómo otros clientes superaron esa misma preocupación.`;
        return Personality.generateNaturalResponse({
            baseMessage: reframe,
            addEmpathy: 'objection'
        });
    }
    // ============ MÉTODOS AUXILIARES ============
    /**
     * Analizar personalidad del cliente
     */
    static analyzePersonality(message, history) {
        const text = (message + ' ' + history.map(h => h.content).join(' ')).toLowerCase();
        // Análisis basado en patrones de lenguaje
        if (text.includes('datos') || text.includes('análisis') || text.includes('especificaciones')) {
            return 'analytical';
        }
        if (text.includes('rápido') || text.includes('eficiente') || text.includes('resultados')) {
            return 'driver';
        }
        if (text.includes('amigos') || text.includes('familia') || text.includes('agradable')) {
            return 'amiable';
        }
        return 'expressive'; // Default
    }
    /**
     * Analizar estilo de compra
     */
    static analyzeBuyingStyle(message, history) {
        const text = (message + ' ' + history.map(h => h.content).join(' ')).toLowerCase();
        if (text.includes('beneficios') || text.includes('valor') || text.includes('inversión')) {
            return 'logical';
        }
        if (text.includes('siento') || text.includes('me gusta') || text.includes('encanta')) {
            return 'emotional';
        }
        if (text.includes('práctico') || text.includes('fácil') || text.includes('simple')) {
            return 'practical';
        }
        return 'spontaneous';
    }
    /**
     * Extraer intereses del mensaje
     */
    static extractInterests(message) {
        const interests = [];
        const text = message.toLowerCase();
        if (text.includes('precio') || text.includes('costo'))
            interests.push('precio');
        if (text.includes('calidad') || text.includes('premium'))
            interests.push('calidad');
        if (text.includes('garantía') || text.includes('soporte'))
            interests.push('garantía');
        if (text.includes('envío') || text.includes('entrega'))
            interests.push('envío');
        return interests;
    }
    /**
     * Seleccionar técnica de venta apropiada
     */
    static selectSalesTechnique(message, context) {
        const { conversationStage, techniquesUsed, customer } = context;
        const normalizedMessage = message.toLowerCase();
        // Evitar repetir técnicas recientemente usadas
        const recentTechniques = techniquesUsed.slice(-3);
        for (const technique of SALES_TECHNIQUES) {
            // Verificar si la técnica ya fue usada recientemente
            if (recentTechniques.includes(technique.id))
                continue;
            // Verificar condiciones de activación
            const matchesConditions = technique.triggerConditions.some(condition => {
                switch (condition) {
                    case 'primera_interacción':
                        return conversationStage === 'awareness';
                    case 'cliente_indeciso':
                        return normalizedMessage.includes('pensar') || normalizedMessage.includes('ver');
                    case 'objeción_precio':
                        return this.classifyObjection(message) === 'price';
                    case 'cliente_emocional':
                        return customer.buyingStyle === 'emotional';
                    case 'cliente_dudoso':
                        return normalizedMessage.includes('confianza') || normalizedMessage.includes('seguro');
                    default:
                        return false;
                }
            });
            if (matchesConditions) {
                return technique;
            }
        }
        return null;
    }
    /**
     * Aplicar personalidad del rol profesional
     */
    static applyRolePersonality(response, role) {
        return Personality.generateNaturalResponse({
            baseMessage: response,
            context: {
                customerName: role.personalityTraits.name,
                conversationCount: 0
            }
        });
    }
    /**
     * Determinar tipo de pregunta SPIN
     */
    static determineSPINQuestionType(message, customer) {
        const text = message.toLowerCase();
        if (text.includes('cómo') || text.includes('dónde') || text.includes('cuándo')) {
            return 'situational';
        }
        if (text.includes('problema') || text.includes('dificultad') || text.includes('no')) {
            return 'problem';
        }
        if (text.includes('afecta') || text.includes('impacta') || text.includes('consecuencia')) {
            return 'implication';
        }
        return 'need';
    }
    /**
     * Clasificar objeción
     */
    static classifyObjection(message) {
        const text = message.toLowerCase();
        if (text.includes('precio') || text.includes('caro') || text.includes('cuesta')) {
            return 'price';
        }
        if (text.includes('tiempo') || text.includes('esperar') || text.includes('lento')) {
            return 'time';
        }
        return 'trust';
    }
    /**
     * Extraer suposición del mensaje para Challenger
     */
    static extractAssumption(message) {
        // Lógica simple para extraer suposiciones comunes
        const assumptions = [
            'el precio es lo más importante',
            'las cosas baratas son de mala calidad',
            'no necesito cambiar mi forma actual de trabajar'
        ];
        return assumptions[Math.floor(Math.random() * assumptions.length)];
    }
    /**
     * Aplicar técnica por defecto
     */
    static applyDefaultTechnique(message, context) {
        return Personality.generateNaturalResponse({
            baseMessage: 'Entiendo. ¿En qué más puedo ayudarte para tomar la mejor decisión?',
            context: { hasProductMatch: true }
        });
    }
    // ============ APRENDIZAJE CONTINUO ============
    /**
     * Registrar resultado de interacción para aprendizaje
     */
    static async recordInteractionResult(customerId, techniqueUsed, success, feedback) {
        const learningKey = `${customerId}_${techniqueUsed}`;
        const currentData = this.learningData.get(learningKey) || { attempts: 0, successes: 0 };
        currentData.attempts++;
        if (success)
            currentData.successes++;
        this.learningData.set(learningKey, currentData);
        // Actualizar tasa de éxito de la técnica
        const technique = SALES_TECHNIQUES.find(t => t.id === techniqueUsed);
        if (technique) {
            technique.successRate = currentData.successes / currentData.attempts;
        }
    }
    /**
     * Obtener estadísticas de rendimiento
     */
    static getPerformanceStats() {
        const stats = {
            totalInteractions: 0,
            successfulInteractions: 0,
            techniquePerformance: {}
        };
        for (const [key, data] of this.learningData) {
            stats.totalInteractions += data.attempts;
            stats.successfulInteractions += data.successes;
            const technique = key.split('_')[1];
            if (!stats.techniquePerformance[technique]) {
                stats.techniquePerformance[technique] = { attempts: 0, successes: 0 };
            }
            stats.techniquePerformance[technique].attempts += data.attempts;
            stats.techniquePerformance[technique].successes += data.successes;
        }
        return stats;
    }
}
exports.ProfessionalSalesEngine = ProfessionalSalesEngine;
ProfessionalSalesEngine.customerProfiles = new Map();
ProfessionalSalesEngine.salesContexts = new Map();
ProfessionalSalesEngine.learningData = new Map();
// ============ INTEGRACIÓN CON SISTEMA EXISTENTE ============
async function enhanceBotWithProfessionalSales(userId, customerId, message, conversationHistory) {
    // Inicializar perfil si no existe
    let customerProfile = ProfessionalSalesEngine['customerProfiles'].get(customerId);
    if (!customerProfile) {
        customerProfile = await ProfessionalSalesEngine.initializeCustomerProfile(customerId, message, conversationHistory);
    }
    // Determinar etapa de conversación
    const conversationStage = determineConversationStage(conversationHistory);
    // Seleccionar rol apropiado
    const role = ProfessionalSalesEngine.selectProfessionalRole(customerProfile, conversationStage, 'general' // TODO: Determinar tipo de producto
    );
    // Crear contexto de ventas
    const salesContext = {
        role,
        customer: customerProfile,
        product: null, // TODO: Obtener producto relevante
        conversationStage: conversationStage,
        techniquesUsed: [],
        objectionsHandled: [],
        valueProposition: '',
        urgencyLevel: 'medium'
    };
    // Generar respuesta profesional
    const professionalResponse = await ProfessionalSalesEngine.generateProfessionalResponse(customerId, message, salesContext);
    return professionalResponse;
}
/**
 * Determinar etapa de conversación
 */
function determineConversationStage(history) {
    if (history.length === 0)
        return 'awareness';
    if (history.length <= 2)
        return 'interest';
    if (history.length <= 5)
        return 'consideration';
    if (history.some(h => h.content.toLowerCase().includes('comprar') || h.content.toLowerCase().includes('pedido'))) {
        return 'decision';
    }
    return 'action';
}
