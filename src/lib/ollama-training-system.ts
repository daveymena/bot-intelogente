/**
 * 🎓 OLLAMA TRAINING SYSTEM - VERSIÓN SIMPLIFICADA
 * 
 * Usa Ollama para generar variaciones OFFLINE (NO para chat en vivo).
 */

import { Product } from '@prisma/client';
import { db } from './db';

interface TrainingVariation {
  original: string;
  variations: string[];
  technique: string;
}

export class OllamaTrainingSystem {
  private static readonly OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  private static readonly MODEL = process.env.OLLAMA_MODEL || 'gemma2:2b';

  /**
   * Generar variaciones con Ollama (OFFLINE)
   */
  static async generateVariations(params: {
    product: Product;
    baseDescription: string;
    numVariations: number;
  }): Promise<TrainingVariation> {
    const { product, baseDescription, numVariations } = params;

    console.log(`🎓 [OLLAMA] Generando ${numVariations} variaciones para ${product.name}`);

    const variations: string[] = [];

    for (let i = 0; i < numVariations; i++) {
      const prompt = this.buildPrompt(product, baseDescription, i);
      
      try {
        const variation = await this.callOllama(prompt);
        variations.push(variation);
        
        // Guardar en BD
        await this.saveVariation(product.id, variation, i);
        
        console.log(`✅ [OLLAMA] Variación ${i + 1}/${numVariations} generada`);
      } catch (error) {
        console.error(`❌ [OLLAMA] Error en variación ${i + 1}:`, error);
      }
    }

    return {
      original: baseDescription,
      variations,
      technique: 'ollama_generated'
    };
  }

  /**
   * Construir prompt para Ollama
   */
  private static buildPrompt(product: Product, baseDescription: string, variationIndex: number): string {
    const techniques = [
      'enfócate en los beneficios emocionales',
      'usa storytelling para conectar',
      'resalta el problema que resuelve',
      'crea urgencia y escasez',
      'usa lenguaje aspiracional'
    ];

    const technique = techniques[variationIndex % techniques.length];

    return `
Eres un experto en copywriting. Reescribe esta descripción de forma ÚNICA.

PRODUCTO: ${product.name}
PRECIO: $${product.price.toLocaleString('es-CO')} COP

DESCRIPCIÓN BASE:
${baseDescription}

INSTRUCCIONES:
- ${technique}
- Máximo 3 emojis
- Máximo 150 palabras
- Lenguaje conversacional
- Termina con pregunta o CTA

GENERA VARIACIÓN ÚNICA:
    `.trim();
  }

  /**
   * Llamar a Ollama
   */
  private static async callOllama(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.MODEL,
          prompt,
          stream: false,
          options: {
            temperature: 0.9,
            top_p: 0.95,
            num_predict: 300
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response.trim();
    } catch (error) {
      console.error('[OLLAMA] Error:', error);
      throw error;
    }
  }

  /**
   * Guardar variación en BD
   */
  private static async saveVariation(productId: string, variation: string, index: number): Promise<void> {
    try {
      await db.conversationPattern.create({
        data: {
          pattern: `product_description_${productId}_v${index}`,
          intent: 'product_description',
          response: variation,
          confidence: 0.85,
          metadata: {
            productId,
            variationIndex: index,
            generatedBy: 'ollama',
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('[OLLAMA] Error guardando variación:', error);
    }
  }

  /**
   * Entrenar en batch
   */
  static async trainBatch(params: {
    maxProducts?: number;
  }): Promise<void> {
    console.log('🎓 [OLLAMA] Iniciando entrenamiento batch...');

    const { maxProducts = 10 } = params;

    const products = await db.product.findMany({
      where: {
        status: 'AVAILABLE'
      },
      take: maxProducts
    });

    console.log(`📦 [OLLAMA] Entrenando ${products.length} productos`);

    for (const product of products) {
      console.log(`\n🔄 Entrenando: ${product.name}`);

      const baseDescription = product.description || product.name;

      await this.generateVariations({
        product,
        baseDescription,
        numVariations: 5
      });

      console.log(`✅ [OLLAMA] ${product.name} completado`);
    }

    console.log('\n🎉 [OLLAMA] Entrenamiento completado');
  }

  /**
   * Obtener variación aleatoria de BD
   */
  static async getRandomVariation(productId: string): Promise<string | null> {
    try {
      const variations = await db.conversationPattern.findMany({
        where: {
          intent: 'product_description',
          metadata: {
            path: ['productId'],
            equals: productId
          }
        }
      });

      if (variations.length === 0) return null;

      const randomIndex = Math.floor(Math.random() * variations.length);
      return variations[randomIndex].response;
    } catch (error) {
      console.error('[OLLAMA] Error obteniendo variación:', error);
      return null;
    }
  }
}
