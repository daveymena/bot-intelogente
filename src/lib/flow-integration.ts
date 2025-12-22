/**
 * Integración del FlowEngine con Baileys Service
 * Conecta el motor de flujo conversacional con WhatsApp
 */

import { createFlowEngine, BaileysHelpers } from './plantillas-respuestas-bot';
import type { WASocket } from '@whiskeysockets/baileys';

export class FlowIntegration {
  private static engine = createFlowEngine();

  /**
   * Procesa un mensaje entrante y envía las respuestas apropiadas
   */
  static async processMessage(params: {
    sock: WASocket;
    chatId: string;
    userName?: string;
    text: string;
    raw?: any;
  }) {
    const { sock, chatId, userName, text, raw } = params;

    try {
      // Obtener respuestas del motor de flujo
      const responses = await this.engine.handleIncoming({
        chatId,
        userName,
        text,
        raw
      });

      // Enviar cada respuesta usando Baileys
      for (const response of responses) {
        await this.sendResponse(sock, chatId, response);
        
        // Pequeña pausa entre mensajes para evitar spam
        await this.delay(500);
      }

      return { success: true, responsesCount: responses.length };
    } catch (error) {
      console.error('Error procesando mensaje en FlowIntegration:', error);
      
      // Enviar mensaje de error genérico
      await sock.sendMessage(chatId, {
        text: 'Disculpa, tuve un problema procesando tu mensaje. Por favor intenta de nuevo.'
      });

      return { success: false, error };
    }
  }

  /**
   * Envía una respuesta según su tipo
   */
  private static async sendResponse(sock: WASocket, chatId: string, response: any) {
    try {
      switch (response.type) {
        case 'text':
          await sock.sendMessage(chatId, {
            text: response.text
          });
          break;

        case 'buttons':
          // Baileys v7: enviar texto con botones como texto simple
          // (Los botones nativos fueron deprecados en versiones recientes)
          let buttonText = response.text + '\n\n';
          response.buttons.forEach((btn: any, idx: number) => {
            buttonText += `${idx + 1}. ${btn.text}\n`;
          });
          await sock.sendMessage(chatId, {
            text: buttonText
          });
          break;

        case 'list':
          // Enviar lista como texto formateado
          let listText = response.title + '\n\n';
          response.sections.forEach((section: any) => {
            listText += `*${section.title}*\n`;
            section.rows.forEach((row: any, idx: number) => {
              listText += `${idx + 1}. ${row.title}`;
              if (row.description) listText += ` - ${row.description}`;
              listText += '\n';
            });
            listText += '\n';
          });
          await sock.sendMessage(chatId, {
            text: listText
          });
          break;

        case 'image':
          if (response.url) {
            await sock.sendMessage(chatId, {
              image: { url: response.url },
              caption: response.caption || ''
            });
          }
          break;

        default:
          console.warn('Tipo de respuesta desconocido:', response.type);
      }
    } catch (error) {
      console.error('Error enviando respuesta:', error);
      
      // Fallback a mensaje de texto simple
      if (response.text) {
        await sock.sendMessage(chatId, {
          text: response.text
        });
      }
    }
  }

  /**
   * Utilidad para pausas entre mensajes
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtiene la sesión actual de un chat (para debugging)
   */
  static getSession(chatId: string) {
    return this.engine.getSession(chatId);
  }

  /**
   * Limpia la sesión de un chat
   */
  static clearSession(chatId: string) {
    const session = this.engine.getSession(chatId);
    session.state = 'welcome';
    session.context = {};
    session.history = [];
  }

  /**
   * Obtiene el historial de conversación
   */
  static getHistory(chatId: string) {
    const session = this.engine.getSession(chatId);
    return session.history;
  }
}
