/**
 * 📚 SERVICIO DE FAQ DE PRODUCTOS
 * 
 * Responde preguntas frecuentes sobre productos usando base de conocimiento
 * Sin necesidad de usar IA para cada pregunta
 */

import fs from 'fs';
import path from 'path';

interface FAQ {
  id: number;
  pregunta: string;
  keywords: string[];
  respuesta: string;
}

interface ProductKnowledge {
  producto: string;
  productId: string;
  categoria: string;
  precio: number;
  linkPago?: string;
  faqs: FAQ[];
  informacionAdicional?: Record<string, string>;
}

export class ProductFAQService {
  private static knowledgeBase: Map<string, ProductKnowledge> = new Map();
  private static initialized = false;

  /**
   * Inicializar base de conocimiento
   */
  static async initialize() {
    if (this.initialized) return;

    try {
      const knowledgeDir = path.join(process.cwd(), 'knowledge-base');
      
      if (!fs.existsSync(knowledgeDir)) {
        console.log('[ProductFAQ] Directorio knowledge-base no existe');
        return;
      }

      const files = fs.readdirSync(knowledgeDir).filter(f => f.endsWith('.json'));

      for (const file of files) {
        const filePath = path.join(knowledgeDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const knowledge: ProductKnowledge = JSON.parse(content);
        
        this.knowledgeBase.set(knowledge.productId.toLowerCase(), knowledge);
        console.log(`[ProductFAQ] ✅ Cargado: ${knowledge.producto}`);
      }

      this.initialized = true;
      console.log(`[ProductFAQ] ✅ Base de conocimiento inicializada con ${this.knowledgeBase.size} productos`);
    } catch (error) {
      console.error('[ProductFAQ] Error inicializando:', error);
    }
  }

  /**
   * Buscar respuesta en FAQ
   */
  static async findAnswer(
    productId: string,
    question: string
  ): Promise<{ found: boolean; answer?: string; confidence: number }> {
    await this.initialize();

    const knowledge = this.knowledgeBase.get(productId.toLowerCase());
    if (!knowledge) {
      return { found: false, confidence: 0 };
    }

    const questionLower = question.toLowerCase();
    let bestMatch: FAQ | null = null;
    let bestScore = 0;

    // Buscar en FAQs
    for (const faq of knowledge.faqs) {
      let score = 0;

      // Verificar keywords
      for (const keyword of faq.keywords) {
        if (questionLower.includes(keyword.toLowerCase())) {
          score += 2;
        }
      }

      // Verificar similitud con la pregunta
      const preguntaWords = faq.pregunta.toLowerCase().split(' ');
      for (const word of preguntaWords) {
        if (word.length > 3 && questionLower.includes(word)) {
          score += 1;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    }

    if (bestMatch && bestScore >= 2) {
      return {
        found: true,
        answer: bestMatch.respuesta,
        confidence: Math.min(bestScore / 5, 1)
      };
    }

    return { found: false, confidence: 0 };
  }

  /**
   * Obtener información adicional del producto
   */
  static async getProductInfo(productId: string): Promise<ProductKnowledge | null> {
    await this.initialize();
    return this.knowledgeBase.get(productId.toLowerCase()) || null;
  }

  /**
   * Obtener todas las FAQs de un producto
   */
  static async getAllFAQs(productId: string): Promise<FAQ[]> {
    await this.initialize();
    const knowledge = this.knowledgeBase.get(productId.toLowerCase());
    return knowledge?.faqs || [];
  }

  /**
   * Buscar producto por nombre
   */
  static async findProductByName(productName: string): Promise<ProductKnowledge | null> {
    await this.initialize();

    const nameLower = productName.toLowerCase();
    
    for (const [, knowledge] of this.knowledgeBase) {
      if (knowledge.producto.toLowerCase().includes(nameLower) ||
          nameLower.includes(knowledge.producto.toLowerCase())) {
        return knowledge;
      }
    }

    return null;
  }

  /**
   * Generar respuesta enriquecida con información del producto
   */
  static enrichAnswer(answer: string, knowledge: ProductKnowledge): string {
    let enriched = answer;

    // Agregar link de pago si la respuesta menciona pago
    if (knowledge.linkPago && 
        (answer.includes('pago') || answer.includes('comprar') || answer.includes('precio'))) {
      if (!answer.includes(knowledge.linkPago)) {
        enriched += `\n\n👉 Link de pago: ${knowledge.linkPago}`;
      }
    }

    return enriched;
  }

  /**
   * Detectar si una pregunta es sobre FAQ
   */
  static isFAQQuestion(message: string): boolean {
    const faqPatterns = [
      /\b(cómo|como)\b/i,
      /\b(qué|que)\b/i,
      /\b(cuánto|cuanto)\b/i,
      /\b(puedo|puede)\b/i,
      /\b(necesito|necesita)\b/i,
      /\b(tiene|tienen)\b/i,
      /\b(incluye|incluyen)\b/i,
      /\b(dura|duración)\b/i,
      /\b(acceso)\b/i,
      /\b(certificado)\b/i,
      /\b(garantía|garantia)\b/i,
      /\b(soporte|ayuda)\b/i,
      /\?$/
    ];

    return faqPatterns.some(pattern => pattern.test(message));
  }
}
