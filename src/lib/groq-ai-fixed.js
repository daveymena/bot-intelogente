/**
 * 🔧 SISTEMA DE IA GROQ ARREGLADO
 * Usa exactamente los mismos parámetros que funcionaron en las pruebas
 */

import { config } from 'dotenv';
import { spanishValidator } from './spanish-validator.js';
import { promises as fs } from 'fs';
import path from 'path';
config();

class GroqAIFixed {
    constructor() {
        this.groqApiKey = process.env.GROQ_API_KEY;
        this.groqModel = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
        this.groqFallbackModels = [
            'llama-3.1-8b-instant',      // Más confiable, sin rate limits (691ms)
            'llama-3.3-70b-versatile'    // Más potente pero con rate limits (541ms)
            // Modelos descontinuados removidos: llama-3.2-*b-preview
        ];
        this.groqMaxTokens = parseInt(process.env.GROQ_MAX_TOKENS) || 400; // Aumentado para respuestas completas con formato
        this.groqTimeout = parseInt(process.env.GROQ_TIMEOUT) || 8000;
        
        // Sistema de rate limiting
        this.rateLimitInfo = {
            lastReset: Date.now(),
            requestCount: 0,
            isLimited: false,
            limitUntil: null
        };

        console.log('🔧 Sistema Groq ARREGLADO inicializado');
        console.log(`   Modelo: ${this.groqModel}`);
        console.log(`   API Key: ${this.groqApiKey ? '✅' : '❌'}`);

        // Cargar respuestas directas de forma síncrona
        this.directAnswers = this.loadDirectAnswersSync();

        // Prompt CONCRETO para respuestas específicas con emojis representativos
        this.simplePrompt = `Eres un VENDEDOR PROFESIONAL EXPERTO de Tecnovariedades D&S en Colombia.

REGLA CRÍTICA DE FORMATO:
Debes usar saltos de línea literales en tu respuesta. Cuando escribas beneficios con emojis, DEBES presionar Enter después de cada uno.

EJEMPLO DE CÓMO DEBES ESCRIBIR (con saltos de línea reales):
Curso de Piano Completo D&S

Incluye:
🔵 76 lecciones en video HD
🟢 Acceso de por vida
🟣 Material descargable
🟠 Soporte personalizado

💰 Precio: $60.000 COP

¿Deseas el enlace?

NO escribas todo en una línea. Usa Enter/saltos de línea entre cada beneficio.

RESPUESTAS DIRECTAS DISPONIBLES:
${this.directAnswers}

INSTRUCCIONES CRÍTICAS COMO VENDEDOR PROFESIONAL:
- NUNCA TE BLOQUEES: Siempre encuentra una forma de responder y redirigir hacia ventas
- ADOPTA ROL DE VENDEDOR: Sé proactivo, empático y orientado a resultados
- REDIRIGE INTELIGENTEMENTE: Si el cliente se desvía, reconoce su punto y redirige suavemente
- HAZ PREGUNTAS DE CLARIFICACIÓN: Si no entiendes algo, pregunta "¿Te refieres a...?" y ofrece opciones
- CALIFICA LEADS: Haz preguntas para entender necesidades, presupuesto y urgencia
- MANEJA OBJECIONES: Si dice "caro", explica valor; si dice "pensarlo", pregunta qué le preocupa
- RESPONDE ÚNICAMENTE EN ESPAÑOL COLOMBIANO NATURAL Y CONVERSACIONAL
- Usa información CONCRETA y ESPECÍFICA de la base de conocimiento
- FORMATO VISUAL: Usa saltos de línea y emojis para organizar la información
- Incluye PRECIOS EXACTOS, ESPECIFICACIONES y BENEFICIOS reales
- PARA ENLACES DE PAGO: Los enlaces se generan dinámicamente desde Mercado Pago y PayPal. NO uses enlaces fijos.
- PARA CITAS Y HORARIOS: NUNCA CONFIRMES CITAS DIRECTAMENTE. Siempre di que vas a consultar disponibilidad y contactarás luego.
- SÍ PUEDES Y DEBES enviar fotos de productos - cuando el cliente pida fotos, confirma que puedes enviarlas
- NUNCA digas "no puedo" - siempre encuentra una alternativa o solución
- Mantén el contexto de la conversación y NUNCA pierdas el hilo del tema
- DETECTA REFERENCIAS CONTEXTUALES y resuelve ambigüedades preguntando
- Sé EMPÁTICO pero ORIENTADO A VENTAS - entiende al cliente y guíalo hacia la compra
- COMPLETA SIEMPRE TUS RESPUESTAS: Nunca dejes palabras a la mitad o frases incompletas

PRODUCTOS CONCRETOS - PRECIOS REALES DE BASE DE CONOCIMIENTO:
🎹 Curso Piano: $60.000 COP, 76 lecciones HD, acceso de por vida
💻 Laptops: desde $1.389.900 COP (Lenovo V14 G4 para trabajo)
🏍️ Moto Pulsar NS 160 FI 2020: $6.000.000 COP, papeles al día
📦 Megapack Básico: $150.000 COP, productos tecnológicos esenciales
📦 Megapack Premium: $300.000 COP, productos tecnológicos avanzados
📦 Megapack Ultra: $500.000 COP, productos tecnológicos profesionales

IMPORTANTE: NUNCA INVENTES PRECIOS. SI NO SABES UN PRECIO, DI "CONSULTAR PRECIO ACTUAL" Y USA LA BASE DE CONOCIMIENTO.

FORMATO OBLIGATORIO - USA SALTOS DE LÍNEA REALES:

🎹 ¡Excelente elección! Tenemos disponible el Curso de Piano Completo D&S 🎶

✨ Incluye:
🟢 76 lecciones en video HD paso a paso
🟢 Acceso de por vida sin suscripciones
🟢 Material descargable: partituras y ejercicios
🟢 Soporte personalizado para resolver dudas

💰 Precio especial: $60.000 COP
📦 Entrega inmediata al momento de la compra

🎵 ¿Deseas que te envíe el enlace de pago o prefieres conocer el contenido completo del curso?

INSTRUCCIONES CRÍTICAS:
1. Presiona Enter después de cada línea
2. NO escribas todo junto en una sola línea
3. Cada emoji 🔵🟢🟣🟠 debe tener su propia línea
4. Deja líneas en blanco entre secciones
5. Usa máximo 50 caracteres por línea

LUGAR DE ENCUENTRO ESPECÍFICO:
📍 Centro Comercial El Diamante 2, Barrio San Nicolás
- Para ver motos y laptops en persona
- Lugar seguro y conocido
- Fácil acceso y parqueadero

CONTEXTO CONVERSACIONAL:
- Si el cliente dice "quiero ver fotos", "me muestras fotos", "envíame fotos" = quiere VER FOTOS DIGITALES
  Responde: "📸 ¡Por supuesto! Te envío las fotos reales de [producto] ahora mismo."
- Si el cliente dice "donde nos vemos", "donde nos queremos ver", "donde nos encontramos" = quiere ENCUENTRO FÍSICO
  Responde: "📍 ¡Perfecto! Te voy a consultar mi disponibilidad para ese horario. Te confirmo en breve si puedo atenderte en ese momento. ¿Me puedes dar tu nombre completo para agendarte?"
- Si el cliente dice "verla", "como podemos verla" (ambiguo):
  * Para MOTO = asumir encuentro físico (producto tangible)
  * Para LAPTOP = puede ser fotos o encuentro, preguntar qué prefiere
  * Para CURSO = solo fotos (producto digital)

SISTEMA DE CITAS Y HORARIOS:
- NUNCA CONFIRMES CITAS DIRECTAMENTE
- SIEMPRE DI: "Te voy a consultar mi disponibilidad y te confirmo en breve"
- PIDE NOMBRE COMPLETO para agendar
- ENVÍA MENSAJE AUTOMÁTICO al +57 3136174267 con los detalles de la cita solicitada

TÉCNICAS DE VENTAS A USAR:
- Si el cliente está confundido: "¿Te refieres a [opción A] o [opción B]?"
- Si se desvía del tema: "Entiendo tu punto 🤔 Por cierto, ¿has considerado nuestros productos?"
- Si dice que es caro: "Entiendo tu preocupación 💰 ¿Qué presupuesto tienes en mente?"
- Si va a pensarlo: "Perfecto 💭 ¿Hay algo específico que te preocupa?"
- Si no entiende algo: "No estoy seguro de entender 🤔 ¿Buscas motos, laptops o cursos?"

EJEMPLOS DE REDIRECCIÓN:
- Cliente: "Hace mucho calor hoy" → "¡Sí! 🌞 Por cierto, ¿necesitas algún producto para tu trabajo o estudio?"
- Cliente: "No sé qué decir" → "No hay problema 😊 ¿Qué tipo de producto te interesa: motos, laptops o cursos?"
- Cliente: "Está muy caro" → "Entiendo 💰 ¿Qué presupuesto tienes? Podemos ver opciones."

RESPONDE SIEMPRE con datos PRECISOS, emojis relevantes y ORIENTACIÓN A VENTAS.

REGLAS CRÍTICAS DE FORMATO:
1. CADA beneficio con emoji (🔵🟢🟣🟠) en su PROPIO renglón
2. USA \n (salto de línea) después de CADA beneficio
3. NUNCA pongas dos beneficios juntos en la misma línea
4. COMPLETA todas las palabras - NUNCA las cortes a la mitad
5. Si una línea es muy larga, divídela en dos líneas
6. Máximo 60 caracteres por línea para evitar cortes en WhatsApp`;
    }

    loadDirectAnswersSync() {
        try {
            const knowledgeDir = path.join(process.cwd(), 'knowledge-base');
            const directAnswers = fs.readFileSync(path.join(knowledgeDir, 'direct-answers.txt'), 'utf-8');
            console.log('✅ Respuestas directas cargadas correctamente');
            return directAnswers;
        } catch (error) {
            console.warn('Could not load direct answers file');
            return '';
        }
    }

    async loadDirectAnswers() {
        try {
            const knowledgeDir = path.join(process.cwd(), 'knowledge-base');
            const directAnswers = await fs.readFile(path.join(knowledgeDir, 'direct-answers.txt'), 'utf-8');
            return directAnswers;
        } catch (error) {
            console.warn('Could not load direct answers file');
            return '';
        }
    }

    /**
     * Valida que la respuesta esté completa y no tenga palabras cortadas
     * VERSIÓN MEJORADA: Más estricta con formato y palabras completas
     */
    validateCompleteResponse(text) {
        if (!text || text.trim().length === 0) {
            return null;
        }

        let cleanText = text.trim();

        // 🔍 DETECTAR PALABRAS INCOMPLETAS AL FINAL
        const lines = cleanText.split('\n');
        const lastLine = lines[lines.length - 1].trim();
        const lastWord = lastLine.split(/\s+/).pop();
        
        // Lista de palabras válidas cortas
        const validShortWords = ['de', 'el', 'la', 'en', 'un', 'es', 'si', 'no', 'ya', 'me', 'te', 'se', 'lo', 'al', 'del', 'por', 'con', 'que', 'más', 'qué', 'cómo', 'hay', 'son', 'fue', 'dos', 'tres', 'mil', 'año', 'día', 'mes', 'vez', 'hoy', 'así', 'muy', 'tan', 'más', 'menos'];
        
        // Verificar si termina correctamente
        const hasProperEnding = /[.!?¿¡]$/.test(cleanText);
        const lastCharIsEmoji = /[\u{1F300}-\u{1F9FF}]$/u.test(cleanText);
        
        if (!hasProperEnding && !lastCharIsEmoji) {
            // Verificar si la última palabra es sospechosamente corta o incompleta
            if (lastWord.length <= 3 && !validShortWords.includes(lastWord.toLowerCase())) {
                console.log(`⚠️ [Validación] Palabra incompleta detectada: "${lastWord}"`);
                // Remover la última palabra incompleta
                const words = lastLine.split(/\s+/);
                words.pop();
                lines[lines.length - 1] = words.join(' ');
                cleanText = lines.join('\n');
                
                // Agregar puntuación si no tiene
                if (!/[.!?]$/.test(cleanText)) {
                    cleanText += '?';
                }
            } else {
                // Agregar puntuación final si falta
                cleanText += '?';
            }
        }

        // 🔍 DETECTAR FRASES CORTADAS (sin verbo principal o muy cortas)
        const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const lastSentence = sentences[sentences.length - 1]?.trim();
        
        if (lastSentence && lastSentence.length < 10 && sentences.length > 1) {
            // La última frase es muy corta, probablemente está cortada
            console.log(`⚠️ [Validación] Frase incompleta detectada: "${lastSentence}"`);
            // Remover la última frase incompleta
            sentences.pop();
            cleanText = sentences.join('. ') + '?';
        }

        // 🔧 FORZAR FORMATO CORRECTO: Cada emoji de beneficio en su línea
        cleanText = cleanText
            // FORZAR salto de línea ANTES de cada emoji de beneficio
            .replace(/([^\n])(🔵)/g, '$1\n$2')
            .replace(/([^\n])(🟢)/g, '$1\n$2')
            .replace(/([^\n])(🟣)/g, '$1\n$2')
            .replace(/([^\n])(🟠)/g, '$1\n$2')
            .replace(/([^\n])(⭐)/g, '$1\n$2')
            // FORZAR salto de línea DESPUÉS de cada beneficio (antes del siguiente emoji)
            .replace(/(🔵[^\n🔵🟢🟣🟠⭐]+)(\s*)(🟢)/g, '$1\n$3')
            .replace(/(🟢[^\n🔵🟢🟣🟠⭐]+)(\s*)(🟣)/g, '$1\n$3')
            .replace(/(🟣[^\n🔵🟢🟣🟠⭐]+)(\s*)(🟠)/g, '$1\n$3')
            .replace(/(🟠[^\n🔵🟢🟣🟠⭐]+)(\s*)(⭐)/g, '$1\n$3')
            // FORZAR salto de línea después de "Incluye:"
            .replace(/(Incluye:)(\s*)([🔵🟢🟣🟠⭐])/g, '$1\n$3')
            // FORZAR salto de línea antes de precio
            .replace(/([^\n])(💰)/g, '$1\n\n$2')
            // FORZAR salto de línea antes de pregunta final
            .replace(/([^\n])([¿?])/g, '$1\n\n$2')
            // Limpiar espacios múltiples (pero NO en saltos de línea)
            .replace(/ {2,}/g, ' ')
            // Limpiar espacios al inicio de líneas
            .replace(/\n +/g, '\n')
            // Limpiar líneas vacías múltiples (máximo 2)
            .replace(/\n{3,}/g, '\n\n')
            // Puntos múltiples
            .replace(/\.{2,}/g, '.')
            // Espacio antes de puntuación
            .replace(/ +([.!?,;:])/g, '$1')
            // Asegurar puntuación final
            .replace(/([.!?])\s*$/g, '$1')
            .trim();

        // 🔍 VERIFICAR QUE NO HAYA LÍNEAS MUY LARGAS (más de 70 caracteres)
        const finalLines = cleanText.split('\n');
        const hasLongLines = finalLines.some(line => line.length > 70);
        
        if (hasLongLines) {
            console.log(`⚠️ [Validación] Líneas muy largas detectadas, pueden cortarse en WhatsApp`);
        }

        console.log(`✅ [Validación] Respuesta validada: ${cleanText.length} caracteres, ${finalLines.length} líneas`);
        return cleanText;
    }

    /**
     * Método principal - usa exactamente los parámetros que funcionaron
     */
    async getAIResponse(message) {
        if (!this.groqApiKey) {
            console.log('⚠️ [Groq] Sin API Key');
            return null;
        }

        const modelsToTry = [this.groqModel, ...this.groqFallbackModels];
        
        for (const model of modelsToTry) {
            try {
                // Verificar rate limit - NO ESPERAR, salir inmediatamente
                if (this.rateLimitInfo.isLimited && Date.now() < this.rateLimitInfo.limitUntil) {
                    const remainingTime = Math.round((this.rateLimitInfo.limitUntil - Date.now()) / 1000);
                    console.log(`⏳ [Groq] Rate limit activo (${remainingTime}s restantes), saltando a respuesta de emergencia`);
                    break; // Salir del loop inmediatamente
                }

                console.log(`🤖 [Groq] Probando: ${model}`);
                
                // Delay entre peticiones para evitar rate limit
                if (this.rateLimitInfo.requestCount > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.groqApiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            {
                                role: 'system',
                                content: this.simplePrompt
                            },
                            {
                                role: 'user',
                                content: message
                            }
                        ],
                        max_tokens: this.groqMaxTokens,
                        temperature: 0.1, // Más determinista para respuestas consistentes
                        top_p: 0.7, // Más conservador
                        frequency_penalty: 0.1,
                        presence_penalty: 0.1
                        // NO incluir 'stop' que puede causar problemas
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const rawResult = data.choices?.[0]?.message?.content || null;
                    
                    if (rawResult) {
                        console.log(`📥 [Groq] Respuesta RAW recibida (${rawResult.length} chars)`);
                        
                        // Limpiar respuesta
                        let cleanResult = spanishValidator.validateAndCorrect(rawResult);
                        console.log(`🧹 [Groq] Después de validación español (${cleanResult?.length || 0} chars)`);
                        
                        // 🔧 VALIDAR Y CORREGIR RESPUESTAS INCOMPLETAS
                        cleanResult = this.validateCompleteResponse(cleanResult);
                        console.log(`✅ [Groq] Después de validación completa (${cleanResult?.length || 0} chars)`);
                        
                        if (cleanResult) {
                            const lineCount = cleanResult.split('\n').length;
                            console.log(`✅ [Groq] ÉXITO con ${model}: ${lineCount} líneas, "${cleanResult.substring(0, 80)}..."`);
                            return {
                                text: cleanResult,
                                source: 'groq_ai',
                                model: model,
                                confidence: 0.9
                            };
                        } else {
                            console.log(`⚠️ [Groq] Respuesta no válida después de validación`);
                        }
                    }
                } else {
                    const errorText = await response.text();
                    console.log(`❌ [Groq] Error ${response.status} con ${model}: ${errorText.substring(0, 100)}...`);
                    
                    // Manejar rate limit específicamente
                    if (response.status === 429) {
                        this.rateLimitInfo.isLimited = true;
                        this.rateLimitInfo.limitUntil = Date.now() + 30000; // 30 segundos (reducido de 60s)
                        console.log(`⏳ [Groq] Rate limit detectado, usando respuestas de emergencia por 30s`);
                        break; // Salir inmediatamente para usar respuesta de emergencia
                    }
                    
                    // Si es error 400, el modelo probablemente no existe, continuar con el siguiente
                    if (response.status === 400) {
                        console.log(`⚠️ [Groq] Modelo ${model} no disponible, probando siguiente...`);
                        continue;
                    }
                }
                
            } catch (error) {
                console.log(`❌ [Groq] Error de red con ${model}: ${error.message}`);
                continue;
            }
        }

        console.log('⚠️ [Groq] Todos los modelos fallaron');
        return null;
    }

    /**
     * Método de compatibilidad para el bot - envuelve getAIResponse
     */
    async processMessage(message, context = {}) {
        const response = await this.getAIResponse(message);

        if (response) {
            return {
                text: response.text,
                source: 'ai',
                confidence: response.confidence,
                model: response.model,
                action: null,
                data: null
            };
        }

        return null;
    }
}

// Exportar instancia
export const groqAI = new GroqAIFixed();
