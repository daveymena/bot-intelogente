/**
 * 📊 Generador Continuo de Datasets
 * Genera datasets de entrenamiento en segundo plano usando Ollama
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const GENERATION_INTERVAL = 1000 * 60 * 60 * 2; // 2 horas
const OUTPUT_DIR = path.join(process.cwd(), 'data', 'training', 'auto-generated');

export class DatasetGeneratorService {
  private isRunning = false;
  private generationTimer: NodeJS.Timeout | null = null;
  private totalGenerated = 0;

  async start() {
    if (this.isRunning) return;

    console.log('📊 Iniciando generador continuo de datasets...');
    this.isRunning = true;

    // Crear directorio si no existe
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Primera generación
    await this.generateBatch();

    // Programar generaciones periódicas
    this.generationTimer = setInterval(async () => {
      await this.generateBatch();
    }, GENERATION_INTERVAL);

    console.log(`✅ Generador activo (cada ${GENERATION_INTERVAL / 3600000} horas)`);
  }

  stop() {
    if (this.generationTimer) {
      clearInterval(this.generationTimer);
      this.generationTimer = null;
    }
    this.isRunning = false;
    console.log('🛑 Generador de datasets detenido');
  }

  private async generateBatch() {
    try {
      console.log('\n📝 Generando nuevo batch de conversaciones...');

      const productos = await prisma.product.findMany({
        where: { status: 'AVAILABLE' },
        take: 10,
        orderBy: { updatedAt: 'desc' }
      });

      if (productos.length === 0) {
        console.log('⚠️ No hay productos disponibles');
        return;
      }

      const conversations = [];
      const tipos = ['busqueda', 'precio', 'caracteristicas', 'comparacion', 'disponibilidad'];

      for (const producto of productos) {
        for (const tipo of tipos) {
          const conv = await this.generateConversation(producto, tipo);
          if (conv) {
            conversations.push(conv);
            this.totalGenerated++;
          }
          await this.sleep(500); // Pausa entre generaciones
        }
      }

      // Guardar batch
      const filename = `batch_${Date.now()}.json`;
      const filepath = path.join(OUTPUT_DIR, filename);
      fs.writeFileSync(filepath, JSON.stringify(conversations, null, 2));

      console.log(`✅ Batch generado: ${conversations.length} conversaciones en ${filename}`);
      console.log(`📊 Total generado: ${this.totalGenerated} conversaciones`);

    } catch (error) {
      console.error('❌ Error generando batch:', error);
    }
  }

  private async generateConversation(producto: any, tipo: string) {
    try {
      let userMessage = '';
      let systemPrompt = '';

      switch (tipo) {
        case 'busqueda':
          userMessage = this.generateSearchQuery(producto);
          systemPrompt = `Eres vendedor de Tecnovariedades D&S.
Cliente busca: ${producto.name}
Precio: $${producto.price.toLocaleString('es-CO')}
Responde amigable en 2-3 líneas.`;
          break;

        case 'precio':
          userMessage = `Cuánto cuesta ${producto.name.toLowerCase()}`;
          systemPrompt = `Eres vendedor de Tecnovariedades D&S.
Producto: ${producto.name}
Precio: $${producto.price.toLocaleString('es-CO')}
Da el precio de forma amigable.`;
          break;

        case 'caracteristicas':
          userMessage = `Qué características tiene ${producto.name.toLowerCase()}`;
          systemPrompt = `Eres vendedor de Tecnovariedades D&S.
Producto: ${producto.name}
Descripción: ${producto.description || 'Producto de calidad'}
Describe características en 2-3 líneas.`;
          break;

        case 'comparacion':
          userMessage = `Es bueno ${producto.name.toLowerCase()}`;
          systemPrompt = `Eres vendedor de Tecnovariedades D&S.
Producto: ${producto.name}
Precio: $${producto.price.toLocaleString('es-CO')}
Explica por qué es buena opción en 2-3 líneas.`;
          break;

        case 'disponibilidad':
          userMessage = `Tienen disponible ${producto.name.toLowerCase()}`;
          systemPrompt = `Eres vendedor de Tecnovariedades D&S.
Producto: ${producto.name}
Confirma disponibilidad de forma amigable.`;
          break;
      }

      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma2:2b',
          prompt: systemPrompt,
          stream: false,
          options: {
            temperature: 0.8,
            num_predict: 150
          }
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) return null;

      const data = await response.json();
      const botResponse = data.response?.trim();

      if (!botResponse || botResponse.length < 10) return null;

      return {
        id: `${tipo}_${producto.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        category: `producto_${tipo}`,
        messages: [
          { role: 'user', content: userMessage },
          { role: 'assistant', content: botResponse }
        ],
        metadata: {
          intent: tipo,
          products: [producto.id],
          productName: producto.name,
          timestamp: new Date().toISOString(),
          autoGenerated: true
        }
      };

    } catch (error) {
      return null;
    }
  }

  private generateSearchQuery(producto: any): string {
    const templates = [
      `Busco ${producto.name.toLowerCase()}`,
      `Necesito ${producto.name.toLowerCase()}`,
      `Tienes ${producto.name.toLowerCase()}`,
      `Me interesa ${producto.name.toLowerCase()}`,
      `Quiero comprar ${producto.name.toLowerCase()}`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      isRunning: this.isRunning,
      totalGenerated: this.totalGenerated,
      outputDir: OUTPUT_DIR
    };
  }
}

export const datasetGenerator = new DatasetGeneratorService();
