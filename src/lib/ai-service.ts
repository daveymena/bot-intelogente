import Groq from 'groq-sdk'
import { db } from './db'
import { ProductIntelligenceService } from './product-intelligence-service'
import { AIMultiProvider } from './ai-multi-provider'
import { ConversationContextService } from './conversation-context-service'
import { AIAdvancedReasoning } from './ai-advanced-reasoning'
import { ConversationBudgetService } from './conversation-budget-service'
import { ProductContextManager } from './product-context-manager'
// import { TRAINING_SCENARIOS, BOT_RULES } from './sales-training-data' // Temporalmente desactivado
import { IntelligentPersonalityService } from './intelligent-personality-service'
import { ProfessionalConversationMemory } from './professional-conversation-memory'
import { MegaflujoService } from './megaflujos-service'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

// Usar sistema multi-provider si está habilitado
const USE_MULTI_PROVIDER = process.env.AI_FALLBACK_ENABLED === 'true'
// FORZAR sistema de razonamiento avanzado SIEMPRE (Ollama + Groq)
const USE_ADVANCED_REASONING = true // FORZADO: Siempre usar razonamiento avanzado

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
              createdAt: 'desc'
            },
            take: 10 // Máximo 10 mensajes (5 intercambios) para evitar exceder límite de tokens
          }
        }
      })

      if (!conversation || !conversation.messages.length) {
        return []
      }

      // Convertir mensajes a formato de historial (invertir orden ya que usamos desc)
      const history = conversation.messages
        .reverse() // Invertir para tener orden cronológico
        .map(msg => ({
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

      // 🚨 PRIORIDAD -1: Detectar pregunta GENERAL sobre productos (ANTES de todo)
      // Si pregunta "¿Qué productos tienes?" sin mencionar categoría específica
      const isGeneralProductQuery = /(qué productos|que productos|productos tienes|que vendes|qué vendes|catálogo|catalogo|qué hay|que hay|qué tienen|que tienen)/i.test(customerMessage)
      
      if (isGeneralProductQuery && customerMessage.length < 50) {
        console.log(`[AI] 📋 Pregunta GENERAL sobre productos detectada`)
        
        return {
          message: `¡Hola! 😊 Tenemos varias categorías de productos:\n\n🏠 *Productos Físicos*\n• Tecnología y electrónica\n• Artículos para el hogar\n• Juguetes y entretenimiento\n\n📱 *Productos Digitales*\n• Cursos online\n• Megapacks de contenido\n• Recursos digitales\n\n🛠️ *Servicios*\n• Consultoría\n• Soporte técnico\n\n¿Qué tipo de producto te interesa? 🤔`,
          confidence: 0.98,
          intent: 'product_list'
        }
      }

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

      // Crear clave única para esta conversación
      const conversationKey = `${userId}:${_customerPhone}`

      ProfessionalConversationMemory.initMemory(conversationKey)
      await ProfessionalConversationMemory.hydrateFromStore(conversationKey)
      ProfessionalConversationMemory.incrementMessageCount(conversationKey)

      // 🚨 PRIORIDAD 1: Detectar limitación de presupuesto
      const budgetDetection = ConversationBudgetService.detectBudgetConstraint(customerMessage)
      
      if (budgetDetection.hasBudget) {
        console.log(`[AI] 💰 Limitación de presupuesto detectada: ${budgetDetection.maxBudget || 'sin monto específico'}`)
        
        // Obtener contexto del producto actual
        const productContext = ProductContextManager.getContext(conversationKey)
        
        if (productContext) {
          console.log(`[AI] 🎯 Producto en contexto: ${productContext.productName} - ${productContext.productPrice} COP`)
          
          // Guardar presupuesto
          if (budgetDetection.maxBudget) {
            ConversationBudgetService.setBudgetContext(
              conversationKey,
              budgetDetection.maxBudget,
              productContext.productId,
              productContext.productPrice,
              productContext.productName
            )
            
            // 🧠 REGISTRAR EN MEMORIA PROFESIONAL
            ProfessionalConversationMemory.setBudget(conversationKey, budgetDetection.maxBudget)
            ProfessionalConversationMemory.addIntention(conversationKey, 'budget')
          }
          
          // Buscar alternativas más baratas
          const cheaperAlternatives = await ProductContextManager.findCheaperAlternatives(
            userId,
            productContext.productId,
            productContext.productPrice,
            budgetDetection.maxBudget,
            productContext.productCategory
          )
          
          // Obtener producto actual completo
          const currentProduct = await db.product.findUnique({
            where: { id: productContext.productId }
          })
          
          if (currentProduct) {
            const budgetResponse = ConversationBudgetService.generateBudgetResponse(
              currentProduct,
              budgetDetection.maxBudget,
              cheaperAlternatives
            )
            
            return {
              message: budgetResponse,
              confidence: 0.95,
              intent: 'budget_constraint'
            }
          }
        }
      }

      // 🚨 PRIORIDAD 2: DETECTAR SOLICITUD DE PAGO PRIMERO (antes de buscar productos)
      const { IntelligentPaymentDetector: PaymentDetectorEarly } = await import('./intelligent-payment-detector')
      const isLikelyPaymentRequest = PaymentDetectorEarly.quickDetect(customerMessage)
      
      if (isLikelyPaymentRequest) {
        console.log(`[AI] 💳 ========================================`)
        console.log(`[AI] 💳 SOLICITUD DE PAGO DETECTADA`)
        console.log(`[AI] 💳 Mensaje: "${customerMessage}"`)
        console.log(`[AI] 💳 ========================================`)
        
        // Obtener producto de la memoria profesional
        const memory = ProfessionalConversationMemory.getMemory(conversationKey)
        
        console.log(`[AI] 🧠 Memoria profesional:`, memory ? {
          producto: memory.currentProduct?.name,
          id: memory.currentProduct?.id,
          precio: memory.currentProduct?.price,
          mensajes: memory.state.messageCount
        } : 'NO HAY MEMORIA')
        
        if (memory && memory.currentProduct) {
          console.log(`[AI] ✅ PRODUCTO EN MEMORIA ENCONTRADO: ${memory.currentProduct.name}`)
          console.log(`[AI] 🆔 ID del producto: ${memory.currentProduct.id}`)
          
          // Obtener producto completo de BD
          const productFromMemory = await db.product.findUnique({
            where: { id: memory.currentProduct.id }
          })
          
          if (productFromMemory) {
            console.log(`[AI] ✅ Producto obtenido de BD: ${productFromMemory.name}`)
            console.log(`[AI] 🎯 GENERANDO ENLACES DE PAGO PARA: ${productFromMemory.name}`)
            console.log(`[AI] 💳 ========================================`)
            
            const { BotPaymentLinkGenerator } = await import('./bot-payment-link-generator')
            const paymentLinks = await BotPaymentLinkGenerator.generatePaymentLinks(
              productFromMemory.id,
              userId,
              1
            )
            
            if (paymentLinks.success) {
              // 🧠 REGISTRAR INTENCIÓN DE PAGO
              ProfessionalConversationMemory.addIntention(conversationKey, 'payment')
              
              console.log(`[AI] ✅ ENLACES GENERADOS EXITOSAMENTE`)
              console.log(`[AI] 💳 ========================================`)
              
              return {
                message: paymentLinks.message,
                confidence: 0.98,
                intent: 'payment_request'
              }
            } else {
              console.log(`[AI] ❌ ERROR generando enlaces`)
            }
          } else {
            console.log(`[AI] ❌ ERROR: Producto NO encontrado en BD con ID: ${memory.currentProduct.id}`)
          }
        } else {
          console.log(`[AI] ⚠️ NO HAY PRODUCTO EN MEMORIA`)
          console.log(`[AI] 💳 ========================================`)
          
          // 🚨 NO CONTINUAR - Preguntar qué producto quiere
          return {
            message: '💳 Claro, con gusto te ayudo con el pago.\n\n¿Qué producto te gustaría comprar? 😊',
            confidence: 0.95,
            intent: 'payment_request_no_product'
          }
        }
      }

      // 🎯 PRIORIDAD 3: FLUJO DE CALIFICACIÓN (preguntas antes de mostrar productos)
      const { QualificationFlowService } = await import('./qualification-flow-service')
      
      // Verificar si hay un estado de calificación activo
      const qualificationState = QualificationFlowService.getQualificationState(conversationKey)
      
      if (qualificationState && qualificationState.needsQualified) {
        console.log(`[AI] 🎯 Estado de calificación activo: ${qualificationState.category}`)
        
        // Detectar si el mensaje es una respuesta a la pregunta de calificación
        const answerDetection = QualificationFlowService.isQualificationAnswer(
          customerMessage,
          qualificationState.category
        )
        
        if (answerDetection.isAnswer && answerDetection.intent) {
          console.log(`[AI] ✅ Respuesta de calificación detectada: ${answerDetection.intent}`)
          
          // Actualizar estado con la respuesta
          QualificationFlowService.updateQualificationAnswer(conversationKey, answerDetection.intent)
          
          // Filtrar productos según la respuesta
          const filteredProducts = await QualificationFlowService.filterProductsByQualification(
            userId,
            qualificationState.category,
            answerDetection.intent
          )
          
          if (filteredProducts.length > 0) {
            // Generar respuesta con productos filtrados
            const intro = QualificationFlowService.generateFilteredResponse(
              filteredProducts,
              qualificationState.category,
              answerDetection.intent
            )
            
            // Formatear lista de productos
            const { ProductListFormatter } = await import('./product-list-formatter')
            const formattedList = ProductListFormatter.formatProductList(
              filteredProducts,
              customerMessage
            )
            
            // Limpiar estado de calificación
            QualificationFlowService.clearQualificationState(conversationKey)
            
            // Guardar primer producto en memoria
            if (filteredProducts.length > 0) {
              ProfessionalConversationMemory.setCurrentProduct(
                conversationKey,
                filteredProducts[0].id,
                filteredProducts[0].name,
                filteredProducts[0].price,
                filteredProducts[0].category
              )
            }
            
            return {
              message: `${intro}\n\n${formattedList}`,
              confidence: 0.95,
              intent: 'qualified_product_list'
            }
          } else {
            // No hay productos para ese filtro
            QualificationFlowService.clearQualificationState(conversationKey)
            
            return {
              message: `No tengo productos específicos para ese uso en este momento. 😔\n\n¿Te gustaría ver otras opciones disponibles?`,
              confidence: 0.9,
              intent: 'no_products_for_filter'
            }
          }
        }
      }
      
      // Detectar si es una pregunta general sobre una categoría
      const generalQuery = QualificationFlowService.detectGeneralCategoryQuery(customerMessage)
      
      if (generalQuery.isGeneral && generalQuery.category) {
        console.log(`[AI] 🎯 Pregunta general detectada: ${generalQuery.category}`)
        
        // Generar pregunta de calificación
        const qualificationQuestion = QualificationFlowService.generateQualificationQuestion(
          generalQuery.category
        )
        
        // Guardar estado de calificación
        QualificationFlowService.setQualificationState(
          conversationKey,
          generalQuery.category,
          true
        )
        
        return {
          message: qualificationQuestion,
          confidence: 0.95,
          intent: 'qualification_question'
        }
      }

      // 🧠 PRIORIDAD 4: Detectar si pregunta por un producto específico
      let productIntent = ProductIntelligenceService.detectIntent(customerMessage)

      if (productIntent.confidence > 0.7) {
        console.log(`[AI] Intención de producto detectada: ${productIntent.type} (${productIntent.confidence})`)
        
        // 🧠 REGISTRAR INTENCIÓN EN MEMORIA
        ProfessionalConversationMemory.addIntention(conversationKey, productIntent.type)

        // Verificar si hay contexto de producto bloqueado
        const existingContext = ProductContextManager.getContext(conversationKey)
        
        // Detectar si es cambio explícito de producto
        const isExplicitChange = this.detectExplicitProductChange(customerMessage, existingContext)
        
        // Si hay contexto bloqueado y NO es cambio explícito, mantener el producto actual
        if (existingContext && existingContext.isLocked && !isExplicitChange) {
          console.log(`[AI] 🔒 Contexto bloqueado - Manteniendo producto: ${existingContext.productName}`)
          
          // Obtener producto del contexto
          const product = await db.product.findUnique({
            where: { id: existingContext.productId }
          })
          
          if (product) {
            // Generar respuesta enfocada en el producto actual
            const focusedResponse = ProductContextManager.generateFocusedResponse(
              product,
              customerMessage,
              productIntent.type
            )
            
            if (focusedResponse) {
              ProductContextManager.incrementMessageCount(conversationKey)
              return {
                message: focusedResponse,
                confidence: 0.95,
                intent: productIntent.type
              }
            }
          }
        }

        // Intentar encontrar producto en el mensaje actual
        let product = await ProductIntelligenceService.findProduct(customerMessage, userId)

        // Si encontró producto NUEVO, actualizar memoria inmediatamente
        if (product) {
          const context = ConversationContextService.getProductContext(conversationKey)
          // Solo actualizar si es diferente al producto actual en memoria
          if (!context || context.lastProductId !== product.id) {
            console.log(`[AI] 🔄 Cambiando contexto a: ${product.name}`)
            ConversationContextService.setProductContext(conversationKey, product.id, product.name)
            
            // También actualizar en ProductContextManager
            ProductContextManager.setContext(
              conversationKey,
              product.id,
              product.name,
              product.price,
              product.category,
              true // Bloquear contexto para mantener el foco
            )
            
            // 🧠 GUARDAR EN MEMORIA PROFESIONAL
            ProfessionalConversationMemory.setCurrentProduct(
              conversationKey,
              product.id,
              product.name,
              product.price,
              product.category
            )
          }
        }

        // Si NO encuentra producto, usar MEMORIA DE CONTEXTO
        if (!product) {
          console.log(`[AI] 🔍 No se encontró producto en mensaje actual`)

          // 📸 DETECTAR SOLICITUD DE FOTOS/IMÁGENES
          const photoRequest = this.detectPhotoRequest(customerMessage)
          if (photoRequest.isPhotoRequest) {
            console.log(`[AI] 📸 Solicitud de fotos detectada - Buscando producto en contexto...`)
          }

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
              
              // 🧠 ASEGURAR QUE ESTÉ EN MEMORIA PROFESIONAL
              ProfessionalConversationMemory.setCurrentProduct(
                conversationKey,
                product.id,
                product.name,
                product.price,
                product.category
              )
              console.log(`[AI] 🧠 Producto asegurado en memoria profesional: ${product.name}`)
              
              // Si es solicitud de fotos, marcar la intención
              if (photoRequest.isPhotoRequest) {
                productIntent = { type: 'photo', confidence: 0.95, keywords: ['foto', 'imagen'] }
                console.log(`[AI] 📸 Intención cambiada a: photo (solicitud de imágenes del producto en contexto)`)
              }
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
                  
                  // 🧠 GUARDAR EN MEMORIA PROFESIONAL
                  ProfessionalConversationMemory.setCurrentProduct(
                    conversationKey,
                    foundProduct.id,
                    foundProduct.name,
                    foundProduct.price,
                    foundProduct.category
                  )
                  console.log(`[AI] 🧠 Producto guardado en memoria profesional: ${foundProduct.name}`)
                  break
                }
              }
            }
          }
        }

        // 🎯 NUEVA LÓGICA: Detectar si es búsqueda general
        const keywords = customerMessage.toLowerCase().split(/\s+/).filter(w => w.length > 2)
        const isGeneral = ProductIntelligenceService.isGeneralProductQuery(customerMessage, keywords)
        
        if (isGeneral && !product) {
          console.log(`[AI] 🔍 Búsqueda GENERAL detectada - Buscando productos de categoría`)
          
          // Buscar múltiples productos de la categoría
          const categoryProducts = await ProductIntelligenceService.findProductsByCategory(
            customerMessage,
            userId,
            5
          )
          
          if (categoryProducts.length > 0) {
            console.log(`[AI] ✅ Encontrados ${categoryProducts.length} productos - Generando preguntas de calificación`)
            
            // 🎨 FORMATEAR LISTA DE PRODUCTOS DE FORMA VISUAL
            const { ProductListFormatter } = await import('./product-list-formatter')
            const formattedList = ProductListFormatter.formatProductList(
              categoryProducts,
              customerMessage
            )
            
            return {
              message: formattedList,
              confidence: 0.95,
              intent: 'product_list'
            }
          }
        }

        if (product) {
          console.log(`[AI] Producto encontrado: ${product.name} - Generando respuesta con IA`)

          // ℹ️ NOTA: La detección de pago ahora se hace ANTES (PRIORIDAD 2)
          // para evitar confusiones de productos. Esta sección está desactivada.

          // 🧠 GUARDAR PRODUCTO EN MEMORIA PROFESIONAL ANTES DE GENERAR RESPUESTA
          ProfessionalConversationMemory.setCurrentProduct(
            conversationKey,
            product.id,
            product.name,
            product.price,
            product.category
          )
          console.log(`[AI] 🧠 Producto guardado en memoria profesional antes de responder: ${product.name}`)

          // Extraer información del producto
          const productInfo = ProductIntelligenceService.extractProductInfo(product)

          // Generar respuesta DINÁMICA con IA usando la información del producto
          // Usar historial completo de 24h en lugar del historial limitado
          const aiResponse = await this.generateProductResponse(
            customerMessage,
            product,
            productInfo,
            productIntent,
            fullHistory.length > 0 ? fullHistory : conversationHistory,
            conversationKey,
            userId
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

      // 🎯 GUARDAR PRIMER PRODUCTO RELEVANTE EN CONTEXTO (si existe)
      if (relevantProducts.length > 0) {
        const topProduct = relevantProducts[0]
        console.log(`[AI] 💾 Guardando producto más relevante en contexto: ${topProduct.name}`)
        
        ConversationContextService.setProductContext(
          conversationKey,
          topProduct.id,
          topProduct.name
        )
        
        ProductContextManager.setContext(
          conversationKey,
          topProduct.id,
          topProduct.name,
          topProduct.price,
          topProduct.category,
          true // Bloquear contexto
        )
        
        // 🧠 GUARDAR EN MEMORIA PROFESIONAL
        ProfessionalConversationMemory.setCurrentProduct(
          conversationKey,
          topProduct.id,
          topProduct.name,
          topProduct.price,
          topProduct.category
        )
        console.log(`[AI] 🧠 Producto guardado en memoria profesional: ${topProduct.name}`)
      }

      // Obtener configuración de prompts personalizados
      const customPrompts = await db.aIPrompt.findMany({
        where: {
          userId,
          isActive: true
        }
      })

      // 🎯 USAR ESTILO CONVERSACIONAL NATURAL (como Laura)
      console.log('[AI] 💬 Usando estilo conversacional natural de ventas')
      // Construir contexto del negocio
      const businessContext = this.buildBusinessContext(user, customPrompts)

      // Construir información de productos
      const productsInfo = this.buildProductsInfo(relevantProducts)

      // 🎭 USAR SERVICIO DE PERSONALIDAD INTELIGENTE
      // Esto integra: personalidad del dashboard + base de datos + entrenamiento
      let systemPrompt = await IntelligentPersonalityService.buildSystemPrompt(
        userId,
        businessContext,
        productsInfo
      )
      
      // 📚 AGREGAR CONTEXTO DE MEGAFLUJOS
      const megaflujoContexto = MegaflujoService.obtenerContextoParaPrompt(customerMessage)
      if (megaflujoContexto) {
        systemPrompt += '\n\n' + megaflujoContexto
      }
      
      console.log('[AI] 🎭 Prompt del sistema construido con personalidad configurada')
      console.log('[AI] 📚 Contexto de megaflujos agregado')

      // Preparar mensajes para la IA
      // REDUCIR historial a solo 5 mensajes para evitar exceder límite de tokens
      const historyToUse = fullHistory.length > 0 ? fullHistory : conversationHistory
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...historyToUse.slice(-5), // Solo últimos 5 mensajes para ahorrar tokens
        { role: 'user', content: customerMessage }
      ]

      // Llamar a IA con sistema de razonamiento avanzado
      let responseMessage: string

      if (USE_ADVANCED_REASONING) {
        console.log('[AI] 🧠 Usando sistema de razonamiento avanzado (Ollama → Groq)')
        const aiResponse = await AIAdvancedReasoning.generateConversationalResponse(
          customerMessage,
          fullHistory,
          systemPrompt
        )
        responseMessage = aiResponse.content
        console.log(`[AI] ✅ Respuesta generada con: ${aiResponse.provider} (${aiResponse.model}) - Confianza: ${aiResponse.confidence}`)
      } else if (USE_MULTI_PROVIDER) {
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

      // 🧠 FALLBACK 1: Intentar usar respuestas entrenadas localmente
      try {
        // TODO: Implementar trained-response-service
        // const { trainedResponseService } = await import('./trained-response-service')
        // const trainedResponse = await trainedResponseService.findTrainedResponse(customerMessage)
        
        const trainedResponse = null // Temporalmente deshabilitado
        
        if (trainedResponse) {
          console.log('✅ Usando respuesta entrenada local (sin IA externa)')
          return {
            message: trainedResponse,
            confidence: 0.75,
            intent: 'trained_response'
          }
        }
      } catch (trainedError) {
        console.error('[AI] Error buscando respuesta entrenada:', trainedError)
      }

      // FALLBACK 2: Respuesta genérica
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

    // Si encontró productos específicos, ordenar por relevancia
    if (relevant.length > 0) {
      // 🎯 ORDENAR POR RELEVANCIA: Productos con más coincidencias primero
      const scored = relevant.map(p => {
        let score = 0
        const nameLower = p.name.toLowerCase()
        const descLower = (p.description || '').toLowerCase()
        
        // Buscar palabras clave específicas del mensaje
        const keywords = messageLower.split(' ').filter(w => w.length > 3)
        
        keywords.forEach(keyword => {
          // Coincidencia exacta en nombre = +10 puntos
          if (nameLower.includes(keyword)) {
            score += 10
          }
          // Coincidencia en descripción = +5 puntos
          if (descLower.includes(keyword)) {
            score += 5
          }
        })
        
        // Bonus si el nombre del producto aparece completo en el mensaje
        const productWords = nameLower.split(' ').filter(w => w.length > 3)
        const matchingWords = productWords.filter(pw => messageLower.includes(pw))
        score += matchingWords.length * 3
        
        return { product: p, score }
      })
      
      // Ordenar por score descendente
      scored.sort((a, b) => b.score - a.score)
      
      // Log del producto más relevante
      if (scored.length > 0) {
        console.log(`[AI] 🎯 Producto MÁS relevante: ${scored[0].product.name} (score: ${scored[0].score})`)
      }
      
      return scored.slice(0, 5).map(s => s.product)
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

  /**
   * Generar ejemplos de entrenamiento basados en los escenarios
   * TEMPORALMENTE DESACTIVADO - sales-training-data.ts necesita reparación
   */
  private static buildTrainingExamples(): string {
    // Retornar string vacío temporalmente
    return ''
    
    /* CÓDIGO ORIGINAL COMENTADO
    // Seleccionar 2-3 escenarios relevantes aleatoriamente
    const selectedScenarios = TRAINING_SCENARIOS
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)

    let examples = '\n📚 EJEMPLOS DE CONVERSACIONES EXITOSAS (aprende de estos patrones):\n\n'

    selectedScenarios.forEach((scenario, index) => {
      examples += `EJEMPLO ${index + 1}: ${scenario.titulo}\n`
      examples += `Contexto: ${scenario.contexto}\n`
      examples += `Producto: ${scenario.producto.nombre} - $${scenario.producto.precio.toLocaleString('es-CO')} COP\n\n`
      
      // Mostrar solo los primeros 4-5 intercambios para no saturar
      const conversacionCorta = scenario.conversacion.slice(0, 8)
      conversacionCorta.forEach(msg => {
        if (msg.rol === 'cliente') {
          examples += `👤 Cliente: "${msg.mensaje}"\n`
        } else {
          examples += `🤖 Bot: "${msg.mensaje}"\n`
        }
      })
      
      examples += `\n✅ Aprendizajes clave:\n`
      scenario.aprendizajes.slice(0, 3).forEach(aprendizaje => {
        examples += `   • ${aprendizaje}\n`
      })
      examples += '\n---\n\n'
    })

    // Agregar reglas generales del bot
    examples += '🎯 REGLAS GENERALES QUE DEBES SEGUIR:\n\n'
    examples += `📱 PRODUCTOS FÍSICOS:\n`
    examples += `   • Métodos de pago: ${BOT_RULES.productos_fisicos.metodos_pago.join(', ')}\n`
    examples += `   • Envío: ${BOT_RULES.productos_fisicos.envio}\n`
    examples += `   • Garantía: ${BOT_RULES.productos_fisicos.garantia}\n`
    examples += `   • Siempre mencionar: ${BOT_RULES.productos_fisicos.siempre_mencionar.join(', ')}\n\n`

    examples += `💾 PRODUCTOS DIGITALES:\n`
    examples += `   • Métodos de pago: ${BOT_RULES.productos_digitales.metodos_pago.join(', ')}\n`
    examples += `   • NO hay contraentrega (solo pago directo)\n`
    examples += `   • Entrega: ${BOT_RULES.productos_digitales.entrega}\n`
    examples += `   • Siempre solicitar correo electrónico\n`
    examples += `   • Siempre mencionar: ${BOT_RULES.productos_digitales.siempre_mencionar.join(', ')}\n\n`

    examples += `💬 TONO DE COMUNICACIÓN:\n`
    examples += `   • Usar emojis relevantes para humanizar\n`
    examples += `   • Usar viñetas para información estructurada\n`
    examples += `   • Destacar nombres de productos y precios\n`
    examples += `   • Párrafos cortos (máximo 3-4 líneas)\n`
    examples += `   • Hacer preguntas para mantener conversación activa\n\n`

    examples += `🛡️ MANEJO DE OBJECIONES:\n`
    examples += `   • Precio alto → Ofrecer alternativas más económicas o financiamiento\n`
    examples += `   • Duda de calidad → Destacar garantía y especificaciones\n`
    examples += `   • Comparación → Mostrar 2-3 opciones con pros/contras\n`
    examples += `   • Indecisión → Hacer preguntas para entender necesidades\n\n`

    return examples
    */ // FIN CÓDIGO COMENTADO
  }

  // Construir información detallada de productos
  private static buildProductsInfo(products: any[]): string {
    if (products.length === 0) {
      return 'No hay productos disponibles actualmente.'
    }

    return products.map(p => {
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
  }

  // Construir prompt del sistema mejorado (LEGACY - mantener para compatibilidad)
  private static buildSystemPrompt(
    businessContext: string,
    products: any[],
    customPersonality: string | null = null
  ): string {
    const productsInfo = this.buildProductsInfo(products)

    // Si hay personalidad personalizada, usarla COMPLETAMENTE
    if (customPersonality) {
      console.log('[AI] 🎭 Usando personalidad personalizada del dashboard')
      
      // Construir ejemplos de entrenamiento
      const trainingExamples = this.buildTrainingExamples()
      
      return `${customPersonality}

${businessContext}

PRODUCTOS RELEVANTES PARA ESTA CONSULTA:
${productsInfo}

${trainingExamples}

REGLAS ADICIONALES IMPORTANTES:
- Mantén el foco en el producto que el cliente pregunta
- Si el cliente dice que no le alcanza, ofrece alternativas MÁS BARATAS del mismo tipo
- Responde de forma concisa (máximo 5-6 líneas)
- RESPETA COMPLETAMENTE el rol y personalidad definidos arriba
- Usa el historial de conversación para dar respuestas contextuales
- Aprende de los ejemplos de entrenamiento proporcionados

📝 FORMATO VISUAL SIN PUNTOS:
- ❌ NO uses puntos al final de frases
- ✅ Usa emojis como separadores (🟢 💰 ✨ 👉)
- ✅ Una idea por línea
- ✅ Viñetas • para listas

⚠️⚠️⚠️ CRÍTICO - USA SOLO INFORMACIÓN REAL ⚠️⚠️⚠️:
- PRECIOS: USA EXACTAMENTE el precio de "INFORMACIÓN DEL PRODUCTO"
- CARACTERÍSTICAS: USA SOLO las que aparecen en la información
- DESCRIPCIÓN: USA la descripción proporcionada
- NO inventes, calcules ni modifiques NINGUNA información
- Si no estás seguro, di "Déjame verificar esa información"
- REGLA DE ORO: Si NO está en "INFORMACIÓN DEL PRODUCTO", NO lo inventes`
    }

    // Prompt por defecto (ventas)
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

3. 📝 FORMATO VISUAL SIN PUNTOS (MUY IMPORTANTE):
   
   ⚠️ REGLAS DE FORMATO:
   - ❌ NO uses puntos al final de frases
   - ✅ Usa emojis como separadores (🟢 💰 ✨ 👉)
   - ✅ Una idea por línea
   - ✅ Saltos de línea entre secciones
   - ✅ Viñetas • para listas
   
   EJEMPLO CORRECTO:
   "🎹 Curso Completo de Piano
   
   🟢 Incluye 👉
   • 76+ lecciones en video HD
   • 157 recursos descargables
   • ✨ Acceso de por vida
   • ✨ Soporte personalizado
   
   💰 Precio 👉 60.000 COP
   
   ¿Te gustaría comprarlo?"
   
   EJEMPLO INCORRECTO (NO HACER):
   "El curso incluye 76 lecciones. También tiene recursos. El precio es 60.000 COP."
   
   🎯 Emojis por categoría:
   • 🎹 Piano, 💻 Laptop, 🏍️ Moto, 📚 Cursos, 📦 Megapacks
   • 🟢 Información clave
   • 💰 Precios
   • ✨ Beneficios destacados
   • 👉 Separador (reemplaza :)

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

5. 🔗 MANEJO DE ENLACES Y MÉTODOS DE PAGO (MUY IMPORTANTE):
   
   a) **Productos DIGITALES (Cursos, Megapacks):**
      - Si el producto tiene link de MercadoPago → Muéstralo
      - Si el producto tiene link de PayPal → Muéstralo
      - Si el producto tiene link personalizado (Hotmart, etc.) → Muéstralo
      - SIEMPRE usa los links que están en el catálogo del producto
   
   b) **Productos FÍSICOS (Laptops, Motos, Accesorios):**
      
      **MÉTODOS DE PAGO DISPONIBLES:**
      
      1️⃣ **Efectivo:**
         - Visita nuestra tienda
         - 📍 Centro Comercial El Diamante 2, San Nicolás, Cali
         - 📞 +57 304 274 8687
      
      2️⃣ **Transferencia/Nequi/Daviplata:**
         - Nequi: 313 617 4267
         - Daviplata: 313 617 4267
         - También puedes usar MercadoPago (acepta transferencias)
      
      3️⃣ **Tarjeta de Crédito/Débito:**
         - Si el producto tiene link de MercadoPago → Úsalo (acepta tarjetas)
         - Si el producto tiene link de PayPal → Úsalo (acepta tarjetas)
         - Si NO tiene links → Menciona que puede pagar en tienda
      
      4️⃣ **Contra Entrega:**
         - Si el producto tiene esta opción configurada → Menciónala
         - Disponible en Cali y alrededores
   
   c) **REGLAS CRÍTICAS DE PAGO:**
      
      ❌ NUNCA digas "proporciona tus datos de tarjeta por teléfono"
      ❌ NUNCA pidas datos de tarjeta directamente
      ❌ NUNCA inventes métodos de pago que no están configurados
      
      ✅ SIEMPRE usa los links de pago del producto (si existen)
      ✅ SIEMPRE menciona métodos seguros (MercadoPago, PayPal)
      ✅ SIEMPRE ofrece alternativas (Nequi, efectivo, etc.)
   
   d) **EJEMPLOS CORRECTOS:**
   
   Cliente: "Cómo pago con tarjeta?"
   
   Si el producto TIENE link de MercadoPago:
   ✅ "Puedes pagar con tarjeta aquí:
   👉 [Link de MercadoPago]
   
   Acepta todas las tarjetas 💳"
   
   Si el producto NO tiene link:
   ✅ "Puedes pagar con tarjeta en nuestra tienda:
   📍 Centro Comercial El Diamante 2, Cali
   📞 +57 304 274 8687"
   
   Cliente: "Quiero transferir"
   ✅ "Puedes transferir a:
   
   💰 Nequi/Daviplata: 313 617 4267
   
   O usar MercadoPago (también acepta transferencias):
   👉 [Link si existe]"
   
   Cliente: "Tienen contra entrega?"
   
   Si está configurado:
   ✅ "¡Sí! Tenemos contra entrega en Cali 📦
   
   📞 Confirma tu pedido: +57 304 274 8687"
   
   Si NO está configurado:
   ✅ "Por el momento no tenemos contra entrega.
   
   Métodos disponibles:
   💳 Tarjeta (MercadoPago/PayPal)
   💰 Transferencia (Nequi/Daviplata)
   💵 Efectivo en tienda"

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

⚠️ REGLA ANTI-REPETICIÓN:
- NO repitas información que ya diste en el mensaje
- Si mencionas el precio al inicio, NO lo repitas al final
- Si das el link al inicio, NO lo repitas al final
- Sé conciso y directo
- Evita redundancias

EJEMPLO CORRECTO:
"¡Excelente! 🎹

Curso Piano Profesional
💰 $60.000 COP

Compra aquí:
👉 https://pay.hotmart.com/...

¿Tienes alguna duda?"

EJEMPLO INCORRECTO (NO HACER):
"¡Excelente! 🎹

Curso Piano Profesional
💰 $60.000 COP

Compra aquí:
👉 https://pay.hotmart.com/...

Precio: $60.000 COP ❌ (REPETIDO)
Link: https://pay.hotmart.com/... ❌ (REPETIDO)"

⚠️⚠️⚠️ CRÍTICO - USA SOLO INFORMACIÓN REAL ⚠️⚠️⚠️:

1. PRECIOS:
   - USA EXACTAMENTE el precio de "INFORMACIÓN DEL PRODUCTO"
   - NO inventes, calcules, dividas ni modifiques precios
   - Si dice $60.000 COP, di EXACTAMENTE "$60.000 COP"
   - Si no estás seguro, di "Déjame verificar el precio exacto"

2. CARACTERÍSTICAS:
   - USA SOLO las características de "INFORMACIÓN DEL PRODUCTO"
   - NO inventes especificaciones técnicas
   - Si no sabes algo, di "Déjame consultar esa información"

3. DESCRIPCIÓN:
   - USA la descripción proporcionada en "INFORMACIÓN DEL PRODUCTO"
   - NO agregues detalles que no están en la información
   - Sé honesto sobre lo que sabes y lo que no

4. DISPONIBILIDAD:
   - Si dice "Disponible", el producto está disponible
   - Si dice "Agotado", di que está agotado
   - NO asumas disponibilidad si no está especificada

⚠️ REGLA DE ORO: Si la información NO está en "INFORMACIÓN DEL PRODUCTO", NO la inventes

${this.buildTrainingExamples()}

Responde SIEMPRE en español, de forma profesional y honesta.`
  }

  // Detectar intención del mensaje (mejorado)
  private static detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase()

    // Saludos (debe ir primero para detectar antes que otros)
    if (/^(hola|buenos días|buenas tardes|buenas noches|hey|hi|saludos)/i.test(lowerMessage)) {
      return 'greeting'
    }

    // Despedida
    if (/(gracias|chao|adiós|bye|hasta luego)/i.test(lowerMessage)) {
      return 'farewell'
    }

    // Consulta de precio (CORREGIDO: debe devolver "product_info" no "price_inquiry")
    if (/(cuánto|precio|cuesta|valor|cuanto|costo)/i.test(lowerMessage)) {
      return 'product_info'
    }

    // Solicitud de información (CORREGIDO: debe devolver "product_info" no "information_request")
    if (/(información|info|detalles|características|especificaciones|dime sobre|háblame de|que es|cuéntame)/i.test(lowerMessage)) {
      return 'product_info'
    }

    // Consulta de disponibilidad con producto específico (CORREGIDO: debe devolver "product_list" no "availability_inquiry")
    // Si pregunta "tienes X?" donde X es un producto específico
    if (/(tienes|tienen|venden|hay|disponible|stock)/i.test(lowerMessage)) {
      // Si menciona un producto específico después, es product_list
      return 'product_list'
    }

    // Pregunta general sobre productos (CORREGIDO: debe devolver "product_list")
    if (/(qué productos|que productos|productos tienes|que vendes|qué vendes|catálogo|catalogo)/i.test(lowerMessage)) {
      return 'product_list'
    }

    // Intención de compra
    if (/(quiero|comprar|pedir|ordenar|pedido|me interesa)/i.test(lowerMessage)) {
      return 'purchase_intent'
    }

    // Solicitud de enlace/link
    if (/(link|enlace|url|página|pagina)/i.test(lowerMessage)) {
      return 'link_request'
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
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    conversationKey: string,
    userId?: string
  ): Promise<string> {
    try {
      // 🌐 VERIFICAR SI NECESITA INFORMACIÓN EXTERNA
      const { ExternalKnowledgeService } = await import('./external-knowledge-service')
      const needsExternalInfo = ExternalKnowledgeService.shouldEnrichProduct(product, customerMessage)
      
      let externalInfo: any = null
      if (needsExternalInfo) {
        console.log(`🌐 [AI] Cliente pregunta por detalles técnicos - Buscando info externa...`)
        const searchResult = await ExternalKnowledgeService.searchProductInfo(product.name, product.category)
        
        if (searchResult.found && searchResult.confidence >= 60) {
          console.log(`✅ [AI] Info externa encontrada (confianza: ${searchResult.confidence}%)`)
          externalInfo = searchResult
        } else {
          console.log(`⚠️ [AI] No se encontró info externa confiable`)
          externalInfo = null
        }
      }
      
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

      // 🌐 AGREGAR INFORMACIÓN EXTERNA SI ESTÁ DISPONIBLE
      if (externalInfo && externalInfo.found) {
        productContext += `\n📚 INFORMACIÓN TÉCNICA VERIFICADA (Confianza: ${externalInfo.confidence}%):\n`
        
        if (externalInfo.specs) {
          productContext += `Especificaciones:\n`
          Object.entries(externalInfo.specs).forEach(([key, value]) => {
            productContext += `  - ${key}: ${value}\n`
          })
        }
        
        if (externalInfo.features && externalInfo.features.length > 0) {
          productContext += `\nCaracterísticas destacadas:\n`
          externalInfo.features.forEach((feature: string) => {
            productContext += `  ✓ ${feature}\n`
          })
        }
        
        if (externalInfo.description) {
          productContext += `\nDetalles técnicos: ${externalInfo.description}\n`
        }
        
        productContext += `\n⚠️ IMPORTANTE: Esta información técnica es verificada. Úsala para responder preguntas específicas.\n`
      }

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
- photo: Pide fotos/imágenes del producto
`

      // 🧠 GENERAR RESUMEN DE MEMORIA CONTEXTUAL
      const memoryContext = ProfessionalConversationMemory.generateContextSummary(conversationKey)
      
      // 🎭 CARGAR PERSONALIDAD PERSONALIZADA (si existe)
      const { AIPersonalityLoader } = await import('./ai-personality-loader')
      const customPersonality = userId ? await AIPersonalityLoader.loadPersonality(userId) : null
      
      // Si hay personalidad personalizada, usarla; si no, usar la default
      const personalitySection = customPersonality || `Eres un vendedor profesional experto de Tecnovariedades D&S en WhatsApp.

TU PERSONALIDAD:
- Profesional pero cercano y amigable
- Entusiasta sobre los productos
- Orientado a ayudar genuinamente al cliente
- Conversacional y natural (no robótico)
- Proactivo en cerrar ventas`
      
      const systemPrompt = `${personalitySection}

${memoryContext}

⚠️ REGLAS ABSOLUTAS - NUNCA VIOLAR:

0. **INFORMACIÓN COMPLETA LA PRIMERA VEZ** (CRÍTICO):
   - 🧠 Revisa el CONTEXTO DE LA CONVERSACIÓN arriba
   - Si es la PRIMERA VEZ que mencionas este producto → Da información COMPLETA:
     * Nombre del producto
     * Descripción breve (2-3 líneas)
     * Precio
     * 3-4 beneficios clave
     * Pregunta si desea más info o comprarlo
   - Si YA hablaste del producto antes:
     * Si pregunta precio → Solo di el precio
     * Si pregunta link → Solo confirma que enviarás opciones de pago
     * Si pregunta disponibilidad → Solo confirma disponibilidad
   - ❌ NUNCA repitas información que ya diste
   - ✅ Primera mención = Información COMPLETA
   - ✅ Menciones siguientes = Solo lo que preguntan
   - Ejemplo: 
     * Primera vez: "🎹 Curso Completo de Piano\n\nAprende desde cero...\n💰 60.000 COP\n\n✅ Beneficios..."
     * Segunda vez (si pregunta precio): "El precio es 60.000 COP"

0.1. **USA EL NOMBRE EXACTO DEL PRODUCTO** (CRÍTICO):
   - El producto se llama: "${product.name}"
   - ❌ NUNCA cambies el nombre del producto
   - ❌ NUNCA inventes otro nombre
   - ❌ NUNCA digas "curso de inglés" si el producto es "Mega Pack 08"
   - ✅ SIEMPRE usa el nombre EXACTO que aparece arriba
   - Ejemplo: Si el producto es "Mega Pack 08 - Cursos de Idiomas", di exactamente eso

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
   - 📚 Si hay "INFORMACIÓN TÉCNICA VERIFICADA" arriba, ÚSALA para responder preguntas técnicas
   - ⚠️ Si NO hay información técnica y preguntan algo específico, di: "No tengo esa información específica, pero puedo contactarte con un asesor: +57 304 274 8687"
   - ❌ NUNCA inventes especificaciones técnicas

3. **ADAPTA TU RESPUESTA A LA INTENCIÓN**:
   - Si pide info → Da información COMPLETA del producto (nombre, descripción breve, precio, beneficios clave)
   - Si pregunta precio → Menciona el precio exacto + 2-3 características principales
   - Si pide fotos/imágenes → Confirma que tienes fotos y ofrece enviarlas
   - Si pide link o quiere comprar:
     * El sistema generará enlaces de pago automáticamente
     * NO necesitas mencionar enlaces en tu respuesta
     * Solo confirma que le enviarás las opciones de pago
     * Ejemplo: "¡Perfecto! Te envío las opciones de pago ahora mismo 💳"
   - Si pregunta disponibilidad → Confirma que SÍ está disponible
   - Si es la PRIMERA VEZ que mencionas el producto → Da información COMPLETA (nombre, descripción, precio, beneficios)

4. **FORMATO DE RESPUESTA**:
   - Máximo 4-5 líneas
   - 1-2 emojis relevantes
   - Lenguaje natural y conversacional
   - Termina con pregunta que invite a la acción
   - NO uses markdown (**negrita**, etc.)
   
5. **FORMATO PARA MÚLTIPLES PRODUCTOS** (IMPORTANTE):
   Si mencionas varios productos, usa este formato VISUAL:
   
   💻 *Encontré 3 opciones para ti:*
   
   1️⃣ *Laptop Asus Vivobook*
      💰 $2,500,000 COP ✅
      ✨ RAM: 16GB, SSD: 512GB
   
   2️⃣ *Laptop Acer Aspire*
      💰 $2,200,000 COP ✅
      ✨ RAM: 8GB, SSD: 256GB
   
   3️⃣ *Laptop HP Pavilion*
      💰 $2,800,000 COP ✅
      ✨ RAM: 16GB, SSD: 1TB
   
   📱 *¿Cuál te interesa?* 😊
   
   ❌ NO hagas listas sin formato
   ❌ NO pongas todo en un párrafo
   ✅ USA emojis de números (1️⃣ 2️⃣ 3️⃣)
   ✅ USA viñetas para specs
   ✅ USA check verde ✅ para disponibilidad

EJEMPLOS CORRECTOS:

📌 PRIMERA VEZ que hablas del producto:
Cliente: "Me interesa el curso de piano"
Tú: "¡Excelente elección! 🎹 El Curso Completo de Piano Online incluye:
• 50+ lecciones desde cero
• Certificado al finalizar
• Acceso de por vida
Precio: 45,000 COP
¿Te gustaría comprarlo?"

📌 SEGUNDA VEZ (ya conoce el producto):
Cliente: "Métodos de pago"
Tú: "Puedes pagar por:
💳 MercadoPago
💰 Nequi: 304 274 8687
📱 Daviplata: 304 274 8687
¿Cuál prefieres?"

❌ MAL (repetitivo):
Cliente: "Métodos de pago"
Tú: "¡Claro! El Curso de Piano cuesta 45,000 COP e incluye 50 lecciones... [repite todo]
Puedes pagar por MercadoPago..."

📌 TERCERA VEZ (ya sabe todo):
Cliente: "Dame el link"
Tú: "¡Listo! 🎹
👉 https://hotmart.com/curso-piano
Acceso inmediato"

❌ MAL (muy repetitivo):
Cliente: "Dame el link"
Tú: "El Curso de Piano cuesta 45,000 COP, incluye 50 lecciones... [repite todo otra vez]
Aquí está el link..."

🎯 REGLA DE ORO:
- Mensajes 1-2: Explica el producto
- Mensajes 3-5: Responde directo, sin repetir
- Mensajes 6+: Ultra conciso, solo lo esencial

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

      // 🧠 AJUSTAR MAX_TOKENS según número de mensajes (más mensajes = respuestas más cortas)
      const memory = ProfessionalConversationMemory.getMemory(conversationKey)
      const messageCount = memory?.state.messageCount || 0
      
      let maxTokens = 400 // Primera vez: respuesta completa
      if (messageCount > 2) maxTokens = 250 // Ya conoce el producto: más conciso
      if (messageCount > 5) maxTokens = 150 // Ya sabe todo: ultra conciso
      
      console.log(`[AI] 💬 Mensajes en conversación: ${messageCount} → Max tokens: ${maxTokens}`)

      if (USE_MULTI_PROVIDER) {
        const aiResponse = await AIMultiProvider.generateCompletion(
          messages,
          {
            temperature: 0.7,
            max_tokens: maxTokens,
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
          max_tokens: maxTokens,
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

  /**
   * Detectar si el mensaje es una solicitud de fotos/imágenes
   */
  private static detectPhotoRequest(message: string): { isPhotoRequest: boolean; confidence: number } {
    const normalized = message.toLowerCase().trim()
    
    // Patrones de solicitud de fotos
    const photoPatterns = [
      /\b(foto|fotos|imagen|imagenes|imágenes|pic|pics|picture|pictures)\b/i,
      /\b(me\s+(envía|envia|manda|pasa|muestra|enseña))\s+(foto|fotos|imagen|imagenes|imágenes)/i,
      /\b(tiene|tienes|hay)\s+(foto|fotos|imagen|imagenes|imágenes)/i,
      /\b(ver|mirar|revisar)\s+(foto|fotos|imagen|imagenes|imágenes)/i,
      /\b(foto|fotos|imagen|imagenes|imágenes)\s+(del|de|para|sobre)/i,
      /\b(cómo|como)\s+(se\s+ve|luce|es)/i,
      /\b(me\s+envía|me\s+envia|me\s+manda|me\s+pasa|me\s+muestra)\b/i
    ]
    
    // Verificar si coincide con algún patrón
    for (const pattern of photoPatterns) {
      if (pattern.test(normalized)) {
        return { isPhotoRequest: true, confidence: 0.95 }
      }
    }
    
    // Patrones débiles (menor confianza)
    const weakPatterns = [
      /\b(ver|mirar|revisar)\b/i,
      /\b(muestra|enseña|pasa)\b/i
    ]
    
    for (const pattern of weakPatterns) {
      if (pattern.test(normalized) && normalized.length < 20) {
        return { isPhotoRequest: true, confidence: 0.7 }
      }
    }
    
    return { isPhotoRequest: false, confidence: 0 }
  }

  /**
   * Detectar si el cliente está cambiando explícitamente de producto
   */
  private static detectExplicitProductChange(
    message: string,
    currentContext: any
  ): boolean {
    const normalized = message.toLowerCase().trim();

    // Frases que indican que quiere MÁS INFORMACIÓN del producto actual (NO cambio)
    const infoPatterns = [
      /\b(más|mas)\s+(información|info|detalles)/i,
      /\b(cuéntame|cuentame|comentame|coméntame|dime|explícame|explicame)\s+(más|mas|sobre|del|de|como)/i,
      /\b(cómo|como)\s+(funciona|es|se\s+usa)/i,
      /\b(qué|que)\s+(incluye|trae|tiene|contiene)/i,
      /\b(características|especificaciones|detalles)/i,
    ];

    // Si el mensaje pide más información, NO es cambio de producto
    if (infoPatterns.some(p => p.test(normalized))) {
      console.log(`[AI] 📝 Cliente pide más información del producto actual`);
      return false;
    }

    // Frases que indican cambio EXPLÍCITO de producto
    const changePatterns = [
      /\b(mejor|prefiero|quiero)\s+(otro|otra|diferente)/i,
      /\b(muéstrame|muestrame|enséñame|enseñame)\s+(otro|otra|otros|otras)/i,
      /\b(qué|que)\s+(más|otros|otras)\s+(tienes|tienen|hay)/i,
      /\b(en\s+lugar\s+de|en\s+vez\s+de|instead\s+of)/i,
      /\b(no\s+me\s+gusta|no\s+me\s+interesa|no\s+quiero\s+ese)/i,
    ];

    // Si menciona explícitamente cambio, es cambio de producto
    if (changePatterns.some(p => p.test(normalized))) {
      console.log(`[AI] 🔄 Cliente quiere cambiar de producto explícitamente`);
      return true;
    }

    // Si menciona un producto completamente diferente por nombre
    if (currentContext && currentContext.productName) {
      const currentProductWords = currentContext.productName.toLowerCase().split(' ');
      const messageWords = normalized.split(' ');
      
      // Si NO menciona ninguna palabra del producto actual, podría ser cambio
      const mentionsCurrentProduct = currentProductWords.some(word => 
        word.length > 3 && messageWords.includes(word)
      );

      if (!mentionsCurrentProduct && messageWords.length > 3) {
        // Pero solo si menciona otro producto específico
        const mentionsOtherProduct = /\b(laptop|portátil|moto|curso|megapack|pack|macbook|asus|hp|lenovo)/i.test(normalized);
        
        if (mentionsOtherProduct) {
          console.log(`[AI] 🔄 Cliente menciona producto diferente`);
          return true;
        }
      }
    }

    // Por defecto, NO es cambio (mantener contexto)
    return false;
  }
}
