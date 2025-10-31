/**
 * 🚀 SISTEMA ULTRA INTELIGENTE COMPLETO
 * Integra todos los componentes para comprensión perfecta del lenguaje natural
 */

import { enhancedAIInterpreter } from './enhanced-ai-interpreter.js';
import { contextManager } from './context-manager.js';
import { naturalLanguageProcessor } from './natural-language-processor.js';
import { groqAI } from './groq-ai-fixed.js';
import { smartFallbackSystem } from './smart-fallback-system.js';
import { professionalSalesAI } from './professional-sales-ai.js';
import { neverStuckManager } from './never-stuck-conversation-manager.js';
import { basicConversationHandler } from './basic-conversation-handler.js';
import { intelligentKnowledgeSystem } from './intelligent-knowledge-system.js';
import { responseHumanizer } from './response-humanizer.js';

class UltraIntelligentSystem {
    constructor() {
        this.stats = {
            totalMessages: 0,
            perfectUnderstanding: 0,
            contextualResponses: 0,
            errorsCorrected: 0,
            languageDetected: 0,
            averageConfidence: 0,
            processingTimes: []
        };
        
        console.log('🚀 [Ultra Intelligent System] Sistema ultra inteligente inicializado');
    }

    /**
     * Procesa un mensaje con comprensión perfecta del lenguaje natural
     */
    async processMessage(message, chatId, userName, existingContext = null) {
        const startTime = Date.now();
        
        try {
            console.log(`🚀 [Ultra Intelligent System] Procesando mensaje ultra inteligente de ${userName}: "${message}"`);
            
            // 0. Verificar si es una conversación básica (saludos, empatía)
            const basicConversation = basicConversationHandler.handleBasicConversation(message, userName);
            if (basicConversation.isBasicConversation) {
                console.log(`🤝 [Ultra Intelligent System] Conversación básica detectada: ${basicConversation.type}`);
                
                // Actualizar contexto y estadísticas
                contextManager.addMessage(chatId, message, basicConversation.response);
                this.updateStats({ confianza: basicConversation.confidence }, Date.now() - startTime);
                
                return {
                    text: basicConversation.response,
                    confidence: basicConversation.confidence,
                    data: { 
                        category: 'conversacion_basica',
                        type: basicConversation.type,
                        isGreeting: true
                    },
                    ultraIntelligentInfo: {
                        processingTime: Date.now() - startTime,
                        confidence: basicConversation.confidence,
                        errorsCorrected: 0,
                        languageDetected: false,
                        contextUsed: false,
                        interpretationSource: 'basic_conversation',
                        emotionalContext: 'positive',
                        urgency: 'baja',
                        conversationType: basicConversation.type
                    }
                };
            }
            
            // 1. Obtener contexto
            const context = existingContext || contextManager.getContext(chatId);
            
            // 2. Detectar idioma y traducir si es necesario
            const language = naturalLanguageProcessor.detectLanguage(message);
            let processedMessage = message;
            
            if (language === 'english') {
                processedMessage = naturalLanguageProcessor.translateBasicEnglish(message);
                this.stats.languageDetected++;
                console.log(`🌐 [Ultra Intelligent System] Traducido de inglés: "${processedMessage}"`);
            }
            
            // 3. Resolver referencias contextuales
            const resolvedMessage = contextManager.resolveReferences(processedMessage, chatId);
            if (resolvedMessage !== processedMessage) {
                console.log(`🔗 [Ultra Intelligent System] Referencias resueltas: "${resolvedMessage}"`);
            }
            
            // 4. Procesar con NLP para detectar errores
            const nlpResult = naturalLanguageProcessor.processMessage(resolvedMessage);
            const corrections = naturalLanguageProcessor.suggestCorrections(resolvedMessage);
            
            if (corrections.length > 0) {
                this.stats.errorsCorrected += corrections.length;
                console.log(`✏️ [Ultra Intelligent System] Errores corregidos: ${corrections.length}`);
            }
            
            // 4.5. ACTUALIZAR CONTEXTO INMEDIATAMENTE cuando se detecta un producto (ANTES del sistema de conocimiento)
            const originalLower = resolvedMessage.toLowerCase();
            
            // Detectar cursos específicos por nombre característico
            let detectedProduct = this.detectSpecificCourse(originalLower);
            
            if (detectedProduct) {
                contextManager.updateContext(chatId, {
                    lastProduct: detectedProduct.name,
                    lastTopic: detectedProduct.category
                });
                console.log(`🎓 [Ultra Intelligent] Contexto actualizado a ${detectedProduct.name} ANTES del procesamiento`);
                context.lastProduct = detectedProduct.name;
                context.lastTopic = detectedProduct.category;
            } else if (originalLower.includes('laptop') || originalLower.includes('computador') || originalLower.includes('portátil')) {
                contextManager.updateContext(chatId, {
                    lastProduct: 'Laptop Lenovo V14 G4',
                    lastTopic: 'portátil'
                });
                console.log('💻 [Ultra Intelligent] Contexto actualizado a laptop ANTES del procesamiento');
                context.lastProduct = 'Laptop Lenovo V14 G4';
                context.lastTopic = 'portátil';
            } else if (originalLower.includes('moto') || originalLower.includes('pulsar')) {
                contextManager.updateContext(chatId, {
                    lastProduct: 'Moto Pulsar NS 160 FI',
                    lastTopic: 'moto'
                });
                console.log('🏍️ [Ultra Intelligent] Contexto actualizado a moto ANTES del procesamiento');
                context.lastProduct = 'Moto Pulsar NS 160 FI';
                context.lastTopic = 'moto';
            } else if (originalLower.includes('curso') && originalLower.includes('piano')) {
                contextManager.updateContext(chatId, {
                    lastProduct: 'Curso Piano Profesional Completo',
                    lastTopic: 'curso'
                });
                console.log('🎹 [Ultra Intelligent] Contexto actualizado a curso de piano ANTES del procesamiento');
                context.lastProduct = 'Curso Piano Profesional Completo';
                context.lastTopic = 'curso';
            }
            
            // TAMBIÉN actualizar contexto en el mensaje ORIGINAL (antes de resolver referencias)
            const originalMessageLower = message.toLowerCase();
            
            // Detectar cursos específicos en el mensaje original también
            let detectedProductOriginal = this.detectSpecificCourse(originalMessageLower);
            
            if (detectedProductOriginal) {
                contextManager.updateContext(chatId, {
                    lastProduct: detectedProductOriginal.name,
                    lastTopic: detectedProductOriginal.category
                });
                console.log(`🎓 [Ultra Intelligent] Contexto actualizado a ${detectedProductOriginal.name} desde mensaje original`);
                context.lastProduct = detectedProductOriginal.name;
                context.lastTopic = detectedProductOriginal.category;
            } else if (originalMessageLower.includes('curso') && originalMessageLower.includes('piano')) {
                contextManager.updateContext(chatId, {
                    lastProduct: 'Curso Piano Profesional Completo',
                    lastTopic: 'curso'
                });
                console.log('🎹 [Ultra Intelligent] Contexto actualizado a curso de piano desde mensaje original');
                context.lastProduct = 'Curso Piano Profesional Completo';
                context.lastTopic = 'curso';
            }
            
            // 5. PRIORIZAR SISTEMA DE CONOCIMIENTO REAL PRIMERO
            // Verificar si podemos responder con información real de la base de datos
            if (intelligentKnowledgeSystem.canAnswerWithRealInfo(resolvedMessage)) {
                console.log('🧠 [Ultra Intelligent System] Pregunta con información real detectada, usando base de conocimiento PRIMERO');
                
                // PASAR EL CONTEXTO CORRECTAMENTE
                const contextWithInfo = {
                    ...context,
                    lastProduct: context.lastProduct,
                    lastTopic: context.lastTopic,
                    conversationHistory: contextManager.getConversationHistory(chatId, 5)
                };
                
                console.log(`🎯 [Ultra Intelligent System] Pasando contexto: ${contextWithInfo.lastProduct || 'ninguno'}`);
                
                const knowledgeResponse = intelligentKnowledgeSystem.processIntelligentQuestion(resolvedMessage, contextWithInfo);
                
                if (knowledgeResponse && knowledgeResponse.hasRealInfo && knowledgeResponse.confidence > 0.85) {
                    console.log(`✅ [Ultra Intelligent System] Respuesta con información real generada (confianza: ${knowledgeResponse.confidence})`);
                    
                    // 🤖➡️👤 HUMANIZAR LA RESPUESTA
                    const humanizedResponse = await responseHumanizer.humanizeResponse(knowledgeResponse, {
                        originalMessage: message,
                        userContext: contextWithInfo,
                        conversationHistory: contextManager.getConversationHistory(chatId, 3)
                    });
                    
                    humanizedResponse.ultraIntelligentInfo = {
                        processingTime: Date.now() - startTime,
                        confidence: humanizedResponse.confidence,
                        errorsCorrected: corrections.length,
                        languageDetected: language !== 'spanish',
                        contextUsed: !!contextWithInfo.lastProduct,
                        interpretationSource: humanizedResponse.source,
                        emotionalContext: 'helpful',
                        urgency: 'media',
                        nlpConfidence: nlpResult.confidence,
                        hasRealInfo: humanizedResponse.hasRealInfo,
                        priorityUsed: 'knowledge_first',
                        humanized: humanizedResponse.humanized || false
                    };
                    
                    contextManager.addMessage(chatId, message, humanizedResponse.text);
                    this.updateStats({ confianza: humanizedResponse.confidence }, Date.now() - startTime);
                    
                    return humanizedResponse;
                }
            }

            // 6. Interpretar con IA mejorada (con fallback inteligente)
            let interpretation;
            try {
                interpretation = await enhancedAIInterpreter.interpretMessage(resolvedMessage, {
                    ...context,
                    nlpResult,
                    corrections,
                    conversationHistory: contextManager.getConversationHistory(chatId, 5)
                });
            } catch (aiError) {
                console.log('⚠️ [Ultra Intelligent System] IA no disponible, usando sistema inteligente de fallback');
                
                // Verificar si podemos responder con información real de la base de datos (segunda oportunidad)
                if (intelligentKnowledgeSystem.canAnswerWithRealInfo(resolvedMessage)) {
                    console.log('🧠 [Ultra Intelligent System] Usando base de conocimiento como fallback de IA');
                    
                    // PASAR EL CONTEXTO CORRECTAMENTE EN EL FALLBACK TAMBIÉN
                    const contextWithInfo = {
                        ...context,
                        lastProduct: context.lastProduct,
                        lastTopic: context.lastTopic,
                        conversationHistory: contextManager.getConversationHistory(chatId, 5)
                    };
                    
                    console.log(`🎯 [Ultra Intelligent System] Fallback - Pasando contexto: ${contextWithInfo.lastProduct || 'ninguno'}`);
                    
                    const knowledgeResponse = intelligentKnowledgeSystem.processIntelligentQuestion(resolvedMessage, contextWithInfo);
                    
                    // 🤖➡️👤 HUMANIZAR LA RESPUESTA DE FALLBACK
                    const humanizedResponse = await responseHumanizer.humanizeResponse(knowledgeResponse, {
                        originalMessage: message,
                        userContext: contextWithInfo,
                        conversationHistory: contextManager.getConversationHistory(chatId, 3),
                        isFallback: true
                    });
                    
                    humanizedResponse.ultraIntelligentInfo = {
                        processingTime: Date.now() - startTime,
                        confidence: humanizedResponse.confidence,
                        errorsCorrected: corrections.length,
                        languageDetected: language !== 'spanish',
                        contextUsed: !!contextWithInfo.lastProduct,
                        interpretationSource: humanizedResponse.source,
                        emotionalContext: 'helpful',
                        urgency: 'media',
                        nlpConfidence: nlpResult.confidence,
                        hasRealInfo: humanizedResponse.hasRealInfo,
                        aiError: true,
                        humanized: humanizedResponse.humanized || false
                    };
                    
                    contextManager.addMessage(chatId, message, humanizedResponse.text);
                    this.updateStats({ confianza: humanizedResponse.confidence }, Date.now() - startTime);
                    
                    return humanizedResponse;
                }
                
                // Si es caso de emergencia, usar respuesta de emergencia
                if (smartFallbackSystem.isEmergencyCase(resolvedMessage)) {
                    const emergencyResponse = smartFallbackSystem.generateEmergencyResponse(resolvedMessage);
                    emergencyResponse.ultraIntelligentInfo = {
                        processingTime: Date.now() - startTime,
                        confidence: emergencyResponse.confidence,
                        errorsCorrected: corrections.length,
                        languageDetected: language !== 'spanish',
                        contextUsed: !!context.lastProduct,
                        interpretationSource: 'emergency_fallback',
                        emotionalContext: 'neutral',
                        urgency: 'alta',
                        nlpConfidence: nlpResult.confidence,
                        aiError: true
                    };
                    return emergencyResponse;
                }
                
                // Usar sistema de fallback inteligente
                const fallbackResponse = smartFallbackSystem.generateSmartResponse(resolvedMessage, context);
                fallbackResponse.ultraIntelligentInfo = {
                    processingTime: Date.now() - startTime,
                    confidence: fallbackResponse.confidence,
                    errorsCorrected: corrections.length,
                    languageDetected: language !== 'spanish',
                    contextUsed: !!context.lastProduct,
                    interpretationSource: 'smart_fallback',
                    emotionalContext: 'neutral',
                    urgency: 'media',
                    nlpConfidence: nlpResult.confidence,
                    aiError: true
                };
                
                // Actualizar contexto si es necesario
                if (fallbackResponse.data && fallbackResponse.data.product) {
                    contextManager.updateContext(chatId, {
                        lastProduct: fallbackResponse.data.product,
                        lastTopic: fallbackResponse.data.category
                    });
                }
                
                contextManager.addMessage(chatId, message, fallbackResponse.text);
                this.updateStats({ confianza: fallbackResponse.confidence }, Date.now() - startTime);
                
                return fallbackResponse;
            }
            
            console.log(`🧠 [Ultra Intelligent System] Interpretación:`, interpretation);
            
            // 7. Actualizar contexto con interpretación - MEJORADO
            if (interpretation.tema && interpretation.tema !== 'otro') {
                contextManager.detectTopicChange(interpretation.tema, chatId);
                
                // Actualizar contexto inmediatamente cuando hay cambio de tema
                contextManager.updateContext(chatId, {
                    lastTopic: interpretation.tema,
                    lastIntent: interpretation.intencion
                });
            }
            
            if (interpretation.producto_especifico) {
                contextManager.updateContext(chatId, {
                    lastProduct: interpretation.producto_especifico,
                    lastTopic: interpretation.tema,
                    lastIntent: interpretation.intencion,
                    conversationState: this.determineConversationState(interpretation),
                    metadata: {
                        emotion: interpretation.contexto_emocional,
                        urgency: interpretation.urgencia,
                        confidence: interpretation.confianza
                    }
                });
            }
            

            
            // 7.5. Verificar si la confianza es baja y podemos usar información real
            if (interpretation.confianza < 0.7 && intelligentKnowledgeSystem.canAnswerWithRealInfo(resolvedMessage)) {
                console.log('🧠 [Ultra Intelligent System] Confianza baja, usando base de conocimiento real');
                const knowledgeResponse = intelligentKnowledgeSystem.processIntelligentQuestion(resolvedMessage, context);
                
                knowledgeResponse.ultraIntelligentInfo = {
                    processingTime: Date.now() - startTime,
                    confidence: knowledgeResponse.confidence,
                    errorsCorrected: corrections.length,
                    languageDetected: language !== 'spanish',
                    contextUsed: !!context.lastProduct,
                    interpretationSource: `${knowledgeResponse.source}_low_confidence`,
                    emotionalContext: 'helpful',
                    urgency: 'media',
                    nlpConfidence: nlpResult.confidence,
                    hasRealInfo: knowledgeResponse.hasRealInfo,
                    originalConfidence: interpretation.confianza
                };
                
                contextManager.addMessage(chatId, message, knowledgeResponse.text);
                this.updateStats({ confianza: knowledgeResponse.confidence }, Date.now() - startTime);
                
                return knowledgeResponse;
            }
            
            // 8. Generar respuesta con IA Profesional de Ventas
            const response = await this.generateProfessionalSalesResponse(interpretation, context, chatId, resolvedMessage);
            
            // 9. Enriquecer respuesta con información contextual
            const enrichedResponse = this.enrichResponse(response, interpretation, nlpResult, corrections);
            
            // 10. Actualizar contexto con intercambio completo
            contextManager.addMessage(chatId, message, enrichedResponse.text);
            
            // 11. Actualizar estadísticas
            const processingTime = Date.now() - startTime;
            this.updateStats(interpretation, processingTime);
            
            // 12. Agregar metadatos del sistema
            enrichedResponse.ultraIntelligentInfo = {
                processingTime,
                confidence: interpretation.confianza,
                errorsCorrected: corrections.length,
                languageDetected: language !== 'spanish',
                contextUsed: !!context.lastProduct,
                interpretationSource: interpretation.source,
                emotionalContext: interpretation.contexto_emocional,
                urgency: interpretation.urgencia,
                nlpConfidence: nlpResult.confidence
            };
            
            console.log(`✅ [Ultra Intelligent System] Respuesta ultra inteligente generada en ${processingTime}ms con confianza ${interpretation.confianza}`);
            
            return enrichedResponse;
            
        } catch (error) {
            console.error('❌ [Ultra Intelligent System] Error crítico:', error.message);
            
            return {
                text: 'Disculpa, tuve un problema técnico momentáneo 😔\n\nPero puedo ayudarte con:\n🏍️ Motos\n💻 Laptops\n🎹 Cursos de Piano\n\n¿En qué puedo asistirte?',
                source: 'emergency',
                confidence: 0.0,
                action: 'error',
                ultraIntelligentInfo: {
                    processingTime: Date.now() - startTime,
                    error: error.message,
                    fallbackUsed: true
                }
            };
        }
    }

    /**
     * Enriquece la respuesta con información adicional
     */
    enrichResponse(response, interpretation, nlpResult, corrections) {
        let enrichedText = response.text;
        
        // Si hubo correcciones significativas, mencionar sutilmente
        if (corrections.length > 2 && interpretation.confianza > 0.8) {
            // Solo agregar si la confianza es alta, para confirmar comprensión
            enrichedText += '\n\n(Entendí perfectamente lo que necesitas 😊)';
        }
        
        // Si detectamos urgencia alta, ajustar el tono
        if (interpretation.urgencia === 'alta') {
            enrichedText = enrichedText.replace(/😊/g, '⚡');
            if (!enrichedText.includes('inmediatamente') && !enrichedText.includes('ahora')) {
                enrichedText += '\n\n⚡ Te atiendo de inmediato.';
            }
        }
        
        // Si el contexto emocional es negativo, ser más empático
        if (interpretation.contexto_emocional === 'negative') {
            enrichedText = enrichedText.replace(/😊/g, '😔');
            if (!enrichedText.includes('entiendo')) {
                enrichedText = 'Entiendo tu situación. ' + enrichedText;
            }
        }
        
        return {
            ...response,
            text: enrichedText,
            originalInterpretation: interpretation,
            nlpData: nlpResult,
            corrections: corrections
        };
    }

    /**
     * Determina el estado de la conversación
     */
    determineConversationState(interpretation) {
        switch (interpretation.intencion) {
            case 'saludar':
                return 'exploration';
            case 'preguntar_precio':
                return 'interest';
            case 'solicitar_fotos':
                return 'interest';
            case 'comprar':
                return 'decision';
            case 'negociar':
                return 'decision';
            default:
                return 'exploration';
        }
    }

    /**
     * Actualiza estadísticas del sistema
     */
    updateStats(interpretation, processingTime) {
        this.stats.totalMessages++;
        
        if (interpretation.confianza > 0.8) {
            this.stats.perfectUnderstanding++;
        }
        
        if (interpretation.source === 'ai_enhanced' || interpretation.source === 'direct_nlp') {
            this.stats.contextualResponses++;
        }
        
        // Actualizar confianza promedio
        const currentAvg = this.stats.averageConfidence;
        const totalMessages = this.stats.totalMessages;
        this.stats.averageConfidence = ((currentAvg * (totalMessages - 1)) + interpretation.confianza) / totalMessages;
        
        // Guardar tiempo de procesamiento
        this.stats.processingTimes.push(processingTime);
        if (this.stats.processingTimes.length > 100) {
            this.stats.processingTimes = this.stats.processingTimes.slice(-100);
        }
    }

    /**
     * Obtiene estadísticas completas del sistema
     */
    getStats() {
        const contextStats = contextManager.getStats();
        const avgProcessingTime = this.stats.processingTimes.length > 0 
            ? this.stats.processingTimes.reduce((a, b) => a + b, 0) / this.stats.processingTimes.length 
            : 0;
        
        return {
            ...this.stats,
            contextStats,
            performance: {
                perfectUnderstandingRate: this.stats.totalMessages > 0 
                    ? (this.stats.perfectUnderstanding / this.stats.totalMessages * 100).toFixed(1) + '%' 
                    : '0%',
                contextualResponseRate: this.stats.totalMessages > 0 
                    ? (this.stats.contextualResponses / this.stats.totalMessages * 100).toFixed(1) + '%' 
                    : '0%',
                errorCorrectionRate: this.stats.totalMessages > 0 
                    ? (this.stats.errorsCorrected / this.stats.totalMessages).toFixed(1) 
                    : '0',
                averageProcessingTime: Math.round(avgProcessingTime) + 'ms',
                averageConfidence: (this.stats.averageConfidence * 100).toFixed(1) + '%'
            }
        };
    }

    /**
     * Limpia el contexto de un chat
     */
    clearChatContext(chatId) {
        return contextManager.clearContext(chatId);
    }

    /**
     * Obtiene el contexto actual de un chat
     */
    getChatContext(chatId) {
        return contextManager.getContextSummary(chatId);
    }

    /**
     * Obtiene el historial de conversación
     */
    getConversationHistory(chatId, limit = 5) {
        return contextManager.getConversationHistory(chatId, limit);
    }

    /**
     * Genera respuesta con IA Profesional de Ventas (nunca se bloquea)
     */
    async generateProfessionalSalesResponse(interpretation, context, chatId, originalMessage) {
        try {
            console.log('🎯 [Ultra Intelligent] Generando respuesta profesional para:', interpretation);
            
            // 1. SI LA INTERPRETACIÓN ES CLARA Y CONFIABLE, RESPONDER DIRECTAMENTE
            if (interpretation.confianza > 0.8 && interpretation.tema && interpretation.producto_especifico) {
                console.log('✅ [Ultra Intelligent] Interpretación clara detectada, respondiendo directamente');
                return this.generateDirectProductResponse(interpretation, context);
            }
            
            // 2. Verificar si necesita rescate conversacional
            if (neverStuckManager.needsRescue(originalMessage, context)) {
                console.log('🔄 [Ultra Intelligent] Usando gestor de conversación que nunca se bloquea');
                const rescueResponse = neverStuckManager.processAnyMessage(originalMessage, context);
                
                return {
                    text: rescueResponse.text,
                    source: 'never_stuck_manager',
                    confidence: rescueResponse.confidence || 0.8,
                    action: 'redirect_to_sales',
                    data: {
                        recovery_used: rescueResponse.recovery_used,
                        method: rescueResponse.method,
                        problem_type: rescueResponse.problem_type
                    }
                };
            }
            
            // 3. Usar IA Profesional de Ventas solo si no hay interpretación clara
            const salesResponse = professionalSalesAI.processMessage(originalMessage, {
                ...context,
                interpretation: interpretation
            });
            
            if (salesResponse && salesResponse.text) {
                return {
                    text: salesResponse.text,
                    source: 'professional_sales_ai',
                    confidence: salesResponse.confidence || 0.9,
                    action: 'professional_sales',
                    data: {
                        intention: salesResponse.intention,
                        strategy: salesResponse.strategy,
                        lead_temperature: professionalSalesAI.evaluateLeadTemperature(originalMessage, context)
                    }
                };
            }
            
            // 3. Fallback a Groq AI si está disponible
            return await this.generateIntelligentResponse(interpretation, context, chatId);
            
        } catch (error) {
            console.error('❌ [Ultra Intelligent] Error en respuesta profesional de ventas:', error.message);
            
            // 4. Usar gestor que nunca se bloquea como último recurso
            const emergencyResponse = neverStuckManager.emergencyRecovery(originalMessage, context);
            return {
                text: emergencyResponse.text,
                source: 'emergency_recovery',
                confidence: 0.6,
                action: 'emergency_redirect',
                data: { error: error.message }
            };
        }
    }

    /**
     * Genera respuesta directa para productos cuando la interpretación es clara
     */
    generateDirectProductResponse(interpretation, context) {
        const { tema, intencion, producto_especifico, confianza } = interpretation;
        
        console.log(`🎯 [Ultra Intelligent] Generando respuesta directa para ${tema} - ${producto_especifico}`);
        
        let response = '';
        
        // Respuestas directas según el producto
        switch (tema) {
            case 'moto':
                if (intencion === 'obtener_info' || intencion === 'preguntar_precio') {
                    response = `🏍️ ¡Perfecto! Te cuento sobre la Moto Pulsar NS 160 FI 2020:

✅ **Características principales:**
• Motor 160cc con inyección electrónica
• Frenos disco delantero y trasero
• Excelente estado y mantenimiento completo
• Papeles al día hasta enero 2025

💰 **Precio:** $6.000.000 COP
📍 **Ubicación:** Cali, Valle del Cauca
📸 **¿Te envío las fotos reales?**

¿Qué más te gustaría saber sobre la moto? 😊`;
                } else {
                    response = `🏍️ ¡Excelente elección! La Moto Pulsar NS 160 FI 2020 es perfecta para la ciudad.

¿Te interesa conocer el precio, ver las fotos o coordinar una cita para verla en persona? 🤔`;
                }
                break;
                
            case 'portátil':
            case 'laptop':
                response = `💻 ¡Genial! Tengo laptops Lenovo V14 G4 disponibles:

✅ **Lenovo V14 G4 Intel Core i3:**
• Precio: $1.389.900 COP
• 8GB RAM + 256GB SSD
• Ideal para trabajo y estudio

✅ **Lenovo V14 G4 Intel Core i5:**
• Precio: $1.489.900 COP  
• 8GB RAM + 256GB SSD
• Perfecto para diseño y multitarea

📸 ¿Te muestro las fotos reales? ¿O necesitas más detalles técnicos? 😊`;
                break;
                
            case 'curso':
                response = `🎹 ¡Excelente decisión! El Curso Piano Profesional Completo es increíble:

✅ **Lo que incluye:**
• +80 lecciones en video HD descargables
• Acceso de por vida (sin mensualidades)
• Soporte directo del profesor
• Método paso a paso para principiantes

💰 **Precio especial:** Ver en link de pago
🔗 **Comprar ahora:** https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205
✅ **Garantía:** 7 días incluida

¿Te gustaría ver algunas capturas del contenido? 📸`;
                break;
                
            default:
                response = `😊 Entiendo tu interés. Te puedo ayudar con:

🏍️ **Moto Pulsar NS 160 FI** - $6.000.000 COP
💻 **Laptops Lenovo V14 G4** - Desde $1.389.900 COP  
🎹 **Curso Piano Profesional** - Ver precio en link

¿Cuál te interesa más? ¡Puedo darte toda la información! 🤔`;
        }
        
        return {
            text: response,
            source: 'direct_product_response',
            confidence: confianza,
            action: 'provide_product_info',
            data: {
                product: producto_especifico,
                category: tema,
                intention: intencion,
                direct_response: true
            }
        };
    }

    /**
     * Genera respuesta inteligente basada en interpretación (método original)
     */
    async generateIntelligentResponse(interpretation, context, chatId) {
        try {
            // Usar Groq AI para generar respuesta contextual
            const aiResponse = await groqAI.processMessage(interpretation.texto_normalizado, {
                chatId: chatId,
                interpretation: interpretation,
                context: context,
                conversationHistory: context.conversationHistory || []
            });

            if (aiResponse && aiResponse.text) {
                return {
                    text: aiResponse.text,
                    source: 'ultra_intelligent_ai',
                    confidence: interpretation.confianza || 0.8,
                    action: interpretation.accion || 'provide_info',
                    data: {
                        product: interpretation.producto_especifico,
                        category: interpretation.tema,
                        emotion: interpretation.contexto_emocional,
                        urgency: interpretation.urgencia
                    }
                };
            }

            // Fallback si Groq AI falla
            return this.generateFallbackResponse(interpretation);

        } catch (error) {
            console.error('❌ [Ultra Intelligent System] Error generando respuesta:', error.message);
            return this.generateFallbackResponse(interpretation);
        }
    }

    /**
     * Genera respuesta de fallback
     */
    generateFallbackResponse(interpretation) {
        let text = '';
        let action = 'provide_info';
        
        // Si es solicitud de fotos, responder específicamente
        if (interpretation.accion === 'solicitar_fotos' || interpretation.intencion === 'solicitar_fotos') {
            if (interpretation.producto_especifico) {
                text = `📸 ¡Por supuesto! Te envío las fotos reales de ${interpretation.producto_especifico} ahora mismo.`;
                action = 'send_photos';
            } else {
                switch (interpretation.tema) {
                    case 'moto':
                        if (interpretation.accion === 'solicitar_fotos') {
                            text = '📸 ¡Claro! Te envío las fotos reales de la Moto Pulsar NS 160 FI ahora mismo.';
                            action = 'send_photos';
                        } else {
                            text = '📍 ¡Perfecto! Podemos encontrarnos en el **Centro Comercial El Diamante 2**, Barrio San Nicolás, para que veas la moto en persona.\n\n📱 Contáctame al +57 304 274 8687 para coordinar día y hora. 🤝';
                            action = 'coordinate_meeting';
                        }
                        break;
                    case 'portátil':
                        text = '📸 ¡Por supuesto! Te envío las fotos de las laptops Lenovo V14 G4 disponibles.';
                        action = 'send_photos';
                        break;
                    case 'curso':
                        text = '📸 ¡Perfecto! Te envío capturas del Curso de Piano para que veas el contenido.';
                        action = 'send_photos';
                        break;
                    default:
                        text = '📸 ¡Claro que sí! Puedo enviarte fotos reales de nuestros productos.\n\n¿De cuál específicamente?\n🏍️ Moto Pulsar NS 160 FI\n💻 Laptops Lenovo V14 G4\n🎹 Curso de Piano';
                        action = 'request_specification';
                }
            }
        } else {
            // Respuesta basada en el tema
            switch (interpretation.tema) {
                case 'moto':
                    text = '🏍️ Moto Pulsar NS 160 FI 2020 - $6.000.000 COP\n📍 Centro Comercial El Diamante 2, Barrio San Nicolás\n\n¿Te gustaría ver fotos o coordinar una cita para verla en persona?';
                    break;
                case 'portátil':
                    text = '💻 Tengo información sobre laptops Lenovo V14 G4. ¿Te interesa conocer más detalles?';
                    break;
                case 'curso':
                    text = '🎹 El Curso Completo de Piano está disponible. ¿Quieres saber más información?';
                    break;
                default:
                    text = '😊 Estoy aquí para ayudarte. Puedo darte información sobre:\n🏍️ Motos\n💻 Laptops\n🎹 Cursos de Piano\n\n¿Qué te interesa?';
            }
        }

        // Ajustar tono según contexto emocional
        if (interpretation.contexto_emocional === 'negative') {
            text = 'Entiendo tu situación. ' + text;
        } else if (interpretation.urgencia === 'alta') {
            text = '⚡ ' + text + '\n\nTe atiendo de inmediato.';
        }

        return {
            text: text,
            source: 'ultra_intelligent_fallback',
            confidence: 0.8,
            action: action,
            data: {
                product: interpretation.producto_especifico,
                category: interpretation.tema,
                type: interpretation.tema,
                fallback: true
            }
        };
    }

    /**
     * Procesa un mensaje de prueba para diagnóstico
     */
    async testMessage(message) {
        console.log(`🧪 [Ultra Intelligent System] Modo de prueba para: "${message}"`);
        
        const nlpResult = naturalLanguageProcessor.processMessage(message);
        const corrections = naturalLanguageProcessor.suggestCorrections(message);
        const interpretation = await enhancedAIInterpreter.interpretMessage(message, {});
        
        return {
            original: message,
            nlpResult,
            corrections,
            interpretation,
            testMode: true
        };
    }

    /**
     * Detecta cursos específicos por nombre característico
     */
    detectSpecificCourse(message) {
        const courseDatabase = {
            // DISEÑO Y CREATIVIDAD
            'diseño gráfico': { name: 'Mega Pack 01: Cursos Diseño Gráfico', category: 'diseño-creatividad' },
            'photoshop': { name: 'Mega Pack 01: Cursos Diseño Gráfico', category: 'diseño-creatividad' },
            'illustrator': { name: 'Mega Pack 01: Cursos Diseño Gráfico', category: 'diseño-creatividad' },
            'infografías': { name: 'Mega Pack 06: Mega Pack Infografías', category: 'diseño-creatividad' },
            'infografia': { name: 'Mega Pack 06: Mega Pack Infografías', category: 'diseño-creatividad' },
            'plantillas editables': { name: 'Mega Pack 14: Pack Plantillas 100% Editables', category: 'diseño-creatividad' },
            'after effects': { name: 'Mega Pack 15: Mega Pack FX Presets After Effects y Premiere', category: 'diseño-creatividad' },
            'premiere': { name: 'Mega Pack 15: Mega Pack FX Presets After Effects y Premiere', category: 'diseño-creatividad' },
            'canva': { name: 'Mega Pack 34: Plantillas Canva MEGA Pro', category: 'diseño-creatividad' },
            'filmora': { name: 'Mega Pack 33: Filmora 9', category: 'diseño-creatividad' },

            // OFICINA Y PRODUCTIVIDAD
            'microsoft office': { name: 'Mega Pack 02: Cursos Microsoft Office', category: 'oficina-productividad' },
            'office': { name: 'Mega Pack 02: Cursos Microsoft Office', category: 'oficina-productividad' },
            'word': { name: 'Mega Pack 02: Cursos Microsoft Office', category: 'oficina-productividad' },
            'powerpoint': { name: 'Mega Pack 02: Cursos Microsoft Office', category: 'oficina-productividad' },
            'excel': { name: 'Mega Pack 04: Cursos Excel', category: 'oficina-productividad' },
            'macros': { name: 'Mega Pack 26: Macros', category: 'oficina-productividad' },

            // TECNOLOGÍA Y PROGRAMACIÓN
            'hacking ético': { name: 'Mega Pack 05: Cursos Hacking Ético', category: 'tecnologia-programacion' },
            'hacking etico': { name: 'Mega Pack 05: Cursos Hacking Ético', category: 'tecnologia-programacion' },
            'ciberseguridad': { name: 'Mega Pack 05: Cursos Hacking Ético', category: 'tecnologia-programacion' },
            'programación': { name: 'Mega Pack 16: Cursos Premium +900 GB de cursos', category: 'tecnologia-programacion' },
            'programacion': { name: 'Mega Pack 16: Cursos Premium +900 GB de cursos', category: 'tecnologia-programacion' },
            'android': { name: 'Mega Pack 17: Apps Android Premium', category: 'tecnologia-programacion' },
            'reparación teléfonos': { name: 'Mega Pack 18: Reparación de teléfonos y tablets', category: 'tecnologia-programacion' },
            'reparacion telefonos': { name: 'Mega Pack 18: Reparación de teléfonos y tablets', category: 'tecnologia-programacion' },
            'wordpress': { name: 'Mega Pack 19: Wordpress – Landing Page, Plugin y Themes', category: 'tecnologia-programacion' },
            'ensamblaje': { name: 'Mega Pack 23: Curso Ensamblaje y Mantenimiento', category: 'tecnologia-programacion' },
            'mantenimiento pc': { name: 'Mega Pack 23: Curso Ensamblaje y Mantenimiento', category: 'tecnologia-programacion' },

            // MARKETING Y NEGOCIOS
            'marketing digital': { name: 'Mega Pack 11: Cursos Marketing Digital', category: 'marketing-negocios' },
            'marketing': { name: 'Mega Pack 37: Marketing & Ventas', category: 'marketing-negocios' },
            'ventas': { name: 'Mega Pack 37: Marketing & Ventas', category: 'marketing-negocios' },
            'redes sociales': { name: 'Mega Pack 38: Redes Sociales', category: 'marketing-negocios' },
            'trading': { name: 'Mega Pack 39: Trading', category: 'marketing-negocios' },
            'forex': { name: 'Mega Pack 39: Trading', category: 'marketing-negocios' },

            // EDUCACIÓN Y DESARROLLO PERSONAL
            'inglés': { name: 'Mega Pack 03: Cursos Inglés', category: 'educacion-desarrollo' },
            'ingles': { name: 'Mega Pack 03: Cursos Inglés', category: 'educacion-desarrollo' },
            'english': { name: 'Mega Pack 03: Cursos Inglés', category: 'educacion-desarrollo' },
            'memoria': { name: 'Mega Pack 09: Curso Memoria Poderosa', category: 'educacion-desarrollo' },
            'crecimiento personal': { name: 'Mega Pack 22: Curso Crecimiento Personal', category: 'educacion-desarrollo' },
            'psicología': { name: 'Mega Pack 28: PreUniversitario-Psicología', category: 'educacion-desarrollo' },
            'psicologia': { name: 'Mega Pack 28: PreUniversitario-Psicología', category: 'educacion-desarrollo' },
            'universitario': { name: 'Mega Pack 32: Universitario', category: 'educacion-desarrollo' },
            'pedagogía': { name: 'Mega Pack 36: Libros de Pedagogía', category: 'educacion-desarrollo' },
            'pedagogia': { name: 'Mega Pack 36: Libros de Pedagogía', category: 'educacion-desarrollo' },

            // CURSO DE PIANO INDIVIDUAL (PRODUCTO PREMIUM SEPARADO)
            'curso definitivo de piano': { name: 'Curso Piano Profesional Completo', category: 'curso-piano-individual' },
            'curso piano profesional': { name: 'Curso Piano Profesional Completo', category: 'curso-piano-individual' },
            'curso piano completo': { name: 'Curso Piano Profesional Completo', category: 'curso-piano-individual' },

            // LIBROS Y CONTENIDO
            'libros digitales': { name: 'Mega Pack 10: 3700 Libros Digitales', category: 'libros-contenido' },
            'libros': { name: 'Mega Pack 10: 3700 Libros Digitales', category: 'libros-contenido' },
            'audiolibros': { name: 'Mega Pack 20: AudioLibros – AudioBooks', category: 'libros-contenido' },
            'audiobooks': { name: 'Mega Pack 20: AudioLibros – AudioBooks', category: 'libros-contenido' },

            // GASTRONOMÍA Y OFICIOS
            'gastronomía': { name: 'Mega Pack 12: Gastronomía Internacional en PDF', category: 'gastronomia-oficios' },
            'gastronomia': { name: 'Mega Pack 12: Gastronomía Internacional en PDF', category: 'gastronomia-oficios' },
            'cocina': { name: 'Mega Pack 12: Gastronomía Internacional en PDF', category: 'gastronomia-oficios' },
            'drywall': { name: 'Mega Pack 25: Cursos Construcción en Drywall', category: 'gastronomia-oficios' },
            'construcción': { name: 'Mega Pack 25: Cursos Construcción en Drywall', category: 'gastronomia-oficios' },
            'construccion': { name: 'Mega Pack 25: Cursos Construcción en Drywall', category: 'gastronomia-oficios' },
            'resina': { name: 'Mega Pack 29: Curso Resina', category: 'gastronomia-oficios' },
            'bartender': { name: 'Mega Pack 30: Cursos BODA, Bartender y Producción Musical', category: 'gastronomia-oficios' },
            'producción musical': { name: 'Mega Pack 30: Cursos BODA, Bartender y Producción Musical', category: 'gastronomia-oficios' },
            'produccion musical': { name: 'Mega Pack 30: Cursos BODA, Bartender y Producción Musical', category: 'gastronomia-oficios' },

            // ARQUITECTURA Y CONSTRUCCIÓN
            'arquitectura': { name: 'Mega Pack 13: Pack cursos Ingeniería y Arquitectura', category: 'arquitectura-construccion' },
            'ingeniería': { name: 'Mega Pack 13: Pack cursos Ingeniería y Arquitectura', category: 'arquitectura-construccion' },
            'ingenieria': { name: 'Mega Pack 13: Pack cursos Ingeniería y Arquitectura', category: 'arquitectura-construccion' },
            'melamina': { name: 'Mega Pack 31: 550 Planos de Muebles de Melamina', category: 'arquitectura-construccion' },
            'muebles': { name: 'Mega Pack 31: 550 Planos de Muebles de Melamina', category: 'arquitectura-construccion' },
            'planos': { name: 'Mega Pack 31: 550 Planos de Muebles de Melamina', category: 'arquitectura-construccion' },

            // SUBLIMADO Y MANUALIDADES
            'sublimado': { name: 'Mega Pack 21: Pack Sublimado', category: 'sublimado-manualidades' },

            // MEGA PACK COMPLETO (solo cuando mencionen "completo" o "todos")
            'pack completo': { name: 'Mega Pack Completo (40 productos)', category: 'mega-pack-completo' },
            'todos los packs': { name: 'Mega Pack Completo (40 productos)', category: 'mega-pack-completo' },
            'todos los cursos': { name: 'Mega Pack Completo (40 productos)', category: 'mega-pack-completo' },
            '40 productos': { name: 'Mega Pack Completo (40 productos)', category: 'mega-pack-completo' },

            // MEGA PACKS GENÉRICO (solo cuando no sea específico)
            'mega packs': { name: 'Mega Packs Cursos Digitales', category: 'mega-packs-general' },
            'mega pack': { name: 'Mega Packs Cursos Digitales', category: 'mega-packs-general' },
            'cursos digitales': { name: 'Mega Packs Cursos Digitales', category: 'mega-packs-general' }
        };

        // LÓGICA ESPECIAL PARA DIFERENCIAR CURSO DE PIANO INDIVIDUAL VS MEGA PACK
        if (message.includes('piano')) {
            // Si menciona "mega pack" + "piano" → es el mega pack
            if (message.includes('mega pack') || message.includes('pack')) {
                console.log(`🎯 [Ultra Intelligent] Mega Pack de Piano detectado`);
                return { name: 'Mega Pack de Cursos de Piano', category: 'mega-pack-piano' };
            }
            
            // Si menciona palabras específicas del curso premium → es el curso individual
            if (message.includes('definitivo') || message.includes('profesional') || 
                message.includes('completo') || message.includes('hotmart') ||
                message.includes('80 lecciones') || message.includes('acceso de por vida')) {
                console.log(`🎯 [Ultra Intelligent] Curso Piano Individual detectado`);
                return { name: 'Curso Piano Profesional Completo', category: 'curso-piano-individual' };
            }
            
            // Si solo dice "curso de piano" sin especificar → asumir el premium individual
            if (message.includes('curso') && message.includes('piano')) {
                console.log(`🎯 [Ultra Intelligent] Curso Piano Individual detectado (por defecto)`);
                return { name: 'Curso Piano Profesional Completo', category: 'curso-piano-individual' };
            }
        }

        // Buscar coincidencias específicas primero (más específico a menos específico)
        const sortedKeys = Object.keys(courseDatabase).sort((a, b) => b.length - a.length);
        
        for (const keyword of sortedKeys) {
            if (message.includes(keyword)) {
                console.log(`🎯 [Ultra Intelligent] Curso específico detectado: "${keyword}" → ${courseDatabase[keyword].name}`);
                return courseDatabase[keyword];
            }
        }

        return null;
    }
}

export const ultraIntelligentSystem = new UltraIntelligentSystem();