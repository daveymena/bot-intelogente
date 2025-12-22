/**
 * 🤖 GROQ SERVICE - Wrapper simplificado
 * Usa el GroqAPIRotator para rotación automática
 */

import { GroqAPIRotator } from './groq-api-rotator';

export class GroqService {
  /**
   * Genera respuesta usando Groq con rotación automática de APIs
   */
  static async generateResponse(params: {
    systemPrompt: string;
    messages: Array<{ role: string; content: string }>;
  }): Promise<{ text: string; confidence: number } | null> {
    try {
      const allMessages = [
        { role: 'system', content: params.systemPrompt },
        ...params.messages
      ];

      const response = await GroqAPIRotator.makeRequest(allMessages, {
        temperature: 0.7,
        maxTokens: 500
      });

      return {
        text: response,
        confidence: 0.9
      };
    } catch (error) {
      console.error('[GroqService] Error:', error);
      return null;
    }
  }
}
