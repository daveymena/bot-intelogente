/**
 * Cliente Groq para Smart Sales Bot Pro
 * Maneja la comunicación con la API de Groq
 */

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

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
 * Envía un mensaje a Groq y obtiene respuesta
 */
export async function sendToGroq(
  messages: GroqMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<GroqResponse> {
  try {
    const model = options.model || process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens || 1500;

    const completion = await groq.chat.completions.create({
      messages,
      model,
      temperature,
      max_tokens: maxTokens,
    });

    return {
      content: completion.choices[0]?.message?.content || '',
      model: completion.model,
      usage: completion.usage ? {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens,
      } : undefined,
    };
  } catch (error) {
    console.error('[GroqClient] Error:', error);
    throw new Error('Error al comunicarse con Groq');
  }
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
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = options.model || process.env.OLLAMA_MODEL || 'llama3.1';
    
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.message?.content || '',
      model,
    };
  } catch (error) {
    console.error('[OllamaClient] Error:', error);
    throw new Error('Error al comunicarse con Ollama');
  }
}

/**
 * Envía mensaje con fallback automático
 */
export async function sendWithFallback(
  messages: GroqMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<GroqResponse> {
  try {
    return await sendToGroq(messages, options);
  } catch (error) {
    console.log('[AI] Groq falló, intentando con Ollama...');
    try {
      return await sendToOllama(messages, options);
    } catch (ollamaError) {
      console.error('[AI] Ambos proveedores fallaron');
      throw new Error('Servicio de IA no disponible temporalmente');
    }
  }
}
