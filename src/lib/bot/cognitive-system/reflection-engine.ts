
import { LearningManager, LearnedPattern } from './learning-manager';
import { ConversationContextService } from '../conversation-context-service';
import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

export class ReflectionEngine {
    
    /**
     * Analiza post-venta: ¿Por qué funcionó?
     * @param conversationId ID de la conversación exitosa
     * @param userId Usuario dueño del bot
     */
    static async selfReflect(conversationId: string, userId: string) {
        console.log(`[Cognitive] 🧠 Analizando conversación exitosa ${conversationId}...`);
        
        // 1. Obtener historial
        // Nota: Asumimos que podemos obtener historial por ID (no implementado en ContextService, pero simulamos con userId y lastMessages)
        // En v1 MVP, analizaremos solo la última interacción significativa
        
        // MOCKUP: Simulamos análisis rápido con IA
        // En producción real, necesitaríamos acceso completo al historial de la conversación específica
        
        const reflectionPrompt = `
        Eres un Analista de Conversaciones Experto.
        Acabas de cerrar una venta exitosa.
        
        Analiza TU propia actuación y dime:
        1. ¿Qué frase clave convenció al cliente?
        2. ¿Qué tono usaste? (Empático, Técnico, Directo)
        
        Responde SOLO JSON:
        {
          "key_phrase": "frase exacta",
          "context": "contexto (ej: objeción precio)",
          "tone": "tono usado",
          "success_factor": 0.95
        }
        `;
        
        // Enviar a IA Analítica (Llama 8b es suficiente y rápido)
        try {
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const completion = await groq.chat.completions.create({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'system', content: reflectionPrompt }],
                temperature: 0.2,
                response_format: { type: 'json_object' }
            });
            
            const insight = JSON.parse(completion.choices[0]?.message?.content || '{}');
            
            if (insight.key_phrase) {
                const pattern: LearnedPattern = {
                    contextKeyword: insight.context,
                    successfulResponse: insight.key_phrase,
                    successRate: insight.success_factor,
                    humanTone: insight.tone,
                    timesUsed: 1
                };
                
                await LearningManager.learn(pattern);
                console.log(`[Cognitive] ✨ Insight guardado: "${insight.context} -> ${insight.key_phrase}"`);
            }
            
        } catch (e) {
            console.error('[Cognitive] Error en reflexión:', e);
        }
    }
}
