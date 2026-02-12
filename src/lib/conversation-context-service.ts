/**
 * Conversation Context Service
 * Mantiene contexto de conversaciones por 24 horas
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ConversationContext {
  phoneNumber: string;
  userId: string;
  messages: ContextMessage[];
  currentProduct?: string;
  currentStage?: string;
  metadata?: Record<string, any>;
  lastActivity: Date;
}

export interface ContextMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class ConversationContextService {
  private static contexts: Map<string, ConversationContext> = new Map();
  private static readonly CONTEXT_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  private static readonly MAX_MESSAGES = 20; // Máximo de mensajes en contexto

  /**
   * Inicializa el servicio y limpieza automática
   */
  static initialize() {
    // Limpiar contextos expirados cada hora
    setInterval(() => {
      this.cleanExpiredContexts();
    }, 60 * 60 * 1000);

    console.log('[ConversationContext] Servicio inicializado');
  }

  /**
   * Obtiene o crea el contexto de una conversación
   */
  static async getContext(phoneNumber: string, userId: string): Promise<ConversationContext> {
    const key = this.getContextKey(phoneNumber, userId);
    
    // Verificar si existe en memoria
    let context = this.contexts.get(key);
    
    if (context) {
      // Verificar si no ha expirado
      const elapsed = Date.now() - context.lastActivity.getTime();
      if (elapsed < this.CONTEXT_DURATION) {
        return context;
      }
      // Si expiró, eliminarlo
      this.contexts.delete(key);
    }

    // Cargar desde base de datos
    context = await this.loadFromDatabase(phoneNumber, userId);
    
    if (context) {
      this.contexts.set(key, context);
      return context;
    }

    // Crear nuevo contexto
    context = {
      phoneNumber,
      userId,
      messages: [],
      lastActivity: new Date(),
      metadata: {}
    };

    this.contexts.set(key, context);
    return context;
  }

  /**
   * Agrega un mensaje al contexto
   */
  static async addMessage(
    phoneNumber: string,
    userId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<void> {
    const context = await this.getContext(phoneNumber, userId);
    
    context.messages.push({
      role,
      content,
      timestamp: new Date()
    });

    // Mantener solo los últimos N mensajes
    if (context.messages.length > this.MAX_MESSAGES) {
      context.messages = context.messages.slice(-this.MAX_MESSAGES);
    }

    context.lastActivity = new Date();

    // Guardar en base de datos de forma asíncrona
    this.saveToDatabase(context).catch(err => 
      console.error('[ConversationContext] Error guardando:', err)
    );
  }

  /**
   * Actualiza el producto actual en el contexto
   */
  static async setCurrentProduct(
    phoneNumber: string,
    userId: string,
    productId: string
  ): Promise<void> {
    const context = await this.getContext(phoneNumber, userId);
    context.currentProduct = productId;
    context.lastActivity = new Date();
  }

  /**
   * Actualiza la etapa actual de la conversación
   */
  static async setCurrentStage(
    phoneNumber: string,
    userId: string,
    stage: string
  ): Promise<void> {
    const context = await this.getContext(phoneNumber, userId);
    context.currentStage = stage;
    context.lastActivity = new Date();
  }

  /**
   * Actualiza metadata del contexto
   */
  static async updateMetadata(
    phoneNumber: string,
    userId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    const context = await this.getContext(phoneNumber, userId);
    context.metadata = { ...context.metadata, ...metadata };
    context.lastActivity = new Date();
  }

  /**
   * Obtiene el historial de mensajes formateado para IA
   */
  static async getMessageHistory(
    phoneNumber: string,
    userId: string,
    limit?: number
  ): Promise<ContextMessage[]> {
    const context = await this.getContext(phoneNumber, userId);
    const messages = context.messages;
    
    if (limit && messages.length > limit) {
      return messages.slice(-limit);
    }
    
    return messages;
  }

  /**
   * Limpia el contexto de una conversación
   */
  static async clearContext(phoneNumber: string, userId: string): Promise<void> {
    const key = this.getContextKey(phoneNumber, userId);
    this.contexts.delete(key);

    // Eliminar de base de datos (opcional - solo si existe la tabla)
    try {
      // Verificar si existe el modelo ConversationContext
      if (prisma.conversationContext) {
        await prisma.conversationContext.deleteMany({
          where: {
            phoneNumber,
            userId
          }
        });
      }
    } catch (error) {
      // Ignorar error si la tabla no existe
      console.log('[ConversationContext] Limpieza de DB omitida (tabla no existe)');
    }
  }

  /**
   * Obtiene estadísticas del contexto
   */
  static async getContextStats(phoneNumber: string, userId: string): Promise<{
    messageCount: number;
    duration: number;
    currentProduct?: string;
    currentStage?: string;
  }> {
    const context = await this.getContext(phoneNumber, userId);
    const duration = Date.now() - context.lastActivity.getTime();

    return {
      messageCount: context.messages.length,
      duration,
      currentProduct: context.currentProduct,
      currentStage: context.currentStage
    };
  }

  /**
   * Carga contexto desde base de datos
   */
  private static async loadFromDatabase(
    phoneNumber: string,
    userId: string
  ): Promise<ConversationContext | null> {
    try {
      // Buscar conversación activa reciente
      const conversation = await prisma.conversation.findFirst({
        where: {
          customerPhone: phoneNumber,
          userId,
          status: 'ACTIVE',
          lastMessageAt: {
            gte: new Date(Date.now() - this.CONTEXT_DURATION)
          }
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: this.MAX_MESSAGES
          }
        }
      });

      if (!conversation) return null;

      const messages: ContextMessage[] = conversation.messages
        .reverse()
        .map(msg => ({
          role: msg.direction === 'INCOMING' ? 'user' as const : 'assistant' as const,
          content: msg.content,
          timestamp: msg.createdAt
        }));

      return {
        phoneNumber,
        userId,
        messages,
        currentProduct: (conversation as any).productId || undefined,
        currentStage: conversation.currentStage || undefined,
        lastActivity: conversation.lastMessageAt,
        metadata: {}
      };
    } catch (error) {
      console.error('[ConversationContext] Error cargando desde DB:', error);
      return null;
    }
  }

  /**
   * Guarda contexto en base de datos
   */
  private static async saveToDatabase(context: ConversationContext): Promise<void> {
    try {
      // Buscar o crear conversación
      let conversation = await prisma.conversation.findFirst({
        where: {
          customerPhone: context.phoneNumber,
          userId: context.userId,
          status: 'ACTIVE'
        }
      });

      if (!conversation) {
        // Solo crear si el usuario existe
        const userExists = await prisma.user.findUnique({
          where: { id: context.userId }
        });

        if (!userExists) {
          console.log('[ConversationContext] Usuario no existe, omitiendo guardado en DB');
          return;
        }

        conversation = await prisma.conversation.create({
          data: {
            customerPhone: context.phoneNumber,
            userId: context.userId,
            status: 'ACTIVE',
            lastMessageAt: context.lastActivity,
            currentStage: context.currentStage || 'saludo',
            productId: context.currentProduct
          } as any
        });
      } else {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageAt: context.lastActivity,
            currentStage: context.currentStage,
            productId: context.currentProduct
          } as any
        });
      }
    } catch (error) {
      // Ignorar errores de foreign key
      console.log('[ConversationContext] Guardado en DB omitido (error de FK)');
    }
  }

  /**
   * Limpia contextos expirados
   */
  private static cleanExpiredContexts(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, context] of this.contexts.entries()) {
      const elapsed = now - context.lastActivity.getTime();
      if (elapsed > this.CONTEXT_DURATION) {
        this.contexts.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[ConversationContext] ${cleaned} contextos expirados limpiados`);
    }
  }

  /**
   * Genera clave única para el contexto
   */
  private static getContextKey(phoneNumber: string, userId: string): string {
    return `${userId}:${phoneNumber}`;
  }

  /**
   * Obtiene todos los contextos activos (para debugging)
   */
  static getActiveContexts(): number {
    return this.contexts.size;
  }

  /**
   * Exporta contexto para análisis
   */
  static async exportContext(phoneNumber: string, userId: string): Promise<ConversationContext | null> {
    const key = this.getContextKey(phoneNumber, userId);
    return this.contexts.get(key) || null;
  }
}

// Inicializar el servicio al importar
ConversationContextService.initialize();
