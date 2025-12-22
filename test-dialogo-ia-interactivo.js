/**
 * 🧪 TEST INTERACTIVO DE DIÁLOGO DE IA
 * Prueba el flujo de conversación con productos reales de la base de datos
 * Compara respuestas simples vs razonamiento profundo
 */

const { PrismaClient } = require('@prisma/client')
const readline = require('readline')

const prisma = new PrismaClient()

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    red: '\x1b[31m'
}

class DialogoTester {
    constructor() {
        this.conversationHistory = []
        this.currentProduct = null
        this.userId = null
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
    }

    log(message, color = 'reset') {
        console.log(`${colors[color]}${message}${colors.reset}`)
    }

    async initialize() {
        this.log('\n🚀 INICIANDO TEST DE DIÁLOGO IA\n', 'bright')

        // Obtener primer usuario
        const user = await prisma.user.findFirst()
        if (!user) {
            this.log('❌ No hay usuarios en la base de datos', 'red')
            process.exit(1)
        }

        this.userId = user.id
        this.log(`✅ Usuario: ${user.name || user.email}`, 'green')

        // Obtener productos disponibles
        const products = await prisma.product.findMany({
            where: {
                userId: this.userId
            },
            orderBy: {
                name: 'asc'
            }
        })

        if (products.length === 0) {
            this.log('❌ No hay productos disponibles', 'red')
            process.exit(1)
        }

        this.log(`\n📦 PRODUCTOS DISPONIBLES (${products.length}):\n`, 'cyan')
        products.forEach((p, i) => {
            const price = new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0
            }).format(p.price)

            this.log(`${i + 1}. ${p.name}`, 'yellow')
            this.log(`   💰 ${price} | 📁 ${p.category}`, 'reset')
            if (p.description) {
                const desc = p.description.substring(0, 80)
                this.log(`   📝 ${desc}...`, 'reset')
            }
            console.log()
        })

        return products
    }

    async testSimpleQuestion(question, productContext = null) {
        this.log(`\n${'='.repeat(80)}`, 'blue')
        this.log(`👤 PREGUNTA SIMPLE: "${question}"`, 'bright')
        this.log(`${'='.repeat(80)}\n`, 'blue')

        if (productContext) {
            this.log(`🎯 Contexto de producto: ${productContext.name}`, 'cyan')
        }

        // Simular respuesta simple (sin razonamiento profundo)
        const startTime = Date.now()

        try {
            // Aquí iría la lógica de respuesta simple
            const response = await this.generateSimpleResponse(question, productContext)
            const elapsed = Date.now() - startTime

            this.log(`\n⚡ RESPUESTA SIMPLE (${elapsed}ms):`, 'green')
            this.log(`${response}\n`, 'reset')

            return { response, time: elapsed, type: 'simple' }
        } catch (error) {
            this.log(`❌ Error: ${error.message}`, 'red')
            return null
        }
    }

    async testDeepReasoningQuestion(question, productContext = null) {
        this.log(`\n${'='.repeat(80)}`, 'magenta')
        this.log(`🧠 PREGUNTA CON RAZONAMIENTO: "${question}"`, 'bright')
        this.log(`${'='.repeat(80)}\n`, 'magenta')

        if (productContext) {
            this.log(`🎯 Contexto de producto: ${productContext.name}`, 'cyan')
        }

        // Simular respuesta con razonamiento profundo
        const startTime = Date.now()

        try {
            const reasoning = await this.analyzeWithReasoning(question, productContext)
            const response = await this.generateDeepResponse(question, productContext, reasoning)
            const elapsed = Date.now() - startTime

            this.log(`\n🔍 PROCESO DE RAZONAMIENTO:`, 'yellow')
            reasoning.steps.forEach((step, i) => {
                this.log(`\n${i + 1}. ${step.thought}`, 'cyan')
                this.log(`   ➜ ${step.action}`, 'reset')
                if (step.result) {
                    this.log(`   ✓ ${JSON.stringify(step.result)}`, 'green')
                }
            })

            this.log(`\n🎯 DECISIÓN FINAL:`, 'yellow')
            this.log(`   • Intención: ${reasoning.intent}`, 'reset')
            this.log(`   • Confianza: ${(reasoning.confidence * 100).toFixed(0)}%`, 'reset')
            this.log(`   • Usar IA: ${reasoning.useAI ? 'Sí' : 'No'}`, 'reset')

            this.log(`\n🧠 RESPUESTA CON RAZONAMIENTO (${elapsed}ms):`, 'green')
            this.log(`${response}\n`, 'reset')

            return { response, time: elapsed, type: 'reasoning', reasoning }
        } catch (error) {
            this.log(`❌ Error: ${error.message}`, 'red')
            return null
        }
    }

    async generateSimpleResponse(question, product) {
        const questionLower = question.toLowerCase()

        // Respuestas simples basadas en palabras clave
        if (/^(hola|buenas|hey)/i.test(question)) {
            return '👋 ¡Hola! ¿En qué puedo ayudarte?'
        }

        if (product) {
            const price = new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0
            }).format(product.price)

            if (/precio|cuesta|valor|cuánto/i.test(question)) {
                return `El ${product.name} cuesta ${price}`
            }

            if (/link|enlace|pago|comprar/i.test(question)) {
                let response = `Para comprar ${product.name} (${price}):\n\n`

                if (product.paymentLinkMercadoPago) {
                    response += `💳 MercadoPago: ${product.paymentLinkMercadoPago}\n`
                }
                if (product.paymentLinkPayPal) {
                    response += `💰 PayPal: ${product.paymentLinkPayPal}\n`
                }
                if (product.paymentLinkCustom) {
                    response += `🔗 Link: ${product.paymentLinkCustom}\n`
                }

                if (!product.paymentLinkMercadoPago && !product.paymentLinkPayPal && !product.paymentLinkCustom) {
                    response += `📞 Contáctanos: +57 304 274 8687\n`
                    response += `📧 Email: deinermen25@gmail.com`
                }

                return response
            }

            if (/info|información|detalles|características/i.test(question)) {
                let response = `📦 ${product.name}\n\n`
                response += `💰 Precio: ${price}\n`
                response += `📁 Categoría: ${product.category}\n`

                if (product.description) {
                    response += `\n${product.description.substring(0, 200)}...`
                }

                return response
            }
        }

        return 'Cuéntame más sobre lo que necesitas'
    }

    async analyzeWithReasoning(question, product) {
        const steps = []
        const questionLower = question.toLowerCase()

        // Paso 1: Analizar intención
        steps.push({
            thought: 'Analizando la intención del cliente',
            action: 'Detectar qué está preguntando',
            result: null
        })

        let intent = 'unknown'
        let confidence = 0.5
        let useAI = true

        if (/^(hola|buenas|hey)/i.test(question)) {
            intent = 'greeting'
            confidence = 0.95
            useAI = false
            steps[0].result = { intent: 'saludo', needsProduct: false }
        } else if (/precio|cuesta|valor|cuánto/i.test(question)) {
            intent = 'ask_price'
            confidence = 0.9
            useAI = !product
            steps[0].result = { intent: 'precio', needsProduct: true }
        } else if (/link|enlace|pago|comprar/i.test(question)) {
            intent = 'request_payment'
            confidence = 0.9
            useAI = !product
            steps[0].result = { intent: 'pago', needsProduct: true }
        } else if (/info|información|detalles|características/i.test(question)) {
            intent = 'ask_info'
            confidence = 0.85
            useAI = true
            steps[0].result = { intent: 'información', needsProduct: true }
        }

        // Paso 2: Verificar contexto de producto
        if (intent !== 'greeting') {
            steps.push({
                thought: 'Verificando si necesito información de un producto',
                action: 'Buscar producto en contexto o mensaje',
                result: product ? { found: true, product: product.name } : { found: false }
            })
        }

        // Paso 3: Decidir estrategia de respuesta
        steps.push({
            thought: 'Decidiendo cómo responder',
            action: useAI ? 'Usar IA para respuesta contextual' : 'Usar respuesta directa',
            result: { useAI, confidence }
        })

        return {
            steps,
            intent,
            confidence,
            useAI,
            product
        }
    }

    async generateDeepResponse(question, product, reasoning) {
        // Si no necesita IA, usar respuesta simple
        if (!reasoning.useAI) {
            return this.generateSimpleResponse(question, product)
        }

        // Simular respuesta de IA con contexto enriquecido
        const questionLower = question.toLowerCase()

        if (product) {
            const price = new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0
            }).format(product.price)

            if (reasoning.intent === 'ask_info') {
                let response = `¡Claro! Te cuento sobre ${product.name} 😊\n\n`

                if (product.description) {
                    const lines = product.description.split('\n').filter(l => l.trim())
                    response += lines.slice(0, 5).join('\n') + '\n\n'
                }

                response += `💰 Precio: ${price}\n`
                response += `📁 Tipo: ${product.category === 'DIGITAL' ? 'Producto Digital' : 'Producto Físico'}\n\n`
                response += `¿Te gustaría saber cómo comprarlo? 🛒`

                return response
            }

            if (reasoning.intent === 'request_payment') {
                let response = `¡Perfecto! Para adquirir ${product.name} tienes estas opciones:\n\n`
                response += `💰 Precio: ${price}\n\n`

                if (product.paymentLinkMercadoPago) {
                    response += `1️⃣ **MercadoPago**\n`
                    response += `   ${product.paymentLinkMercadoPago}\n\n`
                }

                if (product.paymentLinkPayPal) {
                    response += `2️⃣ **PayPal**\n`
                    response += `   ${product.paymentLinkPayPal}\n\n`
                }

                if (product.paymentLinkCustom) {
                    response += `3️⃣ **Compra Directa**\n`
                    response += `   ${product.paymentLinkCustom}\n\n`
                }

                if (product.category === 'PHYSICAL') {
                    response += `📍 **También puedes:**\n`
                    response += `   • Visitarnos en Centro Comercial El Diamante 2\n`
                    response += `   • Pagar en efectivo o transferencia\n`
                    response += `   • Contactarnos: +57 304 274 8687\n\n`
                }

                response += `¿Con cuál método prefieres pagar? 😊`

                return response
            }
        }

        // Respuesta genérica con IA
        return `Entiendo tu pregunta sobre "${question}". ${product ? `Hablemos sobre ${product.name}.` : 'Cuéntame más detalles para ayudarte mejor.'} ¿Qué específicamente te gustaría saber?`
    }

    async runInteractiveMode() {
        const products = await this.initialize()

        this.log('\n🎮 MODO INTERACTIVO ACTIVADO', 'bright')
        this.log('Escribe tus preguntas o comandos:\n', 'cyan')
        this.log('  • "producto N" - Seleccionar producto N', 'yellow')
        this.log('  • "simple: pregunta" - Probar respuesta simple', 'yellow')
        this.log('  • "profundo: pregunta" - Probar razonamiento profundo', 'yellow')
        this.log('  • "comparar: pregunta" - Comparar ambos métodos', 'yellow')
        this.log('  • "salir" - Terminar\n', 'yellow')

        const askQuestion = () => {
            this.rl.question(`\n${colors.bright}Tu pregunta >${colors.reset} `, async (input) => {
                const trimmed = input.trim()

                if (!trimmed || trimmed === 'salir') {
                    this.log('\n👋 ¡Hasta luego!', 'green')
                    await prisma.$disconnect()
                    this.rl.close()
                    return
                }

                // Seleccionar producto
                if (/^producto\s+(\d+)$/i.test(trimmed)) {
                    const index = parseInt(trimmed.match(/\d+/)[0]) - 1
                    if (index >= 0 && index < products.length) {
                        this.currentProduct = products[index]
                        this.log(`\n✅ Producto seleccionado: ${this.currentProduct.name}`, 'green')
                    } else {
                        this.log(`\n❌ Producto no válido`, 'red')
                    }
                    askQuestion()
                    return
                }

                // Respuesta simple
                if (/^simple:/i.test(trimmed)) {
                    const question = trimmed.replace(/^simple:\s*/i, '')
                    await this.testSimpleQuestion(question, this.currentProduct)
                    askQuestion()
                    return
                }

                // Respuesta con razonamiento
                if (/^profundo:/i.test(trimmed)) {
                    const question = trimmed.replace(/^profundo:\s*/i, '')
                    await this.testDeepReasoningQuestion(question, this.currentProduct)
                    askQuestion()
                    return
                }

                // Comparar ambos
                if (/^comparar:/i.test(trimmed)) {
                    const question = trimmed.replace(/^comparar:\s*/i, '')

                    const simple = await this.testSimpleQuestion(question, this.currentProduct)
                    const deep = await this.testDeepReasoningQuestion(question, this.currentProduct)

                    this.log(`\n${'='.repeat(80)}`, 'bright')
                    this.log(`📊 COMPARACIÓN DE RESULTADOS`, 'bright')
                    this.log(`${'='.repeat(80)}\n`, 'bright')

                    if (simple && deep) {
                        this.log(`⚡ Simple: ${simple.time}ms`, 'green')
                        this.log(`🧠 Profundo: ${deep.time}ms`, 'magenta')
                        this.log(`⏱️  Diferencia: ${Math.abs(deep.time - simple.time)}ms\n`, 'yellow')
                    }

                    askQuestion()
                    return
                }

                // Por defecto, usar razonamiento profundo
                await this.testDeepReasoningQuestion(trimmed, this.currentProduct)
                askQuestion()
            })
        }

        askQuestion()
    }

    async runAutomatedTests() {
        const products = await this.initialize()

        // Seleccionar primer producto para pruebas
        const testProduct = products[0]
        this.currentProduct = testProduct

        this.log('\n🤖 EJECUTANDO PRUEBAS AUTOMATIZADAS\n', 'bright')

        const testCases = [
            { question: 'Hola', type: 'greeting' },
            { question: '¿Cuánto cuesta?', type: 'price', needsProduct: true },
            { question: 'Dame el link de pago', type: 'payment', needsProduct: true },
            { question: 'Cuéntame más sobre este producto', type: 'info', needsProduct: true },
            { question: '¿Qué métodos de pago aceptan?', type: 'payment_methods', needsProduct: true },
            { question: 'Quiero comprarlo', type: 'buy', needsProduct: true }
        ]

        for (const testCase of testCases) {
            this.log(`\n${'─'.repeat(80)}`, 'cyan')
            this.log(`TEST: ${testCase.question}`, 'bright')
            this.log(`Tipo: ${testCase.type} | Necesita producto: ${testCase.needsProduct || false}`, 'yellow')
            this.log(`${'─'.repeat(80)}`, 'cyan')

            const simple = await this.testSimpleQuestion(
                testCase.question,
                testCase.needsProduct ? testProduct : null
            )

            const deep = await this.testDeepReasoningQuestion(
                testCase.question,
                testCase.needsProduct ? testProduct : null
            )

            if (simple && deep) {
                this.log(`\n📊 Comparación:`, 'yellow')
                this.log(`   Simple: ${simple.time}ms`, 'green')
                this.log(`   Profundo: ${deep.time}ms (${deep.reasoning.confidence * 100}% confianza)`, 'magenta')
            }

            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        this.log('\n✅ PRUEBAS COMPLETADAS', 'green')
        await prisma.$disconnect()
        this.rl.close()
    }
}

// Ejecutar
async function main() {
    const tester = new DialogoTester()

    const args = process.argv.slice(2)
    const mode = args[0] || 'interactive'

    if (mode === 'auto') {
        await tester.runAutomatedTests()
    } else {
        await tester.runInteractiveMode()
    }
}

main().catch(console.error)
