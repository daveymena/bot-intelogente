"use strict";
/**
 * 🚀 SISTEMA INTELIGENTE DE UPSELLING Y CROSS-SELLING
 *
 * Sistema avanzado que identifica oportunidades de venta adicional
 * basándose en el comportamiento del cliente, historial y patrones de compra.
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
exports.IntelligentUpselling = void 0;
exports.attemptIntelligentUpsell = attemptIntelligentUpsell;
const db_1 = require("./db");
const Personality = __importStar(require("./conversational-personality"));
class IntelligentUpselling {
    /**
     * Analizar comportamiento del cliente para oportunidades de upsell
     */
    static async analyzeCustomerBehavior(customerId, conversationHistory, purchaseHistory = []) {
        // Obtener o crear perfil de comportamiento
        let behavior = this.customerBehaviors.get(customerId);
        if (!behavior) {
            behavior = {
                customerId,
                interests: [],
                budget: 0,
                purchaseHistory,
                browsingHistory: [],
                objections: [],
                preferredCategories: [],
                lastPurchaseDate: new Date(),
                averageOrderValue: 0
            };
        }
        // Analizar intereses desde conversación
        behavior.interests = this.extractInterests(conversationHistory);
        // Analizar categorías preferidas
        behavior.preferredCategories = this.extractCategories(conversationHistory, purchaseHistory);
        // Calcular presupuesto aproximado
        behavior.budget = this.estimateBudget(conversationHistory, purchaseHistory);
        // Calcular valor promedio de orden
        behavior.averageOrderValue = this.calculateAverageOrderValue(purchaseHistory);
        // Actualizar historial de navegación
        behavior.browsingHistory = conversationHistory.map(h => ({
            product: h.productMentioned,
            timestamp: h.timestamp,
            action: h.action
        })).filter(h => h.product);
        this.customerBehaviors.set(customerId, behavior);
        return behavior;
    }
    /**
     * Generar oportunidades de upsell/cross-sell
     */
    static async generateUpsellOpportunities(customerId, currentProduct, context) {
        const opportunities = [];
        const { customerBehavior, conversationStage, purchaseIntent } = context;
        // 1. UPSELL: Producto superior en la misma categoría
        if (conversationStage === 'consideration' || purchaseIntent) {
            const upgradeOpportunities = await this.findUpgradeOpportunities(currentProduct, customerBehavior);
            opportunities.push(...upgradeOpportunities);
        }
        // 2. CROSS-SELL: Productos complementarios
        const complementaryOpportunities = await this.findComplementaryProducts(currentProduct, customerBehavior);
        opportunities.push(...complementaryOpportunities);
        // 3. BUNDLE: Paquetes con descuento
        if (customerBehavior.interests.length > 1) {
            const bundleOpportunities = await this.findBundleOpportunities(currentProduct, customerBehavior);
            opportunities.push(...bundleOpportunities);
        }
        // 4. SUBSCRIPTION: Para productos de uso recurrente
        if (this.isRecurringProduct(currentProduct)) {
            const subscriptionOpportunities = await this.findSubscriptionOpportunities(currentProduct, customerBehavior);
            opportunities.push(...subscriptionOpportunities);
        }
        // Filtrar y ordenar por confianza
        return opportunities
            .filter(opp => opp.confidence > 0.6)
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 3); // Máximo 3 oportunidades
    }
    /**
     * Generar mensaje de upsell natural
     */
    static async generateUpsellMessage(opportunity, customerBehavior) {
        const { type, product, reason, discount, urgency } = opportunity;
        // Seleccionar template según tipo y comportamiento del cliente
        const template = this.selectUpsellTemplate(type, customerBehavior, opportunity);
        // Personalizar template
        let message = template
            .replace('{product}', product.name)
            .replace('{reason}', reason)
            .replace('{discount}', discount ? `${discount}%` : '')
            .replace('{urgency}', urgency || '');
        // Añadir gancho psicológico según perfil del cliente
        if (customerBehavior.interests.includes('ahorro')) {
            message += ' Imagina el ahorro mensual que representarían estos beneficios.';
        }
        if (customerBehavior.interests.includes('calidad')) {
            message += ' La diferencia de calidad es notable desde el primer uso.';
        }
        // Hacer mensaje natural
        return Personality.generateNaturalResponse({
            baseMessage: message,
            context: {
                hasProductMatch: true,
                conversationCount: 0
            }
        });
    }
    // ============ MÉTODOS PRIVADOS ============
    /**
     * Extraer intereses del cliente desde conversación
     */
    static extractInterests(conversationHistory) {
        const interests = [];
        const text = conversationHistory.map(h => h.content).join(' ').toLowerCase();
        const interestKeywords = {
            ahorro: ['ahorro', 'economía', 'barato', 'descuento', 'oferta'],
            calidad: ['calidad', 'premium', 'durabilidad', 'resistente', 'profesional'],
            conveniencia: ['fácil', 'rápido', 'práctico', 'cómodo', 'automático'],
            tecnologia: ['tecnología', 'innovador', 'avanzado', 'moderno', 'digital'],
            soporte: ['soporte', 'garantía', 'ayuda', 'asesoría', 'servicio']
        };
        Object.entries(interestKeywords).forEach(([interest, keywords]) => {
            if (keywords.some(keyword => text.includes(keyword))) {
                interests.push(interest);
            }
        });
        return interests;
    }
    /**
     * Extraer categorías preferidas
     */
    static extractCategories(conversationHistory, purchaseHistory) {
        const categories = new Set();
        // Desde historial de compras
        purchaseHistory.forEach(purchase => {
            if (purchase.category)
                categories.add(purchase.category);
        });
        // Desde conversación
        const text = conversationHistory.map(h => h.content).join(' ').toLowerCase();
        const categoryKeywords = {
            'tecnologia': ['computador', 'laptop', 'celular', 'tablet', 'tecnología'],
            'hogar': ['cocina', 'limpieza', 'decoración', 'muebles'],
            'entretenimiento': ['juegos', 'música', 'video', 'entretenimiento'],
            'oficina': ['oficina', 'trabajo', 'productividad', 'empresa']
        };
        Object.entries(categoryKeywords).forEach(([category, keywords]) => {
            if (keywords.some(keyword => text.includes(keyword))) {
                categories.add(category);
            }
        });
        return Array.from(categories);
    }
    /**
     * Estimar presupuesto del cliente
     */
    static estimateBudget(conversationHistory, purchaseHistory) {
        let budget = 0;
        // Desde historial de compras
        if (purchaseHistory.length > 0) {
            const avgPurchase = purchaseHistory.reduce((sum, p) => sum + p.total, 0) / purchaseHistory.length;
            budget = avgPurchase * 1.2; // 20% más que el promedio
        }
        // Desde conversación (menciones de precio)
        const text = conversationHistory.map(h => h.content).join(' ');
        const priceMatches = text.match(/(\d{1,3}(?:\.\d{3})*)/g);
        if (priceMatches) {
            const mentionedPrices = priceMatches.map(p => parseInt(p.replace(/\./g, '')));
            const avgMentioned = mentionedPrices.reduce((a, b) => a + b, 0) / mentionedPrices.length;
            budget = Math.max(budget, avgMentioned);
        }
        return budget || 500000; // Presupuesto base
    }
    /**
     * Calcular valor promedio de orden
     */
    static calculateAverageOrderValue(purchaseHistory) {
        if (purchaseHistory.length === 0)
            return 0;
        return purchaseHistory.reduce((sum, p) => sum + p.total, 0) / purchaseHistory.length;
    }
    /**
     * Encontrar oportunidades de upgrade
     */
    static async findUpgradeOpportunities(currentProduct, customerBehavior) {
        const opportunities = [];
        try {
            // Verificar que el producto tenga categoría
            if (!currentProduct || !currentProduct.category) {
                return opportunities;
            }
            // Buscar productos premium en la misma categoría
            const premiumProducts = await db_1.db.product.findMany({
                where: {
                    category: currentProduct.category,
                    status: 'AVAILABLE',
                    price: {
                        gt: currentProduct.price * 1.5 // Al menos 50% más caro
                    }
                },
                orderBy: { price: 'asc' },
                take: 2
            });
            premiumProducts.forEach(product => {
                const priceDiff = ((product.price - currentProduct.price) / currentProduct.price) * 100;
                opportunities.push({
                    id: `upgrade_${product.id}`,
                    type: 'upsell',
                    trigger: 'purchase_intent',
                    confidence: Math.min(priceDiff / 100, 0.8), // Confianza basada en diferencia de precio
                    product,
                    reason: `La versión premium incluye características avanzadas que justifica la inversión`,
                    discount: priceDiff > 50 ? 10 : 0 // Descuento si la diferencia es grande
                });
            });
        }
        catch (error) {
            console.error('Error finding upgrade opportunities:', error);
        }
        return opportunities;
    }
    /**
     * Encontrar productos complementarios
     */
    static async findComplementaryProducts(currentProduct, customerBehavior) {
        const opportunities = [];
        try {
            // Verificar que el producto tenga categoría
            if (!currentProduct || !currentProduct.category) {
                return opportunities;
            }
            // Definir complementos por categoría
            const complementaryMap = {
                'computadores': ['mouse', 'teclado', 'audífonos', 'maletín'],
                'celulares': ['cargador', 'audífonos', 'protector', 'memoria'],
                'cocina': ['utensilios', 'recipientes', 'accesorios'],
                'oficina': ['sillas', 'escritorios', 'organizadores']
            };
            const categoryComplements = complementaryMap[currentProduct.category] || [];
            if (categoryComplements.length > 0) {
                const complementaryProducts = await db_1.db.product.findMany({
                    where: {
                        OR: categoryComplements.map(name => ({
                            name: { contains: name, mode: 'insensitive' }
                        })),
                        status: 'AVAILABLE',
                        price: { lte: customerBehavior.budget * 0.3 } // Máximo 30% del presupuesto
                    },
                    take: 2
                });
                complementaryProducts.forEach(product => {
                    opportunities.push({
                        id: `complementary_${product.id}`,
                        type: 'cross_sell',
                        trigger: 'product_view',
                        confidence: 0.75,
                        product,
                        reason: `Complementa perfectamente tu ${currentProduct.name}`,
                        discount: 15
                    });
                });
            }
        }
        catch (error) {
            console.error('Error finding complementary products:', error);
        }
        return opportunities;
    }
    /**
     * Encontrar oportunidades de bundle
     */
    static async findBundleOpportunities(currentProduct, customerBehavior) {
        const opportunities = [];
        // Si no hay producto actual, no hay bundles
        if (!currentProduct || !currentProduct.id) {
            return opportunities;
        }
        try {
            // Buscar productos relacionados con intereses del cliente
            const relatedProducts = await db_1.db.product.findMany({
                where: {
                    status: 'AVAILABLE',
                    id: { not: currentProduct.id },
                    price: { lte: customerBehavior.budget * 0.4 }
                },
                take: 3
            });
            if (relatedProducts.length >= 2) {
                // Crear bundle virtual
                const bundlePrice = relatedProducts.reduce((sum, p) => sum + p.price, 0) * 0.75; // 25% descuento
                const bundleSavings = relatedProducts.reduce((sum, p) => sum + p.price, 0) - bundlePrice;
                opportunities.push({
                    id: `bundle_${Date.now()}`,
                    type: 'bundle',
                    trigger: 'product_view',
                    confidence: 0.8,
                    product: {
                        id: 'bundle',
                        name: `Pack ${currentProduct.category}`,
                        price: bundlePrice,
                        description: `Incluye: ${relatedProducts.map(p => p.name).join(', ')}`
                    },
                    reason: `Ahorra $${bundleSavings.toLocaleString()} con nuestro pack especial`,
                    discount: 25,
                    urgency: 'Oferta por tiempo limitado'
                });
            }
        }
        catch (error) {
            console.error('Error finding bundle opportunities:', error);
        }
        return opportunities;
    }
    /**
     * Encontrar oportunidades de suscripción
     */
    static async findSubscriptionOpportunities(currentProduct, customerBehavior) {
        const opportunities = [];
        // Solo para productos de consumo recurrente
        if (this.isRecurringProduct(currentProduct)) {
            opportunities.push({
                id: `subscription_${currentProduct.id}`,
                type: 'subscription',
                trigger: 'product_view',
                confidence: 0.7,
                product: {
                    id: `sub_${currentProduct.id}`,
                    name: `${currentProduct.name} - Plan Mensual`,
                    price: currentProduct.price * 0.85, // 15% descuento mensual
                    description: 'Entregas automáticas mensuales con descuento'
                },
                reason: 'Ahorra 15% con entregas programadas mensuales',
                discount: 15
            });
        }
        return opportunities;
    }
    /**
     * Verificar si es producto de uso recurrente
     */
    static isRecurringProduct(product) {
        if (!product || !product.category)
            return false;
        const recurringCategories = ['consumibles', 'limpieza', 'oficina', 'tecnología'];
        const recurringKeywords = ['recargas', 'suscript', 'mensual', 'consumo'];
        return recurringCategories.includes(product.category) ||
            recurringKeywords.some(keyword => product.name.toLowerCase().includes(keyword));
    }
    /**
     * Seleccionar template de upsell apropiado
     */
    static selectUpsellTemplate(type, customerBehavior, opportunity) {
        const strategy = this.UPSELL_STRATEGIES[type];
        if (!strategy)
            return 'Te recomiendo considerar también {product}. {reason}';
        // Seleccionar template basado en intereses del cliente
        let template = strategy.templates[0];
        if (customerBehavior.interests.includes('ahorro') && opportunity.discount) {
            template = strategy.templates.find(t => t.includes('descuento')) || template;
        }
        if (customerBehavior.interests.includes('calidad')) {
            template = strategy.templates.find(t => t.includes('premium') || t.includes('profesional')) || template;
        }
        return template;
    }
    /**
     * Registrar resultado de upsell
     */
    static recordUpsellResult(customerId, opportunityId, accepted) {
        const history = this.upsellHistory.get(customerId) || [];
        history.push({
            opportunityId,
            accepted,
            timestamp: new Date()
        });
        this.upsellHistory.set(customerId, history);
    }
    /**
     * Obtener estadísticas de upselling
     */
    static getUpsellStats() {
        const stats = {
            totalOpportunities: 0,
            acceptedOpportunities: 0,
            conversionRate: 0,
            typeStats: {}
        };
        for (const [customerId, history] of this.upsellHistory) {
            history.forEach(attempt => {
                stats.totalOpportunities++;
                if (attempt.accepted) {
                    stats.acceptedOpportunities++;
                }
                const type = attempt.opportunityId.split('_')[0];
                if (!stats.typeStats[type]) {
                    stats.typeStats[type] = { total: 0, accepted: 0 };
                }
                stats.typeStats[type].total++;
                if (attempt.accepted) {
                    stats.typeStats[type].accepted++;
                }
            });
        }
        stats.conversionRate = stats.totalOpportunities > 0
            ? stats.acceptedOpportunities / stats.totalOpportunities
            : 0;
        return stats;
    }
}
exports.IntelligentUpselling = IntelligentUpselling;
IntelligentUpselling.customerBehaviors = new Map();
IntelligentUpselling.upsellHistory = new Map();
// ============ ESTRATEGIAS DE UPSELLING ============
IntelligentUpselling.UPSELL_STRATEGIES = {
    // Upgrading: Producto mejor pero relacionado
    upgrade: {
        triggers: ['price_concern', 'quality_focus', 'premium_interest'],
        templates: [
            'Si buscas mayor durabilidad, tenemos la versión premium con 50% más resistencia.',
            'Para un rendimiento superior, te recomiendo el modelo profesional con características avanzadas.',
            'Si valoras la calidad, la versión premium incluye 2 años de garantía extendida.'
        ]
    },
    // Bundling: Paquetes con descuento
    bundle: {
        triggers: ['multiple_interests', 'cost_savings', 'convenience'],
        templates: [
            'Aprovecha nuestro pack completo: incluye todo lo que necesitas con 25% de descuento.',
            'Te armo un combo personalizado con 3 productos relacionados y envío gratis.',
            'El paquete familiar incluye todo con 30% de ahorro comparado con comprar por separado.'
        ]
    },
    // Complementary: Productos que complementan
    complementary: {
        triggers: ['product_context', 'usage_pattern', 'accessories'],
        templates: [
            'Para completar tu setup, te recomiendo este accesorio compatible.',
            'Muchos clientes que compran X también llevan Y para maximizar el rendimiento.',
            '¿Has considerado agregar este complemento? Mejora significativamente los resultados.'
        ]
    },
    // Subscription: Modelos recurrentes
    subscription: {
        triggers: ['frequent_use', 'ongoing_need', 'convenience'],
        templates: [
            'Con nuestro plan mensual, recibes entregas automáticas y 15% de descuento.',
            'La suscripción incluye mantenimiento gratuito y actualizaciones prioritarias.',
            'Ahorra 20% con entregas programadas mensuales.'
        ]
    }
};
// ============ INTEGRACIÓN CON SISTEMA DE VENTAS ============
async function attemptIntelligentUpsell(customerId, currentProduct, conversationHistory, purchaseHistory = []) {
    // Si no hay producto actual, no intentar upsell
    if (!currentProduct) {
        return { shouldUpsell: false };
    }
    // Analizar comportamiento del cliente
    const customerBehavior = await IntelligentUpselling.analyzeCustomerBehavior(customerId, conversationHistory, purchaseHistory);
    // Generar oportunidades
    const opportunities = await IntelligentUpselling.generateUpsellOpportunities(customerId, currentProduct, {
        conversationStage: 'consideration',
        customerBehavior,
        purchaseIntent: true
    });
    if (opportunities.length === 0) {
        return { shouldUpsell: false };
    }
    // Seleccionar mejor oportunidad
    const bestOpportunity = opportunities[0];
    // Generar mensaje
    const message = await IntelligentUpselling.generateUpsellMessage(bestOpportunity, customerBehavior);
    return {
        shouldUpsell: true,
        message,
        opportunity: bestOpportunity
    };
}
