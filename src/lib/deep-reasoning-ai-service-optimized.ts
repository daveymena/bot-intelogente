/**
 * 🧠 SERVICIO DE IA CON RAZONAMIENTO PROFUNDO - OPTIMIZADO
 * Versión ultra-compacta que reduce tokens de 22K a 3K
 * Sistema que SIEMPRE usa IA como primera opción
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

            // PASO 2: Generar documentación COMPACTA de productos
            console.log(`[Deep AI] 📚 Generando documentación compacta...`)
            const [productDocs, executiveSummary] = await Promise.all([
                ProductDocumentationService.generateFullProductDocumentation(userId),
                ProductDocumentationService.generateExecutiveSummary(userId)
            ])

            // PASO 3: Analizar el mensaje con razonamiento profundo
            console.log(`[Deep AI] 🔍 Analizando mensaje...`)
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

            // PASO 4: Si el razonamiento ya tiene una respuesta directa, usarla
            if (!reasoning.shouldUseAI && reasoning.suggestedResponse) {
                console.log(`[Deep AI] ⚡ Usando respuesta directa`)
                return {
                    message: reasoning.suggestedResponse,
                    confidence: reasoning.confidence,
                    intent: reasoning.finalIntent,
                    productMentioned: reasoning.productFound?.name,
                    usedProvider: 'direct',
                    responseTime: Date.now() - startTime
                }
            }

            // PASO 5: Construir prompt COMPACTO
            console.log(`[Deep AI] 🎯 Construyendo prompt compacto...`)
            const enrichedPrompt = this.buildCompactPrompt(
                customerMessage,
                productDocs,
                executiveSummary,
                reasoning,
                conversationHistory
            )

            // PASO 6: Llamar a IA con contexto compacto
            console.log(`[Deep AI] 🤖 Llamando a IA...`)
            const aiResponse = await AIMultiProvider.generateCompletion(
                [
                    {
                        role: 'system',
                        content: enrichedPrompt.systemPrompt
                    },
                    ...conversationHistory.slice(-3), // Solo últimos 3 mensajes
                    {
                        role: 'user',
                        content: enrichedPrompt.userPrompt
                    }
                ],
                {
                    temperature: 0.7,
                    max_tokens: 200, // Reducido para respuestas más cortas
                    top_p: 1
                }
            )

            console.log(`[Deep AI] ✅ Respuesta generada con: ${aiResponse.provider}`)

            const responseTime = Date.now() - startTime
            console.log(`[Deep AI] ⏱️ Tiempo total: ${responseTime}ms`)

            return {
                message: aiResponse.content,
                confidence: reasoning.confidence,
                intent: reasoning.finalIntent,
                productMentioned: reasoning.productFound?.name,
                usedProvider: aiResponse.provider,
                responseTime
            }
        } catch (error) {
            console.error('[Deep AI] ❌ Error:', error)

            // Fallback de emergencia
            return {
                message: '👋 ¡Hola! Bienvenido a Tecnovariedades D&S 😄\n\n¿En qué puedo ayudarte?',
                confidence: 0.5,
                intent: 'greeting',
                usedProvider: 'fallback',
                responseTime: Date.now() - startTime
            }
        }
    }

    /**
     * Construir prompt ULTRA COMPACTO (reduce de 22K a 3K tokens)
     */
    private static buildCompactPrompt(
        customerMessage: string,
        productDocs: string,
        executiveSummary: string,
        reasoning: ReasoningResult,
        conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
    ): { systemPrompt: string; userPrompt: string } {
        // System Prompt ULTRA COMPACTO
        const systemPrompt = `Eres asistente de ventas de Tecnovariedades D&S en WhatsApp.

${executiveSummary}

📦 PRODUCTOS:
${productDocs}

🎯 REGLAS ESTRICTAS:
1. MÁXIMO 3-4 LÍNEAS CORTAS (no más de 200 caracteres total)
2. Sé ULTRA CONCISO - sin explicaciones largas
3. Si piden precio → solo precio + nombre
4. Si piden info → máximo 2 características + precio
5. Usa emojis mínimos: 💰 precio, 👉 acción
6. Termina con pregunta CORTA (máximo 5 palabras)
7. NUNCA inventes info
8. Si mencionas productos, máximo 2

${reasoning.productFound ? `\n🔍 PRODUCTO RELEVANTE:\n${reasoning.productFound.name} - $${reasoning.productFound.price.toLocaleString('es-CO')}` : ''}

${conversationHistory.length > 0 ? `\n💬 CONTEXTO:\n${conversationHistory.slice(-2).map(m => `${m.role === 'user' ? '👤' : '🤖'}: ${m.content.substring(0, 100)}`).join('\n')}` : ''}`

        // User Prompt COMPACTO
        const userPrompt = `Cliente: "${customerMessage}"\n\nResponde profesional y conciso:`

        return { systemPrompt, userPrompt }
    }
}
