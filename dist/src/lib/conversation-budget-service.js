"use strict";
/**
 * Servicio de Gestión de Presupuesto en Conversaciones
 *
 * Detecta el presupuesto del cliente y mantiene el contexto
 * para ofrecer alternativas adecuadas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationBudgetService = void 0;
class ConversationBudgetService {
    /**
     * Detectar si el cliente menciona un presupuesto o limitación económica
     */
    static detectBudgetConstraint(message) {
        const messageLower = message.toLowerCase();
        // Frases que indican limitación de presupuesto
        const budgetPhrases = [
            'no me alcanza',
            'muy caro',
            'muy costoso',
            'no tengo',
            'no puedo pagar',
            'es mucho',
            'demasiado caro',
            'fuera de mi presupuesto',
            'no me da',
            'no me llega',
            'mi presupuesto es',
            'tengo solo',
            'tengo hasta',
            'máximo',
            'como máximo'
        ];
        const hasBudgetConstraint = budgetPhrases.some(phrase => messageLower.includes(phrase));
        if (!hasBudgetConstraint) {
            return { hasBudget: false, maxBudget: null, reason: '' };
        }
        // Intentar extraer monto específico
        const numberPatterns = [
            /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:mil|k)/gi, // "500 mil", "1.5 millones"
            /(\d{1,3}(?:[.,]\d{3})*)\s*(?:millones?|m)/gi, // "2 millones", "1.5m"
            /(?:tengo|hasta|máximo)\s*(\d{1,3}(?:[.,]\d{3})*)/gi, // "tengo 800000"
            /\$?\s*(\d{1,3}(?:[.,]\d{3})*)/g // "$1.200.000"
        ];
        let maxBudget = null;
        for (const pattern of numberPatterns) {
            const match = pattern.exec(message);
            if (match) {
                let amount = match[1].replace(/[.,]/g, '');
                // Si menciona "mil" o "k", multiplicar por 1000
                if (messageLower.includes('mil') || messageLower.includes('k')) {
                    amount = (parseInt(amount) * 1000).toString();
                }
                // Si menciona "millones" o "m", multiplicar por 1000000
                if (messageLower.includes('millon') || messageLower.includes('m')) {
                    amount = (parseFloat(amount) * 1000000).toString();
                }
                maxBudget = parseInt(amount);
                break;
            }
        }
        return {
            hasBudget: true,
            maxBudget,
            reason: hasBudgetConstraint ? 'budget_constraint' : ''
        };
    }
    /**
     * Guardar contexto de presupuesto del cliente
     */
    static setBudgetContext(conversationKey, maxBudget, currentProductId, currentProductPrice, currentProductName) {
        this.budgetContexts.set(conversationKey, {
            maxBudget,
            currency: 'COP',
            lastProductId: currentProductId,
            lastProductPrice: currentProductPrice,
            lastProductName: currentProductName,
            timestamp: new Date()
        });
        console.log(`[Budget] 💰 Presupuesto guardado: ${maxBudget} COP para ${currentProductName}`);
    }
    /**
     * Obtener contexto de presupuesto
     */
    static getBudgetContext(conversationKey) {
        const context = this.budgetContexts.get(conversationKey);
        if (!context)
            return null;
        // Expirar después de 1 hora
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        if (context.timestamp < oneHourAgo) {
            this.budgetContexts.delete(conversationKey);
            return null;
        }
        return context;
    }
    /**
     * Limpiar contexto de presupuesto
     */
    static clearBudgetContext(conversationKey) {
        this.budgetContexts.delete(conversationKey);
    }
    /**
     * Generar respuesta cuando el cliente dice que no le alcanza
     */
    static generateBudgetResponse(currentProduct, maxBudget, cheaperAlternatives) {
        if (cheaperAlternatives.length === 0) {
            return `Entiendo tu situación 😊

Lamentablemente, ${currentProduct.name} es el producto más económico que tengo en esta categoría por el momento.

💰 Precio: ${currentProduct.price.toLocaleString('es-CO')} COP

¿Te gustaría que te avise cuando tenga opciones más económicas? O puedo mostrarte productos de otras categorías que podrían interesarte.`;
        }
        let response = `Entiendo perfectamente 😊\n\n`;
        if (maxBudget) {
            response += `Con un presupuesto de ${maxBudget.toLocaleString('es-CO')} COP, tengo estas opciones para ti:\n\n`;
        }
        else {
            response += `Tengo opciones más económicas que podrían interesarte:\n\n`;
        }
        // Mostrar máximo 3 alternativas
        cheaperAlternatives.slice(0, 3).forEach((product, index) => {
            response += `${index + 1}. **${product.name}**\n`;
            response += `   💰 ${product.price.toLocaleString('es-CO')} COP\n`;
            if (product.description) {
                // Mostrar solo primera línea de descripción
                const shortDesc = product.description.split('\n')[0].substring(0, 80);
                response += `   📝 ${shortDesc}${product.description.length > 80 ? '...' : ''}\n`;
            }
            response += `\n`;
        });
        response += `¿Cuál de estas opciones te interesa? 😊`;
        return response;
    }
}
exports.ConversationBudgetService = ConversationBudgetService;
ConversationBudgetService.budgetContexts = new Map();
