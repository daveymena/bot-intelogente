/**
 * 💬 CLARIFICATION ENGINE
 * 
 * Genera preguntas específicas cuando la intención del cliente es ambigua.
 * Máximo 2 preguntas por conversación.
 */

import type { IntentAnalysis, Interpretation } from './semantic-interpreter';

export interface ClarificationQuestion {
  question: string;
  options: string[];
  type: 'use_case' | 'product_type' | 'budget' | 'specifications';
  interpretations: string[];
  expectedFormat?: 'choice' | 'text' | 'number';
}

export class ClarificationEngine {
  /**
   * Genera preguntas de clarificación basadas en el análisis de intención
   */
  static generateQuestions(
    analysis: IntentAnalysis,
    maxQuestions: number = 2
  ): ClarificationQuestion[] {
    console.log('[ClarificationEngine] 💬 Generando preguntas de clarificación...');

    const questions: ClarificationQuestion[] = [];

    // Si solo hay una interpretación con alta confianza, no preguntar
    if (analysis.interpretations.length === 1 && analysis.primaryIntent.confidence > 0.7) {
      console.log('[ClarificationEngine] ℹ️ No se necesitan preguntas (alta confianza)');
      return [];
    }

    // 1. Detectar tipo de ambigüedad
    const ambiguityType = this.detectAmbiguityType(analysis);
    console.log(`[ClarificationEngine] Tipo de ambigüedad: ${ambiguityType}`);

    // 2. Generar pregunta según el tipo
    switch (ambiguityType) {
      case 'product_type':
        questions.push(this.generateProductTypeQuestion(analysis));
        break;
      
      case 'use_case':
        questions.push(this.generateUseCaseQuestion(analysis));
        break;
      
      case 'budget':
        questions.push(this.generateBudgetQuestion(analysis));
        break;
      
      case 'specifications':
        questions.push(this.generateSpecificationsQuestion(analysis));
        break;
      
      case 'multiple':
        // Múltiples ambigüedades, priorizar
        questions.push(this.generateProductTypeQuestion(analysis));
        if (questions.length < maxQuestions) {
          questions.push(this.generateUseCaseQuestion(analysis));
        }
        break;
    }

    // Limitar a maxQuestions
    const limitedQuestions = questions.slice(0, maxQuestions);
    console.log(`[ClarificationEngine] ✅ ${limitedQuestions.length} preguntas generadas`);

    return limitedQuestions;
  }

  /**
   * Formatea preguntas para mostrar al usuario
   */
  static formatQuestionForUser(questions: ClarificationQuestion[]): string {
    if (questions.length === 0) {
      return '';
    }

    let formatted = '';

    questions.forEach((q, index) => {
      if (index > 0) formatted += '\n\n';
      
      formatted += q.question;
      
      if (q.options.length > 0) {
        formatted += '\n';
        q.options.forEach((option, i) => {
          formatted += `\n${i + 1}. ${option}`;
        });
      }
    });

    return formatted;
  }

  /**
   * Parsea la respuesta del usuario a una pregunta de clarificación
   */
  static parseUserResponse(
    response: string,
    question: ClarificationQuestion
  ): { selectedOption: string; confidence: number } {
    const responseLower = response.toLowerCase().trim();

    // 1. Intento de match directo con opciones
    for (const option of question.options) {
      if (responseLower.includes(option.toLowerCase())) {
        return {
          selectedOption: option,
          confidence: 0.9,
        };
      }
    }

    // 2. Intento de match por número
    const numberMatch = responseLower.match(/^(\d+)/);
    if (numberMatch) {
      const index = parseInt(numberMatch[1]) - 1;
      if (index >= 0 && index < question.options.length) {
        return {
          selectedOption: question.options[index],
          confidence: 0.95,
        };
      }
    }

    // 3. Match parcial (keywords)
    for (const option of question.options) {
      const optionKeywords = option.toLowerCase().split(' ');
      const matchCount = optionKeywords.filter(kw => responseLower.includes(kw)).length;
      
      if (matchCount > 0) {
        return {
          selectedOption: option,
          confidence: 0.6 + (matchCount * 0.1),
        };
      }
    }

    // 4. Fallback: usar la respuesta tal cual
    return {
      selectedOption: response,
      confidence: 0.4,
    };
  }

  /**
   * Detecta el tipo de ambigüedad principal
   */
  private static detectAmbiguityType(analysis: IntentAnalysis): string {
    const interpretations = analysis.interpretations;

    // Verificar si hay diferentes tipos de producto
    const productTypes = new Set(interpretations.map(i => i.productType));
    if (productTypes.size > 1 || productTypes.has('ambiguous')) {
      return 'product_type';
    }

    // Verificar si hay diferentes casos de uso
    const useCases = interpretations.map(i => i.useCase).filter(Boolean);
    if (useCases.length > 1) {
      return 'use_case';
    }

    // Verificar si menciona presupuesto pero no es específico
    const message = analysis.originalMessage.toLowerCase();
    if (message.includes('barato') || message.includes('económico') || message.includes('precio')) {
      return 'budget';
    }

    // Verificar si es muy vago
    const vagueTerms = ['algo', 'cosa', 'producto', 'regalo'];
    if (vagueTerms.some(term => message.includes(term))) {
      return 'use_case';
    }

    return 'multiple';
  }

  /**
   * Genera pregunta sobre tipo de producto
   */
  private static generateProductTypeQuestion(analysis: IntentAnalysis): ClarificationQuestion {
    const interpretations = analysis.interpretations.slice(0, 3); // Top 3
    
    // Casos especiales conocidos
    const message = analysis.originalMessage.toLowerCase();
    
    if (message.includes('teclado')) {
      return {
        question: '¿Buscas un teclado para escribir en la computadora o un teclado musical para tocar?',
        options: [
          'Para escribir (teclado de computadora)',
          'Para tocar música (teclado musical o curso de piano)',
        ],
        type: 'product_type',
        interpretations: interpretations.map(i => i.intent),
        expectedFormat: 'choice',
      };
    }

    // Pregunta genérica basada en interpretaciones
    const options = interpretations.map(i => {
      if (i.productType === 'physical') return 'Producto físico (laptop, moto, etc.)';
      if (i.productType === 'digital') return 'Producto digital (curso, megapack, etc.)';
      if (i.productType === 'service') return 'Servicio';
      return i.intent;
    });

    return {
      question: '¿Qué tipo de producto buscas?',
      options: [...new Set(options)], // Eliminar duplicados
      type: 'product_type',
      interpretations: interpretations.map(i => i.intent),
      expectedFormat: 'choice',
    };
  }

  /**
   * Genera pregunta sobre caso de uso
   */
  private static generateUseCaseQuestion(analysis: IntentAnalysis): ClarificationQuestion {
    const message = analysis.originalMessage.toLowerCase();

    // Casos especiales
    if (message.includes('trabajar')) {
      return {
        question: '¿Para qué tipo de trabajo lo necesitas?',
        options: [
          'Trabajo de oficina (documentos, correos)',
          'Diseño gráfico o edición',
          'Programación o desarrollo',
          'Aprender nuevas habilidades (curso)',
        ],
        type: 'use_case',
        interpretations: analysis.interpretations.map(i => i.intent),
        expectedFormat: 'choice',
      };
    }

    if (message.includes('regalo')) {
      return {
        question: '¿Para quién es el regalo? ¿Qué le gusta hacer?',
        options: [
          'Para alguien que estudia',
          'Para alguien que trabaja',
          'Para alguien que le gusta la música',
          'Para alguien que le gusta la tecnología',
        ],
        type: 'use_case',
        interpretations: analysis.interpretations.map(i => i.intent),
        expectedFormat: 'choice',
      };
    }

    if (message.includes('curso')) {
      return {
        question: '¿Qué te gustaría aprender?',
        options: [
          'Idiomas (inglés, etc.)',
          'Música (piano, guitarra, etc.)',
          'Tecnología (programación, diseño, etc.)',
          'Varios temas (megapack completo)',
        ],
        type: 'use_case',
        interpretations: analysis.interpretations.map(i => i.intent),
        expectedFormat: 'choice',
      };
    }

    // Pregunta genérica
    return {
      question: '¿Para qué lo necesitas?',
      options: [
        'Para trabajar',
        'Para estudiar',
        'Para entretenimiento',
        'Como regalo',
      ],
      type: 'use_case',
      interpretations: analysis.interpretations.map(i => i.intent),
      expectedFormat: 'choice',
    };
  }

  /**
   * Genera pregunta sobre presupuesto
   */
  private static generateBudgetQuestion(analysis: IntentAnalysis): ClarificationQuestion {
    return {
      question: '¿Cuál es tu presupuesto aproximado?',
      options: [
        'Menos de $500,000',
        'Entre $500,000 y $1,000,000',
        'Entre $1,000,000 y $2,000,000',
        'Más de $2,000,000',
      ],
      type: 'budget',
      interpretations: analysis.interpretations.map(i => i.intent),
      expectedFormat: 'choice',
    };
  }

  /**
   * Genera pregunta sobre especificaciones
   */
  private static generateSpecificationsQuestion(analysis: IntentAnalysis): ClarificationQuestion {
    const message = analysis.originalMessage.toLowerCase();

    if (message.includes('laptop') || message.includes('computador')) {
      return {
        question: '¿Qué características son importantes para ti?',
        options: [
          'Que sea rápida y potente',
          'Que tenga buena batería',
          'Que sea ligera y portátil',
          'Que tenga buen precio',
        ],
        type: 'specifications',
        interpretations: analysis.interpretations.map(i => i.intent),
        expectedFormat: 'choice',
      };
    }

    return {
      question: '¿Qué características buscas?',
      options: [],
      type: 'specifications',
      interpretations: analysis.interpretations.map(i => i.intent),
      expectedFormat: 'text',
    };
  }
}
