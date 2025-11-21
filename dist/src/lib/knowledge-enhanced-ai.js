"use strict";
/**
 * IA Mejorada con Base de Conocimiento
 * Integra la base de conocimiento de productos con las respuestas de IA
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeEnhancedAI = void 0;
const intelligent_advisor_service_1 = require("./intelligent-advisor-service");
const product_knowledge_base_1 = require("./product-knowledge-base");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class KnowledgeEnhancedAI {
    /**
     * Enriquece el contexto de IA con conocimiento real de productos
     */
    static async enrichContextWithKnowledge(productIds, customerMessage) {
        try {
            if (productIds.length === 0) {
                return '';
            }
            console.log(`[Knowledge] 🧠 Enriqueciendo contexto con ${productIds.length} productos`);
            // Obtener conocimiento de los productos
            const knowledgeContext = [];
            for (const productId of productIds.slice(0, 3)) {
                const knowledge = await product_knowledge_base_1.ProductKnowledgeBaseService.getProductKnowledge(productId);
                if (knowledge) {
                    // Crear contexto resumido del producto
                    let context = `\n📦 INFORMACIÓN REAL DE ${knowledge.productName}:\n`;
                    context += `Descripción: ${knowledge.shortDescription}\n`;
                    // Agregar características clave
                    if (knowledge.keyFeatures.length > 0) {
                        context += `Características:\n`;
                        knowledge.keyFeatures.slice(0, 4).forEach(f => {
                            context += `- ${f}\n`;
                        });
                    }
                    // Agregar beneficios
                    if (knowledge.benefits.length > 0) {
                        context += `Beneficios:\n`;
                        knowledge.benefits.slice(0, 3).forEach(b => {
                            context += `- ${b}\n`;
                        });
                    }
                    // Agregar preguntas comunes relevantes
                    const relevantQA = this.findRelevantQA(knowledge.commonQuestions, customerMessage);
                    if (relevantQA) {
                        context += `\nPregunta común relacionada:\n`;
                        context += `P: ${relevantQA.question}\n`;
                        context += `R: ${relevantQA.answer}\n`;
                    }
                    knowledgeContext.push(context);
                }
            }
            if (knowledgeContext.length > 0) {
                console.log(`[Knowledge] ✅ Contexto enriquecido con ${knowledgeContext.length} productos`);
                return '\n' + knowledgeContext.join('\n') + '\n';
            }
            return '';
        }
        catch (error) {
            console.error('[Knowledge] ❌ Error enriqueciendo contexto:', error);
            return '';
        }
    }
    /**
     * Genera respuesta directa usando la base de conocimiento
     */
    static async generateKnowledgeBasedResponse(productIds, customerMessage, context = '') {
        try {
            if (productIds.length === 0) {
                return null;
            }
            console.log('[Knowledge] 🎯 Intentando respuesta basada en conocimiento');
            // Intentar respuesta directa del asesor inteligente
            const response = await intelligent_advisor_service_1.IntelligentAdvisorService.generateAdvisoryResponse(productIds, customerMessage, context);
            if (response && response.length > 50) {
                console.log('[Knowledge] ✅ Respuesta generada desde base de conocimiento');
                return response;
            }
            return null;
        }
        catch (error) {
            console.error('[Knowledge] ❌ Error generando respuesta:', error);
            return null;
        }
    }
    /**
     * Busca preguntas comunes relevantes al mensaje del cliente
     */
    static findRelevantQA(commonQuestions, customerMessage) {
        const normalizedMessage = customerMessage.toLowerCase();
        // Palabras clave para cada tipo de pregunta
        const keywords = {
            precio: ['precio', 'cuesta', 'valor', 'cuánto', 'cuanto'],
            incluye: ['incluye', 'tiene', 'contenido', 'qué', 'que'],
            garantia: ['garantía', 'garantia', 'devolución', 'devolucion'],
            pago: ['pago', 'forma', 'método', 'metodo', 'tarjeta'],
            entrega: ['entrega', 'envío', 'envio', 'recibo', 'llega'],
            requisitos: ['requisito', 'necesito', 'debo', 'previo']
        };
        // Buscar coincidencias
        for (const qa of commonQuestions) {
            const normalizedQuestion = qa.question.toLowerCase();
            // Coincidencia directa
            if (normalizedMessage.includes(normalizedQuestion) ||
                normalizedQuestion.includes(normalizedMessage)) {
                return qa;
            }
            // Coincidencia por palabras clave
            for (const [type, words] of Object.entries(keywords)) {
                const messageHasKeyword = words.some(w => normalizedMessage.includes(w));
                const questionHasKeyword = words.some(w => normalizedQuestion.includes(w));
                if (messageHasKeyword && questionHasKeyword) {
                    return qa;
                }
            }
        }
        return null;
    }
    /**
     * Obtiene información técnica de un producto
     */
    static async getProductTechnicalInfo(productId) {
        try {
            const knowledge = await product_knowledge_base_1.ProductKnowledgeBaseService.getProductKnowledge(productId);
            if (!knowledge) {
                return '';
            }
            let info = '';
            if (knowledge.technicalSpecs) {
                info += '\n📋 Especificaciones Técnicas:\n';
                Object.entries(knowledge.technicalSpecs).forEach(([key, value]) => {
                    info += `• ${key}: ${value}\n`;
                });
            }
            if (knowledge.requirements && knowledge.requirements.length > 0) {
                info += '\n✅ Requisitos:\n';
                knowledge.requirements.forEach(req => {
                    info += `• ${req}\n`;
                });
            }
            return info;
        }
        catch (error) {
            console.error('[Knowledge] Error obteniendo info técnica:', error);
            return '';
        }
    }
    /**
     * Obtiene casos de uso de un producto
     */
    static async getProductUseCases(productId) {
        try {
            const knowledge = await product_knowledge_base_1.ProductKnowledgeBaseService.getProductKnowledge(productId);
            if (!knowledge || knowledge.useCases.length === 0) {
                return '';
            }
            let info = '\n🎯 Casos de uso:\n';
            knowledge.useCases.forEach((useCase, i) => {
                info += `${i + 1}. ${useCase}\n`;
            });
            if (knowledge.targetAudience.length > 0) {
                info += '\n👥 Ideal para:\n';
                knowledge.targetAudience.slice(0, 3).forEach(audience => {
                    info += `• ${audience}\n`;
                });
            }
            return info;
        }
        catch (error) {
            console.error('[Knowledge] Error obteniendo casos de uso:', error);
            return '';
        }
    }
    /**
     * Verifica si debe usar respuesta basada en conocimiento
     */
    static shouldUseKnowledgeBase(customerMessage) {
        const message = customerMessage.toLowerCase();
        // Preguntas específicas que se benefician de la base de conocimiento
        const knowledgeKeywords = [
            'qué incluye',
            'que incluye',
            'características',
            'especificaciones',
            'para qué sirve',
            'para que sirve',
            'cómo funciona',
            'como funciona',
            'requisitos',
            'necesito',
            'diferencia',
            'comparar',
            'mejor',
            'recomienda',
            'casos de uso',
            'para quién',
            'para quien'
        ];
        return knowledgeKeywords.some(keyword => message.includes(keyword));
    }
    /**
     * Genera instrucciones para la IA basadas en el conocimiento
     */
    static async generateKnowledgeInstructions(productIds, customerMessage) {
        try {
            if (productIds.length === 0) {
                return '';
            }
            let instructions = '\n🧠 INFORMACIÓN REAL DE PRODUCTOS (USA ESTA INFORMACIÓN):\n';
            instructions += 'IMPORTANTE: Usa SOLO la información real proporcionada aquí. NO inventes datos.\n\n';
            for (const productId of productIds.slice(0, 2)) {
                const product = await prisma.product.findUnique({
                    where: { id: productId }
                });
                if (!product)
                    continue;
                const knowledge = await product_knowledge_base_1.ProductKnowledgeBaseService.getProductKnowledge(productId);
                if (knowledge) {
                    instructions += `📦 ${knowledge.productName}:\n`;
                    instructions += `Precio: $${product.price.toLocaleString('es-CO')} COP\n`;
                    instructions += `Categoría: ${knowledge.category === 'DIGITAL' ? 'Producto Digital' : 'Producto Físico'}\n`;
                    instructions += `Descripción: ${knowledge.shortDescription}\n\n`;
                    // Agregar características si son relevantes
                    if (this.isAskingAboutFeatures(customerMessage)) {
                        instructions += `Características principales:\n`;
                        knowledge.keyFeatures.slice(0, 4).forEach(f => {
                            instructions += `• ${f}\n`;
                        });
                        instructions += '\n';
                    }
                    // Agregar beneficios si son relevantes
                    if (this.isAskingAboutBenefits(customerMessage)) {
                        instructions += `Beneficios:\n`;
                        knowledge.benefits.slice(0, 3).forEach(b => {
                            instructions += `• ${b}\n`;
                        });
                        instructions += '\n';
                    }
                    // Agregar casos de uso si son relevantes
                    if (this.isAskingAboutUseCases(customerMessage)) {
                        instructions += `Casos de uso:\n`;
                        knowledge.useCases.slice(0, 3).forEach(u => {
                            instructions += `• ${u}\n`;
                        });
                        instructions += '\n';
                    }
                }
            }
            instructions += '\n⚠️ RECUERDA: Usa SOLO esta información real. Si no sabes algo, di que puedes consultar.\n';
            return instructions;
        }
        catch (error) {
            console.error('[Knowledge] Error generando instrucciones:', error);
            return '';
        }
    }
    static isAskingAboutFeatures(message) {
        const m = message.toLowerCase();
        return m.includes('incluye') || m.includes('tiene') || m.includes('características') ||
            m.includes('especificaciones') || m.includes('qué') || m.includes('que');
    }
    static isAskingAboutBenefits(message) {
        const m = message.toLowerCase();
        return m.includes('beneficio') || m.includes('ventaja') || m.includes('por qué') ||
            m.includes('por que') || m.includes('para qué') || m.includes('para que');
    }
    static isAskingAboutUseCases(message) {
        const m = message.toLowerCase();
        return m.includes('usar') || m.includes('sirve') || m.includes('aplicar') ||
            m.includes('caso') || m.includes('ejemplo') || m.includes('para quién') ||
            m.includes('para quien');
    }
}
exports.KnowledgeEnhancedAI = KnowledgeEnhancedAI;
