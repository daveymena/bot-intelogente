"use strict";
// Sistema de cálculo de precios para dropshipping
// Incluye costo de envío y margen de ganancia
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropshippingPricing = void 0;
class DropshippingPricing {
    // Actualizar configuración
    static setConfig(config) {
        this.config = { ...this.config, ...config };
    }
    // Calcular precio de venta basado en costo del producto
    static calculateSellingPrice(costPrice) {
        // Estimar costo de envío (promedio)
        const shippingCost = (this.config.shippingCostMin + this.config.shippingCostMax) / 2;
        // Calcular ganancia basada en el precio del producto
        // Productos más caros = mayor ganancia
        let profitMargin;
        if (costPrice < 50000) {
            // Productos baratos: ganancia mínima
            profitMargin = this.config.profitMarginMin;
        }
        else if (costPrice < 100000) {
            // Productos medios: ganancia media
            profitMargin = (this.config.profitMarginMin + this.config.profitMarginMax) / 2;
        }
        else {
            // Productos caros: ganancia máxima
            profitMargin = this.config.profitMarginMax;
        }
        // Precio final = Costo + Envío + Ganancia
        const sellingPrice = Math.round(costPrice + shippingCost + profitMargin);
        // Calcular porcentaje de ganancia
        const profitPercentage = ((profitMargin / costPrice) * 100);
        return {
            costPrice,
            shippingCost,
            profitMargin,
            sellingPrice,
            profitPercentage: Math.round(profitPercentage * 100) / 100,
        };
    }
    // Calcular precio con ganancia personalizada
    static calculateWithCustomProfit(costPrice, desiredProfit) {
        const shippingCost = (this.config.shippingCostMin + this.config.shippingCostMax) / 2;
        const sellingPrice = Math.round(costPrice + shippingCost + desiredProfit);
        const profitPercentage = ((desiredProfit / costPrice) * 100);
        return {
            costPrice,
            shippingCost,
            profitMargin: desiredProfit,
            sellingPrice,
            profitPercentage: Math.round(profitPercentage * 100) / 100,
        };
    }
    // Calcular precio con porcentaje de ganancia
    static calculateWithPercentage(costPrice, profitPercentage) {
        const shippingCost = (this.config.shippingCostMin + this.config.shippingCostMax) / 2;
        const profitMargin = Math.round((costPrice * profitPercentage) / 100);
        const sellingPrice = Math.round(costPrice + shippingCost + profitMargin);
        return {
            costPrice,
            shippingCost,
            profitMargin,
            sellingPrice,
            profitPercentage,
        };
    }
    // Redondear precio a múltiplo de 100 o 900 (precios psicológicos)
    static roundToPsychologicalPrice(price) {
        // Redondear a .900 (ej: 129.900 en lugar de 130.000)
        const rounded = Math.round(price / 1000) * 1000;
        return rounded - 100;
    }
    // Calcular precio final con redondeo psicológico
    static calculateFinalPrice(costPrice) {
        const breakdown = this.calculateSellingPrice(costPrice);
        breakdown.sellingPrice = this.roundToPsychologicalPrice(breakdown.sellingPrice);
        return breakdown;
    }
    // Obtener resumen de precios para mostrar
    static getPriceSummary(costPrice) {
        const breakdown = this.calculateFinalPrice(costPrice);
        return `
💰 Desglose de Precio:
   Costo Dropi: $${costPrice.toLocaleString('es-CO')}
   Envío: $${breakdown.shippingCost.toLocaleString('es-CO')}
   Tu Ganancia: $${breakdown.profitMargin.toLocaleString('es-CO')} (${breakdown.profitPercentage}%)
   ─────────────────────
   Precio Venta: $${breakdown.sellingPrice.toLocaleString('es-CO')}
    `.trim();
    }
    // Calcular ganancias totales de múltiples productos
    static calculateTotalProfit(products) {
        let totalCost = 0;
        let totalShipping = 0;
        let totalProfit = 0;
        let totalRevenue = 0;
        products.forEach(({ costPrice, quantity }) => {
            const breakdown = this.calculateFinalPrice(costPrice);
            totalCost += costPrice * quantity;
            totalShipping += breakdown.shippingCost * quantity;
            totalProfit += breakdown.profitMargin * quantity;
            totalRevenue += breakdown.sellingPrice * quantity;
        });
        return {
            totalCost: Math.round(totalCost),
            totalShipping: Math.round(totalShipping),
            totalProfit: Math.round(totalProfit),
            totalRevenue: Math.round(totalRevenue),
        };
    }
}
exports.DropshippingPricing = DropshippingPricing;
// Configuración por defecto
DropshippingPricing.config = {
    shippingCostMin: 15000, // $15.000 COP
    shippingCostMax: 20000, // $20.000 COP
    profitMarginMin: 20000, // $20.000 COP ganancia mínima
    profitMarginMax: 30000, // $30.000 COP ganancia máxima
};
// Configuración desde variables de entorno
if (process.env.DROPSHIPPING_SHIPPING_MIN) {
    DropshippingPricing.setConfig({
        shippingCostMin: parseInt(process.env.DROPSHIPPING_SHIPPING_MIN),
    });
}
if (process.env.DROPSHIPPING_SHIPPING_MAX) {
    DropshippingPricing.setConfig({
        shippingCostMax: parseInt(process.env.DROPSHIPPING_SHIPPING_MAX),
    });
}
if (process.env.DROPSHIPPING_PROFIT_MIN) {
    DropshippingPricing.setConfig({
        profitMarginMin: parseInt(process.env.DROPSHIPPING_PROFIT_MIN),
    });
}
if (process.env.DROPSHIPPING_PROFIT_MAX) {
    DropshippingPricing.setConfig({
        profitMarginMax: parseInt(process.env.DROPSHIPPING_PROFIT_MAX),
    });
}
