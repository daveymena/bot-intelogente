/**
 * 🎓 Sistema de Entrenamiento Automático 24/7
 * Genera preguntas aleatorias, Ollama responde, y guarda para uso futuro
 * Funciona como fallback cuando Groq se queda sin tokens
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma2:2b';
const TRAINING_DIR = path.join(process.cwd(), 'data', 'trained-responses');

// Plantillas de preguntas para generar variaciones
const QUESTION_TEMPLATES = {
  saludo: [
    'Hola', 'Buenos días', 'Buenas tardes', 'Buenas noches', 'Qué tal',
    'Hola, cómo estás', 'Buenas', 'Hola buenos días', 'Hola buenas tardes'
  ],
  busqueda_producto: [
    'Busco {producto}', 'Necesito {producto}', 'Tienes {producto}',
    'Me interesa {producto}', 'Quiero comprar {producto}',
    'Venden {producto}', 'Tienen {producto}', 'Dónde consigo {producto}',
    'Me gustaría {producto}', 'Quisiera {producto}'
  ],
  precio: [
    'Cuánto cuesta {producto}', 'Qué precio tiene {producto}',
    'Cuál es el valor de {producto}', 'A cuánto está {producto}',
    'Precio de {producto}', 'Valor de {producto}',
    'Cuánto vale {producto}', 'Cuánto me sale {producto}'
  ],
  caracteristicas: [
    'Qué características tiene {producto}', 'Cómo es {producto}',
    'Qué incluye {producto}', 'Qué trae {producto}',
    'Cuéntame sobre {producto}', 'Información de {producto}',
    'Detalles de {producto}', 'Especificaciones de {producto}'
  ],
  disponibilidad: [
    'Tienen disponible {producto}', 'Hay {producto}',
    'Está disponible {producto}', 'Tienen en stock {producto}',
    'Hay existencias de {producto}', 'Tienen {producto} disponible'
  ],
  comparacion: [
    'Es bueno {producto}', 'Recomiendas {producto}',
    'Vale la pena {producto}', 'Qué tal es {producto}',
    'Es de calidad {producto}', 'Funciona bien {producto}'
  ],
  pago: [
    'Cómo puedo pagar', 'Qué métodos de pago tienen',
    'Aceptan Nequi', 'Puedo pagar con tarjeta',
    'Tienen contraentrega', 'Aceptan Daviplata',
    'Formas de pago', 'Cómo se paga'
  ],
  envio: [
    'Hacen envíos', 'Cuánto demora el envío',
    'Envían a domicilio', 'Costo de envío',
    'Cuánto tarda en llegar', 'Hacen entregas'
  ],
  garantia: [
    'Tiene garantía', 'Cuánto dura la garantía',
    'Qué cubre la garantía', 'Hay garantía',
    'Política de devolución', 'Puedo devolver'
  ]
};

interface TrainedResponse {
  id: string;
  question: string;
  answer: string;
  context: string;
  productId?: string;
  productName?: string;
  confidence: number;
  generatedAt: string;
  usageCount: number;
  successRate: number;
}

export class AutoTrainingSystem {
  private isTraining = false;
  private trainingStats = {
    totalGenerated: 0,
    successfulResponses: 0,
    failedResponses: 0,
    startTime: null as Date | null,
    lastTrainingTime: null as Date | null
  };

  /**
   * Inicia el entrenamiento continuo 24/7
   */
  async startContinuousTraining() {
    if (this.isTraining) {
      console.log('⚠️ El entrenamiento ya está en ejecución');
      return;
    }

    console.log('\n🎓 INICIANDO SISTEMA DE ENTRENAMIENTO 24/7');
    console.log('=' .repeat(60));
    console.log('📊 Objetivo: Generar base de conocimiento local completa');
    console.log('🤖 Motor: Ollama (sin límites de tokens)');
    console.log('💾 Almacenamiento: Base de datos + archivos JSON');
    console.log('🔄 Modo: Continuo hasta completar entrenamiento');
    console.log('=' .repeat(60) + '\n');

    this.isTraining = true;
    this.trainingStats.startTime = new Date();

    // Crear directorio si no existe
    if (!fs.existsSync(TRAINING_DIR)) {
      fs.mkdirSync(TRAINING_DIR, { recursive: true });
    }

    // Verificar Ollama
    const ollamaOk = await this.checkOllama();
    if (!ollamaOk) {
      console.error('❌ Ollama no está disponible. Ejecuta: ollama serve');
      this.isTraining = false;
      return;
    }

    console.log('✅ Ollama conectado\n');

    // Ciclo de entrenamiento continuo
    while (this.isTraining) {
      try {
        await this.trainBatch();
        
        // Pausa entre batches (30 segundos)
        await this.sleep(30000);
        
      } catch (error) {
        console.error('❌ Error en batch de entrenamiento:', error);
        await this.sleep(60000); // Pausa más larga si hay error
      }
    }
  }

  /**
   * Detiene el entrenamiento
   */
  stopTraining() {
    console.log('\n🛑 Deteniendo entrenamiento...');
    this.isTraining = false;
    this.printStats();
  }

  /**
   * Entrena un batch de conversaciones
   */
  private async trainBatch() {
    console.log(`\n📝 Batch ${Math.floor(this.trainingStats.totalGenerated / 50) + 1}`);
    console.log('-'.repeat(60));

    // 1. Entrenar saludos y preguntas generales
    await this.trainGeneralQuestions();

    // 2. Entrenar con productos reales
    await this.trainProductQuestions();

    // 3. Guardar progreso
    await this.saveProgress();

    this.trainingStats.lastTrainingTime = new Date();
    
    console.log(`✅ Batch completado - Total: ${this.trainingStats.totalGenerated} respuestas`);
  }

  /**
   * Entrena preguntas generales (saludos, pagos, envíos, etc.)
   */
  private async trainGeneralQuestions() {
    const generalContexts = ['saludo', 'pago', 'envio', 'garantia'];

    for (const context of generalContexts) {
      const questions = QUESTION_TEMPLATES[context as keyof typeof QUESTION_TEMPLATES];
      if (!questions) continue;

      for (const question of questions) {
        const response = await this.generateResponse(question, context);
        if (response) {
          await this.saveTrainedResponse(response);
          this.trainingStats.successfulResponses++;
          process.stdout.write('✓');
        } else {
          this.trainingStats.failedResponses++;
          process.stdout.write('✗');
        }
        this.trainingStats.totalGenerated++;
        
        await this.sleep(300); // Pausa corta entre preguntas
      }
      console.log(` ${context}`);
    }
  }

  /**
   * Entrena preguntas sobre productos
   */
  private async trainProductQuestions() {
    // Obtener productos aleatorios
    const productos = await prisma.product.findMany({
      where: { status: 'AVAILABLE' },
      take: 5,
      orderBy: { updatedAt: 'desc' }
    });

    if (productos.length === 0) return;

    const productContexts = ['busqueda_producto', 'precio', 'caracteristicas', 'disponibilidad', 'comparacion'];

    for (const producto of productos) {
      for (const context of productContexts) {
        const templates = QUESTION_TEMPLATES[context as keyof typeof QUESTION_TEMPLATES];
        if (!templates) continue;

        // Generar 2 variaciones por producto
        const selectedTemplates = this.shuffleArray(templates).slice(0, 2);

        for (const template of selectedTemplates) {
          const question = template.replace('{producto}', producto.name.toLowerCase());
          
          const response = await this.generateResponse(
            question,
            context,
            producto
          );

          if (response) {
            await this.saveTrainedResponse(response);
            this.trainingStats.successfulResponses++;
            process.stdout.write('✓');
          } else {
            this.trainingStats.failedResponses++;
            process.stdout.write('✗');
          }
          this.trainingStats.totalGenerated++;
          
          await this.sleep(500);
        }
      }
      console.log(` ${producto.name.substring(0, 30)}...`);
    }
  }

  /**
   * Genera una respuesta usando Ollama
   */
  private async generateResponse(
    question: string,
    context: string,
    product?: any
  ): Promise<TrainedResponse | null> {
    try {
      const systemPrompt = this.buildSystemPrompt(question, context, product);

      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: systemPrompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 200,
            top_p: 0.9
          }
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) return null;

      const data = await response.json();
      const answer = data.response?.trim();

      if (!answer || answer.length < 10) return null;

      return {
        id: `trained_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        question: question.toLowerCase().trim(),
        answer,
        context,
        productId: product?.id,
        productName: product?.name,
        confidence: 0.85,
        generatedAt: new Date().toISOString(),
        usageCount: 0,
        successRate: 1.0
      };

    } catch (error) {
      return null;
    }
  }

  /**
   * Construye el prompt del sistema según el contexto
   */
  private buildSystemPrompt(question: string, context: string, product?: any): string {
    let prompt = `Eres un asistente de ventas profesional de Tecnovariedades D&S en Colombia.
Respondes de forma amigable, clara y profesional en español colombiano.

Cliente pregunta: "${question}"

`;

    switch (context) {
      case 'saludo':
        prompt += `Responde el saludo de forma amigable y ofrece ayuda.
Máximo 2 líneas.`;
        break;

      case 'busqueda_producto':
        if (product) {
          prompt += `Producto: ${product.name}
Precio: $${product.price.toLocaleString('es-CO')} COP
Descripción: ${product.description || 'Producto de calidad'}

Presenta el producto de forma atractiva y menciona el precio.
Máximo 3 líneas.`;
        }
        break;

      case 'precio':
        if (product) {
          prompt += `Producto: ${product.name}
Precio: $${product.price.toLocaleString('es-CO')} COP

Da el precio de forma clara y amigable.
Máximo 2 líneas.`;
        }
        break;

      case 'caracteristicas':
        if (product) {
          prompt += `Producto: ${product.name}
Descripción: ${product.description || 'Producto de excelente calidad'}

Describe las características principales.
Máximo 3 líneas.`;
        }
        break;

      case 'disponibilidad':
        if (product) {
          prompt += `Producto: ${product.name}

Confirma disponibilidad de forma positiva.
Máximo 2 líneas.`;
        }
        break;

      case 'comparacion':
        if (product) {
          prompt += `Producto: ${product.name}
Precio: $${product.price.toLocaleString('es-CO')} COP

Explica por qué es buena opción.
Máximo 3 líneas.`;
        }
        break;

      case 'pago':
        prompt += `Métodos de pago disponibles:
- Nequi: 3136174267
- Daviplata: 3136174267
- Transferencia bancaria
- Contraentrega (según zona)
- MercadoPago
- PayPal

Explica las opciones de pago de forma clara.
Máximo 3 líneas.`;
        break;

      case 'envio':
        prompt += `Información de envíos:
- Envíos a toda Colombia
- Tiempo: 4-5 días hábiles
- Costo según ciudad
- Contraentrega disponible

Explica el proceso de envío.
Máximo 3 líneas.`;
        break;

      case 'garantia':
        prompt += `Información de garantía:
- Garantía de calidad
- Soporte post-venta
- Política de devolución

Explica la garantía de forma tranquilizadora.
Máximo 2 líneas.`;
        break;
    }

    prompt += '\n\nRespuesta:';
    return prompt;
  }

  /**
   * Guarda respuesta entrenada en la base de datos
   */
  private async saveTrainedResponse(response: TrainedResponse) {
    try {
      // Guardar en base de datos
      const existing = await prisma.conversationKnowledge.findFirst({
        where: {
          userQuery: response.question,
          productId: response.productId || null
        }
      });

      if (existing) {
        // Actualizar si ya existe
        await prisma.conversationKnowledge.update({
          where: { id: existing.id },
          data: {
            botResponse: response.answer,
            confidence: Math.min(existing.confidence + 0.05, 1.0),
            lastUsedAt: new Date()
          }
        });
      } else {
        // Crear nuevo
        await prisma.conversationKnowledge.create({
          data: {
            userQuery: response.question,
            botResponse: response.answer,
            productId: response.productId,
            productName: response.productName,
            context: response.context,
            confidence: response.confidence,
            successRate: response.successRate
          }
        });
      }
    } catch (error) {
      console.error('Error guardando respuesta:', error);
    }
  }

  /**
   * Guarda progreso en archivo JSON
   */
  private async saveProgress() {
    try {
      const filename = `training_progress_${Date.now()}.json`;
      const filepath = path.join(TRAINING_DIR, filename);

      const progress = {
        stats: this.trainingStats,
        timestamp: new Date().toISOString(),
        totalInDatabase: await prisma.conversationKnowledge.count()
      };

      fs.writeFileSync(filepath, JSON.stringify(progress, null, 2));
    } catch (error) {
      console.error('Error guardando progreso:', error);
    }
  }

  /**
   * Verifica si Ollama está disponible
   */
  private async checkOllama(): Promise<boolean> {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/tags`, {
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Imprime estadísticas
   */
  private printStats() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 ESTADÍSTICAS DE ENTRENAMIENTO');
    console.log('='.repeat(60));
    console.log(`✅ Respuestas exitosas: ${this.trainingStats.successfulResponses}`);
    console.log(`❌ Respuestas fallidas: ${this.trainingStats.failedResponses}`);
    console.log(`📝 Total generado: ${this.trainingStats.totalGenerated}`);
    
    if (this.trainingStats.startTime) {
      const duration = Date.now() - this.trainingStats.startTime.getTime();
      const hours = Math.floor(duration / 3600000);
      const minutes = Math.floor((duration % 3600000) / 60000);
      console.log(`⏱️  Tiempo de entrenamiento: ${hours}h ${minutes}m`);
    }
    
    const successRate = this.trainingStats.totalGenerated > 0
      ? (this.trainingStats.successfulResponses / this.trainingStats.totalGenerated * 100).toFixed(1)
      : 0;
    console.log(`📈 Tasa de éxito: ${successRate}%`);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Obtiene estadísticas actuales
   */
  getStats() {
    return {
      ...this.trainingStats,
      isTraining: this.isTraining
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton
export const autoTrainingSystem = new AutoTrainingSystem();
