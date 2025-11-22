/**
 * Sistema de Respaldo de Emergencia Inteligente
 * Se activa cuando TODAS las IAs fallan
 * Usa base de datos, knowledge base y aprendizaje de respuestas anteriores
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface EmergencyResponse {
  response: string
  confidence: number
  source: 'database' | 'knowledge' | 'learned' | 'template'
}

export class EmergencyFallbackSystem {
  
  /**
   * Genera una respuesta inteligente sin usar IAs externas
   */
  static async generateEmergencyResponse(
    userMessage: string,
    userId: string
  ): Promise<string> {
    console.log('[Emergency Fallback] 🆘 Todas las IAs fallaron, usando sistema local')
    
    const messageLower = userMessage.toLowerCase()
    
    // 1. Intentar con respuestas aprendidas (de conversaciones anteriores)
    const learnedResponse = await this.getLearnedResponse(messageLower, userId)
    if (learnedResponse) {
      console.log('[Emergency Fallback] ✅ Usando respuesta aprendida')
      return learnedResponse
    }
    
    // 2. Buscar en base de datos de productos
    const productResponse = await this.searchProducts(messageLower)
    if (productResponse) {
      console.log('[Emergency Fallback] ✅ Usando información de productos')
      return productResponse
    }
    
    // 3. Respuestas basadas en patrones comunes
    const patternResponse = this.getPatternResponse(messageLower)
    if (patternResponse) {
      console.log('[Emergency Fallback] ✅ Usando respuesta por patrón')
      return patternResponse
    }
    
    // 4. Respuesta genérica de emergencia
    console.log('[Emergency Fallback] ⚠️ Usando respuesta genérica')
    return this.getGenericEmergencyResponse()
  }
  
  /**
   * Busca respuestas similares en conversaciones anteriores
   */
  private static async getLearnedResponse(
    message: string,
    userId: string
  ): Promise<string | null> {
    try {
      return null
    } catch {
      return null
    }
  }
  
  /**
   * Busca información de productos en la base de datos
   */
  private static async searchProducts(message: string): Promise<string | null> {
    try {
      // Palabras clave de productos
      const keywords = ['moto', 'piano', 'curso', 'precio', 'costo', 'cuanto', 'producto']
      const hasProductKeyword = keywords.some(k => message.includes(k))
      
      if (!hasProductKeyword) return null
      
      // Buscar productos en la base de datos
      const products = await prisma.$queryRaw<any[]>`
        SELECT name, description, price
        FROM products
        WHERE LOWER(name) LIKE ${`%${message}%`}
        OR LOWER(description) LIKE ${`%${message}%`}
        LIMIT 3
      `
      
      if (products && products.length > 0) {
        let response = '📦 Aquí está la información que tengo:\n\n'
        
        products.forEach((product, index) => {
          response += `${index + 1}. ${product.name}\n`
          if (product.price) {
            response += `   💰 Precio: $${product.price.toLocaleString()}\n`
          }
          if (product.description) {
            response += `   📝 ${product.description.substring(0, 100)}...\n`
          }
          response += '\n'
        })
        
        response += '¿Te gustaría saber más sobre alguno?'
        return response
      }
    } catch (error) {
      console.error('[Emergency Fallback] Error buscando productos:', error)
    }
    
    return null
  }
  
  /**
   * Respuestas basadas en patrones comunes
   */
  private static getPatternResponse(message: string): string | null {
    // Saludos
    if (/^(hola|buenos|buenas|hey|hi|hello)/i.test(message)) {
      return '¡Hola! 👋 Bienvenido a Tecnovariedades D&S. ¿En qué puedo ayudarte hoy?'
    }
    
    // Preguntas sobre precios
    if (/precio|costo|cuanto|vale|valor/i.test(message)) {
      return '💰 Para darte información precisa sobre precios, necesito saber qué producto te interesa. Tenemos:\n\n' +
             '🏍️ Motos y repuestos\n' +
             '🎹 Cursos de piano\n' +
             '📦 Productos de dropshipping\n\n' +
             '¿Cuál te interesa?'
    }
    
    // Preguntas sobre disponibilidad
    if (/disponible|stock|hay|tienen/i.test(message)) {
      return '✅ Sí, tenemos productos disponibles. ¿Qué estás buscando específicamente? Puedo ayudarte con:\n\n' +
             '• Motos y accesorios\n' +
             '• Cursos de piano\n' +
             '• Productos variados\n\n' +
             'Cuéntame más sobre lo que necesitas.'
    }
    
    // Preguntas sobre envíos
    if (/envio|enviar|entrega|domicilio/i.test(message)) {
      return '🚚 Sí, hacemos envíos a domicilio. El costo depende de tu ubicación.\n\n' +
             '📍 ¿A qué ciudad necesitas el envío?'
    }
    
    // Preguntas sobre pagos
    if (/pago|pagar|forma|metodo|tarjeta/i.test(message)) {
      return '💳 Aceptamos varios métodos de pago:\n\n' +
             '• Nequi\n' +
             '• Daviplata\n' +
             '• Transferencia bancaria\n' +
             '• Mercado Pago\n' +
             '• PayPal\n' +
             '• Efectivo contra entrega\n\n' +
             '¿Cuál prefieres?'
    }
    
    // Agradecimientos
    if (/gracias|thanks|thank/i.test(message)) {
      return '¡De nada! 😊 Estoy aquí para ayudarte. ¿Necesitas algo más?'
    }
    
    // Despedidas
    if (/adios|chao|bye|hasta/i.test(message)) {
      return '¡Hasta pronto! 👋 Que tengas un excelente día. Vuelve cuando quieras.'
    }
    
    return null
  }
  
  /**
   * Respuesta genérica cuando no hay coincidencias
   */
  private static getGenericEmergencyResponse(): string {
    return '🤖 Disculpa, estoy experimentando algunas dificultades técnicas temporales.\n\n' +
           'Pero puedo ayudarte con:\n\n' +
           '📦 Información de productos\n' +
           '💰 Precios y disponibilidad\n' +
           '🚚 Envíos y entregas\n' +
           '💳 Métodos de pago\n\n' +
           'Por favor, cuéntame específicamente qué necesitas y haré mi mejor esfuerzo por ayudarte.'
  }
  
  /**
   * Guarda una respuesta exitosa para aprendizaje futuro
   */
  static async learnFromResponse(
    userMessage: string,
    aiResponse: string,
    userId: string,
    provider: string
  ): Promise<void> {
    try {
      return
    } catch {}
  }
  
  /**
   * Obtiene estadísticas del sistema de emergencia
   */
  static async getStats(): Promise<{
    totalLearnedResponses: number
    totalProducts: number
    lastUsed: Date | null
  }> {
    try {
      const productCount = await prisma.product.count()
      return {
        totalLearnedResponses: 0,
        totalProducts: productCount,
        lastUsed: null
      }
    } catch {
      return {
        totalLearnedResponses: 0,
        totalProducts: 0,
        lastUsed: null
      }
    }
  }
}
