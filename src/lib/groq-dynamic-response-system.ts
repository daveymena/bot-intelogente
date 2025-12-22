/**
 * ⚡ GROQ DYNAMIC RESPONSE SYSTEM - VERSIÓN SIMPLIFICADA
 * 
 * Usa Groq para generar respuestas dinámicas en TIEMPO REAL.
 */

import { Product } from '@prisma/client';
import { DynamicValueGenerator } from './dynamic-value-generator';

interface GroqDynamicResponse {
  text: string;
  confidence: number;
  technique: string;
  generationTime: number;
}

export class GroqDynamicResponseSystem {
  private static readonly API_KEYS = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_6
  ].filter(Boolean) as string[];

  private static currentKeyIndex = 0;

  /**
   * Generar descripción dinámica con Groq (TIEMPO REAL)
   */
  static async generateDynamic(params: {
    product: Product;
    userContext?: {
      useCase?: string;
      budget?: number;
    };
  }): Promise<GroqDynamicResponse> {
    const startTime = Date.now();
    const { product, userContext } = params;

    console.log(`⚡ [GROQ] Generando descripción para ${product.name}`);

    try {
      const prompt = this.buildPrompt(product, userContext);
      const response = await this.callGroq(prompt);
      const generationTime = Date.now() - startTime;

      console.log(`✅ [GROQ] Generado en ${generationTime}ms`);

      return {
        text: response,
        confidence: 0.9,
        technique: 'groq_dynamic',
        generationTime
      };
    } catch (error) {
      console.error('[GROQ] Error:', error);
      
      // Fallback a generación local
      console.log('⚠️ [GROQ] Usando fallback local');
      const localResponse = await DynamicValueGenerator.generateDynamic({ product });
      
      return {
        text: localResponse.text,
        confidence: 0.85,
        technique: 'local_fallback',
        generationTime: Date.now() - startTime
      };
    }
  }

  /**
   * Construir prompt para Groq
   */
  private static buildPrompt(product: Product, userContext?: any): string {
    const useCase = userContext?.useCase || 'general';
    const budget = userContext?.budget;

    let contextInfo = '';
    if (useCase !== 'general') {
      contextInfo += `\nUSO: ${useCase}`;
    }
    if (budget) {
      contextInfo += `\nPRESUPUESTO: $${budget.toLocaleString('es-CO')} COP`;
    }

    return `
Eres un vendedor experto que crea descripciones ÚNICAS y PERSUASIVAS.

PRODUCTO:
- Nombre: ${product.name}
- Precio: $${product.price.toLocaleString('es-CO')} COP
- Categoría: ${product.category}
- Descripción: ${product.description || 'N/A'}
${contextInfo}

INSTRUCCIONES:
1. Crea una descripción ÚNICA (nunca la misma)
2. Conecta EMOCIONALMENTE con el cliente
3. Haz que sienta que resuelve SU problema
4. Usa lenguaje natural y conversacional
5. Máximo 3 emojis
6. Resalta el VALOR, no solo características
7. Termina con pregunta o CTA
8. Máximo 150 palabras

GENERA UNA DESCRIPCIÓN ÚNICA:
    `.trim();
  }

  /**
   * Llamar a Groq
   */
  private static async callGroq(prompt: string): Promise<string> {
    if (this.API_KEYS.length === 0) {
      throw new Error('No Groq API keys available');
    }

    const apiKey = this.API_KEYS[this.currentKeyIndex];
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en copywriting de ventas.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.9,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        // Rotar a siguiente API key
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.API_KEYS.length;
        throw new Error(`Groq error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      // Rotar a siguiente API key
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.API_KEYS.length;
      throw error;
    }
  }
}
