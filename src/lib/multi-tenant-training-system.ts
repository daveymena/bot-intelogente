/**
 * 🎓 Sistema de Entrenamiento Multi-Tenant
 * Cada cliente entrena con sus propios productos y servicios
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma2:2b';
const TRAINING_DIR = path.join(process.cwd(), 'data', 'trained-responses');

// Plantillas genéricas que sirven para cualquier negocio
const UNIVERSAL_TEMPLATES = {
  saludo: [
    'Hola', 'Buenos días', 'Buenas tardes', 'Buenas noches',
    'Qué tal', 'Hola, cómo estás', 'Buenas'
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

// Plantillas específicas por tipo de producto/servicio
const PRODUCT_TEMPLATES = {
  busqueda: [
    'Busco {item}', 'Necesito {item}', 'Tienes {item}',
    'Me interesa {item}', 'Quiero comprar {item}',
    'Venden {item}', 'Tienen {item}'
  ],
  precio: [
    'Cuánto cuesta {item}', 'Qué precio tiene {item}',
    'Cuál es el valor de {item}', 'A cuánto está {item}',
    'Precio de {item}', 'Cuánto vale {item}'
  ],
  caracteristicas: [
    'Qué características tiene {item}', 'Cómo es {item}',
    'Qué incluye {item}', 'Qué trae {item}',
    'Cuéntame sobre {item}', 'Información de {item}'
  ],
  disponibilidad: [
    'Tienen disponible {item}', 'Hay {item}',
    'Está disponible {item}', 'Tienen en stock {item}'
  ]
};

export class MultiTenantTrainingSystem {
  private isTraining = false;
  private userTrainingStats = new Map<string, {
    totalGenerated: number;
    successfulResponses: number;
    failedResponses: number;
    startTime: Date;
  }>();

  /**
   * Inicia entrenamiento para un usuario específico
   */
  async trainUser(userId: string) {
    console.log(`\n🎓 Iniciando entrenamiento para usuario: ${userId}`);

    // Obtener configuración del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        botSettings: true,
        salesFlowConfig: true,
        storeSettings: true
      }
    });

    if (!user) {
      console.error('❌ Usuario no encontrado');
      return;
    }

    // Inicializar stats
    if (!this.userTrainingStats.has(userId)) {
      this.userTrainingStats.set(userId, {
        totalGenerated: 0,
        successfulResponses: 0,
        failedResponses: 0,
        startTime: new Date()
      });
    }

    // Entrenar preguntas generales
    await this.trainGeneralQuestions(userId, user);

    // Entrenar con productos del usuario
    await this.trainUserProducts(userId, user);

    console.log(`✅ Entrenamiento completado para ${userId}`);
  }

  /**
   * Inicia entrenamiento continuo para todos los usuarios activos
   */
  async startContinuousTraining() {
    if (this.isTraining) {
      console.log('⚠️ El entrenamiento ya está en ejecución');
      return;
    }

    console.log('\n🎓 SISTEMA DE ENTRENAMIENTO MULTI-TENANT 24/7');
    console.log('='.repeat(60));
    this.isTraining = true;

    // Verificar Ollama
    const ollamaOk = await this.checkOllama();
    if (!ollamaOk) {
      console.error('❌ Ollama no disponible');
      this.isTraining = false;
      return;
    }

    console.log('✅ Ollama conectado\n');

    // Ciclo continuo
    while (this.isTraining) {
      try {
        // Obtener usuarios activos con suscripción válida
        const activeUsers = await prisma.user.findMany({
          where: {
            isActive: true,
            subscriptionStatus: { in: ['trial', 'active'] }
          },
          select: { id: true, email: true }
        });

        console.log(`\n📊 Entrenando ${activeUsers.length} usuarios activos...`);

        for (const user of activeUsers) {
          await this.trainUser(user.id);
          await this.sleep(5000); // Pausa entre usuarios
        }

        // Pausa entre ciclos (30 minutos)
        console.log('\n⏸️  Pausa de 30 minutos...');
        await this.sleep(30 * 60 * 1000);

      } catch (error) {
        console.error('❌ Error en ciclo de entrenamiento:', error);
        await this.sleep(60000);
      }
    }
  }

  /**
   * Entrena preguntas generales (aplican a cualquier negocio)
   */
  private async trainGeneralQuestions(userId: string, user: any) {
    const stats = this.userTrainingStats.get(userId)!;

    // Obtener configuración del negocio
    const businessInfo = {
      name: user.storeSettings?.storeName || user.businessName || 'Mi Negocio',
      phone: user.botSettings?.businessPhone || user.phone,
      address: user.businessAddress || user.storeSettings?.address,
      hours: user.businessHours || user.storeSettings?.businessHours,
      paymentMethods: await this.getPaymentMethods(userId),
      shippingInfo: user.botSettings?.shippingInfo || 'Envíos a toda Colombia',
      warrantyInfo: user.botSettings?.warrantyInfo || 'Garantía de calidad'
    };

    for (const [context, questions] of Object.entries(UNIVERSAL_TEMPLATES)) {
      for (const question of questions) {
        const response = await this.generateGeneralResponse(
          question,
          context,
          businessInfo,
          userId
        );

        if (response) {
          await this.saveTrainedResponse(userId, response);
          stats.successfulResponses++;
          process.stdout.write('✓');
        } else {
          stats.failedResponses++;
          process.stdout.write('✗');
        }
        stats.totalGenerated++;

        await this.sleep(300);
      }
      console.log(` ${context}`);
    }
  }

  /**
   * Entrena con productos/servicios del usuario
   */
  private async trainUserProducts(userId: string, user: any) {
    const stats = this.userTrainingStats.get(userId)!;

    // Obtener productos del usuario
    const products = await prisma.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE'
      },
      take: 20,
      orderBy: { updatedAt: 'desc' }
    });

    if (products.length === 0) {
      console.log('  ⚠️  Sin productos para entrenar');
      return;
    }

    console.log(`  📦 Entrenando con ${products.length} productos...`);

    for (const product of products) {
      for (const [context, templates] of Object.entries(PRODUCT_TEMPLATES)) {
        // Generar 2 variaciones por producto
        const selectedTemplates = this.shuffleArray(templates).slice(0, 2);

        for (const template of selectedTemplates) {
          const question = template.replace('{item}', product.name.toLowerCase());

          const response = await this.generateProductResponse(
            question,
            context,
            product,
            user,
            userId
          );

          if (response) {
            await this.saveTrainedResponse(userId, response);
            stats.successfulResponses++;
            process.stdout.write('✓');
          } else {
            stats.failedResponses++;
            process.stdout.write('✗');
          }
          stats.totalGenerated++;

          await this.sleep(500);
        }
      }
    }
    console.log(` productos`);
  }

  /**
   * Genera respuesta general usando Ollama
   */
  private async generateGeneralResponse(
    question: string,
    context: string,
    businessInfo: any,
    userId: string
  ) {
    try {
      const prompt = this.buildGeneralPrompt(question, context, businessInfo);

      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 200
          }
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) return null;

      const data = await response.json();
      const answer = data.response?.trim();

      if (!answer || answer.length < 10) return null;

      return {
        userQuery: question.toLowerCase().trim(),
        botResponse: answer,
        context,
        confidence: 0.85,
        userId
      };

    } catch (error) {
      return null;
    }
  }

  /**
   * Genera respuesta de producto usando Ollama
   */
  private async generateProductResponse(
    question: string,
    context: string,
    product: any,
    user: any,
    userId: string
  ) {
    try {
      const prompt = this.buildProductPrompt(question, context, product, user);

      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 200
          }
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) return null;

      const data = await response.json();
      const answer = data.response?.trim();

      if (!answer || answer.length < 10) return null;

      return {
        userQuery: question.toLowerCase().trim(),
        botResponse: answer,
        context,
        productId: product.id,
        productName: product.name,
        confidence: 0.85,
        userId
      };

    } catch (error) {
      return null;
    }
  }

  /**
   * Construye prompt para preguntas generales
   */
  private buildGeneralPrompt(question: string, context: string, businessInfo: any): string {
    let prompt = `Eres asistente de ventas de ${businessInfo.name} en Colombia.
Respondes de forma amigable y profesional en español colombiano.

Cliente pregunta: "${question}"

`;

    switch (context) {
      case 'saludo':
        prompt += `Responde el saludo y ofrece ayuda.
Máximo 2 líneas.`;
        break;

      case 'pago':
        prompt += `Métodos de pago: ${businessInfo.paymentMethods}

Explica las opciones de pago.
Máximo 3 líneas.`;
        break;

      case 'envio':
        prompt += `Información de envíos: ${businessInfo.shippingInfo}

Explica el proceso de envío.
Máximo 3 líneas.`;
        break;

      case 'garantia':
        prompt += `Garantía: ${businessInfo.warrantyInfo}

Explica la garantía de forma tranquilizadora.
Máximo 2 líneas.`;
        break;
    }

    prompt += '\n\nRespuesta:';
    return prompt;
  }

  /**
   * Construye prompt para productos
   */
  private buildProductPrompt(question: string, context: string, product: any, user: any): string {
    const businessName = user.storeSettings?.storeName || user.businessName || 'nuestra tienda';
    
    let prompt = `Eres vendedor de ${businessName} en Colombia.
Cliente pregunta: "${question}"

Producto: ${product.name}
Precio: $${product.price.toLocaleString('es-CO')} COP
${product.description ? `Descripción: ${product.description}` : ''}

`;

    switch (context) {
      case 'busqueda':
        prompt += `Presenta el producto de forma atractiva y menciona el precio.
Máximo 3 líneas.`;
        break;

      case 'precio':
        prompt += `Da el precio de forma clara y amigable.
Máximo 2 líneas.`;
        break;

      case 'caracteristicas':
        prompt += `Describe las características principales.
Máximo 3 líneas.`;
        break;

      case 'disponibilidad':
        prompt += `Confirma disponibilidad de forma positiva.
Máximo 2 líneas.`;
        break;
    }

    prompt += '\n\nRespuesta:';
    return prompt;
  }

  /**
   * Obtiene métodos de pago del usuario
   */
  private async getPaymentMethods(userId: string): Promise<string> {
    const config = await prisma.paymentConfig.findUnique({
      where: { userId }
    });

    const methods = [];
    if (config?.nequiEnabled) methods.push(`Nequi: ${config.nequiPhone}`);
    if (config?.daviplataEnabled) methods.push(`Daviplata: ${config.daviplataPhone}`);
    if (config?.mercadoPagoEnabled) methods.push('MercadoPago');
    if (config?.paypalEnabled) methods.push('PayPal');
    if (config?.bankTransferEnabled) methods.push('Transferencia bancaria');

    return methods.length > 0 ? methods.join(', ') : 'Múltiples métodos disponibles';
  }

  /**
   * Guarda respuesta entrenada (multi-tenant)
   */
  private async saveTrainedResponse(userId: string, data: any) {
    try {
      const existing = await prisma.conversationKnowledge.findFirst({
        where: {
          userQuery: data.userQuery,
          productId: data.productId || null,
          // TODO: Agregar userId cuando se actualice el schema
        }
      });

      if (existing) {
        await prisma.conversationKnowledge.update({
          where: { id: existing.id },
          data: {
            botResponse: data.botResponse,
            confidence: Math.min(existing.confidence + 0.05, 1.0),
            lastUsedAt: new Date()
          }
        });
      } else {
        await prisma.conversationKnowledge.create({
          data: {
            userQuery: data.userQuery,
            botResponse: data.botResponse,
            productId: data.productId,
            productName: data.productName,
            context: data.context,
            confidence: data.confidence,
            successRate: 1.0
          }
        });
      }
    } catch (error) {
      console.error('Error guardando respuesta:', error);
    }
  }

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

  stopTraining() {
    this.isTraining = false;
    console.log('\n🛑 Entrenamiento detenido');
  }

  getStats() {
    return {
      isTraining: this.isTraining,
      userStats: Array.from(this.userTrainingStats.entries()).map(([userId, stats]) => ({
        userId,
        ...stats
      }))
    };
  }
}

export const multiTenantTraining = new MultiTenantTrainingSystem();
