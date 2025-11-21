"use strict";
/**
 * 📚 SERVICIO DE FAQ DE PRODUCTOS
 *
 * Responde preguntas frecuentes sobre productos usando base de conocimiento
 * Sin necesidad de usar IA para cada pregunta
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductFAQService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ProductFAQService {
    /**
     * Inicializar base de conocimiento
     */
    static async initialize() {
        if (this.initialized)
            return;
        try {
            const knowledgeDir = path_1.default.join(process.cwd(), 'knowledge-base');
            if (!fs_1.default.existsSync(knowledgeDir)) {
                console.log('[ProductFAQ] Directorio knowledge-base no existe');
                return;
            }
            const files = fs_1.default.readdirSync(knowledgeDir).filter(f => f.endsWith('.json'));
            for (const file of files) {
                const filePath = path_1.default.join(knowledgeDir, file);
                const content = fs_1.default.readFileSync(filePath, 'utf-8');
                const knowledge = JSON.parse(content);
                this.knowledgeBase.set(knowledge.productId.toLowerCase(), knowledge);
                console.log(`[ProductFAQ] ✅ Cargado: ${knowledge.producto}`);
            }
            this.initialized = true;
            console.log(`[ProductFAQ] ✅ Base de conocimiento inicializada con ${this.knowledgeBase.size} productos`);
        }
        catch (error) {
            console.error('[ProductFAQ] Error inicializando:', error);
        }
    }
    /**
     * Buscar respuesta en FAQ
     */
    static async findAnswer(productId, question) {
        await this.initialize();
        const knowledge = this.knowledgeBase.get(productId.toLowerCase());
        if (!knowledge) {
            return { found: false, confidence: 0 };
        }
        const questionLower = question.toLowerCase();
        let bestMatch = null;
        let bestScore = 0;
        // Buscar en FAQs
        for (const faq of knowledge.faqs) {
            let score = 0;
            // Verificar keywords
            for (const keyword of faq.keywords) {
                if (questionLower.includes(keyword.toLowerCase())) {
                    score += 2;
                }
            }
            // Verificar similitud con la pregunta
            const preguntaWords = faq.pregunta.toLowerCase().split(' ');
            for (const word of preguntaWords) {
                if (word.length > 3 && questionLower.includes(word)) {
                    score += 1;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = faq;
            }
        }
        if (bestMatch && bestScore >= 2) {
            return {
                found: true,
                answer: bestMatch.respuesta,
                confidence: Math.min(bestScore / 5, 1)
            };
        }
        return { found: false, confidence: 0 };
    }
    /**
     * Obtener información adicional del producto
     */
    static async getProductInfo(productId) {
        await this.initialize();
        return this.knowledgeBase.get(productId.toLowerCase()) || null;
    }
    /**
     * Obtener todas las FAQs de un producto
     */
    static async getAllFAQs(productId) {
        await this.initialize();
        const knowledge = this.knowledgeBase.get(productId.toLowerCase());
        return knowledge?.faqs || [];
    }
    /**
     * Buscar producto por nombre
     */
    static async findProductByName(productName) {
        await this.initialize();
        const nameLower = productName.toLowerCase();
        for (const [, knowledge] of this.knowledgeBase) {
            if (knowledge.producto.toLowerCase().includes(nameLower) ||
                nameLower.includes(knowledge.producto.toLowerCase())) {
                return knowledge;
            }
        }
        return null;
    }
    /**
     * Generar respuesta enriquecida con información del producto
     */
    static enrichAnswer(answer, knowledge) {
        let enriched = answer;
        // Agregar link de pago si la respuesta menciona pago
        if (knowledge.linkPago &&
            (answer.includes('pago') || answer.includes('comprar') || answer.includes('precio'))) {
            if (!answer.includes(knowledge.linkPago)) {
                enriched += `\n\n👉 Link de pago: ${knowledge.linkPago}`;
            }
        }
        return enriched;
    }
    /**
     * Detectar si una pregunta es sobre FAQ
     */
    static isFAQQuestion(message) {
        const faqPatterns = [
            /\b(cómo|como)\b/i,
            /\b(qué|que)\b/i,
            /\b(cuánto|cuanto)\b/i,
            /\b(puedo|puede)\b/i,
            /\b(necesito|necesita)\b/i,
            /\b(tiene|tienen)\b/i,
            /\b(incluye|incluyen)\b/i,
            /\b(dura|duración)\b/i,
            /\b(acceso)\b/i,
            /\b(certificado)\b/i,
            /\b(garantía|garantia)\b/i,
            /\b(soporte|ayuda)\b/i,
            /\?$/
        ];
        return faqPatterns.some(pattern => pattern.test(message));
    }
}
exports.ProductFAQService = ProductFAQService;
ProductFAQService.knowledgeBase = new Map();
ProductFAQService.initialized = false;
