/**
 * Clase Base para Todos los Agentes
 * Cada agente hereda de esta clase y implementa su lógica específica
 */

import { SharedMemory } from './shared-memory';

export interface AgentResponse {
  text: string;
  nextAgent?: string;
  sendPhotos?: boolean;
  photos?: string[];
  actions?: AgentAction[];
  confidence?: number;
  requiresAI?: boolean;
  context?: any; // Contexto de la conversación
  metadata?: any;
}

export interface AgentAction {
  type: 'send_photo' | 'send_payment_link' | 'mark_as_sold' | 'send_email' | 'update_context' | 'send_specific_payment_method' | 'send_images';
  data?: any;
  method?: string;
  product?: any;
  formattedText?: string;
  images?: string[];
}

export abstract class BaseAgent {
  protected name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  /**
   * Método principal que cada agente debe implementar
   */
  abstract execute(message: string, memory: SharedMemory): Promise<AgentResponse>;
  
  /**
   * Determina si este agente puede manejar el mensaje sin IA externa
   */
  abstract canHandleLocally(message: string, memory: SharedMemory): boolean;
  
  /**
   * Maneja el mensaje localmente (sin IA externa)
   */
  abstract handleLocally(message: string, memory: SharedMemory): Promise<AgentResponse>;
  
  /**
   * Maneja el mensaje con IA externa
   */
  abstract handleWithAI(message: string, memory: SharedMemory): Promise<AgentResponse>;
  
  /**
   * Log helper
   */
  protected log(message: string, data?: any): void {
    console.log(`[${this.name}] ${message}`, data || '');
  }
  
  /**
   * Formatea precio en COP
   */
  protected formatPrice(price: number): string {
    return `${price.toLocaleString('es-CO')} COP`;
  }
  
  /**
   * Detecta palabras clave en el mensaje
   */
  protected hasKeywords(message: string, keywords: string[]): boolean {
    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
  }
  
  /**
   * Limpia el mensaje del usuario
   */
  protected cleanMessage(message: string): string {
    return message
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Quitar acentos
  }
}
