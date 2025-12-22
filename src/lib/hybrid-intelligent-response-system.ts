/**
 * 🧠 SISTEMA HÍBRIDO INTELIGENTE
 * Combina búsqueda local en BD + IA para respuestas naturales
 * 🎓 INTEGRADO CON SISTEMA DE ENTRENAMIENTO
 * 🎯 INTEGRADO CON ORQUESTADOR DE ACCIONES
 */

import { db } from './db'
import { WhatsAppResponseFormatter, ProductInfo } from './whatsapp-response-formatter'
import { IntelligentProductQuerySystem } from './intelligent-product-query-system'
import { CustomGreetingSystem } from './custom-greeting-system'
import { AIActionOrchestrator } from './ai-action-orchestrator'
import { ProfessionalConversationMemory } from './professional-conversation-memory'
import Groq from 'groq-sdk'

interface AIProvider {
    chat: (messages: any[], options?: any) => Promise<string>
}

export class HybridIntelligentResponseSystem {
    private aiProvider: AIProvider

    constructor(aiProvider: AIProvider) {
        this.aiProvider = aiProvider
    }

    /**
     * MÉTODO PRINCIPAL: Procesar mensaje con sistema híbrido
     */
    async processMessage(
        message: string,
        userId: string,
        conversationHistory: any[] = [],
        from?: string
    ): Promise<string> {
        try {
            console.log('🔄 Procesando con sistema híbrido...')

            // PASO 1: Analizar intención (LOCAL - rápido)
            const intent = await IntelligentProductQuerySystem.analyzeIntent(message, conversationHistory)
            console.log('🧠 Intención:', intent.type)

            // ⚠️ IMPORTANTE: Si es saludo, usar SIEMPRE el saludo local configurado
            if (intent.type === 'greeting') {
                console.log('👋 Usando saludo local configurado (no IA)')
                const greeting = await CustomGreetingSystem.getCustomGreeting(userId)
                return `${greeting.greeting}\n\n${greeting.context}`
            }

            // Obtener contexto de memoria profesional
            const conversationKey = from ? `${userId}:${from}` : userId
            const memoryContext = ProfessionalConversationMemory.getMemory(conversationKey) || {
                currentProduct: null,
                productHistory: [],
                intentions: [],
                budget: { amount: null, mentionedAt: null },
                objections: [],
                preferences: {},
                state: { stage: 'greeting' as const, lastInteraction: new Date(), messageCount: 0, isActive: true },
                summary: ''
            }

            // PASO 1.5: 🎯 DETECTAR SI EL CLIENTE ESTÁ ELIGIENDO UN PRODUCTO
            const { ProductSelectionDetector } = await import('./product-selection-detector')
            
            // Obtener último mensaje del bot del historial
            const lastBotMessage = conversationHistory.length > 0 
                ? conversationHistory[conversationHistory.length - 1]?.content 
                : undefined
            
            const selection = ProductSelectionDetector.detectSelection(message, lastBotMessage)
            
            if (selection.isSelection) {
                console.log(`🎯 Cliente eligió producto en posición: ${selection.position}`)
                console.log(`📊 Confianza: ${(selection.confidence * 100).toFixed(0)}%`)
                console.log(`🔧 Método: ${selection.method}`)
                
                // Buscar el producto seleccionado en el historial
                // Necesitamos obtener la lista de productos del último mensaje del bot
                // Por ahora, buscar en memoria o historial
                const context = memoryContext.productHistory
                if (context && context.length > 0 && selection.position) {
                    const selectedProduct = context[selection.position - 1]
                    if (selectedProduct) {
                        console.log(`✅ Producto seleccionado: ${selectedProduct.name}`)
                        
                        // Actualizar memoria con el producto seleccionado
                        ProfessionalConversationMemory.setCurrentProduct(
                            conversationKey,
                            selectedProduct.id,
                            selectedProduct.name,
                            0, // precio se actualizará
                            '' // categoría se actualizará
                        )
                        
                        // Buscar producto completo en BD
                        const fullProduct = await db.product.findUnique({
                            where: { id: selectedProduct.id }
                        })
                        
                        if (fullProduct) {
                            // Generar respuesta confirmando la selección
                            return `¡Perfecto! 😊 Elegiste el *${fullProduct.name}*\n\n` +
                                   `💰 *${this.formatPrice(fullProduct.price, fullProduct.currency)}*\n\n` +
                                   `¿Quieres que te envíe más detalles o los métodos de pago? 🤔`
                        }
                    }
                }
            }

            // PASO 2: 🎯 DETECTAR SI DEBE CALIFICAR PRIMERO (ANTES DE BUSCAR)
            // Si es búsqueda general de producto (portátil, laptop, celular)
            // DEBE calificar antes de mostrar productos
            if (intent.type === 'product_search') {
                const shouldQualify = this.shouldQualifyFirst(message, intent)
                
                if (shouldQualify) {
                    console.log('🎯 Debe calificar primero antes de mostrar productos')
                    console.log('⚠️ NO se buscarán productos hasta que el cliente responda')
                    return await this.generateQualificationQuestion(message, intent)
                }
            }
            
            // PASO 3: Si es consulta de productos, buscar en BD (LOCAL)
            // ⚠️ IMPORTANTE: Solo llega aquí si NO debe calificar
            let products: any[] = []
            let productContext = ''

            if (intent.type === 'product_search' ||
                intent.type === 'product_detail' ||
                intent.type === 'comparison') {

                console.log('🔍 Buscando productos (ya pasó la calificación o no la necesita)')

                // 🔍 Usar búsqueda inteligente con IA para mejor precisión
                const { intelligentProductSearch } = await import('./intelligent-product-search')
                const searchResult = await intelligentProductSearch({
                    userMessage: message,
                    conversationHistory: conversationHistory.map(m => m.content || ''),
                    previousProducts: []
                })

                if (searchResult) {
                    if (searchResult.products) {
                        products = searchResult.products
                    } else if (searchResult.product) {
                        products = [searchResult.product]
                    }
                }

                console.log(`📦 Productos encontrados: ${products.length}`)

                // Crear contexto de productos para la IA (SOLO INFORMACIÓN REAL)
                if (products.length > 0) {
                    // ✅ USAR SOLO INFORMACIÓN REAL DE LA BASE DE DATOS
                    // NO buscar información externa para evitar inventar datos
                    console.log(`📦 Usando SOLO información real de ${products.length} producto(s)`)
                    
                    productContext = this.buildProductContext(products, intent)
                    
                    // 💾 GUARDAR TODOS LOS PRODUCTOS EN HISTORIAL DE MEMORIA
                    // Esto permite detectar cuál elige el cliente después
                    if (from) {
                        const { ConversationContextService } = await import('./conversation-context-service')
                        const conversationKey = `${userId}:${from}`
                        
                        // Guardar el primer producto como actual
                        ConversationContextService.setProductContext(
                            conversationKey,
                            products[0].id,
                            products[0].name
                        )
                        console.log(`💾 Contexto guardado: ${products[0].name}`)
                        
                        // 🧠 GUARDAR TODOS EN HISTORIAL DE MEMORIA PROFESIONAL
                        // Limpiar historial anterior
                        ProfessionalConversationMemory.clearProductHistory(conversationKey)
                        
                        // Agregar cada producto al historial
                        products.slice(0, 5).forEach((product, index) => {
                            ProfessionalConversationMemory.addToProductHistory(
                                conversationKey,
                                product.id,
                                product.name
                            )
                            console.log(`📝 Producto ${index + 1} agregado al historial: ${product.name}`)
                        })
                    }
                }
            }

            // PASO 4: Generar respuesta con IA (usando contexto de BD + memoria)
            const aiResponse = await this.generateAIResponse(
                message,
                intent,
                productContext,
                conversationHistory,
                memoryContext
            )

            // PASO 5: Formatear respuesta para WhatsApp
            const formattedResponse = this.formatResponse(aiResponse, products, intent)

            return formattedResponse

        } catch (error) {
            console.error('❌ Error en sistema híbrido:', error)

            // Fallback: intentar solo con búsqueda local
            try {
                return await IntelligentProductQuerySystem.processQuery(message, userId, conversationHistory)
            } catch {
                return '😅 Disculpa, tuve un problema. ¿Puedes intentar de nuevo?'
            }
        }
    }

    /**
     * Construir contexto de productos para la IA
     */
    private buildProductContext(products: any[], intent: any): string {
        let context = '\n\n## PRODUCTOS DISPONIBLES EN BASE DE DATOS:\n\n'

        products.forEach((p, i) => {
            context += `${i + 1}. **${p.name}**\n`
            context += `   - Precio: ${this.formatPrice(p.price, p.currency)}\n`
            
            // Incluir TODA la descripción (no truncar)
            if (p.description) {
                context += `   - Descripción COMPLETA: ${p.description}\n`
            }
            
            context += `   - Categoría: ${p.category}\n`
            
            // ✅ SOLO USAR INFORMACIÓN REAL DE LA BASE DE DATOS
            // NO agregar información externa para evitar inventar datos
            
            // Agregar stock si está disponible
            if (p.stock) {
                context += `   - Stock: ${p.stock} unidades\n`
            }
            
            // Agregar tags si existen
            if (p.tags) {
                try {
                    const tags = JSON.parse(p.tags)
                    if (tags.length > 0) {
                        context += `   - Tags: ${tags.join(', ')}\n`
                    }
                } catch (e) {
                    // Ignorar errores de parsing
                }
            }
            
            // Agregar si tiene imágenes
            if (p.images) {
                try {
                    const images = JSON.parse(p.images)
                    if (images.length > 0) {
                        context += `   - Tiene ${images.length} imagen(es) disponible(s)\n`
                    }
                } catch (e) {
                    // Ignorar errores de parsing
                }
            }
            
            context += `   - ID: ${p.id}\n\n`
        })

        // Agregar contexto de la búsqueda
        if (intent.priceRange) {
            context += `\n**Filtro de precio aplicado:**\n`
            if (intent.priceRange.min) context += `- Mínimo: ${this.formatPrice(intent.priceRange.min)}\n`
            if (intent.priceRange.max) context += `- Máximo: ${this.formatPrice(intent.priceRange.max)}\n`
        }

        if (intent.features && intent.features.length > 0) {
            context += `\n**Características solicitadas:** ${intent.features.join(', ')}\n`
        }

        return context
    }

    /**
     * Generar respuesta con IA usando el contexto de productos
     */
    private async generateAIResponse(
        message: string,
        intent: any,
        productContext: string,
        conversationHistory: any[],
        memoryContext?: any
    ): Promise<string> {

        // Construir prompt del sistema con memoria de contexto
        const systemPrompt = this.buildSystemPrompt(intent, productContext, memoryContext)

        // Preparar mensajes para la IA
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.slice(-10), // Últimos 10 mensajes de contexto
            { role: 'user', content: message }
        ]

        // Llamar a la IA
        const aiResponse = await this.aiProvider.chat(messages, {
            temperature: 0.7,
            max_tokens: 800 // Aumentado para respuestas más detalladas
        })

        return aiResponse
    }

    /**
     * Construir contexto de memoria para el prompt
     */
    private buildMemoryContext(memoryContext?: any): string {
        if (!memoryContext) {
            return 'No hay contexto de memoria previo.'
        }

        let context = ''

        // Producto actual en conversación
        if (memoryContext.currentProduct) {
            context += `\n**🎯 PRODUCTO ACTUAL EN CONVERSACIÓN:**\n`
            context += `- Nombre: ${memoryContext.currentProduct.name}\n`
            context += `- ID: ${memoryContext.currentProduct.id}\n`
            context += `\n⚠️ IMPORTANTE: Si el cliente dice "envíame los detalles", "más información", "cuéntame más", etc., se refiere a ESTE producto.\n`
        }

        // Historial de productos mencionados
        if (memoryContext.productHistory && memoryContext.productHistory.length > 0) {
            context += `\n**📚 PRODUCTOS MENCIONADOS EN ESTA CONVERSACIÓN:**\n`
            memoryContext.productHistory.slice(0, 5).forEach((product: any, index: number) => {
                context += `${index + 1}. ${product.name} (ID: ${product.id})\n`
            })
            context += `\n⚠️ Si el cliente menciona un número (1, 2, 3), se refiere a estos productos.\n`
        }

        // Presupuesto mencionado
        if (memoryContext.budget && memoryContext.budget.amount) {
            context += `\n**💰 PRESUPUESTO DEL CLIENTE:** ${this.formatPrice(memoryContext.budget.amount)}\n`
        }

        // Preferencias detectadas
        if (memoryContext.preferences && Object.keys(memoryContext.preferences).length > 0) {
            context += `\n**🎯 PREFERENCIAS DEL CLIENTE:**\n`
            Object.entries(memoryContext.preferences).forEach(([key, value]) => {
                context += `- ${key}: ${value}\n`
            })
        }

        // Objeciones previas
        if (memoryContext.objections && memoryContext.objections.length > 0) {
            context += `\n**⚠️ OBJECIONES PREVIAS:**\n`
            memoryContext.objections.slice(-3).forEach((objection: any) => {
                context += `- ${objection.type}: ${objection.reason}\n`
            })
        }

        // Estado de la conversación
        if (memoryContext.state) {
            context += `\n**📊 ESTADO DE LA CONVERSACIÓN:**\n`
            context += `- Etapa: ${memoryContext.state.stage}\n`
            context += `- Mensajes intercambiados: ${memoryContext.state.messageCount}\n`
        }

        return context || 'No hay contexto de memoria previo.'
    }

    /**
     * 🎓 Generar ejemplos de entrenamiento basados en los escenarios
     */
    private buildTrainingExamples(): string {
        // Reglas básicas sin dependencias externas
        return '\n\n🎯 REGLAS CLAVE:\n' +
               '• Productos físicos: Efectivo, transferencia, Nequi, Daviplata, tarjeta\n' +
               '• Productos digitales: NO contraentrega, entrega inmediata, solicitar correo\n' +
               '• Precio alto → Ofrecer alternativas más económicas\n' +
               '• Indecisión → Hacer preguntas para entender necesidades\n' +
               '• Búsqueda general → Calificar ANTES de mostrar productos\n' +
               '• Si el cliente responde con número (1, 2, 3) o palabra clave (trabajo, gaming), entender que está respondiendo a tu pregunta anterior\n'
        
        // Código comentado para evitar errores
        /*
        const selectedScenarios = []
            .sort(() => Math.random() - 0.5)
            .slice(0, 1) // Solo 1 ejemplo para mantener el prompt compacto

        let examples = '\n\n📚 EJEMPLO DE CONVERSACIÓN EXITOSA (aprende de este patrón):\n\n'

        selectedScenarios.forEach((scenario) => {
            examples += `${scenario.titulo}\n`
            examples += `Producto: ${scenario.producto.nombre} - $${scenario.producto.precio.toLocaleString('es-CO')} COP\n\n`
            
            // Mostrar solo los primeros 4 intercambios
            const conversacionCorta = scenario.conversacion.slice(0, 6)
            conversacionCorta.forEach(msg => {
                if (msg.rol === 'cliente') {
                    examples += `Cliente: "${msg.mensaje}"\n`
                } else {
                    examples += `Bot: "${msg.mensaje.substring(0, 150)}${msg.mensaje.length > 150 ? '...' : ''}"\n`
                }
            })
            
            examples += `\nAprendizajes:\n`
            scenario.aprendizajes.slice(0, 3).forEach(aprendizaje => {
                examples += `• ${aprendizaje}\n`
            })
        })

        */
        // Fin del código comentado
    }

    /**
     * Construir prompt del sistema según la intención
     */
    private buildSystemPrompt(intent: any, productContext: string, memoryContext?: any): string {
        let prompt = `Eres un asistente de ventas experto de Tecnovariedades D&S. Tu objetivo es guiar a los clientes a la compra de forma natural y profesional.

## 🚨 REGLA DE ORO: NO INVENTES INFORMACIÓN
⚠️ CRÍTICO: Usa EXCLUSIVAMENTE la información de la base de datos que te proporciono.
⚠️ SI NO HAY PRODUCTOS EN LA BASE DE DATOS, di: "No tengo ese producto disponible en este momento"
⚠️ NUNCA inventes precios, características, duraciones o detalles que no estén en la base de datos
⚠️ Si no tienes un dato, admítelo con honestidad: "No tengo esa información disponible"

## ⚠️ REGLA CRÍTICA: NO MUESTRES PRODUCTOS SI NO DEBES
Si el cliente hace una búsqueda MUY GENERAL (ej: "busco un portátil", "quiero una laptop"), 
NO muestres productos todavía. En su lugar, haz UNA pregunta para entender su necesidad.
SOLO muestra productos cuando:
1. El cliente ya especificó lo que busca (marca, uso, specs)
2. O ya respondió tu pregunta de calificación

## 🧠 MEMORIA DE CONVERSACIÓN
${this.buildMemoryContext(memoryContext)}

## 🧠 RAZONAMIENTO CONTEXTUAL AVANZADO
USA RAZONAMIENTO para entender el contexto de la conversación:

**Ejemplo 1:**
- Historial: Bot preguntó "¿Para qué lo vas a usar? 1️⃣ Trabajo 2️⃣ Gaming 3️⃣ Diseño"
- Cliente responde: "1"
- RAZONAMIENTO: El cliente está respondiendo a mi pregunta, eligió opción 1 (Trabajo)
- ACCIÓN: Buscar portátiles para trabajo/estudio

**Ejemplo 2:**
- Historial: Bot preguntó "¿Para qué lo vas a usar? 1️⃣ Trabajo 2️⃣ Gaming"
- Cliente responde: "Trabajo"
- RAZONAMIENTO: El cliente está respondiendo a mi pregunta con la palabra clave
- ACCIÓN: Buscar portátiles para trabajo/estudio

**Ejemplo 3:**
- Historial: Bot preguntó "¿Para qué lo vas a usar? 1️⃣ Trabajo 2️⃣ Gaming"
- Cliente responde: "gaming"
- RAZONAMIENTO: El cliente está respondiendo a mi pregunta, quiere gaming
- ACCIÓN: Buscar portátiles gaming (Ryzen 5+, 16GB RAM+)

**Cómo razonar:**
1. Lee el historial de conversación
2. ¿Hiciste una pregunta con opciones en el mensaje anterior?
3. ¿El cliente respondió con un número (1,2,3) o palabra clave (trabajo, gaming, diseño)?
4. Si SÍ → Está respondiendo tu pregunta, actúa según su respuesta
5. Si NO → Es un mensaje nuevo, analiza la intención

## 🚀 TU MISIÓN
1.  **Escucha y Comprende:** Lee el historial para entender la necesidad real del cliente.
2.  **Informa con Precisión:** Usa los datos de los productos para responder.
3.  **Guía a la Venta:** Resuelve dudas, maneja objeciones y cierra la venta.
4.  **Sé Humano:** Conversa con un tono amigable, cercano y profesional. Usa emojis para conectar.

## 🎯 FLUJO DE CALIFICACIÓN (IMPORTANTE)
Si el cliente pregunta por una categoría general (portátil, laptop, computador):
1. **NO muestres productos todavía**
2. **Haz 1-2 preguntas de calificación** para entender su necesidad
3. **Después** muestra productos específicos

Ejemplo:
Cliente: "Busco un portátil"
Bot: "¡Perfecto! 💻 ¿Para qué lo vas a usar principalmente? (trabajo, gaming, diseño, uso básico)"

Cliente: "Para trabajo y estudio"
Bot: [AHORA SÍ muestra 2-3 portátiles ideales para trabajo/estudio]

## 💡 MANEJO DE OBJECIONES
Cuando un cliente dude (precio, características, etc.), sigue estos pasos:
1.  **Valida su Preocupación:** "Entiendo tu punto sobre el precio."
2.  **Aporta Valor:** Justifica el precio con beneficios claros. "Este modelo, aunque es una inversión, te ofrece [beneficio clave] que te ahorrará tiempo."
3.  **Ofrece Alternativas:** Si la objeción es fuerte, ofrece otra opción. "Si buscas algo más económico, también tengo el [producto alternativo] que es excelente para [uso]."
4.  **Mantén la Conversación:** Siempre termina con una pregunta abierta. "¿Qué característica es más importante para ti?"

## 📋 FORMATO PARA WHATSAPP (OBLIGATORIO)

### Para Listas de Productos:
Usa un formato visual y compacto. MÁXIMO 2-3 productos.
**IMPORTANTE:** Cada emoji debe estar en su propia línea con espacio.

*Ejemplo CORRECTO:*
¡Claro! 😎 Tengo estas opciones para ti:

📦 *Producto 1*
⚙️ Característica clave
💾 Otra característica
💰 *$XXX.XXX COP*

📦 *Producto 2*
⚙️ Característica clave
💾 Otra característica
💰 *$YYY.YYY COP*

¿Cuál te llama más la atención? 🤔

*Ejemplo INCORRECTO (NO HACER):*
📦 *Producto 1*: Característica 1, Característica 2. $XXX.XXX COP📦 *Producto 2*: ...

### Para Producto Individual:
Enfócate en los BENEFICIOS y lo que el producto HACE. NO en especificaciones técnicas internas.

*Ejemplo:*
🖨️ *Nombre del Producto*

¡Excelente elección! 😊 Aquí los detalles:

🔹 *Ideal para:* [Para quién es perfecto este producto]
🔹 *Capacidades:* [Qué puede hacer, cuánto rinde, etc.]
🔹 *Conectividad:* [Cómo se conecta]
🔹 *Incluye:* [Qué trae en la caja]

💰 *Precio:* $X.XXX.XXX COP

¿Crees que se ajusta a lo que necesitas?

## CONTEXTO ACTUAL
`

        // Agregar contexto según el tipo de intención
        if (intent.type === 'product_search') {
            prompt += `\n\n## INSTRUCCIÓN:
El cliente busca productos. Muéstrale una lista compacta y visual con las mejores opciones de la base de datos.`
        } else if (intent.type === 'product_detail') {
            prompt += `\n\n## INSTRUCCIÓN:
El cliente quiere detalles de un producto. Describe sus beneficios y capacidades de forma atractiva. Enfócate en lo que el producto HACE por el cliente.`
        } else if (intent.type === 'comparison') {
            prompt += `\n\n## INSTRUCCIÓN:
El cliente quiere comparar. Muestra las diferencias CLAVE entre los productos para ayudarle a decidir.`
        }

        // Agregar contexto de productos si existe
        if (productContext) {
            prompt += productContext
            prompt += `\n\n**⚠️ RESTRICCIÓN:**
- Estos son los ÚNICOS productos que cumplen con la búsqueda.
- NO menciones productos que no estén en esta lista.
- Si el cliente pide algo que no está aquí, ofrece una alternativa de la lista o pregunta si quiere que busques otra cosa.`
        } else if (intent.type !== 'greeting' && intent.type !== 'general_info') {
            prompt += `\n\n**⚠️ NO HAY PRODUCTOS DISPONIBLES:**
- Informa al cliente que no encontraste productos con esas características.
- Sugiérele intentar una búsqueda más general o ajustar su presupuesto.`
        }

        // 🎓 Agregar ejemplos de entrenamiento
        prompt += this.buildTrainingExamples()

        return prompt
    }

    /**
     * Formatear respuesta final para WhatsApp
     */
    private formatResponse(aiResponse: string, products: any[], intent: any): string {
        // Si la IA ya formateó bien, retornar directo
        if (aiResponse.includes('🔹') && aiResponse.includes('💰')) {
            return aiResponse
        }

        // Si hay productos pero la IA no los formateó bien, usar formateador local
        if (products.length > 0 && (intent.type === 'product_search' || intent.type === 'comparison')) {
            const productInfos: ProductInfo[] = products.map(p => ({
                name: p.name,
                price: p.price,
                currency: p.currency || 'COP',
                specs: WhatsAppResponseFormatter.extractSpecs(p)
            }))

            // Determinar categoría
            let category = 'Productos'
            if (intent.category === 'PHYSICAL') {
                if (aiResponse.toLowerCase().includes('portátil') || aiResponse.toLowerCase().includes('laptop')) {
                    category = 'Portátiles'
                } else if (aiResponse.toLowerCase().includes('celular')) {
                    category = 'Celulares'
                }
            } else if (intent.category === 'DIGITAL') {
                category = 'Cursos Digitales'
            }

            // Extraer intro de la IA (si existe)
            const lines = aiResponse.split('\n')
            const intro = lines.slice(0, 2).join('\n')

            // Formatear productos
            const formattedProducts = WhatsAppResponseFormatter.formatProductList(productInfos, category)

            // Combinar intro de IA + productos formateados
            if (intro.length > 10 && intro.length < 100) {
                return `${intro}\n\n${formattedProducts}`
            }

            return formattedProducts
        }

        // Para producto individual
        if (products.length === 1 && intent.type === 'product_detail') {
            const productInfo: ProductInfo = {
                name: products[0].name,
                price: products[0].price,
                currency: products[0].currency || 'COP',
                specs: WhatsAppResponseFormatter.extractSpecs(products[0])
            }

            return WhatsAppResponseFormatter.formatSingleProduct(productInfo)
        }

        // Para respuestas generales, retornar la respuesta de la IA
        return aiResponse
    }

    /**
     * Formatear precio
     */
    private formatPrice(price: number, currency: string = 'COP'): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(price)
    }

    /**
     * Determinar si debe calificar antes de mostrar productos
     * 
     * REGLAS:
     * 1. PRODUCTOS FÍSICOS (portátiles, celulares, etc.):
     *    - "busco portátil" → CALIFICAR (muy general)
     *    - "portátil Asus" → NO calificar (marca específica)
     *    - "portátil para gaming" → NO calificar (uso específico)
     *    - "portátil Ryzen 5" → NO calificar (especificación técnica)
     * 
     * 2. PRODUCTOS DIGITALES (cursos, megapacks):
     *    - "busco cursos" → CALIFICAR (muy general)
     *    - "curso de piano" → NO calificar (tema específico)
     *    - "megapack" → NO calificar (producto específico)
     * 
     * 3. NUNCA calificar si ya tiene detalles específicos
     */
    private shouldQualifyFirst(message: string, intent: any): boolean {
        const lowerMsg = message.toLowerCase().trim()
        
        // 🚨 REGLA 1: Si menciona un producto digital específico, NUNCA calificar
        const isSpecificDigitalProduct = 
            (lowerMsg.includes('curso') && (
                lowerMsg.includes('piano') ||
                lowerMsg.includes('guitarra') ||
                lowerMsg.includes('inglés') ||
                lowerMsg.includes('ingles') ||
                lowerMsg.includes('francés') ||
                lowerMsg.includes('frances') ||
                lowerMsg.includes('alemán') ||
                lowerMsg.includes('aleman') ||
                lowerMsg.includes('italiano') ||
                lowerMsg.includes('portugués') ||
                lowerMsg.includes('portugues') ||
                lowerMsg.includes('chino') ||
                lowerMsg.includes('japonés') ||
                lowerMsg.includes('japones') ||
                lowerMsg.includes('programación') ||
                lowerMsg.includes('programacion') ||
                lowerMsg.includes('diseño') ||
                lowerMsg.includes('marketing') ||
                lowerMsg.includes('excel') ||
                lowerMsg.includes('fotografía') ||
                lowerMsg.includes('fotografia')
            )) ||
            lowerMsg.includes('megapack') ||
            lowerMsg.includes('mega pack') ||
            lowerMsg.includes('pack')
        
        if (isSpecificDigitalProduct) {
            console.log('✅ Producto digital específico detectado - NO calificar')
            return false
        }
        
        // 🚨 REGLA 2: Si menciona especificaciones técnicas o marcas, NUNCA calificar
        const hasSpecificDetails = 
            // Marcas específicas
            lowerMsg.includes('asus') ||
            lowerMsg.includes('hp') ||
            lowerMsg.includes('lenovo') ||
            lowerMsg.includes('acer') ||
            lowerMsg.includes('dell') ||
            lowerMsg.includes('apple') ||
            lowerMsg.includes('macbook') ||
            lowerMsg.includes('samsung') ||
            lowerMsg.includes('xiaomi') ||
            lowerMsg.includes('huawei') ||
            lowerMsg.includes('bajaj') ||
            lowerMsg.includes('pulsar') ||
            // Especificaciones técnicas
            lowerMsg.includes('ryzen') ||
            lowerMsg.includes('intel') ||
            lowerMsg.includes('core i') ||
            lowerMsg.includes('ram') ||
            lowerMsg.includes('gb') ||
            lowerMsg.includes('ssd') ||
            lowerMsg.includes('hdd') ||
            lowerMsg.includes('nvidia') ||
            lowerMsg.includes('gtx') ||
            lowerMsg.includes('rtx') ||
            // Uso específico
            lowerMsg.includes('para gaming') || 
            lowerMsg.includes('para juegos') ||
            lowerMsg.includes('para trabajo') ||
            lowerMsg.includes('para estudio') ||
            lowerMsg.includes('para diseño') ||
            lowerMsg.includes('para editar') ||
            lowerMsg.includes('para programar') ||
            // Modelos específicos
            lowerMsg.includes('vivobook') ||
            lowerMsg.includes('thinkpad') ||
            lowerMsg.includes('pavilion') ||
            lowerMsg.includes('inspiron') ||
            // Presupuesto específico
            lowerMsg.includes('millón') ||
            lowerMsg.includes('millon') ||
            lowerMsg.includes('hasta') ||
            lowerMsg.includes('máximo') ||
            lowerMsg.includes('maximo') ||
            lowerMsg.includes('entre') ||
            lowerMsg.includes('desde')
        
        if (hasSpecificDetails) {
            console.log('✅ Detalles específicos detectados - NO calificar')
            return false
        }
        
        // 🚨 REGLA 3: Solo calificar si es búsqueda MUY general de productos físicos
        const isGeneralPhysicalSearch = 
            // Búsquedas generales que SÍ necesitan calificación
            (lowerMsg.includes('portátil') || lowerMsg.includes('portatil') || lowerMsg.includes('laptop')) &&
            lowerMsg.length < 50 && // Mensaje corto (aumentado para capturar más casos)
            !hasSpecificDetails ||
            
            (lowerMsg.includes('computador') || lowerMsg.includes('compu') || lowerMsg.includes('pc')) &&
            lowerMsg.length < 40 &&
            !hasSpecificDetails ||
            
            (lowerMsg.includes('celular') || lowerMsg.includes('teléfono') || lowerMsg.includes('telefono') || lowerMsg.includes('móvil') || lowerMsg.includes('movil')) &&
            lowerMsg.length < 40 &&
            !hasSpecificDetails ||
            
            (lowerMsg.includes('monitor') || lowerMsg.includes('pantalla')) &&
            lowerMsg.length < 40 &&
            !hasSpecificDetails
        
        // 🚨 REGLA 4: Solo calificar si es búsqueda MUY general de cursos (sin tema)
        const isGeneralCourseSearch = 
            (lowerMsg.includes('curso') || lowerMsg.includes('cursos')) &&
            lowerMsg.length < 20 && // Muy corto
            !isSpecificDigitalProduct &&
            !hasSpecificDetails
        
        const shouldQualify = isGeneralPhysicalSearch || isGeneralCourseSearch
        
        if (shouldQualify) {
            console.log('🎯 Calificación necesaria (búsqueda muy general)')
        } else {
            console.log('✅ NO calificar - búsqueda suficientemente específica')
        }
        
        return shouldQualify
    }
    
    /**
     * Generar pregunta de calificación
     */
    private async generateQualificationQuestion(message: string, intent: any): Promise<string> {
        const lowerMsg = message.toLowerCase()
        
        // Detectar categoría mencionada
        if (lowerMsg.includes('portátil') || lowerMsg.includes('portatil') || lowerMsg.includes('laptop')) {
            return '¡Perfecto! 💻 Te puedo ayudar con eso.\n\n' +
                   '¿Para qué lo vas a usar principalmente?\n\n' +
                   '1️⃣ Trabajo y estudio\n' +
                   '2️⃣ Gaming\n' +
                   '3️⃣ Diseño gráfico\n' +
                   '4️⃣ Uso básico (navegar, videos)'
        }
        
        if (lowerMsg.includes('computador') || lowerMsg.includes('pc') || lowerMsg.includes('compu')) {
            return '¡Claro! 🖥️ Tenemos varias opciones.\n\n' +
                   '¿Qué tipo de computador buscas?\n\n' +
                   '1️⃣ PC de escritorio\n' +
                   '2️⃣ Portátil/Laptop\n' +
                   '3️⃣ PC Gamer'
        }
        
        if (lowerMsg.includes('celular') || lowerMsg.includes('teléfono') || lowerMsg.includes('telefono') || lowerMsg.includes('móvil') || lowerMsg.includes('movil')) {
            return '¡Genial! 📱 ¿Qué buscas en un celular?\n\n' +
                   '1️⃣ Buena cámara\n' +
                   '2️⃣ Mucha batería\n' +
                   '3️⃣ Para gaming\n' +
                   '4️⃣ Gama alta\n' +
                   '5️⃣ Económico'
        }
        
        if (lowerMsg.includes('monitor')) {
            return '¡Perfecto! 🖥️ ¿Qué tamaño de monitor prefieres?\n\n' +
                   '1️⃣ 24 pulgadas\n' +
                   '2️⃣ 27 pulgadas\n' +
                   '3️⃣ 32 pulgadas o más\n\n' +
                   '¿Y para qué lo vas a usar? (trabajo, gaming, diseño)'
        }
        
        if (lowerMsg.includes('curso')) {
            return '¡Excelente! 📚 ¿Qué tipo de curso te interesa?\n\n' +
                   'Tenemos cursos de:\n' +
                   '• Piano y música\n' +
                   '• Programación\n' +
                   '• Diseño\n' +
                   '• Marketing digital\n\n' +
                   '¿Cuál te llama la atención?'
        }
        
        // Pregunta genérica
        return '¡Claro! 😊 Para recomendarte mejor, cuéntame:\n\n' +
               '¿Para qué lo necesitas?\n' +
               '¿Tienes algún presupuesto en mente?'
    }
}

/**
 * FACTORY: Crear instancia con tu proveedor de IA
 */
export function createHybridSystem(aiProvider: AIProvider): HybridIntelligentResponseSystem {
    return new HybridIntelligentResponseSystem(aiProvider)
}

/**
 * EJEMPLO DE USO CON GROQ
 */
export async function createGroqHybridSystem(groqApiKey: string) {
    const groq = new Groq({ apiKey: groqApiKey })

    const aiProvider: AIProvider = {
        chat: async (messages: any[], options?: any) => {
            const response = await groq.chat.completions.create({
                messages,
                model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
                temperature: options?.temperature || 0.7,
                max_tokens: options?.max_tokens || 800 // Aumentado para respuestas más detalladas
            })
            return response.choices[0]?.message?.content || ''
        }
    }

    return new HybridIntelligentResponseSystem(aiProvider)
}
