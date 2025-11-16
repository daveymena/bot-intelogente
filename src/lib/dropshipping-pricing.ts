// Sistema de cálculo de precios para dropshipping
// Incluye costo de envío y margen de ganancia

export interface PricingConfig {
  shippingCostMin: number  // Costo mínimo de envío
  shippingCostMax: number  // Costo máximo de envío
  profitMarginMin: number  // Ganancia mínima deseada
  profitMarginMax: number  // Ganancia máxima deseada
}

export interface PriceBreakdown {
  costPrice: number        // Precio del proveedor (Dropi)
  shippingCost: number     // Costo de envío estimado
  profitMargin: number     // Tu ganancia
  sellingPrice: number     // Precio final de venta
  profitPercentage: number // Porcentaje de ganancia
}

export class DropshippingPricing {
  // Configuración por defecto
  private static config: PricingConfig = {
    shippingCostMin: 15000,  // $15.000 COP
    shippingCostMax: 20000,  // $20.000 COP
    profitMarginMin: 20000,  // $20.000 COP ganancia mínima
    profitMarginMax: 30000,  // $30.000 COP ganancia máxima
  }

  // Actualizar configuración
  static setConfig(config: Partial<PricingConfig>) {
    this.config = { ...this.config, ...config }
  }

  // Calcular precio de venta basado en costo del producto
  static calculateSellingPrice(costPrice: number): PriceBreakdown {
    // Estimar costo de envío (promedio)
    const shippingCost = (this.config.shippingCostMin + this.config.shippingCostMax) / 2

    // Calcular ganancia basada en el precio del producto
    // Productos más caros = mayor ganancia
    let profitMargin: number

    if (costPrice < 50000) {
      // Productos baratos: ganancia mínima
      profitMargin = this.config.profitMarginMin
    } else if (costPrice < 100000) {
      // Productos medios: ganancia media
      profitMargin = (this.config.profitMarginMin + this.config.profitMarginMax) / 2
    } else {
      // Productos caros: ganancia máxima
      profitMargin = this.config.profitMarginMax
    }

    // Precio final = Costo + Envío + Ganancia
    const sellingPrice = Math.round(costPrice + shippingCost + profitMargin)

    // Calcular porcentaje de ganancia
    const profitPercentage = ((profitMargin / costPrice) * 100)

    return {
      costPrice,
      shippingCost,
      profitMargin,
      sellingPrice,
      profitPercentage: Math.round(profitPercentage * 100) / 100,
    }
  }

  // Calcular precio con ganancia personalizada
  static calculateWithCustomProfit(
    costPrice: number,
    desiredProfit: number
  ): PriceBreakdown {
    const shippingCost = (this.config.shippingCostMin + this.config.shippingCostMax) / 2
    const sellingPrice = Math.round(costPrice + shippingCost + desiredProfit)
    const profitPercentage = ((desiredProfit / costPrice) * 100)

    return {
      costPrice,
      shippingCost,
      profitMargin: desiredProfit,
      sellingPrice,
      profitPercentage: Math.round(profitPercentage * 100) / 100,
    }
  }

  // Calcular precio con porcentaje de ganancia
  static calculateWithPercentage(
    costPrice: number,
    profitPercentage: number
  ): PriceBreakdown {
    const shippingCost = (this.config.shippingCostMin + this.config.shippingCostMax) / 2
    const profitMargin = Math.round((costPrice * profitPercentage) / 100)
    const sellingPrice = Math.round(costPrice + shippingCost + profitMargin)

    return {
      costPrice,
      shippingCost,
      profitMargin,
      sellingPrice,
      profitPercentage,
    }
  }

  // Redondear precio a múltiplo de 100 o 900 (precios psicológicos)
  static roundToPsychologicalPrice(price: number): number {
    // Redondear a .900 (ej: 129.900 en lugar de 130.000)
    const rounded = Math.round(price / 1000) * 1000
    return rounded - 100
  }

  // Calcular precio final con redondeo psicológico
  static calculateFinalPrice(costPrice: number): PriceBreakdown {
    const breakdown = this.calculateSellingPrice(costPrice)
    breakdown.sellingPrice = this.roundToPsychologicalPrice(breakdown.sellingPrice)
    return breakdown
  }

  // Obtener resumen de precios para mostrar
  static getPriceSummary(costPrice: number): string {
    const breakdown = this.calculateFinalPrice(costPrice)
    
    return `
💰 Desglose de Precio:
   Costo Dropi: $${costPrice.toLocaleString('es-CO')}
   Envío: $${breakdown.shippingCost.toLocaleString('es-CO')}
   Tu Ganancia: $${breakdown.profitMargin.toLocaleString('es-CO')} (${breakdown.profitPercentage}%)
   ─────────────────────
   Precio Venta: $${breakdown.sellingPrice.toLocaleString('es-CO')}
    `.trim()
  }

  // Calcular ganancias totales de múltiples productos
  static calculateTotalProfit(products: Array<{ costPrice: number; quantity: number }>): {
    totalCost: number
    totalShipping: number
    totalProfit: number
    totalRevenue: number
  } {
    let totalCost = 0
    let totalShipping = 0
    let totalProfit = 0
    let totalRevenue = 0

    products.forEach(({ costPrice, quantity }) => {
      const breakdown = this.calculateFinalPrice(costPrice)
      totalCost += costPrice * quantity
      totalShipping += breakdown.shippingCost * quantity
      totalProfit += breakdown.profitMargin * quantity
      totalRevenue += breakdown.sellingPrice * quantity
    })

    return {
      totalCost: Math.round(totalCost),
      totalShipping: Math.round(totalShipping),
      totalProfit: Math.round(totalProfit),
      totalRevenue: Math.round(totalRevenue),
    }
  }
}

// Configuración desde variables de entorno
if (process.env.DROPSHIPPING_SHIPPING_MIN) {
  DropshippingPricing.setConfig({
    shippingCostMin: parseInt(process.env.DROPSHIPPING_SHIPPING_MIN),
  })
}

if (process.env.DROPSHIPPING_SHIPPING_MAX) {
  DropshippingPricing.setConfig({
    shippingCostMax: parseInt(process.env.DROPSHIPPING_SHIPPING_MAX),
  })
}

if (process.env.DROPSHIPPING_PROFIT_MIN) {
  DropshippingPricing.setConfig({
    profitMarginMin: parseInt(process.env.DROPSHIPPING_PROFIT_MIN),
  })
}

if (process.env.DROPSHIPPING_PROFIT_MAX) {
  DropshippingPricing.setConfig({
    profitMarginMax: parseInt(process.env.DROPSHIPPING_PROFIT_MAX),
  })
}
