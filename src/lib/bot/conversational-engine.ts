/**
 * 🤖 Motor Conversacional Profesional
 * Arquitectura principal del bot inteligente para ventas
 * Diseñado para conversaciones naturales, humanas y persuasivas
 */

import { z } from 'zod';
import { Groq } from 'groq-sdk';

// ============================================
// TIPOS Y ESQUEMAS
// ============================================

export interface ConversationContext {
  userId: string;
  conversationHistory: Message[];
  customerProfile: CustomerProfile;
  currentStage: SalesStage;
  metadata: Record<string, any>;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface CustomerProfile {
  name?: string;
  phone?: string;
  email?: string;
  interests: string[];
  purchaseHistory: PurchaseRecord[];
  communicationStyle?: 'formal' | 'casual';
  budget?: number;
}

export interface PurchaseRecord {
  productId: string;
  productName: string;
  date: Date;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
}

export type SalesStage = 
  | 'greeting' 
  | 'needs_analysis' 
  | 'product_discovery' 
  | 'objection_handling' 
  | 'pricing' 
  | 'closing' 
  | 'post_sale';

export interface ConversationAnalysis {
  detectedIntention: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  hasObjection: boolean;
  nextRecommendedStage: SalesStage;
  shouldOfferProduct: boolean;
  productRecommendations: string[];
}

// ============================================
// PROMPTS PROFESIONALES Y PERSUASIVOS
// ============================================

const PROFESSIONAL_PROMPTS = {
  system: `Eres un asistente de ventas profesional, experimentado y humano. Tu objetivo es:

1. **Escuchar activamente** y entender las verdaderas necesidades del cliente
2. **Ser auténtico** - habla como una persona real, no como un robot
3. **Añadir valor** - no vendas, ayuda a encontrar la solución perfecta
4. **Ser respetuoso** - honra el tiempo del cliente y su inteligencia
5. **Usar humor sutilmente** - cuando sea apropiado, para humanizar la conversación

### Principios de conversación:
- Haz preguntas abiertas para entender mejor
- Valida los sentimientos del cliente
- Usa el nombre del cliente (si lo conoces) ocasionalmente
- Adapta tu tono al estilo del cliente
- Sé honesto sobre limitaciones de productos
- Ofrece soluciones que realmente resuelvan problemas

### Estructura de respuestas:
1. Reconoce lo que dijo el cliente
2. Añade contexto o información relevante
3. Haz una pregunta o sugiere próximo paso
4. Cierra con un call-to-action suave

Recuerda: Las mejores ventas suceden cuando el cliente se siente entendido, no vendido.`,

  greeting: `Saluda de forma cálida y personal. Ejemplo:
- "¡Hola! 👋 Bienvenido. Me encantaría ayudarte a encontrar lo que buscas."
- "¡Qué tal! 😊 Dime, ¿qué te trae por aquí hoy?"

El saludo debe ser breve, genuino y abrir la puerta a que el cliente cuente sus necesidades.`,

  needsAnalysis: `Analiza profundamente lo que el cliente realmente necesita:
1. Haz preguntas sobre su situación actual
2. Entiende sus objetivos y restricciones
3. Identifica posibles problemas o frustraciones
4. Descubre su presupuesto y timeline

Usa frases como:
- "Cuéntame más sobre..."
- "¿Qué es lo más importante para ti en..."
- "¿Cuál es el principal desafío que enfrentas...?"`,

  productDiscovery: `Presenta productos de forma consultiva:
1. Conecta el producto con las necesidades identificadas
2. Destaca beneficios (no solo características)
3. Usa ejemplos reales de cómo otros se beneficiaron
4. Invita a preguntas: "¿Tiene sentido esto para ti?"`,

  objectionHandling: `Cuando el cliente tenga objeciones:
1. Escucha completa y valida el concernimiento
2. No argumentes - entiende el miedo o duda real
3. Ofrece información que aborde específicamente la objeción
4. Presenta alternativas si es apropiado
5. Pregunta: "¿Esto resuelve tu preocupación?"`,

  pricing: `Al hablar de precios:
1. Enfatiza el valor y ROI, no solo el costo
2. Compara con el costo de no actuar
3. Ofrece opciones flexibles (paquetes, planes)
4. Destaca garantías o protecciones
5. Cierra con: "¿Podemos seguir adelante?"`,

  closing: `Para cerrar la venta:
1. Resume los beneficios acordados
2. Confirma que es el momento adecuado
3. Ofrece los pasos siguientes claros
4. Facilita la acción (links, botones, contacto)
5. Expresa entusiasmo genuino`,
};

// ============================================
// MOTOR CONVERSACIONAL PRINCIPAL
// ============================================

export class ConversationalEngine {
  private groqClient: Groq;
  private model: string = 'mixtral-8x7b-32768';

  constructor(apiKey: string, model?: string) {
    this.groqClient = new Groq({ apiKey });
    if (model) this.model = model;
  }

  /**
   * Analiza el mensaje del cliente y determina su intención
   */
  async analyzeConversation(
    context: ConversationContext
  ): Promise<ConversationAnalysis> {
    const lastMessage = context.conversationHistory[
      context.conversationHistory.length - 1
    ];

    const analysisPrompt = `Analiza este mensaje de cliente y proporciona un análisis JSON:

Mensaje: "${lastMessage.content}"
Historial previo: ${this._formatHistory(context.conversationHistory.slice(-3))}

Proporciona un JSON con:
{
  "intention": "string - intención detectada (greeting, product_inquiry, price_check, objection, purchase_ready, etc)",
  "sentiment": "positive|neutral|negative",
  "hasObjection": boolean,
  "nextStage": "SalesStage",
  "shouldOffer": boolean,
  "products": ["array de IDs de productos relevantes"]
}`;

    const response = await this.groqClient.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: 'Eres un analizador de intenciones de conversación. Responde solo con JSON válido.' },
        { role: 'user', content: analysisPrompt },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    try {
      const analysisText = response.choices[0]?.message?.content || '{}';
      const analysis = JSON.parse(analysisText);
      return {
        detectedIntention: analysis.intention || 'unknown',
        sentiment: analysis.sentiment || 'neutral',
        hasObjection: analysis.hasObjection || false,
        nextRecommendedStage: analysis.nextStage || 'product_discovery',
        shouldOfferProduct: analysis.shouldOffer || false,
        productRecommendations: analysis.products || [],
      };
    } catch {
      return {
        detectedIntention: 'unknown',
        sentiment: 'neutral',
        hasObjection: false,
        nextRecommendedStage: 'product_discovery',
        shouldOfferProduct: false,
        productRecommendations: [],
      };
    }
  }

  /**
   * Genera una respuesta profesional y humana
   */
  async generateResponse(
    context: ConversationContext,
    analysis: ConversationAnalysis
  ): Promise<string> {
    const systemPrompt = this._buildSystemPrompt(context, analysis);
    const messages = this._buildMessages(context, analysis);

    const response = await this.groqClient.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || 'Disculpa, tuve un problema. ¿Podrías repetir tu pregunta?';
  }

  /**
   * Detección de cambios de etapa en el pipeline de ventas
   */
  updateSalesStage(
    currentStage: SalesStage,
    analysis: ConversationAnalysis,
    context: ConversationContext
  ): SalesStage {
    const messageCount = context.conversationHistory.length;

    // Lógica inteligente de transiciones de etapa
    const transitions: Record<SalesStage, SalesStage[]> = {
      greeting: ['needs_analysis'],
      needs_analysis: ['product_discovery', 'pricing'],
      product_discovery: ['objection_handling', 'pricing', 'closing'],
      objection_handling: ['product_discovery', 'pricing', 'closing'],
      pricing: ['closing', 'objection_handling'],
      closing: ['post_sale', 'needs_analysis'],
      post_sale: ['post_sale'],
    };

    // Si el análisis recomienda una etapa diferente y es una transición válida
    if (
      transitions[currentStage].includes(analysis.nextRecommendedStage) &&
      this._shouldTransition(context)
    ) {
      return analysis.nextRecommendedStage;
    }

    return currentStage;
  }

  /**
   * Construye el prompt de sistema dinámicamente según la etapa
   */
  private _buildSystemPrompt(
    context: ConversationContext,
    analysis: ConversationAnalysis
  ): string {
    let prompt = PROFESSIONAL_PROMPTS.system + '\n\n';

    // Añade contexto específico según la etapa
    const stagePrompt = PROFESSIONAL_PROMPTS[context.currentStage as keyof typeof PROFESSIONAL_PROMPTS];
    if (stagePrompt) {
      prompt += `### Contexto de la etapa actual (${context.currentStage}):\n${stagePrompt}\n\n`;
    }

    // Personalización según el cliente
    if (context.customerProfile.name) {
      prompt += `### Información del cliente:\nNombre: ${context.customerProfile.name}\n`;
      if (context.customerProfile.communicationStyle) {
        prompt += `Estilo: ${context.customerProfile.communicationStyle}\n`;
      }
    }

    // Contexto de objeciones
    if (analysis.hasObjection) {
      prompt += `\n### ¡IMPORTANTE! El cliente tiene una objeción o preocupación. Manéjala con empatía y información concreta.`;
    }

    return prompt;
  }

  /**
   * Construye el historial de mensajes para la IA
   */
  private _buildMessages(
    context: ConversationContext,
    _analysis: ConversationAnalysis
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    // Mantén un historial relevante (últimos 8 mensajes)
    const relevantHistory = context.conversationHistory.slice(-8);

    return relevantHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));
  }

  /**
   * Formato del historial para análisis
   */
  private _formatHistory(messages: Message[]): string {
    return messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');
  }

  /**
   * Determina si debe cambiar de etapa
   */
  private _shouldTransition(context: ConversationContext): boolean {
    const MESSAGES_PER_STAGE = 2;
    const messageCount = context.conversationHistory.filter(
      (m) => m.role === 'user'
    ).length;

    // Cambia cada 2 mensajes del usuario aproximadamente
    return messageCount % MESSAGES_PER_STAGE === 0;
  }
}

// ============================================
// FACTORY PARA CREAR INSTANCIAS
// ============================================

export function createConversationalEngine(apiKey: string): ConversationalEngine {
  return new ConversationalEngine(apiKey);
}
