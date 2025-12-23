import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

export interface AIDecision {
  action: 'show_product' | 'show_payment' | 'handle_objection' | 'answer_question' | 'greet' | 'farewell' | 'general_inquiry';
  selectedProductIndex: number | null; // Usaremos índice para ser más robustos
  reasoning: string;
  emotionalTone: 'enthusiastic' | 'cautious' | 'skeptical' | 'neutral';
  additionalContext: string;
}

/**
 * Analiza el mensaje con IA (Ollama primero, Groq como fallback)
 */
export async function analyzeWithAI(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>,
  availableProducts: any[]
): Promise<AIDecision> {
  
  const productsList = availableProducts.map((p, index) => 
    `${index}. ${p.name} ($${p.price} COP): ${p.description?.substring(0, 150)}...`
  ).join('\n');

  const prompt = `Eres un experto asesor de ventas de "Tecnovariedades D&S". Tu objetivo es analizar el mensaje del cliente y decidir qué acción tomar, priorizando siempre ayudar al cliente y cerrar la venta de forma natural.

HISTORIAL DE CONVERSACIÓN:
${conversationHistory.slice(-6).map(h => `${h.role === 'user' ? 'Cliente' : 'Asistente'}: ${h.content}`).join('\n')}

MENSAJE ACTUAL DEL CLIENTE:
"${message}"

PRODUCTOS EN CATÁLOGO:
${productsList}

DECISIONES POSIBLES:
1. show_product: El cliente busca un producto, pregunta por opciones o quiere ver qué hay.
2. show_payment: El cliente explícitamente quiere pagar, pide datos de pago o dice "sí" al ofrecimiento de compra.
3. handle_objection: El cliente tiene una duda, queja o dice que es caro/necesita pensarlo.
4. answer_question: Pregunta técnica o específica que no es una compra directa.
5. greet: Es solo un saludo inicial (Hola, buenos días).
6. farewell: El cliente se despide.
7. general_inquiry: No encaja en lo anterior.

INSTRUCCIONES:
- Analiza si el cliente se refiere a un producto específico del catálogo anterior.
- Si el cliente dice "sí", "dale", "me interesa" después de que le mostraste un producto, decide 'show_payment'.
- Si el cliente responde con un método de entrega (digital, recoger, etc.), decide 'show_payment'.
- Selecciona el índice del producto si el cliente lo menciona o si estás recomendando uno.

RESPONDE ÚNICAMENTE CON UN OBJETO JSON VÁLIDO. NO incluyas explicaciones ni markdown.

JSON:
{
  "action": "show_product | show_payment | handle_objection | answer_question | greet | farewell | general_inquiry",
  "selectedProductIndex": index_of_product_or_null,
  "reasoning": "short explanation",
  "emotionalTone": "enthusiastic | cautious | skeptical | neutral",
  "additionalContext": "short greeting or transition phrase in Spanish"
}`;

  try {
    // 1. Intentar con Ollama (Local)
    console.log('🦙 Intentando analizar con Ollama...');
    const result = await queryOllama(prompt);
    if (result) return result;
  } catch (error) {
    console.log('⚠️ Ollama no disponible o falló:', (error as Error).message);
  }

  // 2. Fallback a Groq
  try {
    console.log('⚡ Fallback a Groq...');
    return await queryGroq(prompt);
  } catch (error) {
    console.error('❌ Error fatal en análisis de IA:', error);
    // Fallback de emergencia a algo que el bot pueda manejar
    return {
      action: 'general_inquiry',
      selectedProductIndex: null,
      reasoning: 'Error en IA, fallback a consulta general',
      emotionalTone: 'neutral',
      additionalContext: ''
    };
  }
}

async function queryOllama(prompt: string): Promise<AIDecision | null> {
  const url = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'gemma2:2b',
        prompt: prompt,
        stream: false,
        format: 'json'
      })
    });

    if (!response.ok) return null;
    const data: any = await response.json();
    return JSON.parse(data.response);
  } catch {
    return null;
  }
}

async function queryGroq(prompt: string): Promise<AIDecision> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    response_format: { type: 'json_object' }
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('Respuesta de Groq vacía');
  return JSON.parse(content);
}
