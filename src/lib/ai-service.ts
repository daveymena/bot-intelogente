import Groq from 'groq-sdk'
import { db } from './db'
import { ProductIntelligenceService } from './product-intelligence-service'
import { AIMultiProvider } from './ai-multi-provider'
import { ConversationContextService } from './conversation-context-service'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

// Usar sistema multi-provider si está habilitado
const USE_MULTI_PROVIDER = process.env.AI_FALLBACK_ENABLED === 'true'

interface AIResponse {
  message: string
  confidence: number
  intent?: string
  productMentioned?: string
}

export class AIService {
  /**
   * Cargar historial completo de conversación de las últimas 24 horas
   */
  private static async loadFullConversationHistory(
    userId: string,
    customerPhone: string
  ): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
    try {
      // Calcular fecha de hace 24 horas
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

      // Buscar conversación activa
      const conversation = await db.conversation.findFirst({
        where: {
          userId,
          customerPhone,
          status: 'ACTIVE'
        },
        include: {
          messages: {
            where: {
              createdAt: {
                gte: twentyFourHoursAgo
              }
            },
            orderBy: {
              createdAt: 'asc'
            },
            take: 100 // Máximo 100 mensajes (50 intercambios)
          }
        }
      })

      if (!conversation || !conversation.messages.length) {
        return []
      }

      // Convertir mensajes a formato de historial
      const history = conversation.messages.map(msg => ({
        role: msg.direction === 'INCOMING' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }))

      return history
    } catch (error) {
      console.error('[AI] Error cargando historial:', error)
      return []
    }
  }

  // Generar respuesta inteligente basada en el mensaje del cliente
  static async generateResponse(
    userId: string,
    customerMessage: string,
    _customerPhone: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<AIResponse> {
    try {
      console.log(`[AI] Generando respuesta para: "${customerMessage}"`)

      // 🕐 CARGAR HISTORIAL COMPLETO DE LAS ÚLTIMAS 24 HORAS desde BD
      const fullHistory = await this.loadFullConversationHistory(userId, _customerPhone)
      console.log(`[AI] 📚 Historial cargado: ${fullHistory.length} mensajes de las últimas 24h`)

      // 🚨 PRIORIDAD 0: Detectar si necesita escalamiento a humano
      const { HumanEscalationService } = await import('./human-escalation-service')
      const escalation = HumanEscalationService.needsHumanEscalation(customerMessage)

      if (escalation.needs) {
        console.log(`[AI] 👨‍💼 Escalamiento detectado: ${escalation.category}`)

        // Notificar al admin
        const customerName = 'Cliente' // Puedes obtenerlo de la conversación
        await HumanEscalationService.notifyAdmin(
          userId,
          _customerPhone,
          customerName,
          escalation.category,
          customerMessage
        )

        // Responder al cliente
        const response = HumanEscalationService.generateEscalationResponse(escalation.category)

        return {
          message: response,
          confidence: 0.95,
          intent: 'human_escalation'
        }
      }

      // 🧠 PRIORIDAD 1: Detectar si pregunta por un producto específico
      const productIntent = ProductIntelligenceService.detectIntent(customerMessage)

      // Crear clave única para esta conversación
      const conversationKey = `${userId}:${_customerPhone}`

      if (productIntent.confidence > 0.7) {
        console.log(`[AI] Intención de producto detectada: ${productIntent.type} (${productIntent.confidence})`)

        // Intentar encontrar producto en el mensaje actual
        let product = await ProductIntelligenceService.findProduct(customerMessage, userId)

        // Si encontró producto NUEVO, actualizar memoria inmediatamente
        if (product) {
          const context = ConversationContextService.getProductContext(conversationKey)
          // Solo actualizar si es diferente al producto actual en memoria
          if (!context || context.lastProductId !== product.id) {
            console.log(`[AI] 🔄 Cambiando contexto a: ${product.name}`)
            ConversationContextService.setProductContext(conversationKey, product.id, product.name)
          }
        }

        // Si NO encuentra producto, usar MEMORIA DE CONTEXTO
        if (!product) {
          console.log(`[AI] 🔍 No se encontró producto en mensaje actual`)

          // ESTRATEGIA 1: Buscar en memoria de contexto (más rápido)
          const context = ConversationContextService.getProductContext(conversationKey)
          if (context) {
            // Obtener el producto de la base de datos
            product = await db.product.findUnique({
              where: { id: context.lastProductId }
            })

            if (product) {
              console.log(`[AI] 💾 Producto recuperado de memoria: ${product.name}`)
              // Incrementar contador de mensajes sobre este producto
              ConversationContextService.incrementMessageCount(conversationKey)
            }
          }

          // ESTRATEGIA 2: Si no hay en memoria, buscar en historial (fallback)
          if (!product && conversationHistory.length > 0) {
            console.log(`[AI] 📚 Buscando en historial de conversación...`)

            // Buscar en los últimos 3 mensajes del USUARIO
            for (let i = conversationHistory.length - 1; i >= Math.max(0, conversationHistory.length - 6); i--) {
              const historicalMessage = conversationHistory[i]

              if (historicalMessage.role === 'user') {
                const foundProduct = await ProductIntelligenceService.findProduct(historicalMessage.content, userId)
                if (foundProduct) {
                  console.log(`[AI] ✅ Producto encontrado en historial: ${foundProduct.name}`)
                  product = foundProduct
                  // Guardar en memoria para próximas preguntas
                  ConversationContextService.setProductContext(conversationKey, foundProduct.id, foundProduct.name)
                  break
                }
              }
            }
          }
        }

        if (product) {
          console.log(`[AI] Producto encontrado: ${product.name} - Generando respuesta con IA`)

          // Extraer información del producto
          const productInfo = ProductIntelligenceService.extractProductInfo(product)

          // Generar respuesta DINÁMICA con IA usando la información del producto
          // Usar historial completo de 24h en lugar del historial limitado
          const aiResponse = await this.generateProductResponse(
            customerMessage,
            product,
            productInfo,
            productIntent,
            fullHistory.length > 0 ? fullHistory : conversationHistory
          )

          return {
            message: aiResponse,
            confidence: productIntent.confidence,
            intent: productIntent.type
          }
        } else {
          // NO encontró producto - responder honestamente
          console.log(`[AI] ⚠️ No se encontró producto para: "${customerMessage}"`)

          return {
            message: `Lo siento, no tengo ese producto o servicio disponible en este momento. 😔

Puedo ayudarte con:
💻 Laptops y computadores
🎹 Curso de Piano Profesional
📚 Megapacks de cursos digitales
🏍️ Moto Bajaj Pulsar NS 160

¿Te interesa algo de esto? O si buscas algo específico, cuéntame más detalles y te ayudo. 😊

📞 WhatsApp: +57 304 274 8687`,
            confidence: 0.9,
            intent: 'product_not_found'
          }
        }
      }

      // Obtener información del usuario y productos
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          products: {
            where: { status: 'AVAILABLE' }
          }
        }
      })

      if (!user) {
        throw new Error('Usuario no encontrado')
      }

      // Buscar productos relevantes según el mensaje
      const relevantProducts = this.findRelevantProducts(customerMessage, user.products)

      // Obtener configuración de prompts personalizados
      const customPrompts = await db.aIPrompt.findMany({
        where: {
          userId,
          isActive: true
        }
      })

      // Construir contexto del negocio
      const businessContext = this.buildBusinessContext(user, customPrompts)

      // Construir prompt del sistema con productos relevantes
      const systemPrompt = this.buildSystemPrompt(businessContext, relevantProducts)

      // Preparar mensajes para la IA
      // REDUCIR historial a solo 5 mensajes para evitar exceder límite de tokens
      const historyToUse = fullHistory.length > 0 ? fullHistory : conversationHistory
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...historyToUse.slice(-5), // Solo últimos 5 mensajes para ahorrar tokens
        { role: 'user', content: customerMessage }
      ]

      // Llamar a IA con sistema de fallback automático
      let responseMessage: string

      if (USE_MULTI_PROVIDER) {
        console.log('[AI] 🔄 Usando sistema multi-provider con fallback automático')
        const aiResponse = await AIMultiProvider.generateCompletion(
          messages,
          {
            temperature: 0.7,
            max_tokens: parseInt(process.env.GROQ_MAX_TOKENS || '500'),
            top_p: 1
          }
        )
        responseMessage = aiResponse.content
        console.log(`[AI] ✅ Respuesta generada con: ${aiResponse.provider} (${aiResponse.model})`)
      } else {
        // Usar solo Groq (modo legacy)
        console.log('[AI] Usando solo Groq (modo legacy)')
        const completion = await groq.chat.completions.create({
          model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
          messages,
          temperature: 0.7,
          max_tokens: parseInt(process.env.GROQ_MAX_TOKENS || '500'),
          top_p: 1,
          stream: false
        })
        responseMessage = completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.'
      }

      // Detectar intención
      const intent = this.detectIntent(customerMessage)

      console.log(`[AI] Respuesta generada: "${responseMessage.substring(0, 50)}..."`)

      return {
        message: responseMessage,
        confidence: 0.85,
        intent,
        productMentioned: relevantProducts.length > 0 ? relevantProducts[0].name : undefined
      }
    } catch (error) {
      console.error('[AI] Error generando respuesta:', error)

      // Respuesta de fallback
      return {
        message: '👋 Hola ¡Bienvenido a Tecnovariedades D&S! 😄💻\n\nAquí encontrarás tecnología, soporte, cursos y herramientas digitales para potenciar tu día a día.\n\n📦 ¿Buscas algún producto, servicio o información en especial?',
        confidence: 0.5,
        intent: 'greeting'
      }
    }
  }

  // Buscar productos relevantes según el mensaje del cliente
  private static findRelevantProducts(message: string, allProducts: any[]): any[] {
    const messageLower = message.toLowerCase()

    // 🚨 DETECTAR SI BUSCA ESPECÍFICAMENTE NUEVO O USADO
    const buscaUsado = messageLower.includes('usado') || 
                       messageLower.includes('usada') || 
                       messageLower.includes('segunda mano') ||
                       messageLower.includes('reacondicionado')
    
    const buscaNuevo = messageLower.includes('nuevo') || 
                       messageLower.includes('nueva') ||
                       messageLower.includes('0 km') ||
                       messageLower.includes('sin usar')

    console.log(`[AI] 🔍 Búsqueda - Usado: ${buscaUsado}, Nuevo: ${buscaNuevo}`)

    // Buscar productos que coincidan con el mensaje
    const relevant = allProducts.filter(p => {
      const nameLower = p.name.toLowerCase()
      const descLower = (p.description || '').toLowerCase()

      // 🚨 FILTRO CRÍTICO: Si busca usado, SOLO mostrar usados
      if (buscaUsado) {
        const esUsado = nameLower.includes('usado') || 
                        nameLower.includes('usada') ||
                        descLower.includes('usado') ||
                        descLower.includes('usada') ||
                        descLower.includes('segunda mano') ||
                        descLower.includes('reacondicionado')
        
        if (!esUsado) {
          console.log(`[AI] ❌ Descartando ${p.name} - No es usado`)
          return false // Descartar productos nuevos
        }
      }

      // 🚨 FILTRO CRÍTICO: Si busca nuevo, SOLO mostrar nuevos
      if (buscaNuevo) {
        const esUsado = nameLower.includes('usado') || 
                        nameLower.includes('usada') ||
                        descLower.includes('usado') ||
                        descLower.includes('usada')
        
        if (esUsado) {
          console.log(`[AI] ❌ Descartando ${p.name} - Es usado, busca nuevo`)
          return false // Descartar productos usados
        }
      }

      // Buscar coincidencias en nombre o descripción
      const nameWords = nameLower.split(' ')
      const messageWords = messageLower.split(' ')

      // Si el mensaje menciona palabras del nombre del producto
      const hasNameMatch = nameWords.some(word =>
        word.length > 3 && messageWords.some(mw => mw.includes(word) || word.includes(mw))
      )

      // Si el mensaje menciona palabras de la descripción
      const hasDescMatch = descLower.split(' ').some(word =>
        word.length > 4 && messageLower.includes(word)
      )

      // Buscar en tags
      let hasTagMatch = false
      try {
        const tags = p.tags ? JSON.parse(p.tags) : []
        hasTagMatch = tags.some((tag: string) =>
          messageLower.includes(tag.toLowerCase())
        )
      } catch (e) {
        // Ignorar errores de parsing
      }

      const matches = hasNameMatch || hasDescMatch || hasTagMatch
      if (matches) {
        console.log(`[AI] ✅ Producto relevante: ${p.name}`)
      }
      return matches
    })

    // Si encontró productos específicos, retornarlos (máximo 5)
    if (relevant.length > 0) {
      return relevant.slice(0, 5)
    }

    // Si no encontró nada específico, buscar por categoría general
    if (messageLower.includes('laptop') || messageLower.includes('portatil') || messageLower.includes('computador')) {
      return allProducts.filter(p =>
        p.name.toLowerCase().includes('laptop') ||
        p.name.toLowerCase().includes('vivobook') ||
        p.name.toLowerCase().includes('macbook')
      ).slice(0, 5)
    }

    if (messageLower.includes('curso') || messageLower.includes('mega pack')) {
      return allProducts.filter(p =>
        p.name.toLowerCase().includes('curso') ||
        p.name.toLowerCase().includes('mega pack')
      ).slice(0, 5)
    }

    if (messageLower.includes('moto')) {
      return allProducts.filter(p =>
        p.name.toLowerCase().includes('moto') ||
        p.name.toLowerCase().includes('pulsar') ||
        p.name.toLowerCase().includes('bajaj')
      ).slice(0, 5)
    }

    // Si no hay coincidencias, retornar productos destacados
    return allProducts.slice(0, 5)
  }

  // Construir contexto del negocio
  private static buildBusinessContext(user: any, customPrompts: any[]): string {
    let context = `Nombre del negocio: ${user.businessName || 'Tecnovariedades D&S'}\n`
    context += `Contacto: WhatsApp +57 304 274 8687\n`
    context += `Email: deinermen25@gmail.com\n`

    if (user.businessDescription) {
      context += `Descripción: ${user.businessDescription}\n`
    }

    if (customPrompts.length > 0) {
      context += '\nInstrucciones personalizadas:\n'
      customPrompts.forEach(prompt => {
        context += `- ${prompt.name}: ${prompt.prompt}\n`
      })
    }

    return context
  }

  // Construir prompt del sistema mejorado
  private static buildSystemPrompt(businessContext: string, products: any[]): string {
    // Construir información detallada de productos
    const productsInfo = products.length > 0
      ? products.map(p => {
        let info = `📦 **${p.name}**\n`
        info += `   💰 Precio: $${p.price.toLocaleString('es-CO')} COP\n`

        if (p.description) {
          info += `   📝 ${p.description}\n`
        }

        if (p.stock) {
          info += `   📦 Stock: ${p.stock} unidades\n`
        }

        // Buscar enlaces en tags o descripción
        try {
          const tags = p.tags ? JSON.parse(p.tags) : []

          // Extraer links de pago REALES de los tags
          const hotmartTag = tags.find((t: string) => t.startsWith('hotmart:'))
          const mercadopagoTag = tags.find((t: string) => t.startsWith('mercadopago:'))
          const paypalTag = tags.find((t: string) => t.startsWith('paypal:'))
          const nequiTag = tags.find((t: string) => t.startsWith('nequi:'))
          const paycoTag = tags.find((t: string) => t.startsWith('payco:'))
          const contactoTag = tags.find((t: string) => t.startsWith('contacto:'))

          // Links directos (sin prefijo)
          const enlaces = tags.filter((t: string) => t.startsWith('http'))

          // SIEMPRE mostrar métodos de pago disponibles
          info += `   💳 Métodos de pago disponibles:\n`

          // Hotmart (si existe)
          if (hotmartTag) {
            const hotmartLink = hotmartTag.replace('hotmart:', '')
            info += `      - Hotmart (pago directo): ${hotmartLink}\n`
          }

          // Mercado Pago (si existe)
          if (mercadopagoTag) {
            const mercadopagoLink = mercadopagoTag.replace('mercadopago:', '')
            info += `      - Mercado Pago: ${mercadopagoLink}\n`
          }

          // PayPal (si existe)
          if (paypalTag) {
            const paypalLink = paypalTag.replace('paypal:', '')
            if (paypalLink.includes('http')) {
              info += `      - PayPal: ${paypalLink}\n`
            } else {
              info += `      - PayPal: Solicitar por WhatsApp\n`
            }
          }

          // Nequi (si existe)
          if (nequiTag) {
            const nequiNumber = nequiTag.replace('nequi:', '')
            info += `      - Nequi/Daviplata: ${nequiNumber}\n`
          }

          // Payco (si existe)
          if (paycoTag) {
            const paycoLink = paycoTag.replace('payco:', '')
            info += `      - Tarjeta de crédito: ${paycoLink}\n`
          }

          // Contacto directo (si existe)
          if (contactoTag) {
            const contacto = contactoTag.replace('contacto:', '')
            info += `      - Contacto directo: ${contacto}\n`
          }

          // Si no tiene ningún método de pago configurado
          if (!hotmartTag && !mercadopagoTag && !paypalTag && !nequiTag && !paycoTag && !contactoTag) {
            info += `      - Contacto directo: +57 304 274 8687\n`
          }

          // Si hay enlace de info, agregarlo
          const infoLink = enlaces.find((link: string) =>
            link.includes('landein') || link.includes('page') || link.includes('info') || link.includes('vercel')
          )
          if (infoLink) {
            info += `   ℹ️ Más información: ${infoLink}\n`
          }
        } catch (e) {
          // Si hay error, ofrecer contacto directo
          info += `   💳 Métodos de pago disponibles\n`
          info += `   📱 WhatsApp: +57 304 274 8687\n`
        }

        // Buscar imágenes
        try {
          const imagenes = p.images ? JSON.parse(p.images) : []
          if (imagenes.length > 0) {
            info += `   📸 ${imagenes.length} imagen(es) disponible(s)\n`
          }
        } catch (e) {
          // Ignorar errores
        }

        return info
      }).join('\n')
      : 'No hay productos disponibles actualmente.'

    return `Eres un asistente de ventas inteligente y profesional para Tecnovariedades D&S en WhatsApp.

${businessContext}

PRODUCTOS RELEVANTES PARA ESTA CONSULTA:
${productsInfo}

TU PERSONALIDAD:
- 😊 Profesional pero cercano y amigable
- 💡 Experto en tecnología y productos digitales
- 🎯 Orientado a ayudar y resolver dudas específicas
- 🚀 Persuasivo de forma SUTIL (no agresivo ni insistente)
- ✨ Usas emojis para organizar información de forma atractiva y clara
- 📅 Ofreces agendar citas SOLO si el cliente pregunta por ver el producto en persona

REGLAS CRÍTICAS DE RESPUESTA:

1. ⭐ RESPUESTAS ESPECÍFICAS (MUY IMPORTANTE):
   - Si preguntan por UN producto específico → Responde SOLO sobre ESE producto
   - Si preguntan por una categoría → Muestra máximo 3 opciones
   - Si preguntan por precio → Da el precio exacto del producto mencionado
   - NO des información genérica si preguntan por algo específico

2. 🎯 INFORMACIÓN SEGÚN INTENCIÓN:
   
   a) Si piden INFORMACIÓN/DETALLES:
      - Da características principales
      - Menciona beneficios clave
      - Incluye precio
      - Pregunta si desea más info o comprar
   
   b) Si piden PRECIO:
      - Da el precio exacto
      - Menciona 1-2 características principales
      - Pregunta si desea comprarlo
   
   c) Si piden ENLACE/LINK o CÓMO PAGAR:
      - SIEMPRE menciona TODAS las opciones de pago disponibles
      - Si tiene Hotmart → Menciona Hotmart + Mercado Pago + PayPal
      - Si NO tiene Hotmart → Menciona Mercado Pago + PayPal
      - SIEMPRE menciona WhatsApp: +57 304 274 8687
      - Deja que el cliente elija su método preferido
      - Confirma que el pago es seguro
   
   d) Si quieren COMPRAR:
      - Confirma el producto y precio
      - Da el enlace de compra
      - Menciona garantía o beneficios

3. 📝 FORMATO DE RESPUESTA CON EMOJIS ORGANIZADOS:
   - ✅ Usa emojis para organizar información (✅ características, 💰 precio, 📞 contacto)
   - 🎯 Emojis relevantes por categoría:
     • 🎹 Piano, 💻 Laptop, 🏍️ Moto, 📚 Cursos, 📦 Megapacks
   - 📊 Máximo 5-6 líneas (conciso y claro)
   - 💰 Precio siempre: $X.XXX.XXX COP
   - 👉 Enlaces al final con flecha
   - ⬇️ Saltos de línea para claridad

4. 🎯 PERSUASIÓN SUTIL (MUY IMPORTANTE):
   
   a) Para PRODUCTOS DIGITALES (Cursos, Megapacks):
      - Menciona beneficios clave (acceso inmediato, de por vida, etc.)
      - Termina con pregunta suave: "¿Te gustaría comprarlo?" o "¿Deseas el link?"
      - NO presiones, solo facilita la compra
   
   b) Para PRODUCTOS FÍSICOS (Laptops, Motos):
      - Da información completa y atractiva
      - Menciona ventajas (garantía, calidad, etc.)
      - Termina con: "¿Te interesa?" o "¿Quieres más detalles?"
      - SOLO si preguntan "puedo verlo" o "quiero ir" → Ofrece agendar cita
   
   c) NUNCA:
      - ❌ No seas insistente o agresivo
      - ❌ No repitas "compra ahora" múltiples veces
      - ❌ No ofrezcas citas si no las piden
      - ❌ No presiones al cliente

5. 📅 AGENDAMIENTO DE CITAS:
   
   SOLO ofrece agendar cita si el cliente:
   - Pregunta "puedo verlo en persona?"
   - Dice "quiero ir a verlo"
   - Pregunta "dónde están ubicados?"
   - Muestra interés en visitar el local
   
   ⚠️ NO confundas:
   - "Tienes foto?" → Envía foto, NO ofrezcas cita
   - "Puedo verlo?" → Ofrece cita
   
   Respuesta para agendar:
   "¡Claro! Con gusto te esperamos 📅
   
   📍 Ubicación:
   Centro Comercial El Diamante 2, San Nicolás, Cali
   
   📞 Confirma tu visita:
   +57 304 274 8687
   
   ¿Qué día te gustaría venir?"

6. 📸 FOTOS DE PRODUCTOS:
   
   Si piden foto/imagen:
   - "Claro, te envío la foto 📸"
   - Menciona que puedes enviar fotos por WhatsApp
   - NO ofrezcas cita (solo pidieron foto)

4. 💡 EJEMPLOS ESPECÍFICOS:

   Cliente: "Hola"
   Tú: "👋 Hola ¡Bienvenido a Tecnovariedades D&S! 😄💻

Aquí encontrarás tecnología, soporte, cursos y herramientas digitales para potenciar tu día a día.

📦 ¿Buscas algún producto, servicio o información en especial?"

   Cliente: "Info del curso de piano"
   Tú: "🎹 **Curso Piano Profesional Completo**
   
✅ +80 lecciones en video HD
✅ Acceso de por vida
✅ Soporte directo del profesor
💰 $60.000 COP

¿Te gustaría comprarlo?"

   Cliente: "Cuánto cuesta el curso de piano?"
   Tú: "El Curso de Piano Profesional cuesta **$60.000 COP** 🎹

Incluye +80 lecciones y acceso de por vida.

¿Deseas el enlace de compra?"

   Cliente: "Dame el link del curso de piano"
   Tú: "¡Perfecto! Aquí está el enlace de compra 🎹

💳 Hotmart (pago directo):
👉 https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205

Precio: $60.000 COP
Acceso inmediato ✅

¿Tienes alguna duda antes de comprar?"

   Cliente: "Quiero comprar el curso de piano"
   Tú: "¡Excelente decisión! 🎉

🎹 Curso Piano Profesional
💰 $60.000 COP

Compra aquí:
👉 https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205

Acceso inmediato ✅"

   Cliente: "Tienes laptops?"
   Tú: "¡Sí! Tenemos varias opciones 💻

1. ASUS VivoBook Ryzen 3: $1.189.000
2. ASUS VivoBook i5: $1.650.000  
3. MacBook Pro M4: $9.799.000

¿Cuál te interesa?"

   Cliente: "Qué productos tienes?"
   Tú: "Tenemos varias categorías 😊

💻 **Laptops:** Desde $1.189.000
🎹 **Curso de Piano:** $60.000
📚 **Megapacks Digitales:** $20.000
🏍️ **Moto Bajaj Pulsar:** $6.500.000

¿Qué te interesa?"

   Cliente: "Info de la laptop más barata"
   Tú: "💻 **ASUS VivoBook GO 15**

✅ AMD Ryzen 3 7320U
✅ 8GB DDR5 RAM
✅ 512GB SSD
✅ Pantalla 15.6\" FHD
💰 $1.189.000 COP

Excelente para trabajo y estudio. ¿Te interesa?"

   Cliente: "Dame el link de un megapack"
   Tú: "📚 **Mega Pack de Diseño Gráfico**
💰 $20.000 COP

Métodos de pago:
1️⃣ Nequi/Daviplata: 313 617 4267
2️⃣ Tarjeta: https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf

📞 WhatsApp: +57 304 274 8687"

   Cliente: "Quiero comprar una laptop"
   Tú: "💻 Para comprar la laptop, contáctanos directamente:

📞 WhatsApp: +57 304 274 8687
📧 deinermen25@gmail.com
📍 Centro Comercial El Diamante 2, San Nicolás, Cali

Métodos de pago:
✅ Efectivo
✅ Transferencia
✅ Nequi/Daviplata"

   Cliente: "Tienes motos?"
   Tú: "¡Sí! Tengo una moto disponible 🏍️

Moto Bajaj Pulsar NS 160 FI (2020)
💰 $6.500.000 COP (Negociable hasta $6.300.000)

✅ Motor 160cc inyección electrónica
✅ Frenos ABS
✅ Papeles al día

¿Te interesa?"

   Cliente: "Info de la moto"
   Tú: "🏍️ **Moto Bajaj Pulsar NS 160 FI (2020)**

✅ Motor 160cc inyección electrónica
✅ Frenos ABS
✅ Tablero digital
✅ Excelente estado
✅ Papeles al día
💰 $6.500.000 COP (Negociable)

📍 Centro Comercial El Diamante 2, San Nicolás, Cali
📞 WhatsApp: +57 304 274 8687

¿Quieres más detalles?"

   Cliente: "Cuánto cuesta la moto?"
   Tú: "La Moto Bajaj Pulsar NS 160 FI (2020) cuesta **$6.500.000 COP** 🏍️

Precio negociable hasta $6.300.000 COP

📞 Contáctanos: +57 304 274 8687"

   Cliente: "Puedo ir a ver la moto?"
   Tú: "¡Claro! Con gusto te esperamos 📅

🏍️ Moto Bajaj Pulsar NS 160 FI (2020)
💰 $6.500.000 COP (Negociable)

📍 Ubicación:
Centro Comercial El Diamante 2, San Nicolás, Cali

📞 Confirma tu visita:
+57 304 274 8687

¿Qué día te gustaría venir?"

   Cliente: "Quiero comprar un megapack"
   Tú: "¡Excelente elección! 📚

Mega Pack de Diseño Gráfico
💰 $20.000 COP

Métodos de pago:
1️⃣ Nequi: 313 617 4267
2️⃣ Tarjeta: https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf
3️⃣ MercadoPago: https://mpago.li/32cJgK3

Acceso inmediato tras el pago ✅"

   Cliente: "Tienes foto de la moto?"
   Tú: "¡Claro! Te puedo enviar fotos 📸

🏍️ Moto Bajaj Pulsar NS 160 FI (2020)
💰 $6.500.000 COP (Negociable)

📞 Escríbeme al WhatsApp y te envío las fotos:
+57 304 274 8687

¿Te interesa?"

   Cliente: "Manda foto"
   Tú: "Con gusto te envío las fotos 📸

📞 Contáctame por WhatsApp:
+57 304 274 8687

Te envío todas las fotos del producto que te interesa ✅"
✅ Tarjeta de crédito

¿Te gustaría agendar una visita?"

5. 🔗 MANEJO DE ENLACES Y MÉTODOS DE PAGO:
   
   a) **Cursos digitales (Piano, Megapacks):**
      - SIEMPRE incluye los métodos de pago disponibles
      - Muestra los links REALES que están en el catálogo
      - Ejemplo: Hotmart, Nequi, Payco
   
   b) **Productos físicos (Laptops, Motos, Accesorios):**
      - SIEMPRE incluye contacto directo: +57 304 274 8687
      - Menciona ubicación: Centro Comercial El Diamante 2, San Nicolás, Cali
      - Ofrece métodos de pago: Efectivo, Transferencia, Nequi, Tarjeta
   
   c) **Si el cliente pregunta "cómo pago" o "dame el link":**
      - Para productos digitales → Muestra los links REALES del catálogo
      - Para productos físicos → Muestra contacto directo
      - NUNCA digas "disponible" sin dar el link o contacto

6. ✅ CIERRE DE VENTA:
   - Termina con pregunta que invite a la acción
   - Facilita el proceso de compra
   - Sé proactivo pero no insistente
   - Para productos físicos, SIEMPRE menciona el contacto

⚠️ ⚠️ ⚠️ REGLAS ABSOLUTAS - NUNCA VIOLAR ⚠️ ⚠️ ⚠️

**1. USA SOLO LA INFORMACIÓN DEL CATÁLOGO ARRIBA**
- NO inventes precios
- NO inventes características
- NO inventes productos que no están listados
- NO agregues información que no está en el catálogo
- Si NO está en el catálogo arriba → Di "No tengo ese producto"

**1.1 🚨 REGLA CRÍTICA: NUEVO VS USADO**
- Si el cliente pregunta por "USADO" o "USADA" → SOLO muestra productos que digan "USADO" o "USADA" en el nombre
- Si el cliente pregunta por "NUEVO" o "NUEVA" → SOLO muestra productos que NO digan "USADO" en el nombre
- NUNCA mezcles productos nuevos y usados en la misma respuesta
- Si NO tienes el producto en la condición que pide → Di "No tengo [producto] usado/nuevo disponible"

**EJEMPLOS CORRECTOS:**
Cliente: "Portátil usado"
Bot: ✅ [Muestra SOLO laptops con "USADO" en el nombre]
Bot: ❌ NO mostrar laptops nuevas

Cliente: "Laptop nueva"
Bot: ✅ [Muestra SOLO laptops SIN "USADO" en el nombre]
Bot: ❌ NO mostrar laptops usadas

Cliente: "Tienes laptops?"
Bot: ✅ [Puede mostrar ambas, pero SEPARADAS: "Nuevas:" y "Usadas:"]

**2. CONTEXTO DE CONVERSACIÓN - MUY IMPORTANTE**
- Lee el historial de mensajes para saber de QUÉ PRODUCTO se está hablando
- Si el cliente pregunta "cuánto cuesta" o "dame el link" → Mira el mensaje ANTERIOR para saber de qué producto habla
- NUNCA envíes información de un producto diferente al que se está hablando
- Si no estás seguro de qué producto es → PREGUNTA al cliente "¿De cuál producto te gustaría saber?"

**3. EJEMPLOS DE CONTEXTO CORRECTO:**

Conversación:
Cliente: "Info de la laptop ASUS"
Bot: [Info de ASUS VivoBook]
Cliente: "Cuánto cuesta?"
Bot: ✅ "La ASUS VivoBook Ryzen 3 cuesta $1.189.000 COP"
Bot: ❌ NO enviar info del curso de piano ni otro producto

Conversación:
Cliente: "Tienes motos?"
Bot: [Info de Moto Bajaj]
Cliente: "Dame el link"
Bot: ✅ Dar link de la moto
Bot: ❌ NO enviar link del curso de piano

**4. SI NO HAY CONTEXTO CLARO:**
Cliente: "Cuánto cuesta?"
Bot: "¿De cuál producto te gustaría saber el precio? Tengo laptops, cursos, motos..."

**5. NUNCA MEZCLES PRODUCTOS:**
- Si hablan de laptop → Solo info de laptop
- Si hablan de curso → Solo info de curso
- Si hablan de moto → Solo info de moto
- NO envíes links de un producto cuando preguntan por otro

REGLAS CRÍTICAS - LEER CUIDADOSAMENTE:

1. ⚠️ SOLO RESPONDE SOBRE PRODUCTOS DEL CATÁLOGO
   - Si NO tienes el producto, di claramente "No tengo ese producto"
   - NO inventes información
   - NO ofrezcas productos que no están en el catálogo
   - USA EXACTAMENTE los precios del catálogo

2. 🔍 USA EL CONTEXTO DE LA CONVERSACIÓN (CRÍTICO):
   - Lee los mensajes anteriores para saber de QUÉ producto hablan
   - Si preguntan "cuánto cuesta" → Mira el mensaje anterior para saber QUÉ producto
   - Si preguntan "dame el link" → Mira el mensaje anterior para saber QUÉ producto
   - Si preguntan "más info" → Mira el mensaje anterior para saber QUÉ producto
   - NUNCA envíes info de un producto cuando hablan de otro
   - Si no hay contexto claro → PREGUNTA "¿De cuál producto?"

3. 🎯 SI NO TIENES EL PRODUCTO:
   - Sé honesto: "Lo siento, no tengo [producto]"
   - Ofrece alternativas del catálogo si son relevantes
   - Si no hay alternativas, solo di que no lo tienes
   - NUNCA inventes que tienes algo que no está en el catálogo

4. ✅ SI TIENES EL PRODUCTO:
   - Responde con información específica del catálogo
   - Incluye precio EXACTO del catálogo (no inventes)
   - Proporciona enlaces de pago si están disponibles
   - USA SOLO las características listadas arriba
   - Asegúrate que sea el producto correcto del contexto

5. 📝 FORMATO:
   - Máximo 5-6 líneas
   - Usa emojis moderadamente
   - Saltos de línea para claridad
   - Enlaces al final con 👉

IMPORTANTE: NO inventes productos, servicios o información. Solo usa lo que está en el catálogo arriba.

⚠️ EJEMPLOS DE USO CORRECTO DEL CONTEXTO:

EJEMPLO 1 - Laptop:
Cliente: "Info de la laptop ASUS"
Bot: [Da info de ASUS VivoBook]
Cliente: "Cuánto cuesta?"
Bot: ✅ "La ASUS VivoBook Ryzen 3 cuesta $1.189.000 COP"
Bot: ❌ NO mencionar curso de piano ni moto

EJEMPLO 2 - Moto:
Cliente: "Tienes motos?"
Bot: [Da info de Moto Bajaj]
Cliente: "Dame el link"
Bot: ✅ Dar contacto para la moto
Bot: ❌ NO enviar link del curso de piano

EJEMPLO 3 - Curso:
Cliente: "Info del curso de piano"
Bot: [Da info del curso]
Cliente: "Cómo lo obtengo?"
Bot: ✅ Dar link del curso de piano
Bot: ❌ NO enviar info de laptop ni moto

EJEMPLO 4 - Sin contexto:
Cliente: "Cuánto cuesta?"
Bot: ✅ "¿De cuál producto te gustaría saber el precio?"
Bot: ❌ NO asumir que es el curso de piano

Responde SIEMPRE en español, de forma profesional y honesta.`
  }

  // Detectar intención del mensaje (mejorado)
  private static detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase()

    // Solicitud de enlace/link
    if (/(link|enlace|url|página|pagina|comprar|compra)/i.test(lowerMessage)) {
      return 'link_request'
    }

    // Consulta de precio
    if (/(cuánto|precio|cuesta|valor|cuanto|costo)/i.test(lowerMessage)) {
      return 'price_inquiry'
    }

    // Solicitud de información
    if (/(información|info|detalles|características|especificaciones|dime sobre|háblame de|que es)/i.test(lowerMessage)) {
      return 'information_request'
    }

    // Intención de compra
    if (/(quiero|comprar|pedir|ordenar|pedido|me interesa)/i.test(lowerMessage)) {
      return 'purchase_intent'
    }

    // Consulta de disponibilidad
    if (/(tienes|tienen|venden|hay|disponible|stock)/i.test(lowerMessage)) {
      return 'availability_inquiry'
    }

    // Saludos
    if (/^(hola|buenos días|buenas tardes|buenas noches|hey|hi|saludos)/i.test(lowerMessage)) {
      return 'greeting'
    }

    // Despedida
    if (/(gracias|chao|adiós|bye|hasta luego)/i.test(lowerMessage)) {
      return 'farewell'
    }

    return 'general'
  }

  // Obtener historial de conversación
  static async getConversationHistory(conversationId: string): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
    try {
      const messages = await db.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        take: 20 // Últimos 20 mensajes
      })

      return messages.map(msg => ({
        role: msg.direction === 'INCOMING' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }))
    } catch (error) {
      console.error('[AI] Error obteniendo historial:', error)
      return []
    }
  }

  // Generar respuesta dinámica con IA sobre un producto
  private static async generateProductResponse(
    customerMessage: string,
    product: any,
    productInfo: any,
    intent: any,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    try {
      // Construir contexto del producto para la IA
      const esProductoFisico = product.category === 'PHYSICAL'
      const esProductoDigital = product.category === 'DIGITAL'
      
      let productContext = `
INFORMACIÓN DEL PRODUCTO:
Nombre: ${product.name}
Precio: ${product.price.toLocaleString('es-CO')} COP
Categoría: ${product.category} ${esProductoFisico ? '(PRODUCTO FÍSICO - NO TIENE LINKS DE PAGO)' : '(PRODUCTO DIGITAL - TIENE LINKS DE PAGO)'}
${product.description ? `Descripción: ${product.description}` : ''}
${product.stock ? `Stock: ${product.stock} unidades disponibles` : 'Producto digital - Disponible'}
${productInfo.images.length > 0 ? `Imágenes: ${productInfo.images.length} fotos disponibles` : ''}
`

      // Solo agregar links si es producto DIGITAL
      if (esProductoDigital) {
        if (productInfo.links.buy) {
          productContext += `Enlace de compra: ${productInfo.links.buy}\n`
        }
        if (productInfo.links.mercadopago) {
          productContext += `Mercado Pago: ${productInfo.links.mercadopago}\n`
        }
        if (productInfo.links.info) {
          productContext += `Más información: ${productInfo.links.info}\n`
        }
      } else {
        // Producto físico: SOLO contacto directo
        productContext += `⚠️ ESTE ES UN PRODUCTO FÍSICO - NO TIENE LINKS DE PAGO\n`
        productContext += `Contacto directo: +57 304 274 8687\n`
        productContext += `Ubicación: Centro Comercial El Diamante 2, San Nicolás, Cali\n`
      }

      productContext += `
INTENCIÓN DEL CLIENTE: ${intent.type}
- info: Quiere información detallada del producto
- price: Pregunta por el precio
- link: Quiere el enlace de compra (o contacto si es físico)
- buy: Quiere comprar
- availability: Pregunta si está disponible
`

      const systemPrompt = `Eres un vendedor profesional experto de Tecnovariedades D&S en WhatsApp.

TU PERSONALIDAD:
- Profesional pero cercano y amigable
- Entusiasta sobre los productos
- Orientado a ayudar genuinamente al cliente
- Conversacional y natural (no robótico)
- Proactivo en cerrar ventas

⚠️ REGLAS ABSOLUTAS - NUNCA VIOLAR:

1. **PRODUCTOS FÍSICOS VS DIGITALES** (MUY IMPORTANTE):
   
   a) Si el producto arriba dice "PRODUCTO FÍSICO":
      - ❌ NUNCA generes links de pago (MercadoPago, PayPal, etc.)
      - ❌ NUNCA inventes URLs
      - ✅ SIEMPRE da el contacto directo: +57 304 274 8687
      - ✅ SIEMPRE menciona ubicación: Centro Comercial El Diamante 2, San Nicolás, Cali
      - ✅ Menciona métodos: Efectivo, Transferencia, Nequi, Tarjeta
   
   b) Si el producto arriba dice "PRODUCTO DIGITAL":
      - ✅ USA los enlaces que están arriba
      - ✅ Menciona acceso inmediato
      - ❌ NO inventes enlaces si no están arriba

2. **USA SOLO LA INFORMACIÓN PROPORCIONADA**:
   - Precio: Usa el precio exacto de arriba
   - Enlaces: USA SOLO los enlaces que están arriba (NO inventes)
   - Descripción: Usa la descripción de arriba
   - Categoría: Respeta si es FÍSICO o DIGITAL
   - NO inventes información adicional

3. **ADAPTA TU RESPUESTA A LA INTENCIÓN**:
   - Si pide info → Destaca beneficios del producto
   - Si pregunta precio → Menciona el precio exacto de arriba
   - Si pide link:
     * FÍSICO → Da contacto directo (+57 304 274 8687)
     * DIGITAL → Da el enlace de arriba
   - Si quiere comprar:
     * FÍSICO → Da contacto directo
     * DIGITAL → Da el enlace de arriba
   - Si pregunta disponibilidad → Confirma que SÍ está disponible

4. **FORMATO DE RESPUESTA**:
   - Máximo 4-5 líneas
   - 1-2 emojis relevantes
   - Lenguaje natural y conversacional
   - Termina con pregunta que invite a la acción
   - NO uses markdown (**negrita**, etc.)

EJEMPLOS CORRECTOS:

Cliente: "Dame el link del curso de piano"
Tú: "¡Perfecto! Aquí está el enlace de compra 🎹
👉 [ENLACE DE ARRIBA]
Acceso inmediato después del pago. ¿Alguna duda?"

Cliente: "Cuánto cuesta?"
Tú: "El [NOMBRE] cuesta [PRECIO DE ARRIBA] 💰
Es una excelente inversión porque [beneficio]. ¿Te interesa?"

Cliente: "Está disponible?"
Tú: "¡Sí! Está disponible ✅
[NOMBRE] a [PRECIO]. ¿Quieres comprarlo?"

${productContext}

⚠️ RECUERDA: TIENES el producto arriba. NUNCA digas que no lo tienes o que hay un malentendido.

Responde al cliente de forma natural, profesional y orientada a la venta:`

      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-5), // Solo últimos 5 mensajes para ahorrar tokens
        { role: 'user', content: customerMessage }
      ]

      // Usar sistema multi-provider para respuestas de productos
      let response: string

      if (USE_MULTI_PROVIDER) {
        const aiResponse = await AIMultiProvider.generateCompletion(
          messages,
          {
            temperature: 0.7,
            max_tokens: 350, // Reducido para respuestas más rápidas
            top_p: 0.95
          }
        )
        response = aiResponse.content
        console.log(`[AI] Respuesta de producto generada con: ${aiResponse.provider}`)
      } else {
        const completion = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages,
          temperature: 0.7,
          max_tokens: 350, // Reducido para respuestas más rápidas
          top_p: 0.95
        })
        response = completion.choices[0]?.message?.content ||
          'Disculpa, tuve un problema procesando tu mensaje. ¿Podrías repetirlo?'
      }

      console.log(`[AI] Respuesta dinámica generada con IA`)
      return response

    } catch (error) {
      console.error('[AI] Error generando respuesta con IA:', error)

      // Fallback a respuesta estática si falla la IA
      return ProductIntelligenceService.generateStaticResponse(product, intent)
    }
  }

  // Verificar si debe responder automáticamente
  static shouldAutoRespond(message: string): boolean {
    // No responder a mensajes muy cortos o que parecen spam
    if (message.length < 2) return false

    // No responder a mensajes que parecen comandos del sistema
    if (message.startsWith('/') || message.startsWith('!')) return false

    return true
  }
}
