/**
 * 🤖 SISTEMA DE ENTRENAMIENTO AUTOMÁTICO
 * Entrena el bot con los productos de cada cliente SAS
 */

import { ProductClassifier } from './product-classifier';
import { TemplateGenerator } from './template-generator';
import { db } from './db';

export interface ClientTrainingData {
  userId: string;
  templates: Record<string, string>;
  classifications: Record<string, any>;
  portfolioAnalysis: any;
  trainingDate: Date;
  status: 'pending' | 'completed' | 'failed';
}

export class AutoTrainingSystem {
  private static trainingCache = new Map<string, ClientTrainingData>();

  /**
   * 🚀 ENTRENAR BOT PARA UN CLIENTE ESPECÍFICO
   */
  static async trainClientBot(userId: string): Promise<ClientTrainingData> {
    try {
      console.log(`🤖 [AutoTraining] Iniciando entrenamiento para cliente: ${userId}`);

      // Verificar si ya existe entrenamiento reciente (menos de 24 horas)
      const cached = this.trainingCache.get(userId);
      if (cached && this.isTrainingRecent(cached.trainingDate)) {
        console.log(`✅ [AutoTraining] Usando entrenamiento cacheado para ${userId}`);
        return cached;
      }

      // Generar plantillas personalizadas
      const { templates, productClassifications, summary } = await TemplateGenerator.generateClientTemplates(userId);

      // Crear datos de entrenamiento
      const trainingData: ClientTrainingData = {
        userId,
        templates,
        classifications: productClassifications,
        portfolioAnalysis: summary,
        trainingDate: new Date(),
        status: 'completed'
      };

      // Guardar en cache
      this.trainingCache.set(userId, trainingData);

      // Guardar en base de datos para persistencia
      await this.saveTrainingToDatabase(trainingData);

      console.log(`🎉 [AutoTraining] Entrenamiento completado para ${userId}`);
      console.log(`📊 Productos analizados: ${summary.summary.totalProducts}`);
      console.log(`🎨 Plantillas generadas: ${Object.keys(templates).length}`);

      return trainingData;
    } catch (error) {
      console.error(`❌ [AutoTraining] Error entrenando bot para ${userId}:`, error);

      const failedTraining: ClientTrainingData = {
        userId,
        templates: {},
        classifications: {},
        portfolioAnalysis: null,
        trainingDate: new Date(),
        status: 'failed'
      };

      return failedTraining;
    }
  }

  /**
   * 📝 OBTENER PLANTILLA ENTRENADA PARA UN PRODUCTO
   */
  static async getTrainedTemplate(userId: string, productId: string): Promise<string | null> {
    try {
      // Buscar en cache primero
      const cached = this.trainingCache.get(userId);
      if (cached && cached.templates[productId]) {
        return cached.templates[productId];
      }

      // Buscar en base de datos
      const dbTraining = await this.loadTrainingFromDatabase(userId);
      if (dbTraining && dbTraining.templates[productId]) {
        return dbTraining.templates[productId];
      }

      // Si no existe, generar plantilla individual
      console.log(`🔄 [AutoTraining] Generando plantilla individual para producto ${productId}`);
      return await TemplateGenerator.getProductTemplate(productId, userId);
    } catch (error) {
      console.error(`❌ [AutoTraining] Error obteniendo plantilla:`, error);
      return null;
    }
  }

  /**
   * 📊 ANALIZAR RENDIMIENTO DEL ENTRENAMIENTO
   */
  static async getTrainingAnalytics(userId: string): Promise<{
    trainingStatus: string;
    productsAnalyzed: number;
    templatesGenerated: number;
    portfolioInsights: string[];
    recommendations: string[];
  }> {
    try {
      const training = this.trainingCache.get(userId) ||
                      await this.loadTrainingFromDatabase(userId);

      if (!training) {
        return {
          trainingStatus: 'not_trained',
          productsAnalyzed: 0,
          templatesGenerated: 0,
          portfolioInsights: [],
          recommendations: ['Entrenar el bot con sus productos']
        };
      }

      const summary = training.portfolioAnalysis.summary;
      const recommendations = training.portfolioAnalysis.recommendations;

      return {
        trainingStatus: training.status,
        productsAnalyzed: summary.totalProducts,
        templatesGenerated: Object.keys(training.templates).length,
        portfolioInsights: this.generatePortfolioInsights(summary),
        recommendations
      };
    } catch (error) {
      console.error(`❌ [AutoTraining] Error obteniendo analytics:`, error);
      return {
        trainingStatus: 'error',
        productsAnalyzed: 0,
        templatesGenerated: 0,
        portfolioInsights: [],
        recommendations: ['Revisar configuración del bot']
      };
    }
  }

  /**
   * 🔄 REENTRENAR BOT (cuando cambian productos)
   */
  static async retrainClientBot(userId: string): Promise<ClientTrainingData> {
    // Limpiar cache
    this.trainingCache.delete(userId);

    // Limpiar base de datos
    await this.clearTrainingFromDatabase(userId);

    // Reentrenar
    return await this.trainClientBot(userId);
  }

  /**
   * 🎯 DETECTAR CAMBIOS EN PRODUCTOS PARA REENTRENAMIENTO
   */
  static async detectProductChanges(userId: string): Promise<boolean> {
    try {
      // Obtener último entrenamiento
      const lastTraining = await this.loadTrainingFromDatabase(userId);
      if (!lastTraining) return true; // No hay entrenamiento previo

      // Contar productos actuales
      const currentProducts = await db.product.count({
        where: { userId, status: 'AVAILABLE' }
      });

      // Comparar con productos en el entrenamiento
      const trainedProducts = Object.keys(lastTraining.classifications).length;

      return currentProducts !== trainedProducts;
    } catch (error) {
      console.error(`❌ [AutoTraining] Error detectando cambios:`, error);
      return true; // Asumir que hay cambios si hay error
    }
  }

  /**
   * 🔧 VERIFICAR Y ENTRENAR AUTOMÁTICAMENTE
   */
  static async ensureClientIsTrained(userId: string): Promise<ClientTrainingData> {
    // Verificar si necesita entrenamiento
    const needsTraining = await this.detectProductChanges(userId);

    if (needsTraining) {
      console.log(`🔄 [AutoTraining] Detectados cambios en productos de ${userId}, reentrenando...`);
      return await this.retrainClientBot(userId);
    }

    // Verificar si existe entrenamiento en cache
    const cached = this.trainingCache.get(userId);
    if (cached) {
      return cached;
    }

    // Cargar desde base de datos
    const dbTraining = await this.loadTrainingFromDatabase(userId);
    if (dbTraining) {
      this.trainingCache.set(userId, dbTraining);
      return dbTraining;
    }

    // Entrenar por primera vez
    console.log(`🆕 [AutoTraining] Primer entrenamiento para ${userId}`);
    return await this.trainClientBot(userId);
  }

  // ========== MÉTODOS PRIVADOS ==========

  private static isTrainingRecent(trainingDate: Date): boolean {
    const hoursSinceTraining = (Date.now() - trainingDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceTraining < 24; // 24 horas
  }

  private static async saveTrainingToDatabase(training: ClientTrainingData): Promise<void> {
    try {
      // Guardar en una tabla de configuraciones del bot (usando BotSettings existente)
      await db.botSettings.upsert({
        where: { userId: training.userId },
        update: {
          botPersonality: JSON.stringify({
            trainedTemplates: training.templates,
            productClassifications: training.classifications,
            portfolioAnalysis: training.portfolioAnalysis,
            lastTraining: training.trainingDate.toISOString()
          })
        },
        create: {
          userId: training.userId,
          businessName: 'Auto-generated',
          businessPhone: '0000000000',
          botPersonality: JSON.stringify({
            trainedTemplates: training.templates,
            productClassifications: training.classifications,
            portfolioAnalysis: training.portfolioAnalysis,
            lastTraining: training.trainingDate.toISOString()
          })
        }
      });
    } catch (error) {
      console.error(`❌ [AutoTraining] Error guardando en BD:`, error);
    }
  }

  private static async loadTrainingFromDatabase(userId: string): Promise<ClientTrainingData | null> {
    try {
      const botSettings = await db.botSettings.findUnique({
        where: { userId }
      });

      if (!botSettings?.botPersonality) return null;

      const personalityData = JSON.parse(botSettings.botPersonality);

      if (!personalityData.trainedTemplates) return null;

      return {
        userId,
        templates: personalityData.trainedTemplates,
        classifications: personalityData.productClassifications || {},
        portfolioAnalysis: personalityData.portfolioAnalysis,
        trainingDate: new Date(personalityData.lastTraining || Date.now()),
        status: 'completed'
      };
    } catch (error) {
      console.error(`❌ [AutoTraining] Error cargando desde BD:`, error);
      return null;
    }
  }

  private static async clearTrainingFromDatabase(userId: string): Promise<void> {
    try {
      await db.botSettings.update({
        where: { userId },
        data: {
          botPersonality: null
        }
      });
    } catch (error) {
      console.error(`❌ [AutoTraining] Error limpiando BD:`, error);
    }
  }

  private static generatePortfolioInsights(summary: any): string[] {
    const insights: string[] = [];

    if (summary.digitalPercentage > 70) {
      insights.push('Portafolio predominantemente digital - ideal para ventas online');
    }

    if (summary.physicalPercentage > 70) {
      insights.push('Enfoque en productos físicos - optimizar entregas y logística');
    }

    if (summary.servicePercentage > 30) {
      insights.push('Incluye servicios - implementar sistema de citas');
    }

    if (summary.avgPrice > 500000) {
      insights.push('Productos premium - alto valor percibido');
    }

    if (summary.avgPrice < 50000) {
      insights.push('Productos accesibles - alto volumen de ventas potencial');
    }

    return insights;
  }

  /**
   * 📈 ESTADÍSTICAS GLOBALES DEL SISTEMA
   */
  static async getGlobalStats(): Promise<{
    totalClientsTrained: number;
    totalTemplatesGenerated: number;
    avgProductsPerClient: number;
    trainingSuccessRate: number;
  }> {
    try {
      const allSettings = await db.botSettings.findMany({
        where: {
          botPersonality: { not: null }
        }
      });

      let totalTemplates = 0;
      let totalProducts = 0;
      let successfulTrainings = 0;

      for (const setting of allSettings) {
        try {
          if (setting.botPersonality) {
            const personality = JSON.parse(setting.botPersonality);
            if (personality.trainedTemplates) {
              successfulTrainings++;
              totalTemplates += Object.keys(personality.trainedTemplates).length;
              if (personality.portfolioAnalysis?.summary?.totalProducts) {
                totalProducts += personality.portfolioAnalysis.summary.totalProducts;
              }
            }
          }
        } catch (e) {
          // Ignorar configuraciones mal formateadas
        }
      }

      return {
        totalClientsTrained: successfulTrainings,
        totalTemplatesGenerated: totalTemplates,
        avgProductsPerClient: successfulTrainings > 0 ? Math.round(totalProducts / successfulTrainings) : 0,
        trainingSuccessRate: allSettings.length > 0 ? Math.round((successfulTrainings / allSettings.length) * 100) : 0
      };
    } catch (error) {
      console.error(`❌ [AutoTraining] Error obteniendo estadísticas globales:`, error);
      return {
        totalClientsTrained: 0,
        totalTemplatesGenerated: 0,
        avgProductsPerClient: 0,
        trainingSuccessRate: 0
      };
    }
  }
}