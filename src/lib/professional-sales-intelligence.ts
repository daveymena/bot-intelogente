/**
 * SISTEMA DE INTELIGENCIA PROFESIONAL DE VENTAS
 */

interface CustomerIntent {
  type: 'browsing' | 'comparing' | 'ready_to_buy' | 'objection' | 'information'
  confidence: number
  signals: string[]
  urgency: 'low' | 'medium' | 'high'
}

interface SalesStrategy {
  approach: string
  tone: string
  focus: string[]
  closingTechnique: string
}

export class ProfessionalSalesIntelligence {
  
  analyzeCustomerIntent(message: string): CustomerIntent {
    const msg = message.toLowerCase()
    
    const buyingSignals = ['quiero', 'necesito', 'comprar', 'precio', 'cuánto', 'disponible']
    const comparingSignals = ['diferencia', 'comparar', 'mejor', 'opciones', 'recomiendas']
    const objectionSignals = ['caro', 'costoso', 'descuento', 'más barato']
    
    const buyingCount = buyingSignals.filter(s => msg.includes(s)).length
    const comparingCount = comparingSignals.filter(s => msg.includes(s)).length
    const objectionCount = objectionSignals.filter(s => msg.includes(s)).length
    
    if (buyingCount >= 2) {
      return { type: 'ready_to_buy', confidence: 0.9, signals: buyingSignals, urgency: 'high' }
    }
    
    if (objectionCount >= 1) {
      return { type: 'objection', confidence: 0.8, signals: objectionSignals, urgency: 'medium' }
    }
    
    if (comparingCount >= 1) {
      return { type: 'comparing', confidence: 0.7, signals: comparingSignals, urgency: 'medium' }
    }
    
    return { type: 'browsing', confidence: 0.6, signals: [], urgency: 'low' }
  }
  
  selectSalesStrategy(intent: CustomerIntent): SalesStrategy {
    switch (intent.type) {
      case 'ready_to_buy':
        return {
          approach: 'facilitador',
          tone: 'directo_profesional',
          focus: ['beneficios', 'proceso_compra'],
          closingTechnique: 'cierre_directo'
        }
      
      case 'comparing':
        return {
          approach: 'consultivo',
          tone: 'experto',
          focus: ['diferenciadores', 'valor'],
          closingTechnique: 'cierre_alternativo'
        }
      
      case 'objection':
        return {
          approach: 'valor',
          tone: 'empático',
          focus: ['roi', 'calidad'],
          closingTechnique: 'cierre_por_valor'
        }
      
      default:
        return {
          approach: 'educativo',
          tone: 'amigable',
          focus: ['categorías', 'destacados'],
          closingTechnique: 'cierre_suave'
        }
    }
  }
  
  generateSalesPrompt(intent: CustomerIntent, strategy: SalesStrategy, products: any[], message: string): string {
    return `Eres un asesor de ventas profesional. 

CLIENTE: ${intent.type} (urgencia: ${intent.urgency})
ESTRATEGIA: ${strategy.approach} - ${strategy.tone}
PRODUCTOS: ${products.length} disponibles

MENSAJE: "${message}"

INSTRUCCIONES CRÍTICAS:
- Responde MÁXIMO 2-3 líneas cortas (no más de 150 caracteres)
- Sé directo y conciso, sin rodeos
- Menciona solo 1-2 productos máximo
- NO des explicaciones largas
- Usa técnica: ${strategy.closingTechnique}
- Enfócate en: ${strategy.focus.join(', ')}
- Termina con una pregunta corta para mantener conversación

FORMATO: [Respuesta breve] + [Pregunta corta]

Responde ahora:`
  }
}

export const salesIntelligence = new ProfessionalSalesIntelligence()
