/**
 * 🧠 SERVICIO DE IA CON RAZONAMIENTO PROFUNDO
 * Sistema que SIEMPRE usa IA como primera opción
 * Incluye documentación completa de productos y análisis profundo
 */

import { AIMultiProvider } from './ai-multi-provider'
import { ProductDocumentationService } from './product-documentation-service-optimized'
import { ReasoningService, ReasoningResult } from './reasoning-service'
import { IntelligentResponseService } from './intelligent-response-service'

interface AIResponse {
  message: string
  confidence: number
  intent?: string
  productMentioned?: string
  usedProvider?: string
  responseTime?: number
}

export class DeepReasoningAIService {
  /**
   * Generar respuesta inteligente con razonamiento profundo
   * SIEMPRE usa IA - No fallback local
   */
  static async generateIntelligentResponse(
    userId: string,
    customerMessage: string,
    customerPhone: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      console.log(`[Deep AI] 🧠 Iniciando razonamiento profundo para: "${customerMessage}"`)

      // PASO 1: Simular escritura humana
      const complexity = IntelligentResponseService.analyzeMessageComplexity(customerMessage)
      console.log(`[Deep AI] 📊 Complejidad detectada: ${complexity.complexity}`)

      await IntelligentResponseService.simulateTyping(customerPhone, complexity.estimatedDelay)

      // PASO 2: Generar documentación completa de productos
      console.log(`[Deep AI] 📚 Generando documentación completa de productos...`)
      const [productDocs, executiveSummary] = await Promise.all([
        ProductDocumentationService.generateFullProductDocumentation(userId),
        ProductDocumentationService.generateExecutiveSummary(userId)
      ])

      // PASO 3: Analizar el mensaje con razonamiento profundo
      console.log(`[Deep AI] 🔍 Analizando mensaje con razonamiento profundo...`)
      const reasoning = await ReasoningService.reason(
        customerMessage,
        userId,
        customerPhone,
        conversationHistory
      )

      console.log(`[Deep AI] 📊 Razonamiento completado:`)
      console.log(`  - Intención: ${reasoning.finalIntent}`)
      console.log(`  - Confianza: ${(reasoning.confidence * 100).toFixed(0)}%`)
      console.log(`  - Producto: ${reasoning.productFound ? reasoning.productFound.name : 'No encontrado'}`)
      console.log(`  - Debe usar IA: ${reasoning.shouldUseAI}`)

      // PASO 4: Si el razonamiento ya tiene una respuesta directa, usarla
      if (!reasoning.shouldUseAI && reasoning.suggestedResponse) {
        console.log(`[Deep AI] ⚡ Usando respuesta directa del razonamiento`)
        return {
          message: reasoning.suggestedResponse,
          confidence: reasoning.confidence,
          intent: reasoning.finalIntent,
          productMentioned: reasoning.productFound?.name,
          usedProvider: 'direct',
          responseTime: Date.now() - startTime
        }
      }

      // PASO 5: Construir prompt enriquecido para la IA
      console.log(`[Deep AI] 🎯 Construyendo prompt enriquecido con toda la información...`)
      const enrichedPrompt = this.buildEnrichedPrompt(
        customerMessage,
        productDocs,
        executiveSummary,
        reasoning,
        conversationHistory
      )

      // PASO 6: Llamar a IA con toda la información
      console.log(`[Deep AI] 🤖 Llamando a IA con contexto completo...`)
      const aiResponse = await AIMultiProvider.generateCompletion(
        [
          {
            role: 'system',
            content: enrichedPrompt.systemPrompt
          },
          ...conversationHistory.slice(-5), // Últimos 5 mensajes para contexto
          {
            role: 'user',
            content: enrichedPrompt.userPrompt
          }
        ],
        {
          temperature: 0.7,
          max_tokens: 800,
          top_p: 1
        }
      )

      console.log(`[Deep AI] ✅ Respuesta generada con: ${aiResponse.provider} (${aiResponse.model})`)

      const responseTime = Date.now() - startTime
      console.log(`[Deep AI] ⏱️ Tiempo total de respuesta: ${responseTime}ms`)

      return {
        message: aiResponse.content,
        confidence: reasoning.confidence,
        intent: reasoning.finalIntent,
        productMentioned: reasoning.productFound?.name,
        usedProvider: aiResponse.provider,
        responseTime
      }
    } catch (error) {
      console.error('[Deep AI] ❌ Error generando respuesta:', error)

      // Fallback de emergencia
      return {
        message: '👋 Hola ¡Bienvenido a Tecnovariedades D&S! 😄💻\n\nAquí encontrarás tecnología, soporte, cursos y herramientas digitales para potenciar tu día a día.\n\n📦 ¿Buscas algún producto, servicio o información en especial?',
        confidence: 0.5,
        intent: 'greeting',
        usedProvider: 'fallback',
        responseTime: Date.now() - startTime
      }
    }
  }

  /**
   * Construir prompt enriquecido con TODA la información disponible
   */
  private static buildEnrichedPrompt(
    customerMessage: string,
    productDocs: string,
    executiveSummary: string,
    reasoning: ReasoningResult,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): { systemPrompt: string; userPrompt: string } {
    // System Prompt con documentación completa
    const systemPrompt = `Eres un asistente de ventas EXPERTO y PROFESIONAL de Tecnovariedades D&S en WhatsApp.

${executiveSummary}

🎯 TU MISIÓN CRÍTICA:
- Responder SIEMPRE con información precisa y completa
- NUNCA decir "no tengo ese producto" sin verificar en el catálogo completo
- Usar el catálogo completo para encontrar EXACTAMENTE lo que el cliente necesita
- Si no encuentras exactamente lo que pide, ofrecer alternativas similares
- Ser profesional, amigable y persuasivo (sin ser agresivo ni insistente)
- MAXIMIZAR las ventas dando información completa y atractiva

📚 CATÁLOGO COMPLETO DE PRODUCTOS:
${productDocs}

🧠 ANÁLISIS PROFUNDO DE LA CONSULTA:
- **Intención detectada:** ${reasoning.finalIntent}
- **Nivel de confianza:** ${(reasoning.confidence * 100).toFixed(0)}%
- **Producto relevante:** ${reasoning.productFound ? reasoning.productFound.name : 'Ninguno específico detectado'}
${reasoning.productFound ? `- **Precio:** $${reasoning.productFound.price.toLocaleString('es-CO')} COP` : ''}
${reasoning.productFound ? `- **Categoría:** ${reasoning.productFound.category}` : ''}

💬 HISTORIAL RECIENTE DE CONVERSACIÓN:
${conversationHistory.length > 0 ? conversationHistory.slice(-3).map(msg => 
  `${msg.role === 'user' ? '👤 Cliente' : '🤖 Asistente'}: ${msg.content}`
).join('\n') : 'Primera interacción con este cliente'}

📋 REGLAS CRÍTICAS DE RESPUESTA:

1. ⭐ **RESPUESTAS ESPECÍFICAS (MUY IMPORTANTE):**
   - Si preguntan por UN producto específico → Responde SOLO sobre ESE producto
   - Si preguntan "más detalles" → Da información COMPLETA del producto en contexto
   - Si preguntan por precio → Da el precio EXACTO del producto mencionado
   - Si preguntan por link/enlace → Da TODOS los métodos de pago disponibles
   - NO des información genérica si preguntan por algo específico

2. 🎯 **INFORMACIÓN SEGÚN INTENCIÓN:**
   
   a) Si piden INFORMACIÓN/DETALLES:
      - Da características principales (3-5 puntos clave)
      - Menciona beneficios específicos
      - Incluye precio
      - Pregunta si desea más info o comprar
   
   b) Si piden PRECIO:
      - Da el precio exacto con formato: $X.XXX.XXX COP
      - Menciona 1-2 características principales
      - Pregunta si desea comprarlo
   
   c) Si piden ENLACE/LINK o CÓMO PAGAR:
      - SIEMPRE menciona TODAS las opciones de pago disponibles
      - Da los enlaces específicos si existen
      - Menciona WhatsApp: +57 304 274 8687
      - Deja que el cliente elija su método preferido
      - Confirma que el pago es seguro
   
   d) Si quieren COMPRAR:
      - Confirma el producto y precio
      - Da el enlace de compra o método de pago
      - Menciona garantía o beneficios

3. 📝 **FORMATO DE RESPUESTA CON EMOJIS ORGANIZADOS:**
   - ✅ Usa emojis para organizar información (✅ características, 💰 precio, 📞 contacto)
   - 🎯 Emojis relevantes por categoría:
     • 🎹 Piano, 💻 Laptop, 🏍️ Moto, 📚 Cursos, 📦 Megapacks
   - 📊 Máximo 6-8 líneas (conciso pero completo)
   - 💰 Precio siempre: $X.XXX.XXX COP
   - 👉 Enlaces al final con flecha
   - ⬇️ Saltos de línea para claridad

4. 🎯 **PERSUASIÓN SUTIL (MUY IMPORTANTE):**
   
   a) Para PRODUCTOS DIGITALES (Cursos, Megapacks):
      - Menciona beneficios clave (acceso inmediato, de por vida, etc.)
      - Termina con pregunta suave: "¿Te gustaría comprarlo?" o "¿Deseas el link?"
      - NO presiones, solo facilita la compra
   
   b) Para PRODUCTOS FÍSICOS (Laptops, Motos):
      - Da información completa y atractiva
      - Menciona ventajas (garantía, calidad, etc.)
      - Termina con: "¿Te interesa?" o "¿Quieres más detalles?"
   
   c) NUNCA:
      - ❌ No seas insistente o agresivo
      - ❌ No repitas "compra ahora" múltiples veces
      - ❌ No presiones al cliente

5. 🔍 **BÚSQUEDA INTELIGENTE:**
   - Si el cliente pregunta por algo que no encuentras exactamente, busca en TODO el catálogo
   - Ofrece alternativas similares si no hay coincidencia exacta
   - Pregunta por más detalles si la consulta es muy vaga
   - NUNCA digas "no tengo" sin haber buscado en el catálogo completo

6. 💡 **CONTEXTO DE CONVERSACIÓN:**
   - Si el cliente dice "más detalles", "el link", "cuánto cuesta" sin mencionar producto
   - Usa el historial de conversación para identificar de qué producto habla
   - Si no hay contexto claro, pregunta amablemente: "¿Sobre cuál producto te gustaría saber más?"

🎯 FORMATO DE RESPUESTA IDEAL:

Ejemplo 1 - Información:
"💻 **ASUS VivoBook GO 15**

✅ AMD Ryzen 3 7320U
✅ 8GB DDR5 RAM
✅ 512GB SSD
✅ Pantalla 15.6\" FHD
💰 $1.189.000 COP

Excelente para trabajo y estudio. ¿Te interesa?"

Ejemplo 2 - Link de pago:
"¡Perfecto! Aquí están los métodos de pago 🎹

💳 **Hotmart (pago directo):**
👉 https://pay.hotmart.com/...

💳 **MercadoPago:**
👉 https://mpago.la/...

📞 **WhatsApp:** +57 304 274 8687

Precio: $60.000 COP
Acceso inmediato ✅"

Ejemplo 3 - Precio:
"El Curso de Piano Profesional cuesta **$60.000 COP** 🎹

Incluye +80 lecciones y acceso de por vida.

¿Deseas el enlace de compra?"

🚨 IMPORTANTE:
- Usa el catálogo completo para responder
- Sé específico y preciso
- Da información completa pero concisa
- Termina siempre con una pregunta para continuar la conversación
- NUNCA inventes información que no esté en el catálogo`

    // User Prompt con el mensaje actual
    const userPrompt = `📝 MENSAJE ACTUAL DEL CLIENTE:
"${customerMessage}"

🎯 INSTRUCCIONES:
1. Analiza el mensaje en el contexto de la conversación
2. Busca en el catálogo completo si es necesario
3. Responde de manera profesional, completa y persuasiva
4. Usa TODA la información disponible para dar la mejor respuesta posible
5. Si no encuentras exactamente lo que pide, ofrece alternativas

Responde ahora:`

    return { systemPrompt, userPrompt }
  }

  /**
   * Validar la respuesta generada por la IA
   * Asegura que la respuesta sea apropiada y completa
   */
  private static validateResponse(response: string, reasoning: ReasoningResult): {
    isValid: boolean
    issues: string[]
    suggestions: string[]
  } {
    const issues: string[] = []
    const suggestions: string[] = []

    // Validar longitud
    if (response.length < 20) {
      issues.push('Respuesta demasiado corta')
      suggestions.push('Agregar más información')
    }

    if (response.length > 1000) {
      issues.push('Respuesta demasiado larga')
      suggestions.push('Condensar información')
    }

    // Validar que mencione precio si preguntaron por precio
    if (reasoning.finalIntent === 'ask_price' && !response.includes('COP') && !response.includes('$')) {
      issues.push('No menciona precio cuando se preguntó por él')
      suggestions.push('Incluir precio del producto')
    }

    // Validar que incluya enlaces si preguntaron por links
    if (reasoning.finalIntent === 'request_payment_link' && !response.includes('http') && !response.includes('WhatsApp')) {
      issues.push('No incluye enlaces de pago cuando se solicitaron')
      suggestions.push('Incluir métodos de pago disponibles')
    }

    // Validar que no sea demasiado genérica
    if (response.includes('no tengo') || response.includes('no está disponible')) {
      if (reasoning.productFound) {
        issues.push('Dice que no tiene el producto cuando sí existe')
        suggestions.push('Revisar catálogo completo')
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    }
  }
}
