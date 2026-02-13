/**
 * 🧠 SEMANTIC INTERPRETER SERVICE
 * 
 * Analiza mensajes de clientes para extraer intención real sin depender de tags.
 * Usa AI para entender contexto, detectar ambigüedad y generar interpretaciones.
 */

import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

export interface Interpretation {
  intent: string;
  confidence: number;
  productType: 'physical' | 'digital' | 'service' | 'ambiguous';
  category?: string;
  useCase?: string;
  keywords: string[];
  reasoning: string;
}

export interface IntentAnalysis {
  originalMessage: string;
  interpretations: Interpretation[];
  primaryIntent: Interpretation;
  ambiguityScore: number;
  requiresClarification: boolean;
  conversationContext?: string[];
  analyzedAt: Date;
}

export class SemanticInterpreterService {
  /**
   * Analiza un mensaje para extraer la intención del cliente
   */
  static async analyzeIntent(
    message: string,
    conversationHistory: any[],
    userId: string
  ): Promise<IntentAnalysis> {
    console.log('[SemanticInterpreter] 🧠 Analizando intención...');
    console.log(`[SemanticInterpreter] Mensaje: "${message}"`);

    try {
      // 1. Extraer keywords básicas
      const keywords = this.extractKeywords(message);
      console.log(`[SemanticInterpreter] Keywords: ${keywords.join(', ')}`);

      // 2. Obtener contexto de conversación
      const context = this.getConversationContext(conversationHistory);

      // 3. Usar AI para analizar intención
      const interpretations = await this.analyzeWithAI(message, keywords, context);

      // 4. Calcular ambigüedad
      const ambiguityScore = this.calculateAmbiguity(interpretations);
      const requiresClarification = ambiguityScore > 0.5; // Ajustado de 0.6 a 0.5

      // 5. Seleccionar intención primaria
      const primaryIntent = interpretations[0];

      console.log(`[SemanticInterpreter] ✅ Intención primaria: ${primaryIntent.intent}`);
      console.log(`[SemanticInterpreter] Ambigüedad: ${ambiguityScore.toFixed(2)} ${requiresClarification ? '(requiere clarificación)' : ''}`);

      return {
        originalMessage: message,
        interpretations,
        primaryIntent,
        ambiguityScore,
        requiresClarification,
        conversationContext: context,
        analyzedAt: new Date(),
      };
    } catch (error: any) {
      console.error('[SemanticInterpreter] ❌ Error:', error.message);
      
      // Fallback: interpretación básica
      return this.createFallbackAnalysis(message);
    }
  }

  /**
   * Refina la intención basándose en una respuesta de clarificación
   */
  static async refineIntent(
    previousAnalysis: IntentAnalysis,
    clarificationResponse: string
  ): Promise<IntentAnalysis> {
    console.log('[SemanticInterpreter] 🔄 Refinando intención con respuesta de clarificación...');

    try {
      // Combinar mensaje original con respuesta
      const combinedMessage = `${previousAnalysis.originalMessage}. ${clarificationResponse}`;
      
      // Extraer keywords de la respuesta
      const newKeywords = this.extractKeywords(clarificationResponse);
      
      // Usar AI para refinar
      const interpretations = await this.analyzeWithAI(
        combinedMessage,
        [...previousAnalysis.primaryIntent.keywords, ...newKeywords],
        previousAnalysis.conversationContext || []
      );

      // La confianza debería aumentar después de clarificación
      interpretations.forEach(interp => {
        interp.confidence = Math.min(interp.confidence + 0.2, 1.0);
      });

      const ambiguityScore = this.calculateAmbiguity(interpretations);
      const primaryIntent = interpretations[0];

      console.log(`[SemanticInterpreter] ✅ Intención refinada: ${primaryIntent.intent}`);
      console.log(`[SemanticInterpreter] Nueva confianza: ${primaryIntent.confidence.toFixed(2)}`);

      return {
        originalMessage: combinedMessage,
        interpretations,
        primaryIntent,
        ambiguityScore,
        requiresClarification: ambiguityScore > 0.6,
        conversationContext: previousAnalysis.conversationContext,
        analyzedAt: new Date(),
      };
    } catch (error: any) {
      console.error('[SemanticInterpreter] ❌ Error refinando:', error.message);
      return previousAnalysis;
    }
  }

  /**
   * Extrae keywords significativas del mensaje
   */
  private static extractKeywords(message: string): string[] {
    const stopWords = [
      'me', 'interesa', 'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
      'de', 'del', 'para', 'con', 'por', 'que', 'como', 'donde', 'cuando',
      'quiero', 'necesito', 'busco', 'tengo', 'hay', 'dame', 'puedes', 'dar',
      'qué', 'cuál', 'cuáles', 'tienes', 'tiene'
    ];

    // Correcciones ortográficas comunes
    const corrections: Record<string, string> = {
      'curzo': 'curso',
      'piyano': 'piano',
      'portatil': 'portátil',
      'compu': 'computador',
      'lapto': 'laptop',
      'teclao': 'teclado',
    };

    const words = message.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !stopWords.includes(word))
      .map(word => corrections[word] || word);

    return [...new Set(words)]; // Eliminar duplicados
  }

  /**
   * Obtiene contexto de la conversación reciente
   */
  private static getConversationContext(history: any[]): string[] {
    return history
      .slice(-4) // Últimos 4 mensajes
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content);
  }

  /**
   * Usa AI (Groq) para analizar intención
   */
  private static async analyzeWithAI(
    message: string,
    keywords: string[],
    context: string[]
  ): Promise<Interpretation[]> {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const contextInfo = context.length > 0 
      ? `\n\nCONTEXTO PREVIO:\n${context.join('\n')}` 
      : '';

    const prompt = `Eres un experto en análisis de intención de clientes en español. Analiza el siguiente mensaje y determina QUÉ está buscando realmente el cliente.

MENSAJE: "${message}"
KEYWORDS DETECTADAS: ${keywords.join(', ')}${contextInfo}

INSTRUCCIONES:
1. Identifica TODAS las posibles interpretaciones del mensaje
2. Para cada interpretación, determina:
   - La intención específica (qué busca)
   - Confianza (0-1, qué tan seguro estás)
   - Tipo de producto (physical/digital/service/ambiguous)
   - Categoría si es identificable
   - Caso de uso si se menciona
   - Razonamiento breve

EJEMPLOS DE ANÁLISIS CORRECTO:

Mensaje: "busco un teclado"
Interpretaciones:
1. Teclado de computadora (physical, confianza: 0.5) - Puede ser periférico
2. Teclado musical (physical/digital, confianza: 0.5) - Puede ser instrumento o curso

Mensaje: "Mega Pack 11"
Interpretaciones:
1. Producto específico "Mega Pack 11" (digital, confianza: 0.95) - Nombre exacto

Mensaje: "algo para trabajar"
Interpretaciones:
1. Laptop para trabajo (physical, confianza: 0.4) - Herramienta común
2. Curso de habilidades (digital, confianza: 0.3) - Aprendizaje
3. Software (digital, confianza: 0.3) - Herramienta digital

REGLAS CRÍTICAS:
- Si el mensaje menciona un nombre específico de producto → confianza alta (>0.8)
- Si el mensaje es vago ("algo", "cosa") → múltiples interpretaciones con confianza baja
- Si hay palabras ambiguas ("teclado") → múltiples interpretaciones
- SIEMPRE considera el contexto previo si existe

Responde SOLO en JSON con este formato:
{
  "interpretations": [
    {
      "intent": "descripción de la intención",
      "confidence": 0.0-1.0,
      "productType": "physical|digital|service|ambiguous",
      "category": "categoría si identificable",
      "useCase": "caso de uso si se menciona",
      "reasoning": "por qué esta interpretación"
    }
  ]
}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en análisis de intención. Respondes SOLO en JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = response.choices[0].message.content || '{}';
    
    // Extraer JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Agregar keywords a cada interpretación
    const interpretations = parsed.interpretations.map((interp: any) => ({
      ...interp,
      keywords,
    }));

    // Ordenar por confianza
    interpretations.sort((a: Interpretation, b: Interpretation) => b.confidence - a.confidence);

    return interpretations;
  }

  /**
   * Calcula el score de ambigüedad (0-1)
   */
  private static calculateAmbiguity(interpretations: Interpretation[]): number {
    if (interpretations.length === 1) {
      // Una sola interpretación con alta confianza = baja ambigüedad
      return 1 - interpretations[0].confidence;
    }

    // Múltiples interpretaciones con confianzas similares = alta ambigüedad
    const confidences = interpretations.map(i => i.confidence);
    const maxConfidence = Math.max(...confidences);
    const minConfidence = Math.min(...confidences);
    const confidenceDiff = maxConfidence - minConfidence;

    // Si la diferencia es pequeña (<0.3), hay alta ambigüedad
    if (confidenceDiff < 0.3) {
      return 0.7; // Aumentado para detectar más casos ambiguos
    }

    // Si la diferencia es mediana, ambigüedad moderada
    if (confidenceDiff < 0.5) {
      return 0.5;
    }

    // Si la diferencia es grande, hay baja ambigüedad
    return 0.2;
  }

  /**
   * Crea un análisis fallback cuando AI falla
   */
  private static createFallbackAnalysis(message: string): IntentAnalysis {
    const keywords = this.extractKeywords(message);
    
    const interpretation: Interpretation = {
      intent: `Buscar: ${message}`,
      confidence: 0.5,
      productType: 'ambiguous',
      keywords,
      reasoning: 'Análisis fallback (AI no disponible)',
    };

    return {
      originalMessage: message,
      interpretations: [interpretation],
      primaryIntent: interpretation,
      ambiguityScore: 0.7,
      requiresClarification: true,
      analyzedAt: new Date(),
    };
  }
}
