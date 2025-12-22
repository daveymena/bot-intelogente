/**
 * Cliente Groq para Smart Sales Bot Pro
 * Maneja la comunicación con la API de Groq con rotación automática
 */

import Groq from 'groq-sdk';

// Rotación automática de APIs Groq
const GROQ_API_KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_6,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

function getGroqClient(): Groq {
  const apiKey = GROQ_API_KEYS[currentKeyIndex] || process.env.GROQ_API_KEY || '';
  return new Groq({ apiKey });
}

function rotateApiKey() {
  currentKeyIndex = (currentKeyIndex + 1) % GROQ_API_KEYS.length;
  console.log(`[GroqClient] 🔄 Rotando a API key ${currentKeyIndex + 1}/${GROQ_API_KEYS.length}`);
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Envía un mensaje a Groq y obtiene respuesta con rotación automática
 */
export async function sendToGroq(
  messages: GroqMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<GroqResponse> {
  const model = options.model || process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens || parseInt(process.env.GROQ_MAX_TOKENS || '300');

  // Intentar con todas las API keys disponibles
  for (let attempt = 0; attempt < GROQ_API_KEYS.length; attempt++) {
    try {
      const groq = getGroqClient();
      
      const completion = await groq.chat.completions.create({
        messages,
        model,
        temperature,
        max_tokens: maxTokens,
      });

      console.log(`[GroqClient] ✅ Respuesta exitosa con API key ${currentKeyIndex + 1}`);

      return {
        content: completion.choices[0]?.message?.content || '',
        model: completion.model || model,
        usage: completion.usage ? {
          prompt_tokens: completion.usage.prompt_tokens || 0,
          completion_tokens: completion.usage.completion_tokens || 0,
          total_tokens: completion.usage.total_tokens || 0,
        } : undefined,
      };
    } catch (error: any) {
      console.error(`[GroqClient] ❌ Error con API key ${currentKeyIndex + 1}:`, error.message);
      
      // Si es error de rate limit, rotar a la siguiente API key
      if (error.message?.includes('rate_limit') || error.message?.includes('429')) {
        console.log('[GroqClient] 🔄 Rate limit alcanzado, rotando API key...');
        rotateApiKey();
        
        // Si no es el último intento, continuar con la siguiente key
        if (attempt < GROQ_API_KEYS.length - 1) {
          continue;
        }
      }
      
      // Si es el último intento o no es rate limit, lanzar error
      throw new Error('Error al comunicarse con Groq');
    }
  }

  throw new Error('Todas las API keys de Groq agotadas');
}

/**
 * Fallback a Ollama si Groq falla
 */
export async function sendToOllama(
  messages: GroqMessage[],
  options: {
    model?: string;
    temperature?: number;
  } = {}
): Promise<GroqResponse> {
  try {
    const ollamaEnabled = process.env.OLLAMA_ENABLED === 'true';
    
    if (!ollamaEnabled) {
      throw new Error('Ollama está desactivado');
    }

    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = options.model || process.env.OLLAMA_MODEL || 'gemma:2b';
    const timeout = parseInt(process.env.OLLAMA_TIMEOUT || '60000');
    
    console.log(`[OllamaClient] 🔄 Intentando con Ollama (${model})...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: parseInt(process.env.OLLAMA_MAX_TOKENS || '500'),
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[OllamaClient] ✅ Respuesta exitosa de Ollama');
    
    return {
      content: data.message?.content || '',
      model,
    };
  } catch (error: any) {
    console.error('[OllamaClient] ❌ Error:', error.message);
    throw new Error('Error al comunicarse con Ollama');
  }
}

/**
 * Envía mensaje con fallback automático: Ollama → Groq (con rotación) → Error
 * NUEVO: Ollama es el proveedor principal cuando USE_OLLAMA=true
 */
export async function sendWithFallback(
  messages: GroqMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<GroqResponse> {
  const fallbackEnabled = process.env.AI_FALLBACK_ENABLED !== 'false';
  const useOllama = process.env.USE_OLLAMA === 'true';

  // 🆕 SI USE_OLLAMA=true, usar Ollama como proveedor principal
  if (useOllama) {
    try {
      console.log('[AI] 🤖 Usando Ollama como proveedor principal...');
      return await sendToOllama(messages, options);
    } catch (ollamaError: any) {
      console.error('[AI] ❌ Ollama falló:', ollamaError.message);
      
      // Si el fallback está desactivado, lanzar error
      if (!fallbackEnabled) {
        throw new Error('Servicio de IA no disponible (fallback desactivado)');
      }

      // Intentar con Groq como fallback
      try {
        console.log('[AI] 🔄 Ollama falló, intentando con Groq...');
        return await sendToGroq(messages, options);
      } catch (groqError: any) {
        console.error('[AI] ❌ Groq también falló:', groqError.message);
        
        // Respuesta estática de emergencia
        console.log('[AI] 🆘 Usando respuesta estática de emergencia');
        return {
          content: 'Disculpa, estoy teniendo problemas técnicos temporales. ¿Podrías intentar de nuevo en un momento? 🙏',
          model: 'fallback-static',
        };
      }
    }
  }

  // Flujo original: Groq primero (cuando USE_OLLAMA=false)
  try {
    console.log('[AI] 🚀 Usando Groq como proveedor primario...');
    return await sendToGroq(messages, options);
  } catch (groqError: any) {
    console.error('[AI] ❌ Groq falló:', groqError.message);
    
    // Si el fallback está desactivado, lanzar error
    if (!fallbackEnabled) {
      throw new Error('Servicio de IA no disponible (fallback desactivado)');
    }

    // Intentar con Ollama como fallback
    try {
      console.log('[AI] 🔄 Groq falló, intentando con Ollama...');
      return await sendToOllama(messages, options);
    } catch (ollamaError: any) {
      console.error('[AI] ❌ Ollama también falló:', ollamaError.message);
      
      // Respuesta estática de emergencia
      console.log('[AI] 🆘 Usando respuesta estática de emergencia');
      return {
        content: 'Disculpa, estoy teniendo problemas técnicos temporales. ¿Podrías intentar de nuevo en un momento? 🙏',
        model: 'fallback-static',
      };
    }
  }
}

/**
 * Obtiene estadísticas de uso de APIs
 */
export function getApiStats() {
  return {
    currentKeyIndex,
    totalKeys: GROQ_API_KEYS.length,
    currentKey: `...${GROQ_API_KEYS[currentKeyIndex]?.slice(-8)}`,
  };
}
