import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

export interface AIDecision {
  action: 'show_product' | 'show_payment' | 'payment_method_selected' | 'handle_objection' | 'answer_question' | 'greet' | 'farewell' | 'general_inquiry';
  selectedProductIndex: number | null; // Usaremos índice para ser más robustos
  reasoning: string;
  emotionalTone: 'enthusiastic' | 'cautious' | 'skeptical' | 'neutral';
  additionalContext: string;
}

/**
 * Filtra productos relevantes para reducir el tamaño del prompt
 */
function getRelevantProducts(message: string, products: any[]): any[] {
  const query = message.toLowerCase();
  const keywords = query.split(/\s+/).filter(w => w.length > 3);
  
  if (keywords.length === 0) return products.slice(0, 5); // Si no hay keywords, enviar pocos

  const scored = products.map(p => {
    let score = 0;
    const name = p.name.toLowerCase();
    keywords.forEach(k => {
      if (name.includes(k)) score += 10;
    });
    return { ...p, score };
  });

  return scored
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15); // Máximo 15 productos relevantes
}

/**
 * Analiza el mensaje con IA (Ollama)
 */
export async function analyzeWithAI(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>,
  availableProducts: any[]
): Promise<AIDecision> {
  
  // Optimización: Solo enviar productos relevantes para ahorrar tokens y tiempo
  const relevantProducts = getRelevantProducts(message, availableProducts);
  
  const productsList = relevantProducts.map((p) => {
    const originalIndex = availableProducts.findIndex(ap => ap.id === p.id);
    return `${originalIndex}. ${p.name} ($${p.price} COP)`;
  }).join('\n');

  const prompt = `Eres un experto asesor de ventas de "Tecnovariedades D&S". Tu objetivo es analizar el mensaje del cliente y decidir qué acción tomar.
RESPONDE ÚNICAMENTE CON UN OBJETO JSON VÁLIDO. NO incluyas explicaciones ni markdown.

HISTORIAL:
${conversationHistory.slice(-6).map(h => `${h.role === 'user' ? 'Cliente' : 'Asistente'}: ${h.content}`).join('\n')}

MENSAJE ACTUAL: "${message}"

CATÁLOGO RELEVANTE:
${productsList || 'No se encontraron productos específicos relacionados.'}
... (Hay otros ${availableProducts.length - relevantProducts.length} productos en el catálogo)

JSON FORMAT:
{
  "action": "show_product | show_payment | payment_method_selected | handle_objection | answer_question | greet | farewell | general_inquiry",
  "selectedProductIndex": index_of_product_or_null,
  "reasoning": "short explanation",
  "emotionalTone": "enthusiastic | cautious | skeptical | neutral",
  "additionalContext": "short greeting in Spanish"
}`;

  try {
    console.log('📡 Analizando con Ollama (Easypanel)...');
    const result = await queryOllama(prompt);
    if (result) return result;
    throw new Error('No se pudo obtener respuesta de Ollama');
  } catch (error) {
    console.error('❌ Error en análisis de IA:', (error as Error).message);
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
  const url = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 180000)

    const model = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
    console.log(`📡 [Ollama] Enviando prompt (${model})...`);
    
    const response = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: prompt,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.1,
          num_predict: 300
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.log(`❌ [Ollama] Error en respuesta: ${response.status}`);
      return null;
    }
    
    const data: any = await response.json();
    console.log(`✅ [Ollama] Respuesta recibida con éxito`);
    return JSON.parse(data.response);
  } catch (error) {
    console.error('⚠️ Error queryOllama:', error);
    return null;
  }
}
