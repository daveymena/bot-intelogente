/**
 * Simulador de Escritura Humana
 * Simula comportamiento humano al escribir para evitar detección de bots
 */

export class HumanTypingSimulator {
  /**
   * Calcula el tiempo de espera antes de responder (retraso humano)
   * Basado en la longitud del mensaje y variabilidad natural
   */
  static calculateResponseDelay(messageLength: number): number {
    // Tiempo base de lectura: 2-4 segundos
    const baseReadingTime = 2000 + Math.random() * 2000;
    
    // Tiempo de "pensamiento": 1-3 segundos
    const thinkingTime = 1000 + Math.random() * 2000;
    
    // Tiempo adicional por longitud del mensaje (simula lectura)
    // ~50ms por carácter (lectura rápida)
    const readingTime = messageLength * (30 + Math.random() * 40);
    
    // Total: 3-9 segundos + tiempo de lectura
    const totalDelay = baseReadingTime + thinkingTime + readingTime;
    
    // Limitar entre 3 y 15 segundos
    return Math.min(Math.max(totalDelay, 3000), 15000);
  }
  
  /**
   * Calcula el tiempo de "escritura" basado en la longitud de la respuesta
   * Simula velocidad de escritura humana variable
   */
  static calculateTypingTime(responseLength: number): number {
    // Velocidad de escritura humana: 40-80 palabras por minuto
    // Aproximadamente 200-400 caracteres por minuto
    // O 3.3-6.6 caracteres por segundo
    
    // Usar velocidad media-rápida: ~5 caracteres por segundo
    const charsPerSecond = 4 + Math.random() * 2; // 4-6 chars/seg
    const baseTypingTime = (responseLength / charsPerSecond) * 1000;
    
    // Agregar pausas naturales (comas, puntos, pensar)
    const pauseCount = (responseLength / 50); // Pausa cada ~50 caracteres
    const pauseTime = pauseCount * (300 + Math.random() * 700); // 300-1000ms por pausa
    
    const totalTypingTime = baseTypingTime + pauseTime;
    
    // Limitar entre 2 y 30 segundos
    return Math.min(Math.max(totalTypingTime, 2000), 30000);
  }
  
  /**
   * Envía el indicador de "escribiendo..." por un tiempo realista
   */
  static async simulateTyping(
    sock: any,
    chatId: string,
    responseLength: number
  ): Promise<void> {
    try {
      const typingTime = this.calculateTypingTime(responseLength);
      
      // Enviar estado "escribiendo"
      await sock.sendPresenceUpdate('composing', chatId);
      
      // Simular escritura con pausas naturales
      const pauseInterval = 3000 + Math.random() * 2000; // Pausas cada 3-5 seg
      const pauseCount = Math.floor(typingTime / pauseInterval);
      
      for (let i = 0; i < pauseCount; i++) {
        await this.sleep(pauseInterval);
        
        // Ocasionalmente "dejar de escribir" brevemente (más natural)
        if (Math.random() < 0.3) { // 30% de probabilidad
          await sock.sendPresenceUpdate('paused', chatId);
          await this.sleep(500 + Math.random() * 1000); // Pausa 0.5-1.5 seg
          await sock.sendPresenceUpdate('composing', chatId);
        }
      }
      
      // Tiempo restante
      const remainingTime = typingTime - (pauseCount * pauseInterval);
      if (remainingTime > 0) {
        await this.sleep(remainingTime);
      }
      
      // Volver a estado "disponible"
      await sock.sendPresenceUpdate('available', chatId);
      
    } catch (error) {
      console.error('[HumanTyping] Error simulando escritura:', error);
      // Continuar sin simular si hay error
    }
  }
  
  /**
   * Proceso completo: esperar + simular escritura + enviar
   */
  static async humanizedSend(
    sock: any,
    chatId: string,
    message: string,
    userMessageLength: number
  ): Promise<void> {
    try {
      // 1. Retraso inicial (lectura + pensamiento)
      const responseDelay = this.calculateResponseDelay(userMessageLength);
      console.log(`[HumanTyping] ⏳ Esperando ${(responseDelay / 1000).toFixed(1)}s antes de responder...`);
      await this.sleep(responseDelay);
      
      // 2. Simular escritura
      console.log(`[HumanTyping] ⌨️ Simulando escritura de ${message.length} caracteres...`);
      await this.simulateTyping(sock, chatId, message.length);
      
      // 3. Enviar mensaje
      console.log(`[HumanTyping] ✅ Enviando mensaje`);
      await sock.sendMessage(chatId, { text: message });
      
    } catch (error) {
      console.error('[HumanTyping] Error en envío humanizado:', error);
      // Fallback: enviar directamente
      await sock.sendMessage(chatId, { text: message });
    }
  }
  
  /**
   * Versión simplificada para mensajes cortos (saludos, confirmaciones)
   */
  static async quickHumanizedSend(
    sock: any,
    chatId: string,
    message: string
  ): Promise<void> {
    try {
      // Retraso corto: 1-3 segundos
      const quickDelay = 1000 + Math.random() * 2000;
      await this.sleep(quickDelay);
      
      // Escritura rápida
      await sock.sendPresenceUpdate('composing', chatId);
      const quickTyping = 1000 + Math.random() * 1000; // 1-2 segundos
      await this.sleep(quickTyping);
      await sock.sendPresenceUpdate('available', chatId);
      
      // Enviar
      await sock.sendMessage(chatId, { text: message });
      
    } catch (error) {
      console.error('[HumanTyping] Error en envío rápido:', error);
      await sock.sendMessage(chatId, { text: message });
    }
  }
  
  /**
   * Helper: Sleep con Promise
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Calcula si debe usar envío rápido o normal
   */
  static shouldUseQuickSend(message: string): boolean {
    // Mensajes cortos (< 50 caracteres) usan envío rápido
    return message.length < 50;
  }
  
  /**
   * Variación aleatoria de tiempo (±20%)
   * Para hacer los tiempos menos predecibles
   */
  static addRandomVariation(baseTime: number): number {
    const variation = baseTime * 0.2; // ±20%
    return baseTime + (Math.random() * variation * 2 - variation);
  }
}
