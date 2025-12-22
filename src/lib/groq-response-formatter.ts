/**
 * 🎨 FORMATEADOR DE RESPUESTAS CON GROQ
 *
 * Recibe información estructurada y genera respuesta natural con formato bonito usando Groq.
 */

export class GroqResponseFormatter {
  /**
   * Formatear respuesta con Groq
   */
  static async formatResponse(
    userMessage: string,
    analysisContext: string,
    products: any[]
  ): Promise<string> {
    console.log('[GroqFormatter] 🎨 Formateando respuesta con Groq...')

    try {
      const { GroqAPIRotator } = await import('./groq-api-rotator')

      const prompt = this.buildPrompt(userMessage, analysisContext, products)

      const response = await GroqAPIRotator.makeRequest(
        [{ role: 'user', content: prompt }],
        {
          temperature: 0.7,
          maxTokens: 600
        }
      )

      console.log('[GroqFormatter] ✅ Respuesta formateada')
      return response
    } catch (error) {
      console.error('[GroqFormatter] ❌ Error formateando:', error)
      
      // Fallback: respuesta simple
      return this.generateFallbackResponse(products)
    }
  }

  /**
   * Construir prompt para Groq
   */
  private static buildPrompt(
    userMessage: string,
    analysisContext: string,
    products: any[]
  ): string {
    return `Eres un asistente de ventas experto. Genera una respuesta natural y atractiva.

MENSAJE DEL CLIENTE:
"${userMessage}"

INFORMACIÓN DISPONIBLE:
${analysisContext}

INSTRUCCIONES:
1. Responde de forma natural y amigable
2. Usa emojis apropiados (pero no exageres)
3. Formato para WhatsApp (limpio y organizado)
4. Si hay productos, muestra máximo 3
5. Incluye precios formateados
6. Termina con una pregunta para continuar la conversación

FORMATO PARA PRODUCTOS:
📦 *Nombre del Producto*
💰 *$XX.XXX COP*
✨ Beneficio clave

¿Te interesa alguno? 😊

GENERA LA RESPUESTA:`
  }

  /**
   * Respuesta fallback si Groq falla
   */
  private static generateFallbackResponse(products: any[]): string {
    if (products.length === 0) {
      return '😅 No encontré productos exactos con esa búsqueda.\n\n¿Podrías darme más detalles de lo que buscas? 🤔'
    }

    let response = '¡Claro! 😊 Tengo estas opciones:\n\n'
    
    products.slice(0, 3).forEach((p, i) => {
      response += `${i + 1}. 📦 *${p.name}*\n`
      response += `   💰 *$${p.price.toLocaleString('es-CO')} COP*\n\n`
    })

    response += '¿Cuál te interesa más? 🤔'
    
    return response
  }
}
