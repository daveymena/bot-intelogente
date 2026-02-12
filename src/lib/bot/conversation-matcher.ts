/**
 * Sistema de Matching de Conversaciones
 * Encuentra la mejor plantilla para responder según el mensaje del usuario
 */

import { conversationTemplates, type ConversationTemplate } from './conversation-templates';

export interface MatchResult {
  template: ConversationTemplate;
  confidence: number;
  matchedTrigger?: string;
}

export class ConversationMatcher {
  /**
   * Encuentra la mejor plantilla para un mensaje
   */
  static findBestMatch(message: string): MatchResult | null {
    const normalizedMessage = this.normalizeText(message);
    const words = normalizedMessage.split(' ');
    
    let bestMatch: MatchResult | null = null;
    let highestScore = 0;

    for (const template of conversationTemplates) {
      // Skip fallback templates in first pass
      if (template.category === 'fallback') continue;

      const score = this.calculateMatchScore(normalizedMessage, words, template);
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = {
          template,
          confidence: score,
          matchedTrigger: this.findMatchedTrigger(normalizedMessage, template.trigger)
        };
      }
    }

    // If no good match found, use fallback
    if (!bestMatch || highestScore < 0.3) {
      const fallback = conversationTemplates.find(t => t.id === 'fallback_general');
      if (fallback) {
        return {
          template: fallback,
          confidence: 0.5,
        };
      }
    }

    return bestMatch;
  }

  /**
   * Calcula el score de coincidencia entre mensaje y plantilla
   */
  private static calculateMatchScore(
    normalizedMessage: string,
    words: string[],
    template: ConversationTemplate
  ): number {
    let score = 0;
    let matchCount = 0;

    for (const trigger of template.trigger) {
      const normalizedTrigger = this.normalizeText(trigger);
      
      // Exact phrase match (highest score)
      if (normalizedMessage.includes(normalizedTrigger)) {
        score += 1.0;
        matchCount++;
        continue;
      }

      // Partial word match
      const triggerWords = normalizedTrigger.split(' ');
      const matchingWords = triggerWords.filter(tw => 
        words.some(w => w.includes(tw) || tw.includes(w))
      );

      if (matchingWords.length > 0) {
        const partialScore = matchingWords.length / triggerWords.length;
        score += partialScore * 0.7;
        matchCount++;
      }

      // Fuzzy match for typos
      if (this.fuzzyMatch(normalizedMessage, normalizedTrigger)) {
        score += 0.5;
        matchCount++;
      }
    }

    // Normalize score by number of triggers
    return matchCount > 0 ? score / template.trigger.length : 0;
  }

  /**
   * Encuentra qué trigger específico coincidió
   */
  private static findMatchedTrigger(message: string, triggers: string[]): string | undefined {
    for (const trigger of triggers) {
      if (message.includes(this.normalizeText(trigger))) {
        return trigger;
      }
    }
    return triggers[0];
  }

  /**
   * Normaliza texto para comparación
   */
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[¿?¡!.,;:]/g, '') // Remove punctuation
      .trim();
  }

  /**
   * Fuzzy matching para detectar typos
   */
  private static fuzzyMatch(text: string, pattern: string): boolean {
    const threshold = 0.8;
    const distance = this.levenshteinDistance(text, pattern);
    const maxLength = Math.max(text.length, pattern.length);
    const similarity = 1 - distance / maxLength;
    return similarity >= threshold;
  }

  /**
   * Calcula distancia de Levenshtein
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Obtiene plantillas por categoría
   */
  static getTemplatesByCategory(category: string): ConversationTemplate[] {
    return conversationTemplates.filter(t => t.category === category);
  }

  /**
   * Busca plantillas que requieren intervención humana
   */
  static requiresHumanIntervention(templateId: string): boolean {
    const template = conversationTemplates.find(t => t.id === templateId);
    return template?.requiresHuman || false;
  }
}
