"use strict";
/**
 * Servicio de Asesoría Inteligente
 * Usa la base de conocimiento para dar respuestas informadas y reales
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligentAdvisorService = void 0;
const product_knowledge_base_1 = require("./product-knowledge-base");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class IntelligentAdvisorService {
    /**
     * Genera una respuesta de asesoría basada en conocimiento real del producto
     */
    static async generateAdvisoryResponse(productIds, customerQuestion, context = '') {
        try {
            if (productIds.length === 0) {
                return this.generateGeneralResponse(customerQuestion);
            }
            // Obtener conocimiento de los productos
            const knowledgeList = [];
            for (const productId of productIds.slice(0, 3)) { // Máximo 3 productos
                const knowledge = await product_knowledge_base_1.ProductKnowledgeBaseService.getProductKnowledge(productId);
                if (knowledge) {
                    knowledgeList.push(knowledge);
                }
            }
            if (knowledgeList.length === 0) {
                return this.generateGeneralResponse(customerQuestion);
            }
            // Detectar tipo de pregunta
            const questionType = this.detectQuestionType(customerQuestion);
            // Generar respuesta según el tipo
            return await this.generateResponseByType(questionType, knowledgeList, customerQuestion, context);
        }
        catch (error) {
            console.error('Error en asesoría inteligente:', error);
            return '';
        }
    }
    /**
     * Detecta el tipo de pregunta del cliente
     */
    static detectQuestionType(question) {
        const q = question.toLowerCase();
        if (q.includes('precio') || q.includes('cuesta') || q.includes('valor') || q.includes('cuánto')) {
            return 'PRICE';
        }
        if (q.includes('incluye') || q.includes('qué tiene') || q.includes('contenido') || q.includes('características')) {
            return 'FEATURES';
        }
        if (q.includes('cómo') || q.includes('como') || q.includes('proceso') || q.includes('funciona')) {
            return 'HOW_TO';
        }
        if (q.includes('garantía') || q.includes('garantia') || q.includes('devolución') || q.includes('devolucion')) {
            return 'WARRANTY';
        }
        if (q.includes('pago') || q.includes('forma') || q.includes('método') || q.includes('metodo')) {
            return 'PAYMENT';
        }
        if (q.includes('entrega') || q.includes('envío') || q.includes('envio') || q.includes('recibo')) {
            return 'DELIVERY';
        }
        if (q.includes('diferencia') || q.includes('mejor') || q.includes('comparar') || q.includes('vs')) {
            return 'COMPARISON';
        }
        if (q.includes('para qué') || q.includes('para que') || q.includes('sirve') || q.includes('usar')) {
            return 'USE_CASE';
        }
        if (q.includes('requisito') || q.includes('necesito') || q.includes('debo')) {
            return 'REQUIREMENTS';
        }
        return 'GENERAL';
    }
    /**
     * Genera respuesta según el tipo de pregunta
     */
    static async generateResponseByType(type, knowledgeList, question, context) {
        const knowledge = knowledgeList[0]; // Producto principal
        switch (type) {
            case 'PRICE':
                return this.generatePriceResponse(knowledge);
            case 'FEATURES':
                return this.generateFeaturesResponse(knowledge);
            case 'HOW_TO':
                return this.generateHowToResponse(knowledge);
            case 'WARRANTY':
                return this.generateWarrantyResponse(knowledge);
            case 'PAYMENT':
                return this.generatePaymentResponse(knowledge);
            case 'DELIVERY':
                return this.generateDeliveryResponse(knowledge);
            case 'COMPARISON':
                return this.generateComparisonResponse(knowledgeList);
            case 'USE_CASE':
                return this.generateUseCaseResponse(knowledge);
            case 'REQUIREMENTS':
                return this.generateRequirementsResponse(knowledge);
            default:
                return this.generateGeneralProductResponse(knowledge, question);
        }
    }
    /**
     * Respuesta sobre precio
     */
    static async generatePriceResponse(knowledge) {
        const product = await prisma.product.findUnique({
            where: { id: knowledge.productId }
        });
        if (!product)
            return '';
        const priceFormatted = `$${product.price.toLocaleString('es-CO')} COP`;
        let response = `El ${knowledge.productName} tiene un precio de ${priceFormatted}. `;
        // Agregar contexto según categoría
        if (knowledge.category === 'DIGITAL') {
            response += `Es un producto digital, así que después de pagar recibes acceso inmediato. `;
            if (knowledge.productName.includes('Mega Pack')) {
                response += `Este megapack incluye múltiples cursos y recursos, por lo que el precio es súper accesible considerando todo lo que obtienes. `;
            }
        }
        else {
            response += `Es un producto físico. `;
            if (knowledge.productName.toLowerCase().includes('moto')) {
                response += `El precio es negociable y podemos conversar sobre facilidades de pago. `;
            }
        }
        // Agregar diferenciadores de precio
        if (knowledge.differentiators.length > 0) {
            response += `\n\n💡 ${knowledge.differentiators[0]}`;
        }
        return response;
    }
    /**
     * Respuesta sobre características
     */
    static generateFeaturesResponse(knowledge) {
        let response = `El ${knowledge.productName} incluye:\n\n`;
        knowledge.keyFeatures.slice(0, 5).forEach((feature, index) => {
            response += `${index + 1}. ${feature}\n`;
        });
        if (knowledge.benefits.length > 0) {
            response += `\n✨ Beneficios principales:\n`;
            knowledge.benefits.slice(0, 3).forEach(benefit => {
                response += `• ${benefit}\n`;
            });
        }
        return Promise.resolve(response);
    }
    /**
     * Respuesta sobre cómo funciona
     */
    static generateHowToResponse(knowledge) {
        let response = '';
        if (knowledge.category === 'DIGITAL') {
            response = `Te explico cómo funciona con el ${knowledge.productName}:\n\n`;
            response += `1️⃣ Confirmas tu pedido aquí por WhatsApp\n`;
            response += `2️⃣ Realizas el pago (te envío los datos)\n`;
            response += `3️⃣ Me envías el comprobante\n`;
            response += `4️⃣ Te envío el acceso inmediatamente\n\n`;
            response += `Todo el proceso toma menos de 10 minutos y tienes acceso de por vida. `;
        }
        else {
            response = `El proceso para adquirir ${knowledge.productName} es:\n\n`;
            response += `1️⃣ Puedes venir a verlo sin compromiso\n`;
            response += `2️⃣ Si te gusta, acordamos el precio\n`;
            response += `3️⃣ Realizas el pago\n`;
            response += `4️⃣ Te lo llevas inmediatamente\n\n`;
            response += `Estamos en Cali, Centro Comercial El Diamante 2, San Nicolás. `;
        }
        return Promise.resolve(response);
    }
    /**
     * Respuesta sobre garantía
     */
    static generateWarrantyResponse(knowledge) {
        // Buscar en preguntas comunes
        const warrantyQA = knowledge.commonQuestions.find(qa => qa.question.toLowerCase().includes('garantía') ||
            qa.question.toLowerCase().includes('garantia'));
        if (warrantyQA) {
            return Promise.resolve(warrantyQA.answer);
        }
        let response = `Sobre la garantía del ${knowledge.productName}:\n\n`;
        if (knowledge.category === 'DIGITAL') {
            response += `✅ Si el contenido no cumple tus expectativas, te devolvemos tu dinero en las primeras 24 horas sin preguntas.\n\n`;
            response += `Además, si tienes algún problema con el acceso o descarga, te ayudamos hasta que todo funcione perfecto.`;
        }
        else {
            response += `✅ El producto incluye garantía según las condiciones del fabricante.\n\n`;
            response += `Te damos todos los detalles de la garantía al momento de la compra.`;
        }
        return Promise.resolve(response);
    }
    /**
     * Respuesta sobre métodos de pago
     */
    static generatePaymentResponse(knowledge) {
        let response = `Para el ${knowledge.productName} aceptamos:\n\n`;
        response += `💳 Tarjetas de crédito/débito\n`;
        response += `🏦 Transferencia bancaria\n`;
        response += `📱 Nequi\n`;
        response += `📱 Daviplata\n`;
        response += `💰 Efectivo (si vienes presencial)\n`;
        response += `🌐 PayPal\n`;
        response += `🛒 MercadoPago\n\n`;
        response += `Elige el que más te convenga y te envío los datos. `;
        return Promise.resolve(response);
    }
    /**
     * Respuesta sobre entrega
     */
    static generateDeliveryResponse(knowledge) {
        let response = '';
        if (knowledge.category === 'DIGITAL') {
            response = `La entrega del ${knowledge.productName} es inmediata:\n\n`;
            response += `⚡ Apenas confirmo tu pago, te envío el enlace de acceso por WhatsApp\n`;
            response += `📥 Puedes descargar todo el contenido inmediatamente\n`;
            response += `⏰ El proceso completo toma menos de 10 minutos\n\n`;
            response += `No hay esperas ni envíos físicos, todo es digital e instantáneo.`;
        }
        else {
            response = `Para ${knowledge.productName}:\n\n`;
            response += `📍 Puedes venir a recogerlo en Cali (Centro Comercial El Diamante 2)\n`;
            response += `🚚 O podemos coordinar envío a tu ciudad\n\n`;
            response += `Si eres de Cali, te lo puedes llevar el mismo día.`;
        }
        return Promise.resolve(response);
    }
    /**
     * Respuesta de comparación
     */
    static generateComparisonResponse(knowledgeList) {
        if (knowledgeList.length < 2) {
            return Promise.resolve('Para comparar productos, necesito que me digas cuáles te interesan específicamente.');
        }
        const k1 = knowledgeList[0];
        const k2 = knowledgeList[1];
        let response = `Comparando ${k1.productName} vs ${k2.productName}:\n\n`;
        response += `📦 ${k1.productName}:\n`;
        response += `• ${k1.shortDescription}\n`;
        k1.keyFeatures.slice(0, 3).forEach(f => response += `• ${f}\n`);
        response += `\n📦 ${k2.productName}:\n`;
        response += `• ${k2.shortDescription}\n`;
        k2.keyFeatures.slice(0, 3).forEach(f => response += `• ${f}\n`);
        response += `\n¿Cuál te llama más la atención o qué aspecto específico quieres que compare?`;
        return Promise.resolve(response);
    }
    /**
     * Respuesta sobre casos de uso
     */
    static generateUseCaseResponse(knowledge) {
        let response = `El ${knowledge.productName} es perfecto para:\n\n`;
        knowledge.useCases.forEach((useCase, index) => {
            response += `${index + 1}. ${useCase}\n`;
        });
        if (knowledge.targetAudience.length > 0) {
            response += `\n👥 Ideal para:\n`;
            knowledge.targetAudience.slice(0, 3).forEach(audience => {
                response += `• ${audience}\n`;
            });
        }
        response += `\n¿Alguno de estos casos aplica para ti?`;
        return Promise.resolve(response);
    }
    /**
     * Respuesta sobre requisitos
     */
    static generateRequirementsResponse(knowledge) {
        let response = `Para ${knowledge.productName}:\n\n`;
        if (knowledge.requirements && knowledge.requirements.length > 0) {
            response += `📋 Requisitos:\n`;
            knowledge.requirements.forEach(req => {
                response += `• ${req}\n`;
            });
        }
        else if (knowledge.category === 'DIGITAL') {
            response += `📋 Solo necesitas:\n`;
            response += `• Un dispositivo con internet (PC, laptop, tablet o celular)\n`;
            response += `• Espacio para descargar el contenido\n`;
            response += `• Ganas de aprender 😊\n\n`;
            response += `No necesitas conocimientos previos, todo está explicado desde cero.`;
        }
        else {
            response += `No hay requisitos especiales. `;
            if (knowledge.productName.toLowerCase().includes('moto')) {
                response += `Solo necesitas licencia de conducción vigente para motos.`;
            }
        }
        return Promise.resolve(response);
    }
    /**
     * Respuesta general sobre el producto
     */
    static async generateGeneralProductResponse(knowledge, question) {
        // Buscar en preguntas comunes
        const answer = await product_knowledge_base_1.ProductKnowledgeBaseService.findAnswer(knowledge.productId, question);
        if (answer) {
            return answer;
        }
        // Respuesta general
        let response = `Sobre ${knowledge.productName}:\n\n`;
        response += knowledge.detailedDescription + '\n\n';
        if (knowledge.keyFeatures.length > 0) {
            response += `✨ Características principales:\n`;
            knowledge.keyFeatures.slice(0, 4).forEach(feature => {
                response += `• ${feature}\n`;
            });
        }
        response += `\n¿Hay algo específico que quieras saber?`;
        return response;
    }
    /**
     * Respuesta general sin producto específico
     */
    static generateGeneralResponse(question) {
        const q = question.toLowerCase();
        if (q.includes('precio') || q.includes('cuesta')) {
            return 'Los precios varían según el producto. ¿Qué producto te interesa específicamente?';
        }
        if (q.includes('pago')) {
            return 'Aceptamos múltiples formas de pago: tarjetas, transferencia, Nequi, Daviplata, PayPal y MercadoPago. ¿Qué producto te interesa?';
        }
        if (q.includes('entrega') || q.includes('envío')) {
            return 'Los productos digitales son entrega inmediata. Los físicos puedes recogerlos en Cali o coordinamos envío. ¿Qué producto te interesa?';
        }
        return 'Claro, con gusto te ayudo. ¿Qué producto te interesa para darte información específica?';
    }
}
exports.IntelligentAdvisorService = IntelligentAdvisorService;
